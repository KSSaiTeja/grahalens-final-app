import {
  Body,
  GeoVector,
  MakeTime,
  Observer,
  RotateVector,
  Rotation_EQJ_ECT,
  SiderealTime,
  SphereFromVector,
  e_tilt,
  type FlexibleDateTime,
} from 'astronomy-engine';

import { normalizeDegrees } from './math';

const PLANET_BODIES = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
} as const;

export type PlanetName = keyof typeof PLANET_BODIES;

/**
 * Geocentric apparent ecliptic longitude of date (tropical), degrees [0, 360).
 */
export function tropicalLongitude(
  body: PlanetName,
  date: FlexibleDateTime,
): number {
  const vec = GeoVector(PLANET_BODIES[body], date, true);
  const ect = RotateVector(Rotation_EQJ_ECT(date), vec);
  return normalizeDegrees(SphereFromVector(ect).lon);
}

/**
 * Mean lunar ascending node (Rahu) — Meeus Astronomical Algorithms.
 * Traditional Vedic practice uses mean nodes; always retrograde.
 */
export function meanRahuLongitude(date: FlexibleDateTime): number {
  const t = MakeTime(date).tt / 36525; // Julian centuries from J2000.0 TT
  const omega =
    125.0445479 -
    1934.1362891 * t +
    0.0020754 * t * t +
    t * t * t / 467441 -
    t * t * t * t / 60616000;
  return normalizeDegrees(omega);
}

export function meanKetuLongitude(date: FlexibleDateTime): number {
  return normalizeDegrees(meanRahuLongitude(date) + 180);
}

/**
 * Tropical ascendant (Lagna) longitude for an observer, degrees [0, 360).
 * Uses Greenwich apparent sidereal time + true obliquity of date.
 */
export function tropicalAscendant(
  date: FlexibleDateTime,
  lat: number,
  lng: number,
): number {
  const time = MakeTime(date);
  const gastHours = SiderealTime(time);
  const lstHours = ((gastHours + lng / 15) % 24 + 24) % 24;
  const ramc = lstHours * 15; // degrees
  const eps = e_tilt(time).tobl; // true obliquity degrees

  const ramcRad = (ramc * Math.PI) / 180;
  const epsRad = (eps * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  const y = -Math.cos(ramcRad);
  const x =
    Math.sin(ramcRad) * Math.cos(epsRad) +
    Math.tan(latRad) * Math.sin(epsRad);
  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  return normalizeDegrees(asc);
}

export function makeObserver(lat: number, lng: number): Observer {
  return new Observer(lat, lng, 0);
}

/** True if ecliptic longitude decreases over a short forward sample. */
export function isRetrograde(
  sample: (at: Date) => number,
  at: Date,
  deltaMs = 6 * 60 * 60 * 1000,
): boolean {
  const a = sample(at);
  const b = sample(new Date(at.getTime() + deltaMs));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}
