import React, { useState } from 'react';
import { NumerologyResult, Language } from '../types';
import { BookOpen, Sparkles, Star, TrendingUp, RefreshCw, ShieldCheck } from 'lucide-react';

interface NumerologySectionProps {
  lang: Language;
}

// Chaldean & Pythagorean calculation helper
const computeClientNumerology = (fullName: string, birthDate: string, language: Language): NumerologyResult => {
  const isNe = language === 'ne';

  // Extract day, month, year
  const parts = birthDate.split('-');
  const year = parseInt(parts[0] || '1998', 10);
  const month = parseInt(parts[1] || '7', 10);
  const day = parseInt(parts[2] || '21', 10);

  const reduceDigits = (num: number): number => {
    let sum = num;
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum || 1;
  };

  const mulank = reduceDigits(day);
  const fullDateSum = day.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0) +
                      month.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0) +
                      year.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const bhagyank = reduceDigits(fullDateSum);

  const charValues: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  let nameSum = 0;
  const cleanName = (fullName || 'Shambhu').toUpperCase().replace(/[^A-Z]/g, '');
  for (let i = 0; i < cleanName.length; i++) {
    const ch = cleanName[i];
    nameSum += charValues[ch] || 1;
  }
  const namank = reduceDigits(nameSum || mulank);

  const traitsNe: Record<number, { trait: string; career: string }> = {
    1: { trait: 'सूर्यको प्रभाव: नेतृत्व क्षमता, आत्मबल, दृढ संकल्प र उच्च महत्वाकांक्षा।', career: 'प्रशासन, राजनीति, व्यवस्थापन, सरकारी सेवा' },
    2: { trait: 'चन्द्रमाको प्रभाव: कोमल हृदय, उच्च कल्पनाशक्ति, कलाप्रियता र शान्तिप्रिय स्वभाव।', career: 'कला, साहित्य, परामर्श, जनसम्पर्क' },
    3: { trait: 'बृहस्पतिको प्रभाव: ज्ञान, बुद्धि, दूरदर्शिता, अध्यात्म र उत्कृष्ट अभिव्यक्ति क्षमता।', career: 'शिक्षा, कानुन, ज्योतिष, धर्म, अनुसन्धान' },
    4: { trait: 'राहुको प्रभाव: तार्किक क्षमता, योजना निर्माण, प्राविधिक दक्षता र साहसी निर्णय।', career: 'सूचना प्रविधि, इन्जिनियरिङ, राजनीति, व्यापार' },
    5: { trait: 'बुधको प्रभाव: तिखो बुद्धि, व्यापारिक चातुर्य, आकर्षक संवाद र अनुकूलन क्षमता।', career: 'बैंकिङ, व्यापार, सञ्चार, पत्रकारिता, मार्केटिङ' },
    6: { trait: 'शुक्रको प्रभाव: सौन्दर्यबोध, विलासिता, आकर्षक व्यक्तित्व र पारिवारिक समर्पण।', career: 'फेसन, संगीत, हस्पिटालिटी, सौन्दर्य, डिजाइन' },
    7: { trait: 'केतुको प्रभाव: गम्भीर चिन्तन, रहस्यमय ज्ञान, आध्यात्मिक झुकाव र अनुसन्धान।', career: 'दार्शनिक, अनुसन्धान, ज्योतिष, योग तथा अध्यात्म' },
    8: { trait: 'शनिको प्रभाव: कडा परिश्रम, धैर्य, न्यायप्रियता, दूरगामी सोच र संगठनात्मक शक्ति।', career: 'उद्योग, कानुन, निर्माण, प्रशासन, कृषि' },
    9: { trait: 'मंगलको प्रभाव: अदम्य साहस, ऊर्जा, परोपकार, गतिशीलता र दृढ इच्छाशक्ति।', career: 'सेना, प्रहरी, चिकित्सा, खेलकुद, प्रविधि' }
  };

  const traitsEn: Record<number, { trait: string; career: string }> = {
    1: { trait: 'Ruled by Sun: Strong leadership, confidence, visionary willpower.', career: 'Administration, Management, Politics, Leadership' },
    2: { trait: 'Ruled by Moon: Compassionate, intuitive, artistic, and peace-loving.', career: 'Arts, Counseling, Psychology, Public Relations' },
    3: { trait: 'Ruled by Jupiter: Wisdom, intellect, spiritual depth, and eloquence.', career: 'Education, Law, Astrology, Philosophy, Research' },
    4: { trait: 'Ruled by Rahu: Analytical logic, strategic planning, technical mastery.', career: 'IT, Engineering, Strategy, Business Development' },
    5: { trait: 'Ruled by Mercury: Sharp commerce acumen, communication, adaptability.', career: 'Banking, Trade, Media, Journalism, Marketing' },
    6: { trait: 'Ruled by Venus: Grace, charm, harmony, luxury, and artistic creativity.', career: 'Design, Hospitality, Entertainment, Fine Arts' },
    7: { trait: 'Ruled by Ketu: Deep philosophical introspection, research, and spirituality.', career: 'Philosophy, Research, Yoga, Esoteric Studies' },
    8: { trait: 'Ruled by Saturn: Hard work, perseverance, justice, long-term resilience.', career: 'Industry, Law, Civil Construction, Executive Ops' },
    9: { trait: 'Ruled by Mars: Dynamic bravery, humanitarian spirit, boundless energy.', career: 'Defense, Medicine, Athletics, Technology' }
  };

  const selectedTraits = isNe ? traitsNe : traitsEn;

  return {
    mulank,
    bhagyank,
    namank,
    mulankMeaning: selectedTraits[mulank]?.trait || (isNe ? 'सन्तुलित र सिर्जनशील' : 'Balanced & Creative'),
    bhagyankMeaning: selectedTraits[bhagyank]?.trait || (isNe ? 'प्रगतिशील र साहसी' : 'Progressive & Brave'),
    namankMeaning: selectedTraits[namank]?.trait || (isNe ? 'लोकप्रिय र प्रभावशाली' : 'Influential & Popular'),
    luckyNumbers: [mulank, (mulank + 2) % 9 || 9, (mulank + 4) % 9 || 9],
    unluckyNumbers: [mulank === 8 ? 4 : 8],
    luckyColors: mulank === 1 || mulank === 3 || mulank === 9
      ? (isNe ? ['केसरी', 'सुनौलो', 'रातो'] : ['Saffron', 'Gold', 'Red'])
      : (isNe ? ['सेतो', 'हल्का निलो', 'हरियो'] : ['White', 'Light Blue', 'Green']),
    luckyDays: isNe ? ['आइतबार', 'सोमबार', 'बिहीबार'] : ['Sunday', 'Monday', 'Thursday'],
    favorableCareers: [selectedTraits[mulank]?.career, selectedTraits[bhagyank]?.career].filter(Boolean),
    yearPrediction: isNe
      ? `वर्ष २०२६ तपाईँका लागि मूलांक ${mulank} र भाग्यांक ${bhagyank} को प्रभावले गर्दा व्यवसाय, अध्ययन, अध्यात्म तथा व्यक्तिगत जीवनमा नयाँ सफलता र उन्नतिको ढोका खोल्नेछ।`
      : `For 2026, the combined synergy of Mulank ${mulank} and Bhagyank ${bhagyank} indicates notable milestones, financial growth, and spiritual harmony.`
  };
};

export const NumerologySection: React.FC<NumerologySectionProps> = ({ lang }) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1998-07-21');
  const [result, setResult] = useState<NumerologyResult | null>(() => computeClientNumerology('', '1998-07-21', lang));
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    setIsLoading(true);
    // Calculate instantly locally
    const clientRes = computeClientNumerology(fullName, birthDate, lang);
    setResult(clientRes);

    try {
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, birthDate, language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.mulank) {
          setResult(data);
        }
      }
    } catch (err) {
      console.warn('Numerology server notice (fallback active):', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 p-5 rounded-2xl border border-amber-700/60 shadow-lg text-center">
        <div className="inline-flex items-center gap-2 bg-amber-900/80 text-amber-300 border border-amber-600/60 text-xs px-3 py-1 rounded-full font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'ne' ? 'निःशुल्क वैदिक अंक ज्योतिष (Free Numerology)' : 'Free Vedic Numerology Calculator'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span>{lang === 'ne' ? 'वैदिक अंक ज्योतिष (Vedic Numerology Calculator)' : 'Vedic Numerology Calculator'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-amber-300/90 mt-1 max-w-2xl mx-auto">
          {lang === 'ne'
            ? 'तपाईँको जन्ममिति र नाम अनुसार मूलांक, भाग्यांक र नामांक निकालेर भाग्यशाली अंक, रङ र भविष्यफल जान्नुहोस्।'
            : 'Calculate your Mulank (Birth Number), Bhagyank (Life Path), and Namank (Name Number) for insights.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-amber-950/60 p-5 rounded-2xl border border-amber-800/60 shadow-xl space-y-4">
          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-amber-300 mb-1">
                {lang === 'ne' ? 'पुरा नाम (अंग्रेजी वा नेपाली):' : 'Full Name:'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="उदा: Shambhu Prasad Lamsal"
                className="w-full bg-amber-900/40 border border-amber-700/60 rounded-xl px-3 py-2 text-amber-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-amber-400/80 mt-1 block">
                * नामको नामांक (Namank) गणनाका लागि आवश्यक
              </span>
            </div>

            <div>
              <label className="block font-semibold text-amber-300 mb-1">
                {lang === 'ne' ? 'जन्ममिति (Date of Birth):' : 'Date of Birth:'}
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-amber-900/40 border border-amber-700/60 rounded-xl px-3 py-2 text-amber-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'अंक विश्लेषण गर्नुहोस्' : 'Calculate Numbers'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-amber-950/70 p-5 rounded-2xl border border-amber-700/70 shadow-2xl space-y-5 animate-in fade-in duration-300">
              {/* Three Core Numbers Display */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gradient-to-br from-amber-900/60 to-amber-950/80 p-3 rounded-2xl border border-amber-600/50 shadow">
                  <span className="text-[10px] text-amber-400 font-semibold block">{lang === 'ne' ? 'मूलांक (Mulank)' : 'Mulank (Birth No.)'}</span>
                  <span className="text-3xl font-extrabold text-amber-200 font-serif my-1 block">{result.mulank}</span>
                  <span className="text-[10px] text-amber-300/80 block">{lang === 'ne' ? 'जन्म तिथि अंक' : 'Birth Day Number'}</span>
                </div>

                <div className="bg-gradient-to-br from-amber-900/60 to-amber-950/80 p-3 rounded-2xl border border-amber-600/50 shadow">
                  <span className="text-[10px] text-amber-400 font-semibold block">{lang === 'ne' ? 'भाग्यांक (Bhagyank)' : 'Bhagyank (Life Path)'}</span>
                  <span className="text-3xl font-extrabold text-amber-200 font-serif my-1 block">{result.bhagyank}</span>
                  <span className="text-[10px] text-amber-300/80 block">{lang === 'ne' ? 'सम्पूर्ण जन्ममिति' : 'Full Birth Date Sum'}</span>
                </div>

                <div className="bg-gradient-to-br from-amber-900/60 to-amber-950/80 p-3 rounded-2xl border border-amber-600/50 shadow">
                  <span className="text-[10px] text-amber-400 font-semibold block">{lang === 'ne' ? 'नामांक (Namank)' : 'Namank (Expression)'}</span>
                  <span className="text-3xl font-extrabold text-amber-200 font-serif my-1 block">{result.namank}</span>
                  <span className="text-[10px] text-amber-300/80 block">{lang === 'ne' ? 'नामको अंक' : 'Name Value Sum'}</span>
                </div>
              </div>

              {/* Character & Ruling Planet Traits */}
              <div className="bg-amber-900/30 p-4 rounded-xl border border-amber-800/60 space-y-2 text-xs">
                <h4 className="font-bold text-amber-200 font-serif text-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? 'व्यक्तित्व एवं ग्रह स्वामी विश्लेषण:' : 'Personality & Planetary Analysis:'}</span>
                </h4>
                <p className="text-amber-100 leading-relaxed">
                  <strong className="text-amber-300">{lang === 'ne' ? `मूलांक ${result.mulank}:` : `Mulank ${result.mulank}:`}</strong> {result.mulankMeaning}
                </p>
                <p className="text-amber-100 leading-relaxed">
                  <strong className="text-amber-300">{lang === 'ne' ? `भाग्यांक ${result.bhagyank}:` : `Bhagyank ${result.bhagyank}:`}</strong> {result.bhagyankMeaning}
                </p>
              </div>

              {/* Lucky Elements */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50">
                  <span className="text-[10px] text-amber-400 block font-semibold">{lang === 'ne' ? 'शुभ अंक:' : 'Lucky Nos:'}</span>
                  <span className="font-bold text-amber-100">{result.luckyNumbers.join(', ')}</span>
                </div>
                <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50">
                  <span className="text-[10px] text-amber-400 block font-semibold">{lang === 'ne' ? 'शुभ रङ:' : 'Lucky Colors:'}</span>
                  <span className="font-bold text-amber-100">{result.luckyColors.join(', ')}</span>
                </div>
                <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-amber-400 block font-semibold">{lang === 'ne' ? 'शुभ वार:' : 'Lucky Days:'}</span>
                  <span className="font-bold text-amber-100">{result.luckyDays.join(', ')}</span>
                </div>
              </div>

              {/* Yearly Forecast */}
              <div className="bg-gradient-to-r from-amber-900/50 to-amber-950/60 p-4 rounded-xl border border-amber-700/60 text-xs space-y-1">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ne' ? 'वार्षिक पूर्वानुमान:' : 'Yearly Forecast:'}</span>
                </h4>
                <p className="text-amber-100/90 leading-relaxed">{result.yearPrediction}</p>
              </div>

              <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 flex items-center justify-between text-[11px] text-amber-300/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>वैदिक चाल्डियन एवं पाइथागोरस अंक विज्ञान</span>
                </span>
                <span className="font-mono text-amber-400">
                  {birthDate}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-dashed border-amber-800/60 rounded-2xl p-10 text-center text-amber-300/80 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-amber-500/60 animate-pulse" />
              <h4 className="text-base font-bold font-serif text-amber-200">
                {lang === 'ne' ? 'अंक ज्योतिष नतिजा यहाँ देखिनेछ' : 'Numerology Results Will Appear Here'}
              </h4>
              <p className="text-xs max-w-sm mx-auto text-amber-400/80">
                {lang === 'ne'
                  ? 'नाम र जन्ममिति भरेर विश्लेषण बटन थिच्नुहोस्।'
                  : 'Enter your name and date of birth to analyze.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

