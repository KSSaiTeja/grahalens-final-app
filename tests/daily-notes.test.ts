/**
 * Inbox S5 — today’s sky note + muhurta, prior days sky-only (no spam).
 */

import fixture from "@/fixtures/chart-a.json";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { buildInboxNotes, notesForDay } from "@/lib/sky/daily-notes";

const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");
const TODAY = "2026-07-29";

describe("daily-notes inbox", () => {
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

  it("notesForDay includes one sky + muhurta entries", () => {
    const notes = notesForDay(natal, TODAY, 3);
    expect(notes[0]?.kind).toBe("sky");
    expect(notes[0]?.date).toBe(TODAY);
    expect(notes.some((n) => n.kind === "muhurta")).toBe(true);
    expect(notes.filter((n) => n.kind === "muhurta").length).toBeLessThanOrEqual(
      3,
    );
  });

  it("buildInboxNotes keeps muhurta only for today", () => {
    const notes = buildInboxNotes(natal, [
      TODAY,
      "2026-07-28",
      "2026-07-27",
    ]);
    const todayMuhurta = notes.filter(
      (n) => n.date === TODAY && n.kind === "muhurta",
    );
    const olderMuhurta = notes.filter(
      (n) => n.date !== TODAY && n.kind === "muhurta",
    );
    expect(todayMuhurta.length).toBeGreaterThan(0);
    expect(olderMuhurta).toHaveLength(0);
    expect(notes.filter((n) => n.kind === "sky").length).toBe(3);
  });
});
