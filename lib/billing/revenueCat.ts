/**
 * RevenueCat adapter — only active when EXPO_PUBLIC_IAP_MODE=store.
 * Mock mode must not call the stores (SETUP.md §5).
 */

import { Platform } from "react-native";
import type {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

import type { PlanId } from "@/lib/billing/catalog";
import { PRIVATE_PLANS } from "@/lib/billing/catalog";
import { getIapMode, PRIVATE_ENTITLEMENT_ID } from "@/lib/billing/constants";
import { productIdToPlanId } from "@/lib/billing/mockStore";
import type {
  BillingPackage,
  BillingStoreKind,
  CustomerInfoLike,
  EntitlementSnapshot,
  OfferingsResult,
} from "@/lib/billing/types";
import { EMPTY_ENTITLEMENT } from "@/lib/billing/types";

type PurchasesModule = typeof import("react-native-purchases").default;

let configured = false;
let purchases: PurchasesModule | null = null;

async function loadPurchases(): Promise<PurchasesModule> {
  if (purchases) return purchases;
  const mod = await import("react-native-purchases");
  purchases = mod.default;
  return purchases;
}

function apiKeyForPlatform(): string | null {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.trim() || null;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.trim() || null;
  }
  return null;
}

function storeKind(): BillingStoreKind {
  if (Platform.OS === "ios") return "app_store";
  if (Platform.OS === "android") return "play_store";
  return "unknown";
}

export function customerInfoToLike(info: CustomerInfo): CustomerInfoLike {
  const active: CustomerInfoLike["entitlements"]["active"] = {};
  for (const [id, ent] of Object.entries(info.entitlements.active)) {
    active[id] = {
      isActive: ent.isActive,
      identifier: ent.identifier,
      productIdentifier: ent.productIdentifier,
      expirationDate: ent.expirationDate,
      willRenew: ent.willRenew,
      billingIssueDetectedAt: ent.billingIssueDetectedAt,
    };
  }
  return {
    entitlements: { active },
    originalAppUserId: info.originalAppUserId,
  };
}

export function snapshotFromCustomerInfo(
  info: CustomerInfoLike,
  phase: EntitlementSnapshot["phase"] = "ready",
): EntitlementSnapshot {
  const ent = info.entitlements.active[PRIVATE_ENTITLEMENT_ID];
  const isPrivate = Boolean(ent?.isActive);
  const productId = ent?.productIdentifier ?? null;
  return {
    hydrated: true,
    isPrivate,
    privateUntil: ent?.expirationDate ?? null,
    productId,
    planId: productId ? productIdToPlanId(productId) : null,
    willRenew: ent?.willRenew ?? false,
    billingIssue: Boolean(ent?.billingIssueDetectedAt),
    store: getIapMode() === "mock" ? "mock" : storeKind(),
    appUserId: info.originalAppUserId ?? null,
    phase: ent?.billingIssueDetectedAt ? "billing_issue" : phase,
    lastError: null,
  };
}

export async function configureRevenueCat(
  appUserId?: string | null,
): Promise<boolean> {
  if (getIapMode() !== "store") return false;
  const apiKey = apiKeyForPlatform();
  if (!apiKey) {
    console.warn(
      "[billing] EXPO_PUBLIC_IAP_MODE=store but RevenueCat API key missing",
    );
    return false;
  }
  const Purchases = await loadPurchases();
  if (!configured) {
    Purchases.configure({
      apiKey,
      appUserID: appUserId ?? undefined,
    });
    configured = true;
  } else if (appUserId) {
    await Purchases.logIn(appUserId);
  }
  return true;
}

export function addCustomerInfoListener(
  listener: (info: CustomerInfo) => void,
): () => void {
  if (getIapMode() !== "store" || !configured) {
    return () => undefined;
  }
  void loadPurchases().then((Purchases) => {
    Purchases.addCustomerInfoUpdateListener(listener);
  });
  return () => {
    void loadPurchases().then((Purchases) => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    });
  };
}

export async function getStoreCustomerInfo(): Promise<CustomerInfo> {
  const Purchases = await loadPurchases();
  return Purchases.getCustomerInfo();
}

export async function getStoreSnapshot(): Promise<EntitlementSnapshot> {
  if (getIapMode() !== "store" || !configured) {
    return { ...EMPTY_ENTITLEMENT, hydrated: true, phase: "ready" };
  }
  const info = await getStoreCustomerInfo();
  return snapshotFromCustomerInfo(customerInfoToLike(info));
}

function packagePlanId(pkg: PurchasesPackage): PlanId | null {
  const id = pkg.product.identifier;
  if (id.includes("monthly")) return "monthly";
  if (id.includes("yearly") || id.includes("annual")) return "yearly";
  const byCatalog = PRIVATE_PLANS.find((p) => p.productId === id);
  return byCatalog?.id ?? null;
}

export function mapOfferings(raw: PurchasesOfferings): OfferingsResult {
  const current = raw.current;
  if (!current || current.availablePackages.length === 0) {
    return { packages: [], unavailable: true };
  }

  const packages: BillingPackage[] = [];
  for (const pkg of current.availablePackages) {
    const planId = packagePlanId(pkg);
    if (!planId) continue;
    const catalog = PRIVATE_PLANS.find((p) => p.id === planId);
    packages.push({
      planId,
      productId: pkg.product.identifier,
      title: catalog?.title ?? pkg.product.title,
      priceLabel: pkg.product.priceString || catalog?.priceLabel || "",
      periodLabel: catalog?.periodLabel ?? "",
      badge: catalog?.badge,
      detail: catalog?.detail ?? pkg.product.description,
      nativePackage: pkg,
    });
  }

  return {
    packages,
    unavailable: packages.length === 0,
  };
}

export async function getStoreOfferings(): Promise<OfferingsResult> {
  if (getIapMode() !== "store" || !configured) {
    return { packages: [], unavailable: true };
  }
  try {
    const Purchases = await loadPurchases();
    const offerings = await Purchases.getOfferings();
    return mapOfferings(offerings);
  } catch {
    return { packages: [], unavailable: true };
  }
}

export async function purchaseStorePackage(
  nativePackage: unknown,
): Promise<CustomerInfo> {
  const Purchases = await loadPurchases();
  const result = await Purchases.purchasePackage(
    nativePackage as PurchasesPackage,
  );
  return result.customerInfo;
}

export async function restoreStorePurchases(): Promise<CustomerInfo> {
  const Purchases = await loadPurchases();
  return Purchases.restorePurchases();
}

export function isPurchasesConfigured(): boolean {
  return configured;
}

/** Test reset */
export function __resetRevenueCatForTests(): void {
  configured = false;
  purchases = null;
}
