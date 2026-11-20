/**
 * Post-splash / post-auth destination rules:
 *   anonymous → welcome
 *   guest|authenticated + no chart → onboarding
 *   chart + soft paywall not skipped → /paywall/welcome
 *   chart + skipped → sky
 */
import type { Href } from "expo-router";

import type { SessionMode } from "@/lib/store/session";

export type RouteDecisionInput = {
  mode: SessionMode;
  hasChart: boolean;
  hasSeenWelcome: boolean;
  skippedWelcomePaywall?: boolean;
  /** Active grahalens_private — soft welcome paywall is not shown again. */
  isPrivate?: boolean;
};

export type AppDestination =
  | "/(auth)/welcome"
  | "/onboarding/date"
  | "/paywall/welcome"
  | "/(app)/sky";

export function decidePostSplashRoute(
  input: RouteDecisionInput,
): AppDestination {
  if (input.mode === "anonymous") {
    return "/(auth)/welcome";
  }
  if (!input.hasChart) {
    return "/onboarding/date";
  }
  // Skip-once OR already Private → observatory (no soft paywall trap).
  if (input.skippedWelcomePaywall || input.isPrivate) {
    return "/(app)/sky";
  }
  return "/paywall/welcome";
}

/** Href-typed wrapper for Expo Router navigation. */
export function hrefForDestination(dest: AppDestination): Href {
  return dest as Href;
}
