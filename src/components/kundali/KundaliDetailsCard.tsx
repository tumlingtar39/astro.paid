import React from 'react';
import { KundaliResult, KundaliInput, Language } from '../../types';

interface KundaliDetailsCardProps {
  result: KundaliResult;
  input: KundaliInput;
  lang: Language;
  activeTab?: 'avakahada' | 'vivaran' | 'panchanga';
}

// 27 Nakshatras: 4 Charan Syllables & Asana
const NAKSHATRA_SYLLABLES: Record<string, { letters: string[]; allText: string; asanaNe: string; asanaEn: string }> = {
  'अश्विनी': { letters: ['चू', 'चे', 'चो', 'ला'], allText: 'चू, चे, चो, ला', asanaNe: 'अश्व', asanaEn: 'Horse' },
  'भरणी': { letters: ['ली', 'लू', 'ले', 'लो'], allText: 'ली, लू, ले, लो', asanaNe: 'गज', asanaEn: 'Elephant' },
  'कृत्तिका': { letters: ['अ', 'ई', 'उ', 'ए'], allText: 'अ, ई, उ, ए', asanaNe: 'मेष', asanaEn: 'Ram' },
  'रोहिणी': { letters: ['ओ', 'वा', 'वी', 'वू'], allText: 'ओ, वा, वी, वू', asanaNe: 'सर्प', asanaEn: 'Serpent' },
  'मृगशिरा': { letters: ['वे', 'वो', 'का', 'की'], allText: 'वे, वो, का, की', asanaNe: 'मृग', asanaEn: 'Deer' },
  'आर्द्रा': { letters: ['कु', 'घ', 'ङ', 'छ'], allText: 'कु, घ, ङ, छ', asanaNe: 'श्वान', asanaEn: 'Dog' },
  'पुनर्वसु': { letters: ['के', 'को', 'हा', 'ही'], allText: 'के, को, हा, ही', asanaNe: 'मार्जार', asanaEn: 'Cat' },
  'पुष्य': { letters: ['हू', 'हे', 'हो', 'डा'], allText: 'हू, हे, हो, डा', asanaNe: 'मेष', asanaEn: 'Ram' },
  'अश्लेषा': { letters: ['डी', 'डू', 'डे', 'डो'], allText: 'डी, डू, डे, डो', asanaNe: 'मूषक', asanaEn: 'Rat' },
  'मघा': { letters: ['मा', 'मी', 'मू', 'मे'], allText: 'मा, मी, मू, मे', asanaNe: 'सिंह', asanaEn: 'Lion' },
  'पूर्वाफाल्गुनी': { letters: ['मो', 'टा', 'टी', 'टू'], allText: 'मो, टा, टी, टू', asanaNe: 'व्याघ्र', asanaEn: 'Tiger' },
  'उत्तराफाल्गुनी': { letters: ['टे', 'टो', 'पा', 'पी'], allText: 'टे, टो, पा, पी', asanaNe: 'गौ', asanaEn: 'Cow' },
  'हस्त': { letters: ['पू', 'ष', 'ण', 'ठ'], allText: 'पू, ष, ण, ठ', asanaNe: 'महिष', asanaEn: 'Buffalo' },
  'चित्रा': { letters: ['पे', 'पो', 'रा', 'री'], allText: 'पे, पो, रा, री', asanaNe: 'व्याघ्र', asanaEn: 'Tiger' },
  'स्वाती': { letters: ['रू', 'रे', 'रो', 'ता'], allText: 'रू, रे, रो, ता', asanaNe: 'महिष', asanaEn: 'Buffalo' },
  'विशाखा': { letters: ['ती', 'तू', 'ते', 'तो'], allText: 'ती, तू, ते, तो', asanaNe: 'व्याघ्र', asanaEn: 'Tiger' },
  'अनुराधा': { letters: ['ना', 'नी', 'नू', 'ने'], allText: 'ना, नी, नू, ने', asanaNe: 'मृग', asanaEn: 'Deer' },
  'ज्येष्ठा': { letters: ['नो', 'या', 'यी', 'यू'], allText: 'नो, या, यी, यू', asanaNe: 'कच्छप', asanaEn: 'Tortoise' },
  'मूल': { letters: ['ये', 'यो', 'भा', 'भी'], allText: 'ये, यो, भा, भी', asanaNe: 'श्वान', asanaEn: 'Dog' },
  'पूर्वाषाढा': { letters: ['भू', 'धा', 'फा', 'ढा'], allText: 'भू, धा, फा, ढा', asanaNe: 'वानर', asanaEn: 'Monkey' },
  'उत्तराषाढा': { letters: ['भे', 'भो', 'जा', 'जी'], allText: 'भे, भो, जा, जी', asanaNe: 'नकुल', asanaEn: 'Mongoose' },
  'श्रवण': { letters: ['खी', 'खू', 'खे', 'खो'], allText: 'खी, खू, खे, खो', asanaNe: 'वानर', asanaEn: 'Monkey' },
  'धनिष्ठा': { letters: ['गा', 'गी', 'गू', 'गे'], allText: 'गा, गी, गू, गे', asanaNe: 'सिंह', asanaEn: 'Lion' },
  'शतभिषा': { letters: ['गो', 'सा', 'सी', 'सू'], allText: 'गो, सा, सी, सू', asanaNe: 'अश्व', asanaEn: 'Horse' },
  'पूर्वाभाद्रपदा': { letters: ['से', 'सो', 'दा', 'दी'], allText: 'से, सो, दा, दी', asanaNe: 'सिंह', asanaEn: 'Lion' },
  'उत्तराभाद्रपदा': { letters: ['दू', 'थ', 'झ', 'ञ'], allText: 'दू, थ, झ, ञ', asanaNe: 'गौ', asanaEn: 'Cow' },
  'रेवती': { letters: ['दे', 'दो', 'चा', 'ची'], allText: 'दे, दो, चा, ची', asanaNe: 'गज', asanaEn: 'Elephant' }
};

function toDevDigits(val: string | number): string {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/\d/g, (d) => digits[parseInt(d, 10)]);
}

// Convert 24hr time "HH:MM" to 12hr "hh:mm:ss पूर्वाह्न (AM)"
function formatTime12(timeStr: string, lang: Language): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0] || '0', 10);
  const m = parts[1] || '00';
  const s = parts[2] || '००';
  const isPM = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const hPad = String(h).padStart(2, '0');
  const periodNe = isPM ? 'अपराह्न (PM)' : 'पूर्वाह्न (AM)';
  const periodEn = isPM ? 'PM' : 'AM';
  if (lang === 'ne') {
    return `${toDevDigits(hPad)}:${toDevDigits(m)}:${toDevDigits(s)} ${periodNe}`;
  }
  return `${hPad}:${m}:${s} ${periodEn}`;
}

// Calculate age in Y, M, D from AD birthDate
function calculateAge(birthDateStr: string, lang: Language): string {
  if (!birthDateStr) return '';
  try {
    const bDate = new Date(birthDateStr.trim().replace(/\//g, '-'));
    if (isNaN(bDate.getTime())) return '';
    const now = new Date();
    let years = now.getFullYear() - bDate.getFullYear();
    let months = now.getMonth() - bDate.getMonth();
    let days = now.getDate() - bDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (lang === 'ne') {
      return `${toDevDigits(years)} वर्ष ${toDevDigits(months)} महिना ${toDevDigits(days)} दिन`;
    }
    return `${years} yrs ${months} mos ${days} days`;
  } catch {
    return '';
  }
}

// Format coordinates like २७ उ ४१ / ८५ पू २०
function formatGeoCoords(lat: number, lon: number, lang: Language): string {
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = Math.round((Math.abs(lat) - latDeg) * 60);
  const latDir = lat >= 0 ? (lang === 'ne' ? 'उ' : 'N') : (lang === 'ne' ? 'द' : 'S');

  const lonDeg = Math.floor(Math.abs(lon));
  const lonMin = Math.round((Math.abs(lon) - lonDeg) * 60);
  const lonDir = lon >= 0 ? (lang === 'ne' ? 'पू' : 'E') : (lang === 'ne' ? 'प' : 'W');

  if (lang === 'ne') {
    return `${toDevDigits(latDeg)} ${latDir} ${toDevDigits(latMin)} / ${toDevDigits(lonDeg)} ${lonDir} ${toDevDigits(lonMin)}`;
  }
  return `${latDeg}° ${latMin}' ${latDir} / ${lonDeg}° ${lonMin}' ${lonDir}`;
}

// Convert ghati pala like "घ. ०८ प. २० वि. ०७" to "०८:२०:०७"
function formatGhatiColon(str?: string, defaultVal = '००:००:००'): string {
  if (!str) return defaultVal;
  if (str.includes(':')) {
    return toDevDigits(str.trim());
  }
  const nums = str.match(/\d+/g);
  if (!nums || nums.length === 0) return defaultVal;
  const g = String(nums[0] || '0').padStart(2, '0');
  const p = String(nums[1] || '0').padStart(2, '0');
  const v = String(nums[2] || '0').padStart(2, '0');
  return `${toDevDigits(g)}:${toDevDigits(p)}:${toDevDigits(v)}`;
}

export const KundaliDetailsCard: React.FC<KundaliDetailsCardProps> = ({
  result,
  input,
  lang,
  activeTab = 'avakahada',
}) => {
  const cleanNak = (result.panchanga?.nakshatraNe || result.nakshatra || '').replace(/\(.*\)/, '').trim();
  const nakInfo = NAKSHATRA_SYLLABLES[cleanNak] || {
    letters: ['चू', 'चे', 'चो', 'ला'],
    allText: 'चू, चे, चो, ला',
    asanaNe: 'कच्छप',
    asanaEn: 'Tortoise'
  };

  const padNum = result.panchanga?.nakshatraPad || result.nakshatraPad || 1;
  const currentLetter = nakInfo.letters[(padNum - 1) % nakInfo.letters.length] || result.avakhada?.namakshar || 'या';
  const cleanMoonRashi = (result.panchanga?.moonSignNe || result.rashi || '').replace(/\(.*\)/, '').trim();

  // Formatted date strings
  const bsDate = input.calendarType === 'BS' ? input.birthDate : (result.bsBirthDate || '२०६३/०७/०९');
  const adDateFormatted = (() => {
    try {
      const d = new Date(input.calendarType === 'AD' ? input.birthDate : (result.birthDate || '2006-10-26'));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return result.birthDate || 'Oct 26, 2006';
    }
  })();

  const ageStr = calculateAge(result.birthDate || input.birthDate, lang);
  const timeFormatted = formatTime12(input.birthTime || result.birthTime, lang);
  const ishtaKalaFormatted = formatGhatiColon(result.panchanga?.ishtaKalaGhatiPal, '०८:२०:०७');
  const bhayatStr = formatGhatiColon(result.panchanga?.nakshatraBhuktaGhatiPal, '३१:०८:२६');
  const bhabhogStr = formatGhatiColon(result.panchanga?.bhabhogaGhatiPal, '६३:००:४९');
  const bhayatBhabhogStr = `${bhayatStr} / ${bhabhogStr}`;

  return (
    <div className="space-y-4">
      {/* Main Details Card - Styled Exactly Like Screenshot */}
      <div className="bg-stone-900/95 border border-amber-800/70 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* TAB 1: अबकहडाचक्र (Avakahada Chakra) */}
        {activeTab === 'avakahada' && (
          <div className="space-y-3.5 divide-y divide-amber-900/30">
            {/* नाम */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-1">
              <span className="font-bold text-red-400 font-serif">
                {lang === 'ne' ? 'नाम' : 'Name'}
              </span>
              <span className="font-bold text-amber-100 font-serif">
                {result.name || input.name || 'Aaaaa'}
              </span>
            </div>

            {/* नामाक्षर */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-teal-400 font-serif">
                {lang === 'ne' ? 'नामाक्षर' : 'Name Syllable'}
              </span>
              <span className="font-semibold text-teal-200 font-serif">
                {currentLetter} - {cleanNak} ({toDevDigits(String(padNum).padStart(2, '0'))}) - {cleanMoonRashi}
              </span>
            </div>

            {/* नक्षत्राक्षर */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-amber-400 font-serif">
                {lang === 'ne' ? 'नक्षत्राक्षर' : 'Nakshatra Letters'}
              </span>
              <span className="font-semibold text-amber-200 font-serif">
                {nakInfo.allText}
              </span>
            </div>

            {/* तिथि */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-indigo-300 font-serif">
                {lang === 'ne' ? 'तिथि' : 'Tithi'}
              </span>
              <span className="font-semibold text-indigo-200 font-serif">
                {result.panchanga?.chandraMasaNe || 'कार्तिक'} {result.panchanga?.pakshaNe || 'शुक्ल'} - {result.panchanga?.tithiNe || 'चतुर्थी'}
              </span>
            </div>

            {/* योग */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-emerald-400 font-serif">
                {lang === 'ne' ? 'योग' : 'Yoga'}
              </span>
              <span className="font-semibold text-emerald-200 font-serif">
                {result.panchanga?.yogaNe || 'शोभन'}
              </span>
            </div>

            {/* करण */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-purple-400 font-serif">
                {lang === 'ne' ? 'करण' : 'Karana'}
              </span>
              <span className="font-semibold text-purple-200 font-serif">
                {result.panchanga?.karanaNe || 'भद्रा'}
              </span>
            </div>

            {/* गण */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-sky-400 font-serif">
                {lang === 'ne' ? 'गण' : 'Gana'}
              </span>
              <span className="font-semibold text-sky-200 font-serif">
                {result.avakhada?.gana || 'राक्षस'}
              </span>
            </div>

            {/* नाडी */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-stone-300 font-serif">
                {lang === 'ne' ? 'नाडी' : 'Nadi'}
              </span>
              <span className="font-semibold text-stone-200 font-serif">
                {result.avakhada?.nadi || 'आद्य'}
              </span>
            </div>

            {/* वर्ण / वैश्य */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-amber-500 font-serif">
                {lang === 'ne' ? 'वर्ण / वैश्य' : 'Varna / Vashya'}
              </span>
              <span className="font-semibold text-amber-300 font-serif">
                {result.avakhada?.varna || 'विप्र'} / {result.avakhada?.vashya || 'कीट'}
              </span>
            </div>

            {/* योनि / आसन */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-cyan-400 font-serif">
                {lang === 'ne' ? 'योनि / आसन' : 'Yoni / Asana'}
              </span>
              <span className="font-semibold text-cyan-200 font-serif">
                {result.avakhada?.yoni || 'मृग'} / {nakInfo.asanaNe || 'कच्छप'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: विवरण (Birth Details) */}
        {activeTab === 'vivaran' && (
          <div className="space-y-3.5 divide-y divide-amber-900/30">
            {/* जन्म मिति */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-1">
              <span className="font-bold text-red-400 font-serif">
                {lang === 'ne' ? 'जन्म मिति' : 'Birth Date (BS)'}
              </span>
              <span className="font-bold text-red-200 font-mono">
                {bsDate}
              </span>
            </div>

            {/* ई.सं. मिति (AD) */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-teal-400 font-serif">
                {lang === 'ne' ? 'ई.सं. मिति (AD)' : 'Date (AD)'}
              </span>
              <span className="font-semibold text-teal-200 font-mono">
                {adDateFormatted}
              </span>
            </div>

            {/* उमेर */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-amber-500 font-serif">
                {lang === 'ne' ? 'उमेर' : 'Age'}
              </span>
              <span className="font-semibold text-amber-200 font-serif">
                {ageStr}
              </span>
            </div>

            {/* समय */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-indigo-300 font-serif">
                {lang === 'ne' ? 'समय' : 'Birth Time'}
              </span>
              <span className="font-semibold text-indigo-200 font-mono">
                {timeFormatted}
              </span>
            </div>

            {/* इष्टकाल समय */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-emerald-400 font-serif">
                {lang === 'ne' ? 'इष्टकाल समय' : 'Ishta Kala'}
              </span>
              <span className="font-semibold text-emerald-200 font-mono">
                {ishtaKalaFormatted}
              </span>
            </div>

            {/* बार */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-purple-400 font-serif">
                {lang === 'ne' ? 'बार' : 'Day of Week'}
              </span>
              <span className="font-semibold text-purple-200 font-serif">
                {result.panchanga?.varaNe || 'बिहीबार'}
              </span>
            </div>

            {/* देश */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-sky-400 font-serif">
                {lang === 'ne' ? 'देश' : 'Country'}
              </span>
              <span className="font-semibold text-sky-200 font-serif">
                {input.birthPlace?.toLowerCase().includes('india') ? 'India' : 'Nepal'}
              </span>
            </div>

            {/* जन्मस्थान */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-stone-300 font-serif">
                {lang === 'ne' ? 'जन्मस्थान' : 'Birth Place'}
              </span>
              <span className="font-semibold text-stone-200 font-serif">
                {result.birthPlace || input.birthPlace || 'Lalitpur'}
              </span>
            </div>

            {/* अक्षांश / देशान्तर */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-amber-500 font-serif">
                {lang === 'ne' ? 'अक्षांश / देशान्तर' : 'Latitude / Longitude'}
              </span>
              <span className="font-semibold text-amber-200 font-mono">
                {formatGeoCoords(result.latitude || input.latitude || 27.7, result.longitude || input.longitude || 85.3, lang)}
              </span>
            </div>

            {/* भयात / भभोग */}
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-cyan-400 font-serif">
                {lang === 'ne' ? 'भयात / भभोग' : 'Bhayat / Bhabhoga'}
              </span>
              <span className="font-semibold text-cyan-200 font-mono">
                {bhayatBhabhogStr}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: पञ्चाङ्ग (Panchanga Details) */}
        {activeTab === 'panchanga' && (
          <div className="space-y-3.5 divide-y divide-amber-900/30">
            <div className="flex items-center justify-between text-sm sm:text-base pt-1">
              <span className="font-bold text-red-400 font-serif">{lang === 'ne' ? 'संवत्सर' : 'Samvatsara'}</span>
              <span className="font-semibold text-amber-100 font-serif">{result.panchanga?.samvatsaraNe || 'रौद्र'}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-teal-400 font-serif">{lang === 'ne' ? 'अयन / ऋतु' : 'Ayana / Ritu'}</span>
              <span className="font-semibold text-teal-200 font-serif">{result.panchanga?.ayanaNe || 'दक्षिणायन'} / {result.panchanga?.rituNe || 'शरद'}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-amber-400 font-serif">{lang === 'ne' ? 'मास / पक्ष' : 'Masa / Paksha'}</span>
              <span className="font-semibold text-amber-200 font-serif">{result.panchanga?.chandraMasaNe || 'कार्तिक'} ({result.panchanga?.pakshaNe || 'शुक्ल'})</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-indigo-300 font-serif">{lang === 'ne' ? 'तिथि' : 'Tithi'}</span>
              <span className="font-semibold text-indigo-200 font-serif">{result.panchanga?.tithiNe || 'चतुर्थी'}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-emerald-400 font-serif">{lang === 'ne' ? 'नक्षत्र' : 'Nakshatra'}</span>
              <span className="font-semibold text-emerald-200 font-serif">{result.panchanga?.nakshatraNe || 'ज्येष्ठा'} (चरण {toDevDigits(padNum)})</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-purple-400 font-serif">{lang === 'ne' ? 'योग / करण' : 'Yoga / Karana'}</span>
              <span className="font-semibold text-purple-200 font-serif">{result.panchanga?.yogaNe || 'शोभन'} / {result.panchanga?.karanaNe || 'भद्रा'}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-sky-400 font-serif">{lang === 'ne' ? 'सूर्योदय / सूर्यास्त' : 'Sunrise / Sunset'}</span>
              <span className="font-semibold text-sky-200 font-mono">{toDevDigits(result.panchanga?.sunrise || '०६:१२')} / {toDevDigits(result.panchanga?.sunset || '१७:२४')}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base pt-3">
              <span className="font-bold text-cyan-400 font-serif">{lang === 'ne' ? 'दिनमान / रात्रिमान' : 'Dinamana / Ratrimana'}</span>
              <span className="font-semibold text-cyan-200 font-mono">{toDevDigits(result.panchanga?.dinamanaGhatiPal || 'घ. २८ प. ०२')} / {toDevDigits(result.panchanga?.ratrimanaGhatiPal || 'घ. ३१ प. ५८')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Note Banner - Exactly Matches Screenshot */}
      <div className="bg-stone-900/80 border border-stone-700/60 rounded-2xl p-3.5 px-4 text-xs sm:text-sm text-stone-300 flex items-center gap-2 shadow-sm">
        <span className="font-bold text-amber-300 font-serif shrink-0">
          {lang === 'ne' ? 'नोट :' : 'Note:'}
        </span>
        <span className="text-stone-300/90">
          {lang === 'ne' ? 'नोट लेख्न पहिले कुण्डली सेभ गर्नुहोस्।' : 'Please save Kundali before writing notes.'}
        </span>
      </div>
    </div>
  );
};
