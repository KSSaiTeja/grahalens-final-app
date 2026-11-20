import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SoftPress } from "@/components/ui/SoftPress";
import { useLensThreadsQuery } from "@/lib/lens/send";
import { useLensStore } from "@/lib/store/lens";
import type { ChatThread } from "@/lib/types/db";
import { space, useTheme } from "@/theme";

/** L2 — Thread list. */
export default function LensThreadsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const bodySm = type("bodySm");
  const threads = useLensThreadsQuery();
  const setActiveThreadId = useLensStore((s) => s.setActiveThreadId);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const openThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    router.push(`/(app)/lens/thread/${thread.id}` as Href);
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Threads"
          subtitle="Your Lens conversations"
          onBack={() => router.back()}
        />
        {threads.isError ? (
          <EmptyState
            title="Couldn’t load threads"
            body="Try again in a moment. Local threads return when storage is ready."
            withOrb={false}
          />
        ) : !threads.data?.length ? (
          <EmptyState
            title="No threads yet"
            body="Send a first message from Lens — conversations stay here."
            actionLabel="Open Lens"
            onAction={() => router.replace("/(app)/lens" as Href)}
          />
        ) : (
          <FlatList
            data={threads.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GlassPanel style={styles.card} padded={false}>
                <SoftPress
                  onPress={() => openThread(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  scale={false}
                  style={styles.row}
                >
                  <View style={styles.copy}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: body.fontFamily,
                        fontSize: body.fontSize,
                        lineHeight: body.lineHeight,
                        color: colors.text1,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontFamily: meta.fontFamily,
                        fontSize: 10,
                        letterSpacing: meta.letterSpacing,
                        color: colors.text3,
                        textTransform: "uppercase",
                      }}
                    >
                      {new Date(item.updated_at).toLocaleString()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: bodySm.fontFamily,
                      color: colors.text2,
                    }}
                  >
                    Open
                  </Text>
                </SoftPress>
              </GlassPanel>
            )}
          />
        )}
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: {
    paddingHorizontal: space.md,
    paddingBottom: 120,
    gap: space.sm,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  copy: {
    flex: 1,
  },
});
