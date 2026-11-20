import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";

import { JournalEntryRow } from "@/components/atelier";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useJournalListQuery } from "@/lib/atelier";
import { space, useTheme } from "@/theme";

const EMPTY_COPY =
  "No field notes yet. Write beside today’s weather — the page stays on this device.";

/** R2 — Journal entry list. */
export default function JournalListScreen() {
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();
  const { data: entries, isLoading } = useJournalListQuery();

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onNew = () => router.push("/(app)/atelier/journal/new" as Href);
  const empty = !isLoading && (entries?.length ?? 0) === 0;

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="journal-list">
        <ScreenHeader
          title="Journal"
          subtitle="Field notes"
          onBack={() => router.back()}
          actionIcon={Plus}
          actionLabel="New entry"
          actionTestID="journal-new"
          onAction={onNew}
        />
        {empty ? (
          <EmptyState
            title="Journal"
            body={EMPTY_COPY}
            actionLabel="Write a note"
            onAction={onNew}
            withOrb={false}
          />
        ) : (
          <FlatList
            data={entries ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <JournalEntryRow
                entry={item}
                onPress={() =>
                  router.push(`/(app)/atelier/journal/${item.id}` as Href)
                }
              />
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
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
});
