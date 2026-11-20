import chartA from "@/fixtures/chart-a.json";
import {
  draftToNatalInput,
  runOnboardingCompute,
  type BirthDraft,
} from "@/lib/onboarding/run-compute";
import { useChartStore } from "@/lib/store/chart";
import { getPlacement } from "@/lib/ephemeris/types";

describe("onboarding compute (Prompt 11)", () => {
  const draft: BirthDraft = {
    date: "1990-08-15",
    time: "14:30",
    timeUnknown: false,
    place: {
      label: "Hyderabad, India",
      lat: chartA.input.lat,
      lng: chartA.input.lng,
      tz: chartA.input.tz,
    },
  };

  beforeEach(() => {
    useChartStore.getState().clear();
  });

  it("maps draft to NatalBirthInput", () => {
    const input = draftToNatalInput(draft);
    expect(input.tz).toBe("Asia/Kolkata");
    expect(input.timeUnknown).toBe(false);
    expect(input.lat).toBe(17.385);
    // 14:30 IST = 09:00 UTC
    expect(input.birthAt).toBe("1990-08-15T09:00:00.000Z");
  });

  it("runs resolve → natal → dasha → weather and fills chart store payload", async () => {
    const stages: string[] = [];
    const { birth, natal } = await runOnboardingCompute(
      draft,
      ({ stage, done }) => {
        if (done) stages.push(stage);
      },
    );

    expect(stages).toEqual(["resolve", "natal", "dasha", "weather"]);
    expect(natal.placements).toHaveLength(10);
    expect(getPlacement(natal, "sun").longitude).toBeGreaterThan(0);
    expect(natal.lagnaApproximate).toBe(false);

    useChartStore.getState().setComputed(birth, natal);
    const stored = useChartStore.getState();
    expect(stored.birth?.date).toBe("1990-08-15");
    expect(stored.birth?.placeLabel).toContain("Hyderabad");
    expect(stored.natal?.placements).toHaveLength(10);
  });

  it("marks lagna approximate when time unknown", async () => {
    const { natal } = await runOnboardingCompute({
      ...draft,
      time: null,
      timeUnknown: true,
    });
    expect(natal.lagnaApproximate).toBe(true);
  });
});
