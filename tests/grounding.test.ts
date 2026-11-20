import fixture from "@/fixtures/chart-a.json";
import {
  collectPlacementFacts,
  extractPlacementClaims,
  groundAgainstChart,
  groundText,
} from "@/lib/ai/grounding";
import { skyNoteFallback, quietLensFallback } from "@/lib/ai/fallbacks";
import { hasGroqKey, chatCompletion } from "@/lib/ai/groq";
import { narrateSky } from "@/lib/ai/narrate-sky";
import {
  computeNatal,
  getPlacement,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import { computeDasha, currentDasha } from "@/lib/ephemeris/dasha";
import { computeTransits } from "@/lib/ephemeris/transits";
import { computeSkyWeather } from "@/lib/sky/sky-weather";

/** Frozen clock — same as sky / transit suite. */
const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");

describe("grounding / placement claims", () => {
  const input = fixture.input as NatalBirthInput;
  let natal: ReturnType<typeof computeNatal>;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FROZEN_AT);
    natal = computeNatal(input);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("extracts sign, house, and nakshatra claims", () => {
    const claims = extractPlacementClaims(
      "Moon in Taurus. Mars presses your 7th. Moon in Rohini.",
    );
    expect(claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "sign",
          body: "moon",
          value: "taurus",
        }),
        expect.objectContaining({
          kind: "house",
          body: "mars",
          value: 7,
        }),
        expect.objectContaining({
          kind: "nakshatra",
          body: "moon",
          value: "Rohini",
        }),
      ]),
    );
  });

  it("accepts narration that only cites real natal placements", () => {
    const moon = getPlacement(natal, "moon");
    const text = `Moon in ${RASI_LABELS[moon.sign]}. Moon presses your ${moon.house}th.`;
    const result = groundAgainstChart(text, natal);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.claims.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects an invented sign placement", () => {
    // Chart A Moon is Taurus — claiming Aries is invention.
    const result = groundAgainstChart("Moon in Aries softens the day.", natal);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.kind === "sign")).toBe(true);
    expect(
      result.violations.some(
        (v) => v.body === "moon" && v.asserted === "aries",
      ),
    ).toBe(true);
  });

  it("rejects an invented house claim", () => {
    const moon = getPlacement(natal, "moon");
    const wrongHouse = moon.house === 12 ? 1 : moon.house + 1;
    const result = groundAgainstChart(
      `Moon presses your ${wrongHouse}th without cause.`,
      natal,
    );
    expect(result.ok).toBe(false);
    expect(
      result.violations.some(
        (v) => v.kind === "house" && v.asserted === wrongHouse,
      ),
    ).toBe(true);
  });

  it("rejects an invented nakshatra claim", () => {
    const result = groundAgainstChart("Moon in Ashwini opens the gate.", natal);
    expect(result.ok).toBe(false);
    expect(
      result.violations.some(
        (v) => v.kind === "nakshatra" && v.asserted === "Ashwini",
      ),
    ).toBe(true);
  });

  it("allows transit house cites that natal alone would reject", () => {
    const transit = computeTransits(natal, FROZEN_AT);
    const mars = transit.placements.find((p) => p.id === "mars")!;
    const natalMars = getPlacement(natal, "mars");
    // Pick a transit house that differs from natal when possible.
    const text = `Mars presses your ${mars.house}th today.`;
    const natalOnly = groundAgainstChart(text, natal);
    const withTransit = groundAgainstChart(text, natal, transit);

    if (mars.house !== natalMars.house) {
      expect(natalOnly.ok).toBe(false);
      expect(withTransit.ok).toBe(true);
    } else {
      expect(withTransit.ok).toBe(true);
    }
  });

  it("passes prose with no placement claims", () => {
    const result = groundAgainstChart(
      "Clarity runs high; friction gathers around conversations after dusk.",
      natal,
    );
    expect(result.ok).toBe(true);
    expect(result.claims).toEqual([]);
  });
});

describe("fallbacks + narrateSky (no key → fallback)", () => {
  const input = fixture.input as NatalBirthInput;
  let natal: ReturnType<typeof computeNatal>;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FROZEN_AT);
    natal = computeNatal(input);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("skyNoteFallback cites only grounded moon placements", () => {
    const weather = computeSkyWeather(natal, FROZEN_AT);
    const dasha = currentDasha(computeDasha(natal), FROZEN_AT);
    const text = skyNoteFallback({ weather, natal, dasha });
    const transit = computeTransits(natal, FROZEN_AT);
    const facts = collectPlacementFacts(natal, transit);
    const grounded = groundText(text, facts);
    expect(grounded.ok).toBe(true);
    expect(text.length).toBeGreaterThan(20);
    expect(quietLensFallback()).toMatch(/quieter mode/i);
    expect(quietLensFallback({ dasha })).toMatch(
      new RegExp(dasha.maha.lord, "i"),
    );
  });

  it("chatCompletion returns null without a key", async () => {
    const prev = process.env.GROQ_API_KEY;
    const prevPublic = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
    expect(hasGroqKey()).toBe(false);
    await expect(
      chatCompletion({
        messages: [{ role: "user", content: "hi" }],
      }),
    ).resolves.toBeNull();
    if (prev !== undefined) process.env.GROQ_API_KEY = prev;
    if (prevPublic !== undefined) process.env.EXPO_PUBLIC_GROQ_API_KEY = prevPublic;
  });

  it("narrateSky without key returns grounded fallback", async () => {
    const prev = process.env.GROQ_API_KEY;
    const prevPublic = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

    const weather = computeSkyWeather(natal, FROZEN_AT);
    const result = await narrateSky({
      natal,
      weather,
      at: FROZEN_AT,
      forceFallback: true,
    });

    expect(result.source).toBe("fallback");
    expect(result.grounded).toBe(true);
    expect(result.grounding.ok).toBe(true);
    expect(result.text.length).toBeGreaterThan(20);

    if (prev !== undefined) process.env.GROQ_API_KEY = prev;
    else delete process.env.GROQ_API_KEY;
    if (prevPublic !== undefined) process.env.EXPO_PUBLIC_GROQ_API_KEY = prevPublic;
    else delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
  });

  it("narrateSky withholds invented LLM placements", async () => {
    const weather = computeSkyWeather(natal, FROZEN_AT);
    const fakeClient = {
      chat: {
        completions: {
          async create() {
            return {
              choices: [
                {
                  message: {
                    content:
                      "Mars in Pisces invents a storm; Moon in Capricorn too.",
                  },
                },
              ],
            };
          },
        },
      },
    };

    const result = await narrateSky({
      natal,
      weather,
      at: FROZEN_AT,
      client: fakeClient,
    });

    expect(result.source).toBe("fallback");
    expect(result.grounding.ok).toBe(true);
    expect(result.text).not.toMatch(/Mars in Pisces/i);
  });
});
