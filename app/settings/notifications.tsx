import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrefToggle } from "@/components/settings/PrefToggle";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  DEFAULT_NOTIFICATION_PREFS,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefsLocal,
} from "@/lib/settings/notification-prefs";
import {
  configureNotificationHandler,
  syncDailySkySchedule,
} from "@/lib/settings/local-notifications";
import { space, useTheme } from "@/theme";

function denialAlert(reason: "denied" | "unavailable") {
  if (reason === "unavailable") {
    Alert.alert(
      "Notifications unavailable",
      "This build cannot schedule local reminders (web or missing native module). Your preference was not left on.",
    );
    return;
  }
  Alert.alert(
    "Permission not granted",
    "Daily Sky stays off. Enable notifications for Grahalens in system Settings if you want a morning reminder later.",
  );
}

/** X5 — Local prefs + optional daily Sky local reminder (honest denial). */
export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const [prefs, setPrefs] = useState<NotificationPrefsLocal>(
    DEFAULT_NOTIFICATION_PREFS,
  );
  const [busy, setBusy] = useState(false);
  const bodySm = type("bodySm");
  const meta = type("meta");

  useEffect(() => {
    configureNotificationHandler();
    void (async () => {
      const loaded = await loadNotificationPrefs();
      setPrefs(loaded);
      if (!loaded.dailySky) return;
      const sync = await syncDailySkySchedule(true, { requestIfNeeded: false });
      if (!sync.ok) {
        const saved = await saveNotificationPrefs({
          dailySky: false,
          pushEnabled: false,
        });
        setPrefs(saved);
      } else {
        const saved = await saveNotificationPrefs({ pushEnabled: true });
        setPrefs(saved);
      }
    })();
  }, []);

  const patch = useCallback(async (next: Partial<NotificationPrefsLocal>) => {
    if (busy) return;
    setBusy(true);
    try {
      if (typeof next.dailySky === "boolean") {
        const sync = await syncDailySkySchedule(next.dailySky);
        if (next.dailySky && !sync.ok) {
          denialAlert(sync.reason);
          const saved = await saveNotificationPrefs({
            dailySky: false,
            pushEnabled: false,
          });
          setPrefs(saved);
          return;
        }
        const saved = await saveNotificationPrefs({
          dailySky: next.dailySky,
          pushEnabled: next.dailySky ? true : prefs.pushEnabled,
        });
        setPrefs(saved);
        return;
      }

      if (typeof next.pushEnabled === "boolean") {
        if (next.pushEnabled) {
          const sync = await syncDailySkySchedule(prefs.dailySky || true);
          if (!sync.ok) {
            denialAlert(sync.reason);
            const saved = await saveNotificationPrefs({
              pushEnabled: false,
              dailySky: false,
            });
            setPrefs(saved);
            return;
          }
          const saved = await saveNotificationPrefs({
            pushEnabled: true,
            dailySky: true,
          });
          setPrefs(saved);
          return;
        }
        await syncDailySkySchedule(false);
        const saved = await saveNotificationPrefs({
          pushEnabled: false,
          dailySky: false,
        });
        setPrefs(saved);
        return;
      }

      const saved = await saveNotificationPrefs(next);
      setPrefs(saved);
    } finally {
      setBusy(false);
    }
  }, [busy, prefs.dailySky, prefs.pushEnabled]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-notifications"
      >
        <ScreenHeader title="Notifications" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
              marginBottom: space.md,
            }}
          >
            Local preferences
          </Text>
          <PrefToggle
            testID="notif-daily-sky"
            label="Daily Sky note"
            body="One morning local reminder for today’s weather + muhurta (8:00)"
            value={prefs.dailySky}
            disabled={busy}
            onValueChange={(dailySky) => void patch({ dailySky })}
          />
          <PrefToggle
            testID="notif-lens-digest"
            label="Lens digest"
            body="Quiet summary when you leave threads unread — prefs only for now"
            value={prefs.lensDigest}
            disabled={busy}
            onValueChange={(lensDigest) => void patch({ lensDigest })}
          />
          <PrefToggle
            testID="notif-muhurta"
            label="Muhurta alerts"
            body="Short window cues — prefs only; not scheduled yet (no spam)"
            value={prefs.muhurtaAlerts}
            disabled={busy}
            onValueChange={(muhurtaAlerts) => void patch({ muhurtaAlerts })}
          />
          <PrefToggle
            testID="notif-push"
            label="Allow notifications"
            body="OS permission for the daily Sky local reminder"
            value={prefs.pushEnabled}
            disabled={busy}
            onValueChange={(pushEnabled) => void patch({ pushEnabled })}
          />
          <Text
            style={{
              marginTop: space.lg,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text3,
            }}
          >
            Prefs stay on device. Denial leaves Daily Sky off — we do not pretend
            a reminder is armed. Remote push tokens are not registered in beta.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
});
