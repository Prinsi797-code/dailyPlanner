import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { useLanguage } from '../theme/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../localization/i18n';
import { resolveLanguageFromCountry } from '../localization/countryLanguageMap';
import { LOGO_MAP, SELECTED_ICON_KEY } from '../localization/logoMap';

type Props = StackScreenProps<RootStackParamList, 'Splash'>;

const HAS_LAUNCHED_KEY = 'hasLaunchedBefore';
const MIN_SPLASH_DURATION = 1800; // ms, animation ke liye minimum time

export default function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const { setLanguage } = useLanguage();
  const [logoSource, setLogoSource] = useState(LOGO_MAP.Default);

  useEffect(() => {
    // Saved app icon ke hisaab se splash logo turant set karo
    AsyncStorage.getItem(SELECTED_ICON_KEY)
      .then(key => {
        if (key && LOGO_MAP[key]) {
          setLogoSource(LOGO_MAP[key]);
        }
      })
      .catch(e => console.log('Icon key read failed:', e));

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    let cancelled = false;

    const run = async () => {
      const minDelay = new Promise(resolve =>
        setTimeout(resolve, MIN_SPLASH_DURATION),
      );

      const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);

      if (hasLaunched === 'true') {
        await minDelay;
        if (cancelled) return;
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        return;
      }

      let countryLanguage = 'en';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('http://ip-api.com/json', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json();

        if (data?.status === 'success') {
          const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
          countryLanguage = resolveLanguageFromCountry(
            data.countryCode,
            supportedCodes,
            'en',
          );
        }
      } catch (e) {
        console.log('IP lookup failed, defaulting to English:', e);
        countryLanguage = 'en';
      }

      setLanguage(countryLanguage);

      await minDelay;
      if (cancelled) return;

      navigation.reset({
        index: 0,
        routes: [{ name: 'Language', params: { isFirstLaunch: true } }],
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigation, opacity, scale, setLanguage]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={logoSource}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});