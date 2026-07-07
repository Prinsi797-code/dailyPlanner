import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';

type Props = StackScreenProps<RootStackParamList, 'TemplatePreview'>;

export default function TemplatePreviewScreen({ navigation, route }: Props) {
  const { template } = route.params;
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: colors.text }}>‹</Text>
        </TouchableOpacity>

        <View style={styles.topRight}>
          <View style={[styles.proBadge, { borderColor: colors.primary }]}>
            <Text style={{ fontSize: 12 }}>💎</Text>
            <Text style={[styles.proText, { color: colors.primary }]}>PRO</Text>
          </View>
          <TouchableOpacity style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>♡</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          Comprehensive Daily Productivity and Wellness Planner
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Plan your day with clarity using this all-in-one daily planner. Track tasks, schedules, meals, water goals, expenses, notes, and balance easily every day.
        </Text>

        {/* Mini visual preview card */}
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.previewHeading, { color: colors.text }]}>{template.name}</Text>

          <View style={styles.previewGrid}>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>TOP PRIORITIES</Text>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
            </View>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>TO-DO LIST</Text>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
            </View>
          </View>

          <View style={styles.previewGrid}>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>SCHEDULE</Text>
              <View style={styles.previewLine} />
              <View style={styles.previewLine} />
            </View>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>WATER TRACKER</Text>
              <Text style={{ fontSize: 12 }}>💧 💧 💧 💧 💧</Text>
            </View>
          </View>

          <View style={styles.previewGrid}>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>NOTES</Text>
              <View style={styles.previewLine} />
            </View>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>MOOD</Text>
              <Text style={{ fontSize: 14 }}>🙂 😐 😴</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('PlannerDetail', { template })}
        >
          <Text style={styles.ctaText}>Start Using This  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  proText: { fontSize: 11, fontWeight: '700' },

  scrollContent: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 10 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 24 },

  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  previewHeading: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  previewGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  previewBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  previewLabel: { fontSize: 9, fontWeight: '700', color: '#888', marginBottom: 2 },
  previewLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.15)', marginVertical: 3 },

  ctaWrap: { padding: 16 },
  ctaBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});