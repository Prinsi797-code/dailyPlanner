import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import SectionRenderer from '../templates/SectionRenderer';
import { adaptDesignForTheme } from '../utils/themeColorAdapter';
import { useTheme } from '../theme/ThemeContext';
import { SavedPlanner } from '../storage/plannerStorage';
import AppText from '../components/AppText';

export default function PlannerSnapshot({ planner }: { planner: SavedPlanner }) {
  const { isDark } = useTheme();

  const rawDesign = TEMPLATE_DESIGNS[planner.templateId] || DEFAULT_DESIGN;
  const design = adaptDesignForTheme(rawDesign, isDark);
  const isScript = design.headerStyle === 'script';
  const sheetBg = design.sheetBg || '#FFFFFF';

  const bgImages =
    design.backgroundImages && design.backgroundImages.length > 0
      ? design.backgroundImages
      : design.backgroundImage
      ? [design.backgroundImage]
      : [];
  const activeBg =
    bgImages[(planner as any).backgroundIndex ?? 0] ?? bgImages[0];

  const content = (
    <>
      {!design.hideHeader && (
        <View style={styles.headerBand}>
          <AppText
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
          </AppText>
          <View style={styles.dateRow}>
            <AppText style={[styles.label, { color: design.headerColor + 'AA' }]}>
              Date:
            </AppText>
            <AppText
              style={[
                styles.dateValue,
                {
                  color: design.headerColor,
                  borderColor: design.accentColor + '80',
                },
              ]}
            >
              {planner.date || ''}
            </AppText>
          </View>
        </View>
      )}

      <View
        style={[styles.sectionsWrap, design.hideHeader && { paddingTop: 28 }]}
      >
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
    </>
  );

  if (activeBg) {
    return (
      <ImageBackground
        source={activeBg}
        resizeMode="cover"
        style={styles.sheet}
        imageStyle={{ borderRadius: 14 }}
      >
        {content}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.sheet, { backgroundColor: sheetBg }]}>{content}</View>
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