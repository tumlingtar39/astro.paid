import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Copy,
  Check,
  Zap,
  Crown,
  Award,
  PhoneCall,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Language, DevicePaymentRequest } from '../../types';
import { getOrCreateDeviceId } from '../../lib/deviceSecurity';
import {
  submitDevicePaymentRequest,
  getDevicePaymentRequest,
} from '../../lib/licenseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApprovedAndActivated?: (key: string) => void;
  prefilledCustomerName?: string;
  prefilledCustomerPhone?: string;
  defaultPlan?: 'simple' | 'vip' | 'vvip' | 'lifetime';
  isRenewal?: boolean;
}

export const CustomerRenewalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  onApprovedAndActivated,
  prefilledCustomerName = '',
  prefilledCustomerPhone = '',
  defaultPlan = 'vip',
  isRenewal = false,
}) => {
  const isNepali = language === 'ne';
  const { deviceId } = getOrCreateDeviceId();

  const [customerName, setCustomerName] = useState(prefilledCustomerName);
  const [customerPhone, setCustomerPhone] = useState(prefilledCustomerPhone);
  const [selectedPlan, setSelectedPlan] = useState<'simple' | 'vip' | 'vvip' | 'yearly' | 'lifetime'>((defaultPlan as any) || 'vip');
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti' | 'Bank' | 'Direct'>('eSewa');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<DevicePaymentRequest | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEsewa, setCopiedEsewa] = useState(false);

  // Check if there is already a pending or recent request for this device
  useEffect(() => {
    if (isOpen && deviceId) {
      getDevicePaymentRequest(deviceId).then((req) => {
        if (req) {
          setExistingRequest(req);
          if (req.customerName && !customerName) setCustomerName(req.customerName);
          if (req.customerPhone && !customerPhone) setCustomerPhone(req.customerPhone);
        }
      });
    }
  }, [isOpen, deviceId]);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'simple' as const,
      nameNe: 'साधारण योजना (Simple)',
      nameEn: 'Simple Plan',
      durationNe: '१ महिना (1 Month)',
      durationEn: '1 Month',
      price: 399,
      icon: Zap,
      color: 'emerald',
      highlightNe: 'रु. ३९९ / १ महिना',
    },
    {
      id: 'vip' as const,
      nameNe: 'भिआइपी योजना (VIP)',
      nameEn: 'VIP Plan',
      durationNe: '३ महिना (3 Months)',
      durationEn: '3 Months',
      price: 699,
      icon: Sparkles,
      color: 'amber',
      highlightNe: 'रु. ६९९ / ३ महिना',
    },
    {
      id: 'vvip' as const,
      nameNe: 'भिभिआइपी योजना (VVIP)',
      nameEn: 'VVIP Plan',
      durationNe: '६ महिना (6 Months)',
      durationEn: '6 Months',
      price: 1199,
      icon: Crown,
      color: 'purple',
      highlightNe: 'रु. १,१९९ / ६ महिना',
      popular: true,
    },
    {
      id: 'yearly' as const,
      nameNe: 'वार्षिक योजना (Yearly)',
      nameEn: 'Yearly Plan',
      durationNe: '१ वर्ष (1 Year)',
      durationEn: '1 Year',
      price: 2199,
      icon: Award,
      color: 'teal',
      highlightNe: 'रु. २,१९९ / १ वर्ष',
    },
    {
      id: 'lifetime' as const,
      nameNe: 'आजन्म योजना (Lifetime)',
      nameEn: 'Lifetime Plan',
      durationNe: 'सधैंको लागि (आजन्म)',
      durationEn: 'Lifetime Access (No Expiry)',
      price: 5999,
      icon: Award,
      color: 'blue',
      highlightNe: 'रु. ५,९९९ (आजन्म)',
    },
  ];

  const currentPlanObj = plans.find((p) => p.id === selectedPlan) || plans[1];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const name = customerName.trim();
    const phone = customerPhone.trim();

    if (!name) {
      setErrorMessage(isNepali ? 'कृपया आफ्नो पूरा नाम लेख्नुहोस्।' : 'Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 7) {
      setErrorMessage(isNepali ? 'कृपया सही मोबाइल नम्बर लेख्नुहोस्।' : 'Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitDevicePaymentRequest({
        deviceId,
        customerName: name,
        customerPhone: phone,
        customerEmail: '',
        planId: selectedPlan,
        planName: isNepali ? currentPlanObj.nameNe : currentPlanObj.nameEn,
        amount: currentPlanObj.price,
        paymentMethod,
        transactionRef: transactionRef.trim() || 'Pending Transfer',
        notes: notes.trim() || (isRenewal ? 'Renewal Request from Customer' : 'Activation Request from Customer'),
      });

      setExistingRequest(result);
    } catch (err: any) {
      setErrorMessage(err?.message || (isNepali ? 'अनुरोध पठाउन सकिएन।' : 'Failed to submit request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const req = await getDevicePaymentRequest(deviceId);
      setExistingRequest(req);

      if (req && req.status === 'approved' && req.assignedLicenseKey) {
        if (onApprovedAndActivated) {
          onApprovedAndActivated(req.assignedLicenseKey);
        }
        onClose();
      }
    } catch (_e) {
    } finally {
      setTimeout(() => setIsCheckingStatus(false), 600);
    }
  };

  const copyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyEsewaId = () => {
    navigator.clipboard.writeText('9863991384');
    setCopiedEsewa(true);
    setTimeout(() => setCopiedEsewa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 relative my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-5 sm:px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 tracking-tight">
                {isRenewal
                  ? isNepali
                    ? '🔄 इजाजतपत्र नवीकरण अनुरोध (License Renewal)'
                    : '🔄 Apply for License Renewal'
                  : isNepali
                  ? '✨ नयाँ इजाजतपत्र / नवीकरण अनुरोध (Apply for Access)'
                  : '✨ Apply for License / Activation'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {isNepali
                  ? 'प्याकेज छान्नुहोस् र एडमिनबाट सिधै यो डिभाइसमा Key स्वीकृत गराउनुहोस्'
                  : 'Choose plan and submit request for direct Admin approval & binding'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* If there is an existing pending request, show status tracker */}
          {existingRequest && existingRequest.status === 'pending' ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 animate-pulse">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {isNepali ? '⏳ स्वीकृतिको प्रतीक्षामा (Pending)' : '⏳ Pending Admin Approval'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(existingRequest.createdAt).toLocaleTimeString(isNepali ? 'ne-NP' : 'en-US')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {isNepali
                      ? `तपाईँको ${existingRequest.planName || 'VIP'} अनुरोध पेश भएको छ!`
                      : `Your ${existingRequest.planName || 'VIP'} request is under review!`}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isNepali
                      ? 'पण्डित शम्भु प्रसाद लम्साल (व्यवस्थापक) ले भुक्तानी रुजु गरेर स्वीकृत गर्नेबित्तिकै यो डिभाइसमा एप स्वतः खुल्नेछ।'
                      : 'Once administrator approves your payment, your app will automatically unlock on this device.'}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isNepali ? '🔄 स्वीकृति स्थिति जाँच्नुहोस् (Check Status)' : 'Check Approval Status'}</span>
                </button>

                <a
                  href="tel:9863991384"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isNepali ? '९८६३९९१३८४ मा फोन गर्नुहोस्' : 'Call 9863991384'}</span>
                </a>
              </div>
            </div>
          ) : existingRequest && existingRequest.status === 'approved' ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    {isNepali ? '✅ अनुरोध स्वीकृत भयो!' : '✅ Request Approved!'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isNepali ? 'तपाईँको Key:' : 'Your Key:'}{' '}
                    <strong className="font-mono text-amber-300">{existingRequest.assignedLicenseKey}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (existingRequest.assignedLicenseKey && onApprovedAndActivated) {
                    onApprovedAndActivated(existingRequest.assignedLicenseKey);
                  }
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>{isNepali ? 'एपमा प्रवेश गर्नुहोस् (Enter App)' : 'Enter App'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Form to submit a new or updated request */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Package Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-2">
                {isNepali ? '१. सदस्यता प्याकेज छान्नुहोस् (Select Plan):' : '1. Select Plan / Duration:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plans.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{isNepali ? p.nameNe : p.nameEn}</span>
                            {p.popular && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-300 font-bold">
                                लोकप्रिय
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {isNepali ? p.durationNe : p.durationEn}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-300 block">
                          रु {p.price}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isNepali ? 'ग्राहकको पूरा नाम (Full Name):' : 'Full Name:'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isNepali ? 'जस्तै: रमेश अधिकारी' : 'Your full name'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isNepali ? 'सम्पर्क मोबाइल नम्बर (Phone):' : 'Phone Number:'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={isNepali ? '९८xxxxxxxx' : '98xxxxxxxx'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Device ID Info */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                {isNepali ? 'यो डिभाइस आइडी (Device ID):' : 'This Device ID:'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px] sm:max-w-[220px]">
                  {deviceId}
                </span>
                <button
                  type="button"
                  onClick={copyDeviceId}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 transition cursor-pointer"
                >
                  {copiedId ? (isNepali ? 'कपि भयो' : 'Copied') : (isNepali ? 'कपि' : 'Copy')}
                </button>
              </div>
            </div>

            {/* 4. Payment Info Box (eSewa / Khalti / Bank) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  {isNepali ? 'भुक्तानी विवरण (Payment Details):' : 'Payment Details:'}
                </span>
                <span className="font-mono font-bold text-amber-300">
                  रु {currentPlanObj.price}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {isNepali ? 'eSewa / Khalti ID (पण्डित शम्भु प्रसाद लम्साल):' : 'eSewa / Khalti ID:'}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">9863991384</span>
                </div>
                <button
                  type="button"
                  onClick={copyEsewaId}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedEsewa ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'कपि भयो' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'नम्बर कपि' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {isNepali ? 'भुक्तानी माध्यम (Method):' : 'Payment Method:'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white outline-none"
                  >
                    <option value="eSewa">eSewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Direct">Direct / Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {isNepali ? 'Txn ID / भुक्तानी प्रमाण:' : 'Txn Ref / Note:'}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={isNepali ? 'जस्तै: eSewa Txn Ref' : 'e.g. Txn Ref ID'}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isNepali ? 'अनुरोध पेश हुँदैछ...' : 'Submitting Request...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>
                      {isRenewal
                        ? isNepali
                          ? 'नवीकरणको लागि अनुरोध पठाउनुहोस् (Submit Renewal)'
                          : 'Submit Renewal Request'
                        : isNepali
                        ? 'इजाजतपत्र अनुरोध पेश गर्नुहोस् (Submit Request)'
                        : 'Submit License Request'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
