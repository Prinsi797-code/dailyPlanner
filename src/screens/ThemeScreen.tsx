import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { ACCENT_COLORS } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import NativeAdSlot from '../ads/NativeAdSlot';
import { usePremium } from '../premium/PremiumContext';
import AppText from '../components/AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SELECTED_ICON_KEY } from '../localization/logoMap';
import {
  getActiveIcon,
  setIcon,
  resetIcon,
} from 'react-native-app-icon-changer';
import { useTranslation } from 'react-i18next';

type Nav = StackNavigationProp<RootStackParamList>;

interface IconOption {
  key: string;
  label: string;
  preview: any;
}

export default function ThemeScreen() {
  const navigation = useNavigation<Nav>();
  const { mode, colors, setMode, accentColor, setAccentColor } = useTheme();
  const { isPremium } = usePremium();
  const { t } = useTranslation();

  const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: t('settings.light'), icon: '☀️' },
    { mode: 'dark', label: t('settings.dark'), icon: '🌙' },
    { mode: 'system', label: t('settings.system'), icon: '📱' },
  ];

  const ICON_OPTIONS: IconOption[] = [
    {
      key: 'Default',
      label: t('settings.bold'),
      preview: require('../assets/logo/logo2.png'),
    },
    {
      key: 'logo1',
      label: t('settings.classic'),
      preview: require('../assets/logo/logo1.png'),
    },
    {
      key: 'logo3',
      label: t('settings.minimal'),
      preview: require('../assets/logo/logo3.png'),
    },
    {
      key: 'logo4',
      label: t('settings.dark'),
      preview: require('../assets/logo/logo4.png'),
    },
    {
      key: 'logo5',
      label: t('settings.checklist'),
      preview: require('../assets/logo/logo5.png'),
    },
    {
      key: 'logo6',
      label: t('settings.dailyplanner'),
      preview: require('../assets/logo/logo6.png'),
    },
    {
      key: 'logo7',
      label: t('settings.calendar'),
      preview: require('../assets/logo/logo7.png'),
    },
    {
      key: 'logo8',
      label: t('settings.todolist'),
      preview: require('../assets/logo/logo8.png'),
    },
    {
      key: 'logo9',
      label: t('settings.checkmark'),
      preview: require('../assets/logo/logo9.png'),
    },
    // {
    //   key: 'logo10',
    //   label: t('settings.cutecat'),
    //   preview: require('../assets/logo/logo10.png'),
    // },
  ];

  const showThemeInter = useScreenInterstitial(
    AD_SCREENS.theme_screen.inter,
    'theme_screen',
  );

  const [activeIcon, setActiveIcon] = useState<string>('Default');
  const [changingIcon, setChangingIcon] = useState(false);

  useEffect(() => {
    const loadActiveIcon = async () => {
      try {
        const current = await getActiveIcon();
        const key = current ?? 'Default';
        setActiveIcon(key);
        await AsyncStorage.setItem(SELECTED_ICON_KEY, key); // sync kar diya
      } catch (err) {
        console.log('getActiveIcon error', err);
      }
    };
    loadActiveIcon();
  }, []);

  const handleSelectIcon = useCallback(
    async (option: IconOption) => {
      if (changingIcon || option.key === activeIcon) return;
      if (!isPremium && option.key !== 'Default') {
        Alert.alert(t('UnlockPremiumIcons'), t('Customappicons'), [
          { text: t('Notnow'), style: 'cancel' },
          {
            text: t('GoPremium'),
            onPress: () => navigation.navigate('Premium'),
          },
        ]);
        return;
      }

      setChangingIcon(true);
      try {
        if (option.key === 'Default') {
          await resetIcon();
        } else {
          await setIcon(option.key);
        }
        setActiveIcon(option.key);
        await AsyncStorage.setItem(SELECTED_ICON_KEY, option.key);
      } catch (err) {
        console.log('setIcon error', err);
        Alert.alert(
          'Could not change icon',
          'Something went wrong while changing the app icon. Please try again.',
        );
      } finally {
        setChangingIcon(false);
      }
    },
    [activeIcon, changingIcon, isPremium, navigation],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => showThemeInter(() => navigation.goBack())}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <AppText
          style={[styles.topBarTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {t('settings.theme')}
        </AppText>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={[styles.heading, { color: colors.text }]}>
          {t('settings.Appearance')}
        </AppText>
        <AppText style={[styles.subHeading, { color: colors.subText }]}>
          {t('settings.Appearancedetails')}
        </AppText>

        <View style={styles.optionsRow}>
          {OPTIONS.map(opt => {
            const selected = mode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                onPress={() => setMode(opt.mode)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Text style={styles.icon}>{opt.icon}</Text>
                <AppText
                  style={[
                    styles.label,
                    { color: selected ? colors.primary : colors.text },
                  ]}
                >
                  {opt.label}
                </AppText>
                {selected && (
                  <View
                    style={[styles.dot, { backgroundColor: colors.primary }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText
          style={[styles.heading, styles.accentHeading, { color: colors.text }]}
        >
          {t('settings.accentcolor')}
        </AppText>
        <AppText style={[styles.subHeading, { color: colors.subText }]}>
          {t('settings.pickcolor')}
        </AppText>

        <View style={styles.swatchRow}>
          {ACCENT_COLORS.map((color, index) => {
            const selected = accentColor === color;
            return (
              <TouchableOpacity
                key={`${color}-${index}`}
                onPress={() => setAccentColor(color)}
                style={[styles.swatchOuter, selected && { borderColor: color }]}
              >
                <View style={[styles.swatch, { backgroundColor: color }]}>
                  {selected && <View style={styles.swatchCheck} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* App Icon section */}
        <AppText
          style={[styles.heading, styles.accentHeading, { color: colors.text }]}
        >
          {t('settings.Appicon')}
        </AppText>
        <AppText style={[styles.subHeading, { color: colors.subText }]}>
          {t('settings.appicondetail')}
        </AppText>

        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map(opt => {
            const selected = activeIcon === opt.key;
            const locked = !isPremium && opt.key !== 'Default';
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleSelectIcon(opt)}
                activeOpacity={0.8}
                disabled={changingIcon}
                style={styles.iconWrap}
              >
                <View
                  style={[
                    styles.iconOuter,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 3 : 1,
                    },
                  ]}
                >
                  <Image
                    source={opt.preview}
                    style={[styles.iconImage, locked && { opacity: 0.4 }]}
                  />
                  {selected && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                  {locked && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <AppText
                  style={[
                    styles.iconLabel,
                    { color: selected ? colors.primary : colors.text },
                  ]}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {Platform.OS === 'android' && (
          <AppText style={[styles.note, { color: colors.subText }]}>
            On Android, the icon change may take a few seconds to appear on your
            home screen.
          </AppText>
        )}
      </ScrollView>

      <View
        style={[
          styles.stickyAdBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <NativeAdSlot config={AD_SCREENS.theme_screen.native} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  stickyAdBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  lockBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
  },
  topBarTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  heading: { fontSize: 22, fontWeight: '700', marginTop: 20 },
  accentHeading: { marginTop: 28 },
  subHeading: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },

  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  swatchOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginBottom: 30,
  },
  iconWrap: { alignItems: 'center', width: 72 },
  iconOuter: {
    width: 64,
    height: 64,
    borderRadius: 16,
    padding: 3,
    position: 'relative',
  },
  iconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  note: {
    fontSize: 11,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 16,
  },
});
