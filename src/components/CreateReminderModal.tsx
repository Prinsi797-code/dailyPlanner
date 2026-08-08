// src/components/CreateReminderModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../theme/ThemeContext";

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
  "#FADADD",
  "#C7CEEA",
  "#C1D8A0",
  "#E7C6C6",
  "#D8BFD8",
  "#F0D9A0",
];

// Options for the "Early Reminder" picker
const EARLY_REMINDER_OPTIONS = [
  "At time of event",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];

// Options for the "Repeat" picker
const REPEAT_OPTIONS = [
  "Does not repeat",
  "Every day",
  "Every week",
  "Every month",
  "Every year",
];

const DEFAULT_EARLY_REMINDER = EARLY_REMINDER_OPTIONS[0];
const DEFAULT_REPEAT = REPEAT_OPTIONS[0];

/**
 * SheetModal — dark backdrop sirf FADE hota hai (poori screen ek saath),
 * sirf white card neeche se SLIDE hota hai. Isse koi "curtain/wipe"
 * effect nahi dikhta jo pehle black layer bottom->top / top->bottom
 * travel karte hue dikh raha tha.
 */
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
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {/* Backdrop: pure screen ek saath fade hoti hai, koi wipe/travel nahi */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.4)", opacity: fade },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Sheet card: sirf ye neeche se slide hota hai */}
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
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[styles.pickerSheet, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.pickerTitle, { color: colors.text }]}>
            {title}
          </Text>
          {options.map((opt) => {
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
                <Text
                  style={[
                    styles.pickerRowText,
                    { color: colors.text },
                    isSelected && { fontWeight: "700", color: colors.primary },
                  ]}
                >
                  {opt}
                </Text>
                {isSelected && (
                  <Text style={[styles.pickerCheck, { color: colors.primary }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
  const { colors } = useTheme();
  const isEditing = !!editingReminder;

  const [title, setTitle] = useState("");
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

  // Populate form when opening in edit mode, or reset for create mode
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
      setTitle("");
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
    `${d.getDate()}-${d.toLocaleString("default", { month: "long" })}-${d.getFullYear()}`;

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <SheetModal visible={visible} onClose={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEditing ? "Edit Reminder" : "Create Reminder"}
            </Text>
            <TouchableOpacity style={[styles.closeBtn, {borderColor: colors.text}]} onPress={onClose}>
              <Text style={{ fontSize: 16, color: colors.text }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter Title"
              placeholderTextColor="#999"
              style={[styles.input, { color: colors.text, backgroundColor: colors. backgroundColor }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
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

            <Text style={[styles.label, { color: colors.text }]}>
              Set Reminders
            </Text>
            <View style={[styles.reminderCard, {backgroundColor: colors.card}]}>
              <TouchableOpacity
                style={styles.reminderRow}
                onPress={() => setShowDatePicker((v) => !v)}
              >
                <Image
                  source={require("../assets/icons/calendar.png")}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    Date
                  </Text>
                </View>
                <Text style={styles.rowValue}>{formatDate(date)}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  accentColor={colors.primary}
                  themeVariant={
                    colors.background === "#121212" ||
                    colors.background === "#1E1E1E"
                      ? "dark"
                      : "light"
                  }
                  onChange={(_, selected) => {
                    if (Platform.OS !== "ios") setShowDatePicker(false);
                    if (selected) setDate(selected);
                  }}
                />
              )}

              <View style={[styles.divider, {backgroundColor: colors.border}]} />

              <View style={styles.reminderRow}>
                <Image source={require("../assets/icons/alarm.png")} style={styles.iconImage} resizeMode="contain" />
                {/* <Text style={styles.rowIcon}>🕐</Text> */}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    Time
                  </Text>
                  {timeEnabled && (
                    <Text style={styles.rowSub}>{formatTime(time)}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setTimeEnabled((v) => !v);
                    if (!timeEnabled) setShowTimePicker(true);
                  }}
                  style={[
                    styles.toggle,
                    timeEnabled && { backgroundColor: colors.primary },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleDot,
                      timeEnabled && styles.toggleDotOn,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {showTimePicker && timeEnabled && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  accentColor={colors.primary}
                  themeVariant={
                    colors.background === "#121212" ||
                    colors.background === "#1E1E1E"
                      ? "dark"
                      : "light"
                  }
                  onChange={(_, selected) => {
                    if (Platform.OS !== "ios") setShowTimePicker(false);
                    if (selected) setTime(selected);
                  }}
                />
              )}

              <View style={[styles.divider, {backgroundColor: colors.border}]} />

              <TouchableOpacity
                style={styles.reminderRow}
                onPress={() => setShowEarlyReminderPicker(true)}
              >
                <Image
                  source={require("../assets/icons/bell.png")}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
                {/* <Text style={styles.rowIcon}>🔔</Text> */}
                <Text
                  style={[styles.rowLabel, { color: colors.text, flex: 1 }]}
                >
                  Early Reminder
                </Text>
                <Text style={styles.rowValue}>{earlyReminder}</Text>
              </TouchableOpacity>

              <View style={[styles.divider, {backgroundColor: colors.border}]} />

              <TouchableOpacity
                style={styles.reminderRow}
                onPress={() => setShowRepeatPicker(true)}
              >
                <Image
                  source={require("../assets/icons/repeat.png")}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
                {/* <Text style={styles.rowIcon}>🔁</Text> */}
                <Text
                  style={[styles.rowLabel, { color: colors.text, flex: 1 }]}
                >
                  Repeat
                </Text>
                <Text style={styles.rowValue}>{repeat}</Text>
              </TouchableOpacity>
            </View>

            {isEditing && onDelete && (
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: colors.primary }]}
                onPress={handleDelete}
              >
                <Text style={[styles.deleteBtnText, { color: colors.primary }]}>
                  Delete Reminder
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>
              {isEditing ? "Update →" : "Save →"}
            </Text>
          </TouchableOpacity>
        </View>
      </SheetModal>

      {/* Early Reminder picker */}
      <OptionPickerModal
        visible={showEarlyReminderPicker}
        title="Early Reminder"
        options={EARLY_REMINDER_OPTIONS}
        selected={earlyReminder}
        onSelect={setEarlyReminder}
        onClose={() => setShowEarlyReminderPicker(false)}
        colors={colors}
      />

      {/* Repeat picker */}
      <OptionPickerModal
        visible={showRepeatPicker}
        title="Repeat"
        options={REPEAT_OPTIONS}
        selected={repeat}
        onSelect={setRepeat}
        onClose={() => setShowRepeatPicker(false)}
        colors={colors}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  closeBtn: {
    borderWidth: 1,
    // borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
  },
  iconImage: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  input: {
    // backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  colorRow: { flexDirection: "row", gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 8 },
  colorSwatchSelected: { borderWidth: 2 },
  reminderCard: { borderRadius: 14, marginTop: 8 },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  rowIcon: { fontSize: 18, width: 28, textAlign: "center" },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowSub: { fontSize: 12, color: "#888" },
  rowValue: { fontSize: 14, color: "#333" },
  divider: { height: 1, marginLeft: 52 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ddd",
    padding: 2,
    justifyContent: "center",
  },
  // toggleOn: { backgroundColor: "#E4572E" },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  toggleDotOn: { alignSelf: "flex-end" },
  deleteBtn: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtnText: { fontWeight: "700", fontSize: 15 },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Option picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  pickerSheet: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerRowText: { fontSize: 15 },
  pickerCheck: { fontSize: 16, fontWeight: "700" },
});