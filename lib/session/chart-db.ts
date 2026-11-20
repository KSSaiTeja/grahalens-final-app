/**
 * Persist birth + natal chart payload for guest / offline (PRD §9 charts.payload).
 */
import * as SQLite from "expo-sqlite";

import type { NatalChart } from "@/lib/ephemeris/types";
import type { StoredBirth } from "@/lib/store/chart";

const DB_NAME = "grahalens_local.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS chart_payload (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          birth_json TEXT NOT NULL,
          natal_json TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export type PersistedChart = {
  birth: StoredBirth;
  natal: NatalChart;
  updatedAt: string;
};

export async function saveChartPayload(
  birth: StoredBirth,
  natal: NatalChart,
): Promise<void> {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO chart_payload (id, birth_json, natal_json, updated_at)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       birth_json = excluded.birth_json,
       natal_json = excluded.natal_json,
       updated_at = excluded.updated_at`,
    [JSON.stringify(birth), JSON.stringify(natal), updatedAt],
  );
}

export async function loadChartPayload(): Promise<PersistedChart | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    birth_json: string;
    natal_json: string;
    updated_at: string;
  }>("SELECT birth_json, natal_json, updated_at FROM chart_payload WHERE id = 1");
  if (!row) return null;
  try {
    return {
      birth: JSON.parse(row.birth_json) as StoredBirth,
      natal: JSON.parse(row.natal_json) as NatalChart,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

export async function clearChartPayload(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM chart_payload");
}
