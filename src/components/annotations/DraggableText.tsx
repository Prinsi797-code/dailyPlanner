import React, { useRef, useState } from 'react';
import { Animated, PanResponder, TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextElement } from './types';

export default function DraggableText({
  element,
  onUpdate,
  onDelete,
}: {
  element: TextElement;
  onUpdate: (id: string, changes: Partial<TextElement>) => void;
  onDelete: (id: string) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;
  const [editing, setEditing] = useState(element.text === '');
  const [text, setText] = useState(element.text);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        onUpdate(element.id, {
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.wrapper, { transform: pan.getTranslateTransform() }]}
    >
      {/* Drag handle */}
      <View {...panResponder.panHandlers} style={styles.handle}>
        <View style={styles.handleDot} />
      </View>

      {editing ? (
        <TextInput
          autoFocus
          value={text}
          onChangeText={setText}
          onBlur={() => {
            setEditing(false);
            if (text.trim() === '') {
              onDelete(element.id);
            } else {
              onUpdate(element.id, { text });
            }
          }}
          style={[styles.input, { color: element.color, fontSize: element.fontSize }]}
          multiline
        />
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Animated.Text style={{ color: element.color, fontSize: element.fontSize }}>
            {text || 'Type here'}
          </Animated.Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  handle: {
    width: 18,
    height: 18,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4768FF',
  },
  input: {
    minWidth: 80,
    padding: 2,
  },
});