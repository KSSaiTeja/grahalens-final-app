/**
 * Weekly Pattern Thread (R6) — deterministic from journal moods + weather.
 * Full content is Private (GATE); free callers get null / locked UI.
 */

import type { JournalMood, JournalRecord } from "@/lib/atelier/api";
import { JOURNAL_MOOD_LABELS } from "@/lib/atelier/api";
import type { SkyWeather, WeatherAxisId } from "@/lib/sky/sky-weather";

export type PatternThread = {
  weekLabel: string;
  dominantMood: JournalMood | null;
  moodCounts: Record<JournalMood, number>;
  weatherDominant: WeatherAxisId | null;
  paragraphs: string[];
  entryCount: number;
};

function startOfWeekIso(at: Date): string {
  const d = new Date(at);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function endOfWeekIso(start: string): string {
  const d = new Date(`${start}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

function emptyCounts(): Record<JournalMood, number> {
  return {
    clear: 0,
    pressed: 0,
    friction: 0,
    open: 0,
    steady: 0,
  };
}

/**
 * Build Pattern Thread for Private. `isPrivate` false → null (UI shows GATE).
 */
export function buildPatternThread(input: {
  entries: JournalRecord[];
  weather: SkyWeather | null;
  at?: Date;
  isPrivate: boolean;
}): PatternThread | null {
  if (!input.isPrivate) return null;

  const at = input.at ?? new Date();
  const weekStart = startOfWeekIso(at);
  const weekEnd = endOfWeekIso(weekStart);
  const weekEntries = input.entries.filter((e) => {
    const day = e.createdAt.slice(0, 10);
    return day >= weekStart && day <= weekEnd;
  });

  const counts = emptyCounts();
  for (const e of weekEntries) {
    if (e.mood) counts[e.mood] += 1;
  }

  let dominantMood: JournalMood | null = null;
  let max = 0;
  for (const mood of Object.keys(counts) as JournalMood[]) {
    if (counts[mood] > max) {
      max = counts[mood];
      dominantMood = mood;
    }
  }

  const weatherDominant = input.weather?.dominant ?? null;
  const paragraphs: string[] = [];

  if (weekEntries.length === 0) {
    paragraphs.push(
      "This week’s thread is quiet — no journal grain yet. A few check-ins or notes will braid the pattern.",
    );
  } else if (dominantMood) {
    paragraphs.push(
      `Across ${weekEntries.length} note${weekEntries.length === 1 ? "" : "s"}, ${JOURNAL_MOOD_LABELS[dominantMood].toLowerCase()} showed up most. That is the grain of this week — not a verdict, a rhythm.`,
    );
  } else {
    paragraphs.push(
      `${weekEntries.length} note${weekEntries.length === 1 ? "" : "s"} this week without a mood tag. The body of the page still carries the weather.`,
    );
  }

  if (weatherDominant) {
    paragraphs.push(
      `Today’s sky leans ${weatherDominant}. Hold the journal beside that axis — clarity, pressure, friction, or opening — and notice what repeats without forcing a story.`,
    );
  }

  paragraphs.push(
    "Pattern Thread stays private to this device’s notes. It never invents placements — only what you wrote and what the ephemeris already computed.",
  );

  return {
    weekLabel: `${weekStart} → ${weekEnd}`,
    dominantMood,
    moodCounts: counts,
    weatherDominant,
    paragraphs,
    entryCount: weekEntries.length,
  };
}
