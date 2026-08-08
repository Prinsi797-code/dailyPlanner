import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLightColors, getDarkColors, ThemeColors, DEFAULT_ACCENT } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  mode: ThemeMode;
  accentColor: string;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const MODE_STORAGE_KEY = '@theme_mode';
const ACCENT_STORAGE_KEY = '@theme_accent';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    AsyncStorage.getItem(MODE_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
    AsyncStorage.getItem(ACCENT_STORAGE_KEY).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed === 'string') {
            setAccentColorState(parsed);
          }
        } catch {
          // old/invalid stored value — ignore, keep default
        }
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(MODE_STORAGE_KEY, newMode);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    AsyncStorage.setItem(ACCENT_STORAGE_KEY, JSON.stringify(color));
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? getDarkColors(accentColor) : getLightColors(accentColor);

  return (
    <ThemeContext.Provider value={{ mode, accentColor, colors, isDark, setMode, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};