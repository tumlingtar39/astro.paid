import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScaleLevel = 'normal' | 'large' | 'extra-large' | 'ultra-vision';

interface AccessibilityContextType {
  fontScale: FontScaleLevel;
  setFontScale: (scale: FontScaleLevel) => void;
  scaleMultiplier: number; // 1.0, 1.3, 1.6, 2.0
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  chartSingleLetterOnly: boolean;
  setChartSingleLetterOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const SCALE_MULTIPLIERS: Record<FontScaleLevel, number> = {
  'normal': 1.0,
  'large': 1.3,
  'extra-large': 1.65,
  'ultra-vision': 2.1, // Super large for low vision (-7.0 power)
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<FontScaleLevel>(() => {
    try {
      const saved = localStorage.getItem('jyotish_font_scale');
      if (saved && (saved === 'normal' || saved === 'large' || saved === 'extra-large' || saved === 'ultra-vision')) {
        return saved as FontScaleLevel;
      }
    } catch {
      // fallback
    }
    // Default to 'large' for elderly / low-vision friendly default
    return 'large';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jyotish_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const [chartSingleLetterOnly, setChartSingleLetterOnly] = useState<boolean>(true);

  const setFontScale = (scale: FontScaleLevel) => {
    setFontScaleState(scale);
    try {
      localStorage.setItem('jyotish_font_scale', scale);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('jyotish_high_contrast', String(highContrast));
    } catch {
      // ignore
    }
  }, [highContrast]);

  const scaleMultiplier = SCALE_MULTIPLIERS[fontScale] || 1.3;

  const increaseFontSize = () => {
    if (fontScale === 'normal') setFontScale('large');
    else if (fontScale === 'large') setFontScale('extra-large');
    else if (fontScale === 'extra-large') setFontScale('ultra-vision');
  };

  const decreaseFontSize = () => {
    if (fontScale === 'ultra-vision') setFontScale('extra-large');
    else if (fontScale === 'extra-large') setFontScale('large');
    else if (fontScale === 'large') setFontScale('normal');
  };

  const resetFontSize = () => setFontScale('normal');

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        scaleMultiplier,
        highContrast,
        setHighContrast,
        chartSingleLetterOnly,
        setChartSingleLetterOnly,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Return fallback default values gracefully
    return {
      fontScale: 'large',
      setFontScale: () => {},
      scaleMultiplier: 1.3,
      highContrast: false,
      setHighContrast: () => {},
      chartSingleLetterOnly: true,
      setChartSingleLetterOnly: () => {},
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      resetFontSize: () => {},
    };
  }
  return context;
};
