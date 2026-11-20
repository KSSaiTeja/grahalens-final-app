import React, { useEffect, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { loadChartPayload } from "@/lib/session/chart-db";
import { loadLocalSessionFlags } from "@/lib/session/local-db";
import { sessionUserFromSupabase } from "@/lib/session/auth";
import { useChartStore } from "@/lib/store/chart";
import { useSessionStore } from "@/lib/store/session";

type Props = {
  children: React.ReactNode;
};

function applySupabaseSession(session: Session | null): void {
  const store = useSessionStore.getState();
  if (session?.user) {
    store.setAuthenticated(sessionUserFromSupabase(session));
  } else if (!store.isGuest) {
    store.clearSession();
  }
}

/**
 * Hydrates local guest/chart flags + Supabase auth listener.
 * QueryClient lives here so TanStack Query lane is available app-wide.
 */
export function SessionProvider({ children }: Props) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const flags = await loadLocalSessionFlags();
        if (cancelled) return;
        useSessionStore.getState().setFromLocal(flags);

        const chart = await loadChartPayload();
        if (cancelled) return;
        if (chart) {
          useChartStore.getState().hydrate(chart.birth, chart.natal);
        }

        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (cancelled) return;
          applySupabaseSession(data.session);

          const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              applySupabaseSession(session);
            },
          );
          unsubscribe = () => sub.subscription.unsubscribe();
        }
      } finally {
        if (!cancelled) {
          useSessionStore.getState().setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function useSession() {
  return useSessionStore();
}

export { continueAsGuest } from "@/lib/session/auth";
