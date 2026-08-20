// src/components/MoodLineChart.tsx
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import AppText from './AppText';
import { Mood } from '../constants/moods';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export interface ChartPoint {
  label: string;
  mood: Mood | null;
}

const CHART_HEIGHT = 160;
const LABEL_HEIGHT = 22;
const POINT_GAP = 46;
const TOP_PADDING = 16;
const BOTTOM_PADDING = 16;

const SCREEN_WIDTH = Dimensions.get('window').width;
const EMPTY_WIDTH = SCREEN_WIDTH - 64;

function getY(score: number, minScore: number, maxScore: number) {
  const usable = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const ratio =
    maxScore === minScore ? 0.5 : (score - minScore) / (maxScore - minScore);
  return TOP_PADDING + (1 - ratio) * usable;
}

export default function MoodLineChart({
  points,
  containerWidth,
}: {
  points: ChartPoint[];
  containerWidth?: number;
}) {
  const { colors } = useTheme();
  const withMood = points.filter(p => p.mood);
  const { t } = useTranslation();

  if (withMood.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { height: CHART_HEIGHT, width: containerWidth ?? EMPTY_WIDTH },
        ]}
      >
        <AppText
          style={{ color: colors.subText, fontSize: 13, textAlign: 'center' }}
        >
          {t('settings.Nomooddatayet')}
        </AppText>
      </View>
    );
  }

  const scores = withMood.map(p => p.mood!.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  const chartWidth = points.length * POINT_GAP;

  return (
    <View style={{ width: chartWidth, height: CHART_HEIGHT + LABEL_HEIGHT }}>
      {/* connecting lines */}
      {points.map((p, i) => {
        if (i === points.length - 1 || !p.mood || !points[i + 1].mood)
          return null;
        const x1 = i * POINT_GAP + POINT_GAP / 2;
        const y1 = getY(p.mood.score, minScore, maxScore);
        const x2 = (i + 1) * POINT_GAP + POINT_GAP / 2;
        const y2 = getY(points[i + 1].mood!.score, minScore, maxScore);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`line-${i}`}
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: length,
              height: 2,
              backgroundColor: colors.primary,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left',
            }}
          />
        );
      })}

      {/* dots + labels */}
      {points.map((p, i) => {
        const x = i * POINT_GAP + POINT_GAP / 2;
        if (!p.mood) {
          return (
            <AppText
              key={`label-${i}`}
              style={[
                styles.xLabel,
                { left: x - 12, top: CHART_HEIGHT + 4, color: colors.subText },
              ]}
            >
              {p.label}
            </AppText>
          );
        }
        const y = getY(p.mood.score, minScore, maxScore);
        return (
          <React.Fragment key={`point-${i}`}>
            <View
              style={[
                styles.dot,
                {
                  left: x - 12,
                  top: y - 12,
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                },
              ]}
            >
              {p.mood.image ? (
                <Image
                  source={p.mood.image}
                  style={{ width: 18, height: 18 }}
                  resizeMode="contain"
                />
              ) : null}
            </View>
            <AppText
              key={`label-${i}`}
              style={[
                styles.xLabel,
                { left: x - 12, top: CHART_HEIGHT + 4, color: colors.subText },
              ]}
            >
              {p.label}
            </AppText>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabel: {
    position: 'absolute',
    width: 24,
    textAlign: 'center',
    fontSize: 10,
  },
});