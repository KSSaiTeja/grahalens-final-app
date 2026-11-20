/**
 * Notification prefs — local AsyncStorage (SETUP §6 / Prompt 27).
 * Daily Sky schedule is owned by lib/settings/local-notifications.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const NOTIF_PREFS_STORAGE_KEY = "grahalens:notif_prefs:v1";

export type NotificationPrefsLocal = {
  dailySky: boolean;
  lensDigest: boolean;
  muhurtaAlerts: boolean;
  /** OS local-notification permission willing / last known granted. */
  pushEnabled: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefsLocal = {
  dailySky: true,
  lensDigest: false,
  muhurtaAlerts: false,
  pushEnabled: false,
};

export async function loadNotificationPrefs(): Promise<NotificationPrefsLocal> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
    const parsed = JSON.parse(raw) as Partial<NotificationPrefsLocal>;
    return {
      dailySky: parsed.dailySky ?? DEFAULT_NOTIFICATION_PREFS.dailySky,
      lensDigest: parsed.lensDigest ?? DEFAULT_NOTIFICATION_PREFS.lensDigest,
      muhurtaAlerts:
        parsed.muhurtaAlerts ?? DEFAULT_NOTIFICATION_PREFS.muhurtaAlerts,
      pushEnabled: parsed.pushEnabled ?? DEFAULT_NOTIFICATION_PREFS.pushEnabled,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export async function saveNotificationPrefs(
  patch: Partial<NotificationPrefsLocal>,
): Promise<NotificationPrefsLocal> {
  const current = await loadNotificationPrefs();
  const next: NotificationPrefsLocal = { ...current, ...patch };
  await AsyncStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearNotificationPrefs(): Promise<void> {
  await AsyncStorage.removeItem(NOTIF_PREFS_STORAGE_KEY);
}
