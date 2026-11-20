import React, { type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

import { useTheme, layout, motion, radii, shadows, space } from '@/theme';
import { IconButton } from './IconButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft bottom sheet — large radius, gentle rise (ABY calm).
 */
export function SheetScaffold({
  visible,
  onClose,
  title,
  children,
  style,
}: Props) {
  const { colors, type, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: reduceMotion ? 0 : motion.sheetUp.durationMs,
      easing: Easing.bezier(...motion.sheetUp.bezier),
    });
  }, [visible, reduceMotion, progress]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 56 }],
    opacity: 0.4 + progress.value * 0.6,
  }));

  const titleStyle = type('title');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.scrim }]}
          onPress={onClose}
          accessibilityLabel="Dismiss sheet"
        />
        <Animated.View
          style={[
            styles.sheet,
            shadows.float,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, space.md),
            },
            sheetStyle,
            style,
          ]}
        >
          <View style={styles.grabberWrap}>
            <View
              style={[
                styles.grabber,
                {
                  width: layout.sheetGrabberWidth,
                  height: layout.sheetGrabberHeight,
                  backgroundColor: colors.hairlineStrong,
                },
              ]}
            />
          </View>
          {title ? (
            <View style={styles.titleRow}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: titleStyle.fontFamily,
                  fontSize: titleStyle.fontSize,
                  lineHeight: titleStyle.lineHeight,
                  color: colors.text1,
                }}
              >
                {title}
              </Text>
              <IconButton icon={X} label="Close" onPress={onClose} />
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '88%',
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
  },
  grabber: {
    borderRadius: radii.pill,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  titleRow: {
    paddingHorizontal: space.lg,
    marginBottom: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
});
