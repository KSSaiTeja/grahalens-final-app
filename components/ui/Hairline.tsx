import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  strong?: boolean;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Prefer hairline separators over boxed cards (BRAND §07). */
export function Hairline({ strong = false, vertical = false, style }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: strong ? colors.hairlineStrong : colors.hairline,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    alignSelf: 'stretch',
  },
});
