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
  Send,
  MessageSquare,
  User,
  Phone,
  HelpCircle
} from 'lucide-react';
import { DeviceAuthorizationResult, Language, LicenseRecord } from '../../types';
import { getOrCreateDeviceId } from '../../lib/deviceSecurity';
import { getAllDeviceLicenses } from '../../lib/licenseService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  authResult: DeviceAuthorizationResult | null;
  language: Language;
  onRetry: () => void;
  onSubmitNewKey: (key: string, customerName?: string, customerPhone?: string) => void;
  onOpenAdmin?: () => void;
}

export const UnauthorizedDeviceScreen: React.FC<Props> = ({
  authResult,
  language,
  onRetry,
  onSubmitNewKey,
  onOpenAdmin,
}) => {
  const { loginAsSuperAdmin } = useAuth();

  // Tab State: 'ENTER_CODE' vs 'REQUEST_CODE'
  const [activeTab, setActiveTab] = useState<'ENTER_CODE' | 'REQUEST_CODE'>('ENTER_CODE');

  // Single Activation Code Input State
  const [activationCode, setActivationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDevId, setCopiedDevId] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedDeviceLicenses, setSavedDeviceLicenses] = useState<LicenseRecord[]>([]);

  // WhatsApp Request Form State
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqPlan, setReqPlan] = useState('१ महिना (1 Month Trial / Normal)');
  const [reqMessageSent, setReqMessageSent] = useState(false);

  const { deviceId } = getOrCreateDeviceId();
  const isNepali = language === 'ne';

  // Load registered keys on this device
  useEffect(() => {
    getAllDeviceLicenses(deviceId).then((list) => {
      setSavedDeviceLicenses(list);
    });
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

  const handleSendWhatsAppRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = reqName.trim();
    const trimmedPhone = reqPhone.trim();

    if (!trimmedName) {
      setFormError(isNepali ? 'कृपया आफ्नो पूरा नाम लेख्नुहोस्।' : 'Please enter your full name.');
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 8) {
      setFormError(isNepali ? 'कृपया सही मोबाइल/सम्पर्क नम्बर लेख्नुहोस्।' : 'Please enter a valid phone number.');
      return;
    }

    const message = `🙏 *सादर नमस्कार पण्डित शम्भु प्रसाद लम्साल ज्यू!*\n\nमलाई यो ज्योतिष सफ्टवेयर सक्रिय (Active) गर्न आधिकारिक कोड पठाइदिनुहुन अनुरोध गर्दछु।\n\n👤 *नाम:* ${trimmedName}\n📞 *सम्पर्क नं:* ${trimmedPhone}\n📱 *यन्त्र आइडी (Device ID):* \`${deviceId}\`\n📋 *योजना:* ${reqPlan}\n\nकृपया मलाई मेरो यन्त्रका लागि आधिकारिक एक्टिभेसन कोड पठाइदिनुहोला। धन्यवाद!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9779863991384?text=${encodedMessage}`;

    // Save to local storage for convenience
    try {
      localStorage.setItem('astro_last_applicant_name', trimmedName);
      localStorage.setItem('astro_last_applicant_phone', trimmedPhone);
    } catch (_e) {}

    setReqMessageSent(true);

    // Open WhatsApp directly
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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

      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 backdrop-blur-xl relative z-10 space-y-4">
        
        {/* Lock Screen Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                {isBlockedDuplicate ? (
                  <Smartphone className="w-7 h-7 text-rose-400 animate-pulse" />
                ) : isRevoked ? (
                  <Lock className="w-7 h-7 text-rose-500" />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-amber-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-rose-950 border border-rose-500 text-rose-400">
                <AlertTriangle className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isNepali ? 'सुरक्षित वैदिक ज्योतिष सफ्टवेयर' : 'Jyotish Software Security'}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
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

          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-sm mx-auto">
            {authResult?.messageNe ||
              (isNepali
                ? 'यो सफ्टवेयर प्रयोग गर्न आधिकारिक कोड आवश्यक पर्दछ। कोड छैन भने तल नाम र नम्बर भरेर सिधै ह्वाट्सएपमा सन्देश पठाउन सक्नुहुन्छ।'
                : 'A valid activation code is required. If you do not have a code, send a request via WhatsApp below.')}
          </p>
        </div>

        {/* Tab Switcher: 1) Have Code vs 2) Request Code via WhatsApp */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ENTER_CODE');
              setFormError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ENTER_CODE'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isNepali ? 'कोड हाल्नुहोस्' : 'Enter Code'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('REQUEST_CODE');
              setFormError(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'REQUEST_CODE'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isNepali ? 'नयाँ कोड माग्नुहोस् (WhatsApp)' : 'Request Code (WhatsApp)'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* TAB 1: PURE SINGLE CODE INPUT FORM */}
        {activeTab === 'ENTER_CODE' && (
          <form onSubmit={handleActivationSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-inner space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  {isNepali ? 'आधिकारिक एक्टिभेसन कोड (Activation Code):' : 'Activation Code:'}
                </span>
                <span className="text-[10px] text-amber-400/80 font-normal">
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
                  placeholder={isNepali ? 'उदाहरण: 3N3YU4LSE5' : 'e.g. 3N3YU4LSE5'}
                  className="w-full px-4 py-3 bg-slate-900 border border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 rounded-xl text-amber-200 font-mono text-base sm:text-lg uppercase tracking-widest outline-none placeholder:text-slate-600 font-bold shadow-inner text-center"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                {isNepali
                  ? 'पण्डित शम्भु प्रसाद लम्सालबाट प्राप्त कोड प्रविष्ट गर्नुहोस्।'
                  : 'Enter the official activation code received from the administrator.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !activationCode.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
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
        )}

        {/* TAB 2: REQUEST CODE VIA WHATSAPP (Name + Phone + Device ID) */}
        {activeTab === 'REQUEST_CODE' && (
          <form onSubmit={handleSendWhatsAppRequest} className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 shadow-inner space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold pb-1 border-b border-emerald-500/20">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isNepali
                  ? 'ह्वाट्सएपमा सम्पर्क गर्नुहोस् (पण्डित शम्भु प्रसाद लम्साल - ९८६३९९१३८४):'
                  : 'Contact on WhatsApp (Pandit Shambhu Prasad Lamsal - 9863991384):'}
              </span>
            </div>

            <p className="text-[11px] text-emerald-200/90 leading-relaxed bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
              {isNepali
                ? '📌 आफ्नो नाम र नम्बर लेखी तलको बटन थिच्नुहोस्। तपाईंको सन्देश सिधै पण्डित शम्भु प्रसाद लम्सालको ह्वाट्सएप (९८६३९९१३८४) मा जानेछ र उहाँबाट कोड प्राप्त हुनेछ।'
                : '📌 Enter your name and phone number. Your activation request will be sent directly to WhatsApp (9863991384).'}
            </p>

            {/* Customer Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-emerald-400" />
                <span>{isNepali ? 'तपाईंको पूरा नाम:' : 'Your Full Name:'}</span>
              </label>
              <input
                type="text"
                required
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
                placeholder={isNepali ? 'उदाहरण: राम शर्मा' : 'e.g. Ram Sharma'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-xs text-white outline-none"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{isNepali ? 'सम्पर्क / मोबाइल नम्बर:' : 'Contact / Mobile Number:'}</span>
              </label>
              <input
                type="tel"
                required
                value={reqPhone}
                onChange={(e) => setReqPhone(e.target.value)}
                placeholder={isNepali ? 'उदाहरण: 98XXXXXXXX' : 'e.g. 98XXXXXXXX'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-xs text-white outline-none"
              />
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{isNepali ? 'आवश्यक योजना (Plan):' : 'Required Plan:'}</span>
              </label>
              <select
                value={reqPlan}
                onChange={(e) => setReqPlan(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 text-xs text-amber-200 outline-none"
              >
                <option value="१ महिना (1 Month Trial / Normal)">{isNepali ? '१ महिना साधारण योजना' : '1 Month Simple Plan'}</option>
                <option value="१ वर्ष (VIP - 1 Year Plan)">{isNepali ? '१ वर्ष (VIP - 1 Year Plan)' : '1 Year VIP Plan'}</option>
                <option value="आजीवन (Lifetime / VVIP Unlimited)">{isNepali ? 'आजीवन (Lifetime Access)' : 'Lifetime Unlimited'}</option>
              </select>
            </div>

            {/* Auto-included Device ID Note */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>{isNepali ? 'यस यन्त्रको ID सन्देशमा स्वतः संलग्न हुनेछ:' : 'Device ID attached automatically:'}</span>
              </span>
              <span className="font-mono text-emerald-300 truncate max-w-[120px]">{deviceId}</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>
                {isNepali
                  ? 'ह्वाट्सएपमा सम्पर्क गर्नुहोस् (९८६३९९१३८४)'
                  : 'Contact on WhatsApp (9863991384)'}
              </span>
            </button>

            {reqMessageSent && (
              <p className="text-[11px] text-emerald-300 text-center font-medium animate-fadeIn">
                {isNepali
                  ? '✓ ह्वाट्सएप खुल्दैछ। कोड प्राप्त भएपछि "कोड हाल्नुहोस्" ट्याबमा गएर कोड प्रविष्ट गर्नुहोस्।'
                  : '✓ WhatsApp opened. Once you receive your code, switch to "Enter Code" tab to activate.'}
              </p>
            )}
          </form>
        )}

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
                        setActiveTab('ENTER_CODE');
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
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>{isNepali ? 'पुनः जाँच्नुहोस्' : 'Retry Verification'}</span>
          </button>

          <a
            href="https://wa.me/9779863991384?text=🙏%20पण्डित%20ज्यू,%20मलाई%20ज्योतिष%20सफ्टवेयरको%20एक्टिभेसन%20कोड%20चाहिएको%20थियो।"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] border border-emerald-400/40"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>{isNepali ? 'ह्वाट्सएपमा कुरा गर्नुहोस् (९८६३९९१३८४)' : 'Chat on WhatsApp (9863991384)'}</span>
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
