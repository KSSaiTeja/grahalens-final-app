/**
 * Settings wipe — clears AsyncStorage-backed local stores.
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import AsyncStorage from "@react-native-async-storage/async-storage";

import { createLocalJournalStore } from "@/lib/atelier/local-store";
import { createLocalBondStore } from "@/lib/bonds/local-store";
import { createLocalMemoryStore } from "@/lib/memory/memory-local-store";
import { createLocalUsageCounterStore } from "@/lib/billing/quota-local-store";
import { createLocalChatStore } from "@/lib/ai/chat-local-store";
import {
  PROFILE_STORAGE_KEY,
  saveLocalProfile,
  loadLocalProfile,
  clearLocalProfile,
} from "@/lib/settings/profile";
import {
  saveNotificationPrefs,
  loadNotificationPrefs,
  clearNotificationPrefs,
  NOTIF_PREFS_STORAGE_KEY,
} from "@/lib/settings/notification-prefs";

describe("settings local prefs", () => {
  const mem = new Map<string, string>();
  const storage = {
    async getItem(key: string) {
      return mem.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      mem.set(key, value);
    },
    async removeItem(key: string) {
      mem.delete(key);
    },
  };

  beforeEach(() => {
    mem.clear();
  });

  it("journal clearAll wipes snapshot and storage", async () => {
    const store = createLocalJournalStore(storage);
    await store.create("u1", { body: "note" });
    expect((await store.list("u1")).length).toBe(1);
    await store.clearAll();
    expect((await store.list("u1")).length).toBe(0);
  });

  it("bond / memory / usage / chat clearAll empty lists", async () => {
    const bonds = createLocalBondStore(storage);
    const memories = createLocalMemoryStore(storage);
    const usage = createLocalUsageCounterStore(storage);
    const chat = createLocalChatStore(storage);

    await memories.create("u1", { body: "m", source: "lens", salience: 1 });
    await usage.incrementLensCount("u1", "2026-07-29", 5);
    await chat.createThread("u1", { title: "t" });

    await Promise.all([
      bonds.clearAll(),
      memories.clearAll(),
      usage.clearAll(),
      chat.clearAll(),
    ]);

    expect(await memories.list("u1")).toEqual([]);
    expect(await usage.getLensCount("u1", "2026-07-29")).toBe(0);
    expect(await chat.listThreads("u1")).toEqual([]);
  });
});

describe("settings profile + notif prefs (AsyncStorage)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and clears display name", async () => {
    await saveLocalProfile({ displayName: "Kiran" });
    expect((await loadLocalProfile()).displayName).toBe("Kiran");
    await clearLocalProfile();
    expect((await loadLocalProfile()).displayName).toBe("");
    expect(await AsyncStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  });

  it("persists notification toggles", async () => {
    await saveNotificationPrefs({ dailySky: false, pushEnabled: true });
    const prefs = await loadNotificationPrefs();
    expect(prefs.dailySky).toBe(false);
    expect(prefs.pushEnabled).toBe(true);
    await clearNotificationPrefs();
    expect(await AsyncStorage.getItem(NOTIF_PREFS_STORAGE_KEY)).toBeNull();
  });
});
