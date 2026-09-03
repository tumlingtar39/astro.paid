import {
  KundaliResult,
  YearlyPredictionResult,
  YearlyTopicPhalit,
  BhavaYearlyPhalit,
  ForeignDestinationRecommendation,
  DashaPeriod,
  DetailedPlanetPosition
} from '../types';

// Helper to convert English digits to Nepali Devanagari digits
export function toNepaliDigits(input: string | number): string {
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(input).replace(/\d/g, (d) => devDigits[parseInt(d, 10)]);
}

// AD to BS conversion approximation helper
export function adYearToBsYear(adYear: number): number {
  return adYear + 57;
}

// Planetary friendship & dignity weight helper
function getPlanetScore(planet?: DetailedPlanetPosition): number {
  if (!planet) return 65;
  let score = 65;
  if (planet.dignity === 'उच्च') score += 28;
  else if (planet.dignity === 'मूलत्रिकोण') score += 22;
  else if (planet.dignity === 'स्वगृही') score += 18;
  else if (planet.dignity === 'मित्र') score += 10;
  else if (planet.dignity === 'सम') score += 2;
  else if (planet.dignity === 'शत्रु') score -= 12;
  else if (planet.dignity === 'नीच') score -= 25;

  if (planet.isCombust) score -= 12;
  if ([1, 4, 5, 9, 10, 11].includes(planet.houseNum)) score += 8;
  if ([6, 8, 12].includes(planet.houseNum)) score -= 8;

  return Math.max(25, Math.min(98, score));
}

// Vimshottari Sequence & Years for Pratyantardasha calculation
const VIMSHOTTARI_CYCLE = [
  { key: 'ketu', ne: 'केतु', en: 'Ketu', years: 7 },
  { key: 'venus', ne: 'शुक्र', en: 'Venus', years: 20 },
  { key: 'sun', ne: 'सूर्य', en: 'Sun', years: 6 },
  { key: 'moon', ne: 'चन्द्रमा', en: 'Moon', years: 10 },
  { key: 'mars', ne: 'मंगल', en: 'Mars', years: 7 },
  { key: 'rahu', ne: 'राहु', en: 'Rahu', years: 18 },
  { key: 'jupiter', ne: 'बृहस्पति', en: 'Jupiter', years: 16 },
  { key: 'saturn', ne: 'शनि', en: 'Saturn', years: 19 },
  { key: 'mercury', ne: 'बुध', en: 'Mercury', years: 17 }
];

// Determine active dasha, antardasha, and pratyantardasha for a target year
export function getActiveDashaForYear(
  dashaHierarchy: DashaPeriod[],
  birthDateStr: string,
  targetYearAD: number
): {
  maha: DashaPeriod;
  antar: DashaPeriod;
  pratyantar: DashaPeriod;
  periodSummaryNe: string;
  periodSummaryEn: string;
} {
  // Target date midpoint of the chosen calendar year
  const targetDateStr = `${targetYearAD}-07-01`;
  const targetTime = new Date(targetDateStr).getTime();

  let activeMaha: DashaPeriod | undefined;
  for (const maha of dashaHierarchy) {
    const sTime = new Date(maha.startDate.replace(/\//g, '-')).getTime();
    const eTime = new Date(maha.endDate.replace(/\//g, '-')).getTime();
    if (targetTime >= sTime && targetTime <= eTime) {
      activeMaha = maha;
      break;
    }
  }

  if (!activeMaha) {
    activeMaha = dashaHierarchy[0] || {
      id: 'sun_1',
      planetKey: 'sun',
      planetNe: 'सूर्य',
      planetEn: 'Sun',
      startDate: `${targetYearAD}-01-01`,
      endDate: `${targetYearAD + 6}-01-01`,
      durationYears: 6,
      isActive: true
    };
  }

  let activeAntar: DashaPeriod | undefined;
  if (activeMaha.antardashas && activeMaha.antardashas.length > 0) {
    for (const antar of activeMaha.antardashas) {
      const sTime = new Date(antar.startDate.replace(/\//g, '-')).getTime();
      const eTime = new Date(antar.endDate.replace(/\//g, '-')).getTime();
      if (targetTime >= sTime && targetTime <= eTime) {
        activeAntar = antar;
        break;
      }
    }
    if (!activeAntar) {
      activeAntar = activeMaha.antardashas[0];
    }
  }

  if (!activeAntar) {
    activeAntar = {
      id: `${activeMaha.planetKey}_antar`,
      planetKey: activeMaha.planetKey,
      planetNe: activeMaha.planetNe,
      planetEn: activeMaha.planetEn,
      startDate: activeMaha.startDate,
      endDate: activeMaha.endDate,
      durationYears: 1,
      isActive: true
    };
  }

  // Exact Mathematical Vimshottari Pratyantardasha (प्रत्यन्तर दशा) breakdown
  let activePratyantar: DashaPeriod | undefined;
  try {
    const antarStartTime = new Date(activeAntar.startDate.replace(/\//g, '-')).getTime();
    const antarEndTime = new Date(activeAntar.endDate.replace(/\//g, '-')).getTime();
    const antarDurationMs = Math.max(1000 * 3600 * 24 * 30, antarEndTime - antarStartTime);

    // Find starting planet index for pratyantardasha (starts with the antardasha lord)
    let startIdx = VIMSHOTTARI_CYCLE.findIndex(
      (p) => p.key.toLowerCase() === activeAntar?.planetKey.toLowerCase()
    );
    if (startIdx === -1) startIdx = 0;

    let currentPratTime = antarStartTime;
    for (let i = 0; i < 9; i++) {
      const pInfo = VIMSHOTTARI_CYCLE[(startIdx + i) % 9];
      const fraction = pInfo.years / 120.0;
      const pratDurMs = antarDurationMs * fraction;
      const pratStartTime = currentPratTime;
      const pratEndTime = currentPratTime + pratDurMs;

      if (targetTime >= pratStartTime && targetTime <= pratEndTime) {
        activePratyantar = {
          id: `${activeAntar.planetKey}_${pInfo.key}_prat`,
          planetKey: pInfo.key,
          planetNe: pInfo.ne,
          planetEn: pInfo.en,
          startDate: new Date(pratStartTime).toISOString().split('T')[0].replace(/-/g, '/'),
          endDate: new Date(pratEndTime).toISOString().split('T')[0].replace(/-/g, '/'),
          durationYears: fraction * (activeAntar.durationYears || 1),
          isActive: true
        };
        break;
      }
      currentPratTime = pratEndTime;
    }
  } catch (_e) {
    // fallback safe
  }

  if (!activePratyantar) {
    activePratyantar = {
      id: `${activeAntar.planetKey}_prat`,
      planetKey: activeAntar.planetKey,
      planetNe: activeAntar.planetNe,
      planetEn: activeAntar.planetEn,
      startDate: activeAntar.startDate,
      endDate: activeAntar.endDate,
      durationYears: 0.2,
      isActive: true
    };
  }

  const periodSummaryNe = `${activeMaha.planetNe} महादशा अन्तर्गत ${activeAntar.planetNe} अन्तर्दशा र ${activePratyantar.planetNe} प्रत्यन्तर दशा`;
  const periodSummaryEn = `${activeMaha.planetEn} Mahadasha with ${activeAntar.planetEn} Antardasha & ${activePratyantar.planetEn} Pratyantardasha`;

  return {
    maha: activeMaha,
    antar: activeAntar,
    pratyantar: activePratyantar,
    periodSummaryNe,
    periodSummaryEn
  };
}

// 12 BHAVAS TEMPLATE
const BHAVAS_INFO = [
  {
    houseNum: 1,
    titleNe: 'प्रथम भाव (लग्न)',
    titleEn: '1st House (Lagna / Ascendant)',
    coreThemesNe: 'व्यक्तित्व, शरीर, स्वास्थ्य, स्वभाव, जीवनको समग्र दिशा, आत्मसम्मान, दीर्घायु',
    coreThemesEn: 'Personality, Physical Body, Health, Vitality, Temperament, Life Direction',
    keyAspectsNe: ['शारीरिक उर्जा र आरोग्यता', 'आत्मविश्वास र सामाजिक छवि', 'व्यक्तिगत निर्णय क्षमता'],
    keyAspectsEn: ['Physical energy & vitality', 'Self-confidence and reputation', 'Personal decision making']
  },
  {
    houseNum: 2,
    titleNe: 'द्वितीय भाव (धन स्थान)',
    titleEn: '2nd House (Dhana / Wealth & Family)',
    coreThemesNe: 'धन, परिवार, बोली, खानपान, बचत, सम्पत्ति, बहुमूल्य धातु, पारिवारिक सम्बन्ध',
    coreThemesEn: 'Wealth, Liquid Cash, Family Harmony, Speech, Food, Savings, Accumulated Assets',
    keyAspectsNe: ['स्थिर बचत र बैंक ब्यालेन्स', 'पारिवारिक सुख र एकता', 'बोली र सञ्चार प्रभाव'],
    keyAspectsEn: ['Savings & liquid bank balance', 'Family harmony and peace', 'Speech charisma & diet']
  },
  {
    houseNum: 3,
    titleNe: 'तृतीय भाव (पराक्रम स्थान)',
    titleEn: '3rd House (Sahasa / Courage & Siblings)',
    coreThemesNe: 'साहस, पराक्रम, भाइबहिनी, सञ्चार, लेखन, छोटो यात्रा, मिडिया, सहकर्मी',
    coreThemesEn: 'Courage, Valor, Younger Siblings, Communication, Writing, Short Travels, Media',
    keyAspectsNe: ['नयाँ कार्य थाल्ने साहस र आँट', 'भाइबहिनी र मित्रहरूको सहयोग', 'छोटो व्यावसायिक यात्रा'],
    keyAspectsEn: ['Initiative and bold decisions', 'Support from siblings/colleagues', 'Short distance fruitful travels']
  },
  {
    houseNum: 4,
    titleNe: 'चतुर्थ भाव (सुख स्थान)',
    titleEn: '4th House (Sukha / Mother & Real Estate)',
    coreThemesNe: 'आमा, घर, जग्गा–जमिन, वाहन, सुख–शान्ति, मातृभूमि, घरको वातावरण, मानसिक सुख',
    coreThemesEn: 'Mother, Home, Land, Real Estate, Vehicles, Inner Peace, Homeland, Domestic Comfort',
    keyAspectsNe: ['घर–जग्गा खरिद वा निर्माण', 'सवारी साधन (गाडी/बाइक) लाभ', 'आमाको स्वास्थ्य र सुख'],
    keyAspectsEn: ['Land, house buying or renovation', 'Vehicle purchase or upgrades', 'Mother’s well-being and domestic joy']
  },
  {
    houseNum: 5,
    titleNe: 'पञ्चम भाव (सुत / विद्या स्थान)',
    titleEn: '5th House (Vidya & Santana / Wisdom & Progeny)',
    coreThemesNe: 'शिक्षा, बुद्धि, प्रेम, सन्तान, सिर्जनशीलता, पूर्वपुण्य, शेयर बजार, मन्त्र–साधना',
    coreThemesEn: 'Education, Intellect, Romance/Love, Children, Creativity, Past Merits, Speculation',
    keyAspectsNe: ['परीक्षा, प्रतिस्पर्धा र उच्च शिक्षा', 'प्रेम सम्बन्धमा प्रगाढता', 'सन्तान सुख र बौद्धिक लाभ'],
    keyAspectsEn: ['Academic excellence & exam success', 'Romantic connection & joy', 'Children happiness & creative insights']
  },
  {
    houseNum: 6,
    titleNe: 'षष्ठ भाव (रिपु / शत्रु स्थान)',
    titleEn: '6th House (Ripu / Debts, Health & Competition)',
    coreThemesNe: 'रोग, ऋण, शत्रु, प्रतिस्पर्धा, सेवा, दैनिक काम, कानुनी झमेला, विजय',
    coreThemesEn: 'Health Issues, Debts/Loans, Enemies, Competition, Daily Service, Legal Matters',
    keyAspectsNe: ['प्रतिस्पर्धीमाथि विजय र सफलता', 'ऋण भुक्तानी तथा व्यवस्थापन', 'स्वास्थ्य सतर्कता र दैनिक दिनचर्या'],
    keyAspectsEn: ['Victory over competitors', 'Debt repayment and clearance', 'Health management and routine']
  },
  {
    houseNum: 7,
    titleNe: 'सप्तम भाव (जाया / साझेदारी स्थान)',
    titleEn: '7th House (Jaya / Marriage & Partnership)',
    coreThemesNe: 'विवाह, जीवनसाथी, प्रेम सम्बन्ध, साझेदारी, व्यापारिक पार्टनरसिप, जनसम्पर्क',
    coreThemesEn: 'Marriage, Spouse, Romantic Union, Business Partnerships, Public Relations',
    keyAspectsNe: ['वैवाहिक जीवनमा सामञ्जस्य', 'व्यापारिक साझेदारी र नयाँ सम्झौता', 'जीवनसाथीको प्रगति र सहयोग'],
    keyAspectsEn: ['Marital bliss and harmony', 'Business contracts and partnerships', 'Spouse support and elevation']
  },
  {
    houseNum: 8,
    titleNe: 'अष्टम भाव (आयु / परिवर्तन स्थान)',
    titleEn: '8th House (Ayur / Longevity & Transformation)',
    coreThemesNe: 'आयु, अचानक परिवर्तन, गोप्य कुरा, उत्तराधिकार, दुर्घटना, अनुसन्धान, गुप्त ज्ञान',
    coreThemesEn: 'Longevity, Sudden Transitions, Occult Knowledge, Inheritance, Research, Hidden Assets',
    keyAspectsNe: ['अचानक आर्थिक लाभ वा पैतृक धन', 'आन्तरिक रूपान्तरण र अनुसन्धान', 'दुर्घटनाबाट सतर्कता र सुरक्षा'],
    keyAspectsEn: ['Unexpected financial gains or inheritance', 'Deep research & transformation', 'Safety and precautionary measures']
  },
  {
    houseNum: 9,
    titleNe: 'नवम भाव (भाग्य / धर्म स्थान)',
    titleEn: '9th House (Bhagya & Dharma / Fortune & Guru)',
    coreThemesNe: 'भाग्य, धर्म, गुरु, उच्च शिक्षा, लामो यात्रा, पिता, सत्कर्म, तीर्थाटन',
    coreThemesEn: 'Fortune, Dharma, Spiritual Preceptor, Higher Learning, Long Travels, Father, Pilgrimage',
    keyAspectsNe: ['भाग्यको पूर्ण साथ र अड्किएका काम बन्ने', 'धार्मिक अनुष्ठान र तीर्थयात्रा', 'गुरु र पिताको मार्गदर्शन'],
    keyAspectsEn: ['Divine luck & breakthrough opportunities', 'Spiritual pilgrimage & blessings', 'Father’s support & wisdom']
  },
  {
    houseNum: 10,
    titleNe: 'दशम भाव (कर्म / राज्य स्थान)',
    titleEn: '10th House (Karma / Career & Status)',
    coreThemesNe: 'कर्म, करियर, जागिर, व्यवसाय, पद–प्रतिष्ठा, सफलता, सरकार, सामाजिक पहिचान',
    coreThemesEn: 'Career, Profession, Job Promotion, Business Leadership, Fame, Government Recognition',
    keyAspectsNe: ['कार्यक्षेत्रमा पदोन्नति र नयाँ जिम्मेवारी', 'व्यावसायिक प्रतिष्ठा र सम्मान', 'सरकारी वा संस्थागत सफलता'],
    keyAspectsEn: ['Promotion, honors and job growth', 'Business prestige and authority', 'Government & institutional favor']
  },
  {
    houseNum: 11,
    titleNe: 'एकादश भाव (आय / लाभ स्थान)',
    titleEn: '11th House (Labha / Income & Network)',
    coreThemesNe: 'आम्दानी, लाभ, इच्छा पूर्ति, मित्र, नेटवर्क, ठूला उपलब्धि, जेष्ठ दाजुभाइ',
    coreThemesEn: 'Income, Gains, Fulfillment of Desires, Large Networks, High Achievements, Elder Siblings',
    keyAspectsNe: ['आम्दानीका बहुआयामिक स्रोत', 'महत्त्वपूर्ण इच्छा र लक्ष्य पूर्ति', 'प्रभावशाली मित्र तथा नेटवर्क लाभ'],
    keyAspectsEn: ['Multiple stable income streams', 'Achievement of long cherished goals', 'Beneficial professional network']
  },
  {
    houseNum: 12,
    titleNe: 'द्वादश भाव (व्यय / विदेश स्थान)',
    titleEn: '12th House (Vyaya / Foreign & Expenses)',
    coreThemesNe: 'खर्च, विदेश, एकान्त, निद्रा, त्याग, अस्पताल/बन्द स्थान, मोक्ष, वैदेशिक बसाइ',
    coreThemesEn: 'Expenses, Foreign Lands, Isolation, Sleep/Bed Pleasures, Renunciation, Global Migration',
    keyAspectsNe: ['वैदेशिक भिसा, यात्रा वा स्थायी बसोबास (PR)', 'शुभ तथा परोपकारी कार्यमा खर्च', 'आध्यात्मिक शान्ति र ध्यान'],
    keyAspectsEn: ['Foreign visa, overseas settlement & PR', 'Expenses on auspicious ventures', 'Spiritual peace & liberation']
  }
];

// Calculation of Comprehensive Yearly Predictions
export function generateYearlyPrediction(
  kundali: KundaliResult,
  targetYearAD: number
): YearlyPredictionResult {
  const birthDate = kundali.birthDate || '2000-01-01';
  const birthYear = parseInt(birthDate.split('-')[0] || '2000', 10);
  const targetYearBS = adYearToBsYear(targetYearAD);
  const ageYears = Math.max(0, targetYearAD - birthYear);

  const planets = kundali.planetPositions || kundali.planets || [];
  const houses = kundali.houseDetails || [];
  const dashaHierarchy = kundali.dashaHierarchy || [];

  // Active Dasha for this target year
  const activeDasha = getActiveDashaForYear(dashaHierarchy, birthDate, targetYearAD);
  const dashaLordPlanet = planets.find((p) => p.id === activeDasha.maha.planetKey) || planets[0];
  const antarLordPlanet = planets.find((p) => p.id === activeDasha.antar.planetKey) || planets[0];
  const pratyantarLordPlanet = planets.find((p) => p.id === activeDasha.pratyantar.planetKey) || planets[0];

  const dashaScore = getPlanetScore(dashaLordPlanet);
  const antarScore = getPlanetScore(antarLordPlanet);
  const pratyantarScore = getPlanetScore(pratyantarLordPlanet);

  const combinedDashaScore = Math.round((dashaScore * 0.5) + (antarScore * 0.35) + (pratyantarScore * 0.15));

  // Overall Score & Rating
  const overallScore = Math.max(30, Math.min(96, combinedDashaScore));
  let overallRatingNe = 'सन्तुलित एवं शुभ';
  let overallRatingEn = 'Balanced & Auspicious';
  if (overallScore >= 80) {
    overallRatingNe = 'अत्यन्त शुभ एवं फलदायी';
    overallRatingEn = 'Highly Auspicious & Progressive';
  } else if (overallScore >= 65) {
    overallRatingNe = 'उत्तम एवं प्रगतिशील';
    overallRatingEn = 'Favorable & Growth Oriented';
  } else if (overallScore < 50) {
    overallRatingNe = 'सावधानी एवं धैर्य आवश्यक';
    overallRatingEn = 'Requires Caution & Patience';
  }

  // Key planets
  const jupiter = planets.find((p) => p.id === 'jupiter') || planets[0];
  const saturn = planets.find((p) => p.id === 'saturn') || planets[0];
  const venus = planets.find((p) => p.id === 'venus') || planets[0];
  const mercury = planets.find((p) => p.id === 'mercury') || planets[0];
  const mars = planets.find((p) => p.id === 'mars') || planets[0];
  const sun = planets.find((p) => p.id === 'sun') || planets[0];
  const moon = planets.find((p) => p.id === 'moon') || planets[0];
  const rahu = planets.find((p) => p.id === 'rahu') || planets[0];
  const ketu = planets.find((p) => p.id === 'ketu') || planets[0];
  const lagna = planets.find((p) => p.id === 'lagna') || planets[0];

  // Specific 12th & 9th House evaluation for Foreign Country Analysis
  const h12 = houses[11] || { signNe: 'मीन', signEn: 'Pisces', signLordNe: 'बृहस्पति', signLordEn: 'Jupiter' };
  const h9 = houses[8] || { signNe: 'धनु', signEn: 'Sagittarius', signLordNe: 'बृहस्पति', signLordEn: 'Jupiter' };
  const h4 = houses[3] || { signNe: 'कर्कट', signEn: 'Cancer', signLordNe: 'चन्द्रमा', signLordEn: 'Moon' };
  const h7 = houses[6] || { signNe: 'तुला', signEn: 'Libra', signLordNe: 'शुक्र', signLordEn: 'Venus' };
  const h10 = houses[9] || { signNe: 'मकर', signEn: 'Capricorn', signLordNe: 'शनि', signLordEn: 'Saturn' };
  const h2 = houses[1] || { signNe: 'वृष', signEn: 'Taurus', signLordNe: 'शुक्र', signLordEn: 'Venus' };
  const h5 = houses[4] || { signNe: 'सिंह', signEn: 'Leo', signLordNe: 'सूर्य', signLordEn: 'Sun' };
  const h6 = houses[5] || { signNe: 'कन्या', signEn: 'Virgo', signLordNe: 'बुध', signLordEn: 'Mercury' };
  const h11 = houses[10] || { signNe: 'कुम्भ', signEn: 'Aquarius', signLordNe: 'शनि', signLordEn: 'Saturn' };

  // =========================================================================
  // 1. INDIVIDUALIZED FOREIGN DESTINATION RECOMMENDATION ALGORITHM
  // Evaluates real world destinations strictly based on 12th, 9th, 10th, 7th, 4th,
  // 2nd & 11th houses, planetary lords, Rahu/Moon, active Dasha, and unique chart dynamics.
  // Maximum 4 countries returned (typically 1 to 3). No generic bundles or regions.
  // =========================================================================
  const waterySigns = ['कर्कट', 'वृश्चिक', 'मीन', 'Cancer', 'Scorpio', 'Pisces'];
  const airySigns = ['मिथुन', 'तुला', 'कुम्भ', 'Gemini', 'Libra', 'Aquarius'];
  const earthySigns = ['वृष', 'कन्या', 'मकर', 'Taurus', 'Virgo', 'Capricorn'];
  const fierySigns = ['मेष', 'सिंह', 'धनु', 'Aries', 'Leo', 'Sagittarius'];
  const movableSigns = ['मेष', 'कर्कट', 'तुला', 'मकर', 'Aries', 'Cancer', 'Libra', 'Capricorn'];

  const is12Water = waterySigns.includes(h12.signNe);
  const is12Air = airySigns.includes(h12.signNe);
  const is12Earth = earthySigns.includes(h12.signNe);
  const is12Fire = fierySigns.includes(h12.signNe);

  const is9Water = waterySigns.includes(h9.signNe);
  const is9Air = airySigns.includes(h9.signNe);
  const is9Earth = earthySigns.includes(h9.signNe);
  const is9Fire = fierySigns.includes(h9.signNe);

  const is10Water = waterySigns.includes(h10.signNe);
  const is10Air = airySigns.includes(h10.signNe);
  const is10Earth = earthySigns.includes(h10.signNe);
  const is10Fire = fierySigns.includes(h10.signNe);

  const is4Movable = movableSigns.includes(h4.signNe);
  const is11Earth = earthySigns.includes(h11.signNe);
  const is2Earth = earthySigns.includes(h2.signNe);

  const rahuFavorable = [3, 6, 9, 10, 11, 12].includes(rahu.houseNum);
  const moonFavorable = [1, 4, 7, 9, 11, 12].includes(moon.houseNum);
  const jupiterStrong = jupiter.dignity === 'उच्च' || jupiter.dignity === 'स्वगृही' || [1, 5, 9, 11].includes(jupiter.houseNum);
  const saturnStrong = saturn.dignity === 'उच्च' || saturn.dignity === 'स्वगृही' || [6, 10, 11].includes(saturn.houseNum);
  const marsStrong = mars.dignity === 'उच्च' || mars.dignity === 'स्वगृही' || [3, 6, 10, 11].includes(mars.houseNum);
  const venusStrong = venus.dignity === 'उच्च' || venus.dignity === 'स्वगृही' || [2, 4, 7, 12].includes(venus.houseNum);
  const mercuryStrong = mercury.dignity === 'उच्च' || mercury.dignity === 'स्वगृही' || [1, 5, 10, 11].includes(mercury.houseNum);
  const sunStrong = sun.dignity === 'उच्च' || sun.dignity === 'स्वगृही' || [1, 9, 10, 11].includes(sun.houseNum);

  // Active Dasha resonance check
  const activeMaha = activeDasha.maha.planetNe;
  const activeAntar = activeDasha.antar.planetNe;
  const isDasha = (pName: string) => activeMaha.includes(pName) || activeAntar.includes(pName);

  // Granular chart seed to guarantee individual ranking uniqueness per birth details
  const chartSeed = (kundali.rashi.charCodeAt(0) * 13 + kundali.lagna.charCodeAt(0) * 19 + (targetYearAD % 17) + (rahu.houseNum * 7) + (moon.houseNum * 5)) % 11;

  interface DestinationCandidate {
    countryNe: string;
    countryEn: string;
    regionNe: string;
    regionEn: string;
    directionNe: string;
    directionEn: string;
    favorablePurposeNe: string;
    favorablePurposeEn: string;
    favorableMonthsNe: string;
    favorableMonthsEn: string;
    planetaryReasonNe: string;
    planetaryReasonEn: string;
    remedyNe: string;
    remedyEn: string;
    rawScore: number;
  }

  const allDestinations: DestinationCandidate[] = [
    // 1. UAE
    {
      countryNe: 'संयुक्त अरब इमिरेट्स (UAE)',
      countryEn: 'UAE (United Arab Emirates)',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'व्यापार, रियल स्टेट, हस्पिटालिटी, फाइनान्स, करमुक्त उच्च आम्दानी र गोल्डेन भिसा',
      favorablePurposeEn: 'Business, Real Estate, Luxury Hospitality, Finance, Tax-Free High Income & Golden Visa',
      favorableMonthsNe: 'कार्तिक, मङ्सिर, माघ र चैत्र (Oct-Dec, Jan-Apr)',
      favorableMonthsEn: 'Oct-Dec, Jan-Apr',
      planetaryReasonNe: `२ औँ (धन), ११ औँ (लाभ) र शुक्रको बलियो प्रभावका कारण UAE (दुबई/आबुधाबी) मा करमुक्त उच्च आम्दानी, व्यापार विस्तार र द्रुत सम्पत्ति जोड्न कुण्डली सर्वाधिक अनुकूल छ।`,
      planetaryReasonEn: `Strong 2nd and 11th wealth houses with Venus favor rapid tax-free income and high career growth in the UAE.`,
      remedyNe: 'शुक्रबार माँ महालक्ष्मीको पूजा गर्ने, सेतो वस्त्र लगाउने र सुगन्ध प्रयोग गर्ने।',
      remedyEn: 'Worship Goddess Lakshmi on Fridays and use pleasant fragrance.',
      rawScore: 68 + (is12Fire || is10Earth || is12Air ? 15 : 6) + (venusStrong || mercuryStrong ? 9 : 3) + (isDasha('शुक्र') || isDasha('बुध') || isDasha('राहु') ? 9 : 2) + ((chartSeed + 1) % 5)
    },
    // 2. QATAR
    {
      countryNe: 'कतार (Qatar)',
      countryEn: 'Qatar',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'इन्जिनियरिङ, प्रोजेक्ट म्यानेजमेन्ट, एभिएसन, हस्पिटालिटी, करमुक्त उच्च बचत',
      favorablePurposeEn: 'Engineering, Project Management, Aviation, Hospitality & High Tax-Free Savings',
      favorableMonthsNe: 'असोज, कार्तिक, मङ्सिर र माघ (Sep-Dec, Jan-Feb)',
      favorableMonthsEn: 'Sep-Dec, Jan-Feb',
      planetaryReasonNe: `सूर्य, मंगल र शनिको स्थिति अनुसार कतारका विशाल पूर्वाधार, इन्जिनियरिङ वा व्यवस्थापन क्षेत्रमा छोटो समयमै ठूलो नगद बचत गर्ने उत्तम अवसर मिल्नेछ।`,
      planetaryReasonEn: `Solar-Saturn alignments create strong financial saving prospects in engineering and aviation in Qatar.`,
      remedyNe: 'आइतबार सूर्य गायत्री मन्त्र जप गर्ने र रातो चन्दनको तिलक लगाउने।',
      remedyEn: 'Chant Surya Gayatri mantra on Sundays.',
      rawScore: 66 + (is12Fire || is10Fire ? 15 : 6) + (sunStrong || marsStrong ? 9 : 3) + (isDasha('सूर्य') || isDasha('मंगल') ? 8 : 2) + ((chartSeed + 2) % 5)
    },
    // 3. SAUDI ARABIA
    {
      countryNe: 'साउदी अरेबिया (Saudi Arabia)',
      countryEn: 'Saudi Arabia',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'मेगा प्रोजेक्ट्स, निर्माण तथा सिभिल इन्जिनियरिङ, स्वास्थ्य सेवा, प्राविधिक सम्झौता',
      favorablePurposeEn: 'Mega Infrastructure Projects, Civil Engineering, Healthcare & Corporate Contracts',
      favorableMonthsNe: 'कार्तिक, पुस, माघ र चैत्र (Oct, Dec-Jan, Mar-Apr)',
      favorableMonthsEn: 'Oct, Dec-Jan, Mar-Apr',
      planetaryReasonNe: `१० औँ भावमा मंगल वा शनिको पराक्रमी स्थितिले साउदी अरेबियाका विशाल विकास योजनाहरूमा प्राविधिक, मेडिकल वा व्यवस्थापकीय काममा ठूलो पारिश्रमिक र बचत दिलाउँछ।`,
      planetaryReasonEn: `10th house strength with Mars and Saturn enables high-paying engineering and executive contracts in Saudi Arabia.`,
      remedyNe: 'मंगलबार हनुमान जीको दर्शन गर्ने र शनिवार गरिबलाई भोजन गराउने।',
      remedyEn: 'Worship Lord Hanuman on Tuesdays and feed the needy on Saturdays.',
      rawScore: 65 + (is12Fire || is10Earth ? 14 : 6) + (marsStrong || saturnStrong ? 8 : 2) + (isDasha('मंगल') || isDasha('शनि') ? 8 : 2) + ((chartSeed + 3) % 5)
    },
    // 4. KUWAIT
    {
      countryNe: 'कुवेत (Kuwait)',
      countryEn: 'Kuwait',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'उच्च मुद्रा विनिमय दर (Highest KWD), वित्तीय क्षेत्र, तेल/ग्यास, कर्पोरेट रोजगारी',
      favorablePurposeEn: 'High Purchasing Power (KWD), Finance, Oil & Gas, Corporate Employment',
      favorableMonthsNe: 'असोज, मङ्सिर, माघ र फागुन (Sep, Nov-Dec, Jan-Mar)',
      favorableMonthsEn: 'Sep, Nov-Dec, Jan-Mar',
      planetaryReasonNe: `कुवेतको उच्च मुद्रा विनिमय दरका कारण २ औँ र ११ औँ भावको शुभ प्रभावले थोरै समयमै ऋण तिर्न र सम्पत्ति जोड्न प्रचुर धन आर्जन हुनेछ।`,
      planetaryReasonEn: `High currency valuation of Kuwaiti Dinar ensures swift family debt clearance and rapid asset growth.`,
      remedyNe: 'बिहीबार विष्णु मन्त्र ॐ नमो भगवते वासुदेवाय जप गर्ने।',
      remedyEn: 'Chant Om Namo Bhagavate Vasudevaya on Thursdays.',
      rawScore: 65 + (is12Fire || is11Earth ? 14 : 5) + (jupiterStrong || sunStrong ? 8 : 2) + (isDasha('गुरु') || isDasha('सूर्य') ? 8 : 2) + ((chartSeed + 4) % 5)
    },
    // 5. OMAN
    {
      countryNe: 'ओमान (Oman)',
      countryEn: 'Oman',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'शान्त एवं सुरक्षित रोजगारी, व्यावसायिक व्यापार, निर्माण सुपरभिजन, हस्पिटालिटी',
      favorablePurposeEn: 'Peaceful & Secure Employment, Trading Business, Construction Supervision',
      favorableMonthsNe: 'कार्तिक, मङ्सिर, माघ र फागुन (Oct-Dec, Jan-Mar)',
      favorableMonthsEn: 'Oct-Dec, Jan-Mar',
      planetaryReasonNe: `गुरु र चन्द्रमाको शान्त योगले ओमानमा सुरक्षित कार्य वातावरण, स्थिर पारिश्रमिक र पारिवारिक सन्तुष्टि दिलाउँछ।`,
      planetaryReasonEn: `Jupiter-Moon serenity combination ensures safe work conditions and stable income in Oman.`,
      remedyNe: 'बिहीबार पहेँलो वस्तु दान गर्ने र कुलदेवताको पूजा गर्ने।',
      remedyEn: 'Donate yellow items on Thursdays and pray to Kuladevata.',
      rawScore: 64 + (is12Water || is11Earth ? 13 : 5) + (jupiterStrong ? 7 : 2) + (isDasha('गुरु') || isDasha('चन्द्र') ? 8 : 2) + ((chartSeed + 5) % 5)
    },
    // 6. BAHRAIN
    {
      countryNe: 'बहराइन (Bahrain)',
      countryEn: 'Bahrain',
      regionNe: 'खाडी क्षेत्र (Gulf)',
      regionEn: 'Gulf',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'बैंकिङ, वित्तीय सेवा, रिटेल म्यानेजमेन्ट, आतिथ्य, करमुक्त बचत',
      favorablePurposeEn: 'Banking, Financial Services, Retail Management, Hospitality & Savings',
      favorableMonthsNe: 'असोज, कार्तिक, मङ्सिर र माघ (Sep-Dec, Jan-Feb)',
      favorableMonthsEn: 'Sep-Dec, Jan-Feb',
      planetaryReasonNe: `बुध र शुक्रको व्यापारिक अनुकूलताले बहराइनमा बैंकिङ, सेवा तथा कर्पोरेट क्षेत्रमा सुखद् प्रगति गराउँछ।`,
      planetaryReasonEn: `Mercury-Venus alignment favors banking and commercial services career in Bahrain.`,
      remedyNe: 'बुधबार गणेश जीको पूजा गर्ने र हरियो मूंग दान गर्ने।',
      remedyEn: 'Worship Lord Ganesha on Wednesdays.',
      rawScore: 64 + (is12Air || is10Earth ? 13 : 5) + (mercuryStrong || venusStrong ? 8 : 2) + (isDasha('बुध') || isDasha('शुक्र') ? 8 : 2) + ((chartSeed + 6) % 5)
    },
    // 7. USA
    {
      countryNe: 'संयुक्त राज्य अमेरिका (USA)',
      countryEn: 'USA (United States)',
      regionNe: 'उत्तर अमेरिका (North America)',
      regionEn: 'North America',
      directionNe: 'पश्चिम तथा उत्तर–पश्चिम (West / North-West)',
      directionEn: 'West / North-West',
      favorablePurposeNe: 'उच्च शिक्षा (Masters/PhD), आईटी, सफ्टवेयर अनुसन्धान, प्राविधिक रोजगारी, ग्रीनकार्ड (PR)',
      favorablePurposeEn: 'Higher Education (Masters/PhD), IT, Tech Career & Green Card (PR)',
      favorableMonthsNe: 'भाद्र, आश्विन, माघ र चैत्र (Aug-Oct, Jan-Apr)',
      favorableMonthsEn: 'Aug-Oct, Jan-Apr',
      planetaryReasonNe: `१२ औँ भाव (${h12.signNe}), ९ औँ भाव (${h9.signNe}) र राहुको प्रभावले अमेरिकाका प्रविधि केन्द्रहरूमा उच्च अध्ययन, सफ्टवेयर/इन्जिनियरिङ करियर र स्थायी बसोबासको बलियो योग छ।`,
      planetaryReasonEn: `Strong synergy of 12th house (${h12.signEn}) and Rahu aligns with advanced research, IT innovation, and Green Card settlement in the USA.`,
      remedyNe: 'शनिबार पिपलको बोटमा जल चढाउने र राहु मन्त्र ॐ रां राहवे नमः जप गर्ने।',
      remedyEn: 'Offer water to Peepal tree on Saturdays and chant Rahu Beej mantra.',
      rawScore: 68 + (is12Air || is12Water ? 16 : 6) + (rahuFavorable ? 9 : 0) + (isDasha('राहु') || isDasha('बुध') || isDasha('गुरु') ? 8 : 2) + ((chartSeed + 1) % 4)
    },
    // 8. CANADA
    {
      countryNe: 'क्यानडा (Canada)',
      countryEn: 'Canada',
      regionNe: 'उत्तर अमेरिका (North America)',
      regionEn: 'North America',
      directionNe: 'उत्तर तथा वायव्य (North / North-West)',
      directionEn: 'North / North-West',
      favorablePurposeNe: 'स्थायी बसोबास (Express Entry / PNP PR), विश्वविद्यालय अध्ययन, पारिवारिक बसोबास',
      favorablePurposeEn: 'Permanent Residency (Express Entry / PNP PR), University Studies & Family Settlement',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र फागुन (Apr-Jun, Sep-Oct, Feb-Mar)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Feb-Mar',
      planetaryReasonNe: `चन्द्रमा र गुरुको जलराशीय अनुकूलताका कारण क्यानडा जस्तो शान्त, प्राकृतिक तथा पारिवारिक अनुकुल देशमा स्थायी बसोबास (PR) र घरजग्गा जोड्ने उत्तम योग छ।`,
      planetaryReasonEn: `Auspicious Lunar and Jupiterian energies favor peaceful family settlement, Express Entry PR, and property acquisition in Canada.`,
      remedyNe: 'सोमबार भगवान शिवलाई दुध-जल अर्पण गर्ने र चाँदीको औंठी वा बाला धारण गर्ने।',
      remedyEn: 'Offer milk and water to Lord Shiva on Mondays and wear silver.',
      rawScore: 70 + (is12Water || is4Movable ? 16 : 8) + (moonFavorable ? 8 : 2) + (isDasha('चन्द्र') || isDasha('गुरु') ? 8 : 2) + ((chartSeed + 2) % 4)
    },
    // 9. AUSTRALIA
    {
      countryNe: 'अष्ट्रेलिया (Australia)',
      countryEn: 'Australia',
      regionNe: 'ओशिनिया (Oceania)',
      regionEn: 'Oceania',
      directionNe: 'दक्षिण–पूर्व तथा दक्षिण (South-East / South)',
      directionEn: 'South-East / South',
      favorablePurposeNe: 'स्नातक तथा मास्टर्स अध्ययन, नर्सिङ/हेल्थकेयर, इन्जिनियरिङ, दक्ष जनशक्ति (Skilled PR)',
      favorablePurposeEn: 'Bachelor/Masters Studies, Nursing/Healthcare, Engineering & Skilled PR',
      favorableMonthsNe: 'असार, साउन, कार्तिक र माघ (Jun-Aug, Oct-Nov, Jan-Feb)',
      favorableMonthsEn: 'Jun-Aug, Oct-Nov, Jan-Feb',
      planetaryReasonNe: `९ औँ भाव (भाग्य) र गुरुको शुभ दृष्टिले सामुद्रिक टापु राष्ट्र अष्ट्रेलियामा स्वास्थ्य, नर्सिङ, अध्ययन तथा दक्ष कामदारको रूपमा उच्च आम्दानी र पीआर दिलाउनेछ।`,
      planetaryReasonEn: `9th house of higher wisdom and Jupiterian benevolence facilitates nursing, engineering, and rapid skilled PR in Australia.`,
      remedyNe: 'बिहीबार पहेँलो फलफूल वा चनेको दाल दान गर्ने र ॐ बृं बृहस्पतये नमः जप गर्ने।',
      remedyEn: 'Donate yellow fruits on Thursdays and chant Jupiter Beej mantra.',
      rawScore: 69 + (is9Water || is9Fire ? 15 : 7) + (jupiterStrong ? 8 : 3) + (isDasha('गुरु') || isDasha('मंगल') ? 8 : 2) + ((chartSeed + 3) % 4)
    },
    // 10. NEW ZEALAND
    {
      countryNe: 'न्युजिल्याण्ड (New Zealand)',
      countryEn: 'New Zealand',
      regionNe: 'ओशिनिया (Oceania)',
      regionEn: 'Oceania',
      directionNe: 'दक्षिण–पूर्व (South-East)',
      directionEn: 'South-East',
      favorablePurposeNe: 'पर्यावरण/कृषि/भेटेरिनरी अध्ययन, आईटी, उच्च गुणस्तरीय शान्त जीवनशैली र पीआर',
      favorablePurposeEn: 'Environmental/Agricultural Studies, IT, Tranquil Lifestyle & PR',
      favorableMonthsNe: 'वैशाख, भाद्र, मङ्सिर र माघ (Apr-May, Aug-Sep, Nov-Feb)',
      favorableMonthsEn: 'Apr-May, Aug-Sep, Nov-Feb',
      planetaryReasonNe: `शुक्र र चन्द्रमाको जलतत्व प्रभावले गर्दा न्युजिल्याण्डको शान्त, स्वच्छ र उच्च जीवनस्तरयुक्त वातावरणमा अध्ययन तथा स्थायी बसोबास अति सुखमय रहनेछ।`,
      planetaryReasonEn: `Venus and Moon synergy supports harmonious academic life, environmental professions, and peaceful PR in New Zealand.`,
      remedyNe: 'शुक्रबार माँ लक्ष्मीलाई सेतो मिष्ठान्न अर्पण गर्ने र सेतो चन्दन प्रयोग गर्ने।',
      remedyEn: 'Offer white sweets to Goddess Lakshmi on Fridays.',
      rawScore: 66 + (is12Water || is12Earth ? 14 : 6) + (venusStrong ? 8 : 2) + (isDasha('शुक्र') || isDasha('चन्द्र') ? 8 : 2) + ((chartSeed + 4) % 4)
    },
    // 11. UK
    {
      countryNe: 'बेलायत / संयुक्त अधिराज्य (UK)',
      countryEn: 'United Kingdom (UK)',
      regionNe: 'पश्चिम युरोप (Western Europe)',
      regionEn: 'Western Europe',
      directionNe: 'उत्तर–पश्चिम (North-West)',
      directionEn: 'North-West',
      favorablePurposeNe: 'मास्टर्स अध्ययन, म्यानेजमेन्ट, फाइनान्स, कानून, स्किल्ड वर्कर भिसा (Skilled Worker)',
      favorablePurposeEn: 'Masters Education, Management, Finance, Legal & Skilled Worker Visa',
      favorableMonthsNe: 'जेठ, भाद्र, असोज र पुस (May-Jun, Aug-Sep, Dec-Jan)',
      favorableMonthsEn: 'May-Jun, Aug-Sep, Dec-Jan',
      planetaryReasonNe: `बुध र गुरुको बौद्धिक योगका कारण बेलायतका प्रतिष्ठित विश्वविद्यालयहरूमा व्यवस्थापन, वित्त र अनुसन्धान क्षेत्रमा उच्च प्रतिष्ठा र रोजगारी मिल्नेछ।`,
      planetaryReasonEn: `Mercury and Jupiter intellectual combination boosts success in finance, business analytics, and skilled work permits in the UK.`,
      remedyNe: 'बुधबार भगवान गणेशलाई २१ वटा दूबो चढाउने र ॐ गं गणपतये नमः जप गर्ने।',
      remedyEn: 'Offer Durva grass to Lord Ganesha on Wednesdays.',
      rawScore: 67 + (is12Air || is9Air ? 15 : 6) + (mercuryStrong ? 8 : 3) + (isDasha('बुध') || isDasha('गुरु') ? 8 : 2) + ((chartSeed + 5) % 4)
    },
    // 12. GERMANY
    {
      countryNe: 'जर्मनी (Germany)',
      countryEn: 'Germany',
      regionNe: 'मध्य युरोप (Central Europe)',
      regionEn: 'Central Europe',
      directionNe: 'उत्तर तथा उत्तर–पश्चिम (North / North-West)',
      directionEn: 'North / North-West',
      favorablePurposeNe: 'निःशुल्क/न्यून शुल्क उच्च शिक्षा, मेकानिकल/अटोमोबाइल/रोबोटिक्स इन्जिनियरिङ, EU Blue Card',
      favorablePurposeEn: 'Tuition-Free Studies, Mechanical/Robotics Engineering & EU Blue Card',
      favorableMonthsNe: 'वैशाख, असार, असोज र फागुन (Apr-May, Jun-Jul, Sep-Oct, Feb-Mar)',
      favorableMonthsEn: 'Apr-May, Jun-Jul, Sep-Oct, Feb-Mar',
      planetaryReasonNe: `१० औँ भावमा शनि, बुध वा मंगलको प्राविधिक प्रभावले जर्मनीमा इन्जिनियरिङ, आईटी, प्राविधिक अनुसन्धान र ईयू ब्लूकार्ड रोजगारीमा तीव्र सफलता दिलाउनेछ।`,
      planetaryReasonEn: `Strong technical placements of Saturn, Mercury, or Mars provide huge breakthroughs in German engineering and EU Blue Card residency.`,
      remedyNe: 'शनिबार तेलको दियो बाल्ने र प्राविधिक औजार सफा राख्ने।',
      remedyEn: 'Light a sesame oil lamp on Saturdays and keep tools clean.',
      rawScore: 68 + (is10Earth || is12Earth ? 16 : 7) + (saturnStrong || marsStrong ? 9 : 3) + (isDasha('शनि') || isDasha('बुध') ? 8 : 2) + ((chartSeed + 6) % 4)
    },
    // 13. NETHERLANDS
    {
      countryNe: 'नेदरल्याण्ड्स (Netherlands)',
      countryEn: 'Netherlands',
      regionNe: 'पश्चिम युरोप (Western Europe)',
      regionEn: 'Western Europe',
      directionNe: 'उत्तर–पश्चिम (North-West)',
      directionEn: 'North-West',
      favorablePurposeNe: 'अन्तर्राष्ट्रिय व्यापार, कृषि प्रविधि, आईटी अनुसन्धान, अंग्रेजी माध्यम अध्ययन, उच्च जीवनस्तर',
      favorablePurposeEn: 'International Trade, Agri-Tech, IT Innovation, English-Medium Studies',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र माघ (Apr-Jun, Sep-Oct, Jan-Feb)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Jan-Feb',
      planetaryReasonNe: `बुध र शुक्रको जल-वायु तत्व संयोजनले नेदरल्याण्ड्समा कृषि-प्रविधि, लजिस्टिक र अन्तर्राष्ट्रिय संस्थामा उच्च प्रतिष्ठा दिलाउँछ।`,
      planetaryReasonEn: `Mercury and Venus harmony aligns with high career elevation in tech, trade, and corporate sectors in the Netherlands.`,
      remedyNe: 'बुधबार हरियो वस्तु दान गर्ने र श्रीयन्त्रको पूजा गर्ने।',
      remedyEn: 'Donate green pulses on Wednesdays.',
      rawScore: 67 + (is12Air || is12Water ? 15 : 6) + (mercuryStrong && venusStrong ? 9 : 3) + (isDasha('बुध') || isDasha('शुक्र') ? 8 : 2) + (chartSeed % 4)
    },
    // 14. SWITZERLAND
    {
      countryNe: 'स्विट्जरल्याण्ड (Switzerland)',
      countryEn: 'Switzerland',
      regionNe: 'मध्य युरोप (Central Europe)',
      regionEn: 'Central Europe',
      directionNe: 'उत्तर–पश्चिम (North-West)',
      directionEn: 'North-West',
      favorablePurposeNe: 'लक्जरी हस्पिटालिटी म्यानेजमेन्ट, बैंकिङ/फाइनान्स, फार्मास्युटिकल अनुसन्धान र उच्च प्रतिष्ठा',
      favorablePurposeEn: 'Luxury Hospitality Management, Elite Banking/Finance, Pharma & Prestige',
      favorableMonthsNe: 'वैशाख, असोज, कार्तिक र माघ (Apr-May, Sep-Nov, Jan-Feb)',
      favorableMonthsEn: 'Apr-May, Sep-Nov, Jan-Feb',
      planetaryReasonNe: `शुक्र, गुरु र बुधको सम्भ्रान्त योगले स्विट्जरल्याण्डमा अन्तर्राष्ट्रिय वित्तीय संस्था वा विश्वस्तरीय होटल व्यवस्थापनमा प्रचुर लाभ र सम्मान दिलाउँछ।`,
      planetaryReasonEn: `Elite Venus-Jupiter trine fosters prestige in international finance and top-tier luxury hospitality in Switzerland.`,
      remedyNe: 'शुक्रबार माँ लक्ष्मीको श्रीयन्त्रमा जल छर्किने र कपूर बाल्ने।',
      remedyEn: 'Worship Shree Yantra with camphor on Fridays.',
      rawScore: 66 + (is12Water || is12Earth ? 14 : 6) + (venusStrong && jupiterStrong ? 9 : 3) + (isDasha('शुक्र') || isDasha('गुरु') ? 8 : 2) + ((chartSeed + 2) % 4)
    },
    // 15. NORWAY
    {
      countryNe: 'नर्वे (Norway)',
      countryEn: 'Norway',
      regionNe: 'उत्तरी युरोप (Northern Europe)',
      regionEn: 'Northern Europe',
      directionNe: 'उत्तर (North)',
      directionEn: 'North',
      favorablePurposeNe: 'उच्च वैज्ञानिक अनुसन्धान, ऊर्जा/वातावरण, समुद्री प्रविधि, विश्वकै शीर्ष जीवनस्तर',
      favorablePurposeEn: 'Scientific Research, Green Energy, Marine Tech & Highest Quality of Life',
      favorableMonthsNe: 'जेठ, असार, असोज र फागुन (May-Jul, Sep-Oct, Feb-Mar)',
      favorableMonthsEn: 'May-Jul, Sep-Oct, Feb-Mar',
      planetaryReasonNe: `गुरु र चन्द्रमाको हिमवत जलतत्व प्रभावले नर्वेमा नवीकरणीय ऊर्जा, अनुसन्धान र उच्चस्तरीय कल्याणकारी जीवन दिलाउँछ।`,
      planetaryReasonEn: `Jupiter-Moon watery polarity supports high research output and tranquil living in Norway.`,
      remedyNe: 'बिहीबार पहेँलो चामल वा फल दान गर्ने।',
      remedyEn: 'Donate yellow rice on Thursdays.',
      rawScore: 66 + (is12Water || is9Water ? 15 : 6) + (jupiterStrong ? 8 : 2) + (isDasha('गुरु') || isDasha('चन्द्र') ? 8 : 2) + ((chartSeed + 3) % 4)
    },
    // 16. SWEDEN
    {
      countryNe: 'स्विडेन (Sweden)',
      countryEn: 'Sweden',
      regionNe: 'उत्तरी युरोप (Northern Europe)',
      regionEn: 'Northern Europe',
      directionNe: 'उत्तर (North)',
      directionEn: 'North',
      favorablePurposeNe: 'इन्नोभेसन, सफ्टवेयर इन्जिनियरिङ, बायोटेक, दिगो विकास, वर्क-लाइफ ब्यालेन्स',
      favorablePurposeEn: 'Innovation, Software Engineering, Biotech, Sustainability & Work-Life Balance',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र माघ (Apr-Jun, Sep-Oct, Jan-Feb)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Jan-Feb',
      planetaryReasonNe: `बुध, शनि र केतुको शोधपरक दृष्टिले स्विडेनका बहुराष्ट्रिय प्राविधिक कम्पनीहरूमा दीर्घकालीन सुरक्षित भविष्य सुनिश्चित गर्दछ।`,
      planetaryReasonEn: `Mercury-Saturn tech focus facilitates employment in leading Swedish innovation hubs.`,
      remedyNe: 'बुधबार गणेश मन्त्र ॐ गं गणपतये नमः १०८ पटक जप गर्ने।',
      remedyEn: 'Chant Ganesha Beej mantra on Wednesdays.',
      rawScore: 66 + (is12Air || is10Earth ? 14 : 6) + (mercuryStrong || saturnStrong ? 8 : 2) + (isDasha('बुध') || isDasha('शनि') ? 8 : 2) + ((chartSeed + 4) % 4)
    },
    // 17. FINLAND
    {
      countryNe: 'फिनल्याण्ड (Finland)',
      countryEn: 'Finland',
      regionNe: 'उत्तरी युरोप (Northern Europe)',
      regionEn: 'Northern Europe',
      directionNe: 'उत्तर (North)',
      directionEn: 'North',
      favorablePurposeNe: 'विश्वस्तरीय शिक्षा प्रणाली, कम्प्युटर साइन्स, क्लिनटेक, विश्वको सबैभन्दा खुसी देशमा बसोबास',
      favorablePurposeEn: 'World-Class Education, Computer Science, CleanTech & Happiest Country Residence',
      favorableMonthsNe: 'वैशाख, असार, असोज र फागुन (Apr, Jun-Jul, Sep-Oct, Feb-Mar)',
      favorableMonthsEn: 'Apr, Jun-Jul, Sep-Oct, Feb-Mar',
      planetaryReasonNe: `गुरु र बुधको बौद्धिक प्रभावले फिनल्याण्डमा उच्च शिक्षा, अनुसन्धान र शान्तिमय सामाजिक जीवन प्रदान गर्नेछ।`,
      planetaryReasonEn: `Jupiterian wisdom aligns with academic excellence and peaceful settlement in Finland.`,
      remedyNe: 'बिहीबार विद्यार्थी वा बालबालिकालाई शैक्षिक सामग्री दान गर्ने।',
      remedyEn: 'Donate stationery to students on Thursdays.',
      rawScore: 66 + (is12Water || is9Air ? 14 : 6) + (jupiterStrong ? 8 : 2) + (isDasha('गुरु') || isDasha('बुध') ? 8 : 2) + ((chartSeed + 5) % 4)
    },
    // 18. FRANCE
    {
      countryNe: 'फ्रान्स (France)',
      countryEn: 'France',
      regionNe: 'पश्चिम युरोप (Western Europe)',
      regionEn: 'Western Europe',
      directionNe: 'पश्चिम तथा उत्तर–पश्चिम (West / North-West)',
      directionEn: 'West / North-West',
      favorablePurposeNe: 'लक्जरी ब्रान्ड म्यानेजमेन्ट, कुलिनरी/शेफ, एरोस्पेस, फेसन डिजाइनिङ र युरोपेली करियर',
      favorablePurposeEn: 'Luxury Brand Management, Culinary Arts, Aerospace, Fashion Design & EU Career',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र मङ्सिर (Apr-Jun, Sep-Oct, Nov-Dec)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Nov-Dec',
      planetaryReasonNe: `शुक्र र सूर्यको कलात्मक प्रभावले फ्रान्समा आतिथ्य, पाककला, फेसन, वा इन्जिनियरिङ क्षेत्रमा अन्तर्राष्ट्रिय ख्याति दिलाउँछ।`,
      planetaryReasonEn: `Venusian artistic energy and solar prestige foster distinction in gastronomy, luxury fashion, and aerospace in France.`,
      remedyNe: 'शुक्रबार माँ लक्ष्मीको पूजा गर्ने र सेतो चन्दनको प्रयोग गर्ने।',
      remedyEn: 'Worship Goddess Lakshmi on Fridays.',
      rawScore: 66 + (is12Water || is12Air ? 14 : 6) + (venusStrong ? 8 : 2) + (isDasha('शुक्र') || isDasha('सूर्य') ? 8 : 2) + ((chartSeed + 6) % 4)
    },
    // 19. JAPAN
    {
      countryNe: 'जापान (Japan)',
      countryEn: 'Japan',
      regionNe: 'पूर्वी एसिया (East Asia)',
      regionEn: 'East Asia',
      directionNe: 'पूर्व तथा उत्तर–पूर्व (East / North-East)',
      directionEn: 'East / North-East',
      favorablePurposeNe: 'भाषा तथा प्राविधिक अध्ययन (SSW / TITP), रोबोटिक्स, कम्प्युटर इन्जिनियरिङ, होटल व्यवस्थापन',
      favorablePurposeEn: 'Language & Vocational Studies (SSW/TITP), Robotics, IT & Hospitality',
      favorableMonthsNe: 'वैशाख, असार, असोज र चैत्र (Apr, Jul, Sep-Oct, Mar-Apr)',
      favorableMonthsEn: 'Apr, Jul, Sep-Oct, Mar-Apr',
      planetaryReasonNe: `सूर्य र मंगलको पूर्वीय प्रभाव तथा शनिको अनुशासनले जापानमा प्राविधिक ज्ञान, भाषा दक्षता र समयनिष्ठ परिश्रमबाट तीव्र आर्थिक उन्नति हुने योग छ।`,
      planetaryReasonEn: `Solar-Mars eastern orientation coupled with Saturnian discipline ensures rapid career elevation and high earnings in Japan.`,
      remedyNe: 'मंगलबार हनुमान चालिसा पाठ गर्ने र नित्य सूर्यलाई जल चढाउने।',
      remedyEn: 'Recite Hanuman Chalisa on Tuesdays and offer water to Sun.',
      rawScore: 67 + (is12Earth || is10Fire ? 15 : 7) + (marsStrong || saturnStrong ? 8 : 3) + (isDasha('मंगल') || isDasha('सूर्य') || isDasha('शनि') ? 8 : 2) + (chartSeed % 4)
    },
    // 20. SOUTH KOREA
    {
      countryNe: 'दक्षिण कोरिया (South Korea)',
      countryEn: 'South Korea',
      regionNe: 'पूर्वी एसिया (East Asia)',
      regionEn: 'East Asia',
      directionNe: 'पूर्व (East)',
      directionEn: 'East',
      favorablePurposeNe: 'ईपीएस (EPS) सरकारी रोजगारी, उत्पादन तथा निर्माण, उच्च प्राविधिक अध्ययन, इलेक्ट्रोनिक्स',
      favorablePurposeEn: 'EPS Government Employment, High-Tech Electronics & Manufacturing',
      favorableMonthsNe: 'जेठ, भाद्र, कार्तिक र फागुन (May-Jun, Aug-Sep, Oct-Nov, Feb-Mar)',
      favorableMonthsEn: 'May-Jun, Aug-Sep, Oct-Nov, Feb-Mar',
      planetaryReasonNe: `मंगल र शनिको पराक्रम योगले दक्षिण कोरियामा औद्योगिक, उत्पादन तथा प्राविधिक क्षेत्रमा उत्कृष्ट तलब, सुरक्षित रोजगारी र बचत दिलाउनेछ।`,
      planetaryReasonEn: `Martian-Saturn courage combinations guarantee fruitful industrial employment and robust cash accumulation in South Korea.`,
      remedyNe: 'मंगलबार रातो वस्तु दान गर्ने र हनुमान जीको सिन्दूर तिलक लगाउने।',
      remedyEn: 'Donate red lentils on Tuesdays and chant Hanuman mantra.',
      rawScore: 66 + (is10Fire || is12Earth ? 14 : 6) + (marsStrong ? 9 : 2) + (isDasha('मंगल') || isDasha('शनि') ? 8 : 2) + ((chartSeed + 1) % 4)
    },
    // 21. SINGAPORE
    {
      countryNe: 'सिङ्गापुर (Singapore)',
      countryEn: 'Singapore',
      regionNe: 'दक्षिण–पूर्वी एसिया (South-East Asia)',
      regionEn: 'South-East Asia',
      directionNe: 'दक्षिण–पूर्व (South-East)',
      directionEn: 'South-East',
      favorablePurposeNe: 'फिनटेक, अन्तर्राष्ट्रिय व्यापार, लजिस्टिक, कर्पोरेट म्यानेजमेन्ट, उच्च तलब',
      favorablePurposeEn: 'Fintech, International Trade, Logistics, Corporate Headquarters Career',
      favorableMonthsNe: 'जेठ, साउन, कार्तिक र माघ (May-Jun, Jul-Aug, Oct-Nov, Jan-Feb)',
      favorableMonthsEn: 'May-Jun, Jul-Aug, Oct-Nov, Jan-Feb',
      planetaryReasonNe: `बुध र शुक्रको व्यापारिक योगले सिङ्गापुरमा अन्तर्राष्ट्रिय वित्तीय कारोबार, सूचना प्रविधि र बहुराष्ट्रिय कम्पनीमा छिटो प्रगति गराउँछ।`,
      planetaryReasonEn: `Commercial Mercury-Venus planetary energy supports international trading, logistics, and fintech in Singapore.`,
      remedyNe: 'बुधबार गणेश जीलाई लड्डु चढाउने र हरियो वस्त्र दान गर्ने।',
      remedyEn: 'Offer Motichoor Laddus to Lord Ganesha on Wednesdays.',
      rawScore: 66 + (is12Air || is10Water ? 14 : 6) + (mercuryStrong ? 8 : 3) + (isDasha('बुध') || isDasha('शुक्र') ? 8 : 2) + ((chartSeed + 2) % 4)
    },
    // 22. MALAYSIA
    {
      countryNe: 'मलेसिया (Malaysia)',
      countryEn: 'Malaysia',
      regionNe: 'दक्षिण–पूर्वी एसिया (South-East Asia)',
      regionEn: 'South-East Asia',
      directionNe: 'दक्षिण–पूर्व (South-East)',
      directionEn: 'South-East',
      favorablePurposeNe: 'हस्पिटालिटी इन्टर्नसिप, आईटी, उत्पादन सुपरभिजन, उच्च शिक्षा क्रेडिट ट्रान्सफर',
      favorablePurposeEn: 'Hospitality Internships, IT, Manufacturing Supervision, Credit Transfer Studies',
      favorableMonthsNe: 'असार, साउन, कार्तिक र फागुन (Jun-Aug, Oct-Nov, Feb-Mar)',
      favorableMonthsEn: 'Jun-Aug, Oct-Nov, Feb-Mar',
      planetaryReasonNe: `शुक्र र शनिको व्यावहारिक प्रभावले मलेसियामा सेवा क्षेत्र तथा बहुराष्ट्रिय उद्योगहरूमा स्थिर रोजगारी दिलाउँछ।`,
      planetaryReasonEn: `Venus-Saturn practical alignment supports hospitality and industrial supervision in Malaysia.`,
      remedyNe: 'शुक्रबार माँ दुर्गाको मन्त्र जप गर्ने।',
      remedyEn: 'Chant Durga mantra on Fridays.',
      rawScore: 64 + (is12Water || is10Earth ? 13 : 5) + (venusStrong ? 7 : 2) + (isDasha('शुक्र') || isDasha('शनि') ? 7 : 2) + ((chartSeed + 3) % 4)
    },
    // 23. PORTUGAL
    {
      countryNe: 'पोर्चुगल (Portugal)',
      countryEn: 'Portugal',
      regionNe: 'दक्षिण–पश्चिम युरोप (South-Western Europe)',
      regionEn: 'South-Western Europe',
      directionNe: 'पश्चिम तथा दक्षिण–पश्चिम (West / South-West)',
      directionEn: 'West / South-West',
      favorablePurposeNe: 'सहज स्थायी बसोबास (Easy Residency / D7 / Job Seeker), कृषि, व्यापार र पारिवारिक सेटलमेन्ट',
      favorablePurposeEn: 'Direct Pathway to EU Permanent Residency (D7/Job Seeker), Agriculture & Business',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र मङ्सिर (Apr-Jun, Sep-Oct, Nov-Dec)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Nov-Dec',
      planetaryReasonNe: `शुक्र र शनिको व्यावहारिक समन्वयले पोर्चुगलमा युरोपेली स्थायी नागरिकता (EU Passport) लिनका लागि कानुनी प्रक्रिया सबैभन्दा छिटो र सरल बनाउँछ।`,
      planetaryReasonEn: `Venus-Saturn harmony provides the most accessible pathway to legal EU permanent residency and citizenship in Portugal.`,
      remedyNe: 'शुक्रबार माँ दुर्गाको मन्त्र ॐ दुं दुर्गायै नमः जप गर्ने।',
      remedyEn: 'Chant Durga Beej mantra on Fridays.',
      rawScore: 67 + (is12Water || is9Water ? 15 : 6) + (venusStrong ? 8 : 3) + (isDasha('शुक्र') || isDasha('शनि') ? 8 : 2) + ((chartSeed + 3) % 4)
    },
    // 24. SPAIN
    {
      countryNe: 'स्पेन (Spain)',
      countryEn: 'Spain',
      regionNe: 'दक्षिण–पश्चिम युरोप (South-Western Europe)',
      regionEn: 'South-Western Europe',
      directionNe: 'पश्चिम तथा दक्षिण–पश्चिम (West / South-West)',
      directionEn: 'West / South-West',
      favorablePurposeNe: 'हस्पिटालिटी, कृषि उद्यम, अध्ययन, स्पेनिश भाषा दक्षता, युरोपेली बसोबास',
      favorablePurposeEn: 'Hospitality, Agri-Business, University Studies & European Settlement',
      favorableMonthsNe: 'वैशाख, असार, असोज र पुस (Apr, Jun-Jul, Sep-Oct, Dec-Jan)',
      favorableMonthsEn: 'Apr, Jun-Jul, Sep-Oct, Dec-Jan',
      planetaryReasonNe: `सूर्य र शुक्रको भूमध्यसागरीय योगले स्पेनमा पर्यटन, सेवा र व्यवसायमा उत्साहजनक उन्नति गराउँछ।`,
      planetaryReasonEn: `Solar-Venus Mediterranean configuration fosters success in tourism and enterprise in Spain.`,
      remedyNe: 'आइतबार सूर्य नमस्कार गर्ने र शुक्रबार सेतो फूल चढाउने।',
      remedyEn: 'Perform Surya Namaskar on Sundays and offer white flowers on Fridays.',
      rawScore: 65 + (is12Fire || is9Water ? 14 : 5) + (venusStrong || sunStrong ? 8 : 2) + (isDasha('शुक्र') || isDasha('सूर्य') ? 8 : 2) + ((chartSeed + 4) % 4)
    },
    // 25. MALTA
    {
      countryNe: 'माल्टा (Malta)',
      countryEn: 'Malta',
      regionNe: 'भूमध्यसागरीय युरोप (Mediterranean Europe)',
      regionEn: 'Mediterranean Europe',
      directionNe: 'दक्षिण–पश्चिम तथा पश्चिम (South-West / West)',
      directionEn: 'South-West / West',
      favorablePurposeNe: 'हस्पिटालिटी, पर्यटन, शेनजेन अध्ययन, अंग्रेजी भाषी युरोपेली रोजगारी',
      favorablePurposeEn: 'Hospitality, Tourism Management, Schengen Studies & English-Medium Work',
      favorableMonthsNe: 'वैशाख, असार, असोज र माघ (Apr-May, Jun-Jul, Sep-Oct, Jan-Feb)',
      favorableMonthsEn: 'Apr-May, Jun-Jul, Sep-Oct, Jan-Feb',
      planetaryReasonNe: `शुक्र र चन्द्रमाको सामुद्रिक टापु प्रभावले माल्टामा सहज भिसा, पर्यटन र सेवा क्षेत्रमा छिटो सेटलमेन्ट दिलाउनेछ।`,
      planetaryReasonEn: `Venusian coastal harmony guarantees smooth visa issuance and hospitality employment in Malta.`,
      remedyNe: 'शुक्रबार माँ दुर्गालाई सेतो वा गुलाबी फूल अर्पण गर्ने।',
      remedyEn: 'Offer pink or white flowers to Goddess Durga on Fridays.',
      rawScore: 66 + (is12Water || is9Water ? 15 : 6) + (venusStrong || moonFavorable ? 8 : 2) + (isDasha('शुक्र') || isDasha('चन्द्र') ? 8 : 2) + (chartSeed % 4)
    },
    // 26. CYPRUS
    {
      countryNe: 'साइप्रस (Cyprus)',
      countryEn: 'Cyprus',
      regionNe: 'भूमध्यसागरीय युरोप (Mediterranean Europe)',
      regionEn: 'Mediterranean Europe',
      directionNe: 'पश्चिम–दक्षिण (West-South)',
      directionEn: 'West-South',
      favorablePurposeNe: 'कलेज अध्ययन, होटल म्यानेजमेन्ट, सेवा क्षेत्र रोजगारी, युरोपेली अनुभव',
      favorablePurposeEn: 'College Education, Hotel Management, Service Sector Employment',
      favorableMonthsNe: 'वैशाख, साउन, असोज र माघ (Apr, Jul-Aug, Sep-Oct, Jan-Feb)',
      favorableMonthsEn: 'Apr, Jul-Aug, Sep-Oct, Jan-Feb',
      planetaryReasonNe: `चन्द्रमा र शुक्रको अनुकूलताले साइप्रसमा अध्ययन र आतिथ्य क्षेत्रमा सहज प्रवेश दिलाउँछ।`,
      planetaryReasonEn: `Lunar-Venusian alignment facilitates smooth academic and hospitality entry in Cyprus.`,
      remedyNe: 'सोमबार भगवान शिवलाई जल अर्पण गर्ने।',
      remedyEn: 'Offer water to Lord Shiva on Mondays.',
      rawScore: 65 + (is12Water || is9Water ? 14 : 5) + (moonFavorable ? 7 : 2) + (isDasha('चन्द्र') || isDasha('शुक्र') ? 8 : 2) + ((chartSeed + 5) % 4)
    },
    // 27. POLAND
    {
      countryNe: 'पोल्याण्ड (Poland)',
      countryEn: 'Poland',
      regionNe: 'मध्य युरोप (Central Europe)',
      regionEn: 'Central Europe',
      directionNe: 'उत्तर तथा उत्तर–पूर्व (North / North-East)',
      directionEn: 'North / North-East',
      favorablePurposeNe: 'शेनजेन वर्क पर्मिट (Work Permit), लजिस्टिक, उत्पादन तथा युरोपेली युनियनमा प्रवेश',
      favorablePurposeEn: 'Schengen Work Permit, Logistics, Manufacturing & EU Entry Gateway',
      favorableMonthsNe: 'वैशाख, जेठ, असोज र मङ्सिर (Apr-Jun, Sep-Oct, Nov-Dec)',
      favorableMonthsEn: 'Apr-Jun, Sep-Oct, Nov-Dec',
      planetaryReasonNe: `शनि र बुधको अनुकूलताले पोल्याण्डमा कामदार भिसा तथा शेनजेन क्षेत्रमा प्रवेश गरी स्थिर जीवन र आम्दानीको बलियो आधार तयार हुन्छ।`,
      planetaryReasonEn: `Saturnian persistence facilitates straightforward Schengen work visa processing and practical manufacturing stability in Poland.`,
      remedyNe: 'शनिबार कालो तिल दान गर्ने र हनुमान चालिसा पाठ गर्ने।',
      remedyEn: 'Donate black sesame on Saturdays.',
      rawScore: 66 + (is12Earth || is9Earth ? 14 : 6) + (saturnStrong ? 8 : 3) + (isDasha('शनि') || isDasha('राहु') ? 8 : 2) + ((chartSeed + 6) % 4)
    },
    // 28. MALDIVES
    {
      countryNe: 'माल्दिभ्स (Maldives)',
      countryEn: 'Maldives',
      regionNe: 'हिन्द महासागर (Indian Ocean)',
      regionEn: 'Indian Ocean',
      directionNe: 'दक्षिण (South)',
      directionEn: 'South',
      favorablePurposeNe: 'लक्जरी रिसोर्ट/होटल म्यानेजमेन्ट, शेफ/पर्यटन सेवा, करमुक्त अमेरिकी डलर (USD) बचत',
      favorablePurposeEn: 'Luxury Island Resort Management, Culinary Arts & Tax-Free USD Savings',
      favorableMonthsNe: 'असोज, कार्तिक, पुस र फागुन (Sep-Nov, Dec-Jan, Feb-Mar)',
      favorableMonthsEn: 'Sep-Nov, Dec-Jan, Feb-Mar',
      planetaryReasonNe: `जलतत्व चन्द्रमा र विलासिताका कारक शुक्रको संयोजनले माल्दिभ्सका विश्वप्रसिद्ध रिसोर्टहरूमा डलरमा आकर्षक पारिश्रमिक र उत्कृष्ट सेवा करियर दिलाउँछ।`,
      planetaryReasonEn: `Watery Lunar and luxury Venusian dynamics facilitate lucrative USD earnings in world-class island resorts in Maldives.`,
      remedyNe: 'सोमबार सेतो चामल वा दूध दान गर्ने र शिव पञ्चाक्षर मन्त्र जप गर्ने।',
      remedyEn: 'Donate white rice on Mondays.',
      rawScore: 65 + (is12Water || is9Water ? 15 : 5) + (moonFavorable && venusStrong ? 9 : 2) + (isDasha('चन्द्र') || isDasha('शुक्र') ? 8 : 2) + ((chartSeed + 5) % 4)
    }
  ];

  // Map each candidate to final ForeignDestinationRecommendation with strictly clamped 0-100 score & grade
  const scoredDestinations: ForeignDestinationRecommendation[] = allDestinations.map((cand) => {
    const finalScore = Math.max(68, Math.min(98, Math.round(cand.rawScore)));
    const gradeNe: 'सर्वोत्तम' | 'उत्तम' | 'मध्यम' = finalScore >= 90 ? 'सर्वोत्तम' : finalScore >= 80 ? 'उत्तम' : 'मध्यम';
    const gradeEn: 'Highly Auspicious' | 'Favorable' | 'Moderate' = finalScore >= 90 ? 'Highly Auspicious' : finalScore >= 80 ? 'Favorable' : 'Moderate';

    return {
      countryNe: cand.countryNe,
      countryEn: cand.countryEn,
      regionNe: cand.regionNe,
      regionEn: cand.regionEn,
      suitabilityScore: finalScore,
      gradeNe,
      gradeEn,
      favorablePurposeNe: cand.favorablePurposeNe,
      favorablePurposeEn: cand.favorablePurposeEn,
      directionNe: cand.directionNe,
      directionEn: cand.directionEn,
      favorableMonthsNe: cand.favorableMonthsNe,
      favorableMonthsEn: cand.favorableMonthsEn,
      planetaryReasonNe: cand.planetaryReasonNe,
      planetaryReasonEn: cand.planetaryReasonEn,
      remedyNe: cand.remedyNe,
      remedyEn: cand.remedyEn
    };
  });

  // Sort strictly by highest astrological suitability score descending
  scoredDestinations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // STRICT RULES: Return ONLY 1 to 3 (or maximum 4 if 4th is very high and close).
  // Never pad unnecessarily. Assign clean user-facing ranking priority labels.
  let topCount = 3;
  if (scoredDestinations[0].suitabilityScore >= 95 && (scoredDestinations[0].suitabilityScore - scoredDestinations[1].suitabilityScore) >= 7) {
    topCount = 2;
  } else if (scoredDestinations[3] && scoredDestinations[3].suitabilityScore >= 86 && (scoredDestinations[2].suitabilityScore - scoredDestinations[3].suitabilityScore) <= 2) {
    topCount = 4;
  } else {
    topCount = 3;
  }

  const recommendedDestinations: ForeignDestinationRecommendation[] = scoredDestinations.slice(0, topCount);

  // Assign user-facing priority ranking labels
  recommendedDestinations.forEach((dest, idx) => {
    if (idx === 0) {
      dest.priorityLabelNe = '१. पहिलो प्राथमिकता — विशेष रूपमा अनुकूल';
      dest.priorityLabelEn = '1. First Priority — Highly Auspicious';
      dest.gradeNe = 'सर्वोत्तम';
      dest.gradeEn = 'Highly Auspicious';
    } else if (idx === 1) {
      dest.priorityLabelNe = '२. दोस्रो प्राथमिकता — राम्रो विकल्प';
      dest.priorityLabelEn = '2. Second Priority — Favorable Option';
      dest.gradeNe = 'उत्तम';
      dest.gradeEn = 'Favorable';
    } else if (idx === 2) {
      dest.priorityLabelNe = '३. तेस्रो प्राथमिकता — अनुकूल';
      dest.priorityLabelEn = '3. Third Priority — Suitable';
      dest.gradeNe = 'उत्तम';
      dest.gradeEn = 'Favorable';
    } else {
      dest.priorityLabelNe = '४. चौथो प्राथमिकता — थप विकल्प';
      dest.priorityLabelEn = '4. Fourth Priority — Additional Option';
      dest.gradeNe = 'मध्यम';
      dest.gradeEn = 'Moderate';
    }
  });

  // =========================================================================
  // 2. THE 30 TOPICAL PREDICTIONS (सम्बन्धित प्रश्नको प्रत्येक बर्षको सटिक उत्तर)
  // =========================================================================
  const topics: YearlyTopicPhalit[] = [
    {
      id: 'marriage',
      topicNe: 'विवाह तथा लगन',
      topicEn: 'Marriage & Partner Timing',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'Heart',
      score: Math.min(96, 68 + (h7.signLordNe === activeDasha.maha.planetNe || h7.signLordNe === activeDasha.antar.planetNe ? 18 : 6) + (venus.dignity === 'उच्च' ? 8 : 0)),
      ratingNe: (h7.signLordNe === activeDasha.maha.planetNe || h7.signLordNe === activeDasha.antar.planetNe || venus.houseNum === 7) ? 'अति शुभ' : 'शुभ',
      ratingEn: 'Excellent',
      predictionNe: `वर्ष ${targetYearAD} AD (वि.सं. ${toNepaliDigits(targetYearBS)} BS) मा ७ औँ भाव (${h7.signNe}) र शुक्रको अनुकूल गोचरले गर्दा विवाह योग्य उमेरका व्यक्तिहरूका लागि योग्य जीवनसाथीको कुरा अगाडि बढ्नेछ। ${activeDasha.maha.planetNe} को महादशामा वैवाहिक कुराकानीमा परिवारको पूर्ण समर्थन रहनेछ। विवाह भइसकेकाहरूको हकमा आपसी विश्वास र सुखद् यात्रा हुनेछ।`,
      predictionEn: `During ${targetYearAD} AD (BS ${targetYearBS}), the auspicious aspect on the 7th house (${h7.signEn}) and Venus brings ideal marriage proposals and family blessings.`,
      rulingPlanetsNe: `शुक्र (Venus), ७ औँ भाव स्वामी (${h7.signLordNe}), गुरु (Jupiter)`,
      rulingPlanetsEn: `Venus, 7th Lord (${h7.signLordEn}), Jupiter`,
      auspiciousMonthsNe: 'मङ्सिर, माघ, फागुन र वैशाख',
      auspiciousMonthsEn: 'Nov-Dec, Jan-Mar, Apr-May',
      remediesNe: ['शुक्रबार माँ लक्ष्मीलाई सेतो कमल वा सुगन्धित फूल अर्पण गर्ने।', 'शुक्र मन्त्र जप गर्ने।'],
      remediesEn: ['Offer fragrant white flowers to Goddess Lakshmi on Fridays.']
    },
    {
      id: 'love',
      topicNe: 'प्रेम सम्बन्ध',
      topicEn: 'Love & Romance',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'HeartHandshake',
      score: Math.min(95, 70 + (h5.signLordNe === activeDasha.antar.planetNe ? 15 : 5) + (mercury.houseNum === 5 ? 8 : 0)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `५ औँ भाव (${h5.signNe}) विद्या र प्रेमको स्थान भएकाले यस वर्ष प्रेम सम्बन्धमा नयाँ मिठास र भावनात्मक समझदारी बढ्नेछ। मनको कुरा व्यक्त गर्न अनुकूल समय छ। सानातिना असमझदारीलाई संवादद्वारा समाधान गर्दा सम्बन्ध स्थायी बन्नेछ।`,
      predictionEn: `The 5th house of romance fosters emotional intimacy, mutual understanding, and harmonious moments with your partner throughout ${targetYearAD}.`,
      rulingPlanetsNe: `बुध, शुक्र, ५ औँ भाव स्वामी (${h5.signLordNe})`,
      rulingPlanetsEn: `Mercury, Venus, 5th Lord (${h5.signLordEn})`,
      auspiciousMonthsNe: 'असोज, कार्तिक, फागुन र चैत्र',
      auspiciousMonthsEn: 'Sep-Nov, Feb-Apr',
      remediesNe: ['राधा-कृष्णको संयुक्त युगल स्वरूपको ध्यान गर्ने।'],
      remediesEn: ['Meditate upon the divine grace of Radha-Krishna.']
    },
    {
      id: 'career',
      topicNe: 'करियर तथा कार्यक्षेत्र',
      topicEn: 'Career & Professional Direction',
      categoryNe: 'पेशा तथा व्यवसाय',
      categoryEn: 'Career & Business',
      iconName: 'Briefcase',
      score: Math.min(98, 72 + (h10.signLordNe === activeDasha.maha.planetNe ? 18 : 6) + (sun.dignity === 'उच्च' || sun.houseNum === 10 ? 10 : 0)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `१० औँ भाव (${h10.signNe}) कर्मस्थानको स्वामी ${h10.signLordNe} र वर्तमान ${activeDasha.maha.planetNe} महादशाको प्रभावले गर्दा करियरमा महत्त्वपूर्ण छलाङ मार्ने वर्ष साबित हुनेछ। नेतृत्वदायी भूमिका, नयाँ परियोजनाको जिम्मेवारी र उच्च पदस्थ व्यक्तित्वहरूको सहयोग प्राप्त हुनेछ।`,
      predictionEn: `In ${targetYearAD}, powerful 10th house karmic alignment brings executive authority, major leadership milestones, and recognition from senior authorities.`,
      rulingPlanetsNe: `सूर्य, शनि, १० औँ भाव स्वामी (${h10.signLordNe})`,
      rulingPlanetsEn: `Sun, Saturn, 10th Lord (${h10.signLordEn})`,
      auspiciousMonthsNe: 'वैशाख, असार, असोज र पुस',
      auspiciousMonthsEn: 'Apr-May, Jun-Jul, Sep-Oct, Dec-Jan',
      remediesNe: ['नित्य बिहान सूर्य देवलाई तामाको लोटाबाट जल अर्पण गर्ने।', 'आदित्य हृदय स्तोत्र पाठ गर्ने।'],
      remediesEn: ['Offer Arghya to Lord Surya every morning with a copper vessel.']
    },
    {
      id: 'job',
      topicNe: 'जागिर, बढुवा र सरुवा',
      topicEn: 'Job, Promotion & Transfers',
      categoryNe: 'पेशा तथा व्यवसाय',
      categoryEn: 'Career & Business',
      iconName: 'Building',
      score: Math.min(95, 74 + (h6.signLordNe === activeDasha.antar.planetNe ? 12 : 5)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `६ औँ भाव (सेवा/प्रतिस्पर्धा) र १० औँ भावको शुभ दृष्टिले जागिरे जीवनमा पदोन्नति (Promotion), तलब वृद्धि र चाहेको स्थानमा सरुवा हुने प्रबल सम्भावना छ। सरकारी वा कर्पोरेट क्षेत्रमा नयाँ जागिर खोजिरहेकाहरूका लागि अन्तर्वार्तामा सफलता मिल्नेछ।`,
      predictionEn: `Auspicious transit indicates timely salary increments, promotion to desired roles, and successful outcomes in corporate or government examinations.`,
      rulingPlanetsNe: `सूर्य, बुध, ६ औँ भाव स्वामी (${h6.signLordNe})`,
      rulingPlanetsEn: `Sun, Mercury, 6th Lord (${h6.signLordEn})`,
      auspiciousMonthsNe: 'जेठ, भदौ, मङ्सिर र माघ',
      auspiciousMonthsEn: 'May-Jun, Aug-Sep, Nov-Dec, Jan-Feb',
      remediesNe: ['कार्यस्थलमा इष्टदेवको स्मरण गरी दिनको थालनी गर्ने।'],
      remediesEn: ['Begin workday with divine remembrance of your Ishta Devata.']
    },
    {
      id: 'business',
      topicNe: 'व्यापार तथा व्यवसाय',
      topicEn: 'Business & Commercial Ventures',
      categoryNe: 'पेशा तथा व्यवसाय',
      categoryEn: 'Career & Business',
      iconName: 'TrendingUp',
      score: Math.min(96, 75 + (mercury.dignity === 'उच्च' || mercury.dignity === 'स्वगृही' ? 12 : 5)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `बुध र ७ औँ भावको व्यापारिक अनुकूलताले नयाँ व्यवसाय सुरु गर्न वा विद्यमान व्यापार विस्तार गर्न वर्ष ${targetYearAD} उत्कृष्ट छ। व्यापारिक ग्राहक सञ्जाल बढ्नेछ र नाफाको दरमा उल्लेखनीय वृद्धि हुनेछ। साझेदारसँग स्पष्ट सम्झौता गरेर अघि बढ्नु उत्तम हुनेछ।`,
      predictionEn: `Mercurial business strength facilitates profitable trade expansion, customer acquisition, and rewarding entrepreneurial partnerships.`,
      rulingPlanetsNe: `बुध (Mercury), गुरु (Jupiter), ७ औँ भाव स्वामी (${h7.signLordNe})`,
      rulingPlanetsEn: `Mercury, Jupiter, 7th Lord (${h7.signLordEn})`,
      auspiciousMonthsNe: 'असार, असोज, कार्तिक र चैत्र',
      auspiciousMonthsEn: 'Jun-Jul, Sep-Nov, Mar-Apr',
      remediesNe: ['बुधबार हरियो वस्तु वा मूंग दाल दान गर्ने र व्यापार स्थलमा श्रीयन्त्र स्थापना गर्ने।'],
      remediesEn: ['Establish a consecrated Shree Yantra at your business desk.']
    },
    {
      id: 'education',
      topicNe: 'पढाइ तथा उच्च शिक्षा',
      topicEn: 'Education & Competitive Exams',
      categoryNe: 'ज्ञान तथा विद्या',
      categoryEn: 'Knowledge & Learning',
      iconName: 'GraduationCap',
      score: Math.min(97, 78 + (jupiter.houseNum === 5 || mercury.houseNum === 5 ? 14 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `५ औँ भाव (${h5.signNe}) र ९ औँ भाव (उच्च शिक्षा) को गुरु–बुध दृष्टियोगले अध्ययनमा एकाग्रता, स्मरणशक्ति र बौद्धिक तीक्ष्णता उच्च रहनेछ। लोकसेवा, विश्वविद्यालय प्रवेश परीक्षा तथा विदेशी छात्रवृत्तिमा उत्कृष्ट नतिजा आउनेछ।`,
      predictionEn: `Exceptional 5th & 9th house academic synergy guarantees deep concentration, retention, and distinction in competitive exams and scholarship tests.`,
      rulingPlanetsNe: `गुरु (Jupiter), बुध (Mercury), सरस्वती माता`,
      rulingPlanetsEn: `Jupiter, Mercury, Goddess Saraswati`,
      auspiciousMonthsNe: 'वैशाख, साउन, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'Apr-May, Jul-Aug, Nov-Dec, Feb-Mar',
      remediesNe: ['नित्य बिहान सरस्वती वन्दना वा गायत्री मन्त्र १०८ पटक जप गर्ने।'],
      remediesEn: ['Chant Saraswati Vandana and Gayatri Mantra 108 times daily.']
    },
    {
      id: 'foreign_travel',
      topicNe: 'विदेश यात्रा तथा भिसा',
      topicEn: 'Foreign Travel & Visa Prospects',
      categoryNe: 'वैदेशिक तथा यात्रा',
      categoryEn: 'Foreign & Travel',
      iconName: 'Plane',
      score: Math.min(98, 76 + (h12.signLordNe === activeDasha.maha.planetNe || rahu.houseNum === 12 || rahu.houseNum === 9 ? 18 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `१२ औँ भाव (${h12.signNe}) विदेश स्थान र ९ औँ भाव (लामो यात्रा) को सक्रियताले गर्दा वर्ष ${targetYearAD} मा वैदेशिक यात्राको भिसा (Visa Approval) लाग्ने शतप्रतिशत योग बनेको छ। कागजात प्रक्रिया समयमै पूरा गर्दा कुनै बाधा आउने छैन।`,
      predictionEn: `Strong 12th house overseas vibrations and Rahu/Moon aspects indicate seamless visa approvals and smooth international journey in ${targetYearAD}.`,
      rulingPlanetsNe: `राहु, चन्द्रमा, १२ औँ भाव स्वामी (${h12.signLordNe})`,
      rulingPlanetsEn: `Rahu, Moon, 12th Lord (${h12.signLordEn})`,
      auspiciousMonthsNe: 'जेठ, भदौ, असोज, पुस र फागुन',
      auspiciousMonthsEn: 'May-Jun, Aug-Oct, Dec-Jan, Feb-Mar',
      remediesNe: ['राहु मन्त्र ' + 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः' + ' जप गर्ने र यात्रा अघि गणेश दर्शन गर्ने।'],
      remediesEn: ['Chant Rahu Stotram and seek Lord Ganesha’s blessings before departure.']
    },
    {
      id: 'foreign_settlement',
      topicNe: 'विदेश बसाइ र कुन देश जाँदा राम्रो',
      topicEn: 'Foreign Settlement & Best Countries',
      categoryNe: 'वैदेशिक तथा यात्रा',
      categoryEn: 'Foreign & Travel',
      iconName: 'Globe',
      score: Math.min(96, 75 + (is12Water || is12Air ? 15 : 6)),
      ratingNe: 'सर्वोत्तम योग',
      ratingEn: 'Highly Auspicious',
      predictionNe: `तपाईँको कुण्डलीको १२ औँ भाव (${h12.signNe}) र ९ औँ भाव (${h9.signNe}) को विश्लेषण अनुसार तपाईँको लागि ${recommendedDestinations[0].countryNe} (${recommendedDestinations[0].directionNe}) र ${recommendedDestinations[1].countryNe} सर्वोत्तम देश हुन्। त्यहाँ स्थायी बसोबास (PR) र आर्थिक उन्नति अत्यन्त तीव्र हुनेछ।`,
      predictionEn: `Based on your 12th house (${h12.signEn}) and 9th house (${h9.signEn}), the most prosperous global destinations for you are ${recommendedDestinations[0].countryEn} and ${recommendedDestinations[1].countryEn}.`,
      rulingPlanetsNe: `१२ औँ भाव स्वामी (${h12.signLordNe}), राहु, चन्द्रमा`,
      rulingPlanetsEn: `12th Lord (${h12.signLordEn}), Rahu, Moon`,
      auspiciousMonthsNe: 'भाद्र देखि कार्तिक तथा माघ देखि चैत्रसम्म',
      auspiciousMonthsEn: 'Aug to Nov & Jan to Apr',
      remediesNe: ['शिव मन्दिरमा जल चढाउने र वैदेशिक कागजात तयार गर्दा पूर्व वा उत्तर फर्केर हस्ताक्षर गर्ने।'],
      remediesEn: ['Face East or North while signing major visa and immigration documents.']
    },
    {
      id: 'finance',
      topicNe: 'आर्थिक अवस्था र आम्दानी',
      topicEn: 'Financial Status & Income Flow',
      categoryNe: 'आर्थिक तथा सम्पत्ति',
      categoryEn: 'Finance & Assets',
      iconName: 'DollarSign',
      score: Math.min(96, 74 + (h11.signLordNe === activeDasha.maha.planetNe ? 16 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `२ औँ भाव (${h2.signNe}) धन स्थान र ११ औँ भाव (${h11.signNe}) लाभ स्थानको योगले गर्दा वर्ष ${targetYearAD} मा नगद प्रवाह (Cashflow) बलियो रहनेछ। पुराना लगानीबाट राम्रो प्रतिफल प्राप्त हुनुका साथै आम्दानीका नयाँ स्रोतहरू थपिनेछन्।`,
      predictionEn: `Prosperous Dhana Yoga between 2nd house of wealth and 11th house of gains ensures consistent, robust cash flow and lucrative returns.`,
      rulingPlanetsNe: `बृहस्पति (Jupiter), शुक्र (Venus), ११ औँ भाव स्वामी (${h11.signLordNe})`,
      rulingPlanetsEn: `Jupiter, Venus, 11th Lord (${h11.signLordEn})`,
      auspiciousMonthsNe: 'वैशाख, असार, कार्तिक र माघ',
      auspiciousMonthsEn: 'Apr-May, Jun-Jul, Oct-Nov, Jan-Feb',
      remediesNe: ['बिहीबार वा शुक्रबार कनकधारा स्तोत्र पाठ गर्ने र ढुकुटी उत्तर दिशामा राख्ने।'],
      remediesEn: ['Recite Kanakadhara Stotram and align financial safe facing North.']
    },
    {
      id: 'wealth_assets',
      topicNe: 'धन–सम्पत्ति तथा बचत',
      topicEn: 'Wealth, Fixed Assets & Gold',
      categoryNe: 'आर्थिक तथा सम्पत्ति',
      categoryEn: 'Finance & Assets',
      iconName: 'Coins',
      score: Math.min(95, 72 + (jupiter.dignity === 'उच्च' || jupiter.dignity === 'स्वगृही' ? 14 : 5)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `यस वर्ष स्थिर सम्पत्ति, सुनचाँदी, बैंक मुद्दती बचत र शेयर बजारमा पूँजी वृद्धि हुनेछ। फजुल खर्च नियन्त्रणमा रहनेछ र पारिवारिक कोषमा उल्लेखनीय धन सञ्चय हुनेछ।`,
      predictionEn: `Enhanced financial stability enables acquisition of precious assets, gold, fixed deposits, and solid wealth accumulation.`,
      rulingPlanetsNe: `गुरु, २ औँ भाव स्वामी (${h2.signLordNe})`,
      rulingPlanetsEn: `Jupiter, 2nd Lord (${h2.signLordEn})`,
      auspiciousMonthsNe: 'साउन, असोज, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'Jul-Aug, Sep-Oct, Nov-Dec, Feb-Mar',
      remediesNe: ['लक्ष्मी नारायणको पूजा गर्ने र तुलसीमा साँझ घिउको दियो बाल्ने।'],
      remediesEn: ['Light a pure ghee lamp near Tulsi plant every evening.']
    },
    {
      id: 'property',
      topicNe: 'घर–जग्गा तथा सवारी साधन',
      topicEn: 'Land, Real Estate & Vehicles',
      categoryNe: 'आर्थिक तथा सम्पत्ति',
      categoryEn: 'Finance & Assets',
      iconName: 'Home',
      score: Math.min(96, 73 + (h4.signLordNe === activeDasha.maha.planetNe || mars.houseNum === 4 ? 16 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `४ औँ भाव (${h4.signNe}) सुखस्थान र मंगल (भूमिपुत्र) को बलियो स्थितिका कारण वर्ष ${targetYearAD} मा नयाँ जग्गा–जमिन खरिद, घर निर्माण वा सवारी साधन (कार/बाइक) खरिद गर्ने सपना साकार हुनेछ। घरको साजसज्जा र स्तरोन्नति हुनेछ।`,
      predictionEn: `Favorable 4th house and Mars alignments support purchasing real estate, constructing homes, or acquiring new motor vehicles.`,
      rulingPlanetsNe: `मंगल (भूमि कारक), शुक्र (वाहन कारक), ४ औँ भाव स्वामी (${h4.signLordNe})`,
      rulingPlanetsEn: `Mars (Land), Venus (Vehicle), 4th Lord (${h4.signLordEn})`,
      auspiciousMonthsNe: 'वैशाख, भदौ, कार्तिक र माघ',
      auspiciousMonthsEn: 'Apr-May, Aug-Sep, Oct-Nov, Jan-Feb',
      remediesNe: ['मंगलवार भूमि पूजन गर्ने र रातो वस्त्र दान गर्ने।'],
      remediesEn: ['Perform Bhumi Pooja before beginning construction and donate red lentils.']
    },
    {
      id: 'health',
      topicNe: 'स्वास्थ्य तथा आरोग्यता',
      topicEn: 'Health, Vitality & Wellness',
      categoryNe: 'आरोग्यता तथा जीवन',
      categoryEn: 'Health & Vitality',
      iconName: 'Activity',
      score: Math.min(94, 70 + (lagna.dignity === 'उच्च' ? 14 : 6)),
      ratingNe: 'सन्तुलित एवं उत्तम',
      ratingEn: 'Balanced & Good',
      predictionNe: `लग्नेश र सूर्यको सकारात्मक प्रभावले रोग प्रतिरोधात्मक क्षमता (Immunity) उच्च रहनेछ। पुराना दीर्घरोगहरूमा सुधार आउनेछ। खानपानमा सन्तुलन र दैनिक योग–प्राणायाम गर्दा वर्षभरि मानसिक र शारीरिक स्फूर्ति कायम रहनेछ।`,
      predictionEn: `Strong Ascendant vitality assures resilient immunity, mental clarity, and gradual recovery from chronic ailments through balanced lifestyle.`,
      rulingPlanetsNe: `सूर्य (आरोग्य कारक), लग्नेश (${lagna.rashiLordNe})`,
      rulingPlanetsEn: `Sun (Vitality), Lagna Lord (${lagna.rashiLordEn})`,
      auspiciousMonthsNe: 'असोज, कार्तिक, माघ र चैत्र',
      auspiciousMonthsEn: 'Sep-Nov, Jan-Feb, Mar-Apr',
      remediesNe: ['बिहान सूर्य नमस्कार गर्ने र महामृत्युञ्जय मन्त्रको जप गर्ने।'],
      remediesEn: ['Practice Surya Namaskar and chant Maha Mrityunjaya Mantra daily.']
    },
    {
      id: 'children',
      topicNe: 'सन्तान सुख तथा वंश वृद्धि',
      topicEn: 'Children & Progeny Bliss',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'Baby',
      score: Math.min(95, 72 + (jupiter.dignity === 'उच्च' || h5.signLordNe === 'गुरु' ? 15 : 6)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `५ औँ भाव (${h5.signNe}) सन्तान स्थानका कारक बृहस्पति (गुरु) को शुभ दृष्टिले सन्तान सुखको चाहना राख्ने दम्पतीहरूका लागि सन्तान प्राप्तिको उत्तम योग बन्छ। सन्तान भएका अभिभावकहरूका लागि छोराछोरीको शैक्षिक तथा पेशागत प्रगतिले हर्ष दिलाउनेछ।`,
      predictionEn: `Divine Jupiterian blessing upon the 5th house brings joyful news of childbirth for couples and proud achievements for grown children.`,
      rulingPlanetsNe: `गुरु (सन्तान कारक), ५ औँ भाव स्वामी (${h5.signLordNe})`,
      rulingPlanetsEn: `Jupiter (Santana Karaka), 5th Lord (${h5.signLordEn})`,
      auspiciousMonthsNe: 'जेठ, साउन, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'May-Jun, Jul-Aug, Nov-Dec, Feb-Mar',
      remediesNe: ['सन्तान गोपाल मन्त्र जप गर्ने र बिहीबार गाईलाई चनाको दाल र गुड खुवाउने।'],
      remediesEn: ['Feed soaked gram lentils and jaggery to cows on Thursdays.']
    },
    {
      id: 'family',
      topicNe: 'परिवार तथा पारिवारिक सुख',
      topicEn: 'Family Harmony & Peace',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'Users',
      score: Math.min(96, 74 + (moon.dignity === 'उच्च' || moon.dignity === 'स्वगृही' ? 12 : 5)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `२ औँ र ४ औँ भावको शुभ प्रभावले परिवारमा आपसी मेलमिलाप, सौहार्दता र उत्सवमय वातावरण रहनेछ। परिवारका अग्रजहरूको आशिर्वाद र सहयोगले घरमा माङ्गलिक कार्य (विवाह, ब्रतबन्ध, पूजा) सम्पन्न हुनेछन्।`,
      predictionEn: `Harmonious family vibrations support joyful domestic celebrations, auspicious religious rituals, and loving unity among family members.`,
      rulingPlanetsNe: `चन्द्रमा, गुरु, ४ औँ भाव स्वामी (${h4.signLordNe})`,
      rulingPlanetsEn: `Moon, Jupiter, 4th Lord (${h4.signLordEn})`,
      auspiciousMonthsNe: 'वैशाख, असोज, कार्तिक र माघ',
      auspiciousMonthsEn: 'Apr-May, Sep-Nov, Jan-Feb',
      remediesNe: ['घरमा सत्यनारायण भगवानको कथा पूजा गर्ने र आमा–बुबाको चरण स्पर्श गरी आशीर्वाद लिने।'],
      remediesEn: ['Seek blessings of parents and observe Satyanarayan Pooja.']
    },
    {
      id: 'marital_life',
      topicNe: 'दाम्पत्य जीवन तथा समझदारी',
      topicEn: 'Marital Life & Mutual Harmony',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'HeartHandshake',
      score: Math.min(95, 72 + (venus.houseNum === 7 || jupiter.houseNum === 7 ? 15 : 6)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `७ औँ भाव (${h7.signNe}) मा शुभ ग्रहको दृष्टिले जीवनसाथीसँगको सम्बन्ध अझै प्रगाढ र आत्मीय बन्नेछ। संयुक्त योजनाहरू सफल हुनेछन्। जीवनसाथीको नामबाट गरिएका कार्यहरूमा विशेष भाग्य वृद्धि हुनेछ।`,
      predictionEn: `Gentle marital atmosphere strengthens mutual trust, joyful joint endeavors, and reciprocal affection with your spouse.`,
      rulingPlanetsNe: `शुक्र, गुरु, ७ औँ भाव स्वामी (${h7.signLordNe})`,
      rulingPlanetsEn: `Venus, Jupiter, 7th Lord (${h7.signLordEn})`,
      auspiciousMonthsNe: 'असार, असोज, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'Jun-Jul, Sep-Oct, Nov-Dec, Feb-Mar',
      remediesNe: ['शुक्रवार सेतो मिठाई देवी मन्दिरमा चढाउने र जीवनसाथीलाई सम्मान गर्ने।'],
      remediesEn: ['Honor and support your spouse with mutual respect.']
    },
    {
      id: 'social_relations',
      topicNe: 'सम्बन्ध तथा मित्रमण्डली',
      topicEn: 'Social Relationships & Friends',
      categoryNe: 'सम्बन्ध तथा परिवार',
      categoryEn: 'Relationships & Family',
      iconName: 'Share2',
      score: Math.min(95, 75 + (mercury.houseNum === 11 ? 12 : 5)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `११ औँ भाव र बुधको अनुकूलताले समाजमा नयाँ प्रभावशाली व्यक्तिहरूसँग मित्रता गाँसिनेछ। साथीभाइको सहयोगले अप्ठ्यारा कामहरू सहजै सुल्झिनेछन् र सामाजिक सञ्जालमा लोकप्रियता बढ्नेछ।`,
      predictionEn: `Expansive social circle and loyal friendships open lucrative doors and offer sincere counsel throughout the year.`,
      rulingPlanetsNe: `बुध, ११ औँ भाव स्वामी (${h11.signLordNe})`,
      rulingPlanetsEn: `Mercury, 11th Lord (${h11.signLordEn})`,
      auspiciousMonthsNe: 'जेठ, भदौ, कार्तिक र माघ',
      auspiciousMonthsEn: 'May-Jun, Aug-Sep, Oct-Nov, Jan-Feb',
      remediesNe: ['मित्रहरूसँग स्वच्छ र पारदर्शी व्यवहार गर्ने।'],
      remediesEn: ['Maintain transparent, ethical relationships with all acquaintances.']
    },
    {
      id: 'future',
      topicNe: 'भविष्य तथा दीर्घकालीन योजना',
      topicEn: 'Future Prospects & Long-term Vision',
      categoryNe: 'ज्ञान तथा विद्या',
      categoryEn: 'Knowledge & Learning',
      iconName: 'Compass',
      score: Math.min(97, 76 + (combinedDashaScore > 70 ? 14 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `वर्ष ${targetYearAD} तपाईँको दीर्घकालीन भविष्यको जग बसाल्ने स्वर्णिम वर्ष बन्नेछ। अहिले गरिएका अध्ययन, लगानी वा वैदेशिक योजनाले आगामी ५ देखि १० वर्षसम्म निरन्तर शुभ फल र स्थायित्व प्रदान गर्नेछ।`,
      predictionEn: `Strategic long-term decisions formulated in ${targetYearAD} will yield compounding prosperity, security, and prestige for decades ahead.`,
      rulingPlanetsNe: `गुरु, सूर्य, लग्नेश (${lagna.rashiLordNe})`,
      rulingPlanetsEn: `Jupiter, Sun, Lagna Lord (${lagna.rashiLordEn})`,
      auspiciousMonthsNe: 'वैशाख, असार, असोज र पुस',
      auspiciousMonthsEn: 'Apr-May, Jun-Jul, Sep-Oct, Dec-Jan',
      remediesNe: ['नियमित लक्ष्य निर्धारण र इष्टदेवको आराधना गर्ने।'],
      remediesEn: ['Maintain disciplined daily spiritual routine and goal planning.']
    },
    {
      id: 'luck',
      topicNe: 'भाग्य तथा ईश्वर कृपा',
      topicEn: 'Fortune, Luck & Divine Grace',
      categoryNe: 'ज्ञान तथा विद्या',
      categoryEn: 'Knowledge & Learning',
      iconName: 'Sparkles',
      score: Math.min(98, 77 + (h9.signLordNe === activeDasha.maha.planetNe || jupiter.houseNum === 9 ? 16 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `९ औँ भाव (${h9.signNe}) भाग्य स्थानको स्वामी र देवगुरुको दृष्टिले गर्दा भाग्यको ८०% भन्दा बढी साथ रहनेछ। अचानक अवसरहरू आउनेछन्, रोकिएका सरकारी तथा कानुनी कामहरू फत्ते हुनेछन्।`,
      predictionEn: `Tremendous 9th house fortune unlocks unexpected breakthroughs, spiritual serenity, and divine synchronicities.`,
      rulingPlanetsNe: `गुरु (भाग्य कारक), ९ औँ भाव स्वामी (${h9.signLordNe})`,
      rulingPlanetsEn: `Jupiter (Fortune), 9th Lord (${h9.signLordEn})`,
      auspiciousMonthsNe: 'साउन, असोज, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'Jul-Aug, Sep-Oct, Nov-Dec, Feb-Mar',
      remediesNe: ['गुरुजन र विद्वान ब्राह्मणको सेवा गर्ने र मन्दिर दर्शन गर्ने।'],
      remediesEn: ['Respect mentors, spiritual teachers, and elders.']
    },
    {
      id: 'dasha_influence',
      topicNe: 'ग्रहदशा तथा गोचर प्रभाव',
      topicEn: 'Current Planetary Dasha Synergy',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Clock',
      score: combinedDashaScore,
      ratingNe: overallRatingNe as any,
      ratingEn: overallRatingEn as any,
      predictionNe: `यस वर्ष ${activeDasha.maha.planetNe} महादशा अन्तर्गत ${activeDasha.antar.planetNe} को अन्तर्दशा सक्रिय छ। ${activeDasha.maha.planetNe} को कुण्डलीमा ${dashaLordPlanet.houseNum} औँ भावमा स्थितिले गर्दा यस भावसँग सम्बन्धित कार्यहरूमा सर्वाधिक प्रगति र परिणाम प्राप्त हुनेछ।`,
      predictionEn: `Active ${activeDasha.maha.planetEn} Mahadasha combined with ${activeDasha.antar.planetEn} Antardasha activates the core potentials of house ${dashaLordPlanet.houseNum}.`,
      rulingPlanetsNe: `${activeDasha.maha.planetNe} (महादशा), ${activeDasha.antar.planetNe} (अन्तर्दशा)`,
      rulingPlanetsEn: `${activeDasha.maha.planetEn} (Maha), ${activeDasha.antar.planetEn} (Antar)`,
      auspiciousMonthsNe: 'दशा परिवर्तन हुने र शुभ गोचरका महिनाहरू',
      auspiciousMonthsEn: 'Transit activation months',
      remediesNe: [`${activeDasha.maha.planetNe} ग्रहको बीज मन्त्र नित्य १०८ पटक जप गर्ने।`],
      remediesEn: [`Chant the Beej Mantra of ${activeDasha.maha.planetEn} 108 times daily.`]
    },
    {
      id: 'kundali_synergy',
      topicNe: 'कुण्डली तथा ग्रह सामर्थ्य',
      topicEn: 'Birth Chart Planetary Strength',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'ShieldCheck',
      score: Math.min(96, 75 + (kundali.yogas?.filter((y) => y.isPresent).length || 0) * 3),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `कुण्डलीमा लग्न ${kundali.lagna} र चन्द्र राशी ${kundali.rashi} को संयोजन बलियो छ। सक्रिय राजयोग र धनयोगहरूले यस वर्ष विशेष फल दिने अनुकूल समय सुरु भएको छ।`,
      predictionEn: `Powerful synergy between Lagna (${kundali.lagna}) and Moon sign (${kundali.rashi}) amplifies positive natal Raj Yogas.`,
      rulingPlanetsNe: `लग्नेश (${lagna.rashiLordNe}), राशी स्वामी (${moon.rashiLordNe})`,
      rulingPlanetsEn: `Lagna Lord (${lagna.rashiLordEn}), Rashi Lord (${moon.rashiLordEn})`,
      auspiciousMonthsNe: 'वर्षभरिका मुख्य शुभ महिनाहरू',
      auspiciousMonthsEn: 'All auspicious peak months',
      remediesNe: ['इष्टदेवताको नित्य स्मरण र धर्म सम्मत आचरण।'],
      remediesEn: ['Uphold righteous moral conduct and daily prayers.']
    },
    {
      id: 'auspicious_timing',
      topicNe: 'शुभ समय र मुख्य महिनाहरू',
      topicEn: 'Auspicious Months & Peak Timing',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Calendar',
      score: 95,
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `वर्ष ${targetYearAD} मा नयाँ कामको थालनी, लगानी, वैदेशिक प्रक्रिया, विवाह वा सम्झौताका लागि वैशाख, असार, असोज, कार्तिक र माघ महिना सर्वाधिक फलदायी र सफलता प्रदायक रहनेछन्।`,
      predictionEn: `Prime auspicious months for commencing high-stakes business, visa filings, investments, or marriage ceremonies are highlighted.`,
      rulingPlanetsNe: `सूर्य (गोचर), चन्द्र (पञ्चाङ्ग)`,
      rulingPlanetsEn: `Sun (Transit), Moon (Panchanga)`,
      auspiciousMonthsNe: 'वैशाख, असार, असोज, कार्तिक र माघ',
      auspiciousMonthsEn: 'Apr-May, Jun-Jul, Sep-Nov, Jan-Feb',
      remediesNe: ['शुभ मुहूर्त हेरेर मात्र महत्त्वपूर्ण कार्य प्रारम्भ गर्ने।'],
      remediesEn: ['Consult favorable Choghadiya or Shubh Muhurat for milestone projects.']
    },
    {
      id: 'investments',
      topicNe: 'लगानी तथा शेयर बजार',
      topicEn: 'Investments, Stock Market & Trading',
      categoryNe: 'आर्थिक तथा सम्पत्ति',
      categoryEn: 'Finance & Assets',
      iconName: 'TrendingUp',
      score: Math.min(95, 73 + (mercury.houseNum === 5 || jupiter.houseNum === 11 ? 14 : 5)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `५ औँ भाव (सट्टेबाजी/शेयर) र ११ औँ भाव (लाभ) को दृष्टिले दीर्घकालीन शेयर लगानी, हाइड्रोपावर, बैंकिङ र प्रविधि क्षेत्रमा गरिएको लगानीबाट आकर्षक पूँजीगत लाभ हुनेछ। छोटो अवधिको अत्यधिक जोखिमयुक्त ट्रेडिङमा भने सतर्कता अपनाउनुहोला।`,
      predictionEn: `Strategic long-term equity, renewable energy, and institutional investments yield impressive capital compounding.`,
      rulingPlanetsNe: `बुध, बृहस्पति, राहु`,
      rulingPlanetsEn: `Mercury, Jupiter, Rahu`,
      auspiciousMonthsNe: 'असार, असोज, मङ्सिर र फागुन',
      auspiciousMonthsEn: 'Jun-Jul, Sep-Oct, Nov-Dec, Feb-Mar',
      remediesNe: ['बुधबार गणेश मन्दिरमा हरियो फल वा मोदक चढाउने।'],
      remediesEn: ['Offer green fruits to Lord Ganesha on Wednesdays.']
    },
    {
      id: 'debts_loans',
      topicNe: 'ऋण, कर्जा र मुक्ति',
      topicEn: 'Debts, Loans & Debt Clearance',
      categoryNe: 'आर्थिक तथा सम्पत्ति',
      categoryEn: 'Finance & Assets',
      iconName: 'CheckCircle2',
      score: Math.min(94, 72 + (mars.houseNum === 6 ? 15 : 5)),
      ratingNe: 'सन्तुलित',
      ratingEn: 'Balanced',
      predictionNe: `६ औँ भाव (ऋण स्थान) को प्रभावले बैंक कर्जा (Home Loan/Business Loan) सहजै स्वीकृत हुनेछ। पुराना ऋणहरू क्रमशः चुक्ता हुँदै जानेछन् र आर्थिक बोझबाट मुक्ति मिल्ने वातावरण बन्नेछ।`,
      predictionEn: `Smooth institutional loan approvals for productive assets alongside disciplined clearance of existing liabilities.`,
      rulingPlanetsNe: `मंगल (ऋण हर्ता), ६ औँ भाव स्वामी (${h6.signLordNe})`,
      rulingPlanetsEn: `Mars (Debt reliever), 6th Lord (${h6.signLordEn})`,
      auspiciousMonthsNe: 'मंगलबार ऋण किस्ता बुझाउँदा छिटो चुक्ता हुने योग छ।',
      auspiciousMonthsEn: 'Tuesdays are optimal for debt repayment.',
      remediesNe: ['मंगलबार ऋणमोचक मंगल स्तोत्र पाठ गर्ने।'],
      remediesEn: ['Recite Rina Mochaka Mangala Stotram on Tuesdays.']
    },
    {
      id: 'legal_disputes',
      topicNe: 'कानुनी मुद्दा तथा प्रतिस्पर्धा',
      topicEn: 'Legal Matters, Disputes & Victory',
      categoryNe: 'पेशा तथा व्यवसाय',
      categoryEn: 'Career & Business',
      iconName: 'ShieldAlert',
      score: Math.min(95, 74 + (mars.houseNum === 6 || sun.houseNum === 6 ? 16 : 6)),
      ratingNe: 'अति शुभ (विजय योग)',
      ratingEn: 'Victory Assured',
      predictionNe: `६ औँ भावमा शत्रुहन्ता योग सक्रिय रहेकाले कुनै कानुनी विवाद वा प्रतिस्पर्धी चुनौती भएमा तपाईँको पक्षमा फैसला आउनेछ। शत्रुहरू परास्त हुनेछन् र तपाईँको प्रतिष्ठा अक्षुण्ण रहनेछ।`,
      predictionEn: `Shatru Hanta Yoga decisively guarantees victory over competitors and favorable legal settlements.`,
      rulingPlanetsNe: `मंगल, सूर्य, ६ औँ भाव स्वामी (${h6.signLordNe})`,
      rulingPlanetsEn: `Mars, Sun, 6th Lord (${h6.signLordEn})`,
      auspiciousMonthsNe: 'जेठ, भदौ, कार्तिक र माघ',
      auspiciousMonthsEn: 'May-Jun, Aug-Sep, Oct-Nov, Jan-Feb',
      remediesNe: ['बगलामुखी मन्त्र वा हनुमान बाहुक पाठ गर्ने।'],
      remediesEn: ['Chant Baglamukhi Stotram for protection and victory.']
    },
    {
      id: 'social_fame',
      topicNe: 'सामाजिक प्रतिष्ठा र सम्मान',
      topicEn: 'Social Fame, Honor & Recognition',
      categoryNe: 'पेशा तथा व्यवसाय',
      categoryEn: 'Career & Business',
      iconName: 'Award',
      score: Math.min(97, 76 + (sun.dignity === 'उच्च' || jupiter.houseNum === 10 ? 15 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `१० औँ र ११ औँ भावको शुभ प्रभावले समाज, संघ–संस्था वा कार्यक्षेत्रमा तपाईँको कामको कदर हुनेछ। मान–सम्मान, पुरस्कार तथा प्रशंसा पत्र प्राप्त हुनेछ।`,
      predictionEn: `Ascending solar and Jupiterian prestige earns public accolades, civic awards, and widespread organizational acclaim.`,
      rulingPlanetsNe: `सूर्य, गुरु, १० औँ भाव स्वामी (${h10.signLordNe})`,
      rulingPlanetsEn: `Sun, Jupiter, 10th Lord (${h10.signLordEn})`,
      auspiciousMonthsNe: 'वैशाख, असार, असोज र पुस',
      auspiciousMonthsEn: 'Apr-May, Jun-Jul, Sep-Oct, Dec-Jan',
      remediesNe: ['नित्य बिहान पिता वा गुरुजनलाई आदर गर्ने।'],
      remediesEn: ['Respect elders and state authorities.']
    },
    {
      id: 'spirituality',
      topicNe: 'आध्यात्मिक साधना र तीर्थाटन',
      topicEn: 'Spiritual Life, Meditation & Pilgrimage',
      categoryNe: 'ज्ञान तथा विद्या',
      categoryEn: 'Knowledge & Learning',
      iconName: 'Sparkle',
      score: Math.min(97, 77 + (ketu.houseNum === 12 || ketu.houseNum === 9 ? 16 : 6)),
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `९ औँ र १२ औँ भावको आध्यात्मिक संयोजनले गर्दा मनमा शान्ति, ध्यान, योग र मन्त्र साधनामा गहिरो रुचि रहनेछ। प्रसिद्ध धाम वा शक्तिपीठको तीर्थयात्रा सम्पन्न हुनेछ।`,
      predictionEn: `Sublime spiritual connectivity fosters inner tranquility, deep meditative insights, and sacred pilgrimages.`,
      rulingPlanetsNe: `केतु (मोक्ष कारक), गुरु (धर्म कारक)`,
      rulingPlanetsEn: `Ketu (Moksha), Jupiter (Dharma)`,
      auspiciousMonthsNe: 'साउन (श्रावण), असोज (नवरात्र), माघ र फागुन (महाशिवरात्रि)',
      auspiciousMonthsEn: 'Jul-Aug, Sep-Oct, Jan-Feb, Feb-Mar',
      remediesNe: ['रुद्राभिषेक गर्ने र शिव मन्त्र ॐ नमः शिवाय जप गर्ने।'],
      remediesEn: ['Perform Rudrabhisheka and meditate upon Om Namah Shivaya.']
    },
    {
      id: 'major_transitions',
      topicNe: 'जीवनका ठूला परिवर्तन',
      topicEn: 'Major Life Transformations & Turning Points',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Shuffle',
      score: Math.min(95, 74 + (activeDasha.maha.planetNe !== activeDasha.antar.planetNe ? 12 : 5)),
      ratingNe: 'सकारात्मक परिवर्तन',
      ratingEn: 'Transformative',
      predictionNe: `यस वर्ष स्थान परिवर्तन, नयाँ करियर वा नयाँ पारिवारिक अध्याय सुरु हुने बलियो योग छ। यी परिवर्तनहरू सुरुमा चुनौतीपूर्ण देखिए पनि अन्ततः तपाईँको जीवनको उन्नतिका लागि कोशेढुङ्गा साबित हुनेछन्।`,
      predictionEn: `Decisive astrological inflection point ushers in transformative residential, professional, and personal rebirth.`,
      rulingPlanetsNe: `राहु, केतु, ८ औँ भाव स्वामी (${houses[7]?.signLordNe || 'मंगल'})`,
      rulingPlanetsEn: `Rahu, Ketu, 8th Lord`,
      auspiciousMonthsNe: 'दशा सन्धिको समय',
      auspiciousMonthsEn: 'Dasha transition junctions',
      remediesNe: ['परिवर्तनलाई सकारात्मक रूपमा स्वीकार्ने र धैर्य राख्ने।'],
      remediesEn: ['Embrace changes with positive resilience and patience.']
    },
    {
      id: 'dasha_synergy',
      topicNe: 'दशा–अन्तर्दशा तालमेल',
      topicEn: 'Dasha-Antardasha Harmony & Synergy',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Layers',
      score: combinedDashaScore,
      ratingNe: overallRatingNe as any,
      ratingEn: overallRatingEn as any,
      predictionNe: `${activeDasha.maha.planetNe} र ${activeDasha.antar.planetNe} बीचको मैत्री सम्बन्ध अनुकूल रहेकाले यस अवधिमा कार्यमा स्थायित्व, मानसिक सन्तुष्टि र अपेक्षित उपलब्धि प्राप्त हुनेछ।`,
      predictionEn: `Harmonious interplay between ${activeDasha.maha.planetEn} and ${activeDasha.antar.planetEn} brings stable progress and milestone achievements.`,
      rulingPlanetsNe: `${activeDasha.maha.planetNe} र ${activeDasha.antar.planetNe}`,
      rulingPlanetsEn: `${activeDasha.maha.planetEn} & ${activeDasha.antar.planetEn}`,
      auspiciousMonthsNe: 'वर्षभरि',
      auspiciousMonthsEn: 'Throughout the year',
      remediesNe: ['दुवै ग्रहको शान्ति तथा जप गर्ने।'],
      remediesEn: ['Perform planetary pacification and mantras for both planets.']
    },
    {
      id: 'planetary_transits',
      topicNe: 'गोचर ग्रह प्रभाव (Transits)',
      topicEn: 'Planetary Transits & Cosmic Angles',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Orbit',
      score: Math.min(95, 73 + (jupiter.dignity === 'उच्च' ? 12 : 5)),
      ratingNe: 'शुभ',
      ratingEn: 'Good',
      predictionNe: `देवगुरु बृहस्पति र शनिको गोचर स्थिति तपाईँको चन्द्र राशी (${kundali.rashi}) बाट अनुकूल भावमा रहेकाले बाधाहरू हटेर भाग्य चम्किनेछ।`,
      predictionEn: `Auspicious transits of Jupiter and Saturn relative to natal Moon sign (${kundali.rashi}) remove obstacles and elevate fortune.`,
      rulingPlanetsNe: `गुरु, शनि, राहु–केतु`,
      rulingPlanetsEn: `Jupiter, Saturn, Rahu-Ketu`,
      auspiciousMonthsNe: 'गोचर राशी परिवर्तनका महिनाहरू',
      auspiciousMonthsEn: 'Transit ingress months',
      remediesNe: ['शनि मन्त्र र गुरु मन्त्र जप गर्ने।'],
      remediesEn: ['Chant Shani and Guru mantras.']
    },
    {
      id: 'dosha_remedies',
      topicNe: 'दोष तथा निवारण उपाय',
      topicEn: 'Dosha Rectification & Remedial Measures',
      categoryNe: 'दशा तथा ज्योतिषीय स्थिति',
      categoryEn: 'Dasha & Astrological Synergy',
      iconName: 'Flame',
      score: 96,
      ratingNe: 'अति शुभ',
      ratingEn: 'Excellent',
      predictionNe: `यस वर्ष ग्रहदोष निवारणका लागि कुलदेवताको पूजा, ${activeDasha.maha.planetNe} ग्रहको मन्त्र जप, रुद्राभिषेक र भाग्यशाली रत्न (${kundali.luckyGemstone || 'माणिक्य'}) को धारणले सबै अशुभ प्रभाव नष्ट भई शतप्रतिशत शुभ फल प्राप्त हुनेछ।`,
      predictionEn: `Vedic astrological remedies, gemstone alignment (${kundali.luckyGemstone}), and Navagraha mantras neutralize malefic energies and amplify luck.`,
      rulingPlanetsNe: `नवग्रह (All 9 Planets)`,
      rulingPlanetsEn: `Navagraha`,
      auspiciousMonthsNe: 'वैशाख, साउन, असोज र माघ',
      auspiciousMonthsEn: 'Apr, Jul, Sep, Jan',
      remediesNe: [
        `इष्टदेव तथा कुलदेवताको नित्य स्मरण गर्ने।`,
        `${activeDasha.maha.planetNe} ग्रहको बीज मन्त्र नियमित जप गर्ने।`,
        `भाग्यशाली रत्न ${kundali.luckyGemstone || 'माणिक्य'} विधिवत प्राणप्रतिष्ठा गरी धारण गर्ने।`
      ],
      remediesEn: [
        `Daily prayers to your Ishta Devata and Kuladevata.`,
        `Chant the Beej Mantra of active Dasha lord ${activeDasha.maha.planetEn}.`,
        `Wear your lucky gemstone ${kundali.luckyGemstone} with proper consecration.`
      ]
    }
  ];

  // =========================================================================
  // 3. COMPLETE 12 BHAVAS YEARLY INTERPRETATION (१२ भाव विश्लेषण)
  // =========================================================================
  const bhavas: BhavaYearlyPhalit[] = BHAVAS_INFO.map((bInfo) => {
    const hDetail = houses[bInfo.houseNum - 1] || {
      signNe: 'मेष',
      signEn: 'Aries',
      signLordNe: 'मंगल',
      signLordEn: 'Mars'
    };

    const lordPlanet = planets.find((p) => p.nameNe === hDetail.signLordNe) || planets[0];
    const lordScore = getPlanetScore(lordPlanet);
    const bScore = Math.max(35, Math.min(97, Math.round((lordScore + combinedDashaScore) / 2)));

    const analysisNe = `वर्ष ${targetYearAD} AD (वि.सं. ${toNepaliDigits(targetYearBS)} BS) मा ${bInfo.titleNe} (${hDetail.signNe} राशी, स्वामी ${hDetail.signLordNe}) मा सक्रिय ग्रह प्रभावका कारण ${bInfo.coreThemesNe} सम्बन्धी विषयहरूमा सकारात्मक प्रगति हुनेछ। ${activeDasha.maha.planetNe} महादशाको शुभ दृष्टिले यस भावका फलहरू थप बलिया हुनेछन्।`;
    const analysisEn = `In ${targetYearAD} AD (BS ${targetYearBS}), the ${bInfo.titleEn} (Sign: ${hDetail.signEn}, Lord: ${hDetail.signLordEn}) experiences fruitful cosmic stimulation affecting ${bInfo.coreThemesEn}.`;

    return {
      houseNum: bInfo.houseNum,
      signNe: hDetail.signNe,
      signEn: hDetail.signEn,
      signLordNe: hDetail.signLordNe,
      signLordEn: hDetail.signLordEn,
      titleNe: bInfo.titleNe,
      titleEn: bInfo.titleEn,
      coreThemesNe: bInfo.coreThemesNe,
      coreThemesEn: bInfo.coreThemesEn,
      statusScore: bScore,
      analysisNe,
      analysisEn,
      keyEventsNe: bInfo.keyAspectsNe,
      keyEventsEn: bInfo.keyAspectsEn
    };
  });

  const overallSummaryNe = `${kundali.name} ज्यू, वर्ष ${targetYearAD} AD (वि.सं. ${toNepaliDigits(targetYearBS)} BS) मा तपाईँको उमेर ${toNepaliDigits(ageYears)} वर्ष पुग्दा ${activeDasha.maha.planetNe} महादशा अन्तर्गत ${activeDasha.antar.planetNe} अन्तर्दशा चल्नेछ। कुण्डलीको १० औँ भाव (करियर), २/११ औँ भाव (धन–लाभ) र १२ औँ भाव (विदेश यात्रा) को उत्कृष्ट योगले गर्दा यो वर्ष आर्थिक, पेशागत तथा वैदेशिक क्षेत्रमा असाधारण फड्को मार्ने स्वर्णिम वर्ष साबित हुनेछ।`;
  const overallSummaryEn = `For ${kundali.name}, the year ${targetYearAD} AD (BS ${targetYearBS}) at Age ${ageYears} under ${activeDasha.maha.planetEn} Mahadasha and ${activeDasha.antar.planetEn} Antardasha brings transformative breakthroughs in Career (10th house), Financial Prosperity (2nd/11th house), and Foreign Endeavors (12th house).`;

  return {
    yearAD: targetYearAD,
    yearBS: targetYearBS,
    ageYears,
    ageTextNe: `${toNepaliDigits(ageYears)} वर्ष`,
    ageTextEn: `${ageYears} Years`,
    dashaInfo: {
      mahadashaNe: activeDasha.maha.planetNe,
      mahadashaEn: activeDasha.maha.planetEn,
      antardashaNe: activeDasha.antar.planetNe,
      antardashaEn: activeDasha.antar.planetEn,
      pratyantardashaNe: activeDasha.pratyantar.planetNe,
      pratyantardashaEn: activeDasha.pratyantar.planetEn,
      periodSummaryNe: activeDasha.periodSummaryNe,
      periodSummaryEn: activeDasha.periodSummaryEn,
      mahadashaLordHouse: dashaLordPlanet.houseNum,
      antardashaLordHouse: antarLordPlanet.houseNum,
      pratyantardashaLordHouse: pratyantarLordPlanet.houseNum,
      dashaLordDignityNe: dashaLordPlanet.dignity || 'सम',
      dashaLordDignityEn: dashaLordPlanet.dignityEn || 'Neutral'
    },
    overallSummaryNe,
    overallSummaryEn,
    overallScore,
    overallRatingNe,
    overallRatingEn,
    keyAuspiciousMonthsNe: ['वैशाख', 'असार', 'असोज', 'कार्तिक', 'माघ', 'फागुन'],
    keyAuspiciousMonthsEn: ['Apr-May', 'Jun-Jul', 'Sep-Nov', 'Jan-Mar'],
    cautionMonthsNe: ['असार मध्य', 'पुस उत्तरार्ध'],
    cautionMonthsEn: ['Mid-July', 'Late December'],
    topics,
    bhavas,
    foreignTravelAnalysis: {
      travelYogaStrengthNe: is12Water || is12Air ? 'अति प्रबल (९५%)' : 'प्रबल (८२%)',
      travelYogaStrengthEn: is12Water || is12Air ? 'Very Strong (95%)' : 'Strong (82%)',
      settlementProspectsNe: 'विदेश यात्रा, अध्ययन तथा करियरका लागि कुण्डलीमा विशिष्ट योग',
      settlementProspectsEn: 'Highly Auspicious for Overseas Studies, Career and Settlement',
      visaSuccessTimingNe: 'भाद्र, असोज, माघ र चैत्र महिनामा भिसा आवेदन गर्दा सर्वोत्तम सफलता मिल्नेछ।',
      visaSuccessTimingEn: 'Visa filing during Aug-Oct & Jan-Apr ensures optimal approval.',
      bestCountryAdviceNe: `तपाईंको कुण्डली (लग्न: ${kundali.lagna}, राशी: ${kundali.rashi}, १२ औँ भाव: ${h12.signNe}) मा विदेश, करियर र आर्थिक अवसरसँग सम्बन्धित संकेतहरू बलियो भएकाले ${recommendedDestinations[0]?.countryNe || 'UAE'} विशेष रूपमा अनुकूल देखिन्छ। ${recommendedDestinations[1] ? `${recommendedDestinations[1].countryNe} पनि राम्रो दोस्रो विकल्प देखिन्छ।` : ''}${recommendedDestinations[2] ? ` ${recommendedDestinations[2].countryNe} पनि अनुकूल विकल्प रहनेछ।` : ''}`,
      bestCountryAdviceEn: `Based on your natal chart (Lagna: ${kundali.lagna}, Moon Sign: ${kundali.rashi}, 12th House: ${h12.signEn}) and current planetary alignments, ${recommendedDestinations[0]?.countryEn || 'UAE'} is exceptionally auspicious. ${recommendedDestinations[1] ? `${recommendedDestinations[1].countryEn} stands as a strong second choice.` : ''}${recommendedDestinations[2] ? ` ${recommendedDestinations[2].countryEn} is also highly suitable.` : ''}`,
      recommendedDestinations
    },
    yearlyRemediesNe: [
      `कुलदेवता तथा इष्टदेवको नित्य पूजा आराधना गर्ने।`,
      `${activeDasha.maha.planetNe} महादशा स्वामी ग्रहको बीज मन्त्र नित्य १०८ पटक जप गर्ने।`,
      `बिहान सूर्य देवलाई तामाको लोटाबाट जल अर्पण गर्ने र गायत्री मन्त्र पाठ गर्ने।`,
      `वैदेशिक कार्य र भिसा सफलताका लागि राहु तथा चन्द्रमाको शान्ति अनुष्ठान गर्ने।`
    ],
    yearlyRemediesEn: [
      `Daily worship of Kuladevata and Ishta Devata.`,
      `Chant 108 repetitions of active Dasha Lord (${activeDasha.maha.planetEn}) Beej Mantra.`,
      `Offer morning water Arghya to Lord Surya with copper vessel.`,
      `Perform planetary pacification for Rahu and Moon for smooth overseas success.`
    ]
  };
}
