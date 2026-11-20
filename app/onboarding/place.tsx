import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { OptionRow } from "@/components/ui/OptionRow";
import { useTheme, layout } from "@/theme";
import {
  cityDisplay,
  searchCities,
  type CityOption,
} from "@/lib/onboarding/cities";
import { useOnboardingStore } from "@/lib/store/onboarding";

/**
 * A8 — Place search + offline top cities (PRD §11 geocode fail → city pick).
 */
export default function OnboardingPlaceScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const date = useOnboardingStore((s) => s.date);
  const place = useOnboardingStore((s) => s.place);
  const setPlace = useOnboardingStore((s) => s.setPlace);
  const body = type("body");
  const bodySm = type("bodySm");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CityOption | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const [manualTz, setManualTz] = useState("Asia/Kolkata");
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => searchCities(query), [query]);

  useEffect(() => {
    if (!date) router.replace("/onboarding/date");
  }, [date, router]);

  if (!date) {
    return null;
  }

  const choose = (c: CityOption) => {
    setSelected(c);
    setManualOpen(false);
    setError(null);
  };

  const onContinue = () => {
    if (manualOpen) {
      const lat = Number(manualLat);
      const lng = Number(manualLng);
      if (
        !manualLabel.trim() ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180 ||
        !manualTz.trim()
      ) {
        setError("Enter a label, valid lat/lng, and IANA timezone.");
        return;
      }
      setPlace({
        label: manualLabel.trim(),
        lat,
        lng,
        tz: manualTz.trim(),
      });
      router.push("/onboarding/confirm");
      return;
    }

    const c = selected;
    if (!c) {
      setError("Pick a city, or enter coordinates manually.");
      return;
    }
    setPlace({
      label: cityDisplay(c),
      lat: c.lat,
      lng: c.lng,
      tz: c.tz,
    });
    router.push("/onboarding/confirm");
  };

  return (
    <OnboardingChrome
      step={3}
      title="Birth place"
      body="Search offline cities, or enter coordinates if geocoding isn’t available."
      primaryLabel="Continue"
      onPrimary={onContinue}
      secondaryLabel={manualOpen ? "Use city list" : "Enter lat / lng"}
      onSecondary={() => {
        setManualOpen((v) => !v);
        setError(null);
      }}
      error={error}
      testID="onboarding-place"
    >
      {!manualOpen ? (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search cities"
            placeholderTextColor={colors.text3}
            autoCorrect={false}
            autoCapitalize="words"
            style={[
              styles.input,
              {
                color: colors.text1,
                borderColor: colors.hairlineStrong,
                backgroundColor: colors.raised,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
              },
            ]}
            accessibilityLabel="Search birth place"
          />
          {results.length === 0 ? (
            <Text
              style={{
                marginTop: 16,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
              }}
            >
              No cities match. Try another spelling, or enter lat / lng.
            </Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const active = selected?.id === item.id;
                return (
                  <OptionRow
                    onPress={() => choose(item)}
                    selected={active}
                    label={item.label}
                    detail={`${item.country} · ${item.tz}`}
                    accessibilityLabel={`${item.label}, ${item.country}, ${item.tz}`}
                    testID={`city-${item.id}`}
                  />
                );
              }}
            />
          )}
          {place && !selected ? (
            <Text
              style={{
                marginTop: 8,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text3,
              }}
            >
              Previously: {place.label}
            </Text>
          ) : null}
        </>
      ) : (
        <View style={styles.manual}>
          <TextInput
            value={manualLabel}
            onChangeText={setManualLabel}
            placeholder="Place label"
            placeholderTextColor={colors.text3}
            style={[
              styles.input,
              {
                color: colors.text1,
                borderColor: colors.hairlineStrong,
                backgroundColor: colors.surface,
                fontFamily: body.fontFamily,
              },
            ]}
          />
          <View style={styles.manualRow}>
            <TextInput
              value={manualLat}
              onChangeText={setManualLat}
              placeholder="Latitude"
              keyboardType="numeric"
              placeholderTextColor={colors.text3}
              style={[
                styles.input,
                styles.half,
                {
                  color: colors.text1,
                  borderColor: colors.hairlineStrong,
                  backgroundColor: colors.surface,
                  fontFamily: body.fontFamily,
                },
              ]}
            />
            <TextInput
              value={manualLng}
              onChangeText={setManualLng}
              placeholder="Longitude"
              keyboardType="numeric"
              placeholderTextColor={colors.text3}
              style={[
                styles.input,
                styles.half,
                {
                  color: colors.text1,
                  borderColor: colors.hairlineStrong,
                  backgroundColor: colors.surface,
                  fontFamily: body.fontFamily,
                },
              ]}
            />
          </View>
          <TextInput
            value={manualTz}
            onChangeText={setManualTz}
            placeholder="IANA timezone"
            autoCapitalize="none"
            placeholderTextColor={colors.text3}
            style={[
              styles.input,
              {
                color: colors.text1,
                borderColor: colors.hairlineStrong,
                backgroundColor: colors.surface,
                fontFamily: body.fontFamily,
              },
            ]}
          />
        </View>
      )}
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  input: {
    height: layout.ctaHeight,
    borderWidth: 1,
    borderRadius: layout.ctaRadius,
    paddingHorizontal: 16,
  },
  list: {
    marginTop: 12,
    flex: 1,
  },
  separator: { height: 8 },
  manual: {
    gap: 12,
  },
  manualRow: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
});
