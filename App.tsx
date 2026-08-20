import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';
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
import { LayoutProvider } from './src/theme/LayoutContext';
import LayoutDaysOrderScreen from './src/screens/LayoutDaysOrderScreen';
import LineTypeScreen from './src/screens/LineTypeScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontFamilyScreen from './src/screens/FontFamilyScreen';
import { PremiumProvider } from './src/premium/PremiumContext';
import { useFont, FontProvider } from './src/theme/FontContext';
import { usePremium } from './src/premium/PremiumContext';
import { LanguageProvider } from './src/theme/LanguageContext';
import LanguageScreen from './src/screens/LanguageScreen';
// import MoodScreen from './src/screens/MoodScreen';
import MoodHomeScreen from './src/screens/MoodHomeScreen';
import MoodCalendarScreen from './src/screens/MoodCalendarScreen';
import SplashScreen from './src/screens/SplashScreen';
import { scheduleAllDailyNotifications } from './src/notifications/dailyNotifications';

import {
  getRemoteConfig,
  fetchAndActivate,
} from '@react-native-firebase/remote-config';
import {
  getAdUnitId,
  getFlag,
  showAppOpenIfEligible,
} from './src/ads/AdManager';
import { AD_SCREENS } from './src/ads/adConfig';
import { InterFrequency } from './src/ads/adConfig';
import './src/localization/i18n';
import AppBackground from './src/theme/AppBackground';

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

// ---------------------------------------------------------------------------
// App Open Ad — only when app RESUMES from background, never on cold start.
// ---------------------------------------------------------------------------
function useAppOpenAdOnForeground() {
  const { isPremium } = usePremium();
  const appState = useRef<AppStateStatus | null>(null);
  const isShowingAd = useRef(false);

  useEffect(() => {
    const trigger = async () => {
      if (isPremium) return;
      if (isShowingAd.current) return;
      isShowingAd.current = true;
      try {
        const flag = getFlag(
          AD_SCREENS.main_screen.appOpen.flagKey,
        ) as InterFrequency;
        const adUnitId = getAdUnitId(AD_SCREENS.main_screen.appOpen.idKey);
        await showAppOpenIfEligible({ adUnitId, flag });
      } finally {
        isShowingAd.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', nextState => {
      const prevState = appState.current;
      if (prevState !== null) {
        const cameFromBackground =
          prevState === 'background' || prevState === 'inactive';
        const isNowActive = nextState === 'active';

        if (cameFromBackground && isNowActive) {
          trigger();
        }
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [isPremium]);
}

function Navigation() {
  const { colors, isDark } = useTheme();
  const { fontFamily } = useFont();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
      background: colors.background,
    },
  };

  useAppOpenAdOnForeground();

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log(
          'Foreground: notification pressed',
          detail.notification?.id,
        );
        navigateFromNotification(detail);
      }
      if (type === EventType.DELIVERED) {
        console.log(
          'Notification delivered (app open):',
          detail.notification?.id,
        );
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
    <>
      <AppBackground>
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MainTabs"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
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
                    style={{
                      marginRight: 16,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
                  </TouchableOpacity>
                ),
                headerStyle: {
                  backgroundColor: '#fff',
                  elevation: 0,
                  shadowOpacity: 0,
                },
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
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="CalendarNote"
              component={CalendarNoteScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="LayoutDaysOrder"
              component={LayoutDaysOrderScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="LineType"
              component={LineTypeScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="Theme"
              component={ThemeScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="FontFamily"
              component={FontFamilyScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            {/* <Stack.Screen
              name="Mood"
              component={MoodScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
                presentation: 'modal',
              }}
            /> */}
            <Stack.Screen
              name="MoodHome"
              component={MoodHomeScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="MoodCalendar"
              component={MoodCalendarScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppBackground>
      <Toast />
    </>
  );
}

function NavigationWithFontKey() {
  const { fontFamily } = useFont();
  return <Navigation />;
}

export default function App() {
  const [rcReady, setRcReady] = useState(false);

  useEffect(() => {
    scheduleAllDailyNotifications().catch(e =>
      console.log('Failed to schedule daily notifications:', e),
    );
  }, []);

  useEffect(() => {
    const rc = getRemoteConfig();

    rc.defaultConfig = {
      calendar_inter_flag: 0,
      calendar_inter_id: '',
      favorite_baner_flag: 0,
      favorite_baner_id: '',
      favorite_inter_flag: 0,
      favorite_inter_id: '',
      layout_inter_flag: 0,
      layout_inter_id: '',
      layout_native_flag: 0,
      layout_native_id: '',
      line_inter_flag: 0,
      line_inter_id: '',
      line_native_flag: 0,
      line_native_id: '',
      app_open_flag: 0,
      app_open_id: '',
      main_baner_flag: 0,
      main_baner_id: '',
      inter_flag: 0,
      inter_id: '',
      theme_inter_flag: 0,
      theme_inter_id: '',
      theme_native_flag: 0,
      theme_native_id: '',
    };

    fetchAndActivate(rc)
      .then(() => setRcReady(true))
      .catch(e => {
        console.log('Remote config fetch failed:', e);
        setRcReady(true);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PremiumProvider>
        <LanguageProvider>
          <FontProvider>
            <ThemeProvider>
              <LayoutProvider>
                <Navigation />
              </LayoutProvider>
            </ThemeProvider>
          </FontProvider>
        </LanguageProvider>
      </PremiumProvider>
    </GestureHandlerRootView>
  );
}
