// src/ads/AdManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRemoteConfig, getValue } from "@react-native-firebase/remote-config";
import {
  InterstitialAd,
  AdEventType,
  AppOpenAd,
} from "react-native-google-mobile-ads";
import { INTER_COOLDOWN_MS, InterFrequency } from "./adConfig";

const STORAGE_PREFIX = "@ads:";
const LAST_INTER_CLOSE_KEY = `${STORAGE_PREFIX}last_inter_close_at`;

// ---------------------------------------------------------------------------
// Remote Config helpers (modular API — @react-native-firebase v22+)
// ---------------------------------------------------------------------------

const rc = getRemoteConfig();

export function getFlag(key: string): number {
  return getValue(rc, key).asNumber();
}

export function getAdUnitId(key: string): string {
  return getValue(rc, key).asString();
}

// ---------------------------------------------------------------------------
// Storage helpers (per-key "has shown once" / "last shown date")
// ---------------------------------------------------------------------------

async function getShownOnceFlag(key: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(`${STORAGE_PREFIX}once:${key}`);
  return v === "1";
}

async function setShownOnceFlag(key: string): Promise<void> {
  await AsyncStorage.setItem(`${STORAGE_PREFIX}once:${key}`, "1");
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function getLastShownDay(key: string): Promise<string | null> {
  return AsyncStorage.getItem(`${STORAGE_PREFIX}day:${key}`);
}

async function setLastShownDay(key: string): Promise<void> {
  await AsyncStorage.setItem(`${STORAGE_PREFIX}day:${key}`, todayString());
}

// ---------------------------------------------------------------------------
// Global 10s cooldown between interstitial / app-open ads
// ---------------------------------------------------------------------------

async function isCooldownActive(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(LAST_INTER_CLOSE_KEY);
  if (!raw) return false;
  const lastClose = parseInt(raw, 10);
  return Date.now() - lastClose < INTER_COOLDOWN_MS;
}

async function markInterClosedNow(): Promise<void> {
  await AsyncStorage.setItem(LAST_INTER_CLOSE_KEY, String(Date.now()));
}

// ---------------------------------------------------------------------------
// Eligibility check for interstitial / app-open (flag 0/1/2/3)
// ---------------------------------------------------------------------------

/**
 * Decides whether an inter/app-open ad is allowed to show RIGHT NOW,
 * based on remote-config flag + storage state + the global cooldown.
 * storageKey should be unique per placement, e.g. "calendar_inter" or "app_open".
 */
export async function isInterEligible(
  flag: InterFrequency,
  storageKey: string
): Promise<boolean> {
  if (flag === 0) return false;

  // Respect the 10s "no back-to-back inters" rule regardless of flag.
  if (await isCooldownActive()) return false;

  if (flag === 1) {
    const shown = await getShownOnceFlag(storageKey);
    return !shown;
  }

  if (flag === 2) {
    const lastDay = await getLastShownDay(storageKey);
    return lastDay !== todayString();
  }

  // flag === 3 -> always allowed (subject only to the cooldown above)
  return true;
}

/** Call this right after the ad is actually shown (impression), to record it. */
export async function recordInterShown(
  flag: InterFrequency,
  storageKey: string
): Promise<void> {
  if (flag === 1) await setShownOnceFlag(storageKey);
  if (flag === 2) await setLastShownDay(storageKey);
}

/** Call this when the ad is closed/dismissed, to start the 10s cooldown. */
export async function recordInterClosed(): Promise<void> {
  await markInterClosedNow();
}

// ---------------------------------------------------------------------------
// Simple flag check for native / banner ads (0/1 only)
// ---------------------------------------------------------------------------

export function isSimpleAdEnabled(flag: number): boolean {
  return flag === 1;
}

// ---------------------------------------------------------------------------
// High level: load + show an interstitial with the full flow wired in
// ---------------------------------------------------------------------------

interface ShowInterstitialOptions {
  adUnitId: string;
  flag: InterFrequency;
  storageKey: string;
  onClosed?: () => void;
  onFailed?: (error: unknown) => void;
}

/**
 * Loads and shows an interstitial ONLY if eligible (flag + 10s cooldown).
 * Wires up close/error events to update storage automatically, so callers
 * don't need to remember to call recordInterShown / recordInterClosed.
 */
export async function showInterstitialIfEligible({
  adUnitId,
  flag,
  storageKey,
  onClosed,
  onFailed,
}: ShowInterstitialOptions): Promise<boolean> {
  const eligible = await isInterEligible(flag, storageKey);
  if (!eligible || !adUnitId) return false;

  return new Promise((resolve) => {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId);

    const unsubLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        interstitial.show();
      }
    );

    const unsubClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      async () => {
        await recordInterShown(flag, storageKey);
        await recordInterClosed(); // starts the 10s cooldown
        unsubLoaded();
        unsubClosed();
        unsubError();
        onClosed?.();
        resolve(true);
      }
    );

    const unsubError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        unsubLoaded();
        unsubClosed();
        unsubError();
        onFailed?.(error);
        resolve(false);
      }
    );

    interstitial.load();
  });
}

// ---------------------------------------------------------------------------
// High level: App Open ad (same 0/1/2/3 logic, e.g. shown on app foreground)
// ---------------------------------------------------------------------------

interface ShowAppOpenOptions {
  adUnitId: string;
  flag: InterFrequency;
  onClosed?: () => void;
  onFailed?: (error: unknown) => void;
}

const APP_OPEN_STORAGE_KEY = "app_open";

export async function showAppOpenIfEligible({
  adUnitId,
  flag,
  onClosed,
  onFailed,
}: ShowAppOpenOptions): Promise<boolean> {
  const eligible = await isInterEligible(flag, APP_OPEN_STORAGE_KEY);
  if (!eligible || !adUnitId) return false;

  return new Promise((resolve) => {
    const appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

    const unsubLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      appOpenAd.show();
    });

    const unsubClosed = appOpenAd.addAdEventListener(
      AdEventType.CLOSED,
      async () => {
        await recordInterShown(flag, APP_OPEN_STORAGE_KEY);
        await recordInterClosed();
        unsubLoaded();
        unsubClosed();
        unsubError();
        onClosed?.();
        resolve(true);
      }
    );

    const unsubError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      onFailed?.(error);
      resolve(false);
    });

    appOpenAd.load();
  });
}