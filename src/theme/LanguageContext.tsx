import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languageReady: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  languageReady: false,
});

const LANGUAGE_KEY = '@planwiz_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then(saved => {
      const lang = saved ?? i18n.language ?? 'en';
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      setLanguageReady(true);
    });
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  if (!languageReady) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}