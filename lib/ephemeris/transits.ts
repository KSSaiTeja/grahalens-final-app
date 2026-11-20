import { MakeTime } from 'astronomy-engine';

import { lahiriAyanamsa } from './ayanamsa';
import {
  NAKSHATRA_NAMES,
  NAKSHATRA_SPAN_DEG,
  PADA_SPAN_DEG,
  RASI_IDS,
  type GrahaId,
  type NakshatraName,
} from './constants';
import {
  degreeInSign,
  normalizeDegrees,
  signIndexFromLongitude,
  wholeSignHouse,
} from './math';
import {
  isRetrograde,
  meanKetuLongitude,
  meanRahuLongitude,
  tropicalLongitude,
  type PlanetName,
} from './positions';
import {
  transitToNatalAspects,
  type AspectBodyId,
  type AspectHit,
  type AspectId,
} from './aspects';
import {
  getPlacement,
  type BodyPlacement,
  type NakshatraPlacement,
  type NatalChart,
} from './types';

const PLANET_MAP: { id: GrahaId; body: PlanetName }[] = [
  { id: 'sun', body: 'Sun' },
  { id: 'moon', body: 'Moon' },
  { id: 'mercury', body: 'Mercury' },
  { id: 'venus', body: 'Venus' },
  { id: 'mars', body: 'Mars' },
  { id: 'jupiter', body: 'Jupiter' },
  { id: 'saturn', body: 'Saturn' },
];

export type TransitPlacement = BodyPlacement & {
  /** Signed shortest-arc delta vs natal same graha. */
  vsNatalDelta?: number;
};

export type TransitToNatalHit = {
  transit: GrahaId;
  natal: AspectBodyId;
  id: AspectId;
  exactAngle: number;
  delta: number;
  orb: number;
  strength: number;
};

export type TransitReport = {
  at: string;
  jdUt: number;
  ayanamsa: number;
  placements: TransitPlacement[];
  /** Transit graha → natal body aspects. */
  toNatal: TransitToNatalHit[];
};

/** @deprecated Prefer TransitReport. */
export type TransitChart = TransitReport;

function siderealize(tropicalLon: number, ayanamsa: number): number {
  return normalizeDegrees(tropicalLon - ayanamsa);
}

function nakshatraFromLongitude(lon: number): NakshatraPlacement {
  const n = normalizeDegrees(lon);
  const index = Math.floor(n / NAKSHATRA_SPAN_DEG) % 27;
  const degreeInNakshatra = n % NAKSHATRA_SPAN_DEG;
  const pada = Math.min(4, Math.floor(degreeInNakshatra / PADA_SPAN_DEG) + 1);
  return {
    index,
    name: NAKSHATRA_NAMES[index] as NakshatraName,
    pada,
    degreeInNakshatra,
  };
}

function makeBody(
  id: GrahaId,
  longitude: number,
  lagnaLon: number,
  retrograde: boolean,
): BodyPlacement {
  const signIndex = signIndexFromLongitude(longitude);
  return {
    id,
    longitude: normalizeDegrees(longitude),
    latitude: 0,
    sign: RASI_IDS[signIndex]!,
    signIndex,
    degreeInSign: degreeInSign(longitude),
    house: wholeSignHouse(longitude, lagnaLon),
    retrograde,
    nakshatra: nakshatraFromLongitude(longitude),
  };
}

function shortestSigned(from: number, to: number): number {
  let d = normalizeDegrees(to) - normalizeDegrees(from);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function toNatalHits(hits: AspectHit[]): TransitToNatalHit[] {
  return hits
    .filter((h): h is AspectHit & { a: GrahaId } => h.a !== 'lagna')
    .map((h) => ({
      transit: h.a,
      natal: h.b,
      id: h.id,
      exactAngle: h.exactAngle,
      delta: h.delta,
      orb: h.orb,
      strength: h.strength,
    }));
}

/**
 * Sidereal Lahiri sky for `at`, houses whole-sign from natal Lagna,
 * plus aspects of transiting grahas to natal placements.
 */
export function computeTransits(natal: NatalChart, at: Date): TransitReport {
  const ayanamsa = lahiriAyanamsa(at);
  const time = MakeTime(at);
  const lagnaLon = getPlacement(natal, 'lagna').longitude;

  const placements: TransitPlacement[] = [];

  for (const { id, body } of PLANET_MAP) {
    const tropical = tropicalLongitude(body, at);
    const longitude = siderealize(tropical, ayanamsa);
    const retrograde =
      body === 'Sun' || body === 'Moon'
        ? false
        : isRetrograde((d) => tropicalLongitude(body, d), at);
    const base = makeBody(id, longitude, lagnaLon, retrograde);
    const natalP = getPlacement(natal, id);
    placements.push({
      ...base,
      vsNatalDelta: shortestSigned(natalP.longitude, longitude),
    });
  }

  const rahuLon = siderealize(meanRahuLongitude(at), ayanamsa);
  const ketuLon = siderealize(meanKetuLongitude(at), ayanamsa);
  for (const [id, lon] of [
    ['rahu', rahuLon],
    ['ketu', ketuLon],
  ] as const) {
    const base = makeBody(id, lon, lagnaLon, true);
    const natalP = getPlacement(natal, id);
    placements.push({
      ...base,
      vsNatalDelta: shortestSigned(natalP.longitude, lon),
    });
  }

  const aspects = transitToNatalAspects(placements, natal);

  return {
    at: at.toISOString(),
    jdUt: 2451545.0 + time.ut,
    ayanamsa,
    placements,
    toNatal: toNatalHits(aspects),
  };
}

export function getTransitPlacement(
  report: TransitReport,
  id: GrahaId,
): TransitPlacement {
  const found = report.placements.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Transit placement missing: ${id}`);
  }
  return found;
}
