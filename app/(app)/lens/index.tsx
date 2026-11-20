import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { History, Sparkles } from "lucide-react-native";

import { LensOrb } from "@/components/brand/LensOrb";
import { QuotaChip } from "@/components/billing/QuotaChip";
import {
  LensComposer,
  StarterChips,
  ThreadMessages,
} from "@/components/lens";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { SoftPress } from "@/components/ui/SoftPress";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { chartGroundedStarters } from "@/lib/lens/starters";
import {
  FREE_LENS_DAILY_LIMIT,
  useLensMessagesQuery,
  useLensQuotaQuery,
  useSendLensMessage,
} from "@/lib/lens/send";
import {
  OFFLINE_COMPOSER_PLACEHOLDER,
  useIsOnline,
} from "@/lib/network/online";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useLensStore } from "@/lib/store/lens";
import { fontFamilies, layout, space, useTheme } from "@/theme";

/**
 * L1 — Active Lens thread + composer.
 * QuotaChip; 6th free msg → requirePrivate("lens_quota").
 */
export default function LensScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const display = type("displayL");
  const body = type("body");
  const { natal, usingFixture } = useResolvedNatal();
  const isPrivate = useIsPrivate();
  const online = useIsOnline();
  const activeThreadId = useLensStore((s) => s.activeThreadId);
  const orbState = useLensStore((s) => s.orbState);
  const quota = useLensQuotaQuery();
  const messages = useLensMessagesQuery(activeThreadId);
  const send = useSendLensMessage();

  const starters = useMemo(() => chartGroundedStarters(natal), [natal]);
  const used = quota.data?.used ?? 0;
  const limit = quota.data?.limit ?? FREE_LENS_DAILY_LIMIT;
  const hasMessages = (messages.data?.length ?? 0) > 0;
  const composerLocked = send.isPending || !online;

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onSend = (content: string) => {
    send.mutate({ content, threadId: activeThreadId });
  };

  const openQuotaPaywall = () => {
    const gate = requirePrivate("lens_quota");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="lens-home">
        <View style={styles.headerRow}>
          <IconButton
            icon={History}
            label="Threads"
            onPress={() => router.push("/(app)/lens/threads" as Href)}
          />
          <View style={styles.headerCenter}>
            <LensOrb size={36} state={orbState} />
            <Text
              style={{
                marginTop: 4,
                fontFamily: fontFamilies.display,
                fontSize: 18,
                color: colors.text1,
              }}
            >
              Lens
            </Text>
          </View>
          <IconButton
            icon={Sparkles}
            label="Starters"
            onPress={() => router.push("/(app)/lens/starters" as Href)}
          />
        </View>

        <View style={styles.bannerPad}>
          <OfflineBanner />
        </View>

        {!isPrivate ? (
          <View style={styles.quotaRow}>
            <QuotaChip
              testID="lens-quota-chip"
              used={used}
              limit={limit}
              onPress={openQuotaPaywall}
            />
            <SoftPress
              onPress={() => router.push("/(app)/lens/memories" as Href)}
              accessibilityRole="button"
              accessibilityLabel="Open memories"
              style={styles.memoriesLink}
            >
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: 14,
                  color: colors.text2,
                }}
              >
                Memories
              </Text>
            </SoftPress>
          </View>
        ) : (
          <View style={styles.quotaRow}>
            <Text
              testID="lens-unlimited"
              style={{
                fontFamily: body.fontFamily,
                fontSize: 13,
                color: colors.text3,
              }}
            >
              Private · unlimited
            </Text>
            <SoftPress
              onPress={() => router.push("/(app)/lens/memories" as Href)}
              accessibilityRole="button"
              accessibilityLabel="Open memories"
              style={styles.memoriesLink}
            >
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: 14,
                  color: colors.text2,
                }}
              >
                Memories
              </Text>
            </SoftPress>
          </View>
        )}

        {usingFixture ? (
          <Text
            style={{
              textAlign: "center",
              color: colors.text3,
              fontFamily: body.fontFamily,
              fontSize: 12,
              marginBottom: space.xs,
            }}
          >
            Fixture chart grounding
          </Text>
        ) : null}

        <View style={styles.main}>
          {hasMessages && messages.data ? (
            <ThreadMessages messages={messages.data} />
          ) : (
            <View style={styles.empty}>
              <EmptyState
                title="Ready when you are"
                body="Ask about the sky, a decision, or a pattern. Your chart stays at the center of every reflection."
                withOrb={false}
              />
              <Text
                style={{
                  marginTop: space.md,
                  marginBottom: space.sm,
                  textAlign: "center",
                  fontFamily: display.fontFamily,
                  fontSize: 15,
                  color: colors.text2,
                }}
              >
                Start from your chart
              </Text>
              <StarterChips
                starters={starters}
                disabled={composerLocked}
                onSelect={(s) => onSend(s.prompt)}
              />
            </View>
          )}
        </View>

        <LensComposer
          onSend={onSend}
          sending={send.isPending}
          disabled={composerLocked}
          placeholder={
            online ? undefined : OFFLINE_COMPOSER_PLACEHOLDER
          }
          bottomOffset={layout.tabBarHeight + space.md}
        />
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.sm,
    minHeight: 56,
  },
  headerCenter: {
    alignItems: "center",
  },
  bannerPad: {
    paddingHorizontal: space.md,
  },
  quotaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    marginBottom: space.sm,
    gap: space.md,
  },
  memoriesLink: {
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
  },
  main: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: space.xl,
  },
});
