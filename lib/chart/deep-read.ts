import { chartBodyLabel } from "@/lib/chart/labels";
import { formatPeriodRange } from "@/lib/chart/prose";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import type { DashaPeriod, DashaTimeline } from "@/lib/ephemeris/dasha";
import { getPlacement, type NatalChart } from "@/lib/ephemeris/types";

export type DashaDeepRead = {
  title: string;
  subtitle: string;
  paragraphs: string[];
};

export function softGateParagraphs(
  paragraphs: readonly string[],
  isPrivate: boolean,
): { visible: string[]; locked: string[] } {
  if (isPrivate) {
    return { visible: [...paragraphs], locked: [] };
  }
  return {
    visible: paragraphs.slice(0, 1),
    locked: paragraphs.slice(1),
  };
}

function decodeRouteKey(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function findDashaPeriod(
  timeline: DashaTimeline,
  rawKey: string,
): DashaPeriod | null {
  const key = decodeRouteKey(rawKey).trim();
  return timeline.periods.find((period) => period.key === key) ?? null;
}

function ordinalHouse(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (n % 10 === 1) return `${n}st`;
  if (n % 10 === 2) return `${n}nd`;
  if (n % 10 === 3) return `${n}rd`;
  return `${n}th`;
}

function placementSentence(
  chart: NatalChart,
  lord: DashaPeriod["lord"],
): string {
  const placement = getPlacement(chart, lord);
  return `${chartBodyLabel(lord)} sits in ${RASI_LABELS[placement.sign]} in your ${ordinalHouse(placement.house)} house, in ${placement.nakshatra.name} pada ${placement.nakshatra.pada}.`;
}

export function buildDashaDeepRead(
  period: DashaPeriod,
  chart: NatalChart,
): DashaDeepRead {
  const lord = chartBodyLabel(period.lord);
  const isAntar = period.level === "antar";
  const parent = period.parentLord
    ? chartBodyLabel(period.parentLord)
    : null;
  const title = `${lord} ${isAntar ? "Antardasha" : "Mahadasha"}`;
  const subtitle = isAntar && parent ? `${parent} / ${lord}` : lord;

  const lead = isAntar && parent
    ? `${lord} moves through the wider ${parent} period. This timing window runs ${formatPeriodRange(period)}.`
    : `${lord} sets the long rhythm of this chapter. This timing window runs ${formatPeriodRange(period)}.`;

  const natal = `In your natal chart, ${placementSentence(chart, period.lord)}`;

  const synthesis =
    isAntar && period.parentLord
      ? `${placementSentence(chart, period.parentLord)} Read the shorter ${lord} window through both placements: the ${parent} period holds the frame while ${lord} brings the nearer emphasis.`
      : `Use ${lord}'s sign, house, and nakshatra as the stable lens for this period. The dasha marks timing and emphasis; it does not replace choice.`;

  return {
    title,
    subtitle,
    paragraphs: [lead, natal, synthesis],
  };
}
