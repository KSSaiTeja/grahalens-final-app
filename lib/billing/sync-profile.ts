/**
 * Best-effort sync of profiles.private_until (+ rc_app_user_id).
 * CustomerInfo remains source of truth (PRD §9 / SETUP §4).
 */

import type { EntitlementSnapshot } from "@/lib/billing/types";
import { useSessionStore } from "@/lib/store/session";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function syncPrivateUntil(
  snapshot: EntitlementSnapshot,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const client = getSupabase();
  if (!client) return;

  const { mode, user } = useSessionStore.getState();
  if (mode !== "authenticated" || !user?.id) return;

  try {
    const patch: {
      private_until: string | null;
      rc_app_user_id?: string;
    } = {
      private_until: snapshot.isPrivate ? snapshot.privateUntil : null,
    };
    if (snapshot.appUserId) {
      patch.rc_app_user_id = snapshot.appUserId;
    }

    await client.from("profiles").update(patch).eq("id", user.id);
  } catch {
    // Best-effort — never block unlock on network/profile sync.
  }
}
