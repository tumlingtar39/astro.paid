/**
 * Jyotish Software Free Trial Service
 * Manages Free Trial mode allowing customers to enter up to 3 Birth details / Kundali
 * and use ALL features (17 Kundali charts, Traditional Cheena, Yearly Phalit, etc.) up to 3 times.
 *
 * Device-Locked Permanent Exhaustion:
 * Once 3 birth details/calculations are completed on a device, the device is permanently locked
 * from free usage across localStorage, sessionStorage, persistent 10-year cookies, and IndexedDB
 * so it can NEVER be reused freely without an authorized license key / membership.
 */

export interface TrialState {
  active: boolean;
  usedCount: number;
  maxCount: number;
  remaining: number;
  exhausted: boolean;
  generatedKundalis: string[];
  usedFeatures: string[];
  startedAt: string | null;
  permanentlyLocked?: boolean;
}

const STORAGE_TRIAL_KEY = '__jyotish_free_trial_state__';
const STORAGE_DEVICE_EXHAUSTED_LOCK = '__jyotish_device_trial_exhausted_permanently__';
const COOKIE_DEVICE_EXHAUSTED_LOCK = '__jyotish_dev_trial_locked__';
export const FREE_TRIAL_MAX_CHINA = 3;

/**
 * Check if this device has ever exhausted free trial in any storage layer
 */
function isDevicePermanentlyExhausted(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Check localStorage
    if (localStorage.getItem(STORAGE_DEVICE_EXHAUSTED_LOCK) === 'LOCKED_FOREVER') {
      return true;
    }
    // 2. Check sessionStorage
    if (sessionStorage.getItem(STORAGE_DEVICE_EXHAUSTED_LOCK) === 'LOCKED_FOREVER') {
      return true;
    }
    // 3. Check persistent cookie
    if (typeof document !== 'undefined' && document.cookie) {
      if (document.cookie.includes(`${COOKIE_DEVICE_EXHAUSTED_LOCK}=LOCKED_FOREVER`)) {
        // re-sync to localStorage
        try {
          localStorage.setItem(STORAGE_DEVICE_EXHAUSTED_LOCK, 'LOCKED_FOREVER');
        } catch (_e) {}
        return true;
      }
    }
  } catch (_e) {}

  return false;
}

/**
 * Mark device as permanently exhausted across all browser storage layers
 */
function markDevicePermanentlyExhausted(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_DEVICE_EXHAUSTED_LOCK, 'LOCKED_FOREVER');
    sessionStorage.setItem(STORAGE_DEVICE_EXHAUSTED_LOCK, 'LOCKED_FOREVER');

    // 10-year persistent cookie to prevent simple local storage clears
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_DEVICE_EXHAUSTED_LOCK}=LOCKED_FOREVER; max-age=315360000; path=/; SameSite=Lax`;
    }
  } catch (_e) {}
}

/**
 * Read current Free Trial state from persistent storage
 */
export function getTrialState(): TrialState {
  if (typeof window === 'undefined') {
    return {
      active: true,
      usedCount: 0,
      maxCount: FREE_TRIAL_MAX_CHINA,
      remaining: FREE_TRIAL_MAX_CHINA,
      exhausted: false,
      generatedKundalis: [],
      usedFeatures: [],
      startedAt: null,
      permanentlyLocked: false,
    };
  }

  const isPermanentlyLocked = isDevicePermanentlyExhausted();

  try {
    const raw = localStorage.getItem(STORAGE_TRIAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const generated = Array.isArray(parsed?.generatedKundalis) ? parsed.generatedKundalis : [];
      const features = Array.isArray(parsed?.usedFeatures) ? parsed.usedFeatures : [];
      const rawCount = Number(parsed?.usedCount);
      
      let used = Math.min(
        FREE_TRIAL_MAX_CHINA,
        Math.max(generated.length, isNaN(rawCount) ? 0 : rawCount)
      );

      if (isPermanentlyLocked || used >= FREE_TRIAL_MAX_CHINA) {
        used = FREE_TRIAL_MAX_CHINA;
        markDevicePermanentlyExhausted();
      }

      const remaining = Math.max(0, FREE_TRIAL_MAX_CHINA - used);
      const exhausted = used >= FREE_TRIAL_MAX_CHINA || isPermanentlyLocked;

      return {
        active: !exhausted,
        usedCount: used,
        maxCount: FREE_TRIAL_MAX_CHINA,
        remaining,
        exhausted,
        generatedKundalis: generated,
        usedFeatures: features,
        startedAt: parsed?.startedAt || null,
        permanentlyLocked: exhausted,
      };
    }
  } catch (_e) {}

  if (isPermanentlyLocked) {
    return {
      active: false,
      usedCount: FREE_TRIAL_MAX_CHINA,
      maxCount: FREE_TRIAL_MAX_CHINA,
      remaining: 0,
      exhausted: true,
      generatedKundalis: [],
      usedFeatures: [],
      startedAt: null,
      permanentlyLocked: true,
    };
  }

  return {
    active: true,
    usedCount: 0,
    maxCount: FREE_TRIAL_MAX_CHINA,
    remaining: FREE_TRIAL_MAX_CHINA,
    exhausted: false,
    generatedKundalis: [],
    usedFeatures: [],
    startedAt: null,
    permanentlyLocked: false,
  };
}

/**
 * Start or activate Free Trial on this device
 */
export function startFreeTrial(): TrialState {
  const current = getTrialState();
  if (current.exhausted) {
    return current;
  }

  const newState: TrialState = {
    ...current,
    active: true,
    startedAt: current.startedAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_TRIAL_KEY, JSON.stringify(newState));
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('jyotish_trial_updated', { detail: newState }));
  }

  return newState;
}

/**
 * Check if device is currently running in Free Trial mode
 */
export function isFreeTrialActive(): boolean {
  return getTrialState().active && !getTrialState().exhausted;
}

/**
 * Check if free trial limit is exhausted
 */
export function isFreeTrialExhausted(): boolean {
  return getTrialState().exhausted;
}

/**
 * Record a Kundali / Birth Detail calculation under Free Trial.
 * Each unique birth detail entered counts toward the 3-generation limit.
 * Returns whether calculation is allowed and updated remaining count.
 */
export function recordTrialChinaGeneration(kundaliIdentifier: string): {
  allowed: boolean;
  usedCount: number;
  remaining: number;
  exhausted: boolean;
  messageNe: string;
  messageEn: string;
} {
  const state = getTrialState();
  const cleanId = (kundaliIdentifier || '').trim().toLowerCase();

  // If already locked permanently or 3 uses exhausted:
  if (state.exhausted || state.usedCount >= FREE_TRIAL_MAX_CHINA) {
    markDevicePermanentlyExhausted();
    return {
      allowed: false,
      usedCount: FREE_TRIAL_MAX_CHINA,
      remaining: 0,
      exhausted: true,
      messageNe: 'यस उपकरणमा ३ पटक सम्मको निःशुल्क परीक्षण (Free Trial) पूरा भइसकेको छ। थप जन्म विवरण र सम्पूर्ण सेवा प्रयोग गर्न कृपया सदस्यता योजना लिनुहोस्।',
      messageEn: 'All 3 Free Trial attempts have been used on this device. Please activate a membership to continue.',
    };
  }

  // If this exact birth detail was already calculated in current trial list, allow without deducting extra count
  if (cleanId && state.generatedKundalis.includes(cleanId)) {
    return {
      allowed: true,
      usedCount: state.usedCount,
      remaining: state.remaining,
      exhausted: state.exhausted,
      messageNe: `फ्री ट्रायल: ३ मध्ये ${state.remaining} पटक बाँकी।`,
      messageEn: `Free Trial: ${state.remaining} of ${state.maxCount} uses remaining.`,
    };
  }

  // Calculate new count
  const updatedGenerated = cleanId ? [...state.generatedKundalis, cleanId] : state.generatedKundalis;
  const newUsed = Math.min(FREE_TRIAL_MAX_CHINA, Math.max(state.usedCount + 1, updatedGenerated.length));
  const newRemaining = Math.max(0, FREE_TRIAL_MAX_CHINA - newUsed);
  const newExhausted = newUsed >= FREE_TRIAL_MAX_CHINA;

  if (newExhausted) {
    markDevicePermanentlyExhausted();
  }

  const updatedState: TrialState = {
    ...state,
    active: !newExhausted,
    usedCount: newUsed,
    remaining: newRemaining,
    exhausted: newExhausted,
    generatedKundalis: updatedGenerated,
    startedAt: state.startedAt || new Date().toISOString(),
    permanentlyLocked: newExhausted,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_TRIAL_KEY, JSON.stringify(updatedState));
    } catch (_e) {}
    window.dispatchEvent(new CustomEvent('jyotish_trial_updated', { detail: updatedState }));
  }

  return {
    allowed: true,
    usedCount: newUsed,
    remaining: newRemaining,
    exhausted: newExhausted,
    messageNe: newRemaining > 0 
      ? `जन्म विवरण सफलतापूर्वक स्वीकार भयो! (फ्री ट्रायल: ३ मध्ये ${newRemaining} पटक बाँकी)`
      : `तपाईंको ३ वटा जन्म विवरणको निःशुल्क परीक्षण पूरा भयो। अब थप प्रयोग गर्न सदस्यता आवश्यक हुनेछ।`,
    messageEn: newRemaining > 0
      ? `Birth details accepted! (Free Trial: ${newRemaining} of ${FREE_TRIAL_MAX_CHINA} uses remaining)`
      : `You have completed all 3 Free Trial birth details. Membership is required for further use.`,
  };
}

/**
 * Record generic feature usage under free trial
 */
export function recordTrialFeatureUse(featureName: string, identifier?: string): {
  allowed: boolean;
  usedCount: number;
  remaining: number;
  exhausted: boolean;
  messageNe: string;
  messageEn: string;
} {
  return recordTrialChinaGeneration(identifier || featureName);
}

/**
 * Clear Free Trial mode (used when user activates a valid paid license key)
 */
export function clearFreeTrial(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_TRIAL_KEY);
      window.dispatchEvent(new CustomEvent('jyotish_trial_updated', { detail: null }));
    } catch (_e) {}
  }
}
