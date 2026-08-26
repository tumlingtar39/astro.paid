import React, { useState } from 'react';
import { Sparkles, Key, PhoneCall, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { FREE_TRIAL_MAX_CHINA, getTrialState } from '../../lib/trialService';
import { useSubscription } from '../../context/SubscriptionContext';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const TrialLimitModal: React.FC<TrialLimitModalProps> = ({
  isOpen,
  onClose,
  lang = 'ne',
}) => {
  const { openSubscriptionModal, redeemCodeAsync } = useSubscription();
  const [activationCode, setActivationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNepali = lang === 'ne';
  const trial = getTrialState();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const clean = activationCode.trim().toUpperCase();

    if (!clean) {
      setErrorMsg(isNepali ? 'कृपया आधिकारिक कोड प्रविष्ट गर्नुहोस्।' : 'Please enter an activation code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await redeemCodeAsync(clean);
      if (res.success) {
        setSuccessMsg(isNepali ? 'इजाजतपत्र सफलतापूर्वक सक्रिय भयो!' : 'License activated successfully!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        setErrorMsg(isNepali ? res.messageNe : res.messageEn);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isNepali ? 'एक्टिभेसन गर्न सकिएन।' : 'Activation failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-5 py-4 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-100 text-base">
                {isNepali ? 'फ्री ट्रायल (Free Trial) को सीमा पूरा भयो' : 'Free Trial Limit Reached'}
              </h3>
              <p className="text-[11px] text-amber-300/80">
                {isNepali
                  ? `३ पटक सम्मको निःशुल्क परीक्षण पूरा भयो (${FREE_TRIAL_MAX_CHINA}/${FREE_TRIAL_MAX_CHINA})`
                  : `${FREE_TRIAL_MAX_CHINA}/${FREE_TRIAL_MAX_CHINA} Free Trial Uses Completed`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isNepali
              ? `तपाईंले यस उपकरणमा उपलब्ध ${FREE_TRIAL_MAX_CHINA} पटक सम्मको निःशुल्क परीक्षण (Free Trial) पूरा गरिसक्नुभएको छ। ३ पटक भन्दा बढी चिना बनाउन र सम्पूर्ण सुविधाहरू असीमित रूपमा चलाउन कृपया आधिकारिक एक्टिभेसन कोड (Key) प्रविष्ट गर्नुहोस् वा सदस्यता योजना लिनुहोस्।`
              : `You have completed your ${FREE_TRIAL_MAX_CHINA} Free Trial uses on this device. To generate more charts and use all features, please enter an authorized activation key or choose a plan.`}
          </p>

          {/* Quick Activation Code Input */}
          <form onSubmit={handleCodeSubmit} className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-3">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{isNepali ? 'आधिकारिक एक्टिभेसन कोड (Activation Code):' : 'Activation Code:'}</span>
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder={isNepali ? 'यहाँ आफ्नो कोड राख्नुहोस्' : 'Enter your code'}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-100 text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none uppercase"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !activationCode.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isNepali ? 'कोड सक्रिय गरी असीमित खोल्नुहोस्' : 'Unlock Unlimited Access'}</span>
            </button>
          </form>

          {/* Alternative Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                openSubscriptionModal(isNepali ? 'असीमित चिना र फलित' : 'Unlimited Kundali & Phalit');
              }}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-600/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>{isNepali ? 'योजना तथा भुक्तानी विवरण हेर्नुहोस्' : 'View Plans & Pricing'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="tel:9863991384"
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isNepali ? 'सम्पर्क: ९८६३९९१३८४' : 'Call 9863991384'}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-slate-800 text-center text-[11px] text-slate-400">
          पण्डित शम्भु प्रसाद लम्साल (Binay Guru) • सम्पर्क: ९८६३९९१३८४ / ९८०५६७४११९
        </div>
      </div>
    </div>
  );
};
