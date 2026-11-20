import {
  ASPECT_ORB_TABLE,
  computeAspects,
  natalAspects,
} from '@/lib/ephemeris/aspects';
import chartA from '@/fixtures/chart-a.json';
import {
  computeNatal,
  type NatalBirthInput,
} from '@/lib/ephemeris/natal';
import {
  NAKSHATRA_NAMES,
  NAKSHATRA_SPAN_DEG,
  PADA_SPAN_DEG,
  RASI_IDS,
  type GrahaId,
  type NakshatraName,
} from '@/lib/ephemeris/constants';
import type { BodyPlacement } from '@/lib/ephemeris/types';
import { normalizeDegrees } from '@/lib/ephemeris/math';

function fakePlacement(id: GrahaId | 'lagna', longitude: number): BodyPlacement {
  const n = normalizeDegrees(longitude);
  const signIndex = Math.floor(n / 30) % 12;
  const degreeInNakshatra = n % NAKSHATRA_SPAN_DEG;
  const nakIndex = Math.floor(n / NAKSHATRA_SPAN_DEG) % 27;
  return {
    id,
    longitude: n,
    latitude: 0,
    sign: RASI_IDS[signIndex]!,
    signIndex,
    degreeInSign: n % 30,
    house: 1,
    retrograde: false,
    nakshatra: {
      index: nakIndex,
      name: NAKSHATRA_NAMES[nakIndex] as NakshatraName,
      pada: Math.min(4, Math.floor(degreeInNakshatra / PADA_SPAN_DEG) + 1),
      degreeInNakshatra,
    },
  };
}

describe('aspects + orb table', () => {
  it('documents the five major aspects with orbs', () => {
    expect(ASPECT_ORB_TABLE).toEqual([
      { id: 'conjunction', angle: 0, orb: 8 },
      { id: 'sextile', angle: 60, orb: 6 },
      { id: 'square', angle: 90, orb: 7 },
      { id: 'trine', angle: 120, orb: 8 },
      { id: 'opposition', angle: 180, orb: 8 },
    ]);
  });

  it('detects conjunction within orb and rejects outside', () => {
    expect(
      computeAspects([
        fakePlacement('sun', 10),
        fakePlacement('moon', 17),
      ]),
    ).toHaveLength(1);

    expect(
      computeAspects([
        fakePlacement('sun', 10),
        fakePlacement('moon', 19),
      ]),
    ).toHaveLength(0);
  });

  it('detects trine, square, opposition, sextile', () => {
    expect(
      computeAspects([
        fakePlacement('sun', 0),
        fakePlacement('jupiter', 120),
      ])[0]!.id,
    ).toBe('trine');
    expect(
      computeAspects([
        fakePlacement('sun', 0),
        fakePlacement('mars', 90),
      ])[0]!.id,
    ).toBe('square');
    expect(
      computeAspects([
        fakePlacement('sun', 0),
        fakePlacement('saturn', 180),
      ])[0]!.id,
    ).toBe('opposition');
    expect(
      computeAspects([
        fakePlacement('sun', 0),
        fakePlacement('venus', 60),
      ])[0]!.id,
    ).toBe('sextile');
  });

  it('computes natal aspects for chart-a without inventing grahas', () => {
    const chart = computeNatal(chartA.input as NatalBirthInput);
    const hits = natalAspects(chart);
    const allowed = new Set(chart.placements.map((p) => p.id));
    for (const h of hits) {
      expect(allowed.has(h.a)).toBe(true);
      expect(allowed.has(h.b)).toBe(true);
      expect(h.strength).toBeGreaterThanOrEqual(0);
    }
  });
});
