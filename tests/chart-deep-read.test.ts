import chartA from "@/fixtures/chart-a.json";
import {
  buildDashaDeepRead,
  findDashaPeriod,
  softGateParagraphs,
} from "@/lib/chart/deep-read";
import { computeDasha } from "@/lib/ephemeris/dasha";
import { computeNatal, type NatalBirthInput } from "@/lib/ephemeris/natal";

describe("chart deep reads", () => {
  const natal = computeNatal(chartA.input as NatalBirthInput);
  const timeline = computeDasha(natal, 1);

  it("resolves both maha and antar route keys", () => {
    const maha = timeline.periods.find((period) => period.level === "maha")!;
    const antar = timeline.periods.find((period) => period.level === "antar")!;

    expect(findDashaPeriod(timeline, maha.key)).toEqual(maha);
    expect(findDashaPeriod(timeline, encodeURIComponent(antar.key))).toEqual(
      antar,
    );
    expect(findDashaPeriod(timeline, "not-a-period")).toBeNull();
  });

  it("builds grounded paragraphs from the selected period and natal chart", () => {
    const period = timeline.periods.find(
      (candidate) => candidate.level === "antar",
    )!;
    const read = buildDashaDeepRead(period, natal);

    expect(read.title).toContain("Antardasha");
    expect(read.paragraphs).toHaveLength(3);
    expect(read.paragraphs[0]).toContain("window");
    expect(read.paragraphs[1]).toContain("natal chart");
  });

  it("shows one paragraph to free users and all paragraphs to Private", () => {
    const paragraphs = ["free", "private one", "private two"];

    expect(softGateParagraphs(paragraphs, false)).toEqual({
      visible: ["free"],
      locked: ["private one", "private two"],
    });
    expect(softGateParagraphs(paragraphs, true)).toEqual({
      visible: paragraphs,
      locked: [],
    });
  });
});
