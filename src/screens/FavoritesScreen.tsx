import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/ThemeContext";
import { getFavorites, toggleFavorite } from "../utils/favorites";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Nav = StackNavigationProp<RootStackParamList>;

const ACTION_WIDTH = 76;
const ACTION_GAP = 12;
const ACTION_CONTAINER_WIDTH = ACTION_WIDTH + ACTION_GAP;

function RightDeleteAction({
  drag,
  onPress,
}: {
  drag: SharedValue<number>;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + ACTION_CONTAINER_WIDTH }],
  }));

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={styles.deleteAction}
      >
        <View style={styles.deleteIconWrap}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </View>
        {/* <Text style={styles.deleteText}>Delete</Text> */}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const swipeRefs = useRef<Map<string, any>>(new Map());
  const openRowId = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, []),
  );

  const handleRemove = async (template: any) => {
    swipeRefs.current.get(template.id)?.close();
    openRowId.current = null;
    await toggleFavorite(template);
    setFavorites((prev) => prev.filter((t) => t.id !== template.id));

    Toast.show({
      type: "success",
      text1: "Removed from Favorites",
      position: "bottom",
      visibilityTime: 1200,
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Favorites
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Favorites Yet
          </Text>
          <Text style={[styles.emptySub, { color: colors.subText }]}>
            Templates preview me heart pe tap karke{"\n"}yaha add karo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => swipeRefs.current.set(item.id, ref)}
              renderRightActions={(progress, drag) => (
                <RightDeleteAction
                  drag={drag}
                  onPress={() => handleRemove(item)}
                />
              )}
              onSwipeableWillOpen={() => {
                if (openRowId.current && openRowId.current !== item.id) {
                  swipeRefs.current.get(openRowId.current)?.close();
                }
                openRowId.current = item.id;
              }}
              overshootRight={false}
              friction={2}
              rightThreshold={40}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() =>
                  navigation.navigate("TemplatePreview", { template: item })
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.cardTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Image
                  source={require("../assets/icons/heart.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: "#FF3B30",
                    resizeMode: "contain",
                  }}
                />
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  actionContainer: {
    width: ACTION_CONTAINER_WIDTH,
    marginBottom: 10,
    paddingLeft: ACTION_GAP,
  },
  deleteAction: {
    flex: 1,
    // backgroundColor: "#FF3B30",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  deleteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});