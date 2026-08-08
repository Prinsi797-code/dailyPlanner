import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, TouchableWithoutFeedback } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { AnnotationElement, TextElement, DrawStroke, ImageElement, ToolMode } from './types';
import DraggableText from './DraggableText';
import DraggableImage from './DraggableImage';
import BottomToolbar from './BottomToolbar';
import ColorPickerRow from './ColorPickerRow';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function strokeToPathD(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  return points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y} ` : `L${p.x},${p.y} `),
    ''
  );
}

export default function AnnotationOverlay({ colors }: { colors: any }) {
  const [elements, setElements] = useState<AnnotationElement[]>([]);
  const [mode, setMode] = useState<ToolMode>('none');
  const [drawColor, setDrawColor] = useState('#1a1a1a');
  const currentStroke = useRef<{ x: number; y: number }[]>([]);
  const [liveStroke, setLiveStroke] = useState<{ x: number; y: number }[]>([]);

  const updateElement = (id: string, changes: any) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...changes } : el))
    );
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  // Draw mode: capture strokes on the background
  const drawResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'draw',
      onMoveShouldSetPanResponder: () => mode === 'draw',
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [{ x: locationX, y: locationY }];
        setLiveStroke([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
        setLiveStroke(currentStroke.current);
      },
      onPanResponderRelease: () => {
        if (currentStroke.current.length > 1) {
          const stroke: DrawStroke = {
            id: genId(),
            type: 'draw',
            color: drawColor,
            strokeWidth: 3,
            points: currentStroke.current,
          };
          setElements((prev) => [...prev, stroke]);
        }
        currentStroke.current = [];
        setLiveStroke([]);
      },
    })
  ).current;

  const handleBackgroundTap = (e: any) => {
    if (mode !== 'text') return;
    const { locationX, locationY } = e.nativeEvent;
    const newText: TextElement = {
      id: genId(),
      type: 'text',
      x: locationX,
      y: locationY,
      text: '',
      color: drawColor,
      fontSize: 16,
    };
    setElements((prev) => [...prev, newText]);
    setMode('none');
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || !response.assets?.[0]?.uri) return;
      const uri = response.assets[0].uri!;
      const newImage: ImageElement = {
        id: genId(),
        type: 'image',
        x: 60,
        y: 60,
        width: 140,
        height: 140,
        uri,
      };
      setElements((prev) => [...prev, newImage]);
    });
  };

  return (
    <>
      {/* Overlay canvas — sheet ke upar sits karta hai */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={mode === 'none' ? 'box-none' : 'auto'}
        {...(mode === 'draw' ? drawResponder.panHandlers : {})}
      >
        <TouchableWithoutFeedback onPress={handleBackgroundTap}>
          <View style={StyleSheet.absoluteFill}>
            {/* Saved draw strokes */}
            <Svg style={StyleSheet.absoluteFill}>
              {elements
                .filter((el): el is DrawStroke => el.type === 'draw')
                .map((stroke) => (
                  <Path
                    key={stroke.id}
                    d={strokeToPathD(stroke.points)}
                    stroke={stroke.color}
                    strokeWidth={stroke.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              {/* Live stroke being drawn */}
              {liveStroke.length > 1 && (
                <Path
                  d={strokeToPathD(liveStroke)}
                  stroke={drawColor}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>

            {/* Text elements */}
            {elements
              .filter((el): el is TextElement => el.type === 'text')
              .map((el) => (
                <DraggableText
                  key={el.id}
                  element={el}
                  onUpdate={updateElement}
                  onDelete={deleteElement}
                />
              ))}

            {/* Image elements */}
            {elements
              .filter((el): el is ImageElement => el.type === 'image')
              .map((el) => (
                <DraggableImage
                  key={el.id}
                  element={el}
                  onUpdate={updateElement}
                  onDelete={deleteElement}
                />
              ))}
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* Color picker — sirf draw/text mode me dikhta hai */}
      {(mode === 'draw' || mode === 'text') && (
        <ColorPickerRow selected={drawColor} onSelect={setDrawColor} />
      )}

      {/* Bottom toolbar */}
      <BottomToolbar
        mode={mode}
        onModeChange={setMode}
        onPickImage={pickImage}
        activeColor={drawColor}
        colors={colors}
      />
    </>
  );
}