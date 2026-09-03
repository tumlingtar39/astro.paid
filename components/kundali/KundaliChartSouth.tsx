import React from 'react';
import { DetailedPlanetPosition, Language } from '../../types';
import { isPlanetActive, toNepaliDigits } from './KundaliChartNorth';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';

interface KundaliChartSouthProps {
  planetPositions: DetailedPlanetPosition[];
  lang: Language;
  title?: string;
  activePlanetKeys?: string[];
  activeDashaTitle?: string;
}

export const KundaliChartSouth: React.FC<KundaliChartSouthProps> = ({
  planetPositions,
  lang,
  title,
  activePlanetKeys = [],
  activeDashaTitle
}) => {
  const { fontScale, chartSingleLetterOnly } = useAccessibility();
  const { isLight } = useTheme();

  // South Indian Fixed Grid Order (0-indexed rashi):
  // Top Row: 11 (Pisces), 0 (Aries), 1 (Taurus), 2 (Gemini)
  // Right Col: 3 (Cancer), 4 (Leo)
  // Bottom Row: 5 (Virgo), 6 (Libra), 7 (Scorpio), 8 (Sagittarius)
  // Left Col: 9 (Capricorn), 10 (Aquarius)

  const fixedGrid = [
    [11, 0, 1, 2],
    [10, -1, -1, 3],
    [9, -1, -1, 4],
    [8, 7, 6, 5]
  ];

  const getPlanetsInSign = (rashiIdx: number) => {
    return planetPositions.filter((p) => p.rashiIndex === rashiIdx);
  };

  const rashiLabelsNe = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
  const rashiLabelsEn = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sag', 'Cap', 'Aqua', 'Pisces'];

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

  const isUltra = fontScale === 'ultra-vision';
  const isExtra = fontScale === 'extra-large';

  return (
    <div className={`flex flex-col items-center p-4 sm:p-5 rounded-2xl border shadow-2xl w-full ${
      isLight
        ? 'bg-[#FFFDF5] border-amber-800/40 text-amber-950 shadow-md'
        : 'bg-gradient-to-b from-amber-950/85 to-black/95 border-amber-700/60 text-amber-100'
    }`}>
      {title && (
        <div className={`mb-3 text-center font-serif font-bold text-base sm:text-lg border-b pb-1.5 w-full ${
          isLight ? 'text-amber-950 border-amber-800/30' : 'text-amber-200 border-amber-800/50'
        }`}>
          {title} (दक्षिण भारतीय चक्र)
        </div>
      )}

      <div className={`w-full max-w-[480px] aspect-square grid grid-cols-4 grid-rows-4 border-2 rounded-2xl overflow-hidden shadow-inner ${
        isLight ? 'border-amber-700 bg-[#fffdf9] text-amber-950' : 'border-amber-600 bg-[#1c1108] text-amber-100'
      }`}>
        {fixedGrid.map((row, rIdx) =>
          row.map((rashiIdx, cIdx) => {
            // Center 2x2 area
            if (rashiIdx === -1) {
              if (rIdx === 1 && cIdx === 1) {
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-3 text-center ${
                      isLight ? 'bg-amber-100/70 border-amber-700/60' : 'bg-[#2d1a0b]/90 border-amber-800'
                    }`}
                  >
                    <span className={`font-serif font-bold text-lg sm:text-xl tracking-wide ${
                      isLight ? 'text-amber-950' : 'text-amber-300'
                    }`}>
                      दक्षिण भारतीय चक्र
                    </span>
                    <span className={`text-xs font-sans font-semibold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>South Indian Vedic Wheel</span>
                    <span className={`text-xs mt-1 font-serif ${isLight ? 'text-amber-700' : 'text-amber-500'}`}>
                      (राशी स्थिर, ग्रह भ्रमण)
                    </span>
                  </div>
                );
              }
              return null; // skipped because of col-span-2 row-span-2
            }

            const planetsInSign = getPlanetsInSign(rashiIdx);
            const isLagnaHere = planetsInSign.some((p) => p.id === 'lagna');

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`p-2 border flex flex-col justify-between text-xs relative min-h-0 ${
                  isLight ? 'border-amber-700/30' : 'border-amber-800/80'
                } ${
                  isLagnaHere 
                    ? isLight ? 'bg-amber-200/50 ring-1 ring-inset ring-amber-600' : 'bg-amber-900/40 ring-1 ring-inset ring-amber-500/60' 
                    : 'bg-transparent'
                }`}
              >
                {/* Rashi Header Label with large bold numerals */}
                <div className={`flex items-center justify-between text-xs sm:text-[13px] font-bold border-b pb-0.5 mb-1 font-serif ${
                  isLight ? 'text-amber-900 border-amber-800/20' : 'text-amber-400 border-amber-900/60'
                }`}>
                  <span>{lang === 'ne' ? rashiLabelsNe[rashiIdx] : rashiLabelsEn[rashiIdx]}</span>
                  <span className={`font-bold text-sm font-serif ${isLight ? 'text-red-700' : 'text-amber-300'}`}>({toNepaliDigits(rashiIdx + 1)})</span>
                </div>

                {/* Planets List */}
                <div className="flex-1 flex flex-wrap content-start gap-1.5 py-0.5 overflow-y-auto">
                  {planetsInSign.map((p) => {
                    const isLagna = p.id === 'lagna';
                    const isPresentGraha = !isLagna && isPlanetActive(p, activePlanetKeys);
                    const label = isLagna
                      ? 'लग्न'
                      : chartSingleLetterOnly
                      ? singleLettersMap[p.id] || p.nameNe.substring(0, 2)
                      : planetsInSign.length <= 2
                      ? p.nameNe
                      : p.nameNe.substring(0, 2);

                    const badgeTextSize = isUltra
                      ? 'text-sm sm:text-base'
                      : isExtra
                      ? 'text-xs sm:text-[14.5px]'
                      : 'text-xs sm:text-[13.5px]';

                    return (
                      <span
                        key={p.id}
                        className={`px-2 py-0.5 rounded-md ${badgeTextSize} leading-tight font-black flex items-center gap-1 transition-transform shadow-xs ${
                          isLagna
                            ? 'bg-amber-500 text-amber-950 font-extrabold ring-1 ring-amber-300'
                            : isPresentGraha
                            ? 'bg-red-600 text-white font-extrabold shadow-md ring-2 ring-yellow-300 border border-yellow-200 animate-pulse'
                            : p.id === 'sun' || p.id === 'moon'
                            ? 'bg-amber-800/90 text-amber-100 border border-amber-600/60'
                            : 'bg-amber-950/90 text-amber-200 border border-amber-800/70'
                        }`}
                      >
                        {isPresentGraha && <span className="text-yellow-200 font-black">⚡</span>}
                        <span>{label}</span>
                        {p.isRetrograde && !isLagna && (
                          <span className="text-red-400 text-xs font-bold">(व)</span>
                        )}
                        {p.isCombust && !isLagna && p.id !== 'sun' && (
                          <span className="text-orange-400 text-xs font-bold">(अ)</span>
                        )}
                        {p.id !== 'lagna' && (
                          <span className="text-amber-300 font-mono text-xs font-bold">
                            {toNepaliDigits(Math.floor(p.degreeInSign))}°
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Dasha Planet Highlight Legend */}
      {activeDashaTitle && (
        <div className="mt-3 px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-2 font-medium border border-red-500/80 bg-red-950/90 text-red-100 ring-1 ring-red-500/40 shadow-md max-w-full text-center">
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10.5px] shadow-sm">
            ⚡ {lang === 'ne' ? 'हालको दशा' : 'Active Dasha'}
          </span>
          <span className="font-semibold text-xs sm:text-sm">
            <strong className="text-yellow-300 font-bold">{activeDashaTitle}</strong>{' '}
            <span className="text-[11px] opacity-90 font-normal">
              ({lang === 'ne' ? 'चार्टमा रातो ⚡ हाइलाइट गरिएको' : 'Highlighted in Red ⚡'})
            </span>
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-300/80">
        <span>* <strong>(व)</strong> = {lang === 'ne' ? 'वक्री' : 'Retrograde'}</span>
        <span>• <strong>(अ)</strong> = {lang === 'ne' ? 'अस्त' : 'Combust'}</span>
        <span>• <strong>[लग्न]</strong> = {lang === 'ne' ? 'लग्न भाव' : 'Ascendant'}</span>
        <span>• <strong>⚡</strong> = {lang === 'ne' ? 'हालको सक्रिय दशा ग्रह' : 'Active Dasha'}</span>
      </div>
    </div>
  );
};


