import React from 'react';
import { GrahaBalaItem, Language } from '../../types';
import { Activity } from 'lucide-react';

interface GrahaBalaSectionProps {
  grahaBala: GrahaBalaItem[];
  lang: Language;
}

export const GrahaBalaSection: React.FC<GrahaBalaSectionProps> = ({
  grahaBala,
  lang
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-amber-800/50">
        <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span>
            {lang === 'ne'
              ? 'ग्रह बल तथा क्षमता (Graha Bala & Planetary Strengths)'
              : 'Graha Bala & Planetary Strengths'}
          </span>
        </h3>
        <span className="text-xs text-amber-400/80">
          {lang === 'ne' ? 'षड्बल तथा उच्च-नीच अवस्थाको तुलनात्मक अङ्क' : 'Relative Strength Scoring'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {grahaBala.map((gb) => {
          const scorePercent = Math.min(Math.max((gb.totalScore / 10) * 100, 10), 100);

          return (
            <div
              key={gb.planetKey}
              className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-2.5 hover:border-amber-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-100 text-sm">
                  {lang === 'ne' ? gb.planetNe : gb.planetEn}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    gb.totalScore > 7
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : gb.totalScore > 4
                      ? 'bg-amber-900 text-amber-200 border border-amber-600'
                      : 'bg-amber-950 text-amber-300/80 border border-amber-800'
                  }`}
                >
                  {lang === 'ne' ? gb.gradeNe : gb.gradeEn}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-300/80">
                  <span>{lang === 'ne' ? 'कुल बल सूचकांक:' : 'Strength Rating:'}</span>
                  <span className="font-mono font-bold text-amber-200">
                    {gb.totalScore.toFixed(1)} / 10.0
                  </span>
                </div>
                <div className="w-full bg-amber-950 h-2 rounded-full overflow-hidden border border-amber-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scorePercent > 75
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                        : scorePercent > 50
                        ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                        : 'bg-amber-700'
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Breakdown detail */}
              <p className="text-[11px] text-amber-200/80 pt-1 leading-relaxed border-t border-amber-800/30">
                {lang === 'ne'
                  ? `उच्च/नीच: ${gb.dignityScore} | भाव बल: ${gb.houseScore} | गति: ${gb.motionScore}`
                  : `Dignity: ${gb.dignityScore} | House: ${gb.houseScore} | Motion: ${gb.motionScore}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

