import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DayArchiveList,
  LensNoteCard,
  MuhurtaStrip,
  SkyHeader,
  SkyWeatherField,
  type ArchiveDayRow,
} from "@/components/sky";
import { EmptyState } from "@/components/ui/EmptyState";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { LockGlyph } from "@/components/billing/LockGlyph";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import {
  ARCHIVE_LIST_DAYS,
  civilDateInTz,
  formatCivilLabel,
  isArchiveDateUnlocked,
  listArchiveDates,
} from "@/lib/sky/archive";
import { computeDaySky } from "@/lib/sky/daily-notes";
import { AXIS_LABELS } from "@/lib/sky/format";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { shouldWeatherDrift } from "@/lib/sky/sky-weather";
import { useTheme } from "@/theme";

/**
 * S4 — Day archive. Free: last 7 civil days. Older gated with LockGlyph
 * into the shared paywall sheet.
 */
export default function DayArchiveScreen() {
  const router = useRouter();
  const { date: rawDate } = useLocalSearchParams<{ date: string }>();
  const paramDate = Array.isArray(rawDate) ? rawDate[0] : rawDate;

  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const { natal, usingFixture } = useResolvedNatal();

  /** Private entitlement — live via BillingProvider / useIsPrivate. */
  const isPrivate = useIsPrivate();

  const today = useMemo(
    () => civilDateInTz(new Date(), natal.tz),
    [natal.tz],
  );

  const selectedDate =
    paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : today;

  const unlocked = isArchiveDateUnlocked(selectedDate, today, isPrivate);

  const archiveRows: ArchiveDayRow[] = useMemo(() => {
    return listArchiveDates(today, ARCHIVE_LIST_DAYS).map((d) => {
      const payload = computeDaySky(natal, d);
      return {
        date: d,
        unlocked: isArchiveDateUnlocked(d, today, isPrivate),
        dominantLabel: AXIS_LABELS[payload.weather.dominant],
      };
    });
  }, [natal, today, isPrivate]);

  const day = useMemo(
    () => (unlocked ? computeDaySky(natal, selectedDate) : null),
    [natal, selectedDate, unlocked],
  );

  const onLockedPress = useCallback(() => {
    const gate = requirePrivate("archive");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  }, [router]);

  const onSelectUnlocked = useCallback(
    (date: string) => {
      router.setParams({ date });
    },
    [router],
  );

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const opening = day?.weather.axes.opening.value ?? 0;
  const drift = day ? shouldWeatherDrift(day.weather) : false;

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <SkyHeader
            title="Day archive"
            subtitle={
              usingFixture
                ? `${formatCivilLabel(selectedDate, natal.tz)} · Fixture A`
                : formatCivilLabel(selectedDate, natal.tz)
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <DayArchiveList
            days={archiveRows}
            tz={natal.tz}
            selectedDate={selectedDate}
            onSelectUnlocked={onSelectUnlocked}
            onLockedPress={onLockedPress}
          />

          <View style={styles.detail}>
            {!unlocked || !day ? (
              <View style={styles.locked}>
                <LockGlyph size={18} onPress={onLockedPress} />
                <EmptyState
                  title="Older than seven days"
                  body="Free preview keeps a week of sky. Private opens the full archive."
                  withOrb={false}
                  actionLabel="About Private"
                  onAction={onLockedPress}
                />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text3,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  {selectedDate === today ? "Today" : selectedDate}
                </Text>
                <SkyWeatherField
                  weather={day.weather}
                  onPress={() => router.push("/(app)/sky/weather" as Href)}
                />
                <View style={styles.block}>
                  <LensNoteCard text={day.noteText} metaLabel="Lens" />
                </View>
                <View style={styles.block}>
                  <MuhurtaStrip
                    moments={day.moments}
                    tz={natal.tz}
                    onSelect={(id) =>
                      router.push(
                        `/(app)/sky/muhurta/${encodeURIComponent(id)}` as Href,
                      )
                    }
                  />
                </View>
                <Text
                  style={{
                    marginTop: 20,
                    fontFamily: body.fontFamily,
                    fontSize: 13,
                    color: colors.text3,
                  }}
                >
                  Computed for noon local · {natal.tz}
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 24 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  detail: {
    marginTop: 28,
  },
  block: {
    marginTop: 22,
  },
  locked: {
    alignItems: "center",
    paddingTop: 8,
  },
});
