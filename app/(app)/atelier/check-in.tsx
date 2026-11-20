import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { MoodPicker } from "@/components/atelier";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  CHECK_IN_SOURCE,
  formatCheckInMemory,
  type JournalMood,
} from "@/lib/atelier";
import { useLensUserId, resolveMemoryStore } from "@/lib/lens/session";
import { createMemoryApi, memoryKeys } from "@/lib/memory";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { computeSkyWeather } from "@/lib/sky/sky-weather";
import { radii, space, useTheme } from "@/theme";

/** R7 — Emotional check-in → writes a memory for Lens. */
export default function CheckInScreen() {
  const router = useRouter();
  const { natal } = useResolvedNatal();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const userId = useLensUserId();
  const queryClient = useQueryClient();
  const [mood, setMood] = useState<JournalMood | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const weather = useMemo(() => computeSkyWeather(natal, new Date()), [natal]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onSave = async () => {
    if (!mood || saving) return;
    setSaving(true);
    try {
      const api = createMemoryApi(resolveMemoryStore());
      const memoryBody = formatCheckInMemory({
        mood,
        note,
        weatherDominant: weather.dominant,
      });
      await api.create(userId, {
        body: memoryBody,
        source: CHECK_IN_SOURCE,
      });
      await queryClient.invalidateQueries({
        queryKey: memoryKeys.list(userId),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Check-in"
          subtitle="Feeds Lens memory"
          onBack={() => router.back()}
        />
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GlassPanel floating style={styles.weather}>
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                Today’s sky · {weather.dominant}
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text1,
                }}
              >
                Name how the day feels. This becomes a soft memory Lens may
                cite — never a diagnosis.
              </Text>
            </GlassPanel>

            {saved ? (
              <GlassPanel style={styles.done}>
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                    textAlign: "center",
                  }}
                >
                  Check-in saved to memory.
                </Text>
                <Text
                  style={{
                    marginTop: space.sm,
                    fontFamily: bodySm.fontFamily,
                    fontSize: bodySm.fontSize,
                    lineHeight: bodySm.lineHeight,
                    color: colors.text2,
                    textAlign: "center",
                  }}
                >
                  Lens can use it as quiet context on the next turn.
                </Text>
                <Button
                  label="Done"
                  onPress={() => router.back()}
                  style={styles.cta}
                />
                <Button
                  label="Another check-in"
                  variant="ghost"
                  onPress={() => {
                    setMood(null);
                    setNote("");
                    setSaved(false);
                  }}
                />
              </GlassPanel>
            ) : (
              <>
                <MoodPicker
                  value={mood}
                  onChange={setMood}
                  label="How it feels now"
                />
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Optional note…"
                  placeholderTextColor={colors.text3}
                  multiline
                  style={[
                    styles.input,
                    {
                      borderColor: colors.hairline,
                      backgroundColor: "rgba(255,255,255,0.55)",
                      fontFamily: body.fontFamily,
                      fontSize: body.fontSize,
                      lineHeight: body.lineHeight,
                      color: colors.text1,
                    },
                  ]}
                  accessibilityLabel="Optional check-in note"
                />
                <Button
                  label="Save to memory"
                  onPress={onSave}
                  loading={saving}
                  disabled={!mood || saving}
                  style={styles.cta}
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
  },
  weather: {
    borderRadius: 28,
  },
  input: {
    minHeight: 100,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  cta: {
    alignSelf: "stretch",
    marginTop: space.sm,
  },
  done: {
    borderRadius: 28,
    alignItems: "center",
  },
});
