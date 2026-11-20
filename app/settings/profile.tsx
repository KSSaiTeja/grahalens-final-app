import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  loadLocalProfile,
  saveLocalProfile,
} from "@/lib/settings/profile";
import { useSession } from "@/lib/session";
import { fontFamilies, space, useTheme } from "@/theme";

/**
 * X2 — Display name + email (read-only when signed in).
 */
export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const { mode, user } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  useEffect(() => {
    void loadLocalProfile().then((p) => setDisplayName(p.displayName));
  }, []);

  const onSave = async () => {
    setBusy(true);
    setSavedHint(null);
    try {
      await saveLocalProfile({ displayName });
      setSavedHint("Saved on this device.");
    } finally {
      setBusy(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const emailLabel =
    mode === "authenticated" && user?.email
      ? user.email
      : mode === "guest"
        ? "Guest observatory — no email"
        : "Not signed in";

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-profile"
      >
        <ScreenHeader title="Profile" onBack={() => router.back()} />
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.body}>
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
                marginBottom: space.sm,
              }}
            >
              Display name
            </Text>
            <GlassPanel style={styles.inputPanel} padded={false}>
              <TextInput
                testID="profile-display-name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How the observatory greets you"
                placeholderTextColor={colors.text3}
                autoCapitalize="words"
                accessibilityLabel="Display name"
                style={[
                  styles.input,
                  {
                    color: colors.text1,
                    fontFamily: fontFamilies.body,
                  },
                ]}
              />
            </GlassPanel>

            <Text
              style={{
                marginTop: space.xl,
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
                marginBottom: space.sm,
              }}
            >
              Email
            </Text>
            <GlassPanel style={styles.card}>
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text1,
                }}
              >
                {emailLabel}
              </Text>
              {mode !== "authenticated" ? (
                <Button
                  testID="profile-sign-in"
                  label="Sign in with magic link"
                  variant="secondary"
                  onPress={() => router.push("/(auth)/sign-in" as Href)}
                  style={styles.cta}
                />
              ) : null}
            </GlassPanel>

            <Button
              testID="profile-save"
              label="Save name"
              onPress={() => void onSave()}
              loading={busy}
              style={styles.save}
            />
            {savedHint ? (
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text2,
                  textAlign: "center",
                }}
              >
                {savedHint}
              </Text>
            ) : null}
            <Text
              style={{
                marginTop: space.lg,
                fontFamily: title.fontFamily,
                fontSize: 18,
                lineHeight: 24,
                color: colors.text1,
              }}
            >
              Your seat in the observatory
            </Text>
            <Text
              style={{
                marginTop: space.sm,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                lineHeight: bodySm.lineHeight,
                color: colors.text2,
              }}
            >
              Display name is local-first. Signed-in accounts sync the name to
              your profile when the cloud is configured.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: {
    paddingHorizontal: space.lg,
  },
  inputPanel: {
    borderRadius: 16,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: 16,
  },
  card: {
    borderRadius: 20,
  },
  cta: {
    marginTop: space.md,
    alignSelf: "stretch",
  },
  save: {
    marginTop: space.xl,
    alignSelf: "stretch",
  },
});
