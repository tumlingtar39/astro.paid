import React, { useState } from 'react';
import { KundaliResult, KundaliInput, Language } from '../../types';
import { KundaliChartNorth } from './KundaliChartNorth';
import { KundaliChartSouth } from './KundaliChartSouth';
import { PlanetaryPositionsTable } from './PlanetaryPositionsTable';
import { HouseDetailsSection } from './HouseDetailsSection';
import { PanchangaSection } from './PanchangaSection';
import { DivisionalChartsSection } from './DivisionalChartsSection';
import { YogasSection } from './YogasSection';
import { GrahaBalaSection } from './GrahaBalaSection';
import { PhaladeshSection } from './PhaladeshSection';
import { YearlyPredictionSection } from './YearlyPredictionSection';
import { TraditionalCheenaView } from './TraditionalCheenaView';
import { CalculationAuditModal } from './CalculationAuditModal';
import { SubscriptionGateCard } from '../subscription/SubscriptionGateCard';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  Sparkles,
  RefreshCw,
  Printer,
  ShieldCheck,
  Layers,
  Compass,
  Home,
  Calendar,
  Clock,
  BookOpen,
  Activity,
  Globe,
  Share2,
  FileText,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Crown
} from 'lucide-react';

interface KundaliDashboardProps {
  result: KundaliResult;
  input: KundaliInput;
  lang: Language;
  onLanguageToggle: () => void;
  onNewCalculation: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  onSaveKundali?: () => void;
  saveMessage?: { text: string; type: 'success' | 'error' } | null;
}

export const KundaliDashboard: React.FC<KundaliDashboardProps> = ({
  result,
  input,
  lang,
  onLanguageToggle,
  onNewCalculation,
  isSaved = false,
  isSaving = false,
  onSaveKundali,
  saveMessage = null
}) => {
  const [activeTab, setActiveTab] = useState<'cheena' | 'yearly' | 'phaladesh'>('cheena');

  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const { isSubscribed, hasAccessToFullKundali, currentPlan, openSubscriptionModal } = useSubscription();

  const handlePrint = () => {
    if (!hasAccessToFullKundali) {
      openSubscriptionModal();
      return;
    }
    window.print();
  };

  const navTabs = [
    { id: 'cheena', labelNe: '📜 परम्परागत चिना (Traditional Cheena)', labelEn: 'Formal Traditional Cheena', icon: FileText },
    { id: 'yearly', labelNe: '✨ फलित (Phalit & Forecast)', labelEn: 'Phalit & Annual Forecast', icon: Calendar },
    { id: 'phaladesh', labelNe: '📖 कुण्डली फलित (Phaladesh)', labelEn: 'Kundali Phaladesh', icon: BookOpen }
  ];

  const planetList = result.planets || result.planetPositions || [];
  const divisionalList = result.divisionalCharts || [];
  const dashaList = result.dashaHierarchy || [];

  const d1Chart = divisionalList.find((c) => c.code === 'D1');
  const d9Chart = divisionalList.find((c) => c.code === 'D9');

  // Active running dasha planets for prominent highlighting on charts
  const activeVimDasha = result.dashaHierarchy?.find((d) => d.isActive);
  const activeVimAntar = activeVimDasha?.antardashas?.find((a) => a.isActive);
  const activeTriDasha = result.tribhagiDashaHierarchy?.find((d) => d.isActive);
  const activeYogDasha = result.yoginiDashaHierarchy?.find((d) => d.isActive);

  const activePlanetKeys = Array.from(
    new Set(
      [
        activeVimDasha?.planetKey,
        activeVimAntar?.planetKey,
        activeTriDasha?.planetKey,
        activeYogDasha?.planetKey
      ].filter(Boolean) as string[]
    )
  );

  const activeDashaTitle = activeVimDasha
    ? (lang === 'ne'
        ? `${activeVimDasha.planetNe} महादशा ${activeVimAntar ? `(${activeVimAntar.planetNe} अन्तर्दशा)` : ''}`
        : `${activeVimDasha.planetEn} Mahadasha ${activeVimAntar ? `(${activeVimAntar.planetEn} Antar)` : ''}`)
    : (activeTriDasha
        ? (lang === 'ne' ? `${activeTriDasha.planetNe} त्रिभागी दशा` : `${activeTriDasha.planetEn} Tribhagi Dasha`)
        : '');

  return (
    <div className="space-y-6 animate-fadeIn print:text-black">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-800/60 relative z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-600 text-amber-950 font-bold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {lang === 'ne' ? '१७ कुण्डली र परम्परागत चिना' : '17 Kundali & Traditional Cheena'}
              </span>
              <span className="bg-amber-900/60 text-amber-300 font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>EPHEMERIS VERIFIED</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2">
              <span>{input.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-300/90 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans">
              <span>
                📅 {input.birthDate} ({input.birthTime})
              </span>
              <span>📍 {input.birthPlace}</span>
              <span>
                🌐 Lat: {input.latitude}°, Lon: {input.longitude}° (UTC+{input.timezone})
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            {/* Explicit Save Button */}
            {onSaveKundali && (
              <button
                type="button"
                onClick={onSaveKundali}
                disabled={isSaving}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                  isSaved
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/70 hover:bg-emerald-900/60 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border border-emerald-400/60 shadow-emerald-900/50'
                }`}
                title={isSaved ? (lang === 'ne' ? 'सुरक्षित भइसकेको छ (Saved)' : 'Already Saved') : (lang === 'ne' ? 'कुण्डली सेभ गर्नुहोस् (Save to Cloud/Local)' : 'Save Kundali')}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                    <span>{lang === 'ne' ? 'सेभ हुँदैछ...' : 'Saving...'}</span>
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ne' ? '✓ सुरक्षित गरिएको' : '✓ Saved'}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-white" />
                    <span>{lang === 'ne' ? '💾 सेभ गर्नुहोस्' : '💾 Save Kundali'}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onLanguageToggle}
              className="bg-amber-900/40 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            >
              🌐 {lang === 'ne' ? 'English' : 'नेपाली'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="bg-amber-900/40 hover:bg-amber-800 text-amber-200 border border-amber-700 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>{lang === 'ne' ? 'प्रिन्ट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onNewCalculation}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-serif font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <RefreshCw className="w-4 h-4 text-amber-950" />
              <span>{lang === 'ne' ? 'नयाँ कुण्डली' : 'New Kundali'}</span>
            </button>
          </div>
        </div>

        {/* Save Status Notification Banner */}
        {saveMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-sans flex items-center justify-between border shadow-lg animate-fadeIn ${
              saveMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : 'bg-rose-950/90 border-rose-600 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{saveMessage.text}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">
              {lang === 'ne' ? 'क्लाउड / लोकल सुरक्षित' : 'Cloud / Local Storage'}
            </span>
          </div>
        )}

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-2.5 bg-amber-950/60 border border-amber-800/40 rounded-xl">
            <span className="text-[10px] text-amber-400/80 block uppercase font-semibold">
              {lang === 'ne' ? 'लग्न (Lagna Ascendant)' : 'Lagna Sign'}
            </span>
            <span className="font-serif font-bold text-amber-100 text-sm">
              {planetList.find((p) => p.id === 'lagna')?.rashiNe || 'मेष'} (
              {planetList.find((p) => p.id === 'lagna')?.degreeStr || '0°'})
            </span>
          </div>

          <div className="p-2.5 bg-amber-950/60 border border-amber-800/40 rounded-xl">
            <span className="text-[10px] text-amber-400/80 block uppercase font-semibold">
              {lang === 'ne' ? 'चन्द्र राशी (Moon Sign)' : 'Moon Sign'}
            </span>
            <span className="font-serif font-bold text-amber-100 text-sm">
              {planetList.find((p) => p.id === 'moon')?.rashiNe || 'मेष'}
            </span>
          </div>

          <div className="p-2.5 bg-amber-950/60 border border-amber-800/40 rounded-xl">
            <span className="text-[10px] text-amber-400/80 block uppercase font-semibold">
              {lang === 'ne' ? 'नक्षत्र (Janma Nakshatra)' : 'Janma Nakshatra'}
            </span>
            <span className="font-serif font-bold text-amber-100 text-sm">
              {result.panchanga?.nakshatraNe || 'अश्विनी'} (पद {planetList.find((p) => p.id === 'moon')?.pad || 1})
            </span>
          </div>

          <div className="p-2.5 bg-amber-950/60 border border-amber-800/40 rounded-xl">
            <span className="text-[10px] text-amber-400/80 block uppercase font-semibold">
              {lang === 'ne' ? 'सक्रिय महादशा (Current Dasha)' : 'Active Dasha'}
            </span>
            <span className="font-serif font-bold text-amber-100 text-sm">
              {dashaList.find((d) => d.isActive)?.planetNe || 'सूर्य'} महादशा
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 border-amber-300 shadow-xl scale-105'
                  : 'bg-amber-950/70 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{lang === 'ne' ? tab.labelNe : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {!hasAccessToFullKundali ? (
        <div className="space-y-6">
          {/* Unlocked Basic Charts & Planetary Preview */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
              <div>
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? '१. मुख्य जन्म लग्न कुण्डली (निःशुल्क पूर्वावलोकन)' : '1. Main Birth Lagna Chart (Free Preview)'}</span>
                </h3>
                <p className="text-xs text-amber-300/80">
                  {lang === 'ne' ? 'आधारभूत लग्न चक्र तथा ग्रह स्थिति' : 'Basic Lagna Chart and Planetary Degrees'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSubscriptionModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs shadow hover:brightness-110 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'सम्पूर्ण कुण्डली अनलक' : 'Unlock Full Kundali'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                title={lang === 'ne' ? '१. जन्म लग्न कुण्डली (D1 Rashi Chart)' : '1. Main Birth Rashi Chart (D1)'}
                activePlanetKeys={activePlanetKeys}
                activeDashaTitle={activeDashaTitle}
              />
              <PlanetaryPositionsTable planetPositions={planetList} lang={lang} />
            </div>
          </div>

          {/* Prominent Subscription Gate Card for full Cheena, 16 Divisional Charts, Dasha and Phalit */}
          <SubscriptionGateCard
            featureName={lang === 'ne' ? 'परम्परागत चिना, १६ वर्ग कुण्डली तथा विस्तृत फलित' : 'Traditional Cheena, 16 Divisional Charts & Phalit'}
            featureDescription={
              lang === 'ne'
                ? 'सम्पूर्ण परम्परागत नेपाली चिना (A4/Legal प्रिन्ट), विंशोत्तरी दशा सोपान, त्रिभागी दशा, योगिनी दशा, ग्रहबल तथा वार्षिक १२ भाव फलित अनलक गर्न आफ्नो अनुकूल योजना छनौट गर्नुहोस्।'
                : 'Unlock the complete formal Nepali Traditional Cheena, 16 Divisional Charts, Vimshottari/Tribhagi/Yogini Dashas, and deep annual 12-Bhava predictions.'
            }
          />
        </div>
      ) : (
        <>
          {/* 0. TRADITIONAL FORMAL CHEENA TAB */}
          {activeTab === 'cheena' && (
            <TraditionalCheenaView result={result} input={input} lang={lang} />
          )}

          {/* 0.5 YEARLY PHALIT PREDICTION TAB */}
          {activeTab === 'yearly' && (
            <YearlyPredictionSection result={result} input={input} lang={lang} />
          )}

          {/* 9. PHALADESH TAB */}
          {activeTab === 'phaladesh' && (
            <PhaladeshSection phaladesh={result.phaladesh} lang={lang} />
          )}
        </>
      )}

      {/* Calculation Audit Proof Modal */}
      {showAuditModal && (
        <CalculationAuditModal
          audit={result.audit}
          lang={lang}
          onClose={() => setShowAuditModal(false)}
        />
      )}
    </div>
  );
};
