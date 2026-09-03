import React from 'react';
import { Crown, Sparkles, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { Language } from '../../types';
import { SUBSCRIPTION_PLANS } from '../../lib/subscriptionService';

interface SubscriptionGateCardProps {
  lang?: Language;
  titleNe?: string;
  titleEn?: string;
  descriptionNe?: string;
  descriptionEn?: string;
  featureName?: string;
  featureDescription?: string;
  featureListNe?: string[];
  featureListEn?: string[];
}

export const SubscriptionGateCard: React.FC<SubscriptionGateCardProps> = ({
  lang = 'ne',
  titleNe,
  titleEn,
  descriptionNe,
  descriptionEn,
  featureName,
  featureDescription,
  featureListNe = [
    'सतिक लग्न, नवमांश र १६ वर्ग कुण्डली',
    'विंशोत्तरी, त्रिभागी र योगिनी दशा फल',
    'वार्षिक १२ भाव भविष्यवाणी र देश विदेश यात्रा योग',
    'परम्परागत वैदिक चिना PDF र हाई-क्वालिटी प्रिन्ट'
  ],
  featureListEn = [
    'Accurate Lagna, Navamsha & 16 Divisional Charts',
    'Vimshottari, Tribhagi & Yogini Dasha predictions',
    'Annual 12 House forecast & Overseas travel yoga',
    'Formal Vedic Cheena PDF & High-Res Print'
  ],
}) => {
  const {
    openSubscriptionModal,
    redeemCodeAsync
  } = useSubscription();
  const isNepali = lang === 'ne';
  const [quickKey, setQuickKey] = React.useState('');
  const [keyMsg, setKeyMsg] = React.useState<{ text: string; error?: boolean } | null>(null);
  const [isActivating, setIsActivating] = React.useState(false);

  const handleQuickKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyMsg(null);
    const clean = quickKey.trim().toUpperCase().replace(/[\s\-_]/g, '');
    if (!clean) return;
    setIsActivating(true);
    try {
      const res = await redeemCodeAsync(clean);
      if (res.success) {
        setKeyMsg({ text: isNepali ? res.messageNe : res.messageEn, error: false });
      } else {
        setKeyMsg({ text: isNepali ? res.messageNe : res.messageEn, error: true });
      }
    } catch (_e) {
      setKeyMsg({ text: isNepali ? 'त्रुटि भयो' : 'Error occurred', error: true });
    } finally {
      setIsActivating(false);
    }
  };

  const headingText = isNepali
    ? (titleNe || featureName || 'कुण्डली तथा फलित हेर्न सदस्यता छनौट गर्नुहोस्')
    : (titleEn || featureName || 'Choose a Subscription Plan to Unlock');

  const descText = isNepali
    ? (descriptionNe || featureDescription || 'सम्पूर्ण परम्परागत चिना, १६ वर्ग चक्र, विंशोत्तरी दशा तथा विस्तृत वार्षिक फलित अनलक गर्न आफ्नो अनुकूल योजना छनौट गर्नुहोस्।')
    : (descriptionEn || featureDescription || 'Subscribe to unlock precision birth charts, 16 divisional charts, dasha analysis, and in-depth yearly forecasts.');

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-b from-[#211409] via-[#160d06] to-[#0c0603] text-amber-50 shadow-2xl p-5 sm:p-8 my-6">
      {/* Radiant Background Metallic Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-bl-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-tr-full blur-3xl pointer-events-none" />

      {/* Decorative Gold Frame */}
      <div className="border border-amber-500/40 rounded-2xl p-5 sm:p-7 bg-black/40 backdrop-blur-md space-y-6">
        
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg">
              <Crown className="w-4 h-4 text-stone-950 animate-bounce" />
              <span>{isNepali ? '👑 सदस्यता योजना' : '👑 Membership Required'}</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-100 font-serif drop-shadow-md">
            {headingText}
          </h3>

          <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl leading-relaxed">
            {descText}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-xs text-stone-200 py-2">
          {(isNepali ? featureListNe : featureListEn).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* 4 Mini Plan Options Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto pt-2">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => openSubscriptionModal(isNepali ? titleNe : titleEn)}
              className={`p-3 rounded-xl border text-center transition cursor-pointer hover:scale-105 ${
                plan.highlight
                  ? 'bg-amber-900/80 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-stone-950/70 border-amber-700/40 hover:border-amber-500/70'
              }`}
            >
              <div className="text-[10px] text-amber-300 font-bold uppercase">
                {isNepali ? plan.nameNe.split(' ')[0] : plan.nameEn}
              </div>
              <div className="text-sm font-black text-amber-100 font-serif">
                रु {plan.priceNpr}
              </div>
              <div className="text-[10px] text-stone-400">
                {isNepali ? plan.durationLabelNe : plan.durationLabelEn}
              </div>
            </div>
          ))}
        </div>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openSubscriptionModal(isNepali ? titleNe : titleEn)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>
              {isNepali
                ? '🌟 योजना छान्नुहोस् र तुरुन्त अनलक गर्नुहोस् (रु ३९९ बाट सुरु)'
                : '🌟 Choose Plan & Unlock (Starts at Rs 399)'}
            </span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>

        {/* Quick Lifetime / Voucher Key Activation Form */}
        <div className="max-w-md mx-auto p-3.5 bg-black/60 border border-amber-500/40 rounded-xl space-y-2 text-center">
          <div className="text-[11px] font-bold text-amber-300 font-serif flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isNepali ? 'वा सक्रियता की / भौचर पिन राख्नुहोस्:' : 'Or enter Activation Key / PIN:'}</span>
          </div>
          <form onSubmit={handleQuickKeySubmit} className="flex gap-2">
            <input
              type="text"
              value={quickKey}
              onChange={(e) => setQuickKey(e.target.value.toUpperCase())}
              placeholder={isNepali ? 'उदा: A7B2C4D6E8' : 'e.g. A7B2C4D6E8'}
              className="flex-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-amber-600/60 text-amber-100 text-center font-mono font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-stone-600"
            />
            <button
              type="submit"
              disabled={isActivating}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isActivating ? (isNepali ? '...' : '...') : (isNepali ? 'अनलक' : 'Unlock')}
            </button>
          </form>
          {keyMsg && (
            <p className={`text-[11px] font-semibold ${keyMsg.error ? 'text-rose-400' : 'text-emerald-400'}`}>
              {keyMsg.text}
            </p>
          )}
        </div>

        {/* Guarantee footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-amber-400/80 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {isNepali
              ? 'eSewa / Khalti / Fonepay मार्फत तत्काल सक्रियता | १००% सतिक वैदिक ज्योतिष'
              : 'Instant Activation via eSewa, Khalti or Fonepay | 100% Vedic Astrology'}
          </span>
        </div>
      </div>
    </div>
  );
};
