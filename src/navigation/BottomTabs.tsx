import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TabParamList } from './types';

import LibraryScreen from '../screens/LibraryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import HabitScreen from '../screens/HabitScreen';
import SettingsScreen from '../screens/SettingsScreen';

import libraryIcon from '../assets/icons/library.png';
import calendarIcon from '../assets/icons/calendar.png';
import templatesIcon from '../assets/icons/templates.png';
import vaultIcon from '../assets/icons/templates.png';
import settingsIcon from '../assets/icons/settings.png';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, any> = {
  Library: libraryIcon,
  CreateNew: null,
  Calendar: calendarIcon,
  Templates: templatesIcon,
  Vault: vaultIcon,
  Settings: settingsIcon,
};

function EmptyScreen() {
  return <View />;
}

export default function BottomTabs({ navigation: rootNavigation }: any) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => (
          <Image
            source={ICONS[route.name]}
            style={{
              width: 22,
              height: 22,
              tintColor: color, // agar icons monochrome/single-color PNG hain to unhe active/inactive color mil jayega
              resizeMode: 'contain',
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: 'Library' }} />

      {/* <Tab.Screen
        name="CreateNew"
        component={EmptyScreen}
        options={{ tabBarLabel: 'Create New' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Tab switch hone se roko
            e.preventDefault();
            // Seedha root stack ke StartOptions screen pe jao
            navigation.getParent()?.navigate('StartOptions');
          },
        })}
      /> */}

      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'Calendar' }} />
      <Tab.Screen name="Templates" component={TemplatesScreen} options={{ tabBarLabel: 'Templates' }} />
      <Tab.Screen name="Vault" component={HabitScreen} options={{ tabBarLabel: 'Hebit' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}