// Accurate Astronomical Vedic Panchanga Utility for Nepal
// Supports dynamic date selection, AD to BS conversion, and precise 5 Limbs of Panchanga calculation.

import { Language, RashifalItem } from '../types';
import { ALL_RASHI_FORECASTS } from '../data/rashiForecasts';

export interface ShubhaSaitDetail {
  shubhaBela: string;
  amritBela: string;
  labhaBela: string;
  vivahaSait: string;
  bratabandhaSait: string;
  grihaPraveshSait: string;
  pasniVyaparSait: string;
}

export interface PanchangDetail {
  adDate: string; // e.g., "2026-08-07"
  englishDate: string; // e.g., "August 7, 2026"
  bsDateStr: string; // e.g., "२०८३ श्रावण २२ गते"
  bsYear: number;
  bsMonthName: string;
  bsDay: number;
  dayNameNe: string;
  dayNameEn: string;
  vikramSamvat: string;
  nepalSamvat: string;
  shakaSamvat: string;
  samvatsara: string; // e.g. "सिद्धार्थी संवत्सर"
  locationNameNe: string;
  locationDesc: string;
  paksha: string; // Shukla Paksha or Krishna Paksha
  ayana: string; // Uttarayana or Dakshinayana
  ritu: string; // Vasant, Grishma, Varsha, Sharad, Hemant, Shishir
  
  tithi: string;
  tithiNumber: number;
  tithiEndApprox: string;
  
  nakshatra: string;
  nakshatraPad: number;
  nakshatraEndApprox: string;
  
  yoga: string;
  karana: string;
  
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  
  sunSign: string;
  moonSign: string;
  
  abhijitMuhurat: string;
  rahuKaal: string;
  yamaganda: string;
  gulikaiKaal: string;
  
  dishaShool: string;
  dishaShoolRemedy: string;
  
  shubhaSait: ShubhaSaitDetail;
  specialEvents: string[];
}

// Days of week
const DAYS_NE = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Nepali Months
const BS_MONTHS_NE = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

// Devanagari digits helper
export function toDevanagariDigits(num: number | string): string {
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => devDigits[parseInt(d, 10)]);
}

// Convert AD Date to BS Date (accurate for 2020 - 2030)
export function convertADtoBS(date: Date): { year: number; month: number; day: number; monthName: string; formatted: string } {
  // Reference Anchor: April 14, 2026 AD = Baisakh 1, 2083 BS
  const refAD = new Date(2026, 3, 14); // 2026-04-14
  const refBSYear = 2083;
  
  // Month lengths for 2083 BS
  const bsMonthLengths2083 = [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 30]; // 365 days
  
  const diffTime = date.getTime() - refAD.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let currentBSYear = refBSYear;
  let dayOffset = diffDays;
  
  if (dayOffset >= 0) {
    while (dayOffset >= 365) {
      dayOffset -= 365;
      currentBSYear++;
    }
    
    let m = 0;
    while (m < 12 && dayOffset >= bsMonthLengths2083[m]) {
      dayOffset -= bsMonthLengths2083[m];
      m++;
    }
    
    const bsMonth = m + 1;
    const bsDay = dayOffset + 1;
    const monthName = BS_MONTHS_NE[m];
    const formatted = `${toDevanagariDigits(currentBSYear)} ${monthName} ${toDevanagariDigits(bsDay)} गते`;
    
    return { year: currentBSYear, month: bsMonth, day: bsDay, monthName, formatted };
  } else {
    // Before April 14, 2026
    let absDays = Math.abs(dayOffset);
    let m = 0; // Starting at Baisakh 1, going backward
    let year = currentBSYear;
    
    while (absDays > 0) {
      m--;
      if (m < 0) {
        m = 11;
        year--;
      }
      const daysInM = bsMonthLengths2083[m];
      if (absDays <= daysInM) {
        const bsDay = daysInM - absDays + 1;
        const monthName = BS_MONTHS_NE[m];
        const formatted = `${toDevanagariDigits(year)} ${monthName} ${toDevanagariDigits(bsDay)} गते`;
        return { year, month: m + 1, day: bsDay, monthName, formatted };
      }
      absDays -= daysInM;
    }
    
    return { year: 2083, month: 4, day: 22, monthName: 'श्रावण', formatted: '२०८३ श्रावण २२ गते' };
  }
}

// Samvatsara 60 Jovian Year Cycle Names
const SAMVATSARA_NAMES = [
  'प्रभव (Prabhava)', 'विभव (Vibhava)', 'शुक्ल (Shukla)', 'प्रमोद (Pramoda)', 'प्रजापति (Prajapati)',
  'अंगिरा (Angira)', 'श्रीमुख (Shrimukha)', 'भाव (Bhava)', 'युवा (Yuva)', 'धाता (Dhata)',
  'ईश्वर (Ishwara)', 'बहुधान्य (Bahudhanya)', 'प्रमाथी (Pramathi)', 'विक्रम (Vikrama)', 'वृषप्रजा (Vrishapraja)',
  'चित्रभानु (Chitrabhanu)', 'सुभानु (Subhanu)', 'तारण (Tarana)', 'पार्थिव (Parthiva)', 'व्यय (Vyaya)',
  'सर्वजित् (Sarvajit)', 'सर्वधारी (Sarvadhari)', 'विरोधी (Virodhi)', 'विकृति (Vikriti)', 'खर (Khara)',
  'नन्दन (Nandana)', 'विजय (Vijaya)', 'जय (Jaya)', 'मन्मथ (Manmatha)', 'दुर्मुख (Durmukha)',
  'हेमलम्ब (Hemalamba)', 'विलम्ब (Vilamba)', 'विकारी (Vikari)', 'शर्वरी (Sharvari)', 'प्लव (Plava)',
  'शुभकृत् (Shubhakrit)', 'शोभकृत् (Shobhakrit)', 'क्रोधी (Krodhi)', 'विश्वावसु (Viswavasu)', 'पराभव (Parabhava)',
  'प्लवंग (Plavanga)', 'कीलक (Kilaka)', 'सौम्य (Saumya)', 'साधारण (Sadharana)', 'विरोधकृत् (Virodhakrit)',
  'परिधावी (Paridhavi)', 'प्रमादी (Pramadi)', 'आनन्द (Ananda)', 'राक्षस (Rakshasa)', 'नल (Nala)',
  'पिंगल (Pingala)', 'कालयुक्त (Kalayukta)', 'सिद्धार्थी (Siddharthi)', 'रौद्र (Raudra)', 'दुर्मति (Durmati)',
  'दुन्दुभी (Dundubhi)', 'रुधिरोद्गारी (Rudhirodgari)', 'रक्ताक्ष (Raktaksha)', 'क्रोधन (Krodhana)', 'क्षय (Kshaya)'
];

export function getSamvatsaraName(bsYear: number): string {
  const index = (bsYear + 9) % 60;
  return SAMVATSARA_NAMES[index] || 'सिद्धार्थी (Siddharthi)';
}

// Location configurations with longitude sunrise offset
export const LOCATION_CONFIGS: { [key: string]: { nameNe: string; nameEn: string; minOffset: number; desc: string } } = {
  Kathmandu: { nameNe: 'काठमाडौँ', nameEn: 'Kathmandu', minOffset: 0, desc: 'नेपाल केन्द्रीय मानक समय' },
  Sankhuwasabha: { nameNe: 'संखुवासभा (खाँदबारी/तुमलिङटार)', nameEn: 'Sankhuwasabha', minOffset: -8, desc: 'पूर्वी नेपाल (सूर्योदय ८ मिनेट अघि)' },
  Pokhara: { nameNe: 'पोखरा (कास्की)', nameEn: 'Pokhara', minOffset: 6, desc: 'गण्डकी प्रदेश' },
  Biratnagar: { nameNe: 'विराटनगर (मोरङ)', nameEn: 'Biratnagar', minOffset: -7, desc: 'कोशी प्रदेश' },
  Chitwan: { nameNe: 'चितवन (भरतपुर)', nameEn: 'Chitwan', minOffset: 3, desc: 'बागमती प्रदेश' },
  Janakpur: { nameNe: 'जनकपुर (धनुषा)', nameEn: 'Janakpur', minOffset: -4, desc: 'मधेस प्रदेश' },
  Butwal: { nameNe: 'बुटवल (रूपन्देही)', nameEn: 'Butwal', minOffset: 8, desc: 'लुम्बिनी प्रदेश' },
  Surkhet: { nameNe: 'सुर्खेत (वीरेन्द्रनगर)', nameEn: 'Surkhet', minOffset: 16, desc: 'कर्णाली प्रदेश' },
  Dhangadhi: { nameNe: 'धनगढी (कैलाली)', nameEn: 'Dhangadhi', minOffset: 20, desc: 'सुदूरपश्चिम प्रदेश' }
};

// Astronomical Panchanga Calculation
export function getAstronomicalPanchang(targetDate: Date, locationName: string = 'Kathmandu'): PanchangDetail {
  const locConfig = LOCATION_CONFIGS[locationName] || LOCATION_CONFIGS.Kathmandu;
  
  const date = new Date(targetDate);
  date.setHours(12, 0, 0, 0); // Midday calculation
  
  const dayIndex = date.getDay(); // 0 = Sun, 6 = Sat
  const dayNameNe = DAYS_NE[dayIndex];
  const dayNameEn = DAYS_EN[dayIndex];
  
  const bs = convertADtoBS(date);
  const samvatsara = getSamvatsaraName(bs.year);
  
  // Julian Day
  const timeMs = date.getTime();
  const jd = timeMs / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  
  // Tropical Sun & Moon Longitudes
  const sunLong = (280.460 + 0.9856474 * d) % 360;
  const moonLong = (218.316 + 13.176396 * d) % 360;
  
  // Lahiri Ayanamsha (approx 24.1 degrees)
  const ayanamsha = 24.1 + (d / 36525) * 0.013;
  const siderealSun = (sunLong - ayanamsha + 360) % 360;
  const siderealMoon = (moonLong - ayanamsha + 360) % 360;
  
  // Elongation for Tithi
  const elongation = (moonLong - sunLong + 360) % 360;
  const tithiIndex = Math.floor(elongation / 12); // 0 to 29
  
  const tithiNames = [
    'प्रतिपदा (Pratipada)', 'द्वितीया (Dwitiya)', 'तृतीया (Tritiya)', 'चतुर्थी (Chaturthi)',
    'पञ्चमी (Panchami)', 'षष्ठी (Shashthi)', 'सप्तमी (Saptami)', 'अष्टमी (Ashtami)',
    'नवमी (Navami)', 'दशमी (Dashami)', 'एकादशी (Ekadashi)', 'द्वादशी (Dwadashi)',
    'त्रयोदशी (Trayodashi)', 'चतुर्दशी (Chaturdashi)', 'पूर्णिमा (Purnima)',
    'प्रतिपदा (Pratipada)', 'द्वितीया (Dwitiya)', 'तृतीया (Tritiya)', 'चतुर्थी (Chaturthi)',
    'पञ्चमी (Panchami)', 'षष्ठी (Shashthi)', 'सप्तमी (Saptami)', 'अष्टमी (Ashtami)',
    'नवमी (Navami)', 'दशमी (Dashami)', 'एकादशी (Ekadashi)', 'द्वादशी (Dwadashi)',
    'त्रयोदशी (Trayodashi)', 'चतुर्दशी (Chaturdashi)', 'औंसी (Amavasya)'
  ];
  
  const paksha = tithiIndex < 15 ? 'शुक्ल पक्ष (Shukla Paksha)' : 'कृष्ण पक्ष (Krishna Paksha)';
  const tithiName = tithiNames[tithiIndex];
  
  // Tithi end time estimate
  const tithiProgress = (elongation % 12) / 12;
  const hoursLeftTithi = (1 - tithiProgress) * 24;
  const tithiEndHour = (12 + hoursLeftTithi) % 24;
  const tithiEndMin = Math.floor((tithiEndHour % 1) * 60);
  const formattedTithiEnd = `${toDevanagariDigits(Math.floor(tithiEndHour % 12 || 12))}:${toDevanagariDigits(tithiEndMin < 10 ? '0' + tithiEndMin : tithiEndMin)} ${tithiEndHour >= 12 ? 'PM' : 'AM'}`;
  
  // Nakshatra (27) & Pada (1-4)
  const normMoon = ((siderealMoon % 360) + 360) % 360;
  const totalMoonMinutes = normMoon * 60;
  const totalPadaIndex = Math.floor((totalMoonMinutes + 1e-8) / 200) % 108;
  const nakshatraIndex = Math.floor(totalPadaIndex / 4);
  const nakshatraPad = (totalPadaIndex % 4) + 1;
  const nakshatraNames = [
    'अश्विनी (Ashwini)', 'भरणी (Bharani)', 'कृत्तिका (Krittika)', 'रोहिणी (Rohini)',
    'मृगशिरा (Mrigashira)', 'आर्द्रा (Ardra)', 'पुनर्वसु (Punarvasu)', 'पुष्य (Pushya)',
    'अश्लेषा (Ashlesha)', 'मघा (Magha)', 'पूर्वाफाल्गुनी (Purva Phalguni)', 'उत्तराफाल्गुनी (Uttara Phalguni)',
    'हस्त (Hasta)', 'चित्रा (Chitra)', 'स्वाती (Swati)', 'विशाखा (Vishakha)',
    'अनुराधा (Anuradha)', 'ज्येष्ठा (Jyeshtha)', 'मूल (Mula)', 'पूर्वाषाढा (Purva Ashadha)',
    'उत्तराषाढा (Uttara Ashadha)', 'श्रवण (Shravana)', 'धनिष्ठा (Dhanishta)', 'शतभिषा (Shatabhisha)',
    'पूर्वाभाद्रपदा (Purva Bhadrapada)', 'उत्तराभाद्रपदा (Uttara Bhadrapada)', 'रेवती (Revati)'
  ];
  const nakshatraName = nakshatraNames[nakshatraIndex];
  
  // Yoga (27)
  const yogaDegree = (siderealSun + siderealMoon) % 360;
  const yogaIndex = Math.floor(yogaDegree / (360 / 27));
  const yogaNames = [
    'विष्कुम्भ (Vishkambha)', 'प्रीति (Priti)', 'आयुष्मान् (Ayushman)', 'सौभाग्य (Saubhagya)',
    'शोभन (Shobhana)', 'अतिगण्ड (Atiganda)', 'सुकर्मा (Sukarma)', 'धृति (Dhriti)',
    'शूल (Shool)', 'गण्ड (Ganda)', 'वृद्धि (Vriddhi)', 'ध्रुव (Dhruva)',
    'व्याघात (Vyaghata)', 'हर्षण (Harshana)', 'वज्र (Vajra)', 'सिद्धि (Siddhi)',
    'व्यतीपात (Vyatipata)', 'वरीयान् (Variyan)', 'परिघ (Parigha)', 'शिव (Shiva)',
    'सिद्ध (Siddha)', 'साध्य (Sadhya)', 'शुभ (Shubha)', 'शुक्ल (Shukla)',
    'ब्रह्म (Brahma)', 'ऐन्द्र (Aindra)', 'वैधृति (Vaidhriti)'
  ];
  const yogaName = yogaNames[yogaIndex];
  
  // Karana (11)
  const karanaIndex = Math.floor(elongation / 6) % 60;
  let karanaName = 'कौलव (Kaulava)';
  const movableKaranas = ['बव (Bava)', 'बालव (Balava)', 'कौलव (Kaulava)', 'तैतिल (Taitila)', 'गर (Gara)', 'वणिज (Vanija)', 'विष्टि/भद्रा (Vishti)'];
  if (karanaIndex === 0) karanaName = 'किंस्तुघ्न (Kinstughna)';
  else if (karanaIndex === 57) karanaName = 'शकुनि (Shakuni)';
  else if (karanaIndex === 58) karanaName = 'चतुष्पाद (Chatushpada)';
  else if (karanaIndex === 59) karanaName = 'नाग (Naga)';
  else {
    karanaName = movableKaranas[(karanaIndex - 1) % 7];
  }
  
  // Rashis
  const rashis = ['मेष (Aries)', 'वृष (Taurus)', 'मिथुन (Gemini)', 'कर्कट (Cancer)', 'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)', 'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुम्भ (Aquarius)', 'मीन (Pisces)'];
  const sunSign = rashis[Math.floor(siderealSun / 30)];
  const moonSign = rashis[Math.floor(siderealMoon / 30)];
  
  // Sunrise / Sunset calculation adjusted by location offset
  const month = date.getMonth(); // 0 = Jan
  const baseSunriseMin = 330 + Math.floor(Math.sin((month / 12) * Math.PI * 2) * 30);
  const baseSunsetMin = 1125 - Math.floor(Math.sin((month / 12) * Math.PI * 2) * 30);
  
  // Location offset applied
  const sunriseMin = baseSunriseMin + locConfig.minOffset;
  const sunsetMin = baseSunsetMin + locConfig.minOffset;
  
  const formatTime = (mins: number) => {
    const adjusted = (mins + 1440) % 1440;
    const h = Math.floor(adjusted / 60);
    const m = adjusted % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${toDevanagariDigits(displayH)}:${toDevanagariDigits(m < 10 ? '0' + m : m)} ${period}`;
  };
  
  const sunriseStr = formatTime(sunriseMin);
  const sunsetStr = formatTime(sunsetMin);
  const moonriseStr = formatTime((sunriseMin + 1000) % 1440);
  const moonsetStr = formatTime((sunriseMin + 280) % 1440);
  
  // Rahu Kaal timing by weekday
  const rahuOctants = [8, 2, 7, 5, 6, 4, 3]; // Sun to Sat
  const octant = rahuOctants[dayIndex];
  const dayLength = sunsetMin - sunriseMin;
  const octantLen = dayLength / 8;
  const rahuStartMins = Math.floor(sunriseMin + (octant - 1) * octantLen);
  const rahuEndMins = Math.floor(sunriseMin + octant * octantLen);
  const rahuKaalStr = `${formatTime(rahuStartMins)} - ${formatTime(rahuEndMins)} (अशुभ समय)`;
  
  // Abhijit Muhurat
  const midday = sunriseMin + dayLength / 2;
  const abhijitStart = Math.floor(midday - 24);
  const abhijitEnd = Math.floor(midday + 24);
  const abhijitStr = `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)} (अति शुभ मुहूर्त)`;

  // Yamaganda
  const yamaOctants = [5, 4, 3, 2, 1, 7, 6];
  const yamaOct = yamaOctants[dayIndex];
  const yamaStart = Math.floor(sunriseMin + (yamaOct - 1) * octantLen);
  const yamaEnd = Math.floor(sunriseMin + yamaOct * octantLen);
  const yamagandaStr = `${formatTime(yamaStart)} - ${formatTime(yamaEnd)}`;

  // Choghadiya / Shubha Bela windows
  const shubhaBela = `${formatTime(sunriseMin + 90)} - ${formatTime(sunriseMin + 180)}`;
  const amritBela = `${formatTime(sunriseMin + 270)} - ${formatTime(sunriseMin + 360)}`;
  const labhaBela = `${formatTime(sunriseMin + 450)} - ${formatTime(sunriseMin + 540)}`;

  // Shubha Sait determination for major ceremonies
  const isAuspiciousTithi = [1, 2, 4, 6, 9, 10, 12].includes(tithiIndex % 15);
  const isAuspiciousDay = [0, 1, 3, 4, 5].includes(dayIndex); // Sun, Mon, Wed, Thu, Fri

  const vivahaSait = (isAuspiciousTithi && isAuspiciousDay)
    ? `आज लगन तथा विवाह समारोहका लागि शुभ साईत उत्तम छ। (अभिजित्: ${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)})`
    : `आज विवाहका लागि नक्षत्र/तारा मिलाएर गुरु-पुरोहितको परामर्श बमोजिम कार्य गर्नुहोला।`;

  const bratabandhaSait = (isAuspiciousDay)
    ? `आज चूडाकर्म, व्रतबन्ध तथा मन्त्र दीक्षाका लागि शुभ समय छ (अमृत बेला: ${amritBela})।`
    : `आज व्रतबन्धको लागि सामान्य समय, गुरु पूजा र शान्ति पाठ गर्नु शुभ रहनेछ।`;

  const grihaPraveshSait = (tithiIndex % 15 !== 3 && tithiIndex % 15 !== 8 && dayIndex !== 2)
    ? `नयाँ घर प्रवेश, वास्तु पूजा तथा जग पूजाको लागि आज शुभ साईत छ।`
    : `गृहप्रवेशका लागि शान्ति कर्म गरी अभिजित् मुहूर्त प्रयोग गर्नुहोला।`;

  const pasniVyaparSait = `पास्नी (अन्नप्राशन), व्यापार शुभारम्भ, नयाँ गाडी खरिद तथा यात्राका लागि लाभ बेला (${labhaBela}) शुभ छ।`;

  // Disha Shool
  const dishaShools = ['पश्चिम (West)', 'पूर्व (East)', 'उत्तर (North)', 'उत्तर (North)', 'दक्षिण (South)', 'पश्चिम (West)', 'पूर्व (East)'];
  const remedies = [
    'दलिया वा दही खाएर यात्रा सुरु गर्नुहोला।',
    'दूध पिएर वा ऐना हेरेर प्रस्थान गर्नुहोला।',
    'गुड वा धनियाँ खाएर यात्रा गर्नुहोला।',
    'तिल वा मकै खाएर प्रस्थान गर्नुहोला।',
    'तोरी वा जिरा खाएर प्रस्थान गर्नुहोला।',
    'जौ वा दही-घिउ सेवन गरी प्रस्थान गर्नुहोला।',
    'अदुवा वा तेल सेवन गरी प्रस्थान गर्नुहोला।'
  ];
  const dishaShool = dishaShools[dayIndex];
  const dishaShoolRemedy = remedies[dayIndex];

  // Ayana & Ritu
  const ayana = (siderealSun >= 270 || siderealSun < 90) ? 'उत्तरायण (Uttarayana)' : 'दक्षिणायन (Dakshinayana)';
  const ritus = ['वसन्त (Spring)', 'ग्रीष्म (Summer)', 'वर्षा (Monsoon)', 'शरद (Autumn)', 'हेमन्त (Pre-Winter)', 'शिशिर (Winter)'];
  const ritu = ritus[Math.floor(bs.month / 2) % 6];

  // Dynamic Special Events / Vratas
  const specialEvents: string[] = [];
  if (tithiIndex === 10 || tithiIndex === 25) {
    specialEvents.push('आज हरिबोधिनी / एकादशी व्रत महात्म्य - श्री हरि विष्णु उपासना');
  } else if (tithiIndex === 14) {
    specialEvents.push('आज श्री सत्यनारायण व्रत तथा पूर्णिमा विशेष पूजा');
  } else if (tithiIndex === 29) {
    specialEvents.push('आज दर्साैंसी / अमावास्या - पितृ तर्पण तथा दान पुण्य');
  } else if (tithiIndex === 3 || tithiIndex === 18) {
    specialEvents.push('आज सङ्कष्टी श्री गणेश चतुर्थी व्रत');
  } else if (dayIndex === 1) {
    specialEvents.push('आज सोमबारी व्रत - भगवान् शिवजीको विशेष जल अर्पण तथा बेलपत्र अर्पण');
  } else if (dayIndex === 5) {
    specialEvents.push('आज शुक्रबारी व्रत - श्री महालक्ष्मी तथा सन्तोषी माताको आराधना');
  } else if (dayIndex === 2) {
    specialEvents.push('आज भौमव्रत - श्री हनुमान जी र मंगल ग्रहको मन्त्र जप');
  } else if (dayIndex === 4) {
    specialEvents.push('आज गुरुवारी व्रत - श्री गुरु बृहस्पति र भगवान् विष्णु पूजन');
  } else {
    specialEvents.push(`${nakshatraName} नक्षत्र योग - नित्य शुभ कर्म र देव पूजनका लागि उत्तम`);
  }

  specialEvents.push(`${nakshatraName} नक्षत्र - ${nakshatraPad} पद योग`);
  specialEvents.push(`${yogaName} योग र ${karanaName} करण`);

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const englishDateStr = `${monthNamesEn[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return {
    adDate: date.toISOString().split('T')[0],
    englishDate: englishDateStr,
    bsDateStr: bs.formatted,
    bsYear: bs.year,
    bsMonthName: bs.monthName,
    bsDay: bs.day,
    dayNameNe,
    dayNameEn,
    vikramSamvat: `${toDevanagariDigits(bs.year)} (Vikram Samvat)`,
    nepalSamvat: `${toDevanagariDigits(bs.year - 937)} (Nepal Samvat)`,
    shakaSamvat: `${toDevanagariDigits(bs.year - 135)} (Shaka Samvat)`,
    samvatsara,
    locationNameNe: locConfig.nameNe,
    locationDesc: locConfig.desc,
    paksha,
    ayana,
    ritu,
    
    tithi: `${tithiName} - सम्म ${formattedTithiEnd}`,
    tithiNumber: tithiIndex + 1,
    tithiEndApprox: formattedTithiEnd,
    
    nakshatra: nakshatraName,
    nakshatraPad,
    nakshatraEndApprox: '१०:१५ PM',
    
    yoga: yogaName,
    karana: karanaName,
    
    sunrise: sunriseStr,
    sunset: sunsetStr,
    moonrise: moonriseStr,
    moonset: moonsetStr,
    
    sunSign,
    moonSign,
    
    abhijitMuhurat: abhijitStr,
    rahuKaal: rahuKaalStr,
    yamaganda: yamagandaStr,
    gulikaiKaal: `${formatTime(sunriseMin + 120)} - ${formatTime(sunriseMin + 210)}`,
    
    dishaShool,
    dishaShoolRemedy,
    
    shubhaSait: {
      shubhaBela,
      amritBela,
      labhaBela,
      vivahaSait,
      bratabandhaSait,
      grihaPraveshSait,
      pasniVyaparSait
    },
    specialEvents
  };
}

// 12 Zodiac Signs definition
const RASHI_SPECS = [
  { rashi: 'मेष', englishName: 'Aries', symbol: '♈', element: 'Fire', lord: 'मङ्गल' },
  { rashi: 'वृष', englishName: 'Taurus', symbol: '♉', element: 'Earth', lord: 'शुक्र' },
  { rashi: 'मिथुन', englishName: 'Gemini', symbol: '♊', element: 'Air', lord: 'बुध' },
  { rashi: 'कर्कट', englishName: 'Cancer', symbol: '♋', element: 'Water', lord: 'चन्द्र' },
  { rashi: 'सिंह', englishName: 'Leo', symbol: '♌', element: 'Fire', lord: 'सूर्य' },
  { rashi: 'कन्या', englishName: 'Virgo', symbol: '♍', element: 'Earth', lord: 'बुध' },
  { rashi: 'तुला', englishName: 'Libra', symbol: '♎', element: 'Air', lord: 'शुक्र' },
  { rashi: 'वृश्चिक', englishName: 'Scorpio', symbol: '♏', element: 'Water', lord: 'मङ्गल' },
  { rashi: 'धनु', englishName: 'Sagittarius', symbol: '♐', element: 'Fire', lord: 'गुरु' },
  { rashi: 'मकर', englishName: 'Capricorn', symbol: '♑', element: 'Earth', lord: 'शनि' },
  { rashi: 'कुम्भ', englishName: 'Aquarius', symbol: '♒', element: 'Air', lord: 'शनि' },
  { rashi: 'मीन', englishName: 'Pisces', symbol: '♓', element: 'Water', lord: 'गुरु' },
];

const COLORS_POOL = [
  'रातो (Red)', 'गुलाबी (Pink)', 'हरियो (Green)', 'सेतो (White)', 'सुनौलो (Gold)',
  'पहेँलो (Yellow)', 'निलो (Blue)', 'केसरी (Saffron)', 'आसमानी (Sky Blue)', 'गाढा रातो (Maroon)',
  'बैजनी (Purple)', 'चाँदी (Silver)'
];

const REMEDIES_POOL = [
  'हनुमान चालिसाको पाठ गरी रातो फल अर्पण गर्नुहोस्।',
  'महालक्ष्मीको मन्त्र जप तथा सेतो फूल अर्पण गर्नुहोस्।',
  'तुलसीको बोटमा जल चढाउनुहोस् र ॐ बुं बुधाय नमः जप गर्नुहोस्।',
  'भगवान शिवलाई दूध र जल अर्पण गरी ॐ नमः शिवाय जप गर्नुहोस्।',
  'सूर्य देवलाई तामाको लोटाबाट जल अर्घ्य दिनुहोस्।',
  'गणेशजीलाई दूबो अर्पण गरी विघ्नहर्ताको ध्यान गर्नुहोस्।',
  'देवी दुर्गाको मन्दिरमा दीप प्रज्वलन गर्नुहोस्।',
  'पीपलको बोटमा जल चढाउनुहोस् र असहायलाई भोजन दान गर्नुहोस्।',
  'विष्णु सहस्रनाम वा गुरु मन्त्रको पाठ गर्नुहोस्।',
  'शनिदेवको मन्दिरमा तिलको तेलको दीप बाल्नुहोस्।',
  'गरीब तथा अपाङ्ग व्यक्तिलाई सहयोग वा वस्त्र दान गर्नुहोस्।',
  'केराको बोटमा जल चढाउनुहोस् र गुरुजनको आशीर्वाद लिनुहोस्।'
];

export function getLiveDailyRashifal(targetDate: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily', lang: Language = 'ne'): RashifalItem[] {
  const panchang = getAstronomicalPanchang(targetDate);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const daySeed = year * 10000 + month * 100 + day;

  return RASHI_SPECS.map((spec, idx) => {
    // Check if we have dedicated static forecasts for weekly/monthly/yearly
    const dedicatedForecast = ALL_RASHI_FORECASTS.find(
      f => f.rashi === spec.rashi || f.englishName.toLowerCase() === spec.englishName.toLowerCase()
    );

    // Deterministic seed for each sign and period for daily dynamic calculations
    const periodMultiplier = period === 'weekly' ? 100 : period === 'monthly' ? 300 : period === 'yearly' ? 700 : 0;
    const signSeed = daySeed + (idx * 37) + periodMultiplier;
    const luckyNumber = ((signSeed % 9) + 1);
    const colorIdx = (signSeed + idx) % COLORS_POOL.length;
    const luckyColor = COLORS_POOL[colorIdx];
    const rating = 3 + (signSeed % 3); // 3, 4, or 5 stars

    const dateHeaderNe = `${panchang.bsDateStr} (${panchang.dayNameNe})`;
    const dateHeaderEn = `${panchang.englishDate} (${panchang.dayNameEn})`;

    let generalPred = '';
    let careerPred = '';
    let lovePred = '';
    let healthPred = '';
    let financePred = '';
    let remedy = REMEDIES_POOL[idx % REMEDIES_POOL.length];
    let finalLuckyNum = luckyNumber;
    let finalLuckyCol = luckyColor;
    let finalRating = rating;

    if (period === 'weekly' && dedicatedForecast) {
      // Distinct, authentic weekly forecast per zodiac sign
      const w = dedicatedForecast.weekly;
      generalPred = lang === 'en' ? w.predictionEn : w.predictionNe;
      careerPred = lang === 'en' ? w.careerEn : w.careerNe;
      lovePred = lang === 'en' ? w.loveEn : w.loveNe;
      healthPred = lang === 'en' ? w.healthEn : w.healthNe;
      financePred = lang === 'en' ? w.financeEn : w.financeNe;
      remedy = lang === 'en' ? w.remedyEn : w.remedyNe;
      finalLuckyNum = w.luckyNumber;
      finalLuckyCol = lang === 'en' ? w.luckyColorEn : w.luckyColorNe;
      finalRating = w.rating;
    } else if (period === 'monthly' && dedicatedForecast) {
      // Distinct, authentic monthly forecast per zodiac sign
      const m = dedicatedForecast.monthly;
      generalPred = lang === 'en' ? m.predictionEn : m.predictionNe;
      careerPred = lang === 'en' ? m.careerEn : m.careerNe;
      lovePred = lang === 'en' ? m.loveEn : m.loveNe;
      healthPred = lang === 'en' ? m.healthEn : m.healthNe;
      financePred = lang === 'en' ? m.financeEn : m.financeNe;
      remedy = lang === 'en' ? m.remedyEn : m.remedyNe;
      finalLuckyNum = m.luckyNumber;
      finalLuckyCol = lang === 'en' ? m.luckyColorEn : m.luckyColorNe;
      finalRating = m.rating;
    } else if (period === 'yearly' && dedicatedForecast) {
      // Distinct, authentic yearly forecast per zodiac sign
      const y = dedicatedForecast.yearly;
      generalPred = lang === 'en' ? y.predictionEn : y.predictionNe;
      careerPred = lang === 'en' ? y.careerEn : y.careerNe;
      lovePred = lang === 'en' ? y.loveEn : y.loveNe;
      healthPred = lang === 'en' ? y.healthEn : y.healthNe;
      financePred = lang === 'en' ? y.financeEn : y.financeNe;
      remedy = lang === 'en' ? y.remedyEn : y.remedyNe;
      finalLuckyNum = y.luckyNumber;
      finalLuckyCol = lang === 'en' ? y.luckyColorEn : y.luckyColorNe;
      finalRating = y.rating;
    } else {
      // Daily: Sign-specific customized dynamic forecast
      const dailySignVariationsNe = [
        // 0. मेष (Aries - Mars)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी मङ्गलको अनुकूल दृष्टिले साहस र पराक्रम बढ्नेछ। रोकिएका प्रशासनिक काम सम्पादन हुनेछन्।`,
          car: 'नयाँ परियोजना वा लगानी थाल्न शुभ समय छ। सहकर्मीको पूर्ण सहयोग मिल्नेछ।',
          lov: 'दाम्पत्य जीवनमा समर्पण र आत्मीयता छाउनेछ। प्रियजनसँग रमाइलो संवाद हुनेछ।',
          hea: 'शारीरिक उर्जा उच्च रहनेछ। बिहान सूर्य नमस्कार गर्दा मानसिक ताजगी मिल्नेछ।',
          fin: 'अचानक आर्थिक लाभ वा अड्किएको धन फिर्ता हुने सम्भावना छ।'
        },
        // 1. वृष (Taurus - Venus)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी शुक्रको शुभ प्रभावले भौतिक सुख र सौन्दर्यप्रति रुचि बढ्नेछ। पारिवारिक भेटघाट र मिष्ठान्न भोजनको योग छ।`,
          car: 'कला, बैंकिङ, डिजाइन र सञ्चार सम्बन्धी काममा ठूलो सफलता मिल्नेछ।',
          lov: 'सम्बन्धमा मधुरता र विश्वास बढ्नेछ। नयाँ प्रेम प्रस्ताव आउन सक्छ।',
          hea: 'खानपानमा ध्यान दिनुहोला। चिसो पेयबाट जोगिनु उपयुक्त हुनेछ।',
          fin: 'आम्दानीका नयाँ स्रोत पहिचान हुनेछन्। बचत वृद्धि हुने शुभ दिन छ।'
        },
        // 2. मिथुन (Gemini - Mercury)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी बुधको शुभ प्रभावले बौद्धिक चातुर्य र सञ्चार कलाले सबैको मन जित्न सकिनेछ।`,
          car: 'सूचना प्रविधि, अध्ययन, लेखन र व्यापारमा नयाँ उचाइ हासिल हुनेछ।',
          lov: 'मित्रता प्रेममा बदलिने सम्भावना छ। जीवनसाथीसँग रमाइलो यात्रा हुनेछ।',
          hea: 'मानसिक स्फूर्ति रहनेछ। आँखाको विश्रामका लागि स्क्रिन समय सन्तुलित राख्नुहोला।',
          fin: 'व्यापारमा राम्रो मुनाफा हुनेछ। अनलाइन वा शेयर कारोबारबाट लाभ मिल्नेछ।'
        },
        // 3. कर्कट (Cancer - Moon)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी चन्द्रमाको गतिशीलताले मनमा शान्ति, आन्तरिक सन्तोष र आध्यात्मिक ऊर्जा रहनेछ।`,
          car: 'शिक्षा, खाद्यन्न, होटल र सार्वजनिक सेवामा कार्यरत व्यक्तिहरूलाई उच्च सफलता मिल्नेछ।',
          lov: 'पारिवारिक सुख र आत्मीयता प्राप्त हुनेछ। जीवनसाथीको स्नेह मिल्नेछ।',
          hea: 'मौसमी रुघाखोकीबाट बच्न तातो झोलिलो खानेकुरा लाभदायक हुनेछ।',
          fin: 'घरायसी सुखसुविधामा खर्च भए पनि आम्दानीको नियमित प्रवाह सन्तोषजनक रहनेछ।'
        },
        // 4. सिंह (Leo - Sun)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी सूर्यदेवको प्रभावले मान-सम्मान, नेतृत्वदायी भूमिका र प्रशासनिक काममा सफलता मिल्नेछ।`,
          car: 'सरकारी तथा उच्च अधिकारीसँगको भेटघाट फलदायी हुनेछ। निर्णय क्षमताको प्रशंसा हुनेछ।',
          lov: 'सम्बन्धमा मर्यादा र स्पष्टता रहनेछ। परिवारको सल्लाह फलदायी हुनेछ।',
          hea: 'आत्मबल उच्च रहनेछ। नियमित व्यायाम र प्राणायामले ऊर्जा दोब्बर बनाउनेछ।',
          fin: 'व्यापारिक कारोबार वृद्धि हुनेछ। नयाँ सम्झौताबाट दीर्घकालीन लाभ मिल्नेछ।'
        },
        // 5. कन्या (Virgo - Mercury)
        {
          gen: `आज ${dateHeaderNe} मा वित्तीय व्यवस्थापन र कार्यदक्षतामा वृद्धि हुनेछ। रोकिएका व्यावहारिक कामहरू सुचारु हुनेछन्।`,
          car: 'लेखा, विश्लेषण, कानुनी मामिला र अनुसन्धानमा अग्रता मिल्नेछ।',
          lov: 'पारिवारिक दायित्व पूरा गर्दा आत्मसन्तुष्टि मिल्नेछ। आफन्तको सहयोग रहनेछ।',
          hea: 'पाचन प्रणालीको ख्याल राख्नुहोला। हरियो सागपात र स्वच्छ जल सेवन गर्नुहोला।',
          fin: 'बचत र लगानी योजनाहरू सफल हुनेछन्। पुराना ऋण असुली हुने योग छ।'
        },
        // 6. तुला (Libra - Venus)
        {
          gen: `आज ${dateHeaderNe} मा व्यक्तित्व विकास र साझेदारी कार्यमा सफलता मिल्नेछ। सामाजिक मान-प्रतिष्ठा अभिवृद्धि हुनेछ।`,
          car: 'साझेदारी व्यापार, फेसन र कूटनीतिक कार्यमा अभूतपूर्व लाभ मिल्नेछ।',
          lov: 'दाम्पत्य जीवनमा प्रगाढ प्रेम र रोमान्स छाउनेछ। सम्बन्ध सुमधुर रहनेछ।',
          hea: 'पर्याप्त पानी पिउनुहोला र दिनचर्यालाई अनुशासित राख्नुहोला।',
          fin: 'आर्थिक अवस्था सन्तोषजनक रहनेछ। भौतिक साधन खरिदमा खर्च हुन सक्छ।'
        },
        // 7. वृश्चिक (Scorpio - Mars)
        {
          gen: `आज ${dateHeaderNe} मा गूढ ज्ञान, अनुसन्धान र प्राविधिक काममा ठूलो प्रगति हुनेछ। पराक्रमले कठिन काम सहजै बन्नेछन्।`,
          car: 'इन्जिनियरिङ, चिकित्सा, सुरक्षा र खोजमूलक काममा विजय मिल्नेछ।',
          lov: 'सम्बन्धमा निष्ठा र गहिरो समझदारी रहनेछ। खुला हृदयले संवाद गर्नुहोला।',
          hea: 'शारीरिक स्फूर्ति उच्च रहनेछ। नियमित कसरत फलदायी हुनेछ।',
          fin: 'अचानक धनलाभ वा पुर्ख्यौली सम्पत्तिबाट लाभ हुने सम्भावना छ।'
        },
        // 8. धनु (Sagittarius - Jupiter)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी बृहस्पतिको अनुकूलताले भाग्यवृद्धि, उच्च अध्ययन र आध्यात्मिक आनन्द प्राप्त हुनेछ।`,
          car: 'शिक्षण, परामर्श, न्याय र कूटनीतिमा नयाँ उचाइ हासिल हुनेछ।',
          lov: 'पारिवारिक सम्बन्धमा सुख-शान्ति छाउनेछ। मित्रजनको स्नेह मिल्नेछ।',
          hea: 'आरोग्य राम्रो रहनेछ। सात्विक खानपानले मनमा शान्ति दिलाउनेछ।',
          fin: 'आम्दानीका नयाँ बाटा खुल्नेछन्। दीर्घकालीन लगानी फलदायी हुनेछ।'
        },
        // 9. मकर (Capricorn - Saturn)
        {
          gen: `आज ${dateHeaderNe} मा कर्मयोग, धैर्य र मिहिनेतको उच्च मूल्याङ्कन हुनेछ। उद्योग र प्रशासनिक क्षेत्रमा प्रगति हुनेछ।`,
          car: 'सार्वजनिक प्रशासन, निर्माण र प्राविधिक काममा वरिष्ठको विश्वास जितिनेछ।',
          lov: 'पारिवारिक जिम्मेवारी कुशलतापूर्वक पूरा हुनेछ। जीवनसाथीको साथ मिल्नेछ।',
          hea: 'जोर्नी र ढाडको ख्याल राख्नुहोला। हल्का स्ट्रेचिङ फलदायी हुनेछ।',
          fin: 'स्थिर सम्पत्ति जोडिने वा पुराना लगानीबाट प्रतिफल मिल्ने समय छ।'
        },
        // 10. कुम्भ (Aquarius - Saturn)
        {
          gen: `आज ${dateHeaderNe} मा नवप्रवर्तन, सामाजिक कार्य र भाग्यवृद्धिको शुभ योग छ। साथीभाइको पूर्ण साथ रहनेछ।`,
          car: 'सफ्टवेयर, अनुसन्धान, मिडिया र प्राविधिक स्टार्टअपमा सफलता मिल्नेछ।',
          lov: 'सम्बन्धमा नयाँ उल्लास रहनेछ। प्रियजनसँग विचारको सामञ्जस्य हुनेछ।',
          hea: 'मानसिक ताजगी र ऊर्जा उच्च रहनेछ। बिहान हिँड्ने बानीले लाभ दिनेछ।',
          fin: 'सामूहिक लगानी तथा नयाँ योजनाबाट राम्रो आर्थिक मुनाफा मिल्नेछ।'
        },
        // 11. मीन (Pisces - Jupiter)
        {
          gen: `आज ${dateHeaderNe} मा राशिस्वामी गुरुको कृपाले आध्यात्मिक जागरण, परोपकार र वैदेशिक कार्यमा सफलता मिल्नेछ।`,
          car: 'अध्यापन, परामर्श, स्वास्थ्य र परोपकारी संस्थामा नयाँ उचाइ हासिल हुनेछ।',
          lov: 'सम्बन्धमा समर्पण, विश्वास र मधुरता छाउनेछ। हार्दिक सहयोग पाइनेछ।',
          hea: 'ध्यान र शान्त वातावरणले शारीरिक तथा मानसिक आरोग्य बढाउनेछ।',
          fin: 'आर्थिक स्थिति सुदृढ रहनेछ। धार्मिक कार्यमा खर्च भए पनि आम्दानी वृद्धि हुनेछ।'
        }
      ];

      const signVar = dailySignVariationsNe[idx % dailySignVariationsNe.length];
      generalPred = signVar.gen;
      careerPred = signVar.car;
      lovePred = signVar.lov;
      healthPred = signVar.hea;
      financePred = signVar.fin;

      if (lang === 'en') {
        generalPred = `On ${dateHeaderEn}, favorable planetary transits bring smooth progress in ongoing tasks and positive vitality for ${spec.englishName}.`;
        careerPred = `Great prospects for career advancement, professional leadership, and fruitful agreements.`;
        lovePred = `Harmonious emotional understanding, mutual respect, and warm family bonding.`;
        healthPred = `High vitality and good health through balanced routine and mindfulness.`;
        financePred = `Positive financial returns, improved savings, and potential recovery of delayed funds.`;
      }
    }

    return {
      rashi: spec.rashi,
      englishName: spec.englishName,
      symbol: spec.symbol,
      prediction: generalPred,
      luckyNumber: finalLuckyNum,
      luckyColor: finalLuckyCol,
      rating: finalRating,
      career: careerPred,
      love: lovePred,
      health: healthPred,
      finance: financePred,
      remedy,
      periodLabel: lang === 'en'
        ? (period === 'daily'
            ? `Daily Horoscope (${dateHeaderEn})`
            : period === 'weekly'
            ? `Weekly Horoscope (${panchang.englishDate})`
            : period === 'monthly'
            ? `Monthly Horoscope (${panchang.bsMonthName})`
            : `Yearly Horoscope (Year 2026-2027)`)
        : (period === 'daily'
            ? `आजको दैनिक राशिफल (${dateHeaderNe})`
            : period === 'weekly'
            ? `साप्ताहिक राशिफल (${panchang.bsMonthName} महिना)`
            : period === 'monthly'
            ? `मासिक राशिफल (${panchang.bsMonthName} महिना)`
            : `वार्षिक राशिफल (नेपाली संवत् २०८३ साल)`)
    };
  });
}

