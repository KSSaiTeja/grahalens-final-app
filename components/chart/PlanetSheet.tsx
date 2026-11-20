import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';

import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { Hairline } from '@/components/ui/Hairline';
import { SheetScaffold } from '@/components/ui/SheetScaffold';
import {
  chartBodyIconName,
  chartBodyLabel,
  type ChartBodyId,
} from '@/lib/chart';
import { natalAspects } from '@/lib/ephemeris/aspects';
import { RASI_LABELS } from '@/lib/ephemeris/constants';
import type { NatalChart } from '@/lib/ephemeris/types';
import { getPlacement } from '@/lib/ephemeris/types';
import { formatDegreeInSign } from '@/lib/format/degrees';
import { useTheme } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  chart: NatalChart;
  bodyId: ChartBodyId | null;
  /** Navigate to C2 full planet page. */
  onOpenFull?: (id: ChartBodyId) => void;
};

type TypeBits = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontVariant?: Array<'tabular-nums'>;
};

/**
 * Planet placement sheet — opened from Living Chart / PlacementList.
 * CTA opens C2 `chart/planet/[name]`.
 */
export function PlanetSheet({
  visible,
  onClose,
  chart,
  bodyId,
  onOpenFull,
}: Props) {
  const { colors, type } = useTheme();
  const title = type('title');
  const body = type('body');
  const bodySm = type('bodySm');
  const meta = type('meta');
  const degree = type('degree');

  const placement = bodyId ? getPlacement(chart, bodyId) : null;

  const relatedAspects = useMemo(() => {
    if (!bodyId) return [];
    return natalAspects(chart).filter((a) => a.a === bodyId || a.b === bodyId);
  }, [chart, bodyId]);

  const label = bodyId ? chartBodyLabel(bodyId) : '';

  return (
    <SheetScaffold
      visible={visible && bodyId != null && placement != null}
      onClose={onClose}
      title={label}
    >
      {placement && bodyId ? (
        <>
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  borderColor: colors.hairlineStrong,
                  backgroundColor: colors.void,
                },
              ]}
            >
              <Icon
                name={chartBodyIconName(bodyId)}
                size={28}
                color={colors.accent}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 20,
                  lineHeight: 26,
                  color: colors.text1,
                }}
              >
                {label}
                {placement.retrograde ? (
                  <Text style={{ color: colors.text3, fontSize: 16 }}> Rx</Text>
                ) : null}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: degree.fontFamily,
                  fontSize: degree.fontSize,
                  color: colors.text2,
                  fontVariant: degree.fontVariant,
                }}
              >
                {RASI_LABELS[placement.sign]}{' '}
                {formatDegreeInSign(placement.degreeInSign)}
              </Text>
            </View>
          </View>

          <Hairline style={styles.rule} />

          <Fact
            label="House"
            value={`${placement.house}`}
            colors={colors}
            meta={meta}
            body={body}
          />
          <Fact
            label="Nakshatra"
            value={`${placement.nakshatra.name} · pada ${placement.nakshatra.pada}`}
            colors={colors}
            meta={meta}
            body={body}
          />
          <Fact
            label="Degree"
            value={formatDegreeInSign(placement.degreeInSign)}
            colors={colors}
            meta={meta}
            body={body}
            mono
            degree={degree}
          />

          {relatedAspects.length > 0 ? (
            <>
              <Hairline style={styles.rule} />
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Aspects
              </Text>
              {relatedAspects.slice(0, 6).map((a) => {
                const other = a.a === bodyId ? a.b : a.a;
                return (
                  <Text
                    key={`${a.a}-${a.b}-${a.id}`}
                    style={{
                      fontFamily: bodySm.fontFamily,
                      fontSize: bodySm.fontSize,
                      lineHeight: bodySm.lineHeight,
                      color: colors.text2,
                      marginBottom: 6,
                    }}
                  >
                    {a.id} {chartBodyLabel(other)}
                    <Text style={{ color: colors.text3 }}>
                      {' '}
                      · orb {a.delta.toFixed(1)}°
                    </Text>
                  </Text>
                );
              })}
            </>
          ) : null}

          {onOpenFull ? (
            <>
              <Hairline style={styles.rule} />
              <Button
                onPress={() => {
                  const id = bodyId;
                  onClose();
                  onOpenFull(id);
                }}
                accessibilityLabel={`Open full ${label} page`}
                label="Open full page"
                icon={ArrowUpRight}
                variant="secondary"
                style={styles.fullLink}
                testID="planet-open-full"
              />
            </>
          ) : null}
        </>
      ) : null}
    </SheetScaffold>
  );
}

function Fact({
  label,
  value,
  colors,
  meta,
  body,
  mono,
  degree,
}: {
  label: string;
  value: string;
  colors: { text1: string; text3: string };
  meta: TypeBits;
  body: TypeBits;
  mono?: boolean;
  degree?: TypeBits;
}) {
  return (
    <View style={styles.fact}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: 'uppercase',
          width: 88,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          fontFamily: mono && degree ? degree.fontFamily : body.fontFamily,
          fontSize: mono && degree ? degree.fontSize : body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
          fontVariant: mono && degree ? degree.fontVariant : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  rule: {
    marginVertical: 14,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
    gap: 8,
  },
  fullLink: {
    marginTop: 2,
  },
});
