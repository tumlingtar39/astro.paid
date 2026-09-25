import React, { useState } from 'react';
import { useAccessibility, FontScaleLevel } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../types';
import {
  Eye,
  ZoomIn,
  ZoomOut,
  X,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Type,
  Settings,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface AccessibilitySettingsModalProps {
  lang: Language;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({ lang }) => {
  const {
    fontScale,
    setFontScale,
    scaleMultiplier,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    highContrast,
    setHighContrast,
    chartSingleLetterOnly,
    setChartSingleLetterOnly,
    isSettingsOpen,
    closeSettings,
  } = useAccessibility();

  const { isDark, toggleTheme } = useTheme();
  const [justSaved, setJustSaved] = useState(false);

  if (!isSettingsOpen) return null;

  const scaleOptions: {
    id: FontScaleLevel;
    labelNe: string;
    labelEn: string;
    badge: string;
    descNe: string;
    descEn: string;
    icon: string;
  }[] = [
    {
      id: 'normal',
      labelNe: 'सामान्य',
      labelEn: 'Normal (100%)',
      badge: '१००%',
      descNe: 'नियमित अक्षर आकार (सानो वा मानक स्क्रिन)',
      descEn: 'Default standard font size',
      icon: '📱',
    },
    {
      id: 'large',
      labelNe: 'ठूलो (१३०%)',
      labelEn: 'Large (130%)',
      badge: '१३०%',
      descNe: 'स्पष्ट र पढ्न निकै सजिलो (सिफारिस गरिएको)',
      descEn: 'Clear, comfortable & recommended for all',
      icon: '🔍',
    },
    {
      id: 'extra-large',
      labelNe: 'धेरै ठूलो (१६५%)',
      labelEn: 'Extra Large (165%)',
      badge: '१६५%',
      descNe: 'कमजोर आँखा भएका वा पाका उमेरका व्यक्तिका लागि',
      descEn: 'High magnification for tired or older eyes',
      icon: '🔎',
    },
    {
      id: 'ultra-vision',
      labelNe: '👓 चस्मा बिना (-७.० पावर)',
      labelEn: '👓 Low Vision (-7.0)',
      badge: '२००%+',
      descNe: 'चस्मा नलगाई पनि प्रत्यक्ष पढ्न सकिने विशाल अक्षर',
      descEn: 'Ultra-sized text for reading without reading glasses',
      icon: '👓',
    },
  ];

  const handleSelectScale = (scale: FontScaleLevel) => {
    setFontScale(scale);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleClose = () => {
    closeSettings();
  };

  const isNepali = lang === 'ne';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 id="accessibility-settings-title" className="text-base sm:text-lg font-bold text-amber-200 font-serif leading-tight">
                {isNepali ? 'एप सेटिङ तथा दृष्टि सुलभता' : 'App Settings & Vision Accessibility'}
              </h2>
              <p className="text-[11px] text-amber-300/80">
                {isNepali ? 'कमजोर आँखा वा चस्मा नलगाई पढ्न अक्षरको आकार छनोट गर्नुहोस्' : 'Select font sizes for comfortable viewing'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Permanent Auto-save Banner */}
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 text-xs block">
                {isNepali ? 'स्थायी सेटअप (Auto-Saved Persistently)' : 'Permanent Auto-Saved Settings'}
              </span>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed mt-0.5">
                {isNepali
                  ? 'यहाँ एक पटक मिलाइएको अक्षरको आकार तपाईंको मोबाइल/कम्प्युटरमा सधैंको लागि सुरक्षित रहन्छ। बारम्बार मिलाइरहनु पर्दैन।'
                  : 'Once configured here, your chosen font scale is saved permanently on this device. No need to set it up again.'}
              </p>
            </div>
          </div>

          {/* Section 1: Font Scale Levels (4 Options) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                {isNepali ? 'अक्षरको आकार (Font Scale)' : 'Font Size Level'}
              </span>
              <span className="text-[10px] font-mono text-amber-400/70">
                {isNepali ? `हालको आकार: ${scaleMultiplier}x` : `Current: ${scaleMultiplier}x`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scaleOptions.map((opt) => {
                const isSelected = fontScale === opt.id;
                const isUltra = opt.id === 'ultra-vision';
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectScale(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isUltra
                          ? 'bg-gradient-to-br from-red-950 via-stone-900 to-amber-950 border-red-500 ring-2 ring-red-400/50 shadow-lg'
                          : 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-stone-950/60 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-base">{opt.icon}</span>
                        <span className={`text-xs sm:text-sm ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                          {isNepali ? opt.labelNe : opt.labelEn}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-stone-400 mt-1 leading-snug">
                      {isNepali ? opt.descNe : opt.descEn}
                    </p>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isNepali ? 'सक्रिय (Active)' : 'Active'}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Fine Tuning & Quick Steps */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-300 text-xs">
                {isNepali ? 'अक्षर थप घटाउने / बढाउने (Fine-Tune):' : 'Fine-Tune Steps:'}
              </span>
              <button
                onClick={resetFontSize}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 transition cursor-pointer"
                title="पूर्वनिर्धारितमा फर्कनुहोस्"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isNepali ? 'रिसेट' : 'Reset'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFontSize}
                disabled={fontScale === 'normal'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs active:scale-95 transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4 text-amber-400" />
                <span>A- ({isNepali ? 'सानो बनाउनुहोस्' : 'Decrease'})</span>
              </button>
              <button
                onClick={increaseFontSize}
                disabled={fontScale === 'ultra-vision'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs active:scale-95 transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4 text-amber-400" />
                <span>A+ ({isNepali ? 'ठूलो बनाउनुहोस्' : 'Increase'})</span>
              </button>
            </div>
          </div>

          {/* Section 3: Chart Planet Symbol Preference (१-अक्षर विशाल vs पूरा नाम) */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-200 text-xs block">
                  {isNepali ? 'कुण्डलीमा ग्रह संकेत (Planet Display in Charts)' : 'Planet Chart Display'}
                </span>
                <span className="text-[10px] text-stone-400">
                  {isNepali
                    ? 'कुण्डली कोठामा विशाल १-अक्षरे संकेत (सू, चं, मं, बु, गु, शु, श, रा, के) देखाउने'
                    : 'Display large 1-letter bold symbols inside chart houses'}
                </span>
              </div>
              <button
                onClick={() => setChartSingleLetterOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartSingleLetterOnly
                    ? 'bg-amber-500 text-stone-950 border-amber-300 font-extrabold shadow-sm'
                    : 'bg-stone-800 text-stone-300 border-stone-700'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>
                  {chartSingleLetterOnly
                    ? (isNepali ? '१-अक्षर विशाल ✓' : '1-Letter Bold ✓')
                    : (isNepali ? 'पूरा नाम' : 'Full Name')}
                </span>
              </button>
            </div>
          </div>

          {/* Section 4: Theme Mode (Light / Dark) */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-stone-200 text-xs block">
                {isNepali ? 'रंग मोड (Dark / Light Theme)' : 'Theme Mode'}
              </span>
              <span className="text-[10px] text-stone-400">
                {isDark
                  ? (isNepali ? 'डार्क मोड: आँखा नथाक्ने रात्रीकालीन मोड' : 'Dark mode for night reading')
                  : (isNepali ? 'लाइट मोड: उज्यालो सुनौलो पृष्ठभूमि' : 'Light mode with bright background')}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark
                  ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border-amber-600'
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400 font-extrabold shadow-sm'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{isNepali ? '☀️ लाइट मोड' : '☀️ Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-700 fill-indigo-700" />
                  <span>{isNepali ? '🌙 डार्क मोड' : '🌙 Dark'}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview Box */}
          <div className="border border-dashed border-amber-600/50 bg-amber-950/30 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider block mb-1">
              {isNepali ? 'प्रत्यक्ष पूर्वावलोकन (Live Preview)' : 'Live Font Size Preview'}
            </span>
            <p
              className="font-serif font-bold text-amber-200 transition-all duration-200"
              style={{ fontSize: `${scaleMultiplier * 14}px`, lineHeight: 1.3 }}
            >
              {isNepali
                ? 'ॐ श्री गणेशाय नमः | लग्न: मेष, चन्द्र: वृष'
                : 'Om Sri Ganeshaya Namah | Lagna: Aries'}
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              {isNepali ? 'तपाईंले छान्नुभएको यो अक्षर सबै कुण्डली र फलितमा लागू हुनेछ।' : 'This font size applies across all charts and readings.'}
            </p>
          </div>
        </div>

        {/* Footer with Save & Close */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-400">
            {justSaved ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isNepali ? 'सुरक्षित भयो!' : 'Saved!'}
              </span>
            ) : (
              <span>{isNepali ? 'परिवर्तन स्वतः सेभ हुन्छ' : 'Changes save automatically'}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isNepali ? 'बन्द गर्नुहोस् (Done)' : 'Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
