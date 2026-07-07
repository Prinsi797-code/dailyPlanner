export type Template = {
  id: number;
  name: string;
  type: string;
};

export type RootStackParamList = {
  Library: undefined;
  StartOptions: undefined;
  Templates: undefined;
  PlannerDetail: { template: Template };
};