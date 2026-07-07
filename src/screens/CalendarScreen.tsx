import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = StackNavigationProp<RootStackParamList>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
type PreviewLine = { text: string; checked?: boolean };

function getNotePreviewLines(raw: string | undefined): PreviewLine[] {
  if (!raw) return [];

  try {
    const p = JSON.parse(raw);

    if (p.__type === 'blocksV2' && Array.isArray(p.blocks)) {
      const lines: PreviewLine[] = [];
      for (const b of p.blocks) {
        if (b.kind === 'text' && b.value?.trim()) {
          // multiline text block ko bhi split karo
          b.value.split('\n').forEach((l: string) => {
            if (l.trim()) lines.push({ text: l.trim() });
          });
        } else if (b.kind === 'check' && b.text?.trim()) {
          lines.push({ text: b.text.trim(), checked: b.checked });
        } else if (b.kind === 'list' && b.text?.trim()) {
          lines.push({ text: b.text.trim() });
        } else if (b.kind === 'attachment') {
          lines.push({ text: '📎 ' + (b.name || 'Attachment') });
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
        if (it.text?.trim()) lines.push({ text: it.text.trim(), checked: it.checked });
      });
      return lines;
    }
  } catch {
    // Purana plain-text format (JSON nahi hai)
    return raw.split('\n').filter(l => l.trim()).map(l => ({ text: l.trim() }));
  }

  return [];
}
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
}

function formatDateLabel(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

function isToday(date: Date): boolean {
  const t = new Date();
  return date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear();
}

const NOTES_STORAGE_KEY = '@calendar_notes';

export async function getAllCalendarNotes(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function saveCalendarNote(key: string, text: string): Promise<void> {
  const all = await getAllCalendarNotes();
  all[key] = text;
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(all));
}

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(getMonday(today));
  const [notes, setNotes] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      getAllCalendarNotes().then(setNotes);
    }, [])
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));

  const monthLabel = (() => {
    const count: Record<number, number> = {};
    weekDates.forEach(d => { count[d.getMonth()] = (count[d.getMonth()] || 0) + 1; });
    const majorityMonth = Number(Object.entries(count).sort((a, b) => b[1] - a[1])[0][0]);
    const year = weekDates.find(d => d.getMonth() === majorityMonth)!.getFullYear();
    return `${MONTH_NAMES[majorityMonth]} ${year}`;
  })();

  const openNote = (date: Date) => {
    navigation.navigate('CalendarNote', {
      dateKey: dateKey(date),
      dateLabel: `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
    });
  };

  const pairs: Date[][] = [];
  for (let i = 0; i < weekDates.length; i += 2) {
    pairs.push(weekDates.slice(i, i + 2));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, marginTop: 50 }]}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>{monthLabel}</Text>
      </View>

      <View style={[styles.weekStrip, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.arrowBtn} onPress={prevWeek}>
          <Text style={{ color: colors.text, fontSize: 20 }}>‹</Text>
        </TouchableOpacity>

        {weekDates.map((date, i) => {
          const today_ = isToday(date);
          return (
            <TouchableOpacity key={i} style={styles.dayCol} onPress={() => openNote(date)}>
              <Text style={[styles.dayLetter, { color: today_ ? colors.primary : colors.subText }]}>
                {DAY_LABELS[i]}
              </Text>
              <View style={[
                styles.dayNumWrap,
                today_ && { backgroundColor: colors.primary },
              ]}>
                <Text style={[
                  styles.dayNum,
                  { color: today_ ? '#fff' : colors.text },
                ]}>
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.arrowBtn} onPress={nextWeek}>
          <Text style={{ color: colors.text, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day cards grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {pairs.map((pair, pi) => (
          <View key={pi} style={styles.row}>
            {pair.map((date, di) => {
              // const key = dateKey(date);
              // const noteText = notes[key] || '';
              // const today_ = isToday(date);
              // const lines = noteText.split('\n').filter(Boolean).slice(0, 5);
              const key = dateKey(date);
              const today_ = isToday(date);
              const lines = getNotePreviewLines(notes[key]).slice(0, 5);
              return (
                <TouchableOpacity
                  key={di}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: today_ ? colors.primary : colors.border,
                      borderWidth: today_ ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => openNote(date)}
                  activeOpacity={0.8}
                >
                  {/* Card header */}
                  <View style={[
                    styles.cardHeader,
                    { backgroundColor: today_ ? colors.primary + '18' : colors.background },
                  ]}>
                    <Text style={[styles.cardDateText, { color: today_ ? colors.primary : colors.text }]}>
                      {formatDateLabel(date)}
                    </Text>
                    <Text style={[styles.cardDayName, { color: colors.subText }]}>
                      {DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                    </Text>
                  </View>

                  {/* Note preview lines */}
                  <View style={styles.cardBody}>
                    {lines.length > 0
                      ? lines.map((line, li) => (
                        <Text
                          key={li}
                          style={[
                            styles.notePreviewText,
                            {
                              color: colors.text,
                              textDecorationLine: line.checked ? 'line-through' : 'none',
                              opacity: line.checked ? 0.5 : 1,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {line.checked ? '☑ ' : ''}{line.text}
                        </Text>
                      ))
                      : Array.from({ length: 5 }).map((_, li) => (
                        <View
                          key={li}
                          style={[styles.emptyLine, { backgroundColor: colors.border }]}
                        />
                      ))
                    }
                  </View>
                </TouchableOpacity>
              );
            })}
            {pair.length === 1 && <View style={styles.dayCard} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  monthTitle: { fontSize: 22, fontWeight: '700' },

  weekStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  arrowBtn: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayCol: { flex: 1, alignItems: 'center', gap: 4 },
  dayLetter: { fontSize: 12, fontWeight: '600' },
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

  dayCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 130,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardDateText: { fontSize: 13, fontWeight: '700' },
  cardDayName: { fontSize: 11 },
  cardBody: { paddingHorizontal: 10, paddingVertical: 8, gap: 7, flex: 1 },
  emptyLine: { height: 1, borderRadius: 1, opacity: 0.5 },
  notePreviewText: { fontSize: 11, lineHeight: 16 },
});