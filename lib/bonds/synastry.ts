/**
 * Bond synastry — domain scores from two Lahiri whole-sign charts (PLAN §1 step 9).
 * Pure function of self + other natal; never persist in Zustand (cache → synastry_cache).
 *
 * Domains (0–1): talk · care · spark · friction · growth
 * Threads = cross-chart aspects; overlays = whole-sign house falls.
 * No LLM — optional narrate later (Prompt 21).
 */

import {
  transitToNatalAspects,
  type AspectBodyId,
  type AspectId,
} from "@/lib/ephemeris/aspects";
import { wholeSignHouse } from "@/lib/ephemeris/math";
import {
  getPlacement,
  type NatalChart,
} from "@/lib/ephemeris/types";
import { clamp01 } from "@/lib/sky/civil";

export const BOND_DOMAINS = [
  "talk",
  "care",
  "spark",
  "friction",
  "growth",
] as const;

export type BondDomainId = (typeof BOND_DOMAINS)[number];

export type SynastrySide = "self_to_other" | "other_to_self";

export type SynastryAspect = {
  from: AspectBodyId;
  to: AspectBodyId;
  side: SynastrySide;
  id: AspectId;
  exactAngle: number;
  delta: number;
  orb: number;
  strength: number;
};

export type SynastryOverlay = {
  body: AspectBodyId;
  /** Chart whose house ring is used. */
  host: "self" | "other";
  house: number;
};

export type DomainReason = {
  ruleId: string;
  weight: number;
  summary: string;
  from?: AspectBodyId;
  to?: AspectBodyId;
  aspect?: AspectId;
  house?: number;
};

export type DomainScore = {
  id: BondDomainId;
  /** 0–1 inclusive. */
  value: number;
  reasons: DomainReason[];
};

export type SynastryReport = {
  domains: Record<BondDomainId, DomainScore>;
  /** Highest domain value (ties → BOND_DOMAINS order). */
  dominant: BondDomainId;
  aspects: SynastryAspect[];
  overlays: SynastryOverlay[];
};

/**
 * Human copy for B5 domain deep-read — locked vocabulary (adult, no snark).
 */
export const DOMAIN_RULE_CATALOG: Record<
  string,
  { domain: BondDomainId; title: string; body: string }
> = {
  "talk.mercury-soft": {
    domain: "talk",
    title: "Mercury soft link",
    body: "Mercury easing Mercury, Moon, or lagna keeps wording available.",
  },
  "talk.moon-mercury": {
    domain: "talk",
    title: "Moon to Mercury",
    body: "Feeling meets phrasing — easier to name what is present.",
  },
  "talk.mercury-hard": {
    domain: "talk",
    title: "Mercury under hard aspect",
    body: "Hard Mercury links tighten the channel — prefer one clear sentence.",
  },
  "talk.mercury-house": {
    domain: "talk",
    title: "Mercury in speech houses",
    body: "Mercury through the partner’s 3rd or 7th presses conversation.",
  },
  "care.moon-soft": {
    domain: "care",
    title: "Moon soft link",
    body: "Moon easing Moon, Venus, or Jupiter softens emotional arrival.",
  },
  "care.venus-moon": {
    domain: "care",
    title: "Venus to Moon",
    body: "Warmth meets need — care lands without performance.",
  },
  "care.moon-house": {
    domain: "care",
    title: "Moon in care houses",
    body: "Moon through the partner’s 4th or 7th sits on nurture and bond.",
  },
  "care.moon-hard": {
    domain: "care",
    title: "Moon under hard aspect",
    body: "Hard links to Moon ask for slower check-ins.",
  },
  "spark.venus-mars": {
    domain: "spark",
    title: "Venus–Mars link",
    body: "Desire and attraction share a thread — chemistry has a sky handle.",
  },
  "spark.sun-venus": {
    domain: "spark",
    title: "Sun soft to Venus",
    body: "Identity easing Venus brightens pull and ease.",
  },
  "spark.mars-lagna": {
    domain: "spark",
    title: "Mars to lagna",
    body: "Mars touching the partner’s rising heats presence.",
  },
  "spark.venus-house": {
    domain: "spark",
    title: "Venus in spark houses",
    body: "Venus through the partner’s 5th or 7th favors romance and play.",
  },
  "friction.mars-hard-personal": {
    domain: "friction",
    title: "Mars scrapes a personal planet",
    body: "Hard Mars to Moon, Mercury, or Venus frays soft edges.",
  },
  "friction.saturn-hard-light": {
    domain: "friction",
    title: "Saturn presses a light",
    body: "Saturn hard to Sun, Moon, or lagna adds weight between you.",
  },
  "friction.mars-mars": {
    domain: "friction",
    title: "Mars to Mars",
    body: "Two Mars threads raise tempo — heat without a plan becomes scrape.",
  },
  "friction.saturn-angular": {
    domain: "friction",
    title: "Saturn on an angle",
    body: "Saturn in the partner’s 1st or 7th sits on the bond’s structure.",
  },
  "growth.jupiter-soft": {
    domain: "growth",
    title: "Jupiter soft link",
    body: "Jupiter easing a light or personal planet widens the room together.",
  },
  "growth.saturn-soft": {
    domain: "growth",
    title: "Saturn soft structure",
    body: "Soft Saturn to a personal planet builds durable pace.",
  },
  "growth.jupiter-house": {
    domain: "growth",
    title: "Jupiter in growth houses",
    body: "Jupiter in the partner’s 1 / 5 / 9 / 11 favors shared expansion.",
  },
  "growth.node-soft": {
    domain: "growth",
    title: "Node soft to personal",
    body: "Rahu or Ketu easing a personal planet skews the script toward growth.",
  },
};

const SOFT: ReadonlySet<AspectId> = new Set(["trine", "sextile", "conjunction"]);
const HARD: ReadonlySet<AspectId> = new Set(["square", "opposition"]);
/** Soft without conjunction — used where conj is scored separately. */
const FLOW: ReadonlySet<AspectId> = new Set(["trine", "sextile"]);
const LIGHTS: ReadonlySet<AspectBodyId> = new Set(["sun", "moon", "lagna"]);
const PERSONAL: ReadonlySet<AspectBodyId> = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
]);
const TALK_TARGETS: ReadonlySet<AspectBodyId> = new Set([
  "mercury",
  "moon",
  "lagna",
]);
const CARE_TARGETS: ReadonlySet<AspectBodyId> = new Set([
  "moon",
  "venus",
  "jupiter",
]);

type DomainAccum = { value: number; reasons: DomainReason[] };

function add(
  acc: DomainAccum,
  ruleId: string,
  weight: number,
  summary: string,
  extra: Partial<DomainReason> = {},
): void {
  acc.value += weight;
  acc.reasons.push({ ruleId, weight, summary, ...extra });
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function xLabel(id: AspectBodyId): string {
  return capitalize(id);
}

function pairKey(a: AspectBodyId, b: AspectBodyId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Cross-chart aspects both directions (constellation threads). */
export function computeCrossAspects(
  self: NatalChart,
  other: NatalChart,
): SynastryAspect[] {
  const forward = transitToNatalAspects(self.placements, other).map(
    (h): SynastryAspect => ({
      from: h.a,
      to: h.b,
      side: "self_to_other",
      id: h.id,
      exactAngle: h.exactAngle,
      delta: h.delta,
      orb: h.orb,
      strength: h.strength,
    }),
  );
  const reverse = transitToNatalAspects(other.placements, self).map(
    (h): SynastryAspect => ({
      from: h.a,
      to: h.b,
      side: "other_to_self",
      id: h.id,
      exactAngle: h.exactAngle,
      delta: h.delta,
      orb: h.orb,
      strength: h.strength,
    }),
  );
  const all = [...forward, ...reverse];
  all.sort(
    (x, y) =>
      y.strength - x.strength ||
      x.from.localeCompare(y.from) ||
      x.to.localeCompare(y.to),
  );
  return all;
}

/** Whole-sign overlays: each body into the partner’s house ring. */
export function computeOverlays(
  self: NatalChart,
  other: NatalChart,
): SynastryOverlay[] {
  const selfLagna = getPlacement(self, "lagna").longitude;
  const otherLagna = getPlacement(other, "lagna").longitude;
  const overlays: SynastryOverlay[] = [];

  for (const p of self.placements) {
    overlays.push({
      body: p.id,
      host: "other",
      house: wholeSignHouse(p.longitude, otherLagna),
    });
  }
  for (const p of other.placements) {
    overlays.push({
      body: p.id,
      host: "self",
      house: wholeSignHouse(p.longitude, selfLagna),
    });
  }

  overlays.sort(
    (a, b) =>
      a.host.localeCompare(b.host) ||
      a.body.localeCompare(b.body) ||
      a.house - b.house,
  );
  return overlays;
}

function hitsWhere(
  aspects: SynastryAspect[],
  pred: (h: SynastryAspect) => boolean,
): SynastryAspect[] {
  return aspects.filter(pred);
}

/** Deduplicate undirected pair+aspect once (for rules that shouldn't double-count). */
function uniquePairs(
  aspects: SynastryAspect[],
  pred: (h: SynastryAspect) => boolean,
): SynastryAspect[] {
  const seen = new Set<string>();
  const out: SynastryAspect[] = [];
  for (const h of aspects) {
    if (!pred(h)) continue;
    const key = `${pairKey(h.from, h.to)}|${h.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  return out;
}

function scoreTalk(
  aspects: SynastryAspect[],
  overlays: SynastryOverlay[],
): DomainAccum {
  const acc: DomainAccum = { value: 0.34, reasons: [] };

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "mercury" && FLOW.has(x.id) && TALK_TARGETS.has(x.to),
  )) {
    add(
      acc,
      "talk.mercury-soft",
      0.1,
      `Mercury ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of uniquePairs(
    aspects,
    (x) =>
      ((x.from === "moon" && x.to === "mercury") ||
        (x.from === "mercury" && x.to === "moon")) &&
      SOFT.has(x.id),
  )) {
    add(
      acc,
      "talk.moon-mercury",
      0.09,
      `Moon–Mercury ${h.id}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "mercury" &&
      HARD.has(x.id) &&
      (x.to === "mercury" || x.to === "moon" || x.to === "lagna"),
  )) {
    add(
      acc,
      "talk.mercury-hard",
      -0.08,
      `Mercury ${h.id} ${xLabel(h.to)}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const o of overlays) {
    if (o.body === "mercury" && (o.house === 3 || o.house === 7)) {
      add(
        acc,
        "talk.mercury-house",
        0.09,
        `Mercury in partner house ${o.house}`,
        { from: "mercury", house: o.house },
      );
    }
  }

  return acc;
}

function scoreCare(
  aspects: SynastryAspect[],
  overlays: SynastryOverlay[],
): DomainAccum {
  const acc: DomainAccum = { value: 0.34, reasons: [] };

  for (const h of hitsWhere(
    aspects,
    (x) => x.from === "moon" && FLOW.has(x.id) && CARE_TARGETS.has(x.to),
  )) {
    add(
      acc,
      "care.moon-soft",
      0.1,
      `Moon ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of uniquePairs(
    aspects,
    (x) =>
      ((x.from === "venus" && x.to === "moon") ||
        (x.from === "moon" && x.to === "venus")) &&
      SOFT.has(x.id),
  )) {
    add(
      acc,
      "care.venus-moon",
      0.1,
      `Venus–Moon ${h.id}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const o of overlays) {
    if (o.body === "moon" && (o.house === 4 || o.house === 7)) {
      add(
        acc,
        "care.moon-house",
        0.09,
        `Moon in partner house ${o.house}`,
        { from: "moon", house: o.house },
      );
    }
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.to === "moon" &&
      HARD.has(x.id) &&
      (x.from === "mars" || x.from === "saturn"),
  )) {
    add(
      acc,
      "care.moon-hard",
      -0.07,
      `${xLabel(h.from)} ${h.id} Moon`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  return acc;
}

function scoreSpark(
  aspects: SynastryAspect[],
  overlays: SynastryOverlay[],
): DomainAccum {
  const acc: DomainAccum = { value: 0.28, reasons: [] };

  for (const h of uniquePairs(
    aspects,
    (x) =>
      ((x.from === "venus" && x.to === "mars") ||
        (x.from === "mars" && x.to === "venus")) &&
      SOFT.has(x.id),
  )) {
    add(
      acc,
      "spark.venus-mars",
      0.14,
      `Venus–Mars ${h.id}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "sun" && FLOW.has(x.id) && x.to === "venus",
  )) {
    add(
      acc,
      "spark.sun-venus",
      0.09,
      `Sun ${h.id} Venus`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "mars" && SOFT.has(x.id) && x.to === "lagna",
  )) {
    add(
      acc,
      "spark.mars-lagna",
      0.1,
      `Mars ${h.id} lagna`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const o of overlays) {
    if (o.body === "venus" && (o.house === 5 || o.house === 7)) {
      add(
        acc,
        "spark.venus-house",
        0.09,
        `Venus in partner house ${o.house}`,
        { from: "venus", house: o.house },
      );
    }
  }

  return acc;
}

function scoreFriction(
  aspects: SynastryAspect[],
  overlays: SynastryOverlay[],
): DomainAccum {
  const acc: DomainAccum = { value: 0.18, reasons: [] };

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "mars" &&
      HARD.has(x.id) &&
      (x.to === "moon" || x.to === "mercury" || x.to === "venus"),
  )) {
    add(
      acc,
      "friction.mars-hard-personal",
      0.12,
      `Mars ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "saturn" && HARD.has(x.id) && LIGHTS.has(x.to),
  )) {
    add(
      acc,
      "friction.saturn-hard-light",
      0.12,
      `Saturn ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of uniquePairs(
    aspects,
    (x) => x.from === "mars" && x.to === "mars" && (HARD.has(x.id) || x.id === "conjunction"),
  )) {
    add(
      acc,
      "friction.mars-mars",
      0.1,
      `Mars–Mars ${h.id}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const o of overlays) {
    if (o.body === "saturn" && (o.house === 1 || o.house === 7)) {
      add(
        acc,
        "friction.saturn-angular",
        0.1,
        `Saturn in partner house ${o.house}`,
        { from: "saturn", house: o.house },
      );
    }
  }

  return acc;
}

function scoreGrowth(
  aspects: SynastryAspect[],
  overlays: SynastryOverlay[],
): DomainAccum {
  const acc: DomainAccum = { value: 0.32, reasons: [] };

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "jupiter" &&
      FLOW.has(x.id) &&
      (LIGHTS.has(x.to) || PERSONAL.has(x.to)),
  )) {
    add(
      acc,
      "growth.jupiter-soft",
      0.1,
      `Jupiter ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      x.from === "saturn" && FLOW.has(x.id) && PERSONAL.has(x.to),
  )) {
    add(
      acc,
      "growth.saturn-soft",
      0.08,
      `Saturn ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  for (const o of overlays) {
    if (
      o.body === "jupiter" &&
      (o.house === 1 || o.house === 5 || o.house === 9 || o.house === 11)
    ) {
      add(
        acc,
        "growth.jupiter-house",
        0.09,
        `Jupiter in partner house ${o.house}`,
        { from: "jupiter", house: o.house },
      );
    }
  }

  for (const h of hitsWhere(
    aspects,
    (x) =>
      (x.from === "rahu" || x.from === "ketu") &&
      FLOW.has(x.id) &&
      PERSONAL.has(x.to),
  )) {
    add(
      acc,
      "growth.node-soft",
      0.07,
      `${xLabel(h.from)} ${h.id} ${h.to}`,
      { from: h.from, to: h.to, aspect: h.id },
    );
  }

  return acc;
}

function finalize(
  id: BondDomainId,
  acc: DomainAccum,
): DomainScore {
  return {
    id,
    value: clamp01(acc.value),
    reasons: acc.reasons,
  };
}

function pickDominant(
  domains: Record<BondDomainId, DomainScore>,
): BondDomainId {
  let best: BondDomainId = BOND_DOMAINS[0]!;
  let bestVal = -1;
  for (const id of BOND_DOMAINS) {
    const v = domains[id].value;
    if (v > bestVal) {
      bestVal = v;
      best = id;
    }
  }
  return best;
}

/**
 * Compute synastry between two natal charts.
 * Domain scores are symmetric: `computeSynastry(a,b).domains` equals
 * `computeSynastry(b,a).domains` (aspects/overlays swap sides).
 */
export function computeSynastry(
  self: NatalChart,
  other: NatalChart,
): SynastryReport {
  const aspects = computeCrossAspects(self, other);
  const overlays = computeOverlays(self, other);

  const domains: Record<BondDomainId, DomainScore> = {
    talk: finalize("talk", scoreTalk(aspects, overlays)),
    care: finalize("care", scoreCare(aspects, overlays)),
    spark: finalize("spark", scoreSpark(aspects, overlays)),
    friction: finalize("friction", scoreFriction(aspects, overlays)),
    growth: finalize("growth", scoreGrowth(aspects, overlays)),
  };

  return {
    domains,
    dominant: pickDominant(domains),
    aspects,
    overlays,
  };
}

/** Payload shape for `synastry_cache.payload` (JSON-serializable). */
export type SynastryCachePayload = SynastryReport;

export function toSynastryCachePayload(report: SynastryReport): SynastryCachePayload {
  return report;
}
