/**
 * Sky Weather — four axes from transit→natal (PLAN §2 derived lane).
 * Pure function of natal + clock; never persist in Zustand.
 *
 * Axes (0–1): clarity · pressure · friction · opening
 * Brand: Opening > 0.6 enables weather-drift; S2 explains rule catalog.
 */

import type { AspectBodyId, AspectId } from "@/lib/ephemeris/aspects";
import type { GrahaId } from "@/lib/ephemeris/constants";
import type { NatalChart } from "@/lib/ephemeris/natal";
import {
  computeTransits,
  getTransitPlacement,
  type TransitReport,
  type TransitToNatalHit,
} from "@/lib/ephemeris/transits";

import { civilDateParts, clamp01 } from "./civil";

export const WEATHER_AXES = [
  "clarity",
  "pressure",
  "friction",
  "opening",
] as const;

export type WeatherAxisId = (typeof WEATHER_AXES)[number];

export type WeatherReason = {
  /** Key into WEATHER_RULE_CATALOG. */
  ruleId: string;
  /** Signed contribution before clamp (documentation / S2). */
  weight: number;
  summary: string;
  transit?: GrahaId;
  natal?: AspectBodyId;
  house?: number;
  aspect?: AspectId;
};

export type WeatherAxis = {
  id: WeatherAxisId;
  /** 0–1 inclusive. */
  value: number;
  reasons: WeatherReason[];
};

export type SkyWeather = {
  /** Instant used (ISO UTC). */
  at: string;
  /** Civil `YYYY-MM-DD` in natal.tz. */
  date: string;
  axes: Record<WeatherAxisId, WeatherAxis>;
  /** Highest axis value (ties → WEATHER_AXES order). */
  dominant: WeatherAxisId;
};

/**
 * Human copy for S2 “why this weather” — locked vocabulary (BRAND §05).
 */
export const WEATHER_RULE_CATALOG: Record<
  string,
  { axis: WeatherAxisId; title: string; body: string }
> = {
  "clarity.mercury-direct": {
    axis: "clarity",
    title: "Mercury direct",
    body: "Transit Mercury moving forward steadies signal and wording.",
  },
  "clarity.mercury-soft": {
    axis: "clarity",
    title: "Mercury soft hit",
    body: "Transit Mercury trine/sextile a natal light or lagna clears the channel.",
  },
  "clarity.jupiter-soft-mercury": {
    axis: "clarity",
    title: "Jupiter soft to Mercury",
    body: "Transit Jupiter easing natal Mercury widens perspective without noise.",
  },
  "clarity.mercury-hard": {
    axis: "clarity",
    title: "Mercury under hard aspect",
    body: "Squares/oppositions to Mercury tighten the lens — prefer one clear sentence.",
  },
  "clarity.mercury-rx": {
    axis: "clarity",
    title: "Mercury retrograde",
    body: "Retrograde Mercury revisits drafts; clarity costs an extra pass.",
  },
  "pressure.saturn-hard-light": {
    axis: "pressure",
    title: "Saturn presses a light",
    body: "Transit Saturn hard to Sun, Moon, or lagna adds weight to the day.",
  },
  "pressure.mars-hard-light": {
    axis: "pressure",
    title: "Mars presses a light",
    body: "Transit Mars hard to a natal light heats the tempo.",
  },
  "pressure.saturn-angular": {
    axis: "pressure",
    title: "Saturn on an angle",
    body: "Transit Saturn in 1 / 4 / 7 / 10 sits on the structure of the day.",
  },
  "friction.mars-hard-personal": {
    axis: "friction",
    title: "Mars scrapes a personal planet",
    body: "Hard Mars to Moon, Mercury, or Venus frays soft edges in talk.",
  },
  "friction.mars-press-3-7": {
    axis: "friction",
    title: "Mars presses 3rd / 7th",
    body: "Mars through the speech or other house makes conversations run hot.",
  },
  "friction.node-hard-personal": {
    axis: "friction",
    title: "Node hard to personal",
    body: "Rahu/Ketu hard to a personal planet skews the usual script.",
  },
  "opening.jupiter-soft-light": {
    axis: "opening",
    title: "Jupiter soft to a light",
    body: "Transit Jupiter trine/sextile Sun, Moon, or lagna widens the room.",
  },
  "opening.venus-support": {
    axis: "opening",
    title: "Venus support",
    body: "Venus soft to a light, or through 5 / 9 / 11, softens arrival.",
  },
  "opening.jupiter-trine-houses": {
    axis: "opening",
    title: "Jupiter in growth houses",
    body: "Jupiter in 1 / 5 / 9 / 11 favors invitations and follow-through.",
  },
};

const SOFT: ReadonlySet<AspectId> = new Set(["trine", "sextile"]);
const HARD: ReadonlySet<AspectId> = new Set(["square", "opposition"]);
const LIGHTS: ReadonlySet<AspectBodyId> = new Set(["sun", "moon", "lagna"]);
const PERSONAL: ReadonlySet<AspectBodyId> = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
]);
const ANGULAR = new Set([1, 4, 7, 10]);
const GROWTH = new Set([1, 5, 9, 11]);
const VENUS_OPEN = new Set([5, 9, 11]);

type AxisAccum = { value: number; reasons: WeatherReason[] };

function add(
  acc: AxisAccum,
  ruleId: string,
  weight: number,
  summary: string,
  extra: Partial<WeatherReason> = {},
): void {
  acc.value += weight;
  acc.reasons.push({ ruleId, weight, summary, ...extra });
}

function hitsOf(
  report: TransitReport,
  transit: GrahaId,
  pred: (h: TransitToNatalHit) => boolean,
): TransitToNatalHit[] {
  return report.toNatal.filter((h) => h.transit === transit && pred(h));
}

function scoreClarity(report: TransitReport): AxisAccum {
  const acc: AxisAccum = { value: 0.42, reasons: [] };
  const mercury = getTransitPlacement(report, "mercury");

  if (!mercury.retrograde) {
    add(acc, "clarity.mercury-direct", 0.12, "Mercury is direct");
  } else {
    add(acc, "clarity.mercury-rx", -0.14, "Mercury is retrograde", {
      transit: "mercury",
    });
  }

  for (const h of hitsOf(report, "mercury", (x) => SOFT.has(x.id) && LIGHTS.has(x.natal))) {
    add(
      acc,
      "clarity.mercury-soft",
      0.11,
      `Mercury ${h.id} natal ${h.natal}`,
      { transit: "mercury", natal: h.natal, aspect: h.id },
    );
  }

  for (const h of hitsOf(
    report,
    "jupiter",
    (x) => SOFT.has(x.id) && x.natal === "mercury",
  )) {
    add(
      acc,
      "clarity.jupiter-soft-mercury",
      0.1,
      `Jupiter ${h.id} natal Mercury`,
      { transit: "jupiter", natal: "mercury", aspect: h.id },
    );
  }

  for (const h of hitsOf(
    report,
    "mercury",
    (x) => HARD.has(x.id) && (LIGHTS.has(x.natal) || x.natal === "mercury"),
  )) {
    add(
      acc,
      "clarity.mercury-hard",
      -0.1,
      `Mercury ${h.id} natal ${h.natal}`,
      { transit: "mercury", natal: h.natal, aspect: h.id },
    );
  }

  // Also natal Mercury under hard transit from Mars/Saturn
  for (const h of report.toNatal) {
    if (
      (h.transit === "mars" || h.transit === "saturn") &&
      HARD.has(h.id) &&
      h.natal === "mercury"
    ) {
      add(
        acc,
        "clarity.mercury-hard",
        -0.08,
        `${capitalize(h.transit)} ${h.id} natal Mercury`,
        { transit: h.transit, natal: "mercury", aspect: h.id },
      );
    }
  }

  return acc;
}

function scorePressure(report: TransitReport): AxisAccum {
  const acc: AxisAccum = { value: 0.22, reasons: [] };
  const saturn = getTransitPlacement(report, "saturn");

  for (const h of hitsOf(report, "saturn", (x) => HARD.has(x.id) && LIGHTS.has(x.natal))) {
    add(
      acc,
      "pressure.saturn-hard-light",
      0.16,
      `Saturn ${h.id} natal ${h.natal}`,
      { transit: "saturn", natal: h.natal, aspect: h.id },
    );
  }

  for (const h of hitsOf(report, "mars", (x) => HARD.has(x.id) && LIGHTS.has(x.natal))) {
    add(
      acc,
      "pressure.mars-hard-light",
      0.11,
      `Mars ${h.id} natal ${h.natal}`,
      { transit: "mars", natal: h.natal, aspect: h.id },
    );
  }

  if (ANGULAR.has(saturn.house)) {
    add(
      acc,
      "pressure.saturn-angular",
      0.14,
      `Saturn in house ${saturn.house}`,
      { transit: "saturn", house: saturn.house },
    );
  }

  return acc;
}

function scoreFriction(report: TransitReport): AxisAccum {
  const acc: AxisAccum = { value: 0.18, reasons: [] };
  const mars = getTransitPlacement(report, "mars");

  for (const h of hitsOf(
    report,
    "mars",
    (x) => HARD.has(x.id) && (x.natal === "moon" || x.natal === "mercury" || x.natal === "venus"),
  )) {
    add(
      acc,
      "friction.mars-hard-personal",
      0.14,
      `Mars ${h.id} natal ${h.natal}`,
      { transit: "mars", natal: h.natal, aspect: h.id },
    );
  }

  if (mars.house === 3 || mars.house === 7) {
    add(
      acc,
      "friction.mars-press-3-7",
      0.18,
      `Mars presses house ${mars.house}`,
      { transit: "mars", house: mars.house },
    );
  }

  for (const node of ["rahu", "ketu"] as const) {
    for (const h of hitsOf(
      report,
      node,
      (x) => HARD.has(x.id) && PERSONAL.has(x.natal),
    )) {
      add(
        acc,
        "friction.node-hard-personal",
        0.09,
        `${capitalize(node)} ${h.id} natal ${h.natal}`,
        { transit: node, natal: h.natal, aspect: h.id },
      );
    }
  }

  return acc;
}

function scoreOpening(report: TransitReport): AxisAccum {
  const acc: AxisAccum = { value: 0.32, reasons: [] };
  const jupiter = getTransitPlacement(report, "jupiter");
  const venus = getTransitPlacement(report, "venus");

  for (const h of hitsOf(report, "jupiter", (x) => SOFT.has(x.id) && LIGHTS.has(x.natal))) {
    add(
      acc,
      "opening.jupiter-soft-light",
      0.15,
      `Jupiter ${h.id} natal ${h.natal}`,
      { transit: "jupiter", natal: h.natal, aspect: h.id },
    );
  }

  let venusSupport = false;
  for (const h of hitsOf(report, "venus", (x) => SOFT.has(x.id) && LIGHTS.has(x.natal))) {
    venusSupport = true;
    add(
      acc,
      "opening.venus-support",
      0.12,
      `Venus ${h.id} natal ${h.natal}`,
      { transit: "venus", natal: h.natal, aspect: h.id },
    );
  }
  if (!venusSupport && VENUS_OPEN.has(venus.house)) {
    add(
      acc,
      "opening.venus-support",
      0.12,
      `Venus in house ${venus.house}`,
      { transit: "venus", house: venus.house },
    );
  }

  if (GROWTH.has(jupiter.house)) {
    add(
      acc,
      "opening.jupiter-trine-houses",
      0.13,
      `Jupiter in house ${jupiter.house}`,
      { transit: "jupiter", house: jupiter.house },
    );
  }

  return acc;
}

function finalize(id: WeatherAxisId, acc: AxisAccum): WeatherAxis {
  return {
    id,
    value: clamp01(acc.value),
    reasons: acc.reasons,
  };
}

function dominantOf(
  axes: Record<WeatherAxisId, WeatherAxis>,
): WeatherAxisId {
  let best: WeatherAxisId = WEATHER_AXES[0]!;
  for (const id of WEATHER_AXES) {
    if (axes[id].value > axes[best].value) best = id;
  }
  return best;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/**
 * Sky Weather at `at` (defaults to `new Date()` — freeze the clock in tests).
 */
export function computeSkyWeather(
  natal: NatalChart,
  at: Date = new Date(),
): SkyWeather {
  if (Number.isNaN(at.getTime())) {
    throw new Error(`Invalid sky weather instant: ${String(at)}`);
  }

  const report = computeTransits(natal, at);
  const { date } = civilDateParts(at, natal.tz);

  const axes: Record<WeatherAxisId, WeatherAxis> = {
    clarity: finalize("clarity", scoreClarity(report)),
    pressure: finalize("pressure", scorePressure(report)),
    friction: finalize("friction", scoreFriction(report)),
    opening: finalize("opening", scoreOpening(report)),
  };

  return {
    at: at.toISOString(),
    date,
    axes,
    dominant: dominantOf(axes),
  };
}

/** Opening threshold for BRAND §06 weather-drift. */
export const OPENING_DRIFT_THRESHOLD = 0.6;

export function shouldWeatherDrift(weather: SkyWeather): boolean {
  return weather.axes.opening.value > OPENING_DRIFT_THRESHOLD;
}
