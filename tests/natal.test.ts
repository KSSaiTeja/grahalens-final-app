import chartA from '@/fixtures/chart-a.json';
import {
  computeNatal,
  getPlacement,
  type NatalBirthInput,
} from '@/lib/ephemeris/natal';
import { angularDistanceDegrees } from '@/lib/ephemeris/math';
import { formatLongitude, formatDms } from '@/lib/format/degrees';
import type { GrahaId } from '@/lib/ephemeris/constants';

const TOLERANCE = chartA.toleranceDegrees;

function expectWithin(actual: number, expected: number) {
  expect(angularDistanceDegrees(actual, expected)).toBeLessThanOrEqual(
    TOLERANCE,
  );
}

describe('computeNatal (Lahiri whole-sign)', () => {
  const birth = chartA.input as NatalBirthInput;
  const chart = computeNatal(birth);

  it('computes nine grahas + Lagna', () => {
    const ids = chart.placements.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'rahu',
        'ketu',
        'lagna',
      ]),
    );
    expect(ids).toHaveLength(10);
  });

  it('matches chart-a fixture within 0.5°', () => {
    expectWithin(chart.ayanamsa, chartA.expected.ayanamsa);
    expect(chart.lagnaApproximate).toBe(chartA.expected.lagnaApproximate);
    expect(chart.system).toBe('lahiri_whole_sign');

    for (const [id, expectedLon] of Object.entries(
      chartA.expected.placements,
    )) {
      const p = getPlacement(chart, id as GrahaId | 'lagna');
      expectWithin(p.longitude, expectedLon);
    }
  });

  it('uses whole-sign houses from Lagna', () => {
    expect(getPlacement(chart, 'lagna').house).toBe(1);
    for (const p of chart.placements) {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
  });

  it('marks lagnaApproximate and uses noon when time unknown', () => {
    const unknown: NatalBirthInput = { ...birth, timeUnknown: true };
    const approx = computeNatal(unknown);
    expect(approx.lagnaApproximate).toBe(true);

    const noon: NatalBirthInput = {
      birthAt: '1990-08-15T12:00:00+05:30',
      lat: birth.lat,
      lng: birth.lng,
      tz: birth.tz,
      timeUnknown: false,
    };
    const noonChart = computeNatal(noon);
    expectWithin(
      getPlacement(approx, 'lagna').longitude,
      getPlacement(noonChart, 'lagna').longitude,
    );
    expectWithin(
      getPlacement(approx, 'moon').longitude,
      getPlacement(noonChart, 'moon').longitude,
    );
  });

  it('formats degrees tabularly', () => {
    const sun = getPlacement(chart, 'sun');
    expect(formatLongitude(sun.longitude)).toMatch(
      /^(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces) \d{2}°\d{2}′\d{2}″$/,
    );
    expect(formatDms(sun.degreeInSign)).toMatch(/^\d{2}°\d{2}′\d{2}″$/);
  });
});
