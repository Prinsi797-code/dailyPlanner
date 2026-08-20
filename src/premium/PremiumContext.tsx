import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumContextType {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
  loadingPremium: boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  setPremium: () => {},
  loadingPremium: true,
});

const PREMIUM_KEY = '@planwiz_is_premium';

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PREMIUM_KEY)
      .then(val => setIsPremium(val === 'true'))
      .finally(() => setLoadingPremium(false));
  }, []);

  const setPremium = (value: boolean) => {
    setIsPremium(value);
    AsyncStorage.setItem(PREMIUM_KEY, value ? 'true' : 'false');
  };

  return (
    <PremiumContext.Provider value={{ isPremium, setPremium, loadingPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}