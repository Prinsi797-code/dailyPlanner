// src/storage/moodStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_STORAGE_KEY = '@planwiz_moods';

export interface MoodEntry {
  date: string;  
  moodId: string;
}

export async function getAllMoods(): Promise<MoodEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load moods', e);
    return [];
  }
}

export async function getMoodForDate(dateKey: string): Promise<MoodEntry | null> {
  const all = await getAllMoods();
  return all.find(m => m.date === dateKey) ?? null;
}

export async function saveMoodForDate(dateKey: string, moodId: string): Promise<void> {
  const all = await getAllMoods();
  const filtered = all.filter(m => m.date !== dateKey);
  filtered.push({ date: dateKey, moodId });
  await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(filtered));
}