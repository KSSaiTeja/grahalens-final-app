/**
 * Soul signatures — deterministic heuristics from natal only (PLAN §1 step 7).
 * Computation before narration: every signature's evidence must ⊆ chart.
 */

import {
  GRAHA_IDS,
  RASI_LABELS,
  type GrahaId,
  type NakshatraName,
  type RasiId,
} from "@/lib/ephemeris/constants";
import {
  getPlacement,
  type BodyPlacement,
  type NatalChart,
} from "@/lib/ephemeris/types";

/** Classical Jaimini chara karaka set (excludes nodes). */
const KARAKA_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const satisfies readonly GrahaId[];

export const SOUL_SIGNATURE_KINDS = [
  "lagna",
  "moon",
  "sun",
  "atmakaraka",
  "stellium",
  "house_focus",
  "node_axis",
  "retrograde",
] as const;

export type SoulSignatureKind = (typeof SOUL_SIGNATURE_KINDS)[number];

/** One placement fact a signature is allowed to assert. */
export type SignatureEvidence = {
  body: GrahaId | "lagna";
  sign: RasiId;
  house: number;
  nakshatra: NakshatraName;
};

export type SoulSignature = {
  /** Stable id, e.g. `lagna`, `stellium:cancer`, `house:9`. */
  id: string;
  kind: SoulSignatureKind;
  /** Short observatory title. */
  label: string;
  /** One grounded line — placement cites must match evidence. */
  summary: string;
  /** Placements this signature was computed from. */
  evidence: SignatureEvidence[];
  /** Relative emphasis for portrait / grain (higher = louder). */
  weight: number;
};

export type SoulSignatureReport = {
  signatures: SoulSignature[];
  /** FNV-1a hex of sorted signature ids — grain field seed (BRAND §10). */
  grainHash: string;
};

function evidenceFrom(p: BodyPlacement): SignatureEvidence {
  return {
    body: p.id,
    sign: p.sign,
    house: p.house,
    nakshatra: p.nakshatra.name,
  };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function ordinalHouse(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function grahasOnly(chart: NatalChart): BodyPlacement[] {
  return chart.placements.filter((p) => p.id !== "lagna");
}

/** Atmakaraka = highest degree-in-sign among classical 7 (Jaimini). */
export function findAtmakaraka(chart: NatalChart): BodyPlacement {
  let best = getPlacement(chart, KARAKA_BODIES[0]);
  for (const id of KARAKA_BODIES) {
    const p = getPlacement(chart, id);
    if (p.degreeInSign > best.degreeInSign) best = p;
  }
  return best;
}

/**
 * Signs with ≥3 grahas (lagna excluded). Nodes count toward stellium.
 */
export function findStelliums(
  chart: NatalChart,
): Array<{ sign: RasiId; house: number; bodies: BodyPlacement[] }> {
  const bySign = new Map<RasiId, BodyPlacement[]>();
  for (const p of grahasOnly(chart)) {
    const list = bySign.get(p.sign) ?? [];
    list.push(p);
    bySign.set(p.sign, list);
  }
  const out: Array<{ sign: RasiId; house: number; bodies: BodyPlacement[] }> =
    [];
  for (const [sign, bodies] of bySign) {
    if (bodies.length < 3) continue;
    // Whole-sign: all same sign → same house.
    out.push({ sign, house: bodies[0]!.house, bodies });
  }
  return out.sort((a, b) => b.bodies.length - a.bodies.length);
}

/** House with the most grahas (ties → lower house number). */
export function findHouseFocus(chart: NatalChart): {
  house: number;
  bodies: BodyPlacement[];
} {
  const byHouse = new Map<number, BodyPlacement[]>();
  for (const p of grahasOnly(chart)) {
    const list = byHouse.get(p.house) ?? [];
    list.push(p);
    byHouse.set(p.house, list);
  }
  let bestHouse = 1;
  let best: BodyPlacement[] = [];
  for (let h = 1; h <= 12; h++) {
    const bodies = byHouse.get(h) ?? [];
    if (bodies.length > best.length) {
      best = bodies;
      bestHouse = h;
    }
  }
  return { house: bestHouse, bodies: best };
}

/** FNV-1a 32-bit → 8 hex chars (deterministic grain seed). */
export function hashSignatures(ids: readonly string[]): string {
  let h = 0x811c9dc5;
  const joined = [...ids].sort().join("|");
  for (let i = 0; i < joined.length; i++) {
    h ^= joined.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * True when every evidence row matches the natal placement exactly.
 * Acceptance: Soul signatures ⊆ chart (PRD §12 / TESTING row 8).
 */
export function signaturesSubsetOfChart(
  signatures: readonly SoulSignature[],
  chart: NatalChart,
): boolean {
  for (const sig of signatures) {
    if (sig.evidence.length === 0) return false;
    for (const ev of sig.evidence) {
      const p = chart.placements.find((x) => x.id === ev.body);
      if (!p) return false;
      if (p.sign !== ev.sign) return false;
      if (p.house !== ev.house) return false;
      if (p.nakshatra.name !== ev.nakshatra) return false;
    }
  }
  return true;
}

/**
 * Extract ordered soul signatures from a natal chart.
 * Always includes lagna / moon / sun / atmakaraka / node axis;
 * adds stellium, house focus, retrograde when thresholds hit.
 */
export function extractSoulSignatures(chart: NatalChart): SoulSignatureReport {
  const signatures: SoulSignature[] = [];

  const lagna = getPlacement(chart, "lagna");
  signatures.push({
    id: "lagna",
    kind: "lagna",
    label: "Rising lens",
    summary: `Lagna in ${RASI_LABELS[lagna.sign]}, ${lagna.nakshatra.name} — the frame you meet the sky through.`,
    evidence: [evidenceFrom(lagna)],
    weight: 1,
  });

  const moon = getPlacement(chart, "moon");
  signatures.push({
    id: "moon",
    kind: "moon",
    label: "Mind weather",
    summary: `Moon in ${RASI_LABELS[moon.sign]} presses your ${ordinalHouse(moon.house)}; ${moon.nakshatra.name} sets the inner tempo.`,
    evidence: [evidenceFrom(moon)],
    weight: 1,
  });

  const sun = getPlacement(chart, "sun");
  signatures.push({
    id: "sun",
    kind: "sun",
    label: "Core light",
    summary: `Sun in ${RASI_LABELS[sun.sign]} in the ${ordinalHouse(sun.house)} — the steady flame of will.`,
    evidence: [evidenceFrom(sun)],
    weight: 0.9,
  });

  const atma = findAtmakaraka(chart);
  signatures.push({
    id: `atmakaraka:${atma.id}`,
    kind: "atmakaraka",
    label: "Atmakaraka",
    summary: `${capitalize(atma.id)} as atmakaraka in ${RASI_LABELS[atma.sign]}, house ${atma.house} — the soul's loudest degree.`,
    evidence: [evidenceFrom(atma)],
    weight: 1.1,
  });

  for (const st of findStelliums(chart)) {
    const names = st.bodies.map((b) => capitalize(b.id)).join(", ");
    signatures.push({
      id: `stellium:${st.sign}`,
      kind: "stellium",
      label: `${RASI_LABELS[st.sign]} cluster`,
      summary: `${st.bodies.length} grahas gather in ${RASI_LABELS[st.sign]} (house ${st.house}): ${names}.`,
      evidence: st.bodies.map(evidenceFrom),
      weight: 0.7 + st.bodies.length * 0.1,
    });
  }

  const focus = findHouseFocus(chart);
  if (focus.bodies.length >= 2) {
    const names = focus.bodies.map((b) => capitalize(b.id)).join(", ");
    signatures.push({
      id: `house:${focus.house}`,
      kind: "house_focus",
      label: `${ordinalHouse(focus.house)} house focus`,
      summary: `House ${focus.house} holds ${focus.bodies.length} grahas (${names}) — a life theme that keeps returning.`,
      evidence: focus.bodies.map(evidenceFrom),
      weight: 0.6 + focus.bodies.length * 0.08,
    });
  }

  const rahu = getPlacement(chart, "rahu");
  const ketu = getPlacement(chart, "ketu");
  signatures.push({
    id: "node_axis",
    kind: "node_axis",
    label: "Node axis",
    summary: `Rahu in ${RASI_LABELS[rahu.sign]} (house ${rahu.house}); Ketu in ${RASI_LABELS[ketu.sign]} (house ${ketu.house}) — the growth / release axis.`,
    evidence: [evidenceFrom(rahu), evidenceFrom(ketu)],
    weight: 0.85,
  });

  const rx = grahasOnly(chart).filter(
    (p) => p.retrograde && p.id !== "rahu" && p.id !== "ketu",
  );
  if (rx.length >= 1) {
    const names = rx.map((b) => capitalize(b.id)).join(", ");
    signatures.push({
      id: "retrograde",
      kind: "retrograde",
      label: "Retrograde thread",
      summary:
        rx.length === 1
          ? `${names} retrograde in ${RASI_LABELS[rx[0]!.sign]} — revision over rush.`
          : `${names} retrograde — revision over rush in more than one thread.`,
      evidence: rx.map(evidenceFrom),
      weight: 0.5 + rx.length * 0.1,
    });
  }

  // Stable order: weight desc, then id.
  signatures.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.id.localeCompare(b.id);
  });

  return {
    signatures,
    grainHash: hashSignatures(signatures.map((s) => s.id)),
  };
}

/** Bodies available for signature evidence (exported for tests). */
export const SIGNATURE_BODIES = [...GRAHA_IDS, "lagna"] as const;
