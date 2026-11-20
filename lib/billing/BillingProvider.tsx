/**
 * Hydrates entitlement from mock SecureStore or RevenueCat CustomerInfo.
 * Reacts to CustomerInfo updates in store mode.
 */

import React, { useEffect } from "react";
import type { CustomerInfo } from "react-native-purchases";

import { getIapMode } from "@/lib/billing/constants";
import { getMockStore } from "@/lib/billing/mockStore";
import {
  addCustomerInfoListener,
  configureRevenueCat,
  customerInfoToLike,
  getStoreSnapshot,
  snapshotFromCustomerInfo,
} from "@/lib/billing/revenueCat";
import { syncPrivateUntil } from "@/lib/billing/sync-profile";
import { useEntitlementStore } from "@/lib/store/entitlement";
import { useSessionStore } from "@/lib/store/session";

type Props = {
  children: React.ReactNode;
};

async function hydrateMock(appUserId: string | null): Promise<void> {
  const mock = getMockStore();
  if (appUserId) await mock.setAppUserId(appUserId);
  const snapshot = await mock.getSnapshot();
  useEntitlementStore.getState().applySnapshot(snapshot);
  void syncPrivateUntil(snapshot);
}

async function hydrateStore(appUserId: string | null): Promise<void> {
  const ok = await configureRevenueCat(appUserId);
  if (!ok) {
    useEntitlementStore.getState().applySnapshot({
      hydrated: true,
      isPrivate: false,
      phase: "failed",
      lastError: "RevenueCat not configured",
    });
    return;
  }
  const snapshot = await getStoreSnapshot();
  useEntitlementStore.getState().applySnapshot(snapshot);
  void syncPrivateUntil(snapshot);
}

/**
 * Mount under SessionProvider. Keeps Zustand entitlement snapshot in sync
 * with mock SecureStore or RevenueCat CustomerInfo listeners.
 */
export function BillingProvider({ children }: Props) {
  const mode = useSessionStore((s) => s.mode);
  const userId = useSessionStore((s) => s.user?.id ?? null);
  const sessionHydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (!sessionHydrated) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    const appUserId =
      mode === "authenticated" && userId ? userId : `guest:${userId ?? "local"}`;

    (async () => {
      try {
        if (getIapMode() === "mock") {
          await hydrateMock(appUserId);
        } else {
          await hydrateStore(
            mode === "authenticated" && userId ? userId : null,
          );
          if (cancelled) return;
          removeListener = addCustomerInfoListener((info: CustomerInfo) => {
            const snapshot = snapshotFromCustomerInfo(customerInfoToLike(info));
            useEntitlementStore.getState().applySnapshot(snapshot);
            void syncPrivateUntil(snapshot);
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Billing hydrate failed";
        useEntitlementStore.getState().applySnapshot({
          hydrated: true,
          isPrivate: false,
          phase: "failed",
          lastError: message,
        });
      }
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [sessionHydrated, mode, userId]);

  return <>{children}</>;
}
