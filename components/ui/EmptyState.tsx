import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, space } from '@/theme';
import { LensOrb } from '@/components/brand/LensOrb';
import { Button } from './Button';
import { ScreenEnter } from './ScreenEnter';

type Props = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Show Lens orb above title — ABY calm hero */
  withOrb?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  withOrb = true,
  style,
}: Props) {
  const { colors, type } = useTheme();
  const titleStyle = type('displayL');
  const bodyStyle = type('body');

  return (
    <ScreenEnter style={[styles.root, style]}>
      <View accessibilityRole="summary" style={styles.inner}>
        {withOrb ? <LensOrb size={48} state="idle" /> : null}
        <Text
          style={{
            marginTop: withOrb ? space.lg : 0,
            fontFamily: titleStyle.fontFamily,
            fontSize: titleStyle.fontSize,
            lineHeight: titleStyle.lineHeight,
            letterSpacing: titleStyle.letterSpacing,
            color: colors.text1,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: bodyStyle.fontFamily,
            fontSize: bodyStyle.fontSize,
            lineHeight: bodyStyle.lineHeight,
            color: colors.text2,
            textAlign: 'center',
            marginTop: space.md,
            maxWidth: 320,
          }}
        >
          {body}
        </Text>
        {actionLabel && onAction ? (
          <Button
            label={actionLabel}
            onPress={onAction}
            variant="primary"
            style={styles.cta}
          />
        ) : null}
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  cta: {
    marginTop: space.xl,
    alignSelf: 'stretch',
  },
});
