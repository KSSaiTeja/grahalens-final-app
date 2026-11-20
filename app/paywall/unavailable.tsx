import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WifiOff } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { errorCopy } from "@/lib/errors/catalog";
import { useTheme, space } from "@/theme";

export default function PaywallUnavailableScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const title = type("displayL");
  const body = type("body");
  const catalog = errorCopy("store_down");

  return (
    <AtmosphericBackground atmosphere="calm">
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <View
            style={[styles.iconCircle, { backgroundColor: colors.surface }]}
          >
            <WifiOff size={28} color={colors.text3} strokeWidth={1.8} />
          </View>
          <Text
            style={{
              marginTop: 28,
              fontFamily: title.fontFamily,
              fontSize: 26,
              lineHeight: 32,
              letterSpacing: title.letterSpacing,
              color: colors.text1,
              textAlign: "center",
            }}
          >
            {catalog.title}
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: colors.text2,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            {catalog.body}
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            label="Go back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: space.lg,
  },
});
