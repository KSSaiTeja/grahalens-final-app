import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { errorCopy } from '@/lib/errors/catalog';
import { useTheme } from '@/theme';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/**
 * Honest degraded lagna when birth time unknown (SCREENS C1).
 */
export function UnknownTimeBanner({ style }: Props) {
  const { colors, type } = useTheme();
  const bodySm = type('bodySm');
  const meta = type('meta');
  const catalog = errorCopy('time_unknown');

  return (
    <GlassPanel
      padded={false}
      style={[
        styles.root,
        style,
      ]}
    >
      <View
        style={styles.content}
        accessibilityRole="summary"
        accessibilityLabel={`${catalog.title}. ${catalog.body}`}
      >
        <Icon name="system.alert" size={18} color={colors.caution} strokeWidth={1.5} />
        <View style={styles.copy}>
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 10,
            letterSpacing: meta.letterSpacing,
            color: colors.caution,
            textTransform: 'uppercase',
          }}
        >
          {catalog.title}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            lineHeight: bodySm.lineHeight,
            color: colors.text2,
          }}
        >
          {catalog.body}
        </Text>
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  copy: {
    flex: 1,
  },
});
