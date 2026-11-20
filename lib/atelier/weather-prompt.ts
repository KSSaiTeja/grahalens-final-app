/**
 * Weather-linked journal prompts (R3) — derived from Sky Weather axes.
 */

import type { SkyWeather, WeatherAxisId } from "@/lib/sky/sky-weather";

import type { WeatherSnapshot } from "@/lib/atelier/api";

const PROMPTS: Record<WeatherAxisId, string> = {
  clarity:
    "Clarity is leading. What became easier to name today — and what still needs a quieter look?",
  pressure:
    "Pressure is high in the sky. Where did you feel the squeeze, and what held without forcing?",
  friction:
    "Friction is present. What rubbed — and what did you learn by staying with it a moment longer?",
  opening:
    "An opening is available. What door appeared, even briefly — and did you step toward it?",
};

export function weatherLinkedPrompt(weather: SkyWeather): string {
  return PROMPTS[weather.dominant];
}

export function toWeatherSnapshot(
  weather: SkyWeather,
  prompt?: string,
): WeatherSnapshot {
  const axes: Record<string, number> = {};
  for (const id of Object.keys(weather.axes) as WeatherAxisId[]) {
    axes[id] = weather.axes[id].value;
  }
  return {
    date: weather.date,
    dominant: weather.dominant,
    axes,
    prompt: prompt ?? weatherLinkedPrompt(weather),
  };
}
