import React from 'react';
import { HouseDetail, Language } from '../../types';
import { Home, Eye, Sparkles } from 'lucide-react';

interface HouseDetailsSectionProps {
  houseDetails: HouseDetail[];
  lang: Language;
}

export const HouseDetailsSection: React.FC<HouseDetailsSectionProps> = ({
  houseDetails,
  lang
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
        <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
          <Home className="w-5 h-5 text-amber-400" />
          <span>
            {lang === 'ne'
              ? 'द्वादश भाव विवरण (12 House & Aspect Analysis)'
              : '12 House & Aspect Analysis'}
          </span>
        </h3>
        <span className="text-xs text-amber-400/80">
          {lang === 'ne' ? '१ देखि १२ भाव, राशी, भावेश र दृष्टि' : '1st to 12th House Lords & Aspects'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {houseDetails.map((hd) => (
          <div
            key={hd.houseNum}
            className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl hover:border-amber-600 transition-colors space-y-2.5 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
              <span className="font-serif font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-amber-950 flex items-center justify-center text-xs font-bold">
                  {hd.houseNum}
                </span>
                <span>
                  {lang === 'ne'
                    ? (hd.houseNum === 1 ? 'प्रथम भाव (लग्न)' : `${hd.houseNum} औँ भाव`)
                    : (hd.houseNum === 1
                        ? '1st House (Lagna)'
                        : hd.houseNum === 2
                        ? '2nd House'
                        : hd.houseNum === 3
                        ? '3rd House'
                        : `${hd.houseNum}th House`)}
                </span>
              </span>
              <span className="text-xs text-amber-400 font-medium">
                {lang === 'ne' ? hd.signNe : hd.signEn} (स्वा: {lang === 'ne' ? hd.signLordNe : hd.signLordEn})
              </span>
            </div>

            {/* Significance */}
            <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
              {lang === 'ne' ? hd.significanceNe : hd.significanceEn}
            </p>

            {/* Occupants */}
            <div className="pt-1 text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-amber-400 font-semibold">
                  {lang === 'ne' ? 'स्थित ग्रह (Occupants):' : 'Occupants:'}
                </span>
                {hd.planets.length > 0 ? (
                  hd.planets.map((p) => (
                    <span
                      key={p.id}
                      className="bg-amber-800/60 text-amber-100 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-600/50"
                    >
                      {lang === 'ne' ? p.nameNe : p.nameEn} ({Math.floor(p.degreeInSign)}°)
                    </span>
                  ))
                ) : (
                  <span className="text-amber-300/80 italic text-[11px]">
                    {lang === 'ne' ? 'रिक्त भाव (Empty)' : 'Empty'}
                  </span>
                )}
              </div>

              {/* Aspects */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'ne' ? 'दृष्टि (Aspects):' : 'Aspects:'}</span>
                </span>
                {hd.aspectingPlanets.length > 0 ? (
                  hd.aspectingPlanets.map((p) => (
                    <span
                      key={p.id}
                      className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded text-[11px] border border-amber-700/60"
                    >
                      {lang === 'ne' ? p.nameNe : p.nameEn}
                    </span>
                  ))
                ) : (
                  <span className="text-amber-300/80 italic text-[11px]">
                    {lang === 'ne' ? 'दृष्टि छैन' : 'None'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
