import React, { useState } from 'react';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlanId,
  PAYMENT_CHANNELS,
  getWhatsAppPaymentLink,
  PlanConfig
} from '../../lib/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import { Language } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Zap,
  X,
  CreditCard,
  Phone,
  Send,
  Gift,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface SubscriptionModalProps {
  lang?: Language;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ lang = 'ne' }) => {
  const {
    isModalOpen,
    closeSubscriptionModal,
    requiredFeatureTitle,
    currentPlan,
    isSubscribed,
    subscription,
    expiryInfo,
    isNearExpiry,
    isExpired,
    daysRemaining,
    activatePlan,
    redeemCodeAsync,
  } = useSubscription();

  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('vip');
  const [activeTab, setActiveTab] = useState<'plans' | 'payment' | 'voucher'>('plans');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Payment Form State
  const [customerName, setCustomerName] = useState<string>(subscription?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(subscription?.customerPhone || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('eSewa (ईसेवा)');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Voucher Code State
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const isNepali = lang === 'ne';
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleProceedToPayment = (planId: SubscriptionPlanId) => {
    setSelectedPlanId(planId);
    setActiveTab('payment');
  };

  const handleWhatsAppPayment = async () => {
    setPaymentError(null);
    if (!customerPhone.trim()) {
      setPaymentError(isNepali ? 'कृपया आफ्नो सम्पर्क मोबाइल नम्बर अनिवार्य राख्नुहोस्।' : 'Please provide your contact phone number.');
      return;
    }

    try {
      const { getOrCreateDeviceId } = await import('../../lib/deviceSecurity');
      const { submitDevicePaymentRequest } = await import('../../lib/licenseService');
      const { deviceId } = getOrCreateDeviceId();
      await submitDevicePaymentRequest({
        deviceId,
        customerName: customerName.trim() || 'ग्राहक',
        customerPhone: customerPhone.trim(),
        planId: selectedPlanId,
        planName: selectedPlan.nameNe,
        amount: selectedPlan.priceNpr,
        paymentMethod: paymentMethod.includes('eSewa') ? 'eSewa' : paymentMethod.includes('Khalti') ? 'Khalti' : 'Bank',
        transactionRef: transactionId.trim() || 'WhatsApp Request',
      });
    } catch (_e) {
      // ignore
    }

    const waLink = getWhatsAppPaymentLink(
      selectedPlanId,
      customerName,
      customerPhone,
      paymentMethod,
      transactionId
    );

    window.open(waLink, '_blank');
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(null);

    if (!voucherInput.trim()) {
      setVoucherError(isNepali ? 'कृपया भौचर कोड वा पिन प्रविष्ट गर्नुहोस्।' : 'Please enter a voucher code or PIN.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await redeemCodeAsync(voucherInput, customerName, customerPhone);
      if (res.success) {
        setVoucherSuccess(isNepali ? res.messageNe : res.messageEn);
        setTimeout(() => {
          closeSubscriptionModal();
        }, 1500);
      } else {
        setVoucherError(isNepali ? res.messageNe : res.messageEn);
      }
    } catch (_err) {
      setVoucherError(isNepali ? 'प्रमाणीकरणमा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।' : 'Verification failed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'subscription-modal-backdrop') {
          closeSubscriptionModal();
        }
      }}
    >
      <div
        id="subscription-modal-card"
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#1e1309] via-[#140c06] to-[#0d0703] border-2 border-amber-500/70 rounded-3xl shadow-2xl overflow-hidden text-amber-50 my-auto animate-fadeIn"
      >
        {/* Decorative Top Golden Radiance */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
        <div className="absolute top-0 right-1/4 w-72 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={closeSubscriptionModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-950/80 hover:bg-red-950 text-amber-300 hover:text-red-200 border border-amber-500/40 transition z-20 cursor-pointer shadow-lg"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-7 border-b border-amber-800/50 text-center space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-500/40 to-amber-600/30 border border-amber-400/60 text-amber-200 text-xs font-bold shadow-md">
            <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              {isNepali
                ? 'ज्योतिष परामर्श केन्द्र - कुण्डली एवं फलित सदस्यता योजना'
                : 'Astrology Center - Premium Kundali & Phalit Plans'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 drop-shadow">
            {requiredFeatureTitle ? (
              <span>✨ {requiredFeatureTitle} अनलक गर्नुहोस्</span>
            ) : isNepali ? (
              'वैदिक कुण्डली एवं विस्तृत फलित योजनाहरू'
            ) : (
              'Vedic Kundali & Phalit Membership Plans'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl mx-auto leading-relaxed">
            {isNepali
              ? 'आफ्नो आवश्यकता अनुसार योजना छान्नुहोस् र सतिक जन्मकुण्डली, दशा-अन्तर्दशा, विस्तृत वार्षिक फलित तथा उपायहरू अनलक गर्नुहोस्।'
              : 'Choose your plan to unlock complete Vedic Kundali, dasha timelines, in-depth annual phalit and astrological remedies.'}
          </p>

          {/* Tab navigation */}
          {expiryInfo && !expiryInfo.isLifetime && (isNearExpiry || isExpired) && (
            <div className={`p-3 rounded-2xl border text-xs text-left max-w-xl mx-auto flex items-start gap-3 my-2 ${
              isExpired
                ? 'bg-red-950/80 border-red-500/60 text-red-200 shadow-md shadow-red-950/50'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/50'
            }`}>
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isExpired ? 'text-red-400' : 'text-amber-400 animate-pulse'}`} />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">
                  {isExpired
                    ? (isNepali ? '🛑 तपाईंको अघिल्लो सदस्यताको म्याद समाप्त भएको छ' : '🛑 Your Previous Subscription Has Expired')
                    : (isNepali ? `⚠️ सदस्यता नवीकरण सूचना: म्याद समाप्त हुन ${daysRemaining} दिन मात्र बाँकी!` : `⚠️ Renewal Reminder: ${daysRemaining} days remaining!`)}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isNepali
                    ? `तपाईंको ${expiryInfo.tierNameNe} को अन्तिम मिति ${expiryInfo.formattedExpiryNe} थियो/हो। सेवा निरन्तर प्रयोग गर्न बैंक/eSewa मा रकम भुक्तानी गरी पण्डित ज्यू (Admin) सँग नयाँ कोड लिनुहोस् र तल राख्नुहोस्।`
                    : `Your ${expiryInfo.tierNameEn} plan expires on ${expiryInfo.formattedExpiryEn}. To continue enjoying uninterrupted Vedic astrology services, please renew your subscription.`}
                </p>
                <div className="pt-1 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payment')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] cursor-pointer"
                  >
                    💳 {isNepali ? 'अहिले भुक्तानी गर्नुहोस्' : 'Pay Now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('voucher')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/50 font-bold text-[11px] cursor-pointer"
                  >
                    🔑 {isNepali ? 'नयाँ कोड राख्नुहोस्' : 'Enter New Code'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900/80 border border-amber-700/50'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isNepali ? 'सदस्यता योजनाहरू (Plans)' : 'Membership Plans'}</span>
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900/80 border border-amber-700/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isNepali ? 'डिजिटल भुक्तानी (eSewa/QR)' : 'Digital Payment'}</span>
            </button>

            <button
              onClick={() => setActiveTab('voucher')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'voucher'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900/80 border border-amber-700/50'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{isNepali ? 'कोड / पिन प्रयोग' : 'Redeem Code'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto custom-scrollbar">

          {/* TAB 1: 4 PRICING PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = isSubscribed && currentPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        plan.highlight
                          ? 'bg-gradient-to-b from-amber-900/90 via-amber-950/90 to-amber-900/90 border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]'
                          : 'bg-stone-950/80 border border-amber-700/40 hover:border-amber-500/70'
                      } ${isSelected ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                    >
                      {/* Top Plan Badge */}
                      {plan.badgeNe && (
                        <div
                          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap ${
                            plan.highlight
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 border border-amber-200'
                              : 'bg-amber-900 text-amber-200 border border-amber-600'
                          }`}
                        >
                          {isNepali ? plan.badgeNe : plan.badgeEn}
                        </div>
                      )}

                      <div>
                        {/* Plan Title & Duration */}
                        <div className="text-center pt-2 pb-3 border-b border-amber-800/40 space-y-1">
                          <h3 className="font-extrabold text-base sm:text-lg text-amber-100 font-serif">
                            {isNepali ? plan.nameNe : plan.nameEn}
                          </h3>
                          <div className="text-xs text-amber-300/80 font-medium">
                            ⏱️ {isNepali ? plan.durationLabelNe : plan.durationLabelEn}
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="text-center py-3">
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-xs text-amber-400 font-bold">रु</span>
                            <span className="text-3xl font-black text-amber-100 font-serif tracking-tight">
                              {plan.priceNpr.toLocaleString()}
                            </span>
                          </div>
                          {plan.originalPriceNpr > plan.priceNpr && (
                            <div className="text-[11px] text-stone-400 line-through">
                              रु {plan.originalPriceNpr.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-2 py-2 text-xs text-stone-200">
                          {(isNepali ? plan.featuresNe : plan.featuresEn).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 leading-snug">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-[11.5px]">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProceedToPayment(plan.id);
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg ${
                            plan.highlight
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-amber-500/20'
                              : 'bg-amber-600 hover:bg-amber-500 text-amber-950'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-950" />
                              <span>{isNepali ? 'सक्रिय योजना' : 'Active Plan'}</span>
                            </>
                          ) : (
                            <>
                              <span>{isNepali ? 'यो योजना छान्नुहोस्' : 'Select Plan'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Activation Note */}
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-100">
                      {isNepali ? 'तत्काल १-क्लिक भुक्तानी तथा अनलक' : 'Instant 1-Click Payment & Unlock'}
                    </div>
                    <div className="text-[11px] text-amber-300/80">
                      {isNepali
                        ? 'eSewa, Khalti वा Fonepay बाट भुक्तानी गरी WhatsApp मा सिधै स्क्रिनसट पठाउनुहोस्।'
                        : 'Pay via eSewa, Khalti or Fonepay and send payment proof on WhatsApp.'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('payment')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer shadow"
                >
                  <span>{isNepali ? 'भुक्तानी गर्न अगाडि बढ्नुहोस्' : 'Proceed to Payment'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL PAYMENT DETAILS & QR */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Selected Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-500/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-amber-400 font-bold">
                    {isNepali ? 'छानिएको योजना (Selected Plan):' : 'Selected Plan:'}
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-100 font-serif">
                    {isNepali ? selectedPlan.nameNe : selectedPlan.nameEn} ({isNepali ? selectedPlan.durationLabelNe : selectedPlan.durationLabelEn})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase">भुक्तानी रकम</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif">
                      रु {selectedPlan.priceNpr.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 cursor-pointer"
                  >
                    {isNepali ? 'फेर्नुहोस्' : 'Change'}
                  </button>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* eSewa / Khalti / IME Pay Card */}
                <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-600/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
                    <div className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>{isNepali ? 'डिजिटल वालेट खाता नम्बर' : 'Digital Wallet Details'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold">
                      तत्काल प्रमाणिकरण
                    </span>
                  </div>

                  {/* eSewa */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-400">🟢 eSewa (ईसेवा ID)</div>
                      <div className="font-mono text-sm text-white font-bold">{PAYMENT_CHANNELS.esewa.id}</div>
                      <div className="text-[10px] text-stone-400">{PAYMENT_CHANNELS.esewa.accountName}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(PAYMENT_CHANNELS.esewa.id, 'esewa')}
                      className="p-1.5 rounded-lg bg-amber-900/80 hover:bg-amber-700 text-amber-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'esewa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedText === 'esewa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Khalti */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-purple-400">🟣 Khalti (खल्ती ID)</div>
                      <div className="font-mono text-sm text-white font-bold">{PAYMENT_CHANNELS.khalti.id}</div>
                      <div className="text-[10px] text-stone-400">{PAYMENT_CHANNELS.khalti.accountName}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(PAYMENT_CHANNELS.khalti.id, 'khalti')}
                      className="p-1.5 rounded-lg bg-amber-900/80 hover:bg-amber-700 text-amber-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'khalti' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedText === 'khalti' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Secondary Number */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-amber-400">📱 वैकिल्पक नम्बर (Secondary)</div>
                      <div className="font-mono text-sm text-white font-bold">{PAYMENT_CHANNELS.esewa.secondaryId}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(PAYMENT_CHANNELS.esewa.secondaryId, 'secondary')}
                      className="p-1.5 rounded-lg bg-amber-900/80 hover:bg-amber-700 text-amber-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'secondary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedText === 'secondary' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Customer Verification & WhatsApp Direct Submit */}
                <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-600/40 space-y-3 flex flex-col justify-between">
                  <div className="border-b border-amber-800/40 pb-2">
                    <div className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>{isNepali ? 'तपाईँको विवरण र प्रमाण पेश गर्नुहोस्' : 'Submit Details & Receipt'}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        {isNepali ? 'ग्राहकको पूरा नाम (Full Name):' : 'Full Name:'}
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="उदा: Shambhu Lamsal"
                        className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        {isNepali ? 'मोबाइल नम्बर (Phone Number) *:' : 'Phone Number *:'}
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="98XXXXXXXX"
                        className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        {isNepali ? 'भुक्तानी माध्यम (Payment Method):' : 'Payment Method:'}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      >
                        <option value="eSewa (ईसेवा)">eSewa (ईसेवा)</option>
                        <option value="Khalti (खल्ती)">Khalti (खल्ती)</option>
                        <option value="IME Pay (आइएमई पे)">IME Pay (आइएमई पे)</option>
                        <option value="Bank QR / Fonepay">Bank QR / Fonepay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        {isNepali ? 'कारोबार नं वा ट्रान्ज्याक्सन कोड (Optional):' : 'Transaction ID (Optional):'}
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="उदा: TXN-829104"
                        className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleWhatsAppPayment}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isNepali ? '💬 WhatsApp मा भुक्तानी स्क्रिनसट पठाउनुहोस्' : '💬 Send Receipt on WhatsApp'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REDEEM CODE / PIN */}
          {activeTab === 'voucher' && (
            <div className="max-w-md mx-auto py-4 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-300 mb-2">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-amber-100 font-serif">
                  {isNepali ? 'भौचर कोड वा सक्रियता पिन राख्नुहोस्' : 'Redeem Activation Voucher or PIN'}
                </h3>
                <p className="text-xs text-amber-300/80">
                  {isNepali
                    ? 'यदि तपाईँले पण्डित शम्भु प्रसाद लम्साल (Binay) बाट सिधै सक्रियता कोड वा पिन पाउनुभएको छ भने यहाँ राख्नुहोस्।'
                    : 'If you have received an activation voucher or PIN from Pandit Ji, enter it below.'}
                </p>
              </div>

              <form onSubmit={handleVoucherSubmit} className="space-y-3 bg-stone-950/80 p-5 rounded-2xl border border-amber-600/40">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    {isNepali ? 'सक्रियता कोड (Activation Code / PIN):' : 'Activation Code / PIN:'}
                  </label>
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder={isNepali ? 'आफ्नो कोड प्रविष्ट गर्नुहोस्' : 'Enter your code'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-100 text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none uppercase placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-300 mb-1">
                    {isNepali ? 'तपाईँको नाम (Name):' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="उदा: Shambhu Lamsal"
                    className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-300 mb-1">
                    {isNepali ? 'सम्पर्क मोबाइल (Phone):' : 'Contact Phone:'}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-100 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                {voucherError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{voucherError}</span>
                  </div>
                )}

                {voucherSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{voucherSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{isNepali ? 'कोड सक्रिय गरी कुण्डली अनलक गर्नुहोस्' : 'Redeem Code & Unlock'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-black/70 border-t border-amber-800/40 text-center text-xs text-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isNepali
                ? '१००% सुरक्षित भुक्तानी एवं आधिकारिक पण्डित परामर्श'
                : '100% Secure Payment & Verified Astrological Service'}
            </span>
          </div>

          <div className="text-[11px] text-amber-400">
            📞 प्रत्यक्ष सहयोग: <span className="font-mono font-bold text-white">9863991384 / 9805674119</span>
          </div>
        </div>
      </div>
    </div>
  );
};
