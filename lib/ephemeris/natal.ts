import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { lahiriAyanamsa } from './ayanamsa';
import {
  CHART_SYSTEM,
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
  tropicalAscendant,
  tropicalLongitude,
  type PlanetName,
} from './positions';
import {
  getPlacement,
  type BodyPlacement,
  type NakshatraPlacement,
  type NatalBirthInput,
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

/**
 * Resolve birth instant. When `timeUnknown`, use local noon on the calendar
 * date (in `tz`) and mark lagna as approximate.
 */
export function resolveBirthUtc(input: NatalBirthInput): {
  utc: Date;
  lagnaApproximate: boolean;
} {
  const lagnaApproximate = Boolean(input.timeUnknown);
  if (!lagnaApproximate) {
    return { utc: new Date(input.birthAt), lagnaApproximate: false };
  }

  const zoned = toZonedTime(new Date(input.birthAt), input.tz);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, '0');
  const d = String(zoned.getDate()).padStart(2, '0');
  const utc = fromZonedTime(`${y}-${m}-${d}T12:00:00`, input.tz);
  return { utc, lagnaApproximate: true };
}

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
  id: GrahaId | 'lagna',
  longitude: number,
  latitude: number,
  lagnaLon: number,
  retrograde: boolean,
): BodyPlacement {
  const signIndex = signIndexFromLongitude(longitude);
  return {
    id,
    longitude: normalizeDegrees(longitude),
    latitude,
    sign: RASI_IDS[signIndex]!,
    signIndex,
    degreeInSign: degreeInSign(longitude),
    house: wholeSignHouse(longitude, lagnaLon),
    retrograde,
    nakshatra: nakshatraFromLongitude(longitude),
  };
}

/**
 * Compute a Lahiri whole-sign natal chart.
 * Nine grahas + Lagna. Computation only — no narration.
 */
export function computeNatal(input: NatalBirthInput): NatalChart {
  const { utc, lagnaApproximate } = resolveBirthUtc(input);
  const ayanamsa = lahiriAyanamsa(utc);

  const lagnaLon = siderealize(
    tropicalAscendant(utc, input.lat, input.lng),
    ayanamsa,
  );

  const placements: BodyPlacement[] = [];

  for (const { id, body } of PLANET_MAP) {
    const tropical = tropicalLongitude(body, utc);
    const longitude = siderealize(tropical, ayanamsa);
    const retrograde =
      body === 'Sun' || body === 'Moon'
        ? false
        : isRetrograde((at) => tropicalLongitude(body, at), utc);
    placements.push(makeBody(id, longitude, 0, lagnaLon, retrograde));
  }

  const rahuLon = siderealize(meanRahuLongitude(utc), ayanamsa);
  const ketuLon = siderealize(meanKetuLongitude(utc), ayanamsa);
  placements.push(makeBody('rahu', rahuLon, 0, lagnaLon, true));
  placements.push(makeBody('ketu', ketuLon, 0, lagnaLon, true));
  placements.push(makeBody('lagna', lagnaLon, 0, lagnaLon, false));

  if (placements.length !== 10) {
    throw new Error(`Expected 10 placements, got ${placements.length}`);
  }

  return {
    system: CHART_SYSTEM,
    ayanamsa,
    lagnaApproximate,
    birthAt: utc.toISOString(),
    lat: input.lat,
    lng: input.lng,
    tz: input.tz,
    placements,
  };
}

export { getPlacement };
export type { NatalBirthInput, NatalChart, BodyPlacement, GrahaId };
