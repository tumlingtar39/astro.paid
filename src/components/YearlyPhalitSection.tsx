import React, { useState, useEffect, useMemo } from 'react';
import { KundaliInput, KundaliResult, Language, YearlyPredictionResult } from '../types';
import { calculateFullKundali } from '../utils/kundaliEngine';
import { generateYearlyPrediction, toNepaliDigits } from '../utils/yearlyPhalitEngine';
import {
  WORLD_COUNTRIES,
  evaluateCountryForKundali,
  CountryAstroEvaluation,
  WorldCountryData
} from '../utils/worldCountryAstroEngine';
import { BirthDetailsForm } from './kundali/BirthDetailsForm';
import {
  Calendar,
  Sparkles,
  Plane,
  Heart,
  Briefcase,
  DollarSign,
  Globe,
  Home,
  Activity,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  UserCheck,
  Building,
  GraduationCap,
  Users,
  Layers,
  Coins,
  TrendingUp,
  Flame,
  Info,
  Compass,
  X,
  MapPin,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import { fetchUserKundalisFromCloud } from '../lib/firestoreService';
import { SubscriptionGateCard } from './subscription/SubscriptionGateCard';
import { useSubscription } from '../context/SubscriptionContext';

interface YearlyPhalitSectionProps {
  lang: Language;
  initialKundali?: KundaliResult | null;
  initialInput?: KundaliInput | null;
  onKundaliChange?: (result: KundaliResult | null, input: KundaliInput | null) => void;
}

export const YearlyPhalitSection: React.FC<YearlyPhalitSectionProps> = ({
  lang,
  initialKundali,
  initialInput,
  onKundaliChange
}) => {
  const currentRealYear = new Date().getFullYear(); // 2026
  const [targetYear, setTargetYear] = useState<number>(currentRealYear);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedBhavaNum, setSelectedBhavaNum] = useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [countryContinentFilter, setCountryContinentFilter] = useState<string>('all');
  const { isSubscribed, hasAccessToPhalit, openSubscriptionModal } = useSubscription();

  // Scroll to top smoothly when any phalit is tapped so native reads without menus covering
  useEffect(() => {
    if (selectedTopicId !== null || selectedCountryId !== null || selectedBhavaNum !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTopicId, selectedCountryId, selectedBhavaNum]);

  // Active Kundali state
  const [activeKundali, setActiveKundali] = useState<KundaliResult | null>(initialKundali || null);
  const [activeInput, setActiveInput] = useState<KundaliInput | null>(initialInput || null);
  const [savedProfiles, setSavedProfiles] = useState<Array<{ id: string; input: KundaliInput; result: KundaliResult }>>([]);
  const [showProfileSelector, setShowProfileSelector] = useState<boolean>(false);
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialKundali) {
      setActiveKundali(initialKundali);
    }
    if (initialInput) {
      setActiveInput(initialInput);
    }
  }, [initialKundali, initialInput]);

  // Sub-menu Tab Mode inside Phalit
  const [activeTabMode, setActiveTabMode] = useState<'topics' | 'foreign' | 'bhavas' | 'dasha'>('topics');

  // Load active session or saved kundalis on mount
  useEffect(() => {
    if (!activeKundali) {
      try {
        const stored = sessionStorage.getItem('active_kundali');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.result && parsed?.input) {
            setActiveKundali(parsed.result);
            setActiveInput(parsed.input);
          }
        }
      } catch (e) {
        console.warn('Session load notice', e);
      }
    }

    // Load saved list
    try {
      const local = localStorage.getItem('astrology_saved_kundalis');
      if (local) {
        setSavedProfiles(JSON.parse(local));
      }
    } catch (_) {}

    // Cloud fetch
    fetchUserKundalisFromCloud()
      .then((cloudRecs) => {
        if (cloudRecs && cloudRecs.length > 0) {
          setSavedProfiles((prev) => {
            const map = new Map();
            prev.forEach((p) => map.set(p.input.name + p.input.birthDate, p));
            cloudRecs.forEach((c) => map.set(c.input.name + c.input.birthDate, c));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, [activeKundali]);

  // Computed Yearly Prediction Result (Only when activeKundali exists)
  const prediction: YearlyPredictionResult | null = useMemo(() => {
    if (!activeKundali) return null;
    return generateYearlyPrediction(activeKundali, targetYear);
  }, [activeKundali, targetYear]);

  // Evaluated selected country for user's Kundali
  const selectedCountryEval: CountryAstroEvaluation | null = useMemo(() => {
    if (!selectedCountryId || !activeKundali) return null;
    return evaluateCountryForKundali(selectedCountryId, activeKundali, targetYear);
  }, [selectedCountryId, activeKundali, targetYear]);

  // Filtered world countries list for selection/search
  const filteredWorldCountries = useMemo(() => {
    return WORLD_COUNTRIES.filter((c) => {
      const matchesContinent = countryContinentFilter === 'all' || c.continent === countryContinentFilter;
      const q = countrySearchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.nameNe.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.regionNe.toLowerCase().includes(q) ||
        c.regionEn.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      return matchesContinent && matchesQuery;
    });
  }, [countryContinentFilter, countrySearchQuery]);

  // Handle Form Submit
  const handleCalculateNew = (input: KundaliInput) => {
    const res = calculateFullKundali(input);
    setActiveInput(input);
    setActiveKundali(res);
    setShowCustomForm(false);
    onKundaliChange?.(res, input);
    try {
      sessionStorage.setItem('active_kundali', JSON.stringify({ input, result: res }));
    } catch (_) {}
  };

  // Filter Categories
  const categories = [
    { id: 'all', labelNe: '🌟 सबै ३० विषयहरू', labelEn: '🌟 All 30 Topics' },
    { id: 'foreign', labelNe: '✈️ विदेश यात्रा र कुन देश राम्रो', labelEn: '✈️ Foreign & Best Countries' },
    { id: 'career', labelNe: '💼 करियर, जागिर र व्यवसाय', labelEn: '💼 Career & Business' },
    { id: 'marriage', labelNe: '💍 विवाह र प्रेम सम्बन्ध', labelEn: '💍 Marriage & Romance' },
    { id: 'finance', labelNe: '💰 धन, सम्पत्ति र लगानी', labelEn: '💰 Wealth & Finance' },
    { id: 'health', labelNe: '🏥 स्वास्थ्य र सन्तान सुख', labelEn: '🏥 Health & Children' },
    { id: 'dasha', labelNe: '🕉️ दशा, ग्रह र अचुक उपाय', labelEn: '🕉️ Dasha & Remedies' }
  ];

  // Filtered topics
  const filteredTopics = useMemo(() => {
    if (!prediction) return [];
    return prediction.topics.filter((t) => {
      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'foreign' && (t.id.includes('foreign') || t.id.includes('travel'))) ||
        (selectedCategory === 'career' && (t.categoryNe.includes('पेशा') || t.id.includes('career') || t.id.includes('job') || t.id.includes('business'))) ||
        (selectedCategory === 'marriage' && (t.categoryNe.includes('सम्बन्ध') || t.id.includes('marriage') || t.id.includes('love') || t.id.includes('family'))) ||
        (selectedCategory === 'finance' && (t.categoryNe.includes('आर्थिक') || t.id.includes('finance') || t.id.includes('wealth') || t.id.includes('property') || t.id.includes('invest'))) ||
        (selectedCategory === 'health' && (t.id.includes('health') || t.id.includes('children'))) ||
        (selectedCategory === 'dasha' && (t.categoryNe.includes('दशा') || t.id.includes('dasha') || t.id.includes('dosha') || t.id.includes('timing')));

      const matchQuery =
        !searchQuery.trim() ||
        t.topicNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.predictionNe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.topicEn.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [prediction, selectedCategory, searchQuery]);

  // Active selected topic for single-focus mode (null when browsing all grid)
  const activeTopic = useMemo(() => {
    if (filteredTopics.length === 0 || !selectedTopicId) return null;
    return filteredTopics.find((t) => t.id === selectedTopicId) || null;
  }, [filteredTopics, selectedTopicId]);

  const activeIndex = useMemo(() => {
    if (!activeTopic) return -1;
    return filteredTopics.findIndex((t) => t.id === activeTopic.id);
  }, [filteredTopics, activeTopic]);

  // If no Kundali has been entered/generated yet, show the birth details form screen
  if (!activeKundali || !prediction) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-amber-600 text-amber-950 font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ne' ? 'फलित (Phalit) ज्योतिषीय विश्लेषण' : 'Phalit Astrological Analysis'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
            {lang === 'ne'
              ? 'फलित हेर्न पहिले जन्म विवरण हालेर कुण्डली निर्माण गर्नुहोस्'
              : 'Enter Birth Details & Construct Kundali to View Phalit'}
          </h2>
          <p className="text-sm text-amber-300/80 max-w-2xl mx-auto font-sans leading-relaxed">
            {lang === 'ne'
              ? 'तपाईँको कुण्डलीमा बसेका ग्रहहरूको वास्तविक स्थिति, चलिरहेको महादशा, अन्तर्दशा तथा प्रत्यन्तर दशा अनुसार ३० वटा जीवन क्षेत्र, १२ भाव तथा वार्षिक भविष्यवाणी हेर्न कृपया आफ्नो जन्म विवरण प्रविष्ट गर्नुहोस्।'
              : 'Personalized readings across 30 life topics, 12 Bhavas, and active Vimshottari Mahadasha/Antardasha/Pratyantardasha will be generated strictly based on your natal chart.'}
          </p>
        </div>

        {/* Saved Profiles Quick Selector if any exist */}
        {savedProfiles.length > 0 && (
          <div className="bg-gradient-to-b from-amber-950/80 to-black/90 border border-amber-800/60 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-serif font-bold text-amber-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'वा सुरक्षित कुण्डलीहरूबाट छनौट गर्नुहोस्:' : 'Or Select from Saved Profiles:'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {savedProfiles.map((p) => (
                <button
                  key={p.id || p.input.name}
                  type="button"
                  onClick={() => {
                    setActiveKundali(p.result);
                    setActiveInput(p.input);
                    onKundaliChange?.(p.result, p.input);
                  }}
                  className="text-left p-3.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/60 rounded-xl transition-all hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div className="font-serif font-bold text-amber-100 text-sm">{p.input.name}</div>
                  <div className="text-xs text-amber-300/80 mt-1">
                    📅 {p.input.birthDate} | {p.input.birthTime}
                  </div>
                  <div className="text-[11px] text-amber-400/90 mt-0.5">
                    📍 {p.input.birthPlace}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Birth Details Form */}
        <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/70 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2 border-b border-amber-800/60 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{lang === 'ne' ? 'जन्म विवरण प्रविष्टि (Birth Details Form)' : 'Enter Native Birth Details'}</span>
          </h3>
          <BirthDetailsForm lang={lang} onSubmit={handleCalculateNew} />
        </div>
      </div>
    );
  }

  // Year quick jump choices
  const birthYear = parseInt((activeKundali.birthDate || '2000').split('-')[0], 10) || 2000;
  const quickYears = [
    currentRealYear - 1,
    currentRealYear,
    currentRealYear + 1,
    currentRealYear + 2,
    currentRealYear + 3,
    currentRealYear + 5,
    currentRealYear + 10
  ];

  // Check if user has tapped any specific topic, country, or bhava phalit
  const isTopicFocused = activeTabMode === 'topics' && activeTopic !== null && selectedTopicId !== null;
  const isCountryFocused = activeTabMode === 'foreign' && selectedCountryEval !== null && selectedCountryId !== null;
  const isBhavaFocused = activeTabMode === 'bhavas' && selectedBhavaNum !== null;
  const isAnyPhalitFocused = isTopicFocused || isCountryFocused || isBhavaFocused;

  // WHEN ANY TOPIC, COUNTRY, OR BHAVA IS TAPPED:
  // ONLY THAT PHALIT IS DISPLAYED! NO OTHER MENUS CAN COVER OR OBSCURE IT!
  if (isAnyPhalitFocused && prediction) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-5 pb-36 animate-fadeIn">
        {/* CASE A: 30 LIFE TOPIC FOCUSED PHALIT */}
        {isTopicFocused && activeTopic && (
          <div className="space-y-4">
            {/* Top Navigation Bar: Clean, focused, no other menus */}
            <div className="bg-gradient-to-r from-amber-950/95 via-stone-900 to-amber-950/95 border border-amber-600/70 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedTopicId(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-stone-950" />
                <span>{lang === 'ne' ? '← सबै विषयहरू' : '← All Topics'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeIndex <= 0}
                  onClick={() => {
                    if (activeIndex > 0) {
                      setSelectedTopicId(filteredTopics[activeIndex - 1].id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'अघिल्लो' : 'Prev'}</span>
                </button>

                <span className="text-xs text-amber-300 font-mono font-bold bg-black/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  {activeIndex + 1} / {filteredTopics.length}
                </span>

                <button
                  type="button"
                  disabled={activeIndex >= filteredTopics.length - 1}
                  onClick={() => {
                    if (activeIndex < filteredTopics.length - 1) {
                      setSelectedTopicId(filteredTopics[activeIndex + 1].id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>{lang === 'ne' ? 'अर्को' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FOCUSED PHALIT CARD: FULL, PROMINENT & UNOBSTRUCTED */}
            <div className="bg-gradient-to-b from-amber-950/90 via-black to-amber-950/95 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-800/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-amber-400 bg-amber-900/60 px-2.5 py-0.5 rounded-md border border-amber-700/60">
                      {lang === 'ne' ? activeTopic.categoryNe : activeTopic.categoryEn}
                    </span>
                    <span className="text-xs text-amber-300/80 font-mono">
                      (विषय {activeIndex + 1}/{filteredTopics.length})
                    </span>
                    <span className="text-xs text-amber-400/90 font-serif">
                      • वर्ष {targetYear} AD (वि.सं. {toNepaliDigits(prediction.yearBS)})
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-100 flex items-center gap-2 mt-1">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{lang === 'ne' ? activeTopic.topicNe : activeTopic.topicEn}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold px-3.5 py-1 rounded-full">
                      {lang === 'ne' ? activeTopic.ratingNe : activeTopic.ratingEn}
                    </span>
                    <div className="text-xs text-amber-300 font-mono font-bold mt-1">
                      {lang === 'ne' ? `शुभता: ${activeTopic.score}%` : `Score: ${activeTopic.score}%`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prediction Paragraph */}
              <div className="bg-black/60 p-4 sm:p-6 rounded-2xl border border-amber-800/50 shadow-inner">
                <span className="text-xs font-serif font-bold text-amber-400 block mb-2.5">
                  📜 {lang === 'ne' ? `वर्ष ${targetYear} (वि.सं. ${toNepaliDigits(prediction.yearBS)}) को विस्तृत फलादेश:` : `Detailed Predictions for Year ${targetYear}:`}
                </span>
                <p className="text-sm sm:text-base text-amber-100/95 leading-relaxed font-sans font-normal">
                  {lang === 'ne' ? activeTopic.predictionNe : activeTopic.predictionEn}
                </p>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-amber-950/50 rounded-2xl border border-amber-800/50 text-xs sm:text-sm">
                <div>
                  <span className="text-amber-400 font-semibold block mb-1">{lang === 'ne' ? '🌟 मुख्य कारक ग्रहहरू:' : '🌟 Significators:'}</span>
                  <span className="text-amber-200 font-serif text-sm">{lang === 'ne' ? activeTopic.rulingPlanetsNe : activeTopic.rulingPlanetsEn}</span>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold block mb-1">{lang === 'ne' ? '📅 सर्वाधिक शुभ महिनाहरू:' : '📅 Auspicious Months:'}</span>
                  <span className="text-amber-200 font-serif text-sm">{lang === 'ne' ? activeTopic.auspiciousMonthsNe : activeTopic.auspiciousMonthsEn}</span>
                </div>
              </div>

              {/* Remedies */}
              {((lang === 'ne' ? activeTopic.remediesNe : activeTopic.remediesEn) || []).length > 0 && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/70 to-black/70 rounded-2xl border border-amber-700/60 text-xs sm:text-sm space-y-2.5">
                  <span className="font-serif font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
                    <span>{lang === 'ne' ? '🌿 फलदायक वैदिक तथा ज्योतिषीय अचुक उपाय:' : '🌿 Astrological Remedies:'}</span>
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-amber-200/95 pl-1 leading-relaxed">
                    {(lang === 'ne' ? activeTopic.remediesNe : activeTopic.remediesEn).map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-amber-800/50">
                <button
                  type="button"
                  disabled={activeIndex <= 0}
                  onClick={() => {
                    if (activeIndex > 0) {
                      setSelectedTopicId(filteredTopics[activeIndex - 1].id);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{lang === 'ne' ? '← अघिल्लो फलित' : '← Previous'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeIndex >= filteredTopics.length - 1}
                  onClick={() => {
                    if (activeIndex < filteredTopics.length - 1) {
                      setSelectedTopicId(filteredTopics[activeIndex + 1].id);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{lang === 'ne' ? 'अर्को फलित →' : 'Next →'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CASE B: FOREIGN TRAVEL DESTINATION FOCUSED PHALIT */}
        {isCountryFocused && selectedCountryEval && (
          <div className="space-y-4">
            {/* Top Navigation Bar */}
            <div className="bg-gradient-to-r from-amber-950/95 via-stone-900 to-amber-950/95 border border-amber-600/70 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCountryId(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-stone-950" />
                <span>{lang === 'ne' ? '← सबै देशहरू' : '← All Countries'}</span>
              </button>
            </div>

            {/* Country Diagnostic Card */}
            <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border-2 border-amber-500/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-800/60">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{selectedCountryEval.flag}</span>
                  <div>
                    <div className="text-[10px] text-amber-400 font-semibold uppercase">
                      {selectedCountryEval.regionNe} • {selectedCountryEval.priorityBadgeNe}
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-100">
                      {selectedCountryEval.nameNe}
                    </h3>
                    <p className="text-xs text-amber-300/80">{selectedCountryEval.nameEn}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-amber-900/40 border border-amber-700/60 p-3 rounded-xl">
                  <span className="text-[10px] text-amber-400 block font-semibold uppercase">
                    कुण्डली उपयुक्तता (Suitability)
                  </span>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-amber-200">
                    {selectedCountryEval.suitabilityScore}% अनुकूल
                  </span>
                  <span className="text-xs block text-amber-300 font-medium">
                    {selectedCountryEval.gradeNe}
                  </span>
                </div>
              </div>

              {/* Score Visual Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-amber-300/80 font-medium">
                  <span>उपयुक्तता स्तर</span>
                  <span>{selectedCountryEval.suitabilityScore} / १००</span>
                </div>
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-800/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedCountryEval.suitabilityScore >= 75
                        ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                        : selectedCountryEval.suitabilityScore >= 50
                        ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${selectedCountryEval.suitabilityScore}%` }}
                  />
                </div>
              </div>

              {/* 3 Metric Diagnosis Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-amber-950/60 border border-amber-800/50 rounded-xl space-y-1">
                  <span className="text-amber-400/90 font-medium block">✈️ वैदेशिक यात्रा सम्भावना</span>
                  <span className="font-serif font-bold text-sm text-amber-100">{selectedCountryEval.travelYogaStrengthNe}</span>
                </div>
                <div className="p-3 bg-amber-950/60 border border-amber-800/50 rounded-xl space-y-1">
                  <span className="text-amber-400/90 font-medium block">🏠 स्थायी बसोबास (PR/Green Card)</span>
                  <span className="font-serif font-bold text-sm text-amber-100">{selectedCountryEval.settlementProspectsNe}</span>
                </div>
                <div className="p-3 bg-amber-950/60 border border-amber-800/50 rounded-xl space-y-1">
                  <span className="text-amber-400/90 font-medium block">📅 भिसा/प्रस्थान उत्तम महिना</span>
                  <span className="font-serif font-bold text-sm text-amber-100">{selectedCountryEval.visaSuccessTimingNe}</span>
                </div>
              </div>

              {/* Purpose and Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl space-y-1">
                  <strong className="text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    अनुकूल दिशा (Direction):
                  </strong>
                  <p className="text-amber-200">{selectedCountryEval.directionNe}</p>
                </div>

                <div className="p-3 bg-amber-950/60 border border-amber-800/40 rounded-xl space-y-1">
                  <strong className="text-amber-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    सर्वोत्तम प्रयोजन एवं क्षेत्र (Purpose):
                  </strong>
                  <p className="text-amber-200">{selectedCountryEval.favorablePurposeNe}</p>
                </div>
              </div>

              {/* Planetary Reason */}
              <div className="p-4 rounded-xl bg-amber-950/90 border border-amber-700/60 text-xs sm:text-sm text-amber-100/90 leading-relaxed space-y-1">
                <strong className="text-amber-300 flex items-center gap-1.5 text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  ज्योतिषीय गहन विश्लेषण एवं कारण:
                </strong>
                <p>{selectedCountryEval.planetaryReasonNe}</p>
              </div>

              {/* Vedic Remedy */}
              <div className="p-3.5 bg-amber-900/30 rounded-xl border border-amber-600/50 text-xs text-amber-200 flex items-start gap-2.5">
                <span className="text-base">🌿</span>
                <div>
                  <strong className="text-amber-300 block mb-0.5">
                    सफलता एवं शान्ति उपाय (Vedic Remedy):
                  </strong>
                  <p>{selectedCountryEval.remedyNe}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: 12 BHAVAS FOCUSED PHALIT */}
        {isBhavaFocused && (() => {
          const activeBhava = prediction.bhavas.find((b) => b.houseNum === selectedBhavaNum) || prediction.bhavas[0];
          const currentIdx = prediction.bhavas.findIndex((b) => b.houseNum === activeBhava.houseNum);

          return (
            <div className="space-y-4">
              {/* Top Navigation Bar */}
              <div className="bg-gradient-to-r from-amber-950/95 via-stone-900 to-amber-950/95 border border-amber-600/70 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBhavaNum(null)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'ne' ? '← सबै १२ भावहरू' : '← All 12 Bhavas'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIdx <= 0}
                    onClick={() => {
                      if (currentIdx > 0) {
                        setSelectedBhavaNum(prediction.bhavas[currentIdx - 1].houseNum);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'अघिल्लो भाव' : 'Prev'}</span>
                  </button>

                  <span className="text-xs text-amber-300 font-mono font-bold bg-black/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                    भाव #{activeBhava.houseNum}
                  </span>

                  <button
                    type="button"
                    disabled={currentIdx >= prediction.bhavas.length - 1}
                    onClick={() => {
                      if (currentIdx < prediction.bhavas.length - 1) {
                        setSelectedBhavaNum(prediction.bhavas[currentIdx + 1].houseNum);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{lang === 'ne' ? 'अर्को भाव' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Focused Bhava Card */}
              <div className="bg-gradient-to-b from-amber-950/80 via-black to-amber-950/90 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-800/60">
                  <div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-900/60 px-2.5 py-0.5 rounded-md border border-amber-700/60 font-mono">
                      भाव #{activeBhava.houseNum} • {activeBhava.signNe} ({activeBhava.signLordNe})
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-100 mt-1">
                      {activeBhava.titleNe}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/20 text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-500/40 font-bold font-mono">
                      शुभता: {activeBhava.statusScore}%
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-amber-300/90 font-serif italic bg-amber-900/20 p-3 rounded-xl border border-amber-800/40">
                  🎯 <strong>मुख्य प्रतिनिधित्व विषय:</strong> {activeBhava.coreThemesNe}
                </div>

                <div className="bg-black/50 p-4 sm:p-5 rounded-2xl border border-amber-800/40">
                  <span className="text-xs font-serif font-bold text-amber-400 block mb-2">
                    📜 वर्ष {targetYear} को भाव फलादेश:
                  </span>
                  <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-sans">
                    {activeBhava.analysisNe}
                  </p>
                </div>

                <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-800/50 space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-300 block">
                    ✨ यस भावबाट वर्ष {targetYear} मा मुख्य अपेक्षित उपलब्धिहरू:
                  </span>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-amber-200/90 space-y-1">
                    {activeBhava.keyEventsNe.map((ev, eIdx) => (
                      <li key={eIdx}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Navigation for Bhava */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-amber-800/50">
                  <button
                    type="button"
                    disabled={currentIdx <= 0}
                    onClick={() => {
                      if (currentIdx > 0) {
                        setSelectedBhavaNum(prediction.bhavas[currentIdx - 1].houseNum);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === 'ne' ? '← अघिल्लो भाव' : '← Previous House'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentIdx >= prediction.bhavas.length - 1}
                    onClick={() => {
                      if (currentIdx < prediction.bhavas.length - 1) {
                        setSelectedBhavaNum(prediction.bhavas[currentIdx + 1].houseNum);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{lang === 'ne' ? 'अर्को भाव →' : 'Next House →'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-amber-800/60 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-600 text-amber-950 font-bold text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full">
                {lang === 'ne' ? '✨ फलित तथा दशा–भाव विश्लेषण' : '✨ Phalit & Dasha-Bhava Analysis'}
              </span>
              <span className="bg-amber-900/60 text-amber-300 font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ne' ? '१२ भाव • दशा • विदेश देश विश्लेषण' : '12 Houses • Dasha • Foreign Countries'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2.5">
              <span>{activeKundali.name}</span>
              <span className="text-xs bg-amber-900/80 border border-amber-600/50 text-amber-200 px-2.5 py-1 rounded-lg font-sans font-normal">
                {lang === 'ne' ? `लग्न: ${activeKundali.lagna} | राशी: ${activeKundali.rashi}` : `Lagna: ${activeKundali.lagnaEnglish || activeKundali.lagna} | Moon: ${activeKundali.rashiEnglish || activeKundali.rashi}`}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-300/90 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans">
              <span>📅 {activeKundali.birthDate} ({activeKundali.birthTime})</span>
              <span>📍 {activeKundali.birthPlace}</span>
              <span>🌟 {lang === 'ne' ? prediction.dashaInfo.periodSummaryNe : prediction.dashaInfo.periodSummaryEn}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => setShowProfileSelector(!showProfileSelector)}
              className="bg-amber-900/50 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ne' ? 'कुण्डली बदल्नुहोस्' : 'Switch Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="bg-amber-900/50 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ne' ? 'नयाँ विवरण' : 'New Chart'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-serif font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Printer className="w-4 h-4 text-amber-950" />
              <span>{lang === 'ne' ? 'फलित प्रिन्ट' : 'Print Phalit'}</span>
            </button>
          </div>
        </div>

        {/* Profile Selector Dropdown */}
        {showProfileSelector && (
          <div className="mt-4 p-4 bg-black/90 border border-amber-600/60 rounded-xl space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {lang === 'ne' ? 'सुरक्षित कुण्डलीहरूबाट छनौट गर्नुहोस्:' : 'Select from Saved Profiles:'}
            </h4>
            {savedProfiles.length === 0 ? (
              <p className="text-xs text-amber-400/70">
                {lang === 'ne' ? 'कुनै सुरक्षित कुण्डली छैन।' : 'No saved profiles found.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {savedProfiles.map((p) => (
                  <button
                    key={p.id || p.input.name}
                    type="button"
                    onClick={() => {
                      setActiveKundali(p.result);
                      setActiveInput(p.input);
                      setShowProfileSelector(false);
                      onKundaliChange?.(p.result, p.input);
                    }}
                    className="text-left p-2.5 bg-amber-950/60 hover:bg-amber-800/50 border border-amber-800/60 rounded-lg transition-all text-xs space-y-0.5"
                  >
                    <div className="font-serif font-bold text-amber-100">{p.input.name}</div>
                    <div className="text-[11px] text-amber-300/80">{p.input.birthDate} | {p.input.birthPlace}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Birth Form Drawer */}
        {showCustomForm && (
          <div className="mt-4 p-4 bg-black/95 border border-amber-600/60 rounded-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-800/50">
              <h4 className="text-sm font-serif font-bold text-amber-200">
                {lang === 'ne' ? 'नयाँ व्यक्तिको जन्म विवरण भर्नुहोस्' : 'Enter New Birth Details'}
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-xs text-amber-400 hover:text-amber-100 underline"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
            <BirthDetailsForm lang={lang} onSubmit={handleCalculateNew} />
          </div>
        )}

        {/* INTERACTIVE YEAR SELECTION CONTROL BAR */}
        <div className="pt-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-amber-950/70 p-3.5 sm:p-4 rounded-xl border border-amber-800/50">
            {/* Year Stepper */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <button
                type="button"
                onClick={() => setTargetYear((prev) => Math.max(birthYear, prev - 1))}
                className="p-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/60 transition-all hover:scale-105"
                title={lang === 'ne' ? 'अघिल्लो वर्ष' : 'Previous Year'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center px-4 py-1.5 bg-black/80 rounded-xl border border-amber-600/60 shadow-inner">
                <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  {lang === 'ne' ? 'विश्लेषण वर्ष (Prediction Year)' : 'Target Prediction Year'}
                </div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-amber-200 flex items-center justify-center gap-2">
                  <span>{targetYear} AD</span>
                  <span className="text-sm text-amber-400">
                    / {lang === 'ne' ? `वि.सं. ${toNepaliDigits(prediction.yearBS)}` : `BS ${prediction.yearBS}`}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300 font-sans font-medium">
                  {lang === 'ne' ? `जातकको उमेर: ${prediction.ageTextNe}` : `Native Age: ${prediction.ageTextEn}`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTargetYear((prev) => prev + 1)}
                className="p-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/60 transition-all hover:scale-105"
                title={lang === 'ne' ? 'पछिल्लो वर्ष' : 'Next Year'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
              <span className="text-xs text-amber-400/80 mr-1 font-sans">
                {lang === 'ne' ? 'द्रुत चयन:' : 'Quick Years:'}
              </span>
              {quickYears.map((yr) => {
                const isSelected = yr === targetYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTargetYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-md font-bold scale-105'
                        : 'bg-amber-900/40 text-amber-300 border-amber-800/60 hover:bg-amber-800/60'
                    }`}
                  >
                    {yr} {yr === currentRealYear ? (lang === 'ne' ? '(चालु)' : '(Current)') : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age & Year Timeline Scrubber Slider */}
          <div className="px-2 space-y-1.5">
            <div className="flex justify-between text-[11px] text-amber-400/80">
              <span>{lang === 'ne' ? `जन्म वर्ष (${birthYear} AD / ० वर्ष)` : `Birth Year (${birthYear} AD / 0 yrs)`}</span>
              <span className="font-bold text-amber-300">
                {lang === 'ne' ? `वर्तमान चयन: ${targetYear} AD (उमेर ${prediction.ageYears} वर्ष)` : `Selected: ${targetYear} AD (Age ${prediction.ageYears} yrs)`}
              </span>
              <span>{lang === 'ne' ? `दीर्घायु (${birthYear + 85} AD / ८५ वर्ष)` : `Longevity (${birthYear + 85} AD / 85 yrs)`}</span>
            </div>
            <input
              type="range"
              min={birthYear}
              max={birthYear + 85}
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-amber-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-amber-700/50"
            />
          </div>
        </div>
      </div>

      {!hasAccessToPhalit ? (
        <SubscriptionGateCard
          featureName={lang === 'ne' ? 'वार्षिक १२ भाव फलित तथा ३० क्षेत्रको सटिक भविष्यवाणी' : 'Annual 12 Bhavas Phalit & 30 Life Areas Forecast'}
          featureDescription={
            lang === 'ne'
              ? 'वर्षको ३० जीवन क्षेत्र (भिसा, पीआर, वैवाहिक जीवन, धन–सम्पत्ति, जागिर, स्वास्थ्य), विदेश यात्रा देश अनुकूलता, १२ भाव फलित तथा वैदिक उपाय अनलक गर्न आफ्नो अनुकूल योजना छनौट गर्नुहोस्।'
              : 'Unlock detailed annual predictions for 30 life areas (Visa, PR, marriage, career, wealth), foreign country compatibility scores, 12 bhava analysis, and astrological remedies.'
          }
        />
      ) : (
        <>
          {/* FOLDER NAVIGATION TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pb-2 border-b border-amber-800/60">
            {[
              {
                id: 'topics' as const,
                badge: '१',
                titleNe: '३० क्षेत्रको सटिक फलित',
                titleEn: '30 Life Areas Phalit',
                descNe: 'जागिर, धन, विवाह, स्वास्थ्य...',
                descEn: 'Career, wealth, marriage...',
                icon: Sparkles
              },
              {
                id: 'foreign' as const,
                badge: '२',
                titleNe: 'विदेश यात्रा र देश अनुकूलता',
                titleEn: 'Foreign Travel & Countries',
                descNe: 'विश्वका देशहरूको विश्लेषण',
                descEn: 'World country astro ratings',
                icon: Plane
              },
              {
                id: 'bhavas' as const,
                badge: '३',
                titleNe: '१२ भाव वार्षिक विश्लेषण',
                titleEn: '12 Bhavas Analysis',
                descNe: '१ देखि १२ भावको फलादेश',
                descEn: '1st to 12th houses forecast',
                icon: Layers
              },
              {
                id: 'dasha' as const,
                badge: '४',
                titleNe: 'दशा गोचर र अचुक उपाय',
                titleEn: 'Dasha & Remedies',
                descNe: 'महादशा, गोचर र पञ्चमहाउपाय',
                descEn: 'Dasha, transit and remedies',
                icon: Flame
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabMode(tab.id)}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between gap-2 shadow-md cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-300 ring-2 ring-amber-300/70 shadow-amber-500/30 scale-[1.02]'
                      : 'bg-stone-900/90 text-amber-200/90 border-amber-800/60 hover:bg-amber-950/80 hover:border-amber-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-amber-900/40 text-amber-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-950 animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-400/80 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-serif font-bold leading-tight ${isActive ? 'text-stone-950' : 'text-amber-100'}`}>
                      {lang === 'ne' ? tab.titleNe : tab.titleEn}
                    </h4>
                    <span className={`text-[10px] block mt-0.5 line-clamp-1 ${isActive ? 'text-stone-900/80' : 'text-amber-400/70'}`}>
                      {lang === 'ne' ? tab.descNe : tab.descEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

      {/* TAB 1: 30 COMPREHENSIVE LIFE TOPICS */}
      {activeTabMode === 'topics' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-amber-950/60 p-3 rounded-xl border border-amber-800/50">
            {/* Category Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-amber-950 font-bold shadow'
                      : 'bg-amber-900/30 text-amber-300 hover:bg-amber-800/50 border border-amber-800/40'
                  }`}
                >
                  {lang === 'ne' ? cat.labelNe : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-400" />
              <input
                type="text"
                placeholder={lang === 'ne' ? 'विषय खोज्नुहोस् (उदा. भिसा, विवाह)...' : 'Search topic (e.g. visa, marriage)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-amber-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-500/60 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className="p-3 rounded-2xl text-left border border-amber-800/60 bg-stone-900/90 hover:border-amber-400 hover:bg-amber-950/80 transition-all flex flex-col justify-between gap-2 cursor-pointer shadow hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-semibold text-amber-400/80 line-clamp-1">
                      {lang === 'ne' ? topic.categoryNe : topic.categoryEn}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                      {topic.score}%
                    </span>
                  </div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-amber-100 group-hover:text-amber-300 leading-snug line-clamp-2">
                    {lang === 'ne' ? topic.topicNe : topic.topicEn}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-amber-400/70 pt-1 border-t border-amber-900/40">
                    <span className="line-clamp-1">{lang === 'ne' ? topic.ratingNe : topic.ratingEn}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-amber-400" />
                  </div>
                </button>
              ))}
            </div>
        </div>
      )}

      {/* TAB 2: SPECIAL FOREIGN TRAVEL & DESTINATION RECOMMENDATION */}
      {activeTabMode === 'foreign' && (
        <div className="space-y-6">
          {/* COUNTRY SEARCH & SELECTION HUB */}
          <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border-2 border-amber-600/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-800/60">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>विश्वका देशहरूको ज्योतिषीय छनोट एवं अनुकूलता विश्लेषण</span>
              </div>

              {selectedCountryEval && (
                <button
                  type="button"
                  onClick={() => setSelectedCountryId(null)}
                  className="self-start sm:self-auto text-xs bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border border-amber-700/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>अर्को देश छनोट गर्नुहोस्</span>
                </button>
              )}
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="देशको नाम खोज्नुहोस् (उदा: UAE, कतार, क्यानडा, अष्ट्रेलिया, जापान, जर्मनी, अमेरिका, पोल्याण्ड...)"
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-black/70 border border-amber-600/60 rounded-xl text-amber-100 placeholder:text-amber-500/60 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              {countrySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCountrySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Continent / Region Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                { id: 'all', label: 'सबै देश (All)' },
                { id: 'gulf', label: '🇦🇪 खाडी/मध्यपूर्व (Gulf)' },
                { id: 'europe', label: '🇪🇺 युरोप (Europe)' },
                { id: 'north_america', label: '🇺🇸 उत्तर अमेरिका' },
                { id: 'asia', label: '🇯🇵 एसिया (Asia)' },
                { id: 'oceania', label: '🇦🇺 ओशिनिया' },
                { id: 'africa', label: '🇿🇦 अफ्रिका' },
                { id: 'south_america', label: '🇧🇷 दक्षिण अमेरिका' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCountryContinentFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                    countryContinentFilter === c.id
                      ? 'bg-amber-500 text-amber-950 border-amber-400 font-bold shadow'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Quick Top Recommendations Pills */}
            <div className="pt-2 border-t border-amber-900/40">
              <span className="text-[11px] text-amber-400/90 font-medium block mb-1.5">
                🌟 कुण्डली अनुसार उत्कृष्ट सिफारिस (क्लिक गरी हेर्नुहोस्):
              </span>
              <div className="flex flex-wrap gap-2">
                {prediction.foreignTravelAnalysis.recommendedDestinations.map((dest, idx) => {
                  const countryMatch = WORLD_COUNTRIES.find(
                    (wc) =>
                      wc.nameEn.toLowerCase().includes(dest.countryEn.toLowerCase()) ||
                      dest.countryEn.toLowerCase().includes(wc.nameEn.toLowerCase())
                  );
                  const targetId = countryMatch?.id || 'uae';
                  const isSelected = selectedCountryId === targetId;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCountryId(targetId);
                        setCountrySearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                        isSelected
                          ? 'bg-amber-500 text-amber-950 font-bold border-amber-300 scale-105'
                          : 'bg-amber-900/40 text-amber-200 border-amber-700/60 hover:border-amber-400 hover:bg-amber-900/70'
                      }`}
                    >
                      <span>{countryMatch?.flag || '🌐'}</span>
                      <span className="font-serif font-bold">{dest.countryNe}</span>
                      <span className="text-[10px] opacity-80">
                        ({dest.suitabilityScore}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* INTERACTIVE COUNTRY SELECTOR GRID (ALWAYS VISIBLE - NO BACK NEEDED) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span>{lang === 'ne' ? 'देश छनोट गर्नुहोस् (क्लिक गरी फलादेश हेर्नुहोस्):' : 'Select Country from Grid:'}</span>
              </h3>
              <span className="text-xs text-amber-400/80">
                {lang === 'ne' ? `कुल ${filteredWorldCountries.length} देशहरू` : `Total ${filteredWorldCountries.length} Countries`}
              </span>
            </div>

            {filteredWorldCountries.length === 0 ? (
              <div className="p-6 text-center bg-amber-950/40 border border-amber-800/40 rounded-2xl space-y-2">
                <p className="text-amber-300 font-medium text-sm">
                  {lang === 'ne' ? 'तपाईँले खोज्नुभएको नामको देश फेला परेन।' : 'No matching country found.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCountrySearchQuery('');
                    setCountryContinentFilter('all');
                  }}
                  className="text-xs text-amber-400 underline hover:text-amber-200"
                >
                  {lang === 'ne' ? 'सबै देशहरूको सूची हेर्नुहोस्' : 'View all countries'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredWorldCountries.map((c) => {
                  const isSelected = selectedCountryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCountryId(c.id);
                        setCountrySearchQuery('');
                      }}
                      className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between gap-1.5 cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-200 ring-2 ring-amber-300 scale-[1.02]'
                          : 'bg-stone-900/90 text-amber-200 border-amber-800/60 hover:border-amber-400 hover:bg-amber-950/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl shrink-0">{c.flag}</span>
                        <div className="overflow-hidden">
                          <h4 className={`font-serif font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-stone-950' : 'text-amber-100'}`}>
                            {lang === 'ne' ? c.nameNe : c.nameEn}
                          </h4>
                          <span className={`text-[9px] block truncate ${isSelected ? 'text-stone-900/80' : 'text-amber-400/70'}`}>
                            {lang === 'ne' ? c.regionNe : c.regionEn}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 12 BHAVAS COMPREHENSIVE YEARLY ANALYSIS */}
      {activeTabMode === 'bhavas' && (
        <div className="space-y-4">
          {/* 12 Bhavas Interactive Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {prediction.bhavas.map((bhava) => {
              const isSelected = selectedBhavaNum === bhava.houseNum;
              return (
                <button
                  key={bhava.houseNum}
                  type="button"
                  onClick={() => setSelectedBhavaNum(bhava.houseNum)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 border-amber-200 ring-2 ring-amber-300 shadow-lg scale-[1.02]'
                      : 'bg-stone-900/90 text-amber-200 border-amber-800/60 hover:border-amber-500/70 hover:bg-amber-950/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-stone-900' : 'text-amber-400'}`}>
                      भाव #{bhava.houseNum}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-stone-950/20 text-stone-950' : 'bg-amber-500/20 text-amber-300'}`}>
                      {bhava.statusScore}%
                    </span>
                  </div>
                  <div className={`font-serif font-bold text-xs sm:text-sm line-clamp-1 ${isSelected ? 'text-stone-950' : 'text-amber-100'}`}>
                    {bhava.titleNe}
                  </div>
                  <div className={`text-[10px] line-clamp-1 ${isSelected ? 'text-stone-900/80' : 'text-amber-400/70'}`}>
                    {bhava.signNe} ({bhava.signLordNe})
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DASHA, TRANSITS & REMEDIES */}
      {activeTabMode === 'dasha' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-950/80 to-black p-5 sm:p-6 rounded-2xl border border-amber-600/70 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/60 pb-3">
              <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>वर्ष {targetYear} को दशा, अन्तर्दशा, प्रत्यन्तर दशा एवं कुण्डली ग्रह स्थिति</span>
              </h3>
              <span className="bg-amber-900/80 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-700/60 font-mono">
                {prediction.dashaInfo.periodSummaryNe}
              </span>
            </div>

            {/* Annual Rating & Peak Auspicious Months in Tab 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-950/70 border border-amber-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ne' ? 'वार्षिक शुभता दर' : 'Annual Score'}</span>
                  </span>
                  <span className="font-bold text-amber-200">{prediction.overallScore}%</span>
                </div>
                <div className="font-serif font-bold text-base text-amber-100">
                  {lang === 'ne' ? prediction.overallRatingNe : prediction.overallRatingEn}
                </div>
                <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-amber-800/60">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prediction.overallScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-950/70 border border-amber-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'ne' ? 'प्रमुख शुभ महिनाहरू' : 'Peak Auspicious Months'}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(lang === 'ne' ? prediction.keyAuspiciousMonthsNe : prediction.keyAuspiciousMonthsEn).map((m, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-900/60 text-amber-200 border border-amber-700/60 px-2 py-0.5 rounded-md text-xs font-semibold"
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dasha Hierarchy Cards (Maha, Antar, Pratyantar) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Mahadasha Card */}
              <div className="p-4 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    १. महादशा (Mahadasha)
                  </span>
                  <span className="bg-amber-500 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px]">
                    {prediction.dashaInfo.dashaLordDignityNe}
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-amber-100">
                  {prediction.dashaInfo.mahadashaNe} महादशा
                </div>
                <div className="space-y-1 text-amber-200/90 font-sans">
                  <div>📍 <strong>कुण्डलीमा स्थान: </strong> भाव {prediction.dashaInfo.mahadashaLordHouse}</div>
                  <div>🪐 <strong>ग्रह प्रभाव: </strong> प्रमुख जीवन दिशा, दीर्घकालीन प्रभाव एवं जीवनशैली निर्धारण।</div>
                </div>
              </div>

              {/* Antardasha Card */}
              <div className="p-4 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    २. अन्तर्दशा (Antardasha)
                  </span>
                  <span className="bg-amber-800/80 text-amber-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                    सक्रिय उप-अवधि
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-amber-100">
                  {prediction.dashaInfo.antardashaNe} अन्तर्दशा
                </div>
                <div className="space-y-1 text-amber-200/90 font-sans">
                  <div>📍 <strong>कुण्डलीमा स्थान: </strong> भाव {prediction.dashaInfo.antardashaLordHouse}</div>
                  <div>⚡ <strong>ग्रह प्रभाव: </strong> चालू वर्षका प्रमुख कार्य, आम्दानी, पेशागत गतिशीलता र पारिवारिक फल।</div>
                </div>
              </div>

              {/* Pratyantardasha Card */}
              <div className="p-4 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    ३. प्रत्यन्तर दशा (Pratyantardasha)
                  </span>
                  <span className="bg-amber-800/80 text-amber-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                    सूक्ष्म काल
                  </span>
                </div>
                <div className="font-serif font-bold text-base text-amber-100">
                  {prediction.dashaInfo.pratyantardashaNe} प्रत्यन्तर दशा
                </div>
                <div className="space-y-1 text-amber-200/90 font-sans">
                  <div>📍 <strong>कुण्डलीमा स्थान: </strong> भाव {prediction.dashaInfo.pratyantardashaLordHouse}</div>
                  <div>🎯 <strong>ग्रह प्रभाव: </strong> दैनिक तथा मासिक महत्वपूर्ण घटना, मानसिक स्थिति र द्रुत परिणाम।</div>
                </div>
              </div>
            </div>

            {/* Mantras & Remedies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  दशा स्वामी {prediction.dashaInfo.mahadashaNe} को वैदिक बीज मन्त्र:
                </h4>
                <p className="text-amber-200/90 leading-relaxed">
                  दशाको शुभ फल वृद्धिका लागि नित्य बिहान १०८ पटक जप गर्नुहोस्:
                </p>
                <div className="text-xs text-amber-300 font-mono bg-black/70 p-2.5 rounded-lg border border-amber-700/50">
                  ॐ ह्रां ह्रीं ह्रौं सः {prediction.dashaInfo.mahadashaNe === 'सूर्य' ? 'सूर्याय' : prediction.dashaInfo.mahadashaNe === 'चन्द्रमा' ? 'चन्द्रमसे' : prediction.dashaInfo.mahadashaNe === 'मंगल' ? 'भौमाय' : prediction.dashaInfo.mahadashaNe === 'बुध' ? 'बुधाय' : prediction.dashaInfo.mahadashaNe === 'बृहस्पति' ? 'गुरवे' : prediction.dashaInfo.mahadashaNe === 'शुक्र' ? 'शुक्राय' : prediction.dashaInfo.mahadashaNe === 'शनि' ? 'शनैश्चराय' : prediction.dashaInfo.mahadashaNe === 'राहु' ? 'राहवे' : 'केतवे'} नमः
                </div>
              </div>

              <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  अन्तर्दशा स्वामी {prediction.dashaInfo.antardashaNe} को जप तथा शान्ति:
                </h4>
                <p className="text-amber-200/90 leading-relaxed">
                  अन्तर्दशा कालमा कार्यसिद्धि र विघ्न निवारणका लागि:
                </p>
                <div className="text-xs text-amber-300 font-mono bg-black/70 p-2.5 rounded-lg border border-amber-700/50">
                  ॐ {prediction.dashaInfo.antardashaNe === 'सूर्य' ? 'घृणिः सूर्याय' : prediction.dashaInfo.antardashaNe === 'चन्द्रमा' ? 'सों सोमाय' : prediction.dashaInfo.antardashaNe === 'मंगल' ? 'क्रौं भौमाय' : prediction.dashaInfo.antardashaNe === 'बुध' ? 'बुं बुधाय' : prediction.dashaInfo.antardashaNe === 'बृहस्पति' ? 'बृं बृहस्पतये' : prediction.dashaInfo.antardashaNe === 'शुक्र' ? 'शुं शुक्राय' : prediction.dashaInfo.antardashaNe === 'शनि' ? 'शं शनैश्चराय' : prediction.dashaInfo.antardashaNe === 'राहु' ? 'रां राहवे' : 'कें केतवे'} नमः
                </div>
              </div>
            </div>

            {/* General Yearly Remedies */}
            <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-2">
              <h4 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>वर्षभरिका अचुक वैदिक कल्याणकारी उपायहरू:</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-200/90 font-sans">
                {prediction.yearlyRemediesNe.map((rem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{rem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
