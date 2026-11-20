import fixture from "@/fixtures/chart-a.json";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import {
  OPENING_DRIFT_THRESHOLD,
  WEATHER_AXES,
  WEATHER_RULE_CATALOG,
  computeSkyWeather,
  shouldWeatherDrift,
} from "@/lib/sky/sky-weather";

/** Frozen clock — same as transit suite. */
const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");

describe("sky weather / Chart A", () => {
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
    const a = computeSkyWeather(natal);
    const b = computeSkyWeather(natal, FROZEN_AT);
    expect(a).toEqual(b);
    expect(a.at).toBe(FROZEN_AT.toISOString());
    // Civil date in Asia/Kolkata for 12:00Z is still 2026-07-29.
    expect(a.date).toBe("2026-07-29");
  });

  it("exposes four axes in [0, 1] with catalogued reasons", () => {
    const weather = computeSkyWeather(natal, FROZEN_AT);
    expect(Object.keys(weather.axes).sort()).toEqual([...WEATHER_AXES].sort());

    for (const id of WEATHER_AXES) {
      const axis = weather.axes[id];
      expect(axis.id).toBe(id);
      expect(axis.value).toBeGreaterThanOrEqual(0);
      expect(axis.value).toBeLessThanOrEqual(1);
      for (const reason of axis.reasons) {
        expect(WEATHER_RULE_CATALOG[reason.ruleId]).toBeDefined();
        expect(WEATHER_RULE_CATALOG[reason.ruleId]!.axis).toBe(id);
      }
    }

    expect(WEATHER_AXES).toContain(weather.dominant);
    expect(weather.axes[weather.dominant].value).toBe(
      Math.max(...WEATHER_AXES.map((id) => weather.axes[id].value)),
    );
  });

  it("weather-drift gate follows Opening threshold", () => {
    const weather = computeSkyWeather(natal, FROZEN_AT);
    expect(shouldWeatherDrift(weather)).toBe(
      weather.axes.opening.value > OPENING_DRIFT_THRESHOLD,
    );
    expect(shouldWeatherDrift(weather)).toBe(false);
  });

  it("locks golden axis values at frozen clock", () => {
    const weather = computeSkyWeather(natal, FROZEN_AT);
    // Prompt 07 golden — Chart A + 2026-07-29T12:00:00Z sky
    // (whole-sign houses from Taurus Lagna).
    expect(weather.axes.clarity.value).toBeCloseTo(0.46, 3);
    expect(weather.axes.pressure.value).toBeCloseTo(0.22, 3);
    expect(weather.axes.friction.value).toBeCloseTo(0.32, 3);
    expect(weather.axes.opening.value).toBeCloseTo(0.32, 3);
    expect(weather.dominant).toBe("clarity");
  });
});
