/**
 * Resolve Lens user id + store backends (cloud vs local).
 */

import type { ChatStore } from "@/lib/ai/chat-api";
import { localChatStore } from "@/lib/ai/chat-local-store";
import { supabaseChatStore } from "@/lib/ai/chat-supabase-store";
import { localUsageCounterStore } from "@/lib/billing/quota-local-store";
import type { UsageCounterStore } from "@/lib/billing/quotas";
import type { MemoryStore } from "@/lib/memory/api";
import { localMemoryStore } from "@/lib/memory/memory-local-store";
import { supabaseMemoryStore } from "@/lib/memory/supabase-store";
import { useSessionStore } from "@/lib/store/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const GUEST_LENS_USER_ID = "guest-local";

/** Authenticated id when present; else stable guest id for local stores. */
export function resolveLensUserId(): string {
  const { user, mode } = useSessionStore.getState();
  if (mode === "authenticated" && user?.id) return user.id;
  return GUEST_LENS_USER_ID;
}

export function useLensUserId(): string {
  const mode = useSessionStore((s) => s.mode);
  const userId = useSessionStore((s) => s.user?.id);
  if (mode === "authenticated" && userId) return userId;
  return GUEST_LENS_USER_ID;
}

/**
 * Prefer Supabase when configured + authenticated; local otherwise
 * (guest path and verify without cloud keys).
 */
export function resolveChatStore(): ChatStore {
  const { mode } = useSessionStore.getState();
  if (isSupabaseConfigured && mode === "authenticated") {
    return supabaseChatStore;
  }
  return localChatStore;
}

export function resolveUsageStore(): UsageCounterStore {
  // Cloud RPC needs auth; free/guest always uses local counters until sync.
  return localUsageCounterStore;
}

export function resolveMemoryStore(): MemoryStore {
  const { mode } = useSessionStore.getState();
  if (isSupabaseConfigured && mode === "authenticated") {
    return supabaseMemoryStore;
  }
  return localMemoryStore;
}
