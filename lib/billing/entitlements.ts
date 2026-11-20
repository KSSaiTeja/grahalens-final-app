/**
 * Entitlement helpers — single source of truth for Free vs Private (PRD F13).
 * `useEntitlement()` / `requirePrivate(feature)` / `isPrivate`.
 */

import { useShallow } from "zustand/react/shallow";

import { PRIVATE_ENTITLEMENT_ID } from "@/lib/billing/constants";
import type {
  CustomerInfoLike,
  EntitlementSnapshot,
  PaywallReason,
  RequirePrivateResult,
} from "@/lib/billing/types";
import { useEntitlementStore } from "@/lib/store/entitlement";

export { PRIVATE_ENTITLEMENT_ID };

/** Active `grahalens_private` from CustomerInfo-like payload. */
export function isPrivateFromInfo(info: CustomerInfoLike | null | undefined): boolean {
  if (!info) return false;
  const ent = info.entitlements.active[PRIVATE_ENTITLEMENT_ID];
  return Boolean(ent?.isActive);
}

/**
 * Current Private status from Zustand snapshot (hydrated by BillingProvider).
 * Prefer this in UI; pass `fromInfo` when evaluating a fresh CustomerInfo.
 */
export function isPrivate(fromInfo?: CustomerInfoLike | null): boolean {
  if (fromInfo !== undefined) return isPrivateFromInfo(fromInfo);
  return useEntitlementStore.getState().isPrivate;
}

/**
 * Gate a Private feature. Does not navigate — caller routes on `href`.
 * Prompt 25 wires every SOFT/GATE through this helper.
 */
export function requirePrivate(feature: PaywallReason): RequirePrivateResult {
  if (isPrivate()) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: feature,
    href: `/paywall/sheet?reason=${feature}`,
  };
}

/**
 * Hook — entitlement snapshot for components (PLAN §2).
 * useShallow required: object selectors must be referentially stable.
 */
export function useEntitlement(): EntitlementSnapshot {
  return useEntitlementStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      isPrivate: s.isPrivate,
      privateUntil: s.privateUntil,
      productId: s.productId,
      planId: s.planId,
      willRenew: s.willRenew,
      billingIssue: s.billingIssue,
      store: s.store,
      appUserId: s.appUserId,
      phase: s.phase,
      lastError: s.lastError,
    })),
  );
}

export function useIsPrivate(): boolean {
  return useEntitlementStore((s) => s.isPrivate);
}

export function useBillingIssue(): boolean {
  return useEntitlementStore((s) => s.billingIssue || s.phase === "billing_issue");
}
