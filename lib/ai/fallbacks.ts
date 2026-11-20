/**
 * Deterministic narration templates (BRAND §11 L2 / §13).
 * Used when GROQ_API_KEY is missing, Groq fails, or grounding rejects LLM copy.
 */

import {
  RASI_LABELS,
  type GrahaId,
} from "@/lib/ephemeris/constants";
import type { CurrentDasha } from "@/lib/ephemeris/dasha";
import { getPlacement, type NatalChart } from "@/lib/ephemeris/types";
import {
  WEATHER_AXES,
  type SkyWeather,
  type WeatherAxisId,
} from "@/lib/sky/sky-weather";
import { errorCopy } from "@/lib/errors/catalog";

export type SkyFallbackInput = {
  weather: SkyWeather;
  natal: NatalChart;
  /** Optional current dasha for quieter ribbon cite. */
  dasha?: CurrentDasha | null;
};

const AXIS_LINE: Record<WeatherAxisId, (v: number) => string> = {
  clarity: (v) =>
    v >= 0.55
      ? "Clarity runs high"
      : v <= 0.35
        ? "Clarity thins"
        : "Clarity holds steady",
  pressure: (v) =>
    v >= 0.55
      ? "pressure gathers weight"
      : v <= 0.3
        ? "pressure stays light"
        : "pressure sits in the middle",
  friction: (v) =>
    v >= 0.55
      ? "friction gathers around conversations"
      : v <= 0.3
        ? "friction stays quiet"
        : "friction flickers at the edges",
  opening: (v) =>
    v >= 0.6
      ? "opening widens the day"
      : v <= 0.35
        ? "opening stays narrow"
        : "opening is measured",
};

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function ordinalHouse(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export type QuietLensFallbackInput = {
  /** Current maha/antar — cited as Ribbon when present (verify: real dasha). */
  dasha?: CurrentDasha | null;
};

/**
 * Canonical quieter-mode line (BRAND §13).
 * No placement claims; optional Ribbon cites computed dasha lords only.
 */
export function quietLensFallback(
  input?: QuietLensFallbackInput | null,
): string {
  const base = errorCopy("llm_down").body;
  const dasha = input?.dasha;
  if (!dasha) return base;
  return `${base} Ribbon: ${capitalize(dasha.maha.lord)} / ${capitalize(dasha.antar.lord)}.`;
}

/**
 * Sky Lens note from weather (+ optional dasha). Placement cites are
 * taken only from computed natal facts so grounding always passes.
 */
export function skyNoteFallback(input: SkyFallbackInput): string {
  const { weather, natal, dasha } = input;
  const dominant = weather.dominant;
  const lead = AXIS_LINE[dominant](weather.axes[dominant].value);

  const secondary = WEATHER_AXES.filter(
    (id) => id !== dominant && weather.axes[id].value >= 0.5,
  ).sort(
    (a, b) => weather.axes[b].value - weather.axes[a].value,
  )[0];

  const moon = getPlacement(natal, "moon");
  // Explicit grounded cites — must match grounding.ts claim patterns.
  const moonLine = `Moon in ${RASI_LABELS[moon.sign]}. Moon presses your ${ordinalHouse(moon.house)}`;

  let prose =
    secondary && secondary !== dominant
      ? `${lead}; ${AXIS_LINE[secondary](weather.axes[secondary].value)}. ${moonLine}.`
      : `${lead}. ${moonLine}.`;

  if (dasha) {
    prose += ` Ribbon: ${capitalize(dasha.maha.lord)} / ${capitalize(dasha.antar.lord)}.`;
  }

  prose += ` ${counselFor(dominant)}`;
  return prose.replace(/\s+/g, " ").trim();
}

function counselFor(axis: WeatherAxisId): string {
  switch (axis) {
    case "clarity":
      return "Prefer one precise sentence over three careful ones.";
    case "pressure":
      return "Carry less today; finish what already started.";
    case "friction":
      return "Prefer one honest talk over three careful ones.";
    case "opening":
      return "Leave a little room for an unexpected yes.";
  }
}

/** Format a graha id for display prose. */
export function formatGrahaLabel(id: GrahaId): string {
  return capitalize(id);
}

export type SoulFallbackInput = {
  /** Ordered signatures (already ⊆ chart). */
  signatures: ReadonlyArray<{ label: string; summary: string; weight: number }>;
  /** Free-tier: one short blurb from the top signature. */
  previewOnly?: boolean;
};

/**
 * Soul Cartography L2 — template from signatures only (no LLM).
 * Preview = top signature; full = top three joined.
 */
export function soulPortraitFallback(input: SoulFallbackInput): string {
  const ranked = [...input.signatures].sort((a, b) => b.weight - a.weight);
  if (ranked.length === 0) {
    return "Your chart is quiet on the page — open Sky when the ephemeris is ready.";
  }
  if (input.previewOnly) {
    const top = ranked[0]!;
    return `${top.summary} Open the full portrait with Private.`;
  }
  const lines = ranked.slice(0, 3).map((s) => s.summary);
  return lines.join(" ");
}
