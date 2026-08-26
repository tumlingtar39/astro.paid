import React, { useState } from 'react';
import { getLiveDailyRashifal, convertADtoBS } from '../utils/panchang';
import { PanchangaCard } from './PanchangaCard';
import { Language, RashifalItem } from '../types';
import { Calendar, Star, Search, Briefcase, Heart, Activity, DollarSign, Shield, Bot, RefreshCw, X, Clock } from 'lucide-react';

interface DailyRashifalSectionProps {
  lang: Language;
}

export const DailyRashifalSection: React.FC<DailyRashifalSectionProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [aiModalRashi, setAiModalRashi] = useState<RashifalItem | null>(null);
  const [aiPredictionText, setAiPredictionText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Dynamic live dataset generated for the selected date
  const currentDataset: RashifalItem[] = getLiveDailyRashifal(selectedDate, activeTab, lang);

  const filteredRashifal = currentDataset.filter(item =>
    item.rashi.includes(searchTerm) ||
    item.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bsInfo = convertADtoBS(selectedDate);
  const dateStrAd = selectedDate.toISOString().split('T')[0];

  const handleFetchAiRashifal = async (item: RashifalItem) => {
    setAiModalRashi(item);
    setAiPredictionText('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/rashifal-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rashi: item.rashi,
          period: activeTab,
          language: lang,
          targetDate: dateStrAd
        })
      });

      const data = await res.json();
      if (res.ok && data.predictionText) {
        setAiPredictionText(data.predictionText);
      } else {
        setAiPredictionText(
          lang === 'en'
            ? `Om Namah Shivaya! For ${item.englishName} (${item.rashi}), this date (${selectedDate.toDateString()}) brings favorable progress and positive planetary energy. Praying to your Ishta Devata will help remove hurdles.`
            : `ॐ नमः शिवाय! ${item.rashi} राशीका लागि यो मिति (${bsInfo.formatted}) मा शुभ र फलदायी समय रहनेछ। नित्य इष्टदेवको आराधना गर्दा रोकिएका काम बन्नेछन्।`
        );
      }
    } catch (err) {
      console.error(err);
      setAiPredictionText(
        lang === 'en'
          ? `Om Namah Shivaya! For ${item.englishName} (${item.rashi}), this period brings divine positivity and auspicious opportunities.`
          : `ॐ नमः शिवाय! ${item.rashi} राशीका लागि यो मितिमा सकारात्मक ऊर्जा र अवसर प्राप्त हुनेछ।`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Panchanga Card - Placed BEFORE Rashifal */}
      <PanchangaCard lang={lang} />

      {/* Rashifal Section Header & Live Date Picker Switcher */}
      <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 p-5 rounded-2xl border border-amber-700/60 shadow-lg text-center space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-950/80 text-rose-300 border border-rose-700/60 text-xs px-3 py-1 rounded-full font-bold mb-2 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? '🔴 प्रत्यक्ष दैनिक स्वचालित परिवर्तनशील राशिफल (Live Daily Rashifal)' : '🔴 Live Auto-Updating Daily Horoscope'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 flex items-center justify-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>
              {lang === 'ne'
                ? `लाइभ राशिफल — ${bsInfo.formatted}`
                : `Live Horoscope — ${selectedDate.toDateString()}`}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-300/90 mt-1 max-w-2xl mx-auto">
            {lang === 'ne'
              ? 'ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) द्वारा दैनिक गोचर ग्रह-नक्षत्र गणना गरी प्रकाशित राशिफल।'
              : 'Authentic daily dynamic horoscope calculated using live planetary transits by Pandit Shambhu Prasad Lamsal.'}
          </p>
        </div>

        {/* Date Selection Controls */}
        <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60 max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-300 block">
            {lang === 'ne' ? '📅 मिति रोज्नुहोस् (Select Date for Live Rashifal):' : '📅 Choose Date:'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleQuickDate(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate.toDateString() === new Date().toDateString()
                  ? 'bg-amber-500 text-amber-950 border-amber-400 shadow'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/50 hover:bg-amber-800/60'
              }`}
            >
              {lang === 'ne' ? 'आज (Today)' : 'Today'}
            </button>
            <button
              onClick={() => handleQuickDate(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                  ? 'bg-amber-500 text-amber-950 border-amber-400 shadow'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/50 hover:bg-amber-800/60'
              }`}
            >
              {lang === 'ne' ? 'भोलि (Tomorrow)' : 'Tomorrow'}
            </button>
            <button
              onClick={() => handleQuickDate(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate.toDateString() === new Date(Date.now() + 172800000).toDateString()
                  ? 'bg-amber-500 text-amber-950 border-amber-400 shadow'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/50 hover:bg-amber-800/60'
              }`}
            >
              {lang === 'ne' ? 'पर्सि (Day After)' : 'Day After'}
            </button>

            {/* Custom Date Input */}
            <input
              type="date"
              value={dateStrAd}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                }
              }}
              className="bg-amber-900/80 border border-amber-600 rounded-lg px-2.5 py-1 text-xs text-amber-100 font-sans focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Period Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center bg-amber-950/80 p-1.5 rounded-xl border border-amber-700/60 gap-1.5">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <span>📅</span>
            <span>{lang === 'ne' ? 'दैनिक (Daily)' : 'Daily'}</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <span>🗓️</span>
            <span>{lang === 'ne' ? 'साप्ताहिक (Weekly)' : 'Weekly'}</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <span>🌙</span>
            <span>{lang === 'ne' ? 'मासिक (Monthly)' : 'Monthly'}</span>
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'yearly'
                ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
            }`}
          >
            <span>🔮</span>
            <span>{lang === 'ne' ? 'वार्षिक (२०८३)' : 'Yearly (2083)'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'ne' ? 'राशी खोज्नुहोस् (उदा: मेष, Singh, Virgo...)' : 'Search your Rashi (e.g., Aries, Leo...)'}
          className="w-full bg-amber-950/60 border border-amber-700/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-500 pl-10"
        />
        <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
      </div>

      {/* Rashifal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRashifal.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-amber-950/90 to-amber-900/40 p-4 sm:p-5 rounded-2xl border border-amber-800/60 shadow-xl hover:border-amber-500/80 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Card Top Bar */}
              <div className="flex items-center justify-between border-b border-amber-800/50 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-bold text-amber-400 bg-amber-900/70 w-11 h-11 rounded-full flex items-center justify-center border border-amber-700/60 shadow">
                    {item.symbol}
                  </span>
                  <div>
                    <h3 className="font-bold font-serif text-lg text-amber-100">{item.rashi}</h3>
                    <span className="text-xs text-amber-400">{item.englishName}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-800/60'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Period Label if any */}
              {item.periodLabel && (
                <div className="text-[11px] font-semibold text-amber-300 bg-amber-900/50 px-2.5 py-1 rounded-md inline-block">
                  {item.periodLabel}
                </div>
              )}

              {/* Main Summary Prediction */}
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
                {item.prediction}
              </p>

              {/* Aspect Pills (Career, Love, Health, Finance) */}
              <div className="space-y-1.5 text-xs bg-amber-950/60 p-3 rounded-xl border border-amber-800/50">
                {item.career && (
                  <div className="flex items-start gap-1.5 text-amber-200">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-amber-300">{lang === 'ne' ? 'करियर:' : 'Career:'}</strong> {item.career}</span>
                  </div>
                )}
                {item.love && (
                  <div className="flex items-start gap-1.5 text-amber-200">
                    <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong className="text-rose-300">{lang === 'ne' ? 'प्रेम:' : 'Love:'}</strong> {item.love}</span>
                  </div>
                )}
                {item.health && (
                  <div className="flex items-start gap-1.5 text-amber-200">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-300">{lang === 'ne' ? 'स्वास्थ्य:' : 'Health:'}</strong> {item.health}</span>
                  </div>
                )}
                {item.finance && (
                  <div className="flex items-start gap-1.5 text-amber-200">
                    <DollarSign className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <span><strong className="text-yellow-300">{lang === 'ne' ? 'वित्त:' : 'Finance:'}</strong> {item.finance}</span>
                  </div>
                )}
              </div>

              {/* Remedy */}
              {item.remedy && (
                <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/40 text-xs text-amber-300/90 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-200">{lang === 'ne' ? 'ग्रह शान्ति उपाय:' : 'Astrological Remedy:'}</span>
                    <span>{item.remedy}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Lucky Attributes & AI Live Button */}
            <div className="space-y-2 pt-2 border-t border-amber-800/50">
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-amber-900/30 p-2 rounded-xl border border-amber-800/30 text-center">
                <div>
                  <span className="text-amber-400 block font-semibold">{lang === 'ne' ? 'शुभ अंक:' : 'Lucky No:'}</span>
                  <span className="font-bold text-amber-100 text-xs">{item.luckyNumber}</span>
                </div>
                <div>
                  <span className="text-amber-400 block font-semibold">{lang === 'ne' ? 'शुभ रङ:' : 'Lucky Color:'}</span>
                  <span className="font-bold text-amber-100 text-xs">{item.luckyColor}</span>
                </div>
              </div>

              <button
                onClick={() => handleFetchAiRashifal(item)}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-50 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Bot className="w-4 h-4 text-amber-200" />
                <span>{lang === 'ne' ? '🤖 एआई प्रत्यक्ष विस्तृत विश्लेषण' : '🤖 Live AI Rashifal Breakdown'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Live Rashifal Modal */}
      {aiModalRashi && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amber-950 border border-amber-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-amber-100">
            <button
              onClick={() => setAiModalRashi(null)}
              className="absolute top-4 right-4 text-amber-400 hover:text-amber-100 bg-amber-900/60 p-1.5 rounded-full border border-amber-700/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-800/80 pb-4">
              <span className="text-3xl text-amber-400 bg-amber-900/80 w-12 h-12 rounded-full flex items-center justify-center border border-amber-700">
                {aiModalRashi.symbol}
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-amber-200 flex items-center gap-2">
                  <span>{lang === 'ne' ? aiModalRashi.rashi : aiModalRashi.englishName} ( {lang === 'ne' ? aiModalRashi.englishName : aiModalRashi.rashi} )</span>
                  <span className="text-xs bg-amber-800/60 text-amber-300 px-2.5 py-0.5 rounded-full font-sans font-normal">
                    {activeTab === 'daily'
                      ? (lang === 'ne' ? 'दैनिक' : 'Daily')
                      : activeTab === 'weekly'
                      ? (lang === 'ne' ? 'साप्ताहिक' : 'Weekly')
                      : (lang === 'ne' ? 'वार्षिक' : 'Yearly')}
                  </span>
                </h3>
                <p className="text-xs text-amber-400">
                  {lang === 'ne'
                    ? 'पण्डित शम्भु प्रसाद लम्साल (Binay) एआई ज्योतिषीय विश्लेषण'
                    : 'Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay) AI Reading'}
                </p>
              </div>
            </div>

            {isAiLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm text-amber-300 font-serif">
                  {lang === 'ne'
                    ? `ॐ नमः शिवाय... एआई ज्योतिषाचार्यबाट ${aiModalRashi.rashi} राशीको विशेष फलकथन तयार हुँदैछ...`
                    : `Om Namah Shivaya... Preparing live AI horoscope breakdown for ${aiModalRashi.englishName}...`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-amber-100/90 whitespace-pre-line font-sans bg-amber-900/30 p-4 rounded-xl border border-amber-800/50">
                {aiPredictionText}
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => setAiModalRashi(null)}
                className="bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold text-xs px-6 py-2 rounded-xl"
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस् (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


