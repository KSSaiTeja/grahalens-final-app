/**
 * Prompt 30 — error catalog + analytics + screen inventory gates.
 */

import {
  ANALYTICS_EVENTS,
  isAnalyticsOptedOut,
  setAnalyticsOptOut,
  track,
} from "@/lib/analytics";
import {
  ERROR_CATALOG,
  errorCopy,
  type ErrorCatalogId,
} from "@/lib/errors/catalog";
import {
  pendingScreenCount,
  SCREEN_INVENTORY,
} from "@/lib/dev/screens-inventory";
import { quietLensFallback } from "@/lib/ai/fallbacks";
import {
  OFFLINE_BANNER_BODY,
  OFFLINE_COMPOSER_PLACEHOLDER,
} from "@/lib/network/online";

describe("Prompt 30 hardening", () => {
  afterEach(() => {
    setAnalyticsOptOut(false);
  });

  it("ZT14: SCREEN_INVENTORY has zero pending and includes G1–G8", () => {
    expect(pendingScreenCount()).toBe(0);
    expect(SCREEN_INVENTORY.every((s) => s.status === "built")).toBe(true);
    for (const id of ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"]) {
      expect(SCREEN_INVENTORY.some((s) => s.id === id)).toBe(true);
    }
  });

  it("error catalog covers PRD §11 ids and matches quieter / offline copy", () => {
    const ids = Object.keys(ERROR_CATALOG) as ErrorCatalogId[];
    expect(ids).toEqual(
      expect.arrayContaining([
        "time_unknown",
        "llm_down",
        "offline",
        "store_down",
        "billing_issue",
        "compute_fail",
        "not_found",
      ]),
    );
    expect(quietLensFallback()).toBe(errorCopy("llm_down").body);
    expect(OFFLINE_BANNER_BODY).toBe(errorCopy("offline").body);
    expect(OFFLINE_COMPOSER_PLACEHOLDER).toBe(
      errorCopy("offline_composer").body,
    );
  });

  it("analytics.track is a no-op with PRD §13 event names + opt-out", () => {
    expect(ANALYTICS_EVENTS).toEqual(
      expect.arrayContaining([
        "onboarding_completed",
        "chart_computed",
        "lens_message_sent",
        "lens_quota_hit",
        "bond_created",
        "bond_gate_hit",
        "journal_saved",
        "paywall_viewed",
        "purchase_started",
        "purchase_success",
        "purchase_cancelled",
        "purchase_failed",
        "restore_success",
      ]),
    );
    expect(() => track("paywall_viewed", { surface: "test" })).not.toThrow();
    setAnalyticsOptOut(true);
    expect(isAnalyticsOptedOut()).toBe(true);
    expect(() => track("purchase_success")).not.toThrow();
  });
});
