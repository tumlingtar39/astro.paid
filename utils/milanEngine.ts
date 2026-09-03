import {
  KundaliInput,
  KundaliResult,
  MilanKootDetail,
  BhakootRelation,
  NadiDoshaAnalysis,
  ManglikAnalysisPerson,
  ManglikMatchAnalysis,
  KundaliMilanResult,
  DetailedPlanetPosition
} from '../types';
import { RASHI_NAMES, NAKSHATRA_NAMES, calculateFullKundali } from './kundaliEngine';

// =========================================================================
// 1. ASTROLOGICAL REFERENCE TABLES FOR ASHTAKOOT & AVAKHADA CHAKRA
// =========================================================================

export interface NakshatraAvakhada {
  index: number;
  nameNe: string;
  nameEn: string;
  yoni: string; // 14 Yonis
  yoniEn: string;
  gana: 'देव' | 'मनुष्य' | 'राक्षस';
  ganaEn: 'Deva' | 'Manushya' | 'Rakshasa';
  nadi: 'आदि' | 'मध्य' | 'अन्त्य';
  nadiEn: 'Aadi' | 'Madhya' | 'Antya';
  rulerNe: string;
  rulerEn: string;
}

export const NAKSHATRA_AVAKHADA_TABLE: NakshatraAvakhada[] = [
  { index: 0, nameNe: 'अश्विनी', nameEn: 'Ashwini', yoni: 'अश्व (Horse)', yoniEn: 'Horse', gana: 'देव', ganaEn: 'Deva', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'केतु', rulerEn: 'Ketu' },
  { index: 1, nameNe: 'भरणी', nameEn: 'Bharani', yoni: 'गज (Elephant)', yoniEn: 'Elephant', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शुक्र', rulerEn: 'Venus' },
  { index: 2, nameNe: 'कृत्तिका', nameEn: 'Krittika', yoni: 'मेष (Sheep/Goat)', yoniEn: 'Sheep', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'सूर्य', rulerEn: 'Sun' },
  { index: 3, nameNe: 'रोहिणी', nameEn: 'Rohini', yoni: 'सर्प (Serpent)', yoniEn: 'Serpent', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'चन्द्र', rulerEn: 'Moon' },
  { index: 4, nameNe: 'मृगशिरा', nameEn: 'Mrigashira', yoni: 'सर्प (Serpent)', yoniEn: 'Serpent', gana: 'देव', ganaEn: 'Deva', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'मंगल', rulerEn: 'Mars' },
  { index: 5, nameNe: 'आर्द्रा', nameEn: 'Ardra', yoni: 'श्वान (Dog)', yoniEn: 'Dog', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'राहु', rulerEn: 'Rahu' },
  { index: 6, nameNe: 'पुनर्वसु', nameEn: 'Punarvasu', yoni: 'मार्जार (Cat)', yoniEn: 'Cat', gana: 'देव', ganaEn: 'Deva', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'गुरु', rulerEn: 'Jupiter' },
  { index: 7, nameNe: 'पुष्य', nameEn: 'Pushya', yoni: 'मेष (Sheep/Goat)', yoniEn: 'Sheep', gana: 'देव', ganaEn: 'Deva', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शनि', rulerEn: 'Saturn' },
  { index: 8, nameNe: 'आश्लेषा', nameEn: 'Ashlesha', yoni: 'मार्जार (Cat)', yoniEn: 'Cat', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'बुध', rulerEn: 'Mercury' },
  { index: 9, nameNe: 'मघा', nameEn: 'Magha', yoni: 'मूषक (Rat)', yoniEn: 'Rat', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'केतु', rulerEn: 'Ketu' },
  { index: 10, nameNe: 'पूर्वाफाल्गुनी', nameEn: 'Purva Phalguni', yoni: 'मूषक (Rat)', yoniEn: 'Rat', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शुक्र', rulerEn: 'Venus' },
  { index: 11, nameNe: 'उत्तराफाल्गुनी', nameEn: 'Uttara Phalguni', yoni: 'गौ (Cow)', yoniEn: 'Cow', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'सूर्य', rulerEn: 'Sun' },
  { index: 12, nameNe: 'हस्त', nameEn: 'Hasta', yoni: 'महिष (Buffalo)', yoniEn: 'Buffalo', gana: 'देव', ganaEn: 'Deva', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'चन्द्र', rulerEn: 'Moon' },
  { index: 13, nameNe: 'चित्रा', nameEn: 'Chitra', yoni: 'व्याघ्र (Tiger)', yoniEn: 'Tiger', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'मंगल', rulerEn: 'Mars' },
  { index: 14, nameNe: 'स्वाती', nameEn: 'Swati', yoni: 'महिष (Buffalo)', yoniEn: 'Buffalo', gana: 'देव', ganaEn: 'Deva', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'राहु', rulerEn: 'Rahu' },
  { index: 15, nameNe: 'विशाखा', nameEn: 'Vishakha', yoni: 'व्याघ्र (Tiger)', yoniEn: 'Tiger', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'गुरु', rulerEn: 'Jupiter' },
  { index: 16, nameNe: 'अनुराधा', nameEn: 'Anuradha', yoni: 'मृग (Deer)', yoniEn: 'Deer', gana: 'देव', ganaEn: 'Deva', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शनि', rulerEn: 'Saturn' },
  { index: 17, nameNe: 'ज्येष्ठा', nameEn: 'Jyeshtha', yoni: 'मृग (Deer)', yoniEn: 'Deer', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'बुध', rulerEn: 'Mercury' },
  { index: 18, nameNe: 'मूल', nameEn: 'Mula', yoni: 'श्वान (Dog)', yoniEn: 'Dog', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'केतु', rulerEn: 'Ketu' },
  { index: 19, nameNe: 'पूर्वाषाढा', nameEn: 'Purva Ashadha', yoni: 'वानर (Monkey)', yoniEn: 'Monkey', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शुक्र', rulerEn: 'Venus' },
  { index: 20, nameNe: 'उत्तराषाढा', nameEn: 'Uttara Ashadha', yoni: 'नकुल (Mongoose)', yoniEn: 'Mongoose', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'सूर्य', rulerEn: 'Sun' },
  { index: 21, nameNe: 'श्रवण', nameEn: 'Shravana', yoni: 'वानर (Monkey)', yoniEn: 'Monkey', gana: 'देव', ganaEn: 'Deva', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'चन्द्र', rulerEn: 'Moon' },
  { index: 22, nameNe: 'धनिष्ठा', nameEn: 'Dhanishta', yoni: 'सिंह (Lion)', yoniEn: 'Lion', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'मंगल', rulerEn: 'Mars' },
  { index: 23, nameNe: 'शतभिषा', nameEn: 'Shatabhisha', yoni: 'अश्व (Horse)', yoniEn: 'Horse', gana: 'राक्षस', ganaEn: 'Rakshasa', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'राहु', rulerEn: 'Rahu' },
  { index: 24, nameNe: 'पूर्वाभाद्रपदा', nameEn: 'Purva Bhadrapada', yoni: 'सिंह (Lion)', yoniEn: 'Lion', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'आदि', nadiEn: 'Aadi', rulerNe: 'गुरु', rulerEn: 'Jupiter' },
  { index: 25, nameNe: 'उत्तराभाद्रपदा', nameEn: 'Uttara Bhadrapada', yoni: 'गौ (Cow)', yoniEn: 'Cow', gana: 'मनुष्य', ganaEn: 'Manushya', nadi: 'मध्य', nadiEn: 'Madhya', rulerNe: 'शनि', rulerEn: 'Saturn' },
  { index: 26, nameNe: 'रेवती', nameEn: 'Revati', yoni: 'गज (Elephant)', yoniEn: 'Elephant', gana: 'देव', ganaEn: 'Deva', nadi: 'अन्त्य', nadiEn: 'Antya', rulerNe: 'बुध', rulerEn: 'Mercury' }
];

// Rashi Varna Mapping (Water=Brahmin/4, Fire=Kshatriya/3, Earth=Vaishya/2, Air=Shudra/1)
export const RASHI_VARNA: { [rashiIdx: number]: { varnaNe: string; varnaEn: string; rank: number } } = {
  0: { varnaNe: 'क्षत्रिय (Kshatriya)', varnaEn: 'Kshatriya', rank: 3 }, // Aries
  1: { varnaNe: 'वैश्य (Vaishya)', varnaEn: 'Vaishya', rank: 2 },       // Taurus
  2: { varnaNe: 'शूद्र (Shudra)', varnaEn: 'Shudra', rank: 1 },         // Gemini
  3: { varnaNe: 'ब्राह्मण (Brahmin)', varnaEn: 'Brahmin', rank: 4 },   // Cancer
  4: { varnaNe: 'क्षत्रिय (Kshatriya)', varnaEn: 'Kshatriya', rank: 3 }, // Leo
  5: { varnaNe: 'वैश्य (Vaishya)', varnaEn: 'Vaishya', rank: 2 },       // Virgo
  6: { varnaNe: 'शूद्र (Shudra)', varnaEn: 'Shudra', rank: 1 },         // Libra
  7: { varnaNe: 'ब्राह्मण (Brahmin)', varnaEn: 'Brahmin', rank: 4 },   // Scorpio
  8: { varnaNe: 'क्षत्रिय (Kshatriya)', varnaEn: 'Kshatriya', rank: 3 }, // Sagittarius
  9: { varnaNe: 'वैश्य (Vaishya)', varnaEn: 'Vaishya', rank: 2 },       // Capricorn
  10: { varnaNe: 'शूद्र (Shudra)', varnaEn: 'Shudra', rank: 1 },        // Aquarius
  11: { varnaNe: 'ब्राह्मण (Brahmin)', varnaEn: 'Brahmin', rank: 4 }    // Pisces
};

// Rashi Vashya Mapping
export const RASHI_VASHYA: { [rashiIdx: number]: { vashyaNe: string; vashyaEn: string; type: string } } = {
  0: { vashyaNe: 'चतुष्पद (Quadruped)', vashyaEn: 'Chatushpada', type: 'chatushpada' }, // Aries
  1: { vashyaNe: 'चतुष्पद (Quadruped)', vashyaEn: 'Chatushpada', type: 'chatushpada' }, // Taurus
  2: { vashyaNe: 'मानव / द्विपद (Human)', vashyaEn: 'Manava', type: 'manava' },           // Gemini
  3: { vashyaNe: 'जलचर (Aquatic)', vashyaEn: 'Jalachara', type: 'jalachara' },           // Cancer
  4: { vashyaNe: 'वनचर / सिंह (Wild)', vashyaEn: 'Vanachara', type: 'vanachara' },        // Leo
  5: { vashyaNe: 'मानव / द्विपद (Human)', vashyaEn: 'Manava', type: 'manava' },           // Virgo
  6: { vashyaNe: 'मानव / द्विपद (Human)', vashyaEn: 'Manava', type: 'manava' },           // Libra
  7: { vashyaNe: 'कीट (Insect)', vashyaEn: 'Keeta', type: 'keeta' },                     // Scorpio
  8: { vashyaNe: 'मानव / द्विपद (Human)', vashyaEn: 'Manava', type: 'manava' },           // Sagittarius
  9: { vashyaNe: 'जलचर / चतुष्पद (Water/Quad)', vashyaEn: 'Jalachara', type: 'jalachara' }, // Capricorn
  10: { vashyaNe: 'मानव / द्विपद (Human)', vashyaEn: 'Manava', type: 'manava' },         // Aquarius
  11: { vashyaNe: 'जलचर (Aquatic)', vashyaEn: 'Jalachara', type: 'jalachara' }           // Pisces
};

// Planetary Friendships for Graha Maitri (0 to 6 index: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
// Relations: 5=Friend, 4=1-friend/1-neutral, 3=Neutral, 1=1-friend/1-enemy, 0.5=1-neutral/1-enemy, 0=Enemy
const GRAHA_MAITRI_MATRIX: { [key: string]: { [key: string]: number } } = {
  'सूर्य': { 'सूर्य': 5, 'चन्द्र': 5, 'मंगल': 5, 'बुध': 4, 'गुरु': 5, 'शुक्र': 0, 'शनि': 0 },
  'चन्द्र': { 'सूर्य': 5, 'चन्द्र': 5, 'मंगल': 4, 'बुध': 1, 'गुरु': 4, 'शुक्र': 0.5, 'शनि': 0.5 },
  'मंगल': { 'सूर्य': 5, 'चन्द्र': 4, 'मंगल': 5, 'बुध': 0.5, 'गुरु': 5, 'शुक्र': 3, 'शनि': 0.5 },
  'बुध': { 'सूर्य': 4, 'चन्द्र': 1, 'मंगल': 0.5, 'बुध': 5, 'गुरु': 0.5, 'शुक्र': 5, 'शनि': 4 },
  'गुरु': { 'सूर्य': 5, 'चन्द्र': 4, 'मंगल': 5, 'बुध': 0.5, 'गुरु': 5, 'शुक्र': 0.5, 'शनि': 3 },
  'शुक्र': { 'सूर्य': 0, 'चन्द्र': 0.5, 'मंगल': 3, 'बुध': 5, 'गुरु': 0.5, 'शुक्र': 5, 'शनि': 5 },
  'शनि': { 'सूर्य': 0, 'चन्द्र': 0.5, 'मंगल': 0.5, 'बुध': 4, 'गुरु': 3, 'शुक्र': 5, 'शनि': 5 }
};

// Yoni Mutual Harmony Matrix (14 Yonis)
// 4 = Same, 3 = Friend, 2 = Neutral, 1 = Enemy, 0 = Bitter/Mortal Enemy
const YONI_NAMES = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
const YONI_ENMITY_PAIRS: [string, string][] = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger']
];

function getYoniScore(boyYoniEn: string, girlYoniEn: string): number {
  if (boyYoniEn === girlYoniEn) return 4;

  // Check mortal enmity
  const isMortalEnemy = YONI_ENMITY_PAIRS.some(
    ([y1, y2]) => (boyYoniEn === y1 && girlYoniEn === y2) || (boyYoniEn === y2 && girlYoniEn === y1)
  );
  if (isMortalEnemy) return 0;

  // Friendly groups (e.g. Herbivores with herbivores, etc.)
  const friendlyCombos: [string, string][] = [
    ['Horse', 'Deer'], ['Horse', 'Elephant'], ['Elephant', 'Cow'],
    ['Cow', 'Buffalo'], ['Monkey', 'Elephant'], ['Cat', 'Dog'],
    ['Mongoose', 'Cat'], ['Tiger', 'Lion']
  ];
  const isFriend = friendlyCombos.some(
    ([y1, y2]) => (boyYoniEn === y1 && girlYoniEn === y2) || (boyYoniEn === y2 && girlYoniEn === y1)
  );
  if (isFriend) return 3;

  // Neutral by default
  return 2;
}

// =========================================================================
// 2. CORE ASHTAKOOT 36 GUNA CALCULATION ENGINE
// =========================================================================

export function calculateAshtakootGuna(
  boyRashiIdx: number,
  boyNakIdx: number,
  boyPad: number,
  girlRashiIdx: number,
  girlNakIdx: number,
  girlPad: number
): {
  kootas: MilanKootDetail[];
  totalPoints: number;
  bhakootRelation: BhakootRelation;
  nadiAnalysis: NadiDoshaAnalysis;
  specialYogas: { id: string; titleNe: string; titleEn: string; type: 'auspicious' | 'inauspicious' | 'warning'; descriptionNe: string; descriptionEn: string }[];
} {
  const boyNak = NAKSHATRA_AVAKHADA_TABLE[boyNakIdx] || NAKSHATRA_AVAKHADA_TABLE[0];
  const girlNak = NAKSHATRA_AVAKHADA_TABLE[girlNakIdx] || NAKSHATRA_AVAKHADA_TABLE[0];

  const boyRashi = RASHI_NAMES[boyRashiIdx] || RASHI_NAMES[0];
  const girlRashi = RASHI_NAMES[girlRashiIdx] || RASHI_NAMES[0];

  const boyVarna = RASHI_VARNA[boyRashiIdx];
  const girlVarna = RASHI_VARNA[girlRashiIdx];

  const boyVashya = RASHI_VASHYA[boyRashiIdx];
  const girlVashya = RASHI_VASHYA[girlRashiIdx];

  const kootas: MilanKootDetail[] = [];
  const specialYogas: { id: string; titleNe: string; titleEn: string; type: 'auspicious' | 'inauspicious' | 'warning'; descriptionNe: string; descriptionEn: string }[] = [];

  // ----------------------------------------------------
  // 1. वर्ण कूट (Varna Koot - 1 Point)
  // ----------------------------------------------------
  let varnaPts = 0;
  let varnaParihar = false;
  let varnaDescNe = '';
  let varnaDescEn = '';

  if (boyVarna.rank >= girlVarna.rank) {
    varnaPts = 1;
    varnaDescNe = 'केटाको वर्ण केटीको वर्णभन्दा उच्च वा समान छ। कार्यक्षेत्र र मानसिक तालमेल शुभ।';
    varnaDescEn = "Groom's Varna is equal or higher. Harmonious ego and temperament.";
  } else {
    varnaPts = 0;
    varnaDescNe = 'केटीको वर्ण उच्च रहेको छ (वर्ण दोष)। तर गुरु वा शुक्रको दृष्टि अथवा राशि स्वामी मैत्री भएमा दोष प्रभाव न्यून हुन्छ।';
    varnaDescEn = "Bride's Varna is higher. Minor ego friction unless mitigated by Jupiter/Venus.";
  }

  kootas.push({
    kootId: 'varna',
    nameNe: '१. वर्ण कूट (Varna)',
    nameEn: '1. Varna (Work Temperament)',
    sanskritName: 'वर्णकूटम्',
    maxPoints: 1,
    obtainedPoints: varnaPts,
    boyValue: boyVarna.varnaNe,
    girlValue: girlVarna.varnaNe,
    descriptionNe: varnaDescNe,
    descriptionEn: varnaDescEn,
    isDefective: varnaPts === 0,
    hasParihar: varnaParihar
  });

  // ----------------------------------------------------
  // 2. वश्य कूट (Vashya Koot - 2 Points)
  // ----------------------------------------------------
  let vashyaPts = 0;
  if (boyVashya.type === girlVashya.type) {
    vashyaPts = 2;
  } else if (
    (boyVashya.type === 'manava' && girlVashya.type === 'chatushpada') ||
    (boyVashya.type === 'chatushpada' && girlVashya.type === 'manava') ||
    (boyVashya.type === 'jalachara' && girlVashya.type === 'manava')
  ) {
    vashyaPts = 1;
  } else if (boyVashya.type === 'vanachara' || girlVashya.type === 'vanachara') {
    // Lion/Wild sign creates dominance
    vashyaPts = boyVashya.type === girlVashya.type ? 2 : 0;
  } else if (boyVashya.type === 'keeta' || girlVashya.type === 'keeta') {
    vashyaPts = boyVashya.type === girlVashya.type ? 2 : 0.5;
  } else {
    vashyaPts = 1;
  }

  kootas.push({
    kootId: 'vashya',
    nameNe: '२. वश्य कूट (Vashya)',
    nameEn: '2. Vashya (Dominance & Control)',
    sanskritName: 'वश्यकूटम्',
    maxPoints: 2,
    obtainedPoints: vashyaPts,
    boyValue: boyVashya.vashyaNe,
    girlValue: girlVashya.vashyaNe,
    descriptionNe: vashyaPts === 2
      ? 'आपसी आकर्षण, समर्पण र एकअर्काप्रतिको आदरभाव उत्कृष्ट।'
      : (vashyaPts >= 1 ? 'आपसी तालमेल मध्यम र स्वीकार्य छ।' : 'विचार र स्वभावमा प्रभुत्व जमाउने प्रवृत्ति हुनसक्छ।'),
    descriptionEn: vashyaPts === 2 ? 'Excellent mutual attraction and balance of control.' : 'Moderate control dynamics.',
    isDefective: vashyaPts === 0,
    hasParihar: false
  });

  // ----------------------------------------------------
  // 3. तारा कूट (Tara / Dina Koot - 3 Points)
  // ----------------------------------------------------
  const boyToGirlTara = (((girlNakIdx - boyNakIdx + 27) % 27) + 1) % 9 || 9;
  const girlToBoyTara = (((boyNakIdx - girlNakIdx + 27) % 27) + 1) % 9 || 9;

  // Inauspicious taras: 3 (Vipat), 5 (Pratyari), 7 (Vadha)
  const isBoyTaraInauspicious = [3, 5, 7].includes(boyToGirlTara);
  const isGirlTaraInauspicious = [3, 5, 7].includes(girlToBoyTara);

  let taraPts = 0;
  if (!isBoyTaraInauspicious && !isGirlTaraInauspicious) {
    taraPts = 3;
  } else if (!isBoyTaraInauspicious || !isGirlTaraInauspicious) {
    taraPts = 1.5;
  } else {
    taraPts = 0;
  }

  const taraNames: { [num: number]: string } = {
    1: 'जन्म (Janma)', 2: 'सम्पत् (Sampat)', 3: 'विपत् (Vipat)',
    4: 'क्षेम (Kshema)', 5: 'प्रत्यरि (Pratyari)', 6: 'साधक (Sadhaka)',
    7: 'निधन/वध (Vadha)', 8: 'मित्र (Mitra)', 9: 'परममित्र (Param Mitra)'
  };

  kootas.push({
    kootId: 'tara',
    nameNe: '३. तारा कूट (Tara / Dina)',
    nameEn: '3. Tara (Destiny & Well-being)',
    sanskritName: 'ताराकूटम्',
    maxPoints: 3,
    obtainedPoints: taraPts,
    boyValue: `${boyNak.nameNe} ➔ ${taraNames[boyToGirlTara]}`,
    girlValue: `${girlNak.nameNe} ➔ ${taraNames[girlToBoyTara]}`,
    descriptionNe: taraPts === 3
      ? 'दुवैको तारा शुभ (सम्पत्/क्षेम/साधक/मित्र) रहेकोले सुख, समृद्धि र आयु वृद्धि हुन्छ।'
      : (taraPts === 1.5 ? 'एउटा तारा शुभ र अर्को सामान्य रहेकोले मध्यम फल मिल्दछ।' : 'दुवैको तारा प्रतिकूल (विपत्/प्रत्यरि/वध) परेकोले ध्यान दिनुपर्नेछ।'),
    descriptionEn: `Tara alignment: Boy (${taraNames[boyToGirlTara]}), Girl (${taraNames[girlToBoyTara]}).`,
    isDefective: taraPts === 0,
    hasParihar: false
  });

  // ----------------------------------------------------
  // 4. योनि कूट (Yoni Koot - 4 Points)
  // ----------------------------------------------------
  const yoniPts = getYoniScore(boyNak.yoniEn, girlNak.yoniEn);
  const isYoniEnemy = yoniPts === 0;

  kootas.push({
    kootId: 'yoni',
    nameNe: '४. योनि कूट (Yoni)',
    nameEn: '4. Yoni (Biological & Physical Compatibility)',
    sanskritName: 'योनिकूटम्',
    maxPoints: 4,
    obtainedPoints: yoniPts,
    boyValue: boyNak.yoni,
    girlValue: girlNak.yoni,
    descriptionNe: yoniPts === 4
      ? 'समान योनि रहेकोले शारीरिक, मानसिक र जैविक अनुकूलता अति उत्तम।'
      : (yoniPts >= 2 ? 'मित्र वा सम योनि रहेकोले आपसी तालमेल राम्रो रहनेछ।' : 'शत्रु योनि परेकोले वैवाहिक जीवनमा आपसी समझदारी र धैर्य आवश्यक छ।'),
    descriptionEn: `Yoni compatibility: ${boyNak.yoniEn} & ${girlNak.yoniEn} (${yoniPts}/4 points).`,
    isDefective: isYoniEnemy,
    hasParihar: false
  });

  // ----------------------------------------------------
  // 5. ग्रह मैत्री कूट (Graha Maitri Koot - 5 Points)
  // ----------------------------------------------------
  const boyLord = boyRashi.lordNe;
  const girlLord = girlRashi.lordNe;
  const maitriPts = (GRAHA_MAITRI_MATRIX[boyLord] && GRAHA_MAITRI_MATRIX[boyLord][girlLord] !== undefined)
    ? GRAHA_MAITRI_MATRIX[boyLord][girlLord]
    : (boyLord === girlLord ? 5 : 3);

  kootas.push({
    kootId: 'grahaMaitri',
    nameNe: '५. ग्रह मैत्री कूट (Graha Maitri)',
    nameEn: '5. Graha Maitri (Psychological Harmony)',
    sanskritName: 'ग्रहमैत्रीकूटम्',
    maxPoints: 5,
    obtainedPoints: maitriPts,
    boyValue: `${boyRashi.ne} (स्वामी: ${boyLord})`,
    girlValue: `${girlRashi.ne} (स्वामी: ${girlLord})`,
    descriptionNe: maitriPts >= 4
      ? `राशि स्वामी (${boyLord} र ${girlLord}) परम मित्र रहेकाले विचार, बुद्धि र भावनामा गहिरो मेलमिलाप हुन्छ।`
      : (maitriPts >= 2 ? `राशि स्वामी सम/तटस्थ रहेकाले गृहस्थी सामान्य र सुमधुर रहनेछ।` : `राशि स्वामीमा शत्रुता रहेकाले दृष्टिकोणमा मतभेद हुनसक्छ।`),
    descriptionEn: `Rashi Lords: ${boyRashi.lordEn} and ${girlRashi.lordEn} (${maitriPts}/5 points).`,
    isDefective: maitriPts <= 1,
    hasParihar: false
  });

  // ----------------------------------------------------
  // 6. गण कूट (Gana Koot - 6 Points)
  // ----------------------------------------------------
  let ganaPts = 0;
  if (boyNak.gana === girlNak.gana) {
    ganaPts = 6;
  } else if (
    (boyNak.gana === 'देव' && girlNak.gana === 'मनुष्य') ||
    (boyNak.gana === 'मनुष्य' && girlNak.gana === 'देव')
  ) {
    ganaPts = 5; // Good harmony
  } else if (boyNak.gana === 'राक्षस' && girlNak.gana === 'देव') {
    ganaPts = 1;
  } else if (boyNak.gana === 'देव' && girlNak.gana === 'राक्षस') {
    ganaPts = 1;
  } else if (boyNak.gana === 'मनुष्य' && girlNak.gana === 'राक्षस') {
    ganaPts = 0; // Gana Dosha
  } else if (boyNak.gana === 'राक्षस' && girlNak.gana === 'मनुष्य') {
    ganaPts = 0; // Gana Dosha
  } else {
    ganaPts = 1;
  }

  kootas.push({
    kootId: 'gana',
    nameNe: '६. गण कूट (Gana)',
    nameEn: '6. Gana (Temperament & Character)',
    sanskritName: 'गणकूटम्',
    maxPoints: 6,
    obtainedPoints: ganaPts,
    boyValue: `${boyNak.gana} गण (${boyNak.ganaEn})`,
    girlValue: `${girlNak.gana} गण (${girlNak.ganaEn})`,
    descriptionNe: ganaPts >= 5
      ? 'गण अनुकूल रहेकाले संस्कार, स्वभाव र चरित्रमा अत्यन्त राम्रो सामञ्जस्यता।'
      : (ganaPts > 0 ? 'गण मध्यम छ, आपसी समझदारीले सम्बन्ध सुखद बन्छ।' : 'राक्षस-मनुष्य गण दोष रहेकोले विचार र व्यवहारमा भिन्नता हुनसक्छ।'),
    descriptionEn: `Gana: Boy is ${boyNak.ganaEn}, Girl is ${girlNak.ganaEn} (${ganaPts}/6 points).`,
    isDefective: ganaPts === 0,
    hasParihar: false
  });

  // ----------------------------------------------------
  // 7. भकूट कूट (Bhakoot Koot - 7 Points) & RELATION ENGINE
  // ----------------------------------------------------
  // Relative position from Boy Rashi to Girl Rashi (1 to 12)
  const diffRashi = ((girlRashiIdx - boyRashiIdx + 12) % 12) + 1;
  const reverseDiff = ((boyRashiIdx - girlRashiIdx + 12) % 12) + 1;

  let bhakootPts = 0;
  let bhakootRelationType: BhakootRelation['type'] = 'ek_rashi';
  let bhakootLabelNe = '';
  let bhakootLabelEn = '';
  let bhakootNameNe = '';
  let bhakootNameEn = '';
  let isBhakootMalefic = false;
  let isBhakootAuspicious = false;
  let bhakootDescNe = '';
  let bhakootDescEn = '';
  let isBhakootParihar = false;
  let bhakootPariharReasonNe = '';

  const sameLord = boyLord === girlLord;
  const mutualFriends = maitriPts >= 4;

  if (diffRashi === 1) {
    // 1/1 - Same Sign (एकराशि)
    bhakootPts = 7;
    bhakootRelationType = 'ek_rashi';
    bhakootLabelNe = '१/१ एकराशि सम्बन्ध';
    bhakootLabelEn = '1/1 Same Sign (Ek-Rashi)';
    bhakootNameNe = 'एकराशि शुभ योग';
    bhakootNameEn = 'Ek-Rashi Yog';
    isBhakootAuspicious = true;
    bhakootDescNe = 'दुवैको राशि एउटै भएकाले अत्यन्त राम्रो भावनात्मक र मानसिक सामञ्जस्यता।';
    bhakootDescEn = 'Both share the same moon sign. Strong emotional harmony.';
  } else if (diffRashi === 7) {
    // 7/7 - Samasaptaka (समसप्तक)
    bhakootPts = 7;
    bhakootRelationType = 'samasaptaka';
    bhakootLabelNe = '७/७ समसप्तक सम्बन्ध';
    bhakootLabelEn = '7/7 Samasaptaka Relation';
    bhakootNameNe = 'समसप्तक महायोग (अति शुभ)';
    bhakootNameEn = 'Samasaptaka Maha Yog';
    isBhakootAuspicious = true;
    bhakootDescNe = 'परस्पर ७ औं घरमा राशि रहेकाले एकअर्काप्रतिको आकर्षण, प्रेम र दाम्पत्य सुख दीर्घकालीन रहनेछ।';
    bhakootDescEn = 'Mutual 7th placement represents pure cosmic attraction, balance, and lifelong affection.';
  } else if (diffRashi === 3 || diffRashi === 11) {
    // 3/11 - Tri-Ekadash (त्रि-एकादश)
    bhakootPts = 7;
    bhakootRelationType = 'tri_ekadash';
    bhakootLabelNe = '३/११ त्रि-एकादश सम्बन्ध';
    bhakootLabelEn = '3/11 Tri-Ekadash Relation';
    bhakootNameNe = 'त्रि-एकादश लाभ योग';
    bhakootNameEn = 'Tri-Ekadash Profit Yog';
    isBhakootAuspicious = true;
    bhakootDescNe = '३ र ११ को सम्बन्धले जीवनमा आर्थिक लाभ, मित्रता, सहयोग र उन्नति प्रदान गर्दछ।';
    bhakootDescEn = '3/11 relation brings mutual growth, friendship, and material prosperity.';
  } else if (diffRashi === 4 || diffRashi === 10) {
    // 4/10 - Chaturashra / Kendra (केन्द्र सम्बन्ध)
    bhakootPts = 7;
    bhakootRelationType = 'chaturashra';
    bhakootLabelNe = '४/१० केन्द्र सम्बन्ध';
    bhakootLabelEn = '4/10 Kendra Relation';
    bhakootNameNe = 'चतुरश्र / केन्द्र सुख योग';
    bhakootNameEn = 'Chaturashra Kendra Yog';
    isBhakootAuspicious = true;
    bhakootDescNe = '४ र १० को केन्द्र सम्बन्धले पारिवारिक सुख, घरजग्गा र प्रतिष्ठा वृद्धि गर्छ।';
    bhakootDescEn = '4/10 Kendra alignment brings strong domestic stability and status.';
  } else if (diffRashi === 2 || diffRashi === 12) {
    // 2/12 - Dwirdwadash (द्विर्द्वादश)
    bhakootRelationType = 'dwirdwadash';
    bhakootLabelNe = '२/१२ द्विर्द्वादश सम्बन्ध';
    bhakootLabelEn = '2/12 Dwirdwadash Relation';
    bhakootNameNe = 'द्विर्द्वादश भकूट दोष';
    bhakootNameEn = 'Dwirdwadash Bhakoot Dosha';
    isBhakootMalefic = true;

    // Check cancellation
    if (sameLord || mutualFriends) {
      bhakootPts = 7;
      isBhakootParihar = true;
      bhakootPariharReasonNe = 'राशि स्वामी एकै वा मित्र भएकाले द्विर्द्वादश दोष स्वतः भङ्ग/परिहार भएको छ।';
      bhakootDescNe = '२/१२ सम्बन्ध भए तापनि राशि स्वामी मैत्री भएकाले दोष शान्त भएको छ।';
    } else {
      bhakootPts = 0;
      bhakootDescNe = '२ र १२ को सम्बन्धले आर्थिक उतारचढाव, अत्यधिक खर्च वा स्थान परिवर्तन निम्त्याउन सक्छ।';
    }
    bhakootDescEn = '2/12 relation indicates financial fluctuations or displacement unless cancelled.';
  } else if (diffRashi === 5 || diffRashi === 9) {
    // 5/9 - Navapanchak (नवपञ्चक)
    bhakootRelationType = 'navapanchak';
    bhakootLabelNe = '५/९ नवपञ्चक सम्बन्ध';
    bhakootLabelEn = '5/9 Navapanchak Relation';
    bhakootNameNe = 'नवपञ्चक योग (पुत्र/सन्तान तथा भाग्य वृद्धि योग)';
    bhakootNameEn = 'Navapanchak Auspicious Yog';
    isBhakootAuspicious = true;

    // In classical texts, 5/9 gives 0 raw points in table unless lord is friendly, but it is one of the most auspicious dharmic yogas
    if (sameLord || mutualFriends) {
      bhakootPts = 7;
      isBhakootParihar = true;
      bhakootPariharReasonNe = 'राशि स्वामी परम मित्र भएकाले नवपञ्चक दोष शून्य भई पूर्ण ७ अंक प्राप्त।';
    } else {
      bhakootPts = 0; // standard table rule
    }
    bhakootDescNe = '५ र ९ को त्रिकोण सम्बन्धले धर्म, भाग्य, ज्ञान तथा उत्तम सन्तानको सुख प्रदान गर्दछ। यो अत्यन्त कल्याणकारी योग हो।';
    bhakootDescEn = '5/9 Trikona relation blesses the couple with fortune, wisdom, spiritual affinity, and progeny.';
  } else if (diffRashi === 6 || diffRashi === 8) {
    // 6/8 - Shadashtak (षडाष्टक)
    bhakootRelationType = 'shadashtak';
    bhakootLabelNe = '६/८ षडाष्टक सम्बन्ध';
    bhakootLabelEn = '6/8 Shadashtak Relation';

    // Check Preeti Shadashtak vs Mrityu Shadashtak
    // Preeti Shadashtak: Same Lord (Aries-Scorpio Mars, Taurus-Libra Venus), or Friendly Lords (Gemini-Capricorn, Cancer-Sagittarius, Leo-Pisces, Virgo-Aquarius)
    const isPreetiShadashtak =
      (boyRashiIdx === 0 && girlRashiIdx === 7) || (boyRashiIdx === 7 && girlRashiIdx === 0) || // Aries - Scorpio (Mars)
      (boyRashiIdx === 1 && girlRashiIdx === 6) || (boyRashiIdx === 6 && girlRashiIdx === 1) || // Taurus - Libra (Venus)
      (boyRashiIdx === 2 && girlRashiIdx === 9) || (boyRashiIdx === 9 && girlRashiIdx === 2) || // Gemini - Capricorn (Mercury-Saturn)
      (boyRashiIdx === 3 && girlRashiIdx === 8) || (boyRashiIdx === 8 && girlRashiIdx === 3) || // Cancer - Sagittarius (Moon-Jupiter)
      (boyRashiIdx === 4 && girlRashiIdx === 11) || (boyRashiIdx === 11 && girlRashiIdx === 4) || // Leo - Pisces (Sun-Jupiter)
      (boyRashiIdx === 5 && girlRashiIdx === 10) || (boyRashiIdx === 10 && girlRashiIdx === 5); // Virgo - Aquarius (Mercury-Saturn)

    if (isPreetiShadashtak || sameLord || mutualFriends) {
      bhakootNameNe = 'प्रीति षडाष्टक (दोष परिहार / शुभ)';
      bhakootNameEn = 'Preeti Shadashtak (Cancelled / Friendly)';
      bhakootPts = 7;
      isBhakootParihar = true;
      isBhakootAuspicious = true;
      isBhakootMalefic = false;
      bhakootPariharReasonNe = 'राशि स्वामी एउटै वा परस्पर मित्र भएकाले "प्रीति षडाष्टक" भई दोष पूर्णतः भङ्ग भएको छ।';
      bhakootDescNe = '६/८ को सम्बन्ध भए तापनि स्वामी मैत्रीका कारण कलह नभई प्रेम र सहकार्य रहन्छ।';
    } else {
      bhakootNameNe = 'मृत्यु षडाष्टक भकूट दोष (गम्भीर चेतावनी)';
      bhakootNameEn = 'Mrityu Shadashtak Dosha (Severe Warning)';
      bhakootPts = 0;
      isBhakootMalefic = true;
      bhakootDescNe = '६ र ८ को शत्रु षडाष्टक परेकाले स्वास्थ्य, कलह र मानसिक तनावको सम्भावना रहन्छ। महामृत्युञ्जय जप वा रुद्राभिषेक आवश्यक।';
    }
    bhakootDescEn = isPreetiShadashtak
      ? 'Preeti Shadashtak: Rashi lords are amicable or identical, nullifying health/conflict risks.'
      : 'Mrityu Shadashtak: 6/8 antagonistic alignment requires remedial pacification.';
  }

  const bhakootRelation: BhakootRelation = {
    type: bhakootRelationType,
    distance: diffRashi,
    relationLabelNe: bhakootLabelNe,
    relationLabelEn: bhakootLabelEn,
    nameNe: bhakootNameNe,
    nameEn: bhakootNameEn,
    isMalefic: isBhakootMalefic,
    isAuspicious: isBhakootAuspicious,
    descriptionNe: bhakootDescNe,
    descriptionEn: bhakootDescEn,
    isParihar: isBhakootParihar,
    pariharTypeNe: bhakootPariharReasonNe
  };

  kootas.push({
    kootId: 'bhakoot',
    nameNe: '७. भकूट कूट (Bhakoot)',
    nameEn: '7. Bhakoot (Emotional & Family Growth)',
    sanskritName: 'भकूटकूटम्',
    maxPoints: 7,
    obtainedPoints: bhakootPts,
    boyValue: `${boyRashi.ne} (${boyRashi.en})`,
    girlValue: `${girlRashi.ne} (${girlRashi.en})`,
    descriptionNe: `${bhakootLabelNe} - ${bhakootDescNe}`,
    descriptionEn: `${bhakootLabelEn}: ${bhakootDescEn}`,
    isDefective: bhakootPts === 0,
    hasParihar: isBhakootParihar,
    pariharDetailsNe: bhakootPariharReasonNe
  });

  // ----------------------------------------------------
  // 8. नाडी कूट (Nadi Koot - 8 Points) & NADI DOSHA PARIHAR
  // ----------------------------------------------------
  let nadiPts = 0;
  let isNadiDosha = false;
  let isNadiParihar = false;
  let nadiPariharReasonNe = '';
  let nadiPariharReasonEn = '';

  if (boyNak.nadi !== girlNak.nadi) {
    nadiPts = 8;
    isNadiDosha = false;
  } else {
    // Same Nadi => Nadi Dosha detected! Check Cancellation Rules (परिहारका नियमहरू)
    isNadiDosha = true;

    // Rule 1: Ek Rashi Bhinna Nakshatra (Same Sign, Different Nakshatras)
    if (boyRashiIdx === girlRashiIdx && boyNakIdx !== girlNakIdx) {
      isNadiParihar = true;
      nadiPariharReasonNe = 'एक राशि भिन्न नक्षत्र: केटा र केटीको राशि एउटै तर नक्षत्र फरक भएकाले नाडी दोष पूर्ण परिहार भएको छ।';
      nadiPariharReasonEn = 'Same sign with different nakshatras completely cancels Nadi Dosha.';
    }
    // Rule 2: Ek Nakshatra Bhinna Rashi (Same Nakshatra spanning 2 different Signs)
    else if (boyNakIdx === girlNakIdx && boyRashiIdx !== girlRashiIdx) {
      isNadiParihar = true;
      nadiPariharReasonNe = 'एक नक्षत्र भिन्न राशि: नक्षत्र एउटै भए पनि राशि फरक परेकाले नाडी दोष भङ्ग भएको छ।';
      nadiPariharReasonEn = 'Same nakshatra spanning different signs cancels Nadi Dosha.';
    }
    // Rule 3: Pada Bheda in Specific Exception Nakshatras (Rohini, Mrigashira, Ardra, Pushya, Anuradha, Jyeshtha, Uttara Ashadha, Shravana, Shatabhisha, Uttara Bhadrapada)
    else if (
      boyNakIdx === girlNakIdx &&
      boyPad !== girlPad &&
      [3, 4, 5, 7, 16, 17, 20, 21, 23, 25].includes(boyNakIdx)
    ) {
      isNadiParihar = true;
      nadiPariharReasonNe = `शास्त्रोक्त विशेष नक्षत्र (${boyNak.nameNe}) मा चरण/पाद फरक (${boyPad} र ${girlPad}) भएकाले नाडी दोष परिहार मानिन्छ।`;
      nadiPariharReasonEn = `Different padas in sacred nakshatra (${boyNak.nameEn}) nullifies Nadi Dosha.`;
    }
    // Rule 4: Same Lord or Friendly Lords mitigation
    else if (sameLord || mutualFriends) {
      isNadiParihar = true;
      nadiPariharReasonNe = 'राशि स्वामी एकाधिपत्य वा मित्र भएकाले नाडी दोषको अशुभ प्रभाव निकै मन्द/शून्य रहनेछ।';
      nadiPariharReasonEn = 'Friendly or identical rashi lords mitigate the inauspiciousness of Nadi Dosha.';
    }

    nadiPts = isNadiParihar ? 8 : 0;
  }

  const nadiAnalysis: NadiDoshaAnalysis = {
    boyNadi: boyNak.nadi,
    girlNadi: girlNak.nadi,
    isNadiDosha: isNadiDosha,
    isParihar: isNadiParihar,
    pariharReasonNe: nadiPariharReasonNe,
    pariharReasonEn: nadiPariharReasonEn,
    impactNe: isNadiDosha
      ? (isNadiParihar ? 'नाडी दोष देखापरेको तर शास्त्रोक्त परिहार नियमले गर्दा दोष प्रभावहीन भएको छ।' : 'समान नाडी परेकाले सन्तान, स्वास्थ्य र रक्तसञ्चारमा सतर्कता आवश्यक छ।')
      : 'भिन्न नाडी (निर्दोष) रहेकाले वंश वृद्धि, उत्तम स्वास्थ्य र दीर्घायु योग।',
    impactEn: isNadiDosha
      ? (isNadiParihar ? 'Nadi Dosha detected but neutralized by scriptural cancellation rules.' : 'Same Nadi indicates need for health care.')
      : 'Different Nadis guarantee biological vitality and progeny blessings.',
    remedyNe: isNadiDosha && !isNadiParihar
      ? 'महामृत्युञ्जय जप, स्वर्ण दान, गाई दान वा मङ्गल चण्डिका स्तोत्रको पाठ शुभ मानिन्छ।'
      : 'कुनै विशेष नाडी पूजा आवश्यक छैन।',
    remedyEn: 'Maha Mrityunjaya recitation or sacred charity.'
  };

  kootas.push({
    kootId: 'nadi',
    nameNe: '८. नाडी कूट (Nadi)',
    nameEn: '8. Nadi (Genetic, Health & Progeny)',
    sanskritName: 'नाडीकूटम्',
    maxPoints: 8,
    obtainedPoints: nadiPts,
    boyValue: `${boyNak.nadi} नाडी (${boyNak.nameNe})`,
    girlValue: `${girlNak.nadi} नाडी (${girlNak.nameNe})`,
    descriptionNe: nadiAnalysis.impactNe,
    descriptionEn: nadiAnalysis.impactEn,
    isDefective: isNadiDosha && !isNadiParihar,
    hasParihar: isNadiParihar,
    pariharDetailsNe: nadiPariharReasonNe
  });

  // Calculate Total Points (0 to 36)
  const totalPoints = kootas.reduce((sum, k) => sum + k.obtainedPoints, 0);

  // Add Special Highlight Yogas
  if (bhakootRelation.type === 'navapanchak') {
    specialYogas.push({
      id: 'navapanchak_yog',
      titleNe: '🌟 नवपञ्चक योग (५-९ सम्बन्ध - सन्तान तथा भाग्य वृद्धि)',
      titleEn: '🌟 Navapanchak Yog (Progeny & Fortune Blessing)',
      type: 'auspicious',
      descriptionNe: 'केटा र केटीको राशि ५ र ९ को कोणमा रहेकाले यसले वंश वृद्धि, आर्थिक समृद्धि, धार्मिक उन्नति र भाग्य वृद्धि गर्दछ।',
      descriptionEn: 'The 5/9 Trikona connection brings spiritual harmony, wealth, and righteous progeny.'
    });
  }

  if (bhakootRelation.type === 'samasaptaka') {
    specialYogas.push({
      id: 'samasaptaka_yog',
      titleNe: '💖 समसप्तक महायोग (७-७ सम्बन्ध - अटुट प्रेम र आकर्षण)',
      titleEn: '💖 Samasaptaka Maha Yog (Lifelong Love & Harmony)',
      type: 'auspicious',
      descriptionNe: 'दुवैको राशि परस्पर सातौं घरमा भएकाले प्राकृतिक आकर्षण, समझदारी र दाम्पत्य सुख सर्वोत्कृष्ट रहन्छ।',
      descriptionEn: 'The mutual 7th placement is a celebrated astrological blessing for mutual loyalty and enduring bliss.'
    });
  }

  if (bhakootRelation.type === 'shadashtak' && bhakootRelation.isParihar) {
    specialYogas.push({
      id: 'preeti_shadashtak',
      titleNe: '✨ प्रीति षडाष्टक योग (६-८ सम्बन्धमा दोष परिहार)',
      titleEn: '✨ Preeti Shadashtak (Friendly 6-8 Relation)',
      type: 'auspicious',
      descriptionNe: '६/८ को सम्बन्ध भए पनि राशि स्वामी एउटै वा मित्र भएकाले दोष भङ्ग भई "प्रीति षडाष्टक" बनेको छ।',
      descriptionEn: '6/8 connection is pacified by friendly planetary rulership, removing hostility.'
    });
  } else if (bhakootRelation.type === 'shadashtak' && bhakootRelation.isMalefic) {
    specialYogas.push({
      id: 'mrityu_shadashtak',
      titleNe: '⚠️ षडाष्टक भकूट दोष (६-८ सम्बन्ध - विशेष सतर्कता)',
      titleEn: '⚠️ Shadashtak Bhakoot Dosha (6-8 Incompatible)',
      type: 'inauspicious',
      descriptionNe: 'केटा र केटीको राशि ६/८ को दूरीमा छ र स्वामी शत्रु छन्। स्वास्थ्य, कलह र विचारमा भिन्नता आउन सक्ने भएकाले ज्योतिषी सल्लाह र उपाय आवश्यक छ।',
      descriptionEn: 'Antagonistic 6/8 axis requires astrological pacification and mutual patience.'
    });
  }

  if (bhakootRelation.type === 'dwirdwadash' && bhakootRelation.isMalefic) {
    specialYogas.push({
      id: 'dwirdwadash_dosha',
      titleNe: '⚠️ द्विर्द्वादश सम्बन्ध (२-१२ सम्बन्ध)',
      titleEn: '⚠️ Dwirdwadash Relation (2-12)',
      type: 'warning',
      descriptionNe: '२ र १२ को सम्बन्धले आर्थिक खर्च वा स्थान परिवर्तन गराउन सक्छ।',
      descriptionEn: '2/12 alignment may lead to higher expenses or distance.'
    });
  }

  if (isNadiDosha && isNadiParihar) {
    specialYogas.push({
      id: 'nadi_parihar',
      titleNe: '🛡️ नाडी दोष परिहार (दोष निवारण भएको)',
      titleEn: '🛡️ Nadi Dosha Cancelled (Parihar)',
      type: 'auspicious',
      descriptionNe: nadiPariharReasonNe || 'शास्त्रोक्त नियम अनुसार नाडी दोष भङ्ग भएको छ।',
      descriptionEn: 'Nadi Dosha is effectively cancelled based on scriptural exemptions.'
    });
  } else if (isNadiDosha && !isNadiParihar) {
    specialYogas.push({
      id: 'nadi_dosha_active',
      titleNe: '⚠️ नाडी दोष (समान नाडी - विचारणीय)',
      titleEn: '⚠️ Active Nadi Dosha',
      type: 'inauspicious',
      descriptionNe: 'केटा र केटी दुवैको एउटै नाडी परेको र परिहार नभएकाले सन्तान र स्वास्थ्य पक्षमा ध्यान दिनुपर्छ। महामृत्युञ्जय जप शुभ हुन्छ।',
      descriptionEn: 'Identical Nadi requires medical awareness and Vedic recitation.'
    });
  }

  return {
    kootas,
    totalPoints,
    bhakootRelation,
    nadiAnalysis,
    specialYogas
  };
}

// =========================================================================
// 3. MANGLIK DOSHA (KUJA DOSHA) COMPARATIVE ANALYSIS ENGINE
// =========================================================================

export function analyzeManglikPerson(
  name: string,
  planets: DetailedPlanetPosition[]
): ManglikAnalysisPerson {
  const mars = planets.find((p) => p.id === 'mars');
  const moon = planets.find((p) => p.id === 'moon');
  const venus = planets.find((p) => p.id === 'venus');
  const lagna = planets.find((p) => p.id === 'lagna');

  const marsRashiIdx = mars ? mars.rashiIndex : 0;
  const lagnaRashiIdx = lagna ? lagna.rashiIndex : 0;
  const moonRashiIdx = moon ? moon.rashiIndex : 0;
  const venusRashiIdx = venus ? venus.rashiIndex : 0;

  // House calculation in Whole Sign System:
  // 1, 4, 7, 8, 12 from Lagna, Moon, Venus
  const marsHouseLagna = ((marsRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
  const marsHouseChandra = ((marsRashiIdx - moonRashiIdx + 12) % 12) + 1;
  const marsHouseShukra = ((marsRashiIdx - venusRashiIdx + 12) % 12) + 1;

  const manglikHouses = [1, 4, 7, 8, 12];
  const isManglikLagna = manglikHouses.includes(marsHouseLagna);
  const isManglikChandra = manglikHouses.includes(marsHouseChandra);
  const isManglikShukra = manglikHouses.includes(marsHouseShukra);

  const cancellationFactors: string[] = [];

  // Exaltation (Capricorn) or Own sign (Aries, Scorpio)
  if (marsRashiIdx === 9) {
    cancellationFactors.push('मङ्गल उच्च राशि (मकर) मा रहेकाले दोष मन्द भएको छ।');
  } else if (marsRashiIdx === 0 || marsRashiIdx === 7) {
    cancellationFactors.push('मङ्गल स्वगृही (मेष/वृश्चिक) मा रहेकाले दोष निष्प्रभावी भएको छ।');
  }

  // Jupiter conjunction or aspect
  const jupiter = planets.find((p) => p.id === 'jupiter');
  if (jupiter) {
    const jupHouseFromMars = ((jupiter.rashiIndex - marsRashiIdx + 12) % 12) + 1;
    if ([1, 5, 7, 9].includes(jupHouseFromMars)) {
      cancellationFactors.push('शुभ ग्रह गुरु (बृहस्पति) को दृष्टि वा युतिले मङ्गल दोष शान्त गरेको छ।');
    }
  }

  let count = (isManglikLagna ? 1 : 0) + (isManglikChandra ? 1 : 0) + (isManglikShukra ? 1 : 0);
  let status: ManglikAnalysisPerson['status'] = 'अमाङ्गलिक';
  let statusEn: ManglikAnalysisPerson['statusEn'] = 'Non-Manglik';
  let severityScore = 0;

  if (count === 0) {
    status = 'अमाङ्गलिक';
    statusEn = 'Non-Manglik';
    severityScore = 0;
  } else if (count === 1 && [1, 4, 12].includes(marsHouseLagna)) {
    status = 'आंशिक माङ्गलिक';
    statusEn = 'Anshik Manglik';
    severityScore = 35;
  } else if (count >= 2 || [7, 8].includes(marsHouseLagna)) {
    status = 'पूर्ण माङ्गलिक';
    statusEn = 'Full Manglik';
    severityScore = 80;
  } else {
    status = 'आंशिक माङ्गलिक';
    statusEn = 'Anshik Manglik';
    severityScore = 50;
  }

  return {
    name,
    isManglikLagna,
    isManglikChandra,
    isManglikShukra,
    marsHouseLagna,
    marsHouseChandra,
    marsHouseShukra,
    status,
    statusEn,
    severityScore,
    cancellationFactors
  };
}

export function evaluateManglikMatching(
  boy: ManglikAnalysisPerson,
  girl: ManglikAnalysisPerson
): ManglikMatchAnalysis {
  const boyIsManglik = boy.status !== 'अमाङ्गलिक';
  const girlIsManglik = girl.status !== 'अमाङ्गलिक';

  let isCompatible = true;
  let isDoshaSamya = false;
  let verdictNe = '';
  let verdictEn = '';
  const remediesNe: string[] = [];

  if (!boyIsManglik && !girlIsManglik) {
    isCompatible = true;
    isDoshaSamya = false;
    verdictNe = 'दुवै जना पूर्णतः "अमाङ्गलिक (Non-Manglik)" हुनुहुन्छ। मङ्गल दोषको कुनै भय छैन।';
    verdictEn = 'Both are non-Manglik. Excellent marital harmony with zero Kuja Dosha.';
  } else if (boyIsManglik && girlIsManglik) {
    isCompatible = true;
    isDoshaSamya = true;
    verdictNe = 'केटा र केटी दुवै माङ्गलिक भएकाले "मङ्गल दोष साम्य (Cancelled/Balanced)" भएको छ। विवाह अति शुभ र फलदायी छ।';
    verdictEn = 'Both partner charts are Manglik, creating perfect mutual cancellation (Dosha Samya). Highly auspicious marriage.';
  } else if (boyIsManglik && !girlIsManglik) {
    isCompatible = boy.status === 'आंशिक माङ्गलिक';
    verdictNe = `केटा ${boy.status} र केटी अमाङ्गलिक हुनुहुन्छ। सामान्य मङ्गल शान्ति वा मङ्गलवारको व्रत गर्दा उत्तम हुन्छ।`;
    verdictEn = `Groom is ${boy.statusEn} while Bride is Non-Manglik. Moderate mitigation suggested.`;
    remediesNe.push('केटाले मङ्गलवार रातो वस्त्र, मसुरो दाल वा तामाको दान गर्नु शुभ हुन्छ।');
    remediesNe.push('मङ्गल चण्डिका स्तोत्र वा हनुमान चालिसाको नियमित पाठ।');
  } else {
    // Girl Manglik & Boy Non-Manglik
    isCompatible = girl.status === 'आंशिक माङ्गलिक';
    verdictNe = `केटी ${girl.status} र केटा अमाङ्गलिक हुनुहुन्छ। कुम्भ विवाह वा मङ्गल ग्रहको शान्ति पूजा गरेर विवाह गर्न सकिन्छ।`;
    verdictEn = `Bride is ${girl.statusEn} while Groom is Non-Manglik. Traditional Kumbha Vivah or Mangal Shanti is recommended.`;
    remediesNe.push('विवाह अगाडि कुम्भ विवाह वा पीपल विवाह अनुष्ठान।');
    remediesNe.push('मङ्गल शान्ति पूजा तथा रुद्राभिषेक।');
  }

  return {
    boy,
    girl,
    isCompatible,
    isDoshaSamya,
    verdictNe,
    verdictEn,
    remediesNe
  };
}

// =========================================================================
// 4. FULL KUNDALI MILAN MASTER INTEGRATION FUNCTION
// =========================================================================

export function matchKundalis(
  boyData: { rashiIdx: number; nakIdx: number; pad: number; name?: string; planets?: DetailedPlanetPosition[] },
  girlData: { rashiIdx: number; nakIdx: number; pad: number; name?: string; planets?: DetailedPlanetPosition[] }
): KundaliMilanResult {
  const boyName = boyData.name || 'केटा (Groom)';
  const girlName = girlData.name || 'केटी (Bride)';

  const boyRashi = RASHI_NAMES[boyData.rashiIdx] || RASHI_NAMES[0];
  const girlRashi = RASHI_NAMES[girlData.rashiIdx] || RASHI_NAMES[0];

  const boyNak = NAKSHATRA_AVAKHADA_TABLE[boyData.nakIdx] || NAKSHATRA_AVAKHADA_TABLE[0];
  const girlNak = NAKSHATRA_AVAKHADA_TABLE[girlData.nakIdx] || NAKSHATRA_AVAKHADA_TABLE[0];

  const ashtakoot = calculateAshtakootGuna(
    boyData.rashiIdx,
    boyData.nakIdx,
    boyData.pad,
    girlData.rashiIdx,
    girlData.nakIdx,
    girlData.pad
  );

  const totalPoints = ashtakoot.totalPoints;
  const percentage = Math.round((totalPoints / 36) * 1000) / 10;

  // Determine Verdict Category
  let verdictCategory: KundaliMilanResult['verdictCategory'] = 'good';
  let verdictTitleNe = '';
  let verdictTitleEn = '';
  let verdictSummaryNe = '';
  let verdictSummaryEn = '';

  const hasActiveNadiDosha = ashtakoot.nadiAnalysis.isNadiDosha && !ashtakoot.nadiAnalysis.isParihar;
  const hasActiveShadashtak = ashtakoot.bhakootRelation.type === 'shadashtak' && ashtakoot.bhakootRelation.isMalefic;

  if (totalPoints >= 28 && !hasActiveNadiDosha && !hasActiveShadashtak) {
    verdictCategory = 'excellent';
    verdictTitleNe = 'अति उत्तम मिलान (उत्कृष्ट सम्बन्ध)';
    verdictTitleEn = 'Excellent Match (Highly Auspicious)';
    verdictSummaryNe = `३६ मा कुल ${totalPoints} गुण प्राप्त भएको छ। कुनै प्रमुख दोष नभएकाले यो सम्बन्ध दीर्घायु, सुख, सन्तान र धनधान्यले सम्पन्न रहनेछ।`;
    verdictSummaryEn = `Scored ${totalPoints}/36 points with pristine cosmic harmony across mental, biological, and karmic planes.`;
  } else if (totalPoints >= 21 && !hasActiveNadiDosha) {
    verdictCategory = 'good';
    verdictTitleNe = 'उत्तम मिलान (स्वीकार्य तथा शुभ)';
    verdictTitleEn = 'Good Match (Auspicious)';
    verdictSummaryNe = `३६ मा कुल ${totalPoints} गुण प्राप्त भएको छ। गृहस्थ जीवन आनन्दमय, सहयोगी र सुखद रहनेछ।`;
    verdictSummaryEn = `Scored ${totalPoints}/36 points. Harmonious match recommended for marriage.`;
  } else if (totalPoints >= 18) {
    verdictCategory = 'average';
    verdictTitleNe = 'मध्यम मिलान (सामान्य)';
    verdictTitleEn = 'Average Match (Acceptable with Care)';
    verdictSummaryNe = `३६ मा कुल ${totalPoints} गुण प्राप्त भएको छ (न्यूनतम १८ अंक उत्तीर्ण)। सामान्य समझदारी र शान्ति पूजा गरेर विवाह गर्न सकिन्छ।`;
    verdictSummaryEn = `Scored ${totalPoints}/36 points. Meets standard Vedic threshold; mutual maturity will enhance the bond.`;
  } else {
    verdictCategory = 'critical';
    verdictTitleNe = 'विचारणीय मिलान (दोषयुक्त वा न्यून गुण)';
    verdictTitleEn = 'Inauspicious / Low Guna Match';
    verdictSummaryNe = `३६ मा कुल ${totalPoints} गुण मात्र प्राप्त भएको छ। वैवाहिक निर्णय लिनु अघि अनुभवी ज्योतिषाचार्यसँग परामर्श र ग्रह शान्ति आवश्यक छ।`;
    verdictSummaryEn = `Scored ${totalPoints}/36 points. Below traditional threshold; detailed chart analysis recommended.`;
  }

  // Manglik Analysis if planetary data provided
  let manglikAnalysis: ManglikMatchAnalysis | undefined = undefined;
  if (boyData.planets && girlData.planets) {
    const boyManglik = analyzeManglikPerson(boyName, boyData.planets);
    const girlManglik = analyzeManglikPerson(girlName, girlData.planets);
    manglikAnalysis = evaluateManglikMatching(boyManglik, girlManglik);
  }

  // Master Recommendations & Remedies
  const remediesNe: string[] = [
    'विवाह पूर्व कुलदेवता, इष्टदेवता र पितृहरूको विधिवत पूजा-अर्चना गर्नुहोस्।',
    'वैवाहिक जीवनको सुख र दीर्घायुका लागि भगवान शिव-पार्वतीको संयुक्त आराधना शुभ मानिन्छ।'
  ];

  if (hasActiveNadiDosha) {
    remediesNe.push('नाडी दोष शान्तिका लागि महामृत्युञ्जय मन्त्रको सवालाख जप वा रुद्राभिषेक गर्नुहोस्।');
  }
  if (hasActiveShadashtak) {
    remediesNe.push('षडाष्टक दोष निवारणका लागि भगवान विष्णु र लक्ष्मीको संयुक्त उपासना तथा मङ्गल-शनि शान्ति गर्नुहोस्।');
  }

  return {
    totalPoints,
    maxPoints: 36,
    percentage,
    verdictCategory,
    verdictTitleNe,
    verdictTitleEn,
    verdictSummaryNe,
    verdictSummaryEn,
    boyInfo: {
      name: boyName,
      rashiNe: boyRashi.ne,
      rashiEn: boyRashi.en,
      nakshatraNe: boyNak.nameNe,
      nakshatraEn: boyNak.nameEn,
      pad: boyData.pad,
      rashiLordNe: boyRashi.lordNe
    },
    girlInfo: {
      name: girlName,
      rashiNe: girlRashi.ne,
      rashiEn: girlRashi.en,
      nakshatraNe: girlNak.nameNe,
      nakshatraEn: girlNak.nameEn,
      pad: girlData.pad,
      rashiLordNe: girlRashi.lordNe
    },
    kootas: ashtakoot.kootas,
    bhakootRelation: ashtakoot.bhakootRelation,
    nadiAnalysis: ashtakoot.nadiAnalysis,
    manglikAnalysis,
    specialYogas: ashtakoot.specialYogas,
    recommendationNe: verdictSummaryNe,
    recommendationEn: verdictSummaryEn,
    remediesNe
  };
}
