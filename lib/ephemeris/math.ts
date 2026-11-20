/** Pure angle helpers for ephemeris. */

export function normalizeDegrees(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

export function shortestArcDegrees(a: number, b: number): number {
  let d = normalizeDegrees(b - a);
  if (d > 180) d -= 360;
  return d;
}

export function angularDistanceDegrees(a: number, b: number): number {
  return Math.abs(shortestArcDegrees(a, b));
}

export function signIndexFromLongitude(lon: number): number {
  return Math.floor(normalizeDegrees(lon) / 30) % 12;
}

export function degreeInSign(lon: number): number {
  return normalizeDegrees(lon) % 30;
}

/** Whole-sign house 1–12 from lagna sign. */
export function wholeSignHouse(planetLon: number, lagnaLon: number): number {
  const p = signIndexFromLongitude(planetLon);
  const l = signIndexFromLongitude(lagnaLon);
  return ((p - l + 12) % 12) + 1;
}
