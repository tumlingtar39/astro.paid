import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BasicKundaliSection } from './components/BasicKundaliSection';
import { KundaliSection } from './components/KundaliSection';
import { YearlyPhalitSection } from './components/YearlyPhalitSection';
import { ChatAssistant } from './components/ChatAssistant';
import { KundaliMilanSection } from './components/kundali/KundaliMilanSection';
import { NumerologySection } from './components/NumerologySection';
import { VastuSection } from './components/VastuSection';
import { DailyRashifalSection } from './components/DailyRashifalSection';
import { VisitingCard } from './components/VisitingCard';
import { AccessibilityBar } from './components/common/AccessibilityBar';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { KundaliInput, KundaliResult, Language } from './types';
import { PANDIT_INFO } from './data/astrologyData';
import { Sparkles } from 'lucide-react';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { FreeTrialModal } from './components/subscription/FreeTrialModal';
import { DeviceAuthGate } from './components/license/DeviceAuthGate';

interface MainAppContentProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

function MainAppContent({ lang, setLang }: MainAppContentProps) {
  const [activeTab, setActiveTab] = useState<string>('kundali');
  const [showVisitingCardModal, setShowVisitingCardModal] = useState<boolean>(false);
  const { theme, isDark } = useTheme();

  // Synchronized active Kundali across sections
  const [activeKundali, setActiveKundali] = useState<KundaliResult | null>(() => {
    try {
      const stored = sessionStorage.getItem('active_kundali');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.result || null;
      }
    } catch (_) {}
    return null;
  });

  const [activeInput, setActiveInput] = useState<KundaliInput | null>(() => {
    try {
      const stored = sessionStorage.getItem('active_kundali');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.input || null;
      }
    } catch (_) {}
    return null;
  });

  const handleKundaliChange = (result: KundaliResult | null, input: KundaliInput | null) => {
    setActiveKundali(result);
    setActiveInput(input);
  };

  return (
    <AccessibilityProvider>
      <div className={`min-h-screen app-root-container font-sans flex flex-col relative transition-colors duration-200 ${
        isDark 
          ? 'bg-[#1c130b] text-amber-50 selection:bg-amber-600 selection:text-amber-50' 
          : 'bg-[#fcfaf6] text-stone-900 selection:bg-amber-500 selection:text-stone-900'
      }`}>
        {/* Background Subtle Gradient & Texture Overlay */}
        <div className="fixed inset-0 app-bg-radial bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-amber-950/90 to-black pointer-events-none -z-10" />

        {/* Main Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          onOpenVisitingCard={() => setShowVisitingCardModal(true)}
        />

        {/* Global Subscription Modal */}
        <SubscriptionModal lang={lang} />

        {/* Global Free Trial Modal */}
        <FreeTrialModal
          lang={lang}
          onNavigateToForm={() => setActiveTab('kundali')}
        />

        {/* Accessibility Toolbar for Low Vision & Font Zoom */}
        <AccessibilityBar lang={lang} />

          {/* Main Content Area */}
          <main className="flex-1 pb-24 md:pb-12">
            {activeTab === 'kundali' && (
              <BasicKundaliSection
                lang={lang}
                activeKundali={activeKundali}
                activeInput={activeInput}
                onKundaliChange={handleKundaliChange}
                onOpenChina17={() => setActiveTab('china17')}
              />
            )}
            {activeTab === 'china17' && (
              <KundaliSection
                lang={lang}
                activeKundali={activeKundali}
                activeInput={activeInput}
                onKundaliChange={handleKundaliChange}
                onOpenYearlyPhalit={() => setActiveTab('phalit')}
              />
            )}
            {activeTab === 'phalit' && (
              <YearlyPhalitSection
                lang={lang}
                initialKundali={activeKundali}
                initialInput={activeInput}
                onKundaliChange={handleKundaliChange}
              />
            )}
            {activeTab === 'milan' && <KundaliMilanSection lang={lang} />}
            {activeTab === 'numerology' && <NumerologySection lang={lang} />}
            {activeTab === 'vastu' && <VastuSection lang={lang} />}
            {activeTab === 'rashifal' && <DailyRashifalSection lang={lang} />}
            {activeTab === 'assistant' && <ChatAssistant lang={lang} />}
          </main>

          {/* Visiting Card Modal */}
          {showVisitingCardModal && (
            <VisitingCard
              lang={lang}
              isModal={true}
              onClose={() => setShowVisitingCardModal(false)}
            />
          )}

          {/* Floating Visiting Card Button (Quick Access) */}
          <button
            onClick={() => setShowVisitingCardModal(true)}
            className="fixed bottom-16 sm:bottom-20 md:bottom-6 right-3 sm:right-6 z-30 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full shadow-2xl border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 group"
            title="ज्योतिष परामर्श केन्द्र - भिजिटिङ कार्ड हेर्नुहोस्"
          >
            <Sparkles className="w-4 h-4 text-amber-950 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold whitespace-nowrap">
              {lang === 'ne' ? '📇 भिजिटिङ कार्ड' : '📇 Visiting Card'}
            </span>
          </button>

          {/* Global Footer */}
          <footer className="bg-amber-950 border-t border-amber-800/60 py-6 px-4 text-center text-xs text-amber-300/80 space-y-2 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-300 font-serif text-xs font-bold border border-amber-500/50">
                  ॐ
                </span>
                <span className="font-bold font-serif text-amber-100">
                  {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-amber-400">
                <button onClick={() => setActiveTab('kundali')} className="hover:underline font-bold text-amber-300">
                  {lang === 'ne' ? 'कुण्डली (निःशुल्क)' : 'Kundali (Free)'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('china17')} className="hover:underline">
                  {lang === 'ne' ? '१७ कुण्डली र चिना' : '17 Kundali & China'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('phalit')} className="hover:underline">
                  {lang === 'ne' ? 'फलित' : 'Phalit'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('assistant')} className="hover:underline font-bold text-amber-200">
                  {lang === 'ne' ? 'Binay Guru AI Assistant' : 'Binay Guru AI Assistant'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('milan')} className="hover:underline">
                  {lang === 'ne' ? 'कुण्डली मिलान' : 'Kundali Milan'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('numerology')} className="hover:underline">
                  {lang === 'ne' ? 'अंक ज्योतिष' : 'Numerology'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('vastu')} className="hover:underline">
                  {lang === 'ne' ? 'वास्तु शास्त्र' : 'Vastu'}
                </button>
                <span>•</span>
                <button onClick={() => setActiveTab('rashifal')} className="hover:underline">
                  {lang === 'ne' ? 'पञ्चाङ्ग र राशिफल' : 'Panchang & Rashifal'}
                </button>
              </div>

              <div className="text-[11px] text-amber-400/80">
                © {new Date().getFullYear()} {PANDIT_INFO.nameEn} - All Rights Reserved
              </div>
            </div>
          </footer>
        </div>
      </AccessibilityProvider>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('ne');

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <DeviceAuthGate language={lang} onLanguageChange={setLang}>
            <MainAppContent lang={lang} setLang={setLang} />
          </DeviceAuthGate>
        </ThemeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

