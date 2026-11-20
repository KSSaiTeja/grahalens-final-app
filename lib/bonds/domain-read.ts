/**
 * B5 domain deep-read — grounded reasons + soft gate (first block free).
 */

import { softGateParagraphs } from "@/lib/chart/deep-read";
import {
  BOND_DOMAINS,
  DOMAIN_RULE_CATALOG,
  type BondDomainId,
  type DomainScore,
  type SynastryReport,
} from "@/lib/bonds/synastry";

export const DOMAIN_LABELS: Record<BondDomainId, string> = {
  talk: "Talk",
  care: "Care",
  spark: "Spark",
  friction: "Friction",
  growth: "Growth",
};

export function isBondDomainId(value: string): value is BondDomainId {
  return (BOND_DOMAINS as readonly string[]).includes(value);
}

/** Quiet intensity — never a soulmate percentage. */
export function domainIntensity(value: number): string {
  if (value >= 0.75) return "Strong";
  if (value >= 0.5) return "Active";
  if (value >= 0.25) return "Present";
  return "Quiet";
}

export type DomainDeepRead = {
  id: BondDomainId;
  title: string;
  intensity: string;
  value: number;
  lead: string;
  paragraphs: string[];
};

function reasonBody(ruleId: string, fallback: string): string {
  return DOMAIN_RULE_CATALOG[ruleId]?.body ?? fallback;
}

export function buildDomainDeepRead(
  score: DomainScore,
  label: string,
): DomainDeepRead {
  const title = DOMAIN_LABELS[score.id];
  const intensity = domainIntensity(score.value);
  const lead = `${title} between you and ${label} reads ${intensity.toLowerCase()}. These notes come from cross-chart links — not a scoreboard.`;

  const paragraphs =
    score.reasons.length > 0
      ? score.reasons.map((r) => reasonBody(r.ruleId, r.summary))
      : [
          `${title} is quiet in this braid — few of the usual cross-links lit for this domain.`,
        ];

  return {
    id: score.id,
    title,
    intensity,
    value: score.value,
    lead,
    paragraphs,
  };
}

export function softGateDomainRead(
  read: DomainDeepRead,
  isPrivate: boolean,
): { visible: string[]; locked: string[] } {
  const gated = softGateParagraphs(read.paragraphs, isPrivate);
  return {
    visible: [read.lead, ...gated.visible],
    locked: gated.locked,
  };
}

export function domainScoresList(report: SynastryReport): DomainScore[] {
  return BOND_DOMAINS.map((id) => report.domains[id]);
}
