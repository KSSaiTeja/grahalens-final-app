import { createChatApi, type ChatStore } from "@/lib/ai/chat-api";
import { localChatStore } from "@/lib/ai/chat-local-store";
import { supabaseChatStore } from "@/lib/ai/chat-supabase-store";
import { resolveChatStore } from "@/lib/lens/session";

export {
  chatKeys,
  createChatApi,
} from "@/lib/ai/chat-api";
export type {
  AppendMessageInput,
  ChatApi,
  ChatStore,
  CreateThreadInput,
} from "@/lib/ai/chat-api";
export { localChatStore } from "@/lib/ai/chat-local-store";
export { supabaseChatStore } from "@/lib/ai/chat-supabase-store";

/** Prefer session-resolved store (local guest vs Supabase). */
function store(): ChatStore {
  return resolveChatStore();
}

export async function listChatThreads(userId: string) {
  return createChatApi(store()).listThreads(userId);
}
export async function getChatThread(userId: string, threadId: string) {
  return createChatApi(store()).getThread(userId, threadId);
}
export async function createChatThread(
  userId: string,
  input?: { title?: string },
) {
  return createChatApi(store()).createThread(userId, input);
}
export async function listChatMessages(threadId: string) {
  return createChatApi(store()).listMessages(threadId);
}
export async function appendChatMessage(
  userId: string,
  threadId: string,
  input: { role: "user" | "assistant" | "system"; content: string; grounded?: boolean },
) {
  return createChatApi(store()).appendMessage(userId, threadId, input);
}

/** @deprecated Prefer resolveChatStore() — kept for direct local tests. */
export const defaultLocalChatApi = createChatApi(localChatStore);
