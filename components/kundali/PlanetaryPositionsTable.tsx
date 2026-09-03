import React from 'react';
import { DetailedPlanetPosition, Language } from '../../types';
import { Compass, RotateCw, Sun, Sparkles, CheckCircle2, Flame } from 'lucide-react';

interface PlanetaryPositionsTableProps {
  planetPositions: DetailedPlanetPosition[];
  lang: Language;
}

export const PlanetaryPositionsTable: React.FC<PlanetaryPositionsTableProps> = ({
  planetPositions,
  lang
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-800/50">
        <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span>
            {lang === 'ne'
              ? 'ग्रह स्थिति, गति (मार्गी/बक्री) र दृष्टि (उदय/अस्त) तालिका'
              : 'Planetary Positions, Motion (Direct/Retrograde) & Visibility (Risen/Combust) Table'}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400/80 bg-amber-900/40 px-2.5 py-1 rounded-full border border-amber-700/50">
            {lang === 'ne' ? 'लाहिडी अयनंश (Lahiri Ayanamsa Sidereal)' : 'Lahiri Ayanamsa Sidereal'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-amber-100 border-collapse">
          <thead>
            <tr className="bg-amber-900/60 text-amber-300 font-serif border-b border-amber-700">
              <th className="py-2.5 px-3">{lang === 'ne' ? 'ग्रह (Graha)' : 'Graha'}</th>
              <th className="py-2.5 px-3">{lang === 'ne' ? 'राशी (Sign)' : 'Sign'}</th>
              <th className="py-2.5 px-3">{lang === 'ne' ? 'डिग्री (Degree)' : 'Degree'}</th>
              <th className="py-2.5 px-3">{lang === 'ne' ? 'भाव (House)' : 'House'}</th>
              <th className="py-2.5 px-3">{lang === 'ne' ? 'नक्षत्र (Pada)' : 'Nakshatra (Pada)'}</th>
              <th className="py-2.5 px-3 text-center">{lang === 'ne' ? 'गति (मार्गी / बक्री)' : 'Motion (Direct/Retro)'}</th>
              <th className="py-2.5 px-3 text-center">{lang === 'ne' ? 'अवस्था (उदय / अस्त)' : 'State (Risen/Combust)'}</th>
              <th className="py-2.5 px-3">{lang === 'ne' ? 'दीप्ति / अवस्था' : 'Dignity & Awastha'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-900/40">
            {planetPositions.map((p) => {
              const isLagna = p.id === 'lagna';
              const isSun = p.id === 'sun';
              const isRahuKetu = p.id === 'rahu' || p.id === 'ketu';

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-amber-800/30 transition-colors ${
                    isLagna ? 'bg-amber-900/30 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-1.5 font-medium">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isLagna
                          ? 'bg-amber-400'
                          : isSun || p.id === 'moon'
                          ? 'bg-yellow-300'
                          : 'bg-amber-600'
                      }`}
                    />
                    <span className="whitespace-nowrap">{lang === 'ne' ? p.nameNe : p.nameEn}</span>
                  </td>

                  <td className="py-2.5 px-3 text-amber-200 whitespace-nowrap">
                    {lang === 'ne' ? p.rashiNe : p.rashiEn}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-amber-300 whitespace-nowrap">
                    {p.degreeStr}
                  </td>

                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="bg-amber-900/60 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-800">
                      H{p.houseNum}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-amber-200 whitespace-nowrap">
                    <span>{lang === 'ne' ? p.nakshatraNe : p.nakshatraEn}</span>
                    <span className="text-xs text-amber-400 font-mono ml-1">({p.pad})</span>
                  </td>

                  {/* Motion Column (मार्गी / बक्री) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {isLagna ? (
                      <span className="text-amber-400/60 text-xs">—</span>
                    ) : p.isRetrograde ? (
                      <span className="inline-flex items-center gap-1 text-rose-300 font-bold bg-rose-950/90 px-2 py-0.5 rounded-md border border-rose-700/80 text-xs shadow-sm">
                        <RotateCw className="w-3 h-3 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
                        {lang === 'ne' ? 'बक्री (व)' : 'Retrograde (R)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-medium bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/60 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {lang === 'ne' ? 'मार्गी (मा)' : 'Direct (D)'}
                      </span>
                    )}
                  </td>

                  {/* Visibility / Combustion Column (उदय / अस्त) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {isLagna ? (
                      <span className="text-amber-400/60 text-xs">—</span>
                    ) : isSun ? (
                      <span className="inline-flex items-center gap-1 text-amber-200 font-semibold bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-600/70 text-xs">
                        <Sun className="w-3 h-3 text-amber-300" />
                        {lang === 'ne' ? 'स्व-प्रकाश (उदय)' : 'Self-Luminous'}
                      </span>
                    ) : isRahuKetu ? (
                      <span className="inline-flex items-center gap-1 text-purple-200 font-medium bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-700/60 text-xs">
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        {lang === 'ne' ? 'छाया ग्रह (उदय)' : 'Shadow (Udaya)'}
                      </span>
                    ) : p.isCombust ? (
                      <span className="inline-flex items-center gap-1 text-orange-200 font-bold bg-orange-950/90 px-2 py-0.5 rounded-md border border-orange-600 text-xs shadow-sm ring-1 ring-orange-500/50">
                        <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                        {lang === 'ne' ? 'अस्त (Combust)' : 'Combust (Asta)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-teal-200 font-medium bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-700/60 text-xs">
                        <Sun className="w-3 h-3 text-teal-400" />
                        {lang === 'ne' ? 'उदय (Risen)' : 'Risen (Udaya)'}
                      </span>
                    )}
                  </td>

                  {/* Dignity & Baladi Awastha */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.dignity === 'उच्च'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : p.dignity === 'नीच'
                            ? 'bg-rose-950 text-rose-300 border border-rose-600'
                            : p.dignity === 'स्वगृही'
                            ? 'bg-amber-900 text-amber-200 border border-amber-600'
                            : 'bg-amber-950 text-amber-300/80 border border-amber-800/40'
                        }`}
                      >
                        {lang === 'ne' ? p.dignity : p.dignityEn}
                      </span>
                      {p.awastha && (
                        <span className="text-[10px] text-amber-300/70 bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-700/40">
                          {p.awastha}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vedic Astrology Technical Legend */}
      <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-800/50 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200/90">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span><strong>मार्गी (Direct):</strong> {lang === 'ne' ? 'सामान्य अगाडि बढ्ने गति' : 'Normal forward motion'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span><strong>बक्री (Retrograde):</strong> {lang === 'ne' ? 'पछाडि फर्केजस्तो देखिने गति (व)' : 'Apparent backward motion (R)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span><strong>उदय (Risen):</strong> {lang === 'ne' ? 'सूर्यको तेज बाहिर स्पष्ट' : 'Visible in sky'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span><strong>अस्त (Combust):</strong> {lang === 'ne' ? 'सूर्यको नजिक पुगी किरणले छोपिएको' : 'Combust by Sun'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

