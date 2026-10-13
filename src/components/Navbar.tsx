import React, { useState, useEffect } from 'react';
import { PANDIT_INFO } from '../data/astrologyData';
import { Language } from '../types';
import { Sparkles, Compass, Info, Phone, Calendar, Globe, Menu, X, BookOpen, User, ArrowRight, Heart, MessageSquare, Sun, Moon, ShieldCheck, LogIn, KeyRound, Crown, CreditCard, LayoutGrid, Home, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptionService';
import { MobileDashboardGrid } from './dashboard/MobileDashboardGrid';

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
  } = useSubscription();
  const { openSettings } = useAccessibility();

  // Safe tab selection handler to avoid crashes
  const handleTabChange = (tabId: string) => {
    try {
      if ((tabId === 'china17' || tabId === 'phalit') && !isSubscribed) {
        openSubscriptionModal(
          tabId === 'china17'
            ? (lang === 'ne' ? 'पूरा चिना (१७ कुण्डली सहितको चिना)' : 'Full Cheena (17 Kundali)')
            : (lang === 'ne' ? 'चिना फलित (China Phalit)' : 'China Phalit')
        );
      }
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
      id: 'home',
      labelNe: '🏠 होम (Home)',
      labelEn: '🏠 Home',
      shortNe: 'होम',
      shortEn: 'Home',
      icon: Home,
      descNe: 'वैदिक ज्योतिष गृह, ४-कलम ग्रिड मेनु र सम्पूर्ण सेवाहरू',
      descEn: 'Vedic Astrology Home, 4-column grid & quick tools',
    },
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
      labelNe: 'पूरा चिना (१७ कुण्डली सहितको चिना)',
      labelEn: 'Full Cheena (17 Kundali)',
      shortNe: 'पूरा चिना',
      shortEn: 'Full Cheena',
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
      shortNe: 'पञ्चाङ्ग र राशिफल',
      shortEn: 'Panchang & Rashifal',
      icon: Calendar,
      descNe: 'पञ्चाङ्ग, मुहूर्त, साईत र १२ राशिको फल (निःशुल्क)',
      descEn: 'Panchang, Muhurat, Sait & Daily Horoscope (Free)',
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
              className="flex items-center gap-1 bg-amber-900/90 hover:bg-amber-800 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-600/60 transition-colors active:scale-95 text-amber-200 cursor-pointer"
              title="भाषा फेर्नुहोस् / Toggle Language"
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{lang === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>

            {/* App Settings & Accessibility Button */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1 bg-amber-900/90 hover:bg-amber-800 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-600/60 transition-colors active:scale-95 text-amber-200 cursor-pointer"
              title={lang === 'ne' ? 'एप सेटिङ तथा दृष्टि सुलभता (अक्षर आकार)' : 'App Settings & Accessibility'}
            >
              <Settings className="w-3 h-3 text-amber-300" />
              <span>{lang === 'ne' ? 'सेटिङ' : 'Settings'}</span>
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
            onClick={() => handleTabChange('home')}
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
                {lang === 'ne' ? 'वैदिक ज्योतिष गुरु' : 'Baidik Jyotish Guru'}
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-300/80 font-medium line-clamp-1">
                {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
              </p>
            </div>
          </div>

          {/* Right Action Controls for Mobile / Tablet */}
          <div className="flex items-center gap-2">
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

            {/* Settings & Accessibility Quick Button for Mobile */}
            <button
              onClick={openSettings}
              className="p-2 text-amber-200 hover:text-amber-50 bg-amber-900/70 hover:bg-amber-800/80 rounded-xl border border-amber-700/60 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title={lang === 'ne' ? 'एप सेटिङ तथा दृष्टि सुलभता' : 'Settings & Vision Accessibility'}
              aria-label="App Settings"
            >
              <Settings className="w-4 h-4 text-amber-300" />
            </button>

            {/* Mobile / Quick Grid Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-amber-200 hover:text-amber-50 bg-amber-900/70 hover:bg-amber-800/80 rounded-xl border border-amber-700/60 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
              title="४x ग्रिड मेनु"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <LayoutGrid className="w-5 h-5 text-amber-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Universal Bottom Navigation Dock - All Menu items (Home, Kundali, 17 China, Phalit...) placed at the bottom */}
      <nav
        aria-label="Main Navigation Dock"
        className="fixed bottom-0 sm:bottom-2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-40 bg-amber-950/95 backdrop-blur-xl border-t sm:border border-amber-800/80 sm:border-amber-500/40 sm:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] sm:shadow-2xl px-1.5 sm:px-3 py-1.5 sm:py-2 pb-safe max-w-5xl w-full sm:w-[96%] transition-all"
      >
        <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'home' && activeTab === 'dashboard');
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`shrink-0 flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl transition-all duration-200 select-none active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black shadow-md border border-amber-200 min-w-[60px] sm:min-w-[76px] scale-[1.02]'
                    : 'text-amber-200/90 hover:text-amber-50 hover:bg-amber-900/60 bg-amber-900/30 border border-amber-800/40 min-w-[54px] sm:min-w-[70px]'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 ${isActive ? 'text-stone-950 stroke-[2.5]' : 'text-amber-400 stroke-[1.75]'}`} />
                <span className="text-[10px] sm:text-[11px] whitespace-nowrap leading-tight font-bold">
                  {lang === 'ne' ? tab.shortNe : tab.shortEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

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
          <div className="bg-[#1c130b] border-t-2 border-amber-500 rounded-t-3xl p-3 sm:p-4 shadow-2xl max-h-[90vh] overflow-y-auto border-x border-amber-800/60 text-amber-50">
            {/* Sheet Handle Indicator */}
            <div className="w-12 h-1.5 bg-amber-800/70 rounded-full mx-auto mb-2" />

            {/* Header in Mobile Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-800 border border-amber-500/50 flex items-center justify-center text-amber-300 font-serif font-bold text-sm shadow-xs">
                  ॐ
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-100 font-serif">
                    {lang === 'ne' ? 'वैदिक ज्योतिष गुरु' : 'Baidik Jyotish Guru'}
                  </h3>
                  <p className="text-[10px] text-amber-400 font-medium">
                    {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-amber-300 hover:text-amber-100 bg-amber-900/60 rounded-full border border-amber-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Dashboard 4-Column Grid */}
            <div className="py-2">
              <MobileDashboardGrid
                lang={lang}
                setLang={setLang}
                activeTab={activeTab}
                onSelectTab={(tabId) => {
                  setMobileMenuOpen(false);
                  handleTabChange(tabId);
                }}
                onOpenVisitingCard={() => {
                  setMobileMenuOpen(false);
                  onOpenVisitingCard?.();
                }}
                onOpenSubscriptionModal={() => {
                  setMobileMenuOpen(false);
                  openSubscriptionModal();
                }}
                onOpenAuthModal={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
              />
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

