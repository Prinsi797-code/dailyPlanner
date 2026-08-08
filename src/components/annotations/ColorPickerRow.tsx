import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const PALETTE = [
  '#1a1a1a', '#FFFFFF', '#E63946', '#F4A261',
  '#FCCD00', '#4768FF', '#2A9D8F', '#F52C56',
];

export default function ColorPickerRow({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (color: string) => void;
}) {
  return (
    <View style={styles.row}>
      {PALETTE.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => onSelect(color)}
          style={[
            styles.swatchOuter,
            selected === color && { borderColor: color },
          ]}
        >
          <View
            style={[
              styles.swatch,
              { backgroundColor: color, borderWidth: color === '#FFFFFF' ? 1 : 0, borderColor: '#ccc' },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  swatchOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 26, height: 26, borderRadius: 13 },
});