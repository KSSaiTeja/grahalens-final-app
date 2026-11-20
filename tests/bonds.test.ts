/**
 * Bonds free-tier gate + domain soft preview (Prompt 21).
 */
import { canAddBond, FREE_BOND_LIMIT } from "@/lib/bonds/api";
import {
  buildDomainDeepRead,
  softGateDomainRead,
} from "@/lib/bonds/domain-read";
import type { DomainScore } from "@/lib/bonds/synastry";

describe("canAddBond", () => {
  it("allows the first free bond", () => {
    expect(canAddBond(0, false)).toBe(true);
    expect(FREE_BOND_LIMIT).toBe(1);
  });

  it("gates the second bond for free users", () => {
    expect(canAddBond(1, false)).toBe(false);
    expect(canAddBond(2, false)).toBe(false);
  });

  it("allows unlimited when Private", () => {
    expect(canAddBond(1, true)).toBe(true);
    expect(canAddBond(9, true)).toBe(true);
  });
});

describe("softGateDomainRead", () => {
  const score: DomainScore = {
    id: "talk",
    value: 0.6,
    reasons: [
      {
        ruleId: "talk.mercury-soft",
        weight: 0.2,
        summary: "Mercury soft",
      },
      {
        ruleId: "talk.moon-mercury",
        weight: 0.15,
        summary: "Moon mercury",
      },
    ],
  };

  it("keeps lead + first reason free", () => {
    const read = buildDomainDeepRead(score, "Alex");
    const gated = softGateDomainRead(read, false);
    expect(gated.visible.length).toBe(2);
    expect(gated.visible[0]).toMatch(/Talk between you and Alex/);
    expect(gated.locked.length).toBe(1);
  });

  it("unlocks all paragraphs for Private", () => {
    const read = buildDomainDeepRead(score, "Alex");
    const gated = softGateDomainRead(read, true);
    expect(gated.locked).toEqual([]);
    expect(gated.visible.length).toBe(3);
  });
});
