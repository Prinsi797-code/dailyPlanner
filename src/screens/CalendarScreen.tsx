import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  PanResponder,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { useLayout } from '../theme/LayoutContext';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineType, WeekStartDay } from '../theme/LayoutContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';

type Nav = StackNavigationProp<RootStackParamList>;

type PreviewLine = { text: string; checked?: boolean };

function getNotePreviewLines(raw: string | undefined): PreviewLine[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (p.__type === 'blocksV2' && Array.isArray(p.blocks)) {
      const lines: PreviewLine[] = [];
      for (const b of p.blocks) {
        if (b.kind === 'text') {
          // 👇 Fix: text asal me b.runs[].text me hota hai, b.value me nahi
          const combined = Array.isArray(b.runs)
            ? b.runs.map((r: any) => r.text || '').join('')
            : (b.value || '');
          if (combined.trim()) {
            combined.split('\n').forEach((l: string) => {
              if (l.trim()) lines.push({ text: l.trim() });
            });
          }
        } else if (b.kind === 'check' && b.text?.trim()) {
          lines.push({ text: b.text.trim(), checked: b.checked });
        } else if (b.kind === 'list' && b.text?.trim()) {
          lines.push({ text: b.text.trim() });
        } else if (b.kind === 'attachment') {
          lines.push({ text: '📎' + (b.name || 'Attachment') });
        }
      }
      return lines;
    }
    if (p.__type === 'blocksNote' && Array.isArray(p.blocks)) {
      return p.blocks
        .map((b: any) => (b.type === 'check' ? b.text : b.value))
        .filter((t: string) => t?.trim())
        .map((t: string) => ({ text: t.trim() }));
    }
    if (p.__type === 'richNote') {
      const lines: PreviewLine[] = [];
      if (p.text?.trim()) {
        p.text.split('\n').forEach((l: string) => {
          if (l.trim()) lines.push({ text: l.trim() });
        });
      }
      (p.checklist || []).forEach((it: any) => {
        if (it.text?.trim())
          lines.push({ text: it.text.trim(), checked: it.checked });
      });
      return lines;
    }
  } catch {
    return raw
      .split('\n')
      .filter(l => l.trim())
      .map(l => ({ text: l.trim() }));
  }
  return [];
}

function weekStartDayNumber(weekStartDay: WeekStartDay): number {
  if (weekStartDay === 'sunday') return 0;
  if (weekStartDay === 'saturday') return 6;
  return 1;
}

function getWeekStart(date: Date, weekStartDay: WeekStartDay): Date {
  const startNum = weekStartDayNumber(weekStartDay);
  const d = new Date(date);
  const day = d.getDay();
  let diff = day - startNum;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// function dateKey(date: Date): string {
//   return `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
// }
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function isToday(date: Date): boolean {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingBlanks = firstDay.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const NOTES_STORAGE_KEY = '@calendar_notes';

export async function getAllCalendarNotes(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getEmptyLineStyle(type: LineType, color: string) {
  if (type === 'dash' || type === 'dot') {
    return {
      height: 0,
      borderTopWidth: 1 as const,
      borderStyle: (type === 'dash' ? 'dashed' : 'dotted') as
        | 'dashed'
        | 'dotted',
      borderColor: color,
      opacity: 0.5,
    };
  }
  return {
    height: type === 'round' ? 2 : 1,
    borderRadius: type === 'round' ? 2 : 1,
    backgroundColor: color,
    opacity: 0.5,
  };
}

export async function saveCalendarNote(
  key: string,
  text: string,
): Promise<void> {
  const all = await getAllCalendarNotes();
  all[key] = text;
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(all));
}

const SWIPE_THRESHOLD = 40;
const FALLBACK_WIDTH = Dimensions.get('window').width;

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { layoutMode, dayOrder, lineType, weekStartDay } = useLayout();
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(
    getWeekStart(today, weekStartDay),
  );
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date(weekStart));
  const [pickerSelectedDate, setPickerSelectedDate] = useState<Date>(
    new Date(weekStart),
  );

  const FULL_DAY_LETTERS = [
    t('settings.Sun'),
    t('settings.Mon'),
    t('settings.Tue'),
    t('settings.Wed'),
    t('settings.Thu'),
    t('settings.Fri'),
    t('settings.Sat'),
  ];

  const SHORT_DAY_LABELS = [
    t('settings.Sun'),
    t('settings.Mon'),
    t('settings.Tue'),
    t('settings.Wed'),
    t('settings.Thu'),
    t('settings.Fri'),
    t('settings.Sat'),
  ];

  const FULL_DAY_NAMES = [
    t('settings.Sunday'),
    t('settings.Monday'),
    t('settings.Tuesday'),
    t('settings.Wednesday'),
    t('settings.Thursday'),
    t('settings.Friday'),
    t('settings.Saturday'),
  ];

  const MONTH_NAMES = [
    t('settings.Jan'),
    t('settings.Feb'),
    t('settings.Mar'),
    t('settings.Apr'),
    t('settings.May'),
    t('settings.Jun'),
    t('settings.Jul'),
    t('settings.Aug'),
    t('settings.Sep'),
    t('settings.Oct'),
    t('settings.Nov'),
    t('settings.Dec'),
  ];

  function formatDateLabel(date: Date): string {
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
  }
  useFocusEffect(
    useCallback(() => {
      getAllCalendarNotes().then(setNotes);
    }, []),
  );

  React.useEffect(() => {
    setWeekStart(prev => getWeekStart(prev, weekStartDay));
  }, [weekStartDay]);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const prevWeekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i - 7),
  );
  const nextWeekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i + 7),
  );

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));

  const [stripWidth, setStripWidth] = useState(FALLBACK_WIDTH);
  const stripTranslateX = useRef(new Animated.Value(-FALLBACK_WIDTH)).current;
  const isAnimating = useRef(false);

  const onStripLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== stripWidth) {
      setStripWidth(w);
      stripTranslateX.setValue(-w);
    }
  };

  React.useEffect(() => {
    stripTranslateX.setValue(-stripWidth);
  }, [weekStart, stripWidth]);

  const animateWeekChange = (direction: 1 | -1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const target = direction === -1 ? -2 * stripWidth : 0;

    Animated.timing(stripTranslateX, {
      toValue: target,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (direction === -1) {
        nextWeek();
      } else {
        prevWeek();
      }
      isAnimating.current = false;
    });
  };

  const snapBack = () => {
    Animated.spring(stripTranslateX, {
      toValue: -stripWidth,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isAnimating.current &&
        Math.abs(gesture.dx) > 10 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        if (isAnimating.current) return;
        stripTranslateX.setValue(-stripWidth + gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (isAnimating.current) return;
        if (gesture.dx <= -SWIPE_THRESHOLD) {
          animateWeekChange(-1);
        } else if (gesture.dx >= SWIPE_THRESHOLD) {
          animateWeekChange(1);
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => {
        if (!isAnimating.current) snapBack();
      },
    }),
  ).current;

  const monthLabel = (() => {
    const count: Record<number, number> = {};
    weekDates.forEach(d => {
      count[d.getMonth()] = (count[d.getMonth()] || 0) + 1;
    });
    const majorityMonth = Number(
      Object.entries(count).sort((a, b) => b[1] - a[1])[0][0],
    );
    const year = weekDates
      .find(d => d.getMonth() === majorityMonth)!
      .getFullYear();
    return `${MONTH_NAMES[majorityMonth]} ${year}`;
  })();

  const openNote = (date: Date) => {
    navigation.navigate('CalendarNote', {
      dateKey: dateKey(date),
      dateLabel: `${date.getDate()} ${
        MONTH_NAMES[date.getMonth()]
      } ${date.getFullYear()}`,
    });
  };

  const openDatePicker = () => {
    setPickerMonth(new Date(selectedDate));
    setPickerSelectedDate(new Date(selectedDate));
    setShowDatePicker(true);
  };

  const confirmDatePicker = () => {
    setSelectedDate(pickerSelectedDate);
    setWeekStart(getWeekStart(pickerSelectedDate, weekStartDay));
    setShowDatePicker(false);
  };

  const pickerGrid = buildMonthGrid(pickerMonth);

  const groupSize = layoutMode === 'grid' ? 2 : 1;
  const rowGroups: Date[][] = [];

  if (layoutMode === 'grid' && dayOrder === 'colMajor') {
    const numCols = 2;
    const numRows = Math.ceil(weekDates.length / numCols);
    for (let r = 0; r < numRows; r++) {
      const row: Date[] = [];
      for (let c = 0; c < numCols; c++) {
        const idx = c * numRows + r;
        if (idx < weekDates.length) row.push(weekDates[idx]);
      }
      rowGroups.push(row);
    }
  } else {
    for (let i = 0; i < weekDates.length; i += groupSize) {
      rowGroups.push(weekDates.slice(i, i + groupSize));
    }
  }

  const previewLineLimit = layoutMode === 'list' ? 8 : 5;
  const cardMinHeight = layoutMode === 'list' ? 150 : 110;

  const renderWeekRow = (dates: Date[], keyPrefix: string) => {
    const firstDate = dates[0];
    return (
      <View style={[styles.weekBlock, { width: stripWidth }]}>
        {dates.map((date, i) => {
          const today_ = isToday(date);
          const isFirst = isSameDay(date, firstDate);

          return (
            <TouchableOpacity
              key={`${keyPrefix}-${i}`}
              style={styles.dayCol}
              onPress={() => openNote(date)}
            >
              <View
                style={[
                  styles.dayPill,
                  isFirst && {
                    backgroundColor: colors.primary,
                  },
                  !isFirst &&
                    today_ && {
                      backgroundColor: colors.primary + '18',
                    },
                ]}
              >
                <AppText
                  style={[
                    styles.dayLetter,
                    {
                      color: isFirst
                        ? '#fff'
                        : today_
                        ? colors.primary
                        : colors.subText,
                    },
                  ]}
                >
                  {FULL_DAY_LETTERS[date.getDay()]}
                </AppText>
                <AppText
                  style={[
                    styles.dayNum,
                    {
                      color: isFirst
                        ? '#fff'
                        : today_
                        ? colors.primary
                        : colors.subText,
                    },
                  ]}
                >
                  {date.getDate()}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, marginTop: 50 },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthTitleRow}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <AppText style={[styles.monthTitle, { color: colors.text }]}>
            {monthLabel}
          </AppText>
          <Ionicons
            name="chevron-down"
            size={18}
            color={colors.text}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.weekStripOuter,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onLayout={onStripLayout}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.weekTrack,
            { transform: [{ translateX: stripTranslateX }] },
          ]}
        >
          {renderWeekRow(prevWeekDates, 'prev')}
          {renderWeekRow(weekDates, 'curr')}
          {renderWeekRow(nextWeekDates, 'next')}
        </Animated.View>
      </View>

      {/* Day cards */}
      <ScrollView contentContainerStyle={styles.grid}>
        {rowGroups.map((group, gi) => (
          <View key={gi} style={styles.row}>
            {group.map((date, di) => {
              const key = dateKey(date);
              const today_ = isToday(date);
              const lines = getNotePreviewLines(notes[key]).slice(
                0,
                previewLineLimit,
              );
              return (
                <TouchableOpacity
                  key={di}
                  style={[
                    styles.dayCard,
                    {
                      height: cardMinHeight,
                      backgroundColor: colors.card,
                      borderColor: today_ ? colors.primary : colors.border,
                      borderWidth: today_ ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => openNote(date)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.cardHeader,
                      {
                        backgroundColor: today_
                          ? colors.primary + '18'
                          : colors.background,
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.cardDateText,
                        { color: today_ ? colors.primary : colors.text },
                      ]}
                    >
                      {formatDateLabel(date)}
                    </AppText>
                    <AppText
                      style={[styles.cardDayName, { color: colors.subText }]}
                    >
                      {FULL_DAY_NAMES[date.getDay()]}
                    </AppText>
                  </View>

                  <View style={styles.cardBody}>
                    {lines.length > 0
                      ? lines.map((line, li) => (
                          <AppText
                            key={li}
                            style={[
                              styles.notePreviewText,
                              {
                                color: colors.text,
                                textDecorationLine: line.checked
                                  ? 'line-through'
                                  : 'none',
                                opacity: line.checked ? 0.5 : 1,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {line.checked ? '☑ ' : ''}
                            {line.text}
                          </AppText>
                        ))
                      : Array.from({ length: previewLineLimit }).map(
                          (_, li) => (
                            <View
                              key={li}
                              style={[
                                styles.emptyLine,
                                getEmptyLineStyle(lineType, colors.border),
                              ]}
                            />
                          ),
                        )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {layoutMode === 'grid' && group.length === 1 && (
              <View style={styles.dayCard} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Date picker modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => setPickerMonth(d => addMonths(d, -1))}
              >
                <AppText
                  style={[styles.modalMonthTitle, { color: colors.text }]}
                >
                  {MONTH_NAMES[pickerMonth.getMonth()]}{' '}
                  {pickerMonth.getFullYear()}{' '}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.primary}
                  />
                </AppText>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  onPress={() => setPickerMonth(d => addMonths(d, -1))}
                >
                  <Ionicons
                    name="chevron-back"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPickerMonth(d => addMonths(d, 1))}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekday labels */}
            <View style={styles.modalWeekRow}>
              {SHORT_DAY_LABELS.map(lbl => (
                <AppText
                  key={lbl}
                  style={[styles.modalWeekLabel, { color: colors.subText }]}
                >
                  {lbl}
                </AppText>
              ))}
            </View>

            {/* Dates grid */}
            <View style={styles.modalDatesGrid}>
              {pickerGrid.map((date, idx) => {
                if (!date) {
                  return <View key={idx} style={styles.modalDateCell} />;
                }
                const selected = isSameDay(date, pickerSelectedDate);
                const isTodayCell = isToday(date);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalDateCell}
                    onPress={() => setPickerSelectedDate(date)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.modalDateCircle,
                        isTodayCell &&
                          !selected && {
                            borderWidth: 1.5,
                            borderColor: colors.primary,
                          },
                        selected && {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.modalDateText,
                          {
                            color: selected
                              ? '#fff'
                              : isTodayCell
                              ? colors.primary
                              : colors.text,
                          },
                        ]}
                      >
                        {date.getDate()}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cancel / Done */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setShowDatePicker(false)}
              >
                <AppText style={[styles.modalBtnText, { color: colors.text }]}>
                  {t('common.cancel')}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={confirmDatePicker}
              >
                <AppText style={[styles.modalBtnText, { color: '#fff' }]}>
                  {t('common.done')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  monthTitleRow: { flexDirection: 'row', alignItems: 'center' },
  monthTitle: { fontSize: 22, fontWeight: '700' },
  weekStripOuter: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  weekTrack: {
    flexDirection: 'row',
  },
  weekBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayCol: { flex: 1, alignItems: 'center' },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 14,
    gap: 4,
    minWidth: 44,
  },
  dayLetter: { fontSize: 12, fontWeight: '600' },
  dayNum: { fontSize: 16, fontWeight: '700' },
  dayNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 14, fontWeight: '700' },

  grid: { padding: 12, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },

  dayCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emptyLine: {},
  cardDateText: { fontSize: 13, fontWeight: '700' },
  cardDayName: { fontSize: 11 },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
    flex: 1,
    overflow: 'hidden',
  },
  notePreviewText: { fontSize: 11, lineHeight: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    borderRadius: 18,
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalMonthTitle: { fontSize: 17, fontWeight: '700' },
  modalWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  modalDatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalDateCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  modalDateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDateText: { fontSize: 15, fontWeight: '600' },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});
