export type Template = {
  id: number;
  name: string;
  type: string;
  image?: any;
};

export type RootStackParamList = {
  MainTabs: undefined;
  StartOptions: undefined;
  TemplatePreview: { template: Template };
  PlannerDetail: { template: Template; savedId?: string };
  CalendarNote: { dateKey: string; dateLabel: string };
};

export type TabParamList = {
  Library: undefined;
  CreateNew: undefined;
  Calendar: undefined;
  Templates: undefined;
  Vault: undefined;
  Settings: undefined;
};