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
  const { isSubscribed, openSubscriptionModal, redeemCodeAsync } = useSubscription();
  const { isAdmin } = useAuth();
  const [currentInput, setCurrentInput] = useState<KundaliInput | null>(activeInput || null);
  const [currentResult, setCurrentResult] = useState<KundaliResult | null>(activeKundali || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [savedKundalis, setSavedKundalis] = useState<SavedKundali[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [firestoreConnected, setFirestoreConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lifetime key activation input in gate
  const [keyInput, setKeyInput] = useState<string>('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);
  const [isActivatingKey, setIsActivatingKey] = useState<boolean>(false);

  const handleDirectKeyActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(null);
    setKeySuccess(null);
    const trimmed = keyInput.trim().toUpperCase().replace(/[\s\-_]/g, '');
    if (!trimmed) {
      setKeyError(lang === 'ne' ? 'कृपया लाइफटाइम वा सदस्यता की राख्नुहोस्।' : 'Please enter a lifetime or license key.');
      return;
    }
    setIsActivatingKey(true);
    try {
      const res = await redeemCodeAsync(trimmed);
      if (res.success) {
        setKeySuccess(lang === 'ne' ? res.messageNe : res.messageEn);
      } else {
        setKeyError(lang === 'ne' ? res.messageNe : res.messageEn);
      }
    } catch (_e) {
      setKeyError(lang === 'ne' ? 'सक्रियता गर्दा समस्या आयो।' : 'Activation error occurred.');
    } finally {
      setIsActivatingKey(false);
    }
  };

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

      {calcError && (
        <div className="bg-rose-950/80 border border-rose-700 p-4 rounded-xl text-rose-200 text-xs sm:text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{calcError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCalcError(null)}
              className="text-rose-400 hover:text-rose-100 font-bold underline text-xs"
            >
              {lang === 'ne' ? 'हटाउनुहोस्' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* Strict Subscription Lock Screen for 17 Kundali & China */}
      {!isSubscribed ? (
        <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-gradient-to-b from-amber-950/90 via-stone-950 to-black border-2 border-amber-500/70 rounded-3xl text-amber-100 shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 mx-auto shadow-xl shadow-amber-950/50 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center text-amber-400">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {lang === 'ne' ? '👑 केवल सदस्यता प्राप्त ग्राहकहरूका लागि' : '👑 Exclusive to Subscribed Members'}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-200">
              {lang === 'ne' ? '१७ कुण्डली र परम्परागत चिना (17 Kundali & China)' : '17 Divisional Charts & Cheena'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl mx-auto leading-relaxed">
              {lang === 'ne'
                ? 'यस विशेष खण्डमा सम्पूर्ण १६ वर्ग कुण्डली (षोडशवर्ग D1 देखि D60), विंशोत्तरी एवं त्रिभागी महादशा-अन्तर्दशा, र A4 साइजको परम्परागत नेपाली चिना डाउनलोड तथा प्रिन्ट समावेश छ।'
                : 'This section contains all 16 Divisional Charts (Shodashvarga D1 to D60), Vimshottari & Tribhagi Dashas, and traditional Cheena PDF print.'}
            </p>
          </div>

          {/* Quick Key Activation Form */}
          <div className="max-w-md mx-auto p-4 sm:p-5 bg-stone-900/90 border border-amber-600/50 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 font-serif">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'लाइफटाइम वा सदस्यता की हाल्नुहोस्:' : 'Enter Lifetime / License Key:'}</span>
            </h4>
            <form onSubmit={handleDirectKeyActivate} className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                  placeholder={lang === 'ne' ? 'उदा: A7B2C4D6E8' : 'e.g. A7B2C4D6E8'}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black/80 border border-amber-500/60 text-amber-100 text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-600"
                />
                <button
                  type="submit"
                  disabled={isActivatingKey}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isActivatingKey ? (lang === 'ne' ? 'प्रमाणित गर्दै...' : 'Checking...') : (lang === 'ne' ? 'एक्टिभ गर्नुहोस्' : 'Activate')}
                </button>
              </div>
              {keyError && (
                <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                  {keyError}
                </p>
              )}
              {keySuccess && (
                <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 p-2 rounded-lg border border-emerald-800">
                  {keySuccess}
                </p>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openSubscriptionModal(lang === 'ne' ? '१७ कुण्डली र चिना (17 Kundali & China)' : '17 Kundali & China')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'ne' ? '👑 सदस्यता योजनाहरू हेर्नुहोस् (Pricing Plans)' : '👑 View Subscription Plans'}
            </button>
          </div>

          <p className="text-[11px] text-amber-400/80 pt-2 border-t border-amber-900/60">
            {lang === 'ne'
              ? '💡 ३ वटा मुख्य कुण्डली (लग्न, नवमांश र चन्द्र कुण्डली) माथिको "कुण्डली" ट्याबमा सबैका लागि निःशुल्क छ।'
              : '💡 3 Core Charts (Lagna, Navamsha & Chandra) are 100% Free on the "Kundali" tab.'}
          </p>
        </div>
      ) : currentResult && currentInput ? (
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
    </div>
  );
};
