import React, { useState, useEffect } from 'react';
import { LIFETIME_MASTER_KEYS, saveSubscription } from '../../lib/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import { Language } from '../../types';
import { Key, ShieldCheck, CheckCircle2, Lock, Sparkles, HelpCircle, PhoneCall } from 'lucide-react';

interface LifetimeLicenseActivationProps {
  lang?: Language;
  onSuccess?: () => void;
}

export const LifetimeLicenseActivation: React.FC<LifetimeLicenseActivationProps> = ({
  lang = 'ne',
  onSuccess
}) => {
  const { refreshSubscription, isSubscribed, subscription } = useSubscription();
  const isNepali = lang === 'ne';

  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // यन्त्र (Device) को छुट्टै फिंगरप्रिन्ट/ID बनाउने वा ल्याउने
  useEffect(() => {
    let devId = localStorage.getItem('astro_device_fingerprint');
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      localStorage.setItem('astro_device_fingerprint', devId);
    }
    setDeviceId(devId);
  }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsActivating(true);

    const formattedKey = inputKey.trim().toUpperCase().replace(/[\s\-_]/g, '');

    if (!formattedKey) {
      setErrorMsg(isNepali ? 'कृपया १० अङ्कको लाइसेन्स की प्रविष्ट गर्नुहोस्।' : 'Please enter your 10-character license key.');
      setIsActivating(false);
      return;
    }

    try {
      const { redeemVoucherCodeAsync } = await import('../../lib/subscriptionService');
      const res = await redeemVoucherCodeAsync(formattedKey, 'Lifetime Member');

      if (res.success) {
        setSuccessMsg(
          isNepali
            ? res.messageNe || 'बधाई छ! तपाईँको "Lifetime Membership (आजन्म सदस्यता)" सफलतापूर्वक सक्रिय भयो! अब १७ कुण्डली, चिना र वार्षिक फलित सधैंका लागि खुला छ।'
            : res.messageEn || 'Congratulations! Your Lifetime Membership is now active. All 17 Kundalis, Cheena & Annual Phalit are unlocked forever.'
        );

        refreshSubscription();

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 900);
      } else {
        setErrorMsg(
          res.messageNe ||
            (isNepali
              ? 'यो की अमान्य छ वा पहिले नै अर्को मोबाइल/कम्प्युटरमा दर्ता भइसकेको छ! (१ Key = १ डिभाइस नीति)।'
              : 'This key is invalid or already bound to another device! (1 Key = 1 Device policy).')
        );
      }
    } catch (_err) {
      setErrorMsg(
        isNepali
          ? 'प्रमाणीकरणमा समस्या आयो। कृपया इन्टरनेट जडान जाँच गर्नुहोस्।'
          : 'Failed to verify license. Please check your internet connection.'
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-gradient-to-b from-stone-900 via-amber-950/80 to-black border-2 border-amber-500/70 rounded-3xl text-amber-100 shadow-2xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-300 shadow-lg shadow-amber-500/10">
          <Key className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
          {isNepali ? 'आजन्म सदस्यता सक्रियता (Lifetime Activation)' : 'Lifetime Membership Activation'}
        </h2>
        <p className="text-xs sm:text-sm text-amber-300/80 max-w-md mx-auto">
          {isNepali
            ? 'पण्डित शम्भु प्रसाद लम्साल (Binay) बाट प्राप्त १० अङ्कको आधिकारिक लाइसेन्स की यहाँ प्रविष्ट गर्नुहोस्।'
            : 'Enter your 10-character official Lifetime License Key provided by Pandit Shambhu Prasad Lamsal.'}
        </p>
      </div>

      {/* Current Status */}
      {isSubscribed && subscription?.planId === 'lifetime' && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold">{isNepali ? 'आजन्म सदस्यता सक्रिय छ!' : 'Lifetime Membership is Active!'}</span>
            <p className="text-[11px] text-emerald-300/80">{isNepali ? 'सबै १७ कुण्डली र वार्षिक फलित पूर्ण रूपमा अनलक छन्।' : 'All 17 Kundalis & Phalit are fully unlocked.'}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleActivate} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5 uppercase tracking-wider">
            {isNepali ? 'लाइसेन्स की (License Key):' : 'License Key:'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value.toUpperCase())}
              placeholder={isNepali ? 'उदा: A7B2C4D6E8' : 'e.g. A7B2C4D6E8'}
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl bg-stone-950 border-2 border-amber-600/70 text-amber-100 font-mono font-bold tracking-widest text-base text-center uppercase focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-600"
            />
            <Sparkles className="w-4 h-4 text-amber-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-medium flex items-center gap-2 animate-shake">
            <Lock className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isActivating}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
        >
          {isActivating
            ? (isNepali ? 'प्रमाणीकरण गर्दै...' : 'Verifying...')
            : (isNepali ? '✨ आजन्म सदस्यता अनलक गर्नुहोस्' : '✨ Unlock Lifetime Access')}
        </button>
      </form>

      {/* Device Policy & Support */}
      <div className="pt-3 border-t border-amber-900/50 space-y-2 text-[11px] text-amber-300/70">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isNepali ? 'सुरक्षा विधि:' : 'Device Security:'}</span>
          </span>
          <span className="font-mono text-[10px] text-stone-400">ID: {deviceId}</span>
        </div>
        <p className="leading-relaxed">
          {isNepali
            ? '💡 नियम: एउटा लाइसेन्स की केवल एक यन्त्रमा मात्र सक्रिय हुन्छ। यदि नयाँ की चाहिएमा सिधै ९८१९०५६३३३ मा सम्पर्क गर्नुहोस्।'
            : '💡 Policy: 1 License Key binds to 1 Device only. Contact 9819056333 if you require support.'}
        </p>
      </div>
    </div>
  );
};
