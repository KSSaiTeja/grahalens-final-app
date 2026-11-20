import { chartDiameter, lonToPoint, lagnaSignCusp } from '@/lib/chart/geometry';
import { layout } from '@/theme/tokens';

describe('Living Chart geometry', () => {
  it('caps diameter per BRAND §07', () => {
    expect(chartDiameter(390)).toBe(Math.min(390 - 48, layout.chartMaxDiameter));
    expect(chartDiameter(500)).toBe(layout.chartMaxDiameter);
  });

  it('places Lagna at the left', () => {
    const lagna = 56.47;
    const pt = lonToPoint(lagna, lagna, 100, 100, 50);
    expect(pt.x).toBeCloseTo(50, 5);
    expect(pt.y).toBeCloseTo(100, 5);
  });

  it('moves 90° from Lagna toward the top', () => {
    const lagna = 0;
    const pt = lonToPoint(90, lagna, 100, 100, 50);
    expect(pt.x).toBeCloseTo(100, 5);
    expect(pt.y).toBeCloseTo(50, 5);
  });

  it('snaps Lagna to whole-sign cusp', () => {
    expect(lagnaSignCusp(56.47)).toBe(30);
    expect(lagnaSignCusp(0)).toBe(0);
  });
});
