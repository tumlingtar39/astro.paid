import React from 'react';
import { useAccessibility, FontScaleLevel } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../types';
import { Eye, ZoomIn, ZoomOut, Sparkles, Sun, Moon, Type } from 'lucide-react';

interface AccessibilityBarProps {
  lang: Language;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({ lang }) => {
  const {
    fontScale,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    highContrast,
    setHighContrast,
    chartSingleLetterOnly,
    setChartSingleLetterOnly,
  } = useAccessibility();

  const { theme, isDark, toggleTheme } = useTheme();

  const scaleOptions: { id: FontScaleLevel; labelNe: string; labelEn: string; badge: string }[] = [
    { id: 'normal', labelNe: 'सामान्य', labelEn: 'Normal', badge: '100%' },
    { id: 'large', labelNe: 'ठूलो (१३०%)', labelEn: 'Large (130%)', badge: '130%' },
    { id: 'extra-large', labelNe: 'धेरै ठूलो (१६५%)', labelEn: 'Extra Large', badge: '165%' },
    { id: 'ultra-vision', labelNe: '👓 चस्मा बिना (-७.० पावर)', labelEn: '👓 Low Vision (-7.0)', badge: '200%' },
  ];

  return (
    <aside aria-label="Accessibility controls" className="w-full bg-gradient-to-r from-amber-950 via-[#261608] to-amber-950 border-b border-amber-700/60 shadow-lg px-3 py-2 text-amber-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Indicator & Info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-amber-200 text-xs sm:text-sm font-serif">
              {lang === 'ne' ? 'दृष्टि सुलभता (Accessibility & Text Zoom):' : 'Vision Accessibility Mode:'}
            </span>
            <span className="ml-1.5 text-[11px] sm:text-xs text-amber-300/80">
              {lang === 'ne'
                ? 'कमजोर आँखा वा चस्मा नलगाई पढ्न अक्षरको आकार छनोट गर्नुहोस्'
                : 'Choose large readable font sizes for comfortable viewing'}
            </span>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Zoom Buttons Group */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-amber-700/60 shadow-inner">
            {scaleOptions.map((opt) => {
              const isSelected = fontScale === opt.id;
              const isUltra = opt.id === 'ultra-vision';
              return (
                <button
                  key={opt.id}
                  onClick={() => setFontScale(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? isUltra
                        ? 'bg-red-600 text-white shadow-md ring-2 ring-yellow-300 scale-105 animate-pulse'
                        : 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                      : 'text-amber-300/90 hover:bg-amber-900/60 hover:text-amber-100'
                  }`}
                  title={`${opt.labelNe} (${opt.badge})`}
                >
                  <span>{lang === 'ne' ? opt.labelNe : opt.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Increment/Decrement Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={decreaseFontSize}
              disabled={fontScale === 'normal'}
              className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-0.5"
              title="अक्षर सानो बनाउनुहोस् (A-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>A-</span>
            </button>
            <button
              onClick={increaseFontSize}
              disabled={fontScale === 'ultra-vision'}
              className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-0.5"
              title="अक्षर अझ ठूलो बनाउनुहोस् (A+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>A+</span>
            </button>
          </div>

          {/* Single Letter Chart Mode Toggle */}
          <button
            onClick={() => setChartSingleLetterOnly((prev) => !prev)}
            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
              chartSingleLetterOnly
                ? 'bg-amber-900/80 text-amber-200 border-amber-500'
                : 'bg-black/40 text-amber-400/80 border-amber-800/60'
            }`}
            title="कुण्डलीमा १-अक्षरे विशाल संकेत (सू, चं, मं, बु, गु, शु, श, रा, के)"
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {lang === 'ne'
                ? chartSingleLetterOnly
                  ? '१-अक्षर विशाल'
                  : 'पूरा नाम'
                : chartSingleLetterOnly
                ? 'Short Symbol'
                : 'Full Name'}
            </span>
          </button>

          {/* Theme Switcher Quick Toggle */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-sm active:scale-95 ${
              isDark
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border-amber-600'
                : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400 font-extrabold'
            }`}
            title={isDark ? 'लाइट मोड (Light Mode) मा जानुहोस्' : 'डार्क मोड (Dark Mode) मा जानुहोस्'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{lang === 'ne' ? '☀️ लाइट' : '☀️ Light'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-700 fill-indigo-700" />
                <span>{lang === 'ne' ? '🌙 डार्क' : '🌙 Dark'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
