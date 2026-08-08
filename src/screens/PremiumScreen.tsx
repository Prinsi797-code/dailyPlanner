// src/screens/PremiumScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import LinearGradient from "react-native-linear-gradient";

type Nav = StackNavigationProp<RootStackParamList>;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Converts a theme color (hex like "#1c1c1e" / "#fff", or an existing
// rgb()/rgba() string) into an rgba() string with the given alpha.
function withAlpha(color: string, alpha: number): string {
  if (!color) return `rgba(0,0,0,${alpha})`;

  if (color.startsWith("rgb")) {
    const nums = color.match(/[\d.]+/g) ?? [];
    const [r = "0", g = "0", b = "0"] = nums;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type PlanId = "weekly" | "monthly" | "yearly";

interface Plan {
  id: PlanId;
  title: string;
  price: string;
  subtext: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "yearly",
    title: "Yearly",
    price: "₹999 / yr",
    subtext: "≈ ₹83 / month",
    badge: "BEST VALUE",
  },
  {
    id: "monthly",
    title: "Monthly",
    price: "₹149 / mo",
    subtext: "Billed every month",
  },
  {
    id: "weekly",
    title: "Weekly",
    price: "₹49 / wk",
    subtext: "Billed every week",
  },
];

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🔔",
    title: "Unlimited Reminders",
    desc: "No more limits on daily tasks",
  },
  { icon: "🎨", title: "Custom Themes", desc: "Personalize every reminder" },
  {
    icon: "☁️",
    title: "Cloud Backup & Sync",
    desc: "Never lose your data again",
  },
  { icon: "🚫", title: "No Ads", desc: "Distraction-free experience" },
  {
    icon: "⏰",
    title: "Smart Notifications",
    desc: "Snooze, repeat & priority alerts",
  },
];

export default function PremiumScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<Nav>();
  const primary = (colors as any).primary ?? (colors as any).accent;

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly");

  const handleSubscribe = () => {
    console.log("Subscribe pressed for plan:", selectedPlan);
  };

  const handleRestore = () => {
    console.log("Restore purchases pressed");
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.closeText, { color: colors.subText }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hero - fixed, NOT inside any ScrollView */}
        <View style={styles.heroWrap}>
          <ImageBackground
            source={require("../assets/img/premium.png")}
            style={styles.hero}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            {/* Strong gradient fade at the bottom so text stays readable */}
            <LinearGradient
              colors={[
                withAlpha(colors.card, 0),
                withAlpha(colors.card, 0.5),
                withAlpha(colors.card, 0.92),
              ]}
              locations={[0, 0.45, 1]}
              style={styles.heroGradient}
              pointerEvents="none"
            />

            <View style={styles.heroContent}>
              <View
                style={[
                  styles.heroTextPanel,
                  { backgroundColor: withAlpha(colors.card, 0.3) },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  Unlock <Text style={{ color: primary }}>PlanWiz PRO</Text>
                </Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>
                  Get the most out of your day with premium tools
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <ScrollView
          style={[styles.scroll, {backgroundColor: colors.background}]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Plans */}
          <View style={styles.plansWrap}>
            {PLANS.map((plan) => {
              const selected = plan.id === selectedPlan;
              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: selected ? primary : "transparent",
                    },
                  ]}
                >
                  {plan.badge && (
                    <View
                      style={[styles.badge, { backgroundColor: primary }]}
                    >
                      <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: selected ? primary : colors.subText },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: primary },
                        ]}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planTitle, { color: colors.text }]}>
                      {plan.title}
                    </Text>
                    <Text
                      style={[styles.planSubtext, { color: colors.subText }]}
                    >
                      {plan.subtext}
                    </Text>
                  </View>
                  <Text style={[styles.planPrice, { color: colors.text }]}>
                    {plan.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Features - horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresScrollContent}
            style={styles.featuresScroll}
          >
            {FEATURES.map((f) => (
              <View
                key={f.title}
                style={[styles.featureCard, { backgroundColor: colors.card }]}
              >
                <View
                  style={[
                    styles.featureIconWrap,
                    { backgroundColor: primary + "20" },
                  ]}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {f.title}
                </Text>
                <Text
                  style={[styles.featureDesc, { color: colors.subText }]}
                  numberOfLines={2}
                >
                  {f.desc}
                </Text>
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Footer / CTA - fixed */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderColor: colors.card },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubscribe}
            style={[styles.ctaBtn, { backgroundColor: primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: colors.subText }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
          {/* <Text style={[styles.disclaimer, { color: colors.subText }]}>
            Cancel anytime. Payment charged to your account at confirmation.
          </Text> */}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 18, fontWeight: "600" },

  heroWrap: {
    paddingHorizontal: 10,
  },

  scroll: { flex: 1, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 25 },

  hero: {
    marginTop: 4,
    marginBottom: 24,
    minHeight: 240,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: 20,
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 2,
  },
  heroTextPanel: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 150,
    paddingBottom: 18,
  },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  crownEmoji: { fontSize: 34 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },

  featuresScroll: {
    marginBottom: 24,
  },
  featuresScrollContent: {
    paddingHorizontal: 2,
    gap: 12,
  },
  featureCard: {
    width: 128,
    borderRadius: 16,
    padding: 14,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureIcon: { fontSize: 18 },
  featureTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  featureDesc: { fontSize: 11, lineHeight: 15 },

  plansWrap: { gap: 12 , marginTop: 10},
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 10,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planTitle: { fontSize: 15, fontWeight: "700" },
  planSubtext: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 15, fontWeight: "700" },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
  },
  ctaBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  restoreBtn: { alignItems: "center", marginTop: 10 },
  restoreText: { fontSize: 13, fontWeight: "600" },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 15,
  },
});