/**
 * Analytics — PRD §13 event names.
 * No backend in beta: track() is a safe no-op (optional __DEV__ log).
 * Never attach PII. Honor opt-out.
 */

export const ANALYTICS_EVENTS = [
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
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProps = Record<
  string,
  string | number | boolean | undefined
>;

let optedOut = false;

/** PRD §13 opt-out — Settings can flip this later; default tracks. */
export function setAnalyticsOptOut(value: boolean): void {
  optedOut = value;
}

export function isAnalyticsOptedOut(): boolean {
  return optedOut;
}

/**
 * Fire a named product event. Safe when no analytics SDK is configured.
 */
export function track(
  event: AnalyticsEvent,
  props?: AnalyticsProps,
): void {
  if (optedOut) return;
  const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
  if (!isTest && typeof __DEV__ !== "undefined" && __DEV__) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, props ?? {});
  }
}
