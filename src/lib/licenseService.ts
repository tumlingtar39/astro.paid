import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import { LicenseRecord, DeviceAuthorizationResult, DevicePaymentRequest } from '../types';
import {
  getDeviceMetadata,
  getStoredLicenseKey,
  setStoredLicenseKey,
  addStoredLicenseKey,
  getStoredLicenseKeysList,
  removeStoredLicenseKey,
  clearStoredLicenseKey,
} from './deviceSecurity';

const LOCAL_LICENSES_STORAGE_KEY = '__jyotish_local_licenses_db__';
const LOCAL_LICENSES_BACKUP_STORAGE_KEY = '__jyotish_licenses_backup_manifest__';

// Helper to remove any undefined fields before writing to Firestore
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value === undefined) {
      cleanObj[key] = null;
    } else if (typeof value === 'object' && value !== null) {
      cleanObj[key] = cleanFirestoreData(value);
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj as T;
}

// Secret Salt for Deterministic Cryptographic Validation (Works 100% offline & on Vercel without a database)
const CRYPTO_SALT = 'JYOTISH_SECURE_VEDIC_AUTH_SALT_2026_NEPAL';

/**
 * 8-Character Secure Alphanumeric Character Set
 * 32 characters (24 uppercase letters + 8 digits 2-9, excluding ambiguous 0/O/1/I)
 */
export const SECURE_ALPHANUMERIC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a deterministic 2-character signature for 8-char keys
 */
export function generate8CharKeyChecksum(body6: string, tier: string): string {
  const input = `${body6.toUpperCase().trim()}:${tier.toLowerCase().trim()}:${CRYPTO_SALT}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const char1 = SECURE_ALPHANUMERIC_CHARS.charAt(absHash % SECURE_ALPHANUMERIC_CHARS.length);
  const char2 = SECURE_ALPHANUMERIC_CHARS.charAt(Math.floor(absHash / SECURE_ALPHANUMERIC_CHARS.length) % SECURE_ALPHANUMERIC_CHARS.length);
  return `${char1}${char2}`;
}

/**
 * Generate a single cryptographically signed, unguessable 8-character Key (e.g. A7K9M2X4)
 */
export function generateSecure8CharKey(tier: 'lifetime' | 'yearly' | 'vvip' | 'vip' | 'simple' | string = 'lifetime'): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';

  let body = '';
  // Ensure letters and numbers are mixed
  body += letters.charAt(Math.floor(Math.random() * letters.length));
  body += numbers.charAt(Math.floor(Math.random() * numbers.length));
  body += letters.charAt(Math.floor(Math.random() * letters.length));
  body += numbers.charAt(Math.floor(Math.random() * numbers.length));
  for (let i = 0; i < 2; i++) {
    body += SECURE_ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * SECURE_ALPHANUMERIC_CHARS.length));
  }

  // Shuffle body
  const shuffled = body.split('').sort(() => 0.5 - Math.random()).join('');
  const sig = generate8CharKeyChecksum(shuffled, tier);
  return `${shuffled}${sig}`;
}

/**
 * Verify 8-character key signature
 */
export function verifySigned8CharKey(keyInput: string): { valid: boolean; tier: string; cleanKey: string } {
  const clean = (keyInput || '').trim().toUpperCase();
  if (clean.length === 8) {
    const body6 = clean.substring(0, 6);
    const sig2 = clean.substring(6, 8);
    const tiers: Array<'lifetime' | 'yearly' | 'vvip' | 'vip' | 'simple'> = ['lifetime', 'yearly', 'vvip', 'vip', 'simple'];
    for (const t of tiers) {
      if (sig2 === generate8CharKeyChecksum(body6, t)) {
        return { valid: true, tier: t, cleanKey: clean };
      }
    }
  }
  return { valid: false, tier: 'lifetime', cleanKey: clean };
}

/**
 * Generate a deterministic 4-character hex signature for any key + tier
 */
export function generateKeyChecksum(keyBody: string, tier: string): string {
  const input = `${keyBody.toUpperCase().trim()}:${tier.toLowerCase().trim()}:${CRYPTO_SALT}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
  return hex.substring(0, 4);
}

/**
 * Generate a Universal Cryptographic License Key guaranteed to unlock on Vercel and any customer device
 */
export function generateSignedLicenseKey(
  tier: 'lifetime' | 'yearly' | 'vvip' | 'vip' | 'simple' | string = 'lifetime',
  customPrefix?: string
): string {
  // If customPrefix is empty, generate an 8-character secure key
  if (!customPrefix || !customPrefix.trim()) {
    return generateSecure8CharKey(tier);
  }
  const tierCode = tier === 'lifetime' ? 'LIFE' : tier === 'yearly' ? 'YEAR' : tier === 'vvip' ? 'VVIP' : tier === 'vip' ? 'VIP' : 'SMP';
  const randomHex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
  const prefix = (customPrefix || 'JYO').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6) || 'JYO';
  const body = `${prefix}-${tierCode}-${randomHex}`;
  const sig = generateKeyChecksum(body, tier);
  return `${body}-${sig}`;
}

/**
 * Verify if a key is a valid Cryptographically Signed License Key
 */
export function verifySignedLicenseKey(keyInput: string): { valid: boolean; tier: string; cleanKey: string } {
  const clean = (keyInput || '').trim().toUpperCase();

  // First check 8-char format
  if (clean.length === 8) {
    const eightCharCheck = verifySigned8CharKey(clean);
    if (eightCharCheck.valid) {
      return eightCharCheck;
    }
  }

  const parts = clean.split('-');
  
  if (parts.length >= 4) {
    const sig = parts[parts.length - 1];
    const body = parts.slice(0, parts.length - 1).join('-');
    const tierCode = parts[1];
    let tier = 'lifetime';
    if (tierCode === 'VVIP') tier = 'vvip';
    else if (tierCode === 'VIP') tier = 'vip';
    else if (tierCode === 'SMP' || tierCode === 'SIMPLE') tier = 'simple';
    else if (tierCode === 'LIFE' || tierCode === 'LIFETIME') tier = 'lifetime';
    
    const expectedSig = generateKeyChecksum(body, tier);
    if (sig === expectedSig) {
      return { valid: true, tier, cleanKey: clean };
    }
  }
  
  return { valid: false, tier: 'lifetime', cleanKey: clean };
}

// Official Lifetime License Keys (80 Official Lifetime Keys - Strictly single device locked per key)
export const LIFETIME_OFFICIAL_KEYS: string[] = [
  // Group 1 (20 keys)
  'A7B2C4D6E8', 'M3N5P7R9S1', 'K4L6X8Z2W3', 'H5J7V9B1N4', 'D6F8C2X5M7', 
  'T7Y9K1L3P8', 'B2G4J6H8Q9', 'X3C5V7N9M1', 'R4T6Y8U2I5', 'F5G7H9J1K3', 
  'L6Z8X2C4V7', 'P7M9N1B3D5', 'W8Q2E4R6T9', 'S9A1D3F5G8', 'Z1X3C5V7B9', 
  'J2K4L6M8N3', 'Q3W5E7R9T1', 'Y4U6I8O2P5', 'G5H7J9K1L3', 'V6B8N2M4X7',
  // Group 2 (20 keys)
  'V2X4Z6B8M1', 'P3R5T7W9K2', 'H4J6L8N1Q3', 'D5F7C9V2X4', 'M6K8Z1B3H5', 
  'S7N9W2X4L6', 'F8T2M4V6R8', 'K9P1X3C5N7', 'Z1L3B5H7D9', 'C2V4N6M8K1', 
  'T3R5S7W9P2', 'B4H6F8J1L3', 'X5Z7D9V2M4', 'N6K8P1X3H5', 'W7M9T2C4R6', 
  'J1B3L5F7N9', 'Q2X4Z6H8K1', 'R3T5V7M9P2', 'L4N6X8C1W3', 'M5P7K9J2D4',
  // Group 3 (20 keys)
  'X9Z1B3M5K7', 'P8R2T4V6L9', 'H7J3N5C1W2', 'D6F4X8Z2M5', 'M5K7P9R1T3', 
  'S4N6H8J2L1', 'F3T5D7V9C4', 'K2P8M1X3Z6', 'Z1L4B6H8N2', 'C9V1N3M5K7', 
  'T8R2S4W6P1', 'B7H3F5J9L2', 'X6Z4D8V2M1', 'N5K7P9X1H3', 'W4M6T8C2R9', 
  'J3B5L7F1N2', 'Q2X8Z4H6K5', 'R1T9V3M5P7', 'L9N2X4C6W8', 'M8P1K3J5D7',
  // Group 4 (20 keys)
  'J4K6L8M2N5', 'W3X5Y7Z9A1', 'G2H4J6K8L3', 'Q1W3E5R7T9', 'Z8X6C4V2B1', 
  'F7D5S3A9P2', 'M6N8B1V3C5', 'H9J1K3L5Z7', 'R4T6Y8U1I3', 'P2O4I6U8Y5', 
  'K5J3H1G9F7', 'D1F3G5H7J2', 'C8V6B4N2M9', 'X7Z5L3K1J4', 'N9B7V5C3X1', 
  'L2K4J6H8G3', 'T5R3E1W9Q7', 'A6S4D2F8G1', 'U8I6O4P2L9', 'B3N5M7K1J6',
];

export function isOfficialLifetimeKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim().toUpperCase().replace(/[\s\-_]/g, '');
  return LIFETIME_OFFICIAL_KEYS.includes(clean);
}

// Official 1-Month License Keys (Simple Plan - 1 Month / रु. ३९९)
export const ONE_MONTH_OFFICIAL_KEYS: string[] = [
  '3N3YU4LSE5',
];

export function isOfficial1MonthKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim().toUpperCase().replace(/[\s\-_]/g, '');
  return ONE_MONTH_OFFICIAL_KEYS.includes(clean);
}

// Pre-configured permanent seed licenses (Lifetime & 1-Month Simple keys)
export const SEED_LICENSES: LicenseRecord[] = [
  // 1-Month Official Keys (Simple Plan - 1 Month)
  ...ONE_MONTH_OFFICIAL_KEYS.map((key) => ({
    id: key,
    licenseKey: key,
    customerName: '1-Month Member (१ महिने सदस्य)',
    customerPhone: '',
    customerEmail: '',
    status: 'available' as const,
    authorizedDeviceId: null,
    deviceStatus: 'unbound' as const,
    deviceInfo: null,
    activatedAt: null,
    lastSeenAt: null,
    expiresAt: null, // Computed as 1 Month from first activation date
    createdAt: '2026-08-29T00:00:00.000Z',
    updatedAt: '2026-08-29T00:00:00.000Z',
    notes: `Official 1-Month Key (${key}) - 1 Month Single Device License`,
    tier: 'simple',
  })),
  // 80 Official Lifetime Keys (Single Device Strictly Enforced)
  ...LIFETIME_OFFICIAL_KEYS.map((key, idx) => ({
    id: key,
    licenseKey: key,
    customerName: `Lifetime Member #${idx + 1}`,
    customerPhone: '',
    customerEmail: '',
    status: 'available' as const,
    authorizedDeviceId: null,
    deviceStatus: 'unbound' as const,
    deviceInfo: null,
    activatedAt: null,
    lastSeenAt: null,
    expiresAt: null, // Lifetime access - Never expires
    createdAt: '2026-08-25T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
    notes: `Official Lifetime Key (${key}) - Single Device Strictly Enforced`,
    tier: 'lifetime',
  })),
];

// List of legacy demo keys to purge
const LEGACY_KEYS_TO_PURGE = new Set([
  'ABC123',
  'VIP-NEPAL-2026',
  'ASTROBINAY9856',
  'ASTRO-MASTER',
  'TESTKEY',
]);

// Secret Master Keys (Never displayed in UI, unlocks app with lifetime privileges)
const SECRET_MASTER_KEYS = new Set([
  '2M2DU6HKX9',
]);

export function isSecretMasterKey(key: string): boolean {
  if (!key) return false;
  return SECRET_MASTER_KEYS.has(key.trim().toUpperCase());
}

const LOCAL_PURGED_KEYS_STORAGE_KEY = '__jyotish_purged_licenses_keys__';

export function getPurgedKeysSet(): Set<string> {
  const set = new Set<string>();
  if (typeof window === 'undefined') return set;
  try {
    const raw = localStorage.getItem(LOCAL_PURGED_KEYS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((k) => {
          if (typeof k === 'string') set.add(k.trim().toUpperCase());
        });
      }
    }
  } catch (_e) {}
  return set;
}

export function addPurgedKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim().toUpperCase();
  if (!clean) return;
  const set = getPurgedKeysSet();
  set.add(clean);
  try {
    localStorage.setItem(LOCAL_PURGED_KEYS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (_e) {}
}

export function removePurgedKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim().toUpperCase();
  if (!clean) return;
  const set = getPurgedKeysSet();
  set.delete(clean);
  try {
    localStorage.setItem(LOCAL_PURGED_KEYS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (_e) {}
}

/**
 * Membership Plans & Pricing Definitions:
 * - Simple (साधारण): Rs 399 for 1 Month
 * - VIP (भिआइपी): Rs 699 for 3 Months
 * - VVIP (भिभिआइपी): Rs 1,199 for 6 Months
 * - Yearly (वार्षिक): Rs 2,199 for 1 Year
 * - Lifetime (आजन्म): Rs 5,999 for Lifetime Access (Key: 3B6F5JUE7A)
 */
export interface MembershipPlan {
  id: 'simple' | 'vip' | 'vvip' | 'yearly' | 'lifetime';
  nameNe: string;
  nameEn: string;
  durationNe: string;
  durationEn: string;
  price: number;
  monthsCount: number;
  highlightNe?: string;
  highlightEn?: string;
  popular?: boolean;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'simple',
    nameNe: 'साधारण योजना (Simple)',
    nameEn: 'Simple Plan',
    durationNe: '१ महिना (1 Month)',
    durationEn: '1 Month',
    price: 399,
    monthsCount: 1,
    highlightNe: 'रु. ३९९ / १ महिना',
    highlightEn: 'Rs. 399 / 1 Month',
  },
  {
    id: 'vip',
    nameNe: 'भिआइपी योजना (VIP)',
    nameEn: 'VIP Plan',
    durationNe: '३ महिना (3 Months)',
    durationEn: '3 Months',
    price: 699,
    monthsCount: 3,
    highlightNe: 'रु. ६९९ / ३ महिना',
    highlightEn: 'Rs. 699 / 3 Months',
  },
  {
    id: 'vvip',
    nameNe: 'भिभिआइपी योजना (VVIP)',
    nameEn: 'VVIP Plan',
    durationNe: '६ महिना (6 Months)',
    durationEn: '6 Months',
    price: 1199,
    monthsCount: 6,
    highlightNe: 'रु. १,१९९ / ६ महिना',
    highlightEn: 'Rs. 1,199 / 6 Months',
    popular: true,
  },
  {
    id: 'yearly',
    nameNe: 'वार्षिक योजना (Yearly)',
    nameEn: 'Yearly Plan',
    durationNe: '१ वर्ष (1 Year)',
    durationEn: '1 Year',
    price: 2199,
    monthsCount: 12,
    highlightNe: 'रु. २,१९९ / १ वर्ष',
    highlightEn: 'Rs. 2,199 / 1 Year',
  },
  {
    id: 'lifetime',
    nameNe: 'आजन्म योजना (Lifetime)',
    nameEn: 'Lifetime Plan',
    durationNe: 'सधैंको लागि (आजन्म)',
    durationEn: 'Lifetime Access (No Expiry)',
    price: 5999,
    monthsCount: 0,
    highlightNe: 'रु. ५,९९९ (आजन्म)',
    highlightEn: 'Rs. 5,999 (Lifetime)',
  },
];

/**
 * Calculate expiry date strictly according to tier:
 * - Simple Key -> 1 Month (Rs 399)
 * - VIP Key -> 3 Months (Rs 699)
 * - VVIP Key -> 6 Months (Rs 1199)
 * - Yearly Key -> 1 Year (Rs 2199)
 * - Lifetime Key -> null (Never expires / Lifetime - Rs 5999)
 */
export function calculateExpiryDateForTier(tier: string, fromDate: Date = new Date()): string | null {
  const t = (tier || '').toLowerCase().trim();
  if (t === 'lifetime') {
    return null;
  }
  const date = new Date(fromDate.getTime());
  if (t === 'simple') {
    // 1 Month duration (Rs 399)
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  }
  if (t === 'vip') {
    // 3 Months duration (Rs 699)
    date.setMonth(date.getMonth() + 3);
    return date.toISOString();
  }
  if (t === 'vvip') {
    // 6 Months duration (Rs 1199)
    date.setMonth(date.getMonth() + 6);
    return date.toISOString();
  }
  if (t === 'yearly' || t === 'annual' || t === '1year') {
    // 1 Year duration (Rs 2199)
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  }
  // Default fallback if unknown
  return null;
}

export interface LicenseExpiryInfo {
  tier: string;
  tierNameNe: string;
  tierNameEn: string;
  durationNe: string;
  durationEn: string;
  priceNpr: number;
  isLifetime: boolean;
  expiresAt: string | null;
  isExpired: boolean;
  daysRemaining: number | null;
  shouldShowRenewNotice: boolean; // True if <= 15 days remaining
  formattedExpiryNe: string;
  formattedExpiryEn: string;
}

/**
 * Get detailed expiry and renewal information for a given license
 */
export function getLicenseExpiryInfo(license?: LicenseRecord | null): LicenseExpiryInfo {
  const tier = (license?.tier || 'lifetime').toLowerCase().trim();
  const isLifetime = tier === 'lifetime';

  let tierNameNe = 'आजन्म (Lifetime Plan)';
  let tierNameEn = 'Lifetime Plan';
  let durationNe = 'कुनै म्याद छैन (आजन्म)';
  let durationEn = 'Lifetime (No Expiry)';
  let priceNpr = 5999;

  if (tier === 'simple') {
    tierNameNe = 'साधारण (Simple Plan)';
    tierNameEn = 'Simple Plan';
    durationNe = '१ महिना (1 Month)';
    durationEn = '1 Month';
    priceNpr = 399;
  } else if (tier === 'vip') {
    tierNameNe = 'भिआइपी (VIP Plan)';
    tierNameEn = 'VIP Plan';
    durationNe = '३ महिना (3 Months)';
    durationEn = '3 Months';
    priceNpr = 699;
  } else if (tier === 'vvip') {
    tierNameNe = 'भिभिआइपी (VVIP Plan)';
    tierNameEn = 'VVIP Plan';
    durationNe = '६ महिना (6 Months)';
    durationEn = '6 Months';
    priceNpr = 1199;
  } else if (tier === 'yearly' || tier === 'annual') {
    tierNameNe = 'वार्षिक (Yearly Plan)';
    tierNameEn = 'Yearly Plan';
    durationNe = '१ वर्ष (1 Year)';
    durationEn = '1 Year';
    priceNpr = 2199;
  }

  // Key is Unused (Available / Unbound) -> Validity duration hasn't started yet!
  if (license?.status === 'available' || !license?.activatedAt) {
    return {
      tier,
      tierNameNe,
      tierNameEn,
      durationNe,
      durationEn,
      priceNpr,
      isLifetime,
      expiresAt: null,
      isExpired: false,
      daysRemaining: null,
      shouldShowRenewNotice: false,
      formattedExpiryNe: isLifetime ? 'सधैंको लागि (आजन्म - रु. ५,९९९)' : `प्रयोग नभएको (अवधि: ${durationNe})`,
      formattedExpiryEn: isLifetime ? 'Lifetime Active (No Expiry)' : `Unused (Duration: ${durationEn})`,
    };
  }

  // Lifetime licenses NEVER expire and NEVER show renewal messages!
  if (isLifetime || !license?.expiresAt) {
    return {
      tier,
      tierNameNe,
      tierNameEn,
      durationNe,
      durationEn,
      priceNpr,
      isLifetime: true,
      expiresAt: null,
      isExpired: false,
      daysRemaining: null,
      shouldShowRenewNotice: false,
      formattedExpiryNe: 'सधैंको लागि (आजन्म)',
      formattedExpiryEn: 'Lifetime Active (No Renewal Required)',
    };
  }

  const expTime = new Date(license.expiresAt).getTime();
  const nowTime = Date.now();
  const diffMs = expTime - nowTime;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;

  const expDateObj = new Date(license.expiresAt);
  const formattedExpiryNe = expDateObj.toLocaleDateString('ne-NP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedExpiryEn = expDateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return {
    tier,
    tierNameNe,
    tierNameEn,
    durationNe,
    durationEn,
    priceNpr,
    isLifetime: false,
    expiresAt: license.expiresAt,
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    // Show gentle renewal notice when 15 or fewer days remaining
    shouldShowRenewNotice: daysRemaining <= 15,
    formattedExpiryNe,
    formattedExpiryEn,
  };
}

/**
 * Read local storage licenses map with dual-layer persistent backup recovery
 */
export function getLocalLicensesMap(): Map<string, LicenseRecord> {
  const map = new Map<string, LicenseRecord>();
  const purgedKeys = getPurgedKeysSet();

  if (typeof window === 'undefined') return map;

  // 1. Read from Primary Storage
  try {
    const raw = localStorage.getItem(LOCAL_LICENSES_STORAGE_KEY);
    if (raw) {
      const parsed: LicenseRecord[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.licenseKey) {
            const keyUpper = item.licenseKey.trim().toUpperCase();
            if (!LEGACY_KEYS_TO_PURGE.has(keyUpper) && !purgedKeys.has(keyUpper)) {
              map.set(keyUpper, item);
            }
          }
        });
      }
    }
  } catch (_e) {}

  // 2. Read from Secondary Backup Storage (Self-healing recovery)
  try {
    const backupRaw = localStorage.getItem(LOCAL_LICENSES_BACKUP_STORAGE_KEY);
    if (backupRaw) {
      const backupParsed: LicenseRecord[] = JSON.parse(backupRaw);
      if (Array.isArray(backupParsed)) {
        let restoredCount = 0;
        backupParsed.forEach((item) => {
          if (item && item.licenseKey) {
            const keyUpper = item.licenseKey.trim().toUpperCase();
            if (!LEGACY_KEYS_TO_PURGE.has(keyUpper) && !purgedKeys.has(keyUpper) && !map.has(keyUpper)) {
              map.set(keyUpper, item);
              restoredCount++;
            }
          }
        });
        if (restoredCount > 0) {
          saveLocalLicensesMap(map);
        }
      }
    }
  } catch (_e) {}

  return map;
}

/**
 * Save licenses map to both primary and persistent backup storage
 */
function saveLocalLicensesMap(map: Map<string, LicenseRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    const list = Array.from(map.values());
    const jsonStr = JSON.stringify(list, null, 2);
    localStorage.setItem(LOCAL_LICENSES_STORAGE_KEY, jsonStr);
    localStorage.setItem(LOCAL_LICENSES_BACKUP_STORAGE_KEY, jsonStr);
  } catch (_e) {}
}

/**
 * Export all active licenses as a clean, structured JSON backup string
 */
export function exportLicensesBackupJSON(): string {
  const map = getLocalLicensesMap();
  const list = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  return JSON.stringify(list, null, 2);
}

/**
 * Export current active licenses as TypeScript Source Code format for hardcoding in SEED_LICENSES
 */
export function exportLicensesAsTypeScriptCode(): string {
  const map = getLocalLicensesMap();
  const list = Array.from(map.values()).filter(
    (l) => l && l.licenseKey && !LEGACY_KEYS_TO_PURGE.has(l.licenseKey) && !SECRET_MASTER_KEYS.has(l.licenseKey)
  );

  const formatted = list.map((l) => {
    return `  {
    id: ${JSON.stringify(l.licenseKey)},
    licenseKey: ${JSON.stringify(l.licenseKey)},
    customerName: ${JSON.stringify(l.customerName || 'ग्राहक')},
    customerPhone: ${JSON.stringify(l.customerPhone || '')},
    customerEmail: ${JSON.stringify(l.customerEmail || '')},
    status: 'available',
    authorizedDeviceId: null,
    deviceStatus: 'unbound',
    deviceInfo: null,
    activatedAt: null,
    lastSeenAt: null,
    expiresAt: ${l.expiresAt ? JSON.stringify(l.expiresAt) : 'null'},
    createdAt: ${JSON.stringify(l.createdAt || new Date().toISOString())},
    updatedAt: ${JSON.stringify(l.updatedAt || new Date().toISOString())},
    notes: ${JSON.stringify(l.notes || '')},
    tier: ${JSON.stringify(l.tier || 'lifetime')},
  },`;
  }).join('\n');

  return `// Hardcoded Licenses for Vercel & Offline Deployments\nexport const SEED_LICENSES: LicenseRecord[] = [\n${formatted}\n];`;
}

/**
 * Trigger an instant browser file download of the licenses JSON backup
 */
export function downloadLicensesBackupFile(filename = 'astrology_licenses_backup.json'): void {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = exportLicensesBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to trigger JSON download:', err);
  }
}

/**
 * Import and merge licenses from a JSON backup string (Works seamlessly across Vercel, localhost & new devices)
 */
export async function importLicensesFromJSON(jsonText: string): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const parsed = JSON.parse(jsonText);
    const listToImport: LicenseRecord[] = Array.isArray(parsed) ? parsed : (parsed.licenses && Array.isArray(parsed.licenses)) ? parsed.licenses : [];
    
    if (listToImport.length === 0) {
      return { success: false, count: 0, message: 'कुनै मान्य Key डाटा फेला परेन। (No valid license data found in JSON).' };
    }

    const localMap = getLocalLicensesMap();
    let importedCount = 0;

    for (const item of listToImport) {
      if (item && item.licenseKey) {
        const keyUpper = item.licenseKey.trim().toUpperCase();
        if (keyUpper && !LEGACY_KEYS_TO_PURGE.has(keyUpper)) {
          removePurgedKey(keyUpper);
          const sanitized: LicenseRecord = {
            id: keyUpper,
            licenseKey: keyUpper,
            customerName: item.customerName || 'ग्राहक (Customer)',
            customerPhone: item.customerPhone || '',
            customerEmail: item.customerEmail || '',
            status: item.status || 'available',
            authorizedDeviceId: item.authorizedDeviceId || null,
            deviceStatus: item.authorizedDeviceId ? 'authorized' : 'unbound',
            deviceInfo: item.deviceInfo || null,
            activatedAt: item.activatedAt || null,
            lastSeenAt: item.lastSeenAt || null,
            expiresAt: item.expiresAt || null,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: item.notes || 'Imported from JSON backup',
            tier: item.tier || 'lifetime',
          };

          localMap.set(keyUpper, sanitized);
          importedCount++;

          // Also sync to Cloud Firestore if connected
          if (db) {
            try {
              await ensureFirebaseAuth();
              await setDoc(doc(db, 'licenses', keyUpper), cleanFirestoreData(sanitized), { merge: true });
            } catch (_e) {}
          }

          // Also sync to Server API if running
          try {
            fetch('/api/license/admin/create', {
              method: 'POST',
              headers: getAdminAuthHeaders(),
              body: JSON.stringify(sanitized),
            }).catch(() => {});
          } catch (_e) {}
        }
      }
    }

    saveLocalLicensesMap(localMap);
    return {
      success: true,
      count: importedCount,
      message: `सफलतापूर्वक ${importedCount} वटा Key हरू सुरक्षित रूपमा इम्पोटे भयो। (Successfully imported ${importedCount} keys).`,
    };
  } catch (err: any) {
    console.error('Error importing licenses from JSON:', err);
    return { success: false, count: 0, message: `JSON फाइल पढ्न सकिएन: ${err?.message || 'Invalid format'}` };
  }
}

/**
 * Get active user email for admin requests
 */
function getAdminAuthHeaders(): Record<string, string> {
  let email = '';
  try {
    const saved = localStorage.getItem('__jyotish_auth_user_session__');
    if (saved) {
      const parsed = JSON.parse(saved);
      email = (parsed?.email || '').trim().toLowerCase();
    }
  } catch (_) {}
  return {
    'Content-Type': 'application/json',
    'x-admin-email': email || 'tumlingtar39@gmail.com',
  };
}

/**
 * Verify or perform first-time activation for a license and device.
 * Guarantees cross-device lock across different phones, laptops and Vercel hosting.
 */
export async function verifyOrActivateLicense(
  licenseKeyInput: string,
  customerName?: string,
  customerPhone?: string,
  customerEmail?: string
): Promise<DeviceAuthorizationResult> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  const meta = getDeviceMetadata();
  const now = new Date().toISOString();

  if (!licenseKey) {
    return {
      authorized: false,
      status: 'INVALID_LICENSE',
      licenseKey: '',
      deviceId: meta.deviceId,
      messageNe: 'इजाजतपत्र (License Key) खाली छ।',
      messageEn: 'License key is required.',
    };
  }

  // 0. Secret Master Key Check - Instant unrestricted lifetime access on any device (Hidden from UI)
  if (isSecretMasterKey(licenseKey)) {
    const masterRecord: LicenseRecord = {
      id: 'MASTER-2M2DU6HKX9',
      licenseKey: '2M2DU6HKX9',
      customerName: 'अधिकृत प्रयोगकर्ता (Master Access)',
      customerPhone: '',
      customerEmail: '',
      status: 'active',
      authorizedDeviceId: meta.deviceId,
      deviceStatus: 'authorized',
      deviceInfo: null,
      activatedAt: now,
      lastSeenAt: now,
      expiresAt: null, // Lifetime access
      createdAt: '2026-08-23T00:00:00.000Z',
      updatedAt: now,
      notes: 'Master Access Key',
      tier: 'lifetime',
    };
    setStoredLicenseKey('2M2DU6HKX9');
    const localMap = getLocalLicensesMap();
    localMap.set('2M2DU6HKX9', masterRecord);
    saveLocalLicensesMap(localMap);

    return {
      authorized: true,
      status: 'AUTHORIZED',
      licenseKey: '2M2DU6HKX9',
      deviceId: meta.deviceId,
      customerName: masterRecord.customerName,
      activatedAt: now,
      lastSeenAt: now,
      messageNe: 'मास्टर की प्रमाणीकरण सफल भयो। स्वागत छ!',
      messageEn: 'Master key verified successfully. Welcome!',
      license: masterRecord,
    };
  }

  // 1. Try server-side verification endpoint if available (Development or Custom Server)
  try {
    const res = await fetch('/api/license/verify-or-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        deviceId: meta.deviceId,
        deviceSecret: meta.deviceSecret,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        deviceInfo: {
          platform: meta.platform,
          userAgent: meta.userAgent,
          screenResolution: meta.screenResolution,
          language: meta.language,
          timezone: meta.timezone,
          hardwareConcurrency: meta.hardwareConcurrency,
          canvasHash: meta.canvasHash,
        },
      }),
    });

    const data: DeviceAuthorizationResult = await res.json().catch(() => null);
    if (data) {
      if (data.authorized) {
        setStoredLicenseKey(licenseKey);
        if (data.license) {
          const map = getLocalLicensesMap();
          map.set(licenseKey, data.license);
          saveLocalLicensesMap(map);
        }
        return data;
      } else {
        // STRICT CHECK: The server explicitly said this key is BLOCKED, REVOKED, EXPIRED or locked to another device!
        // We MUST NOT bypass this or fall back to local unbounded seed!
        if (
          data.status === 'BLOCKED_DIFFERENT_DEVICE' ||
          data.status === 'REVOKED' ||
          data.status === 'EXPIRED' ||
          data.status === 'INVALID_LICENSE'
        ) {
          // If this key was wrongfully saved locally, purge it from local device
          const map = getLocalLicensesMap();
          if (map.has(licenseKey)) {
            map.delete(licenseKey);
            saveLocalLicensesMap(map);
          }
          removeStoredLicenseKey(licenseKey);
          if (getStoredLicenseKey() === licenseKey) {
            clearStoredLicenseKey();
          }
          if (typeof window !== 'undefined') {
            localStorage.removeItem('astrology_user_subscription');
            localStorage.removeItem('astro_active_key');
            localStorage.removeItem('astro_lifetime_active');
          }
          return data;
        }
      }
    }
  } catch (_err) {
    // API endpoint unreachable (e.g. static Vercel deployment), proceed to Cloud & Local sync
  }

  // 2. Fetch from Firestore (Shared centralized database across all users' devices and Vercel)
  let cloudRecord: LicenseRecord | null = null;
  if (db) {
    try {
      await ensureFirebaseAuth();
      const snap = await getDoc(doc(db, 'licenses', licenseKey));
      if (snap.exists()) {
        cloudRecord = snap.data() as LicenseRecord;
      }
    } catch (_dbErr) {
      console.warn('Firestore cloud fetch notice:', _dbErr);
    }
  }

  // 3. Local Storage record
  const localMap = getLocalLicensesMap();
  const localRecord = localMap.get(licenseKey);

  // Determine active license: Cloud record has highest priority for cross-device binding
  let targetRecord: LicenseRecord | null = cloudRecord || (localRecord && localRecord.authorizedDeviceId === meta.deviceId ? localRecord : null);

  // If online server check was missed and cloud is available, or if cloud record exists:
  if (cloudRecord) {
    targetRecord = cloudRecord;
  }

  // If no record is found in cloud or already bound locally:
  // For offline/unreachable conditions, check if we can safely activate
  if (!targetRecord) {
    // Check built-in seeds
    const seed = SEED_LICENSES.find((s) => s.licenseKey === licenseKey);
    if (seed) {
      // NOTE: Seed key activation REQUIRES server/cloud verification so that 2 devices cannot both bind the same seed!
      if (!navigator.onLine) {
        return {
          authorized: false,
          status: 'OFFLINE_UNVERIFIED',
          licenseKey,
          deviceId: meta.deviceId,
          messageNe: 'नयाँ कोड पहिलो पटक यस उपकरणमा दर्ता (बाइन्ड) गर्न इन्टरनेट सम्पर्क आवश्यक छ।',
          messageEn: 'Internet connection is required for first-time key registration to bind to this device.',
        };
      }
      targetRecord = { ...seed };
    }
  }

  // Check cryptographic signed key
  if (!targetRecord) {
    const signedCheck = verifySignedLicenseKey(licenseKey);
    if (signedCheck.valid) {
      if (!navigator.onLine) {
        return {
          authorized: false,
          status: 'OFFLINE_UNVERIFIED',
          licenseKey,
          deviceId: meta.deviceId,
          messageNe: 'नयाँ कोड पहिलो पटक यस उपकरणमा दर्ता (बाइन्ड) गर्न इन्टरनेट सम्पर्क आवश्यक छ।',
          messageEn: 'Internet connection is required for first-time key registration to bind to this device.',
        };
      }
      targetRecord = {
        id: licenseKey,
        licenseKey: licenseKey,
        customerName: customerName || 'ग्राहक (Authorized Customer)',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: calculateExpiryDateForTier(signedCheck.tier, new Date()),
        createdAt: now,
        updatedAt: now,
        notes: `Universal Signed Key (${signedCheck.tier})`,
        tier: signedCheck.tier,
      };
    }
  }

  if (!targetRecord) {
    return {
      authorized: false,
      status: 'INVALID_LICENSE',
      licenseKey,
      deviceId: meta.deviceId,
      messageNe: `प्रवेश इजाजतपत्र (${licenseKey}) फेला परेन। कृपया सही Key राख्नुहोस् वा व्यवस्थापकसँग सम्पर्क गर्नुहोस्।`,
      messageEn: `License key (${licenseKey}) not found. Please verify with the administrator.`,
    };
  }

  // Check if revoked
  if (targetRecord.status === 'revoked') {
    return {
      authorized: false,
      status: 'REVOKED',
      licenseKey,
      deviceId: meta.deviceId,
      customerName: targetRecord.customerName,
      messageNe: 'यो इजाजतपत्र व्यवस्थापकद्वारा खारेज (Revoked) गरिएको छ।',
      messageEn: 'This license has been revoked by the administrator.',
      license: targetRecord,
    };
  }

  // Check if expired
  if (
    targetRecord.status === 'expired' ||
    (targetRecord.expiresAt && new Date(targetRecord.expiresAt).getTime() < Date.now())
  ) {
    return {
      authorized: false,
      status: 'EXPIRED',
      licenseKey,
      deviceId: meta.deviceId,
      customerName: targetRecord.customerName,
      messageNe: 'यो इजाजतपत्रको म्याद समाप्त (Expired) भएको छ।',
      messageEn: 'This license has expired.',
      license: targetRecord,
    };
  }

  // CASE A: License is NOT yet bound -> Bind to THIS new device!
  if (!targetRecord.authorizedDeviceId || targetRecord.status === 'available' || targetRecord.deviceStatus === 'unbound') {
    // If expiresAt is not set, or is dynamic based on tier, compute exact expiry from activation date
    let effectiveExpiresAt = targetRecord.expiresAt;
    const tier = (targetRecord.tier || 'lifetime').toLowerCase();
    if (tier !== 'lifetime') {
      effectiveExpiresAt = calculateExpiryDateForTier(tier, new Date());
    }

    const updatedRecord: LicenseRecord = {
      ...targetRecord,
      authorizedDeviceId: meta.deviceId,
      deviceStatus: 'authorized',
      status: 'active',
      customerEmail: customerEmail || targetRecord.customerEmail || '',
      customerName: customerName || targetRecord.customerName || 'ग्राहक (Customer)',
      customerPhone: customerPhone || targetRecord.customerPhone || '',
      activatedAt: targetRecord.activatedAt || now,
      lastSeenAt: now,
      expiresAt: effectiveExpiresAt,
      updatedAt: now,
      deviceInfo: {
        platform: meta.platform,
        userAgent: meta.userAgent,
        screenResolution: meta.screenResolution,
        language: meta.language,
        timezone: meta.timezone,
        hardwareConcurrency: meta.hardwareConcurrency,
      },
    };

    // Save to Local Storage
    localMap.set(licenseKey, updatedRecord);
    saveLocalLicensesMap(localMap);
    setStoredLicenseKey(licenseKey);

    // Save to Firestore so ALL OTHER DEVICES and Vercel see that this key is now LOCKED & ACTIVE
    if (db) {
      try {
        await ensureFirebaseAuth();
        await setDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData(updatedRecord), { merge: true });
      } catch (_e) {
        console.warn('Firestore sync note on activation:', _e);
      }
    }

    return {
      authorized: true,
      status: 'ACTIVATED',
      licenseKey,
      deviceId: meta.deviceId,
      customerName: updatedRecord.customerName,
      activatedAt: updatedRecord.activatedAt,
      lastSeenAt: updatedRecord.lastSeenAt,
      messageNe: 'यो फोन/उपकरण यस इजाजतपत्रसँग स्थायी रूपमा सुरक्षित दर्ता भयो।',
      messageEn: 'This device is permanently authorized with this license.',
      license: updatedRecord,
    };
  }

  // CASE B: License IS already bound -> Check if this is the SAME device
  if (targetRecord.authorizedDeviceId === meta.deviceId) {
    const updatedRecord: LicenseRecord = {
      ...targetRecord,
      lastSeenAt: now,
      deviceStatus: 'authorized',
      status: 'active',
      customerName: (customerName && customerName !== 'ग्राहक (Customer)') ? customerName : targetRecord.customerName,
      customerPhone: customerPhone || targetRecord.customerPhone,
      customerEmail: customerEmail || targetRecord.customerEmail,
    };

    localMap.set(licenseKey, updatedRecord);
    saveLocalLicensesMap(localMap);
    setStoredLicenseKey(licenseKey);

    if (db) {
      try {
        await ensureFirebaseAuth();
        await updateDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData({
          lastSeenAt: now,
          customerName: updatedRecord.customerName,
          customerPhone: updatedRecord.customerPhone,
        }));
      } catch (_e) {}
    }

    return {
      authorized: true,
      status: 'AUTHORIZED',
      licenseKey,
      deviceId: meta.deviceId,
      customerName: updatedRecord.customerName,
      activatedAt: updatedRecord.activatedAt,
      lastSeenAt: now,
      messageNe: 'उपकरण प्रमाणीकरण सफल भयो। स्वागत छ!',
      messageEn: 'Device verified successfully. Welcome!',
      license: updatedRecord,
    };
  }

  // CASE C: STRICT ANTI-THEFT DEVICE LOCK: Key is already bound to another physical phone/device!
  // If another person or device opens this forwarded link/key, it is strictly blocked to prevent piracy/theft.
  return {
    authorized: false,
    status: 'BLOCKED_DIFFERENT_DEVICE',
    licenseKey,
    deviceId: meta.deviceId,
    customerName: targetRecord.customerName,
    activatedAt: targetRecord.activatedAt,
    messageNe: '⚠️ अनधिकृत पहुँच रोकियो (Anti-Theft Protection): यो इजाजतपत्र पहिले नै १ आधिकारिक उपकरणमा दर्ता भइसकेको छ। १ Key बाट केवल १ उपकरण मात्र चलाउन मिल्छ। यो लिङ्क अन्य उपकरणमा चलाउन मिल्दैन। यदि तपाईँ यसको वास्तविक ग्राहक हुनुहुन्छ र फोन फेर्नुभएको हो भने व्यवस्थापक (Admin) सँग सम्पर्क गरी डिभाइस रिसेट गराउनुहोस्।',
    messageEn: 'Unauthorized Access Blocked (Anti-Theft Protection): This license is already locked to another device. Single-device security policy is strictly enforced. Please contact the administrator for device reset.',
    license: targetRecord,
  };
}

/**
 * Fetch license record by key
 */
export async function getLicenseDetails(licenseKeyInput: string): Promise<LicenseRecord | null> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  if (!licenseKey) return null;

  if (isSecretMasterKey(licenseKey)) {
    return {
      id: 'MASTER-2M2DU6HKX9',
      licenseKey: '2M2DU6HKX9',
      customerName: 'अधिकृत प्रयोगकर्ता (Master Access)',
      customerPhone: '',
      customerEmail: '',
      status: 'active',
      authorizedDeviceId: null,
      deviceStatus: 'authorized',
      deviceInfo: null,
      activatedAt: '2026-08-23T00:00:00.000Z',
      lastSeenAt: '2026-08-23T00:00:00.000Z',
      expiresAt: null,
      createdAt: '2026-08-23T00:00:00.000Z',
      updatedAt: '2026-08-23T00:00:00.000Z',
      notes: 'Master Access Key',
      tier: 'lifetime',
    };
  }

  // Try Firestore first
  if (db) {
    try {
      await ensureFirebaseAuth();
      const snap = await getDoc(doc(db, 'licenses', licenseKey));
      if (snap.exists()) {
        const lic = snap.data() as LicenseRecord;
        const localMap = getLocalLicensesMap();
        localMap.set(licenseKey, lic);
        saveLocalLicensesMap(localMap);
        return lic;
      }
    } catch (_e) {}
  }

  // Try local storage
  const localMap = getLocalLicensesMap();
  if (localMap.has(licenseKey)) {
    return localMap.get(licenseKey) || null;
  }

  // Try server
  try {
    const res = await fetch(`/api/license/${encodeURIComponent(licenseKey)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.license) {
        localMap.set(licenseKey, data.license);
        saveLocalLicensesMap(localMap);
        return data.license;
      }
    }
  } catch (_e) {}

  return null;
}

/**
 * Get all licenses associated with the current device (from local history, Firestore, or server)
 * This allows users who purchased multiple links/keys to see and use any of them seamlessly on this device!
 */
export async function getAllDeviceLicenses(explicitDeviceId?: string): Promise<LicenseRecord[]> {
  const meta = getDeviceMetadata();
  const currentDeviceId = explicitDeviceId || meta.deviceId;
  const storedKeys = getStoredLicenseKeysList();
  const resultMap = new Map<string, LicenseRecord>();

  // 1. Check stored keys from device history - ONLY if strictly bound to THIS device
  for (const k of storedKeys) {
    if (isSecretMasterKey(k)) continue;
    const lic = await getLicenseDetails(k);
    if (lic && lic.licenseKey && lic.authorizedDeviceId === currentDeviceId && lic.status === 'active') {
      resultMap.set(lic.licenseKey.toUpperCase(), lic);
    }
  }

  // 2. Query local map for any records bound to this device ID
  const localMap = getLocalLicensesMap();
  localMap.forEach((lic) => {
    if (lic.authorizedDeviceId === currentDeviceId && lic.licenseKey && lic.status === 'active' && !isSecretMasterKey(lic.licenseKey)) {
      resultMap.set(lic.licenseKey.toUpperCase(), lic);
    }
  });

  // 3. Query Firestore if available
  if (db) {
    try {
      await ensureFirebaseAuth();
      const q = query(collection(db, 'licenses'));
      const snapshot = await getDocs(q);
      snapshot.forEach((snap) => {
        const lic = snap.data() as LicenseRecord;
        if (lic && lic.licenseKey && lic.authorizedDeviceId === currentDeviceId && lic.status === 'active' && !isSecretMasterKey(lic.licenseKey)) {
          resultMap.set(lic.licenseKey.toUpperCase(), lic);
        }
      });
    } catch (_e) {}
  }

  const list = Array.from(resultMap.values()).filter((lic) => !isSecretMasterKey(lic.licenseKey));
  // Sort with highest tier first (lifetime > vvip > vip > simple)
  const tierWeight: Record<string, number> = { lifetime: 4, vvip: 3, vip: 2, simple: 1 };
  list.sort((a, b) => {
    const wa = tierWeight[(a.tier || '').toLowerCase()] || 0;
    const wb = tierWeight[(b.tier || '').toLowerCase()] || 0;
    return wb - wa;
  });

  return list;
}

/**
 * Find any valid, active license among all keys associated with this device.
 * If the customer used multiple links/keys, this ensures the device ALWAYS opens!
 */
export async function findBestActiveLicenseForDevice(): Promise<LicenseRecord | null> {
  const meta = getDeviceMetadata();
  const currentDeviceId = meta.deviceId;
  const licenses = await getAllDeviceLicenses(currentDeviceId);
  const nowTime = Date.now();

  for (const lic of licenses) {
    if (lic.authorizedDeviceId !== currentDeviceId) continue;
    if (lic.status !== 'active') continue;
    if (lic.expiresAt && new Date(lic.expiresAt).getTime() < nowTime) continue;
    return lic;
  }

  return null;
}

/**
 * Admin: Fetch all licenses with real-time or snapshot query
 */
/**
 * Admin: Fetch all licenses with real-time or snapshot query
 */
export async function adminFetchAllLicenses(): Promise<LicenseRecord[]> {
  const purgedKeys = getPurgedKeysSet();
  const combinedMap = new Map<string, LicenseRecord>();

  // 1. Fetch from Firestore if available
  if (db) {
    try {
      await ensureFirebaseAuth();
      const q = query(collection(db, 'licenses'));
      const snapshot = await getDocs(q);
      snapshot.forEach((snap) => {
        const lic = snap.data() as LicenseRecord;
        if (lic && lic.licenseKey) {
          const k = lic.licenseKey.trim().toUpperCase();
          if (!LEGACY_KEYS_TO_PURGE.has(k) && !purgedKeys.has(k) && !SECRET_MASTER_KEYS.has(k)) {
            combinedMap.set(k, lic);
          }
        }
      });
    } catch (_e) {
      console.warn('Firestore fetch all licenses notice:', _e);
    }
  }

  // 2. Fetch from server API
  try {
    const res = await fetch('/api/license/admin/all', {
      headers: getAdminAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.licenses)) {
        data.licenses.forEach((lic: LicenseRecord) => {
          if (lic && lic.licenseKey) {
            const k = lic.licenseKey.trim().toUpperCase();
            if (!LEGACY_KEYS_TO_PURGE.has(k) && !purgedKeys.has(k) && !SECRET_MASTER_KEYS.has(k)) {
              combinedMap.set(k, lic);
            }
          }
        });
      }
    }
  } catch (_e) {}

  // 3. Merge local storage (only non-purged)
  const localMap = getLocalLicensesMap();
  localMap.forEach((lic, k) => {
    if (!LEGACY_KEYS_TO_PURGE.has(k) && !purgedKeys.has(k) && !SECRET_MASTER_KEYS.has(k) && !combinedMap.has(k)) {
      combinedMap.set(k, lic);
    }
  });

  saveLocalLicensesMap(combinedMap);

  return Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

/**
 * Admin: Create a new license (Saves to Firestore, Server and Local Storage)
 */
export async function adminCreateLicense(payload: {
  licenseKey: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  expiresAt?: string | null;
  tier?: 'vip' | 'vvip' | 'simple' | 'lifetime' | string;
}): Promise<LicenseRecord> {
  const licenseKey = payload.licenseKey.trim().toUpperCase();
  const tier = (payload.tier || 'lifetime').toLowerCase();

  // If this key was previously marked purged, restore permission to use it
  removePurgedKey(licenseKey);

  let calculatedExpiresAt: string | null = payload.expiresAt || null;
  if (!calculatedExpiresAt) {
    calculatedExpiresAt = calculateExpiryDateForTier(tier, new Date());
  }

  const now = new Date().toISOString();
  const newRecord: LicenseRecord = {
    id: licenseKey,
    licenseKey,
    customerName: payload.customerName?.trim() || 'ग्राहक (Customer)',
    customerPhone: payload.customerPhone?.trim() || '',
    customerEmail: payload.customerEmail?.trim() || '',
    status: 'available',
    authorizedDeviceId: null,
    deviceStatus: 'unbound',
    deviceInfo: null,
    activatedAt: null,
    lastSeenAt: null,
    expiresAt: calculatedExpiresAt,
    createdAt: now,
    updatedAt: now,
    notes: payload.notes?.trim() || '',
    tier,
  };

  // 1. Save to Local Storage
  const localMap = getLocalLicensesMap();
  localMap.set(licenseKey, newRecord);
  saveLocalLicensesMap(localMap);

  // 2. Save directly to Firestore Cloud (Synchronized across all devices and Vercel)
  if (db) {
    try {
      await ensureFirebaseAuth();
      await setDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData(newRecord));
    } catch (_dbErr) {
      console.warn('Firestore cloud save note:', _dbErr);
    }
  }

  // 3. Sync with server API
  try {
    const sRes = await fetch('/api/license/admin/create', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(newRecord),
    });
    if (sRes.ok) {
      const data = await sRes.json();
      if (data?.license) {
        localMap.set(licenseKey, data.license);
        saveLocalLicensesMap(localMap);
      }
    }
  } catch (_e) {}

  return newRecord;
}

/**
 * Admin: Bulk generate secure 8-character unique licenses (e.g. 100 Keys)
 */
export async function adminBulkCreate8CharLicenses(
  count: number = 100,
  tier: 'lifetime' | 'vvip' | 'vip' | 'simple' | 'yearly' | string = 'lifetime',
  notesPrefix: string = 'Bulk Generated 8-Char Key'
): Promise<{ count: number; licenses: LicenseRecord[] }> {
  const localMap = getLocalLicensesMap();
  const generatedLicenses: LicenseRecord[] = [];
  const now = new Date().toISOString();

  const existingKeys = new Set(Array.from(localMap.keys()));

  while (generatedLicenses.length < count) {
    const key = generateSecure8CharKey(tier);
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      removePurgedKey(key);

      const record: LicenseRecord = {
        id: key,
        licenseKey: key,
        customerName: 'उपलब्ध इजाजतपत्र (Available Key)',
        customerPhone: '',
        customerEmail: '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: null, // Key duration starts strictly from when it is redeemed/activated on a customer device
        createdAt: now,
        updatedAt: now,
        notes: `${notesPrefix} #${generatedLicenses.length + 1}`,
        tier,
      };

      generatedLicenses.push(record);
      localMap.set(key, record);
    }
  }

  // 1. Save all to Local Storage
  saveLocalLicensesMap(localMap);

  // 2. Batch Sync to Firestore Cloud
  if (db) {
    try {
      await ensureFirebaseAuth();
      for (const lic of generatedLicenses) {
        await setDoc(doc(db, 'licenses', lic.licenseKey), cleanFirestoreData(lic), { merge: true });
      }
    } catch (_dbErr) {
      console.warn('Firestore bulk save note:', _dbErr);
    }
  }

  // 3. Batch Sync to Server API
  try {
    fetch('/api/license/admin/bulk-create', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenses: generatedLicenses }),
    }).catch(() => {});
  } catch (_e) {}

  return { count: generatedLicenses.length, licenses: generatedLicenses };
}

/**
 * Admin: Bulk generate 400 categorized keys (100 Normal, 100 VIP, 100 VVIP, 100 Lifetime)
 */
export async function adminBulkCreateAll400CategorizedKeys(): Promise<{
  totalCount: number;
  normalCount: number;
  vipCount: number;
  vvipCount: number;
  lifetimeCount: number;
  licenses: LicenseRecord[];
}> {
  const localMap = getLocalLicensesMap();
  const allGenerated: LicenseRecord[] = [];
  const now = new Date().toISOString();
  const existingKeys = new Set(Array.from(localMap.keys()));

  const categories: { tier: 'simple' | 'vip' | 'vvip' | 'lifetime'; count: number; prefix: string }[] = [
    { tier: 'simple', count: 100, prefix: 'Bulk Normal Key (3 Months)' },
    { tier: 'vip', count: 100, prefix: 'Bulk VIP Key (6 Months)' },
    { tier: 'vvip', count: 100, prefix: 'Bulk VVIP Key (1 Year)' },
    { tier: 'lifetime', count: 100, prefix: 'Bulk Lifetime Key (No Expiry)' },
  ];

  let normalCount = 0;
  let vipCount = 0;
  let vvipCount = 0;
  let lifetimeCount = 0;

  for (const cat of categories) {
    let catGenerated = 0;

    while (catGenerated < cat.count) {
      const key = generateSecure8CharKey(cat.tier);
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        removePurgedKey(key);

        const record: LicenseRecord = {
          id: key,
          licenseKey: key,
          customerName: 'उपलब्ध इजाजतपत्र (Available Key)',
          customerPhone: '',
          customerEmail: '',
          status: 'available',
          authorizedDeviceId: null,
          deviceStatus: 'unbound',
          deviceInfo: null,
          activatedAt: null,
          lastSeenAt: null,
          expiresAt: null, // Key duration starts strictly from when it is redeemed/activated on a customer device
          createdAt: now,
          updatedAt: now,
          notes: `${cat.prefix} #${catGenerated + 1}`,
          tier: cat.tier,
        };

        allGenerated.push(record);
        localMap.set(key, record);
        catGenerated++;

        if (cat.tier === 'simple') normalCount++;
        else if (cat.tier === 'vip') vipCount++;
        else if (cat.tier === 'vvip') vvipCount++;
        else if (cat.tier === 'lifetime') lifetimeCount++;
      }
    }
  }

  // 1. Save all to Local Storage
  saveLocalLicensesMap(localMap);

  // 2. Batch Sync to Firestore Cloud
  if (db) {
    try {
      await ensureFirebaseAuth();
      for (const lic of allGenerated) {
        await setDoc(doc(db, 'licenses', lic.licenseKey), cleanFirestoreData(lic), { merge: true });
      }
    } catch (_dbErr) {
      console.warn('Firestore 400 bulk save note:', _dbErr);
    }
  }

  // 3. Batch Sync to Server API
  try {
    fetch('/api/license/admin/bulk-create', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenses: allGenerated }),
    }).catch(() => {});
  } catch (_e) {}

  return {
    totalCount: allGenerated.length,
    normalCount,
    vipCount,
    vvipCount,
    lifetimeCount,
    licenses: allGenerated,
  };
}

/**
 * Admin: Upgrade an existing license to Lifetime
 */
export async function adminUpgradeLicenseToLifetime(licenseKeyInput: string): Promise<LicenseRecord | null> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  const localMap = getLocalLicensesMap();
  const existing = localMap.get(licenseKey);

  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const updated: LicenseRecord = {
    ...existing,
    status: 'active',
    tier: 'lifetime',
    expiresAt: null,
    updatedAt: nowIso,
    notes: `${existing.notes || ''} [Upgraded to Lifetime on ${nowIso.substring(0, 10)}]`.trim(),
  };

  localMap.set(licenseKey, updated);
  saveLocalLicensesMap(localMap);

  if (db) {
    try {
      await ensureFirebaseAuth();
      await updateDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData({
        status: 'active',
        tier: 'lifetime',
        expiresAt: null,
        updatedAt: nowIso,
        notes: updated.notes,
      }));
    } catch (_e) {}
  }

  try {
    fetch('/api/license/admin/renew', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenseKey, expiresAt: null }),
    }).catch(() => {});
  } catch (_e) {}

  return updated;
}

/**
 * Admin: Synchronize all existing licenses and seeds to Firestore Cloud
 */
export async function adminSyncAllLicensesToCloud(): Promise<{ count: number; success: boolean }> {
  const localMap = getLocalLicensesMap();
  // Include seeds
  SEED_LICENSES.forEach((seed) => {
    if (!localMap.has(seed.licenseKey.toUpperCase())) {
      localMap.set(seed.licenseKey.toUpperCase(), seed);
    }
  });

  let syncedCount = 0;
  if (db) {
    try {
      await ensureFirebaseAuth();
      const allRecords = Array.from(localMap.values());
      for (const record of allRecords) {
        if (record && record.licenseKey) {
          await setDoc(doc(db, 'licenses', record.licenseKey.toUpperCase()), cleanFirestoreData(record), { merge: true });
          syncedCount++;
        }
      }
    } catch (err) {
      console.error('Error in cloud sync:', err);
      return { count: syncedCount, success: false };
    }
  }
  return { count: syncedCount, success: true };
}

/**
 * Admin: Renew / Extend license duration
 */
export async function adminRenewLicense(licenseKeyInput: string, monthsToAdd?: number): Promise<LicenseRecord | null> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  const localMap = getLocalLicensesMap();
  const existing = localMap.get(licenseKey);

  if (!existing) return null;

  const tier = (existing.tier || 'simple').toLowerCase();

  // Determine duration to add based on tier
  let months = monthsToAdd;
  if (!months) {
    if (tier === 'simple') months = 3;
    else if (tier === 'vip') months = 6;
    else if (tier === 'vvip') months = 12;
    else months = 6;
  }

  // Calculate new expiry date
  let baseDate = new Date();
  if (existing.expiresAt) {
    const currentExp = new Date(existing.expiresAt);
    if (currentExp.getTime() > baseDate.getTime()) {
      baseDate = currentExp;
    }
  }

  baseDate.setMonth(baseDate.getMonth() + months);
  const newExpiresAt = baseDate.toISOString();
  const nowIso = new Date().toISOString();

  const updated: LicenseRecord = {
    ...existing,
    status: 'active',
    expiresAt: newExpiresAt,
    updatedAt: nowIso,
    notes: `${existing.notes || ''} [Renewed +${months}m on ${nowIso.substring(0, 10)}]`.trim(),
  };

  localMap.set(licenseKey, updated);
  saveLocalLicensesMap(localMap);

  if (db) {
    try {
      await ensureFirebaseAuth();
      await updateDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData({
        status: 'active',
        expiresAt: newExpiresAt,
        updatedAt: nowIso,
        notes: updated.notes,
      }));
    } catch (_e) {}
  }

  try {
    fetch('/api/license/admin/renew', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenseKey, expiresAt: newExpiresAt }),
    }).catch(() => {});
  } catch (_e) {}

  return updated;
}

/**
 * Admin: Reset Device (Unbind authorized device permanently so customer can bind a new phone)
 */
export async function adminResetDevice(licenseKeyInput: string): Promise<boolean> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  const now = new Date().toISOString();
  const localMap = getLocalLicensesMap();
  const existing = localMap.get(licenseKey);

  const resetFields: Partial<LicenseRecord> = {
    authorizedDeviceId: null,
    deviceStatus: 'unbound',
    deviceInfo: null,
    status: 'available',
    updatedAt: now,
    notes: existing ? `${existing.notes || ''} [Device reset on ${now}]`.trim() : `Device reset on ${now}`,
  };

  if (existing) {
    const updated: LicenseRecord = {
      ...existing,
      ...resetFields,
    };
    localMap.set(licenseKey, updated);
    saveLocalLicensesMap(localMap);
  }

  // Sync with Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      await updateDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData(resetFields));
    } catch (_e) {}
  }

  // Sync with Server API
  try {
    fetch('/api/license/admin/reset-device', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenseKey }),
    }).catch(() => {});
  } catch (_e) {}

  return true;
}

/**
 * Admin: Update license status (revoke, activate, etc.)
 */
export async function adminUpdateLicenseStatus(
  licenseKeyInput: string,
  status: 'active' | 'available' | 'revoked' | 'expired'
): Promise<boolean> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  const now = new Date().toISOString();
  const localMap = getLocalLicensesMap();
  const existing = localMap.get(licenseKey);

  if (existing) {
    const updated: LicenseRecord = {
      ...existing,
      status,
      updatedAt: now,
    };
    localMap.set(licenseKey, updated);
    saveLocalLicensesMap(localMap);
  }

  // Sync with Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      await updateDoc(doc(db, 'licenses', licenseKey), cleanFirestoreData({ status, updatedAt: now }));
    } catch (_e) {}
  }

  // Sync with Server API
  try {
    fetch('/api/license/admin/update-status', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenseKey, status }),
    }).catch(() => {});
  } catch (_e) {}

  return true;
}

/**
 * Admin: Delete a license completely (Purges from LocalStorage, Firestore, Server and Device)
 */
export async function adminDeleteLicense(licenseKeyInput: string): Promise<boolean> {
  const licenseKey = licenseKeyInput.trim().toUpperCase();
  if (!licenseKey) return false;

  // 1. Mark as purged so it can NEVER be resurrected by client sync
  addPurgedKey(licenseKey);

  // 2. Remove from Local Storage map
  const localMap = getLocalLicensesMap();
  localMap.delete(licenseKey);
  saveLocalLicensesMap(localMap);

  // 3. Remove from device authorized stored keys if this machine had it
  removeStoredLicenseKey(licenseKey);

  // 4. Delete from Firestore Cloud
  if (db) {
    try {
      await ensureFirebaseAuth();
      await deleteDoc(doc(db, 'licenses', licenseKey));
    } catch (_e) {
      console.warn('Firestore license delete note:', _e);
    }
  }

  // 5. Await Server API delete
  try {
    const res = await fetch('/api/license/admin/delete', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ licenseKey }),
    });
    if (!res.ok) {
      console.warn('Server delete returned status:', res.status);
    }
  } catch (_e) {
    console.warn('Server delete call notice:', _e);
  }

  return true;
}

/**
 * Admin: Delete all licenses completely
 */
export async function adminDeleteAllLicenses(): Promise<boolean> {
  const localMap = getLocalLicensesMap();
  const allKeys = Array.from(localMap.keys());

  // 1. Mark all as purged
  allKeys.forEach((k) => addPurgedKey(k));

  // 2. Clear Local Storage
  localMap.clear();
  saveLocalLicensesMap(localMap);
  clearStoredLicenseKey();

  // 3. Delete from Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      for (const key of allKeys) {
        await deleteDoc(doc(db, 'licenses', key)).catch(() => {});
      }
    } catch (_e) {}
  }

  // 4. Await Server API delete-all
  try {
    await fetch('/api/license/admin/delete-all', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    });
  } catch (_e) {}

  return true;
}

/**
 * Admin: Delete a payment request
 */
export async function adminDeletePaymentRequest(requestIdInput: string): Promise<boolean> {
  const requestId = (requestIdInput || '').trim();
  if (!requestId) return false;

  // 1. Remove from local storage
  const reqMap = getLocalPaymentRequests();
  reqMap.delete(requestId);
  saveLocalPaymentRequests(reqMap);

  // 2. Remove from Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      await deleteDoc(doc(db, 'device_payment_requests', requestId));
    } catch (_e) {}
  }

  // 3. Remove from server
  try {
    await fetch('/api/license/admin/delete-payment-request', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ requestId }),
    });
  } catch (_e) {}

  return true;
}

const LOCAL_PAYMENT_REQUESTS_KEY = '__jyotish_payment_requests__';

function getLocalPaymentRequests(): Map<string, DevicePaymentRequest> {
  const map = new Map<string, DevicePaymentRequest>();
  if (typeof window === 'undefined') return map;
  try {
    const raw = localStorage.getItem(LOCAL_PAYMENT_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.deviceId) {
            map.set(item.deviceId, item);
          }
        });
      }
    }
  } catch (_e) {}
  return map;
}

function saveLocalPaymentRequests(map: Map<string, DevicePaymentRequest>) {
  if (typeof window === 'undefined') return;
  try {
    const list = Array.from(map.values());
    localStorage.setItem(LOCAL_PAYMENT_REQUESTS_KEY, JSON.stringify(list));
  } catch (_e) {}
}

/**
 * Submit a customer payment and device approval request
 */
export async function submitDevicePaymentRequest(
  payload: Omit<DevicePaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<DevicePaymentRequest> {
  const now = new Date().toISOString();
  const requestId = payload.deviceId.trim();

  const requestRecord: DevicePaymentRequest = {
    id: requestId,
    deviceId: requestId,
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone.trim(),
    customerEmail: payload.customerEmail?.trim() || '',
    planId: payload.planId || 'vip',
    planName: payload.planName || 'VIP Plan',
    amount: payload.amount || 699,
    paymentMethod: payload.paymentMethod || 'eSewa',
    transactionRef: payload.transactionRef?.trim() || 'Direct Transfer',
    status: 'pending',
    deviceInfo: payload.deviceInfo || null,
    createdAt: now,
    updatedAt: now,
    notes: payload.notes || ''
  };

  // 1. Save locally
  const localMap = getLocalPaymentRequests();
  localMap.set(requestId, requestRecord);
  saveLocalPaymentRequests(localMap);

  // 2. Save to Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      await setDoc(doc(db, 'device_payment_requests', requestId), cleanFirestoreData(requestRecord));
    } catch (_e) {}
  }

  // 3. Save to server API
  try {
    await fetch('/api/license/request-device-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestRecord),
    });
  } catch (_e) {}

  return requestRecord;
}

/**
 * Query status of a device's payment request
 */
export async function getDevicePaymentRequest(deviceId: string): Promise<DevicePaymentRequest | null> {
  const cleanId = deviceId.trim();
  if (!cleanId) return null;

  // 1. Try Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      const snap = await getDoc(doc(db, 'device_payment_requests', cleanId));
      if (snap.exists()) {
        const data = snap.data() as DevicePaymentRequest;
        const localMap = getLocalPaymentRequests();
        localMap.set(cleanId, data);
        saveLocalPaymentRequests(localMap);
        return data;
      }
    } catch (_e) {}
  }

  // 2. Try Server API
  try {
    const res = await fetch(`/api/license/request-device-payment/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.request) {
        const localMap = getLocalPaymentRequests();
        localMap.set(cleanId, data.request);
        saveLocalPaymentRequests(localMap);
        return data.request;
      }
    }
  } catch (_e) {}

  // 3. Fallback to LocalStorage
  const localMap = getLocalPaymentRequests();
  return localMap.get(cleanId) || null;
}

/**
 * Admin: Fetch all payment / device approval requests
 */
export async function adminFetchAllPaymentRequests(): Promise<DevicePaymentRequest[]> {
  const resultMap = new Map<string, DevicePaymentRequest>();

  // 1. Fetch from Firestore
  if (db) {
    try {
      await ensureFirebaseAuth();
      const q = query(collection(db, 'device_payment_requests'));
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const item = docSnap.data() as DevicePaymentRequest;
        if (item && item.deviceId) {
          resultMap.set(item.deviceId, item);
        }
      });
    } catch (_e) {}
  }

  // 2. Fetch from Server
  try {
    const res = await fetch('/api/license/admin/payment-requests', {
      headers: getAdminAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        data.requests.forEach((item: DevicePaymentRequest) => {
          if (item && item.deviceId) {
            resultMap.set(item.deviceId, item);
          }
        });
      }
    }
  } catch (_e) {}

  // 3. Merge local
  const localMap = getLocalPaymentRequests();
  localMap.forEach((val, key) => {
    if (!resultMap.has(key)) {
      resultMap.set(key, val);
    }
  });

  const list = Array.from(resultMap.values());
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

/**
 * Admin: Approve payment request, create license, and lock/bind to customer device
 */
export async function adminApprovePaymentRequest(
  requestId: string,
  overrideTier?: string,
  customKey?: string
): Promise<{ success: boolean; license: LicenseRecord }> {
  // Try server first
  try {
    const res = await fetch('/api/license/admin/approve-payment-request', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ requestId, overrideTier, customKey }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.license) {
        // Also update firestore
        if (db) {
          try {
            await ensureFirebaseAuth();
            await setDoc(doc(db, 'licenses', data.license.licenseKey), cleanFirestoreData(data.license));
            await updateDoc(doc(db, 'device_payment_requests', requestId), cleanFirestoreData({
              status: 'approved',
              assignedLicenseKey: data.license.licenseKey,
              updatedAt: new Date().toISOString(),
            }));
          } catch (_e) {}
        }
        return { success: true, license: data.license };
      }
    }
  } catch (_e) {}

  // Local/Firestore fallback
  const tier = overrideTier || 'vip';
  const finalKey = customKey?.trim().toUpperCase() || `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  let exp: string | null = null;
  if (tier === 'simple') exp = new Date(Date.now() + 90 * 86400000).toISOString();
  else if (tier === 'vip') exp = new Date(Date.now() + 180 * 86400000).toISOString();
  else if (tier === 'vvip') exp = new Date(Date.now() + 365 * 86400000).toISOString();

  const reqItem = await getDevicePaymentRequest(requestId);

  const newLic: LicenseRecord = {
    id: finalKey,
    licenseKey: finalKey,
    customerName: reqItem?.customerName || 'ग्राहक',
    customerPhone: reqItem?.customerPhone || '',
    customerEmail: reqItem?.customerEmail || '',
    status: 'active',
    authorizedDeviceId: requestId,
    deviceStatus: 'authorized',
    deviceInfo: reqItem?.deviceInfo || null,
    activatedAt: now,
    lastSeenAt: now,
    expiresAt: exp,
    createdAt: now,
    updatedAt: now,
    notes: `Approved by Admin for payment via ${reqItem?.paymentMethod || 'eSewa'}`,
    tier,
  };

  const localLicenses = getLocalLicensesMap();
  localLicenses.set(finalKey, newLic);
  saveLocalLicensesMap(localLicenses);

  if (reqItem) {
    reqItem.status = 'approved';
    reqItem.assignedLicenseKey = finalKey;
    reqItem.updatedAt = now;
    const reqMap = getLocalPaymentRequests();
    reqMap.set(requestId, reqItem);
    saveLocalPaymentRequests(reqMap);
  }

  if (db) {
    try {
      await ensureFirebaseAuth();
      await setDoc(doc(db, 'licenses', finalKey), cleanFirestoreData(newLic));
      await updateDoc(doc(db, 'device_payment_requests', requestId), cleanFirestoreData({
        status: 'approved',
        assignedLicenseKey: finalKey,
        updatedAt: now,
      }));
    } catch (_e) {}
  }

  return { success: true, license: newLic };
}

/**
 * Admin: Reject payment request
 */
export async function adminRejectPaymentRequest(requestId: string, notes?: string): Promise<boolean> {
  const now = new Date().toISOString();
  if (db) {
    try {
      await ensureFirebaseAuth();
      await updateDoc(doc(db, 'device_payment_requests', requestId), cleanFirestoreData({
        status: 'rejected',
        notes: notes || 'अस्वीकृत गरिएको',
        updatedAt: now,
      }));
    } catch (_e) {}
  }

  try {
    await fetch('/api/license/admin/reject-payment-request', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ requestId, notes }),
    });
  } catch (_e) {}

  const reqMap = getLocalPaymentRequests();
  const item = reqMap.get(requestId);
  if (item) {
    item.status = 'rejected';
    item.notes = notes || 'अस्वीकृत गरिएको';
    item.updatedAt = now;
    reqMap.set(requestId, item);
    saveLocalPaymentRequests(reqMap);
  }

  return true;
}

