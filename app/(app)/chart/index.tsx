import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, GitFork, Settings, Timer, UserRound } from 'lucide-react-native';

import {
  LivingChart,
  PlacementList,
  PlanetSheet,
  UnknownTimeBanner,
} from '@/components/chart';
import { SoftPress } from '@/components/ui/SoftPress';
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ChartBodyId } from '@/lib/chart';
import { useResolvedNatal } from '@/lib/sky/resolve-natal';
import { useTheme } from '@/theme';

const CHART_LINKS = [
  { label: 'Profile', href: '/(app)/chart/profile' as Href, icon: UserRound },
  { label: 'Dasha', href: '/(app)/chart/dasha' as Href, icon: Timer },
  { label: 'Transits', href: '/(app)/chart/transits' as Href, icon: Activity },
  { label: 'Aspects', href: '/(app)/chart/aspects' as Href, icon: GitFork },
];

/**
 * C1 — Living Chart + placements + planet sheet to C2.
 * Store natal preferred; Chart A fixture when empty (verify path).
 */
export default function ChartScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const { natal: chart, usingFixture } = useResolvedNatal();
  const [selectedId, setSelectedId] = useState<ChartBodyId | null>(null);
  const meta = type('meta');

  const onSelect = useCallback((id: ChartBodyId) => {
    setSelectedId(id);
  }, []);

  const onCloseSheet = useCallback(() => {
    setSelectedId(null);
  }, []);

  const onOpenFull = useCallback(
    (id: ChartBodyId) => {
      router.push(`/(app)/chart/planet/${id}` as Href);
    },
    [router],
  );

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!chart) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={['top']}>
          <EmptyState
            title="Chart"
            body="Complete birth details to open your Living Chart."
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScreenHeader
          title="Living Chart"
          subtitle={`Natal placements${usingFixture ? ' · Fixture A' : ''}`}
          actionIcon={Settings}
          actionLabel="Open settings"
          actionTestID="chart-open-settings"
          onAction={() => router.push('/settings' as Href)}
        />
        <ScrollView
          testID="chart-home"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <OfflineBanner />
          <GlassPanel padded={false} style={styles.links}>
            {CHART_LINKS.map(({ label, href, icon: Glyph }) => (
              <SoftPress
                key={label}
                onPress={() => router.push(href)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${label}`}
                accessibilityHint={`Navigates to the ${label} screen`}
                android_ripple={{ color: colors.hairlineStrong }}
                style={[
                  styles.linkChip,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.hairlineStrong,
                  },
                ]}
              >
                <View
                  style={[
                    styles.linkIcon,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.hairlineStrong,
                    },
                  ]}
                >
                  <Glyph size={17} color={colors.text1} strokeWidth={1.9} />
                </View>
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text1,
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </Text>
              </SoftPress>
            ))}
          </GlassPanel>

          {chart.lagnaApproximate ? (
            <UnknownTimeBanner style={styles.banner} />
          ) : null}

          <LivingChart
            chart={chart}
            selectedId={selectedId}
            onSelect={onSelect}
            style={styles.wheel}
          />

          <Text
            style={{
              marginTop: 28,
              marginBottom: 8,
              paddingHorizontal: 4,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: 'uppercase',
            }}
          >
            Placements
          </Text>
          <PlacementList
            chart={chart}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </ScrollView>

        <PlanetSheet
          visible={selectedId != null}
          onClose={onCloseSheet}
          chart={chart}
          bodyId={selectedId}
          onOpenFull={onOpenFull}
        />
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
  links: {
    flexDirection: 'row',
    borderRadius: 26,
    marginBottom: 16,
    padding: 8,
    gap: 8,
  },
  linkChip: {
    minHeight: 68,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  linkIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginBottom: 16,
  },
  wheel: {
    marginTop: 8,
  },
});
