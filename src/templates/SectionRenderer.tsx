import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SectionConfig } from './templateConfigs';
import { useTheme } from '../theme/ThemeContext';
import MonthCalendarBlock from './MonthCalendarBlock';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = {
  section: SectionConfig;
  accentColor: string;
  values: Record<string, string[]>;
  onChange: (key: string, index: number, text: string) => void;
  fieldKey: string;
  themeStyle?: ThemeStyle;
};

export type ThemeStyle = {
  sectionBg?: string;          // section card background
  sectionBorderColor?: string; // section card border
  sectionBorderWidth?: number;
  sectionBorderRadius?: number;
  tagStyle?: 'pill' | 'banner' | 'box' | 'underline'; // title style
  bulletShape?: 'circle' | 'square' | 'star' | 'heart';
  inputUnderlineColor?: string;
  font?: 'normal' | 'italic';
};

function BulletShape({ shape, color }: { shape?: string; color: string }) {
  switch (shape) {
    case 'square':
      return <View style={{ width: 8, height: 8, borderWidth: 1.5, borderColor: color, marginRight: 8, borderRadius: 2 }} />;
    case 'star':
      return <Text style={{ marginRight: 8, fontSize: 11, color }}>⭐</Text>;
    case 'heart':
      return <Text style={{ marginRight: 8, fontSize: 11, color }}>♡</Text>;
    default: // circle
      return <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.4, borderColor: color, marginRight: 8 }} />;
  }
}

function SectionTag({
  title,
  accentColor,
  tagStyle,
}: {
  title: string;
  accentColor: string;
  tagStyle?: string;
}) {
  switch (tagStyle) {
    case 'banner':
      return (
        <View style={[sectionTagStyles.bannerWrap, { backgroundColor: accentColor }]}>
          <View style={[sectionTagStyles.bannerEar, sectionTagStyles.bannerEarLeft, { borderRightColor: accentColor }]} />
          <Text style={sectionTagStyles.bannerText}>{title}</Text>
          <View style={[sectionTagStyles.bannerEar, sectionTagStyles.bannerEarRight, { borderLeftColor: accentColor }]} />
        </View>
      );
    case 'box':
      return (
        <View style={[sectionTagStyles.boxWrap, { borderColor: accentColor }]}>
          <Text style={[sectionTagStyles.boxText, { color: accentColor }]}>{title}</Text>
        </View>
      );
    case 'underline':
      return (
        <View style={sectionTagStyles.underlineWrap}>
          <Text style={[sectionTagStyles.underlineText, { color: accentColor }]}>{title}</Text>
          <View style={[sectionTagStyles.underlineLine, { backgroundColor: accentColor }]} />
        </View>
      );
    default: // pill
      return (
        <View style={[sectionTagStyles.pillWrap, { backgroundColor: accentColor }]}>
          <Text style={sectionTagStyles.pillText}>{title}</Text>
        </View>
      );
  }
}

const sectionTagStyles = StyleSheet.create({
  pillWrap: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  bannerWrap: { flexDirection: 'row', alignSelf: 'center', marginBottom: 12, alignItems: 'center' },
  bannerEar: { width: 0, height: 0, borderTopWidth: 14, borderBottomWidth: 14, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  bannerEarLeft: { borderRightWidth: 10 },
  bannerEarRight: { borderLeftWidth: 10 },
  bannerText: { color: '#fff', fontSize: 13, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 5 },

  boxWrap: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  boxText: { fontSize: 12, fontWeight: '700' },

  underlineWrap: { marginBottom: 12 },
  underlineText: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  underlineLine: { height: 2, borderRadius: 1, width: '100%' },
});

export default function SectionRenderer({ section, accentColor, values, onChange, fieldKey, themeStyle }: Props) {
  const { colors } = useTheme();
  const data = values[fieldKey] || [];
  const ts = themeStyle || {};

  const setVal = (i: number, text: string) => onChange(fieldKey, i, text);

  const cardStyle = {
    backgroundColor: ts.sectionBg || 'transparent',
    borderColor: ts.sectionBorderColor || 'transparent',
    borderWidth: ts.sectionBorderWidth || 0,
    borderRadius: ts.sectionBorderRadius ?? 10,
    padding: ts.sectionBg ? 12 : 0,
    marginBottom: 18,
  };

  const underlineColor = ts.inputUnderlineColor || colors.border;

  switch (section.type) {
    case 'dayPicker':
      return (
        <View style={[cardStyle, { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }]}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setVal(0, data[0] === String(i) ? '' : String(i))}
              style={[
                styles.dayCircle,
                {
                  borderColor: accentColor,
                  backgroundColor: data[0] === String(i) ? accentColor : 'transparent',
                },
              ]}
            >
              <Text style={{ fontSize: 11, color: data[0] === String(i) ? '#fff' : accentColor, fontWeight: '700' }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case 'checklistLine':
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag title={section.title} accentColor={accentColor} tagStyle={ts.tagStyle} />
          )}
          {Array.from({ length: section.count || 3 }).map((_, i) => (
            <View key={i} style={styles.checklistRow}>
              <BulletShape shape={ts.bulletShape} color={accentColor} />
              <TextInput
                style={[styles.checklistInput, { borderColor: underlineColor, color: colors.text }]}
                value={data[i] || ''}
                onChangeText={(t) => setVal(i, t)}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          ))}
        </View>
      );

    case 'textarea':
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag title={section.title} accentColor={accentColor} tagStyle={ts.tagStyle} />
          )}
          <TextInput
            style={[styles.textarea, { borderColor: ts.sectionBorderColor || accentColor + '55', color: colors.text, backgroundColor: colors.background + 'aa' }]}
            value={data[0] || ''}
            onChangeText={(t) => setVal(0, t)}
            multiline
            placeholder="Write here..."
            placeholderTextColor={colors.placeholder}
          />
        </View>
      );

    case 'hourGrid':
      return (
        <View style={cardStyle}>
          <SectionTag title={section.title || 'Schedule'} accentColor={accentColor} tagStyle={ts.tagStyle} />
          {(section.hours || []).map((h, i) => (
            <View key={h} style={styles.hourRow}>
              <Text style={[styles.hourLabel, { color: accentColor, fontWeight: '700' }]}>{h}</Text>
              <TextInput
                style={[styles.hourInput, { borderColor: underlineColor, color: colors.text }]}
                value={data[i] || ''}
                onChangeText={(t) => setVal(i, t)}
              />
            </View>
          ))}
        </View>
      );

    case 'monthCalendar': {
      const today = new Date();
      return (
        <View style={cardStyle}>
          <MonthCalendarBlock
            startDay={section.startDay || 'mon'}
            decoration={section.decoration || 'minimal'}
            accentColor={accentColor}
            year={today.getFullYear()}
            month={today.getMonth()}
            values={Object.fromEntries(
              data.map((v, i) => [`${today.getMonth()}_${i}`, v]).filter(([, v]) => v)
            )}
            onChange={(dayKey, text) => {
              const dayNum = parseInt(dayKey.split('_')[1], 10);
              setVal(dayNum, text);
            }}
          />
        </View>
      );
    }

    case 'iconRow':
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag title={section.title} accentColor={accentColor} tagStyle={ts.tagStyle} />
          )}
          <View style={styles.iconRowWrap}>
            {(section.icons || []).map((icon, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setVal(i, data[i] === '1' ? '' : '1')}
                style={[
                  styles.iconCircle,
                  {
                    borderColor: accentColor,
                    backgroundColor: data[i] === '1' ? accentColor + '30' : 'transparent',
                    opacity: data[i] === '1' ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    case 'habitGrid':
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag title={section.title} accentColor={accentColor} tagStyle={ts.tagStyle} />
          )}
          {Array.from({ length: 4 }).map((_, row) => (
            <View key={row} style={[styles.habitRow, { backgroundColor: row % 2 === 0 ? accentColor + '10' : 'transparent', borderRadius: 6, padding: 4 }]}>
              <TextInput
                style={[styles.habitNameInput, { borderColor: underlineColor, color: colors.text }]}
                value={data[row] || ''}
                onChangeText={(t) => setVal(row, t)}
                placeholder="Habit"
                placeholderTextColor={colors.placeholder}
              />
              <View style={styles.habitDaysRow}>
                {DAYS.map((d, di) => (
                  <TouchableOpacity
                    key={di}
                    onPress={() => setVal(100 + row * 10 + di, data[100 + row * 10 + di] === '1' ? '' : '1')}
                    style={[
                      styles.habitCell,
                      {
                        borderColor: accentColor,
                        backgroundColor: data[100 + row * 10 + di] === '1' ? accentColor : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  checklistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checklistInput: { flex: 1, borderBottomWidth: 1, fontSize: 13, paddingVertical: 4 },

  textarea: { borderWidth: 1.5, borderRadius: 8, minHeight: 80, padding: 10, fontSize: 13, textAlignVertical: 'top' },

  dayCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  hourRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  hourLabel: { width: 52, fontSize: 11 },
  hourInput: { flex: 1, borderBottomWidth: 1, fontSize: 12, paddingVertical: 3 },

  iconRowWrap: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  habitRow: { marginBottom: 8 },
  habitNameInput: { borderBottomWidth: 1, fontSize: 12, paddingVertical: 4, marginBottom: 6 },
  habitDaysRow: { flexDirection: 'row', gap: 5 },
  habitCell: { width: 24, height: 24, borderWidth: 1.5, borderRadius: 5 },
});