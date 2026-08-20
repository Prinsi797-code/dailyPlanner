// src/screens/PremiumScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useIAP, ErrorCode } from 'react-native-iap';
import { SUBSCRIPTION_SKUS, SkuId } from '../iap/iapConfig';

import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { usePremium } from '../premium/PremiumContext';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';

type Nav = StackNavigationProp<RootStackParamList>;
const SCREEN_WIDTH = Dimensions.get('window').width;

function withAlpha(color: string, alpha: number): string {
  if (!color) return `rgba(0,0,0,${alpha})`;

  if (color.startsWith('rgb')) {
    const nums = color.match(/[\d.]+/g) ?? [];
    const [r = '0', g = '0', b = '0'] = nums;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: '🔔',
    title: 'Unlimited Reminders',
    desc: 'No more limits on daily tasks',
  },
  { icon: '🎨', title: 'Custom Themes', desc: 'Personalize every reminder' },
  {
    icon: '☁️',
    title: 'Cloud Backup & Sync',
    desc: 'Never lose your data again',
  },
  { icon: '🚫', title: 'No Ads', desc: 'Distraction-free experience' },
  {
    icon: '⏰',
    title: 'Smart Notifications',
    desc: 'Snooze, repeat & priority alerts',
  },
];

const ORDERED_SKUS: SkuId[] = [
  'com.hevin.planner.yearly',
  'com.hevin.planner.monthly',
  'com.hevin.planner.weekly',
];

export default function PremiumScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const { setPremium } = usePremium();
  const primary = (colors as any).primary ?? (colors as any).accent;
  const { t } = useTranslation();

  const PLAN_META: Record<SkuId, { title: string; subtitle: string; badge?: string }> = {
    'com.hevin.planner.yearly': { title: t('settings.Yearly'), subtitle: t('settings.Subtitle'), badge: t('settings.BESTVALUE') },
    'com.hevin.planner.monthly': { title: t('settings.Monthly'), subtitle: t('settings.Subtitle') },
    'com.hevin.planner.weekly': { title: t('settings.Weekly'), subtitle: t('settings.Subtitle') },
  };

  const [selectedPlan, setSelectedPlan] = useState<SkuId>(
    'com.hevin.planner.yearly',
  );
  const [purchasing, setPurchasing] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    availablePurchases,
  } = useIAP({
    onPurchaseSuccess: async purchase => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
        setPremium(true);
        setPurchasing(false);
        await getAvailablePurchases();
        Alert.alert('Success', 'Subscription activated!');
        navigation.goBack();
      } catch (err) {
        console.log('finishTransaction error', err);
        setPurchasing(false);
      }
    },
    onPurchaseError: error => {
      console.log('PURCHASE ERROR:', error);
      setPurchasing(false);
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert('Purchase failed', error.message);
      }
    },
  });

  useEffect(() => {
    const load = async () => {
      if (!connected) return;
      try {
        await fetchProducts({ skus: SUBSCRIPTION_SKUS, type: 'subs' });
        await getAvailablePurchases();
      } catch (err) {
        console.log('fetchProducts error', err);
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, [connected]);

  useEffect(() => {
    console.log('RAW SUBSCRIPTIONS:', JSON.stringify(subscriptions, null, 2));
  }, [subscriptions]);

  const activePlanId = useMemo(() => {
    if (!availablePurchases || availablePurchases.length === 0) return null;

    const activeIds = new Set(ORDERED_SKUS);
    const active = availablePurchases.find((p: any) => {
      const pid = p.productId ?? p.productIds?.[0] ?? p.id;
      return activeIds.has(pid);
    });

    if (!active) return null;
    return (active.productId ?? active.productIds?.[0] ?? active.id) as SkuId;
  }, [availablePurchases]);

  const displayPlans = useMemo(() => {
    return ORDERED_SKUS.map(sku => {
      const sub = (subscriptions ?? []).find((s: any) => s.id === sku);
      return {
        id: sku,
        title: PLAN_META[sku].title,
        badge: PLAN_META[sku].badge,
        price: sub?.displayPrice ?? '—',
        subtext: PLAN_META[sku].subtitle,
        isActive: sku === activePlanId,
      };
    });
  }, [subscriptions, activePlanId]);

  useEffect(() => {
    if (activePlanId) setSelectedPlan(activePlanId);
  }, [activePlanId]);

  const handleSubscribe = async () => {
    if (purchasing) return;
    if (selectedPlan === activePlanId) return;
    setPurchasing(true);
    try {
      await requestPurchase({
        request: {
          apple: { sku: selectedPlan },
          google: { skus: [selectedPlan] },
        },
        type: 'subs',
      });
    } catch (err: any) {
      setPurchasing(false);
      if (err?.code !== ErrorCode.UserCancelled) {
        console.log('requestPurchase error', err);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await getAvailablePurchases();
      if (availablePurchases && availablePurchases.length > 0) {
        setPremium(true);
        Alert.alert('Restored', 'Your purchases have been restored.');
      } else {
        Alert.alert('No purchases found', 'Nothing to restore.');
      }
    } catch (err) {
      console.log('restore error', err);
    }
  };

  const loading = productsLoading || !connected;
  const isSelectedPlanActive = selectedPlan === activePlanId;

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.closeText, { color: colors.subText }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hero - fixed, NOT inside any ScrollView */}
        <View style={styles.heroWrap}>
          <ImageBackground
            source={require('../assets/img/premium.png')}
            style={styles.hero}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                withAlpha(colors.card, 0),
                withAlpha(colors.card, 0.5),
                withAlpha(colors.card, 0.92),
              ]}
              locations={[0, 0.45, 1]}
              style={styles.heroGradient}
              pointerEvents="none"
            />

            <View style={styles.heroContent}>
              <View
                style={[
                  styles.heroTextPanel,
                  { backgroundColor: withAlpha(colors.card, 0.3) },
                ]}
              >
                <AppText style={[styles.title, { color: colors.text }]}>
                  {t('settings.Unlock')}{' '}
                  <Text style={{ color: primary }}>
                    {t('settings.PlanWizPRO')}
                  </Text>
                </AppText>
                <AppText style={[styles.subtitle, { color: colors.subText }]}>
                  {t('settings.premiumdetails')}
                </AppText>
              </View>
            </View>
          </ImageBackground>
        </View>

        <ScrollView
          style={[styles.scroll, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Plans */}
          {loading ? (
            <ActivityIndicator color={primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.plansWrap}>
              {displayPlans.map(plan => {
                const selected = plan.id === selectedPlan;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: selected ? primary : 'transparent',
                      },
                      plan.isActive && {
                        borderColor: primary,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    {plan.isActive ? (
                      <View
                        style={[styles.badge, { backgroundColor: '#2E7D32' }]}
                      >
                        <Text style={styles.badgeText}>ACTIVE</Text>
                      </View>
                    ) : (
                      plan.badge && (
                        <View
                          style={[styles.badge, { backgroundColor: primary }]}
                        >
                          <Text style={styles.badgeText}>{plan.badge}</Text>
                        </View>
                      )
                    )}
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: selected ? primary : colors.subText },
                      ]}
                    >
                      {selected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: primary },
                          ]}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        style={[styles.planTitle, { color: colors.text }]}
                      >
                        {plan.title}
                      </AppText>
                      <AppText
                        style={[styles.planSubtext, { color: colors.subText }]}
                      >
                        {plan.isActive ? 'Currently subscribed' : plan.subtext}
                      </AppText>
                    </View>
                    <AppText style={[styles.planPrice, { color: colors.text }]}>
                      {plan.price}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Features - horizontal scroll */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresScrollContent}
            style={styles.featuresScroll}
          >
            {FEATURES.map(f => (
              <View
                key={f.title}
                style={[styles.featureCard, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.featureIconWrap,
                    { backgroundColor: primary + '20' },
                  ]}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <AppText style={[styles.featureTitle, { color: colors.text }]}>
                  {f.title}
                </AppText>
                <AppText
                  style={[styles.featureDesc, { color: colors.subText }]}
                  numberOfLines={2}
                >
                  {f.desc}
                </AppText>
              </View>
            ))}
          </ScrollView> */}
        </ScrollView>

        {/* Footer / CTA - fixed */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderColor: colors.card },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubscribe}
            style={[
              styles.ctaBtn,
              {
                backgroundColor: primary,
                opacity: purchasing || isSelectedPlanActive ? 0.6 : 1,
              },
            ]}
            activeOpacity={0.85}
            disabled={purchasing || loading || isSelectedPlanActive}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText style={styles.ctaText}>
                {isSelectedPlanActive ? t('settings.CurrentPlan') : t('settings.Continue')}
              </AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <AppText style={[styles.restoreText, { color: colors.subText }]}>
              {t('settings.RestorePurchases')}
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 25, fontWeight: '00' },

  heroWrap: {
    paddingHorizontal: 10,
  },

  scroll: { flex: 1, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 25 },

  hero: {
    marginTop: 4,
    marginBottom: 24,
    minHeight: 240,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 20,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  heroTextPanel: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 150,
    paddingBottom: 18,
  },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  crownEmoji: { fontSize: 34 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },

  featuresScroll: {
    marginBottom: 24,
  },
  featuresScrollContent: {
    paddingHorizontal: 2,
    gap: 12,
  },
  featureCard: {
    width: 128,
    borderRadius: 16,
    padding: 14,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureIcon: { fontSize: 18 },
  featureTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 11, lineHeight: 15 },

  plansWrap: { gap: 12, marginTop: 10 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planTitle: { fontSize: 15, fontWeight: '700' },
  planSubtext: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 15, fontWeight: '700' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
  },
  ctaBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', marginTop: 10 },
  restoreText: { fontSize: 13, fontWeight: '600' },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
  },
});
