// src/navigation/CustomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';

import libraryIcon from '../assets/icons/library.png';
import calendarIcon from '../assets/icons/calendar.png';
import templatesIcon from '../assets/icons/templates.png';
import vaultIcon from '../assets/icons/clipboard.png';
import settingsIcon from '../assets/icons/settings.png';
import AppText from '../components/AppText';


const ICONS: Record<string, any> = {
  Library: libraryIcon,
  Calendar: calendarIcon,
  Templates: templatesIcon,
  Vault: vaultIcon,
  Settings: settingsIcon,
};

function withOpacity(hex: string, opacity: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function TabItem({
  routeName,
  label,
  focused,
  onPress,
  colors,
}: {
  routeName: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  colors: any;
}) {
  const color = focused ? colors.primary : colors.tabInactive;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <View
        style={[
          styles.iconWrap,
          focused && { backgroundColor: withOpacity(colors.primary, 0.12) },
        ]}
      >
        <Image
          source={ICONS[routeName]}
          style={{ width: 20, height: 20, tintColor: color, resizeMode: 'contain' }}
        />
      </View>
      <AppText style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const routes = state.routes;
  const leftRoutes = routes.slice(0, 2);  
  const centerRoute = routes[2];           
  const rightRoutes = routes.slice(3, 5); 

  const goTo = (routeKey: string, routeName: string, index: number) => {
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Left island: Library + Calendar */}
      <View style={[styles.sideIsland, { backgroundColor: colors.tabBar }]}>
        {leftRoutes.map((route, i) => {
          const index = i;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? route.name;
          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              label={label}
              focused={state.index === index}
              onPress={() => goTo(route.key, route.name, index)}
              colors={colors}
            />
          );
        })}
      </View>

      {/* Center island: raised, single icon */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => goTo(centerRoute.key, centerRoute.name, 2)}
        style={[
          styles.centerIsland,
          {
            backgroundColor: state.index === 2 ? colors.primary : colors.tabBar,
          },
        ]}
      >
        <Image
          source={ICONS[centerRoute.name]}
          style={{
            width: 24,
            height: 24,
            tintColor: state.index === 2 ? '#fff' : colors.tabInactive,
            resizeMode: 'contain',
          }}
        />
      </TouchableOpacity>

      {/* Right island: Vault + Settings */}
      <View style={[styles.sideIsland, { backgroundColor: colors.tabBar }]}>
        {rightRoutes.map((route, i) => {
          const index = i + 3;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? route.name;
          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              label={label}
              focused={state.index === index}
              onPress={() => goTo(route.key, route.name, index)}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  sideIsland: {
    flexDirection: 'row',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
  },
  iconWrap: {
    width: 34,
    height: 26,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  centerIsland: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
});