import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/theme';
import { Wordmark } from '@/components/brand/Wordmark';
import { LensOrb, type LensOrbState } from '@/components/brand/LensOrb';
import { ObservatoryGrain } from '@/components/brand/ObservatoryGrain';
import {
  ObservatoryTabBar,
  TAB_ORDER,
  type ObservatoryTabName,
} from '@/components/brand/ObservatoryTabBar';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { Pill } from '@/components/ui/Pill';
import { Hairline } from '@/components/ui/Hairline';
import { Scrubber } from '@/components/ui/Scrubber';
import { EmptyState } from '@/components/ui/EmptyState';
import { SheetScaffold } from '@/components/ui/SheetScaffold';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconButton } from '@/components/ui/IconButton';
import { OptionRow } from '@/components/ui/OptionRow';
import { LockGlyph } from '@/components/billing/LockGlyph';
import { QuotaChip } from '@/components/billing/QuotaChip';
import {
  ALL_ICON_NAMES,
  Icon,
  type IconName,
} from '@/components/icons/Icon';

const ORB_STATES: LensOrbState[] = [
  'idle',
  'reading',
  'thinking',
  'speaking',
  'found',
  'alert',
];

const ICON_SIZES = [16, 24, 32] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors, type } = useTheme();
  const meta = type('meta');
  return (
    <View style={styles.section}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: meta.fontSize,
          lineHeight: meta.lineHeight,
          letterSpacing: meta.letterSpacing,
          textTransform: 'uppercase',
          color: colors.text3,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  const { colors, type } = useTheme();
  const degree = type('degree');
  return (
    <View style={styles.swatch}>
      <View
        style={[
          styles.swatchChip,
          { backgroundColor: hex, borderColor: colors.hairline },
        ]}
      />
      <Text
        style={{
          fontFamily: degree.fontFamily,
          fontSize: 11,
          color: colors.text2,
          marginTop: 6,
        }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
}

export default function DevSystemScreen() {
  const { colors, type, theme, reduceMotion } = useTheme();
  const [scrub, setScrub] = useState(0.42);
  const [pillOn, setPillOn] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ObservatoryTabName>('sky');

  const body = type('body');
  const bodySm = type('bodySm');
  const title = type('title');

  const tokenEntries = useMemo(
    () =>
      (
        [
          ['void', colors.void],
          ['surface', colors.surface],
          ['raised', colors.raised],
          ['text-1', colors.text1],
          ['text-2', colors.text2],
          ['text-3', colors.text3],
          ['accent', colors.accent],
          ['cta', colors.cta],
          ['onCta', colors.onCta],
          ['positive', colors.positive],
          ['caution', colors.caution],
          ['critical', colors.critical],
          ['info', colors.info],
        ] as const
      ).map(([name, hex]) => ({ name, hex })),
    [colors],
  );

  const iconsByGroup = useMemo(() => {
    const groups: Record<string, IconName[]> = {
      tabs: [],
      graha: [],
      system: [],
      domains: [],
      weather: [],
    };
    for (const name of ALL_ICON_NAMES) {
      const g = name.split('.')[0];
      if (g === 'tab') groups.tabs?.push(name);
      else if (g === 'graha') groups.graha?.push(name);
      else if (g === 'system') groups.system?.push(name);
      else if (g === 'domain') groups.domains?.push(name);
      else if (g === 'weather') groups.weather?.push(name);
    }
    return groups;
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.void }]}>
        <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Wordmark />
            <Text
              style={{
                marginTop: 8,
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                lineHeight: title.lineHeight,
                color: colors.text1,
              }}
            >
              Design system
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
              }}
            >
              Theme {theme}
              {reduceMotion ? ' · reduced motion' : ''}
            </Text>

            <Section title="Theme">
              <ThemeToggle />
            </Section>

            <Section title="Tokens">
              <View style={styles.swatchRow}>
                {tokenEntries.map((t) => (
                  <Swatch key={t.name} name={t.name} hex={t.hex} />
                ))}
              </View>
            </Section>

            <Section title="Grain + wash">
              <ObservatoryGrain opening={0.75} style={styles.grainPreview}>
                <View style={styles.grainInner}>
                  <Text
                    style={{
                      fontFamily: body.fontFamily,
                      color: colors.text2,
                      fontSize: 14,
                    }}
                  >
                    Opening accent ≤ 4%
                  </Text>
                </View>
              </ObservatoryGrain>
            </Section>

            <Section title="Lens orb states">
              <View style={styles.orbRow}>
                {ORB_STATES.map((s) => (
                  <View key={s} style={styles.orbItem}>
                    <LensOrb size={36} state={s} />
                    <Text
                      style={{
                        marginTop: 8,
                        fontFamily: bodySm.fontFamily,
                        fontSize: 11,
                        color: colors.text3,
                      }}
                    >
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Primitives">
              <Button label="Primary CTA" onPress={() => undefined} />
              <View style={{ height: 10 }} />
              <Button
                label="Secondary"
                variant="secondary"
                onPress={() => undefined}
              />
              <View style={{ height: 10 }} />
              <Button label="Ghost" variant="ghost" onPress={() => undefined} />
              <View style={{ height: 16 }} />
              <Surface>
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    color: colors.text1,
                  }}
                >
                  Surface — interactive clusters only
                </Text>
              </Surface>
              <View style={{ height: 12 }} />
              <GlassPanel>
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    color: colors.text1,
                  }}
                >
                  Glass panel — content layered into an atmospheric scene
                </Text>
              </GlassPanel>
              <View style={{ height: 12 }} />
              <OptionRow
                label="Selected answer"
                detail="Single-task onboarding control"
                selected={pillOn}
                onPress={() => setPillOn((v) => !v)}
              />
              <View style={{ height: 12 }} />
              <View style={styles.row}>
                <IconButton
                  icon={Bell}
                  label="Notifications"
                  onPress={() => undefined}
                />
                <IconButton
                  icon={Sparkles}
                  label="Lens"
                  selected
                  onPress={() => undefined}
                />
              </View>
              <View style={{ height: 12 }} />
              <View style={styles.row}>
                <Pill
                  label="Selected"
                  selected={pillOn}
                  onPress={() => setPillOn((v) => !v)}
                />
                <Pill label="Quiet" onPress={() => undefined} />
              </View>
              <View style={{ height: 16 }} />
              <Hairline />
              <View style={{ height: 8 }} />
              <Hairline strong />
              <View style={{ height: 16 }} />
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  color: colors.text2,
                  marginBottom: 4,
                }}
              >
                Scrubber {scrub.toFixed(2)}
              </Text>
              <Scrubber value={scrub} onChange={setScrub} />
              <View style={{ height: 12 }} />
              <View style={styles.row}>
                <LockGlyph onPress={() => setSheetOpen(true)} />
                <QuotaChip used={3} limit={5} onPress={() => setSheetOpen(true)} />
              </View>
              <View style={{ height: 12 }} />
              <Button
                label="Open sheet"
                variant="secondary"
                onPress={() => setSheetOpen(true)}
              />
              <EmptyState
                title="Empty observatory"
                body="No one in your sky yet. Add a birth to see how two charts braid."
                actionLabel="Add a birth"
                onAction={() => undefined}
              />
            </Section>

            <Section title="Icon sheet">
              {(
                Object.entries(iconsByGroup) as Array<[string, IconName[]]>
              ).map(([group, names]) => (
                <View key={group} style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontFamily: bodySm.fontFamily,
                      color: colors.text2,
                      marginBottom: 10,
                    }}
                  >
                    {group} ({names.length})
                  </Text>
                  {names.map((name) => (
                    <View key={name} style={styles.iconRow}>
                      <Text
                        style={[
                          styles.iconName,
                          {
                            fontFamily: bodySm.fontFamily,
                            color: colors.text3,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                      <View style={styles.iconSizes}>
                        {ICON_SIZES.map((sz) => (
                          <View key={sz} style={styles.iconCell}>
                            <Icon name={name} size={sz} color={colors.text1} />
                            <Text
                              style={{
                                fontSize: 9,
                                color: colors.text3,
                                marginTop: 4,
                              }}
                            >
                              {sz}
                            </Text>
                          </View>
                        ))}
                        <View style={styles.iconCell}>
                          <Icon name={name} size={24} color={colors.accent} />
                          <Text
                            style={{
                              fontSize: 9,
                              color: colors.accent,
                              marginTop: 4,
                            }}
                          >
                            accent
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </Section>

            <Section title="Tab bar mock (all 5 active states)">
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  color: colors.text2,
                  marginBottom: 12,
                }}
              >
                Each row = one tab active (brand orange). Sticky live bar below.
              </Text>
              {TAB_ORDER.map((tab) => (
                <View key={tab} style={styles.tabMockBlock}>
                  <Text
                    style={{
                      fontFamily: bodySm.fontFamily,
                      fontSize: 12,
                      color: colors.text3,
                      marginBottom: 6,
                    }}
                  >
                    active → {tab}
                  </Text>
                  <View
                    style={[
                      styles.tabMockChrome,
                      { borderColor: colors.hairline },
                    ]}
                  >
                    <ObservatoryTabBar
                      activeTab={tab}
                      onTabPress={setActiveTab}
                      omitSafeArea
                      lensOrbWhenActive={false}
                    />
                  </View>
                </View>
              ))}
            </Section>

            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>

        <ObservatoryTabBar
          activeTab={activeTab}
          onTabPress={setActiveTab}
          lensOrbWhenActive={false}
        />

        <SheetScaffold
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Sheet scaffold"
        >
          <Text
            style={{
              fontFamily: body.fontFamily,
              color: colors.text2,
              marginBottom: 16,
            }}
          >
            Hairline grabber. This opens with Private.
          </Text>
          <Button label="Close" onPress={() => setSheetOpen(false)} />
        </SheetScaffold>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  section: {
    marginTop: 28,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 72,
  },
  swatchChip: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  grainPreview: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
  },
  grainInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  orbItem: {
    alignItems: 'center',
    width: 72,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  iconRow: {
    marginBottom: 14,
  },
  iconName: {
    fontSize: 12,
    marginBottom: 8,
  },
  iconSizes: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  iconCell: {
    alignItems: 'center',
    minWidth: 40,
  },
  tabMockBlock: {
    marginBottom: 16,
  },
  tabMockChrome: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
});
