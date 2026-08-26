import React from 'react';
import { DetailedPlanetPosition, Language } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';

export interface ChartHouseInput {
  house: number;
  sign?: string;
  signIndex?: number;
  planets: (string | DetailedPlanetPosition)[];
}

interface KundaliChartNorthProps {
  houses?: ChartHouseInput[];
  planetPositions?: DetailedPlanetPosition[];
  lagnaSignIndex: number;
  lang: Language;
  title?: string;
  subtitle?: string;
  theme?: 'dark' | 'parchment';
  activePlanetKeys?: string[];
  activeDashaTitle?: string;
}

export function toNepaliDigits(input: string | number): string {
  const map: Record<string, string> = {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९'
  };
  return String(input).replace(/[0-9]/g, (d) => map[d] || d);
}

export function isPlanetActive(
  item: string | DetailedPlanetPosition,
  activePlanetKeys?: string[]
): boolean {
  if (!activePlanetKeys || activePlanetKeys.length === 0) return false;

  const normalize = (str: string) => str.toLowerCase().trim();
  const normalizedActive = activePlanetKeys.map((k) => normalize(k));

  if (typeof item === 'string') {
    const raw = normalize(item);
    if (raw.includes('लग्न') || raw === 'ल') return false;
    return normalizedActive.some((key) => {
      if (key === 'sun' && (raw.includes('सूर्य') || raw.includes('sun') || raw.startsWith('सू'))) return true;
      if (key === 'moon' && (raw.includes('चन्द्र') || raw.includes('moon') || raw.startsWith('च'))) return true;
      if (key === 'mars' && (raw.includes('मंगल') || raw.includes('मङ्गल') || raw.includes('mars') || raw.startsWith('मं') || raw.startsWith('मङ्'))) return true;
      if (key === 'mercury' && (raw.includes('बुध') || raw.includes('mercury') || raw.startsWith('बु'))) return true;
      if (key === 'jupiter' && (raw.includes('गुरु') || raw.includes('बृहस्पति') || raw.includes('jupiter') || raw.startsWith('गु') || raw.startsWith('बृ'))) return true;
      if (key === 'venus' && (raw.includes('शुक्र') || raw.includes('venus') || raw.startsWith('शु'))) return true;
      if (key === 'saturn' && (raw.includes('शनि') || raw.includes('saturn') || raw.startsWith('श'))) return true;
      if (key === 'rahu' && (raw.includes('राहु') || raw.includes('rahu') || raw.startsWith('रा'))) return true;
      if (key === 'ketu' && (raw.includes('केतु') || raw.includes('ketu') || raw.startsWith('के'))) return true;
      return raw.includes(key);
    });
  } else {
    if (item.id === 'lagna') return false;
    const pId = normalize(item.id || (item as unknown as { planet?: string }).planet || '');
    const pNe = normalize(item.nameNe || '');
    return normalizedActive.some((key) => {
      if (pId === key) return true;
      if (key === 'sun' && (pId === 'sun' || pNe.includes('सूर्य'))) return true;
      if (key === 'moon' && (pId === 'moon' || pNe.includes('चन्द्र'))) return true;
      if (key === 'mars' && (pId === 'mars' || pNe.includes('मंगल') || pNe.includes('मङ्गल'))) return true;
      if (key === 'mercury' && (pId === 'mercury' || pNe.includes('बुध'))) return true;
      if (key === 'jupiter' && (pId === 'jupiter' || pNe.includes('गुरु') || pNe.includes('बृहस्पति'))) return true;
      if (key === 'venus' && (pId === 'venus' || pNe.includes('शुक्र'))) return true;
      if (key === 'saturn' && (pId === 'saturn' || pNe.includes('शनि'))) return true;
      if (key === 'rahu' && (pId === 'rahu' || pNe.includes('राहु'))) return true;
      if (key === 'ketu' && (pId === 'ketu' || pNe.includes('केतु'))) return true;
      return false;
    });
  }
}

export const KundaliChartNorth: React.FC<KundaliChartNorthProps> = ({
  houses,
  planetPositions = [],
  lagnaSignIndex,
  lang,
  title,
  subtitle,
  theme = 'dark',
  activePlanetKeys = [],
  activeDashaTitle
}) => {
  const { fontScale, scaleMultiplier, chartSingleLetterOnly } = useAccessibility();
  const { isLight } = useTheme();

  // Extract planets/labels for a given house number (1 to 12)
  const getHousePlanetItems = (houseNum: number): (string | DetailedPlanetPosition)[] => {
    if (houses && houses.length > 0) {
      const hObj = houses.find((h) => h.house === houseNum);
      if (hObj) return hObj.planets || [];
    }
    // Fallback to planetPositions filtered by houseNum
    return planetPositions.filter((p) => p.houseNum === houseNum);
  };

  // Sign number for house `h` = ((lagnaSignIndex + h - 1) % 12) + 1
  const getSignNumForHouse = (houseNum: number) => {
    if (houses && houses.length > 0) {
      const hObj = houses.find((h) => h.house === houseNum);
      if (hObj && hObj.signIndex !== undefined) {
        return hObj.signIndex + 1;
      }
    }
    return ((lagnaSignIndex + houseNum - 1) % 12) + 1;
  };

  // Theme styling definitions - adapt to global Light/Dark mode
  const isParchment = isLight || theme === 'parchment';

  const containerBg = isParchment
    ? 'bg-[#FFFDF5] border-2 border-amber-800 text-amber-950 p-4 sm:p-5 rounded-2xl shadow-lg'
    : 'bg-gradient-to-b from-amber-950/90 to-black p-4 sm:p-5 rounded-2xl border-2 border-amber-600/70 shadow-2xl text-amber-100';

  const titleTextClass = isParchment
    ? 'text-amber-950 border-b-2 border-amber-800/40'
    : 'text-amber-200 border-b-2 border-amber-800/60';

  const svgBg = isParchment ? '#fffdf5' : '#140c06';
  // Slimmer border to maximize interior space for huge fonts
  const strokeOuter = isParchment ? '#78350f' : '#d97706';
  const strokeInner = isParchment ? '#92400e' : '#b45309';
  const fillKendra = isParchment ? '#fef3c7' : '#28170a';
  const fillKendraOpacity = isParchment ? '0.7' : '0.5';
  const fillSecondary = isParchment ? '#fef9c3' : '#221308';
  const fillSecondaryOpacity = isParchment ? '0.4' : '0.3';

  const rashiNumFill = isParchment ? '#991b1b' : '#fde047';

  // Dynamic Rashi Number Font Size based on Accessibility Font Scale
  const rashiFontSize = fontScale === 'ultra-vision' ? 21 : fontScale === 'extra-large' ? 19 : 17;
  const lagnaRashiFontSize = fontScale === 'ultra-vision' ? 22 : fontScale === 'extra-large' ? 20 : 18;

  // SVG coordinate dimensions
  const width = 440;
  const height = 440;

  return (
    <div className={`flex flex-col items-center ${containerBg} w-full`}>
      {title && (
        <div className={`mb-3 text-center font-serif font-bold text-base sm:text-lg pb-1.5 w-full ${titleTextClass}`}>
          <div>{title}</div>
          {subtitle && <p className="text-xs text-amber-800 font-sans font-normal mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="relative w-full max-w-[480px] aspect-square">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none filter drop-shadow-md"
        >
          {/* Background */}
          <rect x="2" y="2" width="436" height="436" fill={svgBg} stroke={strokeOuter} strokeWidth="2.5" rx="10" />

          {/* Outer Border Diagonal Lines (Thinner for spacious interior) */}
          <line x1="2" y1="2" x2="438" y2="438" stroke={strokeInner} strokeWidth="1.2" />
          <line x1="438" y1="2" x2="2" y2="438" stroke={strokeInner} strokeWidth="1.2" />

          {/* Inner Diamond Lines */}
          <polygon
            points="220,2 438,220 220,438 2,220"
            fill="none"
            stroke={strokeOuter}
            strokeWidth="1.8"
          />

          {/* House 1 (Top Center Diamond - Lagna) */}
          <polygon points="220,2 330,110 220,220 110,110" fill={fillKendra} fillOpacity={fillKendraOpacity} stroke={strokeInner} strokeWidth="1.0" />
          {/* House 2 (Top Left Triangle) */}
          <polygon points="2,2 220,2 110,110" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 3 (Upper Left Triangle) */}
          <polygon points="2,2 110,110 2,220" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 4 (Middle Left Diamond) */}
          <polygon points="2,220 110,110 220,220 110,330" fill={fillSecondary} fillOpacity={fillSecondaryOpacity} stroke={strokeInner} strokeWidth="1.0" />
          {/* House 5 (Lower Left Triangle) */}
          <polygon points="2,220 110,330 2,438" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 6 (Bottom Left Triangle) */}
          <polygon points="2,438 110,330 220,438" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 7 (Bottom Center Diamond) */}
          <polygon points="220,220 330,330 220,438 110,330" fill={fillKendra} fillOpacity={fillKendraOpacity} stroke={strokeInner} strokeWidth="1.0" />
          {/* House 8 (Bottom Right Triangle) */}
          <polygon points="220,438 330,330 438,438" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 9 (Lower Right Triangle) */}
          <polygon points="438,220 330,330 438,438" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 10 (Middle Right Diamond) */}
          <polygon points="220,220 330,110 438,220 330,330" fill={fillSecondary} fillOpacity={fillSecondaryOpacity} stroke={strokeInner} strokeWidth="1.0" />
          {/* House 11 (Upper Right Triangle) */}
          <polygon points="438,2 330,110 438,220" fill="none" stroke={strokeInner} strokeWidth="1.0" />
          {/* House 12 (Top Right Triangle) */}
          <polygon points="220,2 330,110 438,2" fill="none" stroke={strokeInner} strokeWidth="1.0" />

          {/* Rashi Numbers & Planet Placements for 12 Houses */}

          {/* House 1 (Top Center Diamond - Lagna) */}
          <g transform="translate(220, 110)">
            <text x="0" y="-74" fill={rashiNumFill} fontSize={lagnaRashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(1))} (लग्न)
            </text>
            <HousePlanetsText houseNum={1} items={getHousePlanetItems(1)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 2 (Top Left Triangle) */}
          <g transform="translate(110, 42)">
            <text x="0" y="-20" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(2))}
            </text>
            <HousePlanetsText houseNum={2} items={getHousePlanetItems(2)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 3 (Upper Left Triangle) */}
          <g transform="translate(42, 110)">
            <text x="-24" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(3))}
            </text>
            <HousePlanetsText houseNum={3} items={getHousePlanetItems(3)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 4 (Middle Left Diamond) */}
          <g transform="translate(110, 220)">
            <text x="-74" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(4))}
            </text>
            <HousePlanetsText houseNum={4} items={getHousePlanetItems(4)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 5 (Lower Left Triangle) */}
          <g transform="translate(42, 330)">
            <text x="-24" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(5))}
            </text>
            <HousePlanetsText houseNum={5} items={getHousePlanetItems(5)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 6 (Bottom Left Triangle) */}
          <g transform="translate(110, 398)">
            <text x="0" y="24" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(6))}
            </text>
            <HousePlanetsText houseNum={6} items={getHousePlanetItems(6)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 7 (Bottom Center Diamond) */}
          <g transform="translate(220, 330)">
            <text x="0" y="74" fill={rashiNumFill} fontSize={lagnaRashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(7))}
            </text>
            <HousePlanetsText houseNum={7} items={getHousePlanetItems(7)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 8 (Bottom Right Triangle) */}
          <g transform="translate(330, 398)">
            <text x="0" y="24" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(8))}
            </text>
            <HousePlanetsText houseNum={8} items={getHousePlanetItems(8)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 9 (Lower Right Triangle) */}
          <g transform="translate(398, 330)">
            <text x="24" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(9))}
            </text>
            <HousePlanetsText houseNum={9} items={getHousePlanetItems(9)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 10 (Middle Right Diamond) */}
          <g transform="translate(330, 220)">
            <text x="74" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(10))}
            </text>
            <HousePlanetsText houseNum={10} items={getHousePlanetItems(10)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 11 (Upper Right Triangle) */}
          <g transform="translate(398, 110)">
            <text x="24" y="0" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(11))}
            </text>
            <HousePlanetsText houseNum={11} items={getHousePlanetItems(11)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>

          {/* House 12 (Top Right Triangle) */}
          <g transform="translate(330, 42)">
            <text x="0" y="-20" fill={rashiNumFill} fontSize={rashiFontSize} fontWeight="900" textAnchor="middle" className="font-serif">
              {toNepaliDigits(getSignNumForHouse(12))}
            </text>
            <HousePlanetsText houseNum={12} items={getHousePlanetItems(12)} isParchment={isParchment} activePlanetKeys={activePlanetKeys} fontScale={fontScale} singleLetterMode={chartSingleLetterOnly} />
          </g>
        </svg>
      </div>

      {/* Active Dasha Planet Highlight Legend */}
      {activeDashaTitle && (
        <div
          className={`mt-3 px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-2 font-medium border max-w-full text-center shadow-md ${
            isParchment
              ? 'bg-red-50 text-red-950 border-red-300'
              : 'bg-red-950/90 text-red-100 border-red-500/80 ring-1 ring-red-500/40'
          }`}
        >
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10.5px] shadow-sm">
            ⚡ {lang === 'ne' ? 'हालको दशा' : 'Active Dasha'}
          </span>
          <span className="font-semibold text-xs sm:text-sm">
            <strong className={isParchment ? 'text-red-700 font-bold' : 'text-yellow-300 font-bold'}>
              {activeDashaTitle}
            </strong>{' '}
            <span className="text-[11px] opacity-90 font-normal">
              ({lang === 'ne' ? 'चार्टमा रातो ⚡ हाइलाइट गरिएको' : 'Highlighted in Red ⚡'})
            </span>
          </span>
        </div>
      )}

      {/* Chart Status Symbols Legend */}
      <div
        className={`mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium ${
          isParchment ? 'text-amber-900/80' : 'text-amber-300/80'
        }`}
      >
        <span>* <strong>(व)</strong> = {lang === 'ne' ? 'वक्री' : 'Retrograde'}</span>
        <span>• <strong>(अ)</strong> = {lang === 'ne' ? 'अस्त' : 'Combust'}</span>
        <span>• <strong>[लग्न]</strong> = {lang === 'ne' ? 'लग्न भाव' : 'Ascendant'}</span>
        <span>• <strong>⚡</strong> = {lang === 'ne' ? 'सक्रिय दशा ग्रह' : 'Active Dasha'}</span>
      </div>
    </div>
  );
};

// Helper SVG component for rendering items in a house with anti-collision layout & extra large font support
const HousePlanetsText: React.FC<{
  houseNum: number;
  items: (string | DetailedPlanetPosition)[];
  isParchment: boolean;
  activePlanetKeys?: string[];
  fontScale?: string;
  singleLetterMode?: boolean;
}> = ({ houseNum, items, isParchment, activePlanetKeys = [], fontScale = 'large', singleLetterMode = true }) => {
  if (!items || items.length === 0) return null;

  const total = items.length;

  // Ultra Large / Scaled font sizes for low-vision accessibility (-7.0 power)
  const isUltra = fontScale === 'ultra-vision';
  const isExtra = fontScale === 'extra-large';

  // Base font sizes for planet names
  let fontSize = total === 1 ? 18.5 : total === 2 ? 17 : total === 3 ? 15.5 : total === 4 ? 14.5 : 13.5;
  let degFontSize = total === 1 ? 13.5 : total === 2 ? 12.5 : total === 3 ? 11.5 : total === 4 ? 10.5 : 10;

  if (isUltra) {
    fontSize = total === 1 ? 23 : total === 2 ? 20.5 : total === 3 ? 18 : total === 4 ? 16.5 : 15;
    degFontSize = total === 1 ? 15 : total === 2 ? 14 : total === 3 ? 13 : total === 4 ? 12 : 11;
  } else if (isExtra) {
    fontSize = total === 1 ? 20.5 : total === 2 ? 18.5 : total === 3 ? 16.5 : total === 4 ? 15.5 : 14;
    degFontSize = total === 1 ? 14 : total === 2 ? 13 : total === 3 ? 12 : total === 4 ? 11 : 10.5;
  }

  // Calculate distinct (x, y) coordinates for each planet to eliminate overlap even at huge scale
  const getCoordinates = (idx: number): { x: number; y: number } => {
    // 1 Planet: center in house optical gravity
    if (total === 1) {
      if (houseNum === 2 || houseNum === 12) return { x: 0, y: 15 };
      if (houseNum === 6 || houseNum === 8) return { x: 0, y: -15 };
      if (houseNum === 3 || houseNum === 5) return { x: 18, y: 0 };
      if (houseNum === 9 || houseNum === 11) return { x: -18, y: 0 };
      return { x: 0, y: 5 };
    }

    // 2 Planets: clean vertical or horizontal pair with wide clearance
    if (total === 2) {
      if (houseNum === 2 || houseNum === 12) {
        return idx === 0 ? { x: -30, y: 15 } : { x: 30, y: 15 };
      }
      if (houseNum === 6 || houseNum === 8) {
        return idx === 0 ? { x: -30, y: -15 } : { x: 30, y: -15 };
      }
      if (houseNum === 3 || houseNum === 5) {
        return idx === 0 ? { x: 15, y: -20 } : { x: 15, y: 20 };
      }
      if (houseNum === 9 || houseNum === 11) {
        return idx === 0 ? { x: -15, y: -20 } : { x: -15, y: 20 };
      }
      // Diamonds (1, 4, 7, 10)
      return idx === 0 ? { x: 0, y: -18 } : { x: 0, y: 20 };
    }

    // 3 Planets: triangular or vertical staggered placement
    if (total === 3) {
      if (houseNum === 2 || houseNum === 12) {
        if (idx === 0) return { x: -32, y: 8 };
        if (idx === 1) return { x: 32, y: 8 };
        return { x: 0, y: 30 };
      }
      if (houseNum === 6 || houseNum === 8) {
        if (idx === 0) return { x: 0, y: -30 };
        if (idx === 1) return { x: -32, y: -8 };
        return { x: 32, y: -8 };
      }
      if (houseNum === 3 || houseNum === 5) {
        if (idx === 0) return { x: 10, y: -24 };
        if (idx === 1) return { x: 10, y: 24 };
        return { x: 34, y: 0 };
      }
      if (houseNum === 9 || houseNum === 11) {
        if (idx === 0) return { x: -34, y: 0 };
        if (idx === 1) return { x: -10, y: -24 };
        return { x: -10, y: 24 };
      }
      // Diamonds (1, 4, 7, 10)
      if (idx === 0) return { x: 0, y: -26 };
      if (idx === 1) return { x: 0, y: 2 };
      return { x: 0, y: 30 };
    }

    // 4 Planets: 2x2 symmetrical grid
    if (total === 4) {
      const xOffset = 32;
      const yOffset = 18;
      if (idx === 0) return { x: -xOffset, y: -yOffset };
      if (idx === 1) return { x: xOffset, y: -yOffset };
      if (idx === 2) return { x: -xOffset, y: yOffset };
      return { x: xOffset, y: yOffset };
    }

    // 5 or more Planets: 2 balanced columns
    const col = idx % 2 === 0 ? -34 : 34;
    const row = Math.floor(idx / 2);
    const totalRows = Math.ceil(total / 2);
    const rowY = (row - (totalRows - 1) / 2) * 22;
    return { x: col, y: rowY };
  };

  // 1-Letter abbreviations as specifically requested: सू, चं, मं, बु, गु, शु, श, रा, के, लग्न
  const singleLettersMap: Record<string, string> = {
    sun: 'सू',
    moon: 'चं',
    mars: 'मं',
    mercury: 'बु',
    jupiter: 'गु',
    venus: 'शु',
    saturn: 'श',
    rahu: 'रा',
    ketu: 'के',
    lagna: 'लग्न'
  };

  return (
    <g transform="translate(0, 0)">
      {items.map((item, idx) => {
        const { x, y } = getCoordinates(idx);
        let label = '';
        let degText = '';
        let isLagna = false;
        let isRetro = false;
        let isCombust = false;

        if (typeof item === 'string') {
          label = item;
          if (item.includes('लग्न') || item === 'ल') isLagna = true;
          if (item.includes('(R)') || item.includes('(व)') || item.includes('(ब)')) isRetro = true;
          if (item.includes('(A)') || item.includes('(अ)')) isCombust = true;
        } else {
          isLagna = item.id === 'lagna';
          isRetro = !!item.isRetrograde && !isLagna;
          isCombust = !!item.isCombust && !isLagna && item.id !== 'sun';

          if (isLagna) {
            label = total <= 2 ? 'लग्न' : 'ल';
          } else {
            if (singleLetterMode) {
              label = singleLettersMap[item.id] || item.nameNe.substring(0, 2);
            } else {
              if (total <= 2) {
                const fullNames: Record<string, string> = {
                  sun: 'सूर्य',
                  moon: 'चन्द्र',
                  mars: 'मंगल',
                  mercury: 'बुध',
                  jupiter: 'गुरु',
                  venus: 'शुक्र',
                  saturn: 'शनि',
                  rahu: 'राहु',
                  ketu: 'केतु'
                };
                label = fullNames[item.id] || item.nameNe.substring(0, 2);
              } else {
                label = item.nameNe.substring(0, 2);
              }
            }
          }

          if (item.degreeInSign !== undefined && !isLagna) {
            degText = `${toNepaliDigits(Math.floor(item.degreeInSign))}°`;
          }
        }

        const isPresentGraha = !isLagna && isPlanetActive(item, activePlanetKeys);

        // High visibility colors
        const textColor = isPresentGraha
          ? '#ffffff'
          : isParchment
          ? isLagna
            ? '#991b1b'
            : '#381302'
          : isLagna
          ? '#fbbf24'
          : '#fef3c7';

        // Badge dimensions
        const pillWidth = degText ? (isUltra ? 74 : 66) : isUltra ? 54 : 48;
        const pillHeight = isUltra ? 26 : 22;

        return (
          <g key={idx} transform={`translate(${x}, ${y})`}>
            {/* Highlight Background Pill for Active Dasha Graha */}
            {isPresentGraha && (
              <rect
                x={-pillWidth / 2}
                y={-pillHeight / 2}
                width={pillWidth}
                height={pillHeight}
                rx="8"
                fill="#dc2626"
                stroke={isParchment ? '#991b1b' : '#fde047'}
                strokeWidth={isParchment ? '1.8' : '2.4'}
                filter={
                  isParchment
                    ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))'
                    : 'drop-shadow(0px 0px 8px rgba(253,224,71,0.9))'
                }
              />
            )}

            <text
              y="0"
              fill={textColor}
              fontSize={fontSize}
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif select-none"
              style={{
                filter: isParchment
                  ? 'none'
                  : isPresentGraha
                  ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
                  : 'drop-shadow(0px 1px 3px rgba(0,0,0,0.9))',
              }}
            >
              {isPresentGraha && (
                <tspan fill={isParchment ? '#fef08a' : '#fde047'} fontWeight="900" dx="-1">
                  ⚡
                </tspan>
              )}
              {label}
              {isRetro && (
                <tspan
                  fontSize={fontSize * 0.75}
                  fontWeight="900"
                  fill={isPresentGraha ? '#fef08a' : isParchment ? '#dc2626' : '#f87171'}
                  dx="1"
                >
                  (व)
                </tspan>
              )}
              {isCombust && (
                <tspan
                  fontSize={fontSize * 0.75}
                  fontWeight="900"
                  fill={isPresentGraha ? '#fde047' : isParchment ? '#ea580c' : '#fb923c'}
                  dx="1"
                >
                  (अ)
                </tspan>
              )}
              {degText && (
                <tspan
                  fontSize={degFontSize}
                  fontWeight="900"
                  fill={isPresentGraha ? '#fef08a' : isParchment ? '#92400e' : '#fbbf24'}
                  dx="2"
                >
                  {degText}
                </tspan>
              )}
            </text>
          </g>
        );
      })}
    </g>
  );
};



