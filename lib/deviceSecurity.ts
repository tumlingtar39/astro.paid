/**
 * Client-Side Secure Device Fingerprinting & Persistent Binding Utility
 * Generates high-entropy cryptographic device tokens + persistent storage sync + hardware characteristics.
 */

export interface DeviceMetadata {
  deviceId: string;
  deviceSecret: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  timezone: string;
  hardwareConcurrency: number;
  canvasHash?: string;
  createdAt: string;
}

const STORAGE_DEVICE_ID_KEY = '__jyotish_trusted_device_id__';
const STORAGE_DEVICE_SECRET_KEY = '__jyotish_device_secret__';
const STORAGE_DEVICE_META_KEY = '__jyotish_device_meta__';
const STORAGE_ACTIVE_LICENSE_KEY = '__jyotish_active_license_key__';
const STORAGE_AUTHORIZED_KEYS_LIST = '__jyotish_device_authorized_keys__';

/**
 * Generate a cryptographically strong random token
 */
function generateCryptoToken(prefix = 'dev'): string {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(24);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return `${prefix}_${hex}`;
    }
  } catch (_e) {
    // Fallback if crypto is unavailable
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
}

/**
 * Simple hash generator for deterministic canvas signature
 */
function getCanvasSignature(): string {
  try {
    if (typeof document === 'undefined') return 'server';
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no_ctx';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = '#f60';
    ctx.fillRect(10, 5, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('JyotishSecureDevID', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('JyotishSecureDevID', 4, 17);

    const dataUrl = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
      hash |= 0;
    }
    return `cv_${Math.abs(hash).toString(36)}`;
  } catch (_e) {
    return 'cv_fallback';
  }
}

/**
 * Get or initialize persistent Device ID and Device Secret
 */
export function getOrCreateDeviceId(): { deviceId: string; deviceSecret: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'server_env', deviceSecret: 'server_secret' };
  }

  let deviceId = '';
  let deviceSecret = '';

  // 1. Try reading from localStorage
  try {
    deviceId = localStorage.getItem(STORAGE_DEVICE_ID_KEY) || '';
    deviceSecret = localStorage.getItem(STORAGE_DEVICE_SECRET_KEY) || '';
  } catch (_e) {}

  // 2. Try reading from sessionStorage if localStorage was cleared in this tab session
  if (!deviceId) {
    try {
      deviceId = sessionStorage.getItem(STORAGE_DEVICE_ID_KEY) || '';
      deviceSecret = sessionStorage.getItem(STORAGE_DEVICE_SECRET_KEY) || '';
    } catch (_e) {}
  }

  // 3. If still empty, generate a brand new permanent device ID + secret
  if (!deviceId) {
    deviceId = generateCryptoToken('dev');
    deviceSecret = generateCryptoToken('sec');

    try {
      localStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId);
      localStorage.setItem(STORAGE_DEVICE_SECRET_KEY, deviceSecret);
      sessionStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId);
      sessionStorage.setItem(STORAGE_DEVICE_SECRET_KEY, deviceSecret);
    } catch (_e) {}
  } else {
    // Ensure both storages are synchronized
    try {
      if (!deviceSecret) {
        deviceSecret = generateCryptoToken('sec');
        localStorage.setItem(STORAGE_DEVICE_SECRET_KEY, deviceSecret);
      }
      sessionStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId);
      sessionStorage.setItem(STORAGE_DEVICE_SECRET_KEY, deviceSecret);
    } catch (_e) {}
  }

  return { deviceId, deviceSecret };
}

/**
 * Collect comprehensive device metadata for authorization and admin inspection
 */
export function getDeviceMetadata(): DeviceMetadata {
  const { deviceId, deviceSecret } = getOrCreateDeviceId();
  
  if (typeof window === 'undefined') {
    return {
      deviceId,
      deviceSecret,
      platform: 'server',
      userAgent: 'server',
      screenResolution: '0x0',
      language: 'ne',
      timezone: 'Asia/Kathmandu',
      hardwareConcurrency: 4,
      createdAt: new Date().toISOString(),
    };
  }

  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0} (${window.devicePixelRatio || 1}dpr)`;
  const tz = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || 'Asia/Kathmandu';
  const canvasHash = getCanvasSignature();

  return {
    deviceId,
    deviceSecret,
    platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown',
    userAgent: navigator.userAgent || 'Unknown',
    screenResolution: screenRes,
    language: navigator.language || 'ne-NP',
    timezone: tz,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    canvasHash,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Active license management helpers in persistent storage.
 * Supports multiple purchased keys on the same device so clicking ANY link works!
 */
export function getStoredLicenseKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLocal = localStorage.getItem(STORAGE_ACTIVE_LICENSE_KEY);
    if (fromLocal && fromLocal.trim()) return fromLocal.trim().toUpperCase();
    const fromSession = sessionStorage.getItem(STORAGE_ACTIVE_LICENSE_KEY);
    if (fromSession && fromSession.trim()) return fromSession.trim().toUpperCase();

    // Cookie fallback
    if (typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)__jyotish_active_key=([^;]+)/);
      if (match && match[1]) {
        const keyFromCookie = decodeURIComponent(match[1]).trim().toUpperCase();
        if (keyFromCookie) {
          localStorage.setItem(STORAGE_ACTIVE_LICENSE_KEY, keyFromCookie);
          return keyFromCookie;
        }
      }
    }
  } catch (_e) {}
  
  // Fallback: check device authorized keys list if active key was not directly set
  const allKeys = getStoredLicenseKeysList();
  if (allKeys.length > 0) {
    return allKeys[0];
  }

  return null;
}

/**
 * Get all license keys ever registered/used on this device
 */
export function getStoredLicenseKeysList(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_AUTHORIZED_KEYS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((k) => typeof k === 'string' && k.trim().length > 0)
          .map((k) => k.trim().toUpperCase());
      }
    }
  } catch (_e) {}
  return [];
}

/**
 * Add a key to the device's list of authorized keys and set it active
 */
export function addStoredLicenseKey(licenseKey: string): void {
  if (typeof window === 'undefined') return;
  const cleanKey = licenseKey.trim().toUpperCase();
  if (!cleanKey) return;

  try {
    // 1. Update active key in localStorage & sessionStorage
    localStorage.setItem(STORAGE_ACTIVE_LICENSE_KEY, cleanKey);
    sessionStorage.setItem(STORAGE_ACTIVE_LICENSE_KEY, cleanKey);

    // 2. Write to persistent cookie (10 years)
    if (typeof document !== 'undefined') {
      document.cookie = `__jyotish_active_key=${encodeURIComponent(cleanKey)}; max-age=315360000; path=/; SameSite=Lax`;
    }

    // 3. Add to device's list of registered keys without duplicates
    const currentList = getStoredLicenseKeysList();
    const updated = [cleanKey, ...currentList.filter((k) => k !== cleanKey)];
    localStorage.setItem(STORAGE_AUTHORIZED_KEYS_LIST, JSON.stringify(updated));
  } catch (_e) {}
}

export function setStoredLicenseKey(licenseKey: string): void {
  addStoredLicenseKey(licenseKey);
}

/**
 * Remove a single key from this device
 */
export function removeStoredLicenseKey(licenseKey: string): void {
  if (typeof window === 'undefined') return;
  const cleanKey = licenseKey.trim().toUpperCase();
  try {
    const currentList = getStoredLicenseKeysList();
    const updated = currentList.filter((k) => k !== cleanKey);
    localStorage.setItem(STORAGE_AUTHORIZED_KEYS_LIST, JSON.stringify(updated));

    const active = getStoredLicenseKey();
    if (active === cleanKey) {
      if (updated.length > 0) {
        localStorage.setItem(STORAGE_ACTIVE_LICENSE_KEY, updated[0]);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_LICENSE_KEY);
        sessionStorage.removeItem(STORAGE_ACTIVE_LICENSE_KEY);
      }
    }
  } catch (_e) {}
}

export function clearStoredLicenseKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_ACTIVE_LICENSE_KEY);
    sessionStorage.removeItem(STORAGE_ACTIVE_LICENSE_KEY);
    localStorage.removeItem(STORAGE_AUTHORIZED_KEYS_LIST);
  } catch (_e) {}
}

/**
 * Extract license key from URL if present
 * Supports:
 * - ?key=ABC123
 * - ?license=ABC123
 * - ?access=ABC123
 * - ?k=ABC123
 * - ?link=ABC123
 * - /access/:licenseKey or /license/:licenseKey or /key/:licenseKey
 * - #/access/ABC123 or #/?key=ABC123
 */
export function extractLicenseKeyFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const href = window.location.href;

    // 1. Direct SearchParams check
    const url = new URL(href);
    const candidateParams = ['key', 'license', 'access', 'k', 'l', 'auth', 'link', 'id'];
    for (const p of candidateParams) {
      const val = url.searchParams.get(p);
      if (val && val.trim().length > 2) {
        return val.trim().toUpperCase();
      }
    }

    // 2. Hash SearchParams check (e.g. #/?key=ABC or #?key=ABC)
    if (window.location.hash) {
      const hash = window.location.hash;
      const hashQuestionIdx = hash.indexOf('?');
      if (hashQuestionIdx !== -1) {
        const hashParams = new URLSearchParams(hash.substring(hashQuestionIdx));
        for (const p of candidateParams) {
          const val = hashParams.get(p);
          if (val && val.trim().length > 2) {
            return val.trim().toUpperCase();
          }
        }
      }

      // Hash route (/access/KEY or /key/KEY or #/KEY)
      const hashRouteMatch = hash.match(/#(?:(?:\/)?(?:access|license|key))?\/([a-zA-Z0-9_-]{3,})/i);
      if (hashRouteMatch && hashRouteMatch[1]) {
        return hashRouteMatch[1].trim().toUpperCase();
      }
    }

    // 3. Path match (/access/KEY or /license/KEY or /key/KEY)
    const pathname = window.location.pathname;
    const accessMatch = pathname.match(/\/(?:access|license|key)\/([a-zA-Z0-9_-]{3,})/i);
    if (accessMatch && accessMatch[1]) {
      return accessMatch[1].trim().toUpperCase();
    }

    // 4. Fallback Full URL Regex for safety
    const fallbackRegex = /[?&#](?:key|license|access|k|link)=([a-zA-Z0-9_-]{3,})/i;
    const fallbackMatch = href.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim().toUpperCase();
    }
  } catch (_e) {}

  return null;
}
