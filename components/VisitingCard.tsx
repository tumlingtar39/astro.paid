import React, { useState } from 'react';
import { PANDIT_INFO } from '../data/astrologyData';
import { Language } from '../types';
import { Phone, Mail, MapPin, Sparkles, CheckCircle2, Copy, Check, Award, ExternalLink, X, Calendar, Clock, User, Send, MessageSquare, AlertCircle } from 'lucide-react';

interface VisitingCardProps {
  lang: Language;
  onClose?: () => void;
  isModal?: boolean;
  initialOpenBooking?: boolean;
}

export const VisitingCard: React.FC<VisitingCardProps> = ({ lang, onClose, isModal = false, initialOpenBooking = false }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(initialOpenBooking);

  // Booking Form State
  const [selectedService, setSelectedService] = useState<string>('१. चिना टिपन हेराउने तथा बनाउने');
  const [consultationMode, setConsultationMode] = useState<string>('प्रत्यक्ष (भेटेर गरिने पूजा / परामर्श - Offline In-Person)');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string>('बिहान (Morning 8:00 AM - 11:00 AM)');
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendBookingToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    if (!userName.trim() || !userPhone.trim()) {
      setBookingError(lang === 'ne' ? 'कृपया आफ्नो नाम र फोन नम्बर अनिवार्य भर्नुहोस्।' : 'Please fill in your name and phone number.');
      return;
    }

    const message = `🙏 **ज्योतिष तथा पूजा परामर्श बुकिङ अनुरोध** 🙏
──────────────────────────
• **सेवाको नाम (Service):** ${selectedService}
• **पूजा/परामर्श माध्यम (Mode):** ${consultationMode}
• **ग्राहकको नाम (Name):** ${userName}
• **सम्पर्क फोन (Phone):** ${userPhone}
• **स्थान (Location):** ${userLocation || 'उल्लेख नगरिएको'}
• **रोजेको मिति (Preferred Date):** ${bookingDate || 'नजिकको उपलब्ध मिति'}
• **रोजेको समय (Time Slot):** ${bookingTimeSlot}
• **थप विवरण (Notes):** ${userNotes || 'कुनै छैन'}
──────────────────────────
कृपया मेरो बुकिङ स्वीकृत गरी परामर्शको समय निश्चित गरिदिनुहोला।`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9779863991384?text=${encodedMsg}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    setBookingSuccessMsg(
      lang === 'ne'
        ? 'तपाईँको परामर्श बुकिङ विवरण WhatsApp मा तयार पारिएको छ। मेसेज सेन्ड गरी समय निश्चित गर्नुहोस्।'
        : 'Your booking request details are sent to WhatsApp. Please hit send to confirm your appointment.'
    );
  };

  const cardContent = (
    <div className="relative bg-gradient-to-br from-red-950 via-amber-950 to-orange-950 text-amber-50 rounded-3xl border-2 border-amber-400 shadow-2xl p-5 sm:p-7 max-w-2xl mx-auto overflow-hidden ring-4 ring-amber-500/20">
      {/* Radiant Background Metallic Accents */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-bl-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-tr-full blur-2xl pointer-events-none" />

      {/* Decorative Gold Corner Borders */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />

      {/* Modal Close Button if displayed in Modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-amber-900/90 hover:bg-red-900 text-amber-200 p-2 rounded-full border border-amber-500/80 transition-all z-10 shadow-lg"
          title="Close Card"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Inner Golden Border Frame */}
      <div className="border border-amber-400/60 p-4 sm:p-6 rounded-2xl bg-amber-950/70 backdrop-blur-md space-y-5">

        {/* Card Header & Title */}
        <div className="text-center space-y-2 border-b border-amber-500/40 pb-4">
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-amber-950 border border-amber-300 text-xs px-4 py-1.5 rounded-full font-black shadow-lg uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-950 animate-pulse" />
            <span>{lang === 'ne' ? PANDIT_INFO.centerNameNe : PANDIT_INFO.centerNameEn}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-200 tracking-wide drop-shadow-md">
            {lang === 'ne' ? PANDIT_INFO.centerNameNe : PANDIT_INFO.centerNameEn}
          </h2>

          <div className="text-lg sm:text-xl font-bold font-serif text-amber-100 flex items-center justify-center gap-2">
            <span className="text-amber-400 bg-amber-900/80 px-2 py-0.5 rounded-md border border-amber-500/50 text-sm">ॐ</span>
            <span>{lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}</span>
          </div>

          <p className="text-xs sm:text-sm text-amber-300/90 font-medium max-w-md mx-auto">
            {lang === 'ne' ? PANDIT_INFO.titleNe : PANDIT_INFO.titleEn}
          </p>
        </div>

        {/* Section: Our Services (हाम्रा सेवाहरू) */}
        <div className="space-y-3 bg-gradient-to-b from-amber-900/60 to-amber-950/80 p-4 rounded-xl border border-amber-500/50 shadow-inner">
          <div className="flex items-center justify-between border-b border-amber-700/50 pb-2">
            <h3 className="text-xs sm:text-sm font-bold font-serif text-amber-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'ne' ? 'हाम्रा सेवाहरू (Our Services):' : 'Our Services:'}</span>
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
              {lang === 'ne' ? 'प्रत्यक्ष (In-Person) र E-puja अनलाइन' : 'In-Person & E-Puja Online'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-100">
            {PANDIT_INFO.services.map((service, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-amber-950/80 p-2.5 rounded-lg border border-amber-800/80 hover:border-amber-500/60 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-amber-100/90">{lang === 'ne' ? service.ne : service.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Big Attractive BOOK NOW Call to Action Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-amber-950 to-emerald-950 p-4 rounded-2xl border-2 border-amber-400/90 shadow-xl text-center space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left space-y-0.5">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                {lang === 'ne' ? '⚡ तुरुन्त परामर्श समय सुरक्षित गर्नुहोस्:' : '⚡ Instant Appointment Booking:'}
              </span>
              <h4 className="text-base font-bold font-serif text-amber-100">
                {lang === 'ne' ? 'ज्योतिष तथा पूजा परामर्श बुकिङ' : 'Book Astrology & Puja Consultation'}
              </h4>
            </div>

            <button
              onClick={() => {
                setShowBookingModal(true);
                setBookingSuccessMsg(null);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-amber-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg border-2 border-amber-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce-short"
            >
              <Calendar className="w-4 h-4 text-amber-950" />
              <span>{lang === 'ne' ? '📅 अहिले बुकिङ गर्नुहोस् (Book Now)' : '📅 Book Consultation Now'}</span>
            </button>
          </div>
        </div>

        {/* Section: Contact Details (सम्पर्क) */}
        <div className="space-y-3 bg-amber-900/40 p-4 rounded-xl border border-amber-700/50">
          <h3 className="text-xs sm:text-sm font-bold font-serif text-amber-300 flex items-center gap-2 border-b border-amber-700/40 pb-2">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === 'ne' ? 'सम्पर्क विवरण (Contact Details):' : 'Contact Details:'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            {/* Phones */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-950/90 p-3 rounded-xl border border-amber-800/80">
              <div className="flex items-center gap-2 text-amber-200">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-amber-400 font-bold block">{lang === 'ne' ? 'मोबाइल नम्बर:' : 'Mobile Numbers:'}</span>
                  <strong className="text-xs sm:text-sm text-amber-100 font-mono">9863991384 / 9805674119</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/9779863991384"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-600 text-emerald-50 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => handleCopy('9863991384, 9805674119', 'phone')}
                  className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 px-2.5 py-1.5 rounded-lg border border-amber-700/60 transition-all text-xs flex items-center gap-1"
                  title="Copy Numbers"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-950/90 p-3 rounded-xl border border-amber-800/80">
              <div className="flex items-center gap-2 text-amber-200">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-amber-400 font-bold block">{lang === 'ne' ? 'इमेल ठेगाना:' : 'Email Address:'}</span>
                  <strong className="text-xs text-amber-100 font-mono">{PANDIT_INFO.email}</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${PANDIT_INFO.email}`}
                  className="bg-amber-800 hover:bg-amber-700 text-amber-100 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all border border-amber-600/50"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Email</span>
                </a>
                <button
                  onClick={() => handleCopy(PANDIT_INFO.email, 'email')}
                  className="bg-amber-900/80 hover:bg-amber-800 text-amber-200 px-2.5 py-1.5 rounded-lg border border-amber-700/60 transition-all text-xs flex items-center gap-1"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 bg-amber-950/90 p-3 rounded-xl border border-amber-800/80 text-xs text-amber-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{PANDIT_INFO.contactLocation}</span>
            </div>
          </div>
        </div>

        {/* Card Footer Tagline */}
        <div className="text-center pt-2 text-[11px] text-amber-400/90 font-serif border-t border-amber-700/40">
          {lang === 'ne'
            ? '॥ धर्मो रक्षति रक्षितः ॥ - प्रत्यक्ष तथा अनलाइन पूजा एवं ज्योतिष परामर्श'
            : '॥ Dharmo Rakshati Rakshitah ॥ - Direct & Online Astrology Consultation'}
        </div>

      </div>

      {/* DETAILED BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-amber-50 rounded-3xl border-2 border-amber-400 shadow-2xl p-5 sm:p-7 max-w-lg w-full relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Close */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 bg-amber-900 hover:bg-red-900 text-amber-200 p-2 rounded-full border border-amber-600 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 border-b border-amber-700/60 pb-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500 font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ne' ? 'अनलाइन परामर्श बुकिङ फारम' : 'Online Appointment Booking'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-200">
                {lang === 'ne' ? PANDIT_INFO.centerNameNe : PANDIT_INFO.centerNameEn}
              </h3>
              <p className="text-xs text-amber-300/80">
                {lang === 'ne' ? 'सेवा छनौट गरी परामर्शको मिति र समय छान्नुहोस्:' : 'Select service, date & time slot for consultation:'}
              </p>
            </div>

            {bookingSuccessMsg ? (
              <div className="bg-emerald-950/90 p-5 rounded-2xl border border-emerald-500/80 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
                  {bookingSuccessMsg}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <a
                    href="https://wa.me/9779863991384"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp मा सन्देश पठाउनुहोस्</span>
                  </a>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingSuccessMsg(null);
                    }}
                    className="bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs px-4 py-2.5 rounded-xl font-bold border border-amber-700"
                  >
                    बन्द गर्नुहोस्
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendBookingToWhatsApp} className="space-y-3 text-xs">
                {/* 1. Service Selection */}
                <div>
                  <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ne' ? '१. बुकिङ गर्न चाहेको सेवा (Select Service):' : '1. Service Needed:'}</span>
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2.5 text-amber-100 text-xs focus:outline-none focus:border-amber-400 font-medium"
                  >
                    {PANDIT_INFO.services.map((s, i) => (
                      <option key={i} value={lang === 'ne' ? s.ne : s.en}>
                        {lang === 'ne' ? s.ne : s.en}
                      </option>
                    ))}
                    <option value="७. अन्य विशेष परामर्श">{lang === 'ne' ? '७. अन्य विशेष परामर्श (Other Consultation)' : '7. Other Custom Consultation'}</option>
                  </select>
                </div>

                {/* 2. Consultation / Puja Mode */}
                <div>
                  <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ne' ? '२. पूजा / परामर्शको प्रकार (Mode of Puja & Consultation):' : '2. Mode of Puja & Consultation:'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${consultationMode.includes('प्रत्यक्ष') ? 'bg-amber-900/80 border-amber-400 text-amber-100' : 'bg-amber-950/60 border-amber-800/80 text-amber-300/80'}`}>
                      <input
                        type="radio"
                        name="consultationMode"
                        value="प्रत्यक्ष (भेटेर गरिने पूजा / परामर्श - Offline In-Person)"
                        checked={consultationMode.includes('प्रत्यक्ष')}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className="accent-amber-400"
                      />
                      <span className="font-bold text-xs">{lang === 'ne' ? '🤝 प्रत्यक्ष (भेटेर गरिने पूजा / परामर्श)' : '🤝 In-Person / Offline Puja & Visit'}</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${consultationMode.includes('E-puja') ? 'bg-amber-900/80 border-amber-400 text-amber-100' : 'bg-amber-950/60 border-amber-800/80 text-amber-300/80'}`}>
                      <input
                        type="radio"
                        name="consultationMode"
                        value="अनलाइन (E-puja / अनलाइन पूजा तथा भर्चुअल परामर्श - Online)"
                        checked={consultationMode.includes('E-puja')}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className="accent-amber-400"
                      />
                      <span className="font-bold text-xs">{lang === 'ne' ? '🌐 E-puja / अनलाइन अनुष्ठान' : '🌐 E-Puja & Remote Online'}</span>
                    </label>
                  </div>
                </div>

                {/* 3. Date and Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ne' ? '३. रोजेको मिति (Preferred Date):' : '3. Preferred Date:'}</span>
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ne' ? '४. समय तालिका (Time Slot):' : '4. Time Slot:'}</span>
                    </label>
                    <select
                      value={bookingTimeSlot}
                      onChange={(e) => setBookingTimeSlot(e.target.value)}
                      className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400 font-medium"
                    >
                      <option value="बिहान (Morning 8:00 AM - 11:00 AM)">बिहान (Morning 8:00 - 11:00 AM)</option>
                      <option value="दिउँसो (Afternoon 12:00 PM - 3:00 PM)">दिउँसो (Afternoon 12:00 - 3:00 PM)</option>
                      <option value="साँझ (Evening 4:00 PM - 7:00 PM)">साँझ (Evening 4:00 - 7:00 PM)</option>
                      <option value="राति (Night 7:30 PM - 9:30 PM)">राति (Night 7:30 - 9:30 PM)</option>
                    </select>
                  </div>
                </div>

                {/* 4. User Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ne' ? '५. तपाईँको नाम (Your Name) *:' : '5. Your Name *:'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'ne' ? 'उदा: राम बहादुर श्रेष्ठ' : 'e.g. Ram Bahadur Shrestha'}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ne' ? '६. फोन / WhatsApp *:' : '6. Phone / WhatsApp *:'}</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={lang === 'ne' ? 'उदा: 98XXXXXXXX' : 'e.g. 98XXXXXXXX'}
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ne' ? '७. स्थान / ठेगाना (Location):' : '7. Location:'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ne' ? 'उदा: काठमाडौँ, नेपाल / विदेश' : 'e.g. Kathmandu / Abroad'}
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="w-full bg-amber-950 border border-amber-700/80 rounded-xl px-3 py-2 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-amber-300 mb-1">
                    {lang === 'ne' ? '८. समस्या वा विशेष अनुरोध (Notes / Details):' : '8. Special Request / Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'ne' ? 'कुनै विशेष समस्या वा जानकारी भए लेख्नुहोस्...' : 'Describe any specific issue or requirements...'}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full bg-amber-950 border border-amber-700/80 rounded-xl p-2.5 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {bookingError && (
                  <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500/70 text-red-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 border border-emerald-400/80 transition-all mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'WhatsApp मा बुकिङ पठाउनुहोस्' : 'Send Booking via WhatsApp'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

