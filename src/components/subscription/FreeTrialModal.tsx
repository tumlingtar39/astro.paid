import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  ShieldCheck,
  ArrowRight,
  X,
  Key,
  Crown,
  AlertTriangle,
  Flame,
  Calendar
} from 'lucide-react';
import { Language } from '../../types';
import { useSubscription } from '../../context/SubscriptionContext';
import { FREE_TRIAL_MAX_CHINA } from '../../lib/trialService';

interface FreeTrialModalProps {
  lang?: Language;
  onNavigateToForm?: () => void;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
  lang = 'ne',
  onNavigateToForm
}) => {
  const {
    trialModalOpen,
    closeFreeTrialModal,
    trialState,
    isFreeTrialEligible,
    isTrialLimitReached,
    openSubscriptionModal,
    startTrial
  } = useSubscription();

  if (!trialModalOpen) return null;

  const isNepali = lang === 'ne';
  const used = trialState.usedCount;
  const remaining = trialState.remaining;
  const max = FREE_TRIAL_MAX_CHINA;

  const handleStartUsing = () => {
    startTrial();
    closeFreeTrialModal();
    if (onNavigateToForm) {
      onNavigateToForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#1f1308] via-[#150c05] to-[#0d0703] border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden text-amber-50 relative">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-5 sm:px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-amber-100 text-base sm:text-lg">
                  {isNepali ? 'निःशुल्क परीक्षण (Free Trial)' : 'Free Trial Access'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-stone-950 shadow">
                  {isNepali ? '३ पटक निःशुल्क' : '3 Free Uses'}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                {isNepali
                  ? 'पहिलो पटक ३ वटा सम्म जन्म विवरण हालेर सम्पूर्ण फिचर प्रयोग गर्नुहोस्'
                  : 'Enter up to 3 birth details and explore all premium features'}
              </p>
            </div>
          </div>

          <button
            onClick={closeFreeTrialModal}
            className="p-1.5 rounded-xl text-amber-300/70 hover:text-amber-100 hover:bg-amber-900/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Usage Progress Meter */}
          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {isNepali ? 'यस डिभाइसमा प्रयोग स्थिति:' : 'Usage on this device:'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                remaining > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {isNepali
                  ? `${max} मध्ये ${used} प्रयोग (${remaining} बाँकी)`
                  : `${used} of ${max} used (${remaining} remaining)`}
              </span>
            </div>

            {/* Visual Step Dots */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3].map((step) => {
                const isUsed = used >= step;
                return (
                  <div
                    key={step}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      isUsed
                        ? 'bg-amber-950/80 border-amber-600/50 text-amber-400/80 line-through'
                        : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20'
                    }`}
                  >
                    <div className="text-[10px] font-semibold opacity-80">
                      {isNepali ? `जन्म विवरण ${step}` : `Profile ${step}`}
                    </div>
                    <div className="text-xs font-bold mt-0.5">
                      {isUsed ? (isNepali ? '✓ प्रयोग भयो' : '✓ Used') : (isNepali ? 'उपलब्ध छ' : 'Available')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature Highlights included in Trial */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isNepali ? '✨ फ्री ट्रायलमा खुल्ने सम्पूर्ण सुविधाहरू:' : '✨ All Features Unlocked in Free Trial:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isNepali ? '१ जन्म लग्न + १६ षोडशवर्ग कुण्डली' : 'Main Lagna + 16 Divisional Charts'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isNepali ? 'परम्परागत नेपाली चिना र PDF प्रिन्ट' : 'Traditional Cheena & PDF Print'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isNepali ? 'विंशोत्तरी, त्रिभागी र योगिनी दशा' : 'Vimshottari, Tribhagi & Yogini Dasha'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isNepali ? 'वार्षिक फलित र विदेश यात्रा योग' : 'Yearly Predictions & Foreign Travel'}</span>
              </div>
            </div>
          </div>

          {/* Important Security Notice / Device Lock Policy */}
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">
                {isNepali ? 'उपकरण सुरक्षा तथा सीमा नियम (Device-Lock Rule):' : 'Device-Lock Policy:'}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {isNepali
                  ? 'एक पटक ३ वटा जन्म विवरण (Date of Birth) हालेर प्रयोग गरेपछि यस उपकरण (Device) मा स्वतः निःशुल्क ट्रायल समाप्त हुनेछ र फेरि निःशुल्क प्रयोग गर्न सकिने छैन। त्यसपछि सम्पूर्ण सुविधा निरन्तर चलाउन सदस्यता लिनु आवश्यक हुनेछ।'
                  : 'After 3 birth calculations on this device, the free trial will permanently end and cannot be reused freely on this device. Membership is required for further access.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {remaining > 0 ? (
              <button
                type="button"
                onClick={handleStartUsing}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>
                  {isNepali
                    ? `अहिले नै निःशुल्क प्रयोग गर्नुहोस् (${remaining} पटक बाँकी)`
                    : `Start Free Trial (${remaining} remaining)`}
                </span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeFreeTrialModal();
                  openSubscriptionModal();
                }}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <Crown className="w-4 h-4 text-stone-950" />
                <span>{isNepali ? '👑 सदस्यता योजना छनौट गर्नुहोस्' : '👑 Select Membership Plan'}</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                closeFreeTrialModal();
                openSubscriptionModal();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{isNepali ? 'सदस्यता मूल्य हेर्नुहोस्' : 'View Plans'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
