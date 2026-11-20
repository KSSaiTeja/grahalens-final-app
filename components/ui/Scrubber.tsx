import React from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useTheme, layout } from '@/theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Precision scrubber — orange thumb, hairline track.
 */
export function Scrubber({
  value,
  onChange,
  min = 0,
  max = 1,
  style,
}: Props) {
  const { colors } = useTheme();
  const [trackW, setTrackW] = React.useState(1);
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = max === min ? 0 : (clamped - min) / (max - min);

  const emitFromX = React.useCallback(
    (x: number) => {
      const r = trackW > 0 ? x / trackW : 0;
      const next = min + Math.min(1, Math.max(0, r)) * (max - min);
      onChange(next);
    },
    [trackW, min, max, onChange],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackW(e.nativeEvent.layout.width);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      runOnJS(emitFromX)(e.x);
    })
    .onUpdate((e) => {
      'worklet';
      runOnJS(emitFromX)(e.x);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    'worklet';
    runOnJS(emitFromX)(e.x);
  });

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View
        style={[styles.trackWrap, style]}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: clamped }}
      >
        <View style={[styles.track, { backgroundColor: colors.hairline }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: colors.accent, width: `${ratio * 100}%` },
            ]}
          />
        </View>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.accent,
              left: `${ratio * 100}%`,
              marginLeft: -7,
            },
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  trackWrap: {
    height: layout.minHit,
    justifyContent: 'center',
  },
  track: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: 2,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: (layout.minHit - 14) / 2,
  },
});
