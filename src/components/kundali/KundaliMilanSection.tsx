import React, { useState, useEffect } from 'react';
import {
  Language,
  KundaliInput,
  KundaliMilanResult,
  DetailedPlanetPosition
} from '../../types';
import {
  RASHI_NAMES,
  NAKSHATRA_NAMES,
  calculateFullKundali,
  toDevanagariDigits
} from '../../utils/kundaliEngine';
import {
  matchKundalis,
  NAKSHATRA_AVAKHADA_TABLE
} from '../../utils/milanEngine';
import { CITY_PRESETS } from '../../utils/cityPresets';
import {
  Heart,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Award,
  AlertTriangle,
  Flame,
  User,
  Users,
  Copy,
  Printer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface KundaliMilanSectionProps {
  lang: Language;
}

export const KundaliMilanSection: React.FC<KundaliMilanSectionProps> = ({ lang }) => {
  const [matchMode, setMatchMode] = useState<'quick' | 'full'>('quick');

  // Quick Mode Form State (Default: Aries-Ashwini for Boy, Gemini-Ardra for Girl)
  const [boyRashiIdx, setBoyRashiIdx] = useState<number>(0);
  const [boyNakIdx, setBoyNakIdx] = useState<number>(0);
  const [boyPad, setBoyPad] = useState<number>(1);
  const [boyName, setBoyName] = useState<string>('वर (केटा)');

  const [girlRashiIdx, setGirlRashiIdx] = useState<number>(2);
  const [girlNakIdx, setGirlNakIdx] = useState<number>(5);
  const [girlPad, setGirlPad] = useState<number>(1);
  const [girlName, setGirlName] = useState<string>('वधू (केटी)');

  // Full Birth Details Mode State
  const [boyInput, setBoyInput] = useState<KundaliInput>({
    name: 'वर (केटा)',
    gender: 'male',
    birthDate: '1998-04-14',
    birthTime: '06:30',
    birthPlace: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 5.75
  });

  const [girlInput, setGirlInput] = useState<KundaliInput>({
    name: 'वधू (केटी)',
    gender: 'female',
    birthDate: '2000-08-20',
    birthTime: '14:15',
    birthPlace: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 5.75
  });

  const [milanResult, setMilanResult] = useState<KundaliMilanResult | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Auto-calculate matching on state change
  const computeMatch = () => {
    try {
      if (matchMode === 'quick') {
        const res = matchKundalis(
          { rashiIdx: boyRashiIdx, nakIdx: boyNakIdx, pad: boyPad, name: boyName },
          { rashiIdx: girlRashiIdx, nakIdx: girlNakIdx, pad: girlPad, name: girlName }
        );
        setMilanResult(res);
      } else {
        // Calculate full astronomical charts for Boy and Girl
        const boyKundali = calculateFullKundali(boyInput);
        const girlKundali = calculateFullKundali(girlInput);

        const boyMoon = boyKundali.planetPositions.find((p) => p.id === 'moon');
        const girlMoon = girlKundali.planetPositions.find((p) => p.id === 'moon');

        const bRashi = boyMoon ? boyMoon.rashiIndex : 0;
        const bNak = boyMoon ? boyMoon.nakshatraIndex : 0;
        const bPad = boyMoon ? boyMoon.pad : 1;

        const gRashi = girlMoon ? girlMoon.rashiIndex : 0;
        const gNak = girlMoon ? girlMoon.nakshatraIndex : 0;
        const gPad = girlMoon ? girlMoon.pad : 1;

        const res = matchKundalis(
          {
            rashiIdx: bRashi,
            nakIdx: bNak,
            pad: bPad,
            name: boyInput.name || 'वर (केटा)',
            planets: boyKundali.planetPositions
          },
          {
            rashiIdx: gRashi,
            nakIdx: gNak,
            pad: gPad,
            name: girlInput.name || 'वधू (केटी)',
            planets: girlKundali.planetPositions
          }
        );
        setMilanResult(res);
      }
    } catch (e) {
      console.error('Kundali Milan Calculation Error:', e);
    }
  };

  useEffect(() => {
    computeMatch();
  }, [
    matchMode,
    boyRashiIdx,
    boyNakIdx,
    boyPad,
    boyName,
    girlRashiIdx,
    girlNakIdx,
    girlPad,
    girlName,
    boyInput,
    girlInput
  ]);

  const handleCopyReport = () => {
    if (!milanResult) return;
    const text = `
========================================
ॐ श्री गणेशाय नमः | कुण्डली मिलान प्रतिवेदन (KUNDALI MILAN)
========================================
केटा (वर): ${milanResult.boyInfo.name} | राशि: ${milanResult.boyInfo.rashiNe} | नक्षत्र: ${milanResult.boyInfo.nakshatraNe} (${milanResult.boyInfo.pad} चरण) | स्वामी: ${milanResult.boyInfo.rashiLordNe}
केटी (वधू): ${milanResult.girlInfo.name} | राशि: ${milanResult.girlInfo.rashiNe} | नक्षत्र: ${milanResult.girlInfo.nakshatraNe} (${milanResult.girlInfo.pad} चरण) | स्वामी: ${milanResult.girlInfo.rashiLordNe}

----------------------------------------
कुल प्राप्ताङ्क: ${milanResult.totalPoints} / ३६ गुण (${milanResult.percentage}%)
निष्कर्ष: ${milanResult.verdictTitleNe}
विवरण: ${milanResult.verdictSummaryNe}
----------------------------------------

[ अष्टकूट ३६ गुण विभाजन ]
${milanResult.kootas
  .map(
    (k) =>
      `• ${k.nameNe}: ${k.obtainedPoints} / ${k.maxPoints} अंक | केटा: ${k.boyValue} | केटी: ${k.girlValue} | स्थिति: ${k.descriptionNe}`
  )
  .join('\n')}

[ मुख्य योग तथा दोष विश्लेषण ]
• भकूट सम्बन्ध: ${milanResult.bhakootRelation.nameNe} (${milanResult.bhakootRelation.relationLabelNe})
  ${milanResult.bhakootRelation.descriptionNe}
• नाडी दोष स्थिति: ${milanResult.nadiAnalysis.isNadiDosha ? (milanResult.nadiAnalysis.isParihar ? 'नाडी दोष परिहार (निवारण भएको)' : 'नाडी दोष सक्रिय (सतर्कता आवश्यक)') : 'निर्दोष (उत्तम)'}
  ${milanResult.nadiAnalysis.impactNe}
${
  milanResult.manglikAnalysis
    ? `• माङ्गलिक दोष: ${milanResult.manglikAnalysis.verdictNe}`
    : ''
}

[ शास्त्रीय उपाय र परामर्श ]
${milanResult.remediesNe.map((r, i) => `${i + 1}. ${r}`).join('\n')}
========================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-8 font-sans">
      {/* Top Banner & Header */}
      <div className="text-center space-y-2 bg-gradient-to-b from-amber-900/60 via-amber-950/80 to-black p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-semibold mb-1">
          <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
          <span>{lang === 'ne' ? 'वैदिक मेलापक तथा अष्टकूट ३६ गुण गणना' : 'Vedic Ashtakoot 36 Guna Matchmaking'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
          {lang === 'ne' ? 'कुण्डली मिलान (गुण मिलान चक्र)' : 'Vedic Kundali Milan'}
        </h1>
        <p className="text-xs sm:text-base text-amber-200/80 max-w-2xl mx-auto font-serif">
          {lang === 'ne'
            ? 'वर-वधूको अष्टकूट ३६ गुण, षडाष्टक/नवपञ्चक योग, नाडी दोष परिहार र माङ्गलिक दोषको पूर्ण विश्लेषण'
            : 'Authentic 36 Guna Ashtakoot algorithm, Bhakoot (6-8 Shadashtak/5-9 Navapanchak), Nadi Dosha, and Manglik compatibility'}
        </p>

        {/* Match Mode Tabs */}
        <div className="inline-flex p-1 bg-black/60 rounded-xl border border-amber-600/40 mt-4">
          <button
            onClick={() => setMatchMode('quick')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              matchMode === 'quick'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-lg'
                : 'text-amber-300 hover:text-amber-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ne' ? 'द्रुत राशि-नक्षत्र छनोट' : 'Quick Sign & Nakshatra'}</span>
          </button>
          <button
            onClick={() => setMatchMode('full')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              matchMode === 'full'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-lg'
                : 'text-amber-300 hover:text-amber-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ne' ? 'पूर्ण जन्म विवरण (माङ्गलिक सहित)' : 'Full Birth Charts (With Manglik)'}</span>
          </button>
        </div>
      </div>

      {/* INPUT FORM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BOY (GROOM) INPUT CARD */}
        <div className="bg-gradient-to-b from-blue-950/40 via-amber-950/20 to-black p-5 sm:p-6 rounded-3xl border-2 border-blue-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-base sm:text-lg font-serif">
              <User className="w-5 h-5 text-blue-400" />
              <span>{lang === 'ne' ? 'केटाको विवरण (Groom / वर)' : "Groom's Details"}</span>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30 font-serif">
              ♂ वर कुण्डली
            </span>
          </div>

          {matchMode === 'quick' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-blue-200/80 mb-1 font-serif">
                  {lang === 'ne' ? 'केटाको नाम' : "Groom's Name"}
                </label>
                <input
                  type="text"
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  className="w-full bg-black/60 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-blue-100 focus:outline-none focus:border-blue-400"
                  placeholder="केटाको नाम"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-blue-200/80 mb-1 font-serif">
                    {lang === 'ne' ? 'चन्द्र राशि (Moon Sign)' : 'Moon Sign'}
                  </label>
                  <select
                    value={boyRashiIdx}
                    onChange={(e) => setBoyRashiIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-black/80 border border-blue-500/50 rounded-xl px-3 py-2 text-sm text-blue-100 focus:outline-none focus:border-blue-400"
                  >
                    {RASHI_NAMES.map((r) => (
                      <option key={r.index} value={r.index}>
                        {r.symbol} {r.ne} ({r.en}) - {r.lordNe}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-blue-200/80 mb-1 font-serif">
                    {lang === 'ne' ? 'जन्म नक्षत्र (Birth Nakshatra)' : 'Nakshatra'}
                  </label>
                  <select
                    value={boyNakIdx}
                    onChange={(e) => setBoyNakIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-black/80 border border-blue-500/50 rounded-xl px-3 py-2 text-sm text-blue-100 focus:outline-none focus:border-blue-400"
                  >
                    {NAKSHATRA_AVAKHADA_TABLE.map((n) => (
                      <option key={n.index} value={n.index}>
                        {n.index + 1}. {n.nameNe} ({n.nameEn}) - {n.nadi} नाडी
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-blue-200/80 mb-1 font-serif">
                  {lang === 'ne' ? 'नक्षत्र चरण / पाद (Pada)' : 'Nakshatra Pada (1-4)'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((padNum) => (
                    <button
                      key={padNum}
                      type="button"
                      onClick={() => setBoyPad(padNum)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        boyPad === padNum
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : 'bg-black/50 text-blue-200 border-blue-900/60 hover:bg-blue-950/40'
                      }`}
                    >
                      {toDevanagariDigits(padNum)} चरण
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-blue-200/80 mb-1">
                  {lang === 'ne' ? 'केटाको नाम' : "Groom's Name"}
                </label>
                <input
                  type="text"
                  value={boyInput.name}
                  onChange={(e) => setBoyInput({ ...boyInput, name: e.target.value })}
                  className="w-full bg-black/60 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-blue-200/80 mb-1">
                    {lang === 'ne' ? 'जन्म मिति' : 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    value={boyInput.birthDate}
                    onChange={(e) => setBoyInput({ ...boyInput, birthDate: e.target.value })}
                    className="w-full bg-black/60 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-blue-200/80 mb-1">
                    {lang === 'ne' ? 'जन्म समय' : 'Birth Time'}
                  </label>
                  <input
                    type="time"
                    value={boyInput.birthTime}
                    onChange={(e) => setBoyInput({ ...boyInput, birthTime: e.target.value })}
                    className="w-full bg-black/60 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-blue-200/80 mb-1">
                  {lang === 'ne' ? 'जन्म स्थान' : 'Birth Place'}
                </label>
                <select
                  value={boyInput.birthPlace}
                  onChange={(e) => {
                    const city = CITY_PRESETS.find((c) => c.nameEn === e.target.value || c.nameNe === e.target.value);
                    if (city) {
                      setBoyInput({
                        ...boyInput,
                        birthPlace: city.nameNe,
                        latitude: city.lat,
                        longitude: city.lon
                      });
                    }
                  }}
                  className="w-full bg-black/80 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-blue-100"
                >
                  {CITY_PRESETS.map((c) => (
                    <option key={c.nameEn} value={c.nameNe}>
                      {c.nameNe}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* GIRL (BRIDE) INPUT CARD */}
        <div className="bg-gradient-to-b from-rose-950/40 via-amber-950/20 to-black p-5 sm:p-6 rounded-3xl border-2 border-rose-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base sm:text-lg font-serif">
              <User className="w-5 h-5 text-rose-400" />
              <span>{lang === 'ne' ? 'केटीको विवरण (Bride / वधू)' : "Bride's Details"}</span>
            </div>
            <span className="text-xs px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-full border border-rose-400/30 font-serif">
              ♀ वधू कुण्डली
            </span>
          </div>

          {matchMode === 'quick' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-rose-200/80 mb-1 font-serif">
                  {lang === 'ne' ? 'केटीको नाम' : "Bride's Name"}
                </label>
                <input
                  type="text"
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  className="w-full bg-black/60 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-rose-100 focus:outline-none focus:border-rose-400"
                  placeholder="केटीको नाम"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-rose-200/80 mb-1 font-serif">
                    {lang === 'ne' ? 'चन्द्र राशि (Moon Sign)' : 'Moon Sign'}
                  </label>
                  <select
                    value={girlRashiIdx}
                    onChange={(e) => setGirlRashiIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-black/80 border border-rose-500/50 rounded-xl px-3 py-2 text-sm text-rose-100 focus:outline-none focus:border-rose-400"
                  >
                    {RASHI_NAMES.map((r) => (
                      <option key={r.index} value={r.index}>
                        {r.symbol} {r.ne} ({r.en}) - {r.lordNe}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-rose-200/80 mb-1 font-serif">
                    {lang === 'ne' ? 'जन्म नक्षत्र (Birth Nakshatra)' : 'Nakshatra'}
                  </label>
                  <select
                    value={girlNakIdx}
                    onChange={(e) => setGirlNakIdx(parseInt(e.target.value, 10))}
                    className="w-full bg-black/80 border border-rose-500/50 rounded-xl px-3 py-2 text-sm text-rose-100 focus:outline-none focus:border-rose-400"
                  >
                    {NAKSHATRA_AVAKHADA_TABLE.map((n) => (
                      <option key={n.index} value={n.index}>
                        {n.index + 1}. {n.nameNe} ({n.nameEn}) - {n.nadi} नाडी
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-rose-200/80 mb-1 font-serif">
                  {lang === 'ne' ? 'नक्षत्र चरण / पाद (Pada)' : 'Nakshatra Pada (1-4)'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((padNum) => (
                    <button
                      key={padNum}
                      type="button"
                      onClick={() => setGirlPad(padNum)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        girlPad === padNum
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                          : 'bg-black/50 text-rose-200 border-rose-900/60 hover:bg-rose-950/40'
                      }`}
                    >
                      {toDevanagariDigits(padNum)} चरण
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-rose-200/80 mb-1">
                  {lang === 'ne' ? 'केटीको नाम' : "Bride's Name"}
                </label>
                <input
                  type="text"
                  value={girlInput.name}
                  onChange={(e) => setGirlInput({ ...girlInput, name: e.target.value })}
                  className="w-full bg-black/60 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-rose-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-rose-200/80 mb-1">
                    {lang === 'ne' ? 'जन्म मिति' : 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    value={girlInput.birthDate}
                    onChange={(e) => setGirlInput({ ...girlInput, birthDate: e.target.value })}
                    className="w-full bg-black/60 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-rose-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-rose-200/80 mb-1">
                    {lang === 'ne' ? 'जन्म समय' : 'Birth Time'}
                  </label>
                  <input
                    type="time"
                    value={girlInput.birthTime}
                    onChange={(e) => setGirlInput({ ...girlInput, birthTime: e.target.value })}
                    className="w-full bg-black/60 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-rose-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-rose-200/80 mb-1">
                  {lang === 'ne' ? 'जन्म स्थान' : 'Birth Place'}
                </label>
                <select
                  value={girlInput.birthPlace}
                  onChange={(e) => {
                    const city = CITY_PRESETS.find((c) => c.nameEn === e.target.value || c.nameNe === e.target.value);
                    if (city) {
                      setGirlInput({
                        ...girlInput,
                        birthPlace: city.nameNe,
                        latitude: city.lat,
                        longitude: city.lon
                      });
                    }
                  }}
                  className="w-full bg-black/80 border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-rose-100"
                >
                  {CITY_PRESETS.map((c) => (
                    <option key={c.nameEn} value={c.nameNe}>
                      {c.nameNe}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS PRESENTATION SECTION */}
      {milanResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* ========================================================================= */}
          {/* 1. TOP EXECUTIVE SUMMARY SCREEN (LARGE, BOLD, COLOR-CODED) */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-amber-950/90 via-black to-amber-950/70 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/50 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-amber-600/30 pb-6">
              {/* Left Score Gauge */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
                  {/* Decorative background glow */}
                  <div
                    className={`absolute inset-0 rounded-full blur-xl opacity-40 ${
                      milanResult.totalPoints >= 24
                        ? 'bg-emerald-500'
                        : milanResult.totalPoints >= 18
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                  />
                  {/* Circular Border Display */}
                  <div
                    className={`w-full h-full rounded-full border-4 flex flex-col items-center justify-center bg-black/80 shadow-2xl relative z-10 ${
                      milanResult.totalPoints >= 24
                        ? 'border-emerald-400 text-emerald-300'
                        : milanResult.totalPoints >= 18
                        ? 'border-amber-400 text-amber-300'
                        : 'border-red-500 text-red-400'
                    }`}
                  >
                    <span className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
                      {toDevanagariDigits(milanResult.totalPoints)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-amber-300/80 font-serif">
                      / ३६ गुण
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    <Award className="w-3.5 h-3.5" />
                    <span>{milanResult.percentage}% अनुकूलता</span>
                  </div>

                  <h2
                    className={`text-2xl sm:text-4xl font-extrabold font-serif ${
                      milanResult.verdictCategory === 'excellent'
                        ? 'text-emerald-400'
                        : milanResult.verdictCategory === 'good'
                        ? 'text-amber-300'
                        : milanResult.verdictCategory === 'average'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {milanResult.verdictTitleNe}
                  </h2>

                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-serif max-w-xl">
                    {milanResult.verdictSummaryNe}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleCopyReport}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedNotification ? 'प्रतिवेदन कपी भयो!' : 'प्रतिवेदन कपी गर्नुहोस्'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-black/60 hover:bg-black/90 text-amber-200 border border-amber-500/40 font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिन्ट / PDF</span>
                </button>
              </div>
            </div>

            {/* Quick Profile Comparison Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-serif">
              <div className="bg-blue-950/40 p-4 rounded-2xl border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="text-blue-300 font-bold block text-sm sm:text-base">
                    ♂ {milanResult.boyInfo.name}
                  </span>
                  <span className="text-blue-200/80">
                    राशि: <strong>{milanResult.boyInfo.rashiNe}</strong> (स्वामी: {milanResult.boyInfo.rashiLordNe})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-blue-300 block">
                    नक्षत्र: <strong>{milanResult.boyInfo.nakshatraNe}</strong>
                  </span>
                  <span className="text-blue-200/80">चरण: {toDevanagariDigits(milanResult.boyInfo.pad)}</span>
                </div>
              </div>

              <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-rose-300 font-bold block text-sm sm:text-base">
                    ♀ {milanResult.girlInfo.name}
                  </span>
                  <span className="text-rose-200/80">
                    राशि: <strong>{milanResult.girlInfo.rashiNe}</strong> (स्वामी: {milanResult.girlInfo.rashiLordNe})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-rose-300 block">
                    नक्षत्र: <strong>{milanResult.girlInfo.nakshatraNe}</strong>
                  </span>
                  <span className="text-rose-200/80">चरण: {toDevanagariDigits(milanResult.girlInfo.pad)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. IMPORTANT YOGAS & DOSHAS DETECTION HIGHLIGHT CARDS */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-200 font-bold text-lg sm:text-xl font-serif">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>मुख्य योग तथा दोषहरूको स्वचालित विश्लेषण (Important Yogas & Doshas)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 1: BHAKOOT & RASHI RELATION */}
              <div
                className={`p-5 rounded-3xl border-2 shadow-xl space-y-3 ${
                  milanResult.bhakootRelation.isMalefic && !milanResult.bhakootRelation.isParihar
                    ? 'bg-red-950/50 border-red-500/60 text-red-100'
                    : milanResult.bhakootRelation.isAuspicious || milanResult.bhakootRelation.isParihar
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100'
                    : 'bg-amber-950/50 border-amber-500/50 text-amber-100'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-current/20">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    भकूट सम्बन्ध (Bhakoot)
                  </span>
                  {milanResult.bhakootRelation.isMalefic && !milanResult.bhakootRelation.isParihar ? (
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-amber-300/80 font-serif">
                    {milanResult.bhakootRelation.relationLabelNe}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif">
                    {milanResult.bhakootRelation.nameNe}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed font-serif opacity-90">
                  {milanResult.bhakootRelation.descriptionNe}
                </p>

                {milanResult.bhakootRelation.isParihar && (
                  <div className="bg-black/40 p-2.5 rounded-xl text-xs text-emerald-300 border border-emerald-500/30">
                    <strong>✓ परिहार:</strong> {milanResult.bhakootRelation.pariharTypeNe}
                  </div>
                )}
              </div>

              {/* CARD 2: NADI DOSHA ANALYSIS */}
              <div
                className={`p-5 rounded-3xl border-2 shadow-xl space-y-3 ${
                  milanResult.nadiAnalysis.isNadiDosha && !milanResult.nadiAnalysis.isParihar
                    ? 'bg-red-950/50 border-red-500/60 text-red-100'
                    : milanResult.nadiAnalysis.isParihar
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100'
                    : 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-current/20">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    नाडी दोष स्थिति (Nadi Dosha)
                  </span>
                  {milanResult.nadiAnalysis.isNadiDosha && !milanResult.nadiAnalysis.isParihar ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-amber-300/80 font-serif">
                    केटा: {milanResult.nadiAnalysis.boyNadi} नाडी | केटी: {milanResult.nadiAnalysis.girlNadi} नाडी
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif">
                    {milanResult.nadiAnalysis.isNadiDosha
                      ? milanResult.nadiAnalysis.isParihar
                        ? 'नाडी दोष परिहार (दोष निवारण भएको)'
                        : 'नाडी दोष सक्रिय (समान नाडी)'
                      : 'नाडी दोष छैन (भिन्न नाडी - अति शुभ)'}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed font-serif opacity-90">
                  {milanResult.nadiAnalysis.impactNe}
                </p>

                {milanResult.nadiAnalysis.isParihar && (
                  <div className="bg-black/40 p-2.5 rounded-xl text-xs text-emerald-300 border border-emerald-500/30">
                    <strong>✓ शास्त्रोक्त परिहार:</strong> {milanResult.nadiAnalysis.pariharReasonNe}
                  </div>
                )}
              </div>

              {/* CARD 3: MANGLIK DOSHA COMPARISON */}
              <div className="bg-amber-950/50 border-2 border-amber-500/50 p-5 rounded-3xl shadow-xl space-y-3 text-amber-100">
                <div className="flex items-center justify-between border-b pb-2 border-amber-500/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    मङ्गल दोष विश्लेषण (Manglik Match)
                  </span>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>

                {milanResult.manglikAnalysis ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-amber-200/90">
                        <span>वर: <strong>{milanResult.manglikAnalysis.boy.status}</strong></span>
                        <span>वधू: <strong>{milanResult.manglikAnalysis.girl.status}</strong></span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-amber-300">
                        {milanResult.manglikAnalysis.isDoshaSamya
                          ? 'मङ्गल दोष साम्य (विवाह शुभ)'
                          : milanResult.manglikAnalysis.isCompatible
                          ? 'माङ्गलिक तालमेल अनुकूल'
                          : 'माङ्गलिक दोष विचारणीय'}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed font-serif opacity-90">
                      {milanResult.manglikAnalysis.verdictNe}
                    </p>
                  </>
                ) : (
                  <div className="space-y-2 text-center py-2">
                    <p className="text-xs text-amber-200/80 font-serif leading-relaxed">
                      मङ्गल दोष (लग्न, चन्द्र, शुक्र कुण्डली) को विस्तृत परीक्षणका लागि माथि <strong>"पूर्ण जन्म विवरण"</strong> ट्याब छनोट गरी समय र स्थान भर्नुहोस्।
                    </p>
                    <button
                      onClick={() => setMatchMode('full')}
                      className="px-3 py-1.5 bg-amber-500 text-amber-950 font-bold rounded-lg text-xs hover:bg-amber-400"
                    >
                      पूर्ण विवरण भर्नुहोस्
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SPECIAL YOGAS STRIP */}
            {milanResult.specialYogas.length > 0 && (
              <div className="space-y-2 pt-2">
                {milanResult.specialYogas.map((yoga) => (
                  <div
                    key={yoga.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3 shadow-md ${
                      yoga.type === 'auspicious'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                        : yoga.type === 'inauspicious'
                        ? 'bg-red-950/40 border-red-500/40 text-red-100'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold font-serif text-sm sm:text-base">
                        {yoga.titleNe}
                      </h4>
                      <p className="text-xs sm:text-sm opacity-90 font-serif mt-0.5 leading-relaxed">
                        {yoga.descriptionNe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. DETAILED 36 GUNA TABLE (अष्टकूट विस्तृत तालिका) */}
          {/* ========================================================================= */}
          <div className="bg-black/70 p-5 sm:p-7 rounded-3xl border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-600/30 pb-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-lg sm:text-xl font-serif">
                <Award className="w-5 h-5 text-amber-400" />
                <span>अष्टकूट ३६ गुण विस्तृत तालिका (Ashtakoot Guna Matrix)</span>
              </div>
              <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30 font-serif">
                प्राप्ताङ्क: {toDevanagariDigits(milanResult.totalPoints)} / ३६
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-amber-800/40">
              <table className="w-full text-left text-xs sm:text-sm font-serif">
                <thead className="bg-amber-950/80 text-amber-200 border-b border-amber-700/60 uppercase text-[11px] sm:text-xs">
                  <tr>
                    <th className="p-3 sm:p-4">कूट नाम (Koot)</th>
                    <th className="p-3 sm:p-4 text-center">अधिकतम (Max)</th>
                    <th className="p-3 sm:p-4 text-center">प्राप्त (Score)</th>
                    <th className="p-3 sm:p-4">वर (केटा)</th>
                    <th className="p-3 sm:p-4">वधू (केटी)</th>
                    <th className="p-3 sm:p-4">स्थिति तथा फल (Meaning & Details)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/30 bg-black/40 text-amber-100">
                  {milanResult.kootas.map((koot, idx) => {
                    const isFullScore = koot.obtainedPoints === koot.maxPoints;
                    const isZero = koot.obtainedPoints === 0;

                    return (
                      <tr
                        key={koot.kootId}
                        className={`hover:bg-amber-950/30 transition-colors ${
                          isZero ? 'bg-red-950/20' : idx % 2 === 0 ? 'bg-transparent' : 'bg-amber-950/10'
                        }`}
                      >
                        <td className="p-3 sm:p-4 font-bold text-amber-200">
                          {koot.nameNe}
                        </td>
                        <td className="p-3 sm:p-4 text-center font-bold text-amber-300/80">
                          {toDevanagariDigits(koot.maxPoints)}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs sm:text-sm ${
                              isFullScore
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : isZero
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            }`}
                          >
                            {toDevanagariDigits(koot.obtainedPoints)}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-blue-200 font-medium">
                          {koot.boyValue}
                        </td>
                        <td className="p-3 sm:p-4 text-rose-200 font-medium">
                          {koot.girlValue}
                        </td>
                        <td className="p-3 sm:p-4 text-xs leading-relaxed max-w-xs sm:max-w-md">
                          <div>{koot.descriptionNe}</div>
                          {koot.hasParihar && koot.pariharDetailsNe && (
                            <div className="mt-1 text-[11px] text-emerald-300 font-medium">
                              ✓ {koot.pariharDetailsNe}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row */}
                  <tr className="bg-amber-950/90 text-amber-100 font-bold border-t-2 border-amber-500/60">
                    <td className="p-4 text-amber-300 text-sm sm:text-base font-serif">
                      कुल प्राप्ताङ्क (Total Guna)
                    </td>
                    <td className="p-4 text-center text-sm sm:text-base">३६</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1.5 rounded-full bg-amber-500 text-amber-950 text-sm sm:text-base font-extrabold shadow-md">
                        {toDevanagariDigits(milanResult.totalPoints)}
                      </span>
                    </td>
                    <td colSpan={3} className="p-4 text-right text-xs sm:text-sm font-serif">
                      {milanResult.verdictTitleNe} ({milanResult.percentage}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. VEDIC REMEDIES & ASTROLOGICAL GUIDANCE */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-amber-950/60 to-black p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-lg sm:text-xl font-serif border-b border-amber-600/30 pb-3">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>ज्योतिषीय परामर्श तथा शुभ उपायहरू (Remedies & Astrological Guidance)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-200 font-serif">
                  अनुशंसा तथा विशेष सल्लाह:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-amber-100/90 font-serif leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      गुण प्राप्ताङ्क १८ भन्दा माथि हुनु विवाहका लागि शास्त्रीय रूपमा स्वीकार्य मानिन्छ।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      गुण मिलानका साथसाथै दुवैको ७ औं भाव (दाम्पत्य सुख), गुरु र शुक्र ग्रहको बल पनि विचारणीय हुन्छ।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      दाम्पत्य जीवनमा सधैं आपसी सम्मान, सहिष्णुता र आध्यात्मिक निष्ठालाई पहिलो प्राथमिकता दिनुहोस्।
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-200 font-serif">
                  दोष निवारण तथा शान्ति उपायहरू:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-amber-100/90 font-serif leading-relaxed">
                  {milanResult.remediesNe.map((rem, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
