/**
 * Atelier journal CRUD + check-in memory + soul/patterns gates (Prompt 22).
 */
import {
  createJournalApi,
  type JournalStore,
  type JournalRecord,
  type CreateJournalInput,
  type UpdateJournalInput,
} from "@/lib/atelier/api";
import { formatCheckInMemory, CHECK_IN_SOURCE } from "@/lib/atelier/check-in";
import { buildPatternThread } from "@/lib/atelier/patterns";
import { weatherLinkedPrompt, toWeatherSnapshot } from "@/lib/atelier/weather-prompt";
import {
  createMemoryApi,
  type MemoryStore,
} from "@/lib/memory/api";
import type { Memory } from "@/lib/types/db";
import type { SkyWeather } from "@/lib/sky/sky-weather";

class InMemoryJournalStore implements JournalStore {
  entries: JournalRecord[] = [];
  seq = 0;

  async list(userId: string) {
    return this.entries
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(userId: string, entryId: string) {
    return (
      this.entries.find((e) => e.id === entryId && e.userId === userId) ?? null
    );
  }

  async create(userId: string, input: CreateJournalInput) {
    this.seq += 1;
    const now = "2026-07-29T12:00:00.000Z";
    const entry: JournalRecord = {
      id: `journal-${this.seq}`,
      userId,
      body: input.body,
      mood: input.mood ?? null,
      weatherSnapshot: input.weatherSnapshot ?? null,
      dashaKey: input.dashaKey ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.push(entry);
    return entry;
  }

  async update(userId: string, entryId: string, patch: UpdateJournalInput) {
    const entry = this.entries.find(
      (e) => e.id === entryId && e.userId === userId,
    );
    if (!entry) throw new Error("Journal entry not found");
    if (patch.body !== undefined) entry.body = patch.body;
    if (patch.mood !== undefined) entry.mood = patch.mood;
    entry.updatedAt = "2026-07-29T13:00:00.000Z";
    return entry;
  }

  async remove(userId: string, entryId: string) {
    const before = this.entries.length;
    this.entries = this.entries.filter(
      (e) => !(e.id === entryId && e.userId === userId),
    );
    if (this.entries.length === before) throw new Error("Journal entry not found");
  }
}

class InMemoryMemoryStore implements MemoryStore {
  rows: Memory[] = [];

  async list(userId: string) {
    return this.rows.filter((r) => r.user_id === userId);
  }

  async create(
    userId: string,
    input: { body: string; source: string; salience: number },
  ) {
    const row: Memory = {
      id: `memory-${this.rows.length + 1}`,
      user_id: userId,
      created_at: "2026-07-29T12:00:00.000Z",
      ...input,
    };
    this.rows.push(row);
    return row;
  }

  async update(
    _userId: string,
    _memoryId: string,
    _patch: { body?: string; salience?: number },
  ): Promise<Memory> {
    throw new Error("unused");
  }

  async remove(_userId: string, _memoryId: string): Promise<void> {
    throw new Error("unused");
  }
}

const sampleWeather = {
  at: "2026-07-29T12:00:00.000Z",
  date: "2026-07-29",
  dominant: "clarity" as const,
  axes: {
    clarity: { id: "clarity" as const, value: 0.7, reasons: [] },
    pressure: { id: "pressure" as const, value: 0.3, reasons: [] },
    friction: { id: "friction" as const, value: 0.2, reasons: [] },
    opening: { id: "opening" as const, value: 0.4, reasons: [] },
  },
} satisfies SkyWeather;

describe("journal CRUD", () => {
  it("creates, updates, lists, and removes offline", async () => {
    const api = createJournalApi(new InMemoryJournalStore());
    const created = await api.create("guest", {
      body: "  Noticed pressure without forcing.  ",
      mood: "pressed",
      weatherSnapshot: toWeatherSnapshot(sampleWeather),
      dashaKey: "maha-saturn",
    });
    expect(created.body).toBe("Noticed pressure without forcing.");
    expect(created.mood).toBe("pressed");
    expect(created.weatherSnapshot?.dominant).toBe("clarity");

    const updated = await api.update("guest", created.id, {
      body: "Revised note.",
      mood: "steady",
    });
    expect(updated.body).toBe("Revised note.");
    expect(updated.mood).toBe("steady");

    const list = await api.list("guest");
    expect(list).toHaveLength(1);

    await api.remove("guest", created.id);
    expect(await api.list("guest")).toHaveLength(0);
  });

  it("rejects empty body", async () => {
    const api = createJournalApi(new InMemoryJournalStore());
    await expect(api.create("guest", { body: "   " })).rejects.toThrow(
      /required/i,
    );
  });
});

describe("weather-linked prompt", () => {
  it("returns clarity prompt for clarity-dominant weather", () => {
    const prompt = weatherLinkedPrompt(sampleWeather);
    expect(prompt).toMatch(/Clarity/i);
  });
});

describe("check-in → memory", () => {
  it("writes a check-in sourced memory", async () => {
    const memories = createMemoryApi(new InMemoryMemoryStore());
    const body = formatCheckInMemory({
      mood: "open",
      note: "A window appeared before noon.",
      weatherDominant: "opening",
    });
    const memory = await memories.create("guest", {
      body,
      source: CHECK_IN_SOURCE,
    });
    expect(memory.source).toBe("check-in");
    expect(memory.body).toMatch(/Check-in \(Open\)/);
    expect(memory.body).toMatch(/Sky weather: opening/);
    expect(memory.body).toMatch(/A window appeared/);
  });
});

describe("soul / patterns gates", () => {
  it("buildPatternThread returns null when not Private", () => {
    expect(
      buildPatternThread({
        entries: [],
        weather: sampleWeather,
        isPrivate: false,
      }),
    ).toBeNull();
  });

  it("buildPatternThread unlocks for Private", () => {
    const thread = buildPatternThread({
      entries: [
        {
          id: "j1",
          userId: "guest",
          body: "Note",
          mood: "clear",
          weatherSnapshot: null,
          dashaKey: null,
          createdAt: "2026-07-29T10:00:00.000Z",
          updatedAt: "2026-07-29T10:00:00.000Z",
        },
      ],
      weather: sampleWeather,
      at: new Date("2026-07-29T12:00:00.000Z"),
      isPrivate: true,
    });
    expect(thread).not.toBeNull();
    expect(thread!.entryCount).toBe(1);
    expect(thread!.dominantMood).toBe("clear");
    expect(thread!.paragraphs.length).toBeGreaterThan(0);
  });
});
