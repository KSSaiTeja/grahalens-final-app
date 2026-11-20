import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { MoodPicker, WeatherPrompt } from "@/components/atelier";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  toWeatherSnapshot,
  useCreateJournalMutation,
  weatherLinkedPrompt,
  type JournalMood,
} from "@/lib/atelier";
import { computeDasha, currentDasha } from "@/lib/ephemeris/dasha";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { computeSkyWeather } from "@/lib/sky/sky-weather";
import { radii, space, useTheme } from "@/theme";

/** R3 — Compose with weather-linked prompt. Offline-capable. */
export default function JournalNewScreen() {
  const router = useRouter();
  const { natal } = useResolvedNatal();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const create = useCreateJournalMutation();
  const [draft, setDraft] = useState("");
  const [mood, setMood] = useState<JournalMood | null>(null);

  const weather = useMemo(() => computeSkyWeather(natal, new Date()), [natal]);
  const prompt = useMemo(() => weatherLinkedPrompt(weather), [weather]);
  const dashaKey = useMemo(() => {
    try {
      return currentDasha(computeDasha(natal), new Date()).maha.key;
    } catch {
      return null;
    }
  }, [natal]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onSave = async () => {
    const text = draft.trim();
    if (!text || create.isPending) return;
    const entry = await create.mutateAsync({
      body: text,
      mood,
      weatherSnapshot: toWeatherSnapshot(weather, prompt),
      dashaKey,
    });
    router.replace(`/(app)/atelier/journal/${entry.id}` as Href);
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="journal-new">
        <ScreenHeader
          title="New note"
          subtitle="Beside the sky"
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
            <WeatherPrompt prompt={prompt} dominant={weather.dominant} />
            <View style={styles.mood}>
              <MoodPicker value={mood} onChange={setMood} />
            </View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="What did you notice…"
              placeholderTextColor={colors.text3}
              multiline
              textAlignVertical="top"
              testID="journal-body"
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
              accessibilityLabel="Journal body"
            />
            <Button
              label="Save note"
              onPress={onSave}
              loading={create.isPending}
              disabled={!draft.trim() || create.isPending}
              style={styles.save}
              testID="journal-save"
            />
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
  mood: {
    marginTop: space.sm,
  },
  input: {
    minHeight: 200,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  save: {
    alignSelf: "stretch",
    marginTop: space.sm,
  },
});
