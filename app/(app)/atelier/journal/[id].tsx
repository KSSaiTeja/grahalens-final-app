import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash2 } from "lucide-react-native";

import { MoodPicker } from "@/components/atelier";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  JOURNAL_MOOD_LABELS,
  useJournalEntryQuery,
  useRemoveJournalMutation,
  useUpdateJournalMutation,
  type JournalMood,
} from "@/lib/atelier";
import { radii, space, useTheme } from "@/theme";

/** R4 — Entry detail + edit / delete. Offline-capable. */
export default function JournalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const entry = useJournalEntryQuery(id);
  const update = useUpdateJournalMutation();
  const remove = useRemoveJournalMutation();
  const [draft, setDraft] = useState("");
  const [mood, setMood] = useState<JournalMood | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (entry.data) {
      setDraft(entry.data.body);
      setMood(entry.data.mood);
    }
  }, [entry.data]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (entry.isLoading) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Note" onBack={() => router.back()} />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  if (!entry.data) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Note" onBack={() => router.back()} />
          <GlassPanel style={styles.missing}>
            <Text
              style={{
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                color: colors.text1,
                textAlign: "center",
              }}
            >
              This note is no longer on this device.
            </Text>
          </GlassPanel>
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  const record = entry.data;
  const dirty =
    draft.trim() !== record.body || mood !== record.mood;

  const onSave = async () => {
    if (!dirty || update.isPending) return;
    await update.mutateAsync({
      entryId: record.id,
      patch: { body: draft.trim(), mood },
    });
    setEditing(false);
  };

  const onDelete = () => {
    Alert.alert("Delete note", "Remove this journal entry from this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await remove.mutateAsync(record.id);
          router.back();
        },
      },
    ]);
  };

  const day = new Date(record.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Note"
          subtitle={day}
          onBack={() => router.back()}
          actionIcon={Trash2}
          actionLabel="Delete note"
          onAction={onDelete}
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
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              {record.mood
                ? JOURNAL_MOOD_LABELS[record.mood]
                : "Untagged"}
              {record.weatherSnapshot?.dominant
                ? ` · ${record.weatherSnapshot.dominant}`
                : ""}
              {record.dashaKey ? ` · ${record.dashaKey}` : ""}
            </Text>

            {editing ? (
              <>
                <View style={styles.mood}>
                  <MoodPicker value={mood} onChange={setMood} />
                </View>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  textAlignVertical="top"
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
                  accessibilityLabel="Edit journal body"
                />
                <Button
                  label="Save changes"
                  onPress={onSave}
                  loading={update.isPending}
                  disabled={!dirty || !draft.trim() || update.isPending}
                  style={styles.cta}
                />
                <Button
                  label="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setDraft(record.body);
                    setMood(record.mood);
                    setEditing(false);
                  }}
                />
              </>
            ) : (
              <>
                <Text
                  style={{
                    marginTop: space.md,
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight + 4,
                    color: colors.text1,
                  }}
                >
                  {record.body}
                </Text>
                {record.weatherSnapshot?.prompt ? (
                  <GlassPanel style={styles.prompt}>
                    <Text
                      style={{
                        fontFamily: meta.fontFamily,
                        fontSize: 10,
                        letterSpacing: meta.letterSpacing,
                        color: colors.text3,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Prompt that day
                    </Text>
                    <Text
                      style={{
                        fontFamily: body.fontFamily,
                        fontSize: body.fontSize,
                        lineHeight: body.lineHeight,
                        color: colors.text2,
                      }}
                    >
                      {record.weatherSnapshot.prompt}
                    </Text>
                  </GlassPanel>
                ) : null}
                <Button
                  label="Edit"
                  variant="secondary"
                  onPress={() => setEditing(true)}
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
  },
  missing: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
  },
  mood: {
    marginTop: space.md,
  },
  input: {
    marginTop: space.md,
    minHeight: 200,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.md,
  },
  prompt: {
    marginTop: space.lg,
    borderRadius: 24,
  },
  cta: {
    alignSelf: "stretch",
    marginTop: space.lg,
  },
});
