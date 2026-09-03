import React, { useState } from 'react';
import { getAstronomicalPanchang, PanchangDetail } from '../utils/panchang';
import { Language } from '../types';
import { Sun, Moon, Calendar as CalendarIcon, Clock, CheckCircle2, ShieldAlert, Compass, Sparkles, Star, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface PanchangaCardProps {
  lang: Language;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({ lang }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>('Kathmandu');

  const p: PanchangDetail = getAstronomicalPanchang(selectedDate, location);

  // Helper date manipulators
  const handleOffsetDays = (days: number) => {
    const newD = new Date(selectedDate);
    newD.setDate(newD.getDate() + days);
    setSelectedDate(newD);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  const dateInputValue = selectedDate.toISOString().split('T')[0];

  return (
    <div className="bg-gradient-to-b from-amber-950/90 via-amber-900/60 to-amber-950/90 rounded-2xl border-2 border-amber-600/60 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-6">
      
      {/* Date & Location Controller Toolbar */}
      <div className="bg-amber-950/80 p-3.5 rounded-xl border border-amber-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Quick Date Shift Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <button
            onClick={() => handleOffsetDays(-1)}
            className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 transition-all flex items-center gap-1"
            title="हिजो (Yesterday)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">हिजो</span>
          </button>

          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
              selectedDate.toDateString() === new Date().toDateString()
                ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md'
                : 'bg-amber-900/60 hover:bg-amber-800 border-amber-700/60 text-amber-200'
            }`}
          >
            {lang === 'ne' ? 'आज (Today)' : 'Today'}
          </button>

          <button
            onClick={() => handleOffsetDays(1)}
            className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-700/60 text-amber-200 transition-all flex items-center gap-1"
            title="भोलि (Tomorrow)"
          >
            <span className="hidden sm:inline">भोलि</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector & Location */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
          <div className="flex items-center gap-1 bg-amber-900/50 border border-amber-700/60 rounded-lg px-2.5 py-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={dateInputValue}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(new Date(e.target.value));
              }}
              className="bg-transparent text-amber-100 font-sans text-xs focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-amber-900/50 border border-amber-700/60 rounded-lg px-2 py-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-amber-100 text-xs focus:outline-none cursor-pointer"
            >
              <option value="Sankhuwasabha" className="bg-amber-950 text-amber-100">संखुवासभा ( खाँदबारी/तुमलिङटार )</option>
              <option value="Kathmandu" className="bg-amber-950 text-amber-100">काठमाडौँ ( Kathmandu )</option>
              <option value="Pokhara" className="bg-amber-950 text-amber-100">पोखरा ( Pokhara )</option>
              <option value="Biratnagar" className="bg-amber-950 text-amber-100">विराटनगर ( Biratnagar )</option>
              <option value="Chitwan" className="bg-amber-950 text-amber-100">चितवन ( Chitwan )</option>
              <option value="Janakpur" className="bg-amber-950 text-amber-100">जनकपुर ( Janakpur )</option>
              <option value="Butwal" className="bg-amber-950 text-amber-100">बुटवल ( Butwal )</option>
              <option value="Surkhet" className="bg-amber-950 text-amber-100">सुर्खेत ( Surkhet )</option>
              <option value="Dhangadhi" className="bg-amber-950 text-amber-100">धनगढी ( Dhangadhi )</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-700/60 pb-4 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ne' ? 'प्रत्यक्ष वैदिक शुद्ध पञ्चाङ्ग' : 'Live Astronomical Panchang'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center justify-center sm:justify-start gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            <span>{p.bsDateStr}</span>
            <span className="text-amber-400 text-lg">({p.dayNameNe})</span>
          </h3>
          <p className="text-xs text-amber-300/80 mt-1 flex items-center flex-wrap gap-2 justify-center sm:justify-start">
            <span>{p.englishDate} • {p.dayNameEn} • {p.ayana} • {p.ritu}</span>
            <span className="bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/50">
              📍 स्थान: {p.locationNameNe}
            </span>
          </p>
        </div>

        {/* Samvat Badges */}
        <div className="flex flex-wrap sm:flex-col items-end justify-center gap-1.5 text-[11px] text-amber-200">
          <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
            वि.सं.: <strong className="text-amber-300">{p.vikramSamvat}</strong>
          </span>
          <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
            ने.सं.: <strong className="text-amber-300">{p.nepalSamvat}</strong>
          </span>
          <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
            संवत्सर: <strong className="text-amber-300">{p.samvatsara}</strong>
          </span>
          <span className="bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-700/60 font-medium">
            पक्ष: <strong className="text-amber-300">{p.paksha}</strong>
          </span>
        </div>
      </div>

      {/* 5 Limbs of Panchanga Grid */}
      <div>
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400" />
          <span>पञ्चाङ्गका ५ अङ्गहरू (The 5 Limbs of Vedic Time):</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tithi */}
          <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">१. तिथि (Tithi)</span>
            <p className="font-bold text-amber-100 text-sm">{p.tithi}</p>
          </div>

          {/* Nakshatra */}
          <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">२. नक्षत्र (Nakshatra)</span>
            <p className="font-bold text-amber-100 text-sm">{p.nakshatra} (पद {p.nakshatraPad})</p>
          </div>

          {/* Yoga */}
          <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">३. योग (Yoga)</span>
            <p className="font-bold text-amber-100 text-sm">{p.yoga}</p>
          </div>

          {/* Karana */}
          <div className="bg-amber-900/40 p-3.5 rounded-xl border border-amber-700/50 space-y-1 hover:border-amber-500/80 transition-all">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide block">४. करण (Karana)</span>
            <p className="font-bold text-amber-100 text-sm">{p.karana}</p>
          </div>
        </div>
      </div>

      {/* Sun & Moon Times + Zodiacs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sun & Moon Cycle */}
        <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/80 space-y-3">
          <h5 className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>सूर्य तथा चन्द्रमा समय (Sun & Moon Times)</span>
          </h5>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-900/30 p-2 rounded-lg border border-amber-800/40 flex items-center justify-between">
              <span className="text-amber-300/90 text-[11px]">🌅 सूर्योदय:</span>
              <strong className="text-amber-100">{p.sunrise}</strong>
            </div>
            <div className="bg-amber-900/30 p-2 rounded-lg border border-amber-800/40 flex items-center justify-between">
              <span className="text-amber-300/90 text-[11px]">🌇 सूर्यास्त:</span>
              <strong className="text-amber-100">{p.sunset}</strong>
            </div>
            <div className="bg-amber-900/30 p-2 rounded-lg border border-amber-800/40 flex items-center justify-between">
              <span className="text-amber-300/90 text-[11px]">🌙 चन्द्रोदय:</span>
              <strong className="text-amber-100">{p.moonrise}</strong>
            </div>
            <div className="bg-amber-900/30 p-2 rounded-lg border border-amber-800/40 flex items-center justify-between">
              <span className="text-amber-300/90 text-[11px]">🌄 चन्द्रास्त:</span>
              <strong className="text-amber-100">{p.moonset}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-800/40 text-amber-200">
            <span>☀️ सूर्य राशि: <strong className="text-amber-300">{p.sunSign}</strong></span>
            <span>🌕 चन्द्र राशि: <strong className="text-amber-300">{p.moonSign}</strong></span>
          </div>
        </div>

        {/* Auspicious & Inauspicious Muhurats */}
        <div className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/80 space-y-2.5">
          <h5 className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>शुभ तथा अशुभ समय (Muhurat & Timing)</span>
          </h5>

          <div className="space-y-2 text-xs">
            {/* Abhijit Muhurat */}
            <div className="bg-emerald-950/50 border border-emerald-700/60 p-2.5 rounded-lg flex items-start gap-2 text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">अभिजित् मुहूर्त (शुभ): </span>
                <span>{p.abhijitMuhurat}</span>
              </div>
            </div>

            {/* Rahu Kaal */}
            <div className="bg-rose-950/50 border border-rose-700/60 p-2.5 rounded-lg flex items-start gap-2 text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">राहु काल (अशुभ): </span>
                <span>{p.rahuKaal}</span>
              </div>
            </div>

            {/* Yamaganda */}
            <div className="bg-amber-900/40 border border-amber-800/50 p-2 rounded-lg flex items-center justify-between text-[11px] text-amber-200">
              <span>यमकण्ड समय: <strong className="text-amber-300">{p.yamaganda}</strong></span>
              <span>गुलिक काल: <strong className="text-amber-300">{p.gulikaiKaal}</strong></span>
            </div>

            {/* Disha Shool */}
            <div className="bg-amber-900/40 border border-amber-800/50 p-2 rounded-lg flex items-center justify-between text-[11px] text-amber-200">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>दिशा शूल: <strong className="text-amber-300">{p.dishaShool}</strong></span>
              </div>
              <span className="text-[10px] text-amber-400/90">{p.dishaShoolRemedy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Notice / Event Box */}
      <div className="bg-gradient-to-r from-amber-900/50 via-amber-800/40 to-amber-900/50 p-3.5 rounded-xl border border-amber-600/50 space-y-1.5 text-xs">
        <h5 className="font-bold text-amber-300 font-serif flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>विशेष पर्व, व्रत तथा योग (Special Events & Highlights):</span>
        </h5>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-amber-100">
          {p.specialEvents.map((evt, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">✦</span>
              <span>{evt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Shubha Sait Section */}
      <div className="bg-gradient-to-br from-amber-950/90 via-amber-900/50 to-amber-950/90 p-4.5 rounded-xl border-2 border-amber-600/60 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-amber-800/60 pb-2.5">
          <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ne' ? 'शुभ साईत तथा विवाह/व्रतबन्ध/गृहप्रवेश मुहूर्त' : 'Shubha Sait & Auspicious Ceremony Timings'}</span>
          </h4>
          <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-sans font-medium">
            {lang === 'ne' ? 'दैनिक शुभ चौघडिया एवं साईत' : 'Daily Auspicious Sait'}
          </span>
        </div>

        {/* Daily Choghadiya Timings */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50">
            <span className="text-[10px] text-amber-400 font-semibold block">{lang === 'ne' ? 'शुभ बेला:' : 'Shubha Timing:'}</span>
            <strong className="text-amber-100 text-xs sm:text-sm mt-0.5 block">{p.shubhaSait.shubhaBela}</strong>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50">
            <span className="text-[10px] text-emerald-400 font-semibold block">{lang === 'ne' ? 'अमृत बेला:' : 'Amrit Timing:'}</span>
            <strong className="text-emerald-200 text-xs sm:text-sm mt-0.5 block">{p.shubhaSait.amritBela}</strong>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/50">
            <span className="text-[10px] text-yellow-400 font-semibold block">{lang === 'ne' ? 'लाभ बेला:' : 'Labha Timing:'}</span>
            <strong className="text-yellow-100 text-xs sm:text-sm mt-0.5 block">{p.shubhaSait.labhaBela}</strong>
          </div>
        </div>

        {/* Major Ceremony Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
          <div className="bg-amber-900/30 p-3 rounded-xl border border-amber-800/50 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>💍</span>
              <span>{lang === 'ne' ? 'विवाह साईत (Marriage Sait):' : 'Marriage Sait:'}</span>
            </span>
            <p className="text-amber-100/90 text-xs leading-relaxed">{p.shubhaSait.vivahaSait}</p>
          </div>

          <div className="bg-amber-900/30 p-3 rounded-xl border border-amber-800/50 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>📿</span>
              <span>{lang === 'ne' ? 'व्रतबन्ध/चूडाकर्म साईत:' : 'Bratabandha Sait:'}</span>
            </span>
            <p className="text-amber-100/90 text-xs leading-relaxed">{p.shubhaSait.bratabandhaSait}</p>
          </div>

          <div className="bg-amber-900/30 p-3 rounded-xl border border-amber-800/50 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>🏡</span>
              <span>{lang === 'ne' ? 'गृहप्रवेश तथा वास्तु साईत:' : 'Griha Pravesh Sait:'}</span>
            </span>
            <p className="text-amber-100/90 text-xs leading-relaxed">{p.shubhaSait.grihaPraveshSait}</p>
          </div>

          <div className="bg-amber-900/30 p-3 rounded-xl border border-amber-800/50 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>🛍️</span>
              <span>{lang === 'ne' ? 'पास्नी/व्यापार/सवारी खरिद:' : 'Pasni & Purchase Sait:'}</span>
            </span>
            <p className="text-amber-100/90 text-xs leading-relaxed">{p.shubhaSait.pasniVyaparSait}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
