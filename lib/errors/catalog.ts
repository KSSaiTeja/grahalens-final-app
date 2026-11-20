/**
 * Error / empty-state catalog — PRD §11 + BRAND §11 ladders.
 * Single source of user-facing copy for failure modes.
 */

export type ErrorCatalogId =
  | "time_unknown"
  | "geocode_fail"
  | "llm_down"
  | "offline"
  | "offline_composer"
  | "grounding_fail"
  | "store_down"
  | "purchase_cancelled"
  | "billing_issue"
  | "compute_fail"
  | "not_found";

export type ErrorCatalogEntry = {
  id: ErrorCatalogId;
  /** Short label for banners / titles when shown. */
  title: string;
  /** User-facing body. */
  body: string;
  /** BRAND §11 ladder level when applicable. */
  ladder?: "L1" | "L2" | "L3" | "L4";
};

export const ERROR_CATALOG: Record<ErrorCatalogId, ErrorCatalogEntry> = {
  time_unknown: {
    id: "time_unknown",
    title: "Time unknown",
    body: "Lagna is approximate — computed from local noon. Degrees for grahas still hold.",
  },
  geocode_fail: {
    id: "geocode_fail",
    title: "Place lookup",
    body: "Choose a city from the offline list or enter latitude and longitude manually.",
  },
  llm_down: {
    id: "llm_down",
    title: "Quieter mode",
    body: "I'm on quieter mode — I can still read your chart and dasha, just without longer conversation.",
    ladder: "L2",
  },
  offline: {
    id: "offline",
    title: "Offline",
    body: "Offline — cached chart, weather, and journal stay available. Lens can’t send until you’re back.",
    ladder: "L3",
  },
  offline_composer: {
    id: "offline_composer",
    title: "Offline",
    body: "Offline — Lens can’t send until you’re back",
    ladder: "L3",
  },
  grounding_fail: {
    id: "grounding_fail",
    title: "Grounding",
    body: "That reading didn’t pass placement checks — withheld rather than shown.",
  },
  store_down: {
    id: "store_down",
    title: "Store unavailable",
    body: "Subscription purchases require an active connection to the App Store or Google Play. Please check your connection and try again.",
  },
  purchase_cancelled: {
    id: "purchase_cancelled",
    title: "Purchase cancelled",
    body: "No charge was made. You can return anytime — nothing else changed.",
  },
  billing_issue: {
    id: "billing_issue",
    title: "Billing hold",
    body: "Your Private subscription needs attention in the store. Access stays open during grace — tap to review.",
  },
  compute_fail: {
    id: "compute_fail",
    title: "Compute failed",
    body: "The observatory couldn’t finish this chart. Try again — we never invent planets.",
    ladder: "L4",
  },
  not_found: {
    id: "not_found",
    title: "Not found",
    body: "That route isn’t on the map. Return to the sky and pick a live screen.",
  },
};

export function errorCopy(id: ErrorCatalogId): ErrorCatalogEntry {
  return ERROR_CATALOG[id];
}
