import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLayout, LineType } from '../theme/LayoutContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import NativeAdSlot from '../ads/NativeAdSlot';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';

function LinePreviewRow({ type, color }: { type: LineType; color: string }) {
  if (type === 'dash' || type === 'dot') {
    return (
      <View
        style={[
          styles.previewLineDashDot,
          {
            borderColor: color,
            borderStyle: type === 'dash' ? 'dashed' : 'dotted',
          },
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.previewLineSolid,
        {
          backgroundColor: color,
          borderRadius: type === 'round' ? 3 : 1,
          height: type === 'round' ? 2.5 : 1,
        },
      ]}
    />
  );
}

function LinePreview({ type, color }: { type: LineType; color: string }) {
  return (
    <View style={styles.previewWrap}>
      {Array.from({ length: 7 }).map((_, i) => (
        <LinePreviewRow key={i} type={type} color={color} />
      ))}
    </View>
  );
}

export default function LineTypeScreen() {
  const { colors } = useTheme();
  const { lineType, setLineType } = useLayout();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const showlinetypeInter = useScreenInterstitial(
    AD_SCREENS.linetype_screen.inter,
    'line_inter',
  );

  const LINE_OPTIONS: { type: LineType; label: string }[] = [
    { type: 'solid', label: t('settings.Line') },
    { type: 'round', label: t('settings.RoundLine') },
    { type: 'dash', label: t('settings.DashLine') },
    { type: 'dot', label: t('settings.DotLine') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          // onPress={() => navigation.goBack()}
          onPress={() => showlinetypeInter(() => navigation.goBack())}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.heading, { color: colors.text }]}>
          {t('settings.LineType')}
        </AppText>
      </View>
      <AppText style={[styles.subHeading, { color: colors.subText }]}>
        {t('settings.linetypedetail')}
      </AppText>

      <View style={styles.optionsGrid}>
        {LINE_OPTIONS.map(opt => {
          const selected = lineType === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              onPress={() => setLineType(opt.type)}
              activeOpacity={0.8}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.optionHeader,
                  { backgroundColor: colors.background },
                ]}
              >
                <AppText style={[styles.optionLabel, { color: colors.text }]}>
                  {opt.label}
                </AppText>
                {selected && (
                  <View
                    style={[
                      styles.checkBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.optionBody}>
                <LinePreview type={opt.type} color={colors.border} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View
        style={[
          styles.stickyAdBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <NativeAdSlot config={AD_SCREENS.linetype_screen.native} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  // heading: { fontSize: 22, fontWeight: '700', marginTop: 20 },
  subHeading: { fontSize: 13, marginTop: 7, marginBottom: 24 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    height: 34,
    position: 'relative',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stickyAdBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  heading: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  optionCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionLabel: { fontSize: 15, fontWeight: '700' },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  optionBody: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    minHeight: 130,
    justifyContent: 'center',
  },
  previewWrap: { gap: 12 },
  previewLineSolid: { width: '100%' },
  previewLineDashDot: { width: '100%', borderTopWidth: 1 },
});
