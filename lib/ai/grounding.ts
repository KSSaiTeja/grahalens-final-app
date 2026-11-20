/**
 * Placement grounding — zero-tolerance (PLAN §4 rule 3, PRD KR4).
 * Pure TypeScript: reject narrations that invent graha/sign/house/nakshatra
 * facts not present in natal or transit evidence.
 */

import {
  GRAHA_IDS,
  NAKSHATRA_NAMES,
  RASI_IDS,
  RASI_LABELS,
  type GrahaId,
  type NakshatraName,
  type RasiId,
} from "@/lib/ephemeris/constants";
import type { BodyPlacement, NatalChart } from "@/lib/ephemeris/types";
import type { TransitReport, TransitPlacement } from "@/lib/ephemeris/transits";

export type PlacementRole = "natal" | "transit";

/** One allowed placement fact the narrator may cite. */
export type PlacementFact = {
  body: GrahaId | "lagna";
  role: PlacementRole;
  sign: RasiId;
  house: number;
  nakshatra: NakshatraName;
};

export type PlacementClaimKind = "sign" | "house" | "nakshatra";

export type PlacementClaim = {
  kind: PlacementClaimKind;
  body: GrahaId | "lagna";
  /** Sign id, house 1–12, or nakshatra name. */
  value: RasiId | NakshatraName | number;
  /** Matched span for diagnostics. */
  raw: string;
};

export type GroundingViolation = {
  kind: PlacementClaimKind;
  claim: string;
  body: GrahaId | "lagna";
  asserted: string | number;
  /** Closest allowed values for that body (any role). */
  allowed: Array<string | number>;
};

export type GroundingResult = {
  ok: boolean;
  claims: PlacementClaim[];
  violations: GroundingViolation[];
};

const BODY_LABELS: Record<GrahaId | "lagna", string[]> = {
  sun: ["sun"],
  moon: ["moon"],
  mercury: ["mercury"],
  venus: ["venus"],
  mars: ["mars"],
  jupiter: ["jupiter"],
  saturn: ["saturn"],
  rahu: ["rahu", "north node"],
  ketu: ["ketu", "south node"],
  lagna: ["lagna", "ascendant", "rising"],
};

const BODY_BY_ALIAS = new Map<string, GrahaId | "lagna">();
for (const [id, aliases] of Object.entries(BODY_LABELS) as Array<
  [GrahaId | "lagna", string[]]
>) {
  for (const a of aliases) BODY_BY_ALIAS.set(a.toLowerCase(), id);
}

const SIGN_BY_ALIAS = new Map<string, RasiId>();
for (const id of RASI_IDS) {
  SIGN_BY_ALIAS.set(id, id);
  SIGN_BY_ALIAS.set(RASI_LABELS[id].toLowerCase(), id);
}

const NAK_BY_ALIAS = new Map<string, NakshatraName>();
for (const name of NAKSHATRA_NAMES) {
  NAK_BY_ALIAS.set(name.toLowerCase(), name);
  // Tolerate missing spaces / diacritics-free forms already in constants.
  NAK_BY_ALIAS.set(name.toLowerCase().replace(/\s+/g, ""), name);
}

const BODY_ALT = [...BODY_BY_ALIAS.keys()]
  .sort((a, b) => b.length - a.length)
  .map(escapeRe)
  .join("|");

const SIGN_ALT = [...SIGN_BY_ALIAS.keys()]
  .sort((a, b) => b.length - a.length)
  .map(escapeRe)
  .join("|");

const NAK_ALT = [...NAK_BY_ALIAS.keys()]
  .sort((a, b) => b.length - a.length)
  .map(escapeRe)
  .join("|");

/** `{body} … in {nakshatra}` — checked before signs. */
const NAK_CLAIM_RE = new RegExp(
  `\\b(${BODY_ALT})\\b(?:\\s+(?:is|sits|moves|travels))?\\s+in\\s+(${NAK_ALT})\\b`,
  "gi",
);

/** `{body} … in {sign}` */
const SIGN_CLAIM_RE = new RegExp(
  `\\b(${BODY_ALT})\\b(?:\\s+(?:is|sits|moves|travels))?\\s+in\\s+(${SIGN_ALT})\\b`,
  "gi",
);

/**
 * `{body} presses/in your Nth` or `{body} in the Nth` / `house N`.
 * Brand sample: “Mars presses your 7th” / “Venus presses your 3rd”.
 */
const HOUSE_CLAIM_RE = new RegExp(
  `\\b(${BODY_ALT})\\b\\s+(?:presses|pressing|hits|hitting|to|in)\\s+(?:your\\s+|the\\s+)?(?:house\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\b`,
  "gi",
);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseBody(raw: string): GrahaId | "lagna" | null {
  return BODY_BY_ALIAS.get(raw.toLowerCase()) ?? null;
}

function factFromPlacement(
  p: BodyPlacement | TransitPlacement,
  role: PlacementRole,
): PlacementFact {
  return {
    body: p.id as GrahaId | "lagna",
    role,
    sign: p.sign,
    house: p.house,
    nakshatra: p.nakshatra.name,
  };
}

/** Natal + optional transit placements → allowed facts. */
export function collectPlacementFacts(
  natal: NatalChart,
  transit?: TransitReport | null,
): PlacementFact[] {
  const facts: PlacementFact[] = natal.placements.map((p) =>
    factFromPlacement(p, "natal"),
  );
  if (transit) {
    for (const p of transit.placements) {
      facts.push(factFromPlacement(p, "transit"));
    }
  }
  return facts;
}

/** Extract placement claims from free text (for tests / diagnostics). */
export function extractPlacementClaims(text: string): PlacementClaim[] {
  const claims: PlacementClaim[] = [];
  const seen = new Set<string>();
  const covered: Array<{ start: number; end: number }> = [];

  const push = (claim: PlacementClaim, start: number, end: number) => {
    const key = `${claim.kind}:${claim.body}:${String(claim.value)}`;
    if (seen.has(key)) return;
    seen.add(key);
    covered.push({ start, end });
    claims.push(claim);
  };

  const overlaps = (start: number, end: number) =>
    covered.some((r) => start < r.end && end > r.start);

  // Nakshatra before sign so "Moon in Rohini" is not misread as a sign.
  NAK_CLAIM_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NAK_CLAIM_RE.exec(text)) !== null) {
    const body = parseBody(m[1]!);
    const nak = NAK_BY_ALIAS.get(m[2]!.toLowerCase().replace(/\s+/g, " "));
    if (!body || !nak) continue;
    const start = m.index;
    const end = start + m[0]!.length;
    push({ kind: "nakshatra", body, value: nak, raw: m[0]! }, start, end);
  }

  SIGN_CLAIM_RE.lastIndex = 0;
  while ((m = SIGN_CLAIM_RE.exec(text)) !== null) {
    const body = parseBody(m[1]!);
    const sign = SIGN_BY_ALIAS.get(m[2]!.toLowerCase());
    if (!body || !sign) continue;
    const start = m.index;
    const end = start + m[0]!.length;
    if (overlaps(start, end)) continue;
    push({ kind: "sign", body, value: sign, raw: m[0]! }, start, end);
  }

  HOUSE_CLAIM_RE.lastIndex = 0;
  while ((m = HOUSE_CLAIM_RE.exec(text)) !== null) {
    const body = parseBody(m[1]!);
    const house = Number.parseInt(m[2]!, 10);
    if (!body || !Number.isFinite(house) || house < 1 || house > 12) continue;
    const start = m.index;
    const end = start + m[0]!.length;
    if (overlaps(start, end)) continue;
    push({ kind: "house", body, value: house, raw: m[0]! }, start, end);
  }

  return claims;
}

function allowedFor(
  facts: readonly PlacementFact[],
  body: GrahaId | "lagna",
  kind: PlacementClaimKind,
): Array<string | number> {
  const vals = new Set<string | number>();
  for (const f of facts) {
    if (f.body !== body) continue;
    if (kind === "sign") vals.add(f.sign);
    else if (kind === "house") vals.add(f.house);
    else vals.add(f.nakshatra);
  }
  return [...vals];
}

function claimMatches(
  claim: PlacementClaim,
  facts: readonly PlacementFact[],
): boolean {
  for (const f of facts) {
    if (f.body !== claim.body) continue;
    if (claim.kind === "sign" && f.sign === claim.value) return true;
    if (claim.kind === "house" && f.house === claim.value) return true;
    if (claim.kind === "nakshatra" && f.nakshatra === claim.value) return true;
  }
  return false;
}

/**
 * Ground free text against allowed placement facts.
 * Text with no placement claims passes (pure weather prose is fine).
 */
export function groundText(
  text: string,
  facts: readonly PlacementFact[],
): GroundingResult {
  const claims = extractPlacementClaims(text);
  const violations: GroundingViolation[] = [];

  for (const claim of claims) {
    if (claimMatches(claim, facts)) continue;
    violations.push({
      kind: claim.kind,
      claim: claim.raw,
      body: claim.body,
      asserted: claim.value,
      allowed: allowedFor(facts, claim.body, claim.kind),
    });
  }

  return {
    ok: violations.length === 0,
    claims,
    violations,
  };
}

/** Convenience: ground against natal (+ optional transit report). */
export function groundAgainstChart(
  text: string,
  natal: NatalChart,
  transit?: TransitReport | null,
): GroundingResult {
  return groundText(text, collectPlacementFacts(natal, transit));
}

/** Bodies we know how to ground (exported for tests). */
export const GROUNDABLE_BODIES = [...GRAHA_IDS, "lagna"] as const;
