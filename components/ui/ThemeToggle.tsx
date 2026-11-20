import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, radii, space } from '@/theme';
import { SoftPress } from './SoftPress';

/**
 * Ink ↔ Dawn toggle — soft segmented control (ABY calm selection feel).
 */
export function ThemeToggle() {
  const { theme, setTheme, colors, type } = useTheme();
  const meta = type('meta');

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.raised,
        },
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme"
    >
      {(['dawn', 'ink'] as const).map((name) => {
        const active = theme === name;
        return (
          <SoftPress
            key={name}
            onPress={() => setTheme(name)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={name === 'ink' ? 'Ink theme' : 'Dawn theme'}
            testID={`theme-toggle-${name}`}
            style={[
              styles.option,
              {
                backgroundColor: active ? colors.surface : 'transparent',
              },
            ]}
          >
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 13,
                color: active ? colors.text1 : colors.text3,
              }}
            >
              {name === 'dawn' ? 'Dawn' : 'Ink'}
            </Text>
          </SoftPress>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 4,
    alignSelf: 'flex-start',
  },
  option: {
    paddingHorizontal: space.md + 4,
    paddingVertical: space.sm + 2,
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: 'center',
  },
});
