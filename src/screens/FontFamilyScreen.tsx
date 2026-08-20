import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { useFont, FontFamilyOption } from '../theme/FontContext';
import { RootStackParamList } from '../navigation/types';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';
import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import NativeAdSlot from '../ads/NativeAdSlot';

type Nav = StackNavigationProp<RootStackParamList>;

interface FontOption {
  key: FontFamilyOption;
  label: string;
  fontFamily: string;
}

const FONT_OPTIONS: FontOption[] = [
  { key: 'System', label: 'System Default', fontFamily: 'System' },
  {
    key: 'ArianaVioleta',
    label: 'Ariana Violeta',
    fontFamily: 'ArianaVioleta',
  },
  { key: 'BeckyTahlia', label: 'Becky Tahlia', fontFamily: 'BeckyTahlia' },
  { key: 'HappySwirly', label: 'Happy Swirly', fontFamily: 'HappySwirly' },
  { key: 'LoveDays', label: 'Love Days', fontFamily: 'LoveDays' },
  {
    key: 'RoughenCorner',
    label: 'Roughen Corner',
    fontFamily: 'RoughenCornerRegular',
  },
  { key: 'BelieveIt', label: 'Roughen Corner', fontFamily: 'BelieveIt' },
  { key: 'Branda', label: 'Roughen Corner', fontFamily: 'Branda' },
  { key: 'ChrustyRock', label: 'Roughen Corner', fontFamily: 'ChrustyRock' },
  { key: 'CookieCrisp', label: 'Roughen Corner', fontFamily: 'CookieCrisp' },
  { key: 'Debrosee', label: 'Roughen Corner', fontFamily: 'Debrosee' },
];

export default function FontFamilyScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { fontFamily, setFontFamily } = useFont();
  const { t } = useTranslation();

  const showLanguageInter = useScreenInterstitial(
    AD_SCREENS.language_screen.inter,
    'language_inter',
  );

  const handleDone = () => {
    showLanguageInter(() => navigation.goBack());
    // navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => showLanguageInter(() => navigation.goBack())}
          // onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={[styles.topBarTitle, { color: colors.text }]}>
          {t('settings.fontFamily')}
        </AppText>
        <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
          <AppText style={[styles.doneText, { color: colors.primary }]}>
            {t('common.done')}
          </AppText>
        </TouchableOpacity>
      </View>

      <AppText style={[styles.subHeading, { color: colors.subText }]}>
        {t('settings.plannertextdetails')}
      </AppText>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {FONT_OPTIONS.map(opt => {
          const selected = fontFamily === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => setFontFamily(opt.key)}
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText
                  style={[
                    styles.previewText,
                    { color: colors.text, fontFamily: opt.fontFamily },
                  ]}
                >
                  Aa Bb Cc — {opt.label}
                </AppText>
                <AppText style={[styles.labelText, { color: colors.subText }]}>
                  {opt.label}
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
      <View
        style={[
          styles.stickyAdBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <NativeAdSlot config={AD_SCREENS.language_screen.native} />
      </View>
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
  stickyAdBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
  },
  topBarTitle: { fontSize: 20, fontWeight: '700' },
  doneBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    minWidth: 34,
    alignItems: 'flex-end',
  },
  doneText: { fontSize: 16, fontWeight: '700' },
  subHeading: { fontSize: 13, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  previewText: { fontSize: 18, marginBottom: 4 },
  labelText: { fontSize: 12 },
});
