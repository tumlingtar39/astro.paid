import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  AlertTriangle,
  Key,
  RefreshCw,
  Lock,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Gift,
  Check
} from 'lucide-react';
import { DeviceAuthorizationResult, Language, LicenseRecord } from '../../types';
import { getOrCreateDeviceId } from '../../lib/deviceSecurity';
import { getAllDeviceLicenses } from '../../lib/licenseService';
import { useAuth } from '../../context/AuthContext';
import { getTrialState, startFreeTrial, FREE_TRIAL_MAX_CHINA, TrialState } from '../../lib/trialService';

interface Props {
  authResult: DeviceAuthorizationResult | null;
  language: Language;
  onRetry: () => void;
  onSubmitNewKey: (key: string, customerName?: string, customerPhone?: string) => void;
  onOpenAdmin?: () => void;
  onStartFreeTrial?: () => void;
}

export const UnauthorizedDeviceScreen: React.FC<Props> = ({
  authResult,
  language,
  onRetry,
  onSubmitNewKey,
  onOpenAdmin,
  onStartFreeTrial,
}) => {
  const { loginAsSuperAdmin } = useAuth();

  // Single Activation Code Input State
  const [activationCode, setActivationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDevId, setCopiedDevId] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedDeviceLicenses, setSavedDeviceLicenses] = useState<LicenseRecord[]>([]);
  const [trialState, setTrialState] = useState<TrialState>(() => getTrialState());

  const { deviceId } = getOrCreateDeviceId();
  const isNepali = language === 'ne';

  // Load trial state and any previously registered keys on this device
  useEffect(() => {
    setTrialState(getTrialState());
    getAllDeviceLicenses(deviceId).then((list) => {
      setSavedDeviceLicenses(list);
    });

    const handleTrialUpdate = (e: any) => {
      setTrialState(e?.detail || getTrialState());
    };
    window.addEventListener('jyotish_trial_updated', handleTrialUpdate);
    return () => window.removeEventListener('jyotish_trial_updated', handleTrialUpdate);
  }, [deviceId]);

  // Check URL or existing authResult on mount
  useEffect(() => {
    if (authResult?.licenseKey) {
      setActivationCode(authResult.licenseKey);
    }
  }, [authResult]);

  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanKey = activationCode.trim().toUpperCase();

    if (!cleanKey) {
      setFormError(
        isNepali
          ? 'कृपया आधिकारिक एक्टिभेसन कोड (Activation Code) प्रविष्ट गर्नुहोस्।'
          : 'Please enter a valid Activation Code.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for Master Key
      if (cleanKey === '2M2DU6HKX9') {
        try {
          localStorage.setItem('__jyotish_owner_master_device__', 'true');
        } catch (_e) {}
        await loginAsSuperAdmin('2m2du6hkx9');
        onSubmitNewKey(cleanKey, 'पण्डित शम्भु प्रसाद लम्साल (Super Admin)', '9863991384');
        if (onOpenAdmin) {
          setTimeout(() => onOpenAdmin(), 100);
        }
        return;
      }

      // Submit customer activation code
      onSubmitNewKey(cleanKey);
    } catch (err: any) {
      setFormError(
        err?.message ||
          (isNepali ? 'एक्टिभेसन गर्न समस्या भयो।' : 'Activation failed.')
      );
    } finally {
      setTimeout(() => setIsSubmitting(false), 800);
    }
  };

  const handleFreeTrialClick = () => {
    if (trialState.exhausted) {
      setFormError(
        isNepali
          ? 'तपाईंको ३ वटा निःशुल्क चिना (Free Trial) को सीमा पूरा भइसकेको छ। कृपया एप खोल्न आधिकारिक कोड प्रविष्ट गर्नुहोस्।'
          : 'You have used all 3 free trial China. Please enter an activation code to unlock.'
      );
      return;
    }

    startFreeTrial();
    if (onStartFreeTrial) {
      onStartFreeTrial();
    } else {
      onRetry();
    }
  };

  const copyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDevId(true);
    setTimeout(() => setCopiedDevId(false), 2000);
  };

  const isBlockedDuplicate = authResult?.status === 'BLOCKED_DIFFERENT_DEVICE';
  const isRevoked = authResult?.status === 'REVOKED';
  const isExpired = authResult?.status === 'EXPIRED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden selection:bg-amber-500/30">
      {/* Background Vedic Geometric Ornaments */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.25),transparent_70%)]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-8 backdrop-blur-xl relative z-10 space-y-5">
        
        {/* Lock Screen Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                {isBlockedDuplicate ? (
                  <Smartphone className="w-8 h-8 text-rose-400 animate-pulse" />
                ) : isRevoked ? (
                  <Lock className="w-8 h-8 text-rose-500" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-rose-950 border border-rose-500 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isNepali ? 'सुरक्षित ज्योतिष सफ्टवेयर' : 'Jyotish Software Security'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isBlockedDuplicate
              ? isNepali
                ? 'यो कोड अर्को डिभाइसमा सक्रिय भइसकेको छ'
                : 'Code Active on Another Device'
              : isRevoked
              ? isNepali
                ? 'एक्टिभेसन कोड खारेज गरिएको छ'
                : 'Activation Code Revoked'
              : isExpired
              ? isNepali
                ? 'एक्टिभेसन कोड समाप्त भएको छ'
                : 'Activation Code Expired'
              : isNepali
              ? 'एप खोल्न एक्टिभेसन कोड प्रविष्ट गर्नुहोस्'
              : 'Enter Activation Code to Unlock'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
            {authResult?.messageNe ||
              (isNepali
                ? 'यो सफ्टवेयर प्रयोग गर्न आधिकारिक एक्टिभेसन कोड आवश्यक पर्दछ। एक पटक कोड हालेपछि यो तपाईंको डिभाइसमा मात्र सुरक्षित रूपमा लक हुनेछ।'
                : 'A valid activation code is required. Once entered, access is bound strictly to your physical device.')}
          </p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* FREE TRIAL OPTION (३ वटा सम्म चिना बनाउन मिल्ने) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/50 shadow-lg relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-200 font-serif">
                  {isNepali ? 'निःशुल्क परीक्षण (Free Trial)' : 'Free Trial Mode'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {isNepali ? `${FREE_TRIAL_MAX_CHINA} चिना सम्म` : `Up to ${FREE_TRIAL_MAX_CHINA} China`}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {trialState.exhausted
                  ? (isNepali ? '३/३ वटा निःशुल्क चिना प्रयोग भइसक्यो।' : '3 of 3 free trials used.')
                  : isNepali
                  ? `सफ्टवेयर जाँच्न ३ वटा सम्म चिना निःशुल्क बनाउनुहोस् (बाँकी: ${trialState.remaining})`
                  : `Generate up to 3 kundali charts for free (Remaining: ${trialState.remaining})`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFreeTrialClick}
              disabled={trialState.exhausted}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer shrink-0 ${
                trialState.exhausted
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {trialState.exhausted
                  ? (isNepali ? 'परीक्षण सकियो' : 'Trial Ended')
                  : (isNepali ? 'निःशुल्क सुरु गर्नुहोस्' : 'Start Free Trial')}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pure Single Code Input Form */}
        <form onSubmit={handleActivationSubmit} className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-inner space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                {isNepali ? 'आधिकारिक एक्टिभेसन कोड (Activation Code):' : 'Activation Code:'}
              </span>
              <span className="text-[11px] text-amber-400/80 font-normal">
                {isNepali ? 'अनिवार्य' : 'Required'}
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value.toUpperCase());
                  setFormError(null);
                }}
                placeholder={isNepali ? 'यहाँ आधिकारिक कोड प्रविष्ट गर्नुहोस्' : 'Enter your activation code'}
                className="w-full px-4 py-3 bg-slate-900 border border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 rounded-xl text-amber-200 font-mono text-base sm:text-lg uppercase tracking-widest outline-none placeholder:text-slate-600 font-bold shadow-inner text-center"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {isNepali
                ? 'एडमिनबाट प्राप्त आधिकारिक कोड प्रविष्ट गर्नुहोस्।'
                : 'Enter the official activation code provided by the administrator.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !activationCode.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            )}
            <span>
              {isNepali
                ? 'कोड प्रमाणित गरी एप खोल्नुहोस्'
                : 'Unlock & Activate App'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing / Previously Active Keys on this Device (Fast 1-Click Resume) */}
        {savedDeviceLicenses.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isNepali
                    ? `यस यन्त्रमा दर्ता भएका कोडहरू (${savedDeviceLicenses.length}):`
                    : `Registered Codes on This Device (${savedDeviceLicenses.length}):`}
                </span>
              </span>
            </div>

            <div className="space-y-1.5">
              {savedDeviceLicenses.map((lic) => {
                const isCurrent = activationCode.toUpperCase() === lic.licenseKey.toUpperCase();
                return (
                  <div
                    key={lic.licenseKey}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-amber-300 tracking-wider">
                        {lic.licenseKey}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                        {lic.tier || 'ACTIVE'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActivationCode(lic.licenseKey);
                        onSubmitNewKey(lic.licenseKey);
                      }}
                      className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition"
                    >
                      <span>{isNepali ? 'खोल्नुहोस्' : 'Open'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Device ID Display & Copy */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            {isNepali ? 'यन्त्र आइडी (Device ID):' : 'Device ID:'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
              {deviceId}
            </span>
            <button
              type="button"
              onClick={copyDeviceId}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 transition cursor-pointer"
            >
              {copiedDevId ? (isNepali ? 'कपि भयो' : 'Copied') : (isNepali ? 'कपि' : 'Copy')}
            </button>
          </div>
        </div>

        {/* Action Controls & Support */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>{isNepali ? 'पुनः जाँच्नुहोस्' : 'Retry Verification'}</span>
          </button>

          <a
            href="tel:9863991384"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] border border-emerald-400/40"
          >
            <PhoneCall className="w-4 h-4 text-emerald-100 animate-bounce" />
            <span>{isNepali ? 'कोड लिन ९८६३९९१३८४ मा सम्पर्क गर्नुहोस्' : 'Contact 9863991384 for Code'}</span>
          </a>
        </div>

        {/* Pandit Shambhu Prasad Lamsal Footer */}
        <div className="text-center text-xs text-slate-400 pt-1 flex flex-wrap items-center justify-center gap-2">
          <span>पण्डित शम्भु प्रसाद लम्साल ज्योतिष परामर्श</span>
          <span>•</span>
          <a
            href="tel:9863991384"
            className="text-amber-400 hover:text-amber-300 font-semibold underline inline-flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" /> <span>९८६३९९१३८४</span>
          </a>
        </div>

      </div>
    </div>
  );
};
