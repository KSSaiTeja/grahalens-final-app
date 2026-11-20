/**
 * Prompt 27 — daily Sky local schedule + honest denial.
 */

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => "grahalens-daily-sky"),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
  AndroidImportance: { DEFAULT: 3 },
}));

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import {
  DAILY_SKY_HOUR,
  DAILY_SKY_MINUTE,
  DAILY_SKY_NOTIF_ID,
  cancelDailySkyReminder,
  syncDailySkySchedule,
} from "@/lib/settings/local-notifications";

const getPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
const requestPermissionsAsync =
  Notifications.requestPermissionsAsync as jest.Mock;
const scheduleNotificationAsync =
  Notifications.scheduleNotificationAsync as jest.Mock;
const cancelScheduledNotificationAsync =
  Notifications.cancelScheduledNotificationAsync as jest.Mock;

describe("local-notifications daily sky", () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  });

  afterAll(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalOS,
    });
  });

  it("cancels when daily sky is turned off", async () => {
    const result = await syncDailySkySchedule(false);
    expect(result).toEqual({ ok: true, scheduled: false });
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      DAILY_SKY_NOTIF_ID,
    );
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules one daily reminder when permission granted", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "granted" });
    const result = await syncDailySkySchedule(true);
    expect(result).toEqual({ ok: true, scheduled: true });
    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const arg = scheduleNotificationAsync.mock.calls[0]![0];
    expect(arg.identifier).toBe(DAILY_SKY_NOTIF_ID);
    expect(arg.trigger).toMatchObject({
      type: "daily",
      hour: DAILY_SKY_HOUR,
      minute: DAILY_SKY_MINUTE,
    });
    expect(arg.content.sound).toBe(false);
  });

  it("does not leave schedule armed when permission denied", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "denied" });
    requestPermissionsAsync.mockResolvedValue({ status: "denied" });
    const result = await syncDailySkySchedule(true);
    expect(result).toEqual({ ok: false, reason: "denied" });
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(cancelScheduledNotificationAsync).toHaveBeenCalled();
  });

  it("requests permission when undetermined then schedules", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "undetermined" });
    requestPermissionsAsync.mockResolvedValue({ status: "granted" });
    const result = await syncDailySkySchedule(true);
    expect(result).toEqual({ ok: true, scheduled: true });
    expect(requestPermissionsAsync).toHaveBeenCalled();
    expect(scheduleNotificationAsync).toHaveBeenCalled();
  });

  it("reports unavailable on web without scheduling", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const result = await syncDailySkySchedule(true);
    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("reconciles without re-prompt when requestIfNeeded is false", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "denied" });
    const result = await syncDailySkySchedule(true, { requestIfNeeded: false });
    expect(result).toEqual({ ok: false, reason: "denied" });
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
