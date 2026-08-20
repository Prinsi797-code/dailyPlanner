import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'template_photos_';

export const saveTemplatePhotos = async (templateId: number, photos: string[]) => {
  await AsyncStorage.setItem(`${KEY_PREFIX}${templateId}`, JSON.stringify(photos));
};

export const getTemplatePhotos = async (templateId: number): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${templateId}`);
  return raw ? JSON.parse(raw) : [];
};