/**
 * Generated daily notes for Sky inbox (S5) — deterministic L2 templates
 * grounded on weather + dasha (PLAN derived + BRAND §11).
 */

import { skyNoteFallback } from "@/lib/ai/fallbacks";
import {
  computeDasha,
  currentDasha,
} from "@/lib/ephemeris/dasha";
import type { NatalChart } from "@/lib/ephemeris/types";
import {
  computeMuhurtaMoments,
  type MuhurtaMoment,
} from "@/lib/sky/muhurta-moments";
import { computeSkyWeather, type SkyWeather } from "@/lib/sky/sky-weather";

import { formatCivilLabel, noonOnCivilDate } from "./archive";

export type DailyNoteKind = "sky" | "muhurta";

export type DailyNote = {
  id: string;
  kind: DailyNoteKind;
  date: string;
  /** Display title. */
  title: string;
  /** Body prose. */
  body: string;
  /** Optional muhurta id for deep link. */
  muhurtaId?: string;
  /** Sort key — ISO instant. */
  at: string;
};

export type DaySkyPayload = {
  at: Date;
  weather: SkyWeather;
  noteText: string;
  moments: MuhurtaMoment[];
};

/** Compute weather + grounded sky note + muhurta for a civil day. */
export function computeDaySky(
  natal: NatalChart,
  civilDate: string,
): DaySkyPayload {
  const at = noonOnCivilDate(civilDate, natal.tz);
  const weather = computeSkyWeather(natal, at);
  const dasha = currentDasha(computeDasha(natal), at);
  const noteText = skyNoteFallback({ weather, natal, dasha });
  const day = computeMuhurtaMoments(natal, at);
  return { at, weather, noteText, moments: day.moments };
}

/**
 * Inbox entries for a civil day: one sky note + top muhurta windows.
 */
export function notesForDay(
  natal: NatalChart,
  civilDate: string,
  muhurtaLimit = 3,
): DailyNote[] {
  const { weather, noteText, moments, at } = computeDaySky(natal, civilDate);
  const label = formatCivilLabel(civilDate, natal.tz);
  const notes: DailyNote[] = [
    {
      id: `sky:${civilDate}`,
      kind: "sky",
      date: civilDate,
      title: `Sky · ${label}`,
      body: noteText,
      at: weather.at,
    },
  ];

  const ranked = [...moments]
    .sort((a, b) => b.score - a.score)
    .slice(0, muhurtaLimit);

  for (const m of ranked) {
    notes.push({
      id: `muhurta:${m.id}`,
      kind: "muhurta",
      date: civilDate,
      title: `Muhurta · ${capitalize(m.kind)}`,
      body: muhurtaBlurb(m, natal.tz),
      muhurtaId: m.id,
      at: m.startAt,
    });
  }

  void at;
  return notes;
}

/**
 * Multi-day inbox: today first, then prior days (sky notes only for older days
 * to keep the list honest — no spam).
 */
export function buildInboxNotes(
  natal: NatalChart,
  dates: readonly string[],
): DailyNote[] {
  if (dates.length === 0) return [];
  const [today, ...rest] = dates;
  const out = notesForDay(natal, today!);
  for (const d of rest) {
    const day = computeDaySky(natal, d);
    out.push({
      id: `sky:${d}`,
      kind: "sky",
      date: d,
      title: `Sky · ${formatCivilLabel(d, natal.tz)}`,
      body: day.noteText,
      at: day.weather.at,
    });
  }
  return out;
}

function muhurtaBlurb(m: MuhurtaMoment, tz: string): string {
  const press = m.presses[0]?.summary;
  const window = `${localHm(m.startAt, tz)}–${localHm(m.endAt, tz)}`;
  if (press) {
    return `${window} · ${press}`;
  }
  return `${window} · ${capitalize(m.lord)} hora · strength ${(m.score * 100).toFixed(0)}%`;
}

function localHm(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}
