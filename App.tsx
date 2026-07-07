import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootStackParamList } from './src/navigation/types';

import BottomTabs from './src/navigation/BottomTabs';
import StartOptionsScreen from './src/screens/StartOptionsScreen';
import PlannerDetailScreen from './src/screens/PlannerDetailScreen';
import { TouchableOpacity, Text } from 'react-native';
import TemplatePreviewScreen from './src/screens/TemplatePreviewScreen';
import CalendarNoteScreen from './src/screens/CalendarNoteScreen';
import notifee, { EventType } from '@notifee/react-native';

const Stack = createStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function navigateFromNotification(detail: any) {
  const { notification } = detail;
  const dateKey = notification?.data?.dateKey as string | undefined;
  const dateLabel = notification?.data?.dateLabel as string | undefined;

  if (dateKey && navigationRef.isReady()) {
    navigationRef.navigate('CalendarNote', {
      dateKey,
      dateLabel: dateLabel || '',
    });
  }
}

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.PRESS || pressAction?.id === 'default') {
    console.log('Background: notification pressed', notification?.id);
    navigateFromNotification(detail);
  }
});

function Navigation() {
  const { colors, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Foreground: notification pressed', detail.notification?.id);
        navigateFromNotification(detail);
      }
      if (type === EventType.DELIVERED) {
        console.log('Notification delivered (app open):', detail.notification?.id);
      }
    });

    notifee.getInitialNotification().then(initial => {
      if (initial) {
        const tryNavigate = () => {
          if (navigationRef.isReady()) {
            navigateFromNotification(initial);
          } else {
            setTimeout(tryNavigate, 200);
          }
        };
        tryNavigate();
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="StartOptions"
          component={StartOptionsScreen}
          options={({ navigation }) => ({
            headerTitle: 'How Would You Like to Start?',
            headerTitleAlign: 'center',
            headerLeft: () => null,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 16, width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontSize: 17, fontWeight: '600' },
          })}
        />
        <Stack.Screen
          name="TemplatePreview"
          component={TemplatePreviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PlannerDetail"
          component={PlannerDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalendarNote"
          component={CalendarNoteScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}