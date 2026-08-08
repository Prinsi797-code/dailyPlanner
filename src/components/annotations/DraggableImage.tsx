import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageElement } from './types';

export default function DraggableImage({
  element,
  onUpdate,
  onDelete,
}: {
  element: ImageElement;
  onUpdate: (id: string, changes: Partial<ImageElement>) => void;
  onDelete: (id: string) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;
  const size = useRef({ width: element.width, height: element.height });

  const dragResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        onUpdate(element.id, { x: (pan.x as any)._value, y: (pan.y as any)._value });
      },
    })
  ).current;

  // Corner handle to resize (bottom-right)
  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const newW = Math.max(40, size.current.width + g.dx);
        const newH = Math.max(40, size.current.height + g.dy);
        onUpdate(element.id, { width: newW, height: newH });
      },
      onPanResponderRelease: (_, g) => {
        size.current = {
          width: Math.max(40, size.current.width + g.dx),
          height: Math.max(40, size.current.height + g.dy),
        };
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: element.width,
          height: element.height,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <Animated.View {...dragResponder.panHandlers} style={StyleSheet.absoluteFill}>
        <Image source={{ uri: element.uri }} style={styles.image} resizeMode="cover" />
      </Animated.View>

      {/* Delete button */}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(element.id)}>
        <Ionicons name="close" size={14} color="#fff" />
      </TouchableOpacity>

      {/* Resize handle */}
      <Animated.View {...resizeResponder.panHandlers} style={styles.resizeHandle} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute' },
  image: { width: '100%', height: '100%', borderRadius: 6 },
  deleteBtn: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4768FF',
    borderWidth: 2,
    borderColor: '#fff',
  },
});