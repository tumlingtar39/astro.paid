export type Language = 'ne' | 'en';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  topic?: 'astrology' | 'numerology' | 'vastu' | 'general';
}

export interface KundaliInput {
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM (24 hr)
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number; // e.g. +5.75 for Nepal
  isDst?: boolean;
  nodeType?: 'true' | 'mean'; // Default: 'true' (True Lunar Node)
  houseSystem?: 'whole_sign' | 'equal';
  chartStyle?: 'north' | 'south';
  systemMode?: 'drik' | 'surya';
  calendarType?: 'AD' | 'BS';
}

export interface DetailedPlanetPosition {
  id: string; // 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'lagna'
  nameNe: string;
  nameEn: string;
  nameSa: string;
  degree: number; // 0 to 360 sidereal
  degreeInSign: number; // 0 to 30
  degreeStr: string; // e.g. "18° 24' 12""
  tropLongitude?: number; // Tropical longitude 0-360
  siderealLongitude?: number; // Sidereal longitude 0-360
  rashiIndex: number; // 0 to 11
  rashiNe: string;
  rashiEn: string;
  rashiLordNe: string;
  rashiLordEn: string;
  nakshatraIndex: number; // 0 to 26
  nakshatraNe: string;
  nakshatraEn: string;
  nakshatraLordNe: string;
  nakshatraLordEn: string;
  pad: number; // 1 to 4
  isRetrograde: boolean;
  isCombust?: boolean; // अस्त / उदय
  motionStateNe?: 'मार्गी' | 'बक्री';
  motionStateEn?: 'Direct' | 'Retrograde';
  visibilityStateNe?: 'उदय' | 'अस्त';
  visibilityStateEn?: 'Risen' | 'Combust';
  sunSeparationDeg?: number; // Angular separation from Sun
  houseNum: number; // 1 to 12
  awastha?: 'बाल' | 'कुमार' | 'युवा' | 'वृद्ध' | 'मृत';
  dignity?: 'उच्च' | 'नीच' | 'स्वगृही' | 'मूलत्रिकोण' | 'मित्र' | 'सम' | 'शत्रु';
  dignityEn?: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Moolatrikona' | 'Friendly' | 'Neutral' | 'Enemy';
  speed?: number; // Degrees per day
}

export interface HouseDetail {
  houseNum: number; // 1 to 12
  signIndex: number; // 0 to 11
  signNe: string;
  signEn: string;
  signLordNe: string;
  signLordEn: string;
  planets: DetailedPlanetPosition[];
  aspectingPlanets: DetailedPlanetPosition[];
  degreeStart?: string;
  degreeEnd?: string;
  significanceNe: string;
  significanceEn: string;
}

export interface YogaDetail {
  id: string;
  nameNe: string;
  nameEn: string;
  type: 'raj' | 'dhana' | 'mahapurusha' | 'benefic' | 'vipareeta' | 'neechabhanga' | 'dosha';
  descriptionNe: string;
  descriptionEn: string;
  ruleNe: string;
  ruleEn: string;
  exactRuleNe?: string;
  exactRuleEn?: string;
  requiredConditionNe?: string;
  requiredConditionEn?: string;
  actualConditionNe?: string;
  actualConditionEn?: string;
  isPresent: boolean;
  strengthNe: 'अति प्रबल' | 'प्रबल' | 'सामान्य' | 'आंशिक' | 'अनुपस्थित';
  strengthEn: 'Very Strong' | 'Strong' | 'Moderate' | 'Partial' | 'Not Present';
  involvedPlanets: string[];
}

export interface DashaPeriod {
  id: string;
  planetKey: string;
  planetNe: string;
  planetEn: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  fullYears?: number;
  isBalancePeriod?: boolean;
  isActive: boolean;
  antardashas?: DashaPeriod[];
  pratyantardashas?: DashaPeriod[];
  rulerNe?: string;
  rulerEn?: string;
}

export interface YoginiPeriod {
  id: string;
  yoginiIndex: number; // 1 to 8
  nameNe: string;      // मङ्गला, पिङ्गला, etc.
  nameEn: string;      // Mangala, Pingala, etc.
  rulerNe: string;     // चन्द्र, सूर्य, etc.
  rulerEn: string;     // Moon, Sun, etc.
  startDate: string;
  endDate: string;
  durationYears: number;
  fullYears?: number;
  isBalancePeriod?: boolean;
  isActive: boolean;
  cycleNumber: number; // 1 or 2
  subPeriods?: YoginiPeriod[];
}

export interface PanchangaDetail {
  shakaSamvat?: string;
  shakaYear?: number;
  vikramSamvat?: string;
  vikramYear?: number;
  bsDateFormatted?: string;
  bsMonthName?: string;
  bsDay?: number;
  samvatsaraNe?: string;
  samvatsaraEn?: string;
  samvatsaraIndex?: number;
  ayanaNe?: string;
  ayanaEn?: string;
  rituNe?: string;
  rituEn?: string;
  solarMasaNe?: string;
  solarMasaEn?: string;
  chandraMasaNe?: string;
  chandraMasaEn?: string;
  tithiNe: string;
  tithiEn: string;
  tithiIndex: number;
  tithiNumInPaksha?: number;
  tithiGhatiPal?: string;
  tithiBhuktaGhatiPal?: string;
  tithiBhogyaGhatiPal?: string;
  tithiTransitionTime?: string;
  tithiTransitionGhatiPal?: string;
  dayTithiNe?: string;
  birthTithiNe?: string;
  pakshaNe: string;
  pakshaEn: string;
  varaNe: string;
  varaEn: string;
  nakshatraNe: string;
  nakshatraEn: string;
  nakshatraPad?: number;
  nakshatraGhatiPal?: string;
  nakshatraBhuktaGhatiPal?: string;
  nakshatraBhogyaGhatiPal?: string;
  nakshatraTransitionTime?: string;
  nakshatraTransitionGhatiPal?: string;
  dayNakshatraNe?: string;
  birthNakshatraNe?: string;
  bhabhogaGhatiPal?: string;
  yogaNe: string;
  yogaEn: string;
  yogaGhatiPal?: string;
  yogaTransitionTime?: string;
  yogaTransitionGhatiPal?: string;
  dayYogaNe?: string;
  birthYogaNe?: string;
  karanaNe: string;
  karanaEn: string;
  birthKaranaNe?: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  dinamanaGhatiPal?: string;
  ratrimanaGhatiPal?: string;
  ishtaKalaGhatiPal?: string;
}

export interface DivisionalHouse {
  houseNum: number;
  signIndex: number;
  signNe: string;
  signEn: string;
  planets: string[];
}

export interface DivisionalChartData {
  code: 'D1' | 'D9' | 'D10' | 'D2' | 'D3' | 'D4' | 'D7' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';
  nameNe: string;
  nameEn: string;
  descriptionNe: string;
  descriptionEn: string;
  houses: DivisionalHouse[];
}

export interface GrahaBalaItem {
  planetKey: string;
  planetNe: string;
  planetEn: string;
  dignityScore: number;
  houseScore: number;
  motionScore: number;
  totalScore: number;
  gradeNe: string;
  gradeEn: string;
}

export interface CalculationAudit {
  julianDay: number;
  utcDateStr: string;
  gstHours: number;
  lstDegrees: number;
  obliquityDegrees: number;
  ayanamsaDegree: number;
  ayanamsaName: string;
  nodeType?: 'true' | 'mean';
  ephemerisSource: string;
  calculationTimestamp: string;
}

export interface HousePlanet {
  house: number; // 1 to 12
  sign: string; // Rashi name
  planets: string[]; // Graha names
}

export interface AvakhadaInfo {
  namakshar: string;
  rashi: string;
  rashiLord: string;
  nakshatra: string;
  nakshatraLord: string;
  nakshatraPad: number;
  gana: string;
  yoni: string;
  nadi: string;
  varna: string;
  vashya: string;
  paya: string;
}

export interface Phaladesh {
  personality: string;
  personalityNe?: string;
  personalityEn?: string;
  career: string;
  careerNe?: string;
  careerEn?: string;
  finance: string;
  financeNe?: string;
  financeEn?: string;
  marriage: string;
  marriageNe?: string;
  marriageEn?: string;
  education: string;
  educationNe?: string;
  educationEn?: string;
  health: string;
  healthNe?: string;
  healthEn?: string;
  travel: string;
  travelNe?: string;
  travelEn?: string;
  spirituality: string;
  spiritualityNe?: string;
  spiritualityEn?: string;
  dashaPhala: string;
  dashaPhalaNe?: string;
  dashaPhalaEn?: string;
  summary?: string;
  summaryNe?: string;
  summaryEn?: string;
}

export interface ForeignDestinationRecommendation {
  countryNe: string;
  countryEn: string;
  regionNe: string;
  regionEn: string;
  suitabilityScore: number; // 0 to 100%
  gradeNe: 'सर्वोत्तम' | 'उत्तम' | 'मध्यम' | 'सामान्य' | 'प्रतिकूल';
  gradeEn: 'Highly Auspicious' | 'Favorable' | 'Moderate' | 'Average' | 'Challenging';
  priorityLabelNe?: string; // e.g. "पहिलो प्राथमिकता — विशेष रूपमा अनुकूल"
  priorityLabelEn?: string; // e.g. "First Priority — Highly Auspicious"
  favorablePurposeNe: string; // अध्ययन (Study), रोजगारी (Job/PR), व्यापार (Business), भ्रमण (Travel)
  favorablePurposeEn: string;
  directionNe: string; // उत्तर, पश्चिम, पूर्व, दक्षिण, वायव्य, ईशान, आदि
  directionEn: string;
  favorableMonthsNe: string;
  favorableMonthsEn: string;
  planetaryReasonNe: string;
  planetaryReasonEn: string;
  remedyNe: string;
  remedyEn: string;
}

export interface YearlyTopicPhalit {
  id: string;
  topicNe: string;
  topicEn: string;
  categoryNe: string;
  categoryEn: string;
  iconName: string;
  score: number; // 0 - 100 percentage auspiciousness
  ratingNe: 'अति शुभ' | 'शुभ' | 'सन्तुलित' | 'सावधानी' | 'चुनौतीपूर्ण';
  ratingEn: 'Excellent' | 'Good' | 'Balanced' | 'Caution' | 'Challenging';
  predictionNe: string;
  predictionEn: string;
  rulingPlanetsNe: string;
  rulingPlanetsEn: string;
  auspiciousMonthsNe: string;
  auspiciousMonthsEn: string;
  remediesNe: string[];
  remediesEn: string[];
}

export interface BhavaYearlyPhalit {
  houseNum: number;
  signNe: string;
  signEn: string;
  signLordNe: string;
  signLordEn: string;
  titleNe: string;
  titleEn: string;
  coreThemesNe: string;
  coreThemesEn: string;
  statusScore: number;
  analysisNe: string;
  analysisEn: string;
  keyEventsNe: string[];
  keyEventsEn: string[];
}

export interface YearlyPredictionResult {
  yearAD: number;
  yearBS: number;
  ageYears: number;
  ageTextNe: string;
  ageTextEn: string;
  dashaInfo: {
    mahadashaNe: string;
    mahadashaEn: string;
    antardashaNe: string;
    antardashaEn: string;
    pratyantardashaNe: string;
    pratyantardashaEn: string;
    periodSummaryNe: string;
    periodSummaryEn: string;
    mahadashaLordHouse: number;
    antardashaLordHouse: number;
    pratyantardashaLordHouse: number;
    dashaLordDignityNe: string;
    dashaLordDignityEn: string;
  };
  overallSummaryNe: string;
  overallSummaryEn: string;
  overallScore: number; // 0 - 100
  overallRatingNe: string;
  overallRatingEn: string;
  keyAuspiciousMonthsNe: string[];
  keyAuspiciousMonthsEn: string[];
  cautionMonthsNe: string[];
  cautionMonthsEn: string[];
  topics: YearlyTopicPhalit[];
  bhavas: BhavaYearlyPhalit[];
  foreignTravelAnalysis: {
    travelYogaStrengthNe: string;
    travelYogaStrengthEn: string;
    settlementProspectsNe: string;
    settlementProspectsEn: string;
    visaSuccessTimingNe: string;
    visaSuccessTimingEn: string;
    bestCountryAdviceNe: string;
    bestCountryAdviceEn: string;
    recommendedDestinations: ForeignDestinationRecommendation[];
  };
  yearlyRemediesNe: string[];
  yearlyRemediesEn: string[];
}

export interface KundaliResult {
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  isDst?: boolean;
  bsBirthDate?: string;
  
  // Astrological Identifiers
  rashi: string;
  rashiEnglish: string;
  rashiLord: string;
  nakshatra: string;
  nakshatraPad: number;
  nakshatraLord: string;
  lagna: string;
  lagnaEnglish: string;
  sunSign: string;
  sunSignEnglish: string;
  element: string;
  
  // Charts & Data
  houses: HousePlanet[];
  houseDetails: HouseDetail[];
  planetPositions: DetailedPlanetPosition[];
  planets: DetailedPlanetPosition[];
  avakhada: AvakhadaInfo;
  panchanga: PanchangaDetail;
  dashaHierarchy: DashaPeriod[];
  tribhagiDashaHierarchy: DashaPeriod[];
  yoginiDashaHierarchy: YoginiPeriod[];
  unDeductedDashas?: {
    vimshottari120: DashaPeriod[];
    tribhagi80: DashaPeriod[];
    yogini72: YoginiPeriod[];
  };
  currentDashaSummary: string;
  divisionalCharts: DivisionalChartData[];
  yogas: YogaDetail[];
  grahaBala: GrahaBalaItem[];
  audit: CalculationAudit;
  
  // Lucky Elements
  luckyGemstone: string;
  luckyColor: string;
  luckyNumber: number;
  favorableDays: string[];
  keyStrengths: string[];
  remedies: string[];
  
  // Phaladesh (Interpretations)
  phaladesh: Phaladesh;
  phalaPersonality: string;
  phalaCareer: string;
  phalaFinance: string;
  phalaMarriage: string;
  phalaEducation: string;
  phalaHealth: string;
  phalaTravel: string;
  phalaSpirituality: string;
  phalaDasha: string;
  predictionSummary: string;
}

export interface GunaMilanInput {
  boyName: string;
  boyBirthDate: string;
  boyBirthTime: string;
  boyBirthPlace: string;
  girlName: string;
  girlBirthDate: string;
  girlBirthTime: string;
  girlBirthPlace: string;
}

export interface GunaMilanResult {
  totalPoints: number; // Max 36
  manglikBoy: boolean;
  manglikGirl: boolean;
  compatibilityGrade: 'अति उत्तम (Excellent)' | 'उत्तम (Good)' | 'मध्यम (Average)' | 'सामान्य (Below Average)';
  gunaBreakdown: {
    category: string;
    maxPoints: number;
    obtainedPoints: number;
    description: string;
  }[];
  recommendations: string[];
}

export interface NumerologyInput {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
}

export interface NumerologyResult {
  mulank: number; // Birth number (1-9)
  bhagyank: number; // Life path number (1-9)
  namank: number; // Expression number (1-9)
  mulankMeaning: string;
  bhagyankMeaning: string;
  namankMeaning: string;
  luckyNumbers: number[];
  unluckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
  favorableCareers: string[];
  yearPrediction: string;
}

export interface VastuRoomInput {
  roomType: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | 'bathroom' | 'living' | 'locker' | 'study';
  direction: 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'N' | 'Center';
}

export interface VastuAnalysisResult {
  status: 'favorable' | 'neutral' | 'unfavorable';
  title: string;
  description: string;
  doshaName?: string;
  remedies: string[];
  element: string;
  idealDirections: string[];
}

export interface DoshaQuizAnswer {
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
}

export interface DoshaResult {
  primaryDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Tridosha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
  percentage: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  traits: string[];
  dietRecommendations: {
    favorable: string[];
    avoid: string[];
  };
  herbalRemedies: {
    herb: string;
    benefit: string;
    usage: string;
  }[];
  dailyRoutine: string[];
}

export interface RashifalItem {
  rashi: string;
  englishName: string;
  symbol: string;
  prediction: string;
  luckyNumber: number;
  luckyColor: string;
  rating: number; // 1 to 5
  career?: string;
  love?: string;
  health?: string;
  finance?: string;
  remedy?: string;
  periodLabel?: string;
}

export interface PanchangData {
  nepaliDate: string;
  englishDate: string;
  dayNameNe: string;
  dayNameEn: string;
  vikramSamvat: string;
  nepalSamvat: string;
  shakaSamvat: string;
  paksha: string;
  ayana: string;
  ritu: string;
  
  tithi: string;
  nakshatra: string;
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
  dishaShool: string;
  dishaShoolRemedy: string;
  
  specialEvents: string[];
}

// ==========================================
// KUNDALI MILAN / ASHTAKOOT MATCHING TYPES
// ==========================================

export interface MilanKootDetail {
  kootId: 'varna' | 'vashya' | 'tara' | 'yoni' | 'grahaMaitri' | 'gana' | 'bhakoot' | 'nadi';
  nameNe: string;
  nameEn: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  boyValue: string;
  girlValue: string;
  descriptionNe: string;
  descriptionEn: string;
  isDefective: boolean;
  hasParihar: boolean;
  pariharDetailsNe?: string;
  pariharDetailsEn?: string;
}

export interface BhakootRelation {
  type: 'shadashtak' | 'navapanchak' | 'dwirdwadash' | 'samasaptaka' | 'tri_ekadash' | 'chaturashra' | 'ek_rashi';
  distance: number; // e.g. 6 (6/8), 5 (5/9), 2 (2/12), 7 (7/7)
  relationLabelNe: string; // e.g. "६/८ षडाष्टक सम्बन्ध", "५/९ नवपञ्चक सम्बन्ध"
  relationLabelEn: string;
  nameNe: string;
  nameEn: string;
  isMalefic: boolean;
  isAuspicious: boolean;
  descriptionNe: string;
  descriptionEn: string;
  isParihar: boolean;
  pariharTypeNe?: string;
  pariharTypeEn?: string;
}

export interface NadiDoshaAnalysis {
  boyNadi: string; // आदि | मध्य | अन्त्य
  girlNadi: string;
  isNadiDosha: boolean;
  isParihar: boolean;
  pariharReasonNe?: string;
  pariharReasonEn?: string;
  impactNe: string;
  impactEn: string;
  remedyNe: string;
  remedyEn: string;
}

export interface ManglikAnalysisPerson {
  name: string;
  isManglikLagna: boolean;
  isManglikChandra: boolean;
  isManglikShukra: boolean;
  marsHouseLagna: number;
  marsHouseChandra: number;
  marsHouseShukra: number;
  status: 'अमाङ्गलिक' | 'आंशिक माङ्गलिक' | 'पूर्ण माङ्गलिक';
  statusEn: 'Non-Manglik' | 'Anshik Manglik' | 'Full Manglik';
  severityScore: number;
  cancellationFactors: string[];
}

export interface ManglikMatchAnalysis {
  boy: ManglikAnalysisPerson;
  girl: ManglikAnalysisPerson;
  isCompatible: boolean;
  isDoshaSamya: boolean;
  verdictNe: string;
  verdictEn: string;
  remediesNe: string[];
}

export interface KundaliMilanResult {
  totalPoints: number; // 0 to 36
  maxPoints: number; // 36
  percentage: number;
  verdictCategory: 'excellent' | 'good' | 'average' | 'critical';
  verdictTitleNe: string;
  verdictTitleEn: string;
  verdictSummaryNe: string;
  verdictSummaryEn: string;
  boyInfo: {
    name: string;
    rashiNe: string;
    rashiEn: string;
    nakshatraNe: string;
    nakshatraEn: string;
    pad: number;
    rashiLordNe: string;
  };
  girlInfo: {
    name: string;
    rashiNe: string;
    rashiEn: string;
    nakshatraNe: string;
    nakshatraEn: string;
    pad: number;
    rashiLordNe: string;
  };
  kootas: MilanKootDetail[];
  bhakootRelation: BhakootRelation;
  nadiAnalysis: NadiDoshaAnalysis;
  manglikAnalysis?: ManglikMatchAnalysis;
  specialYogas: {
    id: string;
    titleNe: string;
    titleEn: string;
    type: 'auspicious' | 'inauspicious' | 'warning';
    descriptionNe: string;
    descriptionEn: string;
  }[];
  recommendationNe: string;
  recommendationEn: string;
  remediesNe: string[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  isAdmin: boolean;
}

export interface LicenseRecord {
  id: string; // Document ID (usually normalized licenseKey)
  licenseKey: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'active' | 'available' | 'revoked' | 'expired';
  authorizedDeviceId?: string | null;
  deviceStatus?: 'authorized' | 'unbound' | 'blocked' | 'revoked';
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    screenResolution?: string;
    language?: string;
    timezone?: string;
    hardwareConcurrency?: number;
    initialIp?: string;
  } | null;
  activatedAt?: string | null;
  lastSeenAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tier?: string;
}

export interface DevicePaymentRequest {
  id: string;
  deviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName?: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedLicenseKey?: string;
  deviceInfo?: any;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DeviceAuthorizationResult {
  authorized: boolean;
  status: 'AUTHORIZED' | 'ACTIVATED' | 'BLOCKED_DIFFERENT_DEVICE' | 'INVALID_LICENSE' | 'EXPIRED' | 'REVOKED' | 'RESET_REQUIRED' | 'OFFLINE_UNVERIFIED';
  licenseKey: string;
  deviceId: string;
  customerName?: string;
  messageNe: string;
  messageEn: string;
  activatedAt?: string | null;
  lastSeenAt?: string | null;
  license?: LicenseRecord | null;
}

export interface DeviceActivationLog {
  id: string;
  licenseKey: string;
  deviceId: string;
  authorizedDeviceId?: string | null;
  previousDeviceId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  action: 'activated' | 'verified' | 'blocked_duplicate' | 'reset' | 'revoked';
  timestamp: string;
  userAgent?: string;
  ip?: string;
  deviceInfo?: any;
}

