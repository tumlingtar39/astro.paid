import React, { useState, useEffect, useMemo } from 'react';
import { KundaliInput, KundaliResult, Language } from '../types';
import { calculateFullKundali } from '../utils/kundaliEngine';
import { BirthDetailsForm } from './kundali/BirthDetailsForm';
import { KundaliDashboard } from './kundali/KundaliDashboard';
import { Sparkles, History, Trash2, UserCheck, Calculator, Cloud, CloudCheck, RefreshCw, Gift, AlertTriangle, Crown } from 'lucide-react';
import {
  saveKundaliToCloud,
  fetchUserKundalisFromCloud,
  deleteKundaliFromCloud,
  CloudKundaliRecord,
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

interface KundaliSectionProps {
  lang: Language;
  onOpenYearlyPhalit?: () => void;
  activeKundali?: KundaliResult | null;
  activeInput?: KundaliInput | null;
  onKundaliChange?: (result: KundaliResult | null, input: KundaliInput | null) => void;
}

export const KundaliSection: React.FC<KundaliSectionProps> = ({
  lang,
  onOpenYearlyPhalit,
  activeKundali,
  activeInput,
  onKundaliChange
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
  const [firestoreConnected, setFirestoreConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize when props change
  useEffect(() => {
    if (activeKundali) {
      setCurrentResult(activeKundali);
    }
    if (activeInput) {
      setCurrentInput(activeInput);
    }
  }, [activeKundali, activeInput]);

  // Check if current active Kundali is already saved in the list
  const isCurrentSaved = useMemo(() => {
    if (!currentInput) return false;
    return savedKundalis.some(
      (k) => k.input.name === currentInput.name && k.input.birthDate === currentInput.birthDate
    );
  }, [currentInput, savedKundalis]);

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
        } else {
          sessionStorage.removeItem('active_kundali');
        }
      }
    } catch (e) {
      console.warn('Could not restore active kundali session', e);
      try {
        sessionStorage.removeItem('active_kundali');
      } catch (_) {}
    }
  }, []);

  // Load saved kundalis from LocalStorage and Firestore Cloud Database
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

    // Try fetching from Firestore
    try {
      setIsCloudLoading(true);
      const cloudRecords = await fetchUserKundalisFromCloud();
      if (cloudRecords && cloudRecords.length > 0) {
        setFirestoreConnected(true);
        // Merge cloud records with local list without duplicates
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

  // Calculate Kundali without automatic saving
  const handleCalculate = (input: KundaliInput) => {
    setCalcError(null);
    setSaveMessage(null);
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
            : 'You have reached the 3 Free Trial Kundali limit. Subscription is required to open or generate 17 Kundali & China beyond 3 times.'
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
    // Give smooth UI feedback
    setTimeout(async () => {
      try {
        const result = calculateFullKundali(input);
        if (!result) {
          throw new Error('Null result returned');
        }
        setCurrentInput(input);
        setCurrentResult(result);
        onKundaliChange?.(result, input);

        // Store active calculation session in temporary sessionStorage
        try {
          sessionStorage.setItem('active_kundali', JSON.stringify({ input, result }));
        } catch (e) {
          console.warn('Failed to set active kundali session', e);
        }
      } catch (err) {
        console.error('Calculation Error:', err);
        setCalcError(
          lang === 'ne'
            ? 'ज्योतिषीय गणितीय गणना गर्दा समस्या आयो। कृपया जन्म विवरण पुनः जाँच गरी प्रयास गर्नुहोस्।'
            : 'Error occurred during calculation. Please verify birth details and try again.'
        );
      } finally {
        setIsCalculating(false);
      }
    }, 400);
  };

  // Explicit Save Handler - saves only when requested by user
  const handleSaveCurrentKundali = async () => {
    if (!currentInput || !currentResult) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const newItem: SavedKundali = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input: currentInput,
        result: currentResult,
        isCloudSynced: false,
      };

      // Save to Firestore Cloud
      try {
        const cloudRecord = await saveKundaliToCloud(currentInput, currentResult);
        if (cloudRecord) {
          newItem.id = cloudRecord.id;
          newItem.isCloudSynced = true;
          setFirestoreConnected(true);
        }
      } catch (cloudErr) {
        console.warn('Firestore cloud save notice:', cloudErr);
      }

      // Save to LocalStorage
      const updatedList = [
        newItem,
        ...savedKundalis.filter(
          (k) => !(k.input.name === currentInput.name && k.input.birthDate === currentInput.birthDate)
        ),
      ].slice(0, 25);

      setSavedKundalis(updatedList);
      localStorage.setItem('astrology_saved_kundalis', JSON.stringify(updatedList));

      setSaveMessage({
        text:
          lang === 'ne'
            ? `"${currentInput.name}" को कुण्डली सफलतापूर्वक सेभ (सुरक्षित) गरियो!`
            : `Kundali for "${currentInput.name}" has been saved successfully!`,
        type: 'success',
      });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveMessage({
        text:
          lang === 'ne'
            ? 'कुण्डली सुरक्षित गर्दा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
            : 'Failed to save Kundali. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSaved = (savedItem: SavedKundali) => {
    setCalcError(null);
    setSaveMessage(null);
    setCurrentInput(savedItem.input);
    setCurrentResult(savedItem.result);
    onKundaliChange?.(savedItem.result, savedItem.input);
    try {
      sessionStorage.setItem('active_kundali', JSON.stringify({ input: savedItem.input, result: savedItem.result }));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleNewCalculation = () => {
    setCalcError(null);
    setSaveMessage(null);
    setCurrentResult(null);
    setCurrentInput(null);
    onKundaliChange?.(null, null);
    try {
      sessionStorage.removeItem('active_kundali');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedKundalis.filter((k) => k.id !== id);
    setSavedKundalis(filtered);
    localStorage.setItem('astrology_saved_kundalis', JSON.stringify(filtered));

    // Delete from Firestore
    try {
      await deleteKundaliFromCloud(id);
    } catch (err) {
      console.warn('Could not delete from Firestore:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Loading Overlay */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-amber-100">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
          <h3 className="font-serif font-bold text-xl text-amber-200">
            {lang === 'ne'
              ? 'खगोलीय गणितीय गणना चल्दैछ...'
              : 'Calculating Precision Astronomical Coordinates...'}
          </h3>
          <p className="text-xs text-amber-400 mt-2">
            {lang === 'ne'
              ? 'VSOP87 / Lahiri Ephemeris अयनंश प्रयोग गरी नवग्रह, १२ भाव र विंशोत्तरी दशा तयार हुँदैछ।'
              : 'Computing JPL/VSOP87 Ephemeris planetary degrees & Varga subdivisions.'}
          </p>
        </div>
      )}

      {/* Trial Exhaustion Subscription Notice Banner */}
      {!isSubscribed && isTrialLimitReached && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 border-2 border-amber-500/70 rounded-2xl text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-amber-100">
                {lang === 'ne' ? '३ पटक भन्दा बढी १७ कुण्डली र चिना हेर्न सदस्यता लिनुहोस्' : 'Subscription Required to Open 17 Kundali & China'}
              </h4>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {lang === 'ne'
                  ? 'तपाईंको ३ वटा निःशुल्क चिना (Free Trial) पूरा भइसकेको छ। सम्पूर्ण १६ वर्ग कुण्डली (षोडशवर्ग), विंशोत्तरी दशा तथा परम्परागत चिना हेर्न सदस्यता आवश्यक छ।'
                  : 'You have used your 3 free trial charts. An active membership is required to access all 16 divisional charts and full Cheena.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openSubscriptionModal(lang === 'ne' ? '१७ कुण्डली र चिना (17 Kundali & China)' : '17 Kundali & China')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {lang === 'ne' ? '👑 सदस्यता योजना छान्नुहोस्' : '👑 Choose Subscription Plan'}
          </button>
        </div>
      )}

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
        <div className="bg-rose-950/80 border border-rose-700 p-4 rounded-xl text-rose-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{calcError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowTrialLimitModal(true)}
              className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs transition"
            >
              {lang === 'ne' ? 'अनलक गर्नुहोस्' : 'Unlock'}
            </button>
            <button
              onClick={() => setCalcError(null)}
              className="text-rose-400 hover:text-rose-100 font-bold underline text-xs"
            >
              {lang === 'ne' ? 'हटाउनुहोस्' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {currentResult && currentInput ? (
        <KundaliDashboard
          result={currentResult}
          input={currentInput}
          lang={lang}
          onLanguageToggle={() => {}}
          onNewCalculation={handleNewCalculation}
          isSaved={isCurrentSaved}
          isSaving={isSaving}
          onSaveKundali={handleSaveCurrentKundali}
          saveMessage={saveMessage}
        />
      ) : (
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
                  {lang === 'ne' ? 'संरक्षित कुण्डलीहरू' : 'Saved Kundalis'}
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

            {/* Cloud Status Banner */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-900/20 border border-amber-800/40 rounded-lg text-[11px] text-amber-300/90">
              <span className="flex items-center gap-1.5 font-sans">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ne' ? 'Firestore क्लाउड सुरक्षित' : 'Firestore Cloud Sync'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {firestoreConnected ? (lang === 'ne' ? 'सक्रिय' : 'Active') : (lang === 'ne' ? 'लोकल' : 'Local')}
              </span>
            </div>

            {savedKundalis.length === 0 ? (
              <div className="text-center py-8 text-amber-400/60 text-xs space-y-2">
                <Calculator className="w-8 h-8 mx-auto text-amber-600/40" />
                <p>
                  {lang === 'ne'
                    ? 'हाल कुनै सुरक्षित कुण्डली छैन। बायाँ फारम भरी नयाँ कुण्डली गणना गर्नुहोस्।'
                    : 'No saved profiles yet. Fill out the form to generate a precision birth chart.'}
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
                          <span title="Cloud Synced to Firestore">
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
