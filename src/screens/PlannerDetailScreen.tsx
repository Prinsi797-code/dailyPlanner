import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import SectionRenderer from '../templates/SectionRenderer';
import { savePlanner, getPlannerById, generateId, SavedPlanner } from '../storage/plannerStorage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEffect } from 'react';

type Props = StackScreenProps<RootStackParamList, 'PlannerDetail'>;

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
const TOP_BAR_HEIGHT = 40;
const BOX_HEIGHT = SCREEN_H - 40 - TOP_BAR_HEIGHT;

const FIT_PADDING_FACTOR = 0.92;
const TARGET_W = SCREEN_W * FIT_PADDING_FACTOR;

export default function PlannerDetailScreen({ route, navigation }: Props) {
  const { template, savedId } = route.params;
  const { colors } = useTheme();
  const design = TEMPLATE_DESIGNS[template.id] || DEFAULT_DESIGN;

  const [plannerId] = useState<string>(savedId || generateId());
  const [date, setDate] = useState('');
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(!!savedId);

  const [measurePhase, setMeasurePhase] = useState<1 | 2 | 3>(1);
  const [pass2Width, setPass2Width] = useState(SCREEN_W);
  const [finalWidth, setFinalWidth] = useState(SCREEN_W);
  const [finalFitScale, setFinalFitScale] = useState(1);

  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(Animated.multiply(baseScale, pinchScale)).current;
  const lastScale = useRef(1);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      lastScale.current = Math.max(1, Math.min(lastScale.current, 4));
      baseScale.setValue(lastScale.current);
      pinchScale.setValue(1);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.current.x += event.nativeEvent.translationX;
      lastOffset.current.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.current.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.current.y);
      translateY.setValue(0);
    }
  };

  useEffect(() => {
    if (savedId) {
      getPlannerById(savedId).then((data) => {
        if (data) {
          setDate(data.date);
          setValues(data.values);
        }
        setLoading(false);
      });
    }
  }, [savedId]);

  const handleChange = (key: string, index: number, text: string) => {
    setValues((prev) => {
      const arr = [...(prev[key] || [])];
      arr[index] = text;
      return { ...prev, [key]: arr };
    });
  };

  const handleSave = async () => {
    const planner: SavedPlanner = {
      id: plannerId,
      templateId: template.id,
      templateName: template.name,
      date,
      values,
      updatedAt: Date.now(),
    };
    await savePlanner(planner);
    Alert.alert('Saved', 'Your planner has been saved.', [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Library' } as any) },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const sheetBg = design.sheetBg || '#FFFFFF';
  const isScript = design.headerStyle === 'script';

  const renderContent = () => (
    <>
      <View style={styles.headerBand}>
        <Text
          style={[
            styles.heading,
            {
              color: design.headerColor,
              fontStyle: isScript ? 'italic' : 'normal',
              fontSize: isScript ? 32 : 24,
              fontWeight: isScript ? '500' : '800',
            },
          ]}
        >
          {template.name}
        </Text>
        <View style={styles.dateRow}>
          <Text style={[styles.label, { color: design.headerColor + 'AA' }]}>Date:</Text>
          <TextInput
            style={[styles.dateInput, { color: design.headerColor, borderColor: design.accentColor + '80' }]}
            value={date}
            onChangeText={setDate}
            placeholder="June 27, 2026"
            placeholderTextColor={design.accentColor + '60'}
          />
        </View>
      </View>

      <View style={styles.sectionsWrap}>
        {design.sections.map((section, i) => (
          <SectionRenderer
            key={i}
            section={section}
            accentColor={design.accentColor}
            values={values}
            onChange={handleChange}
            fieldKey={`section_${i}`}
            themeStyle={design.themeStyle}
          />
        ))}
      </View>
    </>
  );

  return (
    <View style={[styles.screen, { marginTop: 50 }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
          <View style={[styles.closeBtnCircle, { backgroundColor: colors.background }]}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={[styles.saveText, { color: '#ffff' }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pageWindow}>
        {measurePhase === 1 && (
          <View
            style={{ position: 'absolute', opacity: 0, width: TARGET_W }}
            pointerEvents="none"
            onLayout={(e) => {
              const h1 = e.nativeEvent.layout.height;
              const scale1 = Math.min(1, BOX_HEIGHT / h1);
              if (scale1 >= 1) {
                setFinalWidth(TARGET_W);
                setFinalFitScale(1);
                setMeasurePhase(3);
              } else {
                setPass2Width(TARGET_W / scale1);
                setMeasurePhase(2);
              }
            }}
          >
            <View style={[styles.sheet, { backgroundColor: sheetBg, width: TARGET_W }]}>
              {renderContent()}
            </View>
          </View>
        )}

        {measurePhase === 2 && (
          <View
            style={{ position: 'absolute', opacity: 0, width: pass2Width }}
            pointerEvents="none"
            onLayout={(e) => {
              const h2 = e.nativeEvent.layout.height;
              const scale2 = Math.min(1, BOX_HEIGHT / h2);
              setFinalWidth(pass2Width);
              setFinalFitScale(scale2);
              setMeasurePhase(3);
            }}
          >
            <View style={[styles.sheet, { backgroundColor: sheetBg, width: pass2Width }]}>
              {renderContent()}
            </View>
          </View>
        )}
        {measurePhase === 3 && (
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={pinchRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            minPointers={1}
            avgTouches
          >
            <Animated.View style={styles.gestureLayer}>
              <PinchGestureHandler
                ref={pinchRef}
                simultaneousHandlers={panRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
              >
                <Animated.View style={[styles.sheetBox, { width: SCREEN_W, height: BOX_HEIGHT }]}>
                  <Animated.View
                    style={[
                      styles.sheet,
                      {
                        backgroundColor: sheetBg,
                        width: finalWidth,
                        transformOrigin: 'center',
                        transform: [
                          { translateX },
                          { translateY },
                          { scale: Animated.multiply(scale, finalFitScale) },
                        ],
                      },
                    ]}
                  >
                    {renderContent()}
                  </Animated.View>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveText: { fontWeight: '700', fontSize: 13 },

  pageWindow: {
    flex: 1,
    overflow: 'hidden',
  },
  gestureLayer: {
    flex: 1,
  },
  sheetBox: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  sheet: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  headerBand: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 4,
  },
  heading: { marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 13, marginRight: 8 },
  dateInput: { flex: 1, borderBottomWidth: 1.5, fontSize: 13, paddingVertical: 4 },
  closeBtn: { minWidth: 50, alignItems: 'flex-start', justifyContent: 'center' },
  closeBtnCircle: {
    width: 40, height: 40, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionsWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
});