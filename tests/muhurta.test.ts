import fixture from "@/fixtures/chart-a.json";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { civilWeekday } from "@/lib/sky/civil";
import {
  HORA_LORDS,
  MUHURTA_KINDS,
  buildHoraSlots,
  computeMuhurtaMoments,
  getMuhurtaMoment,
} from "@/lib/sky/muhurta-moments";

/** Frozen clock — same as transit / sky-weather suite. */
const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");

describe("muhurta moments / Chart A", () => {
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

  it("defaults to frozen system time and is deterministic", () => {
    const a = computeMuhurtaMoments(natal);
    const b = computeMuhurtaMoments(natal, FROZEN_AT);
    expect(a).toEqual(b);
    expect(a.at).toBe(FROZEN_AT.toISOString());
    expect(a.date).toBe("2026-07-29");
  });

  it("keeps every moment inside the civil day", () => {
    const day = computeMuhurtaMoments(natal, FROZEN_AT);
    const startMs = new Date(day.dayStart).getTime();
    const endMs = new Date(day.dayEnd).getTime();
    expect(endMs).toBeGreaterThan(startMs);

    expect(day.moments.length).toBeGreaterThan(0);
    expect(day.moments.length).toBeLessThanOrEqual(4);

    for (const m of day.moments) {
      const s = new Date(m.startAt).getTime();
      const e = new Date(m.endAt).getTime();
      expect(s).toBeGreaterThanOrEqual(startMs);
      expect(e).toBeLessThanOrEqual(endMs);
      expect(e).toBeGreaterThan(s);
      expect(MUHURTA_KINDS).toContain(m.kind);
      expect(HORA_LORDS).toContain(m.lord);
      expect(m.score).toBeGreaterThanOrEqual(0.5);
      expect(m.score).toBeLessThanOrEqual(1);
      expect(m.presses.length).toBeGreaterThan(0);
      expect(m.id).toContain(day.date);
      expect(m.id).toContain(m.kind);
      expect(getMuhurtaMoment(day, m.id)).toEqual(m);
    }

    for (let i = 1; i < day.moments.length; i++) {
      expect(day.moments[i]!.startAt >= day.moments[i - 1]!.startAt).toBe(
        true,
      );
    }
  });

  it("builds 24 hora slots; Wednesday starts on Mercury", () => {
    const day = computeMuhurtaMoments(natal, FROZEN_AT);
    const sunrise = new Date(day.sunrise);
    const sunset = new Date(day.sunset);
    // Next sunrise from the live compute path (approx +1 civil day search already done)
    const nextSunrise = new Date(sunrise.getTime() + 24 * 3600 * 1000);
    const weekday = civilWeekday(sunrise, natal.tz);
    expect(weekday).toBe(3); // Wed 2026-07-29
    const slots = buildHoraSlots(sunrise, sunset, nextSunrise, weekday);
    expect(slots).toHaveLength(24);
    expect(slots[0]!.lord).toBe("mercury");
  });

  it("locks golden moments at frozen clock", () => {
    const day = computeMuhurtaMoments(natal, FROZEN_AT);
    const snap = day.moments.map((m) => ({
      kind: m.kind,
      lord: m.lord,
      score: m.score,
      startAt: m.startAt,
      endAt: m.endAt,
      press: m.presses[0]!.summary,
    }));
    expect(snap).toEqual([
      {
        kind: "care",
        lord: "venus",
        score: 0.52,
        startAt: "2026-07-29T06:52:28.509Z",
        endAt: "2026-07-29T07:57:08.905Z",
        press: "Venus presses your 4th",
      },
    ]);
  });
});
