import chartA from '@/fixtures/chart-a.json';
import {
  computeNatal,
  getPlacement,
  type NatalBirthInput,
} from '@/lib/ephemeris/natal';
import {
  computeTransits,
  getTransitPlacement,
} from '@/lib/ephemeris/transits';
import { angularDistanceDegrees } from '@/lib/ephemeris/math';
import { GRAHA_IDS } from '@/lib/ephemeris/constants';

describe('transits', () => {
  const birth = chartA.input as NatalBirthInput;
  const natal = computeNatal(birth);

  it('returns nine transit grahas (no lagna) vs natal', () => {
    const frozen = new Date('2020-01-01T00:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(frozen.getTime());

    const sky = computeTransits(natal, frozen);
    expect(sky.at).toBe(frozen.toISOString());
    expect(sky.placements).toHaveLength(9);
    expect(sky.placements.every((p) => p.id !== 'lagna')).toBe(true);
    expect(Array.isArray(sky.toNatal)).toBe(true);

    for (const id of GRAHA_IDS) {
      const p = getTransitPlacement(sky, id);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(typeof p.vsNatalDelta).toBe('number');
    }

    jest.restoreAllMocks();
  });

  it('at birth instant, transit ≈ natal within 0.5°', () => {
    const at = new Date(natal.birthAt);
    const sky = computeTransits(natal, at);

    for (const id of GRAHA_IDS) {
      const n = getPlacement(natal, id);
      const t = getTransitPlacement(sky, id);
      expect(
        angularDistanceDegrees(n.longitude, t.longitude),
      ).toBeLessThanOrEqual(0.5);
      expect(Math.abs(t.vsNatalDelta!)).toBeLessThanOrEqual(0.5);
    }
  });
});
