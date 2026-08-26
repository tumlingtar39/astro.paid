import React, { useState, useEffect } from 'react';
import { PANDIT_INFO } from '../data/astrologyData';
import { Language } from '../types';
import { Sparkles, Compass, Info, Phone, Calendar, Globe, Menu, X, BookOpen, User, ArrowRight, Heart, MessageSquare, Sun, Moon, ShieldCheck, LogIn, KeyRound, Crown, CreditCard, Gift } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptionService';
import { FREE_TRIAL_MAX_CHINA } from '../lib/trialService';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenVisitingCard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'kundali',
  setActiveTab,
  lang = 'ne',
  setLang,
  onOpenVisitingCard,
}) => {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { theme, isDark, toggleTheme } = useTheme();
  const { currentUser, isAdmin, openAuthModal } = useAuth();
  const {
    currentPlan,
    isSubscribed,
    openSubscriptionModal,
    trialState,
    isFreeTrialEligible,
    openFreeTrialModal
  } = useSubscription();

  // Safe tab selection handler to avoid crashes
  const handleTabChange = (tabId: string) => {
    try {
      if (typeof setActiveTab === 'function') {
        setActiveTab(tabId);
      }
    } catch (err) {
      console.error('Failed to change tab:', err);
    } finally {
      setMobileMenuOpen(false);
    }
  };

  // Close mobile drawer on resize to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Lock body scroll when drawer or modal is open for mobile UX
  useEffect(() => {
    if (mobileMenuOpen || showInfoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, showInfoModal]);

  const tabs = [
    {
      id: 'kundali',
      labelNe: 'कुण्डली',
      labelEn: 'Kundali',
      shortNe: 'कुण्डली',
      shortEn: 'Kundali',
      icon: Sparkles,
      descNe: 'लग्न कुण्डली, नवमांश कुण्डली र ग्रह स्थिति (निःशुल्क)',
      descEn: 'Lagna Kundali, Navamsha Kundali & Planetary Positions (Free)',
    },
    {
      id: 'china17',
      labelNe: '१७ कुण्डली र चिना',
      labelEn: '17 Kundali & China',
      shortNe: '१७ चिना',
      shortEn: '17 China',
      icon: Sparkles,
      descNe: '१ जन्म लग्न + १६ वर्ग कुण्डली (षोडशवर्ग), परम्परागत चिना, दशा र फलित (सदस्यता)',
      descEn: '17 Kundali Charts, Traditional Cheena, 16 Shodashvarga & Predictions (Member)',
    },
    {
      id: 'phalit',
      labelNe: 'चिना फलित',
      labelEn: 'China Phalit (Predictions)',
      shortNe: 'फलित',
      shortEn: 'Phalit',
      icon: BookOpen,
      descNe: 'प्रत्येक वर्षको दशा, अन्तर्दशा, १२ भाव र विदेश यात्रा विश्लेषण (सदस्यता)',
      descEn: 'Year-by-year Dasha, 12 Bhavas & Overseas analysis (Member)',
    },
    {
      id: 'milan',
      labelNe: 'कुण्डली मिलान',
      labelEn: 'Kundali Milan',
      shortNe: 'मिलान',
      shortEn: 'Milan',
      icon: Heart,
      descNe: 'अष्टकूट ३६ गुण, षडाष्टक/नवपञ्चक, नाडी र माङ्गलिक दोष (निःशुल्क)',
      descEn: '36 Guna Ashtakoot, Bhakoot & Manglik matching (Free)',
    },
    {
      id: 'numerology',
      labelNe: 'अंक ज्योतिष',
      labelEn: 'Numerology',
      shortNe: 'अंक ज्योतिष',
      shortEn: 'Numbers',
      icon: Compass,
      descNe: 'मूलांक, भाग्यांक, नामांक र भाग्यशाली अंक विश्लेषण (निःशुल्क)',
      descEn: 'Birth number, Life path & Lucky numbers (Free)',
    },
    {
      id: 'vastu',
      labelNe: 'वास्तु शास्त्र',
      labelEn: 'Vastu Shastra',
      shortNe: 'वास्तु',
      shortEn: 'Vastu',
      icon: Compass,
      descNe: 'घर, पसल र कार्यालयका दिशा दोष निवारण एवं वैदिक उपाय (निःशुल्क)',
      descEn: 'Directional harmony & Vedic remedies for home and workplace (Free)',
    },
    {
      id: 'rashifal',
      labelNe: 'पञ्चाङ्ग र राशिफल',
      labelEn: 'Panchang & Rashifal',
      shortNe: 'पञ्चाङ्ग',
      shortEn: 'Panchang',
      icon: Calendar,
      descNe: 'आजको पञ्चाङ्ग, १२ राशिको फल र शुभ मुहूर्त (निःशुल्क)',
      descEn: 'Daily Panchang, 12 Zodiac horoscope & Muhurat (Free)',
    },
    {
      id: 'assistant',
      labelNe: 'Binay Guru AI Assistant',
      labelEn: 'Binay Guru AI Assistant',
      shortNe: 'AI गुरु',
      shortEn: 'AI Guru',
      icon: MessageSquare,
      descNe: 'विनय गुरु (पण्डित शम्भु प्रसाद लम्साल) को प्रत्यक्ष AI ज्योतिष परामर्श',
      descEn: 'Direct AI Astrology Consultation by Binay Guru AI Assistant',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-amber-950/95 backdrop-blur-md text-amber-50 border-b border-amber-800/60 shadow-xl">
        {/* Top Auspicious Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 px-3 py-1.5 text-[11px] sm:text-xs border-b border-amber-800/50 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 font-medium truncate pr-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              {lang === 'ne' ? 'ॐ श्री गणेशाय नमः | शुभमस्तु' : 'Om Sri Ganeshaya Namah | Auspicious Greetings'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 shadow-sm ${
                isDark
                  ? 'bg-amber-900/90 hover:bg-amber-800 text-amber-200 border-amber-600/60'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400'
              }`}
              title={isDark ? 'लाइट मोडमा जानुहोस् (Switch to Light Mode)' : 'डार्क मोडमा जानुहोस् (Switch to Dark Mode)'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-medium">{lang === 'ne' ? '☀️ लाइट मोड' : '☀️ Light Mode'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-700 fill-indigo-700" />
                  <span className="font-medium">{lang === 'ne' ? '🌙 डार्क मोड' : '🌙 Dark Mode'}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
              className="flex items-center gap-1 bg-amber-900/90 hover:bg-amber-800 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-600/60 transition-colors active:scale-95 text-amber-200"
              title="भाषा फेर्नुहोस् / Toggle Language"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{lang === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>

            {/* Customer Profile / Admin Status Button */}
            <button
              onClick={openAuthModal}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 shadow-sm ${
                isAdmin
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-amber-900/90 hover:bg-amber-800 text-amber-200 border-amber-600/60'
              }`}
              title={
                isAdmin
                  ? '⭐ मुख्य व्यवस्थापक (Super Admin)'
                  : currentUser
                  ? `ग्राहक: ${currentUser.customerName || currentUser.displayName || currentUser.customerPhone || ''}`
                  : (lang === 'ne' ? 'ग्राहक विवरण' : 'Customer Profile')
              }
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span className="truncate max-w-[110px]">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span className="truncate max-w-[90px] sm:max-w-[110px]">
                    {currentUser
                      ? (currentUser.customerName || currentUser.displayName || (lang === 'ne' ? 'ग्राहक' : 'Customer'))
                      : (lang === 'ne' ? 'ग्राहक विवरण' : 'Customer')}
                  </span>
                </>
              )}
            </button>

            {/* Guru Parichaya Trigger */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="hidden sm:flex items-center gap-1 text-amber-200 hover:text-amber-100 font-medium transition-colors text-[11px]"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ne' ? 'गुरु परिचय' : 'About Guru'}</span>
            </button>
          </div>
        </div>

        {/* Main Branding Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo & Pandit Name */}
          <div
            onClick={() => handleTabChange('kundali')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center text-amber-300 font-serif font-bold text-lg sm:text-xl border border-amber-500/40">
                  ॐ
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-amber-300">
                AI
              </span>
            </div>

            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-amber-100 tracking-wide font-serif leading-tight group-hover:text-amber-300 transition-colors">
                {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-300/80 font-medium line-clamp-1">
                {lang === 'ne' ? PANDIT_INFO.titleNe : PANDIT_INFO.titleEn}
              </p>
            </div>
          </div>

          {/* Right Action Controls for Mobile / Tablet */}
          <div className="flex items-center gap-2">
            {/* Free Trial Button (Visible for non-subscribed users) */}
            {!isSubscribed && (
              <button
                onClick={openFreeTrialModal}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-black border transition-all active:scale-95 shadow-md cursor-pointer ${
                  isFreeTrialEligible
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 border-emerald-300 shadow-emerald-500/20'
                    : 'bg-stone-900 text-amber-300 border-amber-600/40 hover:bg-stone-800'
                }`}
                title="निःशुल्क परीक्षण (Free Trial) - ३ जन्म विवरण सम्म सबै फिचर निःशुल्क"
              >
                <Gift className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                <span className="whitespace-nowrap">
                  {isFreeTrialEligible
                    ? (lang === 'ne' ? `🎁 फ्री ट्रायल (${trialState.remaining}/3)` : `🎁 Free Trial (${trialState.remaining}/3)`)
                    : (lang === 'ne' ? '🎁 फ्री ट्रायल (समाप्त)' : '🎁 Trial Ended')}
                </span>
              </button>
            )}

            {/* Subscription Plans Button */}
            <button
              onClick={() => openSubscriptionModal()}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-xs font-black border transition-all active:scale-95 shadow-md cursor-pointer ${
                isSubscribed
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-300 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 border-amber-300 animate-pulse'
              }`}
              title="कुण्डली तथा फलित सदस्यता योजनाहरू"
            >
              <Crown className="w-3.5 h-3.5 text-stone-950 shrink-0" />
              <span className="whitespace-nowrap">
                {isSubscribed
                  ? (lang === 'ne' ? `👑 ${currentPlan.toUpperCase()}` : `👑 ${currentPlan.toUpperCase()}`)
                  : (lang === 'ne' ? '👑 योजना (रु ३९९+)' : '👑 Plans (Rs 399+)')}
              </span>
            </button>

            {/* Visiting Card Button on Header */}
            {onOpenVisitingCard && (
              <button
                onClick={onOpenVisitingCard}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-md border border-amber-300/80 hover:brightness-110 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                <span>{lang === 'ne' ? 'भिजिटिङ कार्ड' : 'Visiting Card'}</span>
              </button>
            )}

            {/* Guru Info Icon Button for Mobile */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="sm:hidden p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 rounded-xl border border-amber-800/60 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="गुरु परिचय"
            >
              <User className="w-4 h-4 text-amber-300" />
            </button>

            {/* Mobile Hamburger Drawer Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-amber-200 hover:text-amber-50 bg-amber-900/70 hover:bg-amber-800/80 rounded-xl border border-amber-700/60 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5 text-amber-300" />}
            </button>
          </div>
        </div>

        {/* Desktop / Laptop Navigation Tabs in 2 Balanced Lines (4 items per line, all 8 items fully visible at once) */}
        <div className="hidden md:block max-w-7xl mx-auto px-3 sm:px-4 pb-2.5">
          <nav className="bg-amber-900/40 p-1.5 sm:p-2 rounded-2xl border border-amber-800/60 shadow-inner">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap active:scale-[0.98] ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 shadow-md border border-amber-200 scale-[1.01]'
                        : 'text-amber-200 hover:text-amber-50 hover:bg-amber-900/70 border border-amber-800/40 bg-amber-950/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-950' : 'text-amber-400'}`} />
                    <span className="truncate">{lang === 'ne' ? tab.labelNe : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for Smartphones md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-amber-950/95 backdrop-blur-lg border-t border-amber-800/80 shadow-[0_-8px_20px_rgba(0,0,0,0.5)] px-0.5 py-1 pb-safe">
        <div className="grid grid-cols-8 gap-0.5 max-w-full mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all duration-200 select-none active:scale-95 min-h-[44px] ${
                  isActive
                    ? 'bg-amber-800/80 text-amber-300 font-bold border border-amber-600/80 shadow-sm'
                    : 'text-amber-200/80 hover:text-amber-100 hover:bg-amber-900/40'
                }`}
              >
                <div className={`p-0.5 rounded-md ${isActive ? 'bg-amber-500 text-amber-950 shadow-xs' : ''}`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-950' : 'text-amber-400'}`} />
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] mt-0.5 tracking-tighter truncate max-w-full leading-none font-medium text-center">
                  {lang === 'ne' ? tab.shortNe : tab.shortEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Overlay / Menu Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn">
          {/* Backdrop Click to Close */}
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="bg-amber-950 border-t-2 border-amber-500/80 rounded-t-3xl p-4 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto border-x border-amber-800/60">
            {/* Sheet Handle Indicator */}
            <div className="w-12 h-1.5 bg-amber-700/60 rounded-full mx-auto" />

            {/* Header in Mobile Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-800 border border-amber-500/50 flex items-center justify-center text-amber-300 font-serif font-bold text-sm">
                  ॐ
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-100 font-serif">
                    {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
                  </h3>
                  <p className="text-[10px] text-amber-400/90">
                    {lang === 'ne' ? 'मुख्य सेवा रोज्नुहोस्' : 'Select Service'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-amber-400 hover:text-amber-100 bg-amber-900/60 rounded-full border border-amber-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Trial Banner in Mobile Drawer */}
            {!isSubscribed && (
              <div
                onClick={() => {
                  setMobileMenuOpen(false);
                  openFreeTrialModal();
                }}
                className={`p-3 rounded-2xl border shadow-lg cursor-pointer flex items-center justify-between transition-all active:scale-[0.98] ${
                  isFreeTrialEligible
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-stone-950 border-emerald-300 shadow-emerald-500/20'
                    : 'bg-stone-900/90 text-amber-300 border-amber-600/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-stone-950/20 text-stone-950">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black">
                      {isFreeTrialEligible
                        ? (lang === 'ne' ? `🎁 निःशुल्क परीक्षण (Free Trial: ${trialState.remaining}/3)` : `🎁 Free Trial (${trialState.remaining}/3 Remaining)`)
                        : (lang === 'ne' ? '🎁 फ्री ट्रायल (३/३ पूरा भयो)' : '🎁 Free Trial (3/3 Used)')}
                    </div>
                    <div className="text-[10px] font-medium opacity-90">
                      {isFreeTrialEligible
                        ? (lang === 'ne' ? '३ वटा सम्म जन्म विवरण हालेर सम्पूर्ण फिचर हेर्नुहोस्' : 'Enter up to 3 birth details and explore all features')
                        : (lang === 'ne' ? 'यस डिभाइसमा ३ पटकको निःशुल्क परीक्षण पूरा भयो' : 'Free trial exhausted on this device')}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-950 shrink-0" />
              </div>
            )}

            {/* Premium Subscription Plan Banner in Drawer */}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                openSubscriptionModal();
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 border border-amber-300 shadow-lg cursor-pointer flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-950/20 text-stone-950">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black">
                    {isSubscribed
                      ? (lang === 'ne' ? `👑 सक्रिय: ${currentPlan.toUpperCase()} योजना` : `👑 Active: ${currentPlan.toUpperCase()} Plan`)
                      : (lang === 'ne' ? '👑 कुण्डली एवं फलित योजना (रु ३९९+)' : '👑 Kundali & Phalit Plans (Rs 399+)')}
                  </div>
                  <div className="text-[10px] font-medium opacity-90">
                    {lang === 'ne' ? '३ महिना, ६ महिना, १ वर्ष वा आजीवन योजना' : '3 Mo, 6 Mo, 1 Year or Lifetime'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-950 shrink-0" />
            </div>

            {/* Navigation Options List */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider px-1">
                {lang === 'ne' ? 'ज्योतिष सेवाहरू (Services)' : 'Astrology Services'}
              </p>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-amber-800/90 border-amber-500 text-amber-50 shadow-md font-bold'
                        : 'bg-amber-900/30 border-amber-800/50 text-amber-200 hover:bg-amber-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-500 text-amber-950' : 'bg-amber-900/80 text-amber-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">
                          {lang === 'ne' ? tab.labelNe : tab.labelEn}
                        </div>
                        <div className="text-[10px] text-amber-300/70 font-normal">
                          {lang === 'ne' ? tab.descNe : tab.descEn}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-amber-500/60'}`} />
                  </button>
                );
              })}
            </div>

            {/* Extra Actions in Drawer */}
            <div className="pt-2 border-t border-amber-800/60 space-y-2">
              <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider px-1">
                {lang === 'ne' ? 'अन्य सुविधाहरू (Quick Access)' : 'Quick Access'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Visiting Card Button */}
                {onOpenVisitingCard && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenVisitingCard();
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold text-xs border border-amber-300 shadow-sm active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'भिजिटिङ कार्ड' : 'Visiting Card'}</span>
                  </button>
                )}

                {/* Guru Parichaya Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowInfoModal(true);
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-900/80 text-amber-200 hover:text-amber-50 font-semibold text-xs border border-amber-700/60 active:scale-95 transition-all"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? 'गुरु परिचय' : 'About Guru'}</span>
                </button>
              </div>

              {/* Theme Toggle Button in Drawer */}
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${
                  isDark
                    ? 'bg-amber-900/50 text-amber-200 border-amber-700/60 hover:bg-amber-800/60'
                    : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-700 fill-indigo-700" />
                  )}
                  <span>
                    {lang === 'ne' ? 'थिम मोड (Theme Mode)' : 'Theme Mode'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDark ? 'bg-amber-800 text-amber-200' : 'bg-amber-300 text-amber-950'
                }`}>
                  {isDark
                    ? (lang === 'ne' ? '☀️ लाइट मोडमा फेर्नुहोस्' : '☀️ Switch to Light')
                    : (lang === 'ne' ? '🌙 डार्क मोडमा फेर्नुहोस्' : '🌙 Switch to Dark')}
                </span>
              </button>

              {/* Language Switch Button */}
              <button
                onClick={() => {
                  setLang(lang === 'ne' ? 'en' : 'ne');
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-900/40 text-amber-300 hover:text-amber-100 text-xs font-semibold border border-amber-800/60 active:scale-95 transition-all"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'ne' ? 'English भाषामा स्विच गर्नुहोस्' : 'Switch to Nepali Language'}
                </span>
              </button>
            </div>

            {/* Quick Contact Line */}
            <div className="pt-2 border-t border-amber-800/60 text-center text-xs text-amber-300/80">
              <a
                href="https://wa.me/9779863991384"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: {PANDIT_INFO.whatsappPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pandit Profile / Guru Parichaya Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-amber-950 text-amber-100 rounded-3xl max-w-lg w-full border border-amber-600/80 shadow-2xl overflow-hidden p-5 sm:p-6 relative my-auto">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-amber-400 hover:text-amber-100 p-2 rounded-full bg-amber-900/60 border border-amber-700/50 active:scale-95 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-900 border-2 border-amber-400/90 flex items-center justify-center text-3xl font-serif text-amber-300 shadow-xl mb-3">
                ॐ
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
              </h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                {lang === 'ne' ? PANDIT_INFO.titleNe : PANDIT_INFO.titleEn}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed bg-amber-900/40 p-3.5 rounded-2xl border border-amber-800/60 mb-4">
              {lang === 'ne' ? PANDIT_INFO.bioNe : PANDIT_INFO.bioEn}
            </p>

            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {lang === 'ne' ? 'मुख्य परामर्श सेवाहरू:' : 'Core Consultation Services:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {PANDIT_INFO.services.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-amber-900/30 px-2.5 py-1.5 rounded-xl border border-amber-800/40 text-amber-100">
                    <span className="text-amber-400 font-bold">✦</span>
                    <span>{lang === 'ne' ? srv.ne : srv.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now Button inside Guru Parichaya Modal */}
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  onOpenVisitingCard?.();
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-amber-950 font-black text-xs sm:text-sm py-3 rounded-2xl shadow-lg border border-amber-200 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4 text-amber-950" />
                <span>{lang === 'ne' ? '📅 गुरुसँग परामर्श बुकिङ गर्नुहोस् (Book Now)' : '📅 Book Consultation with Guru'}</span>
              </button>
            </div>

            <div className="bg-amber-900/60 p-3.5 rounded-2xl border border-amber-700/60 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/60 pb-2">
                <a
                  href="https://wa.me/9779863991384"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-semibold bg-emerald-950/80 px-2.5 py-1.5 rounded-xl border border-emerald-700/50 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp: {PANDIT_INFO.whatsappPhone}</span>
                </a>
                <a
                  href="tel:+9779805674119"
                  className="flex items-center gap-1.5 text-amber-200 hover:text-amber-100 font-semibold bg-amber-950/80 px-2.5 py-1.5 rounded-xl border border-amber-700/50 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call: {PANDIT_INFO.callPhone}</span>
                </a>
              </div>
              <div className="text-center sm:text-right text-amber-300/80 text-[11px]">
                {PANDIT_INFO.contactLocation}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

