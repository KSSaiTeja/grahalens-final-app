/**
 * Narrate today's sky — Groq when available, else template fallback.
 * Every returned line is grounded against natal + transit placements
 * (PLAN §1 step 6; BRAND §11). Ungrounded LLM copy is withheld.
 */

import { chatCompletion, type GroqChatClient } from "@/lib/ai/groq";
import {
  collectPlacementFacts,
  groundText,
  type GroundingResult,
  type PlacementFact,
} from "@/lib/ai/grounding";
import { skyNoteFallback } from "@/lib/ai/fallbacks";
import {
  computeDasha,
  currentDasha,
  type CurrentDasha,
} from "@/lib/ephemeris/dasha";
import type { NatalChart } from "@/lib/ephemeris/types";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import { computeTransits } from "@/lib/ephemeris/transits";
import {
  WEATHER_AXES,
  type SkyWeather,
} from "@/lib/sky/sky-weather";

export type SkyNarrationSource = "groq" | "fallback";

export type SkyNarration = {
  text: string;
  source: SkyNarrationSource;
  /** Always true for returned text — ungrounded copy is never shipped. */
  grounded: true;
  grounding: GroundingResult;
};

export type NarrateSkyOptions = {
  natal: NatalChart;
  weather: SkyWeather;
  /** Instant for transit facts + dasha (defaults to weather.at). */
  at?: Date;
  /** Injected Groq stub for tests. */
  client?: GroqChatClient;
  /** Skip live Groq even if key present (force L2). */
  forceFallback?: boolean;
};

const SYSTEM_PROMPT = [
  "You are Lens, Grahalens' observatory voice (BRAND-BOOK §05).",
  "Write one short Sky note: 2 sentences max. Calm, precise, adult — never snark, guru, fear, or emoji.",
  "Vocabulary: clarity, pressure, friction, opening, ribbon, window, lens.",
  "STRICT: You may only cite graha placements listed under ALLOWED PLACEMENTS.",
  "Do not invent signs, houses, or nakshatras. If unsure, omit the placement cite.",
  "Return plain text only — no JSON, no markdown fences.",
].join("\n");

function factsBlock(facts: readonly PlacementFact[]): string {
  const lines = facts.map((f) => {
    const sign = RASI_LABELS[f.sign];
    return `- ${f.role} ${f.body}: ${sign}, house ${f.house}, ${f.nakshatra}`;
  });
  return lines.join("\n");
}

function weatherBlock(weather: SkyWeather): string {
  return WEATHER_AXES.map((id) => {
    const axis = weather.axes[id];
    const top = axis.reasons[0]?.summary ?? "—";
    return `- ${id}: ${axis.value.toFixed(2)} (e.g. ${top})`;
  }).join("\n");
}

function resolveDasha(natal: NatalChart, at: Date): CurrentDasha {
  return currentDasha(computeDasha(natal), at);
}

/**
 * Produce a grounded Sky note. No key / LLM fail / grounding fail → fallback.
 */
export async function narrateSky(
  options: NarrateSkyOptions,
): Promise<SkyNarration> {
  const at = options.at ?? new Date(options.weather.at);
  const transit = computeTransits(options.natal, at);
  const facts = collectPlacementFacts(options.natal, transit);
  const dasha = resolveDasha(options.natal, at);

  const fallbackText = skyNoteFallback({
    weather: options.weather,
    natal: options.natal,
    dasha,
  });
  const fallbackGround = groundText(fallbackText, facts);
  if (!fallbackGround.ok) {
    // Templates must always ground — strip to weather-only if somehow broken.
    const safe = skyNoteFallback({
      weather: options.weather,
      natal: options.natal,
      dasha: null,
    });
    return {
      text: safe,
      source: "fallback",
      grounded: true,
      grounding: groundText(safe, facts),
    };
  }

  if (options.forceFallback) {
    return {
      text: fallbackText,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
    };
  }

  const userPrompt = [
    `Civil date: ${options.weather.date}`,
    `Dominant axis: ${options.weather.dominant}`,
    "",
    "WEATHER AXES:",
    weatherBlock(options.weather),
    "",
    "ALLOWED PLACEMENTS (natal + transit):",
    factsBlock(facts),
    "",
    `Current dasha ribbon: ${dasha.maha.lord} / ${dasha.antar.lord}`,
    "",
    "Write the Sky note now.",
  ].join("\n");

  const llm = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    client: options.client,
    temperature: 0.35,
    maxTokens: 160,
  });

  if (!llm) {
    return {
      text: fallbackText,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
    };
  }

  const grounding = groundText(llm, facts);
  if (!grounding.ok) {
    return {
      text: fallbackText,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
    };
  }

  return {
    text: llm,
    source: "groq",
    grounded: true,
    grounding,
  };
}
