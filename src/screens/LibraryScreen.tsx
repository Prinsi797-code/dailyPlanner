import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Image,
  StatusBar,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/ThemeContext";
import { getAllPlanners, SavedPlanner } from "../storage/plannerStorage";
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from "../templates/templateConfigs";
import shareIcon from "../assets/icons/share.png";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import PlannerSnapshot from "../components/PlannerSnapshot";
// import { SafeAreaView } from "react-native-safe-area-context";

type Nav = StackNavigationProp<RootStackParamList>;

function mixColor(hex: string, target: string, amount: number): string {
  const parse = (h: string) => {
    const c = h.replace("#", "");
    return [
      parseInt(c.slice(0, 2), 16),
      parseInt(c.slice(2, 4), 16),
      parseInt(c.slice(4, 6), 16),
    ];
  };
  const [r, g, b] = parse(hex);
  const [tr, tg, tb] = parse(target);
  const mix = (c: number, t: number) => Math.round(c + (t - c) * amount);
  return `#${[mix(r, tr), mix(g, tg), mix(b, tb)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

function cardTint(hex: string, isDark: boolean): string {
  return isDark
    ? mixColor(hex, "#000000", 0.68)
    : mixColor(hex, "#FFFFFF", 0.72);
}

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const [planners, setPlanners] = useState<SavedPlanner[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const captureRef = useRef<ViewShot>(null);
  const [captureTarget, setCaptureTarget] = useState<SavedPlanner | null>(null);

  const sharePlanner = (planner: SavedPlanner) => {
    setCaptureTarget(planner);
  };

  useFocusEffect(
    useCallback(() => {
      getAllPlanners().then(setPlanners);
    }, []),
  );

  const openPlanner = (planner: SavedPlanner) => {
    navigation.navigate("PlannerDetail", {
      template: {
        id: planner.templateId,
        name: planner.templateName,
        type: "",
      },
      savedId: planner.id,
    });
  };

  useEffect(() => {
    if (!captureTarget) return;
    const timer = setTimeout(async () => {
      try {
        const uri = await captureRef.current?.capture?.();
        if (uri) {
          await Share.open({
            url: uri,
            title: captureTarget.templateName,
            failOnCancel: false,
          });
        }
      } catch (e) {
        console.log("Share failed:", e);
      } finally {
        setCaptureTarget(null);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [captureTarget]);

  const removePlanner = (planner: SavedPlanner) => {
    Alert.alert(
      "Delete planner?",
      `This removes "${planner.templateName}" from your list.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPlanners((prev) => prev.filter((p) => p.id !== planner.id));
          },
        },
      ],
    );
  };

  const openCardMenu = (planner: SavedPlanner) => {
    Alert.alert(planner.templateName, undefined, [
      { text: "Share", onPress: () => sharePlanner(planner) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removePlanner(planner),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const toggleSearch = () => {
    setSearchVisible((prev) => {
      const next = !prev;
      if (!next) setSearchQuery("");
      return next;
    });
  };

  const filteredPlanners = searchQuery.trim()
    ? planners.filter((p) =>
        p.templateName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : planners;

  return (
    <>
      <StatusBar
        backgroundColor={colors.card}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: colors.background, marginTop: 30 },
          ]}
        >
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <Text style={[styles.logo, { color: colors.text }]}>
              Plan<Text style={{ color: colors.primary }}>Wiz</Text>
            </Text>
            <View style={styles.headerIcons}>
              <View style={[styles.proBadge, { borderColor: colors.primary }]}>
                <Text style={{ fontSize: 11 }}>💎</Text>
                <Text style={[styles.proText, { color: colors.primary }]}>
                  PRO
                </Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={toggleSearch}>
                <Image
                  source={require("../assets/icons/search.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: searchVisible ? colors.primary : colors.subText,
                    resizeMode: "contain",
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate("Favorites")}
              >
                <Image
                  source={require("../assets/icons/heart.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: colors.subText,
                    resizeMode: "contain",
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {searchVisible && (
            <View style={styles.searchWrap}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={require("../assets/icons/search.png")}
                  style={{
                    width: 16,
                    height: 16,
                    tintColor: colors.subText,
                    resizeMode: "contain",
                    marginRight: 8,
                  }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search planners..."
                  placeholderTextColor={colors.subText}
                  style={[styles.searchInput, { color: colors.text }]}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Text style={{ color: colors.subText, fontSize: 16 }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* My Planners Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              My Planners
            </Text>
            <Text style={[styles.countBadge, { color: colors.subText }]}>
              {filteredPlanners.length}
            </Text>
          </View>

          {planners.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                No planners yet. Tap "Create New" to get started!
              </Text>
            </View>
          ) : filteredPlanners.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                No planners match "{searchQuery}"
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPlanners}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24,
              }}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const design =
                  TEMPLATE_DESIGNS[item.templateId] || DEFAULT_DESIGN;
                const bg = cardTint(design.accentColor, isDark);
                return (
                  <TouchableOpacity
                    style={[styles.plannerCard, { backgroundColor: bg }]}
                    onPress={() => openPlanner(item)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.titlePill}>
                      <Text style={styles.titlePillText} numberOfLines={1}>
                        {item.templateName}
                      </Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => sharePlanner(item)}
                      >
                        <Image
                          source={shareIcon}
                          style={{
                            width: 20,
                            height: 20,
                            tintColor: colors.subText,
                            resizeMode: "contain",
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pillBtn}
                        onPress={() => openCardMenu(item)}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            letterSpacing: 1,
                            fontWeight: "800",
                            color: "#555",
                          }}
                        >
                          •••
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {captureTarget && (
            <View
              style={{ position: "absolute", top: -9999, left: -9999 }}
              collapsable={false}
            >
              <ViewShot
                ref={captureRef}
                options={{ format: "png", quality: 0.9 }}
              >
                <PlannerSnapshot planner={captureTarget} />
              </ViewShot>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { fontSize: 20, fontWeight: "800" },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 4 },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    marginRight: 6,
  },
  proText: { fontSize: 10, fontWeight: "700" },
  iconBtn: { padding: 6 },

  searchWrap: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },

  createBox: {
    margin: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: -1 },
  createText: { fontSize: 15, fontWeight: "700" },
  createSubText: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 24, fontWeight: "600" },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionHeading: { fontSize: 16, fontWeight: "700" },
  countBadge: { fontSize: 13 },

  emptyState: {
    margin: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
  },
  emptyText: { fontSize: 13, textAlign: "center" },

  plannerCard: {
    width: "48%",
    borderRadius: 26,
    marginBottom: 14,
    minHeight: 190,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 0,
    paddingRight: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  titlePill: {
    backgroundColor: "#ffffff",
    width: "100%",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 12,
  },

  titlePillText: { fontSize: 14, fontWeight: "700", color: "#2b2b2b" },
  titlePillSub: { fontSize: 11, color: "#8a8a8a", marginTop: 3 },

  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillBtn: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
