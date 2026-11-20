/**
 * Local notifications — daily Sky reminder only (Prompt 27).
 * No remote push tokens; permission denial stays honest; one schedule max.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const DAILY_SKY_NOTIF_ID = "grahalens-daily-sky";
export const DAILY_SKY_CHANNEL_ID = "daily-sky";
/** Quiet morning local cue — not a spam cadence. */
export const DAILY_SKY_HOUR = 8;
export const DAILY_SKY_MINUTE = 0;

export type NotifPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "unavailable";

export type DailySkySyncResult =
  | { ok: true; scheduled: boolean }
  | { ok: false; reason: "denied" | "unavailable" };

let handlerConfigured = false;

/** Foreground presentation — banner/list only, no sound or badge spam. */
export function configureNotificationHandler(): void {
  if (handlerConfigured) return;
  if (Platform.OS === "web") return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

export async function getNotificationPermissionStatus(): Promise<NotifPermissionStatus> {
  if (Platform.OS === "web") return "unavailable";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "unavailable";
  }
}

export async function requestNotificationPermission(): Promise<NotifPermissionStatus> {
  if (Platform.OS === "web") return "unavailable";
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return "granted";
    const asked = await Notifications.requestPermissionsAsync();
    if (asked.status === "granted") return "granted";
    if (asked.status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "unavailable";
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DAILY_SKY_CHANNEL_ID, {
    name: "Daily Sky",
    importance: Notifications.AndroidImportance.DEFAULT,
    enableVibrate: false,
  });
}

export async function cancelDailySkyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_SKY_NOTIF_ID);
  } catch {
    // Already absent is fine.
  }
}

/**
 * Schedule at most one repeating daily local notification.
 * Cancels any prior daily-sky id first (no stack / no spam).
 */
export async function scheduleDailySkyReminder(): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("Local notifications unavailable on web");
  }
  configureNotificationHandler();
  await ensureAndroidChannel();
  await cancelDailySkyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SKY_NOTIF_ID,
    content: {
      title: "Today’s sky",
      body: "Weather and muhurta are ready in the observatory.",
      data: { url: "/(app)/sky/inbox" },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_SKY_HOUR,
      minute: DAILY_SKY_MINUTE,
      channelId: Platform.OS === "android" ? DAILY_SKY_CHANNEL_ID : undefined,
    },
  });
}

/**
 * Align OS schedule with prefs. Requests permission when enabling.
 * On denial / unavailable: cancels schedule and returns ok:false.
 */
export async function syncDailySkySchedule(
  wantDailySky: boolean,
  options?: { requestIfNeeded?: boolean },
): Promise<DailySkySyncResult> {
  const requestIfNeeded = options?.requestIfNeeded !== false;

  if (!wantDailySky) {
    await cancelDailySkyReminder();
    return { ok: true, scheduled: false };
  }

  const status = requestIfNeeded
    ? await requestNotificationPermission()
    : await getNotificationPermissionStatus();

  if (status === "unavailable") {
    await cancelDailySkyReminder();
    return { ok: false, reason: "unavailable" };
  }
  if (status !== "granted") {
    await cancelDailySkyReminder();
    return { ok: false, reason: "denied" };
  }

  try {
    await scheduleDailySkyReminder();
    return { ok: true, scheduled: true };
  } catch {
    await cancelDailySkyReminder();
    return { ok: false, reason: "unavailable" };
  }
}
