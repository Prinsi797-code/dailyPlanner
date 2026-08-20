// theme/AppBackground.tsx
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from './ThemeContext';

export default function AppBackground({ children }: { children: React.ReactNode }) {
  const { colors, backgroundImage } = useTheme();

  if (backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={StyleSheet.absoluteFill}   // 👈 poori window cover, status bar ke peeche bhi
        resizeMode="cover"
      >
        <View style={styles.flex}>{children}</View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });