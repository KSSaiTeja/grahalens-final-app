/**
 * Billing domain types — SCREENS §8 purchase state machine + entitlement snapshot.
 */

import type { PlanId } from "@/lib/billing/catalog";
import { PRIVATE_ENTITLEMENT_ID } from "@/lib/billing/constants";

export { PRIVATE_ENTITLEMENT_ID };

/** Soft/hard gate reasons → `/paywall/sheet?reason=` */
export type PaywallReason =
  | "soul"
  | "patterns"
  | "archive"
  | "lens_quota"
  | "bond_limit"
  | "bond_domain"
  | "cosmic_profile"
  | "dasha_deep_read"
  | "export"
  | "welcome";

/**
 * SCREENS §8:
 * idle → loading_offerings → ready
 * ready → purchasing → success | failed | cancelled
 * ready → restoring → success | empty | failed
 * billing_issue (grace)
 */
export type PurchasePhase =
  | "idle"
  | "loading_offerings"
  | "ready"
  | "purchasing"
  | "restoring"
  | "success"
  | "failed"
  | "cancelled"
  | "empty"
  | "billing_issue";

export type BillingStoreKind = "mock" | "app_store" | "play_store" | "unknown";

/** Normalized entitlement — Zustand snapshot; RC CustomerInfo remains SoT in store mode. */
export type EntitlementSnapshot = {
  hydrated: boolean;
  isPrivate: boolean;
  privateUntil: string | null;
  productId: string | null;
  planId: PlanId | null;
  willRenew: boolean;
  billingIssue: boolean;
  store: BillingStoreKind;
  appUserId: string | null;
  phase: PurchasePhase;
  lastError: string | null;
};

export const EMPTY_ENTITLEMENT: EntitlementSnapshot = {
  hydrated: false,
  isPrivate: false,
  privateUntil: null,
  productId: null,
  planId: null,
  willRenew: false,
  billingIssue: false,
  store: "unknown",
  appUserId: null,
  phase: "idle",
  lastError: null,
};

/** Minimal CustomerInfo shape shared by mock + RevenueCat. */
export type CustomerInfoLike = {
  entitlements: {
    active: Record<
      string,
      {
        isActive: boolean;
        identifier: string;
        productIdentifier: string;
        expirationDate: string | null;
        willRenew: boolean;
        billingIssueDetectedAt: string | null;
      }
    >;
  };
  originalAppUserId?: string;
};

export type BillingPackage = {
  planId: PlanId;
  productId: string;
  title: string;
  priceLabel: string;
  periodLabel: string;
  badge?: string;
  detail: string;
  /** Opaque handle for store-mode purchasePackage; unused in mock. */
  nativePackage: unknown | null;
};

export type OfferingsResult = {
  packages: BillingPackage[];
  unavailable: boolean;
};

export type PurchaseResult =
  | { status: "success"; snapshot: EntitlementSnapshot }
  | { status: "cancelled" }
  | { status: "failed"; message: string };

export type RestoreResult =
  | { status: "success"; snapshot: EntitlementSnapshot }
  | { status: "empty" }
  | { status: "failed"; message: string };

export type RequirePrivateResult =
  | { allowed: true }
  | { allowed: false; reason: PaywallReason; href: `/paywall/sheet?reason=${PaywallReason}` };
