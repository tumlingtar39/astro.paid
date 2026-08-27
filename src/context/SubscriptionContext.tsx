import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SubscriptionPlanId,
  UserSubscription,
  SUBSCRIPTION_PLANS,
  getStoredSubscription,
  saveSubscription,
  activateSubscriptionPlan,
  redeemVoucherCode,
  redeemVoucherCodeAsync,
} from '../lib/subscriptionService';
import { useAuth, SUPER_ADMIN_EMAIL } from './AuthContext';
import { getStoredLicenseKey } from '../lib/deviceSecurity';
import { findBestActiveLicenseForDevice, getLicenseExpiryInfo, LicenseExpiryInfo } from '../lib/licenseService';
import { getTrialState, TrialState, startFreeTrial, recordTrialChinaGeneration } from '../lib/trialService';

interface SubscriptionContextType {
  currentPlan: SubscriptionPlanId;
  isSubscribed: boolean;
  subscription: UserSubscription | null;
  expiryInfo: LicenseExpiryInfo | null;
  isNearExpiry: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  isModalOpen: boolean;
  requiredFeatureTitle: string | null;
  openSubscriptionModal: (featureTitle?: string) => void;
  closeSubscriptionModal: () => void;
  activatePlan: (
    planId: SubscriptionPlanId,
    customerName?: string,
    customerPhone?: string,
    transactionId?: string,
    voucherCode?: string
  ) => void;
  redeemCode: (code: string, name?: string, phone?: string) => { success: boolean; messageNe: string; messageEn: string };
  redeemCodeAsync: (code: string, name?: string, phone?: string) => Promise<{ success: boolean; messageNe: string; messageEn: string }>;
  clearSubscription: () => void;
  refreshSubscription: () => Promise<void>;
  hasAccessToPhalit: boolean;
  hasAccessToFullKundali: boolean;
  // Free Trial State & Controls
  trialState: TrialState;
  isFreeTrialEligible: boolean;
  isTrialLimitReached: boolean;
  isFreeTrialActiveNow: boolean;
  trialModalOpen: boolean;
  openFreeTrialModal: () => void;
  closeFreeTrialModal: () => void;
  startTrial: () => void;
  refreshTrialState: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(() => getStoredSubscription());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [requiredFeatureTitle, setRequiredFeatureTitle] = useState<string | null>(null);
  const [trialState, setTrialState] = useState<TrialState>(() => getTrialState());
  const [trialModalOpen, setTrialModalOpen] = useState<boolean>(false);

  // Auto-grant super-admin / developer lifetime access
  const isSuperAdmin = Boolean(
    isAdmin ||
    (currentUser?.email && currentUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  const refreshTrialState = useCallback(() => {
    setTrialState(getTrialState());
  }, []);

  useEffect(() => {
    const handleTrialEvent = () => {
      refreshTrialState();
    };
    window.addEventListener('jyotish_trial_updated', handleTrialEvent);
    return () => {
      window.removeEventListener('jyotish_trial_updated', handleTrialEvent);
    };
  }, [refreshTrialState]);

  // Refresh and sync device license state
  const refreshSubscription = useCallback(async () => {
    // 1. Check existing stored subscription
    const existing = getStoredSubscription();
    
    // 2. Check if device has an authorized license record
    try {
      const activeLic = await findBestActiveLicenseForDevice();
      if (activeLic && activeLic.licenseKey) {
        const tier = (activeLic.tier || 'vip').toLowerCase() as SubscriptionPlanId;
        const validTier: SubscriptionPlanId = ['simple', 'vip', 'vvip', 'yearly', 'lifetime'].includes(tier) ? tier : 'vip';
        const expTime = activeLic.expiresAt && validTier !== 'lifetime' ? new Date(activeLic.expiresAt).getTime() : 0;
        
        // If no local subscription or license is more recent/lifetime, use license info
        if (!existing || existing.expiresAt < expTime || validTier === 'lifetime') {
          const syncedSub: UserSubscription = {
            planId: validTier,
            status: expTime > 0 && Date.now() > expTime ? 'expired' : 'active',
            customerName: activeLic.customerName || existing?.customerName || 'Valued Client',
            customerPhone: activeLic.customerPhone || existing?.customerPhone || '',
            transactionId: `DEVICE-${activeLic.licenseKey}`,
            activatedAt: activeLic.activatedAt ? new Date(activeLic.activatedAt).getTime() : Date.now(),
            expiresAt: expTime,
            voucherCode: activeLic.licenseKey,
          };
          saveSubscription(syncedSub);
          setSubscription(syncedSub);
          return;
        }
      }
    } catch (_e) {}

    if (existing) {
      setSubscription(existing);
    }
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Expiry calculation
  const now = Date.now();
  const isExpired = Boolean(
    !isSuperAdmin &&
    subscription &&
    subscription.expiresAt > 0 &&
    subscription.expiresAt < now
  );

  const isSubscribed = Boolean(
    isSuperAdmin ||
    (subscription && subscription.status === 'active' && (subscription.expiresAt === 0 || subscription.expiresAt > now))
  );

  let daysRemaining: number | null = null;
  let isNearExpiry = false;
  if (subscription && subscription.expiresAt > 0 && !isSuperAdmin) {
    const diff = subscription.expiresAt - now;
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    isNearExpiry = daysRemaining <= 15;
  }

  const expiryInfo: LicenseExpiryInfo | null = subscription ? {
    tier: subscription.planId,
    tierNameNe: subscription.planId === 'yearly' ? 'वार्षिक (Yearly Plan)' : subscription.planId === 'vvip' ? 'भिभिआइपी (VVIP Plan)' : subscription.planId === 'vip' ? 'भिआइपी (VIP Plan)' : subscription.planId === 'simple' ? 'साधारण (Simple Plan)' : 'आजन्म (Lifetime Plan)',
    tierNameEn: subscription.planId.toUpperCase(),
    durationNe: subscription.planId === 'simple' ? '१ महिना (1 Month)' : subscription.planId === 'vip' ? '३ महिना (3 Months)' : subscription.planId === 'vvip' ? '६ महिना (6 Months)' : subscription.planId === 'yearly' ? '१ वर्ष (1 Year)' : 'सधैंको लागि (आजन्म)',
    durationEn: subscription.planId === 'simple' ? '1 Month' : subscription.planId === 'vip' ? '3 Months' : subscription.planId === 'vvip' ? '6 Months' : subscription.planId === 'yearly' ? '1 Year' : 'Lifetime Access',
    priceNpr: subscription.planId === 'simple' ? 399 : subscription.planId === 'vip' ? 699 : subscription.planId === 'vvip' ? 1199 : subscription.planId === 'yearly' ? 2199 : 5999,
    isLifetime: subscription.expiresAt === 0,
    expiresAt: subscription.expiresAt > 0 ? new Date(subscription.expiresAt).toISOString() : null,
    isExpired,
    daysRemaining,
    shouldShowRenewNotice: isNearExpiry,
    formattedExpiryNe: subscription.expiresAt > 0 ? new Date(subscription.expiresAt).toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' }) : 'सधैंको लागि (आजन्म)',
    formattedExpiryEn: subscription.expiresAt > 0 ? new Date(subscription.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Lifetime',
  } : null;

  const currentPlan: SubscriptionPlanId = isSuperAdmin
    ? 'lifetime'
    : (isSubscribed && subscription ? subscription.planId : 'free');

  const openSubscriptionModal = useCallback((featureTitle?: string) => {
    setRequiredFeatureTitle(featureTitle || null);
    setIsModalOpen(true);
  }, []);

  const closeSubscriptionModal = useCallback(() => {
    setIsModalOpen(false);
    setRequiredFeatureTitle(null);
  }, []);

  const openFreeTrialModal = useCallback(() => {
    setTrialModalOpen(true);
  }, []);

  const closeFreeTrialModal = useCallback(() => {
    setTrialModalOpen(false);
  }, []);

  const startTrial = useCallback(() => {
    const updated = startFreeTrial();
    setTrialState(updated);
  }, []);

  const activatePlan = useCallback((
    planId: SubscriptionPlanId,
    customerName?: string,
    customerPhone?: string,
    transactionId?: string,
    voucherCode?: string
  ) => {
    const newSub = activateSubscriptionPlan(planId, customerName, customerPhone, transactionId, voucherCode);
    setSubscription(newSub);
    setIsModalOpen(false);
  }, []);

  const redeemCode = useCallback((code: string, name?: string, phone?: string) => {
    const res = redeemVoucherCode(code, name, phone);
    if (res.success && res.subscription) {
      setSubscription(res.subscription);
      setIsModalOpen(false);
      setTrialModalOpen(false);
    }
    return res;
  }, []);

  const redeemCodeAsync = useCallback(async (code: string, name?: string, phone?: string) => {
    const res = await redeemVoucherCodeAsync(code, name, phone);
    if (res.success && res.subscription) {
      setSubscription(res.subscription);
      setIsModalOpen(false);
      setTrialModalOpen(false);
    }
    return res;
  }, []);

  const clearSubscription = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astrology_user_subscription');
    }
    setSubscription(null);
  }, []);

  // Free trial eligibility
  const isFreeTrialEligible = !isSubscribed && !trialState.exhausted && trialState.remaining > 0;
  const isTrialLimitReached = !isSubscribed && (trialState.exhausted || trialState.remaining <= 0);
  const isFreeTrialActiveNow = !isSubscribed && trialState.active && trialState.remaining > 0;

  // Access check: Full 17 Kundali/Cheena and Phalit strictly require active subscription / verified license code
  const hasAccessToFullKundali = isSubscribed;
  const hasAccessToPhalit = isSubscribed;

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        isSubscribed,
        subscription,
        expiryInfo,
        isNearExpiry,
        isExpired,
        daysRemaining,
        isModalOpen,
        requiredFeatureTitle,
        openSubscriptionModal,
        closeSubscriptionModal,
        activatePlan,
        redeemCode,
        redeemCodeAsync,
        clearSubscription,
        refreshSubscription,
        hasAccessToPhalit,
        hasAccessToFullKundali,
        trialState,
        isFreeTrialEligible,
        isTrialLimitReached,
        isFreeTrialActiveNow,
        trialModalOpen,
        openFreeTrialModal,
        closeFreeTrialModal,
        startTrial,
        refreshTrialState,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
