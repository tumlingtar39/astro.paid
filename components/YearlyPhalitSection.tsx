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
  const { isSubscribed, hasAccessToPhalit, openSubscriptionModal } = useSubscription();

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

  // AI Custom Question state for this year
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [activeTabMode, setActiveTabMode] = useState<'topics' | 'foreign' | 'bhavas' | 'dasha' | 'ai'>('topics');

  // Interactive World Country Search and Selection State
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState<string>('');
  const [countryContinentFilter, setCountryContinentFilter] = useState<string>('all');

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

  // Handle AI Consultation Submit
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !activeKundali || !prediction) return;

    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const response = await fetch('/api/yearly-phalit-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeKundali.name,
          birthDate: activeKundali.birthDate,
          birthPlace: activeKundali.birthPlace,
          targetYear: prediction.yearAD,
          targetYearBS: prediction.yearBS,
          question: customQuestion,
          dashaSummary: prediction.dashaInfo.periodSummaryNe,
          lagna: activeKundali.lagna,
          rashi: activeKundali.rashi,
          language: lang
        })
      });

      const data = await response.json();
      if (data.reply) {
        setAiAnswer(data.reply);
      } else {
        setAiAnswer(
          lang === 'ne'
            ? 'ज्योतिषीय विश्लेषण प्राप्त भयो। वर्ष ' + prediction.yearAD + ' मा ग्रहगोचर तपाईँको अनुकूल रहनेछ।'
            : `Astrological consultation completed. Year ${prediction.yearAD} aligns favorably.`
        );
      }
    } catch (err) {
      console.error(err);
      setAiAnswer(
        lang === 'ne'
          ? 'परामर्श सेवामा केही ढिलाइ भयो। कृपया पुनः प्रश्न सोध्नुहोस्।'
          : 'Consultation service delayed. Please try again.'
      );
    } finally {
      setIsAiLoading(false);
    }
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
                <span>१२ भाव • दशा • विदेश देश विश्लेषण</span>
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
              <span>🌟 {prediction.dashaInfo.periodSummaryNe}</span>
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
                title="अघिल्लो वर्ष (Previous Year)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center px-4 py-1.5 bg-black/80 rounded-xl border border-amber-600/60 shadow-inner">
                <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  {lang === 'ne' ? 'विश्लेषण वर्ष (Prediction Year)' : 'Target Prediction Year'}
                </div>
                <div className="font-serif font-bold text-xl sm:text-2xl text-amber-200 flex items-center justify-center gap-2">
                  <span>{targetYear} AD</span>
                  <span className="text-sm text-amber-400">/ वि.सं. {toNepaliDigits(prediction.yearBS)}</span>
                </div>
                <div className="text-[11px] text-amber-300 font-sans font-medium">
                  {lang === 'ne' ? `जातकको उमेर: ${prediction.ageTextNe}` : `Native Age: ${prediction.ageTextEn}`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTargetYear((prev) => prev + 1)}
                className="p-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/60 transition-all hover:scale-105"
                title="पछिल्लो वर्ष (Next Year)"
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
              <span>जन्म वर्ष ({birthYear} AD / ० वर्ष)</span>
              <span className="font-bold text-amber-300">
                वर्तमान चयन: {targetYear} AD (उमेर {prediction.ageYears} वर्ष)
              </span>
              <span>दीर्घायु ({birthYear + 85} AD / ८५ वर्ष)</span>
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

      {/* ACTIVE DASHA & ANNUAL HIGHLIGHT SUMMARY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Dasha Box */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'सक्रिय महादशा एवं अन्तर्दशा' : 'Active Dasha & Antardasha'}</span>
            </span>
            <span className="bg-amber-800/50 text-amber-200 px-2 py-0.5 rounded text-[10px]">
              {prediction.dashaInfo.dashaLordDignityNe}
            </span>
          </div>
          <div className="font-serif font-bold text-lg text-amber-100">
            {prediction.dashaInfo.mahadashaNe} महादशा
          </div>
          <p className="text-xs text-amber-300/90 font-sans">
            👉 {prediction.dashaInfo.antardashaNe} अन्तर्दशा र {prediction.dashaInfo.pratyantardashaNe} प्रत्यन्तर
          </p>
          <div className="text-[11px] text-amber-400/80 pt-1 border-t border-amber-800/40">
            {prediction.dashaInfo.mahadashaNe} कुण्डलीको {prediction.dashaInfo.mahadashaLordHouse} औँ भावमा अवस्थित छ।
          </div>
        </div>

        {/* Overall Rating & Score Box */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'वार्षिक शुभता दर (Year Score)' : 'Annual Auspicious Score'}</span>
            </span>
            <span className="text-sm font-bold text-amber-200">{prediction.overallScore}%</span>
          </div>
          <div className="font-serif font-bold text-lg text-amber-100">
            {prediction.overallRatingNe}
          </div>
          <div className="w-full bg-amber-950 rounded-full h-2 overflow-hidden border border-amber-800/60">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${prediction.overallScore}%` }}
            />
          </div>
          <div className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
            भाग्य र कर्मक्षेत्रमा {prediction.overallScore >= 75 ? 'तीव्र प्रगति' : 'धैर्य एवं सतर्कता'} आवश्यक।
          </div>
        </div>

        {/* Auspicious Months Box */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'प्रमुख शुभ महिनाहरू' : 'Peak Auspicious Months'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {prediction.keyAuspiciousMonthsNe.map((m, idx) => (
              <span
                key={idx}
                className="bg-amber-900/60 text-amber-200 border border-amber-700/60 px-2 py-0.5 rounded-md text-xs font-semibold"
              >
                ✓ {m}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-amber-400/80 pt-1 border-t border-amber-800/40">
            नयाँ काम थाल्न, लगानी, विवाह र भिसा आवेदनका लागि सर्वोत्तम समय।
          </p>
        </div>
      </div>

      {/* OVERALL EXECUTIVE ANNUAL FORECAST SUMMARY */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border border-amber-600/60 rounded-xl shadow-xl space-y-2">
        <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'ne'
              ? `वर्ष ${targetYear} (वि.सं. ${toNepaliDigits(prediction.yearBS)}) को समग्र ज्योतिषीय सारांश:`
              : `Annual Astrological Forecast for Year ${targetYear} (BS ${prediction.yearBS}):`}
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
          {lang === 'ne' ? prediction.overallSummaryNe : prediction.overallSummaryEn}
        </p>
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
          {/* NAVIGATION SUB-TABS: TOPICS | FOREIGN COUNTRIES | 12 BHAVAS | DASHA REMEDIES | ASK AI */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-800/60 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTabMode('topics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTabMode === 'topics'
              ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-lg scale-105'
              : 'bg-amber-950/70 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'ne' ? '१. ३० क्षेत्रको सटिक फलित' : '1. 30 Life Areas Phalit'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('foreign')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTabMode === 'foreign'
              ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-lg scale-105'
              : 'bg-amber-950/70 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>{lang === 'ne' ? '२. विदेश यात्रा र कुन देश राम्रो' : '2. Foreign & Best Countries'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('bhavas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTabMode === 'bhavas'
              ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-lg scale-105'
              : 'bg-amber-950/70 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'ne' ? '३. १२ भाव वार्षिक विश्लेषण' : '3. 12 Bhavas Analysis'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('dasha')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTabMode === 'dasha'
              ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-lg scale-105'
              : 'bg-amber-950/70 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{lang === 'ne' ? '४. दशा गोचर र अचुक उपाय' : '4. Dasha & Remedies'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('ai')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTabMode === 'ai'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-200 shadow-lg scale-105 font-bold'
              : 'bg-amber-900/50 text-amber-300 border-amber-700 hover:bg-amber-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{lang === 'ne' ? '५. पण्डितजीसँग व्यक्तिगत प्रश्न' : '5. Ask Astrologer AI'}</span>
        </button>
      </div>

      {/* TAB 1: 30 COMPREHENSIVE LIFE TOPICS */}
      {activeTabMode === 'topics' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-amber-950/60 p-3 rounded-xl border border-amber-800/50">
            {/* Category Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
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
                placeholder={lang === 'ne' ? 'विषय खोज्नुहोस् (उदा. भिसा, विवाह)...' : 'Search topic...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-amber-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-500/60 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic, idx) => (
              <div
                key={topic.id}
                className="bg-gradient-to-b from-amber-950/70 to-black/90 border border-amber-800/60 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-xl transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-amber-800/50">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-amber-400/80 uppercase font-semibold">
                      {topic.categoryNe}
                    </div>
                    <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
                      <span>{topic.topicNe}</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-600/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {topic.ratingNe}
                    </span>
                    <div className="text-[10px] text-amber-400/70 font-mono mt-0.5">
                      शुभता: {topic.score}%
                    </div>
                  </div>
                </div>

                {/* Prediction Paragraph */}
                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans">
                  {topic.predictionNe}
                </p>

                {/* Meta details footer */}
                <div className="pt-2 border-t border-amber-800/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400 font-semibold">🌟 कारक ग्रह: </span>
                    <span className="text-amber-200">{topic.rulingPlanetsNe}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 font-semibold">📅 शुभ महिना: </span>
                    <span className="text-amber-200">{topic.auspiciousMonthsNe}</span>
                  </div>
                </div>

                {/* Remedial Advice */}
                {topic.remediesNe && topic.remediesNe.length > 0 && (
                  <div className="p-2.5 bg-amber-900/20 rounded-lg border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
                    <span className="font-bold text-amber-200 block">🌿 फलदायक वैदिक उपाय:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-300/90">
                      {topic.remediesNe.map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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

            {/* Quick Helper Text */}
            <p className="text-xs text-amber-200/80">
              💡 विश्वको कुनै पनि देश चुज गर्नुहोस् वा सर्च गर्नुहोस्। देश छनोट गरेपछि मात्र तपाईँको कुण्डली अनुसार कति % राम्रो छ, वैदेशिक योग, स्थायी बसोबास (PR) तथा भिसा समय विस्तृत रूपमा देखिनेछ।
            </p>

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

          {/* CASE 1: A COUNTRY IS CHOSEN OR SEARCHED -> SHOW FULL DIAGNOSTICS RIGHT INSIDE */}
          {selectedCountryEval ? (
            <div className="space-y-5 animate-fadeIn">
              {/* Country Diagnostic Header Card */}
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
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${selectedCountryEval.suitabilityScore}%` }}
                    />
                  </div>
                </div>

                {/* 3 ESSENTIAL DIAGNOSTICS: वैदेशिक योग, स्थायी बसोबास (PR) तथा भिसा समय */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="p-3.5 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-1">
                    <span className="text-amber-400 font-semibold block uppercase text-[10px] flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-amber-400" />
                      वैदेशिक योग सामर्थ्य
                    </span>
                    <span className="font-serif font-bold text-amber-100 text-sm block">
                      {selectedCountryEval.travelYogaStrengthNe}
                    </span>
                    <p className="text-[11px] text-amber-300/80">
                      १२ औँ भाव ({activeKundali?.houseDetails?.[11]?.signNe || 'मीन'}) र राहुको अनुकूल स्थिति।
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-1">
                    <span className="text-amber-400 font-semibold block uppercase text-[10px] flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                      स्थायी बसोबास (PR) / करिअर सम्भावना
                    </span>
                    <span className="font-serif font-bold text-amber-100 text-sm block">
                      {selectedCountryEval.settlementProspectsNe}
                    </span>
                    <p className="text-[11px] text-amber-300/80">
                      उच्च शिक्षा, दक्ष जनशक्ति वा व्यावसायिक भिसा मार्फत।
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-900/30 border border-amber-700/60 rounded-xl space-y-1">
                    <span className="text-amber-400 font-semibold block uppercase text-[10px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      भिसा सफलताको उत्तम समय
                    </span>
                    <span className="font-serif font-bold text-amber-100 text-sm block">
                      {selectedCountryEval.visaSuccessTimingNe}
                    </span>
                    <p className="text-[11px] text-amber-300/80">
                      कागजात तयार गर्दा पूर्व वा उत्तर फर्केर हस्ताक्षर गर्नुहोस्।
                    </p>
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
          ) : (
            /* CASE 2: NO COUNTRY SELECTED YET -> SHOW INTERACTIVE COUNTRY SELECTOR GRID */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>देश छनोट गर्नुहोस् (Select Any Country from List):</span>
                </h3>
                <span className="text-xs text-amber-400/80">
                  कुल {filteredWorldCountries.length} देशहरू
                </span>
              </div>

              {filteredWorldCountries.length === 0 ? (
                <div className="p-8 text-center bg-amber-950/40 border border-amber-800/40 rounded-2xl space-y-2">
                  <p className="text-amber-300 font-medium text-sm">
                    तपाईँले खोज्नुभएको नामको देश फेला परेन।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCountrySearchQuery('');
                      setCountryContinentFilter('all');
                    }}
                    className="text-xs text-amber-400 underline hover:text-amber-200"
                  >
                    सबै देशहरूको सूची हेर्नुहोस्
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredWorldCountries.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCountryId(c.id);
                        setCountrySearchQuery('');
                      }}
                      className="p-3.5 bg-gradient-to-b from-amber-950/70 to-black/90 border border-amber-800/60 hover:border-amber-400 hover:bg-amber-900/50 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] shadow group flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{c.flag}</span>
                        <div className="overflow-hidden">
                          <h4 className="font-serif font-bold text-amber-100 text-sm group-hover:text-amber-300 truncate">
                            {c.nameNe}
                          </h4>
                          <span className="text-[10px] text-amber-400/70 block truncate">
                            {c.regionNe}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-amber-900/40 text-[11px] text-amber-400">
                        <span className="text-[10px] opacity-80">क्लिक गरी हेर्नुहोस्</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 12 BHAVAS COMPREHENSIVE YEARLY ANALYSIS */}
      {activeTabMode === 'bhavas' && (
        <div className="space-y-5">
          <div className="bg-amber-950/70 p-4 rounded-xl border border-amber-800/50 text-xs sm:text-sm text-amber-200">
            📖 <strong>१२ भाव वार्षिक फलादेश:</strong> कुण्डलीका प्रत्येक भाव (House 1 to 12) ले जीवनका विभिन्न आयामलाई प्रतिनिधित्व गर्दछन्। वर्ष {targetYear} मा तपाईँको कुण्डलीका १२ वटै भावहरूमा ग्रहहरूको स्थिति र तिनको फलादेश तल विस्तृत रूपमा प्रस्तुत गरिएको छ:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prediction.bhavas.map((bhava) => (
              <div
                key={bhava.houseNum}
                className="bg-gradient-to-b from-amber-950/80 to-black border border-amber-800/60 hover:border-amber-500/70 rounded-2xl p-4 shadow-xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-amber-800/50">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold block">
                      भाव #{bhava.houseNum} • {bhava.signNe} ({bhava.signLordNe})
                    </span>
                    <h4 className="font-serif font-bold text-sm text-amber-100">
                      {bhava.titleNe}
                    </h4>
                  </div>
                  <span className="bg-amber-900/60 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-700 font-bold">
                    {bhava.statusScore}%
                  </span>
                </div>

                <div className="text-[11px] text-amber-400/90 font-medium italic">
                  विषय: {bhava.coreThemesNe}
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  {bhava.analysisNe}
                </p>

                <div className="pt-2 border-t border-amber-800/40 space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 block">मुख्य अपेक्षित उपलब्धि:</span>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5">
                    {bhava.keyEventsNe.map((ev, eIdx) => (
                      <li key={eIdx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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

      {/* TAB 5: ASK PANDIT SHAMBHU PRASAD LAMSAL (AI CONSULTATION) */}
      {activeTabMode === 'ai' && (
        <div className="bg-gradient-to-br from-amber-950/90 via-black to-amber-950/90 border border-amber-600/70 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-amber-800/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-serif font-bold text-xs">
                  ॐ
                </span>
                <h3 className="font-serif font-bold text-lg text-amber-100">
                  {lang === 'ne'
                    ? `ज्योतिष पण्डित शम्भु प्रसाद लम्सालसँग वर्ष ${targetYear} को परामर्श`
                    : `Personalized AI Astrology Consultation for Year ${targetYear}`}
                </h3>
              </div>
              <p className="text-xs text-amber-300/80">
                {lang === 'ne'
                  ? 'यस वर्षको विवाह, जागिर, विदेश यात्रा, व्यापार, घरजग्गा वा स्वास्थ्य सम्बन्धी कुनै पनि जिज्ञासा सोध्नुहोस्।'
                  : 'Ask any specific question regarding career, marriage, foreign travel, business, or health for this year.'}
              </p>
            </div>
          </div>

          {/* Fast Question Chips */}
          <div className="space-y-2">
            <span className="text-xs text-amber-400 font-semibold">
              {lang === 'ne' ? 'प्रायः सोधिने प्रश्नहरू (Quick Select):' : 'Frequently Asked Questions:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'के यस वर्ष मेरो विदेशको भिसा लाग्छ र कुन देश जाँदा राम्रो?',
                'यस वर्ष मेरो विवाह हुने योग कस्तो छ र कहिले लगन जुर्छ?',
                'करियर र जागिरमा पदोन्नति वा नयाँ जागिर पाउने सम्भावना कति छ?',
                'यस वर्ष नयाँ व्यापार वा शेयर बजारमा लगानी गर्दा फाइदा हुन्छ?',
                'घर–जग्गा वा गाडी खरिद गर्ने सपना कहिले पूरा हुन्छ?'
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomQuestion(q)}
                  className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/60 rounded-xl text-xs transition-all text-left"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAskAI} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={
                  lang === 'ne'
                    ? `वर्ष ${targetYear} को बारेमा आफ्नो कुनै पनि प्रश्न यहाँ लेख्नुहोस् (उदा. मेरो क्यानडाको पीआर भिसा कहिले लाग्ला?)...`
                    : `Type your question for year ${targetYear}...`
                }
                className="w-full bg-black/80 border border-amber-700/70 rounded-xl p-3.5 text-sm text-amber-100 placeholder-amber-500/50 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isAiLoading || !customQuestion.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-serif font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                    <span>{lang === 'ne' ? 'ज्योतिषीय विश्लेषण चल्दैछ...' : 'Consulting Astrology AI...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-950" />
                    <span>{lang === 'ne' ? 'परामर्श लिनुहोस्' : 'Get Consultation'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Response Display */}
          {aiAnswer && (
            <div className="p-5 bg-gradient-to-b from-amber-900/30 to-black border border-amber-500/70 rounded-xl shadow-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm pb-2 border-b border-amber-800/50">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>पण्डित शम्भु प्रसाद लम्सालको सटिक फलादेश (वर्ष {targetYear}):</span>
              </div>
              <div className="text-xs sm:text-sm text-amber-100 leading-relaxed whitespace-pre-line font-sans">
                {aiAnswer}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
