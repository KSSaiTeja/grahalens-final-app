/**
 * Deterministic L2 prose for Chart screens — placement/dasha cites only.
 * Computation before narration (PLAN §1).
 */

import { chartBodyLabel, type ChartBodyId } from "@/lib/chart/labels";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import type { AspectHit, AspectId } from "@/lib/ephemeris/aspects";
import type { CurrentDasha, DashaPeriod } from "@/lib/ephemeris/dasha";
import type { BodyPlacement } from "@/lib/ephemeris/types";

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

/** ISO → short UTC civil label for mono rows. */
export function formatIsoDate(iso: string): string {
  return iso.slice(0, 10);
}

export function formatPeriodRange(period: DashaPeriod): string {
  return `${formatIsoDate(period.start)} → ${formatIsoDate(period.end)}`;
}

export const ASPECT_LABELS: Record<AspectId, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
};

/** Full planet page lead — cites only the given placement. */
export function planetPlacementProse(
  bodyId: ChartBodyId,
  placement: BodyPlacement,
): string {
  const label = chartBodyLabel(bodyId);
  const rx = placement.retrograde ? " · retrograde" : "";
  return `${label} sits in ${RASI_LABELS[placement.sign]} in your ${ordinalHouse(placement.house)} · ${placement.nakshatra.name} pada ${placement.nakshatra.pada}${rx}.`;
}

/** Current dasha period prose for C3. */
export function dashaPeriodProse(cur: CurrentDasha): string {
  const maha = capitalize(cur.maha.lord);
  const antar = capitalize(cur.antar.lord);
  return `${maha} mahadasha · ${antar} antardasha. Antar window ${formatPeriodRange(cur.antar)}.`;
}

/** One-line aspect row label. */
export function aspectRowLabel(hit: AspectHit): string {
  return `${ASPECT_LABELS[hit.id]} · ${chartBodyLabel(hit.a as ChartBodyId)}–${chartBodyLabel(hit.b as ChartBodyId)}`;
}

/** Parse route param into ChartBodyId; null if unknown. */
export function parsePlanetParam(
  raw: string | string[] | undefined,
): ChartBodyId | null {
  const name = Array.isArray(raw) ? raw[0] : raw;
  if (!name) return null;
  const id = decodeURIComponent(name).toLowerCase().trim();
  const allowed: ChartBodyId[] = [
    "lagna",
    "sun",
    "moon",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "rahu",
    "ketu",
  ];
  return (allowed as string[]).includes(id) ? (id as ChartBodyId) : null;
}
