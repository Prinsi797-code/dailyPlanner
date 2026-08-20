// src/screens/MoodHomeScreen.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import MoodWeekCard from '../components/MoodWeekCard';

export default function MoodHomeScreen() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <MoodWeekCard />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});