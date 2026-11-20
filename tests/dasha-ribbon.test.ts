import chartA from '@/fixtures/chart-a.json';
import {
  caretMatchesCompute,
  dashaCaret,
  mahaPeriods,
} from '@/lib/chart/dasha-ribbon';
import {
  computeNatal,
  type NatalBirthInput,
} from '@/lib/ephemeris/natal';
import { computeDasha, currentDasha } from '@/lib/ephemeris/dasha';

describe('dasha ribbon caret', () => {
  const chart = computeNatal(chartA.input as NatalBirthInput);
  const timeline = computeDasha(chart, 1);
  const mahas = mahaPeriods(timeline);

  it('caret maha/antar keys match currentDasha (PRD ZT3)', () => {
    const mid = new Date(
      Date.parse(mahas[0]!.start) + 100 * 24 * 60 * 60 * 1000,
    );
    expect(caretMatchesCompute(timeline, mid)).toBe(true);

    const cur = currentDasha(timeline, mid);
    const caret = dashaCaret(timeline, mid);
    expect(caret.maha.key).toBe(cur.maha.key);
    expect(caret.antar.key).toBe(cur.antar.key);
  });

  it('fraction is 0 at timeline start and rises inside first maha', () => {
    const start = new Date(Date.parse(mahas[0]!.start));
    const later = new Date(Date.parse(mahas[0]!.start) + 30 * 24 * 60 * 60 * 1000);
    const a = dashaCaret(timeline, start);
    const b = dashaCaret(timeline, later);
    expect(a.fraction).toBe(0);
    expect(b.fraction).toBeGreaterThan(a.fraction);
    expect(b.fraction).toBeLessThan(1);
  });

  it('caret lands inside the current maha’s duration span', () => {
    const at = new Date(
      Date.parse(mahas[2]!.start) + 50 * 24 * 60 * 60 * 1000,
    );
    const caret = dashaCaret(timeline, at);
    const start = Date.parse(mahas[0]!.start);
    const end = Date.parse(mahas[mahas.length - 1]!.end);
    const mahaStart = Date.parse(caret.maha.start);
    const mahaEnd = Date.parse(caret.maha.end);
    const t = start + caret.fraction * (end - start);
    expect(t).toBeGreaterThanOrEqual(mahaStart - 1);
    expect(t).toBeLessThan(mahaEnd + 1);
  });
});
