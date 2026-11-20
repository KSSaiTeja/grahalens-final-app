/**
 * Lens chat API — threads + messages (PRD §9 chat_* tables).
 * Injectable store for tests; wire Supabase via chat-supabase-store.
 */

import type {
  ChatMessage,
  ChatRole,
  ChatThread,
} from "@/lib/types/db";

export type CreateThreadInput = {
  title?: string;
};

export type AppendMessageInput = {
  role: ChatRole;
  content: string;
  grounded?: boolean;
};

export interface ChatStore {
  listThreads(userId: string): Promise<ChatThread[]>;
  getThread(userId: string, threadId: string): Promise<ChatThread | null>;
  createThread(userId: string, input?: CreateThreadInput): Promise<ChatThread>;
  touchThread(userId: string, threadId: string): Promise<ChatThread>;
  listMessages(threadId: string): Promise<ChatMessage[]>;
  appendMessage(
    threadId: string,
    input: AppendMessageInput,
  ): Promise<ChatMessage>;
}

function normalizeContent(content: string): string {
  const normalized = content.trim();
  if (!normalized) throw new Error("Message content is required");
  return normalized;
}

export function createChatApi(store: ChatStore) {
  return {
    listThreads(userId: string): Promise<ChatThread[]> {
      return store.listThreads(userId);
    },

    getThread(userId: string, threadId: string): Promise<ChatThread | null> {
      return store.getThread(userId, threadId);
    },

    createThread(
      userId: string,
      input?: CreateThreadInput,
    ): Promise<ChatThread> {
      return store.createThread(userId, input);
    },

    listMessages(threadId: string): Promise<ChatMessage[]> {
      return store.listMessages(threadId);
    },

    async appendMessage(
      userId: string,
      threadId: string,
      input: AppendMessageInput,
    ): Promise<ChatMessage> {
      const thread = await store.getThread(userId, threadId);
      if (!thread) throw new Error("Chat thread not found");
      const message = await store.appendMessage(threadId, {
        role: input.role,
        content: normalizeContent(input.content),
        grounded: input.grounded ?? false,
      });
      await store.touchThread(userId, threadId);
      return message;
    },
  };
}

export type ChatApi = ReturnType<typeof createChatApi>;

/** Stable keys for Lens TanStack Query consumers. */
export const chatKeys = {
  all: ["chat"] as const,
  threads: (userId: string) => ["chat", "threads", userId] as const,
  thread: (userId: string, threadId: string) =>
    ["chat", "thread", userId, threadId] as const,
  messages: (threadId: string) => ["chat", "messages", threadId] as const,
};
