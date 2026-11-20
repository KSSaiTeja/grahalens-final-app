import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import { useLensMemoriesQuery } from "@/lib/lens/send";
import { useLensUserId, resolveMemoryStore } from "@/lib/lens/session";
import {
  createMemoryApi,
  isMemoryPinned,
  memoryKeys,
} from "@/lib/memory";
import type { Memory } from "@/lib/types/db";
import { radii, space, useTheme } from "@/theme";

/** Shared L5 / X6 memory manager body. */
export function MemoriesManager() {
  const { colors, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const userId = useLensUserId();
  const memories = useLensMemoriesQuery();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const api = createMemoryApi(resolveMemoryStore());

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: memoryKeys.list(userId) });

  const onAdd = async () => {
    const bodyText = draft.trim();
    if (!bodyText) return;
    setBusyId("new");
    try {
      await api.create(userId, { body: bodyText, source: "lens" });
      setDraft("");
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const onTogglePin = async (memory: Memory) => {
    setBusyId(memory.id);
    try {
      await api.setPinned(userId, memory.id, !isMemoryPinned(memory));
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = (memory: Memory) => {
    Alert.alert("Delete memory", "Remove this note from Lens context?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setBusyId(memory.id);
          try {
            await api.remove(userId, memory.id);
            await refresh();
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.fill}>
      <GlassPanel style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Something Lens should remember…"
          placeholderTextColor={colors.text3}
          multiline
          style={{
            minHeight: 56,
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: colors.text1,
          }}
          accessibilityLabel="New memory"
        />
        <Button
          label="Save memory"
          onPress={() => void onAdd()}
          loading={busyId === "new"}
          disabled={!draft.trim() || busyId === "new"}
          style={styles.save}
        />
      </GlassPanel>

      {!memories.data?.length ? (
        <EmptyState
          title="No memories yet"
          body="Pin notes Lens may use as soft context — never invented facts."
          withOrb={false}
        />
      ) : (
        <FlatList
          data={memories.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const pinned = isMemoryPinned(item);
            return (
              <GlassPanel style={styles.card}>
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
                  {pinned ? "Pinned" : "Memory"} · {item.source}
                </Text>
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                  }}
                >
                  {item.body}
                </Text>
                <View style={styles.actions}>
                  <SoftPress
                    onPress={() => void onTogglePin(item)}
                    disabled={busyId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={pinned ? "Unpin" : "Pin"}
                    style={[
                      styles.action,
                      {
                        borderColor: colors.hairline,
                        backgroundColor: pinned
                          ? colors.accentSoft
                          : colors.raised,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: bodySm.fontFamily,
                        color: colors.text1,
                      }}
                    >
                      {pinned ? "Unpin" : "Pin"}
                    </Text>
                  </SoftPress>
                  <SoftPress
                    onPress={() => onDelete(item)}
                    disabled={busyId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel="Delete memory"
                    style={[
                      styles.action,
                      {
                        borderColor: colors.hairline,
                        backgroundColor: colors.raised,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: bodySm.fontFamily,
                        color: colors.critical,
                      }}
                    >
                      Delete
                    </Text>
                  </SoftPress>
                </View>
              </GlassPanel>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  composer: {
    marginHorizontal: space.md,
    marginBottom: space.md,
  },
  save: {
    marginTop: space.sm,
  },
  list: {
    paddingHorizontal: space.md,
    paddingBottom: 120,
    gap: space.sm,
  },
  card: {
    marginBottom: 0,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.md,
  },
  action: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
    justifyContent: "center",
  },
});
