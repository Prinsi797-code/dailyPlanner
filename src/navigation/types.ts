export type Template = {
  id: number;
  name: string;
  type: string;
  image?: any;
};

export type RootStackParamList = {
  MainTabs: undefined;
  StartOptions: undefined;
  Theme: undefined;
  Settings: undefined;
  TemplatePreview: { template: Template };
  PlannerDetail: { template: Template; savedId?: string };
  CalendarNote: { dateKey: string; dateLabel: string };
  LayoutDaysOrder: undefined;
  LineType: undefined;
  Favorites: undefined;
};

export type TabParamList = {
  Library: undefined;
  CreateNew: undefined;
  Calendar: undefined;
  Templates: undefined;
  Vault: undefined;
  Settings: undefined;
};