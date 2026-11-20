import {
  createMemoryApi,
  type MemoryStore,
} from "@/lib/memory/api";
import type { Memory } from "@/lib/types/db";

class InMemoryStore implements MemoryStore {
  rows: Memory[] = [];

  async list(userId: string): Promise<Memory[]> {
    return this.rows.filter((row) => row.user_id === userId);
  }

  async create(
    userId: string,
    input: { body: string; source: string; salience: number },
  ): Promise<Memory> {
    const row: Memory = {
      id: `memory-${this.rows.length + 1}`,
      user_id: userId,
      created_at: "2026-07-29T00:00:00.000Z",
      ...input,
    };
    this.rows.push(row);
    return row;
  }

  async update(
    userId: string,
    memoryId: string,
    patch: { body?: string; salience?: number },
  ): Promise<Memory> {
    const row = this.rows.find(
      (candidate) =>
        candidate.id === memoryId && candidate.user_id === userId,
    );
    if (!row) throw new Error("Memory not found");
    Object.assign(row, patch);
    return row;
  }

  async remove(userId: string, memoryId: string): Promise<void> {
    this.rows = this.rows.filter(
      (row) => row.id !== memoryId || row.user_id !== userId,
    );
  }
}

describe("settings-ready memory API", () => {
  it("trims, lists, pins, unpins, and deletes a user's memory", async () => {
    const store = new InMemoryStore();
    const api = createMemoryApi(store);

    const created = await api.create("user-1", {
      body: "  I prefer direct answers.  ",
      source: "settings",
    });
    expect(created.body).toBe("I prefer direct answers.");
    expect(await api.list("user-1")).toHaveLength(1);

    expect((await api.setPinned("user-1", created.id, true)).salience).toBe(1);
    expect((await api.setPinned("user-1", created.id, false)).salience).toBe(
      0.5,
    );

    await api.remove("user-1", created.id);
    expect(await api.list("user-1")).toEqual([]);
  });

  it("rejects blank memory bodies", async () => {
    const api = createMemoryApi(new InMemoryStore());

    await expect(api.create("user-1", { body: "   " })).rejects.toThrow(
      "Memory body is required",
    );
  });
});
