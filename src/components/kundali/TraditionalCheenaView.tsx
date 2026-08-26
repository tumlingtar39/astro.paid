import React, { useState } from 'react';
import { KundaliResult, KundaliInput, Language } from '../../types';
import { PANDIT_INFO } from '../../data/astrologyData';
import { Printer, Copy, Check, FileText, Sparkles, Download, Edit3, Layers, Filter, Clock, Calendar, Table, Crown, Star, Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { KundaliChartNorth } from './KundaliChartNorth';
import { RASHI_NAMES, calculateVimshottariDasha, calculateTribhagiDasha, calculateYoginiDasha, detectYogas, convertYearsToVedicYM, formatVedicYM } from '../../utils/kundaliEngine';
import { convertADToBS } from '../../utils/nepaliCalendar';

// Helper: Convert digits 0-9 to Devanagari ०-९
const toNepaliDigits = (numStr: string | number): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(numStr).replace(/\d/g, (x) => nepaliDigits[parseInt(x, 10)]);
};

// Safe date parsing in local/UTC
const parseDateUTC = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return new Date(dateInput);
  }
  return new Date();
};

// Helper: Format AD date into Nepali Bikram Sambat date string (e.g. २०५३-११-२८)
const formatADDateToBS = (adDateInput: string | Date): string => {
  if (!adDateInput) return '—';
  const dateObj = parseDateUTC(adDateInput);
  if (isNaN(dateObj.getTime())) return String(adDateInput);

  const adY = dateObj.getFullYear();
  const adM = dateObj.getMonth() + 1;
  const adD = dateObj.getDate();

  const bs = convertADToBS(adY, adM, adD);
  const yStr = toNepaliDigits(bs.year);
  const mStr = toNepaliDigits(String(bs.month).padStart(2, '0'));
  const dStr = toNepaliDigits(String(bs.day).padStart(2, '0'));

  return `${yStr}-${mStr}-${dStr}`;
};

// Helper: Calculate age in years
const calculateAgeYears = (birthDateInput: string | Date, targetDateInput: string | Date): number => {
  const bDate = parseDateUTC(birthDateInput);
  const tDate = parseDateUTC(targetDateInput);
  if (isNaN(bDate.getTime()) || isNaN(tDate.getTime())) return 0;
  const diffMs = tDate.getTime() - bDate.getTime();
  if (diffMs <= 0) return 0;
  return diffMs / (365.2425 * 24 * 3600 * 1000);
};

// Helper: Check if period is currently active based on today's date
const checkIsActive = (startDateStr: string, endDateStr: string): boolean => {
  const now = new Date();
  const start = parseDateUTC(startDateStr);
  const end = parseDateUTC(endDateStr);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
};

// Helper: Distinct color for planets / yoginis
const getPlanetTextColor = (planetOrYoginiName: string): string => {
  const name = planetOrYoginiName.trim();
  if (name.includes('सूर्य') || name.includes('पिङ्गला')) return 'text-red-700 font-bold';
  if (name.includes('चन्द्र') || name.includes('मङ्गला')) return 'text-blue-700 font-bold';
  if (name.includes('मंगल') || name.includes('भ्रामरी')) return 'text-rose-800 font-bold';
  if (name.includes('बुध') || name.includes('भद्रिका')) return 'text-emerald-700 font-bold';
  if (name.includes('गुरु') || name.includes('धान्या')) return 'text-amber-800 font-bold';
  if (name.includes('शुक्र') || name.includes('सिद्धा')) return 'text-pink-700 font-bold';
  if (name.includes('शनि') || name.includes('उल्का')) return 'text-slate-800 font-bold';
  if (name.includes('राहु') || name.includes('सङ्कटा')) return 'text-purple-800 font-bold';
  if (name.includes('केतु')) return 'text-orange-800 font-bold';
  return 'text-amber-950 font-bold';
};

interface SingleDashaTableProps {
  title: string;
  subtitle: string;
  column1Header: string;
  systemType: 'vimshottari' | 'tribhagi' | 'yogini';
  data: Array<any>;
  birthDate: string;
}

const SingleDashaTable: React.FC<SingleDashaTableProps> = ({
  title,
  subtitle,
  column1Header,
  systemType,
  data,
  birthDate
}) => {
  return (
    <div className="space-y-3 bg-amber-50/80 p-4 sm:p-5 rounded-2xl border-2 border-amber-400 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
        <div>
          <h4 className="font-serif font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
            <span>{title}</span>
          </h4>
          <p className="text-[11px] sm:text-xs text-amber-800 font-sans mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200 border border-amber-400 text-amber-950 shrink-0">
          {systemType === 'vimshottari'
            ? '१२० वर्ष (वर्ष मात्र)'
            : systemType === 'yogini'
            ? '७२ वर्ष (वर्ष मात्र)'
            : '८० वर्ष ० महिना (वर्ष र महिना)'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border border-amber-800 text-xs sm:text-sm font-serif">
          <thead>
            <tr className="bg-amber-200/90 font-bold text-amber-950 border-b border-amber-800">
              <th className="p-2 border border-amber-800 text-left sm:text-center w-1/4 font-bold">
                {column1Header}
              </th>
              <th className="p-2 border border-amber-800 w-1/4 font-bold">सुरु मिति</th>
              <th className="p-2 border border-amber-800 w-1/4 font-bold">अन्त्य मिति</th>
              <th className="p-2 border border-amber-800 w-1/4 font-bold">
                {systemType === 'tribhagi' ? 'उमेर / अवधि (वर्ष र महिना)' : 'उमेर / अवधि (वर्ष मात्र)'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-800/40 bg-white">
            {(() => {
              let cumulativeMonths = 0;
              let cumulativeYearsFloat = 0;

              return data.map((item, idx) => {
                const rawName = item.nameNe || item.planetNe || '—';
                const isActive = checkIsActive(item.startDate, item.endDate);
                const displayName = isActive ? `${rawName} ->` : rawName;
                const textColorClass = getPlanetTextColor(rawName);

                const startBS = formatADDateToBS(item.startDate);
                const endBS = formatADDateToBS(item.endDate);

                let durationAge = '';

                if (systemType === 'tribhagi') {
                  // त्रिभागी दशा: ८० वर्ष ० महिना चक्र (वर्ष र महिना)
                  const durMonths = Math.round((item.durationYears || 0) * 12);
                  const startM = cumulativeMonths;
                  let endM = startM + durMonths;

                  // अन्तिम पंक्ति वा ८० वर्ष (९६० महिना) पुग्दा ठीक ८० वर्ष ० महिनामा अन्त्य
                  if (idx === data.length - 1 || Math.abs(endM - 960) <= 2) {
                    endM = 960;
                  }
                  cumulativeMonths = endM;

                  const durYM = { years: Math.floor(durMonths / 12), months: durMonths % 12 };
                  const startYM = { years: Math.floor(startM / 12), months: startM % 12 };
                  const endYM = { years: Math.floor(endM / 12), months: endM % 12 };

                  const durText = formatVedicYM(durYM, 'ne');
                  const startText = formatVedicYM(startYM, 'ne');
                  const endText = formatVedicYM(endYM, 'ne');

                  durationAge = `${durText} (${startText} देखि ${endText})`;
                } else if (systemType === 'vimshottari') {
                  // विंशोत्तरी दशा: १२० वर्ष चक्र (वर्ष मात्र)
                  const durY = Math.round(item.durationYears || 0);
                  const startY = Math.round(cumulativeYearsFloat);
                  let endY = startY + durY;
                  if (idx === data.length - 1 || Math.abs(endY - 120) <= 1) {
                    endY = 120;
                  }
                  cumulativeYearsFloat = endY;

                  durationAge = `${toNepaliDigits(durY)} वर्ष (${toNepaliDigits(startY)} देखि ${toNepaliDigits(endY)} वर्ष)`;
                } else {
                  // योगिनी दशा: ७२ वर्ष चक्र (वर्ष मात्र)
                  const durY = Math.round(item.durationYears || 0);
                  const startY = Math.round(cumulativeYearsFloat);
                  let endY = startY + durY;
                  if (idx === data.length - 1 || Math.abs(endY - 72) <= 1) {
                    endY = 72;
                  }
                  cumulativeYearsFloat = endY;

                  durationAge = `${toNepaliDigits(durY)} वर्ष (${toNepaliDigits(startY)} देखि ${toNepaliDigits(endY)} वर्ष)`;
                }

                return (
                  <tr
                    key={item.id || `${rawName}-${idx}`}
                    className={
                      isActive
                        ? 'bg-amber-100/95 font-bold text-amber-950 border-l-4 border-l-amber-600 ring-1 ring-amber-400 shadow-xs'
                        : 'border-b border-amber-800/30 hover:bg-amber-50/80 transition-colors bg-white'
                    }
                  >
                    <td className="p-2 border border-amber-800 text-left sm:text-center font-bold">
                      <div className="flex items-center justify-start sm:justify-center gap-1.5">
                        <span className={`${textColorClass} ${isActive ? 'text-amber-950 font-black tracking-wide' : ''}`}>
                          {rawName}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-200/90 border border-amber-400 text-amber-950 text-[10px] font-extrabold shadow-2xs">
                            ⚡ हालको
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 border border-amber-800 font-semibold text-amber-950 font-mono text-xs sm:text-sm">
                      {startBS}
                    </td>
                    <td className="p-2 border border-amber-800 font-semibold text-amber-950 font-mono text-xs sm:text-sm">
                      {endBS}
                    </td>
                    <td className="p-2 border border-amber-800 font-semibold text-amber-900">
                      {durationAge}
                      {item.isBalancePeriod && (
                        <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-950 px-1 py-0.5 rounded font-bold">
                          जन्म भोग्य
                        </span>
                      )}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TraditionalCheenaViewProps {
  result: KundaliResult;
  input: KundaliInput;
  lang: Language;
}

export const TraditionalCheenaView: React.FC<TraditionalCheenaViewProps> = ({
  result,
  input,
  lang
}) => {
  const [copied, setCopied] = useState(false);
  const [showEditCustomFields, setShowEditCustomFields] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'primary'>('all');
  const [dashaTab, setDashaTab] = useState<'all' | 'vimshottari' | 'tribhagi' | 'yogini'>('all');
  const [yogaFilterTab, setYogaFilterTab] = useState<'all' | 'present' | 'raj' | 'dhana'>('all');

  // Additional classical traditional fields with smart defaults
  const [gotra, setGotra] = useState('कश्यप (Kashyap)');
  const [fatherName, setFatherName] = useState('हरिप्रसाद शर्मा (Hari Prasad Sharma)');
  const [motherName, setMotherName] = useState('गंगादेवी शर्मा (Ganga Devi Sharma)');
  const [authorName, setAuthorName] = useState('ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay)');
  const [authorLocation, setAuthorLocation] = useState('काठमाडौँ, नेपाल (Kathmandu, Nepal)');
  const [authorPhone, setAuthorPhone] = useState('9863991384 / 9805674119');

  const p = result.panchanga;
  const av = result.avakhada;
  const planets = result.planetPositions || result.planets || [];

  // Helper function to extract degree, minute, second
  const getDegreeParts = (deg: number) => {
    const totalSec = Math.round(deg * 3600);
    const rashiIdx = Math.floor(totalSec / (30 * 3600));
    const remSec = totalSec % (30 * 3600);
    const degrees = Math.floor(remSec / 3600);
    const minRem = remSec % 3600;
    const minutes = Math.floor(minRem / 60);
    const seconds = minRem % 60;
    return {
      rashi: rashiIdx + 1,
      deg: degrees,
      min: minutes,
      sec: seconds
    };
  };

  const planetOrderKeys = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'lagna'];

  const getPlanetInfo = (key: string) => {
    const pl = planets.find((item) => item.id === key);
    if (!pl) return { rashi: 1, deg: 0, min: 0, sec: 0, bMa: '—', uA: '—', uJa: '—' };
    const parts = getDegreeParts(pl.degree);
    const isLagna = pl.id === 'lagna';
    const isSun = pl.id === 'sun';
    const isRahuKetu = pl.id === 'rahu' || pl.id === 'ketu';

    let bMa = pl.isRetrograde ? 'ब' : 'मा'; // बक्री / मार्गी
    if (isLagna) bMa = '—';

    let uA = pl.isCombust ? 'अ' : 'उ'; // अस्त / उदय
    if (isLagna) uA = '—';
    if (isSun || isRahuKetu) uA = 'उ';

    return {
      rashi: parts.rashi,
      deg: parts.deg,
      min: parts.min,
      sec: parts.sec,
      bMa,
      uA,
      uJa: pl.dignity || 'सम'
    };
  };

  // Build the 17 Kundali charts in strict sequence required by the user:
  // 1. Lagna Kundali (D1)
  // 2. Rashi / Chandra Kundali (Moon Chart)
  // 3. Navamsha Kundali (D9)
  // 4 to 17. Remaining divisional charts sequentially (D2, D3, D4, D7, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60)

  const lagnaPlanet = planets.find((p) => p.id === 'lagna');
  const lagnaSignIdx = lagnaPlanet ? lagnaPlanet.rashiIndex : 0;

  const d1Chart = result.divisionalCharts?.find((c) => c.code === 'D1');
  const d1Houses = d1Chart
    ? d1Chart.houses.map((h) => ({
        house: h.houseNum,
        signIndex: h.signIndex,
        sign: h.signNe,
        planets: h.planets
      }))
    : [];

  const moonPlanet = planets.find((p) => p.id === 'moon');
  const moonSignIdx = moonPlanet ? moonPlanet.rashiIndex : 0;

  const chandraKundaliHouses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const houseSignIdx = (moonSignIdx + i) % 12;
    const houseSignNe = RASHI_NAMES[houseSignIdx]?.ne || 'मेष';

    const occupants = planets
      .filter((p) => p.id !== 'lagna' && p.rashiIndex === houseSignIdx)
      .map((p) => p.nameNe + (p.isRetrograde ? '(R)' : ''));

    if (lagnaSignIdx === houseSignIdx) {
      occupants.unshift('ल');
    }

    return {
      house: houseNum,
      signIndex: houseSignIdx,
      sign: houseSignNe,
      planets: occupants
    };
  });

  const d9Chart = result.divisionalCharts?.find((c) => c.code === 'D9');
  const d9Houses = d9Chart
    ? d9Chart.houses.map((h) => ({
        house: h.houseNum,
        signIndex: h.signIndex,
        sign: h.signNe,
        planets: h.planets
      }))
    : [];

  const yogaList = (result.yogas && result.yogas.length > 0)
    ? result.yogas
    : detectYogas(planets, result.houseDetails || []);

  const filteredYogas = yogaList.filter((y) => {
    if (yogaFilterTab === 'present') return y.isPresent;
    if (yogaFilterTab === 'raj') return y.type === 'raj' || y.type === 'mahapurusha' || y.type === 'vipareeta' || y.type === 'neechabhanga';
    if (yogaFilterTab === 'dhana') return y.type === 'dhana' || y.type === 'benefic';
    return true;
  });

  const remainingCodes = ['D2', 'D3', 'D4', 'D7', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

  const allKundalis = [
    {
      code: 'D1',
      titleNe: '१. मुख्य जन्म लग्न कुण्डली (D1)',
      subtitleNe: 'शारीरिक बनावट, समग्र व्यक्तित्व तथा आधारभूत जन्म लग्न',
      houses: d1Houses,
      lagnaSignIndex: d1Chart?.houses[0]?.signIndex ?? lagnaSignIdx
    },
    {
      code: 'CHANDRA',
      titleNe: '२. राशि कुण्डली (Chandra Kundali)',
      subtitleNe: 'चन्द्रमा आधारित मन, भावना, मानसिक शक्ति र राशी चक्र',
      houses: chandraKundaliHouses,
      lagnaSignIndex: moonSignIdx
    },
    {
      code: 'D9',
      titleNe: '३. नवमांश कुण्डली (D9)',
      subtitleNe: 'भाग्य, विवाह, जीवनसाथी, धर्म र उत्तरार्ध जीवन',
      houses: d9Houses,
      lagnaSignIndex: d9Chart?.houses[0]?.signIndex ?? 0
    },
    ...remainingCodes.map((code, idx) => {
      const chartData = result.divisionalCharts?.find((c) => c.code === code);
      return {
        code,
        titleNe: `${idx + 4}. ${chartData?.nameNe || code}`,
        subtitleNe: chartData?.descriptionNe || '',
        houses: chartData
          ? chartData.houses.map((h) => ({
              house: h.houseNum,
              signIndex: h.signIndex,
              sign: h.signNe,
              planets: h.planets
            }))
          : [],
        lagnaSignIndex: chartData?.houses[0]?.signIndex ?? 0
      };
    })
  ];

  const displayedKundalis = viewMode === 'primary' ? allKundalis.slice(0, 3) : allKundalis;

  const shakaYear = p?.shakaSamvat || (p?.shakaYear ? toNepaliDigits(p.shakaYear) : '१९१७');
  const vikramSamvat = p?.vikramSamvat || (p?.vikramYear ? toNepaliDigits(p.vikramYear) : (result.bsBirthDate ? toNepaliDigits(result.bsBirthDate) : '२०५२'));
  const samvatsarName = p?.samvatsaraNe || 'सर्वधारी';
  const ayanaName = p?.ayanaNe || 'उत्तरायण';
  const rituName = p?.rituNe || 'ग्रीष्म';
  const chandraMonthName = p?.chandraMasaNe || p?.solarMasaNe || p?.bsMonthName || 'ज्येष्ठ';
  const solarMonthName = p?.solarMasaNe || p?.bsMonthName || 'ज्येष्ठ';
  const monthName = solarMonthName;
  const pakshaName = p?.pakshaNe || 'शुक्ल पक्ष';
  const varaName = p?.varaNe || 'आइतबार (रविवासर)';
  const dayTithiName = p?.dayTithiNe || p?.tithiNe || 'प्रतिपदा';
  const birthTithiName = p?.birthTithiNe || p?.tithiNe || 'प्रतिपदा';
  const tithiEndGhatiPal = (p?.tithiTransitionGhatiPal && p.tithiTransitionGhatiPal !== '—')
    ? p.tithiTransitionGhatiPal
    : (p?.tithiGhatiPal || 'घ. ४२ प. १५');

  const dayNakshatraName = p?.dayNakshatraNe || p?.nakshatraNe || 'अश्विनी';
  const birthNakshatraName = p?.birthNakshatraNe || p?.nakshatraNe || 'अश्विनी';
  const nakshatraEndGhatiPal = (p?.nakshatraTransitionGhatiPal && p.nakshatraTransitionGhatiPal !== '—')
    ? p.nakshatraTransitionGhatiPal
    : (p?.nakshatraGhatiPal || 'घ. ५० प. ००');
  const nakshatraBhuktaGhatiPal = p?.nakshatraBhuktaGhatiPal || 'घ. १२ प. ४०';
  const bhabhogaGhatiPal = p?.bhabhogaGhatiPal || 'घ. ४७ प. २०';

  const dayYogaName = p?.dayYogaNe || p?.yogaNe || 'शुभ';
  const birthYogaName = p?.birthYogaNe || p?.yogaNe || 'शुभ';
  const yogaEndGhatiPal = (p?.yogaTransitionGhatiPal && p.yogaTransitionGhatiPal !== '—')
    ? p.yogaTransitionGhatiPal
    : (p?.yogaGhatiPal || 'घ. २० प. १०');

  const karanaName = p?.birthKaranaNe || p?.karanaNe || 'बव';
  const ishtaKalaGhatiPal = p?.ishtaKalaGhatiPal || 'घ. ०६ प. २०';
  const bsGate = p?.bsDay ? toNepaliDigits(p.bsDay) : '०१';

  const moonDeg = moonPlanet ? moonPlanet.degree : 0;
  const birthDateVal = input.birthDate || result.birthDate || '1995-05-15';
  const birthDateObj = parseDateUTC(birthDateVal);

  const vimshottariList = (result.unDeductedDashas?.vimshottari120 && result.unDeductedDashas.vimshottari120.length > 0)
    ? result.unDeductedDashas.vimshottari120
    : (result.dashaHierarchy && result.dashaHierarchy.length > 0)
    ? result.dashaHierarchy
    : calculateVimshottariDasha(moonDeg, birthDateObj);

  const tribhagiList = (result.unDeductedDashas?.tribhagi80 && result.unDeductedDashas.tribhagi80.length > 0)
    ? result.unDeductedDashas.tribhagi80
    : (result.tribhagiDashaHierarchy && result.tribhagiDashaHierarchy.length > 0)
    ? result.tribhagiDashaHierarchy
    : calculateTribhagiDasha(moonDeg, birthDateObj);

  const yoginiList = (result.unDeductedDashas?.yogini72 && result.unDeductedDashas.yogini72.length > 0)
    ? result.unDeductedDashas.yogini72
    : (result.yoginiDashaHierarchy && result.yoginiDashaHierarchy.length > 0)
    ? result.yoginiDashaHierarchy
    : calculateYoginiDasha(moonDeg, birthDateObj, true);

  // Active running dasha planets for highlighting on charts
  const activeVimDasha = (result.dashaHierarchy || vimshottariList)?.find((d) => d.isActive);
  const activeVimAntar = activeVimDasha?.antardashas?.find((a) => a.isActive);
  const activeTriDasha = (result.tribhagiDashaHierarchy || tribhagiList)?.find((d) => d.isActive);
  const activeYogDasha = (result.yoginiDashaHierarchy || yoginiList)?.find((d) => d.isActive);

  const activePlanetKeys = Array.from(
    new Set(
      [
        activeVimDasha?.planetKey,
        activeVimAntar?.planetKey,
        activeTriDasha?.planetKey,
        activeYogDasha?.planetKey
      ].filter(Boolean) as string[]
    )
  );

  const activeDashaTitle = activeVimDasha
    ? `${activeVimDasha.planetNe} महादशा ${activeVimAntar ? `(${activeVimAntar.planetNe} अन्तर्दशा)` : ''}`
    : (activeTriDasha ? `${activeTriDasha.planetNe} त्रिभागी दशा` : '');

  const childGenderText = input.gender === 'female' ? 'पुत्री' : 'पुत्र';

  // Construct text for copying in requested format
  const fullCheenaText = `[अगाडिको भाग]

(ॐ) श्री मन्मङ्गलमूर्तये नमः (ॐ)

आदित्याद्या ग्रहाः सर्वे सनक्षत्राः सराशयः ।
दीर्घमायुः प्रयच्छन्तु यस्यैषा जन्मपत्रिका ॥ १ ॥
एकदन्तो महाबुद्धिः सर्वज्ञो गणनायकः ।
सर्वसिद्धि करो देवो गौरीपुत्रो विनायकः ॥ २ ॥
ब्रह्मा करोतु दीर्घायु विष्णु कुर्याच्च सम्पदम् ।
हरो रक्षतु गात्राणि यस्यैषा जन्मपत्रिका ॥ ३ ॥
उमा, गौरी, शिवा, दुर्गा, भद्रा, भगवती तथा ।
कुलदेव्याश्च चामुण्डा रक्षता बालकं सदा ॥ ४ ॥

श्री शालिवाहिनीयशाके ${shakaYear} श्री विक्रमादित्य संवत् ${vikramSamvat} साल
सौरमानेन ${samvatsarName} नाम संवत्सरे श्री सूर्य ${ayanaName} अयने
${rituName} ऋतौ ${chandraMonthName} मासे ${pakshaName}
${varaName} ${dayTithiName} तिथौ ${tithiEndGhatiPal} जन्मतिथौ ${birthTithiName} ${dayNakshatraName} नक्षत्रे ${nakshatraEndGhatiPal} जन्मनक्षत्रस्य भुक्त ${nakshatraBhuktaGhatiPal} भभोग ${bhabhogaGhatiPal} ${dayYogaName} योगे ${yogaEndGhatiPal} जन्मयोगे ${birthYogaName} ${karanaName} जन्मकरणे जन्मेति पञ्चाङ्गम् ।
अथ सौरमानेन ${solarMonthName} मासे सूर्य संक्रमाद् दिन गता ${bsGate} गते तदनुसार
(Date of Birth ${input.birthDate}) अत्र
${varaName} सूर्योदयादिष्ट ${ishtaKalaGhatiPal} घण्टा ${toNepaliDigits(input.birthTime.split(':')[0])} मिनेट ${toNepaliDigits(input.birthTime.split(':')[1])}
तदा जन्म समये ${result.lagna || 'मेष'} लग्नोदये ${result.rashi || 'मेष'} नवमांसे ${result.rashi || 'मेष'} राशिगते चन्द्रमसि

एवंविरधे पञ्चाङ्गशुद्धे शुभपुण्यदिने शुभमुहूर्तवेलायां श्रीमद्ब्रह्मणो धारणात्मक भूगोलेक देशे भारतवर्षे भरतखण्डे जम्बूद्वीपे आर्यावार्तान्तर्गत हिमवतो दक्षिण-पार्श्वे नेपाल देशे ${input.birthPlace} स्थाने निवसत: सकल मनोरथ स्वः कुलदीपक सदगुणालंकृत ${gotra} गोत्रोत्पन्ना
श्रीमान् पिता श्री ${fatherName} तस्यपाणिगृहिता धर्म पत्नी
श्रीमती माता ${motherName} नाम्नीदेव्याः सुगर्भयाकुक्षौ गर्भ ${childGenderText}
रत्न मजीजनत्अस्य होराशास्त्रप्रमाणे न ${av.nakshatra} नक्षत्रस्य ${av.nakshatraPad} चरणत्वेन
${av.namakshar} काराक्षरस्य ${av.yoni} योनिः ${av.nadi} नाडी ${av.gana} गणः ${av.varna} वर्गः
वर्णत्मक श्री ${input.name} चिरञ्जीवी शुभनाम
प्रतिष्ठित सच देव द्विजाशिर्वादै दीर्घमायुः भुयात् ।

---

[पछाडिको भाग]

(ॐ) स्तकालजाः ग्रहणा स्पष्टाः (ॐ)

| मान / ग्रह | सूर्य | चन्द्र | मंगल | बुध | गुरू | शुक्र | शनि | राहु | केतु | लग्नम |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| रा. (राशि) | ${getPlanetInfo('sun').rashi} | ${getPlanetInfo('moon').rashi} | ${getPlanetInfo('mars').rashi} | ${getPlanetInfo('mercury').rashi} | ${getPlanetInfo('jupiter').rashi} | ${getPlanetInfo('venus').rashi} | ${getPlanetInfo('saturn').rashi} | ${getPlanetInfo('rahu').rashi} | ${getPlanetInfo('ketu').rashi} | ${getPlanetInfo('lagna').rashi} |
| अ. (अंश) | ${getPlanetInfo('sun').deg}° | ${getPlanetInfo('moon').deg}° | ${getPlanetInfo('mars').deg}° | ${getPlanetInfo('mercury').deg}° | ${getPlanetInfo('jupiter').deg}° | ${getPlanetInfo('venus').deg}° | ${getPlanetInfo('saturn').deg}° | ${getPlanetInfo('rahu').deg}° | ${getPlanetInfo('ketu').deg}° | ${getPlanetInfo('lagna').deg}° |
| क. (कला) | ${getPlanetInfo('sun').min}' | ${getPlanetInfo('moon').min}' | ${getPlanetInfo('mars').min}' | ${getPlanetInfo('mercury').min}' | ${getPlanetInfo('jupiter').min}' | ${getPlanetInfo('venus').min}' | ${getPlanetInfo('saturn').min}' | ${getPlanetInfo('rahu').min}' | ${getPlanetInfo('ketu').min}' | ${getPlanetInfo('lagna').min}' |
| वि. (विकला) | ${getPlanetInfo('sun').sec}" | ${getPlanetInfo('moon').sec}" | ${getPlanetInfo('mars').sec}" | ${getPlanetInfo('mercury').sec}" | ${getPlanetInfo('jupiter').sec}" | ${getPlanetInfo('venus').sec}" | ${getPlanetInfo('saturn').sec}" | ${getPlanetInfo('rahu').sec}" | ${getPlanetInfo('ketu').sec}" | ${getPlanetInfo('lagna').sec}" |
| ब. मा. (बक्री/मार्गी) | ${getPlanetInfo('sun').bMa} | ${getPlanetInfo('moon').bMa} | ${getPlanetInfo('mars').bMa} | ${getPlanetInfo('mercury').bMa} | ${getPlanetInfo('jupiter').bMa} | ${getPlanetInfo('venus').bMa} | ${getPlanetInfo('saturn').bMa} | ${getPlanetInfo('rahu').bMa} | ${getPlanetInfo('ketu').bMa} | ${getPlanetInfo('lagna').bMa} |
| उ. अ. (उदय/अस्त) | ${getPlanetInfo('sun').uA} | ${getPlanetInfo('moon').uA} | ${getPlanetInfo('mars').uA} | ${getPlanetInfo('mercury').uA} | ${getPlanetInfo('jupiter').uA} | ${getPlanetInfo('venus').uA} | ${getPlanetInfo('saturn').uA} | ${getPlanetInfo('rahu').uA} | ${getPlanetInfo('ketu').uA} | ${getPlanetInfo('lagna').uA} |
| दीप्ति / अवस्था | ${getPlanetInfo('sun').uJa} | ${getPlanetInfo('moon').uJa} | ${getPlanetInfo('mars').uJa} | ${getPlanetInfo('mercury').uJa} | ${getPlanetInfo('jupiter').uJa} | ${getPlanetInfo('venus').uJa} | ${getPlanetInfo('saturn').uJa} | ${getPlanetInfo('rahu').uJa} | ${getPlanetInfo('ketu').uJa} | ${getPlanetInfo('lagna').uJa} |

[ सर्वाङ्ग १७ कुण्डली चक्रहरू क्रम ]
१. लग्न कुण्डली (D1) -> लग्न: ${result.lagna}, राशी: ${result.rashi}
२. राशि कुण्डली (Chandra) -> चन्द्र राशी: ${result.rashi}
३. नवमांश कुण्डली (D9) -> नवमांश: ${d9Chart?.houses[0]?.signNe || 'मेष'}
४. होरा (D2), ५. ड्रेष्काण (D3), ६. चतुर्थांश (D4), ७. सप्तमांश (D7), ८. दशमांश (D10), ९. द्वादशांश (D12), १०. षोडशांश (D16), ११. विंशांश (D20), १२. चतुर्विंशांश (D24), १३. सप्तविंशांश (D27), १४. त्रिंशांश (D30), १५. खवेदांश (D40), १६. अक्षवेदांश (D45), १७. षष्ठ्यंश (D60)

नम्रया भारिता शक घटिका नैव साखिता ।
परोपदेश वेलाया लिखितम् जन्मपत्रिका ॥

लेखक : ${authorName}
स्थान : ${authorLocation}
फोन : ${authorPhone}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullCheenaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Control Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>नेपाली परम्परागत जन्मपत्रिका (चिना)</span>
          </h2>
          <p className="text-xs text-amber-300/80 mt-1">
            शास्त्रीय संस्कृत मन्त्र, पञ्चाङ्ग, स्पष्ट ग्रह स्थिति, लग्न, राशि, नवमांश र सम्पूर्ण १७ वर्ग कुण्डलीहरू सहितको आधिकारिक चिना।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEditCustomFields(!showEditCustomFields)}
            className="bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{showEditCustomFields ? 'विवरण सम्पादन लुकाउनुहोस्' : 'गोत्र र अभिभावक विवरण सम्पादन'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-500/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
            <span>{copied ? 'कपी गरियो!' : 'पूर्ण चिना पाठ कपी गर्नुहोस्'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-950" />
            <span>चिना प्रिन्ट / PDF डाउनलोड</span>
          </button>
        </div>
      </div>

      {/* Optional Editor Form for Gotra, Father, Mother, Pandit Details */}
      {showEditCustomFields && (
        <div className="bg-amber-950/90 border border-amber-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 animate-fadeIn">
          <h3 className="text-sm font-bold text-amber-300 font-serif border-b border-amber-800/60 pb-2">
            ✍️ चिना फारमका लागि अतिरिक्त विवरणहरू प्रविष्ट गर्नुहोस्:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-amber-200 block mb-1">गोत्र (Gotra):</label>
              <input
                type="text"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>

            <div>
              <label className="text-amber-200 block mb-1">बुवाको नाम (Father Name):</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>

            <div>
              <label className="text-amber-200 block mb-1">आमाको नाम (Mother Name):</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>

            <div>
              <label className="text-amber-200 block mb-1">लेखक/ज्योतिषी (Author Pandit):</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>

            <div>
              <label className="text-amber-200 block mb-1">स्थान (Place):</label>
              <input
                type="text"
                value={authorLocation}
                onChange={(e) => setAuthorLocation(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>

            <div>
              <label className="text-amber-200 block mb-1">सम्पर्क फोन (Phone):</label>
              <input
                type="text"
                value={authorPhone}
                onChange={(e) => setAuthorPhone(e.target.value)}
                className="w-full bg-amber-900/60 border border-amber-700 rounded-lg p-2 text-amber-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Classical Traditional Parchment Print Sheet Document */}
      <div className="bg-[#FFFDF5] text-amber-950 rounded-2xl p-6 sm:p-10 border-4 border-amber-700 shadow-2xl font-serif space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* ================================================================ */}
        {/* [अगाडिको भाग] */}
        {/* ================================================================ */}
        <div className="space-y-6 pb-8 border-b-2 border-dashed border-amber-800/40">
          <div className="text-center font-bold text-lg sm:text-2xl text-amber-900 tracking-widest uppercase">
            [ अगाडिको भाग ]
          </div>

          {/* Top Mangalacharan / Opening Invocation */}
          <div className="text-center space-y-3 bg-amber-100/60 p-4 sm:p-6 rounded-2xl border border-amber-300">
            <div className="text-xl sm:text-2xl font-bold text-red-700">
              (ॐ) श्री मन्मङ्गलमूर्तये नमः (ॐ)
            </div>

            <div className="text-xs sm:text-sm md:text-base leading-relaxed text-amber-950 font-serif italic space-y-1">
              <p>आदित्याद्या ग्रहाः सर्वे सनक्षत्राः सराशयः ।</p>
              <p>दीर्घमायुः प्रयच्छन्तु यस्यैषा जन्मपत्रिका ॥ १ ॥</p>
              <p className="pt-1">एकदन्तो महाबुद्धिः सर्वज्ञो गणनायकः ।</p>
              <p>सर्वसिद्धि करो देवो गौरीपुत्रो विनायकः ॥ २ ॥</p>
              <p className="pt-1">ब्रह्मा करोतु दीर्घायु विष्णु कुर्याच्च सम्पदम् ।</p>
              <p>हरो रक्षतु गात्राणि यस्यैषा जन्मपत्रिका ॥ ३ ॥</p>
              <p className="pt-1">उमा, गौरी, शिवा, दुर्गा, भद्रा, भगवती तथा ।</p>
              <p>कुलदेव्याश्च चामुण्डा रक्षता बालकं सदा ॥ ४ ॥</p>
            </div>
          </div>

          {/* Panchang & Birth Moment Paragraph */}
          <div className="text-xs sm:text-sm md:text-base leading-loose text-justify text-amber-950 bg-amber-50/80 p-4 sm:p-6 rounded-2xl border border-amber-200/80 space-y-3">
            <p>
              श्री शालिवाहिनीयशाके <span className="font-bold underline text-amber-900">{shakaYear}</span> श्री विक्रमादित्य संवत् <span className="font-bold underline text-amber-900">{vikramSamvat}</span> साल{' '}
              सौरमानेन <span className="font-bold underline text-amber-900">{samvatsarName}</span> नाम संवत्सरे श्री सूर्य <span className="font-bold underline text-amber-900">{ayanaName}</span> अयने{' '}
              <span className="font-bold underline text-amber-900">{rituName}</span> ऋतौ <span className="font-bold underline text-amber-900">{chandraMonthName}</span> मासे <span className="font-bold underline text-amber-900">{pakshaName}</span>{' '}
              <span className="font-bold underline text-amber-900">{varaName}</span> <span className="font-bold underline text-amber-900">{dayTithiName}</span> तिथौ <span className="font-bold underline text-amber-900">{tithiEndGhatiPal}</span> जन्मतिथौ <span className="font-bold underline text-amber-900">{birthTithiName}</span>{' '}
              <span className="font-bold underline text-amber-900">{dayNakshatraName}</span> नक्षत्रे <span className="font-bold underline text-amber-900">{nakshatraEndGhatiPal}</span> जन्मनक्षत्रस्य भुक्त <span className="font-bold underline text-amber-900">{nakshatraBhuktaGhatiPal}</span> भभोग <span className="font-bold underline text-amber-900">{bhabhogaGhatiPal}</span>{' '}
              <span className="font-bold underline text-amber-900">{dayYogaName}</span> योगे <span className="font-bold underline text-amber-900">{yogaEndGhatiPal}</span> जन्मयोगे <span className="font-bold underline text-amber-900">{birthYogaName}</span>{' '}
              <span className="font-bold underline text-amber-900">{karanaName}</span> जन्मकरणे जन्मेति पञ्चाङ्गम् ।
            </p>

            <p>
              अथ सौरमानेन <span className="font-bold underline text-amber-900">{solarMonthName}</span> मासे सूर्य संक्रमाद् दिन गता <span className="font-bold underline text-amber-900">{bsGate}</span> गते तदनुसार{' '}
              (Date of Birth <span className="font-bold underline text-amber-900">{input.birthDate}</span>) अत्र{' '}
              <span className="font-bold underline text-amber-900">{varaName}</span> सूर्योदयादिष्ट <span className="font-bold underline text-amber-900">{ishtaKalaGhatiPal}</span> घण्टा <span className="font-bold underline text-amber-900">{toNepaliDigits(input.birthTime.split(':')[0])}</span> मिनेट <span className="font-bold underline text-amber-900">{toNepaliDigits(input.birthTime.split(':')[1])}</span>{' '}
              तदा जन्म समये <span className="font-bold underline text-amber-900">{result.lagna}</span> लग्नोदये <span className="font-bold underline text-amber-900">{result.rashi}</span> नवमांसे <span className="font-bold underline text-amber-900">{result.rashi}</span> राशिगते चन्द्रमसि।
            </p>

            <p>
              एवंविरधे पञ्चाङ्गशुद्धे शुभपुण्यदिने शुभमुहूर्तवेलायां श्रीमद्ब्रह्मणो धारणात्मक भूगोलेक देशे भारतवर्षे भरतखण्डे जम्बूद्वीपे आर्यावार्तान्तर्गत हिमवतो दक्षिण-पार्श्वे <span className="font-bold underline text-amber-900">नेपाल</span> देशे <span className="font-bold underline text-amber-900">{input.birthPlace}</span> स्थाने निवसत: सकल मनोरथ स्वः कुलदीपक सदगुणालंकृत <span className="font-bold underline text-amber-900">{gotra}</span> गोत्रोत्पन्ना{' '}
              श्रीमान् पिता श्री <span className="font-bold underline text-amber-900">{fatherName}</span> तस्यपाणिगृहिता धर्म पत्नी{' '}
              श्रीमती माता <span className="font-bold underline text-amber-900">{motherName}</span> नाम्नीदेव्याः सुगर्भयाकुक्षौ गर्भ <span className="font-bold underline text-amber-900">{childGenderText}</span>{' '}
              रत्न मजीजनत्अस्य होराशास्त्रप्रमाणे न <span className="font-bold underline text-amber-900">{av.nakshatra}</span> नक्षत्रस्य <span className="font-bold underline text-amber-900">{av.nakshatraPad}</span> चरणत्वेन{' '}
              <span className="font-bold underline text-amber-900">{av.namakshar}</span> काराक्षरस्य <span className="font-bold underline text-amber-900">{av.yoni}</span> योनिः <span className="font-bold underline text-amber-900">{av.nadi}</span> नाडी <span className="font-bold underline text-amber-900">{av.gana}</span> गणः <span className="font-bold underline text-amber-900">{av.varna}</span> वर्गः{' '}
              वर्णत्मक श्री <span className="font-bold underline text-red-800">{input.name}</span> चिरञ्जीवी शुभनाम{' '}
              प्रतिष्ठित सच देव द्विजाशिर्वादै दीर्घमायुः भुयात् ।
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* [पछाडिको भाग] */}
        {/* ================================================================ */}
        <div className="space-y-6 pt-2">
          <div className="text-center font-bold text-lg sm:text-2xl text-amber-900 tracking-widest uppercase">
            [ पछाडिको भाग ]
          </div>

          <div className="text-center text-lg sm:text-xl font-bold text-red-700">
            (ॐ) स्तकालजाः ग्रहणा स्पष्टाः (ॐ)
          </div>

          {/* Graha Spashta Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-amber-800 text-xs sm:text-sm">
              <thead>
                <tr className="bg-amber-200/80 font-bold text-amber-950 border-b border-amber-800">
                  <th className="p-2 border border-amber-800">मान / ग्रह</th>
                  <th className="p-2 border border-amber-800">सूर्य</th>
                  <th className="p-2 border border-amber-800">चन्द्र</th>
                  <th className="p-2 border border-amber-800">मंगल</th>
                  <th className="p-2 border border-amber-800">बुध</th>
                  <th className="p-2 border border-amber-800">गुरू</th>
                  <th className="p-2 border border-amber-800">शुक्र</th>
                  <th className="p-2 border border-amber-800">शनि</th>
                  <th className="p-2 border border-amber-800">राहु</th>
                  <th className="p-2 border border-amber-800">केतु</th>
                  <th className="p-2 border border-amber-800">लग्नम</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-800 bg-amber-50/50">
                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60">रा. (राशि)</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className="p-2 border border-amber-800 font-semibold">
                      {getPlanetInfo(k).rashi}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60">अ. (अंश)</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className="p-2 border border-amber-800">
                      {getPlanetInfo(k).deg}°
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60">क. (कला)</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className="p-2 border border-amber-800">
                      {getPlanetInfo(k).min}'
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60">वि. (विकला)</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className="p-2 border border-amber-800">
                      {getPlanetInfo(k).sec}"
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60" title="बक्री (ब) / मार्गी (मा)">ब. मा.</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className={`p-2 border border-amber-800 font-bold ${getPlanetInfo(k).bMa === 'ब' ? 'text-red-700 bg-red-100/60' : 'text-amber-900'}`}>
                      {getPlanetInfo(k).bMa}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60" title="उदय (उ) / अस्त (अ)">उ. अ.</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className={`p-2 border border-amber-800 font-bold ${getPlanetInfo(k).uA === 'अ' ? 'text-orange-700 bg-orange-100/60' : 'text-amber-900'}`}>
                      {getPlanetInfo(k).uA}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-2 font-bold border border-amber-800 bg-amber-100/60" title="दीप्ति / अवस्था (उच्च, नीच, स्वगृही, आदि)">दीप्ति</td>
                  {planetOrderKeys.map((k) => (
                    <td key={k} className="p-2 border border-amber-800 text-[11px] font-semibold">
                      {getPlanetInfo(k).uJa}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Complete 17 Kundali Charts Section in exact requested sequence */}
          <div className="space-y-5 bg-amber-100/50 p-4 sm:p-6 rounded-2xl border-2 border-amber-400">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300 pb-3">
              <div>
                <h3 className="font-serif font-bold text-amber-950 text-base sm:text-xl flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-800" />
                  <span>[ सम्पूर्ण १७ वर्ग कुण्डली चक्रहरू ]</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 font-sans">
                  १. लग्न कुण्डली, २. राशि कुण्डली, ३. नवमांश कुण्डली र बाँकी १४ वर्ग कुण्डलीहरू (क्रमानुसार)
                </p>
              </div>

              {/* View filter toggle */}
              <div className="flex items-center gap-1.5 bg-amber-200/80 p-1 rounded-xl border border-amber-400 print:hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'all'
                      ? 'bg-amber-800 text-amber-50 shadow'
                      : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  📋 सबै १७ कुण्डलीहरू
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('primary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'primary'
                      ? 'bg-amber-800 text-amber-50 shadow'
                      : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  🌟 मुख्य ३ (लग्न, राशि, नवमांश)
                </button>
              </div>
            </div>

            {/* Grid rendering of Kundalis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedKundalis.map((chartItem) => (
                <div
                  key={chartItem.code}
                  className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-sm flex flex-col justify-between"
                >
                  <KundaliChartNorth
                    houses={chartItem.houses}
                    planetPositions={planets}
                    lagnaSignIndex={chartItem.lagnaSignIndex}
                    lang={lang}
                    title={chartItem.titleNe}
                    subtitle={chartItem.subtitleNe}
                    theme="parchment"
                    activePlanetKeys={activePlanetKeys}
                    activeDashaTitle={activeDashaTitle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ================================================================ */}
          {/* [ महादशा चक्र कोष्ठक - Vimshottari, Tribhagi, Yogini ] */}
          {/* ================================================================ */}
          <div className="space-y-6 bg-amber-100/40 p-4 sm:p-6 rounded-2xl border-2 border-amber-400">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300 pb-3">
              <div>
                <h3 className="font-serif font-bold text-amber-950 text-base sm:text-xl flex items-center gap-2">
                  <Table className="w-5 h-5 text-amber-800" />
                  <span>[ महादशा चक्र कोष्ठक - विंशोत्तरी, त्रिभागी र योगिनी ]</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 font-sans">
                  जन्म नक्षत्र अनुसार गणना गरिएका विंशोत्तरी (१२० वर्ष), त्रिभागी (८० वर्ष) र योगिनी (७२ वर्ष) दशा तालिका
                </p>
              </div>

              {/* Dasha Filter Toggle */}
              <div className="flex flex-wrap items-center gap-1.5 bg-amber-200/80 p-1 rounded-xl border border-amber-400 print:hidden">
                <button
                  type="button"
                  onClick={() => setDashaTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dashaTab === 'all' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  📋 सबै दशा तालिका
                </button>
                <button
                  type="button"
                  onClick={() => setDashaTab('vimshottari')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dashaTab === 'vimshottari' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  १. विंशोत्तरी (१२०)
                </button>
                <button
                  type="button"
                  onClick={() => setDashaTab('tribhagi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dashaTab === 'tribhagi' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  २. त्रिभागी (८०)
                </button>
                <button
                  type="button"
                  onClick={() => setDashaTab('yogini')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dashaTab === 'yogini' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  ३. योगिनी (७२)
                </button>
              </div>
            </div>

            {/* Dasha Tables */}
            <div className="space-y-6">
              {(dashaTab === 'all' || dashaTab === 'vimshottari') && (
                <SingleDashaTable
                  title="१. विंशोत्तरी महादशा (१२० वर्ष चक्र - वर्ष मात्र)"
                  subtitle="सूर्य ६ वर्ष, चन्द्र १० वर्ष, मङ्गल ७ वर्ष, राहु १८ वर्ष, गुरु १६ वर्ष, शनि १९ वर्ष, बुध १७ वर्ष, केतु ७ वर्ष, शुक्र २० वर्ष — कुल १२० वर्षमा अन्त्य"
                  column1Header="ग्रह"
                  systemType="vimshottari"
                  data={vimshottariList}
                  birthDate={birthDateVal}
                />
              )}

              {(dashaTab === 'all' || dashaTab === 'tribhagi') && (
                <SingleDashaTable
                  title="२. त्रिभागी महादशा (८० वर्ष चक्र - वर्ष र महिना)"
                  subtitle="सूर्य ४ वर्ष ० महिना, चन्द्रमा ६ वर्ष ८ महिना, मङ्गल ४ वर्ष ८ महिना, राहु १२ वर्ष ० महिना, बृहस्पति १० वर्ष ८ महिना, शनि १२ वर्ष ८ महिना, बुध ११ वर्ष ४ महिना, केतु ४ वर्ष ८ महिना र शुक्र १३ वर्ष ४ महिना चलेर ८० वर्ष ० महिनामा अन्त्य हुने"
                  column1Header="ग्रह"
                  systemType="tribhagi"
                  data={tribhagiList}
                  birthDate={birthDateVal}
                />
              )}

              {(dashaTab === 'all' || dashaTab === 'yogini') && (
                <SingleDashaTable
                  title="३. योगिनी महादशा (७२ वर्ष चक्र - वर्ष मात्र)"
                  subtitle="मङ्गला १ वर्ष, पिङ्गला २ वर्ष, धान्या ३ वर्ष, भ्रामरी ४ वर्ष, भद्रिका ५ वर्ष, उल्का ६ वर्ष, सिद्धा ७ वर्ष, सङ्कटा ८ वर्ष — कुल ३६ वर्ष × २ चक्र = ७२ वर्षमा अन्त्य"
                  column1Header="योगिनी"
                  systemType="yogini"
                  data={yoginiList}
                  birthDate={birthDateVal}
                />
              )}
            </div>
          </div>

          {/* ================================================================ */}
          {/* [ जन्मकुण्डली योग तथा राजयोग फल - Cheena Yogas & Rajyogas ] */}
          {/* ================================================================ */}
          <div className="space-y-6 bg-amber-100/40 p-4 sm:p-6 rounded-2xl border-2 border-amber-400">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300 pb-3">
              <div>
                <h3 className="font-serif font-bold text-amber-950 text-base sm:text-xl flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-800" />
                  <span>[ जन्मकुण्डली योग तथा राजयोग फल - Yogas & Rajyogas ]</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 font-sans">
                  ज्योतिषशास्त्र अनुसार जन्मकुण्डलीमा विद्यमान राजयोग, महापुरुष योग, धनयोग तथा अन्य शुभ/अशुभ योगहरूको विस्तृत तालिका
                </p>
              </div>

              {/* Yogas Filter Toggle */}
              <div className="flex flex-wrap items-center gap-1.5 bg-amber-200/80 p-1 rounded-xl border border-amber-400 print:hidden">
                <button
                  type="button"
                  onClick={() => setYogaFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yogaFilterTab === 'all' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  📋 सम्पूर्ण योग ({yogaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setYogaFilterTab('present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yogaFilterTab === 'present' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  🌟 उपस्थित योग मात्र ({yogaList.filter((y) => y.isPresent).length})
                </button>
                <button
                  type="button"
                  onClick={() => setYogaFilterTab('raj')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yogaFilterTab === 'raj' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  👑 राजयोग ({yogaList.filter((y) => y.type === 'raj' || y.type === 'mahapurusha' || y.type === 'vipareeta' || y.type === 'neechabhanga').length})
                </button>
                <button
                  type="button"
                  onClick={() => setYogaFilterTab('dhana')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yogaFilterTab === 'dhana' ? 'bg-amber-800 text-amber-50 shadow' : 'text-amber-900 hover:bg-amber-300/50'
                  }`}
                >
                  💰 धनयोग/शुभयोग ({yogaList.filter((y) => y.type === 'dhana' || y.type === 'benefic').length})
                </button>
              </div>
            </div>

            {/* Yogas Cards Grid */}
            {filteredYogas.length === 0 ? (
              <div className="p-6 text-center text-amber-900 italic font-serif bg-amber-50/60 rounded-xl border border-amber-300">
                चयन गरिएको फिल्टर अनुसार कुनै योग भेटिएन।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredYogas.map((yoga) => {
                  const isPresent = yoga.isPresent;
                  const isRaj =
                    yoga.type === 'raj' ||
                    yoga.type === 'mahapurusha' ||
                    yoga.type === 'vipareeta' ||
                    yoga.type === 'neechabhanga';

                  return (
                    <div
                      key={yoga.id}
                      className={`p-4 rounded-2xl border font-serif text-xs sm:text-sm space-y-2 transition-all ${
                        isPresent
                          ? isRaj
                            ? 'bg-amber-50/95 border-amber-500 shadow-sm ring-1 ring-amber-400/60'
                            : 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                          : 'bg-amber-50/40 border-amber-200/80 opacity-80'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-amber-300/70 pb-2">
                        <div>
                          <h4 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                            {isRaj ? (
                              <Crown className="w-4 h-4 text-amber-800 inline" />
                            ) : (
                              <Star className="w-4 h-4 text-amber-700 inline" />
                            )}
                            <span>{yoga.nameNe}</span>
                          </h4>
                          {yoga.involvedPlanets && yoga.involvedPlanets.length > 0 && (
                            <span className="text-[11px] text-amber-800 font-sans">
                              सम्बन्धित ग्रह: {yoga.involvedPlanets.join(', ')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Type Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              yoga.type === 'raj'
                                ? 'bg-amber-700 text-amber-50'
                                : yoga.type === 'mahapurusha'
                                ? 'bg-purple-800 text-purple-50'
                                : yoga.type === 'dhana'
                                ? 'bg-emerald-700 text-emerald-50'
                                : yoga.type === 'vipareeta'
                                ? 'bg-indigo-800 text-indigo-50'
                                : yoga.type === 'dosha'
                                ? 'bg-rose-800 text-rose-50'
                                : 'bg-amber-200 text-amber-950'
                            }`}
                          >
                            {yoga.type === 'raj'
                              ? '👑 राजयोग'
                              : yoga.type === 'mahapurusha'
                              ? '💎 महापुरुष'
                              : yoga.type === 'dhana'
                              ? '💰 धन योग'
                              : yoga.type === 'vipareeta'
                              ? '🛡️ विपरीत राजयोग'
                              : yoga.type === 'dosha'
                              ? '⚠️ दोष'
                              : '✨ शुभ योग'}
                          </span>

                          {/* Presence Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isPresent ? 'bg-emerald-800 text-emerald-50' : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {isPresent ? `✅ ${yoga.strengthNe || 'उपस्थित'}` : '❌ अनुपस्थित'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-amber-950">
                        <p className="text-xs text-amber-900">
                          <span className="font-bold text-amber-950">नियम:</span> {yoga.ruleNe}
                        </p>
                        <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                          <span className="font-bold text-amber-950">फल / प्रभाव:</span> {yoga.descriptionNe}
                        </p>
                        {yoga.actualConditionNe && (
                          <p className="text-[11px] italic text-amber-900 bg-amber-200/50 p-1.5 rounded border border-amber-300/60 mt-1">
                            {yoga.actualConditionNe}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Closing Shloka & Pandit Signature Block */}
          <div className="pt-6 border-t-2 border-amber-300 space-y-4">
            <div className="text-center font-serif italic text-xs sm:text-sm text-amber-900 font-semibold">
              <p>नम्रया भारिता शक घटिका नैव साखिता ।</p>
              <p>परोपदेश वेलाया लिखितम् जन्मपत्रिका ॥</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-100/80 p-4 sm:p-5 rounded-2xl border border-amber-300 text-xs sm:text-sm font-serif">
              <div className="space-y-1">
                <p>
                  <span className="font-bold text-amber-950">लेखक / ज्योतिषाचार्य :</span>{' '}
                  <span className="font-bold text-red-800">{authorName}</span>
                </p>
                <p>
                  <span className="font-bold text-amber-950">स्थान :</span> {authorLocation}
                </p>
                <p>
                  <span className="font-bold text-amber-950">फोन / सम्पर्क :</span> {authorPhone}
                </p>
              </div>

              <div className="text-center border-t sm:border-t-0 sm:border-l border-amber-400 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <div className="w-24 h-12 mx-auto border-b border-amber-800 border-dashed flex items-end justify-center pb-1 text-[10px] text-amber-700 italic">
                  (हस्ताक्षर / मुहर)
                </div>
                <p className="text-[11px] font-bold text-amber-900 mt-1">आधिकारिक पण्डित हस्ताक्षर</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
