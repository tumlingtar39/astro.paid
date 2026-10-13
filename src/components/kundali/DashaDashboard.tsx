import React, { useState } from 'react';
import { DashaPeriod, YoginiPeriod, Language } from '../../types';
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface DashaDashboardProps {
  dashaHierarchy: DashaPeriod[]; // Vimshottari (120 yrs)
  tribhagiDashaHierarchy?: DashaPeriod[]; // Tribhagi (80 yrs)
  yoginiDashaHierarchy?: YoginiPeriod[]; // Yogini (36/72 yrs)
  unDeductedDashas?: {
    vimshottari120: DashaPeriod[];
    tribhagi80: DashaPeriod[];
    yogini72: YoginiPeriod[];
  };
  birthDate?: string;
  lang: Language;
}

// 9 Planets in standard Vimshottari / Tribhagi Cycle
const VIMSHOTTARI_PLANETS = [
  { key: 'ketu', nameNe: 'केतु', nameEn: 'Ketu', years: 7 },
  { key: 'venus', nameNe: 'शुक्र', nameEn: 'Venus', years: 20 },
  { key: 'sun', nameNe: 'सूर्य', nameEn: 'Sun', years: 6 },
  { key: 'moon', nameNe: 'चन्द्रमा', nameEn: 'Moon', years: 10 },
  { key: 'mars', nameNe: 'मङ्गल', nameEn: 'Mars', years: 7 },
  { key: 'rahu', nameNe: 'राहु', nameEn: 'Rahu', years: 18 },
  { key: 'jupiter', nameNe: 'बृहस्पति', nameEn: 'Jupiter', years: 16 },
  { key: 'saturn', nameNe: 'शनि', nameEn: 'Saturn', years: 19 },
  { key: 'mercury', nameNe: 'बुध', nameEn: 'Mercury', years: 17 }
];

// 8 Yoginis in standard Yogini Cycle (36 Years per cycle)
const YOGINI_LIST = [
  { index: 1, nameNe: 'मङ्गला', nameEn: 'Mangala', rulerNe: 'चन्द्र', rulerEn: 'Moon', years: 1 },
  { index: 2, nameNe: 'पिङ्गला', nameEn: 'Pingala', rulerNe: 'सूर्य', rulerEn: 'Sun', years: 2 },
  { index: 3, nameNe: 'धान्या', nameEn: 'Dhanya', rulerNe: 'गुरु', rulerEn: 'Jupiter', years: 3 },
  { index: 4, nameNe: 'भ्रामरी', nameEn: 'Bhramari', rulerNe: 'मङ्गल', rulerEn: 'Mars', years: 4 },
  { index: 5, nameNe: 'भद्रिका', nameEn: 'Bhadrika', rulerNe: 'बुध', rulerEn: 'Mercury', years: 5 },
  { index: 6, nameNe: 'उल्का', nameEn: 'Ulka', rulerNe: 'शनि', rulerEn: 'Saturn', years: 6 },
  { index: 7, nameNe: 'सिद्धा', nameEn: 'Siddha', rulerNe: 'शुक्र', rulerEn: 'Venus', years: 7 },
  { index: 8, nameNe: 'सङ्कटा', nameEn: 'Sankata', rulerNe: 'राहु', rulerEn: 'Rahu', years: 8 }
];

function toNepaliDigits(input: string | number): string {
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(input).replace(/\d/g, (d) => devDigits[parseInt(d, 10)]);
}

function parseSafeDate(dStr: string): Date {
  if (!dStr) return new Date();
  const cleaned = dStr.trim().replace(/\//g, '-');
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatSafeDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

function formatDurationText(startMs: number, endMs: number, lang: Language): string {
  const diffDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
  if (diffDays >= 365) {
    const yrs = Math.floor(diffDays / 365.25);
    const remDays = diffDays - Math.floor(yrs * 365.25);
    const mos = Math.floor(remDays / 30.4375);
    const days = Math.round(remDays - Math.floor(mos * 30.4375));
    if (lang === 'ne') {
      let s = `${toNepaliDigits(yrs)} वर्ष`;
      if (mos > 0) s += ` ${toNepaliDigits(mos)} महिना`;
      if (days > 0 && yrs < 3) s += ` ${toNepaliDigits(days)} दिन`;
      return s;
    }
    let s = `${yrs} yrs`;
    if (mos > 0) s += ` ${mos} mos`;
    if (days > 0 && yrs < 3) s += ` ${days} days`;
    return s;
  } else if (diffDays >= 30) {
    const mos = Math.floor(diffDays / 30.4375);
    const days = Math.round(diffDays - Math.floor(mos * 30.4375));
    if (lang === 'ne') {
      let s = `${toNepaliDigits(mos)} महिना`;
      if (days > 0) s += ` ${toNepaliDigits(days)} दिन`;
      return s;
    }
    let s = `${mos} mos`;
    if (days > 0) s += ` ${days} days`;
    return s;
  } else {
    return lang === 'ne' ? `${toNepaliDigits(diffDays)} दिन` : `${diffDays} days`;
  }
}

function findPlanetIndex(keyOrName: string): number {
  if (!keyOrName) return 0;
  const k = keyOrName.toLowerCase();
  const idx = VIMSHOTTARI_PLANETS.findIndex(
    (p) =>
      p.key.toLowerCase() === k ||
      p.nameEn.toLowerCase() === k ||
      p.nameNe === keyOrName ||
      k.includes(p.key.toLowerCase()) ||
      k.includes(p.nameEn.toLowerCase())
  );
  return idx >= 0 ? idx : 0;
}

function findYoginiIndex(nameOrIdx: string | number): number {
  if (typeof nameOrIdx === 'number') {
    return (nameOrIdx - 1 + 8) % 8;
  }
  const str = String(nameOrIdx).toLowerCase();
  const idx = YOGINI_LIST.findIndex(
    (y) =>
      y.nameEn.toLowerCase() === str ||
      y.nameNe === nameOrIdx ||
      str.includes(y.nameEn.toLowerCase()) ||
      str.includes(y.nameNe)
  );
  return idx >= 0 ? idx : 0;
}

export const DashaDashboard: React.FC<DashaDashboardProps> = ({
  dashaHierarchy,
  tribhagiDashaHierarchy = [],
  yoginiDashaHierarchy = [],
  unDeductedDashas,
  lang,
}) => {
  const { fontScale } = useAccessibility();
  const isUltra = fontScale === 'ultra-vision';
  const isExtra = fontScale === 'extra-large';

  // Dynamic typography classes
  const tableHeadClass = isUltra
    ? 'p-3.5 text-base font-serif font-extrabold'
    : isExtra
    ? 'p-3 text-sm font-serif font-bold'
    : 'p-2.5 text-xs font-serif font-bold';

  const tableCellPadding = isUltra ? 'p-3.5' : isExtra ? 'p-3' : 'p-2.5';

  // Tab switch between the 3 dasha charts
  const [activeTab, setActiveTab] = useState<'vimshottari' | 'tribhagi' | 'yogini'>('vimshottari');

  // Interactive drill-down expansion states:
  // Level 1 -> 2: Maha Dasha -> Antar Dasha
  const [expandedMaha, setExpandedMaha] = useState<Record<string, boolean>>({});
  // Level 2 -> 3: Antar Dasha -> Pratyantar Dasha
  const [expandedAntar, setExpandedAntar] = useState<Record<string, boolean>>({});
  // Level 3 -> 4: Pratyantar Dasha -> Sookshmantar Dasha
  const [expandedPrat, setExpandedPrat] = useState<Record<string, boolean>>({});

  const toggleMaha = (id: string) => {
    setExpandedMaha((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAntar = (id: string) => {
    setExpandedAntar((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePrat = (id: string) => {
    setExpandedPrat((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Raw lists
  const vimshottariList =
    unDeductedDashas?.vimshottari120 && unDeductedDashas.vimshottari120.length > 0
      ? unDeductedDashas.vimshottari120
      : dashaHierarchy;

  const tribhagiList =
    unDeductedDashas?.tribhagi80 && unDeductedDashas.tribhagi80.length > 0
      ? unDeductedDashas.tribhagi80
      : tribhagiDashaHierarchy;

  const yoginiList =
    unDeductedDashas?.yogini72 && unDeductedDashas.yogini72.length > 0
      ? unDeductedDashas.yogini72
      : yoginiDashaHierarchy;

  // Generator: 9 Antardashas for a Mahadasha (Vimshottari & Tribhagi)
  const getAntardashas = (maha: DashaPeriod, parentKey: string) => {
    if (maha.antardashas && maha.antardashas.length > 0) {
      return maha.antardashas;
    }
    const startIdx = findPlanetIndex(maha.planetKey || maha.planetEn || parentKey);
    const startD = parseSafeDate(maha.startDate);
    const endD = parseSafeDate(maha.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: DashaPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 9; i++) {
      const p = VIMSHOTTARI_PLANETS[(startIdx + i) % 9];
      const frac = p.years / 120;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${maha.id}_ant_${p.key}_${i}`,
        planetKey: p.key,
        planetNe: p.nameNe,
        planetEn: p.nameEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        durationYears: (maha.durationYears || 1) * frac,
        isActive,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Generator: 9 Pratyantardashas for an Antardasha
  const getPratyantardashas = (antar: DashaPeriod, parentMahaKey: string) => {
    const startIdx = findPlanetIndex(antar.planetKey || antar.planetEn);
    const startD = parseSafeDate(antar.startDate);
    const endD = parseSafeDate(antar.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: DashaPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 9; i++) {
      const p = VIMSHOTTARI_PLANETS[(startIdx + i) % 9];
      const frac = p.years / 120;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${antar.id}_prat_${p.key}_${i}`,
        planetKey: p.key,
        planetNe: p.nameNe,
        planetEn: p.nameEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        durationYears: (antar.durationYears || 0.1) * frac,
        isActive,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Generator: 9 Sookshmantardashas for a Pratyantardasha
  const getSookshmandashas = (prat: DashaPeriod) => {
    const startIdx = findPlanetIndex(prat.planetKey || prat.planetEn);
    const startD = parseSafeDate(prat.startDate);
    const endD = parseSafeDate(prat.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: DashaPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 9; i++) {
      const p = VIMSHOTTARI_PLANETS[(startIdx + i) % 9];
      const frac = p.years / 120;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${prat.id}_sook_${p.key}_${i}`,
        planetKey: p.key,
        planetNe: p.nameNe,
        planetEn: p.nameEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        durationYears: (prat.durationYears || 0.01) * frac,
        isActive,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Generator: Yogini Sub-periods (Antardasha: 8 Yoginis)
  const getYoginiAntardashas = (yog: YoginiPeriod) => {
    if (yog.subPeriods && yog.subPeriods.length > 0) {
      return yog.subPeriods;
    }
    const startIdx = findYoginiIndex(yog.yoginiIndex || yog.nameNe);
    const startD = parseSafeDate(yog.startDate);
    const endD = parseSafeDate(yog.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: YoginiPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 8; i++) {
      const y = YOGINI_LIST[(startIdx + i) % 8];
      const frac = y.years / 36;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${yog.id}_yant_${y.index}_${i}`,
        yoginiIndex: y.index,
        nameNe: y.nameNe,
        nameEn: y.nameEn,
        rulerNe: y.rulerNe,
        rulerEn: y.rulerEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        fullYears: (yog.fullYears || 1) * frac,
        durationYears: (yog.durationYears || 1) * frac,
        isActive,
        cycleNumber: yog.cycleNumber || 1,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Generator: Yogini Pratyantardashas (8 Yoginis)
  const getYoginiPratyantardashas = (antar: YoginiPeriod) => {
    const startIdx = findYoginiIndex(antar.yoginiIndex || antar.nameNe);
    const startD = parseSafeDate(antar.startDate);
    const endD = parseSafeDate(antar.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: YoginiPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 8; i++) {
      const y = YOGINI_LIST[(startIdx + i) % 8];
      const frac = y.years / 36;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${antar.id}_yprat_${y.index}_${i}`,
        yoginiIndex: y.index,
        nameNe: y.nameNe,
        nameEn: y.nameEn,
        rulerNe: y.rulerNe,
        rulerEn: y.rulerEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        fullYears: (antar.fullYears || 0.1) * frac,
        durationYears: (antar.durationYears || 0.1) * frac,
        isActive,
        cycleNumber: antar.cycleNumber || 1,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Generator: Yogini Sookshmantardashas (8 Yoginis)
  const getYoginiSookshmandashas = (prat: YoginiPeriod) => {
    const startIdx = findYoginiIndex(prat.yoginiIndex || prat.nameNe);
    const startD = parseSafeDate(prat.startDate);
    const endD = parseSafeDate(prat.endDate);
    const durMs = Math.max(1, endD.getTime() - startD.getTime());
    const now = Date.now();

    const list: YoginiPeriod[] = [];
    let curMs = startD.getTime();

    for (let i = 0; i < 8; i++) {
      const y = YOGINI_LIST[(startIdx + i) % 8];
      const frac = y.years / 36;
      const subDurMs = durMs * frac;
      const sDate = new Date(curMs);
      const eDate = new Date(curMs + subDurMs);
      const isActive = now >= sDate.getTime() && now <= eDate.getTime();

      list.push({
        id: `${prat.id}_ysook_${y.index}_${i}`,
        yoginiIndex: y.index,
        nameNe: y.nameNe,
        nameEn: y.nameEn,
        rulerNe: y.rulerNe,
        rulerEn: y.rulerEn,
        startDate: formatSafeDate(sDate),
        endDate: formatSafeDate(eDate),
        fullYears: (prat.fullYears || 0.01) * frac,
        durationYears: (prat.durationYears || 0.01) * frac,
        isActive,
        cycleNumber: prat.cycleNumber || 1,
      });
      curMs += subDurMs;
    }
    return list;
  };

  // Render 4-level drill down table for Vimshottari / Tribhagi
  const renderPlanetHierarchyTable = (
    dataList: DashaPeriod[],
    systemTitle: string,
    isTribhagi: boolean = false
  ) => {
    return (
      <div className="bg-gradient-to-b from-stone-900/95 to-amber-950/90 border border-amber-800/70 rounded-2xl shadow-xl overflow-hidden">
        {/* Clean Header */}
        <div className="p-3.5 sm:p-4 bg-amber-950/80 border-b border-amber-800/70 flex items-center justify-between">
          <h3 className="font-serif font-bold text-amber-100 text-sm sm:text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{systemTitle}</span>
          </h3>
          <span className="text-[11px] text-amber-300/80 bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-700/50">
            {lang === 'ne'
              ? 'ग्रहमा ट्याप गरी अन्तर्दशा / प्रत्यन्तर / सूक्ष्म हेर्नुहोस्'
              : 'Tap planet to view Antardasha, Pratyantar & Sookshma'}
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-amber-900/50 text-amber-200 border-b border-amber-800/80">
                <th className={`${tableHeadClass} w-[34%]`}>
                  {lang === 'ne' ? 'दशा (ग्रह प्रणाली)' : 'Dasha Period'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'सुरु मिति' : 'Start Date'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'अन्त्य मिति' : 'End Date'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'अवधि' : 'Duration'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/40">
              {dataList.map((maha) => {
                const isMahaOpen = !!expandedMaha[maha.id];
                const mahaStartMs = parseSafeDate(maha.startDate).getTime();
                const mahaEndMs = parseSafeDate(maha.endDate).getTime();
                const mahaDurationText = formatDurationText(mahaStartMs, mahaEndMs, lang);
                const antardashas = isMahaOpen ? getAntardashas(maha, maha.planetKey) : [];

                return (
                  <React.Fragment key={maha.id}>
                    {/* LEVEL 1: MAHA DASHA (ग्रह) */}
                    <tr
                      onClick={() => toggleMaha(maha.id)}
                      className={`cursor-pointer transition-colors select-none ${
                        maha.isActive
                          ? 'bg-amber-500/20 font-bold text-amber-100 hover:bg-amber-500/30'
                          : 'hover:bg-amber-900/30 text-stone-200'
                      }`}
                    >
                      <td className={tableCellPadding}>
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-amber-900/60 text-amber-300 shrink-0">
                            {isMahaOpen ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="font-serif font-bold text-amber-100 text-sm sm:text-base">
                            {lang === 'ne' ? maha.planetNe : maha.planetEn}
                          </span>
                          {maha.isActive && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black shrink-0 shadow-xs">
                              ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                            </span>
                          )}
                          <span className="text-[10px] text-amber-400/60 font-sans ml-1">
                            {isMahaOpen
                              ? ''
                              : lang === 'ne'
                              ? '(अन्तर्दशा हेर्न ट्याप गर्नुहोस्)'
                              : '(Tap for Antardasha)'}
                          </span>
                        </div>
                      </td>
                      <td className={`${tableCellPadding} font-mono text-amber-200/90 text-xs sm:text-sm`}>
                        {maha.startDate}
                      </td>
                      <td className={`${tableCellPadding} font-mono text-amber-200/90 text-xs sm:text-sm`}>
                        {maha.endDate}
                      </td>
                      <td className={`${tableCellPadding} text-amber-300 font-medium text-xs sm:text-sm`}>
                        {mahaDurationText}
                      </td>
                    </tr>

                    {/* LEVEL 2: ANTARDASHA (अन्तर्दशा) */}
                    {isMahaOpen &&
                      antardashas.map((antar) => {
                        const isAntarOpen = !!expandedAntar[antar.id];
                        const antarStartMs = parseSafeDate(antar.startDate).getTime();
                        const antarEndMs = parseSafeDate(antar.endDate).getTime();
                        const antarDurText = formatDurationText(antarStartMs, antarEndMs, lang);
                        const pratyantardashas = isAntarOpen
                          ? getPratyantardashas(antar, maha.planetKey)
                          : [];

                        return (
                          <React.Fragment key={antar.id}>
                            <tr
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAntar(antar.id);
                              }}
                              className={`cursor-pointer transition-colors select-none ${
                                antar.isActive
                                  ? 'bg-amber-600/25 font-bold text-amber-100 hover:bg-amber-600/35 border-l-4 border-l-amber-400'
                                  : 'bg-amber-950/40 hover:bg-amber-900/40 text-stone-200 border-l-2 border-l-amber-700/60'
                              }`}
                            >
                              <td className={`${tableCellPadding} pl-6 sm:pl-8`}>
                                <div className="flex items-center gap-2">
                                  <span className="p-0.5 rounded bg-amber-800/60 text-amber-300 shrink-0">
                                    {isAntarOpen ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </span>
                                  <span className="font-serif font-medium text-amber-200 text-xs sm:text-sm">
                                    {lang === 'ne'
                                      ? `${maha.planetNe} - ${antar.planetNe}`
                                      : `${maha.planetEn}-${antar.planetEn}`}
                                  </span>
                                  {antar.isActive && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black shrink-0">
                                      ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-amber-400/50 font-sans ml-1">
                                    {isAntarOpen
                                      ? ''
                                      : lang === 'ne'
                                      ? '(प्रत्यन्तर हेर्न ट्याप)'
                                      : '(Tap for Pratyantar)'}
                                  </span>
                                </div>
                              </td>
                              <td className={`${tableCellPadding} font-mono text-amber-200/80 text-[11px] sm:text-xs`}>
                                {antar.startDate}
                              </td>
                              <td className={`${tableCellPadding} font-mono text-amber-200/80 text-[11px] sm:text-xs`}>
                                {antar.endDate}
                              </td>
                              <td className={`${tableCellPadding} text-amber-300/90 text-[11px] sm:text-xs`}>
                                {antarDurText}
                              </td>
                            </tr>

                            {/* LEVEL 3: PRATYANTARDASHA (प्रत्यन्तर दशा) */}
                            {isAntarOpen &&
                              pratyantardashas.map((prat) => {
                                const isPratOpen = !!expandedPrat[prat.id];
                                const pratStartMs = parseSafeDate(prat.startDate).getTime();
                                const pratEndMs = parseSafeDate(prat.endDate).getTime();
                                const pratDurText = formatDurationText(pratStartMs, pratEndMs, lang);
                                const sookshmadashas = isPratOpen
                                  ? getSookshmandashas(prat)
                                  : [];

                                return (
                                  <React.Fragment key={prat.id}>
                                    <tr
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePrat(prat.id);
                                      }}
                                      className={`cursor-pointer transition-colors select-none ${
                                        prat.isActive
                                          ? 'bg-amber-700/30 font-bold text-amber-100 hover:bg-amber-700/40 border-l-4 border-l-amber-300'
                                          : 'bg-black/40 hover:bg-amber-950/60 text-stone-300 border-l-2 border-l-amber-600/40'
                                      }`}
                                    >
                                      <td className={`${tableCellPadding} pl-10 sm:pl-14`}>
                                        <div className="flex items-center gap-1.5">
                                          <span className="p-0.5 rounded bg-amber-900/80 text-amber-400 shrink-0">
                                            {isPratOpen ? (
                                              <ChevronDown className="w-2.5 h-2.5" />
                                            ) : (
                                              <ChevronRight className="w-2.5 h-2.5" />
                                            )}
                                          </span>
                                          <span className="font-serif text-amber-300 text-xs">
                                            {lang === 'ne'
                                              ? `${maha.planetNe} - ${antar.planetNe} - ${prat.planetNe}`
                                              : `${maha.planetEn}-${antar.planetEn}-${prat.planetEn}`}
                                          </span>
                                          {prat.isActive && (
                                            <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-stone-950 text-[9px] font-black shrink-0">
                                              ⚡
                                            </span>
                                          )}
                                          <span className="text-[9px] text-amber-400/40 font-sans ml-1">
                                            {isPratOpen
                                              ? ''
                                              : lang === 'ne'
                                              ? '(सूक्ष्म हेर्न ट्याप)'
                                              : '(Tap for Sookshma)'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className={`${tableCellPadding} font-mono text-amber-200/70 text-[10px] sm:text-[11px]`}>
                                        {prat.startDate}
                                      </td>
                                      <td className={`${tableCellPadding} font-mono text-amber-200/70 text-[10px] sm:text-[11px]`}>
                                        {prat.endDate}
                                      </td>
                                      <td className={`${tableCellPadding} text-amber-400/80 text-[10px] sm:text-[11px]`}>
                                        {pratDurText}
                                      </td>
                                    </tr>

                                    {/* LEVEL 4: SOOKSHMANTAR DASHA (सूक्ष्मान्तर दशा) */}
                                    {isPratOpen &&
                                      sookshmadashas.map((sook) => {
                                        const sookStartMs = parseSafeDate(sook.startDate).getTime();
                                        const sookEndMs = parseSafeDate(sook.endDate).getTime();
                                        const sookDurText = formatDurationText(sookStartMs, sookEndMs, lang);

                                        return (
                                          <tr
                                            key={sook.id}
                                            className={`transition-colors select-none ${
                                              sook.isActive
                                                ? 'bg-amber-400/25 font-bold text-amber-100 border-l-4 border-l-amber-200'
                                                : 'bg-black/60 text-stone-300 hover:bg-black/80 border-l border-amber-700/30'
                                            }`}
                                          >
                                            <td className={`${tableCellPadding} pl-14 sm:pl-20 font-serif text-[11px] sm:text-xs`}>
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-amber-400/70">↳</span>
                                                <span className="text-amber-200 font-medium">
                                                  {lang === 'ne'
                                                    ? `${antar.planetNe} - ${prat.planetNe} - ${sook.planetNe} (सूक्ष्म)`
                                                    : `${antar.planetEn}-${prat.planetEn}-${sook.planetEn} (Sookshma)`}
                                                </span>
                                                {sook.isActive && (
                                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black shrink-0">
                                                    ⚡ {lang === 'ne' ? 'सक्रिय' : 'Active'}
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                            <td className={`${tableCellPadding} font-mono text-amber-300/70 text-[10px]`}>
                                              {sook.startDate}
                                            </td>
                                            <td className={`${tableCellPadding} font-mono text-amber-300/70 text-[10px]`}>
                                              {sook.endDate}
                                            </td>
                                            <td className={`${tableCellPadding} text-amber-300/70 text-[10px]`}>
                                              {sookDurText}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </React.Fragment>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render 4-level drill down table for Yogini Dasha
  const renderYoginiHierarchyTable = () => {
    return (
      <div className="bg-gradient-to-b from-stone-900/95 to-amber-950/90 border border-amber-800/70 rounded-2xl shadow-xl overflow-hidden">
        {/* Clean Header */}
        <div className="p-3.5 sm:p-4 bg-amber-950/80 border-b border-amber-800/70 flex items-center justify-between">
          <h3 className="font-serif font-bold text-amber-100 text-sm sm:text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ne' ? 'योगिनी दशा तालिका' : 'Yogini Dasha Table'}</span>
          </h3>
          <span className="text-[11px] text-amber-300/80 bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-700/50">
            {lang === 'ne'
              ? 'योगिनीमा ट्याप गरी अन्तर्दशा / प्रत्यन्तर / सूक्ष्म हेर्नुहोस्'
              : 'Tap Yogini to view Antardasha, Pratyantar & Sookshma'}
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-amber-900/50 text-amber-200 border-b border-amber-800/80">
                <th className={`${tableHeadClass} w-[34%]`}>
                  {lang === 'ne' ? 'योगिनी (स्वामी ग्रह)' : 'Yogini (Ruler)'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'सुरु मिति' : 'Start Date'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'अन्त्य मिति' : 'End Date'}
                </th>
                <th className={`${tableHeadClass} w-[22%]`}>
                  {lang === 'ne' ? 'अवधि' : 'Duration'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/40">
              {yoginiList.map((yog) => {
                const isYogOpen = !!expandedMaha[yog.id];
                const yogStartMs = parseSafeDate(yog.startDate).getTime();
                const yogEndMs = parseSafeDate(yog.endDate).getTime();
                const yogDurationText = formatDurationText(yogStartMs, yogEndMs, lang);
                const antardashas = isYogOpen ? getYoginiAntardashas(yog) : [];

                return (
                  <React.Fragment key={yog.id}>
                    {/* LEVEL 1: YOGINI MAHA DASHA */}
                    <tr
                      onClick={() => toggleMaha(yog.id)}
                      className={`cursor-pointer transition-colors select-none ${
                        yog.isActive
                          ? 'bg-amber-500/20 font-bold text-amber-100 hover:bg-amber-500/30'
                          : 'hover:bg-amber-900/30 text-stone-200'
                      }`}
                    >
                      <td className={tableCellPadding}>
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-amber-900/60 text-amber-300 shrink-0">
                            {isYogOpen ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="font-serif font-bold text-amber-100 text-sm sm:text-base">
                            {lang === 'ne' ? yog.nameNe : yog.nameEn}
                          </span>
                          <span className="text-xs text-amber-300/80">
                            ({lang === 'ne' ? yog.rulerNe : yog.rulerEn})
                          </span>
                          {yog.isActive && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black shrink-0">
                              ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                            </span>
                          )}
                          <span className="text-[10px] text-amber-400/60 font-sans ml-1">
                            {isYogOpen
                              ? ''
                              : lang === 'ne'
                              ? '(अन्तर्दशा हेर्न ट्याप गर्नुहोस्)'
                              : '(Tap for Antardasha)'}
                          </span>
                        </div>
                      </td>
                      <td className={`${tableCellPadding} font-mono text-amber-200/90 text-xs sm:text-sm`}>
                        {yog.startDate}
                      </td>
                      <td className={`${tableCellPadding} font-mono text-amber-200/90 text-xs sm:text-sm`}>
                        {yog.endDate}
                      </td>
                      <td className={`${tableCellPadding} text-amber-300 font-medium text-xs sm:text-sm`}>
                        {yogDurationText}
                      </td>
                    </tr>

                    {/* LEVEL 2: YOGINI ANTARDASHA */}
                    {isYogOpen &&
                      antardashas.map((antar) => {
                        const isAntarOpen = !!expandedAntar[antar.id];
                        const antarStartMs = parseSafeDate(antar.startDate).getTime();
                        const antarEndMs = parseSafeDate(antar.endDate).getTime();
                        const antarDurText = formatDurationText(antarStartMs, antarEndMs, lang);
                        const pratyantardashas = isAntarOpen
                          ? getYoginiPratyantardashas(antar)
                          : [];

                        return (
                          <React.Fragment key={antar.id}>
                            <tr
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAntar(antar.id);
                              }}
                              className={`cursor-pointer transition-colors select-none ${
                                antar.isActive
                                  ? 'bg-amber-600/25 font-bold text-amber-100 hover:bg-amber-600/35 border-l-4 border-l-amber-400'
                                  : 'bg-amber-950/40 hover:bg-amber-900/40 text-stone-200 border-l-2 border-l-amber-700/60'
                              }`}
                            >
                              <td className={`${tableCellPadding} pl-6 sm:pl-8`}>
                                <div className="flex items-center gap-2">
                                  <span className="p-0.5 rounded bg-amber-800/60 text-amber-300 shrink-0">
                                    {isAntarOpen ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </span>
                                  <span className="font-serif font-medium text-amber-200 text-xs sm:text-sm">
                                    {lang === 'ne'
                                      ? `${yog.nameNe} - ${antar.nameNe}`
                                      : `${yog.nameEn}-${antar.nameEn}`}
                                  </span>
                                  {antar.isActive && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black shrink-0">
                                      ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-amber-400/50 font-sans ml-1">
                                    {isAntarOpen
                                      ? ''
                                      : lang === 'ne'
                                      ? '(प्रत्यन्तर हेर्न ट्याप)'
                                      : '(Tap for Pratyantar)'}
                                  </span>
                                </div>
                              </td>
                              <td className={`${tableCellPadding} font-mono text-amber-200/80 text-[11px] sm:text-xs`}>
                                {antar.startDate}
                              </td>
                              <td className={`${tableCellPadding} font-mono text-amber-200/80 text-[11px] sm:text-xs`}>
                                {antar.endDate}
                              </td>
                              <td className={`${tableCellPadding} text-amber-300/90 text-[11px] sm:text-xs`}>
                                {antarDurText}
                              </td>
                            </tr>

                            {/* LEVEL 3: YOGINI PRATYANTARDASHA */}
                            {isAntarOpen &&
                              pratyantardashas.map((prat) => {
                                const isPratOpen = !!expandedPrat[prat.id];
                                const pratStartMs = parseSafeDate(prat.startDate).getTime();
                                const pratEndMs = parseSafeDate(prat.endDate).getTime();
                                const pratDurText = formatDurationText(pratStartMs, pratEndMs, lang);
                                const sookshmadashas = isPratOpen
                                  ? getYoginiSookshmandashas(prat)
                                  : [];

                                return (
                                  <React.Fragment key={prat.id}>
                                    <tr
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePrat(prat.id);
                                      }}
                                      className={`cursor-pointer transition-colors select-none ${
                                        prat.isActive
                                          ? 'bg-amber-700/30 font-bold text-amber-100 hover:bg-amber-700/40 border-l-4 border-l-amber-300'
                                          : 'bg-black/40 hover:bg-amber-950/60 text-stone-300 border-l-2 border-l-amber-600/40'
                                      }`}
                                    >
                                      <td className={`${tableCellPadding} pl-10 sm:pl-14`}>
                                        <div className="flex items-center gap-1.5">
                                          <span className="p-0.5 rounded bg-amber-900/80 text-amber-400 shrink-0">
                                            {isPratOpen ? (
                                              <ChevronDown className="w-2.5 h-2.5" />
                                            ) : (
                                              <ChevronRight className="w-2.5 h-2.5" />
                                            )}
                                          </span>
                                          <span className="font-serif text-amber-300 text-xs">
                                            {lang === 'ne'
                                              ? `${yog.nameNe} - ${antar.nameNe} - ${prat.nameNe}`
                                              : `${yog.nameEn}-${antar.nameEn}-${prat.nameEn}`}
                                          </span>
                                          {prat.isActive && (
                                            <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-stone-950 text-[9px] font-black shrink-0">
                                              ⚡
                                            </span>
                                          )}
                                          <span className="text-[9px] text-amber-400/40 font-sans ml-1">
                                            {isPratOpen
                                              ? ''
                                              : lang === 'ne'
                                              ? '(सूक्ष्म हेर्न ट्याप)'
                                              : '(Tap for Sookshma)'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className={`${tableCellPadding} font-mono text-amber-200/70 text-[10px] sm:text-[11px]`}>
                                        {prat.startDate}
                                      </td>
                                      <td className={`${tableCellPadding} font-mono text-amber-200/70 text-[10px] sm:text-[11px]`}>
                                        {prat.endDate}
                                      </td>
                                      <td className={`${tableCellPadding} text-amber-400/80 text-[10px] sm:text-[11px]`}>
                                        {pratDurText}
                                      </td>
                                    </tr>

                                    {/* LEVEL 4: YOGINI SOOKSHMANTAR DASHA */}
                                    {isPratOpen &&
                                      sookshmadashas.map((sook) => {
                                        const sookStartMs = parseSafeDate(sook.startDate).getTime();
                                        const sookEndMs = parseSafeDate(sook.endDate).getTime();
                                        const sookDurText = formatDurationText(sookStartMs, sookEndMs, lang);

                                        return (
                                          <tr
                                            key={sook.id}
                                            className={`transition-colors select-none ${
                                              sook.isActive
                                                ? 'bg-amber-400/25 font-bold text-amber-100 border-l-4 border-l-amber-200'
                                                : 'bg-black/60 text-stone-300 hover:bg-black/80 border-l border-amber-700/30'
                                            }`}
                                          >
                                            <td className={`${tableCellPadding} pl-14 sm:pl-20 font-serif text-[11px] sm:text-xs`}>
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-amber-400/70">↳</span>
                                                <span className="text-amber-200 font-medium">
                                                  {lang === 'ne'
                                                    ? `${antar.nameNe} - ${prat.nameNe} - ${sook.nameNe} (सूक्ष्म)`
                                                    : `${antar.nameEn}-${prat.nameEn}-${sook.nameEn} (Sookshma)`}
                                                </span>
                                                {sook.isActive && (
                                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black shrink-0">
                                                    ⚡ {lang === 'ne' ? 'सक्रिय' : 'Active'}
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                            <td className={`${tableCellPadding} font-mono text-amber-300/70 text-[10px]`}>
                                              {sook.startDate}
                                            </td>
                                            <td className={`${tableCellPadding} font-mono text-amber-300/70 text-[10px]`}>
                                              {sook.endDate}
                                            </td>
                                            <td className={`${tableCellPadding} text-amber-300/70 text-[10px]`}>
                                              {sookDurText}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </React.Fragment>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Clean 3-Tab Bar for Vimshottari, Tribhagi, and Yogini */}
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-800/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('vimshottari')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vimshottari'
              ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
              : 'bg-amber-950/60 text-amber-200 hover:bg-amber-900/60 border border-amber-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>{lang === 'ne' ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tribhagi')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tribhagi'
              ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
              : 'bg-amber-950/60 text-amber-200 hover:bg-amber-900/60 border border-amber-800/60'
          }`}
        >
          <Layers className="w-4 h-4 text-stone-950" />
          <span>{lang === 'ne' ? 'त्रिभागी दशा' : 'Tribhagi Dasha'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('yogini')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'yogini'
              ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
              : 'bg-amber-950/60 text-amber-200 hover:bg-amber-900/60 border border-amber-800/60'
          }`}
        >
          <Clock className="w-4 h-4 text-stone-950" />
          <span>{lang === 'ne' ? 'योगिनी दशा' : 'Yogini Dasha'}</span>
        </button>
      </div>

      {/* Render Selected Chart Only */}
      <div className="animate-fadeIn">
        {activeTab === 'vimshottari' &&
          renderPlanetHierarchyTable(
            vimshottariList,
            lang === 'ne' ? 'विंशोत्तरी दशा तालिका' : 'Vimshottari Dasha Table',
            false
          )}

        {activeTab === 'tribhagi' &&
          renderPlanetHierarchyTable(
            tribhagiList,
            lang === 'ne' ? 'त्रिभागी दशा तालिका' : 'Tribhagi Dasha Table',
            true
          )}

        {activeTab === 'yogini' && renderYoginiHierarchyTable()}
      </div>
    </div>
  );
};
