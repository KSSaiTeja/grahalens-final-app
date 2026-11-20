/**
 * Dasha ribbon geometry — caret fraction must match `currentDasha` (PRD ZT3).
 */

import {
  currentDasha,
  type CurrentDasha,
  type DashaPeriod,
  type DashaTimeline,
} from "@/lib/ephemeris/dasha";

export type DashaCaret = {
  /** 0–1 along the mahadasha ribbon (timeline start → end). */
  fraction: number;
  maha: DashaPeriod;
  antar: DashaPeriod;
  at: string;
};

/** Mahadasha periods only, chronological. */
export function mahaPeriods(timeline: DashaTimeline): DashaPeriod[] {
  return timeline.periods.filter((p) => p.level === "maha");
}

/** Antardashas belonging to a mahadasha lord (current cycle window). */
export function antarPeriodsForMaha(
  timeline: DashaTimeline,
  maha: DashaPeriod,
): DashaPeriod[] {
  const mahaStart = Date.parse(maha.start);
  const mahaEnd = Date.parse(maha.end);
  return timeline.periods.filter((p) => {
    if (p.level !== "antar" || p.parentLord !== maha.lord) return false;
    const s = Date.parse(p.start);
    const e = Date.parse(p.end);
    return s >= mahaStart - 1 && e <= mahaEnd + 1;
  });
}

/**
 * Linear caret along the mahadasha ribbon.
 * Clamped to [0, 1]; throws via currentDasha if `at` is outside the timeline.
 */
export function dashaCaret(timeline: DashaTimeline, at: Date): DashaCaret {
  const cur = currentDasha(timeline, at);
  const mahas = mahaPeriods(timeline);
  const start = Date.parse(mahas[0]!.start);
  const end = Date.parse(mahas[mahas.length - 1]!.end);
  const span = Math.max(1, end - start);
  const t = at.getTime();
  const raw = (t - start) / span;
  const fraction = Math.min(1, Math.max(0, raw));
  return {
    fraction,
    maha: cur.maha,
    antar: cur.antar,
    at: cur.at,
  };
}

/** True when caret’s maha/antar keys equal `currentDasha` at the same clock. */
export function caretMatchesCompute(
  timeline: DashaTimeline,
  at: Date,
): boolean {
  const cur: CurrentDasha = currentDasha(timeline, at);
  const caret = dashaCaret(timeline, at);
  return caret.maha.key === cur.maha.key && caret.antar.key === cur.antar.key;
}
