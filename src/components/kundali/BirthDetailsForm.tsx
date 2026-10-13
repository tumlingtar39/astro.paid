import React, { useState, useEffect, useRef } from 'react';
import { KundaliInput, Language } from '../../types';
import { CITY_PRESETS, CityPreset, searchCityPresets, NEPAL_77_DISTRICTS, WORLD_COUNTRIES } from '../../utils/cityPresets';
import {
  convertBSToAD,
  convertADToBS,
  getDaysInBSMonth,
  formatADDate,
  formatBSDate,
  getWeekdayInfo,
  NEPALI_MONTHS_NE,
  NEPALI_MONTHS_EN,
  BSDate
} from '../../utils/nepaliCalendar';
import { Calendar, Clock, MapPin, Globe, Compass, AlertTriangle, Sparkles, Check, ArrowRightLeft, Search, X } from 'lucide-react';

interface BirthDetailsFormProps {
  lang: Language;
  onSubmit: (input: KundaliInput) => void;
  initialValues?: KundaliInput;
  submitButtonText?: string;
}

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  lang,
  onSubmit,
  initialValues,
  submitButtonText,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialValues?.gender || 'male');
  
  // Date Calendar Mode: BS (Bikram Sambat) or AD (Gregorian)
  const [dateMode, setDateMode] = useState<'BS' | 'AD'>('BS');

  // Default initial date 1995-05-15 AD = 2052-02-01 BS
  const initialAD = initialValues?.birthDate || '1995-05-15';
  const initialADParts = initialAD.split('-').map(Number);
  const initialBS = convertADToBS(
    initialADParts[0] || 1995,
    initialADParts[1] || 5,
    initialADParts[2] || 15
  );

  const [bsYear, setBsYear] = useState<number>(initialBS.year);
  const [bsMonth, setBsMonth] = useState<number>(initialBS.month);
  const [bsDay, setBsDay] = useState<number>(initialBS.day);

  const [birthDate, setBirthDate] = useState<string>(initialAD);
  const [birthTime, setBirthTime] = useState(initialValues?.birthTime || '08:30');
  const [birthPlace, setBirthPlace] = useState(initialValues?.birthPlace || 'Kathmandu');
  const [latitude, setLatitude] = useState<number>(initialValues?.latitude || 27.7172);
  const [longitude, setLongitude] = useState<number>(initialValues?.longitude || 85.324);
  const [timezone, setTimezone] = useState<number>(initialValues?.timezone || 5.75);
  const [nodeType, setNodeType] = useState<'true' | 'mean'>(initialValues?.nodeType || 'true');
  const [isDst, setIsDst] = useState<boolean>(initialValues?.isDst || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [placeCategory, setPlaceCategory] = useState<'all' | 'nepal' | 'world' | 'india' | 'gulf'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync BS to AD whenever BS fields change
  const handleBSDateChange = (newYear: number, newMonth: number, newDay: number) => {
    setBsYear(newYear);
    setBsMonth(newMonth);
    
    // Ensure day doesn't exceed days in selected BS month
    const maxDays = getDaysInBSMonth(newYear, newMonth);
    const validDay = Math.min(newDay, maxDays);
    setBsDay(validDay);

    // Precise Calendar Calculator conversion BS -> AD
    const adRes = convertBSToAD(newYear, newMonth, validDay);
    setBirthDate(formatADDate(adRes));
  };

  // Sync AD to BS whenever AD input changes
  const handleADDateChange = (adStr: string) => {
    setBirthDate(adStr);
    if (!adStr) return;
    const parts = adStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const bsRes = convertADToBS(parts[0], parts[1], parts[2]);
      setBsYear(bsRes.year);
      setBsMonth(bsRes.month);
      setBsDay(bsRes.day);
    }
  };

  const filteredCities = searchCityPresets(searchQuery, placeCategory);

  const handleSelectCity = (city: CityPreset) => {
    setBirthPlace(city.nameNe);
    setLatitude(city.lat);
    setLongitude(city.lon);
    setTimezone(city.tz);
    setShowCityDropdown(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      timezone,
      nodeType,
      isDst
    });
  };

  // Generate Year options for BS (1970 BS to 2095 BS)
  const bsYearOptions = Array.from({ length: 126 }, (_, i) => 1970 + i);

  // Generate Day options based on selected BS Year & Month
  const daysInCurrentBSMonth = getDaysInBSMonth(bsYear, bsMonth);
  const bsDayOptions = Array.from({ length: daysInCurrentBSMonth }, (_, i) => i + 1);

  // Current converted representations
  const currentADObj = (() => {
    const parts = birthDate.split('-').map(Number);
    return { year: parts[0] || 1995, month: parts[1] || 5, day: parts[2] || 15 };
  })();

  const currentBSObj: BSDate = { year: bsYear, month: bsMonth, day: bsDay };

  return (
    <div className="bg-gradient-to-b from-amber-950/90 to-black/95 border border-amber-700/60 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <span>{lang === 'ne' ? 'नाम (Full Name)' : 'Full Name'}</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'ne' ? 'पूरा नाम प्रविष्टि गर्नुहोस्...' : 'Enter full name...'}
              className="w-full bg-amber-950/60 border border-amber-700/70 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200">
              {lang === 'ne' ? 'लिङ्ग (Gender)' : 'Gender'}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
              className="w-full bg-amber-950/60 border border-amber-700/70 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            >
              <option value="male">{lang === 'ne' ? 'पुरुष (Male)' : 'Male'}</option>
              <option value="female">{lang === 'ne' ? 'महिला (Female)' : 'Female'}</option>
              <option value="other">{lang === 'ne' ? 'अन्य (Other)' : 'Other'}</option>
            </select>
          </div>
        </div>

        {/* Date Calendar Picker & Converter Section */}
        <div className="bg-amber-900/30 border border-amber-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-800/60 pb-3">
            <label className="text-xs font-bold text-amber-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'जन्ममिति प्रकार रोज्नुहोस् (Date Mode):' : 'Select Date Calendar Mode:'}</span>
            </label>

            <div className="inline-flex rounded-xl bg-amber-950/80 p-1 border border-amber-700">
              <button
                type="button"
                onClick={() => setDateMode('BS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dateMode === 'BS'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-amber-300 hover:text-amber-100'
                }`}
              >
                <span>🇳🇵 वि.सं. (BS)</span>
              </button>
              <button
                type="button"
                onClick={() => setDateMode('AD')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dateMode === 'AD'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-amber-300 hover:text-amber-100'
                }`}
              >
                <span>📆 ई.सं. (AD)</span>
              </button>
            </div>
          </div>

          {/* BS Date Selector */}
          {dateMode === 'BS' && (
            <div className="space-y-3">
              <p className="text-xs text-amber-300/90 font-medium">
                नेपाली विक्रम संवत् (BS) मा जन्ममिति चयन गर्नुहोस् (स्वत: सटिक AD मा रूपान्तरण हुनेछ):
              </p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* BS Year */}
                <div>
                  <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                    वर्ष (Year BS)
                  </label>
                  <select
                    value={bsYear}
                    onChange={(e) => handleBSDateChange(Number(e.target.value), bsMonth, bsDay)}
                    className="w-full bg-amber-950 border border-amber-600 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                  >
                    {bsYearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y} BS
                      </option>
                    ))}
                  </select>
                </div>

                {/* BS Month */}
                <div>
                  <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                    महिना (Month BS)
                  </label>
                  <select
                    value={bsMonth}
                    onChange={(e) => handleBSDateChange(bsYear, Number(e.target.value), bsDay)}
                    className="w-full bg-amber-950 border border-amber-600 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                  >
                    {NEPALI_MONTHS_NE.map((mName, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1}. {mName} ({NEPALI_MONTHS_EN[idx]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* BS Day */}
                <div>
                  <label className="text-[11px] font-semibold text-amber-300 block mb-1">
                    गते (Day BS)
                  </label>
                  <select
                    value={bsDay}
                    onChange={(e) => handleBSDateChange(bsYear, bsMonth, Number(e.target.value))}
                    className="w-full bg-amber-950 border border-amber-600 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
                  >
                    {bsDayOptions.map((d) => (
                      <option key={d} value={d}>
                        {d} गते
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AD Date Input */}
          {dateMode === 'AD' && (
            <div className="space-y-2">
              <label className="text-xs text-amber-300/90 font-medium block">
                ईस्वी संवत् (Gregorian AD) जन्ममिति प्रविष्ट गर्नुहोस्:
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => handleADDateChange(e.target.value)}
                className="w-full bg-amber-950 border border-amber-600 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>
          )}

          {/* Live Precision Conversion Result Card */}
          {(() => {
            const weekday = getWeekdayInfo(currentADObj.year, currentADObj.month, currentADObj.day);
            return (
              <div className="bg-gradient-to-r from-amber-950 to-black p-3.5 rounded-xl border border-amber-500/50 shadow-inner flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300">
                      {lang === 'ne' ? 'सटिक रूपान्तरित जन्ममिति र वार (Day):' : 'Converted Birth Date & Day:'}
                    </span>
                    <div className="mt-1 text-amber-100 font-serif text-sm flex flex-wrap items-center gap-2">
                      <span className="font-medium text-amber-200">{formatBSDate(currentBSObj)}</span>
                      <span className="text-amber-400 font-sans font-bold">➔</span>
                      <span className="font-sans font-semibold text-white">{birthDate} AD</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-800/80 border border-amber-600 text-amber-100 font-sans font-bold">
                        {weekday.varaNe} ({weekday.varaEn})
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 px-2 py-1 rounded-md font-medium">
                  ✓ १००% सटिक क्याल्कुलेटर
                </span>
              </div>
            );
          })()}
        </div>

        {/* Time of Birth & Birth Place */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ne' ? 'सटिक जन्म समय (Time - 24Hr)' : 'Time of Birth (Exact)'}</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              required
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-amber-950/60 border border-amber-700/70 rounded-xl px-3.5 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-semibold text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ne' ? 'जन्म स्थान / नेपालका ७७ जिल्ला वा विश्वका देशहरू' : 'Birth Place / Nepal 77 Districts & World Countries'}</span>
                <span className="text-red-400">*</span>
              </span>
              <span className="text-[11px] text-amber-400/90 font-normal">
                {lang === 'ne' ? '७७ जिल्ला र विश्वका देशहरू उपलब्ध' : '77 Districts & World Countries'}
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                required
                value={birthPlace}
                onChange={(e) => {
                  setBirthPlace(e.target.value);
                  setSearchQuery(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder={lang === 'ne' ? 'नेपालको कुनै पनि जिल्ला वा विश्वको देश खोज्नुहोस् (उदा. झापा, संखुवासभा, टोकियो, लण्डन...)' : 'Search any district of Nepal or world country (e.g. Kathmandu, London, New York...)'}
                className="w-full bg-amber-950/70 border border-amber-600/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
              />
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3 pointer-events-none" />
              {birthPlace && (
                <button
                  type="button"
                  onClick={() => {
                    setBirthPlace('');
                    setSearchQuery('');
                    setShowCityDropdown(true);
                  }}
                  className="absolute right-2.5 top-2.5 text-amber-400 hover:text-amber-200 p-0.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selected Location Confirmation Pill */}
            {birthPlace && (
              <div className="text-[11px] text-amber-300/90 bg-amber-900/30 border border-amber-700/50 rounded-lg px-2.5 py-1 flex items-center justify-between gap-2 flex-wrap">
                <span className="truncate">
                  📍 <strong className="text-amber-200">{birthPlace}</strong>
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E | UTC{timezone >= 0 ? `+${timezone}` : timezone}
                </span>
              </div>
            )}

            {/* Rich City & District Preset Dropdown */}
            {showCityDropdown && (
              <div className="absolute z-40 left-0 right-0 mt-1 max-h-80 overflow-hidden bg-gradient-to-b from-amber-950 via-slate-950 to-black border-2 border-amber-600/90 rounded-2xl shadow-2xl flex flex-col backdrop-blur-md">
                {/* Header & Filter Tabs */}
                <div className="p-2.5 bg-amber-900/40 border-b border-amber-800/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ne' ? 'नेपालका ७७ जिल्ला तथा विश्वका देशहरू चयन गर्नुहोस्:' : 'Select Nepal District or World Country:'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCityDropdown(false)}
                      className="text-amber-400 hover:text-amber-100 text-xs px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800"
                    >
                      ✕ {lang === 'ne' ? 'बन्द' : 'Close'}
                    </button>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPlaceCategory('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                        placeCategory === 'all'
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                      }`}
                    >
                      {lang === 'ne' ? 'सबै (All)' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceCategory('nepal')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
                        placeCategory === 'nepal'
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                      }`}
                    >
                      <span>🇳🇵</span>
                      <span>{lang === 'ne' ? 'नेपाल (७७ जिल्ला)' : 'Nepal (77 Districts)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceCategory('world')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
                        placeCategory === 'world'
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                      }`}
                    >
                      <span>🌍</span>
                      <span>{lang === 'ne' ? 'विश्वका देशहरू' : 'World Countries'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceCategory('india')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
                        placeCategory === 'india'
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                      }`}
                    >
                      <span>🇮🇳</span>
                      <span>{lang === 'ne' ? 'भारत' : 'India'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaceCategory('gulf')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
                        placeCategory === 'gulf'
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                      }`}
                    >
                      <span>🏢</span>
                      <span>{lang === 'ne' ? 'खाडी मुलुक' : 'Gulf'}</span>
                    </button>
                  </div>
                </div>

                {/* Filtered list items */}
                <div className="overflow-y-auto max-h-60 divide-y divide-amber-900/40 p-1">
                  {filteredCities.length === 0 ? (
                    <div className="p-4 text-center text-xs text-amber-400/80">
                      <p>{lang === 'ne' ? 'तपाईँले खोज्नुभएको स्थान फेला परेन।' : 'No matching location found.'}</p>
                      <p className="text-[11px] text-amber-300/60 mt-1">
                        {lang === 'ne' ? 'माथि सिधै आफ्नो स्थानको नाम र तल अक्षांश/देशान्तर लेख्न सक्नुहुन्छ।' : 'You can also type your custom place and set coordinates below.'}
                      </p>
                    </div>
                  ) : (
                    filteredCities.map((city, idx) => {
                      const isNepal = city.countryNe === 'नेपाल' || city.category === 'nepal_district';
                      const isIndia = city.category === 'india';
                      const isGulf = city.category === 'gulf';
                      const icon = isNepal ? '🇳🇵' : isIndia ? '🇮🇳' : isGulf ? '🏢' : '🌍';

                      return (
                        <button
                          key={`${city.nameEn}_${idx}`}
                          type="button"
                          onClick={() => handleSelectCity(city)}
                          className="w-full text-left px-3 py-2 text-xs text-amber-100 hover:bg-amber-800/40 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{icon}</span>
                            <div className="truncate">
                              <div className="font-semibold text-amber-100 group-hover:text-amber-200 truncate">
                                {city.nameNe}
                              </div>
                              <div className="text-[11px] text-amber-400/70 truncate">
                                {city.nameEn}
                                {city.provinceNe && ` • ${city.provinceNe}`}
                                {!isNepal && ` • ${city.countryNe}`}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/60 block">
                              UTC{city.tz >= 0 ? `+${city.tz}` : city.tz}
                            </span>
                            <span className="text-[10px] text-amber-400/60 font-mono mt-0.5 block">
                              {city.lat.toFixed(1)}°, {city.lon.toFixed(1)}°
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer status */}
                <div className="px-3 py-1.5 text-[10px] text-amber-400/80 bg-amber-950 border-t border-amber-900/60 flex items-center justify-between">
                  <span>
                    {lang === 'ne' ? `कुल उपलब्ध: ${filteredCities.length} स्थान` : `Available: ${filteredCities.length} locations`}
                  </span>
                  <span className="text-amber-300">
                    {lang === 'ne' ? 'क्लिक गर्दा स्वतः अक्षांश, देशान्तर र समय क्षेत्र भरिनेछ' : 'Auto-fills Lat, Lon & Timezone'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coordinates Details Grid */}
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-amber-300 block mb-1">अक्षांश (Latitude)</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg p-1.5 text-amber-100"
            />
          </div>
          <div>
            <label className="text-amber-300 block mb-1">देशान्तर (Longitude)</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg p-1.5 text-amber-100"
            />
          </div>
          <div>
            <label className="text-amber-300 block mb-1">समय क्षेत्र (Timezone)</label>
            <input
              type="number"
              step="any"
              value={timezone}
              onChange={(e) => setTimezone(Number(e.target.value))}
              className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg p-1.5 text-amber-100"
            />
          </div>
          <div>
            <label className="text-amber-300 block mb-1">राहु/केतु प्रकार (Node)</label>
            <select
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value as 'true' | 'mean')}
              className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg p-1.5 text-amber-100"
            >
              <option value="true">True Node (वास्तविक)</option>
              <option value="mean">Mean Node (औसत)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-amber-950 font-serif font-bold text-base py-3.5 px-6 rounded-xl shadow-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-950" />
          <span>{submitButtonText || (lang === 'ne' ? 'कुण्डली निर्माण गर्नुहोस्' : 'Generate Kundali')}</span>
        </button>
      </form>
    </div>
  );
};
