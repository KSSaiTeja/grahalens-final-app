import type { GrahaId } from '@/lib/ephemeris/constants';
import { GRAHA_IDS } from '@/lib/ephemeris/constants';

export type ChartBodyId = GrahaId | 'lagna';

/** Display order: Lagna then grahas. */
export const CHART_BODY_ORDER: readonly ChartBodyId[] = [
  'lagna',
  ...GRAHA_IDS,
] as const;

const LABELS: Record<ChartBodyId, string> = {
  lagna: 'Lagna',
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

export function chartBodyLabel(id: ChartBodyId): string {
  return LABELS[id];
}

/** Matches `components/icons` registry keys (`graha.sun`, …). */
export function chartBodyIconName(
  id: ChartBodyId,
): `graha.${ChartBodyId}` {
  return `graha.${id}`;
}
