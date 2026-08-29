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
          {/* Unlocked 3 Basic Charts & Planetary Preview */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-5 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-800/50 gap-3">
              <div>
                <h3 className="font-serif font-bold text-amber-100 text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>
                    {lang === 'ne'
                      ? 'निःशुल्क ३ कुण्डली (१. जन्म लग्न, २. चन्द्र कुण्डली, ३. नवमांश)'
                      : '3 Free Charts (1. Lagna, 2. Moon Chart, 3. Navamsha)'}
                  </span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {lang === 'ne'
                    ? 'तपाईंले निःशुल्क ३ वटा मुख्य कुण्डली र ग्रह स्पष्ट स्थिति हेर्न सक्नुहुन्छ। बाँकी १४ वर्ग कुण्डली, परम्परागत चिना र फलित हेर्न सदस्यता लिनुहोस् वा Lifetime Key हाल्नुहोस्।'
                    : 'Preview the 3 core Kundalis and Planetary positions. To open all 17 Kundali, Cheena & Phalit, please activate a Lifetime Key or subscription.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSubscriptionModal(lang === 'ne' ? '१७ कुण्डली र परम्परागत चिना' : '17 Kundali & Cheena')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>{lang === 'ne' ? '१७ कुण्डली र चिना अनलक गर्नुहोस्' : 'Unlock All 17 Kundali & Cheena'}</span>
              </button>
            </div>

            {/* 3 Free Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* 1. Main Lagna D1 Chart */}
              <div className="bg-stone-950/60 p-4 rounded-xl border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-300">
                    {lang === 'ne' ? '१. जन्म लग्न कुण्डली (D1)' : '1. Birth Lagna Chart (D1)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                    {lang === 'ne' ? 'निःशुल्क (FREE)' : 'FREE'}
                  </span>
                </div>
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
                  title={lang === 'ne' ? '१. जन्म लग्न कुण्डली (D1)' : '1. Birth Lagna Chart (D1)'}
                  activePlanetKeys={activePlanetKeys}
                  activeDashaTitle={activeDashaTitle}
                />
              </div>

              {/* 2. Chandra Kundali (Moon Chart) */}
              <div className="bg-stone-950/60 p-4 rounded-xl border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-300">
                    {lang === 'ne' ? '२. चन्द्र कुण्डली (Moon Chart)' : '2. Chandra Kundali (Moon Chart)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                    {lang === 'ne' ? 'निःशुल्क (FREE)' : 'FREE'}
                  </span>
                </div>
                {(() => {
                  const rashiNeArr = ['मेष', 'वृष', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
                  const moonP = planetList.find((p) => p.id === 'moon');
                  const moonSignIdx = moonP?.signIndex ?? (d1Chart?.houses[0]?.signIndex || 0);
                  const chandraHouses = Array.from({ length: 12 }, (_, i) => {
                    const signIdx = (moonSignIdx + i) % 12;
                    const planetsInSign = planetList.filter((p) => p.signIndex === signIdx).map((p) => p.nepaliName);
                    return {
                      house: i + 1,
                      sign: rashiNeArr[signIdx],
                      planets: planetsInSign
                    };
                  });
                  return (
                    <KundaliChartNorth
                      houses={chandraHouses}
                      planetPositions={planetList}
                      lagnaSignIndex={moonSignIdx}
                      lang={lang}
                      title={lang === 'ne' ? '२. चन्द्र कुण्डली (Moon Chart)' : '2. Chandra Kundali (Moon Chart)'}
                      activePlanetKeys={activePlanetKeys}
                    />
                  );
                })()}
              </div>

              {/* 3. Navamsha D9 Chart */}
              <div className="bg-stone-950/60 p-4 rounded-xl border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-300">
                    {lang === 'ne' ? '३. नवमांश कुण्डली (D9)' : '3. Navamsha Chart (D9)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                    {lang === 'ne' ? 'निःशुल्क (FREE)' : 'FREE'}
                  </span>
                </div>
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
                  title={lang === 'ne' ? '३. नवमांश कुण्डली (D9 Navamsha)' : '3. Navamsha Chart (D9)'}
                  activePlanetKeys={activePlanetKeys}
                />
              </div>
            </div>

            {/* Planetary Positions Table */}
            <div className="pt-2">
              <PlanetaryPositionsTable planetPositions={planetList} lang={lang} />
            </div>
          </div>

          {/* Prominent Subscription Gate Card for full Cheena, 16 Divisional Charts, Dasha and Phalit */}
          <SubscriptionGateCard
            featureName={lang === 'ne' ? '१७ कुण्डली, परम्परागत चिना तथा सम्पूर्ण फलित' : '17 Kundali, Traditional Cheena & Complete Phalit'}
            featureDescription={
              lang === 'ne'
                ? 'सम्पूर्ण १६ वर्ग कुण्डली (षोडशवर्ग D1 देखि D60), विंशोत्तरी महादशा-अन्तर्दशा, त्रिभागी दशा, योगिनी दशा, ग्रहबल तथा A4 साइजको परम्परागत नेपाली चिना डाउनलोड तथा प्रिन्ट गर्न आफ्नो सदस्यता योजना छनौट गर्नुहोस् वा Lifetime Key हाल्नुहोस्।'
                : 'Unlock all 16 Divisional Charts (Shodashvarga D1 to D60), Vimshottari/Tribhagi/Yogini Dashas, Graha Bala, and traditional Cheena PDF print.'
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
