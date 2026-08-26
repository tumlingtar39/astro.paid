import React, { useState } from 'react';
import { VASTU_DIRECTIONS } from '../data/astrologyData';
import { VastuAnalysisResult, Language } from '../types';
import { Compass, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface VastuSectionProps {
  lang: Language;
}

export const VastuSection: React.FC<VastuSectionProps> = ({ lang }) => {
  const [selectedRoom, setSelectedRoom] = useState<'entrance' | 'kitchen' | 'bedroom' | 'pooja' | 'bathroom' | 'locker'>('entrance');
  const [selectedDirection, setSelectedDirection] = useState<'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Center'>('NE');
  const [analysis, setAnalysis] = useState<VastuAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rooms = [
    { id: 'entrance', labelNe: 'मुख्य ढोका (Main Entrance)', labelEn: 'Main Entrance', descNe: 'घरको मुख्य प्रवेशद्वार' },
    { id: 'kitchen', labelNe: 'भान्छा घर (Kitchen)', labelEn: 'Kitchen', descNe: 'अग्नि तत्वको प्रमुख स्थान' },
    { id: 'bedroom', labelNe: 'मुख्य सुत्ने कोठा (Master Bedroom)', labelEn: 'Master Bedroom', descNe: 'स्थिरता र निद्राको स्थान' },
    { id: 'pooja', labelNe: 'पूजा कोठा (Pooja Room)', labelEn: 'Pooja Room', descNe: 'ईश्वरीय सकारात्मक ऊर्जाको केन्द्र' },
    { id: 'bathroom', labelNe: 'शौचालय / बाथरूम (Bathroom)', labelEn: 'Bathroom', descNe: 'नकारात्मक ऊर्जा निकास स्थान' },
    { id: 'locker', labelNe: 'सन्दुक / ढुकुटी (Locker)', labelEn: 'Cash / Locker', descNe: 'कुबेर एवं धन आर्जन स्थान' },
  ];

  // Comprehensive Client-Side Vedic Vastu Knowledge Engine
  const computeClientVastu = (room: string, dir: string, l: Language): VastuAnalysisResult => {
    const isNe = l === 'ne';
    const vastuRules: Record<string, { best: string[]; neutral: string[]; bad: string[]; remedyNe: string; remedyEn: string }> = {
      entrance: {
        best: ['E', 'N', 'NE'],
        neutral: ['NW', 'W'],
        bad: ['S', 'SW', 'SE'],
        remedyNe: 'मुख्य ढोकामा तामाको स्वस्तिक वा वास्तु यन्त्र, ॐ चिन्ह, पहेँलो/केसरी रङको प्रयोग र पञ्चमुखी हनुमान जीको फोटो/चित्र राख्नुहोस्।',
        remedyEn: 'Place a copper Swastik or Vastu Yantra, Om symbol, and a Panchamukhi Hanuman image at the main entrance.'
      },
      kitchen: {
        best: ['SE', 'NW'],
        neutral: ['E'],
        bad: ['NE', 'SW', 'N', 'Center'],
        remedyNe: 'भान्छा घरको आग्नेय कोण (South-East) मा रातो बल्ब बाल्नुहोस् र भित्तामा हल्का पहेँलो वा केसरी रङ लगाउनुहोस्। खाना पकाउँदा पूर्व दिशातर्फ मुख फर्काउनुहोस्।',
        remedyEn: 'Keep a red or warm bulb burning in the South-East (Agneya) corner. Face East while preparing meals.'
      },
      bedroom: {
        best: ['SW', 'S', 'W'],
        neutral: ['NW'],
        bad: ['NE', 'SE', 'Center'],
        remedyNe: 'सुत्ने बेडको शिर उत्तर दिशामा कहिल्यै नराख्नुहोस् (सधैं दक्षिण वा पूर्व शीर गरेर सुत्ने)। ईशान कोण खाली र सफा राख्नुहोस्।',
        remedyEn: 'Never sleep with your head towards the North (always keep head towards South or East). Keep North-East corner clean.'
      },
      pooja: {
        best: ['NE', 'E', 'N'],
        neutral: ['Center'],
        bad: ['S', 'SW', 'SE', 'NW'],
        remedyNe: 'पूजा कोठामा नित्य शुद्ध घ्यूको दियो बाल्नुहोस् र गंगाजल छर्कनुहोस्। भगवानको मुख पूर्व वा उत्तर फर्काएर राख्नुहोस्।',
        remedyEn: 'Light a pure cow ghee lamp daily in the Pooja room. Face idols East or North.'
      },
      bathroom: {
        best: ['NW', 'W', 'S'],
        neutral: ['SE', 'SW'],
        bad: ['NE', 'N', 'E', 'Center'],
        remedyNe: 'बाथरूममा सिसाको कचौरामा खडा नुन (Rock Salt) राख्नुहोस् र प्रत्येक हप्ता परिवर्तन गर्नुहोस्। ढोका सधैं बन्द राख्नुहोस्।',
        remedyEn: 'Keep a glass bowl with coarse rock salt in the bathroom and replace it weekly to absorb negative energies.'
      },
      locker: {
        best: ['N', 'NE', 'E'],
        neutral: ['Center', 'NW'],
        bad: ['S', 'SE', 'SW'],
        remedyNe: 'सन्दुक वा ढुकुटी उत्तर दिशातर्फ फर्कने गरी राख्नुहोस्। ढुकुटीको भित्री भागमा कुबेर यन्त्र वा श्रीयन्त्र र रातो कपडा ओछ्याउनुहोस्।',
        remedyEn: 'Position cash locker opening towards the North (direction of Lord Kuber). Keep a Shree Yantra inside on red cloth.'
      }
    };

    const rule = vastuRules[room] || vastuRules.entrance;
    let status: 'favorable' | 'neutral' | 'unfavorable' = 'neutral';
    let title = isNe ? 'सन्तुलित वास्तु स्थिति (Balanced Harmony)' : 'Balanced Vastu Harmony';
    let description = isNe
      ? 'यो दिशा यस कोठाका लागि मध्यम फलदायी छ। सामान्य वास्तु सन्तुलन कायम राख्दा शुभ प्रभाव मिल्नेछ।'
      : 'This direction yields balanced and moderate energy flow. Maintain cleanliness to enhance positive vibrations.';

    if (rule.best.includes(dir)) {
      status = 'favorable';
      title = isNe ? 'अति शुभ एवं वास्तु सम्मत (Highly Auspicious)' : 'Highly Auspicious Vastu Alignment';
      description = isNe
        ? 'यो दिशा यस कोठाको लागि सर्वोत्तम मानिन्छ। यसले सकारात्मक ऊर्जा, ऐश्वर्य, आरोग्यता र परिवारमा शान्ति अभिवृद्धि गर्दछ।'
        : 'This is the most auspicious direction for this room, promoting prosperity, health, and positive energy.';
    } else if (rule.bad.includes(dir)) {
      status = 'unfavorable';
      title = isNe ? 'वास्तु दोष सम्भावना (Unfavorable / Vastu Dosha)' : 'Vastu Dosha / Energy Imbalance Warning';
      description = isNe
        ? 'यो दिशामा यस कोठा हुनाले पञ्चतत्वको असन्तुलन वा वास्तु दोष उत्पन्न हुन सक्छ। तल दिइएका बिना-तोडफोड वैदिक उपायहरू अपनाउनुहोस्।'
        : 'Placing this room in this direction creates elemental friction. Follow the non-destructive remedies below to balance energy.';
    }

    const element = dir === 'NE' || dir === 'N'
      ? (isNe ? 'जल / आकाश (Water & Ether)' : 'Water & Ether')
      : dir === 'SE' || dir === 'E'
      ? (isNe ? 'अग्नि तत्व (Fire Element)' : 'Fire Element')
      : dir === 'SW' || dir === 'S'
      ? (isNe ? 'पृथ्वी तत्व (Earth Element)' : 'Earth Element')
      : dir === 'NW' || dir === 'W'
      ? (isNe ? 'वायु तत्व (Air Element)' : 'Air Element')
      : (isNe ? 'ब्रह्मस्थान / आकाश तत्व' : 'Brahmasthan / Ether Element');

    const remedies = [
      isNe ? rule.remedyNe : rule.remedyEn,
      isNe
        ? 'नित्य बिहान र बेलुका कपूर, लोबान र गुग्गुलको धूप बालेर घरमा धुवाँ घुमाउनाले वास्तु दोष निवारण हुन्छ।'
        : 'Burn Camphor and pure Guggal incense in the morning and evening to neutralize subtle environmental negativity.',
      isNe
        ? 'घरको मूल द्वार सफा, उज्यालो र तोरणयुक्त राख्नुहोस्, जसले गर्दा लक्ष्मीको प्रवेश निरन्तर रहन्छ।'
        : 'Keep the main entryway immaculate, well-lit, and adorned with positive auspicious symbols.'
    ];

    return {
      status,
      title,
      description,
      remedies,
      element,
      idealDirections: rule.best
    };
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    // Instant calculate locally first
    const clientResult = computeClientVastu(selectedRoom, selectedDirection, lang);
    setAnalysis(clientResult);

    try {
      const res = await fetch('/api/vastu-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType: selectedRoom, direction: selectedDirection, language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status) {
          setAnalysis(data);
        }
      }
    } catch (err) {
      console.warn('Vastu server check notice (fallback used):', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 p-5 rounded-2xl border border-amber-700/60 shadow-lg text-center">
        <div className="inline-flex items-center gap-2 bg-amber-900/80 text-amber-300 border border-amber-600/60 text-xs px-3 py-1 rounded-full font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'ne' ? 'निःशुल्क वैदिक वास्तु विश्लेषण (Free Vastu Analyzer)' : 'Free Vedic Vastu Harmony Analyzer'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 flex items-center justify-center gap-2">
          <Compass className="w-6 h-6 text-amber-400" />
          <span>{lang === 'ne' ? 'घर तथा व्यापारिक वास्तु विश्लेषण' : 'Vastu Shastra Analyzer'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-amber-300/90 mt-1 max-w-2xl mx-auto">
          {lang === 'ne'
            ? 'तपाईँको घर, ढोका वा कोठा कुन दिशामा छ रोज्नुहोस् र वास्तु स्थिति, पञ्चतत्व सन्तुलन एवं बिना-तोडफोड सरल वैदिक समाधान जान्नुहोस्।'
            : 'Select room type and direction to analyze Vastu compliance and non-destructive remedies.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-amber-950/60 p-5 rounded-2xl border border-amber-800/60 shadow-xl space-y-5">
          {/* Room Selector */}
          <div>
            <label className="block font-bold text-xs text-amber-300 uppercase tracking-wider mb-2">
              १. कोठा वा स्थान छान्नुहोस् (Select Room):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRoom(r.id as any);
                    setAnalysis(null);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedRoom === r.id
                      ? 'bg-amber-600 text-amber-50 font-bold border-amber-400 shadow'
                      : 'bg-amber-900/40 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <span className="block">{lang === 'ne' ? r.labelNe : r.labelEn}</span>
                  <span className="text-[10px] opacity-75 block">{r.descNe}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direction Selector Grid (Compass Style) */}
          <div>
            <label className="block font-bold text-xs text-amber-300 uppercase tracking-wider mb-2">
              २. उक्त कोठा भएको दिशा रोज्नुहोस् (Select Direction):
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {VASTU_DIRECTIONS.map((d) => (
                <button
                  key={d.code}
                  onClick={() => {
                    setSelectedDirection(d.code as any);
                    setAnalysis(null);
                  }}
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    selectedDirection === d.code
                      ? 'bg-amber-500 text-amber-950 font-bold border-amber-300 shadow-lg scale-105'
                      : 'bg-amber-900/40 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <span className="block font-bold text-xs">{d.code}</span>
                  <span className="text-[10px] block opacity-85">{d.nameNe.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>{lang === 'ne' ? 'वास्तु स्थिति विश्लेषण गर्नुहोस्' : 'Analyze Vastu Harmony'}</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Result Column */}
        <div className="lg:col-span-7">
          {analysis ? (
            <div className="bg-amber-950/70 p-5 rounded-2xl border border-amber-700/70 shadow-2xl space-y-5 animate-in fade-in duration-300">
              {/* Status Header */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                  analysis.status === 'favorable'
                    ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-100'
                    : analysis.status === 'unfavorable'
                    ? 'bg-rose-950/60 border-rose-700/80 text-rose-100'
                    : 'bg-amber-900/60 border-amber-700/80 text-amber-100'
                }`}
              >
                {analysis.status === 'favorable' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : analysis.status === 'unfavorable' ? (
                  <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                ) : (
                  <Compass className="w-8 h-8 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-bold font-serif">{analysis.title}</h3>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{analysis.description}</p>
                </div>
              </div>

              {/* Elements & Best Directions */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/50">
                  <span className="text-[10px] text-amber-400 block font-semibold">तत्व (Element):</span>
                  <span className="font-bold text-amber-100">{analysis.element}</span>
                </div>
                <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/50">
                  <span className="text-[10px] text-amber-400 block font-semibold">उत्तम दिशाहरू (Best Directions):</span>
                  <span className="font-bold text-amber-300">{analysis.idealDirections.join(', ')}</span>
                </div>
              </div>

              {/* Non-Destructive Remedies */}
              <div className="bg-amber-900/30 p-4 rounded-xl border border-amber-800/60 space-y-2.5 text-xs">
                <h4 className="font-bold text-amber-300 font-serif text-sm flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? 'बिना-तोडफोड सरल वास्तु दोष निवारण उपायहरू:' : 'Non-Destructive Vedic Vastu Remedies:'}</span>
                </h4>
                <ul className="space-y-2 text-amber-100/95">
                  {analysis.remedies.map((rem, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-amber-950/50 p-2.5 rounded-lg border border-amber-800/40">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">✦</span>
                      <span className="leading-relaxed">{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 flex items-center justify-between text-[11px] text-amber-300/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>वैदिक वास्तु शास्त्र प्रामाणिक विधि</span>
                </span>
                <span className="font-mono text-amber-400">
                  {selectedRoom.toUpperCase()} ➔ {selectedDirection}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-dashed border-amber-800/60 rounded-2xl p-10 text-center text-amber-300/80 space-y-3">
              <Compass className="w-12 h-12 mx-auto text-amber-500/60 animate-pulse" />
              <h4 className="text-base font-bold font-serif text-amber-200">
                {lang === 'ne' ? 'वास्तु विश्लेषण यहाँ देखिनेछ' : 'Vastu Analysis Will Appear Here'}
              </h4>
              <p className="text-xs max-w-sm mx-auto text-amber-400/80">
                {lang === 'ne'
                  ? 'बायाँपट्टि कोठा र दिशा छानेर "वास्तु स्थिति विश्लेषण गर्नुहोस्" बटन थिच्नुहोस्।'
                  : 'Select room and direction on the left to view Vastu recommendations.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

