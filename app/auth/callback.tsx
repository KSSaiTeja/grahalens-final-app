import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useTheme } from "@/theme";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  decidePostSplashRoute,
  hrefForDestination,
  markWelcomeSeen,
  sessionUserFromSupabase,
} from "@/lib/session";
import { useSessionStore } from "@/lib/store/session";
import { useEntitlementStore } from "@/lib/store/entitlement";
import { setBoolMeta } from "@/lib/session/local-db";

/**
 * Deep link target: grahalens://auth/callback
 * Completes magic-link session from URL tokens.
 */
export default function AuthCallbackScreen() {
  const { colors, type, fontsLoaded } = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const body = type("bodySm");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured.");
        return;
      }

      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const { queryParams } = Linking.parse(url);
          const access_token =
            typeof queryParams?.access_token === "string"
              ? queryParams.access_token
              : undefined;
          const refresh_token =
            typeof queryParams?.refresh_token === "string"
              ? queryParams.refresh_token
              : undefined;

          if (access_token && refresh_token) {
            const { data, error: sessionError } =
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
            if (sessionError) throw sessionError;
            if (data.session) {
              useSessionStore
                .getState()
                .setAuthenticated(sessionUserFromSupabase(data.session));
              await setBoolMeta("is_guest", false);
              await markWelcomeSeen();
            }
          }
        }

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session) {
          useSessionStore
            .getState()
            .setAuthenticated(sessionUserFromSupabase(data.session));
          await markWelcomeSeen();
        }

        const mode = useSessionStore.getState().mode;
        const chart = useSessionStore.getState().hasChart;
        const skipped = useSessionStore.getState().skippedWelcomePaywall;
        if (mode === "anonymous" && !data.session) {
          setError("Could not complete sign-in. Request a new magic link.");
          return;
        }
        const dest = decidePostSplashRoute({
          mode: mode === "anonymous" ? "authenticated" : mode,
          hasChart: chart,
          hasSeenWelcome: true,
          skippedWelcomePaywall: skipped,
          isPrivate: useEntitlementStore.getState().isPrivate,
        });
        router.replace(hrefForDestination(dest));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Sign-in failed.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill}>
        <View style={styles.center}>
          <GlassPanel floating style={styles.panel}>
            {error ? (
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.caution,
                  textAlign: "center",
                }}
                accessibilityRole="alert"
              >
                {error}
              </Text>
            ) : (
              <View style={styles.status}>
                <ActivityIndicator color={colors.accent} />
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    color: colors.text2,
                  }}
                  accessibilityLiveRegion="polite"
                >
                  Opening your observatory…
                </Text>
              </View>
            )}
          </GlassPanel>
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  panel: { width: "100%", maxWidth: 360, paddingVertical: 28 },
  status: { alignItems: "center", gap: 16 },
});
