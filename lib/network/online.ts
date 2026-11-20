/**
 * Network online state — BRAND §11 L3 / SCREENS G2.
 * Treats unknown reachability as online to avoid false offline banners.
 */

import { useEffect, useState } from "react";
import * as Network from "expo-network";
import type { NetworkState } from "expo-network";

import { errorCopy } from "@/lib/errors/catalog";

export function isOnlineFromState(state: NetworkState): boolean {
  // Only treat explicit disconnect as offline. iOS/simulators often report
  // isInternetReachable=false while still online — that was locking Lens.
  if (state.isConnected === false) return false;
  return true;
}

let cachedOnline = true;
const listeners = new Set<(online: boolean) => void>();

function publish(online: boolean) {
  if (cachedOnline === online) return;
  cachedOnline = online;
  for (const listener of listeners) listener(online);
}

async function refresh(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    const online = isOnlineFromState(state);
    publish(online);
    return online;
  } catch {
    // Fail open — keep prior cache so we don't brick the UI on probe errors.
    return cachedOnline;
  }
}

/** Subscribe once at module load when native Network API is available. */
let subscribed = false;

function ensureSubscription() {
  if (subscribed) return;
  subscribed = true;
  void refresh();
  Network.addNetworkStateListener((state) => {
    publish(isOnlineFromState(state));
  });
}

/** Current cached online flag (sync). Prefer `useIsOnline` in UI. */
export function getIsOnline(): boolean {
  ensureSubscription();
  return cachedOnline;
}

/** React hook — shared subscription across screens. */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(cachedOnline);

  useEffect(() => {
    ensureSubscription();
    setOnline(cachedOnline);
    listeners.add(setOnline);
    void refresh();
    return () => {
      listeners.delete(setOnline);
    };
  }, []);

  return online;
}

export const OFFLINE_BANNER_BODY = errorCopy("offline").body;

export const OFFLINE_COMPOSER_PLACEHOLDER = errorCopy("offline_composer").body;
