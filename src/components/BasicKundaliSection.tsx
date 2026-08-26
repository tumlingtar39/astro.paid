import React, { useState, useEffect, useMemo } from 'react';
import { KundaliInput, KundaliResult, Language } from '../types';
import { calculateFullKundali } from '../utils/kundaliEngine';
import { BirthDetailsForm } from './kundali/BirthDetailsForm';
import { KundaliChartNorth } from './kundali/KundaliChartNorth';
import { KundaliChartSouth } from './kundali/KundaliChartSouth';
import { PlanetaryPositionsTable } from './kundali/PlanetaryPositionsTable';
import {
  Sparkles,
  History,
  Trash2,
  UserCheck,
  Calculator,
  Cloud,
  RefreshCw,
  Printer,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Gift,
  AlertTriangle
} from 'lucide-react';
import {
  saveKundaliToCloud,
  fetchUserKundalisFromCloud,
  deleteKundaliFromCloud,
} from '../lib/firestoreService';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { getStoredLicenseKey } from '../lib/deviceSecurity';
import { recordTrialChinaGeneration, getTrialState, FREE_TRIAL_MAX_CHINA } from '../lib/trialService';
import { TrialLimitModal } from './subscription/TrialLimitModal';

interface SavedKundali {
  id: string;
  timestamp: number;
  input: KundaliInput;
  result: KundaliResult;
  isCloudSynced?: boolean;
}

interface BasicKundaliSectionProps {
  lang: Language;
  activeKundali?: KundaliResult | null;
  activeInput?: KundaliInput | null;
  onKundaliChange?: (result: KundaliResult | null, input: KundaliInput | null) => void;
  onOpenChina17?: () => void;
}

export const BasicKundaliSection: React.FC<BasicKundaliSectionProps> = ({
  lang,
  activeKundali,
  activeInput,
  onKundaliChange,
  onOpenChina17
}) => {
  const { isSubscribed, isTrialLimitReached, openSubscriptionModal } = useSubscription();
  const { isAdmin } = useAuth();
  const [currentInput, setCurrentInput] = useState<KundaliInput | null>(activeInput || null);
  const [currentResult, setCurrentResult] = useState<KundaliResult | null>(activeKundali || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [trialNotice, setTrialNotice] = useState<string | null>(null);
  const [showTrialLimitModal, setShowTrialLimitModal] = useState(false);
  const [savedKundalis, setSavedKundalis] = useState<SavedKundali[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  // Synchronize when props change
  useEffect(() => {
    if (activeKundali) {
      setCurrentResult(activeKundali);
    }
    if (activeInput) {
      setCurrentInput(activeInput);
    }
  }, [activeKundali, activeInput]);

  // Restore active calculated Kundali from sessionStorage if available
  useEffect(() => {
    try {
      const active = sessionStorage.getItem('active_kundali');
      if (active) {
        const parsed = JSON.parse(active);
        if (
          parsed?.input &&
          parsed?.result &&
          Array.isArray(parsed.result.planetPositions) &&
          Array.isArray(parsed.result.divisionalCharts)
        ) {
          setCurrentInput(parsed.input);
          setCurrentResult(parsed.result);
        }
      }
    } catch (e) {
      console.warn('Could not restore active kundali session', e);
    }
  }, []);

  // Load saved kundalis from LocalStorage and Firestore
  const loadSavedProfiles = async () => {
    let localList: SavedKundali[] = [];
    try {
      const saved = localStorage.getItem('astrology_saved_kundalis');
      if (saved) {
        localList = JSON.parse(saved);
        setSavedKundalis(localList);
      }
    } catch (e) {
      console.error('Failed to load local saved kundalis', e);
    }

    try {
      setIsCloudLoading(true);
      const cloudRecords = await fetchUserKundalisFromCloud();
      if (cloudRecords && cloudRecords.length > 0) {
        const map = new Map<string, SavedKundali>();
        localList.forEach((item) => map.set(item.input.name + item.input.birthDate, item));
        cloudRecords.forEach((rec) => {
          const key = rec.input.name + rec.input.birthDate;
          map.set(key, {
            id: rec.id,
            timestamp: rec.timestamp,
            input: rec.input,
            result: rec.result,
            isCloudSynced: true,
          });
        });
        const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        setSavedKundalis(merged);
        localStorage.setItem('astrology_saved_kundalis', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Could not fetch from Firestore:', err);
    } finally {
      setIsCloudLoading(false);
    }
  };

  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const handleCalculate = (input: KundaliInput) => {
    setCalcError(null);
    setTrialNotice(null);

    // Check if user is licensed/subscribed/admin or within 3-China Free Trial
    const storedKey = getStoredLicenseKey();
    const isLicensedUser = isSubscribed || isAdmin || Boolean(storedKey && storedKey.length >= 8);

    if (!isLicensedUser) {
      const chinaId = `${input.name}_${input.birthDate}_${input.birthTime}_${input.birthPlace}`.toLowerCase().trim();
      const trialCheck = recordTrialChinaGeneration(chinaId);

      if (!trialCheck.allowed) {
        setCalcError(
          lang === 'ne'
            ? 'तपाईंको ३ वटा निःशुल्क चिना (Free Trial) को सीमा पूरा भयो। ३ पटक भन्दा बढी १७ कुण्डली र चिना बनाउन सदस्यता लिनु आवश्यक छ।'
            : 'You have reached the 3 Free Trial limit. Subscription is required to create or open 17 Kundali & China beyond 3 times.'
        );
        setShowTrialLimitModal(true);
        return;
      }

      if (trialCheck.usedCount > 0) {
        setTrialNotice(
          lang === 'ne'
            ? `निःशुल्क परीक्षण: ${trialCheck.usedCount}/${FREE_TRIAL_MAX_CHINA} चिना प्रयोग भयो (बाँकी: ${trialCheck.remaining})`
            : `Free Trial: ${trialCheck.usedCount}/${FREE_TRIAL_MAX_CHINA} used (${trialCheck.remaining} remaining)`
        );
      }
    }

    setIsCalculating(true);
    setTimeout(async () => {
      try {
        const result = calculateFullKundali(input);
        if (!result) {
          throw new Error('Null result returned');
        }
        setCurrentInput(input);
        setCurrentResult(result);

        if (onKundaliChange) {
          onKundaliChange(result, input);
        }

        try {
          sessionStorage.setItem('active_kundali', JSON.stringify({ input, result }));
        } catch (_) {}
      } catch (err: any) {
        console.error('Calculation error:', err);
        setCalcError(err?.message || 'कुण्डली गणनामा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
      } finally {
        setIsCalculating(false);
      }
    }, 150);
  };

  const handleLoadSaved = (saved: SavedKundali) => {
    setCurrentInput(saved.input);
    setCurrentResult(saved.result);
    if (onKundaliChange) {
      onKundaliChange(saved.result, saved.input);
    }
    try {
      sessionStorage.setItem('active_kundali', JSON.stringify({ input: saved.input, result: saved.result }));
    } catch (_) {}
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedKundalis.filter((k) => k.id !== id);
    setSavedKundalis(updated);
    try {
      localStorage.setItem('astrology_saved_kundalis', JSON.stringify(updated));
      await deleteKundaliFromCloud(id);
    } catch (err) {
      console.error('Error deleting kundali profile', err);
    }
  };

  const handleNewCalculation = () => {
    setCurrentInput(null);
    setCurrentResult(null);
    if (onKundaliChange) {
      onKundaliChange(null, null);
    }
    try {
      sessionStorage.removeItem('active_kundali');
    } catch (_) {}
  };

  const d1Chart = useMemo(() => {
    return currentResult?.divisionalCharts?.find((c) => c.type === 'D1') || null;
  }, [currentResult]);

  const d9Chart = useMemo(() => {
    return currentResult?.divisionalCharts?.find((c) => c.type === 'D9') || null;
  }, [currentResult]);

  const planetList = currentResult?.planetPositions || [];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border border-amber-800/80 rounded-2xl p-4 sm:p-6 text-amber-50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500 text-stone-950 font-black text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                {lang === 'ne' ? '✓ निःशुल्क सेवा (Free)' : '✓ 100% Free Service'}
              </span>
              <span className="bg-amber-900/80 text-amber-300 font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-amber-700/60">
                {lang === 'ne' ? 'लाहिडी अयनंश' : 'Lahiri Ayanamsha'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
              <span>{lang === 'ne' ? 'जन्म लग्न कुण्डली र नवमांश कुण्डली' : 'Lagna & Navamsha Kundali Charts'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl">
              {lang === 'ne'
                ? '२ मुख्य कुण्डली (लग्न चक्र र नवमांश चक्र) तथा विस्तृत ग्रह स्थिति तालिका कुनै पनि सदस्यता बिना तुरुन्त हेर्नुहोस्।'
                : 'View 2 essential Kundali charts (D1 Lagna & D9 Navamsha) along with complete planetary positions freely without subscription.'}
            </p>
          </div>

          {currentResult && currentInput && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleNewCalculation}
                className="px-3.5 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold rounded-xl border border-amber-700/80 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Calculator className="w-4 h-4" />
                <span>{lang === 'ne' ? 'नयाँ विवरण भर्नुहोस्' : 'New Calculation'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-xs font-bold rounded-xl border border-amber-500/80 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'ne' ? 'प्रिन्ट गर्नुहोस्' : 'Print'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {trialNotice && !calcError && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{trialNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTrialLimitModal(true)}
            className="text-[11px] px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shrink-0"
          >
            {lang === 'ne' ? 'कोड राख्नुहोस्' : 'Enter Code'}
          </button>
        </div>
      )}

      {calcError && (
        <div className="p-4 bg-red-950/80 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{calcError}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTrialLimitModal(true)}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shrink-0"
          >
            {lang === 'ne' ? 'अनलक गर्नुहोस्' : 'Unlock'}
          </button>
        </div>
      )}

      {currentResult && currentInput ? (
        <div className="space-y-6">
          {/* Person Summary Banner */}
          <div className="bg-amber-950/60 border border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-serif font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {currentInput.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
                  <span>{currentInput.name}</span>
                  <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
                    {currentInput.gender === 'male' ? (lang === 'ne' ? 'पुरुष' : 'Male') : (lang === 'ne' ? 'महिला' : 'Female')}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-300/80 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentInput.birthDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentInput.birthTime}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentInput.birthPlace}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Panchang & Lagna Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="px-3 py-1.5 bg-amber-900/40 border border-amber-800/60 rounded-xl text-center">
                <span className="text-[10px] text-amber-400/80 block">{lang === 'ne' ? 'जन्म लग्न' : 'Lagna'}</span>
                <span className="font-serif font-bold text-amber-100">{currentResult.panchanga.ascendantNe || 'लग्न'}</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-900/40 border border-amber-800/60 rounded-xl text-center">
                <span className="text-[10px] text-amber-400/80 block">{lang === 'ne' ? 'जन्म राशि' : 'Moon Sign'}</span>
                <span className="font-serif font-bold text-amber-100">{currentResult.panchanga.moonSignNe || 'राशि'}</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-900/40 border border-amber-800/60 rounded-xl text-center">
                <span className="text-[10px] text-amber-400/80 block">{lang === 'ne' ? 'जन्म नक्षत्र' : 'Nakshatra'}</span>
                <span className="font-serif font-bold text-amber-100">{currentResult.panchanga.nakshatraNe || 'नक्षत्र'}</span>
              </div>
            </div>
          </div>

          {/* Chart Visual Style Selector */}
          <div className="flex flex-wrap items-center justify-between bg-amber-950/80 p-3 rounded-xl border border-amber-800/60 gap-3">
            <span className="text-xs font-semibold text-amber-200">
              {lang === 'ne' ? 'कुण्डली चित्र शैली छनौट गर्नुहोस्:' : 'Select Kundali Visual Style:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartStyle === 'north'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-amber-900/40 text-amber-300 border border-amber-700'
                }`}
              >
                {lang === 'ne' ? 'उत्तर भारतीय (North)' : 'North Indian'}
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartStyle === 'south'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-amber-900/40 text-amber-300 border border-amber-700'
                }`}
              >
                {lang === 'ne' ? 'दक्षिण भारतीय (South)' : 'South Indian'}
              </button>
            </div>
          </div>

          {/* 2 KUNDALI CHARTS: LAGNA KUNDALI (D1) & NAVAMSHA KUNDALI (D9) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Main Lagna Kundali (D1) */}
            <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-800/50">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? '१. मुख्य जन्म लग्न कुण्डली (D1 Rashi Chart)' : '1. Main Birth Lagna Chart (D1)'}</span>
                </h3>
                <span className="text-[11px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700/50 font-mono">
                  D-1
                </span>
              </div>

              {chartStyle === 'north' ? (
                <KundaliChartNorth
                  houses={
                    d1Chart
                      ? d1Chart.houses.map((h) => ({
                          house: h.houseNum,
                          sign: h.signNe,
                          planets: h.planets
                        }))
                      : []
                  }
                  planetPositions={planetList}
                  lagnaSignIndex={d1Chart?.houses[0]?.signIndex || 0}
                  lang={lang}
                  title={lang === 'ne' ? '१. जन्म लग्न कुण्डली (D1)' : '1. Main Birth Lagna Chart (D1)'}
                />
              ) : (
                <KundaliChartSouth
                  planetPositions={planetList}
                  lang={lang}
                  title={lang === 'ne' ? '१. जन्म लग्न कुण्डली (D1)' : '1. Main Birth Lagna Chart (D1)'}
                />
              )}
            </div>

            {/* 2. Navamsha Kundali (D9) */}
            <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-800/50">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? '२. नवमांश कुण्डली (D9 Navamsha - भाग्य र विवाह)' : '2. Navamsha Chart (D9 - Fortune & Marriage)'}</span>
                </h3>
                <span className="text-[11px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700/50 font-mono">
                  D-9
                </span>
              </div>

              {chartStyle === 'north' ? (
                <KundaliChartNorth
                  houses={
                    d9Chart
                      ? d9Chart.houses.map((h) => ({
                          house: h.houseNum,
                          sign: h.signNe,
                          planets: h.planets
                        }))
                      : []
                  }
                  planetPositions={planetList}
                  lagnaSignIndex={d9Chart?.houses[0]?.signIndex || 0}
                  lang={lang}
                  title={lang === 'ne' ? '२. नवमांश कुण्डली (D9)' : '2. Navamsa Chart (D9)'}
                />
              ) : (
                <KundaliChartSouth
                  planetPositions={planetList}
                  lang={lang}
                  title={lang === 'ne' ? '२. नवमांश कुण्डली (D9)' : '2. Navamsa Chart (D9)'}
                />
              )}
            </div>
          </div>

          {/* TALA GRAHA STHITI: PLANETARY POSITIONS TABLE (Directly below the 2 Kundalis) */}
          <div>
            <PlanetaryPositionsTable planetPositions={planetList} lang={lang} />
          </div>

          {/* Link to 17 Kundali & China for full Shodashvarga & Predictions */}
          {onOpenChina17 && (
            <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 border border-amber-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif font-bold text-amber-100 text-base flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? 'थप १६ वर्ग कुण्डली र परम्परागत चिना हेर्न चाहनुहुन्छ?' : 'Want 16 Shodashvarga Charts & Traditional Cheena?'}</span>
                </h4>
                <p className="text-xs text-amber-300/80 max-w-xl">
                  {lang === 'ne'
                    ? 'द्रेष्काण, सप्तमांश, दशमांश (D10 क्यारियर), द्वादशांश, षोडशांश, त्रिंशांश, विंशोत्तरी/त्रिभागी दशा र A4 चिना प्रिन्टका लागि १७ कुण्डली र चिना मेनु हेर्नुहोस्।'
                    : 'Explore all 16 Divisional Charts (D10 Career, D7 Children, D12 Parents, D30 Arishta), Vimshottari Dasha and Full Traditional Cheena.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSubscribed && isTrialLimitReached) {
                    openSubscriptionModal(lang === 'ne' ? '१७ कुण्डली र चिना (17 Kundali & China)' : '17 Kundali & China');
                  } else if (onOpenChina17) {
                    onOpenChina17();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>{lang === 'ne' ? '१७ कुण्डली र चिना खोल्नुहोस्' : 'Open 17 Kundali & China'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Birth Details Entry Form & Saved Kundalis List */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Entry Form */}
          <div className="lg:col-span-8">
            <BirthDetailsForm lang={lang} onSubmit={handleCalculate} />
          </div>

          {/* Saved Profiles Side Panel */}
          <div className="lg:col-span-4 bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
              <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'ne' ? 'सुरक्षित कुण्डलीहरू' : 'Saved Profiles'}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSavedProfiles}
                  disabled={isCloudLoading}
                  className="p-1 text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 rounded-lg transition-colors"
                  title="रिफ्रेस गर्नुहोस् (Sync Cloud)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudLoading ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-[11px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  {savedKundalis.length}
                </span>
              </div>
            </div>

            {savedKundalis.length === 0 ? (
              <div className="text-center py-8 text-amber-400/60 text-xs space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-amber-600/40" />
                <p>
                  {lang === 'ne'
                    ? 'हाल कुनै सुरक्षित कुण्डली छैन। बायाँ फारम भरी नयाँ कुण्डली गणना गर्नुहोस्।'
                    : 'No saved profiles yet. Fill out the form to view Lagna & Navamsha charts.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {savedKundalis.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSaved(item)}
                    className="p-3 bg-amber-900/20 hover:bg-amber-800/40 border border-amber-800/50 hover:border-amber-500 rounded-xl transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-serif font-bold text-sm text-amber-100 group-hover:text-amber-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.input.name}</span>
                        {item.isCloudSynced && (
                          <span title="Cloud Synced">
                            <Cloud className="w-3 h-3 text-amber-400 inline" />
                          </span>
                        )}
                      </span>
                      <p className="text-[11px] text-amber-300/80">
                        {item.input.birthDate} | {item.input.birthPlace}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="p-1.5 text-amber-500/60 hover:text-red-400 hover:bg-amber-950 rounded-lg transition-colors"
                      title="हटाउनुहोस् (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Free Trial Limit Modal */}
      <TrialLimitModal
        isOpen={showTrialLimitModal}
        onClose={() => setShowTrialLimitModal(false)}
        lang={lang}
      />
    </div>
  );
};
