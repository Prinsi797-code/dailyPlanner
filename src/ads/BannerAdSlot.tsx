// src/ads/BannerAdSlot.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getAdUnitId, getFlag, isSimpleAdEnabled } from './AdManager';
import { SimpleAdConfig } from './adConfig';
import { usePremium } from '../premium/PremiumContext';

interface Props {
  config: SimpleAdConfig;
}

export default function BannerAdSlot({ config }: Props) {
  const { isPremium } = usePremium(); // ✅
  const [enabled, setEnabled] = useState(false);
  const [adUnitId, setAdUnitId] = useState('');

  useEffect(() => {
    if (isPremium) return; // ✅ premium hai to load hi mat karo
    const timer = setTimeout(() => {
      const flag = getFlag(config.flagKey);
      const id = getAdUnitId(config.idKey);
      setEnabled(isSimpleAdEnabled(flag));
      setAdUnitId(id);
    }, 300);

    return () => clearTimeout(timer);
  }, [config.flagKey, config.idKey, isPremium]);

  if (isPremium || !enabled || !adUnitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={err => console.log('Banner failed:', err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});