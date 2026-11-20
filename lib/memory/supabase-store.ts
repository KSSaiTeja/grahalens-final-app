import type { MemoryStore } from "@/lib/memory/api";
import { getSupabase } from "@/lib/supabase/client";

function requireSupabase() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

export const supabaseMemoryStore: MemoryStore = {
  async list(userId) {
    const { data, error } = await requireSupabase()
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("salience", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(userId, input) {
    const { data, error } = await requireSupabase()
      .from("memories")
      .insert({ user_id: userId, ...input })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId, memoryId, patch) {
    const { data, error } = await requireSupabase()
      .from("memories")
      .update(patch)
      .eq("id", memoryId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async remove(userId, memoryId) {
    const { error } = await requireSupabase()
      .from("memories")
      .delete()
      .eq("id", memoryId)
      .eq("user_id", userId);

    if (error) throw error;
  },
};
