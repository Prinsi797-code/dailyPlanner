// src/iap/iapConfig.ts
export const SUBSCRIPTION_SKUS = [
  "com.hevin.planner.weekly",
  "com.hevin.planner.monthly",
  "com.hevin.planner.yearly",
] as const;

export type SkuId = (typeof SUBSCRIPTION_SKUS)[number];