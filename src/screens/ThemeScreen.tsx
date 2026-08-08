import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme, ThemeMode } from "../theme/ThemeContext";
import { ACCENT_COLORS } from "../theme/colors";
import { RootStackParamList } from "../navigation/types";
import Ionicons from "react-native-vector-icons/Ionicons";

type Nav = StackNavigationProp<RootStackParamList>;

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "light", label: "Light", icon: "☀️" },
  { mode: "dark", label: "Dark", icon: "🌙" },
  { mode: "system", label: "System", icon: "📱" },
];

export default function ThemeScreen() {
  const navigation = useNavigation<Nav>();
  const { mode, colors, setMode, accentColor, setAccentColor } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text
          style={[styles.topBarTitle, { color: colors.text }]}
          numberOfLines={1}
        >Theme
        </Text>
      </View>

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
                <View
                  style={[styles.dot, { backgroundColor: colors.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text
        style={[styles.heading, styles.accentHeading, { color: colors.text }]}
      >
        Accent Color
      </Text>
      <Text style={[styles.subHeading, { color: colors.subText }]}>
        Pick a color that fits your style
      </Text>

      <View style={styles.swatchRow}>
        {ACCENT_COLORS.map((color, index) => {
          const selected = accentColor === color;
          return (
            <TouchableOpacity
              key={`${color}-${index}`}
              onPress={() => setAccentColor(color)}
              style={[styles.swatchOuter, selected && { borderColor: color }]}
            >
              <View style={[styles.swatch, { backgroundColor: color }]}>
                {selected && <View style={styles.swatchCheck} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 1,
  },
  topBarTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  heading: { fontSize: 22, fontWeight: "700", marginTop: 20 },
  accentHeading: { marginTop: 28 },
  subHeading: { fontSize: 13, marginTop: 4, marginBottom: 24 },
  optionsRow: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 26, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },

  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  swatchOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
});
