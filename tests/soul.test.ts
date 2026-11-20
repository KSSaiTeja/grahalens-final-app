import fixture from "@/fixtures/chart-a.json";
import { groundAgainstChart } from "@/lib/ai/grounding";
import { soulPortraitFallback } from "@/lib/ai/fallbacks";
import { composeSoulCartography } from "@/lib/ai/soul-cartography";
import {
  extractSoulSignatures,
  findAtmakaraka,
  findStelliums,
  hashSignatures,
  signaturesSubsetOfChart,
  type SoulSignature,
} from "@/lib/ai/soul-signatures";
import {
  computeNatal,
  getPlacement,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { RASI_LABELS } from "@/lib/ephemeris/constants";

describe("soul-signatures / Chart A", () => {
  const input = fixture.input as NatalBirthInput;
  let natal: ReturnType<typeof computeNatal>;
  let report: ReturnType<typeof extractSoulSignatures>;

  beforeAll(() => {
    natal = computeNatal(input);
    report = extractSoulSignatures(natal);
  });

  it("extracts signatures whose evidence is ⊆ chart", () => {
    expect(report.signatures.length).toBeGreaterThanOrEqual(5);
    expect(signaturesSubsetOfChart(report.signatures, natal)).toBe(true);
  });

  it("rejects tampered evidence that invents a placement", () => {
    const moon = getPlacement(natal, "moon");
    const wrongSign = moon.sign === "aries" ? "taurus" : "aries";
    const forged: SoulSignature = {
      id: "forged",
      kind: "moon",
      label: "Forged",
      summary: `Moon in ${RASI_LABELS[wrongSign]}.`,
      evidence: [
        {
          body: "moon",
          sign: wrongSign,
          house: moon.house,
          nakshatra: moon.nakshatra.name,
        },
      ],
      weight: 1,
    };
    expect(signaturesSubsetOfChart([forged], natal)).toBe(false);
  });

  it("names Sun as atmakaraka for Chart A (highest degree-in-sign)", () => {
    const atma = findAtmakaraka(natal);
    expect(atma.id).toBe("sun");
    expect(atma.degreeInSign).toBeGreaterThan(28);
  });

  it("detects Cancer stellium (Sun, Venus, Jupiter, Ketu)", () => {
    const stelliums = findStelliums(natal);
    expect(stelliums.some((s) => s.sign === "cancer")).toBe(true);
    const cancer = stelliums.find((s) => s.sign === "cancer")!;
    expect(cancer.bodies.length).toBeGreaterThanOrEqual(3);
    // Whole-sign from Taurus Lagna → Cancer is house 3.
    expect(cancer.house).toBe(3);
  });

  it("includes lagna, moon, sun, node axis signatures", () => {
    const kinds = new Set(report.signatures.map((s) => s.kind));
    expect(kinds.has("lagna")).toBe(true);
    expect(kinds.has("moon")).toBe(true);
    expect(kinds.has("sun")).toBe(true);
    expect(kinds.has("node_axis")).toBe(true);
    expect(kinds.has("atmakaraka")).toBe(true);
  });

  it("grounds every signature summary against the natal chart", () => {
    for (const sig of report.signatures) {
      const g = groundAgainstChart(sig.summary, natal);
      expect(g.ok).toBe(true);
      expect(g.violations).toEqual([]);
    }
  });

  it("produces a stable grain hash", () => {
    const again = extractSoulSignatures(natal);
    expect(again.grainHash).toBe(report.grainHash);
    expect(report.grainHash).toMatch(/^[0-9a-f]{8}$/);
    expect(hashSignatures(["b", "a"])).toBe(hashSignatures(["a", "b"]));
  });
});

describe("soul-cartography", () => {
  const input = fixture.input as NatalBirthInput;
  let natal: ReturnType<typeof computeNatal>;

  beforeAll(() => {
    natal = computeNatal(input);
  });

  it("forceFallback yields grounded preview + prose from signatures", async () => {
    const portrait = await composeSoulCartography({
      natal,
      forceFallback: true,
    });
    expect(portrait.source).toBe("fallback");
    expect(portrait.grounded).toBe(true);
    expect(portrait.model).toBeNull();
    expect(signaturesSubsetOfChart(portrait.signatures, natal)).toBe(true);
    expect(portrait.grounding.ok).toBe(true);
    expect(groundAgainstChart(portrait.preview, natal).ok).toBe(true);
    expect(groundAgainstChart(portrait.prose, natal).ok).toBe(true);
    expect(portrait.preview).toMatch(/Private/);
    expect(portrait.prose.length).toBeGreaterThan(portrait.preview.length - 40);
  });

  it("withholds ungrounded LLM copy and ships L2 instead", async () => {
    const portrait = await composeSoulCartography({
      natal,
      client: {
        chat: {
          completions: {
            create: async () => ({
              choices: [
                {
                  message: {
                    content:
                      "Moon in Aries invents a rising that is not yours.",
                  },
                },
              ],
            }),
          },
        },
      },
    });
    expect(portrait.source).toBe("fallback");
    expect(portrait.grounded).toBe(true);
    expect(groundAgainstChart(portrait.prose, natal).ok).toBe(true);
    expect(portrait.prose).not.toMatch(/Moon in Aries/i);
  });

  it("ships grounded Groq prose when the stub stays inside the chart", async () => {
    const moon = getPlacement(natal, "moon");
    const line = `Moon in ${RASI_LABELS[moon.sign]} presses your ${moon.house}th. The lens stays quiet and precise.`;
    const portrait = await composeSoulCartography({
      natal,
      client: {
        chat: {
          completions: {
            create: async () => ({
              choices: [{ message: { content: line } }],
            }),
          },
        },
      },
    });
    expect(portrait.source).toBe("groq");
    expect(portrait.prose).toBe(line);
    expect(portrait.grounding.ok).toBe(true);
    expect(portrait.model).toBeTruthy();
  });

  it("soulPortraitFallback preview is shorter than full", () => {
    const { signatures } = extractSoulSignatures(natal);
    const preview = soulPortraitFallback({ signatures, previewOnly: true });
    const full = soulPortraitFallback({ signatures, previewOnly: false });
    expect(preview).toMatch(/Private/);
    expect(full.split(". ").length).toBeGreaterThanOrEqual(2);
    expect(groundAgainstChart(preview, natal).ok).toBe(true);
    expect(groundAgainstChart(full, natal).ok).toBe(true);
  });
});
