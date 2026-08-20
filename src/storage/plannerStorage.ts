import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedPlanner = {
  id: string;
  templateId: number;
  templateName: string;
  date: string;
  values: Record<string, string[]>;
  backgroundIndex?: number; 
  hideTitle?: boolean;
  updatedAt: number;
};

const STORAGE_KEY = '@saved_planners';

export async function getAllPlanners(): Promise<SavedPlanner[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPlannerById(id: string): Promise<SavedPlanner | null> {
  const all = await getAllPlanners();
  return all.find((p) => p.id === id) || null;
}

export async function savePlanner(planner: SavedPlanner): Promise<void> {
  const all = await getAllPlanners();
  const index = all.findIndex((p) => p.id === planner.id);
  if (index >= 0) {
    all[index] = planner;
  } else {
    all.unshift(planner);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export async function deletePlanner(id: string): Promise<void> {
  const all = await getAllPlanners();
  const filtered = all.filter((p) => p.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function generateId(): string {
  return `planner_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}