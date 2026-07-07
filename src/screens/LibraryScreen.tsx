import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  Share,
  Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { getAllPlanners, SavedPlanner } from '../storage/plannerStorage';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import shareIcon from '../assets/icons/share.png';

type Nav = StackNavigationProp<RootStackParamList>;

function pastel(hex: string, amount = 0.72): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [planners, setPlanners] = useState<SavedPlanner[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPlanners().then(setPlanners);
    }, [])
  );

  const openPlanner = (planner: SavedPlanner) => {
    navigation.navigate('PlannerDetail', {
      template: { id: planner.templateId, name: planner.templateName, type: '' },
      savedId: planner.id,
    });
  };

  const sharePlanner = async (planner: SavedPlanner) => {
    try {
      await Share.share({ message: `${planner.templateName}${planner.date ? ` — ${planner.date}` : ''}` });
    } catch { }
  };

  const removePlanner = (planner: SavedPlanner) => {
    Alert.alert('Delete planner?', `This removes "${planner.templateName}" from your list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          setPlanners(prev => prev.filter(p => p.id !== planner.id));
        },
      },
    ]);
  };

  const openCardMenu = (planner: SavedPlanner) => {
    Alert.alert(
      planner.templateName,
      undefined,
      [
        { text: 'Share', onPress: () => sharePlanner(planner) },
        { text: 'Delete', style: 'destructive', onPress: () => removePlanner(planner) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, marginTop: 50 }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.text }]}>
          Plan<Text style={{ color: colors.primary }}>Wiz</Text>
        </Text>
        <View style={styles.headerIcons}>
          <View style={[styles.proBadge, { borderColor: colors.primary }]}>
            <Text style={{ fontSize: 11 }}>💎</Text>
            <Text style={[styles.proText, { color: colors.primary }]}>PRO</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 18 }}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' } as any)}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create New Box */}
      <TouchableOpacity
        style={[styles.createBox, { backgroundColor: colors.primary + '14' }]}
        onPress={() => navigation.navigate('StartOptions')}
        activeOpacity={0.8}
      >
        <View style={[styles.plusCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.plus}>+</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.createText, { color: colors.text }]}>Create New</Text>
          <Text style={[styles.createSubText, { color: colors.subText }]}>Pick a template & start planning</Text>
        </View>
        <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
      </TouchableOpacity>

      {/* My Planners Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>My Planners</Text>
        <Text style={[styles.countBadge, { color: colors.subText }]}>{planners.length}</Text>
      </View>

      {planners.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            No planners yet. Tap "Create New" to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={planners}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const design = TEMPLATE_DESIGNS[item.templateId] || DEFAULT_DESIGN;
            const bg = pastel(design.accentColor);
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
                  {/* <TouchableOpacity style={styles.circleBtn} onPress={() => sharePlanner(item)}>
                    <Text style={{ fontSize: 14 }}>⬆️</Text>
                  </TouchableOpacity> */}

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
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.pillBtn} onPress={() => openCardMenu(item)}>
                    <Text style={{ fontSize: 14, letterSpacing: 1, fontWeight: '800', color: '#555' }}>•••</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },
  logo: { fontSize: 20, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    marginRight: 6,
  },
  proText: { fontSize: 10, fontWeight: '700' },
  iconBtn: { padding: 6 },

  createBox: {
    margin: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: -1 },
  createText: { fontSize: 15, fontWeight: '700' },
  createSubText: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 24, fontWeight: '600' },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700' },
  countBadge: { fontSize: 13 },

  emptyState: {
    margin: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, textAlign: 'center' },

  plannerCard: {
    width: '48%',
    borderRadius: 26,
    marginBottom: 14,
    minHeight: 190,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 0,
    paddingRight: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  titlePill: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
  },

  titlePillText: { fontSize: 14, fontWeight: '700', color: '#2b2b2b' },
  titlePillSub: { fontSize: 11, color: '#8a8a8a', marginTop: 3 },

  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});