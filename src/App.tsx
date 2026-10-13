import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BasicKundaliSection } from './components/BasicKundaliSection';
import { DashaSection } from './components/DashaSection';
import { KundaliSection } from './components/KundaliSection';
import { YearlyPhalitSection } from './components/YearlyPhalitSection';
import { ChatAssistant } from './components/ChatAssistant';
import { KundaliMilanSection } from './components/kundali/KundaliMilanSection';
import { NumerologySection } from './components/NumerologySection';
import { VastuSection } from './components/VastuSection';
import { DailyRashifalSection } from './components/DailyRashifalSection';
import { VisitingCard } from './components/VisitingCard';
import { AccessibilitySettingsModal } from './components/common/AccessibilitySettingsModal';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { KundaliInput, KundaliResult, Language } from './types';
import { Sparkles, LayoutGrid, ArrowLeft, Home } from 'lucide-react';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { DeviceAuthGate } from './components/license/DeviceAuthGate';
import { MobileDashboardGrid } from './components/dashboard/MobileDashboardGrid';
import { AuthModal } from './components/common/AuthModal';

interface MainAppContentProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

function MainAppContent({ lang, setLang }: MainAppContentProps) {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showVisitingCardModal, setShowVisitingCardModal] = useState<boolean>(false);
  const { theme, isDark } = useTheme();
  const { isSubscribed, openSubscriptionModal } = useSubscription();

  const handleTabChange = (tabId: string) => {
    if ((tabId === 'china17' || tabId === 'phalit') && !isSubscribed) {
      openSubscriptionModal(
        tabId === 'china17'
          ? (lang === 'ne' ? 'पूरा चिना (१७ कुण्डली सहितको चिना)' : 'Full Cheena (17 Kundali)')
          : (lang === 'ne' ? 'वार्षिक फलित (Yearly Predictions)' : 'Yearly Predictions')
      );
      return;
    }
    setActiveTab(tabId);
  };

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
          setActiveTab={handleTabChange}
          lang={lang}
          setLang={setLang}
          onOpenVisitingCard={() => setShowVisitingCardModal(true)}
        />

        {/* Global Subscription Modal */}
        <SubscriptionModal lang={lang} />

        {/* Global Auth / Profile Modal */}
        <AuthModal language={lang} />

        {/* Vision & Font Zoom Settings Modal (Opened via Settings button) */}
        <AccessibilitySettingsModal lang={lang} />

        {/* Main Content Area */}
        <main className="flex-1 pb-28 sm:pb-32">
          {(activeTab === 'home' || activeTab === 'dashboard') && (
            <MobileDashboardGrid
              lang={lang}
              setLang={setLang}
              activeTab={activeTab}
              onSelectTab={handleTabChange}
              onOpenVisitingCard={() => setShowVisitingCardModal(true)}
              onOpenSubscriptionModal={() => openSubscriptionModal()}
            />
          )}
          {activeTab === 'kundali' && (
            <BasicKundaliSection
              lang={lang}
              activeKundali={activeKundali}
              activeInput={activeInput}
              onKundaliChange={handleKundaliChange}
              onOpenChina17={() => handleTabChange('china17')}
              onOpenDasha={() => handleTabChange('dasha')}
            />
          )}
          {activeTab === 'dasha' && (
            <DashaSection
              lang={lang}
              activeKundali={activeKundali}
              activeInput={activeInput}
              onKundaliChange={handleKundaliChange}
              onNavigateToKundali={() => handleTabChange('kundali')}
            />
          )}
          {activeTab === 'china17' && (
            <KundaliSection
              lang={lang}
              activeKundali={activeKundali}
              activeInput={activeInput}
              onKundaliChange={handleKundaliChange}
              onOpenYearlyPhalit={() => handleTabChange('phalit')}
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

          {/* Floating Visiting Card Button (Quick Access - Hidden on Phalit & Rashifal to prevent covering content) */}
          {activeTab !== 'phalit' && activeTab !== 'rashifal' && (
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
          )}


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

