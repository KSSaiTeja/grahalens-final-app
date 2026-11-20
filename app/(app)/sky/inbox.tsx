import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkyHeader } from "@/components/sky";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FREE_ARCHIVE_DAYS,
  civilDateInTz,
  listArchiveDates,
} from "@/lib/sky/archive";
import {
  buildInboxNotes,
  type DailyNote,
} from "@/lib/sky/daily-notes";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme } from "@/theme";

/**
 * S5 — Inbox of generated daily notes (today’s sky + muhurta, prior sky notes).
 */
export default function SkyInboxScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const bodySm = type("bodySm");
  const { natal, usingFixture } = useResolvedNatal();

  const today = useMemo(
    () => civilDateInTz(new Date(), natal.tz),
    [natal.tz],
  );

  const notes = useMemo(() => {
    const dates = listArchiveDates(today, FREE_ARCHIVE_DAYS);
    return buildInboxNotes(natal, dates);
  }, [natal, today]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const onOpen = (item: DailyNote) => {
    if (item.kind === "muhurta" && item.muhurtaId) {
      router.push(
        `/(app)/sky/muhurta/${encodeURIComponent(item.muhurtaId)}` as Href,
      );
      return;
    }
    router.push(`/(app)/sky/day/${item.date}` as Href);
  };

  const renderItem = ({ item }: { item: DailyNote }) => (
    <GlassPanel style={styles.itemCard}>
      <SoftPress
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      scale={false}
      style={styles.item}
    >
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.text3,
            textTransform: "uppercase",
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: colors.text1,
          }}
          numberOfLines={3}
        >
          {item.body}
        </Text>
      </View>
      </SoftPress>
    </GlassPanel>
  );

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="sky-inbox"
      >
        <View style={styles.pad}>
          <SkyHeader
            title="Inbox"
            subtitle={
              usingFixture
                ? `Today ${today} · Fixture A`
                : `Today ${today}`
            }
          />
          <Text
            style={{
              marginBottom: 8,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              color: colors.text2,
            }}
          >
            Today’s sky note and muhurta windows, plus a week of prior sky lines.
            Push stub content is this same list — not a second feed.
          </Text>
        </View>
        {notes.length === 0 ? (
          <EmptyState
            title="Quiet inbox"
            body="Notes appear once weather and muhurta can be computed for your chart."
            withOrb={false}
          />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(n) => n.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 24 },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  item: {
    paddingLeft: 14,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 22,
  },
  dot: {
    position: "absolute",
    left: 0,
    top: 22,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  copy: {
    paddingRight: 8,
  },
});
