import React from 'react';
import { PanchangaDetail, Language } from '../../types';
import { Calendar, Sun, Moon, Sunrise, Sunset, Clock, Compass } from 'lucide-react';

interface PanchangaSectionProps {
  panchanga: PanchangaDetail;
  lang: Language;
}

export const PanchangaSection: React.FC<PanchangaSectionProps> = ({
  panchanga,
  lang
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-800/60 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-800/50">
        <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span>
            {lang === 'ne'
              ? 'जन्म समयको विस्तृत पञ्चाङ्ग (Birth Panchanga Details)'
              : 'Birth Panchanga & Vedic Metrics'}
          </span>
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 font-semibold">
            {panchanga.samvatsaraNe || 'आनन्द'} संवत्सर
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 font-semibold">
            {panchanga.ayanaNe || 'उत्तरायण'} ({panchanga.rituNe || 'वसन्त'})
          </span>
        </div>
      </div>

      {/* Vedic Calendar Era Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-amber-950/80 border border-amber-800/50 rounded-xl">
          <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider font-semibold">
            {lang === 'ne' ? 'विक्रम संवत् (B.S.)' : 'Vikram Samvat'}
          </span>
          <span className="font-serif font-bold text-amber-100 text-sm">
            {panchanga.vikramSamvat || (panchanga.vikramYear ? `वि.सं. ${panchanga.vikramYear}` : '—')}
          </span>
        </div>

        <div className="p-2.5 bg-amber-950/80 border border-amber-800/50 rounded-xl">
          <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider font-semibold">
            {lang === 'ne' ? 'शालिवाहन शाके (Shaka)' : 'Shaka Samvat'}
          </span>
          <span className="font-serif font-bold text-amber-100 text-sm">
            {panchanga.shakaSamvat || (panchanga.shakaYear ? `शाके ${panchanga.shakaYear}` : '—')}
          </span>
        </div>

        <div className="p-2.5 bg-amber-950/80 border border-amber-800/50 rounded-xl">
          <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider font-semibold">
            {lang === 'ne' ? 'सौर/चन्द्र मास' : 'Masa & Paksha'}
          </span>
          <span className="font-serif font-bold text-amber-100 text-sm">
            {panchanga.solarMasaNe || panchanga.bsMonthName || '—'} ({panchanga.pakshaNe || 'शुक्ल'})
          </span>
        </div>

        <div className="p-2.5 bg-amber-950/80 border border-amber-800/50 rounded-xl">
          <span className="text-[10px] text-amber-400/80 block uppercase tracking-wider font-semibold">
            {lang === 'ne' ? 'इष्टकाल (Ghati:Pala)' : 'Ishtakala'}
          </span>
          <span className="font-mono font-bold text-amber-300 text-sm">
            {panchanga.ishtaKalaGhatiPal || '—'}
          </span>
        </div>
      </div>

      {/* Core 5 Panchanga Limbs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Tithi Card */}
        <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1.5">
          <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block font-semibold text-center">
            {lang === 'ne' ? '१. तिथि (Tithi)' : '1. Tithi'}
          </span>
          <div className="text-center">
            <span className="text-[11px] text-amber-300/80 block">
              {lang === 'ne' ? 'दैनिक तिथि:' : 'Day Tithi:'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-100 block font-serif">
              {lang === 'ne' ? (panchanga.dayTithiNe || panchanga.tithiNe) : panchanga.tithiEn}
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 space-y-0.5 pt-1 border-t border-amber-800/40">
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'तिथिको मान:' : 'Tithi Ghati:'}</span>
              <span className="font-semibold text-amber-200">
                {panchanga.tithiTransitionGhatiPal && panchanga.tithiTransitionGhatiPal !== '—'
                  ? panchanga.tithiTransitionGhatiPal
                  : (panchanga.tithiGhatiPal || '—')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'जन्मतिथि:' : 'Birth Tithi:'}</span>
              <span className="font-semibold text-amber-100 font-serif">
                {panchanga.birthTithiNe || panchanga.tithiNe}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Vara Card */}
        <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1.5 text-center">
          <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block font-semibold">
            {lang === 'ne' ? '२. वार (Vara)' : '2. Vara'}
          </span>
          <div>
            <span className="text-xs sm:text-sm font-bold text-amber-100 block font-serif">
              {lang === 'ne' ? panchanga.varaNe : panchanga.varaEn}
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">
              {panchanga.varaEn || 'Sunday'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-amber-800/40 flex justify-between">
            <span className="text-amber-300/70">{lang === 'ne' ? 'इष्टकाल:' : 'Ishtakala:'}</span>
            <span className="font-semibold text-amber-200">{panchanga.ishtaKalaGhatiPal || '—'}</span>
          </div>
        </div>

        {/* 3. Nakshatra Card */}
        <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1.5">
          <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block font-semibold text-center">
            {lang === 'ne' ? '३. नक्षत्र (Nakshatra)' : '3. Nakshatra'}
          </span>
          <div className="text-center">
            <span className="text-[11px] text-amber-300/80 block">
              {lang === 'ne' ? 'दैनिक नक्षत्र:' : 'Day Nakshatra:'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-100 block font-serif">
              {lang === 'ne' ? (panchanga.dayNakshatraNe || panchanga.nakshatraNe) : panchanga.nakshatraEn}
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 space-y-0.5 pt-1 border-t border-amber-800/40">
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'जन्मनक्षत्र:' : 'Birth Nak:'}</span>
              <span className="font-semibold text-amber-100 font-serif">{panchanga.birthNakshatraNe || panchanga.nakshatraNe}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'भुक्त:' : 'Bhukta:'}</span>
              <span className="font-semibold text-amber-200">{panchanga.nakshatraBhuktaGhatiPal || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'भभोग:' : 'Bhabhoga:'}</span>
              <span className="font-semibold text-amber-200">{panchanga.bhabhogaGhatiPal || '—'}</span>
            </div>
          </div>
        </div>

        {/* 4. Yoga Card */}
        <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1.5">
          <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block font-semibold text-center">
            {lang === 'ne' ? '४. योग (Yoga)' : '4. Yoga'}
          </span>
          <div className="text-center">
            <span className="text-[11px] text-amber-300/80 block">
              {lang === 'ne' ? 'दैनिक योग:' : 'Day Yoga:'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-100 block font-serif">
              {lang === 'ne' ? (panchanga.dayYogaNe || panchanga.yogaNe) : panchanga.yogaEn}
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 space-y-0.5 pt-1 border-t border-amber-800/40">
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'योगको मान:' : 'Yoga Ghati:'}</span>
              <span className="font-semibold text-amber-200">
                {panchanga.yogaTransitionGhatiPal && panchanga.yogaTransitionGhatiPal !== '—'
                  ? panchanga.yogaTransitionGhatiPal
                  : (panchanga.yogaGhatiPal || '—')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300/70">{lang === 'ne' ? 'जन्मयोग:' : 'Birth Yoga:'}</span>
              <span className="font-semibold text-amber-100 font-serif">
                {panchanga.birthYogaNe || panchanga.yogaNe}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Karana Card */}
        <div className="p-3 bg-amber-900/30 border border-amber-800/50 rounded-xl space-y-1.5 text-center col-span-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block font-semibold">
            {lang === 'ne' ? '५. करण (Karana)' : '5. Karana'}
          </span>
          <div>
            <span className="text-[11px] text-amber-300/80 block">
              {lang === 'ne' ? 'जन्मकरण:' : 'Birth Karana:'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-100 block font-serif">
              {lang === 'ne' ? (panchanga.birthKaranaNe || panchanga.karanaNe) : panchanga.karanaEn}
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">
              {panchanga.karanaEn || 'Bava'}
            </span>
          </div>
        </div>
      </div>

      {/* Sun/Moon Timing & Ghati Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-2.5 bg-amber-950 border border-amber-800/40 rounded-xl flex items-center gap-2.5 text-xs">
          <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-400/80 block">
              {lang === 'ne' ? 'सूर्योदय (Sunrise)' : 'Sunrise'}
            </span>
            <span className="font-mono text-amber-100 font-semibold">{panchanga.sunrise}</span>
          </div>
        </div>

        <div className="p-2.5 bg-amber-950 border border-amber-800/40 rounded-xl flex items-center gap-2.5 text-xs">
          <Sunset className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-400/80 block">
              {lang === 'ne' ? 'सूर्यास्त (Sunset)' : 'Sunset'}
            </span>
            <span className="font-mono text-amber-100 font-semibold">{panchanga.sunset}</span>
          </div>
        </div>

        <div className="p-2.5 bg-amber-950 border border-amber-800/40 rounded-xl flex items-center gap-2.5 text-xs">
          <Sun className="w-4 h-4 text-amber-300 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-400/80 block">
              {lang === 'ne' ? 'दिनमान (Dinamana)' : 'Dinamana'}
            </span>
            <span className="font-mono text-amber-100 font-semibold">
              {panchanga.dinamanaGhatiPal || 'घ. ३० प. ००'}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-amber-950 border border-amber-800/40 rounded-xl flex items-center gap-2.5 text-xs">
          <Moon className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-400/80 block">
              {lang === 'ne' ? 'रात्रिमान (Ratrimana)' : 'Ratrimana'}
            </span>
            <span className="font-mono text-amber-100 font-semibold">
              {panchanga.ratrimanaGhatiPal || 'घ. ३० प. ००'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

