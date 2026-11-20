/**
 * Muhurta Moments — activity windows inside the civil day (PLAN §2 derived).
 * Pure function of natal + clock; never persist in Zustand.
 *
 * Windows are classical planetary horas (sunrise→sunset→next sunrise),
 * clipped to the civil calendar day in natal.tz. Acceptance: every moment
 * lies inside that civil day (PRD §12 #5).
 */

import {
  Body,
  Observer,
  SearchRiseSet,
} from "astronomy-engine";

import type { GrahaId } from "@/lib/ephemeris/constants";
import type { NatalChart } from "@/lib/ephemeris/natal";
import {
  computeTransits,
  getTransitPlacement,
  type TransitReport,
} from "@/lib/ephemeris/transits";

import {
  civilDayBounds,
  civilWeekday,
  clamp01,
} from "./civil";

export const MUHURTA_KINDS = [
  "connect",
  "focus",
  "create",
  "care",
  "move",
  "rest",
] as const;

export type MuhurtaKind = (typeof MUHURTA_KINDS)[number];

/** Classical hora lord sequence (Sunday first day-hora = Sun). */
export const HORA_LORDS: readonly GrahaId[] = [
  "sun",
  "venus",
  "mercury",
  "moon",
  "saturn",
  "jupiter",
  "mars",
] as const;

/**
 * Weekday (0=Sun … 6=Sat) → index into HORA_LORDS for the first day-hora.
 * Classical day lords: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn.
 */
const WEEKDAY_HORA_START: readonly number[] = [0, 3, 6, 2, 5, 1, 4];

/**
 * Kind triggers: transit house of the hora lord (noon sky for slow grahas).
 * Brand sample: CONNECT when Venus presses 3rd (also Moon-in-3 messaging).
 */
const KIND_HOUSES: Record<MuhurtaKind, ReadonlySet<number>> = {
  connect: new Set([3, 7, 10, 11]),
  focus: new Set([1, 6, 10]),
  create: new Set([5, 9]),
  care: new Set([4, 7]),
  move: new Set([3, 6, 7, 10]),
  rest: new Set([4, 8, 12]),
};

/** Which hora lords can open each kind. */
const KIND_LORDS: Record<MuhurtaKind, ReadonlySet<GrahaId>> = {
  connect: new Set(["venus", "mercury", "moon"]),
  focus: new Set(["mercury", "saturn", "sun"]),
  create: new Set(["venus", "jupiter", "saturn"]),
  care: new Set(["moon", "venus"]),
  move: new Set(["mars"]),
  rest: new Set(["moon", "saturn"]),
};

export type MuhurtaPress = {
  graha: GrahaId;
  house: number;
  summary: string;
};

export type MuhurtaMoment = {
  /** Stable id: `{date}:{kind}:{startHHmm}` local. */
  id: string;
  kind: MuhurtaKind;
  /** Inclusive start (ISO UTC). */
  startAt: string;
  /** Exclusive end (ISO UTC). */
  endAt: string;
  /** 0–1 strength. */
  score: number;
  /** Hora lord that opened the window. */
  lord: GrahaId;
  presses: MuhurtaPress[];
};

export type MuhurtaDay = {
  /** Instant used to pick the civil day (ISO UTC). */
  at: string;
  /** Civil `YYYY-MM-DD` in natal.tz. */
  date: string;
  /** Civil day bounds (ISO UTC). */
  dayStart: string;
  dayEnd: string;
  /** Local sunrise used for hora grid (ISO UTC). */
  sunrise: string;
  /** Local sunset used for hora grid (ISO UTC). */
  sunset: string;
  moments: MuhurtaMoment[];
};

type HoraSlot = {
  lord: GrahaId;
  start: Date;
  end: Date;
};

function ordinalHouse(n: number): string {
  const s = String(n);
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${s}th`;
}

function localHHmm(at: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}${mm}`;
}

function requireRiseSet(
  body: Body,
  observer: Observer,
  direction: number,
  start: Date,
  limitDays: number,
  label: string,
): Date {
  const result = SearchRiseSet(body, observer, direction, start, limitDays);
  if (!result) {
    throw new Error(`Cannot resolve ${label}`);
  }
  return result.date;
}

/**
 * 24 planetary horas from sunrise: 12 day + 12 night to next sunrise.
 */
export function buildHoraSlots(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  weekday: number,
): HoraSlot[] {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const nightMs = nextSunrise.getTime() - sunset.getTime();
  if (!(dayMs > 0) || !(nightMs > 0)) {
    throw new Error("Invalid sunrise/sunset ordering for hora grid");
  }
  const dayLen = dayMs / 12;
  const nightLen = nightMs / 12;
  const startIdx = WEEKDAY_HORA_START[weekday] ?? 0;
  const slots: HoraSlot[] = [];

  for (let i = 0; i < 12; i++) {
    const start = new Date(sunrise.getTime() + i * dayLen);
    const end = new Date(sunrise.getTime() + (i + 1) * dayLen);
    const lord = HORA_LORDS[(startIdx + i) % 7]!;
    slots.push({ lord, start, end });
  }
  for (let i = 0; i < 12; i++) {
    const start = new Date(sunset.getTime() + i * nightLen);
    const end = new Date(sunset.getTime() + (i + 1) * nightLen);
    const lord = HORA_LORDS[(startIdx + 12 + i) % 7]!;
    slots.push({ lord, start, end });
  }
  return slots;
}

function kindForLordHouse(lord: GrahaId, house: number): MuhurtaKind | null {
  for (const kind of MUHURTA_KINDS) {
    if (KIND_LORDS[kind].has(lord) && KIND_HOUSES[kind].has(house)) {
      return kind;
    }
  }
  return null;
}

function scoreSlot(
  lord: GrahaId,
  house: number,
  report: TransitReport,
): number {
  let score = 0.52;
  if (house === 1 || house === 10) score += 0.1;
  // Soft transit→natal from this lord to luminaries/lagna
  for (const h of report.toNatal) {
    if (h.transit !== lord) continue;
    if (h.id === "trine" || h.id === "sextile") {
      if (h.natal === "sun" || h.natal === "moon" || h.natal === "lagna") {
        score += 0.12;
      }
    }
  }
  return clamp01(score);
}

function clipToCivil(
  start: Date,
  end: Date,
  dayStart: Date,
  dayEnd: Date,
): { start: Date; end: Date } | null {
  const s = Math.max(start.getTime(), dayStart.getTime());
  const e = Math.min(end.getTime(), dayEnd.getTime());
  if (e - s < 15 * 60 * 1000) return null; // drop scraps < 15m
  return { start: new Date(s), end: new Date(e) };
}

/**
 * Muhurta moments for the civil day containing `at`
 * (defaults to `new Date()` — freeze the clock in tests).
 */
export function computeMuhurtaMoments(
  natal: NatalChart,
  at: Date = new Date(),
): MuhurtaDay {
  if (Number.isNaN(at.getTime())) {
    throw new Error(`Invalid muhurta instant: ${String(at)}`);
  }

  const { start: dayStart, end: dayEnd, date } = civilDayBounds(at, natal.tz);
  const observer = new Observer(natal.lat, natal.lng, 0);

  // Search from slightly before civil midnight so polar-edge cases still resolve.
  const searchFrom = new Date(dayStart.getTime() - 6 * 3600 * 1000);
  const sunrise = requireRiseSet(
    Body.Sun,
    observer,
    +1,
    searchFrom,
    2,
    "sunrise",
  );
  const sunset = requireRiseSet(
    Body.Sun,
    observer,
    -1,
    sunrise,
    1,
    "sunset",
  );
  const nextSunrise = requireRiseSet(
    Body.Sun,
    observer,
    +1,
    new Date(sunset.getTime() + 60_000),
    1,
    "next sunrise",
  );

  const weekday = civilWeekday(sunrise, natal.tz);
  const slots = buildHoraSlots(sunrise, sunset, nextSunrise, weekday);

  // Noon sky for stable house presses (Moon horas still use noon house of Moon).
  const noon = new Date((dayStart.getTime() + dayEnd.getTime()) / 2);
  const report = computeTransits(natal, noon);

  type Candidate = MuhurtaMoment & { _score: number };
  const bestByKind = new Map<MuhurtaKind, Candidate>();

  for (const slot of slots) {
    const clipped = clipToCivil(slot.start, slot.end, dayStart, dayEnd);
    if (!clipped) continue;

    const placement = getTransitPlacement(report, slot.lord);
    const kind = kindForLordHouse(slot.lord, placement.house);
    if (!kind) continue;

    const score = scoreSlot(slot.lord, placement.house, report);
    if (score < 0.5) continue;

    const press: MuhurtaPress = {
      graha: slot.lord,
      house: placement.house,
      summary: `${capitalize(slot.lord)} presses your ${ordinalHouse(placement.house)}`,
    };

    const moment: Candidate = {
      id: `${date}:${kind}:${localHHmm(clipped.start, natal.tz)}`,
      kind,
      startAt: clipped.start.toISOString(),
      endAt: clipped.end.toISOString(),
      score,
      lord: slot.lord,
      presses: [press],
      _score: score,
    };

    const prev = bestByKind.get(kind);
    if (!prev || moment._score > prev._score) {
      bestByKind.set(kind, moment);
    } else if (
      prev &&
      moment._score === prev._score &&
      moment.startAt < prev.startAt
    ) {
      bestByKind.set(kind, moment);
    }
  }

  // Cap at 4 windows for Sky strip density — keep strongest, then chronological.
  const capped = [...bestByKind.values()]
    .sort(
      (a, b) =>
        b._score - a._score ||
        a.startAt.localeCompare(b.startAt) ||
        a.kind.localeCompare(b.kind),
    )
    .slice(0, 4)
    .map(({ _score: _, ...m }) => m)
    .sort(
      (a, b) => a.startAt.localeCompare(b.startAt) || a.kind.localeCompare(b.kind),
    );

  return {
    at: at.toISOString(),
    date,
    dayStart: dayStart.toISOString(),
    dayEnd: dayEnd.toISOString(),
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    moments: capped,
  };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/** Lookup by id from a computed day. */
export function getMuhurtaMoment(
  day: MuhurtaDay,
  id: string,
): MuhurtaMoment {
  const found = day.moments.find((m) => m.id === id);
  if (!found) {
    throw new Error(`Muhurta moment missing: ${id}`);
  }
  return found;
}
