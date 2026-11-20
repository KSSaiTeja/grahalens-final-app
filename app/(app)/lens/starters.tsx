import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { SoftPress } from "@/components/ui/SoftPress";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  chartGroundedStarters,
  starterTopicMeta,
  startersForTopic,
  type StarterTopic,
} from "@/lib/lens/starters";
import { useSendLensMessage } from "@/lib/lens/send";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useLensStore } from "@/lib/store/lens";
import { fontFamilies, radii, space, useTheme } from "@/theme";

const TOPICS: StarterTopic[] = ["love", "work", "self"];

/** L4 — Starter prompts by topic (love / work / self). */
export default function LensStartersScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const { natal } = useResolvedNatal();
  const [topic, setTopic] = useState<StarterTopic>("love");
  const send = useSendLensMessage();
  const setActiveThreadId = useLensStore((s) => s.setActiveThreadId);

  const prompts = useMemo(
    () => startersForTopic(natal, topic),
    [natal, topic],
  );

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onPick = async (prompt: string) => {
    setActiveThreadId(null);
    const result = await send.mutateAsync({ content: prompt, threadId: null });
    if (!result.gated) {
      router.replace("/(app)/lens" as Href);
    }
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Starters"
          subtitle="Grounded in your chart"
          onBack={() => router.back()}
        />
        <View style={styles.topics}>
          {TOPICS.map((t) => {
            const selected = t === topic;
            const meta = starterTopicMeta(t);
            return (
              <SoftPress
                key={t}
                onPress={() => setTopic(t)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.topic,
                  {
                    backgroundColor: selected
                      ? colors.accentSoft
                      : colors.surface,
                    borderColor: selected ? colors.accent : colors.hairline,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.bodyMedium,
                    fontSize: body.fontSize,
                    color: colors.text1,
                  }}
                >
                  {meta.title}
                </Text>
              </SoftPress>
            );
          })}
        </View>
        <Text
          style={{
            paddingHorizontal: space.md,
            marginBottom: space.md,
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            lineHeight: bodySm.lineHeight,
            color: colors.text2,
          }}
        >
          {starterTopicMeta(topic).blurb}
        </Text>
        <ScrollView contentContainerStyle={styles.list}>
          {prompts.map((p) => (
            <GlassPanel key={p.id} style={styles.card}>
              <SoftPress
                onPress={() => onPick(p.prompt)}
                disabled={send.isPending}
                accessibilityRole="button"
                accessibilityLabel={p.label}
                scale={false}
              >
                <Text
                  style={{
                    fontFamily: fontFamilies.bodyMedium,
                    fontSize: body.fontSize,
                    color: colors.text1,
                    marginBottom: 6,
                  }}
                >
                  {p.label}
                </Text>
                <Text
                  style={{
                    fontFamily: bodySm.fontFamily,
                    fontSize: bodySm.fontSize,
                    lineHeight: bodySm.lineHeight,
                    color: colors.text2,
                  }}
                >
                  {p.prompt}
                </Text>
              </SoftPress>
            </GlassPanel>
          ))}
          <Text
            style={{
              marginTop: space.md,
              fontFamily: bodySm.fontFamily,
              color: colors.text3,
              textAlign: "center",
            }}
          >
            {chartGroundedStarters(natal).length} core chips also live on Lens
            home.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topics: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    marginBottom: space.sm,
  },
  topic: {
    flex: 1,
    alignItems: "center",
    paddingVertical: space.sm,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: space.md,
    paddingBottom: 120,
    gap: space.sm,
  },
  card: {
    marginBottom: 0,
  },
});
