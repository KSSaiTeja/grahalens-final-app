/**
 * Day archive entitlement window (PRD F13 / SCREENS S4).
 * Free: last 7 civil days inclusive of today. Private: unlimited.
 */

import { fromZonedTime } from "date-fns-tz";

import { civilDateParts } from "./civil";

/** Inclusive free preview length (today + 6 prior = 7). */
export const FREE_ARCHIVE_DAYS = 7;

/** How many days the archive list renders (locked rows beyond free window). */
export const ARCHIVE_LIST_DAYS = 14;

/** Civil `YYYY-MM-DD` for `at` in `tz`. */
export function civilDateInTz(at: Date, tz: string): string {
  return civilDateParts(at, tz).date;
}

/**
 * Noon local on a civil date — stable sample for weather / notes.
 */
export function noonOnCivilDate(date: string, tz: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid civil date: ${date}`);
  }
  return fromZonedTime(`${date}T12:00:00`, tz);
}

/** Shift a civil `YYYY-MM-DD` by `deltaDays` (calendar, via UTC date math). */
export function shiftCivilDate(date: string, deltaDays: number): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Archive list dates: today first, then older — length `count`.
 */
export function listArchiveDates(
  todayCivil: string,
  count: number = ARCHIVE_LIST_DAYS,
): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(shiftCivilDate(todayCivil, -i));
  }
  return out;
}

/**
 * Free users unlock dates within the last `FREE_ARCHIVE_DAYS` inclusive of today.
 * Private unlocks all.
 */
export function isArchiveDateUnlocked(
  date: string,
  todayCivil: string,
  isPrivate: boolean,
): boolean {
  if (isPrivate) return true;
  for (let i = 0; i < FREE_ARCHIVE_DAYS; i++) {
    if (shiftCivilDate(todayCivil, -i) === date) return true;
  }
  return false;
}

/** Human label for a civil date (weekday + short month day). */
export function formatCivilLabel(date: string, tz: string): string {
  const at = noonOnCivilDate(date, tz);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(at);
}
