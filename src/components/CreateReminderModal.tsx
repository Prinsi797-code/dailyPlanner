// src/components/CreateReminderModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

export interface NewReminderData {
  title: string;
  color: string;
  date: Date;
  time?: Date;
  earlyReminder: string;
  repeat: string;
}

export interface EditingReminder {
  id: string;
  title: string;
  color: string;
  date: Date;
  time?: Date;
  earlyReminder?: string;
  repeat?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: NewReminderData, editingId?: string) => void;
  onDelete?: (id: string) => void;
  initialDate?: Date;
  editingReminder?: EditingReminder | null;
}

const COLORS = [
  '#FADADD',
  '#C7CEEA',
  '#C1D8A0',
  '#E7C6C6',
  '#D8BFD8',
  '#F0D9A0',
];

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

function OptionPickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: any;
}) {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[styles.pickerSheet, { backgroundColor: colors.card }]}
        >
          <AppText style={[styles.pickerTitle, { color: colors.text }]}>
            {title}
          </AppText>
          {options.map(opt => {
            const isSelected = opt === selected;
            return (
              <TouchableOpacity
                key={opt}
                style={styles.pickerRow}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <AppText
                  style={[
                    styles.pickerRowText,
                    { color: colors.text },
                    isSelected && { fontWeight: '700', color: colors.primary },
                  ]}
                >
                  {opt}
                </AppText>
                {isSelected && (
                  <AppText
                    style={[styles.pickerCheck, { color: colors.primary }]}
                  >
                    ✓
                  </AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

export default function CreateReminderModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialDate,
  editingReminder,
}: Props) {
  const { colors, isDark } = useTheme();
  const isEditing = !!editingReminder;

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [date, setDate] = useState(initialDate ?? new Date());
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [earlyReminder, setEarlyReminder] = useState(DEFAULT_EARLY_REMINDER);
  const [repeat, setRepeat] = useState(DEFAULT_REPEAT);
  const [showEarlyReminderPicker, setShowEarlyReminderPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const { t } = useTranslation();

  const REPEAT_OPTIONS = [
    t('settings.Doesnotrepeat'),
    t('settings.Everyday'),
    t('settings.Everyweek'),
    t('settings.Everymonth'),
    t('settings.Everyyear'),
  ];

  const EARLY_REMINDER_OPTIONS = [
    t('settings.Attimeofevent'),
    t('settings.5minutesbefore'),
    t('settings.10minutesbefore'),
    t('settings.15minutesbefore'),
    t('settings.30minutesbefore'),
    t('settings.1hourbefore'),
    t('settings.1daybefore'),
  ];

  const DEFAULT_EARLY_REMINDER = EARLY_REMINDER_OPTIONS[0];
  const DEFAULT_REPEAT = REPEAT_OPTIONS[0];

  useEffect(() => {
    if (!visible) return;
    if (editingReminder) {
      setTitle(editingReminder.title);
      setColor(editingReminder.color);
      setDate(editingReminder.date);
      if (editingReminder.time) {
        setTimeEnabled(true);
        setTime(editingReminder.time);
      } else {
        setTimeEnabled(false);
        setTime(new Date());
      }
      setEarlyReminder(editingReminder.earlyReminder ?? DEFAULT_EARLY_REMINDER);
      setRepeat(editingReminder.repeat ?? DEFAULT_REPEAT);
    } else {
      setTitle('');
      setColor(COLORS[0]);
      setDate(initialDate ?? new Date());
      setTimeEnabled(false);
      setTime(new Date());
      setEarlyReminder(DEFAULT_EARLY_REMINDER);
      setRepeat(DEFAULT_REPEAT);
    }
  }, [visible, editingReminder, initialDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        title: title.trim(),
        color,
        date,
        time: timeEnabled ? time : undefined,
        earlyReminder,
        repeat,
      },
      editingReminder?.id,
    );
    onClose();
  };

  const handleDelete = () => {
    if (editingReminder && onDelete) {
      onDelete(editingReminder.id);
      onClose();
    }
  };

  const formatDate = (d: Date) =>
    `${d.getDate()}-${d.toLocaleString('default', {
      month: 'long',
    })}-${d.getFullYear()}`;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.headerRow}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>
            {isEditing
              ? t('settings.EditReminder')
              : t('settings.CreateReminder')}
          </AppText>
          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: colors.text }]}
            onPress={onClose}
          >
            <AppText style={{ fontSize: 16, color: colors.text }}>✕</AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          <AppText style={[styles.label, { color: colors.text }]}>
            {t('settings.Title')}
          </AppText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter Title"
            placeholderTextColor="#999"
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.backgroundColor },
            ]}
          />
          <AppText style={[styles.label, { color: colors.text }]}>
            {t('settings.Color')}
          </AppText>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  color === c && [
                    styles.colorSwatchSelected,
                    { borderColor: colors.primary },
                  ],
                ]}
              />
            ))}
          </View>

          <AppText style={[styles.label, { color: colors.text, }]}>
            {t('settings.SetReminders')}
          </AppText>
          <View style={[styles.reminderCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.reminderRow}
              onPress={() => setShowDatePicker(v => !v)}
            >
              <Image
                source={require('../assets/icons/calendar.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <AppText style={[styles.rowLabel, { color: colors.text }]}>
                  {t('settings.Date')}
                </AppText>
              </View>
              <AppText style={styles.rowValue}>{formatDate(date)}</AppText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                accentColor={colors.primary}
                themeVariant={isDark ? 'dark' : 'light'}  
                onChange={(_, selected) => {
                  if (Platform.OS !== 'ios') setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <View style={styles.reminderRow}>
              <Image
                source={require('../assets/icons/alarm.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <AppText style={[styles.rowLabel, { color: colors.text }]}>
                  {t('settings.Time')}
                </AppText>
                {timeEnabled && (
                  <AppText style={styles.rowSub}>{formatTime(time)}</AppText>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTimeEnabled(v => !v);
                  if (!timeEnabled) setShowTimePicker(true);
                }}
                style={[
                  styles.toggle,
                  timeEnabled && { backgroundColor: colors.primary },
                ]}
              >
                <View
                  style={[styles.toggleDot, timeEnabled && styles.toggleDotOn]}
                />
              </TouchableOpacity>
            </View>

            {showTimePicker && timeEnabled && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                accentColor={colors.primary}
                themeVariant={isDark ? 'dark' : 'light'}  
                onChange={(_, selected) => {
                  if (Platform.OS !== 'ios') setShowTimePicker(false);
                  if (selected) setTime(selected);
                }}
              />
            )}

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.reminderRow}
              onPress={() => setShowEarlyReminderPicker(true)}
            >
              <Image
                source={require('../assets/icons/bell.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
              <AppText
                style={[styles.rowLabel, { color: colors.text, flex: 1 }]}
              >
                {t('settings.EarlyReminder')}
              </AppText>
              <AppText style={styles.rowValue}>{earlyReminder}</AppText>
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.reminderRow}
              onPress={() => setShowRepeatPicker(true)}
            >
              <Image
                source={require('../assets/icons/repeat.png')}
                style={styles.iconImage}
                resizeMode="contain"
              />
              <AppText
                style={[styles.rowLabel, { color: colors.text, flex: 1 }]}
              >
                {t('settings.Repeat')}
              </AppText>
              <AppText style={styles.rowValue}>{repeat}</AppText>
            </TouchableOpacity>
          </View>

          {isEditing && onDelete && (
            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: colors.primary }]}
              onPress={handleDelete}
            >
              <AppText
                style={[styles.deleteBtnText, { color: colors.primary }]}
              >
                {t('settings.DeleteReminder')}
              </AppText>
            </TouchableOpacity>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <AppText style={styles.saveBtnText}>
            {isEditing ? t('settings.Update') : 'settings.Save'}
          </AppText>
        </TouchableOpacity>

        <OptionPickerModal
          visible={showEarlyReminderPicker}
          title={t('settings.Reminder')}
          options={EARLY_REMINDER_OPTIONS}
          selected={earlyReminder}
          onSelect={setEarlyReminder}
          onClose={() => setShowEarlyReminderPicker(false)}
          colors={colors}
        />

        <OptionPickerModal
          visible={showRepeatPicker}
          title={t('settings.Repeat')}
          options={REPEAT_OPTIONS}
          selected={repeat}
          onSelect={setRepeat}
          onClose={() => setShowRepeatPicker(false)}
          colors={colors}
        />
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
    height: SHEET_MAX_HEIGHT,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
  },
  iconImage: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  scrollArea: {
    flex: 1,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 8 },
  colorSwatchSelected: { borderWidth: 2 },
  reminderCard: { borderRadius: 14, marginTop: 8 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  rowIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, color: '#888' },
  rowValue: { fontSize: 14, color: '#333' },
  divider: { height: 1, marginLeft: 52 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ddd',
    padding: 2,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleDotOn: { alignSelf: 'flex-end' },
  deleteBtn: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtnText: { fontWeight: '700', fontSize: 15 },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pickerSheet: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerRowText: { fontSize: 15 },
  pickerCheck: { fontSize: 16, fontWeight: '700' },
});
