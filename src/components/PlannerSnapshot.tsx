import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import SectionRenderer from '../templates/SectionRenderer';
import { adaptDesignForTheme } from '../utils/themeColorAdapter';
import { useTheme } from '../theme/ThemeContext';
import { SavedPlanner } from '../storage/plannerStorage';

export default function PlannerSnapshot({ planner }: { planner: SavedPlanner }) {
  const { isDark } = useTheme(); // 👈 yehi missing tha

  const rawDesign = TEMPLATE_DESIGNS[planner.templateId] || DEFAULT_DESIGN;
  const design = adaptDesignForTheme(rawDesign, isDark); // 👈 hardcoded false ki jagah actual theme
  const isScript = design.headerStyle === 'script';
  const sheetBg = design.sheetBg || '#FFFFFF';

  return (
    <View style={[styles.sheet, { backgroundColor: sheetBg }]}>
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
          {planner.templateName}
        </Text>
        <View style={styles.dateRow}>
          <Text style={[styles.label, { color: design.headerColor + 'AA' }]}>
            Date:
          </Text>
          <Text
            style={[
              styles.dateValue,
              {
                color: design.headerColor,
                borderColor: design.accentColor + '80',
              },
            ]}
          >
            {planner.date || ''}
          </Text>
        </View>
      </View>

      <View style={styles.sectionsWrap}>
        {design.sections.map((section: any, i: number) => (
          <SectionRenderer
            key={i}
            section={section}
            accentColor={design.accentColor}
            values={planner.values}
            onChange={() => {}}
            fieldKey={`section_${i}`}
            themeStyle={design.themeStyle}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { width: 380, borderRadius: 14 },
  headerBand: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 },
  heading: { marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 13, marginRight: 8 },
  dateValue: { flex: 1, borderBottomWidth: 1.5, fontSize: 13, paddingVertical: 4 },
  sectionsWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
});