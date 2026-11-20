import type {
  AppendMessageInput,
  ChatStore,
  CreateThreadInput,
} from "@/lib/ai/chat-api";
import { getSupabase } from "@/lib/supabase/client";

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

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

export const supabaseChatStore: ChatStore = {
  async listThreads(userId) {
    const { data, error } = await requireSupabase()
      .from("chat_threads")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getThread(userId, threadId) {
    const { data, error } = await requireSupabase()
      .from("chat_threads")
      .select("*")
      .eq("id", threadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createThread(userId, input?: CreateThreadInput) {
    const { data, error } = await requireSupabase()
      .from("chat_threads")
      .insert({
        user_id: userId,
        title: normalizeTitle(input?.title),
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async touchThread(userId, threadId) {
    const { data, error } = await requireSupabase()
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async listMessages(threadId) {
    const { data, error } = await requireSupabase()
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async appendMessage(threadId, input: AppendMessageInput) {
    const { data, error } = await requireSupabase()
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        role: input.role,
        content: normalizeContent(input.content),
        grounded: input.grounded ?? false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },
};
