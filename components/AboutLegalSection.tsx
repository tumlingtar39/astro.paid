import React, { useState } from 'react';
import { PANDIT_INFO } from '../data/astrologyData';
import { Language } from '../types';
import { VisitingCard } from './VisitingCard';
import { ShieldCheck, Info, FileText, Phone, Mail, MapPin, Scale, Sparkles, CheckCircle2, Lock, Award, BookOpen, Calendar } from 'lucide-react';

interface AboutLegalSectionProps {
  lang: Language;
}

export const AboutLegalSection: React.FC<AboutLegalSectionProps> = ({ lang }) => {
  const [showGuruBookingModal, setShowGuruBookingModal] = useState<boolean>(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 p-6 rounded-3xl border border-amber-700/70 shadow-2xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-900/80 text-amber-300 border border-amber-600/60 text-xs px-3.5 py-1 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ne' ? 'आधिकारिक परिचय र कानुनी सूचना' : 'Official Credentials & Legal Notice'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100">
          {lang === 'ne' ? 'हाम्रो बारेमा र कानुनी सूचना (About Us & Legal Notice)' : 'About Us & Legal Information'}
        </h1>
        <p className="text-xs sm:text-sm text-amber-300/90 max-w-2xl mx-auto leading-relaxed">
          {lang === 'ne'
            ? 'ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) द्वारा सञ्चालित ज्योतिष परामर्श केन्द्र, वास्तु, आयुर्वेद, अङ्क ज्योतिष र मनोविज्ञान परामर्श प्लेटफर्मको आधिकारिक विवरण र कानुनी नीति।'
            : 'Official background and legal disclosure for Astrology Consultation Center led by Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay).'}
        </p>
      </div>

      {/* Prominent Official Digital Visiting Card */}
      <VisitingCard lang={lang} />

      {/* Section 1: ABOUT US (हाम्रो बारेमा) */}
      <div className="bg-amber-950/80 p-6 sm:p-8 rounded-3xl border border-amber-800/70 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-amber-800/70 pb-4">
          <div className="bg-amber-900/90 p-3 rounded-2xl border border-amber-600/60 shadow-md">
            <Info className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-100">
              {lang === 'ne' ? '१. हाम्रो बारेमा (About Us)' : '1. About Us'}
            </h2>
            <p className="text-xs text-amber-300/80">
              {lang === 'ne' ? 'वैदिक परम्परा र आधुनिक प्रविधिको संगम' : 'Harmonizing Vedic Tradition & AI Technology'}
            </p>
          </div>
        </div>

        {/* Guru Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-amber-900/40 p-5 rounded-2xl border border-amber-800/60">
          <div className="md:col-span-4 text-center space-y-3">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-1 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center text-4xl font-serif font-bold text-amber-300 border border-amber-500/50">
                ॐ
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-amber-100">
                {lang === 'ne' ? PANDIT_INFO.nameNe : PANDIT_INFO.nameEn}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {lang === 'ne' ? PANDIT_INFO.titleNe : PANDIT_INFO.titleEn}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 text-[11px] px-3 py-1 rounded-full border border-emerald-700/60 font-semibold">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ne' ? 'प्रमाणित वैदिक ज्योतिषाचार्य' : 'Verified Vedic Scholar'}</span>
            </div>
          </div>

          <div className="md:col-span-8 space-y-3 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <p>
              {lang === 'ne'
                ? 'ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) नेपालका प्रतिष्ठित, युवा तथा अनुभवी वैदिक ज्योतिषाचार्य र वास्तुविद् हुनुहुन्छ। उहाँले प्राचीन पूर्वीय ज्योतिष शास्त्र, पराशर सिद्धान्त, वैदिक नक्षत्र ज्योतिष, वास्तु विज्ञान र अङ्कशास्त्रको गहिरो अध्ययन र अनुसन्धान गर्नुभएको छ।'
                : 'Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay) is a renowned Vedic scholar, astrologer, and Vastu expert based in Nepal. He specializes in Parashari Astrology, Nakshatra Paddhati, Vastu Vidya, and Numerology.'}
            </p>
            <p>
              {lang === 'ne'
                ? 'यस मोबाइल तथा वेब एप्लिकेसनमार्फत उहाँको ज्ञान र अत्याधुनिक एआई (Artificial Intelligence) प्रविधिलाई मिलाएर देश तथा विदेशमा रहेका सनातन धर्मावलम्बीहरूका लागि प्रत्यक्ष जन्मकुण्डली निर्माण, गुण मिलान, दैनिक राशिफल र वास्तु परामर्श सहज रूपमा उपलब्ध गराइएको छ।'
                : 'Through this application, traditional Vedic wisdom is augmented with generative AI to offer instant horoscope analysis, matchmaking, daily panchang & rashifal, and Vastu diagnostics globally.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2 bg-amber-950/70 p-2.5 rounded-xl border border-amber-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ne' ? 'प्रमाणित गणितीय पञ्चाङ्ग गणना' : 'Astronomically Precise Panchang'}</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-950/70 p-2.5 rounded-xl border border-amber-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ne' ? '२४/७ AI गुरु परामर्श सेवा' : '24/7 AI Guru Consultation Service'}</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-950/70 p-2.5 rounded-xl border border-amber-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ne' ? 'पूर्ण गोपनीयता र सुरक्षा' : '100% Privacy & Data Protection'}</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-950/70 p-2.5 rounded-xl border border-amber-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'ne' ? 'विश्वव्यापी परामर्श सुविधा' : 'Global Online Consultation'}</span>
              </div>
            </div>

            {/* Direct Book Now Button in Guru Parichaya */}
            <div className="pt-3">
              <button
                onClick={() => setShowGuruBookingModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black px-6 py-3 rounded-xl shadow-xl border-2 border-amber-200 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Calendar className="w-4 h-4 text-amber-950" />
                <span>{lang === 'ne' ? '📅 गुरुसँग प्रत्यक्ष/अनलाइन परामर्श बुकिङ गर्नुहोस् (Book Now)' : '📅 Book Consultation with Guru Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal if triggered */}
        {showGuruBookingModal && (
          <VisitingCard
            lang={lang}
            isModal={true}
            initialOpenBooking={true}
            onClose={() => setShowGuruBookingModal(false)}
          />
        )}
      </div>

      {/* Section 2: LEGAL NOTICE & DISCLAIMER (कानुनी सूचना र अस्वीकरण) */}
      <div className="bg-amber-950/80 p-6 sm:p-8 rounded-3xl border border-amber-800/70 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-amber-800/70 pb-4">
          <div className="bg-rose-950/90 p-3 rounded-2xl border border-rose-700/60 shadow-md">
            <Scale className="w-7 h-7 text-rose-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-100">
              {lang === 'ne' ? '२. कानुनी सूचना, शर्त तथा अस्वीकरण (Legal Notice & Terms)' : '2. Legal Notice & Terms of Use'}
            </h2>
            <p className="text-xs text-amber-300/80">
              {lang === 'ne' ? 'सेवा प्रयोग सम्बन्धी कानुनी जानकारी तथा दायित्व' : 'Legal disclosures, disclaimers, and privacy conditions'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          {/* Sub-item A: General Terms & Purpose */}
          <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/60 space-y-1.5">
            <h3 className="font-bold text-amber-200 flex items-center gap-2 text-sm font-serif">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'क. सेवाको उद्देश्य र प्रयोग (Purpose of Service)' : 'A. General Service Scope'}</span>
            </h3>
            <p>
              {lang === 'ne'
                ? 'यस एप्लिकेसनमा उपलब्ध गराइएका ज्योतिषीय फलादेश, कुण्डली मिलान, अंक ज्योतिष, वास्तु सुझाव, र दैनिक राशिफल वैदिक गणना र एआई एल्गोरिदममा आधारित छन्। यी सेवाहरू प्रयोगकर्ताको मार्गदर्शन, सांस्कृतिक आस्था र वैदिक ज्ञान प्रवर्द्धनका लागि प्रस्तुत गरिएका हुन्।'
                : 'Astrological predictions, kundali matching, numerology reports, Vastu guidelines, and daily horoscopes are provided for spiritual guidance, personal growth, and educational purposes based on traditional algorithms and AI.'}
            </p>
          </div>

          {/* Sub-item B: Financial & Legal Disclaimer */}
          <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/60 space-y-1.5">
            <h3 className="font-bold text-amber-200 flex items-center gap-2 text-sm font-serif">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'ख. वित्तीय, कानुनी र व्यक्तिगत निर्णय अस्वीकरण (Financial & Decision Disclaimer)' : 'B. Financial & Legal Decision Disclaimer'}</span>
            </h3>
            <p>
              {lang === 'ne'
                ? 'राशिफल वा कुण्डलीमा उल्लिखित वित्तीय वा व्यापारिक सम्भावनाहरू संकेत मात्र हुन्। सेयर बजार लगानी, घरजग्गा खरिद वा कानुनी निर्णयहरू गर्दा प्रयोगकर्ताले आफ्नै विवेक र सम्बन्धित क्षेत्रका विज्ञहरूको सल्लाह लिनुपर्छ। अनुप्रयोगका फलादेशका आधारमा गरिएका व्यक्तिगत वा वित्तीय नोक्सानीको लागि यो एप्लिकेसन वा ज्योतिषाचार्य कानुनी रूपमा जिम्मेवार हुने छैनन्।'
                : 'Financial predictions, investment opportunities, and general predictions are symbolic guidelines. Users are advised to exercise independent judgment and consult qualified legal/financial advisors before making investments or binding decisions.'}
            </p>
          </div>

          {/* Sub-item D: Privacy Policy */}
          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/60 space-y-1.5">
            <h3 className="font-bold text-emerald-200 flex items-center gap-2 text-sm font-serif">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ne' ? 'घ. गोपनीयता नीति र तथ्याङ्क सुरक्षा (Privacy & Data Protection)' : 'D. Privacy Policy & Confidentiality'}</span>
            </h3>
            <p>
              {lang === 'ne'
                ? 'हामी प्रयोगकर्ताको व्यक्तिगत विवरण (नाम, जन्म मिति, समय, स्थान र कुराकानी) को पूर्ण गोपनीयताको ग्यारेन्टी गर्दछौँ। तपाईँका व्यक्तिगत विवरणहरू कुनै पनि तेस्रो पक्ष (Third Party) लाई बिक्री वा सेयर गरिने छैन।'
                : 'We strictly respect your privacy. Personal details such as name, birth metrics, location, and conversation history are encrypted and never shared or sold to third parties.'}
            </p>
          </div>

          {/* Sub-item E: Intellectual Property */}
          <div className="bg-amber-900/40 p-4 rounded-2xl border border-amber-800/60 space-y-1.5">
            <h3 className="font-bold text-amber-200 flex items-center gap-2 text-sm font-serif">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ne' ? 'ङ. बौद्धिक सम्पत्ति र सर्वाधिकार (Intellectual Property & Copyright)' : 'E. Intellectual Property Rights'}</span>
            </h3>
            <p>
              {lang === 'ne'
                ? 'यस एप्लिकेसनमा रहेका सामग्री, लोगो, पञ्चाङ्ग अल्गोरिदम, एआई मोडेल इन्टिग्रेसन र डिजाइनको सम्पूर्ण सर्वाधिकार ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) मा सुरक्षित छ। बिना अनुमति यसको व्यावसायिक प्रतिलिपि वा दुरुपयोग गर्न पाइने छैन।'
                : 'All contents, logos, custom algorithms, design elements, and trademark branding are copyrighted by Pandit Shambhu Prasad Lamsal (Binay). Unauthorized commercial reproduction is strictly prohibited.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: OFFICIAL CONTACT & DIRECT CONSULTATION */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-6 rounded-3xl border border-amber-700/80 shadow-xl space-y-4">
        <h2 className="text-lg font-bold font-serif text-amber-100 flex items-center gap-2 text-center sm:text-left">
          <Phone className="w-5 h-5 text-amber-400" />
          <span>{lang === 'ne' ? '३. प्रत्यक्ष सम्पर्क र व्यक्तिगत परामर्श (Official Contact & Office Location)' : '3. Official Contact & Appointments'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <a
            href="https://wa.me/9779863991384"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-700/60 flex items-center gap-3 hover:bg-emerald-900/80 transition-colors group"
          >
            <div className="bg-emerald-900/90 p-2.5 rounded-xl border border-emerald-500/50 text-emerald-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold block">WhatsApp / Viber:</span>
              <strong className="text-sm text-emerald-100">{PANDIT_INFO.whatsappPhone}</strong>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">{lang === 'ne' ? 'प्रत्यक्ष मेसेज गर्नुहोस्' : 'Direct Message'}</p>
            </div>
          </a>

          <a
            href="tel:+9779805674119"
            className="bg-amber-900/60 p-4 rounded-2xl border border-amber-700/60 flex items-center gap-3 hover:bg-amber-800/80 transition-colors group"
          >
            <div className="bg-amber-800/80 p-2.5 rounded-xl border border-amber-500/50 text-amber-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold block">Direct Call Line:</span>
              <strong className="text-sm text-amber-100">{PANDIT_INFO.callPhone}</strong>
              <p className="text-[10px] text-amber-300/80 mt-0.5">{lang === 'ne' ? 'सोझै फोन सम्पर्क' : 'Call Office'}</p>
            </div>
          </a>

          <div className="bg-amber-900/60 p-4 rounded-2xl border border-amber-700/60 flex items-center gap-3">
            <div className="bg-amber-800/80 p-2.5 rounded-xl border border-amber-500/50 text-amber-300 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold block">Office Address:</span>
              <strong className="text-xs text-amber-100 block">{PANDIT_INFO.contactLocation}</strong>
              <p className="text-[10px] text-amber-300/80 mt-0.5">{lang === 'ne' ? 'काठमाडौँ, नेपाल' : 'Kathmandu, Nepal'}</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-amber-400/80">
          {lang === 'ne'
            ? '© २०८१ - २०८३ सर्वधिकार सुरक्षित: ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay)'
            : '© 2024 - 2026 All Rights Reserved: Pandit Shambhu Prasad Lamsal (Binay)'}
        </div>
      </div>
    </div>
  );
};
