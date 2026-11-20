/**
 * Locked billing identifiers — SCREENS §8 / PRD F14.
 */

export const PRIVATE_ENTITLEMENT_ID = "grahalens_private" as const;

export const PRODUCT_IDS = {
  monthly: "grahalens_private_monthly",
  yearly: "grahalens_private_yearly",
} as const;

export type IapMode = "mock" | "store";

/** `EXPO_PUBLIC_IAP_MODE=mock|store` — default mock for Cursor / CI. */
export function getIapMode(): IapMode {
  const raw = process.env.EXPO_PUBLIC_IAP_MODE?.trim().toLowerCase();
  return raw === "store" ? "store" : "mock";
}

export function isMockIap(): boolean {
  return getIapMode() === "mock";
}
