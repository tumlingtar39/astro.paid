import React, { useState, useEffect } from 'react';
import { KundaliInput, KundaliResult, Language } from '../types';
import { calculateFullKundali } from '../utils/kundaliEngine';
import { BirthDetailsForm } from './kundali/BirthDetailsForm';
import { DashaDashboard } from './kundali/DashaDashboard';
import {
  Clock,
  Sparkles,
  Layers,
  Calculator,
  UserCheck,
  Calendar,
  MapPin,
  History,
  Trash2,
  Cloud,
  RefreshCw,
  Printer,
  ArrowRight,
  Compass
} from 'lucide-react';
import {
  saveKundaliToCloud,
  fetchUserKundalisFromCloud,
  deleteKundaliFromCloud,
} from '../lib/firestoreService';
import { useAuth } from '../context/AuthContext';
import { getStoredLicenseKey } from '../lib/deviceSecurity';

interface SavedProfile {
  id: string;
  timestamp: number;
  input: KundaliInput;
  result: KundaliResult;
  isCloudSynced?: boolean;
}

interface DashaSectionProps {
  lang: Language;
  activeKundali?: KundaliResult | null;
  activeInput?: KundaliInput | null;
  onKundaliChange?: (result: KundaliResult | null, input: KundaliInput | null) => void;
  onNavigateToKundali?: () => void;
}

export const DashaSection: React.FC<DashaSectionProps> = ({
  lang,
  activeKundali,
  activeInput,
  onKundaliChange,
  onNavigateToKundali,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [currentInput, setCurrentInput] = useState<KundaliInput | null>(activeInput || null);
  const [currentResult, setCurrentResult] = useState<KundaliResult | null>(activeKundali || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // Sync with props
  useEffect(() => {
    if (activeKundali) setCurrentResult(activeKundali);
    if (activeInput) setCurrentInput(activeInput);
  }, [activeKundali, activeInput]);

  // Load from sessionStorage if empty
  useEffect(() => {
    if (!currentResult) {
      try {
        const stored = sessionStorage.getItem('active_kundali');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.input && parsed?.result) {
            setCurrentInput(parsed.input);
            setCurrentResult(parsed.result);
          }
        }
      } catch (_) {}
    }
  }, [currentResult]);

  // Load saved profiles from localStorage and cloud
  const loadSavedProfiles = async () => {
    const localSaved: SavedProfile[] = [];
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('kundali_'));
      for (const k of keys) {
        try {
          const item = JSON.parse(localStorage.getItem(k) || '');
          if (item?.id && item?.input && item?.result) {
            localSaved.push(item);
          }
        } catch (_) {}
      }
    } catch (_) {}

    try {
      setIsCloudLoading(true);
      const licenseKey = getStoredLicenseKey();
      const cloudProfiles = await fetchUserKundalisFromCloud(licenseKey);
      const mergedMap = new Map<string, SavedProfile>();
      localSaved.forEach((p) => mergedMap.set(p.id, p));
      cloudProfiles.forEach((cp) => {
        mergedMap.set(cp.id, {
          id: cp.id,
          timestamp: cp.timestamp || Date.now(),
          input: cp.input,
          result: cp.result,
          isCloudSynced: true,
        });
      });
      const combined = Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
      setSavedProfiles(combined);
    } catch (e) {
      setSavedProfiles(localSaved.sort((a, b) => b.timestamp - a.timestamp));
    } finally {
      setIsCloudLoading(false);
    }
  };

  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const handleCalculate = async (input: KundaliInput) => {
    setIsCalculating(true);
    try {
      const result = calculateFullKundali(input);
      setCurrentInput(input);
      setCurrentResult(result);
      if (onKundaliChange) {
        onKundaliChange(result, input);
      }
      try {
        sessionStorage.setItem('active_kundali', JSON.stringify({ input, result }));
      } catch (_) {}

      // Save locally & cloud
      const newId = `kundali_${Date.now()}`;
      const record: SavedProfile = { id: newId, timestamp: Date.now(), input, result };
      try {
        localStorage.setItem(newId, JSON.stringify(record));
      } catch (_) {}
      saveKundaliToCloud(input, result, currentUser?.uid).catch(() => {});
      loadSavedProfiles();
    } catch (err) {
      console.error('Calculation error in DashaSection:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLoadSaved = (profile: SavedProfile) => {
    setCurrentInput(profile.input);
    setCurrentResult(profile.result);
    if (onKundaliChange) {
      onKundaliChange(profile.result, profile.input);
    }
    try {
      sessionStorage.setItem('active_kundali', JSON.stringify({ input: profile.input, result: profile.result }));
    } catch (_) {}
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(id);
      setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
      await deleteKundaliFromCloud(id);
    } catch (err) {
      console.error('Failed to delete saved profile', err);
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Clean Dasha Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border border-amber-800/80 rounded-2xl p-4 sm:p-6 text-amber-50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400 shrink-0" />
              <span>{lang === 'ne' ? 'दशा तालिका' : 'Dasha Tables'}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToKundali && (
              <button
                type="button"
                onClick={onNavigateToKundali}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>{lang === 'ne' ? 'कुण्डली हेर्नुहोस्' : 'View Kundali'}</span>
              </button>
            )}

            {currentResult && currentInput && (
              <>
                <button
                  type="button"
                  onClick={handleNewCalculation}
                  className="px-3.5 py-2 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold rounded-xl border border-amber-700/80 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'नयाँ विवरण' : 'New Calculation'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-xs font-bold rounded-xl border border-amber-500/80 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'प्रिन्ट' : 'Print'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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

            {/* Quick Panchang Info */}
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

          {/* Complete 3-System Dasha Dashboard */}
          <DashaDashboard
            dashaHierarchy={currentResult.dashaHierarchy || []}
            tribhagiDashaHierarchy={currentResult.tribhagiDashaHierarchy || []}
            yoginiDashaHierarchy={currentResult.yoginiDashaHierarchy || []}
            unDeductedDashas={currentResult.unDeductedDashas}
            birthDate={currentInput.birthDate}
            lang={lang}
          />
        </div>
      ) : (
        /* When no active Kundali is selected, show entry form & saved profiles */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl text-xs text-amber-200">
              {lang === 'ne'
                ? 'दशा (विंशोत्तरी, त्रिभागी र योगिनी) गणना गर्न कृपया तल आफ्नो जन्म विवरण भर्नुहोस् वा दायाँबाट सुरक्षित प्रोफाइल छनोट गर्नुहोस्।'
                : 'Please fill in birth details below or pick a saved profile from the right to calculate your Dasha periods.'}
            </div>
            <BirthDetailsForm lang={lang} onSubmit={handleCalculate} isCalculating={isCalculating} />
          </div>

          {/* Saved Profiles Side Panel */}
          <div className="lg:col-span-4 bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
              <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ne' ? 'सुरक्षित प्रोफाइलहरू' : 'Saved Profiles'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSavedProfiles}
                  disabled={isCloudLoading}
                  className="p-1 text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 rounded-lg transition-colors cursor-pointer"
                  title="रिफ्रेस गर्नुहोस्"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudLoading ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-[11px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  {savedProfiles.length}
                </span>
              </div>
            </div>

            {savedProfiles.length === 0 ? (
              <div className="text-center py-8 text-amber-400/60 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-amber-600/40" />
                <p>
                  {lang === 'ne'
                    ? 'कुनै सुरक्षित कुण्डली फेला परेन। बायाँ फारम भरी दशा गणना गर्नुहोस्।'
                    : 'No saved profiles found. Enter birth details to view your Dashas.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {savedProfiles.map((item) => (
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
                      className="p-1.5 text-amber-500/60 hover:text-red-400 hover:bg-amber-950 rounded-lg transition-colors cursor-pointer"
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
