/**
 * Civil-day helpers for Sky Weather + Muhurta (natal IANA tz).
 */

import { fromZonedTime } from "date-fns-tz";

export type CivilDateParts = {
  year: number;
  month: number;
  day: number;
  /** `YYYY-MM-DD` in `tz`. */
  date: string;
};

/** Local calendar date parts for `at` in `tz`. */
export function civilDateParts(at: Date, tz: string): CivilDateParts {
  if (Number.isNaN(at.getTime())) {
    throw new Error(`Invalid instant: ${String(at)}`);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) {
    throw new Error(`Cannot resolve civil date for ${at.toISOString()} in ${tz}`);
  }
  return {
    year: Number(y),
    month: Number(m),
    day: Number(d),
    date: `${y}-${m}-${d}`,
  };
}

/**
 * Half-open civil day `[start, end)` in UTC instants for the local calendar
 * day containing `at`.
 */
export function civilDayBounds(
  at: Date,
  tz: string,
): { start: Date; end: Date; date: string } {
  const { year, month, day, date } = civilDateParts(at, tz);
  const start = fromZonedTime(
    `${pad2(year)}-${pad2(month)}-${pad2(day)}T00:00:00`,
    tz,
  );
  // Next local midnight via +1 calendar day (handles DST).
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const end = fromZonedTime(
    `${pad2(next.getUTCFullYear())}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}T00:00:00`,
    tz,
  );
  return { start, end, date };
}

/** Local weekday 0=Sunday … 6=Saturday for `at` in `tz`. */
export function civilWeekday(at: Date, tz: string): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(at);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const n = map[wd];
  if (n === undefined) {
    throw new Error(`Unknown weekday token: ${wd}`);
  }
  return n;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Clamp to [0, 1] and round to 4 decimal places (stable snapshots). */
export function clamp01(n: number): number {
  const x = Math.min(1, Math.max(0, n));
  return Math.round(x * 1e4) / 1e4;
}
