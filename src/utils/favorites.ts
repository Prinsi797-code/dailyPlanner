import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@planwiz_favorites";

export async function getFavorites(): Promise<any[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load favorites", e);
    return [];
  }
}

export async function isTemplateFavorite(templateId: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some((t) => t.id === templateId);
}

// returns the new favorite state (true = ab favorite hai, false = hata diya)
export async function toggleFavorite(template: any): Promise<boolean> {
  const favs = await getFavorites();
  const exists = favs.some((t) => t.id === template.id);
  const updated = exists
    ? favs.filter((t) => t.id !== template.id)
    : [...favs, template];

  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return !exists;
}