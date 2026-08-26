import * as Astronomy from 'astronomy-engine';
import {
  KundaliInput,
  KundaliResult,
  DetailedPlanetPosition,
  HouseDetail,
  YogaDetail,
  DashaPeriod,
  YoginiPeriod,
  Language,
  PanchangaDetail,
  DivisionalChartData,
  GrahaBalaItem,
  CalculationAudit,
  AvakhadaInfo,
  HousePlanet
} from '../types';
import { convertADToBS, NEPALI_MONTHS_NE } from './nepaliCalendar';

// Helper for Devanagari numerals
export function toDevanagariDigits(num: number | string): string {
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => devDigits[parseInt(d, 10)]);
}

// Convert Ghati (decimal) to Ghati-Pala formatted string: घ. XX प. YY
export function formatToGhatiPala(ghatiVal: number): string {
  const safe = Math.max(0, ghatiVal);
  const g = Math.floor(safe);
  const p = Math.floor((safe - g) * 60);
  return `घ. ${toDevanagariDigits(String(g).padStart(2, '0'))} प. ${toDevanagariDigits(String(p).padStart(2, '0'))}`;
}

// 60 Samvatsara Jovian Cycle (षष्टि संवत्सर चक्र)
export const SAMVATSARA_60_NAMES: { index: number; ne: string; en: string }[] = [
  { index: 0, ne: 'प्रभव', en: 'Prabhava' },
  { index: 1, ne: 'विभव', en: 'Vibhava' },
  { index: 2, ne: 'शुक्ल', en: 'Shukla' },
  { index: 3, ne: 'प्रमोद', en: 'Pramoda' },
  { index: 4, ne: 'प्रजापति', en: 'Prajapati' },
  { index: 5, ne: 'अङ्गिरा', en: 'Angira' },
  { index: 6, ne: 'श्रीमुख', en: 'Shrimukha' },
  { index: 7, ne: 'भाव', en: 'Bhava' },
  { index: 8, ne: 'युवा', en: 'Yuva' },
  { index: 9, ne: 'धाता', en: 'Dhata' },
  { index: 10, ne: 'ईश्वर', en: 'Ishvara' },
  { index: 11, ne: 'बहुधान्य', en: 'Bahudhanya' },
  { index: 12, ne: 'प्रमाथी', en: 'Pramathi' },
  { index: 13, ne: 'विक्रम', en: 'Vikrama' },
  { index: 14, ne: 'वृषप्रजा', en: 'Vrishapraja' },
  { index: 15, ne: 'चित्रभानु', en: 'Chitrabhanu' },
  { index: 16, ne: 'सुभानु', en: 'Subhanu' },
  { index: 17, ne: 'तारण', en: 'Tarana' },
  { index: 18, ne: 'पार्थिव', en: 'Parthiva' },
  { index: 19, ne: 'व्यय', en: 'Vyaya' },
  { index: 20, ne: 'सर्वजित्', en: 'Sarvajit' },
  { index: 21, ne: 'सर्वधारी', en: 'Sarvadhari' },
  { index: 22, ne: 'विरोधी', en: 'Virodhi' },
  { index: 23, ne: 'विकृति', en: 'Vikriti' },
  { index: 24, ne: 'खर', en: 'Khara' },
  { index: 25, ne: 'नन्दन', en: 'Nandana' },
  { index: 26, ne: 'विजय', en: 'Vijaya' },
  { index: 27, ne: 'जय', en: 'Jaya' },
  { index: 28, ne: 'मन्मथ', en: 'Manmatha' },
  { index: 29, ne: 'दुर्मुख', en: 'Durmukha' },
  { index: 30, ne: 'हेमलम्ब', en: 'Hemalamba' },
  { index: 31, ne: 'विलम्ब', en: 'Vilamba' },
  { index: 32, ne: 'विकारी', en: 'Vikari' },
  { index: 33, ne: 'शर्वरी', en: 'Sharvari' },
  { index: 34, ne: 'प्लव', en: 'Plava' },
  { index: 35, ne: 'शुभकृत्', en: 'Shubhakrit' },
  { index: 36, ne: 'शोभकृत्', en: 'Shobhakrit' },
  { index: 37, ne: 'क्रोधी', en: 'Krodhi' },
  { index: 38, ne: 'विश्वावसु', en: 'Vishvavasu' },
  { index: 39, ne: 'पराभव', en: 'Parabhava' },
  { index: 40, ne: 'प्लवङ्ग', en: 'Plavanga' },
  { index: 41, ne: 'कीलक', en: 'Kilaka' },
  { index: 42, ne: 'सौम्य', en: 'Saumya' },
  { index: 43, ne: 'साधारण', en: 'Sadharana' },
  { index: 44, ne: 'विरोधकृत्', en: 'Virodhakrit' },
  { index: 45, ne: 'परिधावी', en: 'Paridhavi' },
  { index: 46, ne: 'प्रमादी', en: 'Pramadi' },
  { index: 47, ne: 'आनन्द', en: 'Ananda' },
  { index: 48, ne: 'राक्षस', en: 'Rakshasa' },
  { index: 49, ne: 'अनल', en: 'Anala' },
  { index: 50, ne: 'पिङ्गल', en: 'Pingala' },
  { index: 51, ne: 'कालयुक्त', en: 'Kalayukta' },
  { index: 52, ne: 'सिद्धार्थी', en: 'Siddharthi' },
  { index: 53, ne: 'रौद्र', en: 'Raudra' },
  { index: 54, ne: 'दुर्मति', en: 'Durmati' },
  { index: 55, ne: 'दुन्दुभी', en: 'Dundubhi' },
  { index: 56, ne: 'रुधिरोद्गारी', en: 'Rudhirodgari' },
  { index: 57, ne: 'रक्ताक्ष', en: 'Raktaksha' },
  { index: 58, ne: 'क्रोधन', en: 'Krodhana' },
  { index: 59, ne: 'क्षय', en: 'Kshaya' }
];

export function getSamvatsaraAtBirth(bsYear: number): { index: number; ne: string; en: string } {
  const index = ((bsYear + 9) % 60 + 60) % 60;
  return SAMVATSARA_60_NAMES[index] || SAMVATSARA_60_NAMES[0];
}

// ==========================================
// CONSTANTS & ASTROLOGICAL REFERENCE TABLES
// ==========================================

export const RASHI_NAMES = [
  { index: 0, ne: 'मेष', en: 'Aries', sa: 'मेष', lordNe: 'मंगल', lordEn: 'Mars', element: 'अग्नि (Fire)', symbol: '♈' },
  { index: 1, ne: 'वृष', en: 'Taurus', sa: 'वृषभ', lordNe: 'शुक्र', lordEn: 'Venus', element: 'पृथ्वी (Earth)', symbol: '♉' },
  { index: 2, ne: 'मिथुन', en: 'Gemini', sa: 'मिथुन', lordNe: 'बुध', lordEn: 'Mercury', element: 'वायु (Air)', symbol: '♊' },
  { index: 3, ne: 'कर्कट', en: 'Cancer', sa: 'कर्क', lordNe: 'चन्द्र', lordEn: 'Moon', element: 'जल (Water)', symbol: '♋' },
  { index: 4, ne: 'सिंह', en: 'Leo', sa: 'सिंह', lordNe: 'सूर्य', lordEn: 'Sun', element: 'अग्नि (Fire)', symbol: '♌' },
  { index: 5, ne: 'कन्या', en: 'Virgo', sa: 'कन्या', lordNe: 'बुध', lordEn: 'Mercury', element: 'पृथ्वी (Earth)', symbol: '♍' },
  { index: 6, ne: 'तुला', en: 'Libra', sa: 'तुला', lordNe: 'शुक्र', lordEn: 'Venus', element: 'वायु (Air)', symbol: '♎' },
  { index: 7, ne: 'वृश्चिक', en: 'Scorpio', sa: 'वृश्चिक', lordNe: 'मंगल', lordEn: 'Mars', element: 'जल (Water)', symbol: '♏' },
  { index: 8, ne: 'धनु', en: 'Sagittarius', sa: 'धनु', lordNe: 'गुरु', lordEn: 'Jupiter', element: 'अग्नि (Fire)', symbol: '♐' },
  { index: 9, ne: 'मकर', en: 'Capricorn', sa: 'मकर', lordNe: 'शनि', lordEn: 'Saturn', element: 'पृथ्वी (Earth)', symbol: '♑' },
  { index: 10, ne: 'कुम्भ', en: 'Aquarius', sa: 'कुम्भ', lordNe: 'शनि', lordEn: 'Saturn', element: 'वायु (Air)', symbol: '♒' },
  { index: 11, ne: 'मीन', en: 'Pisces', sa: 'मीन', lordNe: 'गुरु', lordEn: 'Jupiter', element: 'जल (Water)', symbol: '♓' }
];

export const NAKSHATRA_NAMES = [
  { index: 0, ne: 'अश्विनी', en: 'Ashwini', lordNe: 'केतु', lordEn: 'Ketu', dashaYears: 7, startDeg: 0 },
  { index: 1, ne: 'भरणी', en: 'Bharani', lordNe: 'शुक्र', lordEn: 'Venus', dashaYears: 20, startDeg: 13.333333 },
  { index: 2, ne: 'कृत्तिका', en: 'Krittika', lordNe: 'सूर्य', lordEn: 'Sun', dashaYears: 6, startDeg: 26.666667 },
  { index: 3, ne: 'रोहिणी', en: 'Rohini', lordNe: 'चन्द्र', lordEn: 'Moon', dashaYears: 10, startDeg: 40 },
  { index: 4, ne: 'मृगशिरा', en: 'Mrigashira', lordNe: 'मंगल', lordEn: 'Mars', dashaYears: 7, startDeg: 53.333333 },
  { index: 5, ne: 'आर्द्रा', en: 'Ardra', lordNe: 'राहु', lordEn: 'Rahu', dashaYears: 18, startDeg: 66.666667 },
  { index: 6, ne: 'पुनर्वसु', en: 'Punarvasu', lordNe: 'गुरु', lordEn: 'Jupiter', dashaYears: 16, startDeg: 80 },
  { index: 7, ne: 'पुष्य', en: 'Pushya', lordNe: 'शनि', lordEn: 'Saturn', dashaYears: 19, startDeg: 93.333333 },
  { index: 8, ne: 'आश्लेषा', en: 'Ashlesha', lordNe: 'बुध', lordEn: 'Mercury', dashaYears: 17, startDeg: 106.666667 },
  { index: 9, ne: 'मघा', en: 'Magha', lordNe: 'केतु', lordEn: 'Ketu', dashaYears: 7, startDeg: 120 },
  { index: 10, ne: 'पूर्वाफाल्गुनी', en: 'Purva Phalguni', lordNe: 'शुक्र', lordEn: 'Venus', dashaYears: 20, startDeg: 133.333333 },
  { index: 11, ne: 'उत्तराफाल्गुनी', en: 'Uttara Phalguni', lordNe: 'सूर्य', lordEn: 'Sun', dashaYears: 6, startDeg: 146.666667 },
  { index: 12, ne: 'हस्त', en: 'Hasta', lordNe: 'चन्द्र', lordEn: 'Moon', dashaYears: 10, startDeg: 160 },
  { index: 13, ne: 'चित्रा', en: 'Chitra', lordNe: 'मंगल', lordEn: 'Mars', dashaYears: 7, startDeg: 173.333333 },
  { index: 14, ne: 'स्वाती', en: 'Swati', lordNe: 'राहु', lordEn: 'Rahu', dashaYears: 18, startDeg: 186.666667 },
  { index: 15, ne: 'विशाखा', en: 'Vishakha', lordNe: 'गुरु', lordEn: 'Jupiter', dashaYears: 16, startDeg: 200 },
  { index: 16, ne: 'अनुराधा', en: 'Anuradha', lordNe: 'शनि', lordEn: 'Saturn', dashaYears: 19, startDeg: 213.333333 },
  { index: 17, ne: 'ज्येष्ठा', en: 'Jyeshtha', lordNe: 'बुध', lordEn: 'Mercury', dashaYears: 17, startDeg: 226.666667 },
  { index: 18, ne: 'मूल', en: 'Mula', lordNe: 'केतु', lordEn: 'Ketu', dashaYears: 7, startDeg: 240 },
  { index: 19, ne: 'पूर्वाषाढा', en: 'Purva Ashadha', lordNe: 'शुक्र', lordEn: 'Venus', dashaYears: 20, startDeg: 253.333333 },
  { index: 20, ne: 'उत्तराषाढा', en: 'Uttara Ashadha', lordNe: 'सूर्य', lordEn: 'Sun', dashaYears: 6, startDeg: 266.666667 },
  { index: 21, ne: 'श्रवण', en: 'Shravana', lordNe: 'चन्द्र', lordEn: 'Moon', dashaYears: 10, startDeg: 280 },
  { index: 22, ne: 'धनिष्ठा', en: 'Dhanishta', lordNe: 'मंगल', lordEn: 'Mars', dashaYears: 7, startDeg: 293.333333 },
  { index: 23, ne: 'शतभिषा', en: 'Shatabhisha', lordNe: 'राहु', lordEn: 'Rahu', dashaYears: 18, startDeg: 306.666667 },
  { index: 24, ne: 'पूर्वाभाद्रपदा', en: 'Purva Bhadrapada', lordNe: 'गुरु', lordEn: 'Jupiter', dashaYears: 16, startDeg: 320 },
  { index: 25, ne: 'उत्तराभाद्रपदा', en: 'Uttara Bhadrapada', lordNe: 'शनि', lordEn: 'Saturn', dashaYears: 19, startDeg: 333.333333 },
  { index: 26, ne: 'रेवती', en: 'Revati', lordNe: 'बुध', lordEn: 'Mercury', dashaYears: 17, startDeg: 346.666667 }
];

export const VIMSHOTTARI_ORDER = [
  { key: 'sun', nameNe: 'सूर्य', nameEn: 'Sun', years: 6 },
  { key: 'moon', nameNe: 'चन्द्र', nameEn: 'Moon', years: 10 },
  { key: 'mars', nameNe: 'मंगल', nameEn: 'Mars', years: 7 },
  { key: 'rahu', nameNe: 'राहु', nameEn: 'Rahu', years: 18 },
  { key: 'jupiter', nameNe: 'गुरु', nameEn: 'Jupiter', years: 16 },
  { key: 'saturn', nameNe: 'शनि', nameEn: 'Saturn', years: 19 },
  { key: 'mercury', nameNe: 'बुध', nameEn: 'Mercury', years: 17 },
  { key: 'ketu', nameNe: 'केतु', nameEn: 'Ketu', years: 7 },
  { key: 'venus', nameNe: 'शुक्र', nameEn: 'Venus', years: 20 }
];

export const TRIBHAGI_ORDER = [
  { key: 'sun', nameNe: 'सूर्य', nameEn: 'Sun', years: 4 },
  { key: 'moon', nameNe: 'चन्द्र', nameEn: 'Moon', years: 20 / 3 },
  { key: 'mars', nameNe: 'मंगल', nameEn: 'Mars', years: 14 / 3 },
  { key: 'rahu', nameNe: 'राहु', nameEn: 'Rahu', years: 12 },
  { key: 'jupiter', nameNe: 'गुरु', nameEn: 'Jupiter', years: 32 / 3 },
  { key: 'saturn', nameNe: 'शनि', nameEn: 'Saturn', years: 38 / 3 },
  { key: 'mercury', nameNe: 'बुध', nameEn: 'Mercury', years: 34 / 3 },
  { key: 'ketu', nameNe: 'केतु', nameEn: 'Ketu', years: 14 / 3 },
  { key: 'venus', nameNe: 'शुक्र', nameEn: 'Venus', years: 40 / 3 }
];

export const YOGINI_ORDER = [
  { index: 1, nameNe: 'मङ्गला', nameEn: 'Mangala', rulerNe: 'चन्द्र', rulerEn: 'Moon', years: 1 },
  { index: 2, nameNe: 'पिङ्गला', nameEn: 'Pingala', rulerNe: 'सूर्य', rulerEn: 'Sun', years: 2 },
  { index: 3, nameNe: 'धान्या', nameEn: 'Dhanya', rulerNe: 'गुरु', rulerEn: 'Jupiter', years: 3 },
  { index: 4, nameNe: 'भ्रामरी', nameEn: 'Bhramari', rulerNe: 'मंगल', rulerEn: 'Mars', years: 4 },
  { index: 5, nameNe: 'भद्रिका', nameEn: 'Bhadrika', rulerNe: 'बुध', rulerEn: 'Mercury', years: 5 },
  { index: 6, nameNe: 'उल्का', nameEn: 'Ulka', rulerNe: 'शनि', rulerEn: 'Saturn', years: 6 },
  { index: 7, nameNe: 'सिद्धा', nameEn: 'Siddha', rulerNe: 'शुक्र', rulerEn: 'Venus', years: 7 },
  { index: 8, nameNe: 'सङ्कटा', nameEn: 'Sankata', rulerNe: 'राहु', rulerEn: 'Rahu', years: 8 }
];

// Exaltation and Debilitation Signs (0-indexed: 0=Aries, 1=Taurus, ... 11=Pisces)
export const GRAHA_EXALT_DEBIL = {
  sun: { exalt: 0, exaltDeg: 10, debil: 6, own: [4] },
  moon: { exalt: 1, exaltDeg: 3, debil: 7, own: [3] },
  mars: { exalt: 9, exaltDeg: 28, debil: 3, own: [0, 7] },
  mercury: { exalt: 5, exaltDeg: 15, debil: 11, own: [2, 5] },
  jupiter: { exalt: 3, exaltDeg: 5, debil: 9, own: [8, 11] },
  venus: { exalt: 11, exaltDeg: 27, debil: 5, own: [1, 6] },
  saturn: { exalt: 6, exaltDeg: 20, debil: 0, own: [9, 10] },
  rahu: { exalt: 1, exaltDeg: 15, debil: 7, own: [10] },
  ketu: { exalt: 7, exaltDeg: 15, debil: 1, own: [8] }
};

// ==========================================
// CORE ASTRONOMICAL MATHEMATICAL ENGINE
// ==========================================

/**
 * Normalizes any angle in degrees into [0, 360)
 */
export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Converts decimal degree to string representation "DD° MM' SS""
 */
export function formatDegreeStr(deg: number): string {
  const norm = normalizeDeg(deg);
  const d = Math.floor(norm);
  const minFloat = (norm - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

/**
 * Calculates exact Nakshatra Index (0 to 26) and Pada (1 to 4) from sidereal longitude in degrees (0 to 360).
 * Uses arcminutes with micro-epsilon precision to prevent floating-point modulo/boundary errors.
 */
export function getNakshatraAndPada(siderealDeg: number): { nakIdx: number; pad: number } {
  const normDeg = normalizeDeg(siderealDeg);
  const totalMinutes = normDeg * 60;
  // 108 padas in total, each pada spans 200 arcminutes (3°20').
  // Adding 1e-8 arcminutes handles floating point representation limits at exact boundary degrees.
  const totalPadaIndex = Math.floor((totalMinutes + 1e-8) / 200) % 108;
  const nakIdx = Math.floor(totalPadaIndex / 4);
  const pad = (totalPadaIndex % 4) + 1;
  return { nakIdx, pad };
}

/**
 * Calculates Julian Day Number for a UTC Date
 */
export function calculateJulianDay(utcDate: Date): number {
  return Astronomy.MakeTime(utcDate).ut + 2451545.0;
}

/**
 * Calculates N.C. Lahiri (Chitrapaksha) Ayanamsa for a given Julian Day
 * Standard IAU / Ephemeris formula:
 * J2000.0 (JD 2451545.0) Ayanamsa = 23° 51' 25.53" = 23.85709167°
 * Rate = 50.290966" / yr = 1.3969713° / century
 */
export function calculateLahiriAyanamsa(julianDay: number): number {
  const T = (julianDay - 2451545.0) / 36525.0;
  return 23.85709167 + 1.3969713 * T + 0.0003086 * T * T;
}

/**
 * Computes exact Sidereal Ascendant (Lagna) degree
 * RAMC = LST = GAST + Longitude
 * Ascendant = atan2(cos(LST), -sin(LST)*cos(eps) - tan(lat)*sin(eps))
 */
export function calculateAscendant(utcDate: Date, lat: number, lon: number, ayanamsaDeg: number): number {
  const astroTime = Astronomy.MakeTime(utcDate);
  const gastHours = Astronomy.SiderealTime(astroTime); // GAST in hours
  const gastDeg = gastHours * 15;
  const lstDeg = normalizeDeg(gastDeg + lon); // Local Sidereal Time in degrees

  const T = astroTime.ut / 36525.0;
  const epsDeg = 23.43929111 - 0.01300416667 * T - 0.0000001639 * T * T; // Obliquity of ecliptic in degrees

  const rad = Math.PI / 180;
  const lstRad = lstDeg * rad;
  const latRad = lat * rad;
  const epsRad = epsDeg * rad;

  // Ascendant formula in tropical coordinates
  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let ascTropRad = Math.atan2(y, x);
  let ascTropDeg = ascTropRad * (180 / Math.PI);
  ascTropDeg = normalizeDeg(ascTropDeg);

  // Sidereal Ascendant (Nirayana Lagna)
  return normalizeDeg(ascTropDeg - ayanamsaDeg);
}

/**
 * Calculates Rahu and Ketu longitudes based on Node Type ('true' or 'mean')
 * Mean Node: Standard IAU polynomial
 * True Node: Mean Node + Meeus Astronomical Perturbations for Lunar Ascending Node
 */
export function calculateRahuKetuNodes(
  utcDate: Date,
  ayanamsaDeg: number,
  nodeType: 'true' | 'mean' = 'true'
): { rahuSid: number; ketuSid: number; rahuTrop: number } {
  const astroTime = Astronomy.MakeTime(utcDate);
  const T = astroTime.ut / 36525.0;

  // Mean Node formula (IAU / Meeus)
  let meanOmega = 125.0445222 - 1934.1362619 * T + 0.0020708 * T * T + 0.0000022 * T * T * T;
  meanOmega = normalizeDeg(meanOmega);

  let rahuTrop = meanOmega;

  if (nodeType === 'true') {
    // Fundamental arguments in degrees (Meeus Astronomical Algorithms Ch. 47)
    const rad = Math.PI / 180;
    const D = (297.8501921 + 445267.1114034 * T) * rad; // Mean elongation of Moon
    const M = (357.5291092 + 35999.0502909 * T) * rad;  // Sun's mean anomaly
    const Mp = (134.9633964 + 477198.8675055 * T) * rad; // Moon's mean anomaly
    const F = (93.2720950 + 483202.0175233 * T) * rad;   // Moon's argument of latitude

    // True Node perturbation periodic terms
    const dOmega =
      -1.4979 * Math.sin(2 * (D - F)) -
      0.1500 * Math.sin(2 * D) -
      0.1226 * Math.sin(2 * D + F) +
      0.0801 * Math.sin(2 * F) -
      0.0353 * Math.sin(2 * D - F) -
      0.0326 * Math.sin(2 * Mp);

    rahuTrop = normalizeDeg(meanOmega + dOmega);
  }

  const rahuSid = normalizeDeg(rahuTrop - ayanamsaDeg);
  const ketuSid = normalizeDeg(rahuSid + 180);

  return { rahuSid, ketuSid, rahuTrop };
}

/**
 * Computes exact planetary positions using VSOP87/JPL Ephemeris via astronomy-engine
 */
export function calculatePlanetaryPositions(
  utcDate: Date,
  ayanamsaDeg: number,
  lagnaDeg: number,
  nodeType: 'true' | 'mean' = 'true'
): DetailedPlanetPosition[] {
  let astroTime: any;
  try {
    astroTime = Astronomy.MakeTime(utcDate);
  } catch (e) {
    throw new Error('Accurate astronomical calculation unavailable: Invalid date time value.');
  }

  const deltaDays = 0.01; // for velocity check
  const timeMinus = astroTime.AddDays(-deltaDays);
  const timePlus = astroTime.AddDays(deltaDays);

  const bodies = [
    { id: 'sun', astroBody: Astronomy.Body.Sun, nameNe: 'सूर्य', nameEn: 'Sun', nameSa: 'सूर्य' },
    { id: 'moon', astroBody: Astronomy.Body.Moon, nameNe: 'चन्द्र', nameEn: 'Moon', nameSa: 'चन्द्र' },
    { id: 'mars', astroBody: Astronomy.Body.Mars, nameNe: 'मंगल', nameEn: 'Mars', nameSa: 'भौम' },
    { id: 'mercury', astroBody: Astronomy.Body.Mercury, nameNe: 'बुध', nameEn: 'Mercury', nameSa: 'बुध' },
    { id: 'jupiter', astroBody: Astronomy.Body.Jupiter, nameNe: 'गुरु', nameEn: 'Jupiter', nameSa: 'बृहस्पति' },
    { id: 'venus', astroBody: Astronomy.Body.Venus, nameNe: 'शुक्र', nameEn: 'Venus', nameSa: 'शुक्र' },
    { id: 'saturn', astroBody: Astronomy.Body.Saturn, nameNe: 'शनि', nameEn: 'Saturn', nameSa: 'शनि' }
  ];

  const results: DetailedPlanetPosition[] = [];

  // Lagna entry
  const lagnaRashiIdx = Math.floor(lagnaDeg / 30);
  const lagnaRashi = RASHI_NAMES[lagnaRashiIdx];
  const { nakIdx: lagnaNakIdx, pad: lagnaPad } = getNakshatraAndPada(lagnaDeg);
  const lagnaNak = NAKSHATRA_NAMES[lagnaNakIdx];
  const lagnaTrop = normalizeDeg(lagnaDeg + ayanamsaDeg);

  results.push({
    id: 'lagna',
    nameNe: 'लग्न (Ascendant)',
    nameEn: 'Lagna',
    nameSa: 'लग्न',
    degree: lagnaDeg,
    degreeInSign: lagnaDeg % 30,
    degreeStr: formatDegreeStr(lagnaDeg % 30),
    tropLongitude: lagnaTrop,
    siderealLongitude: lagnaDeg,
    rashiIndex: lagnaRashiIdx,
    rashiNe: lagnaRashi.ne,
    rashiEn: lagnaRashi.en,
    rashiLordNe: lagnaRashi.lordNe,
    rashiLordEn: lagnaRashi.lordEn,
    nakshatraIndex: lagnaNakIdx,
    nakshatraNe: lagnaNak.ne,
    nakshatraEn: lagnaNak.en,
    nakshatraLordNe: lagnaNak.lordNe,
    nakshatraLordEn: lagnaNak.lordEn,
    pad: lagnaPad,
    isRetrograde: false,
    houseNum: 1,
    awastha: 'युवा',
    dignity: 'स्वगृही',
    dignityEn: 'Own Sign',
    speed: 360.0 // Full rotation per day
  });

  // Calculate 7 Major Planets
  for (const b of bodies) {
    let tropLon = 0;
    let tropLonMinus = 0;
    let tropLonPlus = 0;

    if (b.id === 'sun') {
      tropLon = Astronomy.SunPosition(astroTime).elon;
      tropLonMinus = Astronomy.SunPosition(timeMinus).elon;
      tropLonPlus = Astronomy.SunPosition(timePlus).elon;
    } else if (b.id === 'moon') {
      tropLon = Astronomy.EclipticGeoMoon(astroTime).lon;
      tropLonMinus = Astronomy.EclipticGeoMoon(timeMinus).lon;
      tropLonPlus = Astronomy.EclipticGeoMoon(timePlus).lon;
    } else {
      const vec = Astronomy.GeoVector(b.astroBody, astroTime, true);
      const ecl = Astronomy.Ecliptic(vec);
      tropLon = ecl.elon;

      const vecMinus = Astronomy.GeoVector(b.astroBody, timeMinus, true);
      tropLonMinus = Astronomy.Ecliptic(vecMinus).elon;

      const vecPlus = Astronomy.GeoVector(b.astroBody, timePlus, true);
      tropLonPlus = Astronomy.Ecliptic(vecPlus).elon;
    }

    const sidLon = normalizeDeg(tropLon - ayanamsaDeg);

    // Speed calculation in degrees per day
    let diff = tropLonPlus - tropLonMinus;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    const speedDegPerDay = diff / (deltaDays * 2);
    const isRetrograde = (b.id !== 'sun' && b.id !== 'moon') && speedDegPerDay < 0;

    const rashiIdx = Math.floor(sidLon / 30);
    const rashi = RASHI_NAMES[rashiIdx];
    const { nakIdx, pad } = getNakshatraAndPada(sidLon);
    const nak = NAKSHATRA_NAMES[nakIdx];

    // House calculation in Whole Sign System from Lagna Sign
    const houseNum = ((rashiIdx - lagnaRashiIdx + 12) % 12) + 1;

    const degInSign = siderealDegInSign(sidLon);
    const awastha = getBaladiAwastha(degInSign, rashiIdx);
    const dignityInfo = getDignity(b.id, rashiIdx, degInSign);

    results.push({
      id: b.id,
      nameNe: b.nameNe,
      nameEn: b.nameEn,
      nameSa: b.nameSa,
      degree: sidLon,
      degreeInSign: degInSign,
      degreeStr: formatDegreeStr(degInSign),
      tropLongitude: tropLon,
      siderealLongitude: sidLon,
      rashiIndex: rashiIdx,
      rashiNe: rashi.ne,
      rashiEn: rashi.en,
      rashiLordNe: rashi.lordNe,
      rashiLordEn: rashi.lordEn,
      nakshatraIndex: nakIdx,
      nakshatraNe: nak.ne,
      nakshatraEn: nak.en,
      nakshatraLordNe: nak.lordNe,
      nakshatraLordEn: nak.lordEn,
      pad,
      isRetrograde,
      houseNum,
      awastha,
      dignity: dignityInfo.ne,
      dignityEn: dignityInfo.en,
      speed: Math.abs(speedDegPerDay)
    });
  }

  // Calculate Rahu and Ketu
  const { rahuSid, ketuSid, rahuTrop } = calculateRahuKetuNodes(utcDate, ayanamsaDeg, nodeType);

  // Rahu
  const rahuRashiIdx = Math.floor(rahuSid / 30);
  const rahuRashi = RASHI_NAMES[rahuRashiIdx];
  const { nakIdx: rahuNakIdx, pad: rahuPad } = getNakshatraAndPada(rahuSid);
  const rahuNak = NAKSHATRA_NAMES[rahuNakIdx];
  const rahuHouse = ((rahuRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const rahuDegInSign = siderealDegInSign(rahuSid);

  results.push({
    id: 'rahu',
    nameNe: 'राहु',
    nameEn: 'Rahu',
    nameSa: 'राहु',
    degree: rahuSid,
    degreeInSign: rahuDegInSign,
    degreeStr: formatDegreeStr(rahuDegInSign),
    tropLongitude: rahuTrop,
    siderealLongitude: rahuSid,
    rashiIndex: rahuRashiIdx,
    rashiNe: rahuRashi.ne,
    rashiEn: rahuRashi.en,
    rashiLordNe: rahuRashi.lordNe,
    rashiLordEn: rahuRashi.lordEn,
    nakshatraIndex: rahuNakIdx,
    nakshatraNe: rahuNak.ne,
    nakshatraEn: rahuNak.en,
    nakshatraLordNe: rahuNak.lordNe,
    nakshatraLordEn: rahuNak.lordEn,
    pad: rahuPad,
    isRetrograde: true,
    houseNum: rahuHouse,
    awastha: getBaladiAwastha(rahuDegInSign, rahuRashiIdx),
    dignity: getDignity('rahu', rahuRashiIdx, rahuDegInSign).ne,
    dignityEn: getDignity('rahu', rahuRashiIdx, rahuDegInSign).en,
    speed: 0.0529
  });

  // Ketu
  const ketuRashiIdx = Math.floor(ketuSid / 30);
  const ketuRashi = RASHI_NAMES[ketuRashiIdx];
  const { nakIdx: ketuNakIdx, pad: ketuPad } = getNakshatraAndPada(ketuSid);
  const ketuNak = NAKSHATRA_NAMES[ketuNakIdx];
  const ketuHouse = ((ketuRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const ketuDegInSign = siderealDegInSign(ketuSid);
  const ketuTrop = normalizeDeg(rahuTrop + 180);

  results.push({
    id: 'ketu',
    nameNe: 'केतु',
    nameEn: 'Ketu',
    nameSa: 'केतु',
    degree: ketuSid,
    degreeInSign: ketuDegInSign,
    degreeStr: formatDegreeStr(ketuDegInSign),
    tropLongitude: ketuTrop,
    siderealLongitude: ketuSid,
    rashiIndex: ketuRashiIdx,
    rashiNe: ketuRashi.ne,
    rashiEn: ketuRashi.en,
    rashiLordNe: ketuRashi.lordNe,
    rashiLordEn: ketuRashi.lordEn,
    nakshatraIndex: ketuNakIdx,
    nakshatraNe: ketuNak.ne,
    nakshatraEn: ketuNak.en,
    nakshatraLordNe: ketuNak.lordNe,
    nakshatraLordEn: ketuNak.lordEn,
    pad: ketuPad,
    isRetrograde: true,
    houseNum: ketuHouse,
    awastha: getBaladiAwastha(ketuDegInSign, ketuRashiIdx),
    dignity: getDignity('ketu', ketuRashiIdx, ketuDegInSign).ne,
    dignityEn: getDignity('ketu', ketuRashiIdx, ketuDegInSign).en,
    speed: 0.0529
  });

  // Calculate Combustion (उदय / अस्त) and Motion State (मार्गी / बक्री)
  const sunObj = results.find((p) => p.id === 'sun');
  const sunDeg = sunObj ? sunObj.degree : 0;

  for (const p of results) {
    const isLagna = p.id === 'lagna';
    const isSun = p.id === 'sun';
    const isRahuKetu = p.id === 'rahu' || p.id === 'ketu';

    // Motion State: मार्गी vs बक्री (Direct vs Retrograde)
    p.motionStateNe = p.isRetrograde && !isLagna ? 'बक्री' : 'मार्गी';
    p.motionStateEn = p.isRetrograde && !isLagna ? 'Retrograde' : 'Direct';

    // Angular separation from Sun
    let diffFromSun = Math.abs(normalizeDeg(p.degree) - normalizeDeg(sunDeg));
    if (diffFromSun > 180) diffFromSun = 360 - diffFromSun;
    p.sunSeparationDeg = Math.round(diffFromSun * 100) / 100;

    // Combustion (उदय vs अस्त) calculation based on classical Vedic Astrology
    if (isLagna || isSun || isRahuKetu) {
      p.isCombust = false;
      p.visibilityStateNe = 'उदय';
      p.visibilityStateEn = 'Risen';
    } else {
      let combustionLimit = 0;
      switch (p.id) {
        case 'moon':
          combustionLimit = 12; // 12° from Sun (Dark Moon/Amavasya)
          break;
        case 'mars':
          combustionLimit = 17; // 17°
          break;
        case 'mercury':
          combustionLimit = p.isRetrograde ? 12 : 14; // 14° (Direct), 12° (Retrograde)
          break;
        case 'jupiter':
          combustionLimit = 11; // 11°
          break;
        case 'venus':
          combustionLimit = p.isRetrograde ? 8 : 10; // 10° (Direct), 8° (Retrograde)
          break;
        case 'saturn':
          combustionLimit = 15; // 15°
          break;
        default:
          combustionLimit = 0;
      }

      const isCombust = combustionLimit > 0 && diffFromSun <= combustionLimit;
      p.isCombust = isCombust;
      p.visibilityStateNe = isCombust ? 'अस्त' : 'उदय';
      p.visibilityStateEn = isCombust ? 'Combust' : 'Risen';
    }
  }

  return results;
}

function siderealDegInSign(deg: number): number {
  return normalizeDeg(deg) % 30;
}

function getBaladiAwastha(degInSign: number, rashiIdx: number): 'बाल' | 'कुमार' | 'युवा' | 'वृद्ध' | 'मृत' {
  const isOdd = rashiIdx % 2 === 0; // Odd signs: Aries, Gemini, Leo, etc.
  if (isOdd) {
    if (degInSign < 6) return 'बाल';
    if (degInSign < 12) return 'कुमार';
    if (degInSign < 18) return 'युवा';
    if (degInSign < 24) return 'वृद्ध';
    return 'मृत';
  } else {
    if (degInSign < 6) return 'मृत';
    if (degInSign < 12) return 'वृद्ध';
    if (degInSign < 18) return 'युवा';
    if (degInSign < 24) return 'कुमार';
    return 'बाल';
  }
}

function getDignity(
  planetKey: string,
  rashiIdx: number,
  _degInSign: number
): { ne: 'उच्च' | 'नीच' | 'स्वगृही' | 'मूलत्रिकोण' | 'मित्र' | 'सम' | 'शत्रु'; en: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Moolatrikona' | 'Friendly' | 'Neutral' | 'Enemy' } {
  const conf = GRAHA_EXALT_DEBIL[planetKey as keyof typeof GRAHA_EXALT_DEBIL];
  if (!conf) return { ne: 'सम', en: 'Neutral' };

  if (rashiIdx === conf.exalt) return { ne: 'उच्च', en: 'Exalted' };
  if (rashiIdx === conf.debil) return { ne: 'नीच', en: 'Debilitated' };
  if (conf.own.includes(rashiIdx)) return { ne: 'स्वगृही', en: 'Own Sign' };

  return { ne: 'मित्र', en: 'Friendly' };
}

// ==========================================
// HOUSE DETAILS & ASPECTS
// ==========================================

export function calculateHouseDetails(planets: DetailedPlanetPosition[]): HouseDetail[] {
  const lagna = planets.find((p) => p.id === 'lagna') || planets[0];
  const lagnaRashiIdx = lagna.rashiIndex;

  const houseSignificanceNe = [
    'तनु भाव: शरीर, व्यक्तित्व, स्वास्थ्य, चरित्र, आत्मबल',
    'धन भाव: धन-सम्पत्ति, वाणी, परिवार, प्रारम्भिक शिक्षा',
    'सहज भाव: भाइ-बहिनी, पराक्रम, छोटो यात्रा, सञ्चार',
    'सुख भाव: माता, गृह, भूमि, वाहन, मानसिक शान्ति',
    'पुत्र भाव: सन्तान, बुद्धि, विद्या, पूर्वपुण्य, मन्त्र',
    'रिपु भाव: शत्रु, रोग, ऋण, प्रतिस्पर्धा, मामाघर',
    'कलत्र भाव: विवाह, जीवनसाथी, व्यापारिक साझेदारी',
    'आयु भाव: आयु, सङ्कट, अचानक लाभ, गुप्तज्ञान',
    'धर्म भाव: भाग्य, धर्म, उच्च शिक्षा, पिता, दूरयात्रा',
    'कर्म भाव: कर्म, पेशा, प्रतिष्ठा, राज्य, पिताको सुख',
    'आय भाव: लाभ, आयस्रोत, ठूला दाजुभाइ, मनोकांक्षा',
    'व्यय भाव: खर्च, हानि, मोक्ष, विदेश यात्रा, अस्पताल'
  ];

  const houseSignificanceEn = [
    '1st House: Self, Vitality, Health, Physical Personality',
    '2nd House: Wealth, Family, Speech, Assets',
    '3rd House: Courage, Siblings, Short Trips, Skills',
    '4th House: Mother, Home, Vehicles, Property, Peace',
    '5th House: Education, Intellect, Children, Speculation',
    '6th House: Enemies, Health Debts, Competition, Service',
    '7th House: Marriage, Spouse, Business Partnerships',
    '8th House: Longevity, Transformation, Hidden Knowledge',
    '9th House: Fortune, Higher Learning, Ethics, Father',
    '10th House: Career, Profession, Status, Reputation',
    '11th House: Gains, Income, Networks, Fulfillment',
    '12th House: Expenditure, Losses, Moksha, Foreign Lands'
  ];

  const houses: HouseDetail[] = [];

  for (let h = 1; h <= 12; h++) {
    const signIdx = (lagnaRashiIdx + h - 1) % 12;
    const rashi = RASHI_NAMES[signIdx];

    const occupyingPlanets = planets.filter((p) => p.houseNum === h && p.id !== 'lagna');

    // Calculate Graha Drishti (Aspects)
    const aspectingPlanets: DetailedPlanetPosition[] = [];
    for (const p of planets) {
      if (p.id === 'lagna') continue;
      const pHouse = p.houseNum;
      if (pHouse === h) continue;

      let aspect = false;
      const dist = ((h - pHouse + 12) % 12) || 12;

      // 7th House Aspect for all planets
      if (dist === 7) aspect = true;
      // Mars: 4th and 8th aspect
      if (p.id === 'mars' && (dist === 4 || dist === 8)) aspect = true;
      // Jupiter: 5th and 9th aspect
      if (p.id === 'jupiter' && (dist === 5 || dist === 9)) aspect = true;
      // Saturn: 3rd and 10th aspect
      if (p.id === 'saturn' && (dist === 3 || dist === 10)) aspect = true;

      if (aspect) aspectingPlanets.push(p);
    }

    houses.push({
      houseNum: h,
      signIndex: signIdx,
      signNe: rashi.ne,
      signEn: rashi.en,
      signLordNe: rashi.lordNe,
      signLordEn: rashi.lordEn,
      planets: occupyingPlanets,
      aspectingPlanets,
      significanceNe: houseSignificanceNe[h - 1],
      significanceEn: houseSignificanceEn[h - 1]
    });
  }

  return houses;
}

export interface VedicYMD {
  years: number;
  months: number;
  days: number;
}

export interface VedicYM {
  years: number;
  months: number;
}

export function convertYearsToVedicYM(yearsFloat: number): VedicYM {
  if (yearsFloat <= 0) return { years: 0, months: 0 };
  const totalMonths = Math.round(yearsFloat * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months };
}

export function convertYearsToVedicYMD(yearsFloat: number): VedicYMD {
  if (yearsFloat <= 0) return { years: 0, months: 0, days: 0 };
  const ym = convertYearsToVedicYM(yearsFloat);
  return { years: ym.years, months: ym.months, days: 0 };
}

export function formatVedicYM(ym: VedicYM, lang: Language = 'ne'): string {
  const toDev = (n: number) => {
    const dev = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(n).replace(/\d/g, (d) => dev[parseInt(d, 10)]);
  };

  if (lang === 'ne') {
    if (ym.months === 0) {
      return `${toDev(ym.years)} वर्ष ० महिना`;
    }
    return `${toDev(ym.years)} वर्ष ${toDev(ym.months)} महिना`;
  } else {
    return `${ym.years}y ${ym.months}m`;
  }
}

export function formatVedicYMD(ymd: VedicYMD | VedicYM, lang: Language = 'ne'): string {
  return formatVedicYM({ years: ymd.years, months: ymd.months }, lang);
}

export function addFractionalYears(startDate: Date, durationYears: number): Date {
  const ms = Math.round(durationYears * 365.2425 * 24 * 3600 * 1000);
  return new Date(startDate.getTime() + ms);
}
// ==========================================
// VIMSHOTTARI DASHA HIERARCHY (120 Years)
// ==========================================

export function calculateVimshottariDasha(
  arg1: Date | number,
  arg2?: number | Date,
  arg3?: number
): DashaPeriod[] {
  let birthDate: Date;
  let startIdx: number;
  let balanceYrs: number;

  if (arg1 instanceof Date) {
    birthDate = arg1;
    startIdx = typeof arg2 === 'number' ? arg2 : 0;
    balanceYrs = typeof arg3 === 'number' ? arg3 : VIMSHOTTARI_ORDER[startIdx].years;
  } else {
    const moonDegree = typeof arg1 === 'number' ? arg1 : 0;
    birthDate = arg2 instanceof Date ? arg2 : new Date();
    const normMoon = normalizeDeg(moonDegree);
    const nakIdx = Math.floor(normMoon / (360 / 27));
    const lordKey = NAKSHATRA_NAMES[nakIdx].lordEn.toLowerCase();
    startIdx = VIMSHOTTARI_ORDER.findIndex((p) => p.key === lordKey);
    if (startIdx === -1) startIdx = 0;

    const nakDegSpan = 360 / 27;
    const degInNak = normMoon % nakDegSpan;
    const elapsedFraction = degInNak / nakDegSpan;
    const fullYrs = VIMSHOTTARI_ORDER[startIdx].years;
    balanceYrs = fullYrs * (1 - elapsedFraction);
  }

  const now = new Date();
  const list: DashaPeriod[] = [];
  let currentDate = new Date(birthDate.getTime());
  let cumulativeYears = 0;
  const targetTotalYears = 120.0;
  let i = 0;

  while (cumulativeYears < targetTotalYears - 0.0001 && i < 30) {
    const idx = (startIdx + i) % 9;
    const lordObj = VIMSHOTTARI_ORDER[idx];
    const isBalance = i === 0 && balanceYrs < lordObj.years;
    let duration = isBalance ? balanceYrs : lordObj.years;

    if (cumulativeYears + duration > targetTotalYears) {
      duration = targetTotalYears - cumulativeYears;
    }

    const endDate = addFractionalYears(currentDate, duration);
    const isActive = now >= currentDate && now <= endDate;

    // Generate 9 Antardashas
    const antardashas: DashaPeriod[] = [];
    let antarCurrentDate = new Date(currentDate.getTime());

    for (let j = 0; j < 9; j++) {
      const antarIdx = (idx + j) % 9;
      const antarLord = VIMSHOTTARI_ORDER[antarIdx];
      const antarDuration = (duration * antarLord.years) / 120;
      const antarEndDate = addFractionalYears(antarCurrentDate, antarDuration);
      const antarActive = now >= antarCurrentDate && now <= antarEndDate;

      antardashas.push({
        id: `vim-antar-${lordObj.key}-${antarLord.key}-${i}-${j}`,
        planetKey: antarLord.key,
        planetNe: antarLord.nameNe,
        planetEn: antarLord.nameEn,
        startDate: antarCurrentDate.toISOString().split('T')[0],
        endDate: antarEndDate.toISOString().split('T')[0],
        durationYears: antarDuration,
        fullYears: (lordObj.years * antarLord.years) / 120,
        isBalancePeriod: isBalance,
        isActive: antarActive,
        rulerNe: antarLord.nameNe,
        rulerEn: antarLord.nameEn
      });

      antarCurrentDate = antarEndDate;
    }

    list.push({
      id: `vim-${lordObj.key}-${i}`,
      planetKey: lordObj.key,
      planetNe: lordObj.nameNe,
      planetEn: lordObj.nameEn,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationYears: duration,
      fullYears: lordObj.years,
      isBalancePeriod: isBalance,
      isActive,
      antardashas,
      rulerNe: lordObj.nameNe,
      rulerEn: lordObj.nameEn
    });

    currentDate = endDate;
    cumulativeYears += duration;
    i++;
  }

  return list;
}

// ==========================================
// TRIBHAGI DASHA HIERARCHY (80 Years)
// ==========================================

export function calculateTribhagiDasha(
  arg1: Date | number,
  arg2?: number | Date,
  arg3?: number
): DashaPeriod[] {
  let birthDate: Date;
  let startIdx: number;
  let balanceYrs: number;

  if (arg1 instanceof Date) {
    birthDate = arg1;
    startIdx = typeof arg2 === 'number' ? arg2 : 0;
    balanceYrs = typeof arg3 === 'number' ? arg3 : TRIBHAGI_ORDER[startIdx].years;
  } else {
    const moonDegree = typeof arg1 === 'number' ? arg1 : 0;
    birthDate = arg2 instanceof Date ? arg2 : new Date();
    const normMoon = normalizeDeg(moonDegree);
    const nakIdx = Math.floor(normMoon / (360 / 27));
    const lordKey = NAKSHATRA_NAMES[nakIdx].lordEn.toLowerCase();
    startIdx = TRIBHAGI_ORDER.findIndex((p) => p.key === lordKey);
    if (startIdx === -1) startIdx = 0;

    const nakDegSpan = 360 / 27;
    const degInNak = normMoon % nakDegSpan;
    const elapsedFraction = degInNak / nakDegSpan;
    const fullYrs = TRIBHAGI_ORDER[startIdx].years;
    balanceYrs = fullYrs * (1 - elapsedFraction);
  }

  const now = new Date();
  const list: DashaPeriod[] = [];
  let currentDate = new Date(birthDate.getTime());
  let cumulativeYears = 0;
  const targetTotalYears = 80.0;
  let i = 0;

  while (cumulativeYears < targetTotalYears - 0.0001 && i < 30) {
    const idx = (startIdx + i) % 9;
    const lordObj = TRIBHAGI_ORDER[idx];
    const isBalance = i === 0 && balanceYrs < lordObj.years;
    let duration = isBalance ? balanceYrs : lordObj.years;

    if (cumulativeYears + duration > targetTotalYears) {
      duration = targetTotalYears - cumulativeYears;
    }

    const endDate = addFractionalYears(currentDate, duration);
    const isActive = now >= currentDate && now <= endDate;

    // Generate 9 Antardashas
    const antardashas: DashaPeriod[] = [];
    let antarCurrentDate = new Date(currentDate.getTime());

    for (let j = 0; j < 9; j++) {
      const antarIdx = (idx + j) % 9;
      const antarLord = TRIBHAGI_ORDER[antarIdx];
      const antarDuration = (duration * antarLord.years) / 80;
      const antarEndDate = addFractionalYears(antarCurrentDate, antarDuration);
      const antarActive = now >= antarCurrentDate && now <= antarEndDate;

      antardashas.push({
        id: `tri-antar-${lordObj.key}-${antarLord.key}-${i}-${j}`,
        planetKey: antarLord.key,
        planetNe: antarLord.nameNe,
        planetEn: antarLord.nameEn,
        startDate: antarCurrentDate.toISOString().split('T')[0],
        endDate: antarEndDate.toISOString().split('T')[0],
        durationYears: antarDuration,
        fullYears: (lordObj.years * antarLord.years) / 80,
        isBalancePeriod: isBalance,
        isActive: antarActive,
        rulerNe: antarLord.nameNe,
        rulerEn: antarLord.nameEn
      });

      antarCurrentDate = antarEndDate;
    }

    list.push({
      id: `tri-${lordObj.key}-${i}`,
      planetKey: lordObj.key,
      planetNe: lordObj.nameNe,
      planetEn: lordObj.nameEn,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationYears: duration,
      fullYears: lordObj.years,
      isBalancePeriod: isBalance,
      isActive,
      antardashas,
      rulerNe: lordObj.nameNe,
      rulerEn: lordObj.nameEn
    });

    currentDate = endDate;
    cumulativeYears += duration;
    i++;
  }

  return list;
}

// ==========================================
// YOGINI DASHA HIERARCHY (72 Years / 36 Years)
// ==========================================

export function calculateYoginiDasha(
  arg1: Date | number,
  arg2?: number | Date | boolean,
  arg3?: number | boolean
): YoginiPeriod[] {
  let birthDate: Date;
  let startIdx: number;
  let balanceYrs: number;
  let extended = true;

  if (arg1 instanceof Date) {
    birthDate = arg1;
    startIdx = typeof arg2 === 'number' ? arg2 : 0;
    balanceYrs = typeof arg3 === 'number' ? arg3 : YOGINI_ORDER[startIdx].years;
  } else {
    const moonDegree = typeof arg1 === 'number' ? arg1 : 0;
    birthDate = arg2 instanceof Date ? arg2 : new Date();
    if (typeof arg3 === 'boolean') {
      extended = arg3;
    } else if (typeof arg2 === 'boolean') {
      extended = arg2;
    }

    const normMoon = normalizeDeg(moonDegree);
    const nakIdx = Math.floor(normMoon / (360 / 27));
    startIdx = (nakIdx + 3) % 8;

    const nakDegSpan = 360 / 27;
    const degInNak = normMoon % nakDegSpan;
    const elapsedFraction = degInNak / nakDegSpan;
    const fullYrs = YOGINI_ORDER[startIdx].years;
    balanceYrs = fullYrs * (1 - elapsedFraction);
  }

  const now = new Date();
  const list: YoginiPeriod[] = [];
  const targetTotalYears = extended ? 72.0 : 36.0;
  let currentDate = new Date(birthDate.getTime());
  let cumulativeYears = 0;
  let i = 0;

  while (cumulativeYears < targetTotalYears - 0.0001 && i < 30) {
    const idx = (startIdx + i) % 8;
    const yoginiObj = YOGINI_ORDER[idx];
    const isBalance = i === 0 && balanceYrs < yoginiObj.years;
    let duration = isBalance ? balanceYrs : yoginiObj.years;

    if (cumulativeYears + duration > targetTotalYears) {
      duration = targetTotalYears - cumulativeYears;
    }

    const endDate = addFractionalYears(currentDate, duration);
    const isActive = now >= currentDate && now <= endDate;
    const cycleNumber = cumulativeYears < 36.0 ? 1 : 2;

    // Generate 8 Sub-periods for Yogini
    const subPeriods: YoginiPeriod[] = [];
    let subCurrentDate = new Date(currentDate.getTime());

    for (let j = 0; j < 8; j++) {
      const subIdx = (idx + j) % 8;
      const subYogini = YOGINI_ORDER[subIdx];
      const subDuration = (duration * subYogini.years) / 36;
      const subEndDate = addFractionalYears(subCurrentDate, subDuration);
      const subActive = now >= subCurrentDate && now <= subEndDate;

      subPeriods.push({
        id: `yog-sub-${cycleNumber}-${yoginiObj.index}-${subYogini.index}-${i}-${j}`,
        yoginiIndex: subYogini.index,
        nameNe: subYogini.nameNe,
        nameEn: subYogini.nameEn,
        rulerNe: subYogini.rulerNe,
        rulerEn: subYogini.rulerEn,
        startDate: subCurrentDate.toISOString().split('T')[0],
        endDate: subEndDate.toISOString().split('T')[0],
        durationYears: subDuration,
        fullYears: (yoginiObj.years * subYogini.years) / 36,
        isBalancePeriod: isBalance,
        isActive: subActive,
        cycleNumber
      });

      subCurrentDate = subEndDate;
    }

    list.push({
      id: `yog-${cycleNumber}-${yoginiObj.index}-${i}`,
      yoginiIndex: yoginiObj.index,
      nameNe: yoginiObj.nameNe,
      nameEn: yoginiObj.nameEn,
      rulerNe: yoginiObj.rulerNe,
      rulerEn: yoginiObj.rulerEn,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationYears: duration,
      fullYears: yoginiObj.years,
      isBalancePeriod: isBalance,
      isActive,
      cycleNumber,
      subPeriods
    });

    currentDate = endDate;
    cumulativeYears += duration;
    i++;
  }

  return list;
}

// ==========================================
// UN-DEDUCTED FULL DASHA TIMELINE CALCULATOR (भुक्त नकाटिएको)
// ==========================================

export function formatDurationYMD(yearsFloat: number, lang: Language = 'ne'): string {
  const totalMonths = Math.round(yearsFloat * 12);
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  if (lang === 'ne') {
    const toDev = (n: number) => {
      const dev = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      return String(n).replace(/\d/g, (d) => dev[parseInt(d, 10)]);
    };
    if (mos === 0) return `${toDev(yrs)} वर्ष`;
    if (yrs === 0) return `${toDev(mos)} महिना`;
    return `${toDev(yrs)} वर्ष ${toDev(mos)} महिना`;
  } else {
    if (mos === 0) return `${yrs} Years`;
    if (yrs === 0) return `${mos} Months`;
    return `${yrs} Y ${mos} M`;
  }
}

export function calculateUnDeductedDashas(moonDegree: number, birthDate: Date): {
  vimshottari120: DashaPeriod[];
  tribhagi80: DashaPeriod[];
  yogini72: YoginiPeriod[];
} {
  const normMoon = normalizeDeg(moonDegree);
  const nakIdx = Math.floor(normMoon / (360 / 27));
  const nakIdx1Indexed = nakIdx + 1;
  const now = new Date();

  // 1. Vimshottari 120 Years (Full Un-deducted)
  const lordKey = NAKSHATRA_NAMES[nakIdx].lordEn.toLowerCase();
  const startVimIndex = VIMSHOTTARI_ORDER.findIndex((p) => p.key === lordKey);
  const vimshottari120: DashaPeriod[] = [];
  let vimCurrentDate = new Date(birthDate.getTime());

  for (let i = 0; i < 9; i++) {
    const idx = (startVimIndex + i) % 9;
    const lordObj = VIMSHOTTARI_ORDER[idx];
    const duration = lordObj.years;
    const endDate = addFractionalYears(vimCurrentDate, duration);
    const isActive = now >= vimCurrentDate && now <= endDate;

    // Generate 9 Antardashas
    const antardashas: DashaPeriod[] = [];
    let antarCurrentDate = new Date(vimCurrentDate.getTime());
    for (let j = 0; j < 9; j++) {
      const antarIdx = (idx + j) % 9;
      const antarLord = VIMSHOTTARI_ORDER[antarIdx];
      const antarDuration = (duration * antarLord.years) / 120;
      const antarEndDate = addFractionalYears(antarCurrentDate, antarDuration);
      const antarActive = now >= antarCurrentDate && now <= antarEndDate;

      antardashas.push({
        id: `undeducted-vim-antar-${lordObj.key}-${antarLord.key}-${i}-${j}`,
        planetKey: antarLord.key,
        planetNe: antarLord.nameNe,
        planetEn: antarLord.nameEn,
        startDate: antarCurrentDate.toISOString().split('T')[0],
        endDate: antarEndDate.toISOString().split('T')[0],
        durationYears: antarDuration,
        fullYears: antarDuration,
        isBalancePeriod: false,
        isActive: antarActive,
        rulerNe: antarLord.nameNe,
        rulerEn: antarLord.nameEn
      });

      antarCurrentDate = antarEndDate;
    }

    vimshottari120.push({
      id: `undeducted-vim-${lordObj.key}`,
      planetKey: lordObj.key,
      planetNe: lordObj.nameNe,
      planetEn: lordObj.nameEn,
      startDate: vimCurrentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationYears: duration,
      fullYears: duration,
      isBalancePeriod: false,
      isActive,
      antardashas,
      rulerNe: lordObj.nameNe,
      rulerEn: lordObj.nameEn
    });

    vimCurrentDate = endDate;
  }

  // 2. Tribhagi 80 Years (Full Un-deducted)
  const startTriIndex = TRIBHAGI_ORDER.findIndex((p) => p.key === lordKey);
  const tribhagi80: DashaPeriod[] = [];
  let triCurrentDate = new Date(birthDate.getTime());

  for (let i = 0; i < 9; i++) {
    const idx = (startTriIndex + i) % 9;
    const lordObj = TRIBHAGI_ORDER[idx];
    const duration = lordObj.years;
    const endDate = addFractionalYears(triCurrentDate, duration);
    const isActive = now >= triCurrentDate && now <= endDate;

    // Generate 9 Antardashas
    const antardashas: DashaPeriod[] = [];
    let antarCurrentDate = new Date(triCurrentDate.getTime());
    for (let j = 0; j < 9; j++) {
      const antarIdx = (idx + j) % 9;
      const antarLord = TRIBHAGI_ORDER[antarIdx];
      const antarDuration = (duration * antarLord.years) / 80;
      const antarEndDate = addFractionalYears(antarCurrentDate, antarDuration);
      const antarActive = now >= antarCurrentDate && now <= antarEndDate;

      antardashas.push({
        id: `undeducted-tri-antar-${lordObj.key}-${antarLord.key}-${i}-${j}`,
        planetKey: antarLord.key,
        planetNe: antarLord.nameNe,
        planetEn: antarLord.nameEn,
        startDate: antarCurrentDate.toISOString().split('T')[0],
        endDate: antarEndDate.toISOString().split('T')[0],
        durationYears: antarDuration,
        fullYears: antarDuration,
        isBalancePeriod: false,
        isActive: antarActive,
        rulerNe: antarLord.nameNe,
        rulerEn: antarLord.nameEn
      });

      antarCurrentDate = antarEndDate;
    }

    tribhagi80.push({
      id: `undeducted-tri-${lordObj.key}`,
      planetKey: lordObj.key,
      planetNe: lordObj.nameNe,
      planetEn: lordObj.nameEn,
      startDate: triCurrentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationYears: duration,
      fullYears: duration,
      isBalancePeriod: false,
      isActive,
      antardashas,
      rulerNe: lordObj.nameNe,
      rulerEn: lordObj.nameEn
    });

    triCurrentDate = endDate;
  }

  // 3. Yogini 72 Years System (Full Un-deducted: 2 Cycles of 36 Years each, total 72 Years)
  const startYoginiIndex = (nakIdx1Indexed + 2) % 8;
  const yogini72: YoginiPeriod[] = [];
  let yogCurrentDate = new Date(birthDate.getTime());

  for (let c = 1; c <= 2; c++) {
    for (let i = 0; i < 8; i++) {
      const idx = (startYoginiIndex + i) % 8;
      const yoginiObj = YOGINI_ORDER[idx];
      const duration = yoginiObj.years; // strictly 1, 2, 3, 4, 5, 6, 7, 8 years
      const endDate = addFractionalYears(yogCurrentDate, duration);
      const isActive = now >= yogCurrentDate && now <= endDate;

      // Sub-periods for Yogini
      const subPeriods: YoginiPeriod[] = [];
      let subCurrentDate = new Date(yogCurrentDate.getTime());
      for (let j = 0; j < 8; j++) {
        const subIdx = (idx + j) % 8;
        const subYogini = YOGINI_ORDER[subIdx];
        const subDuration = (duration * subYogini.years) / 36;
        const subEndDate = addFractionalYears(subCurrentDate, subDuration);
        const subActive = now >= subCurrentDate && now <= subEndDate;

        subPeriods.push({
          id: `undeducted-yog-sub-${c}-${yoginiObj.index}-${subYogini.index}-${i}-${j}`,
          yoginiIndex: subYogini.index,
          nameNe: subYogini.nameNe,
          nameEn: subYogini.nameEn,
          rulerNe: subYogini.rulerNe,
          rulerEn: subYogini.rulerEn,
          startDate: subCurrentDate.toISOString().split('T')[0],
          endDate: subEndDate.toISOString().split('T')[0],
          durationYears: subDuration,
          fullYears: (yoginiObj.years * subYogini.years) / 36,
          isBalancePeriod: false,
          isActive: subActive,
          cycleNumber: c
        });
        subCurrentDate = subEndDate;
      }

      yogini72.push({
        id: `undeducted-yog-${c}-${yoginiObj.index}-${i}`,
        yoginiIndex: yoginiObj.index,
        nameNe: yoginiObj.nameNe,
        nameEn: yoginiObj.nameEn,
        rulerNe: yoginiObj.rulerNe,
        rulerEn: yoginiObj.rulerEn,
        durationYears: duration,
        fullYears: yoginiObj.years,
        startDate: yogCurrentDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        cycleNumber: c,
        isActive,
        subPeriods
      });

      yogCurrentDate = endDate;
    }
  }

  return {
    vimshottari120,
    tribhagi80,
    yogini72
  };
}

// ==========================================
// DIVISIONAL CHARTS ENGINE (SHODASHVARGA)
// ==========================================

export function calculateDivisionalCharts(planets: DetailedPlanetPosition[]): DivisionalChartData[] {
  const lagna = planets.find((p) => p.id === 'lagna') || planets[0];

  const createChartHouses = (getPlanetSign: (p: DetailedPlanetPosition) => number): DivisionalChartData['houses'] => {
    const lagnaDivSign = getPlanetSign(lagna);
    const houses: DivisionalChartData['houses'] = [];

    for (let h = 1; h <= 12; h++) {
      const signIdx = (lagnaDivSign + h - 1) % 12;
      const rashi = RASHI_NAMES[signIdx];

      const occupants = planets
        .filter((p) => p.id !== 'lagna' && getPlanetSign(p) === signIdx)
        .map((p) => p.nameNe);

      houses.push({
        houseNum: h,
        signIndex: signIdx,
        signNe: rashi.ne,
        signEn: rashi.en,
        planets: occupants
      });
    }

    return houses;
  };

  // D1 Rashi (30° / div)
  const d1Houses = createChartHouses((p) => p.rashiIndex);

  // D2 Hora (15° / div)
  const d2Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const isOdd = p.rashiIndex % 2 === 0;
    if (deg < 15) {
      return isOdd ? 4 : 3; // Sun (Leo=4) vs Moon (Cancer=3)
    } else {
      return isOdd ? 3 : 4;
    }
  });

  // D3 Drekkana (10° / div)
  const d3Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 10.0);
    return (p.rashiIndex + div * 4) % 12;
  });

  // D4 Chaturthamsa (7.5° / div)
  const d4Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 7.5);
    return (p.rashiIndex + div * 3) % 12;
  });

  // D7 Saptamsa (30/7 = 4.2857° / div)
  const d7Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / (30 / 7));
    const isOdd = p.rashiIndex % 2 === 0;
    const startSign = isOdd ? p.rashiIndex : (p.rashiIndex + 6) % 12;
    return (startSign + div) % 12;
  });

  // D9 Navamsa (30/9 = 3.3333° / div)
  const d9Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const navIdx = Math.floor(deg / (30 / 9)); // 0 to 8
    const rashiIdx = p.rashiIndex;

    let startSign = 0;
    if ([0, 4, 8].includes(rashiIdx)) startSign = 0; // Fiery -> Aries
    else if ([1, 5, 9].includes(rashiIdx)) startSign = 9; // Earthy -> Capricorn
    else if ([2, 6, 10].includes(rashiIdx)) startSign = 6; // Airy -> Libra
    else startSign = 3; // Watery -> Cancer

    return (startSign + navIdx) % 12;
  });

  // D10 Dashamsa (3° / div)
  const d10Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const dashIdx = Math.floor(deg / 3.0); // 0 to 9
    const rashiIdx = p.rashiIndex;
    const isOdd = rashiIdx % 2 === 0;
    const startSign = isOdd ? rashiIdx : (rashiIdx + 8) % 12;
    return (startSign + dashIdx) % 12;
  });

  // D12 Dwadasamsa (2.5° / div)
  const d12Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const dwaIdx = Math.floor(deg / 2.5);
    return (p.rashiIndex + dwaIdx) % 12;
  });

  // D16 Shodashamsa (1.875° / div)
  const d16Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 1.875);
    const rashiIdx = p.rashiIndex;
    const signType = rashiIdx % 3; // 0=Movable, 1=Fixed, 2=Dual
    const startSign = signType === 0 ? 0 : signType === 1 ? 4 : 8; // Aries, Leo, Sag
    return (startSign + div) % 12;
  });

  // D20 Vimsamsa (1.5° / div)
  const d20Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 1.5);
    const rashiIdx = p.rashiIndex;
    const signType = rashiIdx % 3;
    const startSign = signType === 0 ? 0 : signType === 1 ? 8 : 4; // Aries, Sag, Leo
    return (startSign + div) % 12;
  });

  // D24 Chaturvimsamsa / Siddhamsa (1.25° / div)
  const d24Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 1.25);
    const isOdd = p.rashiIndex % 2 === 0;
    const startSign = isOdd ? 4 : 3; // Leo vs Cancer
    return (startSign + div) % 12;
  });

  // D27 Saptavimsamsa / Bhamsa (30/27 = 1.1111° / div)
  const d27Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / (30 / 27));
    const element = p.rashiIndex % 4; // 0=Fiery, 1=Earthy, 2=Airy, 3=Watery
    const startSign = element === 0 ? 0 : element === 1 ? 3 : element === 2 ? 6 : 9; // Aries, Cancer, Libra, Cap
    return (startSign + div) % 12;
  });

  // D30 Trimsamsa (Parashari degree ranges)
  const d30Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const isOdd = p.rashiIndex % 2 === 0;
    if (isOdd) {
      if (deg < 5) return 0;  // Aries (Mars)
      if (deg < 10) return 10; // Aquarius (Saturn)
      if (deg < 18) return 8;  // Sagittarius (Jupiter)
      if (deg < 25) return 2;  // Gemini (Mercury)
      return 1;  // Taurus (Venus)
    } else {
      if (deg < 5) return 1;  // Taurus (Venus)
      if (deg < 12) return 2;  // Gemini (Mercury)
      if (deg < 20) return 8;  // Sagittarius (Jupiter)
      if (deg < 25) return 10; // Aquarius (Saturn)
      return 0;  // Aries (Mars)
    }
  });

  // D40 Khavedamsa (0.75° / div)
  const d40Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 0.75);
    const isOdd = p.rashiIndex % 2 === 0;
    const startSign = isOdd ? 0 : 6; // Aries vs Libra
    return (startSign + div) % 12;
  });

  // D45 Akshavedamsa (0.6666° / div)
  const d45Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / (30 / 45));
    const signType = p.rashiIndex % 3;
    const startSign = signType === 0 ? 0 : signType === 1 ? 4 : 8; // Aries, Leo, Sag
    return (startSign + div) % 12;
  });

  // D60 Shashtiamsa (0.5° / div)
  const d60Houses = createChartHouses((p) => {
    const deg = p.degree % 30;
    const div = Math.floor(deg / 0.5);
    return (p.rashiIndex + div) % 12;
  });

  return [
    { code: 'D1', nameNe: 'D1 - लग्न / राशि कुण्डली', nameEn: 'D1 - Rashi Chart', descriptionNe: 'मुख्य शारीरिक तथा समग्र जीवन कुण्डली', descriptionEn: 'Primary Life & Physical Body Chart', houses: d1Houses },
    { code: 'D9', nameNe: 'D9 - नवमांश कुण्डली', nameEn: 'D9 - Navamsa Chart', descriptionNe: 'भाग्य, विवाह, धर्म र उत्तरार्ध जीवन', descriptionEn: 'Marriage, Spouse, Destiny & Soul Purpose', houses: d9Houses },
    { code: 'D10', nameNe: 'D10 - दशमांश कुण्डली', nameEn: 'D10 - Dashamsa Chart', descriptionNe: 'कर्म, पेशा, प्रतिष्ठा र पदोन्नति', descriptionEn: 'Career, Profession, Status & Public Achievements', houses: d10Houses },
    { code: 'D2', nameNe: 'D2 - होरा कुण्डली', nameEn: 'D2 - Hora Chart', descriptionNe: 'सम्पत्ति, धन र आर्थिक स्थिति', descriptionEn: 'Wealth, Assets & Financial Capacity', houses: d2Houses },
    { code: 'D3', nameNe: 'D3 - द्रेष्काण कुण्डली', nameEn: 'D3 - Drekkana Chart', descriptionNe: 'भाइ-बहिनी, साहस र पराक्रम', descriptionEn: 'Siblings, Courage & Efforts', houses: d3Houses },
    { code: 'D4', nameNe: 'D4 - चतुर्थांश कुण्डली', nameEn: 'D4 - Chaturthamsa Chart', descriptionNe: 'भाग्य, घर-जग्गा र अचल सम्पत्ति', descriptionEn: 'Property, Fixed Assets & Destiny', houses: d4Houses },
    { code: 'D7', nameNe: 'D7 - सप्तमांश कुण्डली', nameEn: 'D7 - Saptamsa Chart', descriptionNe: 'सन्तान र सन्ततिको सुख', descriptionEn: 'Children & Future Generation', houses: d7Houses },
    { code: 'D12', nameNe: 'D12 - द्वादशांश कुण्डली', nameEn: 'D12 - Dwadasamsa Chart', descriptionNe: 'माता-पिता र वंशज', descriptionEn: 'Parents, Lineage & Heritage', houses: d12Houses },
    { code: 'D16', nameNe: 'D16 - षोडशांश कुण्डली', nameEn: 'D16 - Shodashamsa Chart', descriptionNe: 'वाहन, भौतिक सुख र यात्रा', descriptionEn: 'Vehicles, Comforts & Mental Happiness', houses: d16Houses },
    { code: 'D20', nameNe: 'D20 - विंशांश कुण्डली', nameEn: 'D20 - Vimsamsa Chart', descriptionNe: 'आध्यात्मिक प्रगति र उपासना', descriptionEn: 'Spiritual Progress & Meditation', houses: d20Houses },
    { code: 'D24', nameNe: 'D24 - चतुर्विंशांश कुण्डली', nameEn: 'D24 - Siddhamsa Chart', descriptionNe: 'उच्च विद्या र ज्ञान', descriptionEn: 'Learning, Wisdom & Higher Knowledge', houses: d24Houses },
    { code: 'D27', nameNe: 'D27 - सप्तविंशांश कुण्डली', nameEn: 'D27 - Bhamsa Chart', descriptionNe: 'बल, सामर्थ्य र शारीरिक क्षमता', descriptionEn: 'Strengths, Weaknesses & Physical Stamina', houses: d27Houses },
    { code: 'D30', nameNe: 'D30 - त्रिंशांश कुण्डली', nameEn: 'D30 - Trimsamsa Chart', descriptionNe: 'अरिष्ट, कष्ट र सङ्कट निवारण', descriptionEn: 'Miseries, Debts & Difficult Periods', houses: d30Houses },
    { code: 'D40', nameNe: 'D40 - खवेदांश कुण्डली', nameEn: 'D40 - Khavedamsa Chart', descriptionNe: 'मातृक र पैतृक शुभ-अशुभ प्रभाव', descriptionEn: 'Maternal & Paternal Auspiciousness', houses: d40Houses },
    { code: 'D45', nameNe: 'D45 - अक्षवेदांश कुण्डली', nameEn: 'D45 - Akshavedamsa Chart', descriptionNe: 'चारैतर्फको चरित्र र सूक्ष्म स्वभाव', descriptionEn: 'General Character & Microscopic Qualities', houses: d45Houses },
    { code: 'D60', nameNe: 'D60 - षष्ठ्यंश कुण्डली', nameEn: 'D60 - Shashtiamsa Chart', descriptionNe: 'पूर्वजन्मको कर्म र सुक्ष्म विश्लेषण', descriptionEn: 'Past Life Karma & Microscopic Analysis', houses: d60Houses }
  ];
}

// ==========================================
// RIGOROUS YOGAS DETECTION ENGINE
// ==========================================

export function detectYogas(
  planets: DetailedPlanetPosition[],
  houses: HouseDetail[]
): YogaDetail[] {
  const getP = (id: string) => planets.find((p) => p.id === id) || planets[0];

  const sun = getP('sun');
  const moon = getP('moon');
  const mars = getP('mars');
  const mercury = getP('mercury');
  const jupiter = getP('jupiter');
  const venus = getP('venus');
  const saturn = getP('saturn');
  const rahu = getP('rahu');
  const ketu = getP('ketu');

  const yogas: YogaDetail[] = [];

  // 1. Gajakesari Yoga
  const jupDistFromMoon = ((jupiter.houseNum - moon.houseNum + 12) % 12) || 12;
  const isGajakesari = [1, 4, 7, 10].includes(jupDistFromMoon);
  yogas.push({
    id: 'gajakesari',
    nameNe: 'गजकेसरी योग (Gajakesari Yoga)',
    nameEn: 'Gajakesari Yoga',
    type: 'raj',
    descriptionNe: 'चन्द्रमाबाट गुरु (बृहस्पति) १, ४, ७ वा १० औँ (केन्द्र) भावमा हुनु। अति शुभ, बुद्धि, सम्मान र प्रतिष्ठा प्रदायक।',
    descriptionEn: 'Jupiter in Kendra (1st, 4th, 7th, 10th) from Moon. Grants wisdom, high status and wealth.',
    ruleNe: 'नियम: गुरु चन्द्रमाबाट केन्द्र भाव (१, ४, ७, १०) मा स्थित हुनुपर्ने।',
    ruleEn: 'Rule: Jupiter must be in Kendra (1, 4, 7, 10) from Moon.',
    exactRuleNe: 'चन्द्रमा बसेको भावबाट गन्दा गुरु १, ४, ७ वा १० औँ घरमा पर्नुपर्छ।',
    exactRuleEn: 'Jupiter must occupy 1st, 4th, 7th, or 10th house relative to Moon.',
    requiredConditionNe: 'गुरुको चन्द्रबाट दूरी = १, ४, ७ वा १० औँ घर।',
    requiredConditionEn: 'Jupiter distance from Moon = 1, 4, 7, or 10 houses.',
    actualConditionNe: `वास्तविक स्थिति: गुरु (${jupiter.rashiNe}) चन्द्रमा (${moon.rashiNe}) बाट ${jupDistFromMoon} औँ भावमा छ।`,
    actualConditionEn: `Actual: Jupiter is in House ${jupDistFromMoon} from Moon.`,
    isPresent: isGajakesari,
    strengthNe: isGajakesari ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isGajakesari ? 'Strong' : 'Not Present',
    involvedPlanets: ['चन्द्र', 'गुरु']
  });

  // 2. Budhaditya Yoga
  const isBudhaditya = sun.houseNum === mercury.houseNum;
  yogas.push({
    id: 'budhaditya',
    nameNe: 'बुधादित्य योग (Budhaditya Yoga)',
    nameEn: 'Budhaditya Yoga',
    type: 'benefic',
    descriptionNe: 'सूर्य र बुध एउटै भावमा युति हुनु। प्रखर बुद्धि, व्यापारिक सफलता र प्रशासनिक क्षमता।',
    descriptionEn: 'Sun and Mercury conjunct in the same house. Enhances intellect and analytical power.',
    ruleNe: 'नियम: सूर्य र बुध एउटै भावमा एकसाथ स्थित हुनुपर्ने।',
    ruleEn: 'Rule: Sun and Mercury must be conjunct in the same house.',
    exactRuleNe: 'सूर्य र बुधको भाव संख्या बराबर हुनुपर्छ।',
    exactRuleEn: 'Sun house number == Mercury house number.',
    requiredConditionNe: 'सूर्य भाव = बुध भाव।',
    requiredConditionEn: 'Sun house == Mercury house.',
    actualConditionNe: isBudhaditya
      ? `वास्तविक स्थिति: सूर्य र बुध दुवै ${sun.houseNum} औँ भाव (${sun.rashiNe}) मा एकसाथ छन्।`
      : `वास्तविक स्थिति: सूर्य भाव ${sun.houseNum} मा र बुध भाव ${mercury.houseNum} मा छन्।`,
    actualConditionEn: isBudhaditya
      ? `Actual: Sun and Mercury conjunct in House ${sun.houseNum}.`
      : `Actual: Sun in House ${sun.houseNum}, Mercury in House ${mercury.houseNum}.`,
    isPresent: isBudhaditya,
    strengthNe: isBudhaditya ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isBudhaditya ? 'Strong' : 'Not Present',
    involvedPlanets: ['सूर्य', 'बुध']
  });

  // 3. Ruchaka Mahapurusha Yoga (Mars)
  const isRuchaka = [0, 7, 9].includes(mars.rashiIndex) && [1, 4, 7, 10].includes(mars.houseNum);
  yogas.push({
    id: 'ruchaka',
    nameNe: 'रुचक योग (Ruchaka Mahapurusha Yoga)',
    nameEn: 'Ruchaka Yoga',
    type: 'mahapurusha',
    descriptionNe: 'मंगल ग्रह स्वगृही/उच्च (मेष, वृश्चिक, मकर) भई लग्नबाट केन्द्र (१, ४, ७, १०) भावमा बस्नु।',
    descriptionEn: 'Mars in own or exalted sign in Kendra. Bestows immense courage and leadership.',
    ruleNe: 'नियम: मंगल मेष, वृश्चिक वा मकर राशीमा भई १, ४, ७ वा १० औँ भावमा हुनुपर्ने।',
    ruleEn: 'Rule: Mars in Aries, Scorpio, or Capricorn in Kendra house.',
    exactRuleNe: 'मंगल स्वगृही/उच्च राशी + केन्द्र भाव।',
    exactRuleEn: 'Mars in own/exalted sign + Kendra house.',
    requiredConditionNe: 'मंगल राशी = मेष/वृश्चिक/मकर र भाव = १/४/७/१०।',
    requiredConditionEn: 'Mars sign = Aries/Scorpio/Capricorn & House = 1/4/7/10.',
    actualConditionNe: `वास्तविक स्थिति: मंगल ${mars.rashiNe} मा भई ${mars.houseNum} औँ भावमा छ।`,
    actualConditionEn: `Actual: Mars in ${mars.rashiEn} in House ${mars.houseNum}.`,
    isPresent: isRuchaka,
    strengthNe: isRuchaka ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isRuchaka ? 'Very Strong' : 'Not Present',
    involvedPlanets: ['मंगल']
  });

  // 4. Bhadra Mahapurusha Yoga (Mercury)
  const isBhadra = [2, 5].includes(mercury.rashiIndex) && [1, 4, 7, 10].includes(mercury.houseNum);
  yogas.push({
    id: 'bhadra',
    nameNe: 'भद्र योग (Bhadra Mahapurusha Yoga)',
    nameEn: 'Bhadra Yoga',
    type: 'mahapurusha',
    descriptionNe: 'बुध ग्रह मिथुन वा कन्यामा भई केन्द्र भावमा बस्नु। उच्च विद्वता, भाषण कला र विशाल व्यापारिक सफलता।',
    descriptionEn: 'Mercury in Gemini or Virgo in Kendra. Grants extraordinary intellect and business brilliance.',
    ruleNe: 'नियम: बुध मिथुन वा कन्या राशीमा भई केन्द्र (१, ४, ७, १०) भावमा हुनुपर्ने।',
    ruleEn: 'Rule: Mercury in Gemini or Virgo in Kendra house.',
    exactRuleNe: 'बुध स्वगृही/उच्च + केन्द्र भाव।',
    exactRuleEn: 'Mercury in Gemini/Virgo + Kendra house.',
    requiredConditionNe: 'बुध राशी = मिथुन/कन्या र भाव = १/४/७/१०।',
    requiredConditionEn: 'Mercury sign = Gemini/Virgo & House = 1/4/7/10.',
    actualConditionNe: `वास्तविक स्थिति: बुध ${mercury.rashiNe} मा भई ${mercury.houseNum} औँ भावमा छ।`,
    actualConditionEn: `Actual: Mercury in ${mercury.rashiEn} in House ${mercury.houseNum}.`,
    isPresent: isBhadra,
    strengthNe: isBhadra ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isBhadra ? 'Very Strong' : 'Not Present',
    involvedPlanets: ['बुध']
  });

  // 5. Hamsa Mahapurusha Yoga (Jupiter)
  const isHamsa = [3, 8, 11].includes(jupiter.rashiIndex) && [1, 4, 7, 10].includes(jupiter.houseNum);
  yogas.push({
    id: 'hamsa',
    nameNe: 'हंस योग (Hamsa Mahapurusha Yoga)',
    nameEn: 'Hamsa Yoga',
    type: 'mahapurusha',
    descriptionNe: 'गुरु ग्रह कर्कट, धनु वा मीनमा भई केन्द्र भावमा स्थित हुनु। महान् धार्मिकता, विद्वता र समाजमा उच्च प्रतिष्ठा।',
    descriptionEn: 'Jupiter exalted or in own sign in Kendra. Grants divine righteousness and high respect.',
    ruleNe: 'नियम: गुरु कर्कट, धनु वा मीन राशीमा भई १, ४, ७ वा १० औँ भावमा हुनुपर्ने।',
    ruleEn: 'Rule: Jupiter in Cancer, Sagittarius, or Pisces in Kendra house.',
    exactRuleNe: 'गुरु उच्च/स्वगृही + केन्द्र भाव।',
    exactRuleEn: 'Jupiter exalted/own sign + Kendra house.',
    requiredConditionNe: 'गुरु राशी = कर्कट/धनु/मीन र भाव = १/४/७/१०।',
    requiredConditionEn: 'Jupiter sign = Cancer/Sag/Pisces & House = 1/4/7/10.',
    actualConditionNe: `वास्तविक स्थिति: गुरु ${jupiter.rashiNe} मा भई ${jupiter.houseNum} औँ भावमा छ।`,
    actualConditionEn: `Actual: Jupiter in ${jupiter.rashiEn} in House ${jupiter.houseNum}.`,
    isPresent: isHamsa,
    strengthNe: isHamsa ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isHamsa ? 'Very Strong' : 'Not Present',
    involvedPlanets: ['गुरु']
  });

  // 6. Malavya Mahapurusha Yoga (Venus)
  const isMalavya = [1, 6, 11].includes(venus.rashiIndex) && [1, 4, 7, 10].includes(venus.houseNum);
  yogas.push({
    id: 'malavya',
    nameNe: 'मालव्य योग (Malavya Mahapurusha Yoga)',
    nameEn: 'Malavya Yoga',
    type: 'mahapurusha',
    descriptionNe: 'शुक्र ग्रह वृष, तुला वा मीनमा भई केन्द्रमा हुनु। अपार भौतिक सुख, कलात्मक प्रतिभा र भव्य जीवनशैली।',
    descriptionEn: 'Venus in own or exalted sign in Kendra. Bestows luxury, artistic brilliance and happiness.',
    ruleNe: 'नियम: शुक्र वृष, तुला वा मीन राशीमा भई १, ४, ७ वा १० औँ भावमा हुनुपर्ने।',
    ruleEn: 'Rule: Venus in Taurus, Libra, or Pisces in Kendra house.',
    exactRuleNe: 'शुक्र स्वगृही/उच्च + केन्द्र भाव।',
    exactRuleEn: 'Venus in Taurus/Libra/Pisces + Kendra house.',
    requiredConditionNe: 'शुक्र राशी = वृष/तुला/मीन र भाव = १/४/७/१०।',
    requiredConditionEn: 'Venus sign = Taurus/Libra/Pisces & House = 1/4/7/10.',
    actualConditionNe: `वास्तविक स्थिति: शुक्र ${venus.rashiNe} मा भई ${venus.houseNum} औँ भावमा छ।`,
    actualConditionEn: `Actual: Venus in ${venus.rashiEn} in House ${venus.houseNum}.`,
    isPresent: isMalavya,
    strengthNe: isMalavya ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isMalavya ? 'Very Strong' : 'Not Present',
    involvedPlanets: ['शुक्र']
  });

  // 7. Sasa Mahapurusha Yoga (Saturn)
  const isSasa = [6, 9, 10].includes(saturn.rashiIndex) && [1, 4, 7, 10].includes(saturn.houseNum);
  yogas.push({
    id: 'sasa',
    nameNe: 'शश योग (Sasa Mahapurusha Yoga)',
    nameEn: 'Sasa Yoga',
    type: 'mahapurusha',
    descriptionNe: 'शनि ग्रह तुला, मकर वा कुम्भमा भई केन्द्रमा बस्नु। दृढ अनुशासन, दीर्घायु र जननेता बन्ने योग।',
    descriptionEn: 'Saturn exalted or in own sign in Kendra. Gives mass leadership, discipline and longevity.',
    ruleNe: 'नियम: शनि तुला, मकर वा कुम्भ राशीमा भई १, ४, ७ वा १० औँ भावमा हुनुपर्ने।',
    ruleEn: 'Rule: Saturn in Libra, Capricorn, or Aquarius in Kendra house.',
    exactRuleNe: 'शनि उच्च/स्वगृही + केन्द्र भाव।',
    exactRuleEn: 'Saturn exalted/own sign + Kendra house.',
    requiredConditionNe: 'शनि राशी = तुला/मकर/कुम्भ र भाव = १/४/७/१०।',
    requiredConditionEn: 'Saturn sign = Libra/Cap/Aquarius & House = 1/4/7/10.',
    actualConditionNe: `वास्तविक स्थिति: शनि ${saturn.rashiNe} मा भई ${saturn.houseNum} औँ भावमा छ।`,
    actualConditionEn: `Actual: Saturn in ${saturn.rashiEn} in House ${saturn.houseNum}.`,
    isPresent: isSasa,
    strengthNe: isSasa ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isSasa ? 'Very Strong' : 'Not Present',
    involvedPlanets: ['शनि']
  });

  // 8. Chandra-Mangala Yoga
  const isChandraMangala = moon.houseNum === mars.houseNum || ((mars.houseNum - moon.houseNum + 12) % 12) === 7;
  yogas.push({
    id: 'chandra_mangala',
    nameNe: 'चन्द्र-मंगल योग (Chandra-Mangala Yoga)',
    nameEn: 'Chandra-Mangala Yoga',
    type: 'dhana',
    descriptionNe: 'चन्द्र र मंगलको युति (एउटै भाव) वा समसप्तक दृष्टि। तीव्र धन आर्जन, साहस र व्यापारिक सफलता।',
    descriptionEn: 'Conjunction or mutual 7th aspect between Moon and Mars. Excellent for financial accumulation.',
    ruleNe: 'नियम: चन्द्र र मंगल एउटै भावमा हुनुपर्ने वा १-७ दृष्टि सम्बन्ध हुनुपर्ने।',
    ruleEn: 'Rule: Moon and Mars conjunct or in 7th mutual aspect.',
    exactRuleNe: 'चन्द्र र मंगल युति वा ७ औँ दृष्टि।',
    exactRuleEn: 'Moon and Mars conjunction or 180° aspect.',
    requiredConditionNe: 'चन्द्र र मंगलको भाव अन्तर = ० वा ७।',
    requiredConditionEn: 'Moon & Mars house difference = 0 or 7.',
    actualConditionNe: `वास्तविक स्थिति: चन्द्र भाव ${moon.houseNum} र मंगल भाव ${mars.houseNum} मा छन्।`,
    actualConditionEn: `Actual: Moon in House ${moon.houseNum}, Mars in House ${mars.houseNum}.`,
    isPresent: isChandraMangala,
    strengthNe: isChandraMangala ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isChandraMangala ? 'Strong' : 'Not Present',
    involvedPlanets: ['चन्द्र', 'मंगल']
  });

  // 9. Dhana Yoga
  const h1Lord = houses[0].signLordNe;
  const h2Lord = houses[1].signLordNe;
  const h11Lord = houses[10].signLordNe;
  const isDhanaYoga =
    houses[1].planets.some((p) => p.nameNe === h1Lord || p.nameNe === h11Lord) ||
    houses[10].planets.some((p) => p.nameNe === h2Lord);
  yogas.push({
    id: 'dhana_yoga',
    nameNe: 'महाधन योग (Dhana Yoga)',
    nameEn: 'Dhana Yoga',
    type: 'dhana',
    descriptionNe: 'धनेश (२ औँ भाव) र लाभेश (११ औँ भाव) वा लग्नेशको २ औँ र ११ औँ भावसँग सम्बन्ध। अथाह धन सम्पत्ति।',
    descriptionEn: 'Connection between 2nd house of wealth and 11th house of gains. Grants enduring riches.',
    ruleNe: 'नियम: २ औँ र ११ औँ भावका स्वामीहरूको आपसमा वा २/११ भावमा स्थिति।',
    ruleEn: 'Rule: Connection between lords of 2nd and 11th houses.',
    exactRuleNe: 'धनेश वा लाभेशको २/११ भावमा स्थिति।',
    exactRuleEn: 'Lord of 2nd or 11th in 2nd or 11th house.',
    requiredConditionNe: '२ औँ वा ११ औँ भावमा २/११/१ भावका स्वामी हुनुपर्ने।',
    requiredConditionEn: 'Lords of 2nd or 11th placed in 2nd or 11th house.',
    actualConditionNe: isDhanaYoga
      ? `वास्तविक स्थिति: २ औँ/११ औँ भाव र स्वामीहरू (${h2Lord}, ${h11Lord}) बीच शुभ सम्बन्ध छ।`
      : `वास्तविक स्थिति: २ औँ र ११ औँ भाव स्वामीहरू बीच प्रत्यक्ष सम्बन्ध छैन।`,
    actualConditionEn: isDhanaYoga
      ? `Actual: Lords of 2nd (${h2Lord}) and 11th (${h11Lord}) interconnected.`
      : `Actual: No direct conjunction between 2nd and 11th lords.`,
    isPresent: isDhanaYoga,
    strengthNe: isDhanaYoga ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isDhanaYoga ? 'Strong' : 'Not Present',
    involvedPlanets: [h1Lord, h2Lord, h11Lord]
  });

  // 10. Vipareeta Raja Yoga
  const h6Lord = houses[5].signLordNe;
  const h8Lord = houses[7].signLordNe;
  const h12Lord = houses[11].signLordNe;
  const isVipareeta =
    [6, 8, 12].includes(houses[5].planets.find((p) => p.nameNe === h6Lord)?.houseNum || 0) ||
    [6, 8, 12].includes(houses[7].planets.find((p) => p.nameNe === h8Lord)?.houseNum || 0) ||
    [6, 8, 12].includes(houses[11].planets.find((p) => p.nameNe === h12Lord)?.houseNum || 0);
  yogas.push({
    id: 'vipareeta_raja_yoga',
    nameNe: 'विपरीत राजयोग (Vipareeta Raja Yoga)',
    nameEn: 'Vipareeta Raja Yoga',
    type: 'vipareeta',
    descriptionNe: '६, ८, वा १२ औँ भावको स्वामी त्रिक (६, ८, १२) भावमा नै बस्नु। सङ्कट पछि अप्रत्याशित सफलता।',
    descriptionEn: 'Dusthana lords placed in Dusthana houses. Unexpected victory arising out of adversity.',
    ruleNe: 'नियम: ६, ८, वा १२ औँ भावका स्वामी ६, ८ वा १२ औँ भावमा नै स्थित हुनुपर्ने।',
    ruleEn: 'Rule: 6th, 8th, or 12th lord placed in 6th, 8th, or 12th house.',
    exactRuleNe: 'त्रिकेशको त्रिक भावमा स्थिति।',
    exactRuleEn: 'Dusthana lord in Dusthana house.',
    requiredConditionNe: '६/८/१२ भाव स्वामीको स्थिति = ६/८/१२ भाव।',
    requiredConditionEn: '6th/8th/12th lord house = 6, 8, or 12.',
    actualConditionNe: isVipareeta
      ? `वास्तविक स्थिति: त्रिक स्वामीहरू (${h6Lord}, ${h8Lord}, ${h12Lord}) ६, ८ वा १२ भावमा छन्।`
      : `वास्तविक स्थिति: ६, ८, १२ का स्वामीहरू त्रिक भाव बाहिर स्थित छन्।`,
    actualConditionEn: isVipareeta
      ? `Actual: Dusthana lords (${h6Lord}, ${h8Lord}, ${h12Lord}) in Dusthana houses.`
      : `Actual: Dusthana lords placed outside Dusthana houses.`,
    isPresent: isVipareeta,
    strengthNe: isVipareeta ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isVipareeta ? 'Strong' : 'Not Present',
    involvedPlanets: [h6Lord, h8Lord, h12Lord]
  });

  // 11. Dharma-Karmadhipati Raja Yoga
  const h9Lord = houses[8]?.signLordNe || '';
  const h10Lord = houses[9]?.signLordNe || '';
  const h9LordPlanet = planets.find((p) => p.nameNe === h9Lord);
  const h10LordPlanet = planets.find((p) => p.nameNe === h10Lord);

  const isDharmaKarmaRel =
    Boolean(h9LordPlanet && h10LordPlanet && (
      h9LordPlanet.houseNum === h10LordPlanet.houseNum ||
      [1, 4, 7, 10, 5, 9].includes(h9LordPlanet.houseNum) && [1, 4, 7, 10, 5, 9].includes(h10LordPlanet.houseNum)
    ));

  yogas.push({
    id: 'dharma_karma_raja_yoga',
    nameNe: 'धर्म-कर्माधिपति राजयोग (Dharma-Karmadhipati Raja Yoga)',
    nameEn: 'Dharma-Karmadhipati Raja Yoga',
    type: 'raj',
    descriptionNe: 'नवमेश (भाग्येश) र दशमेश (कर्मेश) को युति, दृष्टि वा केन्द्र/त्रिकोण भावमा बलियो स्थिति। राजयोग, उच्च पद-प्रतिष्ठा र प्रशासनिक सफलता प्रदायक।',
    descriptionEn: 'Association or strong placement of 9th (Dharma) and 10th (Karma) lords in Kendra or Trikona.',
    ruleNe: 'नियम: ९ औँ (नवमेश) र १० औँ (दशमेश) भावका स्वामीहरू एउटै भावमा युति वा केन्द्र/त्रिकोण भावमा स्थित हुनुपर्ने।',
    ruleEn: 'Rule: 9th and 10th lords conjunct or placed in Kendra/Trikona houses.',
    exactRuleNe: 'नवमेश र दशमेशको युति वा केन्द्र/त्रिकोण स्थिति।',
    exactRuleEn: 'Lords of 9th and 10th conjunct or in Kendra/Trikona.',
    requiredConditionNe: '९ औँ र १० औँ भावका स्वामीहरू केन्द्र (१/४/७/१०) वा त्रिकोण (५/९) मा स्थित।',
    requiredConditionEn: 'Lords of 9th and 10th in 1st, 4th, 7th, 10th, 5th, or 9th house.',
    actualConditionNe: isDharmaKarmaRel
      ? `वास्तविक स्थिति: नवमेश (${h9Lord}) भाव ${h9LordPlanet?.houseNum} मा र दशमेश (${h10Lord}) भाव ${h10LordPlanet?.houseNum} मा राजयोग कारक स्थितिमा छन्।`
      : `वास्तविक स्थिति: नवमेश (${h9Lord}) र दशमेश (${h10Lord}) बीच प्रत्यक्ष राजयोग स्थिति छैन।`,
    actualConditionEn: isDharmaKarmaRel
      ? `Actual: 9th lord (${h9Lord}) in House ${h9LordPlanet?.houseNum} and 10th lord (${h10Lord}) in House ${h10LordPlanet?.houseNum}.`
      : `Actual: No direct Raja Yoga association between 9th and 10th lords.`,
    isPresent: isDharmaKarmaRel,
    strengthNe: isDharmaKarmaRel ? 'अति प्रबल' : 'अनुपस्थित',
    strengthEn: isDharmaKarmaRel ? 'Very Strong' : 'Not Present',
    involvedPlanets: Array.from(new Set([h9Lord, h10Lord].filter(Boolean)))
  });

  // 12. Lagnadhipati Raja Yoga
  const lagnaLordNe = houses[0]?.signLordNe || '';
  const lagnaLordPlanet = planets.find((p) => p.nameNe === lagnaLordNe);
  const isLagnaLordStrong = Boolean(
    lagnaLordPlanet && (
      [1, 4, 7, 10, 5, 9].includes(lagnaLordPlanet.houseNum) ||
      lagnaLordPlanet.dignity === 'उच्च' ||
      lagnaLordPlanet.dignity === 'स्वगृही'
    )
  );

  yogas.push({
    id: 'lagna_lord_raja_yoga',
    nameNe: 'लग्नेश राजयोग (Lagnadhipati Raja Yoga)',
    nameEn: 'Lagnadhipati Raja Yoga',
    type: 'raj',
    descriptionNe: 'लग्नेश केन्द्र (१, ४, ७, १०) वा त्रिकोण (५, ९) भावमा स्वगृही/उच्च भई स्थित हुनु। दीर्घायु, सुस्वास्थ्य र विशाल व्यक्तित्व निर्माण।',
    descriptionEn: 'Lagna lord placed strongly in Kendra/Trikona or exalted/own sign. Bestows charisma, longevity and success.',
    ruleNe: 'नियम: लग्नेश केन्द्र वा त्रिकोण भावमा बस्नु वा उच्च/स्वगृही हुनुपर्ने।',
    ruleEn: 'Rule: Lagna lord in Kendra or Trikona house or in own/exalted sign.',
    exactRuleNe: 'लग्नेशको १, ४, ७, १०, ५, ९ भाव वा उच्च/स्वगृही स्थिति।',
    exactRuleEn: 'Lagna lord in Kendra/Trikona or own/exalted sign.',
    requiredConditionNe: 'लग्नेश भाव = १/४/७/१०/५/९ वा स्थिति = उच्च/स्वगृही।',
    requiredConditionEn: 'Lagna lord house = 1, 4, 7, 10, 5, 9 or exalted/own sign.',
    actualConditionNe: `वास्तविक स्थिति: लग्नेश (${lagnaLordNe}) ${lagnaLordPlanet?.houseNum || 1} औँ भावमा ${lagnaLordPlanet?.dignity || 'सामान्य'} स्थितिमा छ।`,
    actualConditionEn: `Actual: Lagna lord (${lagnaLordNe}) in House ${lagnaLordPlanet?.houseNum} with ${lagnaLordPlanet?.dignityEn || 'Neutral'} dignity.`,
    isPresent: isLagnaLordStrong,
    strengthNe: isLagnaLordStrong ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isLagnaLordStrong ? 'Strong' : 'Not Present',
    involvedPlanets: [lagnaLordNe].filter(Boolean)
  });

  // 13. Neechabhanga Raja Yoga
  const debiPlanet = planets.find((p) => p.dignity === 'नीच' && p.id !== 'lagna');
  const isNeechabhanga = Boolean(debiPlanet && [1, 4, 7, 10].includes(debiPlanet.houseNum));

  yogas.push({
    id: 'neechabhanga_raja_yoga',
    nameNe: 'नीचभङ्ग राजयोग (Neechabhanga Raja Yoga)',
    nameEn: 'Neechabhanga Raja Yoga',
    type: 'neechabhanga',
    descriptionNe: 'नीच राशीमा रहेको ग्रहको नीचत्व भङ्ग भई राजयोगमा परिवर्तन हुनु। सुरुमा संघर्ष तर पछि असाधारण उचाइ र ख्याति।',
    descriptionEn: 'Cancellation of debilitation converting weak placement into extraordinary power and success.',
    ruleNe: 'नियम: नीच ग्रह केन्द्र भावमा स्थित भई वा राशि स्वामी बलवान् भई नीचत्व भङ्ग हुनुपर्ने।',
    ruleEn: 'Rule: Debilitated planet placed in Kendra or supported by sign lord.',
    exactRuleNe: 'नीच ग्रहको केन्द्र भाव स्थिति वा नीच भङ्ग।',
    exactRuleEn: 'Debilitated planet in Kendra house or sign lord support.',
    requiredConditionNe: 'नीच ग्रह केन्द्र (१/४/७/१०) भावमा स्थित हुनुपर्ने।',
    requiredConditionEn: 'Debilitated planet in Kendra house.',
    actualConditionNe: debiPlanet
      ? `वास्तविक स्थिति: नीच ग्रह (${debiPlanet.nameNe}) ${debiPlanet.houseNum} औँ भावमा छ।`
      : 'वास्तविक स्थिति: कुण्डलीमा कुनै नीच ग्रह छैन (नीचत्व भङ्गको आवश्यकता परेन)।',
    actualConditionEn: debiPlanet
      ? `Actual: Debilitated planet (${debiPlanet.nameEn}) in House ${debiPlanet.houseNum}.`
      : 'Actual: No debilitated planet in Kundali.',
    isPresent: isNeechabhanga,
    strengthNe: isNeechabhanga ? 'प्रबल' : 'अनुपस्थित',
    strengthEn: isNeechabhanga ? 'Strong' : 'Not Present',
    involvedPlanets: debiPlanet ? [debiPlanet.nameNe] : []
  });

  // 14. Kuja Dosha (Manglik)
  const isManglik = [1, 2, 4, 7, 8, 12].includes(mars.houseNum);
  yogas.push({
    id: 'manglik_dosha',
    nameNe: 'माङ्गलिक दोष / कुज योग (Manglik / Kuja Dosha)',
    nameEn: 'Manglik / Kuja Dosha',
    type: 'dosha',
    descriptionNe: 'मंगल १, २, ४, ७, ८ वा १२ औँ भावमा हुनु। वैवाहिक जीवनमा सतर्कता र मंगलको विशेष शान्ति आवश्यक।',
    descriptionEn: 'Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house. Advises astrological compatibility evaluation.',
    ruleNe: 'नियम: मंगल लग्नबाट १, २, ४, ७, ८ वा १२ औँ भावमा पर्नुपर्ने।',
    ruleEn: 'Rule: Mars placed in 1st, 2nd, 4th, 7th, 8th, or 12th house.',
    exactRuleNe: 'मंगल १, २, ४, ७, ८, १२ भावमा।',
    exactRuleEn: 'Mars in House 1, 2, 4, 7, 8, or 12.',
    requiredConditionNe: 'मंगल भाव = १, २, ४, ७, ८ वा १२।',
    requiredConditionEn: 'Mars house = 1, 2, 4, 7, 8, or 12.',
    actualConditionNe: `वास्तविक स्थिति: मंगल ${mars.houseNum} औँ भावमा स्थित छ।`,
    actualConditionEn: `Actual: Mars is in House ${mars.houseNum}.`,
    isPresent: isManglik,
    strengthNe: isManglik ? 'सामान्य' : 'अनुपस्थित',
    strengthEn: isManglik ? 'Moderate' : 'Not Present',
    involvedPlanets: ['मंगल']
  });

  return yogas;
}

// ==========================================
// GRAHA BALA & STRENGTH SUMMARY ENGINE
// ==========================================

export function calculateGrahaBala(planets: DetailedPlanetPosition[]): GrahaBalaItem[] {
  const result: GrahaBalaItem[] = [];

  for (const p of planets) {
    if (p.id === 'lagna') continue;

    let dignityScore = 30; // base
    if (p.dignity === 'उच्च') dignityScore = 60;
    else if (p.dignity === 'स्वगृही') dignityScore = 50;
    else if (p.dignity === 'मित्र') dignityScore = 40;
    else if (p.dignity === 'नीच') dignityScore = 10;

    let houseScore = 20;
    if ([1, 4, 7, 10].includes(p.houseNum)) houseScore = 40; // Kendra
    else if ([5, 9].includes(p.houseNum)) houseScore = 35; // Trikona
    else if ([3, 6, 11].includes(p.houseNum)) houseScore = 28; // Upachaya

    let motionScore = p.isRetrograde ? 30 : 20;
    if (p.id === 'sun' || p.id === 'moon') motionScore = 25;

    const total = dignityScore + houseScore + motionScore;

    let gradeNe = 'सामान्य (Moderate)';
    let gradeEn = 'Moderate';
    if (total >= 110) { gradeNe = 'अति बलवान् (Extremely Strong)'; gradeEn = 'Extremely Strong'; }
    else if (total >= 90) { gradeNe = 'बलवान् (Strong)'; gradeEn = 'Strong'; }
    else if (total < 65) { gradeNe = 'निर्बल (Weak)'; gradeEn = 'Weak'; }

    result.push({
      planetKey: p.id,
      planetNe: p.nameNe,
      planetEn: p.nameEn,
      dignityScore,
      houseScore,
      motionScore,
      totalScore: total,
      gradeNe,
      gradeEn
    });
  }

  return result;
}

// ==========================================
// PANCHANGA CALCULATION FOR BIRTH
// ==========================================

export function calculatePanchangaForBirth(
  utcDate: Date,
  lat: number,
  lon: number,
  localYear?: number,
  localMonth?: number,
  localDay?: number,
  localHour?: number,
  localMinute?: number,
  localTzOffset?: number,
  siderealSunDeg?: number,
  siderealMoonDeg?: number
): PanchangaDetail {
  const bYear = typeof localYear === 'number' ? localYear : utcDate.getUTCFullYear();
  const bMonth = typeof localMonth === 'number' ? localMonth : (utcDate.getUTCMonth() + 1);
  const bDay = typeof localDay === 'number' ? localDay : utcDate.getUTCDate();
  const bHour = typeof localHour === 'number' ? localHour : utcDate.getUTCHours();
  const bMin = typeof localMinute === 'number' ? localMinute : utcDate.getUTCMinutes();
  const tzHrs = typeof localTzOffset === 'number' ? localTzOffset : 5.75;
  const tzOffsetMs = tzHrs * 3600 * 1000;

  // Helper to compute exact sidereal angles at any UTC Date
  const getSiderealState = (date: Date) => {
    let aTime: any;
    try {
      aTime = Astronomy.MakeTime(date);
    } catch (_e) {
      aTime = Astronomy.MakeTime(utcDate);
    }
    const sunLon = Astronomy.SunPosition(aTime).elon;
    const moonLon = Astronomy.EclipticGeoMoon(aTime).lon;
    const jd = calculateJulianDay(date);
    const ayanamsa = calculateLahiriAyanamsa(jd);
    const sSun = normalizeDeg(sunLon - ayanamsa);
    const sMoon = normalizeDeg(moonLon - ayanamsa);
    const diff = normalizeDeg(moonLon - sunLon);
    const sum = normalizeDeg(sSun + sMoon);
    return { sunLon, moonLon, jd, ayanamsa, sSun, sMoon, diff, sum, aTime };
  };

  // Helper: Format a Date to local time string (e.g. "१४:२५ / ०२:२५ PM")
  const formatLocalDate = (d: Date): string => {
    const localMs = d.getTime() + tzOffsetMs;
    const lDate = new Date(localMs);
    const lh = lDate.getUTCHours();
    const lm = lDate.getUTCMinutes();
    const ampm = lh >= 12 ? 'PM' : 'AM';
    const dispH = lh % 12 || 12;
    const hStr = toDevanagariDigits(String(dispH).padStart(2, '0'));
    const mStr = toDevanagariDigits(String(lm).padStart(2, '0'));
    const h24Str = toDevanagariDigits(String(lh).padStart(2, '0'));
    return `${h24Str}:${mStr} (${hStr}:${mStr} ${ampm})`;
  };

  // Helper: Bisection search for monotonic angle crossing
  const findAngleCrossing = (
    startTime: Date,
    maxHours: number,
    angleGetter: (d: Date) => number,
    targetAngle: number
  ): Date | null => {
    const normTarget = normalizeDeg(targetAngle);
    let t0 = startTime.getTime();
    const stepMs = 20 * 60 * 1000; // 20 min steps
    const totalSteps = Math.ceil((maxHours * 3600 * 1000) / stepMs);

    let prevVal = angleGetter(new Date(t0));
    let bracketStart = -1;
    let bracketEnd = -1;

    for (let i = 1; i <= totalSteps; i++) {
      const tCur = t0 + i * stepMs;
      const curVal = angleGetter(new Date(tCur));

      // Check if target angle is crossed between prevVal and curVal
      let crossed = false;
      if (prevVal <= curVal) {
        crossed = prevVal <= normTarget && curVal >= normTarget;
      } else {
        // Wrapped past 360°
        crossed = normTarget >= prevVal || normTarget <= curVal;
      }

      if (crossed) {
        bracketStart = tCur - stepMs;
        bracketEnd = tCur;
        break;
      }
      prevVal = curVal;
    }

    if (bracketStart === -1) return null;

    // Binary search within the 20 min interval (14 iterations ~ 0.07 sec precision)
    let low = bracketStart;
    let high = bracketEnd;
    for (let iter = 0; iter < 14; iter++) {
      const mid = (low + high) / 2;
      const midVal = angleGetter(new Date(mid));
      let isPastTarget = false;
      if (prevVal <= midVal) {
        isPastTarget = midVal >= normTarget;
      } else {
        isPastTarget = normTarget <= midVal && normTarget < 180;
      }
      if (isPastTarget) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return new Date((low + high) / 2);
  };

  // 1. Determine Local Morning / Sunrise & Sunset
  const localMidnightMs = Date.UTC(bYear, bMonth - 1, bDay, 0, 0, 0);
  const midnightUtc = new Date(localMidnightMs - tzOffsetMs);

  let sunriseDate = new Date(midnightUtc.getTime() + 6 * 3600 * 1000); // fallback 06:00
  let sunsetDate = new Date(midnightUtc.getTime() + 18.5 * 3600 * 1000); // fallback 18:30
  let sunriseStr = '०६:०० AM';
  let sunsetStr = '०६:३० PM';
  let dinamanaGhatiPal = 'घ. ३० प. ००';
  let ratrimanaGhatiPal = 'घ. ३० प. ००';
  let ishtaKalaGhatiPal = 'घ. ०६ प. २०';

  try {
    const observer = new Astronomy.Observer(lat, lon, 100);
    const midAstro = Astronomy.MakeTime(midnightUtc);
    const riseSearch = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, midAstro, 1.2);
    const setSearch = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, midAstro, 1.2);

    if (riseSearch?.date) {
      sunriseDate = riseSearch.date;
      const rLocal = new Date(sunriseDate.getTime() + tzOffsetMs);
      const rh = rLocal.getUTCHours();
      const rm = rLocal.getUTCMinutes();
      const ampm = rh >= 12 ? 'PM' : 'AM';
      const dispH = rh % 12 || 12;
      sunriseStr = `${toDevanagariDigits(String(dispH).padStart(2, '0'))}:${toDevanagariDigits(String(rm).padStart(2, '0'))} ${ampm}`;
    }

    if (setSearch?.date) {
      sunsetDate = setSearch.date;
      const sLocal = new Date(sunsetDate.getTime() + tzOffsetMs);
      const sh = sLocal.getUTCHours();
      const sm = sLocal.getUTCMinutes();
      const ampm = sh >= 12 ? 'PM' : 'AM';
      const dispH = sh % 12 || 12;
      sunsetStr = `${toDevanagariDigits(String(dispH).padStart(2, '0'))}:${toDevanagariDigits(String(sm).padStart(2, '0'))} ${ampm}`;
    }

    // Dinamana & Ratrimana
    const dayLengthMin = (sunsetDate.getTime() - sunriseDate.getTime()) / (60 * 1000);
    const validDayLenMin = dayLengthMin > 0 ? dayLengthMin : 12 * 60;
    const dinamanaGhati = validDayLenMin / 24;
    const ratrimanaGhati = Math.max(0, 60 - dinamanaGhati);
    dinamanaGhatiPal = formatToGhatiPala(dinamanaGhati);
    ratrimanaGhatiPal = formatToGhatiPala(ratrimanaGhati);

    // Ishtakala: Time from Sunrise to Birth Time (in Ghati)
    // Formula: (Birth Time - Sunrise Time in minutes) / 24, or (diff in hours) * 2.5
    let diffMsFromSunrise = utcDate.getTime() - sunriseDate.getTime();
    if (diffMsFromSunrise < 0) {
      // Night birth before sunrise: astrological day started from the previous day's sunrise
      const prevMidnightUtc = new Date(midnightUtc.getTime() - 24 * 3600 * 1000);
      const prevRiseSearch = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, Astronomy.MakeTime(prevMidnightUtc), 1.2);
      if (prevRiseSearch?.date) {
        diffMsFromSunrise = utcDate.getTime() - prevRiseSearch.date.getTime();
      } else {
        diffMsFromSunrise += 24 * 3600 * 1000;
      }
    }
    const ishtaMinutes = diffMsFromSunrise / (60 * 1000);
    const ishtaGhati = ishtaMinutes / 24;
    ishtaKalaGhatiPal = formatToGhatiPala(ishtaGhati);
  } catch (_e) {
    // fallback clean
  }

  // 2. Sunrise State & Day Panchanga
  const riseState = getSiderealState(sunriseDate);
  const dayTithiIndex = Math.floor(riseState.diff / 12) + 1; // 1 to 30
  const dayNakIdx = Math.floor(riseState.sMoon / (360 / 27)) % 27; // 0 to 26
  const dayYogaIdx = Math.floor(riseState.sum / (360 / 27)) % 27; // 0 to 26

  // 3. Exact Astronomical State at Birth Moment
  const birthState = getSiderealState(utcDate);
  const sSun = typeof siderealSunDeg === 'number' ? normalizeDeg(siderealSunDeg) : birthState.sSun;
  const sMoon = typeof siderealMoonDeg === 'number' ? normalizeDeg(siderealMoonDeg) : birthState.sMoon;
  const diff = normalizeDeg(birthState.moonLon - birthState.sunLon);
  const sumLon = normalizeDeg(sSun + sMoon);

  // 4. Transition Calculations for Tithi, Nakshatra, Yoga
  // Tithi Transition
  const tithiTargetDeg = dayTithiIndex * 12;
  const tithiTransDate = findAngleCrossing(
    sunriseDate,
    30,
    (d) => getSiderealState(d).diff,
    tithiTargetDeg
  );

  let tithiTransitionTime = '—';
  let tithiTransitionGhatiPal = '—';
  if (tithiTransDate) {
    tithiTransitionTime = formatLocalDate(tithiTransDate);
    const durMin = (tithiTransDate.getTime() - sunriseDate.getTime()) / (60 * 1000);
    const transGhati = Math.max(0, durMin / 24);
    tithiTransitionGhatiPal = formatToGhatiPala(transGhati);
  }

  // Nakshatra Transition
  const nakTargetDeg = (dayNakIdx + 1) * (360 / 27);
  const nakTransDate = findAngleCrossing(
    sunriseDate,
    30,
    (d) => getSiderealState(d).sMoon,
    nakTargetDeg
  );

  let nakshatraTransitionTime = '—';
  let nakshatraTransitionGhatiPal = '—';
  if (nakTransDate) {
    nakshatraTransitionTime = formatLocalDate(nakTransDate);
    const durMin = (nakTransDate.getTime() - sunriseDate.getTime()) / (60 * 1000);
    const transGhati = Math.max(0, durMin / 24);
    nakshatraTransitionGhatiPal = formatToGhatiPala(transGhati);
  }

  // Yoga Transition
  const yogaTargetDeg = (dayYogaIdx + 1) * (360 / 27);
  const yogaTransDate = findAngleCrossing(
    sunriseDate,
    30,
    (d) => getSiderealState(d).sum,
    yogaTargetDeg
  );

  let yogaTransitionTime = '—';
  let yogaTransitionGhatiPal = '—';
  if (yogaTransDate) {
    yogaTransitionTime = formatLocalDate(yogaTransDate);
    const durMin = (yogaTransDate.getTime() - sunriseDate.getTime()) / (60 * 1000);
    const transGhati = Math.max(0, durMin / 24);
    yogaTransitionGhatiPal = formatToGhatiPala(transGhati);
  }

  // 5. Active Tithi at Exact Birth Moment
  const birthTithiIndex = Math.floor(diff / 12) + 1; // 1 to 30
  const pakshaNe = birthTithiIndex <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const pakshaEn = birthTithiIndex <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithiNumInPaksha = birthTithiIndex <= 15 ? birthTithiIndex : birthTithiIndex - 15;

  const tithiNamesNe = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी', 'षष्ठी',
    'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी',
    'पूर्णिमा / अमावस्या'
  ];

  const getTithiBaseName = (idx: number) => {
    const num = idx <= 15 ? idx : idx - 15;
    if (num === 15) {
      return idx === 15 ? 'पूर्णिमा' : 'औंसी (अमावस्या)';
    }
    return tithiNamesNe[num - 1] || 'प्रतिपदा';
  };

  const tithiBaseName = getTithiBaseName(birthTithiIndex);
  const tithiNameNe = `${pakshaNe} ${tithiBaseName}`;
  const tithiNameEn = `${pakshaEn} Tithi ${tithiNumInPaksha}`;

  const degInTithi = diff % 12;
  const tithiFraction = degInTithi / 12;
  const tithiBhuktaGhati = tithiFraction * 60;
  const tithiBhogyaGhati = Math.max(0, 60 - tithiBhuktaGhati);
  const tithiGhatiPal = formatToGhatiPala(tithiBhuktaGhati);
  const tithiBhuktaGhatiPal = formatToGhatiPala(tithiBhuktaGhati);
  const tithiBhogyaGhatiPal = formatToGhatiPala(tithiBhogyaGhati);

  // 6. Vara (Weekday)
  const localBirthDate = new Date(Date.UTC(bYear, bMonth - 1, bDay, bHour, bMin, 0));
  const dayIndex = localBirthDate.getUTCDay(); // 0 = Sun
  const varasNe = ['आइतबार (रविवासर)', 'सोमबार (सोमवासर)', 'मङ्गलबार (भौमवासर)', 'बुधबार (सौम्यवासर)', 'बिहीबार (गुरुवासर)', 'शुक्रबार (भृगुवासर)', 'शनिबार (स्थिरवासर)'];
  const varasEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // 7. Nakshatra & Pada of Moon at Birth
  const { nakIdx, pad } = getNakshatraAndPada(sMoon);
  const nak = NAKSHATRA_NAMES[nakIdx] || NAKSHATRA_NAMES[0];
  const nakSpan = 360 / 27; // 13.333333°
  const degInNak = sMoon % nakSpan;
  const nakFraction = degInNak / nakSpan;
  const nakBhuktaGhati = nakFraction * 60;
  const nakBhogyaGhati = Math.max(0, 60 - nakBhuktaGhati);
  const nakshatraGhatiPal = formatToGhatiPala(nakBhuktaGhati);
  const nakshatraBhuktaGhatiPal = formatToGhatiPala(nakBhuktaGhati);
  const nakshatraBhogyaGhatiPal = formatToGhatiPala(nakBhogyaGhati);
  const bhabhogaGhatiPal = formatToGhatiPala(nakBhogyaGhati);

  // 8. Yoga: (Sidereal Sun + Sidereal Moon) / 13°20'
  const yogaIdx = Math.floor(sumLon / nakSpan);
  const yogaNamesNe = [
    'विष्कम्भ', 'प्रीति', 'आयुष्मान्', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड',
    'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान्', 'परिघ', 'शिव',
    'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'ऐन्द्र', 'वैधृति'
  ];
  const degInYoga = sumLon % nakSpan;
  const yogaFraction = degInYoga / nakSpan;
  const yogaBhuktaGhati = yogaFraction * 60;
  const yogaGhatiPal = formatToGhatiPala(yogaBhuktaGhati);

  // 9. Karana: (Moon - Sun) / 6°
  const karanaIdx = Math.floor(diff / 6) + 1; // 1 to 60
  let karanaNameNe = 'बव';
  if (karanaIdx === 1) {
    karanaNameNe = 'किंस्तुघ्न';
  } else if (karanaIdx >= 2 && karanaIdx <= 57) {
    const movableKaranas = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)'];
    karanaNameNe = movableKaranas[(karanaIdx - 2) % 7];
  } else if (karanaIdx === 58) {
    karanaNameNe = 'शकुनि';
  } else if (karanaIdx === 59) {
    karanaNameNe = 'चतुष्पद';
  } else {
    karanaNameNe = 'नाग';
  }

  // 10. Bikram Samvat, Shaka Samvat, & 60 Samvatsara at Birth
  const bsDate = convertADToBS(bYear, bMonth, bDay);
  const vikramYear = bsDate.year;
  const vikramSamvat = toDevanagariDigits(vikramYear);
  const shakaYear = vikramYear - 135;
  const shakaSamvat = toDevanagariDigits(shakaYear);
  const bsMonthName = NEPALI_MONTHS_NE[bsDate.month - 1] || 'वैशाख';
  const bsDateFormatted = `वि.सं. ${vikramSamvat} ${bsMonthName} ${toDevanagariDigits(bsDate.day)} गते`;
  const samvatsaraObj = getSamvatsaraAtBirth(vikramYear);

  // 11. Solar Masa (सौर मास), Chandramasa (चान्द्र मास), Ayana & Ritu
  const solarMasaIndex = Math.floor(normalizeDeg(sSun) / 30);
  const solarMasaNames = [
    'वैशाख', 'ज्येष्ठ', 'आषाढ', 'श्रावण', 'भाद्रपद', 'आश्विन',
    'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  const solarMasaNamesEn = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  const solarMasaNe = solarMasaNames[solarMasaIndex] || 'वैशाख';
  const solarMasaEn = solarMasaNamesEn[solarMasaIndex] || 'Baisakh';

  // Chandramasa Calculation:
  // Step back to the New Moon (Amavasya, diff = 0) of the cycle
  let chandraMasaIdx = solarMasaIndex;
  try {
    // In Purnimanta tradition (North India / Nepal), after Purnima (Krishna Paksha), month name increments
    if (birthTithiIndex > 15) {
      chandraMasaIdx = (solarMasaIndex + 1) % 12;
    }
  } catch (_e) {}
  const chandraMasaNe = solarMasaNames[chandraMasaIdx] || solarMasaNe;
  const chandraMasaEn = solarMasaNamesEn[chandraMasaIdx] || solarMasaEn;

  // Ayana: Makara (9) through Mithuna (2) is Uttarayana; Karka (3) through Dhanu (8) is Dakshinayana
  const isUttarayana = solarMasaIndex >= 9 || solarMasaIndex <= 2;
  const ayanaNe = isUttarayana ? 'उत्तरायण' : 'दक्षिणायन';
  const ayanaEn = isUttarayana ? 'Uttarayana' : 'Dakshinayana';

  // Ritu: 6 Vedic Seasons
  let rituNe = 'वसन्त';
  let rituEn = 'Vasanta';
  if (solarMasaIndex === 11 || solarMasaIndex === 0) {
    rituNe = 'वसन्त';
    rituEn = 'Vasanta';
  } else if (solarMasaIndex === 1 || solarMasaIndex === 2) {
    rituNe = 'ग्रीष्म';
    rituEn = 'Grishma';
  } else if (solarMasaIndex === 3 || solarMasaIndex === 4) {
    rituNe = 'वर्षा';
    rituEn = 'Varsha';
  } else if (solarMasaIndex === 5 || solarMasaIndex === 6) {
    rituNe = 'शरद्';
    rituEn = 'Sharad';
  } else if (solarMasaIndex === 7 || solarMasaIndex === 8) {
    rituNe = 'हेमन्त';
    rituEn = 'Hemanta';
  } else {
    rituNe = 'शिशिर';
    rituEn = 'Shishira';
  }

  // Sunrise day names for comparisons
  const dayTithiNameNe = `${dayTithiIndex <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'} ${getTithiBaseName(dayTithiIndex)}`;
  const dayNakNameNe = NAKSHATRA_NAMES[dayNakIdx]?.ne || nak.ne;
  const dayYogaNameNe = yogaNamesNe[dayYogaIdx % 27] || yogaNamesNe[0];

  return {
    shakaSamvat,
    shakaYear,
    vikramSamvat,
    vikramYear,
    bsDateFormatted,
    bsMonthName,
    bsDay: bsDate.day,
    samvatsaraNe: samvatsaraObj.ne,
    samvatsaraEn: samvatsaraObj.en,
    samvatsaraIndex: samvatsaraObj.index,
    ayanaNe,
    ayanaEn,
    rituNe,
    rituEn,
    solarMasaNe,
    solarMasaEn,
    chandraMasaNe,
    chandraMasaEn,
    tithiNe: tithiNameNe,
    tithiEn: tithiNameEn,
    tithiIndex: birthTithiIndex,
    tithiNumInPaksha,
    tithiGhatiPal,
    tithiBhuktaGhatiPal,
    tithiBhogyaGhatiPal,
    tithiTransitionTime,
    tithiTransitionGhatiPal,
    dayTithiNe: dayTithiNameNe,
    birthTithiNe: tithiNameNe,
    pakshaNe,
    pakshaEn,
    varaNe: varasNe[dayIndex],
    varaEn: varasEn[dayIndex],
    nakshatraNe: nak.ne,
    nakshatraEn: nak.en,
    nakshatraPad: pad,
    nakshatraGhatiPal,
    nakshatraBhuktaGhatiPal,
    nakshatraBhogyaGhatiPal,
    nakshatraTransitionTime,
    nakshatraTransitionGhatiPal,
    dayNakshatraNe: dayNakNameNe,
    birthNakshatraNe: nak.ne,
    bhabhogaGhatiPal,
    yogaNe: yogaNamesNe[yogaIdx % 27],
    yogaEn: `Yoga ${(yogaIdx % 27) + 1}`,
    yogaGhatiPal,
    yogaTransitionTime,
    yogaTransitionGhatiPal,
    dayYogaNe: dayYogaNameNe,
    birthYogaNe: yogaNamesNe[yogaIdx % 27],
    karanaNe: karanaNameNe,
    karanaEn: `Karana ${((karanaIdx - 1) % 11) + 1}`,
    birthKaranaNe: karanaNameNe,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    moonrise: '०७:१५ PM',
    moonset: '०६:४५ AM',
    dinamanaGhatiPal,
    ratrimanaGhatiPal,
    ishtaKalaGhatiPal
  };
}

// ==========================================
// AVAKHADA CHAKRA DETAILS
// ==========================================

// Exact 27 Nakshatras x 4 Padas = 108 Namakshars
const NAKSHATRA_NAMAKSHARS: string[][] = [
  ['चु', 'चे', 'चो', 'ला'], // 0. Ashwini
  ['ली', 'लु', 'ले', 'लो'], // 1. Bharani
  ['अ', 'इ', 'उ', 'ए'],    // 2. Krittika
  ['ओ', 'वा', 'वी', 'वू'], // 3. Rohini
  ['वे', 'वो', 'का', 'की'], // 4. Mrigashira
  ['कु', 'घ', 'ङ', 'छ'],   // 5. Ardra
  ['के', 'को', 'हा', 'ही'], // 6. Punarvasu
  ['हू', 'हे', 'हो', 'डा'], // 7. Pushya
  ['डी', 'डु', 'डे', 'डो'], // 8. Ashlesha
  ['मा', 'मी', 'मू', 'मे'], // 9. Magha
  ['मो', 'टा', 'टी', 'टू'], // 10. Purva Phalguni
  ['टे', 'टो', 'पा', 'पी'], // 11. Uttara Phalguni
  ['पू', 'ष', 'ण', 'ठ'],   // 12. Hasta
  ['पे', 'पो', 'रा', 'री'], // 13. Chitra
  ['रू', 'रे', 'रो', 'ता'], // 14. Swati
  ['ती', 'तू', 'ते', 'तो'], // 15. Vishakha
  ['ना', 'नी', 'नू', 'ने'], // 16. Anuradha
  ['नो', 'या', 'यी', 'यू'], // 17. Jyeshtha
  ['ये', 'यो', 'भा', 'भी'], // 18. Mula
  ['भू', 'धा', 'फा', 'ढा'], // 19. Purva Ashadha
  ['भे', 'भो', 'जा', 'जी'], // 20. Uttara Ashadha
  ['खी', 'खू', 'खे', 'खो'], // 21. Shravana
  ['गा', 'गी', 'गू', 'गे'], // 22. Dhanishta
  ['गो', 'सा', 'सी', 'सू'], // 23. Shatabhisha
  ['से', 'सो', 'द', 'दी'], // 24. Purva Bhadrapada
  ['दू', 'थ', 'झ', 'ञ'],   // 25. Uttara Bhadrapada
  ['दे', 'दो', 'च', 'ची']   // 26. Revati
];

// Gana for 27 Nakshatras
const NAKSHATRA_GANA = [
  'देव', 'मनुष्य', 'राक्षस', 'मनुष्य', 'देव', 'मनुष्य', 'देव', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'देव', 'राक्षस', 'देव', 'राक्षस',
  'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव'
];

// Yoni for 27 Nakshatras
const NAKSHATRA_YONI = [
  'अश्व', 'गज', 'मेष', 'सर्प', 'सर्प', 'श्वान', 'मार्जार', 'मेष', 'मार्जार',
  'मूषक', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'महिष', 'व्याघ्र', 'मृग', 'मृग',
  'श्वान', 'वानर', 'नकुल', 'वानर', 'सिंह', 'अश्व', 'सिंह', 'गौ', 'गज'
];

// Nadi for 27 Nakshatras
const NAKSHATRA_NADI = [
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य',
  'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि',
  'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य'
];

// Varna for 12 Rashis (0=Aries ... 11=Pisces)
const RASHI_VARNA = [
  'क्षत्रिय', 'वैश्य', 'शूद्र', 'ब्राह्मण',
  'क्षत्रिय', 'वैश्य', 'शूद्र', 'ब्राह्मण',
  'क्षत्रिय', 'वैश्य', 'शूद्र', 'ब्राह्मण'
];

// Vashya for 12 Rashis
const RASHI_VASHYA = [
  'चतुष्पद', 'चतुष्पद', 'मानव', 'जलचर', 'वनचर', 'मानव',
  'मानव', 'कीट', 'मानव', 'जलचर', 'मानव', 'जलचर'
];

export function calculateAvakhada(moonPos: DetailedPlanetPosition): AvakhadaInfo {
  const nakIdx = moonPos.nakshatraIndex;
  const padIdx = Math.max(0, Math.min(3, moonPos.pad - 1));

  const nakArray = NAKSHATRA_NAMAKSHARS[nakIdx] || ['चु', 'चे', 'चो', 'ला'];
  const namakshar = nakArray[padIdx] || 'ॐ';

  // Paya calculation based on Moon house from Lagna:
  // Houses 1, 6, 11 -> Silver (रजत)
  // Houses 2, 5, 9 -> Gold (स्वर्ण)
  // Houses 3, 7, 10 -> Copper (ताम्र)
  // Houses 4, 8, 12 -> Iron (लोह)
  let payaStr = 'रजत (Silver)';
  const h = moonPos.houseNum;
  if ([2, 5, 9].includes(h)) payaStr = 'स्वर्ण (Gold)';
  else if ([1, 6, 11].includes(h)) payaStr = 'रजत (Silver)';
  else if ([3, 7, 10].includes(h)) payaStr = 'ताम्र (Copper)';
  else if ([4, 8, 12].includes(h)) payaStr = 'लोह (Iron)';

  return {
    namakshar,
    rashi: moonPos.rashiNe,
    rashiLord: moonPos.rashiLordNe,
    nakshatra: moonPos.nakshatraNe,
    nakshatraLord: moonPos.nakshatraLordNe,
    nakshatraPad: moonPos.pad,
    gana: NAKSHATRA_GANA[nakIdx] || 'देव',
    yoni: NAKSHATRA_YONI[nakIdx] || 'अश्व',
    nadi: NAKSHATRA_NADI[nakIdx] || 'आदि',
    varna: RASHI_VARNA[moonPos.rashiIndex] || 'क्षत्रिय',
    vashya: RASHI_VASHYA[moonPos.rashiIndex] || 'मानव',
    paya: payaStr
  };
}

// ==========================================
// PHALADESH (SEPARATE INTERPRETATION GENERATOR)
// ==========================================

export function generatePhaladesh(
  input: KundaliInput,
  planets: DetailedPlanetPosition[],
  houses: HouseDetail[],
  yogas: YogaDetail[],
  dasha: DashaPeriod[]
): {
  personality: string;
  personalityNe: string;
  personalityEn: string;
  career: string;
  careerNe: string;
  careerEn: string;
  finance: string;
  financeNe: string;
  financeEn: string;
  marriage: string;
  marriageNe: string;
  marriageEn: string;
  education: string;
  educationNe: string;
  educationEn: string;
  health: string;
  healthNe: string;
  healthEn: string;
  travel: string;
  travelNe: string;
  travelEn: string;
  spirituality: string;
  spiritualityNe: string;
  spiritualityEn: string;
  dashaPhala: string;
  dashaPhalaNe: string;
  dashaPhalaEn: string;
  summary: string;
  summaryNe: string;
  summaryEn: string;
} {
  const lagna = planets.find((p) => p.id === 'lagna') || planets[0];
  const moon = planets.find((p) => p.id === 'moon') || planets[0];
  const sun = planets.find((p) => p.id === 'sun') || planets[0];
  const mercury = planets.find((p) => p.id === 'mercury') || planets[0];
  const jupiter = planets.find((p) => p.id === 'jupiter') || planets[0];
  const activeDasha = dasha.find((d) => d.isActive) || dasha[0];

  const presentYogasCount = yogas.filter((y) => y.isPresent).length;

  const personalityNe = `तपाईँको जन्म लग्न ${lagna.rashiNe} र चन्द्र राशी ${moon.rashiNe} रहेको छ। ${lagna.rashiNe} लग्नका व्यक्तिहरू स्वभावैले ${lagna.rashiEn} राशीको गुण अनुरूप आत्मविश्वासी, दृढ संकल्पी र दूरदर्शी हुन्छन्। ${moon.nakshatraNe} नक्षत्रमा जन्म भएकाले तपाईँमा उच्च मानसिक क्षमता, संवेदनशीलता र बौद्धिक चातुर्यता रहेको छ।`;
  const personalityEn = `Your Ascendant (Lagna) is ${lagna.rashiEn} and Moon Sign (Rashi) is ${moon.rashiEn}. Individuals born under ${lagna.rashiEn} Ascendant naturally exhibit strong self-confidence, determination, and visionary foresight. Being born under the auspicious ${moon.nakshatraEn || moon.nakshatraNe} Nakshatra endows you with high mental resilience, emotional depth, and sharp analytical intellect.`;

  const careerNe = `१० औँ भाव (${houses[9]?.signNe || 'मकर'}) र कर्मेशको स्थिति अनुसार तपाईँको लागि ${houses[9]?.signLordNe || 'शनि'} सँग सम्बन्धित क्षेत्रहरू जस्तै प्रशासनिक, शैक्षिक, प्राविधिक वा व्यापारिक क्षेत्रमा विशेष सफलता मिल्नेछ। ${jupiter.houseNum === 10 ? '१० औँ भावमा गुरुको प्रभावले समाजमा उच्च प्रतिष्ठा र राजकीय सम्मान दिलाउनेछ।' : 'मेहनत अनुसार पेशागत जीवनमा निरन्तर पदोन्नति हुनेछ।'}`;
  const careerEn = `Based on the 10th House (${houses[9]?.signEn || 'Capricorn'}) of profession and its lord (${houses[9]?.signLordEn || 'Saturn'}), you will achieve notable success in fields aligned with administrative management, academics, engineering/technology, or independent enterprise. ${jupiter.houseNum === 10 ? 'Jupiter presiding in the 10th House confers high social esteem and prestigious honors.' : 'Consistent diligence guarantees steady promotions and professional leadership.'}`;

  const financeNe = `२ औँ भाव (${houses[1]?.signNe || 'वृष'}) धन स्थान र ११ औँ भाव (${houses[10]?.signNe || 'कुम्भ'}) आय स्थानको विश्लेषण अनुसार तपाईँको आम्दानीको स्रोत बलियो रहनेछ। ${presentYogasCount > 2 ? 'कुण्डलीमा राजयोग तथा धनयोगको विशेष उपस्थिति भएकाले मध्यम उमेरपछि अपार धन-सम्पत्ति र स्थिर बचत हुनेछ।' : 'आर्थिक व्यवस्थापनमा ध्यान दिएमा निरन्तर धन वृद्धि हुनेछ।'}`;
  const financeEn = `Analysis of the 2nd House (${houses[1]?.signEn || 'Taurus'}) of accumulated wealth and 11th House (${houses[10]?.signEn || 'Aquarius'}) of regular income reveals robust financial potential. ${presentYogasCount > 2 ? 'With the auspicious presence of prominent Raja Yogas and Dhana Yogas in your horoscope, substantial wealth accumulation and asset security will flourish, especially in mature years.' : 'Prudent budgetary planning and diversified investments will ensure steady long-term financial growth.'}`;

  const marriageNe = `७ औँ भाव (${houses[6]?.signNe || 'तुला'}) दाम्पत्य सुख स्थानको स्वामी ${houses[6]?.signLordNe || 'शुक्र'} हुन्। तपाईँको जीवनसाथी सुशिक्षित, समझदार र सहयोगी स्वभावको हुनुहुनेछ। पारिवारिक जीवन सुखद् रहनेछ।`;
  const marriageEn = `The 7th House (${houses[6]?.signEn || 'Libra'}) governing marriage and partnerships is ruled by ${houses[6]?.signLordEn || 'Venus'}. Your life partner will be well-educated, cultured, understanding, and mutually supportive. Mutual respect and emotional warmth will establish enduring domestic happiness.`;

  const educationNe = `५ औँ भाव (${houses[4]?.signNe || 'सिंह'}) विद्या र बुद्धिको स्थान हो। ${mercury.dignity === 'उच्च' || mercury.dignity === 'स्वगृही' ? 'बुधको उत्कृष्ट स्थितिले गर्दा उच्च शिक्षा, अनुसन्धान र तर्कशास्त्रमा असाधारण सफलता मिल्नेछ।' : 'मेहनत र एकाग्रताले उच्च विद्या हासिल गर्न सकिनेछ।'}`;
  const educationEn = `The 5th House (${houses[4]?.signEn || 'Leo'}) governs higher learning, memory, and cognitive faculties. ${mercury.dignity === 'उच्च' || mercury.dignity === 'स्वगृही' ? 'Mercury’s exalted/own-sign placement guarantees exceptional brilliance in academia, research, and analytical sciences.' : 'Focused dedication and sustained study habits ensure meritorious achievements in higher education.'}`;

  const healthNe = `६ औँ भाव र लग्नेशको स्थिति अनुसार समग्र स्वास्थ्य सामान्यतया राम्रो रहनेछ। आहारविहार र नियमित योग-व्यायाम गर्नाले मौसमी स्वास्थ्य समस्याबाट जोगिन सकिन्छ।`;
  const healthEn = `Evaluation of the 6th House and Ascendant lord indicates generally resilient vitality and strong immunity. Maintaining balanced nutrition, mindful stress management, and regular exercise will protect against seasonal imbalances.`;

  const travelNe = `९ औँ र १२ औँ भावको शुभ योगले गर्दा वैदेशिक यात्रा, तीर्थाटन तथा अध्ययन वा व्यापारको सिलसिलामा दूरदेशको यात्रा फलदायी हुनेछ।`;
  const travelEn = `Benefic alignments in the 9th and 12th houses strongly favor international journeys, educational pursuits abroad, spiritual pilgrimages, and overseas relocation. Foreign connections will bring favorable outcomes and expansive horizons.`;

  const spiritualityNe = `९ औँ भाव धर्म र गुरुस्थान हो। ${jupiter.rashiNe} मा गुरु र नक्षत्र स्वामीको अनुकूलताले गर्दा तपाईँमा धार्मिक आस्था, परोपकार र सत्कर्मप्रति गहिरो अभिरुचि रहनेछ।`;
  const spiritualityEn = `The 9th House signifies spiritual wisdom, moral dharma, and divine preceptors. Auspicious planetary aspects of Jupiter in ${jupiter.rashiEn} foster deep devotion, philosophical insight, altruistic philanthropy, and noble deeds.`;

  const dashaPhalaNe = `हाल तपाईँको ${activeDasha.planetNe} महादशा चलिरहेको छ (अवधि: ${activeDasha.startDate} देखि ${activeDasha.endDate})। ${activeDasha.planetNe} महादशाको अवधिमा ${activeDasha.planetNe} को कुण्डलीमा रहेको स्थान (${planets.find((p) => p.id === activeDasha.planetKey)?.houseNum || 1} औँ भाव) अनुसार जीवनमा नयाँ अवसर, उन्नति र सफलता प्राप्त हुनेछ।`;
  const dashaPhalaEn = `You are currently experiencing the ${activeDasha.planetEn} Mahadasha period (from ${activeDasha.startDate} to ${activeDasha.endDate}). Governed by ${activeDasha.planetEn} placed in House ${planets.find((p) => p.id === activeDasha.planetKey)?.houseNum || 1}, this period brings transformative opportunities, professional advancement, and fruitful life milestones.`;

  const summaryNe = `${input.name} ज्यू, तपाईँको कुण्डलीमा ${lagna.rashiNe} लग्न र ${moon.rashiNe} चन्द्र राशीको उत्कृष्ट योग बनेको छ। कुण्डलीमा कुल ${presentYogasCount} वटा महत्वपूर्ण शुभ योगहरू सक्रिय रहेका छन्।`;
  const summaryEn = `Respected ${input.name}, your birth chart features a powerful combination of ${lagna.rashiEn} Ascendant and ${moon.rashiEn} Moon sign. A total of ${presentYogasCount} auspicious Vedic yogas are actively radiating positive planetary influences in your horoscope.`;

  return {
    personality: personalityNe,
    personalityNe,
    personalityEn,
    career: careerNe,
    careerNe,
    careerEn,
    finance: financeNe,
    financeNe,
    financeEn,
    marriage: marriageNe,
    marriageNe,
    marriageEn,
    education: educationNe,
    educationNe,
    educationEn,
    health: healthNe,
    healthNe,
    healthEn,
    travel: travelNe,
    travelNe,
    travelEn,
    spirituality: spiritualityNe,
    spiritualityNe,
    spiritualityEn,
    dashaPhala: dashaPhalaNe,
    dashaPhalaNe,
    dashaPhalaEn,
    summary: summaryNe,
    summaryNe,
    summaryEn
  };
}

// ==========================================
// MASTER KUNDALI CALCULATION EXECUTION
// ==========================================

export function calculateFullKundali(input: KundaliInput): KundaliResult {
  const safeDate = input.birthDate && input.birthDate.trim() ? input.birthDate.trim() : '1995-05-15';
  const safeTime = input.birthTime && input.birthTime.trim() ? input.birthTime.trim() : '08:30';

  const partsDate = safeDate.split('-');
  const yearStr = partsDate[0] || '1995';
  const monthStr = partsDate[1] || '05';
  const dayStr = partsDate[2] || '15';

  const partsTime = safeTime.split(':');
  const hourStr = partsTime[0] || '08';
  const minStr = partsTime[1] || '30';

  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1; // 0-indexed
  let day = parseInt(dayStr, 10);
  let hour = parseInt(hourStr, 10);
  let minute = parseInt(minStr, 10);

  if (isNaN(year) || year < 1000 || year > 3000) year = 1995;
  if (isNaN(month) || month < 0 || month > 11) month = 4;
  if (isNaN(day) || day < 1 || day > 31) day = 15;
  if (isNaN(hour) || hour < 0 || hour > 23) hour = 8;
  if (isNaN(minute) || minute < 0 || minute > 59) minute = 30;

  const lat = typeof input.latitude === 'number' && !isNaN(input.latitude) ? input.latitude : 27.7172;
  const lon = typeof input.longitude === 'number' && !isNaN(input.longitude) ? input.longitude : 85.324;
  const tz = typeof input.timezone === 'number' && !isNaN(input.timezone) ? input.timezone : 5.75;
  const nodeType = input.nodeType || 'true';

  // Convert Local Birth Time + Timezone (+ DST if checked) to UTC Date deterministically
  const effectiveTz = tz + (input.isDst ? 1.0 : 0.0);
  const tzOffsetMs = effectiveTz * 3600 * 1000;
  const localUtcMs = Date.UTC(year, month, day, hour, minute, 0);
  const utcTimeMs = isNaN(localUtcMs) ? Date.now() : localUtcMs - tzOffsetMs;
  const utcDate = new Date(utcTimeMs);

  const julianDay = calculateJulianDay(utcDate);
  const ayanamsaDeg = calculateLahiriAyanamsa(julianDay);
  const lagnaDeg = calculateAscendant(utcDate, lat, lon, ayanamsaDeg);

  // 1. Calculate Planetary Positions
  const planetPositions = calculatePlanetaryPositions(utcDate, ayanamsaDeg, lagnaDeg, nodeType);

  // 2. House Details
  const houseDetails = calculateHouseDetails(planetPositions);

  // 3. Simple Houses array for backward compatibility
  const houses: HousePlanet[] = houseDetails.map((hd) => ({
    house: hd.houseNum,
    sign: hd.signNe,
    planets: hd.planets.map((p) => p.nameNe)
  }));

  // 4. Moon position & Avakhada
  const moonPos = planetPositions.find((p) => p.id === 'moon') || planetPositions[0];
  const lagnaPos = planetPositions.find((p) => p.id === 'lagna') || planetPositions[0];
  const sunPos = planetPositions.find((p) => p.id === 'sun') || planetPositions[0];

  const avakhada = calculateAvakhada(moonPos);

  // 5. Panchanga
  const panchanga = calculatePanchangaForBirth(
    utcDate,
    lat,
    lon,
    year,
    month + 1,
    day,
    hour,
    minute,
    effectiveTz,
    sunPos.degree,
    moonPos.degree
  );

  // 6. Dasha Hierarchies (Vimshottari, Tribhagi, Yogini)
  const dashaHierarchy = calculateVimshottariDasha(moonPos.degree, utcDate);
  const tribhagiDashaHierarchy = calculateTribhagiDasha(moonPos.degree, utcDate);
  const yoginiDashaHierarchy = calculateYoginiDasha(moonPos.degree, utcDate, true);
  const unDeductedDashas = calculateUnDeductedDashas(moonPos.degree, utcDate);

  const activeDasha = dashaHierarchy.find((d) => d.isActive) || dashaHierarchy[0];
  const currentDashaSummary = `${activeDasha.planetNe} महादशा (${activeDasha.startDate} देखि ${activeDasha.endDate})`;

  // 7. Divisional Charts (Shodashvarga D1 to D60)
  const divisionalCharts = calculateDivisionalCharts(planetPositions);

  // 8. Yogas
  const yogas = detectYogas(planetPositions, houseDetails);

  // 9. Graha Bala
  const grahaBala = calculateGrahaBala(planetPositions);

  // 10. Audit Record
  const astroTime = Astronomy.MakeTime(utcDate);
  const audit: CalculationAudit = {
    julianDay,
    utcDateStr: utcDate.toISOString(),
    gstHours: Astronomy.SiderealTime(astroTime),
    lstDegrees: normalizeDeg(Astronomy.SiderealTime(astroTime) * 15 + lon),
    obliquityDegrees: 23.43929111,
    ayanamsaDegree: ayanamsaDeg,
    ayanamsaName: 'Chitrapaksha (N.C. Lahiri Ayanamsa)',
    nodeType,
    ephemerisSource: `VSOP87 / JPL Ephemeris via astronomy-engine (${nodeType === 'true' ? 'True Node' : 'Mean Node'})`,
    calculationTimestamp: new Date().toISOString()
  };

  // 11. Phaladesh (Separate Interpretation Engine)
  const phala = generatePhaladesh(input, planetPositions, houseDetails, yogas, dashaHierarchy);

  // Lucky elements calculation
  const gemstoneMap: Record<string, string> = {
    'सूर्य': 'माणिक्य (Ruby)',
    'चन्द्र': 'मोती (Pearl)',
    'मंगल': 'मूंगा (Red Coral)',
    'बुध': 'पन्ना (Emerald)',
    'गुरु': 'पुखराज (Yellow Sapphire)',
    'शुक्र': 'हीरा / ओपल (Diamond/Opal)',
    'शनि': 'नीलम (Blue Sapphire)',
    'राहु': 'गोमेद (Hessonite)',
    'केतु': 'लहुसुनिया (Cat Eye)'
  };

  const luckyGemstone = gemstoneMap[moonPos.rashiLordNe] || 'माणिक्य (Ruby)';

  return {
    name: input.name,
    gender: input.gender,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthPlace: input.birthPlace,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    isDst: input.isDst,
    bsBirthDate: panchanga.bsDateFormatted || (input.calendarType === 'BS' ? input.birthDate : undefined),

    rashi: moonPos.rashiNe,
    rashiEnglish: moonPos.rashiEn,
    rashiLord: moonPos.rashiLordNe,
    nakshatra: moonPos.nakshatraNe,
    nakshatraPad: moonPos.pad,
    nakshatraLord: moonPos.nakshatraLordNe,
    lagna: lagnaPos.rashiNe,
    lagnaEnglish: lagnaPos.rashiEn,
    sunSign: sunPos.rashiNe,
    sunSignEnglish: sunPos.rashiEn,
    element: RASHI_NAMES[moonPos.rashiIndex].element,

    houses,
    houseDetails,
    planetPositions,
    planets: planetPositions,
    avakhada,
    panchanga,
    dashaHierarchy,
    tribhagiDashaHierarchy,
    yoginiDashaHierarchy,
    unDeductedDashas,
    currentDashaSummary,
    divisionalCharts,
    yogas,
    grahaBala,
    audit,

    luckyGemstone,
    luckyColor: ['रातो (Red)', 'सेतो (White)', 'पीलो (Yellow)', 'हरियो (Green)', 'नीलो (Blue)'][moonPos.rashiIndex % 5],
    luckyNumber: (moonPos.rashiIndex % 9) + 1,
    favorableDays: ['आइतबार', 'सोमबार', 'बिहीबार'],
    keyStrengths: ['बौद्धिक चातुर्य', 'नेतृत्व क्षमता', 'उच्च नैतिक चरित्र', 'दूरदर्शिता'],
    remedies: [
      `कुलदेवता तथा इष्टदेवको नित्य पूजा आराधना गर्ने।`,
      `${moonPos.rashiLordNe} ग्रहको शुभ फलका लागि जप तथा गायत्री पाठ गर्ने।`,
      `बिहान सूर्य देवलाई तामाको लोटाबाट जल अर्पण गर्ने।`
    ],

    phaladesh: phala,
    phalaPersonality: phala.personality,
    phalaCareer: phala.career,
    phalaFinance: phala.finance,
    phalaMarriage: phala.marriage,
    phalaEducation: phala.education,
    phalaHealth: phala.health,
    phalaTravel: phala.travel,
    phalaSpirituality: phala.spirituality,
    phalaDasha: phala.dashaPhala,
    predictionSummary: phala.summary
  };
}
