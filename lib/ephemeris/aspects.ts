/**
 * Natal / transit aspect computation.
 *
 * Aspect orb table (Grahalens v1 — major aspects only):
 *
 * | Aspect      | Angle | Max orb |
 * |-------------|-------|---------|
 * | Conjunction |   0°  |  8.0°   |
 * | Sextile     |  60°  |  6.0°   |
 * | Square      |  90°  |  7.0°   |
 * | Trine       | 120°  |  8.0°   |
 * | Opposition  | 180°  |  8.0°   |
 *
 * Orbs are absolute degrees from the exact angle. Lagna is included when
 * present in the placement list. Rahu/Ketu participate like other grahas.
 */

import type { GrahaId } from './constants';
import { angularDistanceDegrees, normalizeDegrees } from './math';
import type { BodyPlacement, NatalChart } from './types';

export type AspectBodyId = GrahaId | 'lagna';

export type AspectId =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition';

/** @deprecated Prefer AspectId. */
export type AspectKind = AspectId;

export type AspectDefinition = {
  id: AspectId;
  angle: number;
  orb: number;
};

/** Documented orb table — single source of truth. */
export const ASPECT_ORB_TABLE: readonly AspectDefinition[] = [
  { id: 'conjunction', angle: 0, orb: 8 },
  { id: 'sextile', angle: 60, orb: 6 },
  { id: 'square', angle: 90, orb: 7 },
  { id: 'trine', angle: 120, orb: 8 },
  { id: 'opposition', angle: 180, orb: 8 },
] as const;

export type AspectHit = {
  a: AspectBodyId;
  b: AspectBodyId;
  id: AspectId;
  exactAngle: number;
  delta: number;
  orb: number;
  strength: number;
};

function classifyPair(
  lonA: number,
  lonB: number,
): Omit<AspectHit, 'a' | 'b'> | null {
  const separation = angularDistanceDegrees(lonA, lonB);
  let best: { def: AspectDefinition; slip: number } | null = null;

  for (const def of ASPECT_ORB_TABLE) {
    const slip = Math.abs(separation - def.angle);
    if (slip <= def.orb) {
      if (!best || slip < best.slip) {
        best = { def, slip };
      }
    }
  }

  if (!best) return null;

  return {
    id: best.def.id,
    exactAngle: best.def.angle,
    delta: separation,
    orb: best.def.orb,
    strength: best.def.orb - best.slip,
  };
}

export function computeAspects(placements: BodyPlacement[]): AspectHit[] {
  const hits: AspectHit[] = [];

  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const pa = placements[i]!;
      const pb = placements[j]!;
      const hit = classifyPair(pa.longitude, pb.longitude);
      if (!hit) continue;
      const [a, b] = pa.id < pb.id ? [pa.id, pb.id] : [pb.id, pa.id];
      hits.push({ ...hit, a, b });
    }
  }

  hits.sort((x, y) => y.strength - x.strength || x.a.localeCompare(y.a));
  return hits;
}

export function natalAspects(chart: NatalChart): AspectHit[] {
  return computeAspects(chart.placements);
}

export function transitToNatalAspects(
  transitPlacements: BodyPlacement[],
  natal: NatalChart,
): AspectHit[] {
  const hits: AspectHit[] = [];
  for (const t of transitPlacements) {
    if (t.id === 'lagna') continue;
    for (const n of natal.placements) {
      const hit = classifyPair(t.longitude, n.longitude);
      if (!hit) continue;
      hits.push({ ...hit, a: t.id, b: n.id });
    }
  }
  hits.sort((x, y) => y.strength - x.strength);
  return hits;
}

export function normalizeLon(lon: number): number {
  return normalizeDegrees(lon);
}
