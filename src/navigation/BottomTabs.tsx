import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TabParamList } from './types';

import LibraryScreen from '../screens/LibraryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import HabitScreen from '../screens/HabitScreen';
import SettingsScreen from '../screens/SettingsScreen';

import BannerAdSlot from '../ads/BannerAdSlot';
import { AD_SCREENS } from '../ads/adConfig';
import CustomTabBar from './CustomTabBar';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabs({ navigation: rootNavigation }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Library"   
      screenOptions={{ headerShown: false }}
      tabBar={props => (
        <View style={{ backgroundColor: colors.background }}>
          <BannerAdSlot config={AD_SCREENS.main_screen.banner} />
          <CustomTabBar {...props} />
        </View>
      )}
    >
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{ tabBarLabel: t('settings.Templates') }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: t('settings.calendar') }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: t('settings.Library') }}
      />
      {/* <Tab.Screen name="Templates" component={TemplatesScreen} options={{ tabBarLabel: 'Templates' }} /> */}
      <Tab.Screen
        name="Vault"
        component={HabitScreen}
        options={{ tabBarLabel: t('settings.Habit') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('settings.Settings') }}
      />
    </Tab.Navigator>
  );
}
