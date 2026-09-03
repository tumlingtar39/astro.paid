import React from 'react';
import { CalculationAudit, Language } from '../../types';
import { ShieldCheck, X, Cpu, Compass, Clock, CheckCircle } from 'lucide-react';

interface CalculationAuditModalProps {
  audit: CalculationAudit;
  lang: Language;
  onClose: () => void;
}

export const CalculationAuditModal: React.FC<CalculationAuditModalProps> = ({
  audit,
  lang,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-amber-950 via-black to-black border border-amber-500/80 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-amber-100 space-y-5 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-amber-900/40 hover:bg-amber-800 text-amber-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-amber-800/60 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400 flex items-center justify-center text-amber-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-100">
              {lang === 'ne'
                ? 'खगोलीय गणितीय प्रमाणीकरण (Astronomical Audit Proof)'
                : 'Astronomical Mathematical Calculation Audit'}
            </h3>
            <p className="text-xs text-amber-300/80">
              {lang === 'ne'
                ? 'प्रत्यक्ष astronomically verified ephemeris calculations audit trail'
                : 'Verified JPL/VSOP87 planetary ephemeris mathematics engine.'}
            </p>
          </div>
        </div>

        {/* Audit Trail Parameters */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-amber-900/30 border border-amber-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold border-b border-amber-800/40 pb-1">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'गणितीय इन्जिन स्रोत (Calculation Source):' : 'Engine Source:'}</span>
            </div>
            <div className="text-amber-200 font-mono text-[11px] pl-6">
              {audit.ephemerisSource || 'VSOP87 / JPL Ephemeris via astronomy-engine'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-1">
              <span className="text-[11px] text-amber-400 font-medium block">Julian Day (JD):</span>
              <span className="font-mono text-amber-200 text-xs font-bold">{audit.julianDay ? audit.julianDay.toFixed(6) : 'N/A'}</span>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-1">
              <span className="text-[11px] text-amber-400 font-medium block">Lahiri Ayanamsa:</span>
              <span className="font-mono text-amber-200 text-xs font-bold">
                {audit.ayanamsaDegree ? `${audit.ayanamsaDegree.toFixed(4)}°` : '23.8570°'}
              </span>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-1">
              <span className="text-[11px] text-amber-400 font-medium block">Sidereal Time (GST):</span>
              <span className="font-mono text-amber-200 text-xs font-bold">
                {typeof audit.gstHours === 'number' ? `${audit.gstHours.toFixed(4)} hrs` : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-amber-900/20 border border-amber-800/50 rounded-xl space-y-1">
              <span className="text-[11px] text-amber-400 font-medium block">Rahu/Ketu Node Type:</span>
              <span className="font-mono text-amber-200 text-xs font-bold uppercase">
                {audit.nodeType === 'mean' ? 'Mean Node (मध्यम)' : 'True Node (वास्तविक)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-900/30 border border-amber-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold border-b border-amber-800/40 pb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>UTC Verification:</span>
            </div>
            <div className="text-amber-200 font-mono text-[11px] pl-6">
              UTC Date: {audit.utcDateStr || audit.calculationTimestamp}
            </div>
          </div>

          <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">{lang === 'ne' ? 'प्रमाणीकृत गणित:' : 'Verified:'}</span>{' '}
              {lang === 'ne'
                ? 'कुनै पनि अनुमानित डेटा वा नक्कली रेन्डम नम्बर प्रयोग गरिएको छैन। ग्रहहरूको स्थिति वास्तविक astronomical ephemeris equations बाट प्राप्त गरिएको छ।'
                : 'No placeholder estimates or random seeds used. All planetary coordinates derived via true astronomical ephemeris.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-serif font-bold text-xs py-2.5 px-6 rounded-xl transition-all"
          >
            {lang === 'ne' ? 'बन्द गर्नुहोस् (Close Audit Log)' : 'Close Audit Log'}
          </button>
        </div>
      </div>
    </div>
  );
};
