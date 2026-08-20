import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';

type Props = StackScreenProps<RootStackParamList, 'StartOptions'>;

type Option = {
  id: number;
  title: string;
  desc: string;
  icon: string;
  goTemplates?: boolean;
};

const options: Option[] = [
  {
    id: 1,
    title: 'Start with a Blank Page',
    desc: 'One blank page for notes, lists, and daily plans.',
    icon: '📄',
  },
  {
    id: 2,
    title: 'Start with a Book',
    desc: 'For writing, planning, and capturing moments as your days unfold.',
    icon: '📔',
  },
  {
    id: 3,
    title: 'Ready-to-Use',
    desc: 'Begin quickly, write things down, add notes, and move forward.',
    icon: '📋',
    goTemplates: true,
  },
  {
    id: 4,
    title: 'Import PDF',
    desc: 'Bring your PDF and keep writing, noting, and shaping it further.',
    icon: '📑',
  },
];

export default function StartOptionsScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {options.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() => {
            if (item.goTemplates) {
              navigation.navigate('MainTabs', { screen: 'Templates' } as any);
            }
          }}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          <View style={styles.textWrap}>
            <AppText style={[styles.title, { color: colors.text }]}>{item.title}</AppText>
            <AppText style={[styles.desc, { color: colors.subText }]} numberOfLines={2}>
              {item.desc}
            </AppText>
          </View>

          <View style={[styles.arrowBox, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.arrow, { color: colors.primary }]}>→</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: { fontSize: 24 },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 12, lineHeight: 16 },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrow: { fontSize: 16, fontWeight: '700' },
});