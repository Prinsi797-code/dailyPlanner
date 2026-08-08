import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Template } from "../navigation/types";
import { useTheme } from "../theme/ThemeContext";

import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from "../templates/templateConfigs";
import SectionRenderer from "../templates/SectionRenderer";
import { adaptDesignForTheme } from "../utils/themeColorAdapter";

type Nav = StackNavigationProp<RootStackParamList>;

type TabKey =
  | "daily"
  | "weekly"
  | "monthly"
  | "kids"
  | "pets"
  | "lifestyle"
  | "student";

const TABS: { key: TabKey; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "kids", label: "Kids & Fun" },
  { key: "pets", label: "Pets" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "student", label: "Student" },
];

type TemplateItem = Template & {
  bg: string;
  emoji: string;
  pages: string;
};

const TEMPLATES: Record<TabKey, TemplateItem[]> = {
  daily: [
    {
      id: 1,
      name: "Daily Planner",
      type: "daily",
      bg: "#FFF1EC",
      emoji: "🌤️",
      pages: "1 page",
    },
    {
      id: 2,
      name: "Daily Task Reminder",
      type: "daily",
      bg: "#FDEEF3",
      emoji: "✨",
      pages: "1 page",
    },
    {
      id: 3,
      name: "Block It Out Planner",
      type: "daily",
      bg: "#EFF5F0",
      emoji: "🌿",
      pages: "1 page",
    },
    {
      id: 28,
      name: "Shift Planner 🔄",
      type: "daily",
      bg: "#E0F5F3",
      emoji: "🔄",
      pages: "1 page",
    },
    {
      id: 29,
      name: "My Diary 📔",
      type: "daily",
      bg: "#F5EFE6",
      emoji: "📔",
      pages: "1 page",
    },
    {
      id: 31,
      name: "Morning Check-In ☀️",
      type: "daily",
      bg: "#FFF9E0",
      emoji: "☀️",
      pages: "1 page",
    },
    {
      id: 32,
      name: "Reselling Planner 🛍️",
      type: "daily",
      bg: "#F5F5F5",
      emoji: "🛍️",
      pages: "1 page",
    },
    {
      id: 33,
      name: "Cashier Planner 🧾",
      type: "daily",
      bg: "#EAF1F8",
      emoji: "🧾",
      pages: "1 page",
    },
    {
      id: 34,
      name: "Daily/Shift Planner 🕒",
      type: "daily",
      bg: "#EDEFF7",
      emoji: "🕒",
      pages: "1 page",
    },
    {
      id: 35,
      name: "Daily Activity Report 📋",
      type: "daily",
      bg: "#F0EBF8",
      emoji: "📋",
      pages: "1 page",
    },
  ],
  weekly: [
    {
      id: 5,
      name: "Weekly Planner Classic",
      type: "weekly",
      bg: "#EAF3FB",
      emoji: "🗒️",
      pages: "2 pages",
    },
    {
      id: 6,
      name: "Weekly Planner Colorful",
      type: "weekly",
      bg: "#FDEEF3",
      emoji: "🎨",
      pages: "2 pages",
    },
    {
      id: 37,
      name: "DBT Diary Card 🗂️",
      type: "daily",
      bg: "#EAF3EA",
      emoji: "🗂️",
      pages: "1 page",
    },
    {
      id: 38,
      name: "Spelling Bee Planner 🐝",
      type: "weekly",
      bg: "#FBF6DC",
      emoji: "🐝",
      pages: "1 page",
    },
  ],
  monthly: [
    {
      id: 8,
      name: "2026 Productivity Planner",
      type: "monthly",
      bg: "#EDEBFA",
      emoji: "📅",
      pages: "12 pages",
    },
    {
      id: 10,
      name: "Floral Monthly Planner",
      type: "monthly",
      bg: "#FBEFF3",
      emoji: "🌸",
      pages: "1 page",
    },
    {
      id: 11,
      name: "Schedule & Calendar Planner",
      type: "monthly",
      bg: "#FDEEF3",
      emoji: "📅",
      pages: "1 page",
    },
    {
      id: 12,
      name: "Tropical Flamingo Calendar",
      type: "monthly",
      bg: "#EAF6F0",
      emoji: "🦩",
      pages: "1 page",
    },
    {
      id: 13,
      name: "Pastel Floral Calendar",
      type: "monthly",
      bg: "#F0F6FB",
      emoji: "🦋",
      pages: "1 page",
    },
    {
      id: 39,
      name: "Sleep Tracker 😴",
      type: "monthly",
      bg: "#F5F5F5",
      emoji: "😴",
      pages: "1 page",
    },
    {
      id: 40,
      name: "Rent Payment Ledger 🧾",
      type: "monthly",
      bg: "#EDF3FA",
      emoji: "🧾",
      pages: "1 page",
    },
    {
      id: 41,
      name: "Egg Count Planner 🥚",
      type: "monthly",
      bg: "#EAF7F4",
      emoji: "🥚",
      pages: "1 page",
    },
  ],
  kids: [
    {
      id: 20,
      name: "Kids Daily Planner 🧸",
      type: "daily",
      bg: "#FFF0F5",
      emoji: "🧸",
      pages: "1 page",
    },
    {
      id: 21,
      name: "Picnic Planner 🧺",
      type: "activity",
      bg: "#F5FAF0",
      emoji: "🧺",
      pages: "1 page",
    },
    {
      id: 22,
      name: "Travel Planner ✈️",
      type: "activity",
      bg: "#EEF4FB",
      emoji: "✈️",
      pages: "1 page",
    },
    {
      id: 24,
      name: "Home Planner 🏠",
      type: "daily",
      bg: "#F0EEF8",
      emoji: "🏠",
      pages: "1 page",
    },
  ],
  pets: [
    {
      id: 25,
      name: "Aquarium Log 🐟",
      type: "daily",
      bg: "#E8F7FC",
      emoji: "🐟",
      pages: "1 page",
    },
    {
      id: 26,
      name: "Cat Parent 🐱",
      type: "daily",
      bg: "#F5EEFF",
      emoji: "🐱",
      pages: "1 page",
    },
    {
      id: 27,
      name: "Dog Parent 🐶",
      type: "daily",
      bg: "#FEF6EC",
      emoji: "🐶",
      pages: "1 page",
    },
  ],
  lifestyle: [
    {
      id: 23,
      name: "Love & Us 💕",
      type: "daily",
      bg: "#FFF0F5",
      emoji: "💕",
      pages: "1 page",
    },
    {
      id: 29,
      name: "My Diary 📔",
      type: "daily",
      bg: "#F5EFE6",
      emoji: "📔",
      pages: "1 page",
    },
    {
      id: 24,
      name: "Home Planner 🏠",
      type: "daily",
      bg: "#F0EEF8",
      emoji: "🏠",
      pages: "1 page",
    },
    {
      id: 21,
      name: "Picnic Planner 🧺",
      type: "daily",
      bg: "#F5FAF0",
      emoji: "🧺",
      pages: "1 page",
    },
    {
      id: 44,
      name: "Valentine's Day Planner 💌",
      type: "daily",
      bg: "#FFF0F3",
      emoji: "💌",
      pages: "1 page",
    },
    {
      id: 45,
      name: "Weekly Valentine Planner 💘",
      type: "weekly",
      bg: "#FFF0F3",
      emoji: "💘",
      pages: "1 page",
    },
    {
      id: 22,
      name: "Travel Planner ✈️",
      type: "daily",
      bg: "#EEF4FB",
      emoji: "✈️",
      pages: "1 page",
    },
    {
      id: 46,
      name: "Valentine's Gift Idea Planner 💝",
      type: "daily",
      bg: "#FDEEF3",
      emoji: "💝",
      pages: "1 page",
    },
  ],
  student: [
    {
      id: 30,
      name: "Student Planner 📚",
      type: "daily",
      bg: "#FFF4E8",
      emoji: "📚",
      pages: "1 page",
    },
    {
      id: 1,
      name: "Daily Planner",
      type: "daily",
      bg: "#FFF1EC",
      emoji: "🌤️",
      pages: "1 page",
    },
    {
      id: 5,
      name: "Weekly Planner Classic",
      type: "weekly",
      bg: "#EAF3FB",
      emoji: "🗒️",
      pages: "2 pages",
    },
    {
      id: 42,
      name: "School Schedule Planner 🎒",
      type: "weekly",
      bg: "#8d76aa",
      emoji: "🎒",
      pages: "1 page",
    },
    {
      id: 43,
      name: "Group Study Planner 📖",
      type: "daily",
      bg: "#FBE4E9",
      emoji: "📖",
      pages: "1 page",
    },
  ],
};

const PREVIEW_BOX_HEIGHT = 140;
const PREVIEW_SHEET_WIDTH = 380;

function MiniPreview({ item }: { item: TemplateItem }) {
  const { isDark } = useTheme();
  const rawDesign = TEMPLATE_DESIGNS[item.id] || DEFAULT_DESIGN;
  const design = adaptDesignForTheme(rawDesign, isDark);

  const isScript = design.headerStyle === "script";
  const sheetBg = design.sheetBg || "#FFFFFF";

  return (
    <View style={[styles.previewArea, { backgroundColor: sheetBg }]}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PREVIEW_SHEET_WIDTH,
          transformOrigin: "top left",
          transform: [{ scale: 0.42 }],
        }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <Text
            style={{
              color: design.headerColor,
              fontSize: isScript ? 26 : 20,
              fontWeight: isScript ? "500" : "800",
              fontStyle: isScript ? "italic" : "normal",
            }}
          >
            {item.name}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          {design.sections.slice(0, 3).map((section, i) => (
            <SectionRenderer
              key={i}
              section={section}
              accentColor={design.accentColor}
              values={{}}
              onChange={() => {}}
              fieldKey={`preview_${i}`}
              themeStyle={design.themeStyle}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function TemplatesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("daily");
  const data = TEMPLATES[activeTab];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, marginTop: 50 },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              style={styles.tabPillWrapper}
            >
              <View
                style={[
                  styles.tabPillInner,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.tabLabel,
                    { color: active ? "#fff" : colors.subText },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Templates Grid */}
      <FlatList
        data={data}
        key={activeTab}
        keyExtractor={(item) => `${activeTab}_${item.id}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("TemplatePreview", { template: item })
            }
          >
            <MiniPreview item={item} colors={colors} />
            <View style={styles.cardFooter}>
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={[styles.cardPages, { color: colors.subText }]}>
                {item.pages}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsScroll: { flexGrow: 0, paddingTop: 16, paddingBottom: 12 },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
  },
  tabPill: {
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    textAlignVertical: "center",
  },
  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  tabPillWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    flexShrink: 0,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  previewArea: {
    height: 140,
    padding: 12,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  cornerEmoji: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: 14,
  },
  previewHeader: { marginTop: 4 },
  previewTitleLine: {
    width: "55%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  previewBody: { gap: 6 },
  previewLineShort: {
    width: "40%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  previewLineLong: {
    width: "85%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  previewLineMed: {
    width: "65%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  tabPillInner: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },

  previewRow: { flexDirection: "row", gap: 5, marginTop: 4 },
  previewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: "rgba(0,0,0,0.25)",
  },
  heartEmoji: {
    position: "absolute",
    bottom: 8,
    right: 10,
    fontSize: 12,
  },
  gradientFill: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: { padding: 12 },
  cardTitle: { fontSize: 13.5, fontWeight: "700", marginBottom: 2 },
  cardPages: { fontSize: 11 },
});