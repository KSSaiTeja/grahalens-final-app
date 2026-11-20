import {
  NAKSHATRA_NAMES,
  NAKSHATRA_SPAN_DEG,
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_TOTAL_YEARS,
  VIMSHOTTARI_YEARS,
  type GrahaId,
  type NakshatraName,
} from './constants';
import { normalizeDegrees } from './math';
import { getPlacement, type NatalChart } from './types';

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export type DashaPeriod = {
  level: 'maha' | 'antar';
  lord: GrahaId;
  parentLord?: GrahaId;
  key: string;
  start: string;
  end: string;
};

export type DashaTimeline = {
  moonLongitude: number;
  nakshatraIndex: number;
  nakshatra: NakshatraName;
  balanceYears: number;
  birthLord: GrahaId;
  periods: DashaPeriod[];
};

export type CurrentDasha = {
  maha: DashaPeriod;
  antar: DashaPeriod;
  at: string;
};

function nextLord(lord: GrahaId): GrahaId {
  const i = VIMSHOTTARI_ORDER.indexOf(
    lord as (typeof VIMSHOTTARI_ORDER)[number],
  );
  return VIMSHOTTARI_ORDER[(i + 1) % 9]!;
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

/**
 * Build mahadasha + antardasha timeline from a natal chart.
 * `cycleCount` = number of full 9-lord sweeps (default 1).
 */
export function computeDasha(
  chart: NatalChart,
  cycleCount = 1,
): DashaTimeline {
  const moon = getPlacement(chart, 'moon');
  const moonLongitude = normalizeDegrees(moon.longitude);
  const nakshatraIndex = Math.floor(moonLongitude / NAKSHATRA_SPAN_DEG) % 27;
  const startInNak = moonLongitude % NAKSHATRA_SPAN_DEG;
  const remainingFraction = 1 - startInNak / NAKSHATRA_SPAN_DEG;

  const birthLord = VIMSHOTTARI_ORDER[nakshatraIndex % 9]!;
  const balanceYears = VIMSHOTTARI_YEARS[birthLord] * remainingFraction;

  const birthUtc = new Date(chart.birthAt);
  const periods: DashaPeriod[] = [];
  let cursor = birthUtc;
  let lord = birthLord;
  let mahasEmitted = 0;
  const targetMahas = 9 * cycleCount;

  while (mahasEmitted < targetMahas) {
    const mahaYears =
      mahasEmitted === 0 ? balanceYears : VIMSHOTTARI_YEARS[lord];
    const mahaStart = cursor;
    const mahaEnd = addYears(mahaStart, mahaYears);

    periods.push({
      level: 'maha',
      lord,
      key: `maha:${lord}:${mahaStart.toISOString().slice(0, 10)}`,
      start: mahaStart.toISOString(),
      end: mahaEnd.toISOString(),
    });

    let antarCursor = mahaStart;
    let antarLord = lord;
    for (let i = 0; i < 9; i++) {
      const antarYears =
        (mahaYears * VIMSHOTTARI_YEARS[antarLord]) / VIMSHOTTARI_TOTAL_YEARS;
      const antarEnd = addYears(antarCursor, antarYears);
      periods.push({
        level: 'antar',
        lord: antarLord,
        parentLord: lord,
        key: `antar:${lord}/${antarLord}:${antarCursor.toISOString().slice(0, 10)}`,
        start: antarCursor.toISOString(),
        end: antarEnd.toISOString(),
      });
      antarCursor = antarEnd;
      antarLord = nextLord(antarLord);
    }

    cursor = mahaEnd;
    lord = nextLord(lord);
    mahasEmitted += 1;
  }

  return {
    moonLongitude,
    nakshatraIndex,
    nakshatra: NAKSHATRA_NAMES[nakshatraIndex]!,
    balanceYears,
    birthLord,
    periods,
  };
}

/**
 * Current maha + antar at `at`.
 * Throws if `at` falls outside the computed timeline (e.g. before birth).
 */
export function currentDasha(
  timeline: DashaTimeline,
  at: Date,
): CurrentDasha {
  const t = at.getTime();
  const mahas = timeline.periods.filter((p) => p.level === 'maha');
  const antars = timeline.periods.filter((p) => p.level === 'antar');

  const maha = mahas.find((p) => {
    const s = Date.parse(p.start);
    const e = Date.parse(p.end);
    return t >= s && t < e;
  });
  if (!maha) {
    throw new Error(`No mahadasha covering ${at.toISOString()}`);
  }

  const mahaStart = Date.parse(maha.start);
  const mahaEnd = Date.parse(maha.end);
  const antar = antars.find((p) => {
    if (p.parentLord !== maha.lord) return false;
    const s = Date.parse(p.start);
    const e = Date.parse(p.end);
    return t >= s && t < e && s >= mahaStart - 1 && e <= mahaEnd + 1;
  });

  if (!antar) {
    throw new Error(`No antardasha covering ${at.toISOString()}`);
  }

  return { maha, antar, at: at.toISOString() };
}
