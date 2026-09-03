import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Plus,
  RotateCcw,
  Smartphone,
  Copy,
  Check,
  Search,
  Trash2,
  Lock,
  X,
  RefreshCw,
  Crown,
  Sparkles,
  Zap,
  Award,
  AlertTriangle,
  Link2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  User,
  Inbox,
  Send,
  Phone,
  Download,
  Upload,
  Database,
  FileJson,
  Layers,
  FileText,
} from 'lucide-react';
import { LicenseRecord, Language, DevicePaymentRequest } from '../../types';
import { useAuth, SUPER_ADMIN_EMAIL } from '../../context/AuthContext';
import {
  adminFetchAllLicenses,
  adminCreateLicense,
  adminBulkCreate8CharLicenses,
  adminBulkCreateAll400CategorizedKeys,
  adminUpgradeLicenseToLifetime,
  adminResetDevice,
  adminDeleteLicense,
  adminDeleteAllLicenses,
  adminRenewLicense,
  adminSyncAllLicensesToCloud,
  getLicenseExpiryInfo,
  adminFetchAllPaymentRequests,
  adminApprovePaymentRequest,
  adminRejectPaymentRequest,
  adminDeletePaymentRequest,
  exportLicensesBackupJSON,
  downloadLicensesBackupFile,
  importLicensesFromJSON,
  exportLicensesAsTypeScriptCode,
  generateSignedLicenseKey,
  generateSecure8CharKey,
  verifySignedLicenseKey,
  verifySigned8CharKey,
} from '../../lib/licenseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLicenseToUse?: (key: string) => void;
}

type KeyTierType = 'simple' | 'vip' | 'vvip' | 'yearly' | 'lifetime';

const LIVE_URL_STORAGE_KEY = '__jyotish_admin_live_url__';

export const AdminLicenseManager: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  onSelectLicenseToUse,
}) => {
  const { currentUser, isAdmin, openAuthModal, loginAsSuperAdmin, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'keys' | 'requests'>('keys');
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<DevicePaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyFilterCategory, setKeyFilterCategory] = useState<'all' | 'simple' | 'vip' | 'vvip' | 'lifetime' | 'bound' | 'available'>('all');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [approvingReqId, setApprovingReqId] = useState<string | null>(null);
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [approveSuccessMsg, setApproveSuccessMsg] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncCloudMessage, setSyncCloudMessage] = useState<string | null>(null);
  const [jsonBackupMessage, setJsonBackupMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isImportingJSON, setIsImportingJSON] = useState(false);

  // Vercel Live App URL configuration
  const [liveAppUrl, setLiveAppUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LIVE_URL_STORAGE_KEY) || window.location.origin;
    }
    return '';
  });
  const [showUrlSettings, setShowUrlSettings] = useState(false);

  // Admin Quick Login State (When not logged in yet)
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Simple Key Generator Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tier, setTier] = useState<KeyTierType>('vip');
  const [keyCreationMode, setKeyCreationMode] = useState<'custom' | 'auto'>('custom');
  const [customKey, setCustomKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdKeySuccess, setCreatedKeySuccess] = useState<LicenseRecord | null>(null);

  // Bulk 100 Keys Generation State
  const [bulkCount, setBulkCount] = useState<number>(100);
  const [bulkTier, setBulkTier] = useState<KeyTierType>('lifetime');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isBulkGenerating400, setIsBulkGenerating400] = useState(false);
  const [bulkResultModal, setBulkResultModal] = useState<{
    isOpen: boolean;
    keys: string[];
    tier: string;
    count: number;
    categorized?: {
      normal: string[];
      vip: string[];
      vvip: string[];
      lifetime: string[];
    };
  } | null>(null);
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState<'all' | 'simple' | 'vip' | 'vvip' | 'lifetime'>('all');
  const [bulkCopySuccess, setBulkCopySuccess] = useState(false);

  // Custom Renewal Options Modal
  const [renewModalItem, setRenewModalItem] = useState<LicenseRecord | null>(null);
  const [renewMonthsChoice, setRenewMonthsChoice] = useState<number>(6);
  const [isUpgradingLifetime, setIsUpgradingLifetime] = useState(false);
  const [isRenewingCustom, setIsRenewingCustom] = useState(false);

  // Custom In-App Confirmation Modal State (Reliable inside iframes & all devices)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const isNepali = language === 'ne';

  const handleLiveUrlSave = (newUrl: string) => {
    const clean = newUrl.trim().replace(/\/+$/, '');
    setLiveAppUrl(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_URL_STORAGE_KEY, clean);
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setSyncCloudMessage(null);
    try {
      const res = await adminSyncAllLicensesToCloud();
      if (res.success) {
        setSyncCloudMessage(
          isNepali
            ? `सफलतापूर्वक ${res.count} वटा Key क्लाउड (Firestore) मा सिङ्क भयो! अब Vercel मा तुरुन्तै खुल्नेछ।`
            : `Successfully synced ${res.count} keys to Firestore Cloud! Vercel users can activate immediately.`
        );
      } else {
        setSyncCloudMessage(
          isNepali
            ? `क्लाउड सिङ्कमा समस्या आयो। तर स्थानीय सुरक्षित छ।`
            : `Sync to cloud encountered an issue.`
        );
      }
      await loadLicenses();
    } catch (e: any) {
      setSyncCloudMessage(e?.message || 'Sync error');
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setSyncCloudMessage(null), 6000);
    }
  };

  const handleExportJSON = () => {
    downloadLicensesBackupFile(`astrology_licenses_backup_${new Date().toISOString().substring(0, 10)}.json`);
    setJsonBackupMessage({
      text: isNepali
        ? 'JSON ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो! यसलाई Vercel वा कुनै पनि डिभाइसमा रिस्टोर गर्न सक्नुहुन्छ।'
        : 'JSON backup file downloaded successfully! You can restore it on Vercel or any device.',
    });
    setTimeout(() => setJsonBackupMessage(null), 6000);
  };

  const handleCopyAllJSON = () => {
    const jsonStr = exportLicensesBackupJSON();
    copyToClipboard(jsonStr);
    setJsonBackupMessage({
      text: isNepali
        ? 'सबै Key हरूको JSON डाटा क्लिपबोर्डमा कपि भयो!'
        : 'All keys JSON copied to clipboard!',
    });
    setTimeout(() => setJsonBackupMessage(null), 5000);
  };

  const handleCopyTypeScriptCode = () => {
    const tsCode = exportLicensesAsTypeScriptCode();
    copyToClipboard(tsCode);
    setJsonBackupMessage({
      text: isNepali
        ? '📋 SEED_LICENSES को TypeScript कोड क्लिपबोर्डमा कपि भयो! यसलाई सोझै कोडमा पेस्ट गरी Vercel मा डिप्लोय गर्न सक्नुहुन्छ।'
        : '📋 TypeScript code copied! You can paste it into SEED_LICENSES for hardcoded Vercel deployment.',
    });
    setTimeout(() => setJsonBackupMessage(null), 6000);
  };

  const handleImportJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingJSON(true);
    setJsonBackupMessage(null);
    try {
      const text = await file.text();
      const result = await importLicensesFromJSON(text);
      if (result.success) {
        setJsonBackupMessage({ text: result.message });
        await loadLicenses();
      } else {
        setJsonBackupMessage({ text: result.message, isError: true });
      }
    } catch (err: any) {
      setJsonBackupMessage({
        text: isNepali ? `फाइल पढ्न सकिएन: ${err?.message}` : `Failed to read file: ${err?.message}`,
        isError: true,
      });
    } finally {
      setIsImportingJSON(false);
      e.target.value = '';
      setTimeout(() => setJsonBackupMessage(null), 6000);
    }
  };

  const handleAdminQuickLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAdminLoggingIn(true);
    setAdminLoginError(null);
    try {
      await loginAsSuperAdmin(adminPinInput);
      await loadLicenses();
    } catch (err: any) {
      setAdminLoginError(err?.message || (isNepali ? 'लगइन असफल भयो।' : 'Login failed.'));
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const list = await adminFetchAllLicenses();
      setLicenses(list);
    } catch (e) {
      console.error('Error fetching licenses:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentRequests = async () => {
    setRequestsLoading(true);
    try {
      const list = await adminFetchAllPaymentRequests();
      setPaymentRequests(list);
    } catch (e) {
      console.error('Error fetching payment requests:', e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLicenses();
      loadPaymentRequests();
    }
  }, [isOpen]);

  const handleApproveRequest = async (reqItem: DevicePaymentRequest, overrideTier?: string) => {
    setApprovingReqId(reqItem.id);
    setApproveSuccessMsg(null);
    try {
      const res = await adminApprovePaymentRequest(reqItem.id, overrideTier || reqItem.planId);
      if (res.success && res.license) {
        setApproveSuccessMsg(
          isNepali
            ? `✅ ${reqItem.customerName} (${reqItem.customerPhone || reqItem.deviceId}) को डिभाइस सफलतापूर्वक स्वीकृत भयो! Key: ${res.license.licenseKey}`
            : `✅ Request approved! Device unlocked with Key: ${res.license.licenseKey}`
        );
        await loadLicenses();
        await loadPaymentRequests();
      }
    } catch (e: any) {
      console.error('Error approving request:', e);
    } finally {
      setApprovingReqId(null);
      setTimeout(() => setApproveSuccessMsg(null), 7000);
    }
  };

  const handleRejectRequest = (reqId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: isNepali ? 'भुक्तानी अनुरोध अस्वीकार' : 'Reject Payment Request',
      message: isNepali
        ? 'के तपाईँ यो भुक्तानी अनुरोधलाई अस्वीकृत गर्न निश्चित हुनुहुन्छ?'
        : 'Are you sure you want to reject this payment request?',
      confirmText: isNepali ? '❌ अस्वीकार गर्नुहोस्' : 'Reject Request',
      cancelText: isNepali ? 'रद्द गर्नुहोस्' : 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        setRejectingReqId(reqId);
        try {
          await adminRejectPaymentRequest(reqId);
          await loadPaymentRequests();
        } catch (e) {
          console.error('Error rejecting request:', e);
        } finally {
          setRejectingReqId(null);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeletePaymentRequest = (reqId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: isNepali ? 'अनुरोध रेकर्ड मेटाउने' : 'Delete Payment Request',
      message: isNepali
        ? 'के तपाईँ यो भुक्तानी अनुरोध रेकर्ड सूचीबाट मेटाउन निश्चित हुनुहुन्छ?'
        : 'Are you sure you want to delete this payment request record?',
      confirmText: isNepali ? 'मेटाउनुहोस्' : 'Delete Record',
      cancelText: isNepali ? 'रद्द गर्नुहोस्' : 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setPaymentRequests((prev) => prev.filter((r) => r.id !== reqId && r.deviceId !== reqId));
          await adminDeletePaymentRequest(reqId);
          await loadPaymentRequests();
        } catch (e) {
          console.error('Error deleting payment request:', e);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const generateAutoKey = (selectedTier: KeyTierType, customPrefix?: string): string => {
    return generateSignedLicenseKey(selectedTier, customPrefix);
  };

  const handleBulkGenerate = async (countToGenerate: number = 100, selectedTier: KeyTierType = 'lifetime') => {
    setIsBulkGenerating(true);
    setCreateError(null);
    try {
      const res = await adminBulkCreate8CharLicenses(
        countToGenerate,
        selectedTier,
        `Bulk 8-Char Key (${selectedTier.toUpperCase()})`
      );
      await loadLicenses();
      const keys = res.licenses.map((l) => l.licenseKey);
      setBulkResultModal({
        isOpen: true,
        keys,
        tier: selectedTier,
        count: res.count,
      });
      setBulkCategoryFilter('all');
      setSyncCloudMessage(
        isNepali
          ? `🎉 ${res.count} वटा नयाँ ८-अक्षरका कीहरू (${selectedTier.toUpperCase()}) सफलतापूर्वक तयार भएर Firestore र सर्भरमा सुरक्षित भयो!`
          : `🎉 ${res.count} new 8-character keys (${selectedTier.toUpperCase()}) generated and saved successfully!`
      );
    } catch (err: any) {
      console.error('Error generating bulk keys:', err);
      setCreateError(err?.message || (isNepali ? 'कीहरू बनाउन सकिएन।' : 'Failed to generate bulk keys.'));
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleBulkGenerate400 = async () => {
    setIsBulkGenerating400(true);
    setCreateError(null);
    try {
      const res = await adminBulkCreateAll400CategorizedKeys();
      await loadLicenses();

      const normalKeys = res.licenses.filter((l) => l.tier === 'simple').map((l) => l.licenseKey);
      const vipKeys = res.licenses.filter((l) => l.tier === 'vip').map((l) => l.licenseKey);
      const vvipKeys = res.licenses.filter((l) => l.tier === 'vvip').map((l) => l.licenseKey);
      const lifetimeKeys = res.licenses.filter((l) => l.tier === 'lifetime').map((l) => l.licenseKey);

      setBulkResultModal({
        isOpen: true,
        keys: res.licenses.map((l) => l.licenseKey),
        tier: '400 ALL CATEGORIES',
        count: res.totalCount,
        categorized: {
          normal: normalKeys,
          vip: vipKeys,
          vvip: vvipKeys,
          lifetime: lifetimeKeys,
        },
      });
      setBulkCategoryFilter('all');
      setSyncCloudMessage(
        isNepali
          ? `🎉 ४०० वटा सबै श्रेणीका कीहरू (१०० Normal, १०० VIP, १०० VVIP, १०० Lifetime) सफलतापूर्वक तयार भएर Firestore र सर्भरमा सुरक्षित भयो!`
          : `🎉 400 categorized keys (100 Normal, 100 VIP, 100 VVIP, 100 Lifetime) generated and saved successfully!`
      );
    } catch (err: any) {
      console.error('Error generating 400 bulk keys:', err);
      setCreateError(err?.message || (isNepali ? '४०० कीहरू बनाउन सकिएन।' : 'Failed to generate 400 keys.'));
    } finally {
      setIsBulkGenerating400(false);
    }
  };

  const handleCustomRenewSubmit = async (licenseKey: string, months: number, upgradeLifetime: boolean) => {
    setIsRenewingCustom(true);
    try {
      if (upgradeLifetime) {
        await adminUpgradeLicenseToLifetime(licenseKey);
      } else {
        await adminRenewLicense(licenseKey, months);
      }
      await loadLicenses();
      setRenewModalItem(null);
      setSyncCloudMessage(
        isNepali
          ? `✅ Key (${licenseKey}) को म्याद सफलतापूर्वक नवीकरण (Renew) भयो!`
          : `✅ Key (${licenseKey}) renewed successfully!`
      );
    } catch (err: any) {
      console.error('Error renewing license:', err);
    } finally {
      setIsRenewingCustom(false);
    }
  };

  const handleCopyAllBulkKeys = () => {
    if (!bulkResultModal || !bulkResultModal.keys.length) return;
    let keysToCopy = bulkResultModal.keys;
    if (bulkResultModal.categorized && bulkCategoryFilter !== 'all') {
      if (bulkCategoryFilter === 'simple') keysToCopy = bulkResultModal.categorized.normal;
      else if (bulkCategoryFilter === 'vip') keysToCopy = bulkResultModal.categorized.vip;
      else if (bulkCategoryFilter === 'vvip') keysToCopy = bulkResultModal.categorized.vvip;
      else if (bulkCategoryFilter === 'lifetime') keysToCopy = bulkResultModal.categorized.lifetime;
    }
    const formatted = keysToCopy.join('\n');
    copyToClipboard(formatted);
    setBulkCopySuccess(true);
    setTimeout(() => setBulkCopySuccess(false), 4000);
  };

  const handleDownloadBulkKeysFile = () => {
    if (!bulkResultModal || !bulkResultModal.keys.length) return;

    let content = '';
    if (bulkResultModal.categorized) {
      content = [
        `=================================================================`,
        `JYOTISH ASTROLOGY APP - 400 CATEGORIZED 8-CHARACTER LICENSE KEYS`,
        `Generated: ${new Date().toLocaleString()} (Nepal Standard Time)`,
        `Total: 400 Keys (100 Normal + 100 VIP + 100 VVIP + 100 Lifetime)`,
        `Security: 8-Character Alphanumeric Cryptographic Anti-Theft Device Lock`,
        `=================================================================`,
        ``,
        `--- 1. NORMAL KEYS (100 KEYS - 3 MONTHS DURATION) ---`,
        ...bulkResultModal.categorized.normal.map((k, i) => `${String(i + 1).padStart(3, ' ')}. ${k}`),
        ``,
        `--- 2. VIP KEYS (100 KEYS - 6 MONTHS DURATION) ---`,
        ...bulkResultModal.categorized.vip.map((k, i) => `${String(i + 1).padStart(3, ' ')}. ${k}`),
        ``,
        `--- 3. VVIP KEYS (100 KEYS - 1 YEAR DURATION) ---`,
        ...bulkResultModal.categorized.vvip.map((k, i) => `${String(i + 1).padStart(3, ' ')}. ${k}`),
        ``,
        `--- 4. LIFETIME KEYS (100 KEYS - NO EXPIRY / LIFETIME) ---`,
        ...bulkResultModal.categorized.lifetime.map((k, i) => `${String(i + 1).padStart(3, ' ')}. ${k}`),
        ``,
        `=================================================================`,
        `HOW TO USE:`,
        `1. Send any of the above 8-character keys to your customer.`,
        `2. Customer enters the 8-character key into the Jyotish app.`,
        `3. App unlocks instantly and binds strictly to customer's device!`,
        `=================================================================`
      ].join('\n');
    } else {
      content = [
        `=================================================================`,
        `JYOTISH ASTROLOGY APP - ${bulkResultModal.keys.length} SECURE 8-CHARACTER KEYS`,
        `Generated: ${new Date().toLocaleString()} (Nepal Standard Time)`,
        `Tier: ${bulkResultModal.tier.toUpperCase()}`,
        `Total Keys: ${bulkResultModal.keys.length}`,
        `Security: 8-Character Alphanumeric Cryptographic Anti-Theft Device Lock`,
        `=================================================================`,
        ``,
        ...bulkResultModal.keys.map((k, idx) => `${String(idx + 1).padStart(3, ' ')}. ${k}`),
        ``,
        `=================================================================`,
        `HOW TO USE:`,
        `1. Send any of the above 8-character keys to the customer.`,
        `2. Customer enters the 8-character key into the app lock screen.`,
        `3. The app unlocks instantly and binds strictly to the customer's phone!`,
        `=================================================================`
      ].join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jyotish_keys_${bulkResultModal.count}_${new Date().toISOString().substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    let finalKey = '';
    if (keyCreationMode === 'custom') {
      finalKey = customKey.trim().toUpperCase();
      if (!finalKey) {
        setCreateError(isNepali ? 'कृपया तपाईँले चाहेको Key प्रविष्ट गर्नुहोस् वा स्वतः जेनेरेट छान्नुहोस्।' : 'Please enter your custom Key or choose auto generate.');
        return;
      }
      // Clean custom key format: allow letters, numbers, hyphens, underscores
      finalKey = finalKey.replace(/[^A-Z0-9\-_]/g, '');
      if (finalKey.length < 3) {
        setCreateError(isNepali ? 'Key कम्तीमा ३ अक्षर वा अङ्कको हुनुपर्छ।' : 'Key must be at least 3 characters.');
        return;
      }
    } else {
      finalKey = customKey.trim() ? customKey.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, '') : generateAutoKey(tier);
    }

    // Check if key already exists in the current list
    const isDuplicate = licenses.some((l) => l.licenseKey.toUpperCase() === finalKey);
    if (isDuplicate) {
      setCreateError(isNepali ? `यो Key (${finalKey}) पहिल्यै दर्ता भइसकेको छ। कृपया अर्को रोज्नुहोस्।` : `Key (${finalKey}) already exists. Please choose a different one.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await adminCreateLicense({
        licenseKey: finalKey,
        customerName: customerName.trim() || (isNepali ? 'ग्राहक' : 'Customer'),
        customerPhone: customerPhone.trim(),
        tier,
      });

      setCreatedKeySuccess(created);
      setCustomerName('');
      setCustomerPhone('');
      setCustomKey('');
      await loadLicenses();
    } catch (err: any) {
      console.error('Error creating license:', err);
      setCreateError(err?.message || (isNepali ? 'Key तयार गर्न सकिएन।' : 'Failed to create key.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDevice = (licenseKey: string) => {
    setConfirmDialog({
      isOpen: true,
      title: isNepali ? 'डिभाइस रिसेट (Device Reset)' : 'Reset Device Binding',
      message: isNepali
        ? `के तपाईँ ${licenseKey} को डिभाइस लक रिसेट गर्न चाहनुहुन्छ? यसपछि यो Key नयाँ डिभाइसमा हाल्न मिल्नेछ।`
        : `Reset device for ${licenseKey}? The key can then be activated on a new device.`,
      confirmText: isNepali ? '🔄 रिसेट गर्नुहोस्' : 'Reset Device',
      cancelText: isNepali ? 'रद्द गर्नुहोस्' : 'Cancel',
      isDestructive: false,
      onConfirm: async () => {
        setActionLoadingKey(licenseKey);
        try {
          await adminResetDevice(licenseKey);
          await loadLicenses();
        } catch (e) {
          console.error('Error resetting device:', e);
        } finally {
          setActionLoadingKey(null);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleRenew = async (licenseKey: string) => {
    setActionLoadingKey(licenseKey);
    try {
      await adminRenewLicense(licenseKey);
      await loadLicenses();
    } catch (e) {
      console.error('Error renewing license:', e);
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDelete = (licenseKey: string) => {
    setConfirmDialog({
      isOpen: true,
      title: isNepali ? `Key (${licenseKey}) मेटाउने?` : `Delete Key (${licenseKey})?`,
      message: isNepali
        ? `के तपाईँ यो Key (${licenseKey}) स्थायी रूपमा मेटाउन निश्चित हुनुहुन्छ? यो कार्यले लोकल स्टोरेज, फायरबेस र सर्भरबाट Key हटाइदिनेछ।`
        : `Are you sure you want to permanently delete Key ${licenseKey}? It will be removed from local storage, cloud, and server.`,
      confirmText: isNepali ? '🗑️ हो, मेटाउनुहोस्' : 'Delete Key',
      cancelText: isNepali ? 'रद्द गर्नुहोस्' : 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        setActionLoadingKey(licenseKey);
        try {
          // Immediately update state for instantaneous UI feedback
          setLicenses((prev) => prev.filter((l) => l.licenseKey !== licenseKey));
          if (createdKeySuccess?.licenseKey === licenseKey) {
            setCreatedKeySuccess(null);
          }
          await adminDeleteLicense(licenseKey);
          await loadLicenses();
        } catch (e) {
          console.error('Error deleting license:', e);
        } finally {
          setActionLoadingKey(null);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeleteAll = () => {
    if (licenses.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: isNepali ? 'सबै Key हरू मेटाउने?' : 'Delete All Keys?',
      message: isNepali
        ? `के तपाईँ सूचीमा भएका सबै (${licenses.length} वटा) Key हरू मेटाउन निश्चित हुनुहुन्छ? यो प्रक्रिया उल्टाउन सकिँदैन।`
        : `Are you sure you want to delete all (${licenses.length}) keys? This action cannot be undone.`,
      confirmText: isNepali ? '🗑️ सबै मेटाउनुहोस्' : 'Delete All Keys',
      cancelText: isNepali ? 'रद्द गर्नुहोस्' : 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        setIsClearingAll(true);
        try {
          setLicenses([]);
          setCreatedKeySuccess(null);
          await adminDeleteAllLicenses();
        } catch (e) {
          console.error('Error clearing all licenses:', e);
        } finally {
          setIsClearingAll(false);
          setConfirmDialog(null);
          await loadLicenses();
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getDirectLink = (key: string) => {
    const base = liveAppUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/?key=${key}`;
  };

  const getWhatsAppShareUrl = (customerPhone?: string, customerName?: string, key?: string) => {
    if (!key) return '#';
    const directLink = getDirectLink(key);
    const name = (customerName || 'ग्राहक').trim();
    const msg = `नमस्ते ${name} ज्यू,\n\nतपाईंको ज्योतिष एपको १-क्लिक आधिकारिक पहुँच लिंक:\n🔗 ${directLink}\n\n👉 यो लिंकमा थिच्नासाथ तपाईंको मोबाइलमा एप तुरुन्त खुल्नेछ (कुनै Key टाइप गर्नु पर्दैन)।\n\n🔒 सुरक्षा नोट: यो १-क्लिक लिंक तपाईंको एउटा मोबाइलको लागि मात्र सुरक्षित गरिएको छ। अन्य डिभाइसमा यो चल्ने छैन।`;
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;
      return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  if (!isOpen) return null;

  // Super Admin Verification Card - Strictly requires Secret Master Key
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3.5 text-amber-400">
            <Shield className="w-7 h-7" />
          </div>
          
          <h3 className="text-lg font-bold text-white text-center mb-1">
            {isNepali ? 'मुख्य व्यवस्थापक प्रमाणीकरण' : 'Super Admin Authentication'}
          </h3>
          <p className="text-xs text-slate-400 text-center mb-4 leading-relaxed">
            {isNepali
              ? 'इजाजतपत्र व्यवस्थापन (License Manager) खोल्न केवल अधिकृत मास्टर की (Master Key) आवश्यक पर्दछ।'
              : 'Sign in with your authorized Secret Master Key to access the License Manager.'}
          </p>

          {adminLoginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{adminLoginError}</span>
            </div>
          )}

          {/* Master Key Verification Form */}
          <form onSubmit={handleAdminQuickLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {isNepali ? 'गोप्य मास्टर की (Secret Master Key)' : 'Secret Master Key'}
              </label>
              <input
                type="password"
                required
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder={isNepali ? 'यहाँ गोप्य मास्टर की राख्नुहोस्' : 'Enter Secret Master Key'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {isNepali ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
              <button
                type="submit"
                disabled={isAdminLoggingIn || !adminPinInput.trim()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>
                  {isAdminLoggingIn
                    ? (isNepali ? 'जाँचिँदैछ...' : 'Verifying...')
                    : (isNepali ? 'प्यानल खोल्नुहोस्' : 'Unlock Panel')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredLicenses = licenses.filter((lic) => {
    const term = searchTerm.toLowerCase();
    return (
      lic.licenseKey.toLowerCase().includes(term) ||
      (lic.customerName || '').toLowerCase().includes(term) ||
      (lic.customerPhone || '').toLowerCase().includes(term) ||
      (lic.tier || '').toLowerCase().includes(term)
    );
  });

  const getTierBadge = (t?: string) => {
    const val = (t || '').toLowerCase();
    if (val === 'yearly' || val === 'annual') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <Award className="w-3 h-3" /> Yearly (१ वर्ष - रु. २,१९९)
        </span>
      );
    }
    if (val === 'vvip') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Crown className="w-3 h-3" /> VVIP (६ महिना - रु. १,१९९)
        </span>
      );
    }
    if (val === 'vip') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3" /> VIP (३ महिना - रु. ६९९)
        </span>
      );
    }
    if (val === 'simple') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Zap className="w-3 h-3" /> Simple (१ महिना - रु. ३९९)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
        <Award className="w-3 h-3" /> Lifetime (आजन्म - रु. ५,९९९)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {isNepali ? 'इजाजतपत्र व्यवस्थापन (License Key Manager)' : 'License Key Manager'}
              </h2>
              <p className="text-[11px] text-slate-400">Super Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncingCloud}
              title={isNepali ? 'क्लाउड (Firestore) मा सिङ्क गर्नुहोस्' : 'Sync all keys to Firestore Cloud'}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncingCloud
                  ? (isNepali ? 'सिङ्क हुँदैछ...' : 'Syncing...')
                  : (isNepali ? 'क्लाउड सिङ्क' : 'Sync Cloud')}
              </span>
            </button>

            <button
              onClick={() => setShowUrlSettings(!showUrlSettings)}
              title={isNepali ? 'Vercel लिङ्क सेटिङ' : 'Vercel Live URL Settings'}
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                showUrlSettings
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Link2 className="w-4 h-4" />
            </button>

            <button
              onClick={loadLicenses}
              disabled={loading}
              title={isNepali ? 'ताजा गर्नुहोस्' : 'Refresh'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live URL & Cloud Sync Notification Banners */}
        {syncCloudMessage && (
          <div className="px-5 py-2.5 bg-blue-950/60 border-b border-blue-500/30 text-blue-200 text-xs flex items-center justify-between gap-2 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{syncCloudMessage}</span>
            </div>
            <button
              onClick={() => setSyncCloudMessage(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {showUrlSettings && (
          <div className="px-5 py-3 bg-slate-950/90 border-b border-amber-500/30 text-xs space-y-2 animate-fadeIn shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">
                {isNepali ? '🌐 ग्राहकलाई पठाउने Vercel लिङ्क (Base URL):' : '🌐 Customer Vercel Base URL:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isNepali ? 'लिङ्क कपि गर्दा यो डोमेन प्रयोग हुनेछ' : 'Used when copying direct links'}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={liveAppUrl}
                onChange={(e) => handleLiveUrlSave(e.target.value)}
                placeholder="https://your-astrology-app.vercel.app"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    handleLiveUrlSave(window.location.origin);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isNepali ? 'वर्तमान राख्नुहोस्' : 'Use Current'}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation Header: Keys vs Payment Requests */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'keys'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isNepali ? '🔑 इजाजतपत्र Key हरू' : '🔑 License Keys'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-800 text-slate-300 font-mono">
              {licenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>{isNepali ? '📱 डिभाइस / भुक्तानी अनुमोदन' : '📱 Device Approvals'}</span>
            {paymentRequests.filter((r) => r.status === 'pending').length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                {paymentRequests.filter((r) => r.status === 'pending').length} {isNepali ? 'नयाँ' : 'New'}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-slate-800 text-slate-400 font-mono">
                {paymentRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Success Banner if an approval was just processed */}
          {approveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{approveSuccessMsg}</span>
              </div>
              <button
                onClick={() => setApproveSuccessMsg(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'requests' ? (
            /* TAB 2: DEVICE APPROVAL / PAYMENT REQUESTS VIEW */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-amber-400" />
                    <span>
                      {isNepali
                        ? 'ग्राहकहरूको भुक्तानी तथा डिभाइस अनुमोदन अनुरोधहरू'
                        : 'Device Payment & Approval Requests'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isNepali
                      ? 'ग्राहकले भुक्तानी गरी पठाएका डिभाइसहरू यहाँ १-क्लिकमा स्वीकृत गर्नुहोस्।'
                      : 'Approve customer devices in 1-click after verifying payment.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadPaymentRequests}
                  disabled={requestsLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isNepali ? 'अनुरोध ताजा गर्नुहोस्' : 'Refresh Requests'}</span>
                </button>
              </div>

              {requestsLoading && paymentRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {isNepali ? 'अनुरोधहरू लोड हुँदैछ...' : 'Loading requests...'}
                </div>
              ) : paymentRequests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-8 h-8 text-slate-600" />
                  <p className="font-semibold text-slate-300">
                    {isNepali ? 'अहिले कुनै पनि नयाँ डिभाइस अनुमोदन अनुरोध छैन।' : 'No pending device requests.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isNepali
                      ? 'ग्राहकले लक स्क्रिनबाट भुक्तानी विवरण दर्ता गर्दा यहाँ सूची देखा पर्नेछ।'
                      : 'When customers submit payment requests from lock screen, they appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRequests.map((reqItem) => {
                    const isPending = reqItem.status === 'pending';
                    const isApproved = reqItem.status === 'approved';
                    const isRejected = reqItem.status === 'rejected';
                    const isApproving = approvingReqId === reqItem.id;
                    const isRejecting = rejectingReqId === reqItem.id;

                    return (
                      <div
                        key={reqItem.id}
                        className={`p-4 rounded-2xl border transition space-y-3 shadow-lg ${
                          isPending
                            ? 'bg-slate-950/90 border-amber-500/50 shadow-amber-500/5'
                            : isApproved
                            ? 'bg-slate-950/50 border-emerald-500/30'
                            : 'bg-slate-950/30 border-rose-500/30 opacity-70'
                        }`}
                      >
                        {/* Request Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-white text-sm">
                                {reqItem.customerName || 'ग्राहक'}
                              </span>
                              {reqItem.customerPhone && (
                                <a
                                  href={`tel:${reqItem.customerPhone}`}
                                  className="ml-2 font-mono text-xs text-amber-300 hover:underline"
                                >
                                  {reqItem.customerPhone}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Status Badge & Actions */}
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isNepali ? '⏳ स्वीकृतिको प्रतीक्षामा (Pending)' : '⏳ Pending Approval'}</span>
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{isNepali ? '✅ स्वीकृत भयो (Approved)' : '✅ Approved'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>{isNepali ? '❌ अस्वीकृत (Rejected)' : '❌ Rejected'}</span>
                              </span>
                            )}

                            {/* Delete / Dismiss Request Record */}
                            <button
                              type="button"
                              onClick={() => handleDeletePaymentRequest(reqItem.id || reqItem.deviceId)}
                              title={isNepali ? 'यो अनुरोध रेकर्ड मेटाउनुहोस्' : 'Delete request record'}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Request Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          {/* Plan & Amount */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                            <span className="text-slate-400 text-[11px] block">{isNepali ? 'योजना / रकम:' : 'Plan / Amount:'}</span>
                            <span className="font-bold text-amber-300 text-xs uppercase">
                              {reqItem.planName || reqItem.planId} • रु {reqItem.amount}
                            </span>
                          </div>

                          {/* Payment Method & Ref */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                            <span className="text-slate-400 text-[11px] block">{isNepali ? 'भुक्तानी विवरण / Txn ID:' : 'Payment / Txn ID:'}</span>
                            <span className="font-semibold text-slate-200 text-xs">
                              {reqItem.paymentMethod}: <strong className="font-mono text-emerald-400">{reqItem.transactionRef}</strong>
                            </span>
                          </div>

                          {/* Device ID */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                            <span className="text-slate-400 text-[11px] block">{isNepali ? 'डिभाइस आइडी (Device ID):' : 'Device ID:'}</span>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[120px]">
                                {reqItem.deviceId}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(reqItem.deviceId)}
                                className="text-[10px] text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded bg-slate-800"
                              >
                                {isNepali ? 'कपि' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          {/* Requested Time */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                            <span className="text-slate-400 text-[11px] block">{isNepali ? 'अनुरोध समय:' : 'Request Time:'}</span>
                            <span className="text-slate-300 text-[11px]">
                              {new Date(reqItem.createdAt).toLocaleString(isNepali ? 'ne-NP' : 'en-US')}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Key info if already approved */}
                        {isApproved && reqItem.assignedLicenseKey && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-emerald-300 mr-2">
                                  {isNepali ? 'जारी गरिएको Key:' : 'Assigned Key:'}
                                </span>
                                <span className="font-mono font-bold text-white tracking-wider text-sm">
                                  {reqItem.assignedLicenseKey}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* WhatsApp 1-Click Send */}
                              <a
                                href={getWhatsAppShareUrl(reqItem.customerPhone, reqItem.customerName, reqItem.assignedLicenseKey)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition"
                                title={isNepali ? 'WhatsApp मा ग्राहकलाई १-क्लिक लिंक पठाउनुहोस्' : 'Send 1-Click Link on WhatsApp'}
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{isNepali ? 'WhatsApp लिंक' : 'WhatsApp'}</span>
                              </a>

                              {/* Copy Link */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(getDirectLink(reqItem.assignedLicenseKey!))}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                <span>{copiedKey === getDirectLink(reqItem.assignedLicenseKey!) ? (isNepali ? 'लिंक कपि भयो' : 'Copied') : (isNepali ? 'लिंक कपि' : 'Copy Link')}</span>
                              </button>

                              {/* Copy Key */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(reqItem.assignedLicenseKey!)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                              >
                                {isNepali ? 'Key कपि' : 'Copy Key'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Pending Action Controls */}
                        {isPending && (
                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
                            {/* WhatsApp Direct Chat with Customer */}
                            {reqItem.customerPhone ? (
                              <a
                                href={`https://wa.me/977${reqItem.customerPhone.replace(/\D/g, '')}?text=नमस्ते%20${encodeURIComponent(reqItem.customerName)},%20तपाईँको%20Astrology%20एप%20डिभाइस%20प्रमाणीकरण%20सम्बन्धमा...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 py-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{isNepali ? 'ग्राहकलाई WhatsApp सन्देश पठाउनुहोस्' : 'WhatsApp Customer'}</span>
                              </a>
                            ) : <div />}

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                disabled={isRejecting || isApproving}
                                onClick={() => handleRejectRequest(reqItem.id)}
                                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                              >
                                {isRejecting ? (isNepali ? 'अस्वीकृत गर्दै...' : 'Rejecting...') : (isNepali ? '❌ अस्वीकार' : 'Reject')}
                              </button>

                              <button
                                type="button"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleApproveRequest(reqItem)}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                              >
                                {isApproving ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>{isNepali ? 'स्वीकृत हुँदैछ...' : 'Approving...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                                    <span>{isNepali ? '✅ स्वीकृत गरी डिभाइस खोल्नुहोस्' : 'Approve & Activate Device'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 1: EXISTING KEYS VIEW */
            <>
              {/* Quick Create Key Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-amber-500/25 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300">
                  {isNepali ? 'इजाजतपत्र Key तयार गर्नुहोस् (योजना अनुसार)' : 'Create License Key by Plan'}
                </h3>
              </div>

              {/* Mode Selector: Custom Choice vs Auto Generate */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setKeyCreationMode('custom');
                    setCreateError(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    keyCreationMode === 'custom'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isNepali ? '✍️ आँफैले रोज्ने (Custom Key)' : '✍️ Custom Key'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeyCreationMode('auto');
                    setCreateError(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    keyCreationMode === 'auto'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isNepali ? '⚡ स्वतः जेनेरेट (Auto)' : '⚡ Auto Generate'}</span>
                </button>
              </div>
            </div>

            {createError && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Key Type Selection (Simple 399 / VIP 699 / VVIP 1199 / Yearly 2199 / Lifetime 5999) */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  {isNepali ? 'योजना, अवधि र शुल्क छान्नुहोस्:' : 'Select Plan, Duration & Price:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setTier('simple')}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      tier === 'simple'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simple</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-extrabold">रु. ३९९</span>
                    <span className="text-[9px] opacity-75">{isNepali ? '१ महिना (1 Month)' : '1 Month'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier('vip')}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      tier === 'vip'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>VIP</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-extrabold">रु. ६९९</span>
                    <span className="text-[9px] opacity-75">{isNepali ? '३ महिना (3 Months)' : '3 Months'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier('vvip')}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      tier === 'vvip'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-purple-400" />
                      <span>VVIP</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-extrabold">रु. १,१९९</span>
                    <span className="text-[9px] opacity-75">{isNepali ? '६ महिना (6 Months)' : '6 Months'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier('yearly')}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      tier === 'yearly'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-1 ring-teal-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-teal-400" />
                      <span>Yearly</span>
                    </div>
                    <span className="text-[10px] text-teal-300 font-extrabold">रु. २,१९९</span>
                    <span className="text-[9px] opacity-75">{isNepali ? '१ वर्ष (1 Year)' : '1 Year'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier('lifetime')}
                    className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      tier === 'lifetime'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      <span>Lifetime</span>
                    </div>
                    <span className="text-[10px] text-blue-300 font-extrabold">रु. ५,९९९</span>
                    <span className="text-[9px] opacity-75">{isNepali ? 'आजन्म (सधैंको लागि)' : 'Lifetime'}</span>
                  </button>
                </div>
              </div>

              {/* Custom Key Choice Input */}
              {keyCreationMode === 'custom' ? (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-amber-300">
                      {isNepali ? 'आफ्नो रोजाइको Key लेख्नुहोस् (Custom License Key):' : 'Enter Your Desired Custom Key:'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {customKey.trim() ? `${customKey.trim().length} chars` : (isNepali ? 'अक्षर/अङ्क' : 'A-Z, 0-9')}
                    </span>
                  </div>

                  <div className="relative">
                    <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={customKey}
                      onChange={(e) => {
                        setCustomKey(e.target.value.toUpperCase());
                        setCreateError(null);
                      }}
                      placeholder={isNepali ? 'उदा. SHAMBHU-2026, JYOTISH-9841, RAM-LIFETIME' : 'e.g. VIP-GURUDEV-2026'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-sm font-mono font-bold text-amber-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 tracking-wider"
                    />
                  </div>

                  {/* Quick Preset / Suggestion Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">
                      {isNepali ? 'सुझाव:' : 'Suggestions:'}
                    </span>
                    {customerName.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          const clean = customerName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
                          const prefix = tier === 'lifetime' ? 'LIFE' : tier.toUpperCase();
                          setCustomKey(`${prefix}-${clean || 'USER'}-${Math.floor(100 + Math.random() * 900)}`);
                          setCreateError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono border border-slate-700 cursor-pointer transition"
                      >
                        +{customerName.trim().split(' ')[0].toUpperCase()}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKey(`JYOTISH-${Math.floor(1000 + Math.random() * 9000)}`);
                        setCreateError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono border border-slate-700 cursor-pointer transition"
                    >
                      +JYOTISH
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKey(`PANDIT-${Math.floor(1000 + Math.random() * 9000)}`);
                        setCreateError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono border border-slate-700 cursor-pointer transition"
                    >
                      +PANDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKey(generateSecure8CharKey(tier));
                        setCreateError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono border border-amber-500/40 cursor-pointer transition font-bold"
                    >
                      +८-अक्षर (8-Char)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKey(generateAutoKey(tier));
                        setCreateError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer transition"
                    >
                      {isNepali ? 'नयाँ कोड' : 'Random Code'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-slate-400">
                      {isNepali ? 'स्वतः तयार हुने Key कोड:' : 'Auto Generated Key:'}
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {generateAutoKey(tier)}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {isNepali ? 'स्वतः प्रणाली' : 'System Auto'}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isNepali ? 'तयार हुँदैछ...' : 'Creating...')
                      : (isNepali ? 'रोजेको Key सुरक्षित गरी तयार गर्नुहोस्' : 'Create & Save Key')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Success Banner if Key was just generated */}
          {createdKeySuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold">
                    {isNepali ? 'Key सफलतापूर्वक तयार भयो:' : 'Key created successfully:'}
                  </p>
                  <p className="text-base font-mono font-bold text-white tracking-wider">
                    {createdKeySuccess.licenseKey}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {createdKeySuccess.customerName} ({createdKeySuccess.customerPhone || 'No phone'}) • {createdKeySuccess.tier?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* 1-Click WhatsApp Share to Customer */}
                <a
                  href={getWhatsAppShareUrl(createdKeySuccess.customerPhone, createdKeySuccess.customerName, createdKeySuccess.licenseKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title={isNepali ? 'ग्राहकलाई WhatsApp मा १-क्लिक लिंक पठाउनुहोस्' : 'Send 1-Click Link on WhatsApp'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isNepali ? 'WhatsApp मा पठाउनुहोस्' : 'Send WhatsApp'}</span>
                </a>

                <button
                  onClick={() => copyToClipboard(getDirectLink(createdKeySuccess.licenseKey))}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  {copiedKey === getDirectLink(createdKeySuccess.licenseKey) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'लिंक कपि भयो' : 'Link Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{isNepali ? '१-क्लिक लिंक कपि' : 'Copy Link'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => copyToClipboard(createdKeySuccess.licenseKey)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === createdKeySuccess.licenseKey ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'Key कपि भयो' : 'Key Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'Key कपि' : 'Copy Key'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Licenses List Section */}
          <div>
            {/* Persistent Storage, JSON Backup & Cloud Sync Actions */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{isNepali ? 'स्थायी ब्याकअप र भण्डारण (Persistent Storage & JSON)' : 'Persistent Storage & JSON'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Vercel Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isNepali
                      ? 'तयार गरिएका सबै Key हरू LocalStorage, Firestore र Server मा स्थायी सुरक्षित हुन्छन्।'
                      : 'All created keys are permanently saved to LocalStorage, Firestore & Server.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Export JSON Button */}
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title={isNepali ? 'Key हरू JSON फाइलमा डाउनलोड गर्नुहोस्' : 'Download Keys as JSON file'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isNepali ? 'JSON डाउनलोड' : 'Export JSON'}</span>
                </button>

                {/* Import JSON File Button */}
                <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isImportingJSON ? (isNepali ? 'पढ्दैछ...' : 'Reading...') : (isNepali ? 'JSON रिस्टोर' : 'Import JSON')}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSONFile}
                    disabled={isImportingJSON}
                    className="hidden"
                  />
                </label>

                {/* Copy TypeScript Code for direct hardcoding in SEED_LICENSES */}
                <button
                  type="button"
                  onClick={handleCopyTypeScriptCode}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title={isNepali ? 'SEED_LICENSES को TypeScript कोड क्लिपबोर्डमा कपि गर्नुहोस्' : 'Copy SEED_LICENSES TypeScript code'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isNepali ? 'हार्डकोड कोड कपी (TS)' : 'Export TS'}</span>
                </button>

                {/* Copy JSON */}
                <button
                  type="button"
                  onClick={handleCopyAllJSON}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  title={isNepali ? 'JSON डाटा क्लिपबोर्डमा कपि गर्नुहोस्' : 'Copy JSON to clipboard'}
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">{isNepali ? 'कपि' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Notification message for JSON backup */}
            {jsonBackupMessage && (
              <div
                className={`p-3 rounded-xl mb-3.5 text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
                  jsonBackupMessage.isError
                    ? 'bg-rose-950/40 border border-rose-800 text-rose-300'
                    : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                }`}
              >
                {jsonBackupMessage.isError ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{jsonBackupMessage.text}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {isNepali ? 'तयार भएका Key हरू' : 'Generated Keys'}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-amber-300 border border-slate-700">
                  {licenses.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isNepali ? 'सर्च गर्नुहोस्...' : 'Search keys...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Delete All Keys Button (Visible when keys exist) */}
                {licenses.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={isClearingAll}
                    title={isNepali ? 'सबै Key हरू मेटाउनुहोस्' : 'Delete all keys'}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">{isNepali ? 'सबै मेटाउनुहोस्' : 'Delete All'}</span>
                  </button>
                )}
              </div>
            </div>

            {loading && licenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isNepali ? 'लोड हुँदैछ...' : 'Loading...'}
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <Key className="w-6 h-6 text-slate-600" />
                <p>{isNepali ? 'कुनै Key छैन। माथिको फारामबाट नयाँ Key तयार गर्नुहोस्।' : 'No keys found. Create a new key above.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredLicenses.map((lic) => {
                  const isBound = !!lic.authorizedDeviceId && lic.status === 'active';
                  const isProcessing = actionLoadingKey === lic.licenseKey;
                  const expiryInfo = getLicenseExpiryInfo(lic);

                  return (
                    <div
                      key={lic.licenseKey}
                      className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        expiryInfo.isExpired
                          ? 'bg-rose-950/20 border-rose-800/60'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-amber-300 text-sm tracking-wide">
                            {lic.licenseKey}
                          </span>
                          {getTierBadge(lic.tier)}
                          {isBound ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <Smartphone className="w-3 h-3" />
                              {isNepali ? '१ डिभाइसमा लक' : 'Locked to Device'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {isNepali ? 'नयाँ (खुला)' : 'Available (Unbound)'}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                          <span className="font-medium">{lic.customerName || 'ग्राहक'}</span>
                          {lic.customerPhone && (
                            <span className="text-slate-400 font-mono">{lic.customerPhone}</span>
                          )}
                        </div>

                        {/* Expiration & Renewal Details */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap pt-0.5">
                          {expiryInfo.isLifetime ? (
                            <span className="text-blue-300 font-medium">
                              ✨ {isNepali ? 'आजन्म (सधैंको लागि मान्य - नवीकरण आवश्यक छैन)' : 'Lifetime Active (No Renewal Required)'}
                            </span>
                          ) : !lic.activatedAt ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <span>⏳ {isNepali ? `अवधि: ${expiryInfo.durationNe} (ग्राहकले डिभाइसमा अनलक गरेपछि मात्र दिन गणना सुरु हुने)` : `Duration: ${expiryInfo.durationEn} (Countdown starts upon device activation)`}</span>
                            </span>
                          ) : (
                            <>
                              <span>
                                {isNepali ? 'म्याद:' : 'Expires:'}{' '}
                                <strong className="text-slate-200">{isNepali ? expiryInfo.formattedExpiryNe : expiryInfo.formattedExpiryEn}</strong>
                              </span>
                              <span>•</span>
                              {expiryInfo.isExpired ? (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {isNepali ? 'म्याद समाप्त (Expired) - नवीकरण गर्नुहोस्' : 'Expired - Needs Renewal'}
                                </span>
                              ) : (
                                <span className={expiryInfo.shouldShowRenewNotice ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                                  {isNepali ? `बाँकी: ${expiryInfo.daysRemaining} दिन` : `${expiryInfo.daysRemaining} days left`}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons with clear, easy Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
                        {/* 1-Click WhatsApp Send Button */}
                        <a
                          href={getWhatsAppShareUrl(lic.customerPhone, lic.customerName, lic.licenseKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={isNepali ? 'ग्राहकलाई WhatsApp मा १-क्लिक लिंक पठाउनुहोस्' : 'Send 1-Click Link on WhatsApp'}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isNepali ? 'WhatsApp' : 'WhatsApp'}</span>
                        </a>

                        {/* 1-Click Renew Button for non-lifetime keys */}
                        {!expiryInfo.isLifetime && (
                          <button
                            onClick={() => handleRenew(lic.licenseKey)}
                            disabled={isProcessing}
                            title={isNepali ? `म्याद थप गर्नुहोस् (+${expiryInfo.durationNe})` : `Renew License (+${expiryInfo.durationEn})`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                            <span>{isNepali ? 'म्याद थप' : 'Renew'}</span>
                          </button>
                        )}

                        {/* Copy Key Button */}
                        <button
                          onClick={() => copyToClipboard(lic.licenseKey)}
                          title={isNepali ? 'Key मात्र कपि गर्नुहोस्' : 'Copy Key only'}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedKey === lic.licenseKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{isNepali ? 'Key' : 'Key'}</span>
                        </button>

                        {/* Copy Direct Link Button */}
                        <button
                          onClick={() => copyToClipboard(getDirectLink(lic.licenseKey))}
                          title={isNepali ? 'प्रत्यक्ष पहुँच लिंक कपि गर्नुहोस्' : 'Copy Direct Access Link'}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedKey === getDirectLink(lic.licenseKey) ? (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{isNepali ? 'लिंक' : 'Link'}</span>
                        </button>

                        {/* Reset Device button (If bound) */}
                        {isBound && (
                          <button
                            onClick={() => handleResetDevice(lic.licenseKey)}
                            disabled={isProcessing}
                            title={isNepali ? 'डिभाइस अनलक गर्नुहोस् (नयाँ फोनमा हाल्न)' : 'Reset device binding'}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                            <span>{isNepali ? 'डिभाइस रिसेट' : 'Reset Device'}</span>
                          </button>
                        )}

                        {/* Clear and Easy Delete Key Button */}
                        <button
                          onClick={() => handleDelete(lic.licenseKey)}
                          disabled={isProcessing}
                          title={isNepali ? 'यो Key मेटाउनुहोस्' : 'Delete this key'}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{isNepali ? 'मेटाउनुहोस्' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </>
          )}

        </div>
      </div>

      {/* In-App Confirmation Modal (Bypasses iframe sandbox restrictions) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmDialog.isDestructive 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {confirmDialog.isDestructive ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-base font-bold text-white leading-snug">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                {confirmDialog.cancelText || (isNepali ? 'रद्द गर्नुहोस्' : 'Cancel')}
              </button>

              <button
                type="button"
                onClick={() => confirmDialog.onConfirm()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
                }`}
              >
                {confirmDialog.confirmText || (isNepali ? 'हो, मेटाउनुहोस्' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result Modal: Display all 100 generated keys with 1-click copy & download */}
      {bulkResultModal?.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>{isNepali ? `🎉 ${bulkResultModal.count} वटा सुरक्षित कीहरू तयार भए` : `🎉 ${bulkResultModal.count} License Keys Created`}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {bulkResultModal.tier.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isNepali
                      ? 'यी सबै कीहरू Firestore र Vercel सर्भरमा सुरक्षित भइसकेका छन्। ग्राहकलाई १-१ वटा वितरण गर्न सक्नुहुन्छ।'
                      : 'All keys are saved and ready. Distribute them 1-by-1 to customers.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBulkResultModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs font-mono text-amber-300 font-bold">
                {isNepali ? `कुल कीहरू: ${bulkResultModal.keys.length}` : `Total Keys: ${bulkResultModal.keys.length}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBulkKeysFile}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isNepali ? 'TXT फाइल डाउनलोड' : 'Download TXT'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllBulkKeys}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  {bulkCopySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>{isNepali ? 'सबै १०० कीहरू कपि भयो!' : 'All Keys Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>{isNepali ? '📋 सबै १०० कीहरू एकैपटक कपी' : '📋 Copy All Keys'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Keys Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {bulkResultModal.keys.map((k, idx) => {
                  const isCopied = copiedKey === k;
                  return (
                    <div
                      key={k}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-1.5 transition group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] text-slate-500 font-mono w-5 shrink-0 text-right">
                          {idx + 1}.
                        </span>
                        <span className="text-xs font-mono font-bold text-white tracking-wider truncate">
                          {k}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(k)}
                        title={isNepali ? 'कपी गर्नुहोस्' : 'Copy'}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer shrink-0 ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300'
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isNepali
                  ? '🔒 १ Key = १ डिभाइस (पहिलो डिभाइस दर्ता हुनेबित्तिकै स्वतः लक हुन्छ)'
                  : '🔒 1 Key = 1 Device (Locks automatically upon first device activation)'}
              </span>
              <button
                type="button"
                onClick={() => setBulkResultModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                {isNepali ? 'सम्पन्न भयो (Done)' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
