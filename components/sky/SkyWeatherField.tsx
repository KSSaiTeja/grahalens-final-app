import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Icon } from "@/components/icons/Icon";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SoftPress } from "@/components/ui/SoftPress";
import {
  AXIS_LABELS,
  WEATHER_ICON,
} from "@/lib/sky/format";
import {
  WEATHER_AXES,
  type SkyWeather,
  type WeatherAxisId,
} from "@/lib/sky/sky-weather";
import { useTheme, radii, space } from "@/theme";

type Props = {
  weather: SkyWeather;
  /** Compact = four meters; full reserved for S2 parent. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * S1 hero instrument — four weather axes (BRAND §07). Soft surface, not a stats grid.
 */
export function SkyWeatherField({ weather, onPress, style }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const dominant = weather.dominant;

  const content = (
    <GlassPanel floating style={[styles.surface, style]}>
      <View style={styles.top}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.text3,
            textTransform: "uppercase",
          }}
        >
          Sky Weather
        </Text>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.accent,
            textTransform: "uppercase",
          }}
        >
          {AXIS_LABELS[dominant]} leads
        </Text>
      </View>

      <View style={styles.axes} accessibilityRole="summary">
        {WEATHER_AXES.map((id) => (
          <AxisMeter
            key={id}
            id={id}
            value={weather.axes[id].value}
            lead={id === dominant}
          />
        ))}
      </View>

      {onPress ? (
        <View style={styles.detailRow}>
          <Text
            style={{
              fontFamily: body.fontFamily,
              fontSize: 13,
              color: colors.text2,
            }}
          >
            Why this weather
          </Text>
          <ChevronRight size={18} color={colors.text2} strokeWidth={1.8} />
        </View>
      ) : null}
    </GlassPanel>
  );

  if (!onPress) return content;

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open Sky Weather detail"
      scale={false}
    >
      {content}
    </SoftPress>
  );
}

function AxisMeter({
  id,
  value,
  lead,
}: {
  id: WeatherAxisId;
  value: number;
  lead: boolean;
}) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const fill = Math.round(value * 100);

  return (
    <View style={styles.axis} accessibilityLabel={`${AXIS_LABELS[id]} ${fill} percent`}>
      <Icon
        name={WEATHER_ICON[id]}
        size={18}
        color={lead ? colors.accent : colors.text2}
      />
      <Text
        style={{
          marginTop: 6,
          fontFamily: meta.fontFamily,
          fontSize: 9,
          letterSpacing: meta.letterSpacing,
          color: lead ? colors.accent : colors.text3,
          textTransform: "uppercase",
        }}
      >
        {AXIS_LABELS[id]}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.hairline }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${fill}%`,
              backgroundColor: lead ? colors.accent : colors.text2,
            },
          ]}
        />
      </View>
      <Text
        style={{
          marginTop: 4,
          fontFamily: meta.fontFamily,
          fontSize: 11,
          color: colors.text2,
        }}
      >
        {fill}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginTop: 4,
    borderRadius: radii.xl,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  axes: {
    flexDirection: "row",
    gap: 8,
  },
  axis: {
    flex: 1,
    alignItems: "center",
  },
  track: {
    marginTop: 8,
    height: 3,
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  detailRow: {
    marginTop: space.md,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
