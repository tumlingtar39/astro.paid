import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type SubscriptionPlanId = 'free' | 'simple' | 'vip' | 'vvip' | 'lifetime';

export interface PlanConfig {
  id: SubscriptionPlanId;
  nameNe: string;
  nameEn: string;
  durationLabelNe: string;
  durationLabelEn: string;
  priceNpr: number;
  originalPriceNpr: number;
  durationDays: number; // 0 for lifetime
  badgeNe?: string;
  badgeEn?: string;
  highlight?: boolean;
  featuresNe: string[];
  featuresEn: string[];
}

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'simple',
    nameNe: 'साधारण योजना (Simple Plan)',
    nameEn: 'Simple Plan',
    durationLabelNe: '३ महिना (3 Months)',
    durationLabelEn: '3 Months',
    priceNpr: 399,
    originalPriceNpr: 799,
    durationDays: 90,
    badgeNe: 'प्रारम्भिक (Starter)',
    badgeEn: 'Starter',
    featuresNe: [
      '३ महिनासम्म असीमित जन्म कुण्डली निर्माण',
      'सतिक वैदिक लग्न कुण्डली, नवमांश र भाव स्थिति',
      'वैदिक अंक ज्योतिष र वास्तु शास्त्र विश्लेषण',
      'विंशोत्तरी महादशा र अन्तर्दशा चक्र',
      'आधारभूत वार्षिक फलित र दशा फल'
    ],
    featuresEn: [
      'Unlimited Vedic Kundali generation for 3 Months',
      'Accurate Lagna, Navamsha & 12 Bhava positions',
      'Vedic Numerology & Vastu Shastra analyzers',
      'Vimshottari Mahadasha & Antardasha timeline',
      'Basic Yearly Phalit & predictions'
    ]
  },
  {
    id: 'vip',
    nameNe: 'भि.आइ.पि योजना (VIP Plan)',
    nameEn: 'VIP Plan',
    durationLabelNe: '६ महिना (6 Months)',
    durationLabelEn: '6 Months',
    priceNpr: 699,
    originalPriceNpr: 1499,
    durationDays: 180,
    badgeNe: 'सर्वाधिक लोकप्रिय (Most Popular)',
    badgeEn: 'Most Popular',
    highlight: true,
    featuresNe: [
      '६ महिनासम्म असीमित जन्म कुण्डली र विस्तृत फलित',
      'सम्पूर्ण १६ वर्ग कुण्डली (D1 देखि D60 सम्म)',
      'विस्तृत १२ भाव वार्षिक फलित (करियर, स्वास्थ्य, धन)',
      'ग्रह शान्ति, रत्न, रुद्राक्ष एवं वैदिक पूजा उपाय',
      'परम्परागत चिना PDF डाउनलोड र हाई-क्वालिटी प्रिन्ट'
    ],
    featuresEn: [
      'Unlimited Kundali & In-depth Phalit for 6 Months',
      'Complete 16 Divisional Charts (D1 to D60)',
      'Detailed 12 Bhavas Annual Phalit (Career, Health, Wealth)',
      'Remedies: Gemstones, Rudraksha & Vedic Puja guidance',
      'Formal Traditional Cheena PDF download & High-Res Print'
    ]
  },
  {
    id: 'vvip',
    nameNe: 'भि.भि.आइ.पि योजना (VVIP Plan)',
    nameEn: 'VVIP Plan',
    durationLabelNe: '१ वर्ष (1 Year)',
    durationLabelEn: '1 Year',
    priceNpr: 1299,
    originalPriceNpr: 2999,
    durationDays: 365,
    badgeNe: 'उत्कृष्ट मूल्य (Best Value)',
    badgeEn: 'Best Value',
    featuresNe: [
      '१ वर्षसम्म सम्पूर्ण कुण्डली, फलित र सबै सुविधाहरू',
      'त्रिभागी, योगिनी एवं विंशोत्तरी सम्पूर्ण सूक्ष्म दशा',
      'विश्वका १५०+ देशहरूमा विदेश यात्रा र PR सम्भावना योग',
      'अष्टकूट ३६ गुण विवाह कुण्डली मिलान र माङ्गलिक दोष',
      'Binay Guru AI ज्योतिष परामर्शमा प्राथमिकता पहुँच'
    ],
    featuresEn: [
      '1 Full Year of Unlimited Kundali, Phalit & All Features',
      'Tribhagi, Yogini & Vimshottari Micro-Dasha periods',
      '150+ World Countries Foreign Travel & PR Astro Evaluation',
      'Ashtakoot 36 Guna Marriage Match & Manglik Dosha Analysis',
      'Priority Access to Binay Guru AI Astrology Consultation'
    ]
  },
  {
    id: 'lifetime',
    nameNe: 'आजीवन सदस्यता (Lifetime Plan)',
    nameEn: 'Lifetime Plan',
    durationLabelNe: 'आजीवन (Lifetime)',
    durationLabelEn: 'Lifetime',
    priceNpr: 4999,
    originalPriceNpr: 9999,
    durationDays: 0, // 0 = permanent
    badgeNe: 'शाही पहुँच (Royal Lifetime)',
    badgeEn: 'Royal Lifetime',
    featuresNe: [
      'सधैँका लागि असीमित जन्म कुण्डली, चिना र सम्पूर्ण फलित',
      'कुनै नवीकरण शुल्क नलाग्ने (No Renewal Fees Ever)',
      'भविष्यमा आउने सबै नयाँ AI मोडेल र फिचरहरू नि:शुल्क',
      'सम्पूर्ण परिवार र आफन्तहरूको असीमित कुण्डली संग्रह',
      'पण्डित शम्भु प्रसाद लम्साल (Binay) सँग सिधा विशेष परामर्श छुट'
    ],
    featuresEn: [
      'Permanent Lifetime access to all Kundali, Cheena & Phalit',
      'Zero Renewal Fees Ever - One-Time Payment',
      'All upcoming AI models, charts & features free forever',
      'Unlimited Cloud storage for family & client Kundalis',
      'Direct priority discount on personal Pandit Ji consultations'
    ]
  }
];

export interface UserSubscription {
  planId: SubscriptionPlanId;
  status: 'active' | 'expired' | 'trial';
  customerName?: string;
  customerPhone?: string;
  transactionId?: string;
  activatedAt: number;
  expiresAt: number; // timestamp, or 0 if lifetime
  voucherCode?: string;
}

const STORAGE_KEY = 'astrology_user_subscription';

export const PAYMENT_CHANNELS = {
  esewa: {
    name: 'eSewa (ईसेवा)',
    id: '9863991384',
    secondaryId: '9805674119',
    accountName: 'Shambhu Prasad Lamsal (Binay)'
  },
  khalti: {
    name: 'Khalti (खल्ती)',
    id: '9863991384',
    accountName: 'Shambhu Prasad Lamsal'
  },
  imePay: {
    name: 'IME Pay (आइएमई पे)',
    id: '9863991384',
    accountName: 'Shambhu Prasad Lamsal'
  },
  fonepay: {
    name: 'Fonepay / Bank QR',
    id: '9863991384',
    bankName: 'Nepal Bank / Global IME Bank',
    accountName: 'Shambhu Prasad Lamsal'
  },
  whatsapp: {
    phone: '9863991384',
    intlPhone: '9779863991384',
    display: '+977-9863991384 / 9805674119'
  }
};

// Known master activation vouchers fallback (Admin Only)
const MASTER_VOUCHERS: Record<string, { planId: SubscriptionPlanId; days: number }> = {
  'BINAY9819': { planId: 'lifetime', days: 0 }
};

/**
 * Get active subscription from local storage
 */
export function getStoredSubscription(): UserSubscription | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sub: UserSubscription = JSON.parse(raw);
    
    // Check expiration if not lifetime (expiresAt > 0)
    if (sub.expiresAt > 0 && Date.now() > sub.expiresAt) {
      sub.status = 'expired';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    }
    return sub;
  } catch {
    return null;
  }
}

/**
 * Save subscription to local storage and sync to Firestore if possible
 */
export function saveSubscription(sub: UserSubscription): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    
    // Also sync to cloud firestore in background
    if (db && sub.customerPhone) {
      const cleanPhone = sub.customerPhone.replace(/\D/g, '');
      if (cleanPhone.length >= 8) {
        setDoc(doc(db, 'subscriptions', cleanPhone), {
          ...sub,
          updatedAt: Date.now()
        }, { merge: true }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Could not save subscription:', e);
  }
}

/**
 * Activate a plan by ID
 */
export function activateSubscriptionPlan(
  planId: SubscriptionPlanId,
  customerName?: string,
  customerPhone?: string,
  transactionId?: string,
  voucherCode?: string
): UserSubscription {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  const now = Date.now();
  const expiresAt = plan && plan.durationDays > 0 ? now + plan.durationDays * 24 * 60 * 60 * 1000 : 0;

  const sub: UserSubscription = {
    planId,
    status: 'active',
    customerName: customerName || 'Valued Client',
    customerPhone: customerPhone || '',
    transactionId: transactionId || `TXN-${now.toString().slice(-6)}`,
    activatedAt: now,
    expiresAt,
    voucherCode
  };

  saveSubscription(sub);
  return sub;
}

/**
 * Verify a voucher code or admin-generated license code
 */
export async function redeemVoucherCodeAsync(
  code: string,
  customerName?: string,
  customerPhone?: string
): Promise<{ success: boolean; subscription?: UserSubscription; messageNe: string; messageEn: string }> {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return {
      success: false,
      messageNe: 'कृपया सक्रियता कोड वा भौचर पिन राख्नुहोस्।',
      messageEn: 'Please enter an activation code or voucher PIN.'
    };
  }

  // 1. Check master vouchers first
  const match = MASTER_VOUCHERS[clean];
  if (match) {
    const now = Date.now();
    const expiresAt = match.days > 0 ? now + match.days * 24 * 60 * 60 * 1000 : 0;

    const sub: UserSubscription = {
      planId: match.planId,
      status: 'active',
      customerName: customerName || 'Kundali User',
      customerPhone: customerPhone || '',
      transactionId: `VOUCHER-${clean}`,
      activatedAt: now,
      expiresAt,
      voucherCode: clean
    };

    saveSubscription(sub);

    const planObj = SUBSCRIPTION_PLANS.find(p => p.id === match.planId);
    return {
      success: true,
      subscription: sub,
      messageNe: `बधाई छ! ${planObj?.nameNe || 'योजना'} सफलतापूर्वक सक्रिय भयो! अब असीमित कुण्डली र फलित हेर्न सक्नुहुन्छ।`,
      messageEn: `Congratulations! ${planObj?.nameEn || 'Plan'} activated successfully! Full Kundali & Phalit unlocked.`
    };
  }

  // 2. Check dynamically created admin license codes in Firestore / Server / Local Storage
  try {
    const { verifyOrActivateLicense } = await import('./licenseService');
    const authResult = await verifyOrActivateLicense(clean, customerName, customerPhone);

    if (authResult.authorized && authResult.license) {
      const lic = authResult.license;
      const tier = (lic.tier || 'vip').toLowerCase() as SubscriptionPlanId;
      const validTier: SubscriptionPlanId = ['simple', 'vip', 'vvip', 'lifetime'].includes(tier) ? tier : 'vip';
      
      let expTime = 0;
      if (lic.expiresAt && validTier !== 'lifetime') {
        expTime = new Date(lic.expiresAt).getTime();
      }

      const sub: UserSubscription = {
        planId: validTier,
        status: 'active',
        customerName: lic.customerName || customerName || 'ग्राहक',
        customerPhone: lic.customerPhone || customerPhone || '',
        transactionId: `LIC-${clean}`,
        activatedAt: lic.activatedAt ? new Date(lic.activatedAt).getTime() : Date.now(),
        expiresAt: expTime,
        voucherCode: clean
      };

      saveSubscription(sub);
      const planObj = SUBSCRIPTION_PLANS.find(p => p.id === validTier);

      return {
        success: true,
        subscription: sub,
        messageNe: `बधाई छ! ${planObj?.nameNe || 'योजना'} सफलतापूर्वक सक्रिय भयो! यो १ डिभाइसमा सुरक्षित दर्ता भयो।`,
        messageEn: `Congratulations! ${planObj?.nameEn || 'Plan'} activated successfully and securely bound to this device.`
      };
    } else {
      return {
        success: false,
        messageNe: authResult.messageNe || 'अमान्य वा प्रयोग भइसकेको कोड। कृपया बैंक भुक्तानी गरी पण्डित ज्यूबाट नयाँ कोड लिनुहोस्।',
        messageEn: authResult.messageEn || 'Invalid or expired code. Please make bank payment and contact Pandit Ji for a valid code.'
      };
    }
  } catch (e: any) {
    return {
      success: false,
      messageNe: 'सक्रियता गर्दा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस् वा WhatsApp मा सम्पर्क गर्नुहोस्।',
      messageEn: 'Error during activation. Please try again or contact support.'
    };
  }
}

/**
 * Synchronous backward-compatible voucher redeemer
 */
export function redeemVoucherCode(
  code: string,
  customerName?: string,
  customerPhone?: string
): { success: boolean; subscription?: UserSubscription; messageNe: string; messageEn: string } {
  const clean = code.trim().toUpperCase();
  const match = MASTER_VOUCHERS[clean];

  if (!match) {
    // Also check local licenses map synchronously
    try {
      const raw = localStorage.getItem('__jyotish_local_licenses_db__');
      if (raw) {
        const list = JSON.parse(raw);
        const lic = Array.isArray(list) ? list.find((l: any) => l?.licenseKey?.toUpperCase() === clean) : null;
        if (lic) {
          const tier = (lic.tier || 'vip').toLowerCase() as SubscriptionPlanId;
          const validTier: SubscriptionPlanId = ['simple', 'vip', 'vvip', 'lifetime'].includes(tier) ? tier : 'vip';
          const expTime = lic.expiresAt && validTier !== 'lifetime' ? new Date(lic.expiresAt).getTime() : 0;
          
          const sub: UserSubscription = {
            planId: validTier,
            status: 'active',
            customerName: lic.customerName || customerName || 'ग्राहक',
            customerPhone: lic.customerPhone || customerPhone || '',
            transactionId: `LIC-${clean}`,
            activatedAt: Date.now(),
            expiresAt: expTime,
            voucherCode: clean
          };
          saveSubscription(sub);
          const planObj = SUBSCRIPTION_PLANS.find(p => p.id === validTier);
          return {
            success: true,
            subscription: sub,
            messageNe: `बधाई छ! ${planObj?.nameNe || 'योजना'} सक्रिय भयो!`,
            messageEn: `Congratulations! ${planObj?.nameEn || 'Plan'} activated!`
          };
        }
      }
    } catch (_e) {}

    return {
      success: false,
      messageNe: 'अमान्य वा प्रयोग भइसकेको कोड। कृपया पुनः जाँच गर्नुहोस् वा भुक्तानी गरी WhatsApp मा सम्पर्क गर्नुहोस्।',
      messageEn: 'Invalid or expired voucher code. Please recheck or contact support on WhatsApp.'
    };
  }

  const now = Date.now();
  const expiresAt = match.days > 0 ? now + match.days * 24 * 60 * 60 * 1000 : 0;

  const sub: UserSubscription = {
    planId: match.planId,
    status: 'active',
    customerName: customerName || 'Kundali User',
    customerPhone: customerPhone || '',
    transactionId: `VOUCHER-${clean}`,
    activatedAt: now,
    expiresAt,
    voucherCode: clean
  };

  saveSubscription(sub);

  const planObj = SUBSCRIPTION_PLANS.find(p => p.id === match.planId);
  return {
    success: true,
    subscription: sub,
    messageNe: `बधाई छ! ${planObj?.nameNe || 'योजना'} सफलतापूर्वक सक्रिय भयो! अब असीमित कुण्डली र फलित हेर्न सक्नुहुन्छ।`,
    messageEn: `Congratulations! ${planObj?.nameEn || 'Plan'} activated successfully! Full Kundali & Phalit unlocked.`
  };
}

/**
 * Generate a pre-filled WhatsApp link for direct receipt verification
 */
export function getWhatsAppPaymentLink(
  planId: SubscriptionPlanId,
  customerName: string,
  customerPhone: string,
  paymentMethod: string,
  txnId: string
): string {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[1];
  const msg = `🙏 **नमस्ते पण्डित ज्यू (Binay Guru), मैले कुण्डली तथा फलित सदस्यता भुक्तानी गरेको छु:**
──────────────────────────
👑 **रोजेको योजना (Plan):** ${plan.nameNe} (${plan.durationLabelNe})
💰 **रकम (Amount):** रु ${plan.priceNpr}
👤 **ग्राहकको नाम (Name):** ${customerName || 'उल्लेख नगरिएको'}
📱 **मोबाइल नम्बर (Phone):** ${customerPhone || 'उल्लेख नगरिएको'}
💳 **भुक्तानी माध्यम (Method):** ${paymentMethod}
🧾 **कारोबार नं (Transaction ID / Ref):** ${txnId || 'Screenshot Attached'}
──────────────────────────
कृपया मेरो खाता तुरुन्त सक्रिय गरिदिनुहोला। धन्यवाद!`;

  return `https://wa.me/${PAYMENT_CHANNELS.whatsapp.intlPhone}?text=${encodeURIComponent(msg)}`;
}
