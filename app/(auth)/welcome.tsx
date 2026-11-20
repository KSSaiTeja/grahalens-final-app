import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";
import { Orbit, Sparkles, UsersRound } from "lucide-react-native";

import { Button } from "@/components/ui/Button";
import { SoftPress } from "@/components/ui/SoftPress";
import { ScreenEnter } from "@/components/ui/ScreenEnter";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Wordmark } from "@/components/brand/Wordmark";
import { useTheme, layout, space, radii, motion } from "@/theme";
import { markWelcomeSeen } from "@/lib/session";

const { width: SCREEN_W } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  body: string;
  Icon: typeof Sparkles;
};

const SLIDES: Slide[] = [
  {
    key: "companion",
    title: "A quiet companion",
    body: "Lens reads your chart and your notes — calm, specific, never theatrical.",
    Icon: Sparkles,
  },
  {
    key: "sky",
    title: "The sky, measured",
    body: "Daily weather and muhurta windows from real positions — computation before narration.",
    Icon: Orbit,
  },
  {
    key: "bonds",
    title: "Bonds, with evidence",
    body: "See friction and openings between charts. Private observatory — not a carnival.",
    Icon: UsersRound,
  },
];

function Dot({ active }: { active: boolean }) {
  const { colors, reduceMotion } = useTheme();
  const w = useSharedValue(active ? 22 : 8);

  React.useEffect(() => {
    w.value = withTiming(active ? 22 : 8, {
      duration: reduceMotion ? 0 : motion.dot.durationMs,
    });
  }, [active, reduceMotion, w]);

  const style = useAnimatedStyle(() => ({
    width: w.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        style,
        {
          backgroundColor: active ? colors.text1 : colors.hairlineStrong,
        },
      ]}
    />
  );
}

/**
 * A2 — ABY-style welcome: atmospheric field, glass card, black CTA.
 * Content & routing unchanged.
 */
export default function WelcomeScreen() {
  const { colors, type, fontsLoaded } = useTheme();
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const title = type("displayXl");
  const body = type("body");
  const meta = type("meta");

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const goContinue = async () => {
    await markWelcomeSeen();
    router.push("/(auth)/guest");
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral" style={styles.fill}>
      <SafeAreaView
        style={styles.fill}
        edges={["top", "bottom"]}
        testID="welcome-home"
      >
        <ScreenEnter>
          <View style={styles.header}>
            <Wordmark size={18} />
          </View>
        </ScreenEnter>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setIndex(i);
          }}
          renderItem={({ item }) => {
            const Glyph = item.Icon;
            return (
              <View style={[styles.slide, { width: SCREEN_W }]}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Glyph color={colors.accent} size={28} strokeWidth={1.8} />
                </View>
                <GlassPanel
                  floating
                  style={styles.glass}
                >
                  <Text
                    style={{
                      fontFamily: title.fontFamily,
                      fontSize: title.fontSize,
                      lineHeight: title.lineHeight,
                      letterSpacing: title.letterSpacing,
                      color: colors.text1,
                      textAlign: "center",
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: space.md,
                      fontFamily: body.fontFamily,
                      fontSize: body.fontSize,
                      lineHeight: body.lineHeight,
                      color: colors.text2,
                      textAlign: "center",
                    }}
                  >
                    {item.body}
                  </Text>
                </GlassPanel>
              </View>
            );
          }}
        />

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <Dot key={s.key} active={i === index} />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            label="Get started"
            icon={ArrowRight}
            onPress={goContinue}
            testID="welcome-get-started"
          />
          <SoftPress
            onPress={async () => {
              await markWelcomeSeen();
              router.push("/(auth)/sign-in");
            }}
            style={styles.secondary}
            accessibilityRole="link"
            accessibilityLabel="Sign in to existing account"
            scale={false}
          >
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: meta.fontSize,
                color: colors.text2,
              }}
            >
              Already have an account? Sign in
            </Text>
          </SoftPress>
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    alignItems: "center",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  glass: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radii.xl,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: space.lg,
  },
  dot: {
    height: 8,
    borderRadius: radii.pill,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
    gap: space.md,
  },
  secondary: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: layout.minHit,
  },
});
