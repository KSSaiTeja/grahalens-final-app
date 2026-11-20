/**
 * Local profile prefs — display name for guests; best-effort cloud sync when signed in.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useSessionStore } from "@/lib/store/session";

export const PROFILE_STORAGE_KEY = "grahalens:profile:v1";

export type LocalProfile = {
  displayName: string;
};

const empty: LocalProfile = { displayName: "" };

export async function loadLocalProfile(): Promise<LocalProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as LocalProfile;
    return {
      displayName:
        typeof parsed.displayName === "string" ? parsed.displayName : "",
    };
  } catch {
    return { ...empty };
  }
}

export async function saveLocalProfile(
  patch: Partial<LocalProfile>,
): Promise<LocalProfile> {
  const current = await loadLocalProfile();
  const next: LocalProfile = {
    displayName:
      patch.displayName !== undefined
        ? patch.displayName.trim()
        : current.displayName,
  };
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));

  const { mode, user } = useSessionStore.getState();
  if (
    mode === "authenticated" &&
    user &&
    isSupabaseConfigured &&
    supabase &&
    patch.displayName !== undefined
  ) {
    try {
      await supabase
        .from("profiles")
        .update({ display_name: next.displayName || null })
        .eq("id", user.id);
    } catch {
      // Best-effort — local name still saved.
    }
  }

  return next;
}

export async function clearLocalProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
}
