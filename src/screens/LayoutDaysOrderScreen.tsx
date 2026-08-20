import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLayout, LayoutMode, DayOrder } from '../theme/LayoutContext';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import NativeAdSlot from '../ads/NativeAdSlot';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';

function LayoutPreview({
  mode,
  mutedColor,
}: {
  mode: LayoutMode;
  mutedColor: string;
}) {
  return (
    <View style={styles.previewWrap}>
      {[0, 1, 2].map(r => (
        <View key={r} style={styles.previewRow}>
          <View style={[styles.previewBar, { backgroundColor: mutedColor }]} />
          {mode === 'grid' && (
            <View
              style={[styles.previewBar, { backgroundColor: mutedColor }]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const COL_X = [28, 92];
const ROW_Y = [18, 48, 78, 108];
const DOT_R = 5;

function getDotPoints() {
  const pts: { x: number; y: number }[] = [];
  for (let c = 0; c < 2; c++) {
    for (let r = 0; r < 4; r++) {
      pts.push({ x: COL_X[c], y: ROW_Y[r] });
    }
  }
  return pts;
}

function OrderPreview({
  mode,
  mutedColor,
  dotColor,
}: {
  mode: DayOrder;
  mutedColor: string;
  dotColor: string;
}) {
  let sequence: { x: number; y: number }[];
  let arrow: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    dir: 'right' | 'down';
  };

  if (mode === 'rowMajor') {
    sequence = [
      { x: COL_X[0], y: ROW_Y[0] },
      { x: COL_X[1], y: ROW_Y[0] },
      { x: COL_X[0], y: ROW_Y[1] },
      { x: COL_X[1], y: ROW_Y[1] },
      { x: COL_X[0], y: ROW_Y[2] },
      { x: COL_X[1], y: ROW_Y[2] },
      { x: COL_X[0], y: ROW_Y[3] },
    ];
    arrow = {
      x1: COL_X[0],
      y1: ROW_Y[3],
      x2: COL_X[1] + 14,
      y2: ROW_Y[3],
      dir: 'right',
    };
  } else {
    sequence = [
      { x: COL_X[0], y: ROW_Y[0] },
      { x: COL_X[0], y: ROW_Y[1] },
      { x: COL_X[0], y: ROW_Y[2] },
      { x: COL_X[0], y: ROW_Y[3] },
      { x: COL_X[1], y: ROW_Y[0] },
      { x: COL_X[1], y: ROW_Y[1] },
      { x: COL_X[1], y: ROW_Y[2] },
    ];
    arrow = {
      x1: COL_X[1],
      y1: ROW_Y[2],
      x2: COL_X[1],
      y2: ROW_Y[3] + 14,
      dir: 'down',
    };
  }

  const allDots = getDotPoints();

  return (
    <Svg width={120} height={128} viewBox="0 0 120 128">
      {sequence.slice(0, -1).map((p, i) => {
        const next = sequence[i + 1];
        return (
          <Line
            key={i}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke={mutedColor}
            strokeWidth={1.5}
          />
        );
      })}

      <Line
        x1={arrow.x1}
        y1={arrow.y1}
        x2={arrow.x2}
        y2={arrow.y2}
        stroke={mutedColor}
        strokeWidth={1.5}
      />
      {arrow.dir === 'right' ? (
        <Polygon
          points={`${arrow.x2},${arrow.y2 - 5} ${arrow.x2},${arrow.y2 + 5} ${
            arrow.x2 + 8
          },${arrow.y2}`}
          fill={mutedColor}
        />
      ) : (
        <Polygon
          points={`${arrow.x2 - 5},${arrow.y2} ${arrow.x2 + 5},${arrow.y2} ${
            arrow.x2
          },${arrow.y2 + 8}`}
          fill={mutedColor}
        />
      )}

      {allDots.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={DOT_R} fill={dotColor} />
      ))}
    </Svg>
  );
}

export default function LayoutDaysOrderScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { layoutMode, setLayoutMode, dayOrder, setDayOrder } = useLayout();
  const { t } = useTranslation();
  const showLayoutInter = useScreenInterstitial(
    AD_SCREENS.layout_screen.inter,
    'layout_inter',
  );

  const LAYOUT_OPTIONS: { mode: LayoutMode; label: string }[] = [
    { mode: 'grid', label: t('settings.2perrow') },
    { mode: 'list', label: t('settings.1perrow') },
  ];

  const ORDER_OPTIONS: { mode: DayOrder; label: string }[] = [
    { mode: 'rowMajor', label: t('settings.Roworder') },
    { mode: 'colMajor', label: t('settings.Columnorder') },
  ];

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <TouchableOpacity
        style={[
          styles.backBtn,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={26} color={colors.primary} />
      </TouchableOpacity> */}

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => showLayoutInter(() => navigation.goBack())}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.heading, { color: colors.text }]}>
          {t('settings.LayoutDaysOrder')}
        </AppText>
      </View>

      <AppText style={[styles.subHeading, { color: colors.subText }]}>
        {t('settings.layoutdaysdetail')}
      </AppText>

      <View style={styles.optionsGrid}>
        {LAYOUT_OPTIONS.map(opt => {
          const selected = layoutMode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              onPress={() => setLayoutMode(opt.mode)}
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
              <LayoutPreview mode={opt.mode} mutedColor={colors.border} />
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
              <AppText
                style={[
                  styles.optionLabel,
                  { color: selected ? colors.primary : colors.text },
                ]}
              >
                {opt.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {layoutMode === 'grid' && (
        <>
          <Text style={[styles.heading, { color: colors.text, marginTop: 28 }]}>
            {/* Days Order */}
          </Text>
          <AppText style={[styles.subHeading, { color: colors.subText }]}>
            {t('settings.Choosegrid')}
          </AppText>
          <View style={styles.optionsGrid}>
            {ORDER_OPTIONS.map(opt => {
              const selected = dayOrder === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setDayOrder(opt.mode)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    styles.orderOptionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  <OrderPreview
                    mode={opt.mode}
                    mutedColor={colors.subText}
                    dotColor={colors.subText}
                  />
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
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
      <View
        style={[
          styles.stickyAdBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <NativeAdSlot config={AD_SCREENS.layout_screen.native} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    height: 34,
    position: 'relative',
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
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heading: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  subHeading: { fontSize: 13, marginTop: 16, marginBottom: 5 },
  optionsGrid: { flexDirection: 'row', gap: 14 },
  optionCard: { flex: 1, borderRadius: 16, padding: 12, position: 'relative' },
  orderOptionCard: { alignItems: 'center', justifyContent: 'center' },
  previewWrap: { gap: 8, marginBottom: 10 },
  previewRow: { flexDirection: 'row', gap: 6, height: 26 },
  previewBar: { flex: 1, borderRadius: 4 },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  optionLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
