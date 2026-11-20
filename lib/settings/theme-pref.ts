/**
 * Persist Ink / Dawn preference across launches.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ThemeName } from "@/theme";

export const THEME_STORAGE_KEY = "grahalens:theme:v1";

export async function loadThemePreference(): Promise<ThemeName | null> {
  try {
    const raw = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "ink" || raw === "dawn") return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(theme: ThemeName): Promise<void> {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
}

export async function clearThemePreference(): Promise<void> {
  await AsyncStorage.removeItem(THEME_STORAGE_KEY);
}
