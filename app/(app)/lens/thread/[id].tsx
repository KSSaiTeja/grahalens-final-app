import React from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LensOrb } from "@/components/brand/LensOrb";
import { LensComposer, ThreadMessages } from "@/components/lens";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  useLensMessagesQuery,
  useSendLensMessage,
} from "@/lib/lens/send";
import {
  OFFLINE_COMPOSER_PLACEHOLDER,
  useIsOnline,
} from "@/lib/network/online";
import { useLensStore } from "@/lib/store/lens";
import { space, layout, useTheme } from "@/theme";

/** L3 — Historical thread detail + continue composer. */
export default function LensThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threadId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();
  const online = useIsOnline();
  const orbState = useLensStore((s) => s.orbState);
  const setActiveThreadId = useLensStore((s) => s.setActiveThreadId);
  const messages = useLensMessagesQuery(threadId || null);
  const send = useSendLensMessage();
  const composerLocked = send.isPending || !online;

  React.useEffect(() => {
    if (threadId) setActiveThreadId(threadId);
  }, [threadId, setActiveThreadId]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!threadId) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <EmptyState
            title="Thread missing"
            body="That conversation couldn’t be found."
            actionLabel="Back to threads"
            onAction={() => router.replace("/(app)/lens/threads" as Href)}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Thread"
          subtitle="Continue when ready"
          onBack={() => router.back()}
        />
        <View style={styles.bannerPad}>
          <OfflineBanner />
        </View>
        <View style={styles.orb}>
          <LensOrb size={32} state={orbState} />
        </View>
        <View style={styles.main}>
          {messages.isError ? (
            <EmptyState
              title="Couldn’t load messages"
              body="Check back shortly."
              withOrb={false}
            />
          ) : messages.data ? (
            <ThreadMessages messages={messages.data} />
          ) : null}
        </View>
        <LensComposer
          onSend={(content) => send.mutate({ content, threadId })}
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
  bannerPad: {
    paddingHorizontal: space.md,
  },
  orb: {
    alignItems: "center",
    marginBottom: space.sm,
  },
  main: { flex: 1 },
});
