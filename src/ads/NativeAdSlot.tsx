// src/ads/NativeAdSlot.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { getAdUnitId, getFlag, isSimpleAdEnabled } from './AdManager';
import { SimpleAdConfig } from './adConfig';
import { usePremium } from '../premium/PremiumContext';

interface Props {
  config: SimpleAdConfig;
}

export default function NativeAdSlot({ config }: Props) {
  const { isPremium } = usePremium();
  const [enabled, setEnabled] = useState(false);
  const [adUnitId, setAdUnitId] = useState('');
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (isPremium) return;
    const timer = setTimeout(() => {
      const flag = getFlag(config.flagKey);
      const id = getAdUnitId(config.idKey);
      setEnabled(isSimpleAdEnabled(flag));
      setAdUnitId(id);
    }, 300);

    return () => clearTimeout(timer);
  }, [config.flagKey, config.idKey, isPremium]);

  useEffect(() => {
    if (isPremium || !enabled || !adUnitId) return;

    let cancelled = false;

    NativeAd.createForAdRequest(adUnitId)
      .then(ad => {
        if (cancelled) return;
        setNativeAd(ad);
      })
      .catch(err => {
        console.log('Native ad failed:', err);
      });

    return () => {
      cancelled = true;
      setNativeAd(null);
    };
  }, [enabled, adUnitId, isPremium]);

  if (isPremium || !enabled || !adUnitId || !nativeAd) return null;
  return (
    <View style={styles.container}>
      <View style={{ direction: 'ltr' }}>
        <NativeAdView nativeAd={nativeAd} style={styles.card}>
          <View style={styles.headerRow}>
            {nativeAd.icon && (
              <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
            )}
            <View style={{ flex: 1 }}>
              <NativeAsset assetType={NativeAssetType.HEADLINE}>
                <Text style={styles.headline} numberOfLines={1}>
                  {nativeAd.headline}
                </Text>
              </NativeAsset>
              {!!nativeAd.advertiser && (
                <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                  <Text style={styles.advertiser} numberOfLines={1}>
                    {nativeAd.advertiser}
                  </Text>
                </NativeAsset>
              )}
            </View>
          </View>

          {!!nativeAd.body && (
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.body} numberOfLines={2}>
                {nativeAd.body}
              </Text>
            </NativeAsset>
          )}

          {!!nativeAd.callToAction && (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <View style={styles.ctaWrap}>
                <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
              </View>
            </NativeAsset>
          )}
        </NativeAdView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 15, paddingVertical: 6 },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingLeft: 8,
    paddingRight: 20,
    paddingVertical: 5,
    paddingBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  icon: { width: 28, height: 28, borderRadius: 6 },
  headline: { fontSize: 12, fontWeight: '700' },
  advertiser: { fontSize: 10, color: '#888', marginTop: 1 },
  adBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  adBadgeText: { fontSize: 9, fontWeight: '700', color: '#333' },
  body: { fontSize: 10, color: '#555', marginBottom: 8 },
  ctaWrap: {
    alignSelf: 'stretch',
    backgroundColor: '#2979FF',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});