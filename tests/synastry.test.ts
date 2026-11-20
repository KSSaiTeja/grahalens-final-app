import chartA from "@/fixtures/chart-a.json";
import chartB from "@/fixtures/chart-b.json";
import {
  BOND_DOMAINS,
  DOMAIN_RULE_CATALOG,
  computeCrossAspects,
  computeOverlays,
  computeSynastry,
  toSynastryCachePayload,
} from "@/lib/bonds/synastry";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";

describe("synastry / Chart A × Chart B", () => {
  const self = computeNatal(chartA.input as NatalBirthInput);
  const other = computeNatal(chartB.input as NatalBirthInput);

  it("exposes five domains in [0, 1] with catalogued reasons", () => {
    const report = computeSynastry(self, other);
    expect(Object.keys(report.domains).sort()).toEqual(
      [...BOND_DOMAINS].sort(),
    );

    for (const id of BOND_DOMAINS) {
      const domain = report.domains[id];
      expect(domain.id).toBe(id);
      expect(domain.value).toBeGreaterThanOrEqual(0);
      expect(domain.value).toBeLessThanOrEqual(1);
      for (const reason of domain.reasons) {
        expect(DOMAIN_RULE_CATALOG[reason.ruleId]).toBeDefined();
        expect(DOMAIN_RULE_CATALOG[reason.ruleId]!.domain).toBe(id);
      }
    }

    expect(BOND_DOMAINS).toContain(report.dominant);
    expect(report.domains[report.dominant].value).toBe(
      Math.max(...BOND_DOMAINS.map((id) => report.domains[id].value)),
    );
  });

  it("is deterministic and domain-symmetric under chart swap", () => {
    const a = computeSynastry(self, other);
    const b = computeSynastry(self, other);
    expect(a).toEqual(b);

    const swapped = computeSynastry(other, self);
    for (const id of BOND_DOMAINS) {
      expect(swapped.domains[id].value).toBe(a.domains[id].value);
    }
    expect(swapped.dominant).toBe(a.dominant);
  });

  it("builds cross-aspects and whole-sign overlays for constellation", () => {
    const aspects = computeCrossAspects(self, other);
    const overlays = computeOverlays(self, other);
    const report = computeSynastry(self, other);

    expect(aspects.length).toBeGreaterThan(0);
    expect(report.aspects).toEqual(aspects);
    // 10 bodies × 2 hosts
    expect(overlays).toHaveLength(20);
    expect(report.overlays).toEqual(overlays);
    for (const o of overlays) {
      expect(o.house).toBeGreaterThanOrEqual(1);
      expect(o.house).toBeLessThanOrEqual(12);
    }
  });

  it("locks golden domain values for Chart A × Chart B", () => {
    const report = computeSynastry(self, other);
    // Prompt 20 golden — stable bond domain scores (PRD §12 #7).
    expect(report.domains.talk.value).toBeCloseTo(0.72, 3);
    expect(report.domains.care.value).toBeCloseTo(0.34, 3);
    expect(report.domains.spark.value).toBeCloseTo(0.51, 3);
    expect(report.domains.friction.value).toBeCloseTo(0.4, 3);
    expect(report.domains.growth.value).toBeCloseTo(0.86, 3);
    expect(report.dominant).toBe("growth");
  });

  it("serializes a cache payload without inventing fields", () => {
    const report = computeSynastry(self, other);
    const payload = toSynastryCachePayload(report);
    expect(payload).toEqual(report);
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("matches Chart B fixture longitudes within tolerance", () => {
    const tol = chartB.toleranceDegrees as number;
    for (const [id, lon] of Object.entries(chartB.expected.placements)) {
      const p = other.placements.find((x) => x.id === id);
      expect(p).toBeDefined();
      const delta = Math.abs(p!.longitude - (lon as number));
      const wrap = Math.min(delta, 360 - delta);
      expect(wrap).toBeLessThanOrEqual(tol);
    }
  });
});
