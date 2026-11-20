/**
 * Emotional check-in (R7) — maps mood → memory body for Lens context.
 */

import type { JournalMood } from "@/lib/atelier/api";
import { JOURNAL_MOOD_LABELS, JOURNAL_MOODS } from "@/lib/atelier/api";

export const CHECK_IN_MOODS = JOURNAL_MOODS;
export const CHECK_IN_LABELS = JOURNAL_MOOD_LABELS;

export const CHECK_IN_SOURCE = "check-in";

const MOOD_BLURBS: Record<JournalMood, string> = {
  clear: "noticed clarity — signal felt steady",
  pressed: "noticed pressure — the day asked for slower pacing",
  friction: "noticed friction — something rubbed without resolving yet",
  open: "noticed an opening — a window felt available",
  steady: "noticed steadiness — no spike, just presence",
};

export function formatCheckInMemory(input: {
  mood: JournalMood;
  note?: string;
  weatherDominant?: string | null;
}): string {
  const label = CHECK_IN_LABELS[input.mood];
  const blurb = MOOD_BLURBS[input.mood];
  const weather =
    input.weatherDominant != null
      ? ` Sky weather: ${input.weatherDominant}.`
      : "";
  const note = input.note?.trim();
  if (note) {
    return `Check-in (${label}): ${blurb}.${weather} Note: ${note}`;
  }
  return `Check-in (${label}): ${blurb}.${weather}`;
}
