// src/screens/HebitScreen.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  StatusBar,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import CreateReminderModal, {
  NewReminderData,
} from '../components/CreateReminderModal';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';
import { getAllMoods, MoodEntry } from '../storage/moodStorage';
import { MOODS } from '../constants/moods';
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';

type Nav = StackNavigationProp<RootStackParamList>;

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = SCREEN_WIDTH / 7;

const CIRCLE_SIZE = DAY_WIDTH - 20;
const ROW_MARGIN_TOP = 6;
const WEEK_ROW_HEIGHT = CIRCLE_SIZE + ROW_MARGIN_TOP;

const REMINDERS_STORAGE_KEY = '@planwiz_reminders';

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getWeekDates(anchor: Date) {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateKeyLocal(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const ensureReminderChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'reminders_v2',
      name: 'Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

function combineDateAndTime(dateStr: string, timeStr?: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const result = new Date(year, month - 1, day, 9, 0, 0);

  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const isPM = /PM/i.test(match[3]);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      result.setHours(hours, minutes, 0, 0);
    }
  }
  return result;
}

const scheduleReminderNotification = async (reminder: {
  id: string;
  title: string;
  date: string;
  time?: string;
}) => {
  await notifee.requestPermission();
  await ensureReminderChannel();
  await notifee.cancelNotification(reminder.id);

  const fireDate = combineDateAndTime(reminder.date, reminder.time);
  if (fireDate.getTime() <= Date.now()) return;

  await notifee.createTriggerNotification(
    {
      id: reminder.id,
      title: 'Daily Planner Reminder',
      body: reminder.title,
      android: {
        channelId: 'reminders_v2',
        pressAction: { id: 'default' },
        sound: 'default',
      },
      ios: { sound: 'default' },
    },
    { type: TriggerType.TIMESTAMP, timestamp: fireDate.getTime() },
  );
};

const cancelReminderNotification = async (id: string) => {
  await notifee.cancelNotification(id);
};

export interface Reminder {
  id: string;
  title: string;
  time?: string;
  done?: boolean;
  date: string;
  color?: string;
}

interface HebitScreenProps {
  maxReminders?: number;
  onSettingsPress?: () => void;
  onSearchPress?: () => void;
}

function WeekRow({
  weekDates,
  selectedDate,
  onSelect,
  primaryColor,
  textColor,
  datesWithReminders,
}: {
  weekDates: Date[];
  selectedDate: Date;
  onSelect: (d: Date) => void;
  primaryColor: string;
  textColor: string;
  datesWithReminders: Set<string>;
}) {
  return (
    <View style={styles.weekDatesRow}>
      {weekDates.map(d => {
        const selected = isSameDay(d, selectedDate);
        const hasReminders = datesWithReminders.has(dateKey(d));
        return (
          <View key={d.toISOString()} style={styles.dateCol}>
            {selected ? (
              <TouchableOpacity
                onPress={() => onSelect(d)}
                style={[styles.dateCircle, { backgroundColor: primaryColor }]}
              >
                <AppText style={[styles.dateText, { color: '#fff' }]}>
                  {d.getDate()}
                </AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => onSelect(d)}
                style={styles.dateCircle}
              >
                <AppText style={[styles.dateText, { color: textColor }]}>
                  {d.getDate()}
                </AppText>
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.dateDot,
                {
                  backgroundColor: hasReminders ? primaryColor : 'transparent',
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

export default function HebitScreen({
  maxReminders = 10,
  onSettingsPress,
  onSearchPress,
}: HebitScreenProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const primary = (colors as any).primary ?? (colors as any).accent;
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [baseDate, setBaseDate] = useState(today);
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({}); // 👈 ye add karo
  const [loaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const isJumping = useRef(false);

  const DAY_LABELS = [
    t('settings.Sun'),
    t('settings.Mon'),
    t('settings.Tue'),
    t('settings.Wed'),
    t('settings.Thu'),
    t('settings.Fri'),
    t('settings.Sat'),
  ];
  const MONTH_LABELS = [
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
  const proScale = useRef(new Animated.Value(1)).current;

  function EmptyState({ colors }: { colors: any }) {
    return (
      <View style={styles.emptyState}>
        <AppText style={[styles.emptyTitle, { color: colors.text }]}>
          {t('settings.AchieveReminders')}
        </AppText>
        <AppText style={[styles.emptySub, { color: colors.subText }]}>
          {t('settings.achievedetail')}
        </AppText>
      </View>
    );
  }

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(proScale, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(proScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [proScale]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        if (stored) {
          setAllReminders(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load reminders', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getAllMoods().then((all: MoodEntry[]) => {
        const map: Record<string, string> = {};
        all.forEach(m => (map[m.date] = m.moodId));
        setMoodsByDate(map);
      });
    }, []),
  );

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      REMINDERS_STORAGE_KEY,
      JSON.stringify(allReminders),
    ).catch(e => console.error('Failed to save reminders', e));
  }, [allReminders, loaded]);

  const weeks = useMemo(
    () => [
      getWeekDates(addDays(baseDate, -7)),
      getWeekDates(baseDate),
      getWeekDates(addDays(baseDate, 7)),
    ],
    [baseDate],
  );

  const datesWithReminders = useMemo(
    () => new Set(allReminders.map(r => r.date)),
    [allReminders],
  );

  const reminders = useMemo(
    () => allReminders.filter(r => r.date === dateKey(selectedDate)),
    [allReminders, selectedDate],
  );

  useEffect(() => {
    isJumping.current = true;
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
    const t = setTimeout(() => (isJumping.current = false), 0);
    return () => clearTimeout(t);
  }, [baseDate]);

  useEffect(() => {
    notifee.requestPermission();
    ensureReminderChannel();
  }, []);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isJumping.current) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page === 0) {
      setBaseDate(prev => addDays(prev, -7));
    } else if (page === 2) {
      setBaseDate(prev => addDays(prev, 7));
    }
  };

  const dateLabel = `${
    MONTH_LABELS[selectedDate.getMonth()]
  } ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  const goToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setBaseDate(now);
  };

  const handleSaveReminder = (data: NewReminderData, editingId?: string) => {
    const time = data.time
      ? data.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;
    const dKey = dateKey(data.date);

    if (editingId) {
      setAllReminders(prev =>
        prev.map(r =>
          r.id === editingId
            ? { ...r, title: data.title, color: data.color, date: dKey, time }
            : r,
        ),
      );
      scheduleReminderNotification({
        id: editingId,
        title: data.title,
        date: dKey,
        time,
      });
    } else {
      const newId = Date.now().toString();
      const newReminder: Reminder = {
        id: newId,
        title: data.title,
        time,
        date: dKey,
        color: data.color,
        done: false,
      };
      setAllReminders(prev => [...prev, newReminder]);
      scheduleReminderNotification({
        id: newId,
        title: data.title,
        date: dKey,
        time,
      });
    }
  };

  const handleDeleteReminder = (id: string) => {
    setAllReminders(prev => prev.filter(r => r.id !== id));
    cancelReminderNotification(id);
  };

  const toggleReminderDone = (id: string) => {
    setAllReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, done: !r.done } : r)),
    );
    const reminder = allReminders.find(r => r.id === id);
    if (reminder && !reminder.done) {
      cancelReminderNotification(id);
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={[styles.main]}>
            {/* Header */}
            <View style={styles.header}>
              <AppText style={[styles.logo, { color: colors.text }]}>
                Daily<AppText style={{ color: primary }}> Planner</AppText>
              </AppText>
              <View style={styles.headerIcons}>
                <Animated.View
                  style={[
                    styles.proBadge,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.primary,
                      transform: [{ scale: proScale }],
                    },
                  ]}
                >
                  {/* <AppText style={[styles.proText, { color: colors.text }]}>
                    {t('PRO')}
                  </AppText> */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Premium' as never)}
                  >
                    <AppText style={[styles.proText, { color: colors.text }]}>
                      PRO
                    </AppText>
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <Image
                    source={require('../assets/icons/heart.png')}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: colors.subText,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekLabelsRow}>
              {DAY_LABELS.map(label => (
                <AppText
                  key={label}
                  style={[styles.dayLabel, { color: colors.subText }]}
                >
                  {label}
                </AppText>
              ))}
            </View>

            <View
              style={{
                height: WEEK_ROW_HEIGHT + 10,
                flexShrink: 0,
                flexGrow: 0,
              }}
            >
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumEnd}
                contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
                style={{ flex: 1 }}
              >
                {weeks.map((weekDates, i) => (
                  <View
                    key={i}
                    style={{
                      width: SCREEN_WIDTH,
                      height: WEEK_ROW_HEIGHT + 10,
                    }}
                  >
                    <WeekRow
                      weekDates={weekDates}
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                      primaryColor={primary}
                      textColor={colors.text}
                      datesWithReminders={datesWithReminders}
                      moodsByDate={moodsByDate}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.todayRow, {}]}>
              <TouchableOpacity
                onPress={goToToday}
                style={[styles.todayPillWrap, { backgroundColor: primary }]}
              >
                <View style={styles.todayPill}>
                  <AppText style={styles.todayPillText}>
                    ‹ {t('settings.Today')}
                  </AppText>
                </View>
              </TouchableOpacity>
              <AppText style={[styles.dateTitle, { color: colors.text }]}>
                {dateLabel}
              </AppText>
              <View style={{ width: 70 }} />
            </View>
          </View>

          <ScrollView
            style={[styles.body, { backgroundColor: colors.background }]}
            contentContainerStyle={
              reminders.length === 0 ? styles.emptyBodyContent : undefined
            }
          >
            {reminders.length === 0 ? (
              <EmptyState colors={colors} />
            ) : (
              reminders.map(r => (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setEditingReminder(r);
                    setModalVisible(true);
                  }}
                  style={[
                    styles.reminderRow,
                    { backgroundColor: (r.color ?? primary) + '30' },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleReminderDone(r.id)}
                    style={[
                      styles.checkbox,
                      r.done && { backgroundColor: r.color ?? primary },
                    ]}
                  />
                  <AppText
                    style={[
                      styles.reminderText,
                      { color: colors.text },
                      r.done && styles.reminderDone,
                    ]}
                  >
                    {r.title}
                  </AppText>
                  {r.time && (
                    <AppText
                      style={[styles.reminderTime, { color: colors.subText }]}
                    >
                      {r.time}
                    </AppText>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => {
              setEditingReminder(null);
              setModalVisible(true);
            }}
            style={[styles.fabWrap, { backgroundColor: primary }]}
          >
            <View style={styles.fab}>
              <Text style={styles.fabText}>+</Text>
            </View>
          </TouchableOpacity>

          <CreateReminderModal
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setEditingReminder(null);
            }}
            onSave={handleSaveReminder}
            onDelete={handleDeleteReminder}
            initialDate={selectedDate}
            editingReminder={
              editingReminder
                ? {
                    id: editingReminder.id,
                    title: editingReminder.title,
                    color: editingReminder.color ?? primary,
                    date: parseDateKeyLocal(editingReminder.date),
                    time: editingReminder.time
                      ? (() => {
                          const t = new Date();
                          const [h, m] = editingReminder
                            .time!.replace(/\s*(AM|PM)/i, '')
                            .split(':')
                            .map(Number);
                          const isPM = /PM/i.test(editingReminder.time!);
                          t.setHours(isPM && h !== 12 ? h + 12 : h, m, 0, 0);
                          return t;
                        })()
                      : undefined,
                  }
                : null
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  main: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    paddingBottom: 15,
  },
  moodDotEmoji: { fontSize: 11, marginTop: 4 },
  logo: { fontSize: 20, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    marginRight: 6,
  },
  proText: { fontSize: 12, fontWeight: '700' },
  iconBtn: { padding: 6 },

  weekLabelsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingHorizontal: 4,
  },
  dayLabel: {
    width: DAY_WIDTH,
    textAlign: 'center',
    fontSize: 13,
  },
  weekDatesRow: {
    flexDirection: 'row',
    marginTop: ROW_MARGIN_TOP,
    paddingHorizontal: 4,
  },
  dateCol: {
    width: DAY_WIDTH,
    alignItems: 'center',
  },
  dateCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  dateText: { fontSize: 16, fontWeight: '600' },

  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  todayPillWrap: { borderRadius: 8, overflow: 'hidden' },
  todayPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayPillText: { color: '#fff', fontWeight: '600' },
  dateTitle: { fontSize: 15, fontWeight: '600' },

  body: { flex: 1, marginTop: 8 },
  emptyBodyContent: { flex: 1, justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#999',
    marginRight: 10,
  },
  reminderText: { flex: 1, fontSize: 15 },
  reminderDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  reminderTime: { fontSize: 12 },

  usageText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },

  fabWrap: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 40, lineHeight: 40, fontWeight: '400' },
});
