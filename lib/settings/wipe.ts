/**
 * X13 wipe — clear local observatory data + session flags.
 * Store subscriptions stay with Apple/Google until the user cancels there.
 */
import { localJournalStore } from "@/lib/atelier/local-store";
import { localChatStore } from "@/lib/ai/chat-local-store";
import { clearMockEntitlement } from "@/lib/billing/restore";
import { isMockIap } from "@/lib/billing/constants";
import { localUsageCounterStore } from "@/lib/billing/quota-local-store";
import { localBondStore } from "@/lib/bonds/local-store";
import { localMemoryStore } from "@/lib/memory/memory-local-store";
import {
  clearChartPayload,
  clearLocalSessionFlags,
  signOut,
} from "@/lib/session";
import { useChartStore } from "@/lib/store/chart";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useSessionStore } from "@/lib/store/session";
import { useLensStore } from "@/lib/store/lens";
import { clearLocalProfile } from "@/lib/settings/profile";
import { clearNotificationPrefs } from "@/lib/settings/notification-prefs";
import { cancelDailySkyReminder } from "@/lib/settings/local-notifications";
import { clearThemePreference } from "@/lib/settings/theme-pref";

export async function wipeLocalObservatory(): Promise<void> {
  await cancelDailySkyReminder();
  await Promise.all([
    localJournalStore.clearAll(),
    localBondStore.clearAll(),
    localMemoryStore.clearAll(),
    localUsageCounterStore.clearAll(),
    localChatStore.clearAll(),
    clearLocalProfile(),
    clearNotificationPrefs(),
    clearThemePreference(),
    clearChartPayload(),
    clearLocalSessionFlags(),
  ]);

  useChartStore.getState().clear();
  useOnboardingStore.getState().reset();
  useLensStore.setState({ activeThreadId: null, orbState: "idle" });
  // signOut keeps chart/welcome flags by design — force first-run again.
  useSessionStore.setState({
    mode: "anonymous",
    user: null,
    isGuest: false,
    hasChart: false,
    hasSeenWelcome: false,
    skippedWelcomePaywall: false,
  });

  if (isMockIap()) {
    try {
      await clearMockEntitlement();
    } catch {
      // Already empty is fine.
    }
  }

  await signOut();
}
