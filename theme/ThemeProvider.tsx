import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, StatusBar, View, StyleSheet } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';

import { themes, type ColorTokens, type ThemeName } from './tokens';
import { typeScale, type TypeRole, type TypeStyle } from './typography';
import { motion } from './motion';
import {
  loadThemePreference,
  saveThemePreference,
} from '@/lib/settings/theme-pref';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
  colors: ColorTokens;
  typography: typeof typeScale;
  motion: typeof motion;
  reduceMotion: boolean;
  fontsLoaded: boolean;
  type: (role: TypeRole) => TypeStyle;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialTheme?: ThemeName;
};

export function ThemeProvider({ children, initialTheme = 'dawn' }: Props) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    let mounted = true;
    void loadThemePreference().then((saved) => {
      if (mounted && saved) setThemeState(saved);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    void saveThemePreference(name);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => {
      const next = t === 'ink' ? 'dawn' : 'ink';
      void saveThemePreference(next);
      return next;
    });
  }, []);

  const colors = themes[theme];

  const type = useCallback((role: TypeRole) => typeScale[role], []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      colors,
      typography: typeScale,
      motion,
      reduceMotion,
      fontsLoaded: fontsLoaded || !!fontError,
      type,
    }),
    [theme, setTheme, toggleTheme, colors, reduceMotion, fontsLoaded, fontError, type],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={theme === 'ink' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.void}
      />
      <View style={[styles.root, { backgroundColor: colors.void }]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
