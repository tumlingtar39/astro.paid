import React, { useState } from 'react';
import { Phaladesh, Language } from '../../types';
import { BookOpen, User, Briefcase, Coins, Heart, GraduationCap, Activity, Globe, Sparkles } from 'lucide-react';

interface PhaladeshSectionProps {
  phaladesh: Phaladesh;
  lang: Language;
}

export const PhaladeshSection: React.FC<PhaladeshSectionProps> = ({
  phaladesh,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const safeP = phaladesh || {} as Partial<Phaladesh>;

  const categories = [
    { id: 'all', labelNe: 'सबै फलितहरू (All)', labelEn: 'All Aspects', icon: BookOpen },
    { id: 'personality', labelNe: 'व्यक्तित्व (Personality)', labelEn: 'Personality', icon: User },
    { id: 'career', labelNe: 'पेशा/व्यवसाय (Career)', labelEn: 'Career', icon: Briefcase },
    { id: 'finance', labelNe: 'धन/आर्थिक (Finance)', labelEn: 'Finance', icon: Coins },
    { id: 'marriage', labelNe: 'दाम्पत्य सुख (Marriage)', labelEn: 'Marriage', icon: Heart },
    { id: 'education', labelNe: 'शिक्षा (Education)', labelEn: 'Education', icon: GraduationCap },
    { id: 'health', labelNe: 'स्वास्थ्य (Health)', labelEn: 'Health', icon: Activity },
    { id: 'travel', labelNe: 'वैदेशिक योग (Travel)', labelEn: 'Travel', icon: Globe },
    { id: 'dashaPhala', labelNe: 'महादशा फल (Active Dasha)', labelEn: 'Dasha Phala', icon: Sparkles }
  ];

  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-800/50 gap-2">
        <div>
          <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>
              {lang === 'ne'
                ? 'स्वचालित ज्योतिषीय फलित (Automated Kundali Phaladesh Interpretations)'
                : 'Automated Kundali Phaladesh'}
            </span>
          </h3>
          <p className="text-xs text-amber-300/80">
            {lang === 'ne'
              ? 'लग्नेश, राशी, १० औँ भाव, धन स्थान र वर्तमान महादशामा आधारित स्वचालित भविष्यवाणी'
              : 'Detailed, rule-based readings generated from exact astronomical planetary placements.'}
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-serif font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-amber-950 border-amber-300 shadow-lg scale-105'
                  : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? cat.labelNe : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Interpretations Content */}
      <div className="space-y-4">
        {(activeTab === 'all' || activeTab === 'personality') && (
          <PhaladeshCard
            title={lang === 'ne' ? '१. व्यक्तित्व तथा स्वभाव (Personality & Nature)' : '1. Personality & Nature'}
            content={lang === 'ne' ? (safeP.personalityNe || safeP.personality || '') : (safeP.personalityEn || safeP.personality || '')}
            icon={User}
          />
        )}

        {(activeTab === 'all' || activeTab === 'career') && (
          <PhaladeshCard
            title={lang === 'ne' ? '२. पेशा, व्यवसाय तथा कर्म (Career & Profession)' : '2. Career & Profession'}
            content={lang === 'ne' ? (safeP.careerNe || safeP.career || '') : (safeP.careerEn || safeP.career || '')}
            icon={Briefcase}
          />
        )}

        {(activeTab === 'all' || activeTab === 'finance') && (
          <PhaladeshCard
            title={lang === 'ne' ? '३. धन, सम्पत्ति तथा बचत (Finance & Wealth)' : '3. Finance & Wealth'}
            content={lang === 'ne' ? (safeP.financeNe || safeP.finance || '') : (safeP.financeEn || safeP.finance || '')}
            icon={Coins}
          />
        )}

        {(activeTab === 'all' || activeTab === 'marriage') && (
          <PhaladeshCard
            title={lang === 'ne' ? '४. दाम्पत्य जीवन तथा वैवाहिक सुख (Marriage & Relationships)' : '4. Marriage & Family'}
            content={lang === 'ne' ? (safeP.marriageNe || safeP.marriage || '') : (safeP.marriageEn || safeP.marriage || '')}
            icon={Heart}
          />
        )}

        {(activeTab === 'all' || activeTab === 'education') && (
          <PhaladeshCard
            title={lang === 'ne' ? '५. उच्च शिक्षा तथा बौद्धिक विकास (Education & Wisdom)' : '5. Education & Wisdom'}
            content={lang === 'ne' ? (safeP.educationNe || safeP.education || '') : (safeP.educationEn || safeP.education || '')}
            icon={GraduationCap}
          />
        )}

        {(activeTab === 'all' || activeTab === 'health') && (
          <PhaladeshCard
            title={lang === 'ne' ? '६. समग्र स्वास्थ्य तथा आरोग्यता (Health & Wellness)' : '6. Health & Wellness'}
            content={lang === 'ne' ? (safeP.healthNe || safeP.health || '') : (safeP.healthEn || safeP.health || '')}
            icon={Activity}
          />
        )}

        {(activeTab === 'all' || activeTab === 'travel') && (
          <PhaladeshCard
            title={lang === 'ne' ? '७. वैदेशिक यात्रा तथा विदेश बसोबास (Foreign Travel & Settlement)' : '7. Foreign Travel'}
            content={lang === 'ne' ? (safeP.travelNe || safeP.travel || '') : (safeP.travelEn || safeP.travel || '')}
            icon={Globe}
          />
        )}

        {(activeTab === 'all' || activeTab === 'dashaPhala') && (
          <PhaladeshCard
            title={lang === 'ne' ? '८. वर्तमान महादशा फलित (Active Dasha Period Reading)' : '8. Active Dasha Period Reading'}
            content={lang === 'ne' ? (safeP.dashaPhalaNe || safeP.dashaPhala || '') : (safeP.dashaPhalaEn || safeP.dashaPhala || '')}
            icon={Sparkles}
            isHighlight
          />
        )}
      </div>
    </div>
  );
};

const PhaladeshCard: React.FC<{
  title: string;
  content: string;
  icon: React.ElementType;
  isHighlight?: boolean;
}> = ({ title, content, icon: Icon, isHighlight }) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-colors space-y-2 ${
        isHighlight
          ? 'bg-amber-900/40 border-amber-500 shadow-xl'
          : 'bg-amber-900/20 border-amber-800/50 hover:border-amber-700'
      }`}
    >
      <div className="flex items-center gap-2 border-b border-amber-800/40 pb-2">
        <Icon className="w-4 h-4 text-amber-400" />
        <h4 className="font-serif font-bold text-amber-100 text-sm sm:text-base">
          {title}
        </h4>
      </div>
      <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans pt-1">
        {content}
      </p>
    </div>
  );
};
