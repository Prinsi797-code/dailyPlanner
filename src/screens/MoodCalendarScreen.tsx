// src/screens/MoodCalendarScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AppText from '../components/AppText';
import { getAllMoods } from '../storage/moodStorage';
import { MOODS } from '../constants/moods';
import MoodSheetModal from '../components/MoodSheetModal';
import MoodLineChart, { ChartPoint } from '../components/MoodLineChart';

type Nav = StackNavigationProp<RootStackParamList>;

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
type WeekRangeMode = 'last7' | 'thisWeek' | 'custom';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const diff = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = startOffset; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  const weeks: { date: Date; inMonth: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function MoodCalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [chartMode, setChartMode] = useState<'week' | 'month'>('week');
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({});
  const [moodModalDate, setMoodModalDate] = useState<Date | null>(null);

  // 👇 naya: week range settings
  const [weekRangeMode, setWeekRangeMode] = useState<WeekRangeMode>('last7');
  const [customWeekStart, setCustomWeekStart] = useState<Date>(
    startOfWeek(today),
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);
  const [pendingWeekStart, setPendingWeekStart] = useState<Date>(
    startOfWeek(today),
  );

  const loadMoods = useCallback(() => {
    getAllMoods().then(all => {
      const map: Record<string, string> = {};
      all.forEach(m => (map[m.date] = m.moodId));
      setMoodsByDate(map);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMoods();
    }, [loadMoods]),
  );

  const weeks = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    'en-US',
    { month: 'short', year: 'numeric' },
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // 👇 week-mode ke liye 7 dates nikalna, mode ke hisaab se
  const weekDates: Date[] =
    weekRangeMode === 'last7'
      ? Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)))
      : weekRangeMode === 'thisWeek'
      ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today), i))
      : Array.from({ length: 7 }, (_, i) => addDays(customWeekStart, i));

  const chartDates =
    chartMode === 'week'
      ? weekDates.map(date => ({ date, inMonth: true }))
      : weeks.flat().filter(c => c.inMonth);

  const chartPoints: ChartPoint[] = chartDates.map(({ date }) => {
    const key = dateKey(date);
    const moodId = moodsByDate[key];
    const mood = moodId ? MOODS.find(m => m.id === moodId) ?? null : null;
    return { label: String(date.getDate()), mood };
  });

  const weekRangeLabel = (start: Date) => {
    const end = addDays(start, 6);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const openWeekPicker = () => {
    setPendingWeekStart(
      weekRangeMode === 'custom' ? customWeekStart : startOfWeek(today),
    );
    setSettingsVisible(false);
    setWeekPickerVisible(true);
  };

  const confirmWeekPicker = () => {
    setCustomWeekStart(pendingWeekStart);
    setWeekRangeMode('custom');
    setWeekPickerVisible(false);
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AppText style={[styles.closeIcon, { color: colors.text }]}>
              ✕
            </AppText>
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>
            {t('settings.Moods')}
          </AppText>
          {/* 👇 gear ab settings sheet kholta hai */}
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
          <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
            <View style={styles.monthNavRow}>
              <TouchableOpacity onPress={goPrevMonth}>
                <Ionicons name="chevron-back" size={20} color={colors.subText} />
              </TouchableOpacity>
              <AppText style={[styles.monthLabel, { color: colors.text }]}>
                {monthLabel}
              </AppText>
              <TouchableOpacity onPress={goNextMonth}>
                <Ionicons name="chevron-forward" size={20} color={colors.subText} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekLabelsRow}>
              {DAY_LETTERS.map((l, i) => (
                <AppText key={i} style={[styles.weekLabel, { color: colors.subText }]}>
                  {l}
                </AppText>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map(({ date, inMonth }) => {
                  const key = dateKey(date);
                  const moodId = moodsByDate[key];
                  const mood = moodId ? MOODS.find(m => m.id === moodId) : null;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.dayCell}
                      activeOpacity={0.7}
                      onPress={() => setMoodModalDate(date)}
                    >
                      {mood ? (
                        <View style={[styles.moodCircle]}>
                          {mood.image ? (
                            <Image
                              source={mood.image}
                              style={{ width: 20, height: 20 }}
                              resizeMode="contain"
                            />
                          ) : (
                            <AppText style={styles.moodEmoji}>{mood.emoji}</AppText>
                          )}
                        </View>
                      ) : (
                        <AppText
                          style={[
                            styles.dayNum,
                            {
                              color: inMonth ? colors.text : colors.subText,
                              opacity: inMonth ? 1 : 0.4,
                            },
                          ]}
                        >
                          {date.getDate()}
                        </AppText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <View style={styles.chartHeaderRow}>
              <AppText style={[styles.chartTitle, { color: colors.text }]}>
                {t('settings.MoodChart')}
              </AppText>
              <View style={[styles.toggleWrap, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                  style={[styles.toggleBtn, chartMode === 'week' && { backgroundColor: colors.primary }]}
                  onPress={() => setChartMode('week')}
                >
                  <AppText style={[styles.toggleText, { color: chartMode === 'week' ? '#fff' : colors.subText }]}>
                    {t('settings.Week')}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, chartMode === 'month' && { backgroundColor: colors.primary }]}
                  onPress={() => setChartMode('month')}
                >
                  <AppText style={[styles.toggleText, { color: chartMode === 'month' ? '#fff' : colors.subText }]}>
                    {t('settings.Month')}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* 👇 chuna hua week range dikhane ke liye chota label */}
            {chartMode === 'week' && (
              <AppText style={{ color: colors.subText, fontSize: 12, marginBottom: 10 }}>
                {weekRangeMode === 'last7'
                  ? t('settings.Last7Days')
                  : weekRangeMode === 'thisWeek'
                  ? t('settings.ThisWeek')
                  : weekRangeLabel(customWeekStart)}
              </AppText>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <MoodLineChart points={chartPoints} />
            </ScrollView>
          </View>
        </ScrollView>

        <MoodSheetModal
          visible={!!moodModalDate}
          date={moodModalDate}
          onClose={() => setMoodModalDate(null)}
          onSaved={() => loadMoods()}
        />

        {/* 👇 iOS-style action sheet: week range settings */}
        <Modal
          visible={settingsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setSettingsVisible(false)}
          >
            <View style={styles.sheetWrap}>
              <View style={[styles.sheetCard, { backgroundColor: colors.card }]}>
                <AppText style={[styles.sheetHeader, { color: colors.subText }]}>
                  {t('settings.WeekRange')}
                </AppText>

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setWeekRangeMode('last7');
                    setSettingsVisible(false);
                  }}
                >
                  <AppText style={[styles.sheetOptionText, { color: colors.text }]}>
                    {t('settings.Last7Days')}
                  </AppText>
                  {weekRangeMode === 'last7' && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <View style={[styles.sheetDivider, { backgroundColor: colors.background }]} />

                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => {
                    setWeekRangeMode('thisWeek');
                    setSettingsVisible(false);
                  }}
                >
                  <AppText style={[styles.sheetOptionText, { color: colors.text }]}>
                    {t('settings.ThisWeek')}
                  </AppText>
                  {weekRangeMode === 'thisWeek' && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <View style={[styles.sheetDivider, { backgroundColor: colors.background }]} />

                <TouchableOpacity style={styles.sheetOption} onPress={openWeekPicker}>
                  <AppText style={[styles.sheetOptionText, { color: colors.text }]}>
                    {t('settings.ChooseWeek')}
                  </AppText>
                  {weekRangeMode === 'custom' && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sheetCancel, { backgroundColor: colors.card }]}
                onPress={() => setSettingsVisible(false)}
              >
                <AppText style={[styles.sheetCancelText, { color: colors.primary }]}>
                  {t('common.cancel')}
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 👇 custom week picker: prev/next navigate karke week choose karo */}
        <Modal
          visible={weekPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setWeekPickerVisible(false)}
        >
          <View style={styles.sheetBackdrop}>
            <View style={styles.sheetWrap}>
              <View style={[styles.sheetCard, { backgroundColor: colors.card, paddingVertical: 20 }]}>
                <AppText style={[styles.sheetHeader, { color: colors.subText, marginBottom: 16 }]}>
                  {t('settings.ChooseWeek')}
                </AppText>

                <View style={styles.weekPickerNavRow}>
                  <TouchableOpacity onPress={() => setPendingWeekStart(p => addDays(p, -7))}>
                    <Ionicons name="chevron-back" size={22} color={colors.subText} />
                  </TouchableOpacity>
                  <AppText style={[styles.weekPickerLabel, { color: colors.text }]}>
                    {weekRangeLabel(pendingWeekStart)}
                  </AppText>
                  <TouchableOpacity onPress={() => setPendingWeekStart(p => addDays(p, 7))}>
                    <Ionicons name="chevron-forward" size={22} color={colors.subText} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.weekPickerDone, { backgroundColor: colors.primary }]}
                  onPress={confirmWeekPicker}
                >
                  <AppText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    {t('common.done')}
                  </AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.sheetCancel, { backgroundColor: colors.card }]}
                onPress={() => setWeekPickerVisible(false)}
              >
                <AppText style={[styles.sheetCancelText, { color: colors.primary }]}>
                  {t('common.cancel')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  closeIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  calendarCard: { borderRadius: 18, marginHorizontal: 16, padding: 16 },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  weekLabelsRow: { flexDirection: 'row', marginBottom: 8 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  dayCell: { flex: 1, alignItems: 'center' },
  dayNum: { fontSize: 18, fontWeight: '600' },
  moodCircle: {
    width: 20,
    height: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: { fontSize: 16 },
  chartCard: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '800' },
  toggleWrap: { flexDirection: 'row', borderRadius: 20, padding: 3 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18 },
  toggleText: { fontSize: 12, fontWeight: '700' },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 13 },

  // 👇 iOS action sheet styles
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrap: { paddingHorizontal: 8, paddingBottom: 8 },
  sheetCard: { borderRadius: 14, overflow: 'hidden' },
  sheetHeader: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  sheetOptionText: { fontSize: 17, marginRight: 6 },
  sheetDivider: { height: StyleSheet.hairlineWidth, opacity: 0.5 },
  sheetCancel: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetCancelText: { fontSize: 17, fontWeight: '700' },
  weekPickerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  weekPickerLabel: { fontSize: 16, fontWeight: '700', minWidth: 140, textAlign: 'center' },
  weekPickerDone: {
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});