/**
 * Archive helpers — FREE_ARCHIVE_DAYS gate (PRD F13 / S4).
 */

import {
  FREE_ARCHIVE_DAYS,
  isArchiveDateUnlocked,
  listArchiveDates,
  shiftCivilDate,
} from "@/lib/sky/archive";

describe("sky archive window", () => {
  const today = "2026-07-29";

  it("lists today first then older", () => {
    expect(listArchiveDates(today, 3)).toEqual([
      "2026-07-29",
      "2026-07-28",
      "2026-07-27",
    ]);
  });

  it("unlocks exactly FREE_ARCHIVE_DAYS for free users", () => {
    for (let i = 0; i < FREE_ARCHIVE_DAYS; i++) {
      const d = shiftCivilDate(today, -i);
      expect(isArchiveDateUnlocked(d, today, false)).toBe(true);
    }
    const older = shiftCivilDate(today, -FREE_ARCHIVE_DAYS);
    expect(isArchiveDateUnlocked(older, today, false)).toBe(false);
  });

  it("unlocks all when private", () => {
    const older = shiftCivilDate(today, -40);
    expect(isArchiveDateUnlocked(older, today, true)).toBe(true);
  });
});
