import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Icon } from '@/components/icons/Icon';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Hairline } from '@/components/ui/Hairline';
import {
  CHART_BODY_ORDER,
  chartBodyIconName,
  chartBodyLabel,
  type ChartBodyId,
} from '@/lib/chart';
import { RASI_LABELS } from '@/lib/ephemeris/constants';
import type { NatalChart } from '@/lib/ephemeris/types';
import { getPlacement } from '@/lib/ephemeris/types';
import { formatDegreeInSign } from '@/lib/format/degrees';
import { layout, useTheme } from '@/theme';

type Props = {
  chart: NatalChart;
  selectedId?: ChartBodyId | null;
  onSelect?: (id: ChartBodyId) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Accessible placement list — BRAND §12.
 * When present, the Skia wheel may be treated as decorative.
 */
export function PlacementList({
  chart,
  selectedId = null,
  onSelect,
  style,
}: Props) {
  const { colors, type } = useTheme();
  const meta = type('meta');
  const body = type('bodySm');
  const degree = type('degree');

  const rows = useMemo(
    () =>
      CHART_BODY_ORDER.map((id) => ({
        id,
        placement: getPlacement(chart, id),
      })),
    [chart],
  );

  return (
    <GlassPanel padded={false} style={[styles.panel, style]}>
      <View accessibilityRole="list" accessibilityLabel="Chart placements">
      {rows.map(({ id, placement }, index) => {
        const selected = selectedId === id;
        const label = chartBodyLabel(id);
        const detail = `${RASI_LABELS[placement.sign]} ${formatDegreeInSign(placement.degreeInSign)}, house ${placement.house}`;
        return (
          <React.Fragment key={id}>
            {index > 0 ? <Hairline /> : null}
            <Pressable
              onPress={() => onSelect?.(id)}
              accessibilityRole="button"
              accessibilityLabel={`${label}. ${detail}${placement.retrograde ? '. Retrograde' : ''}`}
              accessibilityState={{ selected }}
              testID={`placement-${id}`}
              style={({ pressed }) => [
                styles.row,
                {
                  minHeight: layout.minHit,
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: selected ? colors.accentSoft : 'transparent',
                },
              ]}
            >
              <Icon
                name={chartBodyIconName(id)}
                size={20}
                color={selected ? colors.accent : colors.text1}
                strokeWidth={1.5}
              />
              <View style={styles.copy}>
                <Text
                  style={{
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                  }}
                >
                  {label}
                  {placement.retrograde ? (
                    <Text style={{ color: colors.text3 }}> Rx</Text>
                  ) : null}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text3,
                    textTransform: 'uppercase',
                  }}
                >
                  {RASI_LABELS[placement.sign]} · H{placement.house}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: degree.fontFamily,
                  fontSize: degree.fontSize,
                  lineHeight: degree.lineHeight,
                  color: colors.text2,
                  fontVariant: degree.fontVariant,
                }}
              >
                {formatDegreeInSign(placement.degreeInSign)}
              </Text>
              <ChevronRight
                size={17}
                color={colors.text3}
                strokeWidth={1.7}
              />
            </Pressable>
          </React.Fragment>
        );
      })}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  copy: {
    flex: 1,
  },
});
