import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ThemeMode } from '../theme/ThemeContext';

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: '☀️' },
  { mode: 'dark', label: 'Dark', icon: '🌙' },
  { mode: 'system', label: 'System', icon: '📱' },
];

export default function SettingsScreen() {
  const { mode, colors, setMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Appearance</Text>
      <Text style={[styles.subHeading, { color: colors.subText }]}>
        Choose how PlanWiz looks on your device
      </Text>

      <View style={styles.optionsRow}>
        {OPTIONS.map((opt) => {
          const selected = mode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              onPress={() => setMode(opt.mode)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <Text style={styles.icon}>{opt.icon}</Text>
              <Text
                style={[
                  styles.label,
                  { color: selected ? colors.primary : colors.text },
                ]}
              >
                {opt.label}
              </Text>
              {selected && (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  subHeading: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
});