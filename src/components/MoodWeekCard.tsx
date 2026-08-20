// src/components/MoodWeekCard.tsx
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { getAllMoods } from '../storage/moodStorage';
import { MOODS } from '../constants/moods';
import MoodSheetModal from './MoodSheetModal';

type Nav = StackNavigationProp<RootStackParamList>;

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function getCurrentWeekMonToSun(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function MoodWeekCard() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({});
  const [moodModalDate, setMoodModalDate] = useState<Date | null>(null);

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

  const weekDates = getCurrentWeekMonToSun();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <AppText style={[styles.title, { color: colors.text }]}>
          {t('settings.Moods')}
        </AppText>
        <TouchableOpacity onPress={() => navigation.navigate('MoodCalendar')}>
          <AppText style={[styles.viewAllText, { color: colors.subText }]}>
            {t('settings.ViewAll')}
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {weekDates.map((d, i) => {
          const key = dateKey(d);
          const moodId = moodsByDate[key];
          const mood = moodId ? MOODS.find(m => m.id === moodId) : null;
          return (
            <TouchableOpacity
              key={key}
              style={styles.col}
              activeOpacity={0.7}
              onPress={() => setMoodModalDate(d)}
            >
              <AppText style={[styles.dayLetter, { color: colors.subText }]}>
                {DAY_LETTERS[i]}
              </AppText>
              {mood ? (
                <View
                  style={[
                    styles.circleFilled,
                    { backgroundColor: mood.color},
                  ]}
                >
                  {mood.image ? (
                    <Image
                      source={mood.image}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <AppText style={styles.circleEmoji}>{mood.emoji}</AppText>
                  )}
                </View>
              ) : (
                <View style={[styles.circleEmpty, { borderColor: colors.border }]}>
                  <AppText style={[styles.circleDate, { color: colors.text }]}>
                    {d.getDate()}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <MoodSheetModal
        visible={!!moodModalDate}
        date={moodModalDate}
        onClose={() => setMoodModalDate(null)}
        onSaved={() => loadMoods()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '800' },
  viewAllText: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { alignItems: 'center', width: 40 },
  dayLetter: { fontSize: 12, marginBottom: 8 },
  circleFilled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleEmoji: { fontSize: 20 },
  circleEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  circleDate: { fontSize: 14, fontWeight: '600' },
});