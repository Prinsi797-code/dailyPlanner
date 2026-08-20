import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { getMoodForDate } from '../storage/moodStorage';
import MoodSheetModal from '../components/MoodSheetModal';
import { MOODS } from '../constants/moods';
import {
  getAllPlanners,
  SavedPlanner,
  deletePlanner,
} from '../storage/plannerStorage';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import shareIcon from '../assets/icons/share.png';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import PlannerSnapshot from '../components/PlannerSnapshot';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';

type Nav = StackNavigationProp<RootStackParamList>;

function mixColor(hex: string, target: string, amount: number): string {
  const parse = (h: string) => {
    const c = h.replace('#', '');
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
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

function cardTint(hex: string, isDark: boolean): string {
  return isDark
    ? mixColor(hex, '#000000', 0.68)
    : mixColor(hex, '#FFFFFF', 0.72);
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();
  const [planners, setPlanners] = useState<SavedPlanner[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayMoodSet, setTodayMoodSet] = useState(false);
  const { t } = useTranslation();
  const proScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(proScale, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(proScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [proScale]);

  const captureRef = useRef<ViewShot>(null);
  const [captureTarget, setCaptureTarget] = useState<SavedPlanner | null>(null);

  const sharePlanner = (planner: SavedPlanner) => {
    setCaptureTarget(planner);
  };

  useFocusEffect(
    useCallback(() => {
      getAllPlanners().then(setPlanners);
      const todayKey = dateKey(new Date());
      getMoodForDate(todayKey).then(entry => setTodayMoodSet(!!entry));
    }, []),
  );

  const openPlanner = (planner: SavedPlanner) => {
    navigation.navigate('PlannerDetail', {
      template: {
        id: planner.templateId,
        name: planner.templateName,
        type: '',
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
        console.log('Share failed:', e);
      } finally {
        setCaptureTarget(null);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [captureTarget]);

  const removePlanner = (planner: SavedPlanner) => {
    Alert.alert(
      'Delete planner?',
      `This removes "${planner.templateName}" from your list.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.Delete'),
          style: 'destructive',
          onPress: async () => {
            await deletePlanner(planner.id);
            setPlanners(prev => prev.filter(p => p.id !== planner.id));
          },
        },
      ],
    );
  };

  const openCardMenu = (planner: SavedPlanner) => {
    Alert.alert(planner.templateName, undefined, [
      { text: t('common.Share'), onPress: () => sharePlanner(planner) },
      {
        text: t('common.Delete'),
        style: 'destructive',
        onPress: () => removePlanner(planner),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const toggleSearch = () => {
    setSearchVisible(prev => {
      const next = !prev;
      if (!next) setSearchQuery('');
      return next;
    });
  };

  const filteredPlanners = searchQuery.trim()
    ? planners.filter(p =>
        p.templateName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : planners;

  return (
    <>
      <StatusBar
        backgroundColor={colors.card}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { marginTop: 10 }]}>
          <AppText style={[styles.logo, { color: colors.text }]}>
            Daily<AppText style={{ color: colors.primary }}> Planner</AppText>
          </AppText>
          <View style={styles.headerIcons}>
            <Animated.View
              style={[
                styles.proBadge,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                  transform: [{ scale: proScale }],
                },
              ]}
            >
              {/* <Text style={{ fontSize: 11 }}>💎</Text> */}
              {/* <AppText style={[styles.proText, { color: colors.text }]}>
                PRO
              </AppText> */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Premium' as never)}
              >
                <AppText style={[styles.proText, { color: colors.text }]}>
                  PRO
                </AppText>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleSearch}>
              <Image
                source={require('../assets/icons/search.png')}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: searchVisible ? colors.primary : colors.subText,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Image
                source={require('../assets/icons/heart.png')}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: colors.subText,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={[styles.container, {}]}>
          {searchVisible && (
            <View style={styles.searchWrap}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={require('../assets/icons/search.png')}
                  style={{
                    width: 16,
                    height: 16,
                    tintColor: colors.subText,
                    resizeMode: 'contain',
                    marginRight: 8,
                  }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('settings.Searchplanners')}
                  placeholderTextColor={colors.subText}
                  style={[styles.searchInput, { color: colors.text }]}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            <AppText style={[styles.sectionHeading, { color: colors.text }]}>
              {t('settings.MyPlanners')}
            </AppText>
            <AppText style={[styles.countBadge, { color: colors.subText }]}>
              {filteredPlanners.length}
            </AppText>
          </View>

          {planners.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyState, { borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Templates' as never)}
            >
              <AppText style={[styles.emptyText, { color: colors.subText }]}>
                {t('settings.CreateNew')}
              </AppText>
            </TouchableOpacity>
          ) : filteredPlanners.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <AppText style={[styles.emptyText, { color: colors.subText }]}>
                {t('settings.Noplannersmatch')} "{searchQuery}"
              </AppText>
            </View>
          ) : (
            <FlatList
              data={filteredPlanners}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
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
                      <AppText style={styles.titlePillText} numberOfLines={1}>
                        {item.templateName}
                      </AppText>
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
                            resizeMode: 'contain',
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pillBtn}
                        onPress={() => openCardMenu(item)}
                      >
                        <AppText
                          style={{
                            fontSize: 14,
                            letterSpacing: 1,
                            fontWeight: '800',
                            color: '#555',
                          }}
                        >
                          •••
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {captureTarget && (
            <View
              style={{ position: 'absolute', top: -9999, left: -9999 }}
              collapsable={false}
            >
              <ViewShot
                ref={captureRef}
                options={{ format: 'png', quality: 0.9 }}
              >
                <PlannerSnapshot planner={captureTarget} />
              </ViewShot>
            </View>
          )}
        </ScrollView>
        {!todayMoodSet && (
          <TouchableOpacity
            onPress={() => setMoodModalVisible(true)}
            style={[styles.moodFabWrap, {}]}
          >
            <View style={styles.moodFab}>
              <Image
                source={require('../assets/emoji/grateful.png')}
                style={styles.moodFabImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        )}

        <MoodSheetModal
          visible={moodModalVisible}
          date={new Date()}
          onClose={() => setMoodModalVisible(false)}
          onSaved={() => setTodayMoodSet(true)}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  moodFabImage: {
    width: 35,
    height: 35,
  },
  logo: { fontSize: 20, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moodFabWrap: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  moodFabText: { fontSize: 26 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 5,
    gap: 3,
    marginRight: 6,
  },
  proText: { fontSize: 12, fontWeight: '700' },
  iconBtn: { padding: 6 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },
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
    paddingTop: 20,
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
    paddingLeft: 20,
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
