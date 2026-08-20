import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getMonthMatrix, MONTH_NAMES, DAYS_MON_START, DAYS_SUN_START } from './calendarUtils';
import AppText from '../components/AppText';

type Props = {
  startDay: 'mon' | 'sun';
  decoration: 'floral' | 'tropical' | 'minimal' | 'flamingo';
  accentColor: string;
  year: number;
  month: number; // 0-indexed
  values: Record<string, string>;
  onChange: (dayKey: string, text: string) => void;
};

const DECOR_EMOJI: Record<string, { corner: string[]; border: string }> = {
  floral: { corner: ['🌸', '🌿', '💐', '🌷'], border: '#FBEFF3' },
  tropical: { corner: ['🦩', '🌴', '🌺', '🍃'], border: '#EAF6F0' },
  minimal: { corner: ['☀️', '✏️'], border: '#F5F5F5' },
  flamingo: { corner: ['🌸', '🦋', '🌷', '🍃'], border: '#F0F6FB' },
};

export default function MonthCalendarBlock({
  startDay,
  decoration,
  accentColor,
  year,
  month,
  values,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const matrix = getMonthMatrix(year, month, startDay);
  const dayLabels = startDay === 'mon' ? DAYS_MON_START : DAYS_SUN_START;
  const decor = DECOR_EMOJI[decoration];

  return (
    <View style={[styles.wrapper, { backgroundColor: decor.border, borderColor: accentColor }]}>
      {/* Decorative top corners */}
      <View style={styles.decorRow}>
        <AppText style={styles.decorEmoji}>{decor.corner[0]}</AppText>
        <AppText style={[styles.monthTitle, { color: accentColor }]}>
          {MONTH_NAMES[month].toUpperCase()} {year}
        </AppText>
        <AppText style={styles.decorEmoji}>{decor.corner[1] || decor.corner[0]}</AppText>
      </View>

      {/* Day labels row */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((d) => (
          <AppText key={d} style={[styles.dayLabel, { color: colors.subText }]}>
            {d.slice(0, 3)}
          </AppText>
        ))}
      </View>

      {/* Calendar grid */}
      {matrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => (
            <View key={di} style={[styles.dayCell, { borderColor: colors.border }]}>
              {day !== null && (
                <>
                  <AppText style={[styles.dayNumber, { color: colors.text }]}>{day}</AppText>
                  <TextInput
                    style={[styles.dayNoteInput, { color: colors.text }]}
                    value={values[`${month}_${day}`] || ''}
                    onChangeText={(t) => onChange(`${month}_${day}`, t)}
                    multiline
                    placeholder=""
                  />
                </>
              )}
            </View>
          ))}
        </View>
      ))}

      {/* Decorative bottom corners */}
      <View style={styles.decorRow}>
        <AppText style={styles.decorEmoji}>{decor.corner[2] || decor.corner[0]}</AppText>
        <View style={{ flex: 1 }} />
        <AppText style={styles.decorEmoji}>{decor.corner[3] || decor.corner[1] || decor.corner[0]}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
  },
  decorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  decorEmoji: { fontSize: 18 },
  monthTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 1 },

  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayLabel: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },

  weekRow: { flexDirection: 'row' },
  dayCell: {
    flex: 1,
    minHeight: 50,
    borderWidth: 0.5,
    padding: 3,
  },
  dayNumber: { fontSize: 10, fontWeight: '600' },
  dayNoteInput: {
    flex: 1,
    fontSize: 8,
    padding: 0,
    textAlignVertical: 'top',
  },
});