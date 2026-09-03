import React, { useState, useMemo } from 'react';
import { KundaliResult, KundaliInput, Language, YearlyPredictionResult } from '../../types';
import { generateYearlyPrediction, toNepaliDigits } from '../../utils/yearlyPhalitEngine';
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
  Layers,
  Flame,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface YearlyPredictionSectionProps {
  result: KundaliResult;
  input: KundaliInput;
  lang: Language;
}

export const YearlyPredictionSection: React.FC<YearlyPredictionSectionProps> = ({
  result,
  input,
  lang
}) => {
  const currentRealYear = new Date().getFullYear();
  const [targetYear, setTargetYear] = useState<number>(currentRealYear);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabMode, setActiveTabMode] = useState<'topics' | 'foreign' | 'bhavas' | 'dasha' | 'ai'>('topics');

  // AI custom question
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Computed Yearly Prediction Result
  const prediction: YearlyPredictionResult = useMemo(() => {
    return generateYearlyPrediction(result, targetYear);
  }, [result, targetYear]);

  const birthYear = parseInt((input.birthDate || '2000').split('-')[0], 10) || 2000;
  const quickYears = [
    currentRealYear - 1,
    currentRealYear,
    currentRealYear + 1,
    currentRealYear + 2,
    currentRealYear + 3,
    currentRealYear + 5,
    currentRealYear + 10
  ];

  // Handle Ask AI Consultation
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const response = await fetch('/api/yearly-phalit-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          birthDate: result.birthDate,
          birthPlace: result.birthPlace,
          targetYear: prediction.yearAD,
          targetYearBS: prediction.yearBS,
          question: customQuestion,
          dashaSummary: prediction.dashaInfo.periodSummaryNe,
          lagna: result.lagna,
          rashi: result.rashi,
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
            : `Astrological consultation completed for year ${prediction.yearAD}.`
        );
      }
    } catch (err) {
      console.error(err);
      setAiAnswer(
        lang === 'ne'
          ? 'परामर्श सेवामा प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
          : 'Consultation service delayed. Please try again.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const categories = [
    { id: 'all', labelNe: '🌟 सबै ३० विषयहरू', labelEn: '🌟 All 30 Topics' },
    { id: 'foreign', labelNe: '✈️ विदेश यात्रा र कुन देश राम्रो', labelEn: '✈️ Foreign & Best Countries' },
    { id: 'career', labelNe: '💼 करियर, जागिर र व्यवसाय', labelEn: '💼 Career & Business' },
    { id: 'marriage', labelNe: '💍 विवाह र प्रेम सम्बन्ध', labelEn: '💍 Marriage & Romance' },
    { id: 'finance', labelNe: '💰 धन, सम्पत्ति र लगानी', labelEn: '💰 Wealth & Finance' },
    { id: 'health', labelNe: '🏥 स्वास्थ्य र सन्तान सुख', labelEn: '🏥 Health & Children' },
    { id: 'dasha', labelNe: '🕉️ दशा, ग्रह र अचुक उपाय', labelEn: '🕉️ Dasha & Remedies' }
  ];

  const filteredTopics = useMemo(() => {
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
  }, [prediction.topics, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* YEAR SELECTION CONTROL BAR */}
      <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-amber-950/70 p-3.5 sm:p-4 rounded-xl border border-amber-800/50">
          {/* Stepper */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              type="button"
              onClick={() => setTargetYear((prev) => Math.max(birthYear, prev - 1))}
              className="p-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/60 transition-all hover:scale-105"
              title="अघिल्लो वर्ष"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center px-4 py-1.5 bg-black/80 rounded-xl border border-amber-600/60 shadow-inner">
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                {lang === 'ne' ? 'वर्ष विश्लेषण (Year Forecast)' : 'Target Year'}
              </div>
              <div className="font-serif font-bold text-xl sm:text-2xl text-amber-200 flex items-center justify-center gap-2">
                <span>{targetYear} AD</span>
                <span className="text-sm text-amber-400">/ वि.सं. {toNepaliDigits(prediction.yearBS)} BS</span>
              </div>
              <div className="text-[11px] text-amber-300 font-sans font-medium">
                {lang === 'ne' ? `जातकको उमेर: ${prediction.ageTextNe}` : `Age: ${prediction.ageTextEn}`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTargetYear((prev) => prev + 1)}
              className="p-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700/60 transition-all hover:scale-105"
              title="पछिल्लो वर्ष"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick choices */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
            <span className="text-xs text-amber-400/80 mr-1 font-sans">
              {lang === 'ne' ? 'द्रुत चयन:' : 'Quick Jump:'}
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
                  {yr} AD ({toNepaliDigits(yr + 57)} BS){yr === currentRealYear ? (lang === 'ne' ? ' • चालु' : ' • Current') : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Range Slider */}
        <div className="px-2 space-y-1.5">
          <div className="flex justify-between text-[11px] text-amber-400/80">
            <span>जन्म: {birthYear} AD ({toNepaliDigits(birthYear + 57)} BS)</span>
            <span className="font-bold text-amber-300">
              छनौट: {targetYear} AD ({toNepaliDigits(prediction.yearBS)} BS) — {prediction.ageTextNe}
            </span>
            <span>दीर्घायु: {birthYear + 85} AD ({toNepaliDigits(birthYear + 85 + 57)} BS)</span>
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

      {/* DASHBOARD 3-BOX SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Dasha */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'सक्रिय दशा स्थिति' : 'Active Dasha Status'}</span>
            </span>
            <span className="bg-amber-800/50 text-amber-200 px-2 py-0.5 rounded text-[10px]">
              {lang === 'ne' ? prediction.dashaInfo.dashaLordDignityNe : prediction.dashaInfo.dashaLordDignityEn}
            </span>
          </div>
          <div className="font-serif font-bold text-lg text-amber-100">
            {lang === 'ne'
              ? `${prediction.dashaInfo.mahadashaNe} महादशा`
              : `${prediction.dashaInfo.mahadashaEn} Mahadasha`}
          </div>
          <p className="text-xs text-amber-300/90 font-sans">
            {lang === 'ne'
              ? `👉 ${prediction.dashaInfo.antardashaNe} अन्तर्दशा र ${prediction.dashaInfo.pratyantardashaNe} प्रत्यन्तर`
              : `👉 ${prediction.dashaInfo.antardashaEn} Antar & ${prediction.dashaInfo.pratyantardashaEn} Pratyantar`}
          </p>
          <div className="text-[11px] text-amber-400/80 pt-1 border-t border-amber-800/40">
            {lang === 'ne'
              ? `${prediction.dashaInfo.mahadashaNe} कुण्डलीको ${prediction.dashaInfo.mahadashaLordHouse} औँ भावमा अवस्थित छ।`
              : `${prediction.dashaInfo.mahadashaEn} is situated in House ${prediction.dashaInfo.mahadashaLordHouse}.`}
          </div>
        </div>

        {/* Score */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'वार्षिक शुभता दर' : 'Auspiciousness Rating'}</span>
            </span>
            <span className="text-sm font-bold text-amber-200">{prediction.overallScore}%</span>
          </div>
          <div className="font-serif font-bold text-lg text-amber-100">
            {lang === 'ne' ? prediction.overallRatingNe : prediction.overallRatingEn}
          </div>
          <div className="w-full bg-amber-950 rounded-full h-2 overflow-hidden border border-amber-800/60">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${prediction.overallScore}%` }}
            />
          </div>
          <div className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
            {lang === 'ne' ? 'कर्मक्षेत्र र भाग्यमा अनुकूल प्रभाव।' : 'Harmonious career and fortune alignments.'}
          </div>
        </div>

        {/* Auspicious Months */}
        <div className="bg-gradient-to-br from-amber-950/80 to-black p-4 rounded-xl border border-amber-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'प्रमुख शुभ महिनाहरू' : 'Key Auspicious Months'}</span>
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
          <p className="text-[11px] text-amber-400/80 pt-1 border-t border-amber-800/40">
            {lang === 'ne' ? 'नयाँ काम र भिसा आवेदनका लागि सर्वोत्तम समय।' : 'Optimal period for ventures & visa applications.'}
          </p>
        </div>
      </div>

      {/* OVERALL FORECAST SUMMARY */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border border-amber-600/60 rounded-xl shadow-xl space-y-2">
        <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'ne'
              ? `वर्ष ${targetYear} AD (वि.सं. ${toNepaliDigits(prediction.yearBS)} BS) को समग्र फलित:`
              : `Comprehensive Forecast for ${targetYear} AD (BS ${prediction.yearBS}):`}
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
          {lang === 'ne' ? prediction.overallSummaryNe : prediction.overallSummaryEn}
        </p>
      </div>

      {/* SUB-TABS */}
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
          <span>{lang === 'ne' ? '१. ३० क्षेत्रको सटिक फलित' : '1. 30 Life Domains'}</span>
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
          <span>{lang === 'ne' ? '२. विदेश यात्रा र कुन देश राम्रो' : '2. Foreign Destinations'}</span>
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
          <span>{lang === 'ne' ? '३. १२ भाव वार्षिक विश्लेषण' : '3. 12 Houses Analysis'}</span>
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
          <span>{lang === 'ne' ? '४. दशा गोचर र अचुक उपाय' : '4. Dasha & Vedic Remedies'}</span>
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
          <span>{lang === 'ne' ? '५. पण्डितजीसँग व्यक्तिगत प्रश्न' : '5. Ask Astrologer'}</span>
        </button>
      </div>

      {/* TAB 1: 30 TOPICS */}
      {activeTabMode === 'topics' && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-amber-950/60 p-3 rounded-xl border border-amber-800/50">
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

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-400" />
              <input
                type="text"
                placeholder={lang === 'ne' ? 'विषय खोज्नुहोस्...' : 'Search domain...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-amber-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-amber-500/60 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gradient-to-b from-amber-950/70 to-black/90 border border-amber-800/60 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-amber-800/50">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-amber-400/80 uppercase font-semibold">
                      {lang === 'ne' ? topic.categoryNe : topic.categoryEn}
                    </div>
                    <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
                      <span>{lang === 'ne' ? topic.topicNe : topic.topicEn}</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-600/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {lang === 'ne' ? topic.ratingNe : topic.ratingEn}
                    </span>
                    <div className="text-[10px] text-amber-400/70 font-mono mt-0.5">
                      {lang === 'ne' ? 'शुभता:' : 'Rating:'} {topic.score}%
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans">
                  {lang === 'ne' ? topic.predictionNe : topic.predictionEn}
                </p>

                <div className="pt-2 border-t border-amber-800/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400 font-semibold">{lang === 'ne' ? '🌟 कारक ग्रह: ' : '🌟 Ruling Grahas: '}</span>
                    <span className="text-amber-200">{lang === 'ne' ? topic.rulingPlanetsNe : topic.rulingPlanetsEn}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 font-semibold">{lang === 'ne' ? '📅 शुभ महिना: ' : '📅 Auspicious Months: '}</span>
                    <span className="text-amber-200">{lang === 'ne' ? topic.auspiciousMonthsNe : topic.auspiciousMonthsEn}</span>
                  </div>
                </div>

                {((lang === 'ne' ? topic.remediesNe : topic.remediesEn) || []).length > 0 && (
                  <div className="p-2.5 bg-amber-900/20 rounded-lg border border-amber-800/40 text-[11px] text-amber-300 space-y-1">
                    <span className="font-bold text-amber-200 block">{lang === 'ne' ? '🌿 फलदायक वैदिक उपाय:' : '🌿 Recommended Vedic Remedies:'}</span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-300/90">
                      {(lang === 'ne' ? topic.remediesNe : topic.remediesEn)?.map((r, rIdx) => (
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

      {/* TAB 2: FOREIGN TRAVEL */}
      {activeTabMode === 'foreign' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg pb-2 border-b border-amber-800/60">
              <Plane className="w-5 h-5 text-amber-400" />
              <span>{lang === 'ne' ? 'विदेश यात्रा, भिसा तथा कुन देश जाँदा राम्रो भन्ने सटिक विश्लेषण' : 'Foreign Travel, Visa Timing & Recommended Countries'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1">
                <span className="text-amber-400 font-semibold block uppercase text-[10px]">
                  {lang === 'ne' ? 'वैदेशिक योग सामर्थ्य' : 'Foreign Travel Potential'}
                </span>
                <span className="font-serif font-bold text-amber-100 text-sm">
                  {lang === 'ne' ? prediction.foreignTravelAnalysis.travelYogaStrengthNe : prediction.foreignTravelAnalysis.travelYogaStrengthEn}
                </span>
                <p className="text-[11px] text-amber-300/80">
                  {lang === 'ne'
                    ? `१२ औँ भाव (${result.houseDetails?.[11]?.signNe || 'मीन'}) र राहुको अनुकूल प्रभाव।`
                    : `12th House (${result.houseDetails?.[11]?.signEn || 'Pisces'}) and Rahu benefic aspect.`}
                </p>
              </div>

              <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1">
                <span className="text-amber-400 font-semibold block uppercase text-[10px]">
                  {lang === 'ne' ? 'स्थायी बसोबास (PR) सम्भावना' : 'Permanent Settlement (PR)'}
                </span>
                <span className="font-serif font-bold text-amber-100 text-sm">
                  {lang === 'ne' ? 'शतप्रतिशत अनुकूल योग' : 'High Favorable Alignment'}
                </span>
                <p className="text-[11px] text-amber-300/80">
                  {lang === 'ne' ? 'उच्च शिक्षा र दक्ष जनशक्ति (Skilled PR) का माध्यमबाट।' : 'Through higher academia and skilled professional pathways.'}
                </p>
              </div>

              <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1">
                <span className="text-amber-400 font-semibold block uppercase text-[10px]">
                  {lang === 'ne' ? 'भिसा सफलताको उत्तम समय' : 'Best Visa Filing Window'}
                </span>
                <span className="font-serif font-bold text-amber-100 text-sm">
                  {lang === 'ne' ? 'भाद्र, असोज, माघ र चैत्र' : 'September, October, February & April'}
                </span>
                <p className="text-[11px] text-amber-300/80">
                  {lang === 'ne' ? 'कागजात तयार गर्दा पूर्व वा उत्तर फर्केर हस्ताक्षर गर्नुहोस्।' : 'Face East or North when signing essential documents.'}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/90 font-sans leading-relaxed bg-amber-950/60 p-3.5 rounded-xl border border-amber-800/40">
              💡 <strong className="text-amber-300">{lang === 'ne' ? 'पण्डित शम्भु प्रसाद लम्सालको सटिक परामर्श:' : 'Astrological Counsel:'}</strong>{' '}
              {lang === 'ne' ? prediction.foreignTravelAnalysis.bestCountryAdviceNe : prediction.foreignTravelAnalysis.bestCountryAdviceEn}
            </p>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>{lang === 'ne' ? 'तपाईँको कुण्डली अनुसार देशहरूको उपयुक्तता क्रमबद्ध विवरण:' : 'Ranked Country Compatibility for Your Horoscope:'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prediction.foreignTravelAnalysis.recommendedDestinations.map((dest, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-amber-950/80 to-black border border-amber-800/70 hover:border-amber-500 rounded-2xl p-5 shadow-xl space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-amber-800/50">
                    <div>
                      <div className="text-[10px] text-amber-400 uppercase font-semibold">
                        {lang === 'ne' ? `प्राथमिकता क्रम #${idx + 1} • ${dest.regionNe}` : `Priority #${idx + 1} • ${dest.regionEn}`}
                      </div>
                      <h4 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                        <span>{lang === 'ne' ? dest.countryNe : dest.countryEn}</span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="bg-amber-500 text-amber-950 font-bold text-xs px-2.5 py-0.5 rounded-full shadow">
                        {lang === 'ne' ? dest.gradeNe : dest.gradeEn} ({dest.suitabilityScore}%)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-amber-200/90 font-sans">
                    <div>
                      <strong className="text-amber-300">{lang === 'ne' ? '🎯 सर्वोत्तम प्रयोजन: ' : '🎯 Optimal Purpose: '}</strong>
                      <span>{lang === 'ne' ? dest.favorablePurposeNe : dest.favorablePurposeEn}</span>
                    </div>
                    <div>
                      <strong className="text-amber-300">{lang === 'ne' ? '🧭 अनुकूल दिशा: ' : '🧭 Favorable Direction: '}</strong>
                      <span>{lang === 'ne' ? dest.directionNe : dest.directionEn}</span>
                    </div>
                    <div>
                      <strong className="text-amber-300">{lang === 'ne' ? '📅 शुभ महिना: ' : '📅 Best Timing: '}</strong>
                      <span>{lang === 'ne' ? dest.favorableMonthsNe : dest.favorableMonthsEn}</span>
                    </div>
                    <div className="p-2.5 bg-amber-900/30 rounded-lg border border-amber-800/40">
                      <strong className="text-amber-300 block mb-1">{lang === 'ne' ? '🪐 ज्योतिषीय कारण:' : '🪐 Astrological Rationale:'}</strong>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        {lang === 'ne' ? dest.planetaryReasonNe : dest.planetaryReasonEn}
                      </p>
                    </div>
                    <div className="text-[11px] text-amber-400">
                      <strong>{lang === 'ne' ? '🌿 सफलता उपाय: ' : '🌿 Success Remedy: '}</strong>
                      <span>{lang === 'ne' ? dest.remedyNe : dest.remedyEn}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 12 BHAVAS */}
      {activeTabMode === 'bhavas' && (
        <div className="space-y-5">
          <div className="bg-amber-950/70 p-4 rounded-xl border border-amber-800/50 text-xs sm:text-sm text-amber-200">
            📖 <strong>{lang === 'ne' ? '१२ भाव वार्षिक फलादेश:' : '12 Houses Annual Forecast:'}</strong> {lang === 'ne' ? `कुण्डलीका १२ भावहरूको वर्ष ${targetYear} मा ग्रह स्थिति र फलादेश:` : `Astrological overview of all 12 Houses in Year ${targetYear}:`}
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
                      {lang === 'ne'
                        ? `भाव #${bhava.houseNum} • ${bhava.signNe} (${bhava.signLordNe})`
                        : `House #${bhava.houseNum} • ${bhava.signEn} (${bhava.signLordEn})`}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-amber-100">
                      {lang === 'ne' ? bhava.titleNe : bhava.titleEn}
                    </h4>
                  </div>
                  <span className="bg-amber-900/60 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-700 font-bold">
                    {bhava.statusScore}%
                  </span>
                </div>

                <div className="text-[11px] text-amber-400/90 font-medium italic">
                  {lang === 'ne' ? `विषय: ${bhava.coreThemesNe}` : `Themes: ${bhava.coreThemesEn}`}
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  {lang === 'ne' ? bhava.analysisNe : bhava.analysisEn}
                </p>

                <div className="pt-2 border-t border-amber-800/40 space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 block">{lang === 'ne' ? 'मुख्य अपेक्षित उपलब्धि:' : 'Key Anticipated Milestones:'}</span>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5">
                    {(lang === 'ne' ? bhava.keyEventsNe : bhava.keyEventsEn).map((ev, eIdx) => (
                      <li key={eIdx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DASHA & REMEDIES */}
      {activeTabMode === 'dasha' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-950/80 to-black p-5 sm:p-6 rounded-2xl border border-amber-600/70 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{lang === 'ne' ? `वर्ष ${targetYear} को दशा–अन्तर्दशा तथा ग्रहशान्ति विधि` : `Year ${targetYear} Dasha, Antardasha & Vedic Remedies`}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  {lang === 'ne' ? 'वर्तमान सक्रिय दशा स्थिति:' : 'Active Dasha Influences:'}
                </h4>
                <p className="text-amber-200/90 leading-relaxed">
                  {lang === 'ne' ? prediction.dashaInfo.periodSummaryNe : prediction.dashaInfo.periodSummaryEn}
                </p>
                <div className="text-[11px] text-amber-400 pt-2 border-t border-amber-800/40">
                  {lang === 'ne'
                    ? `दशा स्वामी ${prediction.dashaInfo.mahadashaNe} कुण्डलीको ${prediction.dashaInfo.mahadashaLordHouse} औँ भावमा शुभ बलमा रहेको छ।`
                    : `Dasha Lord ${prediction.dashaInfo.mahadashaEn} is placed auspiciously in House ${prediction.dashaInfo.mahadashaLordHouse}.`}
                </div>
              </div>

              <div className="p-4 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-sm text-amber-100">
                  {lang === 'ne' ? 'वार्षिक ग्रहशान्ति एवं शुभ मन्त्र:' : 'Annual Planetary Shanti Mantra:'}
                </h4>
                <p className="text-amber-200/90 leading-relaxed">
                  {lang === 'ne'
                    ? `${prediction.dashaInfo.mahadashaNe} ग्रहको बीज मन्त्र नित्य १०८ पटक जप गर्नुहोला।`
                    : `Chant the Beej Mantra of ${prediction.dashaInfo.mahadashaEn} 108 times daily.`}
                </p>
                <div className="text-[11px] text-amber-300 font-mono bg-black/60 p-2 rounded border border-amber-700/50">
                  ॐ ह्रां ह्रीं ह्रौं सः {prediction.dashaInfo.mahadashaNe === 'सूर्य' ? 'सूर्याय' : prediction.dashaInfo.mahadashaNe === 'चन्द्रमा' ? 'चन्द्रमसे' : prediction.dashaInfo.mahadashaNe === 'मंगल' ? 'भौमाय' : prediction.dashaInfo.mahadashaNe === 'बुध' ? 'बुधाय' : prediction.dashaInfo.mahadashaNe === 'बृहस्पति' ? 'गुरवे' : prediction.dashaInfo.mahadashaNe === 'शुक्र' ? 'शुक्राय' : prediction.dashaInfo.mahadashaNe === 'शनि' ? 'शनैश्चराय' : prediction.dashaInfo.mahadashaNe === 'राहु' ? 'राहवे' : 'केतवे'} नमः
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-2">
              <h4 className="font-serif font-bold text-amber-200 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ne' ? 'वर्षभरिका अचुक वैदिक कल्याणकारी उपायहरू:' : 'Prescribed Annual Vedic Remedies:'}</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-200/90 font-sans">
                {(lang === 'ne' ? prediction.yearlyRemediesNe : prediction.yearlyRemediesEn).map((rem, idx) => (
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

      {/* TAB 5: ASK AI */}
      {activeTabMode === 'ai' && (
        <div className="bg-gradient-to-br from-amber-950/90 via-black to-amber-950/90 border border-amber-600/70 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="space-y-1 pb-3 border-b border-amber-800/60">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-serif font-bold text-xs">
                ॐ
              </span>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                {lang === 'ne'
                  ? `पण्डित शम्भु प्रसाद लम्सालसँग वर्ष ${targetYear} को परामर्श`
                  : `Personal Consultation for Year ${targetYear}`}
              </h3>
            </div>
            <p className="text-xs text-amber-300/80">
              {lang === 'ne'
                ? 'यस वर्षको विवाह, जागिर, विदेश यात्रा (कुन देश राम्रो), व्यापार वा स्वास्थ्य सम्बन्धी कुनै पनि जिज्ञासा सोध्नुहोस्।'
                : 'Ask any specific questions regarding marriage, career, foreign destinations, business, or health for this year.'}
            </p>
          </div>

          <form onSubmit={handleAskAI} className="space-y-3">
            <textarea
              rows={3}
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={lang === 'ne' ? `वर्ष ${targetYear} को बारेमा आफ्नो कुनै पनि प्रश्न यहाँ लेख्नुहोस्...` : `Type your specific question for Year ${targetYear}...`}
              className="w-full bg-black/80 border border-amber-700/70 rounded-xl p-3.5 text-sm text-amber-100 placeholder-amber-500/50 focus:border-amber-400 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAiLoading || !customQuestion.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-serif font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                    <span>{lang === 'ne' ? 'विश्लेषण चल्दैछ...' : 'Analyzing Horoscope...'}</span>
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

          {aiAnswer && (
            <div className="p-5 bg-gradient-to-b from-amber-900/30 to-black border border-amber-500/70 rounded-xl shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm pb-2 border-b border-amber-800/50">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ne' ? `पण्डित शम्भु प्रसाद लम्सालको सटिक फलादेश (वर्ष ${targetYear}):` : `Astrological Reading (Year ${targetYear}):`}</span>
              </div>
              <div className="text-xs sm:text-sm text-amber-100 leading-relaxed whitespace-pre-line font-sans">
                {aiAnswer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
