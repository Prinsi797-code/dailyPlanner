import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontFamilyOption =
  | 'System'
  | 'ArianaVioleta'
  | 'BeckyTahlia'
  | 'HappySwirly'
  | 'LoveDays'
  | 'RoughenCorner'
  | 'BelieveIt'
  | 'Branda'
  | 'ChrustyRock'
  | 'CookieCrisp'
  | 'Debrosee';

export const FONT_NATIVE_NAME: Record<FontFamilyOption, string> = {
  System: 'System',
  ArianaVioleta: 'ArianaVioleta',
  BeckyTahlia: 'BeckyTahlia',
  HappySwirly: 'HappySwirly',
  LoveDays: 'LoveDays',
  RoughenCorner: 'RoughenCornerRegular',
  BelieveIt: 'BelieveIt',
  Branda: 'Branda',
  ChrustyRock: 'ChrustyRock',
  CookieCrisp: 'CookieCrisp',
  Debrosee: 'Debrosee',
};

interface FontContextType {
  fontFamily: FontFamilyOption;
  nativeFontFamily: string; 
  setFontFamily: (font: FontFamilyOption) => void;
  fontsReady: boolean;
}

const FontContext = createContext<FontContextType>({
  fontFamily: 'System',
  nativeFontFamily: 'System',
  setFontFamily: () => {},
  fontsReady: false,
});

const FONT_KEY = '@planwiz_font_family';

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontFamily, setFontFamilyState] = useState<FontFamilyOption>('System');
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FONT_KEY).then(val => {
      const saved = (val as FontFamilyOption) || 'System';
      setFontFamilyState(saved);
      setFontsReady(true);
    });
  }, []);

  const setFontFamily = (font: FontFamilyOption) => {
    setFontFamilyState(font);
    AsyncStorage.setItem(FONT_KEY, font);
  };

  if (!fontsReady) return null;

  return (
    <FontContext.Provider
      value={{
        fontFamily,
        nativeFontFamily: FONT_NATIVE_NAME[fontFamily],
        setFontFamily,
        fontsReady,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  return useContext(FontContext);
}