import { createMemoryApi } from "@/lib/memory/api";
import { resolveMemoryStore } from "@/lib/lens/session";

export {
  DEFAULT_MEMORY_SALIENCE,
  PINNED_MEMORY_SALIENCE,
  createMemoryApi,
  isMemoryPinned,
} from "@/lib/memory/api";
export type {
  CreateMemoryInput,
  MemoryApi,
  MemoryStore,
  UpdateMemoryInput,
} from "@/lib/memory/api";
export { localMemoryStore } from "@/lib/memory/memory-local-store";
export { supabaseMemoryStore } from "@/lib/memory/supabase-store";

/** Stable keys for Settings/Lens TanStack Query consumers. */
export const memoryKeys = {
  all: ["memories"] as const,
  list: (userId: string) => ["memories", userId] as const,
};

function api() {
  return createMemoryApi(resolveMemoryStore());
}

export async function listMemories(userId: string) {
  return api().list(userId);
}
export async function createMemory(
  userId: string,
  input: Parameters<ReturnType<typeof createMemoryApi>["create"]>[1],
) {
  return api().create(userId, input);
}
export async function updateMemory(
  userId: string,
  memoryId: string,
  input: Parameters<ReturnType<typeof createMemoryApi>["update"]>[2],
) {
  return api().update(userId, memoryId, input);
}
export async function setMemoryPinned(
  userId: string,
  memoryId: string,
  pinned: boolean,
) {
  return api().setPinned(userId, memoryId, pinned);
}
export async function deleteMemory(userId: string, memoryId: string) {
  return api().remove(userId, memoryId);
}
