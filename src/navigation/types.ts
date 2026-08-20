export type Template = {
  id: number;
  name: string;
  type: string;
  image?: any;
  requiresPhotos?: boolean; 
  photoSlots?: number;  
  userPhotos?: string[];  
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Language: { isFirstLaunch?: boolean } | undefined;
  StartOptions: undefined;
  Theme: undefined;
  Settings: undefined;
  TemplatePreview: { template: Template };
  PlannerDetail: { template: Template; savedId?: string };
  CalendarNote: { dateKey: string; dateLabel: string };
  LayoutDaysOrder: undefined;
  LineType: undefined;
  Favorites: undefined;
  FontFamily: undefined;
  // Language: undefined;
  MoodHome: undefined;
  MoodCalendar: undefined;
  Mood: { dateKey: string; dateLabel: string };
};

export type TabParamList = {
  Library: undefined;
  CreateNew: undefined;
  Calendar: undefined;
  Templates: undefined;
  Vault: undefined;
  Settings: undefined;
};