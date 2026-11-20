/**
 * Soul Cartography — signatures first, then narrate (PLAN §1 step 7).
 * Groq when available; ungrounded LLM copy withheld; no key → L2 templates.
 */

import {
  chatCompletion,
  GROQ_MODEL_DEFAULT,
  type GroqChatClient,
} from "@/lib/ai/groq";
import {
  collectPlacementFacts,
  groundText,
  type GroundingResult,
} from "@/lib/ai/grounding";
import { soulPortraitFallback } from "@/lib/ai/fallbacks";
import {
  extractSoulSignatures,
  signaturesSubsetOfChart,
  type SoulSignature,
  type SoulSignatureReport,
} from "@/lib/ai/soul-signatures";
import type { NatalChart } from "@/lib/ephemeris/types";

export type SoulCartographySource = "groq" | "fallback";

export type SoulCartography = {
  signatures: SoulSignature[];
  grainHash: string;
  /** Free-tier blurb (always available). */
  preview: string;
  /** Full portrait prose (Private UI; still computed for storage). */
  prose: string;
  source: SoulCartographySource;
  /** Always true for returned text — ungrounded copy is never shipped. */
  grounded: true;
  grounding: GroundingResult;
  /** Model id when Groq succeeded; null on fallback. */
  model: string | null;
};

export type SoulCartographyOptions = {
  natal: NatalChart;
  /** Injected Groq stub for tests. */
  client?: GroqChatClient;
  /** Skip live Groq even if key present (force L2). */
  forceFallback?: boolean;
  /**
   * Precomputed signatures (tests / callers that already extracted).
   * Must still ⊆ natal — validated before use.
   */
  signatures?: SoulSignatureReport;
};

const SYSTEM_PROMPT = [
  "You are Lens, Grahalens' observatory voice (BRAND-BOOK §05).",
  "Write a Soul Cartography portrait: 3–5 short sentences. Calm, precise, adult.",
  "Never snark, guru, fear, emoji, or medical/legal/financial advice.",
  "Vocabulary: clarity, pressure, friction, opening, ribbon, window, lens, grain.",
  "STRICT: You may only cite graha placements listed under ALLOWED PLACEMENTS.",
  "Do not invent signs, houses, or nakshatras. Build only from SIGNATURES.",
  "Return plain text only — no JSON, no markdown fences, no titles.",
].join("\n");

function signaturesBlock(signatures: readonly SoulSignature[]): string {
  return signatures
    .map(
      (s) =>
        `- [${s.kind}] ${s.label} (weight ${s.weight.toFixed(2)}): ${s.summary}`,
    )
    .join("\n");
}

function factsBlock(
  facts: ReturnType<typeof collectPlacementFacts>,
): string {
  return facts
    .map(
      (f) =>
        `- natal ${f.body}: ${f.sign}, house ${f.house}, ${f.nakshatra}`,
    )
    .join("\n");
}

function resolveSignatures(
  natal: NatalChart,
  injected?: SoulSignatureReport,
): SoulSignatureReport {
  const report = injected ?? extractSoulSignatures(natal);
  if (!signaturesSubsetOfChart(report.signatures, natal)) {
    throw new Error("Soul signatures are not a subset of the natal chart");
  }
  return report;
}

/**
 * Build Soul Cartography: heuristics → optional Groq → ground → ship.
 */
export async function composeSoulCartography(
  options: SoulCartographyOptions,
): Promise<SoulCartography> {
  const report = resolveSignatures(options.natal, options.signatures);
  const { signatures, grainHash } = report;
  const facts = collectPlacementFacts(options.natal);

  const preview = soulPortraitFallback({
    signatures,
    previewOnly: true,
  });
  const fallbackProse = soulPortraitFallback({
    signatures,
    previewOnly: false,
  });

  const previewGround = groundText(preview, facts);
  const fallbackGround = groundText(fallbackProse, facts);
  if (!previewGround.ok || !fallbackGround.ok) {
    // Templates must always ground — strip to label-only if somehow broken.
    const safe = signatures
      .slice(0, 2)
      .map((s) => s.label)
      .join(". ");
    return {
      signatures,
      grainHash,
      preview: safe,
      prose: safe,
      source: "fallback",
      grounded: true,
      grounding: groundText(safe, facts),
      model: null,
    };
  }

  if (options.forceFallback) {
    return {
      signatures,
      grainHash,
      preview,
      prose: fallbackProse,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
      model: null,
    };
  }

  const userPrompt = [
    "SIGNATURES (computed; do not invent beyond these):",
    signaturesBlock(signatures),
    "",
    "ALLOWED PLACEMENTS (natal only):",
    factsBlock(facts),
    "",
    "Write the Soul Cartography portrait now.",
  ].join("\n");

  const llm = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    client: options.client,
    model: GROQ_MODEL_DEFAULT,
    temperature: 0.4,
    maxTokens: 320,
  });

  if (!llm) {
    return {
      signatures,
      grainHash,
      preview,
      prose: fallbackProse,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
      model: null,
    };
  }

  const grounding = groundText(llm, facts);
  if (!grounding.ok) {
    return {
      signatures,
      grainHash,
      preview,
      prose: fallbackProse,
      source: "fallback",
      grounded: true,
      grounding: fallbackGround,
      model: null,
    };
  }

  return {
    signatures,
    grainHash,
    preview,
    prose: llm,
    source: "groq",
    grounded: true,
    grounding,
    model: GROQ_MODEL_DEFAULT,
  };
}
