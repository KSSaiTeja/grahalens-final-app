import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Inbox } from "lucide-react-native";

import {
  ChartPeek,
  LensNoteCard,
  MuhurtaStrip,
  SkyWeatherField,
} from "@/components/sky";
import { BillingIssueBanner } from "@/components/billing/BillingIssueBanner";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { NavLink } from "@/components/ui/NavLink";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { computeDaySky } from "@/lib/sky/daily-notes";
import { civilDateInTz } from "@/lib/sky/archive";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { shouldWeatherDrift } from "@/lib/sky/sky-weather";
import { useTheme } from "@/theme";

/**
 * S1 — Sky home composition (BRAND §07):
 * wordmark + Sky Weather + Lens note + Muhurta strip + chart peek.
 * G2 offline + G3 billing-issue banners; weather-drift when Opening > 0.6.
 */
export default function SkyHomeScreen() {
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();
  const { natal, usingFixture } = useResolvedNatal();

  const today = useMemo(
    () => civilDateInTz(new Date(), natal.tz),
    [natal.tz],
  );

  const day = useMemo(() => computeDaySky(natal, today), [natal, today]);
  const drift = shouldWeatherDrift(day.weather);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral" drift={drift}>
      <SafeAreaView style={styles.fill} edges={["top"]} testID="sky-home">
        <ScreenHeader
          title="Sky"
          subtitle={`${today}${usingFixture ? " · Fixture A" : ""}`}
          actionIcon={Inbox}
          actionLabel="Open inbox"
          onAction={() => router.push("/(app)/sky/inbox" as Href)}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <OfflineBanner />
          <BillingIssueBanner />

          <SkyWeatherField
            weather={day.weather}
            onPress={() => router.push("/(app)/sky/weather" as Href)}
          />

          <View style={styles.block}>
            <LensNoteCard
              text={day.noteText}
              metaLabel="Lens"
              onPress={() => router.push("/(app)/sky/inbox" as Href)}
            />
          </View>

          <View style={styles.block}>
            <MuhurtaStrip
              moments={day.moments}
              tz={natal.tz}
              onSelect={(id) =>
                router.push(`/(app)/sky/muhurta/${encodeURIComponent(id)}` as Href)
              }
            />
          </View>

          <View style={styles.block}>
            <ChartPeek
              natal={natal}
              onPress={() => router.push("/(app)/chart" as Href)}
            />
          </View>

          <NavLink
            label="Open day archive"
            onPress={() => router.push(`/(app)/sky/day/${today}` as Href)}
            accessibilityLabel="Open day archive"
            style={styles.archiveLink}
            testID="sky-open-archive"
          />
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  block: {
    marginTop: 22,
  },
  archiveLink: {
    marginTop: 24,
  },
});
