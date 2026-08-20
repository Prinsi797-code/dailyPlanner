import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Template } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';

import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import SectionRenderer from '../templates/SectionRenderer';
import { adaptDesignForTheme } from '../utils/themeColorAdapter';
import AppText from '../components/AppText';
import { useTranslation } from 'react-i18next';
import { ImageBackground } from 'react-native';

type Nav = StackNavigationProp<RootStackParamList>;

type TabKey =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'kids'
  | 'pets'
  | 'lifestyle'
  | 'events'
  | 'student';

type TemplateItem = Template & {
  bg: string;
  emoji: string;
  pages: string;
  requiresPhotos?: boolean;
  photoSlots?: number;
};

const PREVIEW_BOX_HEIGHT = 140;
const PREVIEW_SHEET_WIDTH = 380;

function MiniPreview({ item }: { item: TemplateItem }) {
  const { isDark } = useTheme();
  const rawDesign = TEMPLATE_DESIGNS[item.id] || DEFAULT_DESIGN;
  const design = adaptDesignForTheme(rawDesign, isDark);
  const isScript = design.headerStyle === 'script';
  const sheetBg = design.sheetBg || '#FFFFFF';

  const content = (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: PREVIEW_SHEET_WIDTH,
        transformOrigin: 'top left',
        transform: [{ scale: 0.42 }],
      }}
    >
      {!design.hideHeader && (
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <AppText
            style={{
              color: design.headerColor,
              fontSize: isScript ? 26 : 20,
              fontWeight: isScript ? '500' : '800',
              fontStyle: isScript ? 'italic' : 'normal',
            }}
          >
            {item.name}
          </AppText>
        </View>
      )}
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
  );

  const activeBg = design.backgroundImages?.[0] ?? design.backgroundImage;

  if (activeBg) {
    return (
      <ImageBackground
        source={activeBg}
        resizeMode="cover"
        style={styles.previewArea}
      >
        {content}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.previewArea, { backgroundColor: sheetBg }]}>
      {content}
    </View>
  );
}

export default function TemplatesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const { t } = useTranslation();

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'daily', label: t('settings.Daily') },
    { key: 'weekly', label: t('settings.Weekly') },
    { key: 'monthly', label: t('settings.Monthly') },
    { key: 'kids', label: t('settings.Kids&Fun') },
    { key: 'pets', label: t('settings.Pets') },
    { key: 'lifestyle', label: t('settings.Lifestyle') },
    { key: 'events', label: t('settings.events')},
    { key: 'student', label: t('settings.Student') },
  ];

  const TEMPLATES: Record<TabKey, TemplateItem[]> = {
    daily: [
      {
        id: 1,
        name: t('settings.dailyplanner'),
        type: 'daily',
        bg: '#FFF1EC',
        emoji: '🌤️',
        pages: t('settings.1page'),
      },
      {
        id: 2,
        name: t('settings.DailyTaskReminder'),
        type: 'daily',
        bg: '#FDEEF3',
        emoji: '✨',
        pages: t('settings.1page'),
      },
      {
        id: 3,
        name: t('settings.BlockItOutPlanner'),
        type: 'daily',
        bg: '#EFF5F0',
        emoji: '🌿',
        pages: t('settings.1page'),
      },
      {
        id: 28,
        name: t('settings.ShiftPlanner'),
        type: 'daily',
        bg: '#E0F5F3',
        emoji: '🔄',
        pages: t('settings.1page'),
      },
      {
        id: 29,
        name: t('settings.MyDiary'),
        type: 'daily',
        bg: '#F5EFE6',
        emoji: '📔',
        pages: t('settings.1page'),
      },
      {
        id: 31,
        name: t('settings.MorningCheck-In'),
        type: 'daily',
        bg: '#FFF9E0',
        emoji: '☀️',
        pages: t('settings.1page'),
      },
      {
        id: 32,
        name: t('settings.ResellingPlanner'),
        type: 'daily',
        bg: '#F5F5F5',
        emoji: '🛍️',
        pages: t('settings.1page'),
      },
      {
        id: 33,
        name: t('settings.CashierPlanner'),
        type: 'daily',
        bg: '#EAF1F8',
        emoji: '🧾',
        pages: t('settings.1page'),
      },
      {
        id: 34,
        name: t('settings.Daily/ShiftPlanner'),
        type: 'daily',
        bg: '#EDEFF7',
        emoji: '🕒',
        pages: t('settings.1page'),
      },
      {
        id: 35,
        name: t('settings.DailyActivityReport'),
        type: 'daily',
        bg: '#F0EBF8',
        emoji: '📋',
        pages: t('settings.1page'),
      },
    ],
    weekly: [
      {
        id: 5,
        name: t('settings.WeeklyPlannerClassic'),
        type: 'weekly',
        bg: '#EAF3FB',
        emoji: '🗒️',
        pages: t('settings.1page'),
      },
      {
        id: 6,
        name: t('settings.WeeklyPlannerColorful'),
        type: 'weekly',
        bg: '#FDEEF3',
        emoji: '🎨',
        pages: t('settings.1page'),
      },
      {
        id: 37,
        name: t('settings.DBTDiaryCard'),
        type: 'daily',
        bg: '#EAF3EA',
        emoji: '🗂️',
        pages: t('settings.1page'),
      },
      {
        id: 38,
        name: t('settings.SpellingBeePlanner'),
        type: 'weekly',
        bg: '#FBF6DC',
        emoji: '🐝',
        pages: t('settings.1page'),
      },
    ],
    monthly: [
      {
        id: 8,
        name: t('settings.2026ProductivityPlanner'),
        type: 'monthly',
        bg: '#EDEBFA',
        emoji: '📅',
        pages: t('settings.1page'),
      },
      {
        id: 10,
        name: t('settings.FloralMonthlyPlanner'),
        type: 'monthly',
        bg: '#FBEFF3',
        emoji: '🌸',
        pages: t('settings.1page'),
      },
      {
        id: 11,
        name: t('settings.Schedule&CalendarPlanner'),
        type: 'monthly',
        bg: '#FDEEF3',
        emoji: '📅',
        pages: t('settings.1page'),
      },
      {
        id: 12,
        name: t('settings.TropicalFlamingoCalendar'),
        type: 'monthly',
        bg: '#EAF6F0',
        emoji: '🦩',
        pages: t('settings.1page'),
      },
      {
        id: 13,
        name: t('settings.PastelFloralCalendar'),
        type: 'monthly',
        bg: '#F0F6FB',
        emoji: '🦋',
        pages: t('settings.1page'),
      },
      {
        id: 39,
        name: t('settings.SleepTracker'),
        type: 'monthly',
        bg: '#F5F5F5',
        emoji: '😴',
        pages: t('settings.1page'),
      },
      {
        id: 40,
        name: t('settings.RentPaymentLedger'),
        type: 'monthly',
        bg: '#EDF3FA',
        emoji: '🧾',
        pages: t('settings.1page'),
      },
      {
        id: 41,
        name: t('settings.EggCountPlanner'),
        type: 'monthly',
        bg: '#EAF7F4',
        emoji: '🥚',
        pages: t('settings.1page'),
      },
    ],
    kids: [
      {
        id: 20,
        name: t('settings.KidsDailyPlanner'),
        type: 'daily',
        bg: '#FFF0F5',
        emoji: '🧸',
        pages: t('settings.1page'),
      },
      {
        id: 21,
        name: t('settings.PicnicPlanner'),
        type: 'activity',
        bg: '#F5FAF0',
        emoji: '🧺',
        pages: t('settings.1page'),
      },
      {
        id: 22,
        name: t('settings.TravelPlanner'),
        type: 'activity',
        bg: '#EEF4FB',
        emoji: '✈️',
        pages: t('settings.1page'),
      },
      {
        id: 24,
        name: t('settings.HomePlanner'),
        type: 'daily',
        bg: '#F0EEF8',
        emoji: '🏠',
        pages: t('settings.1page'),
      },
    ],
    pets: [
      {
        id: 25,
        name: t('settings.AquariumLog'),
        type: 'daily',
        bg: '#E8F7FC',
        emoji: '🐟',
        pages: t('settings.1page'),
      },
      {
        id: 26,
        name: t('settings.CatParent'),
        type: 'daily',
        bg: '#F5EEFF',
        emoji: '🐱',
        pages: t('settings.1page'),
      },
      {
        id: 27,
        name: t('settings.DogParent'),
        type: 'daily',
        bg: '#FEF6EC',
        emoji: '🐶',
        pages: t('settings.1page'),
      },
    ],
    lifestyle: [
      {
        id: 23,
        name: t('settings.Love&Us'),
        type: 'daily',
        bg: '#FFF0F5',
        emoji: '💕',
        pages: t('settings.1page'),
      },
      {
        id: 29,
        name: t('settings.MyDiary'),
        type: 'daily',
        bg: '#F5EFE6',
        emoji: '📔',
        pages: t('settings.1page'),
      },
      {
        id: 24,
        name: t('settings.HomePlanner'),
        type: 'daily',
        bg: '#F0EEF8',
        emoji: '🏠',
        pages: t('settings.1page'),
      },
      {
        id: 21,
        name: t('settings.PicnicPlanner'),
        type: 'daily',
        bg: '#F5FAF0',
        emoji: '🧺',
        pages: t('settings.1page'),
      },
      {
        id: 44,
        name: t('settings.ValentinesDayPlanner'),
        type: 'daily',
        bg: '#FFF0F3',
        emoji: '💌',
        pages: t('settings.1page'),
      },
      {
        id: 45,
        name: t('settings.WeeklyValentinePlanner'),
        type: 'weekly',
        bg: '#FFF0F3',
        emoji: '💘',
        pages: t('settings.1page'),
      },
      {
        id: 22,
        name: t('settings.TravelPlanner'),
        type: 'daily',
        bg: '#EEF4FB',
        emoji: '✈️',
        pages: t('settings.1page'),
      },
      {
        id: 46,
        name: t('settings.GiftIdeaPlanner'),
        type: 'daily',
        bg: '#FDEEF3',
        emoji: '💝',
        pages: t('settings.1page'),
      },
      
    ],

    events: [
      {
        id: 47,
        name: t('settings.AnniversaryPlanner'),
        type: 'daily',
        bg: '#F3E9DD',
        emoji: '💐',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 2,
      },
      {
        id: 48,
        name: t('settings.BestMoments'),
        type: 'daily',
        bg: '#F5E9DC',
        emoji: '🎀',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 2,
      },
      {
        id: 49,
        name: t('settings.BabyShowerPlanner'),
        type: 'daily',
        bg: '#EAF2FB',
        emoji: '🍼',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 1,
      },
      {
        id: 50,
        name: t('settings.AnniversaryScattered'),
        type: 'daily',
        bg: '#F3E9DD',
        emoji: '💫',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 2,
      },
      {
        id: 51,
        name: t('settings.SimpleMomentsScattered'),
        type: 'daily',
        bg: '#EAF3EA',
        emoji: '🍃',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 3,
      },
      {
        id: 52,
        name: t('settings.CelebrateTodayScattered'),
        type: 'daily',
        bg: '#F5EFE0',
        emoji: '🎈',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 3,
      },
      {
        id: 53,
        name: t('settings.PreciousMomentsScattered'),
        type: 'daily',
        bg: '#EAF2FB',
        emoji: '🧸',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 2,
      },
      {
        id: 54,
        name: t('settings.WeddingDayScattered'),
        type: 'daily',
        bg: '#F7F0E3',
        emoji: '💍',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 4,
      },
      {
        id: 55,
        name: t('settings.FriendsForeverScattered'),
        type: 'daily',
        bg: '#EAF0F7',
        emoji: '👯',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 3,
      },
      {
        id: 56,
        name: t('settings.NewBeginningsScattered'),
        type: 'daily',
        bg: '#F1EAF7',
        emoji: '🎓',
        pages: t('settings.1page'),
        requiresPhotos: true,
        photoSlots: 3,
      },
    ],
    student: [
      {
        id: 30,
        name: t('settings.StudentPlanner'),
        type: 'daily',
        bg: '#FFF4E8',
        emoji: '📚',
        pages: t('settings.1page'),
      },
      {
        id: 1,
        name: t('settings.dailyplanner'),
        type: 'daily',
        bg: '#FFF1EC',
        emoji: '🌤️',
        pages: t('settings.1page'),
      },
      {
        id: 5,
        name: t('settings.WeeklyPlannerClassic'),
        type: 'weekly',
        bg: '#EAF3FB',
        emoji: '🗒️',
        pages: t('settings.1page'),
      },
      {
        id: 42,
        name: t('settings.SchoolSchedulePlanner'),
        type: 'weekly',
        bg: '#8d76aa',
        emoji: '🎒',
        pages: t('settings.1page'),
      },
      {
        id: 43,
        name: t('settings.GroupStudyPlanner'),
        type: 'daily',
        bg: '#FBE4E9',
        emoji: '📖',
        pages: t('settings.1page'),
      },
    ],
  };

  const data = TEMPLATES[activeTab];

  const handleTemplatePress = (item: TemplateItem) => {
    navigation.navigate('TemplatePreview', { template: item });
  };

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
        {TABS.map(tab => {
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
                <AppText
                  allowFontScaling={false}
                  style={[
                    styles.tabLabel,
                    { color: active ? '#fff' : colors.subText },
                  ]}
                >
                  {tab.label}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Templates Grid */}
      <FlatList
        data={data}
        key={activeTab}
        keyExtractor={item => `${activeTab}_${item.id}`}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.8}
            onPress={() => handleTemplatePress(item)}
          >
            <MiniPreview item={item} colors={colors} />
            <View style={styles.cardFooter}>
              <AppText
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </AppText>
              <AppText style={[styles.cardPages, { color: colors.subText }]}>
                {item.pages}
              </AppText>
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
    alignItems: 'center',
  },
  tabPill: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  tabPillWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    flexShrink: 0,
  },
  card: {
    width: '48%',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  previewArea: {
    height: 140,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerEmoji: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 14,
  },
  previewHeader: { marginTop: 4 },
  previewTitleLine: {
    width: '55%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  previewBody: { gap: 6 },
  previewLineShort: {
    width: '40%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  previewLineLong: {
    width: '85%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  previewLineMed: {
    width: '65%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  tabPillInner: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },

  previewRow: { flexDirection: 'row', gap: 5, marginTop: 4 },
  previewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  heartEmoji: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    fontSize: 12,
  },
  gradientFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: { padding: 12 },
  cardTitle: { fontSize: 13.5, fontWeight: '700', marginBottom: 2 },
  cardPages: { fontSize: 11 },
});
