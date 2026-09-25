import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Heart,
  Compass,
  Calendar,
  MessageSquare,
  Crown,
  Sun,
  Moon,
  Globe,
  User,
  Phone,
  Share2,
  FileText,
  ShieldCheck,
  Info,
  ExternalLink,
  X,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  Flame,
  Scale,
  Settings,
} from 'lucide-react';
import { Language, KundaliResult, KundaliInput } from '../../types';
import { PANDIT_INFO } from '../../data/astrologyData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAccessibility } from '../../context/AccessibilityContext';

interface MobileDashboardGridProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenVisitingCard: () => void;
  onOpenAuthModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  isCompact?: boolean;
}

// 12 Rashis and starting letters/syllables
const RASHI_LETTERS = [
  { rashiNe: 'मेष', rashiEn: 'Aries', letters: 'चु, चे, चो, ला, ली, लू, ले, लो, अ', lord: 'मङ्गल (Mars)', symbol: '♈' },
  { rashiNe: 'वृष', rashiEn: 'Taurus', letters: 'ई, उ, ए, ओ, वा, वी, वू, वे, वो', lord: 'शुक्र (Venus)', symbol: '♉' },
  { rashiNe: 'मिथुन', rashiEn: 'Gemini', letters: 'का, की, कू, घ, ङ, छ, के, को, हा', lord: 'बुध (Mercury)', symbol: '♊' },
  { rashiNe: 'कर्कट', rashiEn: 'Cancer', letters: 'ही, हू, हे, हो, डा, डी, डू, डे, डो', lord: 'चन्द्रमा (Moon)', symbol: '♋' },
  { rashiNe: 'सिंह', rashiEn: 'Leo', letters: 'मा, मी, मू, मे, मो, टा, टी, टू, टे', lord: 'सूर्य (Sun)', symbol: '♌' },
  { rashiNe: 'कन्या', rashiEn: 'Virgo', letters: 'टो, पा, पी, पू, ष, ण, ठा, पे, पो', lord: 'बुध (Mercury)', symbol: '♍' },
  { rashiNe: 'तुला', rashiEn: 'Libra', letters: 'रा, री, रू, रे, रो, ता, ती, तू, ते', lord: 'शुक्र (Venus)', symbol: '♎' },
  { rashiNe: 'वृश्चिक', rashiEn: 'Scorpio', letters: 'तो, ना, नी, नू, ने, नो, या, यी, यू', lord: 'मङ्गल (Mars)', symbol: '♏' },
  { rashiNe: 'धनु', rashiEn: 'Sagittarius', letters: 'ये, यो, भा, भी, भू, धा, फा, ढा, भे', lord: 'बृहस्पति (Jupiter)', symbol: '♐' },
  { rashiNe: 'मकर', rashiEn: 'Capricorn', letters: 'भो, जा, जी, खी, खू, खे, खो, गा, गी', lord: 'शनि (Saturn)', symbol: '♑' },
  { rashiNe: 'कुम्भ', rashiEn: 'Aquarius', letters: 'गू, गे, गो, सा, सी, सू, से, सो, दा', lord: 'शनि (Saturn)', symbol: '♒' },
  { rashiNe: 'मीन', rashiEn: 'Pisces', letters: 'दी, दू, थ, झ, ञ, दे, दो, चा, ची', lord: 'बृहस्पति (Jupiter)', symbol: '♓' },
];

// Vedic Gotra and Pravara data
const GOTRA_LIST = [
  { gotra: 'कश्यप', pravara: 'कश्यप, अवत्सार, असित (त्रिप्रवर)', rishi: 'कश्यप ऋषि', veda: 'शुक्ल यजुर्वेद / सामवेद' },
  { gotra: 'भारद्वाज', pravara: 'आङ्गिरस, बार्हस्पत्य, भारद्वाज (त्रिप्रवर)', rishi: 'भारद्वाज ऋषि', veda: 'शुक्ल यजुर्वेद' },
  { gotra: 'वशिष्ठ', pravara: 'वशिष्ठ, शक्ति, पराशर (त्रिप्रवर)', rishi: 'वशिष्ठ ऋषि', veda: 'ऋग्वेद / यजुर्वेद' },
  { gotra: 'विश्वामित्र', pravara: 'विश्वामित्र, देवरात, औदल (त्रिप्रवर)', rishi: 'विश्वामित्र ऋषि', veda: 'सामवेद' },
  { gotra: 'गौतम', pravara: 'आङ्गिरस, आयस्य, गौतम (त्रिप्रवर)', rishi: 'गौतम ऋषि', veda: 'सामवेद' },
  { gotra: 'अत्रि', pravara: 'अत्रि, अर्चननस, श्यावाश्व (त्रिप्रवर)', rishi: 'अत्रि ऋषि', veda: 'ऋग्वेद' },
  { gotra: 'उपमन्यु', pravara: 'वशिष्ठ, इन्द्रप्रमद, आभरण (त्रिप्रवर)', rishi: 'उपमन्यु ऋषि', veda: 'यजुर्वेद' },
  { gotra: 'कौडिन्य', pravara: 'वशिष्ठ, मैत्रावरुण, कौण्डिन्य (त्रिप्रवर)', rishi: 'कौण्डिन्य ऋषि', veda: 'शुक्ल यजुर्वेद' },
  { gotra: 'गर्ग', pravara: 'आङ्गिरस, गार्ग्य, सैत्य (त्रिप्रवर)', rishi: 'गर्ग ऋषि', veda: 'यजुर्वेद' },
  { gotra: 'शाण्डिल्य', pravara: 'शाण्डिल्य, असित, देवल (त्रिप्रवर)', rishi: 'शाण्डिल्य ऋषि', veda: 'सामवेद' },
  { gotra: 'घृतकौशिक', pravara: 'कुशिक, गाधि, विश्वामित्र (त्रिप्रवर)', rishi: 'कुशिक ऋषि', veda: 'यजुर्वेद' },
  { gotra: 'पराशर', pravara: 'वशिष्ठ, शक्ति, पराशर (त्रिप्रवर)', rishi: 'पराशर ऋषि', veda: 'यजुर्वेद' },
];

export const MobileDashboardGrid: React.FC<MobileDashboardGridProps> = ({
  lang,
  setLang,
  activeTab,
  onSelectTab,
  onOpenVisitingCard,
  onOpenAuthModal,
  onOpenSubscriptionModal,
  isCompact = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isAdmin, openAuthModal } = useAuth();
  const { isSubscribed, openSubscriptionModal } = useSubscription();
  const { openSettings } = useAccessibility();

  // Active knowledge / utility modals
  const [activeModal, setActiveModal] = useState<
    'rashi' | 'gotra' | 'sankalpa' | 'mantra' | 'muhurat' | 'privacy' | 'terms' | 'contact' | 'share' | null
  >(null);

  const [rashiSearch, setRashiSearch] = useState('');
  const [gotraSearch, setGotraSearch] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'वैदिक ज्योतिष तथा चिना फलादेश',
        text: 'पण्डित शम्भु प्रसाद लम्साल (Binay Guru) द्वारा तयार गरिएको सम्पूर्ण वैदिक कुण्डली, चिना प्रिन्ट तथा फलादेश एप।',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const filteredRashi = RASHI_LETTERS.filter(
    (r) =>
      r.rashiNe.includes(rashiSearch) ||
      r.rashiEn.toLowerCase().includes(rashiSearch.toLowerCase()) ||
      r.letters.includes(rashiSearch)
  );

  const filteredGotra = GOTRA_LIST.filter(
    (g) => g.gotra.includes(gotraSearch) || g.rishi.includes(gotraSearch)
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 space-y-6">
      {/* Category 1: मुख्य सेवाहरू (Main Astrology Services) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block" />
            <span>{lang === 'ne' ? 'मुख्य ज्योतिष सेवाहरू' : 'Core Astrology Services'}</span>
          </h2>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            {lang === 'ne' ? '४x ग्रिड मेनु' : '4-Column Grid'}
          </span>
        </div>

        {/* 4-Column Clean Mobile Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
          {/* 1. Kundali */}
          <button
            onClick={() => onSelectTab('kundali')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'kundali'
                ? 'bg-amber-100/90 dark:bg-amber-950/70 border-2 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 dark:from-amber-900/60 dark:to-amber-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📜</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'कुण्डली' : 'Kundali'}
            </span>
            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'निःशुल्क' : 'Free'}
            </span>
          </button>

          {/* 2. Kundali Milan */}
          <button
            onClick={() => onSelectTab('milan')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'milan'
                ? 'bg-rose-100/90 dark:bg-rose-950/70 border-2 border-rose-500 shadow-md ring-2 ring-rose-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-rose-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-rose-100 to-rose-200/80 dark:from-rose-900/60 dark:to-rose-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">👩‍❤️‍👨</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'कुण्डली मिलान' : 'Milan'}
            </span>
            <span className="text-[9px] text-rose-600 dark:text-rose-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? '३६ गुण' : '36 Gunas'}
            </span>
          </button>

          {/* 3. 17 Kundali & Traditional Cheena Print */}
          <button
            onClick={() => onSelectTab('china17')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'china17'
                ? 'bg-amber-100/90 dark:bg-amber-950/70 border-2 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95'
            }`}
          >
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              👑 PRO
            </span>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 dark:from-amber-900/60 dark:to-amber-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📜</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'पूरा चिना' : 'Full Cheena'}
            </span>
            <span className="text-[8px] sm:text-[9.5px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5 leading-[1.15] text-center px-0.5">
              {lang === 'ne' ? '१७ कुण्डली सहितको चिना' : 'With 17 Kundali'}
            </span>
          </button>

          {/* 4. Panchang & Rashifal */}
          <button
            onClick={() => onSelectTab('rashifal')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'rashifal'
                ? 'bg-sky-100/90 dark:bg-sky-950/70 border-2 border-sky-500 shadow-md ring-2 ring-sky-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-sky-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-sky-100 to-sky-200/80 dark:from-sky-900/60 dark:to-sky-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🗓️</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'पञ्चाङ्ग' : 'Panchang'}
            </span>
            <span className="text-[9px] text-sky-600 dark:text-sky-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'राशिफल' : 'Horoscope'}
            </span>
          </button>

          {/* 5. China Phalit (Predictions) */}
          <button
            onClick={() => onSelectTab('phalit')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'phalit'
                ? 'bg-orange-100/90 dark:bg-orange-950/70 border-2 border-orange-500 shadow-md ring-2 ring-orange-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-orange-300 active:scale-95'
            }`}
          >
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              👑 PRO
            </span>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-orange-100 to-orange-200/80 dark:from-orange-900/60 dark:to-orange-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📖</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'चिना फलित' : 'Predictions'}
            </span>
            <span className="text-[9px] text-orange-600 dark:text-orange-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'वार्षिक फलादेश' : 'Yearly'}
            </span>
          </button>

          {/* 6. Numerology (अंकशास्त्र) */}
          <button
            onClick={() => onSelectTab('numerology')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'numerology'
                ? 'bg-indigo-100/90 dark:bg-indigo-950/70 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-indigo-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200/80 dark:from-indigo-900/60 dark:to-indigo-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-300">
                🔢
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'अंकशास्त्र' : 'Numerology'}
            </span>
            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'मूलांक / भाग्यांक' : 'Life Path'}
            </span>
          </button>

          {/* 7. Vastu Shastra */}
          <button
            onClick={() => onSelectTab('vastu')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'vastu'
                ? 'bg-emerald-100/90 dark:bg-emerald-950/70 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200/80 dark:from-emerald-900/60 dark:to-emerald-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🧭</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'वास्तु' : 'Vastu'}
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'गृह दोष निवारण' : 'Remedies'}
            </span>
          </button>

          {/* 8. Binay Guru AI Assistant */}
          <button
            onClick={() => onSelectTab('assistant')}
            className={`group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl transition-all duration-200 text-center relative aspect-[1/1.08] sm:aspect-square ${
              activeTab === 'assistant'
                ? 'bg-purple-100/90 dark:bg-purple-950/70 border-2 border-purple-500 shadow-md ring-2 ring-purple-400/30'
                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-purple-300 active:scale-95'
            }`}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-purple-100 to-purple-200/80 dark:from-purple-900/60 dark:to-purple-800/40 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">✨</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
              {lang === 'ne' ? 'AI गुरु' : 'AI Guru'}
            </span>
            <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'प्रत्यक्ष परामर्श' : 'Live Chat'}
            </span>
          </button>
        </div>
      </section>

      {/* Category 2: ज्ञान (Knowledge & Vedic Wisdom) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#d97706] dark:text-amber-500 uppercase font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#d97706] rounded-full inline-block" />
            <span>{lang === 'ne' ? 'ज्ञान' : 'Wisdom'}</span>
          </h2>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {lang === 'ne' ? 'वैदिक ज्ञान र सन्दर्भ' : 'Vedic Reference'}
          </span>
        </div>

        {/* 4-Column Grid for Knowledge Items */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
          {/* Sankalpa */}
          <button
            onClick={() => setActiveModal('sankalpa')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📿</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'संकल्प' : 'Sankalpa'}
            </span>
          </button>

          {/* Mantra */}
          <button
            onClick={() => setActiveModal('mantra')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform text-red-600 dark:text-red-400 font-serif font-bold text-xl sm:text-2xl">
              ॐ
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'मन्त्र' : 'Mantra'}
            </span>
          </button>

          {/* Name Rashi Chart */}
          <button
            onClick={() => setActiveModal('rashi')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">♈</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'नाम राशि चार्ट' : 'Name Rashi'}
            </span>
          </button>

          {/* Gotra Pravara */}
          <button
            onClick={() => setActiveModal('gotra')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🌳</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'गोत्र' : 'Gotra'}
            </span>
          </button>

          {/* Shubh Muhurat */}
          <button
            onClick={() => setActiveModal('muhurat')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">⏰</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'मुहूर्त' : 'Muhurat'}
            </span>
          </button>

          {/* Visiting Card */}
          <button
            onClick={onOpenVisitingCard}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📇</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'भिजिटिङ कार्ड' : 'Card'}
            </span>
          </button>

          {/* Contact Guru directly */}
          <button
            onClick={() => setActiveModal('contact')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">📞</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'सम्पर्क' : 'Contact'}
            </span>
          </button>

          {/* Share App */}
          <button
            onClick={handleShareApp}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {copiedShare ? (lang === 'ne' ? 'लिङ्क कपि!' : 'Copied!') : (lang === 'ne' ? 'एप सेयर' : 'Share App')}
            </span>
          </button>
        </div>
      </section>

      {/* Category 3: सेटिङ (Settings & Account) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#d97706] dark:text-amber-500 uppercase font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#d97706] rounded-full inline-block" />
            <span>{lang === 'ne' ? 'सेटिङ' : 'Settings'}</span>
          </h2>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {lang === 'ne' ? 'खाता र सुविधाहरू' : 'Preferences'}
          </span>
        </div>

        {/* 4-Column Grid for Settings Items */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
          {/* Subscription Plan */}
          <button
            onClick={() => {
              if (onOpenSubscriptionModal) onOpenSubscriptionModal();
              else openSubscriptionModal();
            }}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">👑</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'प्लान / सदस्यता' : 'Plan'}
            </span>
          </button>

          {/* App Settings & Vision Accessibility (अक्षर आकार तथा दृष्टि सुलभता) */}
          <button
            onClick={openSettings}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-400 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'एप सेटिङ' : 'Settings'}
            </span>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-0.5 hidden sm:block">
              {lang === 'ne' ? 'अक्षर आकार' : 'Zoom'}
            </span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              {isDark ? (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500" />
              ) : (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 fill-indigo-600" />
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {isDark ? (lang === 'ne' ? 'लाइट मोड' : 'Light') : (lang === 'ne' ? 'डार्क मोड' : 'Dark')}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'English' : 'नेपाली'}
            </span>
          </button>

          {/* Customer Profile / Admin Login */}
          <button
            onClick={() => {
              if (onOpenAuthModal) onOpenAuthModal();
              else openAuthModal();
            }}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              {isAdmin ? (
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {isAdmin ? 'एडमिन' : (lang === 'ne' ? 'ग्राहक' : 'Profile')}
            </span>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => setActiveModal('privacy')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">⚠️</span>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'गोपनीयता नीति' : 'Privacy'}
            </span>
          </button>

          {/* Terms and Conditions */}
          <button
            onClick={() => setActiveModal('terms')}
            className="group flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-amber-300 active:scale-95 transition-all text-center aspect-[1/1.08] sm:aspect-square"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-stone-600 dark:text-stone-300" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
              {lang === 'ne' ? 'नियम र सर्त' : 'Terms'}
            </span>
          </button>
        </div>
      </section>

      {/* Floating Login / Plan Button (matching the user's screenshot at bottom-right) */}
      <div className="fixed bottom-20 sm:bottom-24 right-4 z-30">
        <button
          onClick={() => {
            if (onOpenSubscriptionModal) onOpenSubscriptionModal();
            else openSubscriptionModal();
          }}
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-stone-950 font-bold px-4 py-2.5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <Crown className="w-4 h-4 text-stone-950 fill-stone-950" />
          <span className="text-xs sm:text-sm font-serif font-black">
            {isSubscribed
              ? (lang === 'ne' ? '👑 सदस्यता सक्रिय' : '👑 Active Member')
              : (lang === 'ne' ? '👑 योजना / लगइन' : '👑 Plan / Login')}
          </span>
        </button>
      </div>

      {/* ======================= INTERACTIVE MODALS ======================= */}

      {/* 1. Name Rashi Chart Modal */}
      {activeModal === 'rashi' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">♈</span>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {lang === 'ne' ? 'नाम राशि चार्ट (Name Rashi Table)' : 'Name to Zodiac Chart'}
                  </h3>
                  <p className="text-[11px] text-stone-950/80">
                    {lang === 'ne' ? 'नामको पहिलो अक्षरबाट आफ्नो राशि पत्ता लगाउनुहोस्' : 'Find your Zodiac sign by your name initials'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-stone-950/20 hover:bg-stone-950/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-200 dark:border-stone-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={lang === 'ne' ? 'अक्षर वा राशि खोज्नुहोस् (उदा. च, मेष, Aries)...' : 'Search letter or sign...'}
                  value={rashiSearch}
                  onChange={(e) => setRashiSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredRashi.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/70 dark:border-stone-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.symbol}</span>
                    <div>
                      <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {item.rashiNe} ({item.rashiEn})
                      </div>
                      <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        {item.letters}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="block font-semibold text-stone-700 dark:text-stone-300">{item.lord}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Gotra Pravara Modal */}
      {activeModal === 'gotra' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-cyan-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌳</span>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {lang === 'ne' ? 'गोत्र, प्रवर र वेद शाखा' : 'Gotra, Pravara & Veda Shakha'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {lang === 'ne' ? 'ऋषि वंश र शास्त्रीय प्रवर विवरण' : 'Classical Lineage & Vedic Pravara'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-200 dark:border-stone-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder={lang === 'ne' ? 'गोत्र खोज्नुहोस् (उदा. कश्यप, भारद्वाज)...' : 'Search Gotra...'}
                  value={gotraSearch}
                  onChange={(e) => setGotraSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredGotra.map((g, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-stone-800/60 border border-cyan-200/60 dark:border-stone-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-cyan-900 dark:text-cyan-300">{g.gotra} गोत्र</span>
                    <span className="text-[10px] bg-cyan-200/80 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 px-2 py-0.5 rounded-full font-medium">
                      {g.veda}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700 dark:text-stone-300">
                    <span className="font-semibold text-stone-900 dark:text-stone-100">प्रवर: </span>
                    {g.pravara}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    मूल ऋषि: {g.rishi}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sankalpa Modal */}
      {activeModal === 'sankalpa' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📿</span>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {lang === 'ne' ? 'दैनिक नित्य पूजा संकल्प विधि' : 'Daily Vedic Sankalpa Path'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {lang === 'ne' ? 'कुनै पनि पूजा वा कर्मको शुभारम्भमा' : 'Daily worship & ritual vow'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm leading-relaxed">
              <div className="p-3.5 bg-amber-50 dark:bg-stone-800/80 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2">
                <span className="font-bold text-amber-900 dark:text-amber-300 block text-sm">
                  संस्कृत मूल मन्त्र:
                </span>
                <p className="font-serif text-amber-950 dark:text-amber-100 italic leading-loose">
                  "ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीये परार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे युगे कलियुगे कलिप्रथमचरणे जम्बूद्वीपे भरतखण्डे आर्यावर्तैकदेशे... अमुक गोत्रोत्पन्नः अमुक शर्मा/वर्मा/गुप्तोऽहं मम सकलदुरितोपशमनपूर्वक धर्मार्थकाममोक्ष फलावाप्तये श्रीपरमेश्वरप्रीत्यर्थं नित्यपूजनं करिष्ये।"
                </p>
              </div>

              <div className="space-y-1.5 text-stone-700 dark:text-stone-300 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100 block">विधि र नियम:</span>
                <p>१. दाहिने हातमा जल, अक्षता, फूल, कुश र द्रव्य लिई पूर्व वा उत्तर फर्किएर बस्नुहोस्।</p>
                <p>२. 'अमुक गोत्र' को ठाउँमा आफ्नो गोत्र र 'अमुक शर्मा' को ठाउँमा आफ्नो नाम उच्चारण गर्नुहोस्।</p>
                <p>३. संकल्प पाठ समाप्त भएपछि हातको जल र अक्षता ताम्रपात्र वा देवस्थलमा अर्पण गर्नुहोस्।</p>
              </div>
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Vedic Mantra Modal */}
      {activeModal === 'mantra' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-red-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold">ॐ</span>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {lang === 'ne' ? 'वैदिक महामन्त्र संग्रह' : 'Vedic Mantra Sangraha'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {lang === 'ne' ? 'दैनिक जप तथा शान्तिका लागि' : 'Daily Chanting Mantras'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs sm:text-sm">
              <div className="p-3 bg-red-50 dark:bg-stone-800/80 rounded-2xl border border-red-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-red-900 dark:text-red-300 block text-xs">१. गायत्री महामन्त्र (Gayatri Mantra):</span>
                <p className="font-serif text-stone-900 dark:text-stone-100 italic">
                  ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">बुद्धि, तेज र आत्मबल वृद्धि गर्न नित्य १०८ पटक जप गर्नुहोस्।</p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-stone-800/80 rounded-2xl border border-red-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-red-900 dark:text-red-300 block text-xs">२. महामृत्युञ्जय मन्त्र (Maha Mrityunjaya):</span>
                <p className="font-serif text-stone-900 dark:text-stone-100 italic">
                  ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">आरोग्य, अकाल मृत्यु निवारण र मानसिक शान्तिका लागि।</p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-stone-800/80 rounded-2xl border border-red-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-red-900 dark:text-red-300 block text-xs">३. नवग्रह शान्ति मन्त्र:</span>
                <p className="font-serif text-stone-900 dark:text-stone-100 italic">
                  ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनि राहु केतवः सर्वे ग्रहाः शान्तिकरा भवन्तु॥
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Shubh Muhurat Modal */}
      {activeModal === 'muhurat' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    {lang === 'ne' ? 'शुभ मुहूर्त एवं साइत विचार' : 'Auspicious Muhurat & Timing'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {lang === 'ne' ? 'विवाह, व्रतबन्ध, गृहप्रवेश र यात्रा' : 'Marriage, Housewarming & Journeys'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 dark:bg-stone-800/80 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">१. दैनिक अभिजित मुहूर्त:</span>
                <p className="text-stone-700 dark:text-stone-300">
                  मध्याह्न सूर्योदय र सूर्यास्तको ठीक बीचको समय (लगभग बिहान ११:४० देखि १२:२५ सम्म) अभिजित मुहूर्त रहन्छ। यस मुहूर्तमा जुनसुकै शुभ कार्य प्रारम्भ गर्न सकिन्छ।
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-stone-800/80 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">२. राहुकाल वर्जित:</span>
                <p className="text-stone-700 dark:text-stone-300">
                  प्रत्येक दिन १.५ घण्टा राहुकाल हुन्छ (आइतबार साँझ ४:३०-६:००, सोमबार बिहान ७:३०-९:००, मङ्गलबार दिउँसो ३:००-४:३०, बुधबार १२:००-१:३०, बिहीबार १:३०-३:००, शुक्रबार १०:३०-१२:००, शनिबार बिहान ९:००-१०:३०)। यस समयमा नयाँ काम वा यात्रा निषेध छ।
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-stone-800/80 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">३. पञ्चाङ्ग र राशिफल खण्ड:</span>
                <p className="text-stone-700 dark:text-stone-300">
                  विस्तृत दैनिक चौघडिया, होरा तथा नक्षत्र साइतका लागि हाम्रो 'पञ्चाङ्ग' खण्ड हेर्नुहोस्।
                </p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onSelectTab('rashifal');
                  }}
                  className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 underline"
                >
                  👉 पञ्चाङ्ग खण्डमा जानुहोस्
                </button>
              </div>
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-sm w-full shadow-2xl border border-emerald-500/50 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base">
                  {lang === 'ne' ? 'प्रत्यक्ष परामर्श र सम्पर्क' : 'Direct Consultation'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-3xl font-serif font-bold text-amber-600 border border-amber-300">
                ॐ
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {lang === 'ne' ? PANDIT_INFO.titleNe : PANDIT_INFO.titleEn}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/9779863991384`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <span>WhatsApp: {PANDIT_INFO.whatsappPhone}</span>
                </a>
                <a
                  href={`tel:+9779805674119`}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <span>Call: {PANDIT_INFO.callPhone}</span>
                </a>
              </div>

              <p className="text-[11px] text-stone-500 pt-1">
                {PANDIT_INFO.contactLocation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Privacy & Terms Modals */}
      {(activeModal === 'privacy' || activeModal === 'terms') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-300 dark:border-stone-700 overflow-hidden animate-fadeIn">
            <div className="p-4 bg-stone-800 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">
                {activeModal === 'privacy'
                  ? (lang === 'ne' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')
                  : (lang === 'ne' ? 'नियम तथा सर्तहरू (Terms & Conditions)' : 'Terms & Conditions')}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
              {activeModal === 'privacy' ? (
                <>
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    तपाईंको जन्म विवरण र व्यक्तिगत तथ्याङ्कको सुरक्षा हाम्रो सर्वोच्च प्राथमिकता हो:
                  </p>
                  <p>१. ग्राहकको जन्म मिति, समय र स्थान केवल कुण्डली गणनाका लागि प्रयोग गरिन्छ।</p>
                  <p>२. हामी तपाईंको व्यक्तिगत विवरण कुनै तेस्रो पक्षसँग साझेदारी गर्दैनौं।</p>
                  <p>३. क्लाउड सिंक गर्दा सम्पूर्ण तथ्याङ्क इन्क्रिप्टेड रूपमा सुरक्षित राखिन्छ।</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    सेवाका सर्तहरू तथा मार्गदर्शन:
                  </p>
                  <p>१. वैदिक ज्योतिष सम्भावना र ग्रह स्थितिको आधारमा गरिने मार्गदर्शक विज्ञान हो।</p>
                  <p>२. जीवनका महत्त्वपूर्ण निर्णयहरूमा आफ्नो विवेक र कर्मलाई सदैव प्राथमिकता दिनुहोस्।</p>
                  <p>३. सदस्यता योजनाहरूको भुक्तानी र डिजिटल सेवा तत्काल सक्रिय हुन्छ।</p>
                </>
              )}
            </div>

            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
