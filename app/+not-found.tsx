import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { errorCopy } from "@/lib/errors/catalog";
import { space, useTheme } from "@/theme";

/** G6 — Honest 404 (SCREENS.md). */
export default function NotFoundScreen() {
  const router = useRouter();
  const { colors, type, fontsLoaded } = useTheme();
  const title = type("displayL");
  const body = type("body");
  const copy = errorCopy("not_found");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerShown: false }} />
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
          <View style={styles.center} testID="not-found">
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: 26,
                lineHeight: 32,
                letterSpacing: title.letterSpacing,
                color: colors.text1,
                textAlign: "center",
              }}
            >
              {copy.title}
            </Text>
            <Text
              style={{
                marginTop: 12,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text2,
                textAlign: "center",
                paddingHorizontal: 28,
              }}
            >
              {copy.body}
            </Text>
          </View>
          <View style={styles.footer}>
            <Button
              label="Back to Sky"
              onPress={() => router.replace("/(app)/sky" as Href)}
            />
          </View>
        </SafeAreaView>
      </AtmosphericBackground>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: space.lg,
  },
});
