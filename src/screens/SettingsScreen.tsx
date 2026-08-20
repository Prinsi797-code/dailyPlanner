import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useLayout, WeekStartDay } from '../theme/LayoutContext';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFont } from '../theme/FontContext';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';
import MoodWeekCard from '../components/MoodWeekCard';
import LottieView from 'lottie-react-native';

type Nav = StackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { weekStartDay, setWeekStartDay } = useLayout();
  const [showWeekStartModal, setShowWeekStartModal] = useState(false);

  const WEEK_START_OPTIONS: { value: WeekStartDay; label: string }[] = [
    { value: 'monday', label: t('settings.Monday') },
    { value: 'sunday', label: t('settings.Sunday') },
    { value: 'saturday', label: t('settings.saturday') },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('settings.shareMessage') ?? 'Check out this app!',
        url: 'https://apps.apple.com/in/app/daily-planner-to-do-calendar/id6800204418',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://dailyplanner-app.blogspot.com/2026/08/privacy-policy.html');
  };

  const weekStartLabel =
    WEEK_START_OPTIONS.find(o => o.value === weekStartDay)?.label ?? 'Monday';

  function lightenColor(hex: string, amount: number = 0.35): string {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);

    return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB)
      .toString(16)
      .slice(1)}`;
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText style={[styles.heading, { color: colors.text }]}>
        {t('settings.title')}
      </AppText>
      <AppText style={[styles.subHeading, { color: colors.subText }]}>
        {t('settings.subtitle')}
      </AppText>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Premium' as never)}
        >
          <LinearGradient
            colors={[colors.primary, lightenColor(colors.primary, 0.35)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.premiumBanner]}
          >
            <View style={styles.mainpre}>
              <View style={styles.premiumIconWrap}>
                <LottieView
                  source={require('../assets/emoji/Premium.json')}
                  autoPlay
                  loop
                  style={styles.premiumLottie}
                />
              </View>

              <View style={styles.premiumTextWrap}>
                <AppText style={styles.premiumTitle}>
                  {t('settings.goPremium')}
                </AppText>
                <AppText style={styles.premiumSubtitle}>
                  {t('settings.premiumSubtitle')}
                </AppText>
              </View>

              <View style={styles.premiumBtn}>
                <AppText
                  style={[styles.premiumBtnText, { color: colors.primary }]}
                >
                  {t('settings.upgrade')}
                </AppText>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('Theme')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="color-palette-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.theme')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('LayoutDaysOrder')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="grid-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.layoutDaysOrder')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        {/* <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      > */}
        <View
          style={{
            marginTop: 14,
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 12,
            borderWidth: 1,
          }}
        >
          <MoodWeekCard />
        </View>
        {/* </TouchableOpacity> */}

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('LineType')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="remove-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.lineType')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowWeekStartModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.weekStartDay')}
            </AppText>
          </View>
          <View style={styles.rowRight}>
            <AppText style={[styles.rowValue, { color: colors.subText }]}>
              {weekStartLabel}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.subText} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('Language')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="language-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.language')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => navigation.navigate('FontFamily')}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="text-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.fontFamily')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.share')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handlePrivacyPolicy}
          activeOpacity={0.7}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.text}
              style={styles.rowIcon}
            />
            <AppText style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.privacyPolicy')}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>
      </ScrollView>

      {/* Week Start Day popup */}
      <Modal
        visible={showWeekStartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWeekStartModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWeekStartModal(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={[
                styles.modalBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <AppText style={[styles.modalTitle, { color: colors.text }]}>
                {t('settings.weekStartDay')}
              </AppText>
              {WEEK_START_OPTIONS.map(opt => {
                const selected = weekStartDay === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.modalOption}
                    onPress={() => {
                      setWeekStartDay(opt.value);
                      setShowWeekStartModal(false);
                    }}
                  >
                    <AppText
                      style={[
                        styles.modalOptionText,
                        {
                          color: selected ? colors.primary : colors.text,
                          fontWeight: selected ? '700' : '400',
                        },
                      ]}
                    >
                      {opt.label}
                    </AppText>
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginTop: 60 },
  subHeading: { fontSize: 13, marginTop: 7, marginBottom: 20 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    marginBottom: 8,
  },
  mainpre: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    flex: 1,
  },
  premiumIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    // backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  premiumIconEmoji: { fontSize: 24 },
  premiumTextWrap: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  premiumSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  premiumBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexShrink: 0,
    alignSelf: 'center',
  },
  premiumBtnText: { fontSize: 13, fontWeight: '700' },
  premiumLottie: {
    width: 65,
    height: 65,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowIcon: { marginRight: 10 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  modalOptionText: { fontSize: 15 },
});
