// src/ads/adConfig.ts

/**
 * Flag meaning (SAME for interstitial + app_open):
 *   0 -> Don't show ads at all
 *   1 -> Show ONLY once in the app's lifetime
 *   2 -> Show ONLY once per day (resets every calendar day)
 *   3 -> Show every time (every eligible trigger)
 *
 * Flag meaning for NATIVE + BANNER:
 *   0 -> Don't show
 *   1 -> Show
 */
export type InterFrequency = 0 | 1 | 2 | 3;
export type SimpleFlag = 0 | 1;

export interface InterAdConfig {
  flagKey: string;
  idKey: string;
}

export interface SimpleAdConfig {
  flagKey: string;
  idKey: string;
}

/**
 * One entry per screen, matching your Firebase Remote Config console.
 * Add / remove screens here — nothing else needs to change.
 */
export const AD_SCREENS = {
  calendar_screen: {
    inter: { flagKey: "calendar_inter_flag", idKey: "calendar_inter_id" } as InterAdConfig,
  },
  favorite_screen: {
    banner: { flagKey: "favorite_baner_flag", idKey: "favorite_baner_id" } as SimpleAdConfig,
    inter: { flagKey: "favorite_inter_flag", idKey: "favorite_inter_id" } as InterAdConfig,
  },
  font_screen: {
    inter: { flagKey: "font_inter_flag", idKey: "font_inter_id" } as InterAdConfig,
    native: { flagKey: "font_native_flag", idKey: "font_native_id" } as SimpleAdConfig,
  },
  language_screen: {
    inter: { flagKey: "language_inter_flag", idKey: "language_inter_id" } as InterAdConfig,
    native: { flagKey: "language_native_flag", idKey: "language_native_id" } as SimpleAdConfig,
  },
  layout_screen: {
    inter: { flagKey: "layout_inter_flag", idKey: "layout_inter_id" } as InterAdConfig,
    native: { flagKey: "layout_native_flag", idKey: "layout_native_id" } as SimpleAdConfig,
  },
  linetype_screen: {
    inter: { flagKey: "line_inter_flag", idKey: "line_inter_id" } as InterAdConfig,
    native: { flagKey: "line_native_flag", idKey: "line_native_id" } as SimpleAdConfig,
  },
  main_screen: {
    appOpen: { flagKey: "app_open_flag", idKey: "app_open_id" } as InterAdConfig,
    banner: { flagKey: "main_baner_flag", idKey: "main_baner_id" } as SimpleAdConfig,
  },
  templete_screen: {
    inter: { flagKey: "inter_flag", idKey: "inter_id" } as InterAdConfig,
  },
  theme_screen: {
    inter: { flagKey: "theme_inter_flag", idKey: "theme_inter_id" } as InterAdConfig,
    native: { flagKey: "theme_native_flag", idKey: "theme_native_id" } as SimpleAdConfig,
  },
} as const;

export type AdScreenKey = keyof typeof AD_SCREENS;

export const INTER_COOLDOWN_MS = 10_000; // 10 seconds