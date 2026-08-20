// src/ads/useScreenInterstitial.ts
import { useCallback } from 'react';
import { getAdUnitId, getFlag, showInterstitialIfEligible } from './AdManager';
import { InterAdConfig, InterFrequency } from './adConfig';
import { usePremium } from '../premium/PremiumContext';

export function useScreenInterstitial(config: InterAdConfig, storageKey: string) {
  const { isPremium } = usePremium();

  return useCallback(
    async (onClosedOrSkipped?: () => void) => {
      if (isPremium) {
        onClosedOrSkipped?.();
        return;
      }

      const flag = getFlag(config.flagKey) as InterFrequency;
      const adUnitId = getAdUnitId(config.idKey);

      const shown = await showInterstitialIfEligible({
        adUnitId,
        flag,
        storageKey,
        onClosed: onClosedOrSkipped,
      });

      if (!shown) onClosedOrSkipped?.();
    },
    [config.flagKey, config.idKey, storageKey, isPremium],
  );
}