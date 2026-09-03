import React from 'react';
import { YogaDetail, Language } from '../../types';
import { Sparkles, CheckCircle, HelpCircle } from 'lucide-react';

interface YogasSectionProps {
  yogas: YogaDetail[];
  lang: Language;
}

export const YogasSection: React.FC<YogasSectionProps> = ({ yogas, lang }) => {
  const presentYogas = yogas.filter((y) => y.isPresent);

  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-800/50 gap-2">
        <div>
          <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>
              {lang === 'ne'
                ? 'ज्योतिषीय योग तथा राजयोग (Vedic Yogas Analysis)'
                : 'Vedic Yogas & Raja Yogas Analysis'}
            </span>
          </h3>
          <p className="text-xs text-amber-300/80">
            {lang === 'ne'
              ? 'केन्द्र, त्रिकोण, गजाकेसरी, बुधादित्य लगायत प्रमुख वैदिक योगहरूको सटिक विश्लेषण'
              : 'Detection of Budhaditya, Gajakesari, Pancha Mahapurusha, and Raj Yogas.'}
          </p>
        </div>

        <span className="bg-amber-600/30 text-amber-300 font-serif font-bold text-xs px-3 py-1 rounded-full border border-amber-500/50">
          {lang === 'ne'
            ? `${presentYogas.length} / ${yogas.length} योगहरू उपस्थित`
            : `${presentYogas.length} / ${yogas.length} Yogas Active`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {yogas.map((yoga, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${
              yoga.isPresent
                ? 'bg-amber-900/30 border-amber-600/80 shadow-md'
                : 'bg-amber-950/30 border-amber-900/40 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
              <span className="font-serif font-bold text-amber-100 text-sm flex items-center gap-2">
                {yoga.isPresent ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-600/60 shrink-0" />
                )}
                <span>{lang === 'ne' ? yoga.nameNe : yoga.nameEn}</span>
              </span>

              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  yoga.isPresent
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-amber-950 text-amber-500 border-amber-800'
                }`}
              >
                {yoga.isPresent
                  ? lang === 'ne'
                    ? 'उपस्थित (Active)'
                    : 'Active'
                  : lang === 'ne'
                  ? 'अनुपस्थित'
                  : 'Inactive'}
              </span>
            </div>

            <p className="text-xs text-amber-200/90 mt-2 leading-relaxed font-sans">
              {lang === 'ne' ? yoga.descriptionNe : yoga.descriptionEn}
            </p>

            <div className="mt-3 text-[11px] bg-black/60 p-2.5 rounded-lg border border-amber-800/50 space-y-1.5 font-mono">
              <div>
                <span className="text-amber-400 font-sans font-bold">
                  {lang === 'ne' ? 'सटिक नियम: ' : 'Exact Rule: '}
                </span>
                <span className="text-amber-200">
                  {lang === 'ne'
                    ? yoga.exactRuleNe || yoga.ruleNe
                    : yoga.exactRuleEn || yoga.ruleEn}
                </span>
              </div>

              <div>
                <span className="text-amber-400 font-sans font-bold">
                  {lang === 'ne' ? 'आवश्यक स्थिति: ' : 'Required Condition: '}
                </span>
                <span className="text-amber-200">
                  {lang === 'ne'
                    ? yoga.requiredConditionNe || yoga.ruleNe
                    : yoga.requiredConditionEn || yoga.ruleEn}
                </span>
              </div>

              <div>
                <span className="text-amber-400 font-sans font-bold">
                  {lang === 'ne' ? 'वास्तविक स्थिति: ' : 'Actual Condition: '}
                </span>
                <span className="text-amber-100">
                  {lang === 'ne'
                    ? yoga.actualConditionNe || 'कुण्डली स्थिति'
                    : yoga.actualConditionEn || 'Actual Chart Condition'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
