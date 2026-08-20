// src/components/MoodSheetModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MOODS } from '../constants/moods';
import { getMoodForDate, saveMoodForDate } from '../storage/moodStorage';
import AppText from './AppText';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

interface Props {
  visible: boolean;
  date: Date | null;
  dateLabel?: string;
  onClose: () => void;
  onSaved?: (moodId: string) => void;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

// 👇 same slide-up + fade pattern used by CreateReminderModal
function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(400)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      fade.setValue(0);
      slide.setValue(400);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 400,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.4)', opacity: fade },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: slide }] }}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function MoodSheetModal({
  visible,
  date,
  dateLabel,
  onClose,
  onSaved,
}: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !date) return;
    getMoodForDate(dateKey(date)).then(entry => setSelected(entry?.moodId ?? null));
  }, [visible, date]);

  if (!date) return null;

  const label =
    dateLabel ??
    date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });

  const handleContinue = async () => {
    if (!selected) return;
    await saveMoodForDate(dateKey(date), selected);
    onSaved?.(selected);
    onClose();
  };

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, maxHeight: SHEET_MAX_HEIGHT },
        ]}
      >
        <View style={styles.headerRow}>
          <AppText style={[styles.headerDate, { color: colors.text }]}>
            {label.toUpperCase()}
          </AppText>
          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <AppText style={{ fontSize: 16, color: colors.text }}>✕</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={[styles.question, { color: colors.text }]}>
          How are you feeling today?
        </AppText>

        <View style={styles.grid}>
          {MOODS.map(mood => {
            const isSelected = selected === mood.id;
            return (
              <TouchableOpacity
                key={mood.id}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => setSelected(mood.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.circle, { backgroundColor: mood.color }]}>
                  {mood.image ? (
                    <Image
                      source={mood.image}
                      style={{ width: 34, height: 34 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <AppText style={styles.circleEmoji}>{mood.emoji}</AppText>
                  )}
                </View>
                <AppText style={[styles.cellLabel, { color: colors.text }]}>
                  {mood.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: colors.primary },
            !selected && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <AppText style={styles.continueText}>CONTINUE</AppText>
        </TouchableOpacity>
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerDate: { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  closeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
  },

  question: {
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 6,
  },
  cellSelected: {
    borderColor: '#FFD60A',
  },
  circle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleEmoji: { fontSize: 30 },
  cellLabel: { fontSize: 14 },

  continueBtn: {
    marginTop: 10,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});