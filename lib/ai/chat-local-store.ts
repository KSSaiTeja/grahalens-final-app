/**
 * On-device ChatStore — guest / missing Supabase (threads persist across launches).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AppendMessageInput,
  ChatStore,
  CreateThreadInput,
} from "@/lib/ai/chat-api";
import type { ChatMessage, ChatThread } from "@/lib/types/db";

export const CHAT_STORAGE_KEY = "grahalens:chat:v1";

type Snapshot = {
  threads: ChatThread[];
  messages: ChatMessage[];
  seq: number;
};

function normalizeTitle(title: string | undefined): string {
  const trimmed = title?.trim();
  if (!trimmed) return "Lens";
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

function normalizeContent(content: string): string {
  const normalized = content.trim();
  if (!normalized) throw new Error("Message content is required");
  return normalized;
}

function emptySnapshot(): Snapshot {
  return { threads: [], messages: [], seq: 0 };
}

export type LocalChatStore = ChatStore & {
  clearAll(): Promise<void>;
};

export function createLocalChatStore(
  storage: Pick<
    typeof AsyncStorage,
    "getItem" | "setItem" | "removeItem"
  > = AsyncStorage,
): LocalChatStore {
  let snapshot = emptySnapshot();
  let hydrate: Promise<void> | null = null;

  async function ensureLoaded(): Promise<void> {
    if (!hydrate) {
      hydrate = (async () => {
        try {
          const raw = await storage.getItem(CHAT_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as Snapshot;
          if (
            Array.isArray(parsed.threads) &&
            Array.isArray(parsed.messages) &&
            typeof parsed.seq === "number"
          ) {
            snapshot = parsed;
          }
        } catch {
          snapshot = emptySnapshot();
        }
      })();
    }
    await hydrate;
  }

  async function persist(): Promise<void> {
    await storage.setItem(CHAT_STORAGE_KEY, JSON.stringify(snapshot));
  }

  function nextId(prefix: string): string {
    snapshot.seq += 1;
    return `${prefix}-${snapshot.seq}`;
  }

  return {
    async clearAll() {
      snapshot = emptySnapshot();
      hydrate = Promise.resolve();
      await storage.removeItem(CHAT_STORAGE_KEY);
    },

    async listThreads(userId) {
      await ensureLoaded();
      return snapshot.threads
        .filter((t) => t.user_id === userId)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    },

    async getThread(userId, threadId) {
      await ensureLoaded();
      return (
        snapshot.threads.find(
          (t) => t.id === threadId && t.user_id === userId,
        ) ?? null
      );
    },

    async createThread(userId, input?: CreateThreadInput) {
      await ensureLoaded();
      const now = new Date().toISOString();
      const thread: ChatThread = {
        id: nextId("thread"),
        user_id: userId,
        title: normalizeTitle(input?.title),
        updated_at: now,
        created_at: now,
      };
      snapshot.threads.push(thread);
      await persist();
      return thread;
    },

    async touchThread(userId, threadId) {
      await ensureLoaded();
      const thread = snapshot.threads.find(
        (t) => t.id === threadId && t.user_id === userId,
      );
      if (!thread) throw new Error("Chat thread not found");
      thread.updated_at = new Date().toISOString();
      await persist();
      return thread;
    },

    async listMessages(threadId) {
      await ensureLoaded();
      return snapshot.messages
        .filter((m) => m.thread_id === threadId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    },

    async appendMessage(threadId, input: AppendMessageInput) {
      await ensureLoaded();
      const message: ChatMessage = {
        id: nextId("msg"),
        thread_id: threadId,
        role: input.role,
        content: normalizeContent(input.content),
        grounded: input.grounded ?? false,
        created_at: new Date().toISOString(),
      };
      snapshot.messages.push(message);
      await persist();
      return message;
    },
  };
}

/** Process singleton for guest / offline Lens. */
export const localChatStore = createLocalChatStore();
