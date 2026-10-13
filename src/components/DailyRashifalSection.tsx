import React, { useState, useMemo } from 'react';
import {
  getLiveDailyRashifal,
  convertADtoBS,
  getAstronomicalPanchang,
  PanchangDetail,
  LOCATION_CONFIGS,
  toDevanagariDigits
} from '../utils/panchang';
import { Language, RashifalItem } from '../types';
import {
  Calendar,
  Clock,
  Star,
  Search,
  Briefcase,
  Heart,
  Activity,
  DollarSign,
  Shield,
  Bot,
  RefreshCw,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Compass,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Check,
  LayoutGrid
} from 'lucide-react';

interface DailyRashifalSectionProps {
  lang: Language;
}

export type PanchangSubMenu = 'panchang' | 'muhurat' | 'sait' | 'rashifal';

// Vedic Choghadiya sequence calculation
interface ChoghadiyaItem {
  nameNe: string;
  nameEn: string;
  type: 'amrit' | 'shubha' | 'labha' | 'chara' | 'udvega' | 'kaala' | 'roga';
  natureNe: string;
  natureEn: string;
  lordNe: string;
  timeRange: string;
  isGood: boolean;
}

// 7 Choghadiya names & planetary lords
const CHOGHADIYA_DEFINITIONS = {
  amrit: { nameNe: 'अमृत', nameEn: 'Amrita', natureNe: 'अति शुभ (Best)', natureEn: 'Very Auspicious', lordNe: 'चन्द्रमा', isGood: true },
  shubha: { nameNe: 'शुभ', nameEn: 'Shubha', natureNe: 'शुभ (Auspicious)', natureEn: 'Auspicious', lordNe: 'बृहस्पति (गुरु)', isGood: true },
  labha: { nameNe: 'लाभ', nameEn: 'Labha', natureNe: 'शुभ (Gain/Profit)', natureEn: 'Auspicious Gain', lordNe: 'बुध', isGood: true },
  chara: { nameNe: 'चर', nameEn: 'Chara', natureNe: 'सामान्य शुभ (Neutral)', natureEn: 'Neutral / Travel', lordNe: 'शुक्र', isGood: true },
  udvega: { nameNe: 'उद्वेग', nameEn: 'Udvega', natureNe: 'अशुभ (Avoid)', natureEn: 'Inauspicious', lordNe: 'सूर्य', isGood: false },
  kaala: { nameNe: 'काल', nameEn: 'Kaala', natureNe: 'अशुभ (Loss/Avoid)', natureEn: 'Inauspicious Loss', lordNe: 'शनि', isGood: false },
  roga: { nameNe: 'रोग', nameEn: 'Roga', natureNe: 'अशुभ (Illness/Avoid)', natureEn: 'Inauspicious Obstacle', lordNe: 'मङ्गल', isGood: false },
};

// Day starting orders for 0 = Sun, 1 = Mon, ..., 6 = Sat
const DAY_CHOGHADIYA_ORDER: Array<Array<keyof typeof CHOGHADIYA_DEFINITIONS>> = [
  ['udvega', 'chara', 'labha', 'amrit', 'kaala', 'shubha', 'roga', 'udvega'], // Sun
  ['amrit', 'kaala', 'shubha', 'roga', 'udvega', 'chara', 'labha', 'amrit'],   // Mon
  ['roga', 'udvega', 'chara', 'labha', 'amrit', 'kaala', 'shubha', 'roga'],   // Tue
  ['labha', 'amrit', 'kaala', 'shubha', 'roga', 'udvega', 'chara', 'labha'],   // Wed
  ['shubha', 'roga', 'udvega', 'chara', 'labha', 'amrit', 'kaala', 'shubha'],   // Thu
  ['chara', 'labha', 'amrit', 'kaala', 'shubha', 'roga', 'udvega', 'chara'],   // Fri
  ['kaala', 'shubha', 'roga', 'udvega', 'chara', 'labha', 'amrit', 'kaala'],   // Sat
];

const NIGHT_CHOGHADIYA_ORDER: Array<Array<keyof typeof CHOGHADIYA_DEFINITIONS>> = [
  ['shubha', 'amrit', 'chara', 'roga', 'kaala', 'labha', 'udvega', 'shubha'], // Sun Night
  ['chara', 'roga', 'kaala', 'labha', 'udvega', 'shubha', 'amrit', 'chara'],   // Mon Night
  ['kaala', 'labha', 'udvega', 'shubha', 'amrit', 'chara', 'roga', 'kaala'],   // Tue Night
  ['udvega', 'shubha', 'amrit', 'chara', 'roga', 'kaala', 'labha', 'udvega'], // Wed Night
  ['amrit', 'chara', 'roga', 'kaala', 'labha', 'udvega', 'shubha', 'amrit'],   // Thu Night
  ['roga', 'kaala', 'labha', 'udvega', 'shubha', 'amrit', 'chara', 'roga'],   // Fri Night
  ['labha', 'udvega', 'shubha', 'amrit', 'chara', 'roga', 'kaala', 'labha'],   // Sat Night
];

// Vedic Zodiac Syllables (नामाक्षरहरू) & Planetary Lords
const RASHI_LETTERS: Record<string, string> = {
  'मेष': 'चु, चे, चो, ला, लि, लु, ले, लो, अ',
  'वृष': 'इ, उ, ए, ओ, वा, वि, वु, वे, वो',
  'मिथुन': 'का, कि, कु, घ, ङ, छ, के, को, हा',
  'कर्कट': 'हि, हु, हे, हो, डा, डि, डु, डे, डो',
  'सिंह': 'मा, मि, मु, मे, मो, टा, टि, टु, टे',
  'कन्या': 'टो, पा, पि, पु, ष, ण, ठ, पे, पो',
  'तुला': 'रा, रि, रु, रे, रो, ता, ति, तु, ते',
  'वृश्चिक': 'तो, ना, नि, नु, ने, नो, या, यि, यु',
  'धनु': 'ये, यो, भा, भि, भु, धा, फा, ढा, भे',
  'मकर': 'भो, जा, जि, खि, खु, खे, खो, गा, गि',
  'कुम्भ': 'गु, गे, गो, सा, सि, सु, से, सो, दा',
  'मीन': 'दि, दु, थ, झ, ञ, दे, दो, चा, चि',
};

const RASHI_LORDS: Record<string, string> = {
  'मेष': 'मङ्गल (Mars)',
  'वृष': 'शुक्र (Venus)',
  'मिथुन': 'बुध (Mercury)',
  'कर्कट': 'चन्द्रमा (Moon)',
  'सिंह': 'सूर्य (Sun)',
  'कन्या': 'बुध (Mercury)',
  'तुला': 'शुक्र (Venus)',
  'वृश्चिक': 'मङ्गल (Mars)',
  'धनु': 'बृहस्पति (Jupiter)',
  'मकर': 'शनि (Saturn)',
  'कुम्भ': 'शनि (Saturn)',
  'मीन': 'बृहस्पति (Jupiter)',
};

export const DailyRashifalSection: React.FC<DailyRashifalSectionProps> = ({ lang }) => {
  // 4 Sub-menus in Grid Mode: पञ्चाङ्ग / मुहूर्त / साईत / राशिफल
  // Default to null so initially ONLY the menu grid is visible, and details appear only after open
  const [activeSubMenu, setActiveSubMenu] = useState<PanchangSubMenu | null>(null);

  // Active Ceremony in Sait Sub-menu: default to null so initially only ceremony grid is visible
  const [activeCeremony, setActiveCeremony] = useState<string | null>(null);

  // Shared date & location state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<string>('Kathmandu');

  // Rashifal specific states
  const [activeRashifalTab, setActiveRashifalTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  // Initially null so 12 Rashis grid is shown, and only the tapped Rashi opens
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [aiModalRashi, setAiModalRashi] = useState<RashifalItem | null>(null);
  const [aiPredictionText, setAiPredictionText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Panchang calculations for selected date & location
  const p: PanchangDetail = useMemo(() => {
    return getAstronomicalPanchang(selectedDate, selectedLocation);
  }, [selectedDate, selectedLocation]);

  // Dynamic Astrological Calculations for Ceremonies (Shiva Vasa, Agni Vasa, etc.)
  const ceremonyCalc = useMemo(() => {
    const tithiNum = (p.tithiNumber || 0) + 1; // 1 to 30
    const dayIdx = selectedDate.getDay();

    // Shiva Vasa for Rudri: ((Tithi * 2 + 5) % 7)
    // 1 = Kailasha (Supreme), 2 = Nandi (Auspicious), 6 = Sabha (Auspicious)
    const shivaRem = ((tithiNum * 2 + 5) % 7);
    let shivaVasaName = '';
    let shivaVasaDesc = '';
    let shivaVasaIsAuspicious = false;

    if (shivaRem === 1) {
      shivaVasaName = 'कैलाशे (कैलास पर्वतमा)';
      shivaVasaDesc = 'भगवान शिव कैलासमा विराजमान हुनुहुन्छ। सुख, शान्ति र समृद्धि प्राप्त हुने अति शुभ दिन।';
      shivaVasaIsAuspicious = true;
    } else if (shivaRem === 2) {
      shivaVasaName = 'नन्दिनि (नन्दी वृषभारूढ)';
      shivaVasaDesc = 'शिवजी नन्दीमा सवार हुनुहुन्छ। सम्पूर्ण मनोकामना सिद्धि र अभीष्ट फल मिल्ने अति उत्तम दिन।';
      shivaVasaIsAuspicious = true;
    } else if (shivaRem === 6) {
      shivaVasaName = 'सभायाम् (सभामा)';
      shivaVasaDesc = 'भगवान शिव सभामा विराजमान हुनुहुन्छ। कार्य सिद्धि, पद-प्रतिष्ठा र विजयका लागि शुभ।';
      shivaVasaIsAuspicious = true;
    } else if (shivaRem === 3) {
      shivaVasaName = 'भोजने (भोजन गर्दै)';
      shivaVasaDesc = 'शिव वास भोजनमा छ। नित्य पूजा र जपका लागि ठिक, विशेष काम्य रुद्रीका लागि मध्यम।';
      shivaVasaIsAuspicious = false;
    } else if (shivaRem === 4) {
      shivaVasaName = 'क्रीडायाम् (क्रीडा/विहारमा)';
      shivaVasaDesc = 'शिव वास क्रीडामा छ। विशेष कामनासहितको रुद्रीका लागि विचारणीय।';
      shivaVasaIsAuspicious = false;
    } else if (shivaRem === 5) {
      shivaVasaName = 'श्मशाने (श्मशानमा)';
      shivaVasaDesc = 'शिव वास श्मशानमा छ। विशेष काम्य अनुष्ठानको सट्टा महामृत्युञ्जय जप गर्नु उचित।';
      shivaVasaIsAuspicious = false;
    } else {
      shivaVasaName = 'शयने / भूम्याम् (विश्राममा)';
      shivaVasaDesc = 'शिव वास विश्राममा छ। साधारण पूजा तथा आरती शुभ, लघुरुद्रीका लागि अर्को दिन विचार गर्नुहोला।';
      shivaVasaIsAuspicious = false;
    }

    // Agni Vasa for Hawan: (Tithi + Vara + 1) % 4
    // 1, 3 = Prithvi (Auspicious), 2 = Patala, 0 = Akasha
    const agniRem = ((tithiNum + dayIdx + 1) % 4);
    const agniIsGood = (agniRem === 1 || agniRem === 3);
    const agniVasaName = agniIsGood
      ? 'पृथ्वी (भूमौ — सर्वसिद्धिप्रद)'
      : (agniRem === 2 ? 'पाताल (अशुभ)' : 'आकाश (अशुभ)');

    return {
      tithiNum,
      shivaRem,
      shivaVasaName,
      shivaVasaDesc,
      shivaVasaIsAuspicious,
      agniIsGood,
      agniVasaName,
    };
  }, [p.tithiNumber, selectedDate]);

  const bsInfo = useMemo(() => convertADtoBS(selectedDate), [selectedDate]);
  const dateStrAd = selectedDate.toISOString().split('T')[0];

  // Helper date manipulators
  const handleOffsetDays = (days: number) => {
    const newD = new Date(selectedDate);
    newD.setDate(newD.getDate() + days);
    setSelectedDate(newD);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  // Live Rashifal dataset
  const currentDataset: RashifalItem[] = useMemo(() => {
    return getLiveDailyRashifal(selectedDate, activeRashifalTab, lang);
  }, [selectedDate, activeRashifalTab, lang]);

  const filteredRashifal = useMemo(() => {
    return currentDataset.filter(
      (item) =>
        item.rashi.includes(searchTerm) ||
        item.englishName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentDataset, searchTerm]);

  // AI Rashifal fetch
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
          period: activeRashifalTab,
          language: lang,
          targetDate: dateStrAd,
        }),
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

  // Calculate 8 Day and 8 Night Choghadiyas for selected date
  const dayIndex = selectedDate.getDay();
  const dayChoghadiyas: ChoghadiyaItem[] = useMemo(() => {
    const order = DAY_CHOGHADIYA_ORDER[dayIndex] || DAY_CHOGHADIYA_ORDER[0];
    // Approximate daylight between ~5:30 AM and 6:30 PM (approx 78-85 min each)
    const baseHour = 5;
    const baseMin = 45;
    const slotMin = 82; // ~1 hr 22 min per Choghadiya

    return order.map((key, i) => {
      const def = CHOGHADIYA_DEFINITIONS[key];
      const startMinTotal = baseHour * 60 + baseMin + i * slotMin;
      const endMinTotal = startMinTotal + slotMin;
      const formatTimeSlot = (totalMins: number) => {
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        const period = h >= 12 ? 'अपराह्न' : 'पूर्वाह्न';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${toDevanagariDigits(displayH)}:${toDevanagariDigits(m < 10 ? '0' + m : m)} ${period}`;
      };

      return {
        nameNe: def.nameNe,
        nameEn: def.nameEn,
        type: key,
        natureNe: def.natureNe,
        natureEn: def.natureEn,
        lordNe: def.lordNe,
        timeRange: `${formatTimeSlot(startMinTotal)} - ${formatTimeSlot(endMinTotal)}`,
        isGood: def.isGood,
      };
    });
  }, [dayIndex]);

  const nightChoghadiyas: ChoghadiyaItem[] = useMemo(() => {
    const order = NIGHT_CHOGHADIYA_ORDER[dayIndex] || NIGHT_CHOGHADIYA_ORDER[0];
    const baseHour = 18;
    const baseMin = 40;
    const slotMin = 83;

    return order.map((key, i) => {
      const def = CHOGHADIYA_DEFINITIONS[key];
      const startMinTotal = baseHour * 60 + baseMin + i * slotMin;
      const endMinTotal = startMinTotal + slotMin;
      const formatTimeSlot = (totalMins: number) => {
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        const period = h >= 12 ? 'रात्रि' : 'बिहानी';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${toDevanagariDigits(displayH)}:${toDevanagariDigits(m < 10 ? '0' + m : m)} ${period}`;
      };

      return {
        nameNe: def.nameNe,
        nameEn: def.nameEn,
        type: key,
        natureNe: def.natureNe,
        natureEn: def.natureEn,
        lordNe: def.lordNe,
        timeRange: `${formatTimeSlot(startMinTotal)} - ${formatTimeSlot(endMinTotal)}`,
        isGood: def.isGood,
      };
    });
  }, [dayIndex]);

  // Sub-menu metadata for 4-Card Grid Mode
  const subMenuItems = [
    {
      id: 'panchang' as PanchangSubMenu,
      titleNe: 'पञ्चाङ्ग',
      titleEn: 'Panchang',
      icon: Calendar,
      badgeNe: '५ अङ्गहरू',
      badgeEn: '5 Limbs',
      descNe: 'तिथि, नक्षत्र, योग, करण र ५ अङ्ग गणना',
      descEn: 'Tithi, Nakshatra, Yoga, Karana & Samvat',
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'muhurat' as PanchangSubMenu,
      titleNe: 'मुहूर्त',
      titleEn: 'Muhurat',
      icon: Clock,
      badgeNe: 'शुभ / त्याज्य',
      badgeEn: 'Timings',
      descNe: 'अभिजित्, राहु काल, यमकण्ड र दिन-रातको चौघडिया',
      descEn: 'Abhijit, Rahu Kaal, Yamaganda & Choghadiya',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'sait' as PanchangSubMenu,
      titleNe: 'साईत',
      titleEn: 'Sait',
      icon: Sparkles,
      badgeNe: 'शुभ संस्कार',
      badgeEn: 'Ceremonies',
      descNe: 'विवाह, व्रतबन्ध, गृहप्रवेश, पास्नी र व्यापार साईत',
      descEn: 'Marriage, Bratabandha, Griha Pravesh & Travel',
      color: 'from-amber-500 to-rose-600',
    },
    {
      id: 'rashifal' as PanchangSubMenu,
      titleNe: 'राशिफल',
      titleEn: 'Rashifal',
      icon: Star,
      badgeNe: '१२ राशी',
      badgeEn: '12 Zodiacs',
      descNe: 'दैनिक, साप्ताहिक, मासिक तथा वार्षिक राशीफल',
      descEn: 'Daily, Weekly, Monthly & Yearly Horoscope',
      color: 'from-purple-600 to-indigo-700',
    },
  ];



  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & MAIN TITLE (सुरुको मुख्य मेनुमा मात्र देखिने - अन्य सेक्सनमा नछेकिने) */}
      {/* ============================================================== */}
      {activeSubMenu === null && (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900/90 to-amber-950 rounded-2xl border-2 border-amber-600/70 p-4 sm:p-6 shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 flex items-center justify-center sm:justify-start gap-2.5">
                <span>{lang === 'ne' ? 'पञ्चाङ्ग र राशिफल' : 'Panchang & Rashifal'}</span>
              </h1>
            </div>

            {/* Current BS Date & Samvatsara Quick Pill */}
            <div className="bg-amber-900/80 border border-amber-700/80 rounded-xl p-3 text-center sm:text-right shrink-0 space-y-0.5 shadow-md">
              <span className="text-[11px] text-amber-400 font-semibold block">
                {p.bsDateStr} ({p.dayNameNe})
              </span>
              <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-amber-200">
                <span>संवत्सर:</span>
                <strong className="text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-600/50">
                  रौद्र (Raudra)
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DATE & LOCATION CONTROLLER (SHARED FOR PANCHANG / MUHURAT / SAIT) */}
      {/* ============================================================== */}
      {activeSubMenu !== 'rashifal' && (
        <div className="bg-amber-950/90 p-3.5 rounded-2xl border border-amber-700/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-lg">
        {/* Quick Date Shift Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-center">
          <button
            onClick={() => handleOffsetDays(-1)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 transition-all flex items-center gap-1 active:scale-95"
            title="हिजो (Yesterday)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'हिजो' : 'Yesterday'}</span>
          </button>

          <button
            onClick={handleSetToday}
            className={`px-3.5 py-1.5 rounded-lg border font-bold transition-all active:scale-95 ${
              selectedDate.toDateString() === new Date().toDateString()
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md ring-2 ring-amber-300/40'
                : 'bg-amber-900/60 hover:bg-amber-800 border-amber-700/60 text-amber-200'
            }`}
          >
            {lang === 'ne' ? 'आज (Today)' : 'Today'}
          </button>

          <button
            onClick={() => handleOffsetDays(1)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 transition-all flex items-center gap-1 active:scale-95"
            title="भोलि (Tomorrow)"
          >
            <span>{lang === 'ne' ? 'भोलि' : 'Tomorrow'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleOffsetDays(2)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 transition-all hidden sm:inline-flex active:scale-95"
            title="पर्सि (Day After)"
          >
            <span>{lang === 'ne' ? 'पर्सि' : 'Day After'}</span>
          </button>
        </div>

        {/* Date Selector & Location */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-center flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-900/60 border border-amber-700/60 rounded-xl px-3 py-1.5 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={dateStrAd}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(new Date(e.target.value));
              }}
              className="bg-transparent text-amber-100 font-sans text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-amber-900/60 border border-amber-700/60 rounded-xl px-2.5 py-1.5 shadow-inner">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-amber-100 text-xs focus:outline-none cursor-pointer"
            >
              <option value="Sankhuwasabha" className="bg-amber-950 text-amber-100">संखुवासभा ( खाँदबारी/तुमलिङटार )</option>
              <option value="Kathmandu" className="bg-amber-950 text-amber-100">काठमाडौँ ( Kathmandu )</option>
              <option value="Pokhara" className="bg-amber-950 text-amber-100">पोखरा ( Pokhara )</option>
              <option value="Biratnagar" className="bg-amber-950 text-amber-100">विराटनगर ( Biratnagar )</option>
              <option value="Chitwan" className="bg-amber-950 text-amber-100">चितवन ( Chitwan )</option>
              <option value="Janakpur" className="bg-amber-950 text-amber-100">जनकपुर ( Janakpur )</option>
              <option value="Butwal" className="bg-amber-950 text-amber-100">बुटवल ( Butwal )</option>
              <option value="Surkhet" className="bg-amber-950 text-amber-100">सुर्खेत ( Surkhet )</option>
              <option value="Dhangadhi" className="bg-amber-950 text-amber-100">धनगढी ( Dhangadhi )</option>
            </select>
          </div>
        </div>
      </div>
    )}

      {/* ============================================================== */}
      {/* 3. SUB MENU GRID MODE (पञ्चाङ्ग / मुहूर्त / साईत / राशिफल) - सुरुमा मात्र देखिने */}
      {/* ============================================================== */}
      {activeSubMenu === null && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-amber-300 font-serif">
                {lang === 'ne' ? 'सब-मेनु ग्रिड (Sub-Menu Grid Mode):' : 'Select Sub-Menu (Grid Mode):'}
              </h2>
            </div>
            <span className="text-[11px] text-amber-300/80">
              {lang === 'ne' ? '👈 कुनै एक मेनु छनौट गरी खोल्नुहोस्' : 'Click any menu to open'}
            </span>
          </div>

          {/* 4-Card Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubMenu(item.id)}
                  className="group relative text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border flex flex-col justify-between overflow-hidden cursor-pointer bg-gradient-to-b from-amber-950/80 via-stone-950 to-amber-950/80 border-amber-800/60 hover:border-amber-500 hover:bg-amber-900/40 shadow-lg active:scale-98"
                >
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow transition-transform group-hover:scale-105 bg-amber-900/60 text-amber-300 border border-amber-700/60">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-950/70 text-amber-300/90 border-amber-800/60 group-hover:border-amber-600">
                      {lang === 'ne' ? item.badgeNe : item.badgeEn}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-amber-200/95 group-hover:text-amber-100">
                      {lang === 'ne' ? item.titleNe : item.titleEn}
                    </h3>
                    <p className="text-[11px] text-amber-300/75 line-clamp-1 mt-0.5">
                      {lang === 'ne' ? item.descNe : item.descEn}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-amber-800/40 flex items-center justify-between text-[11px]">
                    <span className="font-semibold flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{lang === 'ne' ? 'खोल्नुहोस्' : 'Open'}</span>
                      <ArrowRight className="w-3 h-3 inline" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* ============================================================== */}
      {/* 4. FAST SUB-MENU TOGGLE STRIP (जब कुनै मेनु खुला छ - १ क्लिक स्विच र मेनुमा फर्कने) */}
      {/* ============================================================== */}
      {activeSubMenu !== null && (
        <div className="bg-amber-950/90 p-2.5 rounded-xl border border-amber-700/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveSubMenu(null)}
              className="px-3 py-1.5 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-200 hover:text-amber-100 border border-amber-600/70 font-bold font-serif flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
              title="सबै मेनु ग्रिडमा फर्कनुहोस्"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>← {lang === 'ne' ? 'मुख्य मेनु ग्रिड' : 'Menu Grid'}</span>
            </button>

            <div className="h-4 w-px bg-amber-800/80 hidden sm:block" />

            <span className="text-[11px] text-amber-300/80 font-serif">
              {lang === 'ne' ? 'सिधै जानुहोस्:' : 'Direct switch:'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto justify-between sm:justify-end">
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubMenu(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold font-serif transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300 font-extrabold'
                      : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 border border-amber-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'ne' ? item.titleNe : item.titleEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ONLY THE ACTIVE SUB-MENU CONTENT IS RENDERED BELOW */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* SUB-MENU 1: पञ्चाङ्ग (Panchang) */}
      {/* -------------------------------------------------------------- */}
      {activeSubMenu === 'panchang' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Panchang Main Card */}
          <div className="bg-gradient-to-b from-amber-950/90 via-amber-900/60 to-amber-950/90 rounded-2xl border-2 border-amber-600/60 shadow-2xl p-5 sm:p-6 space-y-6">
            {/* Top Banner Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-700/60 pb-4 text-center sm:text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'ne' ? 'प्रत्यक्ष वैदिक शुद्ध पञ्चाङ्ग' : 'Live Astronomical Panchang'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-6 h-6 text-amber-400" />
                  <span>{p.bsDateStr}</span>
                  <span className="text-amber-400 text-lg">({p.dayNameNe})</span>
                </h2>
                <p className="text-xs text-amber-300/80 mt-1 flex items-center flex-wrap gap-2 justify-center sm:justify-start">
                  <span>{p.englishDate} • {p.dayNameEn} • {p.ayana} • {p.ritu}</span>
                  <span className="bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/50">
                    📍 {p.locationNameNe} ({p.locationDesc})
                  </span>
                </p>
              </div>

              {/* Samvat Badges */}
              <div className="flex flex-wrap sm:flex-col items-end justify-center gap-1.5 text-[11px] text-amber-200">
                <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
                  वि.सं.: <strong className="text-amber-300">{p.vikramSamvat}</strong>
                </span>
                <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
                  ने.सं.: <strong className="text-amber-300">{p.nepalSamvat}</strong>
                </span>
                <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
                  संवत्सर:{' '}
                  <strong className="text-amber-300 underline font-bold">
                    {p.samvatsara}
                  </strong>
                </span>
                <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
                  पक्ष: <strong className="text-amber-300">{p.paksha}</strong>
                </span>
              </div>
            </div>

            {/* 5 Limbs of Panchanga Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span>पञ्चाङ्गका ५ अङ्गहरू (The 5 Limbs of Vedic Time):</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Tithi */}
                <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">१. तिथि (Tithi)</span>
                  <p className="font-bold text-amber-100 text-sm">{p.tithi}</p>
                  <span className="text-[10px] text-amber-300/80 block">समाप्ति: {p.tithiEndApprox}</span>
                </div>

                {/* Nakshatra */}
                <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">२. नक्षत्र (Nakshatra)</span>
                  <p className="font-bold text-amber-100 text-sm">{p.nakshatra} (पद {p.nakshatraPad})</p>
                  <span className="text-[10px] text-amber-300/80 block">समाप्ति: {p.nakshatraEndApprox}</span>
                </div>

                {/* Yoga */}
                <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">३. योग (Yoga)</span>
                  <p className="font-bold text-amber-100 text-sm">{p.yoga}</p>
                  <span className="text-[10px] text-amber-300/80 block">विशिष्ट वैदिक योग</span>
                </div>

                {/* Karana */}
                <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">४. करण (Karana)</span>
                  <p className="font-bold text-amber-100 text-sm">{p.karana}</p>
                  <span className="text-[10px] text-amber-300/80 block">आधा तिथिको करण</span>
                </div>
              </div>
            </div>

            {/* Sun & Moon Times */}
            <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/80 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>सूर्य तथा चन्द्रमा समय (Sun & Moon Times)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 flex items-center justify-between">
                  <span className="text-amber-300/90 text-[11px]">🌅 सूर्योदय:</span>
                  <strong className="text-amber-100">{p.sunrise}</strong>
                </div>
                <div className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 flex items-center justify-between">
                  <span className="text-amber-300/90 text-[11px]">🌇 सूर्यास्त:</span>
                  <strong className="text-amber-100">{p.sunset}</strong>
                </div>
                <div className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 flex items-center justify-between">
                  <span className="text-amber-300/90 text-[11px]">🌙 चन्द्रोदय:</span>
                  <strong className="text-amber-100">{p.moonrise}</strong>
                </div>
                <div className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 flex items-center justify-between">
                  <span className="text-amber-300/90 text-[11px]">🌄 चन्द्रास्त:</span>
                  <strong className="text-amber-100">{p.moonset}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-800/40 text-amber-200">
                <span>☀️ सूर्य राशि: <strong className="text-amber-300">{p.sunSign}</strong></span>
                <span>🌕 चन्द्र राशि: <strong className="text-amber-300">{p.moonSign}</strong></span>
              </div>
            </div>

            {/* Special Notice / Event Box */}
            <div className="bg-gradient-to-r from-amber-900/50 via-amber-800/40 to-amber-900/50 p-4 rounded-xl border border-amber-600/50 space-y-2 text-xs">
              <h3 className="font-bold text-amber-300 font-serif flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>विशेष पर्व, व्रत तथा योग (Special Events & Highlights):</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-100">
                {p.specialEvents.map((evt, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">✦</span>
                    <span>{evt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* SUB-MENU 2: मुहूर्त (Muhurat) */}
      {/* -------------------------------------------------------------- */}
      {activeSubMenu === 'muhurat' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Muhurat Top Card */}
          <div className="bg-gradient-to-b from-amber-950/90 via-amber-900/60 to-amber-950/90 rounded-2xl border-2 border-amber-600/60 shadow-2xl p-5 sm:p-6 space-y-6">
            <div className="border-b border-amber-800/60 pb-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <span>{lang === 'ne' ? 'शुभ तथा अशुभ मुहूर्त समय' : 'Auspicious & Inauspicious Muhurats'}</span>
                </h2>
                <p className="text-xs text-amber-300/80 mt-1">
                  {p.bsDateStr} ({p.dayNameNe}) • स्थान: {p.locationNameNe}
                </p>
              </div>
              <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-3 py-1 rounded-full font-bold">
                अभिजित् तथा चौघडिया बेला
              </span>
            </div>

            {/* Abhijit & Rahu Kaal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Abhijit Muhurat */}
              <div className="bg-emerald-950/60 border-2 border-emerald-500/70 p-4 rounded-xl space-y-2 text-emerald-100 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 font-serif text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>अभिजित् मुहूर्त (अति शुभ समय)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    सर्वोत्तम
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-emerald-200 font-mono">
                  {p.abhijitMuhurat}
                </p>
              </div>

              {/* Rahu Kaal */}
              <div className="bg-rose-950/60 border-2 border-rose-500/70 p-4 rounded-xl space-y-2 text-rose-100 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 font-serif text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>राहु काल (अशुभ / त्याज्य समय)</span>
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    त्याज्य
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-rose-200 font-mono">
                  {p.rahuKaal}
                </p>
              </div>
            </div>

            {/* Yamaganda & Gulikai + Disha Shool */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Yamaganda & Gulikai */}
              <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/80 space-y-2.5">
                <h3 className="text-xs font-bold text-amber-300 font-serif">यमकण्ड तथा गुलिक काल:</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-amber-900/40 border border-amber-800/50 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-amber-200">यमकण्ड समय (अशुभ):</span>
                    <strong className="text-amber-300 font-mono text-sm">{p.yamaganda}</strong>
                  </div>
                  <div className="bg-amber-900/40 border border-amber-800/50 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-amber-200">गुलिक काल (त्याज्य):</span>
                    <strong className="text-amber-300 font-mono text-sm">{p.gulikaiKaal}</strong>
                  </div>
                </div>
              </div>

              {/* Disha Shool */}
              <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-serif">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>आजको दिशा शूल तथा निवारण उपाय:</span>
                </div>
                <div className="bg-amber-900/40 border border-amber-800/50 p-2.5 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-200">निषेधित दिशा:</span>
                    <strong className="text-amber-300 font-bold">{p.dishaShool}</strong>
                  </div>
                  <p className="text-[11px] text-amber-300/90 pt-1 border-t border-amber-800/40">
                    💡 <span className="font-semibold text-amber-200">अचुक यात्रा उपाय:</span> {p.dishaShoolRemedy}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Day Choghadiya Table */}
            <div className="space-y-3 pt-2 border-t border-amber-800/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>दिनको चौघडिया तालिका (८ प्रहर — सूर्योदय देखि सूर्यास्त सम्म):</span>
                </h3>
                <span className="text-[10px] text-amber-400/80">सूर्योदय {p.sunrise} - सूर्यास्त {p.sunset}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {dayChoghadiyas.map((ch, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                      ch.isGood
                        ? 'bg-amber-900/30 border-emerald-700/50 hover:border-emerald-500'
                        : 'bg-rose-950/30 border-rose-800/50 hover:border-rose-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-100 flex items-center gap-1.5">
                        <span>{ch.isGood ? '🟢' : '🔴'}</span>
                        <span>{ch.nameNe} ({ch.nameEn})</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ch.isGood
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        }`}
                      >
                        {ch.natureNe}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-amber-200/90 font-medium">
                      {ch.timeRange}
                    </p>

                    <span className="text-[10px] text-amber-400/80">
                      ग्रह स्वामी: {ch.lordNe}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Night Choghadiya Table */}
            <div className="space-y-3 pt-2 border-t border-amber-800/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span>रातको चौघडिया तालिका (८ प्रहर — सूर्यास्त देखि अर्को सूर्योदय सम्म):</span>
                </h3>
                <span className="text-[10px] text-amber-400/80">रात्रि चौघडिया</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {nightChoghadiyas.map((ch, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                      ch.isGood
                        ? 'bg-amber-900/30 border-emerald-700/50 hover:border-emerald-500'
                        : 'bg-rose-950/30 border-rose-800/50 hover:border-rose-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-100 flex items-center gap-1.5">
                        <span>{ch.isGood ? '🟢' : '🔴'}</span>
                        <span>{ch.nameNe} ({ch.nameEn})</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ch.isGood
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                        }`}
                      >
                        {ch.natureNe}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-amber-200/90 font-medium">
                      {ch.timeRange}
                    </p>

                    <span className="text-[10px] text-amber-400/80">
                      ग्रह स्वामी: {ch.lordNe}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* SUB-MENU 3: साईत (Sait) */}
      {/* -------------------------------------------------------------- */}
      {activeSubMenu === 'sait' && (() => {
        // 9 Ceremonial Sait Items for the Grid Mode
        const ceremoniesList = [
          {
            id: 'vivaha',
            titleNe: 'विवाह साईत',
            titleEn: 'Vivaha (Marriage)',
            icon: '💍',
            subNe: 'लगन, वर-वधु तारा तथा चन्द्र शुद्धि',
            badgeNe: 'मांगलिक कार्य',
            color: 'from-rose-950 to-amber-950 border-rose-700/60',
          },
          {
            id: 'rudri',
            titleNe: 'रुद्री / रुद्राभिषेक',
            titleEn: 'Rudri (Shiva Puja)',
            icon: '🔱',
            subNe: `शिव वास: ${ceremonyCalc.shivaVasaName}`,
            badgeNe: ceremonyCalc.shivaVasaIsAuspicious ? '🟢 अति शुभ शिव वास' : '🟡 शिव वास विचार',
            color: 'from-teal-950 to-amber-950 border-teal-700/60',
          },
          {
            id: 'bratabandha',
            titleNe: 'व्रतबन्ध तथा चूडाकर्म',
            titleEn: 'Bratabandha (Upanayana)',
            icon: '📿',
            subNe: 'जनै धारण, गायत्री दीक्षा र उपनयन',
            badgeNe: 'वैदिक दीक्षा',
            color: 'from-amber-950 to-orange-950 border-amber-700/60',
          },
          {
            id: 'grihapravesh',
            titleNe: 'गृहप्रवेश तथा वास्तु',
            titleEn: 'Griha Pravesh & Vastu',
            icon: '🏡',
            subNe: 'अपूर्व/सपूर्व घर प्रवेश र जग पूजा',
            badgeNe: 'वास्तु शान्ति',
            color: 'from-emerald-950 to-amber-950 border-emerald-700/60',
          },
          {
            id: 'pasni',
            titleNe: 'पास्नी तथा नामकरण',
            titleEn: 'Pasni & Naming',
            icon: '🍼',
            subNe: 'शिशु अन्नप्राशन (बालक ६ / बालिका ५ महिना)',
            badgeNe: 'बाल संस्कार',
            color: 'from-sky-950 to-amber-950 border-sky-700/60',
          },
          {
            id: 'vyapar',
            titleNe: 'व्यापार तथा पसल उद्घाटन',
            titleEn: 'Business & Shop Launch',
            icon: '🛍️',
            subNe: 'पसल ओपनिङ, खाता तथा कारोबार थालनी',
            badgeNe: 'लाभ/समृद्धि',
            color: 'from-yellow-950 to-amber-950 border-yellow-700/60',
          },
          {
            id: 'sawari',
            titleNe: 'सवारी (गाडी/बाइक) खरिद',
            titleEn: 'Vehicle Purchase',
            icon: '🚗',
            subNe: 'सवारी साधन खरिद, हस्तान्तरण र वाहन पूजा',
            badgeNe: 'वाहन शुद्धि',
            color: 'from-blue-950 to-amber-950 border-blue-700/60',
          },
          {
            id: 'yatra',
            titleNe: 'यात्रा तथा विदेश प्रस्थान',
            titleEn: 'Travel & Departure',
            icon: '✈️',
            subNe: `दिशा शूल: ${p.dishaShool}`,
            badgeNe: 'दिशा विचार',
            color: 'from-indigo-950 to-amber-950 border-indigo-700/60',
          },
          {
            id: 'hawan',
            titleNe: 'हवन, महायज्ञ तथा कुलपूजा',
            titleEn: 'Hawan, Yagya & Kulpuja',
            icon: '🌿',
            subNe: `अग्नि वास: ${ceremonyCalc.agniVasaName}`,
            badgeNe: ceremonyCalc.agniIsGood ? '🟢 शुभ अग्नि वास' : 'अग्नि वास',
            color: 'from-orange-950 to-amber-950 border-orange-700/60',
          },
        ];

        const selectedCeremonyObj = ceremoniesList.find((c) => c.id === activeCeremony) || null;

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Overview & Auspicious Belas */}
            <div className="bg-gradient-to-br from-amber-950/90 via-amber-900/50 to-amber-950/90 p-5 sm:p-6 rounded-2xl border-2 border-amber-600/60 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-800/60 pb-3 gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-200 font-serif flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <span>{lang === 'ne' ? 'शुभ साईत तथा वैदिक संस्कार मुहूर्त' : 'Shubha Sait & Auspicious Ceremonies'}</span>
                  </h2>
                  <p className="text-xs text-amber-300/80 mt-1">
                    {p.bsDateStr} ({p.dayNameNe}) • संवत्सर: <strong className="text-amber-200 font-bold">रौद्र</strong> • स्थान: {p.locationNameNe}
                  </p>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-sans font-medium">
                  {lang === 'ne' ? 'दैनिक शुभ चौघडिया एवं संस्कार साईत' : 'Daily Auspicious Sait'}
                </span>
              </div>

              {/* 3 Key Daily Auspicious Belas */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide font-serif">
                  आजका ३ विशेष शुभ बेलाहरू (Top Auspicious Windows):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/50 space-y-1">
                    <span className="text-[11px] text-amber-400 font-bold block">{lang === 'ne' ? '🌟 शुभ बेला:' : 'Shubha Timing:'}</span>
                    <strong className="text-amber-100 text-sm sm:text-base font-mono block">{p.shubhaSait.shubhaBela}</strong>
                    <span className="text-[10px] text-amber-300/80 block">शिक्षा, धर्म कर्म तथा नयाँ सुरुवात</span>
                  </div>
                  <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/50 space-y-1">
                    <span className="text-[11px] text-emerald-400 font-bold block">{lang === 'ne' ? '🍯 अमृत बेला:' : 'Amrit Timing:'}</span>
                    <strong className="text-emerald-200 text-sm sm:text-base font-mono block">{p.shubhaSait.amritBela}</strong>
                    <span className="text-[10px] text-emerald-300/80 block">दीर्घकालीन कार्य, लगानी तथा शुभ संस्कार</span>
                  </div>
                  <div className="bg-yellow-950/40 p-3 rounded-xl border border-yellow-800/50 space-y-1">
                    <span className="text-[11px] text-yellow-400 font-bold block">{lang === 'ne' ? '💰 लाभ बेला:' : 'Labha Timing:'}</span>
                    <strong className="text-yellow-100 text-sm sm:text-base font-mono block">{p.shubhaSait.labhaBela}</strong>
                    <span className="text-[10px] text-yellow-300/80 block">व्यापार शुभारम्भ, धन कारोबार र यात्रा</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* CEREMONY SAIT GRID MODE (विवाह, रुद्री, व्रतबन्ध, गृहप्रवेश...) */}
            {/* ========================================================== */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-1">
                <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide font-serif flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>संस्कार साईत ग्रिड मेनु (Select Ceremony in Grid Mode):</span>
                </h3>
                <span className="text-[11px] text-amber-300/80">
                  {activeCeremony === null ? '९ वटा विशिष्ट संस्कारहरू (कुनै एक खोल्नुहोस्)' : '९ वटा विशिष्ट संस्कारहरू'}
                </span>
              </div>

              {/* 9-Card Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                {ceremoniesList.map((c) => {
                  const isSelected = activeCeremony === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCeremony(c.id)}
                      className={`group relative text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-900/95 via-amber-800/85 to-amber-950 border-amber-400 shadow-2xl ring-2 ring-amber-400/50 -translate-y-0.5'
                          : 'bg-gradient-to-b from-amber-950/80 via-stone-950 to-amber-950/80 border-amber-800/60 hover:border-amber-500 hover:bg-amber-900/40 shadow-lg active:scale-98'
                      }`}
                    >
                      {/* Top Bar with Icon & Badge */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-2xl sm:text-3xl bg-amber-900/60 w-10 h-10 rounded-xl flex items-center justify-center border border-amber-700/60 shadow group-hover:scale-105 transition-transform">
                          {c.icon}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 border-amber-300 font-extrabold shadow-sm flex items-center gap-1'
                              : 'bg-amber-950/70 text-amber-300/90 border-amber-800/60 group-hover:border-amber-600'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>खुला छ</span>
                            </>
                          ) : (
                            c.badgeNe
                          )}
                        </span>
                      </div>

                      <div>
                        <h4
                          className={`text-sm sm:text-base font-serif font-bold ${
                            isSelected ? 'text-amber-100' : 'text-amber-200/95 group-hover:text-amber-100'
                          }`}
                        >
                          {c.titleNe}
                        </h4>
                        <p className="text-[11px] text-amber-300/80 line-clamp-1 mt-0.5">
                          {c.subNe}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-amber-800/40 flex items-center justify-between text-[11px]">
                        <span className={`font-semibold flex items-center gap-1 ${
                          isSelected ? 'text-amber-300 font-bold' : 'text-amber-400 group-hover:translate-x-0.5 transition-transform'
                        }`}>
                          {isSelected ? (
                            'विवरण अवलोकन हुँदैछ'
                          ) : (
                            <>
                              <span>साईत हेर्नुहोस्</span>
                              <ArrowRight className="w-3 h-3 inline" />
                            </>
                          )}
                        </span>
                      </div>

                      {/* Bottom Active Glow Bar */}
                      {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>


            {/* ========================================================== */}
            {/* ONLY THE OPENED CEREMONY DETAILS ARE DISPLAYED BELOW */}
            {/* ========================================================== */}
            {selectedCeremonyObj && (
              <div className="bg-gradient-to-b from-amber-950/95 via-stone-950 to-amber-950/95 p-5 sm:p-7 rounded-2xl border-2 border-amber-500/70 shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Ceremony Top Header & Back/Switcher Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-800/60 pb-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl sm:text-4xl bg-amber-900/80 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 border-amber-500/70 shadow-lg shrink-0">
                      {selectedCeremonyObj.icon}
                    </span>
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-0.5">
                        <span>वैदिक संस्कार साईत विवरण</span>
                        <span>•</span>
                        <span className="bg-amber-900/80 px-2 py-0.2 rounded text-[10px] text-amber-300 border border-amber-700/60">
                          {p.bsDateStr} ({p.dayNameNe})
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 flex items-center gap-2">
                        <span>{selectedCeremonyObj.titleNe}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <button
                      onClick={() => setActiveCeremony(null)}
                      className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/70 text-xs font-bold font-serif flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                      <span>← {lang === 'ne' ? 'सबै संस्कार ग्रिड' : 'All Ceremonies'}</span>
                    </button>

                    <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>सक्रिय खण्ड खुला छ</span>
                    </span>
                  </div>
                </div>

                {/* Fast Ceremony Switcher Strip */}
                <div className="bg-amber-950/90 p-2 rounded-xl border border-amber-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shadow-inner relative z-10">
                  <span className="text-amber-400 font-serif font-bold shrink-0 px-1">
                    {lang === 'ne' ? 'छिटो स्विच:' : 'Switch:'}
                  </span>
                  {ceremoniesList.map((c) => {
                    const isCur = activeCeremony === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveCeremony(c.id)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 font-bold cursor-pointer transition-all ${
                          isCur
                            ? 'bg-amber-500 text-stone-950 font-extrabold shadow'
                            : 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/60 border border-amber-800/40'
                        }`}
                      >
                        <span>{c.icon}</span>
                        <span>{c.titleNe.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

              {/* SPECIFIC CEREMONY VIEW: 1. VIVAHA */}
              {activeCeremony === 'vivaha' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>💍</span>
                      <span>आजको विवाह साईत स्थिति तथा लगन विचार:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      {p.shubhaSait.vivahaSait}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ विवाहका लागि आवश्यक शुद्धि:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li>वर र कन्या दुवैको <strong>तारा बल</strong> र <strong>चन्द्र बल</strong> अनुकूल हुनुपर्ने।</li>
                        <li>सूर्य, चन्द्र र गुरुको <strong>त्रिबल शुद्धि</strong> मिलेको हुनुपर्ने।</li>
                        <li>लग्न शुद्धि: ८औं भाव शुद्ध र केन्द्र-त्रिकोणमा शुभ ग्रह भएको लग्न शुभ हुन्छ।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ आजको शुभ समय विण्डो:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• अभिजित् मुहूर्त: <strong>{p.abhijitMuhurat}</strong></p>
                        <p>• शुभ बेला: <strong>{p.shubhaSait.shubhaBela}</strong></p>
                        <p>• गोधूलि बेला: सूर्यास्त पूर्व-पश्चात् १५ मिनेट</p>
                        <p className="text-rose-300 text-[11px] pt-1 border-t border-amber-800/40">
                          ⚠️ राहु काल ({p.rahuKaal}) मा सिन्दूर दान तथा मुख्य लगन निषेध गरिन्छ।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 2. RUDRI (रुद्री / रुद्राभिषेक) */}
              {activeCeremony === 'rudri' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Shiva Vasa Highlight Banner */}
                  <div
                    className={`p-4 rounded-xl border-2 space-y-2 ${
                      ceremonyCalc.shivaVasaIsAuspicious
                        ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-100'
                        : 'bg-amber-950/60 border-amber-600/70 text-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold font-serif text-sm flex items-center gap-2">
                        <span>🔱</span>
                        <span>शिव वास विचार (रुद्री तथा रुद्राभिषेक):</span>
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          ceremonyCalc.shivaVasaIsAuspicious
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {ceremonyCalc.shivaVasaIsAuspicious ? 'अति शुभ फलदायी' : 'सामान्य / जप विचार'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-amber-200">
                      आजको शिव वास: <span className="text-amber-400 underline">{ceremonyCalc.shivaVasaName}</span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans opacity-95">
                      {ceremonyCalc.shivaVasaDesc}
                    </p>
                  </div>

                  {/* Classical Rule Shloka & Vidhi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ शिव वास शास्त्रीय प्रमाण:</span>
                      <blockquote className="italic text-amber-200/90 font-serif border-l-2 border-amber-500 pl-2">
                        "कैलाशे लभते सौख्यं नन्द्यां च वृषवाहनम्।<br />
                        सभायां लभते सिद्धिं भोजने च तथा सुखम्॥"
                      </blockquote>
                      <p className="text-[11px] text-amber-300/80 pt-1">
                        भगवान शिव कैलासमा, नन्दीमा वा सभामा बस्नुभएको दिन रुद्री गर्दा पारिवारिक सुख, आरोग्य, सन्तान कल्याण र मोक्ष प्राप्त हुन्छ।
                      </p>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ रुद्रीका लागि आजको उत्तम समय:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• अमृत बेला: <strong>{p.shubhaSait.amritBela}</strong> (अभिषेकका लागि सर्वोत्तम)</p>
                        <p>• अभिजित् मुहूर्त: <strong>{p.abhijitMuhurat}</strong></p>
                        <p>• प्रदोष काल: सूर्यास्तको समय (महादेवको प्रिय समय)</p>
                        <p className="text-rose-300 text-[11px] pt-1 border-t border-amber-800/40">
                          ⚠️ राहु काल ({p.rahuKaal}) मा रुद्रीको मुख्य संकल्प नगर्नुहोला।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 3. BRATABANDHA */}
              {activeCeremony === 'bratabandha' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>📿</span>
                      <span>व्रतबन्ध तथा चूडाकर्म साईत स्थिति:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      {p.shubhaSait.bratabandhaSait}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ उपनयनका शास्त्रीय नियम:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li>बटुकको चन्द्रमा जन्म राशिबाट अनुकूल स्थान (१, ३, ६, ७, १०, ११) मा हुनुपर्ने।</li>
                        <li>बृहस्पति (गुरु) र शुक्र अस्त नभएको समय हुनुपर्ने।</li>
                        <li>उत्तरायण सूर्यमा बिहानी समय उपनयनका लागि सर्वश्रेष्ठ मानिन्छ।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ उत्तम समय तथा बेला:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• शुभ बेला: <strong>{p.shubhaSait.shubhaBela}</strong></p>
                        <p>• अमृत बेला: <strong>{p.shubhaSait.amritBela}</strong> (गायत्री मन्त्र दीक्षाका लागि)</p>
                        <p className="text-amber-400 text-[11px] pt-1 border-t border-amber-800/40">
                          📌 जनै धारण तथा बटुकको नामकरण मिलाएर गुरु-पुरोहितबाट साइत निर्धारण गरिन्छ।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 4. GRIHAPRAVESH */}
              {activeCeremony === 'grihapravesh' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>🏡</span>
                      <span>गृहप्रवेश तथा वास्तु पूजा साईत स्थिति:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      {p.shubhaSait.grihaPraveshSait}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ गृहप्रवेशका ३ प्रकार र शुद्धि:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li><strong>अपूर्व गृहप्रवेश:</strong> नयाँ बनाएको घरमा पहिलोपटक प्रवेश।</li>
                        <li><strong>सपूर्व गृहप्रवेश:</strong> यात्रा वा प्रवासपछि पुरानो घरमा पुनः प्रवेश।</li>
                        <li><strong>द्वन्द्व गृहप्रवेश:</strong> पुनर्निर्माण वा मर्मतपछिको प्रवेश।</li>
                        <li>स्थिर लग्न (वृष, सिंह, वृश्चिक, कुम्भ) गृहप्रवेशका लागि उत्तम।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ प्रवेश विधि तथा समय:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• अभिजित् मुहूर्त: <strong>{p.abhijitMuhurat}</strong></p>
                        <p>• शुभ बेला: <strong>{p.shubhaSait.shubhaBela}</strong></p>
                        <p className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
                          कलशमा जल, आँपका पात र नरिवल राखी पति-पत्नीले दाहिने खुट्टा अघि बढाएर प्रवेश गर्नुहोला।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 5. PASNI */}
              {activeCeremony === 'pasni' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>🍼</span>
                      <span>पास्नी (अन्नप्राशन) तथा नामकरण साईत स्थिति:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      {p.shubhaSait.pasniVyaparSait}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ अन्नप्राशनको महिना नियम:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li><strong>बालक (छोरा):</strong> ६ वा ८ महिना (जोडी/सम महिनामा)।</li>
                        <li><strong>बालिका (छोरी):</strong> ५ वा ७ महिना (बिजोर/विषम महिनामा)।</li>
                        <li>दशमी, एकादशी, पूर्णिमा वा शुभ तिथिमा चन्द्र बल मिलाएर अन्न चखाउनु पर्छ।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ शुभ बेला र विधि:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• अमृत बेला: <strong>{p.shubhaSait.amritBela}</strong> (खीर खुवाउन उत्तम)</p>
                        <p>• लाभ बेला: <strong>{p.shubhaSait.labhaBela}</strong></p>
                        <p className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
                          चाँदीको कचौरा र चम्चाले पञ्चामृत तथा खीर चखाएपछि पुस्तक, कलम, पैसा र माटो राखी शिशुको रुचि परीक्षण गरिन्छ।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 6. VYAPAR */}
              {activeCeremony === 'vyapar' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>🛍️</span>
                      <span>व्यापार, पसल तथा उद्योग उद्घाटन साईत स्थिति:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      पसल खोल्न, नयाँ व्यवसाय दर्ता, साझेदारी सम्झौता तथा बहीखाता (खाता) पूजाका लागि लाभ बेला ({p.shubhaSait.labhaBela}) अति उत्तम छ।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ व्यापार वृद्धिका ग्रह नियम:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li>बुधबार (व्यापार कारक बुध) तथा बिहीबार (लक्ष्मी-गुरु) अति शुभ दिन हुन्।</li>
                        <li>२, ५, ९, ११ औं भावमा शुभ ग्रहको गोचर अनुकूल हुनुपर्छ।</li>
                        <li>राहु कालमा व्यापारिक सम्झौता वा खाता नखोल्नुहोला।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ आजको व्यापार समय:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• लाभ बेला: <strong>{p.shubhaSait.labhaBela}</strong> (पसल खोल्नका लागि)</p>
                        <p>• अमृत बेला: <strong>{p.shubhaSait.amritBela}</strong></p>
                        <p className="text-rose-300 text-[11px] pt-1 border-t border-amber-800/40">
                          ⚠️ राहु काल: {p.rahuKaal} (यो समयमा पसलको शटर नउठाउनुहोला)।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 7. SAWARI */}
              {activeCeremony === 'sawari' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>🚗</span>
                      <span>सवारी (गाडी, मोटरसाइकल) खरिद तथा हस्तान्तरण:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      सवारी साधन खरिद गरी घर भित्र्याउनका लागि चर बेला वा शुभ बेला ({p.shubhaSait.shubhaBela}) मा शोरुमबाट गाडी निकाल्नु सुरक्षा र दुर्घटनामुक्त यात्राका लागि शुभ हुन्छ।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ वाहन खरिदका वैदिक नियम:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li>शुक्रबार, सोमबार तथा बिहीबार सवारी खरिदका लागि अनुकूल बार मानिन्छन्।</li>
                        <li>चर लग्न (मेष, कर्कट, तुला, मकर) मा वाहन खरिद गर्दा यात्रा सुरक्षित हुन्छ।</li>
                        <li>शनिबार फलाम खरिद नगर्ने मान्यता भए पनि तेल-कालो तिल दान गरी गर्न सकिन्छ।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ वाहन पूजा विधि:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• गाडीमा स्वस्तिक चिह्न बनाई पञ्चोपचार पूजा गर्नुहोला।</p>
                        <p>• ४ वटा चक्कामुनि कागती राखी अगाडि बढाउनुहोला।</p>
                        <p>• राहु काल ({p.rahuKaal}) मा गाडी घर नभित्र्याउनुहोला।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 8. YATRA */}
              {activeCeremony === 'yatra' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <span>✈️</span>
                      <span>यात्रा तथा वैदेशिक प्रस्थान साईत विचार:</span>
                    </span>
                    <p className="text-amber-100/90 leading-relaxed font-sans text-xs sm:text-sm">
                      आजको दिशा शूल: <strong className="text-amber-300 underline">{p.dishaShool}</strong> छ। विदेश यात्रा वा लामो दूरीको यात्रा सुरु गर्दा शुभ बेला वा अमृत बेलामा प्रस्थान गर्नु कल्याणकारी हुन्छ।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ दिशा शूल निवारण (अचुक उपाय):</span>
                      <p className="text-amber-200/90 leading-relaxed">
                        {p.dishaShoolRemedy}
                      </p>
                      <p className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
                        घरबाट निस्कँदा कुलदेवता र इष्टदेवको स्मरण गरी ३ पटक 'ॐ नमः शिवाय' जप गरेर प्रस्थान गर्नुहोला।
                      </p>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ शुभ प्रस्थान समय:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• अमृत बेला: <strong>{p.shubhaSait.amritBela}</strong></p>
                        <p>• लाभ बेला: <strong>{p.shubhaSait.labhaBela}</strong></p>
                        <p className="text-rose-300 text-[11px] pt-1 border-t border-amber-800/40">
                          ⚠️ यमकण्ड समय ({p.yamaganda}) तथा राहु कालमा यात्रा सुरु नगर्नुहोला।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CEREMONY VIEW: 9. HAWAN */}
              {activeCeremony === 'hawan' && (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div
                    className={`p-4 rounded-xl border-2 space-y-2 ${
                      ceremonyCalc.agniIsGood
                        ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-100'
                        : 'bg-amber-950/60 border-amber-600/70 text-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold font-serif text-sm flex items-center gap-2">
                        <span>🌿</span>
                        <span>अग्नि वास विचार (हवन, महायज्ञ तथा कुलपूजा):</span>
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          ceremonyCalc.agniIsGood
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {ceremonyCalc.agniIsGood ? 'शुभ अग्नि वास (पृथ्वी)' : 'अग्नि वास विचार'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-amber-200">
                      आजको अग्नि वास: <span className="text-amber-400 underline">{ceremonyCalc.agniVasaName}</span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans opacity-95">
                      अग्नि वास पृथ्वीमा भएको दिन हवन गर्दा सर्वसिद्धि र मनोरथ पूर्ण हुन्छ। आकाश वा पातालमा अग्नि वास हुँदा नित्य हवन मात्र गर्न सकिन्छ, ठूलो काम्य हवन गर्दा शान्ति पाठ अनिवार्य गरिन्छ।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ हवनको शास्त्रीय नियम:</span>
                      <ul className="space-y-1 text-amber-200/90 list-disc list-inside">
                        <li>गायत्री हवन, नवग्रह हवन तथा कुलदेवता प्रतिष्ठाका लागि पञ्चाङ्ग शुद्धि आवश्यक हुन्छ।</li>
                        <li>गाईको शुद्ध घिउ, तिल, जौ, बेलपत्र र गुगलको समिधा प्रयोग गर्नुपर्छ।</li>
                        <li>हवन कुण्डमा पूर्वाभिमुख वा उत्तराभिमुख भई बस्नुपर्छ।</li>
                      </ul>
                    </div>

                    <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1.5">
                      <span className="font-bold text-amber-300 block font-serif">✦ आजको हवन समय:</span>
                      <div className="space-y-1 text-amber-200/90">
                        <p>• शुभ बेला: <strong>{p.shubhaSait.shubhaBela}</strong></p>
                        <p>• अभिजित् मुहूर्त: <strong>{p.abhijitMuhurat}</strong></p>
                        <p className="text-rose-300 text-[11px] pt-1 border-t border-amber-800/40">
                          ⚠️ राहु काल: {p.rahuKaal} (हवनको पूर्णाहूति राहु कालमा नगर्नुहोला)।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ceremony Bottom - Clean Return to Grid */}
              <div className="flex items-center justify-center pt-4 border-t border-amber-800/60">
                <button
                  onClick={() => setActiveCeremony(null)}
                  className="px-5 py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-600/70 flex items-center justify-center gap-2 font-bold font-serif transition-all active:scale-95 cursor-pointer shadow text-xs sm:text-sm"
                >
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>← सबै संस्कार ग्रिडमा फर्कनुहोस्</span>
                </button>
              </div>

              {/* Pandit Consultation Notice inside opened ceremony */}
              <div className="bg-gradient-to-r from-amber-950 to-stone-950 p-4 rounded-xl border border-amber-700/60 text-xs text-amber-300/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🕉️</span>
                  <span>
                    व्यक्तिगत वर-वधु कुण्डली, गोत्र र कुल परम्परा अनुसार सटिक साइत जुराउन पण्डित शम्भु प्रसाद लम्सालसँग परामर्श लिन सक्नुहुन्छ।
                  </span>
                </div>
                <a
                  href="https://wa.me/9779863991384"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 shadow flex items-center gap-1.5"
                >
                  <span>सम्पर्क: ९८६३९९१३८४</span>
                </a>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* -------------------------------------------------------------- */}
      {/* SUB-MENU 4: राशिफल (Rashifal) */}
      {/* -------------------------------------------------------------- */}
      {/* -------------------------------------------------------------- */}
      {/* SUB-MENU 4: राशिफल (Rashifal) */}
      {/* -------------------------------------------------------------- */}
      {activeSubMenu === 'rashifal' && (() => {
        const selectedRashiItem = selectedRashi
          ? currentDataset.find((r) => r.rashi === selectedRashi) || null
          : null;

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* ========================================================== */}
            {/* CASE 1: selectedRashi === null -> ONLY 12 RASHI GRID MODE  */}
            {/* "Grid mode मा मात्र र केवल 12 वटा राशी लिष्ट मात्र देखियोस्" */}
            {/* ========================================================== */}
            {selectedRashi === null && (
              <div className="space-y-5 animate-fadeIn">
                {/* Header & Live Period Filter */}
                <div className="bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 p-4 sm:p-5 rounded-2xl border border-amber-700/60 shadow-lg text-center space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>
                      {lang === 'ne'
                        ? `१२ राशी ग्रिड सूची — ${bsInfo.formatted}`
                        : `12 Zodiac Signs Grid — ${selectedDate.toDateString()}`}
                    </span>
                  </h2>

                  {/* Period Tab Buttons */}
                  <div className="flex flex-wrap items-center justify-center bg-amber-950/80 p-1.5 rounded-xl border border-amber-700/60 gap-1.5 max-w-lg mx-auto">
                    <button
                      onClick={() => setActiveRashifalTab('daily')}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeRashifalTab === 'daily'
                          ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                          : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                      }`}
                    >
                      <span>📅</span>
                      <span>{lang === 'ne' ? 'दैनिक (Daily)' : 'Daily'}</span>
                    </button>
                    <button
                      onClick={() => setActiveRashifalTab('weekly')}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeRashifalTab === 'weekly'
                          ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                          : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                      }`}
                    >
                      <span>🗓️</span>
                      <span>{lang === 'ne' ? 'साप्ताहिक (Weekly)' : 'Weekly'}</span>
                    </button>
                    <button
                      onClick={() => setActiveRashifalTab('monthly')}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeRashifalTab === 'monthly'
                          ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                          : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                      }`}
                    >
                      <span>🌙</span>
                      <span>{lang === 'ne' ? 'मासिक (Monthly)' : 'Monthly'}</span>
                    </button>
                    <button
                      onClick={() => setActiveRashifalTab('yearly')}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeRashifalTab === 'yearly'
                          ? 'bg-amber-600 text-amber-50 shadow-md ring-1 ring-amber-400'
                          : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                      }`}
                    >
                      <span>🔮</span>
                      <span>{lang === 'ne' ? 'वार्षिक (२०८३)' : 'Yearly (2083)'}</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="max-w-md mx-auto relative pt-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={lang === 'ne' ? 'राशी खोज्नुहोस् (उदा: मेष, Singh, Virgo...)' : 'Search your Rashi (e.g., Aries, Leo...)'}
                      className="w-full bg-amber-950/60 border border-amber-700/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-500 pl-10"
                    />
                    <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* 12-Rashi Responsive Grid */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-amber-300 font-serif uppercase tracking-wide">
                        {lang === 'ne' ? 'केवल १२ राशी सूची (मेष देखि मीन सम्म):' : '12 Zodiac Signs List (Aries to Pisces):'}
                      </h3>
                    </div>
                    <span className="text-[11px] text-amber-300/80">
                      {lang === 'ne' ? '👈 आफ्नो राशीमा ट्याप (Tap) गर्नुहोस्' : 'Tap on your Rashi to view exclusively'}
                    </span>
                  </div>

                  {/* Exactly 12 Cards in Responsive Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                    {filteredRashifal.map((item) => {
                      const letters = RASHI_LETTERS[item.rashi] || '';
                      const lord = RASHI_LORDS[item.rashi] || '';

                      return (
                        <button
                          key={item.rashi}
                          onClick={() => setSelectedRashi(item.rashi)}
                          className="group relative text-left p-3.5 rounded-2xl transition-all duration-200 border flex flex-col justify-between overflow-hidden cursor-pointer bg-gradient-to-b from-amber-950/85 via-stone-950 to-amber-950/85 border-amber-800/70 hover:border-amber-400 hover:bg-amber-900/40 shadow-lg active:scale-98 hover:-translate-y-0.5"
                        >
                          {/* Top Bar with Symbol & Badge */}
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-2xl bg-amber-900/70 w-10 h-10 rounded-xl flex items-center justify-center border border-amber-700/60 shadow group-hover:scale-110 transition-transform text-amber-300">
                              {item.symbol}
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-950/80 text-amber-300/90 border-amber-800/60 group-hover:border-amber-500 group-hover:text-amber-200">
                              {lang === 'ne' ? 'ट्याप गर्नुहोस्' : 'Tap'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-serif font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                              {item.rashi}
                            </h4>
                            <span className="text-xs text-amber-400/90 font-medium block">
                              {item.englishName}
                            </span>
                            {lord && (
                              <p className="text-[10px] text-amber-300/70 mt-1 line-clamp-1">
                                स्वामी: <span className="text-amber-200 font-semibold">{lord.split(' ')[0]}</span>
                              </p>
                            )}
                            {letters && (
                              <p className="text-[9px] text-amber-400/60 line-clamp-1 mt-0.5" title={`नामाक्षर: ${letters}`}>
                                {letters}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-amber-800/50 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-amber-400 group-hover:text-amber-200 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                              <span>{lang === 'ne' ? 'राशीफल हेर्नुहोस्' : 'View Rashifal'}</span>
                              <ArrowRight className="w-3 h-3 inline" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================== */}
            {/* CASE 2: selectedRashi !== null -> ONLY THE SELECTED RASHIFAL */}
            {/* "कुनै राशीलाई क्लिक गर्दा त्यो राशीफल मात्र देखिनु पर्छ अरू केही चिजहरूले छेलिन हुँदैन" */}
            {/* ========================================================== */}
            {selectedRashiItem && (
              <div className="space-y-4 animate-fadeIn">
                {/* Dedicated Top Action Bar: Back to 12 Rashis Grid + Period Switcher + Fast Switcher */}
                <div className="bg-gradient-to-r from-amber-950 via-stone-950 to-amber-950 p-3 sm:p-4 rounded-2xl border-2 border-amber-500/60 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Primary Back Button to return to 12 Rashi Grid */}
                    <button
                      onClick={() => setSelectedRashi(null)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-600 text-amber-50 border border-amber-400/80 text-xs sm:text-sm font-bold font-serif flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg ring-1 ring-amber-400/50"
                    >
                      <LayoutGrid className="w-4 h-4 text-amber-200" />
                      <span>← {lang === 'ne' ? 'सबै १२ राशी ग्रिडमा फर्कनुहोस्' : 'Back to 12 Rashis Grid'}</span>
                    </button>

                    {/* Period Tabs right inside the view so user can switch daily/weekly/monthly/yearly seamlessly */}
                    <div className="flex items-center justify-center bg-amber-950/90 p-1 rounded-xl border border-amber-700/60 gap-1 overflow-x-auto">
                      <button
                        onClick={() => setActiveRashifalTab('daily')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          activeRashifalTab === 'daily'
                            ? 'bg-amber-600 text-amber-50 shadow ring-1 ring-amber-400'
                            : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                        }`}
                      >
                        📅 {lang === 'ne' ? 'दैनिक' : 'Daily'}
                      </button>
                      <button
                        onClick={() => setActiveRashifalTab('weekly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          activeRashifalTab === 'weekly'
                            ? 'bg-amber-600 text-amber-50 shadow ring-1 ring-amber-400'
                            : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                        }`}
                      >
                        🗓️ {lang === 'ne' ? 'साप्ताहिक' : 'Weekly'}
                      </button>
                      <button
                        onClick={() => setActiveRashifalTab('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          activeRashifalTab === 'monthly'
                            ? 'bg-amber-600 text-amber-50 shadow ring-1 ring-amber-400'
                            : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                        }`}
                      >
                        🌙 {lang === 'ne' ? 'मासिक' : 'Monthly'}
                      </button>
                      <button
                        onClick={() => setActiveRashifalTab('yearly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          activeRashifalTab === 'yearly'
                            ? 'bg-amber-600 text-amber-50 shadow ring-1 ring-amber-400'
                            : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/50'
                        }`}
                      >
                        🔮 {lang === 'ne' ? 'वार्षिक (२०८३)' : 'Yearly'}
                      </button>
                    </div>
                  </div>

                  {/* Fast 12-Rashi Quick Switcher Strip */}
                  <div className="bg-amber-950/80 p-2 rounded-xl border border-amber-800/80 flex items-center gap-1.5 overflow-x-auto text-xs shadow-inner">
                    <span className="text-amber-400 font-serif font-bold shrink-0 px-1 text-[11px]">
                      {lang === 'ne' ? 'छिटो स्विच:' : 'Switch:'}
                    </span>
                    {currentDataset.map((r) => {
                      const isCur = selectedRashi === r.rashi;
                      return (
                        <button
                          key={r.rashi}
                          onClick={() => setSelectedRashi(r.rashi)}
                          className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 text-xs font-bold cursor-pointer transition-all ${
                            isCur
                              ? 'bg-amber-500 text-stone-950 font-extrabold shadow ring-1 ring-amber-300 scale-105'
                              : 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/60 border border-amber-800/40'
                          }`}
                        >
                          <span>{r.symbol}</span>
                          <span>{r.rashi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* THE COMPLETE, UNOBSTRUCTED RASHIFAL CARD */}
                <div className="bg-gradient-to-b from-amber-950/95 via-stone-950 to-amber-950/95 p-5 sm:p-7 rounded-2xl border-2 border-amber-500/80 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header with Zodiac Symbol, Titles & Rating */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-800/60 pb-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl sm:text-4xl bg-amber-900/80 w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-amber-500/70 shadow-lg shrink-0 text-amber-300">
                        {selectedRashiItem.symbol}
                      </span>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-0.5">
                          <span>{selectedRashiItem.englishName}</span>
                          <span>•</span>
                          <span className="bg-amber-900/80 px-2 py-0.5 rounded text-[10px] text-amber-300 border border-amber-700/60 font-serif">
                            {activeRashifalTab === 'daily'
                              ? (lang === 'ne' ? 'दैनिक राशिफल' : 'Daily Horoscope')
                              : activeRashifalTab === 'weekly'
                              ? (lang === 'ne' ? 'साप्ताहिक राशिफल' : 'Weekly Horoscope')
                              : activeRashifalTab === 'monthly'
                              ? (lang === 'ne' ? 'मासिक राशिफल' : 'Monthly Horoscope')
                              : (lang === 'ne' ? 'वार्षिक राशिफल' : 'Yearly Horoscope')}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 flex items-center gap-2">
                          <span>{selectedRashiItem.rashi} राशीफल</span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 bg-amber-900/60 px-2.5 py-1.5 rounded-xl border border-amber-700/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < selectedRashiItem.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-800/60'}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedRashi(null)}
                        className="px-3 py-1.5 rounded-xl bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-600/70 text-xs font-bold font-serif flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                        <span>१२ राशी ग्रिड</span>
                      </button>
                    </div>
                  </div>

                  {/* Astrological Metadata Pill (Lord, Syllables, Date) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-amber-900/40 p-3 rounded-xl border border-amber-800/50">
                    <div>
                      <span className="text-amber-400 font-semibold block text-[11px]">राशि स्वामी:</span>
                      <strong className="text-amber-100">{RASHI_LORDS[selectedRashiItem.rashi] || 'शुभ ग्रह'}</strong>
                    </div>
                    <div>
                      <span className="text-amber-400 font-semibold block text-[11px]">नामाक्षर (अक्षरहरू):</span>
                      <span className="text-amber-200/90">{RASHI_LETTERS[selectedRashiItem.rashi] || '—'}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-semibold block text-[11px]">मिति/अवधि:</span>
                      <span className="text-amber-200/90">{selectedRashiItem.periodLabel || bsInfo.formatted}</span>
                    </div>
                  </div>

                  {/* Main Detailed Prediction Paragraph */}
                  <div className="bg-amber-900/30 p-4 sm:p-5 rounded-xl border border-amber-700/60 space-y-2">
                    <span className="font-bold text-amber-300 text-sm flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{selectedRashiItem.rashi} राशीको मुख्य फलादेश:</span>
                    </span>
                    <p className="text-amber-100/95 leading-relaxed font-sans text-sm sm:text-base">
                      {selectedRashiItem.prediction}
                    </p>
                  </div>

                  {/* 4 Aspects Grid (Career, Love, Health, Finance) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {selectedRashiItem.career && (
                      <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1">
                        <div className="flex items-center gap-2 text-amber-300 font-serif font-bold">
                          <Briefcase className="w-4 h-4 text-amber-400" />
                          <span>{lang === 'ne' ? '💼 करियर तथा पेशा:' : 'Career & Profession:'}</span>
                        </div>
                        <p className="text-amber-200/90 leading-relaxed font-sans text-xs sm:text-sm">
                          {selectedRashiItem.career}
                        </p>
                      </div>
                    )}

                    {selectedRashiItem.love && (
                      <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1">
                        <div className="flex items-center gap-2 text-rose-300 font-serif font-bold">
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>{lang === 'ne' ? '❤️ प्रेम तथा दाम्पत्य सम्बन्ध:' : 'Love & Relationship:'}</span>
                        </div>
                        <p className="text-amber-200/90 leading-relaxed font-sans text-xs sm:text-sm">
                          {selectedRashiItem.love}
                        </p>
                      </div>
                    )}

                    {selectedRashiItem.health && (
                      <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-300 font-serif font-bold">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span>{lang === 'ne' ? '🌿 स्वास्थ्य स्थिति:' : 'Health & Vitality:'}</span>
                        </div>
                        <p className="text-amber-200/90 leading-relaxed font-sans text-xs sm:text-sm">
                          {selectedRashiItem.health}
                        </p>
                      </div>
                    )}

                    {selectedRashiItem.finance && (
                      <div className="bg-stone-900/80 p-3.5 rounded-xl border border-amber-800/50 space-y-1">
                        <div className="flex items-center gap-2 text-yellow-300 font-serif font-bold">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          <span>{lang === 'ne' ? '💰 आर्थिक तथा धन स्थिति:' : 'Finance & Wealth:'}</span>
                        </div>
                        <p className="text-amber-200/90 leading-relaxed font-sans text-xs sm:text-sm">
                          {selectedRashiItem.finance}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Astrological Remedy */}
                  {selectedRashiItem.remedy && (
                    <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/60 text-xs sm:text-sm text-amber-200/95 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-300 block font-serif">
                          {lang === 'ne' ? '💡 आजको ग्रह शान्ति तथा वैदिक उपाय:' : 'Astrological Remedy:'}
                        </span>
                        <p className="leading-relaxed font-sans">{selectedRashiItem.remedy}</p>
                      </div>
                    </div>
                  )}

                  {/* Lucky Attributes Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-amber-900/30 p-3 rounded-xl border border-amber-800/40 text-center">
                    <div>
                      <span className="text-amber-400 block font-semibold text-[11px]">{lang === 'ne' ? 'शुभ अंक:' : 'Lucky No:'}</span>
                      <span className="font-bold text-amber-100 text-sm font-mono">{selectedRashiItem.luckyNumber}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block font-semibold text-[11px]">{lang === 'ne' ? 'शुभ रङ:' : 'Lucky Color:'}</span>
                      <span className="font-bold text-amber-100 text-sm">{selectedRashiItem.luckyColor}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block font-semibold text-[11px]">शुभ दिशा:</span>
                      <span className="font-bold text-amber-100 text-sm">{p.dishaShool ? 'पूर्व/उत्तर' : 'शुभ'}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block font-semibold text-[11px]">तारा / चन्द्र बल:</span>
                      <span className="font-bold text-emerald-400 text-sm">अनुकूल</span>
                    </div>
                  </div>

                  {/* AI Live Consultation Button */}
                  <button
                    onClick={() => handleFetchAiRashifal(selectedRashiItem)}
                    className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    <Bot className="w-4 h-4 text-stone-950" />
                    <span>
                      {lang === 'ne'
                        ? `🤖 ${selectedRashiItem.rashi} राशीको एआई प्रत्यक्ष विस्तृत विश्लेषण लिनुहोस्`
                        : `🤖 Get Live AI Analysis for ${selectedRashiItem.englishName}`}
                    </span>
                  </button>

                  {/* Clean Return to 12 Rashi Grid */}
                  <div className="flex items-center justify-center pt-4 border-t border-amber-800/60">
                    <button
                      onClick={() => setSelectedRashi(null)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-100 border border-amber-500/80 flex items-center justify-center gap-2 font-bold font-serif transition-all active:scale-95 cursor-pointer shadow-lg text-xs sm:text-sm"
                    >
                      <LayoutGrid className="w-4 h-4 text-amber-300" />
                      <span>← सबै १२ राशी ग्रिडमा फर्कनुहोस्</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* 7. AI LIVE RASHIFAL MODAL */}
      {/* ============================================================== */}
      {aiModalRashi && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-amber-950 border border-amber-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative text-amber-100">
            <button
              onClick={() => setAiModalRashi(null)}
              className="absolute top-4 right-4 text-amber-400 hover:text-amber-100 bg-amber-900/60 p-1.5 rounded-full border border-amber-700/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-800/80 pb-4">
              <span className="text-3xl text-amber-400 bg-amber-900/80 w-12 h-12 rounded-full flex items-center justify-center border border-amber-700">
                {aiModalRashi.symbol}
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-amber-200 flex items-center gap-2">
                  <span>
                    {lang === 'ne' ? aiModalRashi.rashi : aiModalRashi.englishName} ({lang === 'ne' ? aiModalRashi.englishName : aiModalRashi.rashi})
                  </span>
                  <span className="text-xs bg-amber-800/60 text-amber-300 px-2.5 py-0.5 rounded-full font-sans font-normal">
                    {activeRashifalTab === 'daily'
                      ? (lang === 'ne' ? 'दैनिक' : 'Daily')
                      : activeRashifalTab === 'weekly'
                      ? (lang === 'ne' ? 'साप्ताहिक' : 'Weekly')
                      : (lang === 'ne' ? 'वार्षिक' : 'Yearly')}
                  </span>
                </h3>
                <p className="text-xs text-amber-400">
                  {lang === 'ne'
                    ? 'एआई प्रत्यक्ष ज्योतिषीय विश्लेषण'
                    : 'AI Astrological Reading'}
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
                className="bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold text-xs px-6 py-2 rounded-xl cursor-pointer"
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
