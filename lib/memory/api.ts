import type { Memory } from "@/lib/types/db";

export const DEFAULT_MEMORY_SALIENCE = 0.5;
export const PINNED_MEMORY_SALIENCE = 1;

export type CreateMemoryInput = {
  body: string;
  source?: string;
  salience?: number;
};

export type UpdateMemoryInput = {
  body?: string;
  salience?: number;
};

export interface MemoryStore {
  list(userId: string): Promise<Memory[]>;
  create(
    userId: string,
    input: { body: string; source: string; salience: number },
  ): Promise<Memory>;
  update(
    userId: string,
    memoryId: string,
    patch: UpdateMemoryInput,
  ): Promise<Memory>;
  remove(userId: string, memoryId: string): Promise<void>;
}

function normalizeBody(body: string): string {
  const normalized = body.trim();
  if (!normalized) throw new Error("Memory body is required");
  return normalized;
}

function validateSalience(salience: number): number {
  if (!Number.isFinite(salience) || salience < 0 || salience > 1) {
    throw new RangeError("Memory salience must be between 0 and 1");
  }
  return salience;
}

export function isMemoryPinned(memory: Pick<Memory, "salience">): boolean {
  return memory.salience === PINNED_MEMORY_SALIENCE;
}

export function createMemoryApi(store: MemoryStore) {
  return {
    list(userId: string): Promise<Memory[]> {
      return store.list(userId);
    },

    async create(userId: string, input: CreateMemoryInput): Promise<Memory> {
      return store.create(userId, {
        body: normalizeBody(input.body),
        source: input.source?.trim() || "lens",
        salience: validateSalience(
          input.salience ?? DEFAULT_MEMORY_SALIENCE,
        ),
      });
    },

    async update(
      userId: string,
      memoryId: string,
      input: UpdateMemoryInput,
    ): Promise<Memory> {
      const patch: UpdateMemoryInput = {};
      if (input.body !== undefined) patch.body = normalizeBody(input.body);
      if (input.salience !== undefined) {
        patch.salience = validateSalience(input.salience);
      }
      return store.update(userId, memoryId, patch);
    },

    async setPinned(
      userId: string,
      memoryId: string,
      pinned: boolean,
    ): Promise<Memory> {
      return store.update(userId, memoryId, {
        salience: pinned
          ? PINNED_MEMORY_SALIENCE
          : DEFAULT_MEMORY_SALIENCE,
      });
    },

    remove(userId: string, memoryId: string): Promise<void> {
      return store.remove(userId, memoryId);
    },
  };
}

export type MemoryApi = ReturnType<typeof createMemoryApi>;
