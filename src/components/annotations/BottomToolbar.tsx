import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ToolMode } from './types';

interface Props {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onPickImage: () => void;
  activeColor: string;
  colors: any;
}

export default function BottomToolbar({ mode, onModeChange, onPickImage, activeColor, colors }: Props) {
  const comingSoon = () => Alert.alert('Coming soon', 'Ye tool jald hi add hoga.');

  return (
    <View style={[styles.bar, { backgroundColor: colors.tabBar || '#1a1a1a' }]}>
      {/* Text tool */}
      <TouchableOpacity
        style={[styles.btn, mode === 'text' && styles.btnActive]}
        onPress={() => onModeChange(mode === 'text' ? 'none' : 'text')}
      >
        <Ionicons name="text" size={22} color={mode === 'text' ? colors.primary : '#fff'} />
      </TouchableOpacity>

      {/* Pencil / draw tool */}
      <TouchableOpacity
        style={[styles.btn, mode === 'draw' && styles.btnActive]}
        onPress={() => onModeChange(mode === 'draw' ? 'none' : 'draw')}
      >
        <Ionicons name="pencil" size={22} color={mode === 'draw' ? activeColor : '#fff'} />
      </TouchableOpacity>

      {/* Image tool */}
      <TouchableOpacity style={styles.btn} onPress={onPickImage}>
        <Ionicons name="image-outline" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Placeholder tools — baad me active honge */}
      <TouchableOpacity style={[styles.btn, { opacity: 0.35 }]} onPress={comingSoon}>
        <Ionicons name="grid-outline" size={22} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { opacity: 0.35 }]} onPress={comingSoon}>
        <Ionicons name="calendar-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});