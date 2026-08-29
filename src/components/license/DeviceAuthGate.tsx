import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Smartphone,
  Lock,
  Compass,
  KeyRound,
  User,
  AlertTriangle,
  Calendar,
  Clock,
  Zap,
  Crown,
  Award,
  X,
  Check,
  ExternalLink,
  Gift,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { DeviceAuthorizationResult, Language, LicenseRecord } from '../../types';
import {
  extractLicenseKeyFromUrl,
  getStoredLicenseKey,
  setStoredLicenseKey,
  clearStoredLicenseKey,
  getOrCreateDeviceId,
  getStoredLicenseKeysList,
} from '../../lib/deviceSecurity';
import {
  verifyOrActivateLicense,
  getLicenseExpiryInfo,
  findBestActiveLicenseForDevice,
  getAllDeviceLicenses,
  isSecretMasterKey,
  getLocalLicensesMap,
} from '../../lib/licenseService';
import { UnauthorizedDeviceScreen } from './UnauthorizedDeviceScreen';
import { AdminLicenseManager } from './AdminLicenseManager';
import { useAuth, SUPER_ADMIN_EMAIL } from '../../context/AuthContext';
import { AuthModal } from '../common/AuthModal';
import { useSubscription } from '../../context/SubscriptionContext';

interface Props {
  children: React.ReactNode;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
}

const OWNER_MASTER_STORAGE_KEY = '__jyotish_owner_master_device__';

export const DeviceAuthGate: React.FC<Props> = ({
  children,
  language,
}) => {
  const { currentUser, isAdmin, openAuthModal, loginAsSuperAdmin } = useAuth();
  const { isSubscribed, openSubscriptionModal, redeemCodeAsync } = useSubscription();
  
  const [authStatus, setAuthStatus] = useState<'INITIALIZING' | 'VERIFYING' | 'AUTHORIZED' | 'UNAUTHORIZED'>(() => {
    if (typeof window === 'undefined') return 'INITIALIZING';
    try {
      const isOwner = localStorage.getItem(OWNER_MASTER_STORAGE_KEY) === 'true' || getStoredLicenseKey() === '2M2DU6HKX9';
      if (isOwner) return 'AUTHORIZED';
      if (localStorage.getItem('astro_lifetime_active') === 'true') {
        return 'AUTHORIZED';
      }
      const stored = getStoredLicenseKey();
      if (stored) {
        // Fast instant unlock on authorized device without annoying login prompts
        return 'AUTHORIZED';
      }
    } catch (_e) {}
    return 'UNAUTHORIZED';
  });
  const [authResult, setAuthResult] = useState<DeviceAuthorizationResult | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = getStoredLicenseKey();
    if (stored) {
      const { deviceId } = getOrCreateDeviceId();
      return {
        authorized: true,
        status: 'AUTHORIZED',
        licenseKey: stored,
        deviceId,
        messageNe: 'उपकरण प्रमाणीकरण सफल भयो।',
        messageEn: 'Device verified successfully.',
      };
    }
    return null;
  });
  const [activeKey, setActiveKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return getStoredLicenseKey();
    }
    return null;
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [deviceLicenses, setDeviceLicenses] = useState<LicenseRecord[]>([]);
  const [showMultiKeyModal, setShowMultiKeyModal] = useState(false);
  const [showActivateKeyModal, setShowActivateKeyModal] = useState(false);
  const [manualKeyInput, setManualKeyInput] = useState('');
  const [manualKeyError, setManualKeyError] = useState<string | null>(null);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);

  const isNepali = language === 'ne';

  // Refresh list of all keys belonging to this physical device
  const refreshDeviceLicenses = useCallback(async () => {
    try {
      const list = await getAllDeviceLicenses();
      setDeviceLicenses(list);
    } catch (_e) {}
  }, []);

  // Perform full verification
  const performVerification = useCallback(async (keyToTest?: string, custName?: string, custPhone?: string) => {
    // 0. If this physical device is the Owner Master Device or User is already Super Admin:
    const isOwnerMasterDevice = typeof window !== 'undefined' && (
      localStorage.getItem(OWNER_MASTER_STORAGE_KEY) === 'true' ||
      getStoredLicenseKey() === '2M2DU6HKX9'
    );

    if (isAdmin || (currentUser?.email && currentUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) || isOwnerMasterDevice) {
      if (!isAdmin) {
        try {
          await loginAsSuperAdmin('2m2du6hkx9');
        } catch (_e) {}
      }
      setAuthStatus('AUTHORIZED');
      if (!activeKey) {
        setActiveKey('2M2DU6HKX9');
      }
      return;
    }

    // 1. Detect license key from URL first, then from persistent storage
    const urlKey = extractLicenseKeyFromUrl();
    const storedKey = getStoredLicenseKey();
    let effectiveKey = (keyToTest || urlKey || storedKey || '').trim().toUpperCase();

    // Check if effectiveKey or urlKey is the Secret Master Key (2M2DU6HKX9)
    if (isSecretMasterKey(effectiveKey) || (urlKey && isSecretMasterKey(urlKey))) {
      try {
        localStorage.setItem(OWNER_MASTER_STORAGE_KEY, 'true');
      } catch (_e) {}
      setStoredLicenseKey('2M2DU6HKX9');
      setActiveKey('2M2DU6HKX9');
      await loginAsSuperAdmin('2m2du6hkx9');
      setAuthStatus('AUTHORIZED');
      setIsAdminOpen(true); // Automatically open Admin Panel when master key is used!
      refreshDeviceLicenses();

      // Clean URL parameter
      if (urlKey && typeof window !== 'undefined' && window.history && window.history.replaceState) {
        try {
          const cleanUrl = window.location.pathname || '/';
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (_e) {}
      }
      return;
    }

    // If no key provided in URL or storage, check if there are other keys previously authorized on this device
    if (!effectiveKey) {
      const best = await findBestActiveLicenseForDevice();
      if (best?.licenseKey) {
        effectiveKey = best.licenseKey.toUpperCase();
        setStoredLicenseKey(effectiveKey);
      }
    }

    if (!effectiveKey) {
      setAuthStatus('UNAUTHORIZED');
      setAuthResult({
        authorized: false,
        status: 'INVALID_LICENSE',
        licenseKey: '',
        deviceId: getOrCreateDeviceId().deviceId,
        messageNe: 'एप प्रयोग गर्न कृपया आधिकारिक एक्टिभेसन कोड (Key) प्रविष्ट गर्नुहोस्।',
        messageEn: 'Please enter an authorized activation key to continue.',
      });
      refreshDeviceLicenses();
      return;
    }

    // Set status to verifying only if not already optimistically authorized
    setAuthStatus((prev) => (prev === 'AUTHORIZED' ? 'AUTHORIZED' : 'VERIFYING'));
    setActiveKey(effectiveKey);

    const nameToSend = custName || currentUser?.customerName || currentUser?.displayName || undefined;
    const phoneToSend = custPhone || currentUser?.customerPhone || currentUser?.phoneNumber || undefined;
    const emailToSend = currentUser?.email || undefined;

    try {
      const result = await verifyOrActivateLicense(
        effectiveKey,
        nameToSend,
        phoneToSend,
        emailToSend
      );
      setAuthResult(result);

      if (result.authorized) {
        setAuthStatus('AUTHORIZED');
        setStoredLicenseKey(effectiveKey);
        setIsOffline(false);
        refreshDeviceLicenses();

        // If key came from URL, clean the query parameter so address bar is clean
        if (urlKey && typeof window !== 'undefined' && window.history && window.history.replaceState) {
          try {
            const cleanUrl = window.location.pathname || '/';
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (_e) {}
        }
      } else {
        // If effectiveKey failed, but the user came directly without URL params,
        // see if another valid key exists on this device
        if (!urlKey && !keyToTest) {
          const alternate = await findBestActiveLicenseForDevice();
          if (alternate?.licenseKey && alternate.licenseKey.toUpperCase() !== effectiveKey) {
            const altResult = await verifyOrActivateLicense(
              alternate.licenseKey,
              nameToSend,
              phoneToSend,
              emailToSend
            );
            if (altResult.authorized) {
              setAuthResult(altResult);
              setAuthStatus('AUTHORIZED');
              setStoredLicenseKey(alternate.licenseKey);
              setActiveKey(alternate.licenseKey);
              refreshDeviceLicenses();
              return;
            }
          }
        }

        // If server explicitly declined (e.g. key locked to another phone or deleted)
        setAuthStatus('UNAUTHORIZED');
        refreshDeviceLicenses();
      }
    } catch (err: any) {
      console.error('Gate authorization error:', err);
      // Offline fallback: ONLY if previously confirmed & authorized on THIS specific device!
      const currentDevId = getOrCreateDeviceId().deviceId;
      const localLic = getStoredLicenseKey() ? getLocalLicensesMap().get(effectiveKey) : null;
      const isBoundToThisDevice = localLic && localLic.authorizedDeviceId === currentDevId && localLic.status === 'active';

      if (!navigator.onLine && storedKey && storedKey === effectiveKey && isBoundToThisDevice) {
        setIsOffline(true);
        setAuthStatus('AUTHORIZED');
      } else {
        if (!navigator.onLine) {
          setIsOffline(true);
        }
        setAuthStatus('UNAUTHORIZED');
        setAuthResult({
          authorized: false,
          status: 'OFFLINE_UNVERIFIED',
          licenseKey: effectiveKey,
          deviceId: currentDevId,
          messageNe: 'नेटवर्क वा प्रमाणीकरण सर्भरसँग सम्पर्क हुन सकेन। कृपया इन्टरनेट जाँच गर्नुहोस्।',
          messageEn: 'Unable to contact verification server. Please check your internet connection.',
        });
      }
      refreshDeviceLicenses();
    }
  }, [currentUser, isAdmin, loginAsSuperAdmin, refreshDeviceLicenses, activeKey]);

  useEffect(() => {
    performVerification();
    refreshDeviceLicenses();

    // Listen to online / offline events
    const handleOnline = () => performVerification();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [performVerification, refreshDeviceLicenses]);

  const handleManualKeySubmit = async (newKey: string, custName?: string, custPhone?: string) => {
    const clean = (newKey || '').trim().toUpperCase().replace(/[\s\-_]/g, '');
    if (!clean) return;

    // Master Key check (Unrestricted on any and unlimited devices)
    if (clean === '2M2DU6HKX9') {
      try {
        localStorage.setItem(OWNER_MASTER_STORAGE_KEY, 'true');
      } catch (_e) {}
      setStoredLicenseKey('2M2DU6HKX9');
      setActiveKey('2M2DU6HKX9');
      await loginAsSuperAdmin('2m2du6hkx9');
      setAuthStatus('AUTHORIZED');
      setIsAdminOpen(true);
      return;
    }

    // For all 80 lifetime keys & custom licenses: strictly verify device authorization (1 Key = 1 Device)
    setStoredLicenseKey(clean);
    await performVerification(clean, custName, custPhone);
  };

  const handleAdminSelectLicense = (key: string) => {
    setStoredLicenseKey(key);
    setIsAdminOpen(false);
    performVerification(key);
  };

  const handleModalCodeActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualKeyError(null);
    const clean = manualKeyInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
    if (!clean) {
      setManualKeyError(isNepali ? 'कृपया आधिकारिक कोड (Key) राख्नुहोस्।' : 'Please enter code.');
      return;
    }
    setIsManualSubmitting(true);
    try {
      if (clean === '2M2DU6HKX9') {
        localStorage.setItem(OWNER_MASTER_STORAGE_KEY, 'true');
        await loginAsSuperAdmin('2m2du6hkx9');
        setStoredLicenseKey(clean);
        setActiveKey(clean);
        setShowActivateKeyModal(false);
        setIsAdminOpen(true);
        setAuthStatus('AUTHORIZED');
        try {
          await redeemCodeAsync(clean);
        } catch (_e) {}
        return;
      }
      
      const res = await redeemCodeAsync(clean);
      if (!res.success) {
        setManualKeyError(isNepali ? res.messageNe : res.messageEn);
        return;
      }

      await handleManualKeySubmit(clean);
      setShowActivateKeyModal(false);
      setAuthStatus('AUTHORIZED');
      setActiveKey(clean);
      setManualKeyInput('');
    } catch (err: any) {
      setManualKeyError(err?.message || (isNepali ? 'एक्टिभेसन गर्न सकिएन।' : 'Activation failed.'));
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const isDeviceAuthorized = authStatus === 'AUTHORIZED' && (authResult?.authorized || isSubscribed);
  const expiryInfo = getLicenseExpiryInfo(authResult?.license);

  // 1. Initializing / Verifying state with stored key
  if (authStatus === 'INITIALIZING' || (authStatus === 'VERIFYING' && !activeKey)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse shadow-xl">
              <KeyRound className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-amber-500 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-300">
              {isNepali ? 'इजाजतपत्र प्रमाणीकरण हुँदैछ...' : 'Verifying Device License...'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isNepali ? 'कृपया केही सेकेन्ड पर्खनुहोस्' : 'Please wait a moment'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Application with appropriate status bar and modals
  return (
    <div className="relative min-h-screen">
      {/* Top Status Bar */}
      {isDeviceAuthorized ? (
        /* Authorized Status Bar */
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 text-xs text-slate-300 flex items-center justify-between shadow-sm z-30 relative">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {isNepali ? 'सुरक्षित उपकरण (Trusted Device)' : 'Trusted Device Authorized'}
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline font-mono text-amber-300/90 text-[11px]">
              Key: {isSecretMasterKey(authResult?.licenseKey || activeKey || '') ? (isNepali ? 'मास्टर (Admin)' : 'MASTER (Admin)') : (authResult?.licenseKey || activeKey)}
            </span>
            {authResult?.customerName && (
              <span className="hidden sm:inline text-slate-300 text-[11px]">
                ({authResult.customerName})
              </span>
            )}
            {/* Active Tier Pill */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-semibold">
              {expiryInfo.tier === 'vvip' ? <Crown className="w-3 h-3 text-purple-400" /> : expiryInfo.tier === 'vip' ? <Sparkles className="w-3 h-3 text-amber-400" /> : expiryInfo.tier === 'simple' ? <Zap className="w-3 h-3 text-emerald-400" /> : <Award className="w-3 h-3 text-blue-400" />}
              {isNepali ? expiryInfo.tierNameNe : expiryInfo.tierNameEn}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Multi-Key Device Pill if customer has multiple registered keys on this device */}
            {deviceLicenses.length > 1 && (
              <button
                onClick={() => setShowMultiKeyModal(true)}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
                title={isNepali ? 'यस यन्त्रमा उपलब्ध Key हरू' : 'Available Keys on this Device'}
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>
                  {isNepali ? `${deviceLicenses.length} वटा Key` : `${deviceLicenses.length} Keys`}
                </span>
              </button>
            )}

            {/* Change / Add Code Button */}
            <button
              onClick={() => setShowActivateKeyModal(true)}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer"
              title={isNepali ? 'नयाँ Key हाल्नुहोस्' : 'Enter another key'}
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{isNepali ? 'Key बदल्नुहोस्' : 'Switch Key'}</span>
            </button>

            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border shadow-sm transition cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300"
                title={isNepali ? 'इजाजतपत्र व्यवस्थापन (Admin)' : 'Admin License Manager'}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isNepali ? 'व्यवस्थापन (Admin)' : 'Admin'}</span>
              </button>
            )}

            {/* User Account / Switcher Pill */}
            <button
              onClick={openAuthModal}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border transition shadow-sm cursor-pointer ${
                isAdmin
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={
                currentUser
                  ? `Active: ${currentUser.customerName || currentUser.displayName || currentUser.email || 'Customer'}`
                  : 'Sign in / Switch Account'
              }
            >
              <User className="w-3 h-3 text-amber-400" />
              <span className="max-w-[120px] sm:max-w-[170px] truncate">
                {currentUser
                  ? (currentUser.customerName || currentUser.displayName || currentUser.email)
                  : (isNepali ? 'ग्राहक विवरण' : 'Customer Profile')}
              </span>
              {isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Free Mode Top Bar with Quick Activation and WhatsApp link */
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-950 to-stone-900 border-b border-amber-500/30 px-3 sm:px-6 py-1.5 text-xs text-amber-200 flex items-center justify-between shadow-sm z-30 relative">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isNepali ? 'निःशुल्क संस्करण (Free Mode)' : 'Free Mode'}
            </span>
            <span className="hidden md:inline text-amber-400/70 text-[11px]">
              {isNepali ? '• १७ कुण्डली र वार्षिक फलितका लागि कोड आवश्यक छ' : '• 17 Kundali & Yearly Phalit require license code'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Activate Code Button */}
            <button
              onClick={() => setShowActivateKeyModal(true)}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>{isNepali ? '🔑 कोड हाल्नुहोस्' : 'Enter Code'}</span>
            </button>

            {/* WhatsApp Request Link */}
            <a
              href={`https://wa.me/9779863991384?text=${encodeURIComponent(`नमस्ते पण्डित ज्यू! मलाई ज्योतिष एपको १७ कुण्डली र फलित सुविधाहरू अनलक गर्न आधिकारिक कोड (Key) चाहिएको छ। Device ID: ${getOrCreateDeviceId().deviceId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{isNepali ? '💬 ह्वाट्सएप: ९८६३९९१३८४' : 'WhatsApp'}</span>
            </a>

            {/* Admin Login / Manage */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdminOpen(true);
                } else {
                  openAuthModal();
                }
              }}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <User className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{isAdmin ? (isNepali ? 'व्यवस्थापन (Admin)' : 'Admin') : (isNepali ? 'लगइन' : 'Login')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Renewal Notification Bar (Shown ONLY for Simple / VIP / VVIP when expiring soon; NEVER for Lifetime) */}
      {!expiryInfo.isLifetime && expiryInfo.shouldShowRenewNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-6 py-2 text-xs text-amber-200 flex items-center justify-between gap-2 z-20 relative animate-fadeIn">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>
              {isNepali
                ? `सूचना: तपाईंको ${expiryInfo.tierNameNe} (${expiryInfo.durationNe}) को म्याद ${expiryInfo.daysRemaining === 0 ? 'आज' : `${expiryInfo.daysRemaining} दिनमा`} समाप्त हुँदैछ। निरन्तर सेवाको लागि कृपया Renew (नवीकरण) गर्नुहोस्।`
                : `Notice: Your ${expiryInfo.tierNameEn} plan expires in ${expiryInfo.daysRemaining} days (${expiryInfo.formattedExpiryEn}). Please contact admin to renew.`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-300/80 shrink-0">
            {isNepali ? `अन्तिम मिति: ${expiryInfo.formattedExpiryNe}` : `Exp: ${expiryInfo.formattedExpiryEn}`}
          </span>
        </div>
      )}

      {/* Main Astrology Protected App */}
      {children}

      {/* Enter License Key Modal (For fast switching or updating key) */}
      {showActivateKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200 text-sm">
                    {isNepali ? 'आधिकारिक कोड प्रविष्ट गर्नुहोस्' : 'Enter Official Activation Code'}
                  </h3>
                  <p className="text-[11px] text-amber-400/80">
                    {isNepali ? 'असीमित चिना र सम्पूर्ण सुविधाहरू अनलक गर्नुहोस्' : 'Unlock unlimited kundali & full features'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowActivateKeyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalCodeActivate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">
                  {isNepali ? 'एक्टिभेसन कोड (Activation Code):' : 'Activation Code:'}
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={manualKeyInput}
                  onChange={(e) => setManualKeyInput(e.target.value.toUpperCase())}
                  placeholder={isNepali ? 'यहाँ कोड राख्नुहोस्' : 'Enter code here'}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-amber-500/50 focus:border-amber-400 rounded-xl text-amber-200 font-mono text-center text-base tracking-widest uppercase outline-none font-bold shadow-inner"
                />
              </div>

              {manualKeyError && (
                <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{manualKeyError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isManualSubmitting || !manualKeyInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isManualSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isNepali ? 'कोड प्रमाणित गरी अनलक गर्नुहोस्' : 'Activate & Unlock'}</span>
              </button>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>पण्डित शम्भु प्रसाद लम्साल</span>
                <a href="tel:9863991384" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> ९८६३९९१३८४
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      <AdminLicenseManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        onSelectLicenseToUse={handleAdminSelectLicense}
      />

      {/* Global Auth Modal for Login & Account Switch */}
      <AuthModal
        language={language}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
      />

      {/* Multi-Key Switcher Modal for Customer Device */}
      {showMultiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200 text-sm">
                    {isNepali ? 'यस उपकरणमा दर्ता भएका Key हरू' : 'Registered Keys on this Device'}
                  </h3>
                  <p className="text-[11px] text-amber-400/80">
                    {isNepali ? 'तपाईँले खरिद गर्नुभएका सबै लिंक तथा Key हरू' : 'All purchased links & keys for your device'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMultiKeyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed">
                {isNepali
                  ? 'तपाईँले खरिद गर्नुभएका कुनै पनि लिंक वा Key बाट यो डिभाइसमा एप खोल्न मिल्छ। हाल सक्रिय Key तल देखाइएको छ:'
                  : 'You can open this app using any of your purchased links or keys. Active key is highlighted below:'}
              </p>

              <div className="space-y-2">
                {deviceLicenses.map((lic) => {
                  const isActive = (authResult?.licenseKey || activeKey)?.toUpperCase() === lic.licenseKey.toUpperCase();
                  const tier = (lic.tier || 'lifetime').toLowerCase();
                  const expInfo = getLicenseExpiryInfo(lic);

                  return (
                    <div
                      key={lic.licenseKey}
                      className={`p-3 rounded-xl border transition ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-amber-300">
                            {lic.licenseKey}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            {isNepali ? expInfo.tierNameNe : expInfo.tierNameEn}
                          </span>
                        </div>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            {isNepali ? 'हाल सक्रिय' : 'Active'}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        {lic.customerName && (
                          <span>
                            {isNepali ? 'ग्राहक:' : 'Name:'} <strong className="text-slate-300">{lic.customerName}</strong>
                          </span>
                        )}
                        <span>
                          {isNepali ? 'म्याद:' : 'Validity:'}{' '}
                          <strong className="text-slate-300">
                            {expInfo.isLifetime
                              ? (isNepali ? 'आजीवन (Lifetime)' : 'Lifetime')
                              : (isNepali ? expInfo.formattedExpiryNe : expInfo.formattedExpiryEn)}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setStoredLicenseKey(lic.licenseKey);
                              setShowMultiKeyModal(false);
                              performVerification(lic.licenseKey);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <span>{isNepali ? 'यस Key मा स्विच गर्नुहोस्' : 'Switch to this Key'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}?key=${encodeURIComponent(lic.licenseKey)}`;
                            navigator.clipboard.writeText(url);
                            setCopiedLinkKey(lic.licenseKey);
                            setTimeout(() => setCopiedLinkKey(null), 2500);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1 border border-slate-700 transition cursor-pointer"
                          title={isNepali ? 'यस Key को लिंक कपि गर्नुहोस्' : 'Copy direct link'}
                        >
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>
                            {copiedLinkKey === lic.licenseKey
                              ? (isNepali ? '✓ कपि भयो!' : '✓ Copied!')
                              : (isNepali ? 'लिंक कपि' : 'Copy Link')}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin License Manager Modal */}
      <AdminLicenseManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        onSelectLicenseToUse={handleAdminSelectLicense}
      />

      {/* User / Customer Profile Auth Modal */}
      <AuthModal
        language={language}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
      />
    </div>
  );
};
