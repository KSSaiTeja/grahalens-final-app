/**
 * Auth actions — magic link via Supabase when configured; guest via local SQLite.
 */
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  setBoolMeta,
  loadLocalSessionFlags,
} from "@/lib/session/local-db";
import { useSessionStore } from "@/lib/store/session";

export function getAuthCallbackUrl(): string {
  return Linking.createURL("auth/callback");
}

export function sessionUserFromSupabase(session: Session): {
  id: string;
  email: string | null;
} {
  return {
    id: session.user.id,
    email: session.user.email ?? null,
  };
}

/** Persist guest flag and update Zustand. */
export async function continueAsGuest(): Promise<void> {
  await setBoolMeta("is_guest", true);
  await setBoolMeta("has_seen_welcome", true);
  useSessionStore.getState().setGuest();
  useSessionStore.getState().setHasSeenWelcome(true);
}

export async function markWelcomeSeen(): Promise<void> {
  await setBoolMeta("has_seen_welcome", true);
  useSessionStore.getState().setHasSeenWelcome(true);
}

/** After chart compute — Prompt 11+. */
export async function markChartComputed(hasChart = true): Promise<void> {
  await setBoolMeta("has_chart", hasChart);
  useSessionStore.getState().setHasChart(hasChart);
}

/** Soft welcome paywall Skip once — Prompt 12. */
export async function markWelcomePaywallSkipped(
  skipped = true,
): Promise<void> {
  await setBoolMeta("skipped_welcome_paywall", skipped);
  useSessionStore.getState().setSkippedWelcomePaywall(skipped);
}

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid_email" | "error"; message: string };

export async function sendMagicLink(email: string): Promise<MagicLinkResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return {
      ok: false,
      reason: "invalid_email",
      message: "Enter a valid email address.",
    };
  }
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "Cloud auth needs Supabase keys. Use Continue as guest, or set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (see docs/SETUP.md).",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }
  return { ok: true };
}

/**
 * Dev-only local bypass when Supabase keys are set but email delivery is awkward.
 * Does not invent a cloud session — marks guest observatory so routing works.
 * Documented in SETUP; never ship as a production password bypass.
 */
export async function devBypassAsGuest(): Promise<void> {
  if (!__DEV__) {
    throw new Error("devBypassAsGuest is development-only");
  }
  await continueAsGuest();
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  await setBoolMeta("is_guest", false);
  useSessionStore.getState().clearSession();
  const flags = await loadLocalSessionFlags();
  useSessionStore.getState().setFromLocal(flags);
}

export function appleAuthAvailable(): boolean {
  // Keys / native capability — gated; UI shows when Expo Apple auth can run
  return process.env.EXPO_PUBLIC_APPLE_AUTH === "1";
}

export function googleAuthAvailable(): boolean {
  return process.env.EXPO_PUBLIC_GOOGLE_AUTH === "1";
}
