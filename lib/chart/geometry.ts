/**
 * Living Chart polar geometry — Lagna at left (east), longitude CCW.
 * Whole-sign Lahiri: house wedges align with signs from Lagna's sign.
 */

import { layout } from '@/theme/tokens';
import { normalizeDegrees } from '@/lib/ephemeris/math';
import type { BodyPlacement, NatalChart } from '@/lib/ephemeris/types';
import { getPlacement } from '@/lib/ephemeris/types';

export type Point = { x: number; y: number };

/** Diameter per BRAND §07 — min(screen − 48, 340). */
export function chartDiameter(screenWidth: number): number {
  return Math.min(screenWidth - layout.chartInset, layout.chartMaxDiameter);
}

/**
 * Sidereal longitude → canvas point.
 * Lagna at left (π); increasing longitude runs counter-clockwise (sky east→north).
 */
export function lonToPoint(
  longitude: number,
  lagnaLon: number,
  cx: number,
  cy: number,
  radius: number,
): Point {
  const degFromLagna = normalizeDegrees(longitude - lagnaLon);
  const rad = Math.PI - (degFromLagna * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

/** Unit direction from center toward a longitude (for ticks / labels). */
export function lonToUnit(
  longitude: number,
  lagnaLon: number,
): { ux: number; uy: number } {
  const degFromLagna = normalizeDegrees(longitude - lagnaLon);
  const rad = Math.PI - (degFromLagna * Math.PI) / 180;
  return { ux: Math.cos(rad), uy: -Math.sin(rad) };
}

/** Start of Lagna's whole-sign house (sign cusp). */
export function lagnaSignCusp(lagnaLon: number): number {
  return Math.floor(normalizeDegrees(lagnaLon) / 30) * 30;
}

export type ChartLayoutMetrics = {
  size: number;
  cx: number;
  cy: number;
  outerR: number;
  signR: number;
  houseR: number;
  planetR: number;
  lagnaLon: number;
};

export function chartLayoutMetrics(size: number, chart: NatalChart): ChartLayoutMetrics {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  return {
    size,
    cx,
    cy,
    outerR,
    signR: outerR * 0.92,
    houseR: outerR * 0.72,
    planetR: outerR * 0.58,
    lagnaLon: getPlacement(chart, 'lagna').longitude,
  };
}

export function placementPoint(
  placement: BodyPlacement,
  metrics: ChartLayoutMetrics,
  radius = metrics.planetR,
): Point {
  return lonToPoint(
    placement.longitude,
    metrics.lagnaLon,
    metrics.cx,
    metrics.cy,
    radius,
  );
}
