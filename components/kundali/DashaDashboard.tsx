import React, { useState } from 'react';
import { DashaPeriod, YoginiPeriod, Language } from '../../types';
import { Clock, ChevronDown, ChevronRight, Sparkles, CheckCircle2, Layers, LayoutGrid, Filter, Eye, Table as TableIcon } from 'lucide-react';
import { convertYearsToVedicYM, formatVedicYM } from '../../utils/kundaliEngine';
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


// Age helper functions
function calculateAgeYears(birthDateStr: string, targetDateStr: string): number {
  if (!birthDateStr || !targetDateStr) return 0;
  const cleanB = birthDateStr.replace(/\//g, '-');
  const cleanT = targetDateStr.replace(/\//g, '-');
  const b = new Date(cleanB);
  const t = new Date(cleanT);
  const diffMs = t.getTime() - b.getTime();
  if (isNaN(diffMs) || diffMs <= 0) return 0;
  return diffMs / (365.2425 * 24 * 3600 * 1000);
}

function formatYearNumber(y: number, lang: Language): string {
  if (y <= 0) return lang === 'ne' ? '० वर्ष ० महिना' : '0y 0m';
  const ym = convertYearsToVedicYM(y);
  return formatVedicYM(ym, lang);
}

function toNepaliDigits(input: string | number): string {
  const devDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(input).replace(/\d/g, (d) => devDigits[parseInt(d, 10)]);
}

function getAgeRangeSummary(birthDateStr: string, startDateStr: string, endDateStr: string, durationYears: number, lang: Language): string {
  const startY = calculateAgeYears(birthDateStr, startDateStr);
  const endY = calculateAgeYears(birthDateStr, endDateStr);
  const startYM = convertYearsToVedicYM(startY);
  const endYM = convertYearsToVedicYM(endY);
  const durYM = convertYearsToVedicYM(durationYears);

  const startText = formatVedicYM(startYM, lang);
  const endText = formatVedicYM(endYM, lang);
  const durationText = formatVedicYM(durYM, lang);

  if (lang === 'ne') {
    return `${durationText} (${startText} देखि ${endText})`;
  }
  return `${durationText} (${startText} to ${endText})`;
}

export const DashaDashboard: React.FC<DashaDashboardProps> = ({
  dashaHierarchy,
  tribhagiDashaHierarchy = [],
  yoginiDashaHierarchy = [],
  unDeductedDashas,
  birthDate,
  lang
}) => {
  const { fontScale } = useAccessibility();

  const isUltra = fontScale === 'ultra-vision';
  const isExtra = fontScale === 'extra-large';

  // Dynamic typography and spacing classes for extreme accessibility
  const tableHeadClass = isUltra
    ? 'p-4 sm:p-5 text-base sm:text-lg font-serif font-extrabold'
    : isExtra
    ? 'p-3.5 sm:p-4 text-sm sm:text-base font-serif font-bold'
    : 'p-3 text-xs sm:text-sm font-serif font-bold';

  const tableCellPadding = isUltra
    ? 'p-4 sm:p-5'
    : isExtra
    ? 'p-3.5 sm:p-4'
    : 'p-3';

  const planetTextClass = isUltra
    ? 'text-lg sm:text-xl font-bold font-serif'
    : isExtra
    ? 'text-base sm:text-lg font-bold font-serif'
    : 'text-sm sm:text-base font-bold font-serif';

  const dateTextClass = isUltra
    ? 'text-base sm:text-lg font-mono font-bold'
    : isExtra
    ? 'text-sm sm:text-base font-mono font-bold'
    : 'text-xs sm:text-sm font-mono';

  const ageTextClass = isUltra
    ? 'text-sm sm:text-base font-sans font-medium'
    : isExtra
    ? 'text-xs sm:text-sm font-sans'
    : 'text-xs font-sans';

  const effectiveBirthDate =
    birthDate ||
    dashaHierarchy[0]?.startDate ||
    tribhagiDashaHierarchy[0]?.startDate ||
    yoginiDashaHierarchy[0]?.startDate ||
    '2000-01-01';


  // Active dasha tab selector
  const [activeDashaTab, setActiveDashaTab] = useState<'all' | 'tribhagi' | 'vimshottari' | 'yogini'>('all');

  // Filter mode: current active and future dashas only vs all
  const [showOnlyRemaining, setShowOnlyRemaining] = useState<boolean>(false);

  // Expanded sub-period state tracking
  const [expandedMahaVim, setExpandedMahaVim] = useState<string | null>(
    dashaHierarchy.find((d) => d.isActive)?.id || dashaHierarchy[0]?.id || null
  );
  const [expandedMahaTri, setExpandedMahaTri] = useState<string | null>(
    tribhagiDashaHierarchy.find((d) => d.isActive)?.id || tribhagiDashaHierarchy[0]?.id || null
  );
  const [expandedMahaYog, setExpandedMahaYog] = useState<string | null>(
    yoginiDashaHierarchy.find((d) => d.isActive)?.id || yoginiDashaHierarchy[0]?.id || null
  );

  // Yogini 72-year full cycle vs 36-year single cycle toggle (Default to 72 years)
  const [yoginiExtendedMode, setYoginiExtendedMode] = useState<boolean>(true);

  // Cycle Mode: Full Un-deducted Cycle (८०/१२० वर्षे स्थिर चक्र) vs Balance Deducted (भुक्त-भोग्य)
  const [dashaCycleMode, setDashaCycleMode] = useState<'undeducted' | 'balance'>('undeducted');

  // Filter function for current/future dashas
  const filterRemaining = <T extends { isActive?: boolean }>(list: T[]): T[] => {
    if (!showOnlyRemaining) return list;
    const activeIdx = list.findIndex((item) => item.isActive);
    if (activeIdx === -1) return list;
    return list.slice(activeIdx);
  };

  const rawTribhagiList = (dashaCycleMode === 'undeducted' && unDeductedDashas?.tribhagi80 && unDeductedDashas.tribhagi80.length > 0)
    ? unDeductedDashas.tribhagi80
    : tribhagiDashaHierarchy;

  const rawVimshottariList = (dashaCycleMode === 'undeducted' && unDeductedDashas?.vimshottari120 && unDeductedDashas.vimshottari120.length > 0)
    ? unDeductedDashas.vimshottari120
    : dashaHierarchy;

  const rawYoginiList = (dashaCycleMode === 'undeducted' && unDeductedDashas?.yogini72 && unDeductedDashas.yogini72.length > 0)
    ? (yoginiExtendedMode
        ? unDeductedDashas.yogini72
        : unDeductedDashas.yogini72.filter((y) => y.cycleNumber === 1))
    : (yoginiExtendedMode
        ? yoginiDashaHierarchy
        : yoginiDashaHierarchy.filter((y) => y.cycleNumber === 1));

  const filteredVimshottari = filterRemaining<DashaPeriod>(rawVimshottariList);
  const filteredTribhagi = filterRemaining<DashaPeriod>(rawTribhagiList);
  const filteredYogini = filterRemaining<YoginiPeriod>(rawYoginiList);

  const activeVim = rawVimshottariList.find((d) => d.isActive);
  const activeTri = rawTribhagiList.find((d) => d.isActive);
  const activeYog = rawYoginiList.find((d) => d.isActive);

  // ==========================================
  // 1. TRIBHAGI DASHA SECTION (८० वर्षे चक्र)
  // ==========================================
  const renderTribhagiTable = () => (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
        <div>
          <h4 className="text-base sm:text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>{lang === 'ne' ? '१. त्रिभागी दशा (Tribhagi Dasha - ८० वर्षे चक्र)' : '1. Tribhagi Dasha System (80 Years)'}</span>
          </h4>
          <p className="text-xs text-amber-800 mt-0.5">
            {lang === 'ne'
              ? '८० वर्षे स्थिर चक्र: सूर्य (४ वर्ष ० महिना), चन्द्रमा (६ वर्ष ८ महिना), मङ्गल (४ वर्ष ८ महिना), राहु (१२ वर्ष ० महिना), बृहस्पति (१० वर्ष ८ महिना), शनि (१२ वर्ष ८ महिना), बुध (११ वर्ष ४ महिना), केतु (४ वर्ष ८ महिना), शुक्र (१३ वर्ष ४ महिना) चलेर कुल ८० वर्ष ० महिनामा अन्त्य हुने'
              : '80-Yr Cycle: Sun (4y 0m), Moon (6y 8m), Mars (4y 8m), Rahu (12y 0m), Jupiter (10y 8m), Saturn (12y 8m), Mercury (11y 4m), Ketu (4y 8m), Venus (13y 4m) - Total 80y 0m'}
          </p>
        </div>
        {activeTri && (
          <span className="bg-amber-400 text-amber-950 border border-amber-600 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
            <CheckCircle2 className="w-4 h-4 text-amber-950" />
            <span>{lang === 'ne' ? `वर्तमान दशा: ${activeTri.planetNe} ➔` : `Active: ${activeTri.planetEn} ➔`}</span>
          </span>
        )}
      </div>

      {/* 4-Column Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-amber-400/80 shadow-md">
        <table className="w-full text-left border-collapse bg-amber-50/40 min-w-[620px]">
          <thead>
            <tr className="bg-amber-200 text-amber-950 border-b-2 border-amber-400">
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '१. ग्रह (Planet)' : '1. Planet'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '२. सुरु मिति (Start Date)' : '2. Start Date'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '३. अन्त्य मिति (End Date)' : '3. End Date'}
              </th>
              <th className={`${tableHeadClass} w-1/4`}>
                {lang === 'ne' ? '४. उमेर / अवधि (Age / Duration)' : '4. Age / Duration'}
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumMonths = 0;
              return filteredTribhagi.map((maha, idx) => {
                const isExpanded = expandedMahaTri === maha.id;
                const isRunning = !!maha.isActive;

                const durMonths = Math.round((maha.durationYears || 0) * 12);
                const startM = cumMonths;
                let endM = startM + durMonths;
                if (idx === filteredTribhagi.length - 1 || Math.abs(endM - 960) <= 2) {
                  endM = 960;
                }
                cumMonths = endM;

                const durYM = { years: Math.floor(durMonths / 12), months: durMonths % 12 };
                const startYM = { years: Math.floor(startM / 12), months: startM % 12 };
                const endYM = { years: Math.floor(endM / 12), months: endM % 12 };

                const durText = formatVedicYM(durYM, lang);
                const startText = formatVedicYM(startYM, lang);
                const endText = formatVedicYM(endYM, lang);
                const ageSummary = lang === 'ne'
                  ? `${durText} (${startText} देखि ${endText})`
                  : `${durText} (${startText} to ${endText})`;

                return (
                  <React.Fragment key={maha.id}>
                    <tr
                      onClick={() => setExpandedMahaTri(isExpanded ? null : maha.id)}
                      className={`cursor-pointer transition-all border-b border-amber-300 ${
                        isRunning
                          ? 'bg-amber-100 text-amber-950 font-black border-l-8 border-l-amber-600 ring-2 ring-amber-400 shadow-sm'
                          : 'hover:bg-amber-100/60 text-amber-950 bg-white'
                      }`}
                    >
                      {/* Column 1: Planet / Yogini */}
                      <td className={`${tableCellPadding} border-r border-amber-300 font-serif`}>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 ${planetTextClass}`}>
                            {lang === 'ne' ? maha.planetNe : maha.planetEn}
                            {isRunning && (
                              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-amber-300 border border-amber-500 text-amber-950 text-xs font-black shadow-xs">
                                ⚡ {lang === 'ne' ? 'चलिरहेको' : 'Active'}
                              </span>
                            )}
                          </span>
                          {maha.antardashas && (
                            <span className="text-xs text-amber-800 font-sans flex items-center gap-0.5">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Start Date */}
                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {maha.startDate}
                      </td>

                      {/* Column 3: End Date */}
                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {maha.endDate}
                      </td>

                      {/* Column 4: Age / Duration */}
                      <td className={`${tableCellPadding} ${ageTextClass} text-amber-900`}>
                        {ageSummary}
                        {maha.isBalancePeriod && (
                          <span className="ml-1.5 text-xs bg-amber-600/20 text-amber-950 px-2 py-0.5 rounded font-bold">
                            {lang === 'ne' ? 'जन्म भोग्य' : 'Bhogya Balance'}
                          </span>
                        )}
                      </td>
                    </tr>


                  {/* Expanded Sub-periods Table (Antardashas) */}
                  {isExpanded && maha.antardashas && (
                    <tr>
                      <td colSpan={4} className="p-3 bg-amber-100/60 border-b-2 border-amber-300">
                        <div className="space-y-2">
                          <div className="text-xs font-serif font-bold text-amber-950">
                            {lang === 'ne'
                              ? `↳ ${maha.planetNe} त्रिभागी महादशाका ९ अन्तर्दशाहरू (Sub-periods):`
                              : `↳ 9 Sub-periods under ${maha.planetEn} Tribhagi:`}
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-amber-300 bg-white">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-amber-200/60 text-amber-950 font-bold border-b border-amber-300 text-[11px]">
                                  <th className="p-2 border-r border-amber-200">अन्तर्दशा</th>
                                  <th className="p-2 border-r border-amber-200">सुरु मिति</th>
                                  <th className="p-2 border-r border-amber-200">अन्त्य मिति</th>
                                  <th className="p-2">उमेर / अवधि</th>
                                </tr>
                              </thead>
                              <tbody>
                                {maha.antardashas.map((sub) => (
                                  <tr
                                    key={sub.id}
                                    className={`border-b border-amber-200 ${
                                      sub.isActive
                                        ? 'bg-amber-100 font-bold text-amber-950 border-l-4 border-l-amber-600'
                                        : 'hover:bg-amber-50 text-amber-900'
                                    }`}
                                  >
                                    <td className="p-2 border-r border-amber-200 font-serif font-bold">
                                      <div className="flex items-center gap-1.5">
                                        <span>{lang === 'ne' ? `${maha.planetNe} - ${sub.planetNe}` : `${maha.planetEn}-${sub.planetEn}`}</span>
                                        {sub.isActive && (
                                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-400">
                                            ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.startDate}</td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.endDate}</td>
                                    <td className="p-2 text-[11px]">
                                      {getAgeRangeSummary(effectiveBirthDate, sub.startDate, sub.endDate, sub.durationYears, lang)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  </div>
);

  // ==========================================
  // 2. VIMSHOTTARI DASHA SECTION (१२० वर्षे चक्र)
  // ==========================================
  const renderVimshottariTable = () => (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
        <div>
          <h4 className="text-base sm:text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>{lang === 'ne' ? '२. विंशोत्तरी दशा (Vimshottari Dasha - १२० वर्षे चक्र)' : '2. Vimshottari Dasha System (120 Years)'}</span>
          </h4>
          <p className="text-xs text-amber-800 mt-0.5">
            {lang === 'ne'
              ? '१२० वर्षे चक्र: सूर्य (६ वर्ष), चन्द्रमा (१० वर्ष), मङ्गल (७ वर्ष), राहु (१८ वर्ष), बृहस्पति (१६ वर्ष), शनि (१९ वर्ष), बुध (१७ वर्ष), केतु (७ वर्ष), शुक्र (२० वर्ष) - कुल १२० वर्ष'
              : '120-Yr Cycle: Sun(6y), Moon(10y), Mars(7y), Rahu(18y), Jupiter(16y), Saturn(19y), Mercury(17y), Ketu(7y), Venus(20y) - Total 120 Years'}
          </p>
        </div>
        {activeVim && (
          <span className="bg-amber-400 text-amber-950 border border-amber-600 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
            <CheckCircle2 className="w-4 h-4 text-amber-950" />
            <span>{lang === 'ne' ? `वर्तमान दशा: ${activeVim.planetNe} ➔` : `Active: ${activeVim.planetEn} ➔`}</span>
          </span>
        )}
      </div>

      {/* 4-Column Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-amber-400/80 shadow-md">
        <table className="w-full text-left border-collapse bg-amber-50/40 min-w-[620px]">
          <thead>
            <tr className="bg-amber-200 text-amber-950 border-b-2 border-amber-400">
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '१. ग्रह (Planet)' : '1. Planet'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '२. सुरु मिति (Start Date)' : '2. Start Date'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '३. अन्त्य मिति (End Date)' : '3. End Date'}
              </th>
              <th className={`${tableHeadClass} w-1/4`}>
                {lang === 'ne' ? '४. उमेर / अवधि (Age / Duration)' : '4. Age / Duration'}
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumYears = 0;
              return filteredVimshottari.map((maha, idx) => {
                const isExpanded = expandedMahaVim === maha.id;
                const isRunning = !!maha.isActive;

                const durY = Math.round(maha.durationYears || 0);
                const startY = Math.round(cumYears);
                let endY = startY + durY;
                if (idx === filteredVimshottari.length - 1 || Math.abs(endY - 120) <= 1) {
                  endY = 120;
                }
                cumYears = endY;

                const ageSummary = lang === 'ne'
                  ? `${toNepaliDigits(durY)} वर्ष (${toNepaliDigits(startY)} देखि ${toNepaliDigits(endY)} वर्ष)`
                  : `${durY} yrs (${startY} to ${endY} yrs)`;

                return (
                  <React.Fragment key={maha.id}>
                    <tr
                      onClick={() => setExpandedMahaVim(isExpanded ? null : maha.id)}
                      className={`cursor-pointer transition-all border-b border-amber-300 ${
                        isRunning
                          ? 'bg-amber-100 text-amber-950 font-black border-l-8 border-l-amber-600 ring-2 ring-amber-400 shadow-sm'
                          : 'hover:bg-amber-100/60 text-amber-950 bg-white'
                      }`}
                    >
                      <td className={`${tableCellPadding} border-r border-amber-300 font-serif`}>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 ${planetTextClass}`}>
                            {lang === 'ne' ? maha.planetNe : maha.planetEn}
                            {isRunning && (
                              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-amber-300 border border-amber-500 text-amber-950 text-xs font-black shadow-xs">
                                ⚡ {lang === 'ne' ? 'चलिरहेको' : 'Active'}
                              </span>
                            )}
                          </span>
                          {maha.antardashas && (
                            <span className="text-xs text-amber-800 font-sans flex items-center gap-0.5">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {maha.startDate}
                      </td>

                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {maha.endDate}
                      </td>

                      <td className={`${tableCellPadding} ${ageTextClass} text-amber-900`}>
                        {ageSummary}
                        {maha.isBalancePeriod && (
                          <span className="ml-1.5 text-xs bg-amber-600/20 text-amber-950 px-2 py-0.5 rounded font-bold">
                            {lang === 'ne' ? 'जन्म भोग्य' : 'Bhogya Balance'}
                          </span>
                        )}
                      </td>
                    </tr>


                  {isExpanded && maha.antardashas && (
                    <tr>
                      <td colSpan={4} className="p-3 bg-amber-100/60 border-b-2 border-amber-300">
                        <div className="space-y-2">
                          <div className="text-xs font-serif font-bold text-amber-950">
                            {lang === 'ne'
                              ? `↳ ${maha.planetNe} विंशोत्तरी महादशाका ९ अन्तर्दशाहरू (Sub-periods):`
                              : `↳ 9 Sub-periods under ${maha.planetEn} Mahadasha:`}
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-amber-300 bg-white">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-amber-200/60 text-amber-950 font-bold border-b border-amber-300 text-[11px]">
                                  <th className="p-2 border-r border-amber-200">अन्तर्दशा</th>
                                  <th className="p-2 border-r border-amber-200">सुरु मिति</th>
                                  <th className="p-2 border-r border-amber-200">अन्त्य मिति</th>
                                  <th className="p-2">उमेर / अवधि</th>
                                </tr>
                              </thead>
                              <tbody>
                                {maha.antardashas.map((sub) => (
                                  <tr
                                    key={sub.id}
                                    className={`border-b border-amber-200 ${
                                      sub.isActive
                                        ? 'bg-amber-100 font-bold text-amber-950 border-l-4 border-l-amber-600'
                                        : 'hover:bg-amber-50 text-amber-900'
                                    }`}
                                  >
                                    <td className="p-2 border-r border-amber-200 font-serif font-bold">
                                      <div className="flex items-center gap-1.5">
                                        <span>{lang === 'ne' ? `${maha.planetNe} - ${sub.planetNe}` : `${maha.planetEn}-${sub.planetEn}`}</span>
                                        {sub.isActive && (
                                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-400">
                                            ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.startDate}</td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.endDate}</td>
                                    <td className="p-2 text-[11px]">
                                      {getAgeRangeSummary(effectiveBirthDate, sub.startDate, sub.endDate, sub.durationYears, lang)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  </div>
);

  // ==========================================
  // 3. YOGINI DASHA SECTION (७२ वर्षे चक्र / ३६ वर्षे चक्र)
  // ==========================================
  const renderYoginiTable = () => (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
        <div>
          <h4 className="text-base sm:text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>{lang === 'ne' ? '३. योगिनी दशा (Yogini Dasha - ७२ वर्षे पूर्ण चक्र)' : '3. Yogini Dasha System (72 Years Full Cycle)'}</span>
          </h4>
          <p className="text-xs text-amber-800 mt-0.5">
            {lang === 'ne'
              ? 'योगिनी चक्र: मङ्गला (१ वर्ष), पिङ्गला (२ वर्ष), धान्या (३ वर्ष), भ्रामरी (४ वर्ष), भद्रिका (५ वर्ष), उल्का (६ वर्ष), सिद्धा (७ वर्ष), सङ्कटा (८ वर्ष) - कुल ३६ वर्ष प्रति चक्र (२ चक्र = ७२ वर्ष)'
              : 'Yogini Cycle: Mangala(1y), Pingala(2y), Dhanya(3y), Bhramari(4y), Bhadrika(5y), Ulka(6y), Siddha(7y), Sankata(8y) - 36y per cycle (2 Cycles = 72 Years)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeYog && (
            <span className="bg-amber-400 text-amber-950 border border-amber-600 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
              <span>{lang === 'ne' ? `वर्तमान योगिनी: ${activeYog.nameNe} ➔` : `Active: ${activeYog.nameEn} ➔`}</span>
            </span>
          )}

          {/* Cycle Toggle */}
          <div className="flex items-center bg-amber-100 p-0.5 rounded-lg border border-amber-300 text-xs">
            <button
              type="button"
              onClick={() => setYoginiExtendedMode(true)}
              className={`px-2 py-1 rounded font-bold transition-all ${
                yoginiExtendedMode ? 'bg-amber-500 text-amber-950 shadow' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              ७२ वर्ष (पूर्ण)
            </button>
            <button
              type="button"
              onClick={() => setYoginiExtendedMode(false)}
              className={`px-2 py-1 rounded font-bold transition-all ${
                !yoginiExtendedMode ? 'bg-amber-500 text-amber-950 shadow' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              ३६ वर्ष (१ चक्र)
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-amber-400/80 shadow-md">
        <table className="w-full text-left border-collapse bg-amber-50/40 min-w-[620px]">
          <thead>
            <tr className="bg-amber-200 text-amber-950 border-b-2 border-amber-400">
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '१. योगिनी (Yogini/Ruler)' : '1. Yogini (Ruler)'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '२. सुरु मिति (Start Date)' : '2. Start Date'}
              </th>
              <th className={`${tableHeadClass} border-r border-amber-300 w-1/4`}>
                {lang === 'ne' ? '३. अन्त्य मिति (End Date)' : '3. End Date'}
              </th>
              <th className={`${tableHeadClass} w-1/4`}>
                {lang === 'ne' ? '४. उमेर / अवधि (Age / Duration)' : '4. Age / Duration'}
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumYears = 0;
              const maxTarget = yoginiExtendedMode ? 72 : 36;
              return filteredYogini.map((yog, idx) => {
                const isExpanded = expandedMahaYog === yog.id;
                const isRunning = !!yog.isActive;

                const durY = Math.round(yog.durationYears || 0);
                const startY = Math.round(cumYears);
                let endY = startY + durY;
                if (idx === filteredYogini.length - 1 || Math.abs(endY - maxTarget) <= 1) {
                  endY = maxTarget;
                }
                cumYears = endY;

                const ageSummary = lang === 'ne'
                  ? `${toNepaliDigits(durY)} वर्ष (${toNepaliDigits(startY)} देखि ${toNepaliDigits(endY)} वर्ष)`
                  : `${durY} yrs (${startY} to ${endY} yrs)`;

                return (
                  <React.Fragment key={yog.id}>
                    <tr
                      onClick={() => setExpandedMahaYog(isExpanded ? null : yog.id)}
                      className={`cursor-pointer transition-all border-b border-amber-300 ${
                        isRunning
                          ? 'bg-amber-100 text-amber-950 font-black border-l-8 border-l-amber-600 ring-2 ring-amber-400 shadow-sm'
                          : 'hover:bg-amber-100/60 text-amber-950 bg-white'
                      }`}
                    >
                      <td className={`${tableCellPadding} border-r border-amber-300 font-serif`}>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 ${planetTextClass}`}>
                            {lang === 'ne' ? `${yog.nameNe} (${yog.rulerNe})` : `${yog.nameEn} (${yog.rulerEn})`}
                            {isRunning && (
                              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-amber-300 border border-amber-500 text-amber-950 text-xs font-black shadow-xs">
                                ⚡ {lang === 'ne' ? 'चलिरहेको' : 'Active'}
                              </span>
                            )}
                          </span>
                          {yog.subPeriods && (
                            <span className="text-xs text-amber-800 font-sans flex items-center gap-0.5">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {yog.startDate}
                      </td>

                      <td className={`${tableCellPadding} border-r border-amber-300 ${dateTextClass}`}>
                        {yog.endDate}
                      </td>

                      <td className={`${tableCellPadding} ${ageTextClass} text-amber-900`}>
                        {ageSummary}
                        {yog.isBalancePeriod && (
                          <span className="ml-1.5 text-xs bg-amber-600/20 text-amber-950 px-2 py-0.5 rounded font-bold">
                            {lang === 'ne' ? 'जन्म भोग्य' : 'Bhogya Balance'}
                          </span>
                        )}
                      </td>
                    </tr>


                  {isExpanded && yog.subPeriods && (
                    <tr>
                      <td colSpan={4} className="p-3 bg-amber-100/60 border-b-2 border-amber-300">
                        <div className="space-y-2">
                          <div className="text-xs font-serif font-bold text-amber-950">
                            {lang === 'ne'
                              ? `↳ ${yog.nameNe} योगिनीका ८ उप-अवधिहरू (Sub-periods):`
                              : `↳ 8 Sub-periods under ${yog.nameEn} Yogini:`}
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-amber-300 bg-white">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-amber-200/60 text-amber-950 font-bold border-b border-amber-300 text-[11px]">
                                  <th className="p-2 border-r border-amber-200">उप-अवधि</th>
                                  <th className="p-2 border-r border-amber-200">सुरु मिति</th>
                                  <th className="p-2 border-r border-amber-200">अन्त्य मिति</th>
                                  <th className="p-2">उमेर / अवधि</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yog.subPeriods.map((sub) => (
                                  <tr
                                    key={sub.id}
                                    className={`border-b border-amber-200 ${
                                      sub.isActive
                                        ? 'bg-amber-100 font-bold text-amber-950 border-l-4 border-l-amber-600'
                                        : 'hover:bg-amber-50 text-amber-900'
                                    }`}
                                  >
                                    <td className="p-2 border-r border-amber-200 font-serif font-bold">
                                      <div className="flex items-center gap-1.5">
                                        <span>{lang === 'ne' ? `${yog.nameNe} - ${sub.nameNe}` : `${yog.nameEn}-${sub.nameEn}`}</span>
                                        {sub.isActive && (
                                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-400">
                                            ⚡ {lang === 'ne' ? 'हालको' : 'Active'}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.startDate}</td>
                                    <td className="p-2 border-r border-amber-200 font-mono text-[11px]">{sub.endDate}</td>
                                    <td className="p-2 text-[11px]">
                                      {getAgeRangeSummary(effectiveBirthDate, sub.startDate, sub.endDate, sub.durationYears, lang)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  </div>
);

  return (
    <div className="bg-[#FFFDF5] border-2 border-amber-300 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-amber-950 font-serif">
      {/* Top Header & System Switchers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-300">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-950 flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-amber-600" />
            <span>
              {lang === 'ne' ? 'त्रिभागी, विंशोत्तरी र योगिनी दशा तालिका' : 'Tribhagi, Vimshottari & Yogini Dasha Tables'}
            </span>
          </h3>
          <p className="text-xs text-amber-800 mt-0.5">
            {lang === 'ne'
              ? 'जन्म नक्षत्रको भुक्त/भोग्य अंश अनुसार वर्ष र महिनामा शत-प्रतिशत शुद्ध गणना गरिएको दशा विवरण'
              : 'Accurate 4-column dasha tables calculated based on Moon Nakshatra balance in Years & Months.'}
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Un-deducted Full Cycle vs Balance Deducted Toggle */}
          <div className="flex items-center bg-amber-100 p-1 rounded-xl border border-amber-300 shadow-sm">
            <button
              type="button"
              onClick={() => setDashaCycleMode('undeducted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                dashaCycleMode === 'undeducted' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? '८० वर्षे स्थिर चक्र (८ महिना)' : 'Full 80y Cycle'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDashaCycleMode('balance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                dashaCycleMode === 'balance' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'भुक्त-भोग्य दशा' : 'Balance Mode'}</span>
            </button>
          </div>

          {/* Active / Future Filter Toggle */}
          <div className="flex items-center bg-amber-100 p-1 rounded-xl border border-amber-300 shadow-sm">
            <button
              type="button"
              onClick={() => setShowOnlyRemaining(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                showOnlyRemaining ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'वर्तमान र भविष्य मात्र' : 'Active & Future'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyRemaining(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                !showOnlyRemaining ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'सबै' : 'All'}</span>
            </button>
          </div>

          {/* System Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-amber-100/80 p-1 rounded-xl border border-amber-300">
            <button
              type="button"
              onClick={() => setActiveDashaTab('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                activeDashaTab === 'all'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-600'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'सबै प्रणाली' : 'All 3 Systems'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDashaTab('tribhagi')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                activeDashaTab === 'tribhagi'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-600'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'त्रिभागी (८० वर्ष)' : 'Tribhagi (80y)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDashaTab('vimshottari')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                activeDashaTab === 'vimshottari'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-600'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'विंशोत्तरी (१२० वर्ष)' : 'Vimshottari (120y)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDashaTab('yogini')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1 ${
                activeDashaTab === 'yogini'
                  ? 'bg-amber-500 text-amber-950 shadow-md border border-amber-600'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'योगिनी (७२ वर्ष)' : 'Yogini (72y)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeDashaTab === 'all' && (
        <div className="space-y-8 animate-fadeIn">
          {renderTribhagiTable()}
          {renderVimshottariTable()}
          {renderYoginiTable()}
        </div>
      )}

      {activeDashaTab === 'tribhagi' && renderTribhagiTable()}
      {activeDashaTab === 'vimshottari' && renderVimshottariTable()}
      {activeDashaTab === 'yogini' && renderYoginiTable()}
    </div>
  );
};
