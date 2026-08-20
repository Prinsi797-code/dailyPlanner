import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../theme/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../localization/i18n';
import { RootStackParamList } from '../navigation/types';
import AppText from '../components/AppText';
import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import NativeAdSlot from '../ads/NativeAdSlot';
import { FLAG_MAP } from '../localization/flagMap';

type Nav = StackNavigationProp<RootStackParamList>;
type LangRoute = RouteProp<RootStackParamList, 'Language'>;

const HAS_LAUNCHED_KEY = 'hasLaunchedBefore';

export default function LanguageScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<LangRoute>();
  const isFirstLaunch = !!route.params?.isFirstLaunch;

  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const showLanguageInter = useScreenInterstitial(
    AD_SCREENS.language_screen.inter,
    'language_inter',
  );

  const handleDone = async () => {
    if (isFirstLaunch) {
      await AsyncStorage.setItem(HAS_LAUNCHED_KEY, 'true');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      return;
    }
    showLanguageInter(() => navigation.goBack());
  };

  const handleBack = () => {
    if (isFirstLaunch) return;
    showLanguageInter(() => navigation.goBack());
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        {isFirstLaunch ? (
          <View style={styles.backBtn} />
        ) : (
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backBtn,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </TouchableOpacity>
        )}

        <AppText style={[styles.topBarTitle, { color: colors.text }]}>
          {t('settings.language')}
        </AppText>

        <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
          <AppText style={[styles.doneText, { color: colors.primary }]}>
            {t('common.done')}
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {SUPPORTED_LANGUAGES.map(lang => {
          const selected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.7}
              onPress={() => setLanguage(lang.code)}
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View style={styles.langLeft}>
                <Image
                  source={FLAG_MAP[lang.code]}
                  style={styles.flagIcon}
                  resizeMode="cover"
                />
                <AppText style={[styles.langLabel, { color: colors.text }]}>
                  {lang.label}
                </AppText>
              </View>

              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!isFirstLaunch && (
        <View
          style={[
            styles.stickyAdBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <NativeAdSlot config={AD_SCREENS.language_screen.native} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: 30,
    height: 30,
    borderRadius: 15, // round icon
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  langLabel: { fontSize: 16, fontWeight: '600' },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
  },
  topBarTitle: { fontSize: 20, fontWeight: '700' },
  doneBtn: { paddingHorizontal: 4, paddingVertical: 6 },
  doneText: { fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  stickyAdBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
});
