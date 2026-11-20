import chartA from '@/fixtures/chart-a.json';
import {
  computeNatal,
  type NatalBirthInput,
} from '@/lib/ephemeris/natal';
import {
  computeDasha,
  currentDasha,
  type DashaTimeline,
} from '@/lib/ephemeris/dasha';
import { VIMSHOTTARI_YEARS } from '@/lib/ephemeris/constants';

describe('Vimshottari dasha', () => {
  const chart = computeNatal(chartA.input as NatalBirthInput);
  let timeline: DashaTimeline;

  beforeAll(() => {
    timeline = computeDasha(chart, 1);
  });

  it('derives nakshatra and birth lord from Moon', () => {
    expect(timeline.nakshatraIndex).toBeGreaterThanOrEqual(0);
    expect(timeline.nakshatraIndex).toBeLessThan(27);
    expect(timeline.nakshatra).toBeTruthy();
    expect(VIMSHOTTARI_YEARS[timeline.birthLord]).toBeGreaterThan(0);
    expect(timeline.balanceYears).toBeGreaterThan(0);
    expect(timeline.balanceYears).toBeLessThanOrEqual(
      VIMSHOTTARI_YEARS[timeline.birthLord],
    );
  });

  it('emits 9 mahas and 81 antars for one cycle', () => {
    const mahas = timeline.periods.filter((p) => p.level === 'maha');
    const antars = timeline.periods.filter((p) => p.level === 'antar');
    expect(mahas).toHaveLength(9);
    expect(antars).toHaveLength(81);
    expect(mahas[0]!.lord).toBe(timeline.birthLord);
  });

  it('currentDasha matches frozen clock inside first maha', () => {
    const firstMaha = timeline.periods.find((p) => p.level === 'maha')!;
    const frozen = new Date(
      Date.parse(firstMaha.start) + 24 * 60 * 60 * 1000,
    );
    const spy = jest.spyOn(Date, 'now').mockReturnValue(frozen.getTime());

    const cur = currentDasha(timeline, frozen);
    expect(cur.maha.lord).toBe(firstMaha.lord);
    expect(cur.antar.parentLord).toBe(firstMaha.lord);
    expect(Date.parse(cur.antar.start)).toBeLessThanOrEqual(frozen.getTime());
    expect(Date.parse(cur.antar.end)).toBeGreaterThan(frozen.getTime());

    spy.mockRestore();
  });

  it('currentDasha throws before birth', () => {
    const before = new Date(Date.parse(timeline.periods[0]!.start) - 1000);
    expect(() => currentDasha(timeline, before)).toThrow(/No mahadasha/);
  });
});
