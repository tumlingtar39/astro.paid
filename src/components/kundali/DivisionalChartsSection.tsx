import React, { useState } from 'react';
import { DivisionalChartData, DetailedPlanetPosition, Language } from '../../types';
import { KundaliChartNorth } from './KundaliChartNorth';
import { KundaliChartSouth } from './KundaliChartSouth';
import { Grid, Layers, Sparkles } from 'lucide-react';

interface DivisionalChartsSectionProps {
  divisionalCharts: DivisionalChartData[];
  planetPositions: DetailedPlanetPosition[];
  lagnaSignIndex: number;
  lang: Language;
  activePlanetKeys?: string[];
  activeDashaTitle?: string;
}

export const DivisionalChartsSection: React.FC<DivisionalChartsSectionProps> = ({
  divisionalCharts,
  planetPositions,
  lagnaSignIndex,
  lang,
  activePlanetKeys = [],
  activeDashaTitle
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('D1');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const selectedChart =
    divisionalCharts.find((c) => c.code === selectedCode) || divisionalCharts[0];

  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-800/50 gap-3">
        <div>
          <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>
              {lang === 'ne'
                ? 'वर्ग कुण्डली समूह (Divisional Varga Charts D1 to D60)'
                : 'Divisional Varga Charts (D1 to D60)'}
            </span>
          </h3>
          <p className="text-xs text-amber-300/80">
            {lang === 'ne'
              ? 'D1 (राशि), D9 (नवांश), D10 (दशमांश) लगायत अन्य १६ वर्ग कुण्डली गणना'
              : 'Precision divisional subdivisions computed from sidereal longitudes.'}
          </p>
        </div>

        {/* Chart Style Toggle */}
        <div className="flex items-center gap-1.5 bg-amber-950 p-1 rounded-xl border border-amber-800">
          <button
            type="button"
            onClick={() => setChartStyle('north')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              chartStyle === 'north'
                ? 'bg-amber-600 text-amber-950 font-bold shadow'
                : 'text-amber-300/80 hover:text-amber-100'
            }`}
          >
            {lang === 'ne' ? 'उत्तर भारतीय (North)' : 'North Indian'}
          </button>
          <button
            type="button"
            onClick={() => setChartStyle('south')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              chartStyle === 'south'
                ? 'bg-amber-600 text-amber-950 font-bold shadow'
                : 'text-amber-300/80 hover:text-amber-100'
            }`}
          >
            {lang === 'ne' ? 'दक्षिण भारतीय (South)' : 'South Indian'}
          </button>
        </div>
      </div>

      {/* Divisional Chart Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {divisionalCharts.map((chart) => (
          <button
            key={chart.code}
            type="button"
            onClick={() => setSelectedCode(chart.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all border ${
              selectedCode === chart.code
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 border-amber-300 shadow-lg scale-105'
                : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
            }`}
          >
            {chart.code} - {lang === 'ne' ? chart.nameNe.split(' - ')[1] || chart.nameNe : chart.nameEn}
          </button>
        ))}
      </div>

      {/* Selected Divisional Chart Info & Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-3 p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl">
          <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
            <span className="font-serif font-bold text-amber-200 text-base">
              {lang === 'ne' ? selectedChart.nameNe : selectedChart.nameEn}
            </span>
            <span className="bg-amber-600/30 text-amber-300 font-mono text-xs px-2 py-0.5 rounded border border-amber-500/50">
              {selectedChart.code}
            </span>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
            {lang === 'ne' ? selectedChart.descriptionNe : selectedChart.descriptionEn}
          </p>

          <div className="pt-2 text-xs space-y-1.5 border-t border-amber-800/40">
            <span className="font-semibold text-amber-400 block">
              {lang === 'ne' ? 'भावगत ग्रह स्थिति:' : 'House Placements:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] max-h-48 overflow-y-auto pr-1">
              {selectedChart.houses.map((h) => (
                <div
                  key={h.houseNum}
                  className="bg-amber-950/80 p-1.5 rounded border border-amber-800/40 text-amber-200"
                >
                  <span className="font-bold text-amber-400">H{h.houseNum}:</span>{' '}
                  {h.signNe} - {h.planets.join(', ') || 'खाली'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Chart Graphic */}
        <div className="md:col-span-7 flex justify-center">
          {chartStyle === 'north' ? (
            <KundaliChartNorth
              houses={selectedChart.houses.map((h) => ({
                house: h.houseNum,
                sign: h.signNe,
                planets: h.planets
              }))}
              planetPositions={planetPositions}
              lagnaSignIndex={selectedChart.houses[0]?.signIndex || 0}
              lang={lang}
              title={selectedChart.nameNe}
              activePlanetKeys={activePlanetKeys}
              activeDashaTitle={activeDashaTitle}
            />
          ) : (
            <KundaliChartSouth
              planetPositions={planetPositions}
              lang={lang}
              title={selectedChart.nameNe}
              activePlanetKeys={activePlanetKeys}
              activeDashaTitle={activeDashaTitle}
            />
          )}
        </div>
      </div>
    </div>
  );
};
