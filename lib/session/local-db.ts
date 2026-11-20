/**
 * On-device SQLite for guest identity + chart presence.
 * Cloud users still use this for has_chart until Sync Prompt; guest is authoritative here.
 */
import * as SQLite from "expo-sqlite";

const DB_NAME = "grahalens_local.db";

export type LocalMetaKey =
  | "is_guest"
  | "has_chart"
  | "has_seen_welcome"
  | "skipped_welcome_paywall";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function getMeta(key: LocalMetaKey): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?",
    [key],
  );
  return row?.value ?? null;
}

export async function setMeta(
  key: LocalMetaKey,
  value: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export async function getBoolMeta(key: LocalMetaKey): Promise<boolean> {
  const v = await getMeta(key);
  return v === "1";
}

export async function setBoolMeta(
  key: LocalMetaKey,
  value: boolean,
): Promise<void> {
  await setMeta(key, value ? "1" : "0");
}

export type LocalSessionFlags = {
  isGuest: boolean;
  hasChart: boolean;
  hasSeenWelcome: boolean;
  skippedWelcomePaywall: boolean;
};

export async function loadLocalSessionFlags(): Promise<LocalSessionFlags> {
  const [isGuest, hasChart, hasSeenWelcome, skippedWelcomePaywall] =
    await Promise.all([
      getBoolMeta("is_guest"),
      getBoolMeta("has_chart"),
      getBoolMeta("has_seen_welcome"),
      getBoolMeta("skipped_welcome_paywall"),
    ]);
  return { isGuest, hasChart, hasSeenWelcome, skippedWelcomePaywall };
}

/** Test / reset helper — clears local observatory flags. */
export async function clearLocalSessionFlags(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM app_meta");
}
