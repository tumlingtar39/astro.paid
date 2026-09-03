import { RashifalItem, Language } from '../types';

export interface RashiForecastDetail {
  rashi: string;
  englishName: string;
  symbol: string;
  element: string;
  lordNe: string;
  lordEn: string;
  
  weekly: {
    predictionNe: string;
    predictionEn: string;
    careerNe: string;
    careerEn: string;
    loveNe: string;
    loveEn: string;
    healthNe: string;
    healthEn: string;
    financeNe: string;
    financeEn: string;
    luckyNumber: number;
    luckyColorNe: string;
    luckyColorEn: string;
    rating: number;
    remedyNe: string;
    remedyEn: string;
  };

  monthly: {
    predictionNe: string;
    predictionEn: string;
    careerNe: string;
    careerEn: string;
    loveNe: string;
    loveEn: string;
    healthNe: string;
    healthEn: string;
    financeNe: string;
    financeEn: string;
    luckyNumber: number;
    luckyColorNe: string;
    luckyColorEn: string;
    rating: number;
    remedyNe: string;
    remedyEn: string;
  };

  yearly: {
    predictionNe: string;
    predictionEn: string;
    careerNe: string;
    careerEn: string;
    loveNe: string;
    loveEn: string;
    healthNe: string;
    healthEn: string;
    financeNe: string;
    financeEn: string;
    luckyNumber: number;
    luckyColorNe: string;
    luckyColorEn: string;
    rating: number;
    remedyNe: string;
    remedyEn: string;
  };
}

export const ALL_RASHI_FORECASTS: RashiForecastDetail[] = [
  // 1. मेष (Aries)
  {
    rashi: 'मेष',
    englishName: 'Aries',
    symbol: '♈',
    element: 'Fire',
    lordNe: 'मङ्गल',
    lordEn: 'Mars',
    weekly: {
      predictionNe: 'यो साता मेष राशी हुनेहरूका लागि पराक्रम र ऊर्जा उच्च रहनेछ। मङ्गल र सूर्यको अनुकूलताले रोकिएका प्रशासनिक कामहरू अघि बढ्नेछन्। मङ्गलबार र बुधबार नयाँ सम्झौताका लागि अति शुभ दिन छन्। साताको अन्त्यतिर केही खर्च बढे पनि लाभ पर्याप्त हुनेछ।',
      predictionEn: 'High vitality and enthusiasm for Aries this week. Mars and Sun alignments speed up administrative clearances. Tuesday and Wednesday are ideal for crucial agreements.',
      careerNe: 'साताको पूर्वाद्र्धमा नयाँ जिम्मेवारी वा पदभार प्राप्त हुनेछ। ठेक्कापट्टा, सुरक्षा निकाय, इञ्जिनियरिङ तथा व्यापारमा उच्च सफलता मिल्नेछ।',
      careerEn: 'Leadership appointments and strong headway in engineering, contracting, security, and trade ventures.',
      loveNe: 'दाम्पत्य जीवनमा मधुरता छाउनेछ। नयाँ प्रेम प्रस्ताव आउन सक्छ। परिवारको पूर्ण साथ र समर्थन पाइनेछ।',
      loveEn: 'Harmonious domestic bliss. Favorable timing for fresh romantic expressions and joyful family support.',
      healthNe: 'शारीरिक स्फूर्ति उच्च रहनेछ। रक्तचाप तथा टाउको दुखाइबाट बच्न पर्याप्त जल र विश्राम लिनुहोला।',
      healthEn: 'Energetic and resilient. Stay hydrated and avoid excess physical strain mid-week.',
      financeNe: 'आर्थिक दृष्टिले साता फलदायी छ। व्यापारिक यात्रा र पुराना लगानीबाट आकस्मिक धनलाभ हुने योग छ।',
      financeEn: 'Lucrative financial inflows from commercial travels and recovery of delayed receivables.',
      luckyNumber: 9,
      luckyColorNe: 'रातो र केसरी',
      luckyColorEn: 'Crimson Red & Saffron',
      rating: 5,
      remedyNe: 'मङ्गलबार हनुमान चालिसा पाठ गरी रातो फल वा सिन्दूर अर्पण गर्नुहोस्।',
      remedyEn: 'Chant Hanuman Chalisa on Tuesday and offer red fruits to Lord Hanuman.'
    },
    monthly: {
      predictionNe: 'यो महिना मेष राशीका लागि नयाँ कीर्तिमान कायम गर्ने समय छ। भाग्यस्थानमा शुभ ग्रहको दृष्टिले लामो समयदेखि रोकिएका वैदेशिक तथा शैक्षिक योजनाहरू सफल हुनेछन्। महिनाको पहिलो पक्ष विशेष गतिशील रहनेछ।',
      predictionEn: 'A benchmark month for Aries with fortune favoring long-standing overseas and academic pursuits.',
      careerNe: 'उद्योग, प्रविधि र व्यवस्थापकीय पदहरूमा अग्रता हासिल हुनेछ। सहकर्मीहरू तपाईँको नेतृत्वको सम्मान गर्नेछन्।',
      careerEn: 'Key breakthroughs in technology, industrial ventures, and administrative roles.',
      loveNe: 'पारिवारिक सम्बन्धमा सुख-शान्ति छाउनेछ। घरमा शुभ माङ्गलिक कार्यको चर्चा चल्नेछ।',
      loveEn: 'Peaceful domestic life with lively preparations for auspicious family ceremonies.',
      healthNe: 'आरोग्य राम्रो रहनेछ। मौसम अनुकूल खानपान र बिहानको व्यायामले थप ऊर्जा दिनेछ।',
      healthEn: 'Robust vitality. Balanced seasonal diet and morning yoga ensure sound health.',
      financeNe: 'सञ्चित कोषमा वृद्धि हुनेछ। घर-जग्गा वा नयाँ सवारी साधन जोड्ने योजना बन्नेछ।',
      financeEn: 'Expansion of fixed assets, real estate investments, and strong savings growth.',
      luckyNumber: 1,
      luckyColorNe: 'गाढा रातो र सुनौलो',
      luckyColorEn: 'Deep Red & Gold',
      rating: 5,
      remedyNe: 'प्रत्येक मङ्गलबार गणेशजीलाई २१ मुठा दूबो अर्पण गरी ॐ भौमाय नमः जप गर्नुहोस्।',
      remedyEn: 'Offer 21 blades of Durva grass to Lord Ganesha every Tuesday and chant Om Bhaumaya Namah.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ मेष राशीका लागि ऐतिहासिक सफलता, सामाजिक प्रतिष्ठा र भाग्यवृद्धिको स्वर्णिम वर्ष रहनेछ। बृहस्पति (गुरु) को नवम-पञ्चम दृष्टि र अनुकूल गोचरले वर्षभरि मान-सम्मान, राज्यपक्षबाट सहयोग र नयाँ उचाइ दिलाउनेछ।',
      predictionEn: 'Year 2083 BS promises extraordinary fortune, elevated social status, and sustained victories for Aries.',
      careerNe: 'पहिलो चौमासिक (वैशाख-साउन) मा पदोन्नति, दोस्रो चौमासिक (भदौ-मंसिर) मा वैदेशिक विस्तार, र तेस्रो चौमासिकमा ठूला पुरस्कार वा राज्यस्तरको सम्मान प्राप्त हुनेछ।',
      careerEn: 'Q1 brings high-level promotions, Q2 expands overseas enterprise, and Q3/Q4 solidifies public honors.',
      loveNe: 'विवाहयोग्य जातिका लागि शुभ लगन जुर्नेछ। सन्तान सुख र दाम्पत्य आत्मीयतामा नयाँ आयाम थपिनेछ।',
      loveEn: 'Auspicious marriage timings for eligible singles and joyful blessings of progeny.',
      healthNe: 'समग्र वर्ष स्वास्थ्य सबल रहनेछ। नियमित अध्यात्म र प्राणायामले मानसिक तनावबाट टाढा राख्नेछ।',
      healthEn: 'Sound physical health and mental clarity supported by daily spiritual practice.',
      financeNe: 'आर्थिक दृष्टिकोणले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा उल्लेख्य वृद्धि हुनेछ।',
      financeEn: 'Remarkable accumulation of capital, property additions, and diversified investment returns.',
      luckyNumber: 9,
      luckyColorNe: 'रातो, केसरी र सुनौलो',
      luckyColorEn: 'Red, Saffron & Gold',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य हनुमान अष्टक पाठ गर्नुहोस् र वर्षमा एक पटक विधिपूर्वक रुद्राभिषेक गराउनुहोस्।',
      remedyEn: 'Recite Hanuman Ashtak daily and perform Rudrabhishek once during the year.'
    }
  },

  // 2. वृष (Taurus)
  {
    rashi: 'वृष',
    englishName: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    lordNe: 'शुक्र',
    lordEn: 'Venus',
    weekly: {
      predictionNe: 'वृष राशी हुनेहरूका लागि यो साता आर्थिक सुदृढीकरण र पारिवारिक सौहार्दताको रहनेछ। शुक्रको शुभ प्रभावले कला, फेसन, सौन्दर्य र मनोरञ्जनका क्षेत्रमा विशेष लाभ मिल्नेछ। बुधबार र शुक्रबार विशेष फलदायी छन्।',
      predictionEn: 'A prosperous and harmonious week for Taurus. Venus bestows fruitful gains in arts, design, commerce, and lifestyle sectors.',
      careerNe: 'बैंकिङ, वित्तीय संस्था, डिजाइन र सञ्चार क्षेत्रमा नयाँ उचाइ हासिल हुनेछ। वरिष्ठ अधिकारीको प्रशंसा पाइनेछ।',
      careerEn: 'Excellent growth in finance, banking, creative design, and corporate communications.',
      loveNe: 'दाम्पत्य जीवनमा रोमान्स र आपसी समझदारी बढ्नेछ। प्रियजनसँग मिष्ठान्न भोजन र रमाइलो भेटघाट हुनेछ।',
      loveEn: 'Intimate and affectionate partnership. Delightful gatherings and fine dining with loved ones.',
      healthNe: 'घाँटी तथा कफ सम्बन्धी सामान्य समस्या देखिन सक्छ, चिसो पेयबाट जोगिनुहोला।',
      healthEn: 'Watch out for minor throat or sinus sensitivity; favor warm fluids and balanced meals.',
      financeNe: 'नयाँ लगानीको योजना बन्नेछ। बहुमूल्य वस्तु वा वस्त्र आभूषण खरिदमा खर्च हुन सक्छ।',
      financeEn: 'Favorable timing for systematic investments and acquisition of fine jewelry or decor.',
      luckyNumber: 6,
      luckyColorNe: 'सेतो, गुलाबी र चाँदी',
      luckyColorEn: 'Milky White, Pink & Silver',
      rating: 4,
      remedyNe: 'शुक्रबार श्री महालक्ष्मीको मन्त्र ॐ शुं शुक्राय नमः जप गरी सेतो मिष्ठान्न अर्पण गर्नुहोस्।',
      remedyEn: 'Chant Om Shum Shukraya Namah on Friday and offer white sweets to Goddess Lakshmi.'
    },
    monthly: {
      predictionNe: 'यो महिना वृष राशीका लागि भौतिक सुख, पारिवारिक मेलमिलाप र आम्दानी वृद्धिको समय छ। वाणीको प्रभावले जटिल समस्याहरू सहजै हल हुनेछन्। महिनाको दोस्रो पक्षमा विशेष लाभ मिल्नेछ।',
      predictionEn: 'A rewarding month of domestic comfort, diplomatic success, and expanding financial liquidity for Taurus.',
      careerNe: 'व्यापारिक साझेदारी बलियो हुनेछ। आयात-निर्यात, फेसन तथा खाद्य उद्योगमा उल्लेख्य मुनाफा हुनेछ।',
      careerEn: 'Strengthened business partnerships and impressive profit margins in retail and hospitality.',
      loveNe: 'सम्बन्धमा विश्वास र समर्पण गहिरिनेछ। परिवारका ज्येष्ठ सदस्यहरूको विशेष आशीर्वाद प्राप्त हुनेछ।',
      loveEn: 'Deeper mutual loyalty in marriage. Elders bestow heartfelt goodwill and guidance.',
      healthNe: 'शारीरिक तन्दुरुस्ती सामान्य रहनेछ। सन्तुलित आहार र पर्याप्त निद्रालाई प्राथमिकता दिनुहोला।',
      healthEn: 'Stable health. Regular sleep cycles and clean nutrition keep your vitality high.',
      financeNe: 'सञ्चित धनमा बढोत्तरी हुनेछ। शेयर बजार वा स्थिर सम्पत्तिमा गरेको लगानीबाट राम्रो प्रतिफल प्राप्त हुनेछ।',
      financeEn: 'Substantial boost in liquid savings and lucrative dividends from diversified assets.',
      luckyNumber: 6,
      luckyColorNe: 'सेतो र आसमानी',
      luckyColorEn: 'Pearl White & Sky Blue',
      rating: 4,
      remedyNe: 'प्रत्येक शुक्रबार साना कन्याहरूलाई फलफूल वा खीर खुवाउनुहोस्।',
      remedyEn: 'Feed sweet rice pudding or fresh fruits to young girls on Fridays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ वृष राशीका लागि आर्थिक स्थिरता, घरजग्गा जोड्ने र दीर्घकालीन उन्नतिको वर्ष रहनेछ। शनी र शुक्रको अनुकूलताले रोकिएका महत्वाकांक्षी योजनाहरू कार्यान्वयनमा आउनेछन्।',
      predictionEn: 'Year 2083 BS brings sustained financial consolidation, property acquisition, and corporate triumphs for Taurus.',
      careerNe: 'वर्षको पहिलो खण्डमा नयाँ परियोजनाको सुरुवात, मध्य खण्डमा कार्यक्षेत्र विस्तार र अन्तिम खण्डमा प्रतिष्ठित सफलता हात लाग्नेछ।',
      careerEn: 'Early launch of new enterprises, mid-year corporate scaling, and year-end landmark achievements.',
      loveNe: 'घरायसी जीवन सुखमय रहनेछ। नयाँ घर निर्माण वा गृहप्रवेशको शुभ योग बन्नेछ।',
      loveEn: 'Serene domestic atmosphere with high likelihood of constructing or moving into a dream home.',
      healthNe: 'दीर्घकालीन रोगहरूमा क्रमिक सुधार देखिनेछ। तौल र खानपानमा सन्तुलन कायम राख्नुहोला।',
      healthEn: 'Noticeable relief from chronic ailments through holistic health and mindful lifestyle.',
      financeNe: 'अचल सम्पत्ति र बहुमूल्य धातुमा ठूलो लगानी हुनेछ। आम्दानीका नियमित स्रोतहरू सुदृढ बन्नेछन्।',
      financeEn: 'Major investments in real estate and precious metals with robust continuous cash flow.',
      luckyNumber: 6,
      luckyColorNe: 'सेतो, गुलाबी र हरियो',
      luckyColorEn: 'White, Rose Pink & Emerald Green',
      rating: 4,
      remedyNe: 'वर्षभरि शुक्रबार श्री सूक्तको पाठ गर्नुहोस् र गाईलाई नियमित हरियो घाँस वा रोटी खुवाउनुहोस्।',
      remedyEn: 'Recite Sri Suktam on Fridays and regularly feed cows fresh grass or chapatis.'
    }
  },

  // 3. मिथुन (Gemini)
  {
    rashi: 'मिथुन',
    englishName: 'Gemini',
    symbol: '♊',
    element: 'Air',
    lordNe: 'बुध',
    lordEn: 'Mercury',
    weekly: {
      predictionNe: 'मिथुन राशी हुनेहरूका लागि यो साता बौद्धिक चातुर्य, सञ्चार कला र व्यापारिक सफलताको रहनेछ। बुधको अनुकूलताले परीक्षा, अन्तर्वार्ता तथा अनुसन्धानमूलक कार्यमा विजय मिल्नेछ। बुधबार र बिहीबार विशेष शुभ दिन हुन्।',
      predictionEn: 'A brilliant week for Gemini centered on sharp intellect, effective communication, and commercial growth.',
      careerNe: 'सूचना प्रविधि, पत्रकारिता, शिक्षण र कूटनीतिमा नयाँ अवसरहरू खुल्नेछन्। नयाँ ग्राहक वा सहकार्य जोडिनेछ।',
      careerEn: 'Superb milestones in IT, media, academic writing, and strategic business alliances.',
      loveNe: 'मित्रता प्रेममा बदलिने सम्भावना छ। जीवनसाथीसँग बौद्धिक विमर्श र रमाइलो यात्रा हुनेछ।',
      loveEn: 'Deep mental resonance with partners. Joyful excursions and constructive dialogue.',
      healthNe: 'मानसिक ताजगी र फुर्तिलोपन रहनेछ। आँखा र काँधको विश्रामका लागि स्क्रिन समय घटाउनुहोला।',
      healthEn: 'High mental agility. Moderate digital screen exposure to safeguard eyes and neck posture.',
      financeNe: 'व्यापारमा उल्लेख्य नाफा हुनेछ। अनलाइन कारोबार तथा शेयर बजारबाट आकस्मिक लाभ मिल्नेछ।',
      financeEn: 'Impressive profits from trade, e-commerce transactions, and equities.',
      luckyNumber: 5,
      luckyColorNe: 'हरियो र हल्का पहेँलो',
      luckyColorEn: 'Emerald Green & Pale Yellow',
      rating: 5,
      remedyNe: 'बुधबार गणेशजीलाई दूबो चढाउनुहोस् र ॐ बुं बुधाय नमः १०८ पटक जप गर्नुहोस्।',
      remedyEn: 'Offer Durva grass to Lord Ganesha on Wednesday and chant Om Bum Budhaya Namah 108 times.'
    },
    monthly: {
      predictionNe: 'यो महिना मिथुन राशीका लागि बहुआयामिक अवसर र सामाजिक प्रतिष्ठा अभिवृद्धिको रहनेछ। नयाँ सीप सिक्ने र देश-विदेशका व्यक्तिहरूसँग लाभदायक सम्पर्क विस्तार हुनेछ।',
      predictionEn: 'An expansive month of networking, intellectual triumphs, and professional growth for Gemini.',
      careerNe: 'कम्प्युटर, सफ्टवेयर, कानुनी परामर्श र मार्केटिङमा उल्लेखनीय प्रगति हुनेछ। नयाँ सम्झौतामा हस्ताक्षर हुनेछ।',
      careerEn: 'Major breakthroughs in software, legal advisory, and high-impact marketing initiatives.',
      loveNe: 'पारिवारिक सम्बन्धमा मिठास आउनेछ। सन्तानको प्रगतिले मन प्रफुल्लित बनाउनेछ।',
      loveEn: 'Joyful family harmony and pride in children’s academic or extracurricular achievements.',
      healthNe: 'स्नायु र श्वासप्रश्वास प्रणाली सबल रहनेछ। प्राणायाम र ध्यानले एकाग्रता थप बढाउनेछ।',
      healthEn: 'Clear respiratory and nervous health. Pranayama reinforces laser-sharp focus.',
      financeNe: 'आर्थिक स्थिति सुदृढ बन्नेछ। व्यापारिक नयाँ शाखाहरू खोल्न वा लगानी बढाउन अनुकूल समय छ।',
      financeEn: 'Robust cash flows and favorable timing for venture capital or branch expansion.',
      luckyNumber: 5,
      luckyColorNe: 'गाढा हरियो र फिरोजा',
      luckyColorEn: 'Forest Green & Turquoise',
      rating: 5,
      remedyNe: 'प्रत्येक बुधबार गाईलाई हरियो घाँस खुवाउनुहोस् र तुलसीको पातमा जल चढाउनुहोस्।',
      remedyEn: 'Feed green fodder to cows and offer sacred water to Tulsi plant every Wednesday.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ मिथुन राशीका लागि बौद्धिक क्रान्ति, वैदेशिक यात्रा र व्यावसायिक उचाइको वर्ष साबित हुनेछ। गुरु र बुधको शुभ दृष्टिले अनुसन्धान, शिक्षा र व्यापारमा नयाँ रेकर्ड बन्नेछ।',
      predictionEn: 'Year 2083 BS stands as a milestone year of academic accolades, foreign expeditions, and commercial zenith for Gemini.',
      careerNe: 'वर्षभरि नै रोजगारीमा पदोन्नति, नयाँ उद्यमको थालनी र अन्तर्राष्ट्रिय सम्झौताहरू सम्पन्न हुनेछन्।',
      careerEn: 'Consistent promotions, innovative startup launches, and prestigious global associations.',
      loveNe: 'प्रेम सम्बन्धले वैवाहिक रूप लिने प्रबल सम्भावना छ। घरमा खुसीको माहोल रहनेछ।',
      loveEn: 'High likelihood of solemnizing courtship into marriage alongside supportive domestic ties.',
      healthNe: 'सामान्यतया स्वास्थ्य राम्रो रहनेछ। नियमित दिनचर्या र पर्याप्त विश्रामले ऊर्जा सधैँ ताजा राख्नेछ।',
      healthEn: 'Good stamina and vitality maintained through disciplined habits and stress management.',
      financeNe: 'बौद्धिक सम्पत्ति, परामर्श तथा शेयर कारोबारबाट ठूलो धनआर्जन हुनेछ। बैंक मौज्दात बढ्नेछ।',
      financeEn: 'Exceptional earnings from intellectual property, consultancy, and diversified portfolios.',
      luckyNumber: 5,
      luckyColorNe: 'हरियो, पहेँलो र सेतो',
      luckyColorEn: 'Green, Yellow & White',
      rating: 5,
      remedyNe: 'वर्षभरि विष्णु सहस्रनामको पाठ गर्नुहोस् र बुधबार विद्यार्थीहरूलाई शैक्षिक सामग्री दान गर्नुहोस्।',
      remedyEn: 'Recite Vishnu Sahasranama and donate stationery to needy students on Wednesdays.'
    }
  },

  // 4. कर्कट (Cancer)
  {
    rashi: 'कर्कट',
    englishName: 'Cancer',
    symbol: '♋',
    element: 'Water',
    lordNe: 'चन्द्र',
    lordEn: 'Moon',
    weekly: {
      predictionNe: 'कर्कट राशी हुनेहरूका लागि यो साता मानसिक शान्ति, पारिवारिक सौहार्दता र आन्तरिक सुखको रहनेछ। चन्द्रमाको गतिशीलताले भावनाहरू सकारात्मक रहनेछन् र धार्मिक कार्यमा मन लाग्नेछ। सोमबार र बिहीबार अति उत्तम दिन हुन्।',
      predictionEn: 'A soothing and emotionally fulfilling week for Cancer. Moon transits foster domestic harmony and spiritual clarity.',
      careerNe: 'जलस्रोत, खाद्यन्न, होटल, शिक्षा र प्रशासनिक क्षेत्रमा कार्यरत व्यक्तिहरूले राम्रो नतिजा हात पार्नेछन्।',
      careerEn: 'Impressive rewards in hospitality, education, food processing, and public administration.',
      loveNe: 'पारिवारिक सम्बन्धमा आत्मियता बढ्नेछ। जीवनसाथीबाट स्नेहपूर्ण सहयोग र प्रेरणा मिल्नेछ।',
      loveEn: 'Deep emotional closeness. Warm support and uplifting encouragement from your spouse.',
      healthNe: 'मौसमी रुघाखोकी तथा चिसोबाट सतर्क रहनुहोला। तातो झोलिलो खानेकुरा लाभदायक हुनेछ।',
      healthEn: 'Guard against sudden temperature shifts and seasonal colds with warm herbal teas.',
      financeNe: 'घरायसी सुखसुविधामा खर्च भए पनि आम्दानीको नियमित प्रवाहले बचत सुरक्षित रहनेछ।',
      financeEn: 'Household investments balanced by steady, reliable income streams.',
      luckyNumber: 2,
      luckyColorNe: 'मोती सेतो, चाँदी र क्रिम',
      luckyColorEn: 'Pearl White, Silver & Cream',
      rating: 4,
      remedyNe: 'सोमबार भगवान शिवलाई शुद्ध गाईको दूध र जलले अभिषेक गरी ॐ नमः शिवाय जप गर्नुहोस्।',
      remedyEn: 'Perform Jalabhishek to Lord Shiva with pure milk and water on Monday chanting Om Namah Shivaya.'
    },
    monthly: {
      predictionNe: 'यो महिना कर्कट राशीका लागि मातापिताको आशीर्वाद, पैतृक सम्पत्ति परिचालन र गृह सुखको रहनेछ। सामाजिक प्रतिष्ठा बढ्नेछ र अड्किएका जग्गाजमीनका कामहरू सुल्झिनेछन्।',
      predictionEn: 'A profoundly positive month for Cancer marked by ancestral prosperity, real estate resolution, and maternal blessings.',
      careerNe: 'सार्वजनिक सेवा, व्यवस्थापन तथा मानव संसाधनमा उच्च मूल्याङ्कन हुनेछ। नयाँ जिम्मेवारी प्राप्त हुनेछ।',
      careerEn: 'High commendation in public service, HRM, and institutional leadership roles.',
      loveNe: 'परिवारमा नयाँ सदस्यको आगमन वा माङ्गलिक कार्यको तयारी हुनेछ। दाम्पत्य जीवन सुखमय रहनेछ।',
      loveEn: 'Joyous family news, welcoming new family members, and harmonious matrimony.',
      healthNe: 'मानसिक प्रसन्नता रहनेछ। पुराना स्वास्थ्य समस्याहरूमा क्रमिक सुधार आउनेछ।',
      healthEn: 'Uplifted mood and steady recuperation from minor chronic vulnerabilities.',
      financeNe: 'स्थिर सम्पत्ति तथा सुनचाँदीमा लगानी बढ्नेछ। आर्थिक योजनाहरूले मूर्तरूप लिनेछन्।',
      financeEn: 'Strategic capital deployment into property and precious metals yields strong security.',
      luckyNumber: 2,
      luckyColorNe: 'सेतो र हल्का निलो',
      luckyColorEn: 'White & Soft Blue',
      rating: 4,
      remedyNe: 'प्रत्येक पूर्णिमामा चन्द्रमालाई दूध मिश्रित जलले अर्घ्य दिनुहोस्।',
      remedyEn: 'Offer milk-infused water arghya to the Full Moon on Purnima nights.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ कर्कट राशीका लागि आध्यात्मिक जागरण, नयाँ भवन निर्माण र पारिवारिक समृद्धिको स्वर्णिम वर्ष हुनेछ। बृहस्पति र चन्द्रमाको कृपाले वर्षभरि मानसिक शान्ति र भौतिक सुख मिल्नेछ।',
      predictionEn: 'Year 2083 BS unfolds as a magnificent chapter of spiritual awakening, dream home construction, and family prosperity for Cancer.',
      careerNe: 'पहिलो चौमासिकमा नयाँ रोजगारीको अवसर, मध्य चौमासिकमा संस्थागत नेतृत्व र अन्तिम चौमासिकमा विशेष सम्मान मिल्नेछ।',
      careerEn: 'Q1 brings coveted job offers, Q2 elevates organizational authority, and Q3/Q4 delivers public recognition.',
      loveNe: 'पारिवारिक जीवनमा एकता र आत्मीयता छाउनेछ। तीर्थयात्रा र रमणीय देश-विदेश भ्रमणको योग छ।',
      loveEn: 'Profound family cohesion and sacred pilgrimages to domestic and international destinations.',
      healthNe: 'आरोग्य राम्रो रहनेछ। ध्यान र सकारात्मक सोचले रोग प्रतिरोधात्मक क्षमता उच्च राख्नेछ।',
      healthEn: 'Robust physical resilience bolstered by meditation and clean mindful living.',
      financeNe: 'नयाँ घर, जग्गा वा सवारी साधन खरिदको सपना साकार हुनेछ। सञ्चित धन दोब्बर हुने योग छ।',
      financeEn: 'Fulfillment of dream home or vehicle purchases alongside substantial wealth multiplication.',
      luckyNumber: 2,
      luckyColorNe: 'सेतो, चाँदी र गुलाबी',
      luckyColorEn: 'White, Silver & Rose',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य शिव पञ्चाक्षर स्तोत्र पाठ गर्नुहोस् र सोमबार असहायहरूलाई सेतो वस्त्र वा अन्न दान गर्नुहोस्।',
      remedyEn: 'Chant Shiva Panchakshara Stotra daily and donate white clothes or rice on Mondays.'
    }
  },

  // 5. सिंह (Leo)
  {
    rashi: 'सिंह',
    englishName: 'Leo',
    symbol: '♌',
    element: 'Fire',
    lordNe: 'सूर्य',
    lordEn: 'Sun',
    weekly: {
      predictionNe: 'सिंह राशी हुनेहरूका लागि यो साता मान-सम्मान, प्रशासनिक विजय र नेतृत्वदायी भूमिकाको रहनेछ। सूर्य र मङ्गलको अनुकूलताले प्रतिस्पर्धामा सफलता र सरकारी काममा द्रुत प्रगति हुनेछ। आइतबार र मंगलबार अति शुभ दिन हुन्।',
      predictionEn: 'A commanding week of leadership, administrative triumph, and social recognition for Leo.',
      careerNe: 'उच्च ओहोदा, सरकारी सेवा, राजनीति र व्यवस्थापकीय जिम्मेवारीमा ठूलो सफलता मिल्नेछ। निर्णय क्षमताको कदर हुनेछ।',
      careerEn: 'Superb accomplishments in civil administration, governance, executive roles, and corporate management.',
      loveNe: 'सम्बन्धमा विश्वास र मर्यादा कायम रहनेछ। परिवारका सदस्यहरू तपाईँको सल्लाहको सम्मान गर्नेछन्।',
      loveEn: 'Respectful and dignified family relations. Your counsel is deeply valued by loved ones.',
      healthNe: 'शारीरिक उर्जा र आत्मविश्वास उच्च रहनेछ। आँखा र मुटुको हेरचाहका लागि बिहान हिँड्ने बानी बसाल्नुहोला।',
      healthEn: 'High stamina and self-assurance. Morning walks support optimal cardiac and eye wellness.',
      financeNe: 'व्यापारिक कारोबार फस्टाउनेछ। पुराना बक्यौता उठ्नेछ र राज्यपक्षबाट आर्थिक लाभ मिल्नेछ।',
      financeEn: 'Flourishing trade volume, recovery of old debts, and fiscal benefits from state authorities.',
      luckyNumber: 1,
      luckyColorNe: 'सुनौलो, रातो र केसरी',
      luckyColorEn: 'Golden Yellow, Red & Saffron',
      rating: 5,
      remedyNe: 'आइतबार बिहान तामाको लोटाबाट सूर्यदेवलाई जल अर्घ्य दिई ॐ घृणिः सूर्याय नमः जप गर्नुहोस्।',
      remedyEn: 'Offer morning water arghya to Lord Surya in a copper vessel and chant Om Ghrinih Suryaya Namah.'
    },
    monthly: {
      predictionNe: 'यो महिना सिंह राशीका लागि प्रतिष्ठा विस्तार, ठूला परियोजनाको नेतृत्व र राज्यस्तरमा प्रभाव जमाउने समय छ। अग्रज तथा विशिष्ट व्यक्तिहरूको साथले रोकिएका कामहरू तीव्र गतिमा सम्पन्न हुनेछन्।',
      predictionEn: 'An impactful month of influential leadership, public accolades, and high-level enterprise execution for Leo.',
      careerNe: 'व्यवसाय विस्तार, नयाँ शाखा स्थापना र उच्च पदोन्नतिको प्रबल योग छ। सहकर्मीहरू सहयोगी बन्नेछन्।',
      careerEn: 'Rapid commercial expansion, launching flagship divisions, and deserving promotions.',
      loveNe: 'दाम्पत्य जीवनमा आत्मसम्मान र समझदारी रहनेछ। सन्तान पक्षबाट गर्व गर्न लायक सफलता मिल्नेछ।',
      loveEn: 'Mutual respect and dignity in marriage. Children achieve proud academic or sports milestones.',
      healthNe: 'स्वास्थ्य स्थिति उत्तम रहनेछ। योग तथा सूर्य नमस्कारले कार्यक्षमता दोब्बर बनाउनेछ।',
      healthEn: 'Peak physical vitality. Daily Surya Namaskar amplifies endurance and mental vigor.',
      financeNe: 'आर्थिक स्थिति बलियो हुनेछ। उद्योग, ठेक्कापट्टा र बहुराष्ट्रिय लगानीबाट ठूलो मुनाफा हात लाग्नेछ।',
      financeEn: 'Substantial wealth surge via contracting, industrial ventures, and strategic investments.',
      luckyNumber: 1,
      luckyColorNe: 'केसरी र सुनौलो',
      luckyColorEn: 'Saffron & Gold',
      rating: 5,
      remedyNe: 'प्रत्येक आइतबार आदित्य हृदय स्तोत्रको पाठ गरी रातो चन्दनको टीका लगाउनुहोस्।',
      remedyEn: 'Recite Aditya Hridaya Stotra on Sundays and apply a tilak of red sandalwood.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ सिंह राशीका लागि शक्ति, पराक्रम, प्रशासनिक सफलता र नयाँ कीर्तिमानको वर्ष हुनेछ। बृहस्पति र सूर्यको विशेष कृपाले समाज र राष्ट्रस्तरमा तपाईँको नाम चम्किनेछ।',
      predictionEn: 'Year 2083 BS stands as a golden era of sovereign authority, public prestige, and high achievements for Leo.',
      careerNe: 'पहिलो चौमासिकमा मुख्य पदभार, दोस्रो चौमासिकमा अन्तर्राष्ट्रिय विस्तार र तेस्रो चौमासिकमा ऐतिहासिक सफलता हासिल हुनेछ।',
      careerEn: 'Q1 brings high executive authority, Q2 expands international ties, and Q3/Q4 delivers landmark success.',
      loveNe: 'पारिवारिक सुख, माङ्गलिक कार्य र पारिवारिक उत्सवको लामो श्रृंखला वर्षभरि जारी रहनेछ।',
      loveEn: 'Grand family celebrations, auspicious ceremonies, and joyful travels throughout the year.',
      healthNe: 'आरोग्यता सबल रहनेछ। ऊर्जावान दिनचर्या र आत्मबलले वर्षभरि स्फूर्ति कायम राख्नेछ।',
      healthEn: 'Robust physical constitution and high immunity supported by a vibrant lifestyle.',
      financeNe: 'आर्थिक दृष्टिले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Tremendous capital growth, high ROI on ventures, and creation of lasting generational wealth.',
      luckyNumber: 1,
      luckyColorNe: 'सुनौलो, रातो र केशरी',
      luckyColorEn: 'Gold, Crimson & Saffron',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य सूर्य उपासना गर्नुहोस् र आइतबार ब्राह्मण वा असहायलाई गहुँ वा तामाको भाँडो दान गर्नुहोस्।',
      remedyEn: 'Perform daily Sun worship and donate wheat or copper utensils to worthy priests or the needy on Sundays.'
    }
  },

  // 6. कन्या (Virgo)
  {
    rashi: 'कन्या',
    englishName: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    lordNe: 'बुध',
    lordEn: 'Mercury',
    weekly: {
      predictionNe: 'कन्या राशी हुनेहरूका लागि यो साता वित्तीय व्यवस्थापन, कार्यदक्षता र समस्या समाधानको रहनेछ। बुधको प्रभावले सूक्ष्म विश्लेषण र लेखाजोखामा सफलता मिल्नेछ। शत्रुहरू परास्त हुनेछन्। बुधबार र शुक्रबार विशेष फलदायी दिन हुन्।',
      predictionEn: 'A highly productive week of analytical mastery, financial audit success, and problem-solving for Virgo.',
      careerNe: 'लेखा, बैंकिङ, अनुसन्धान, कानुनी मामिला र चिकित्सा क्षेत्रमा विशिष्ट नतिजा हासिल हुनेछ।',
      careerEn: 'Remarkable achievements in accounting, auditing, medical sciences, legal matters, and research.',
      loveNe: 'पारिवारिक दायित्व पूरा गर्दा सन्तुष्टि मिल्नेछ। साथीभाइसँगको संवादले मन प्रसन्न बनाउनेछ।',
      loveEn: 'Fulfilling familial duties brings inner contentment. Warm conversations with loyal companions.',
      healthNe: 'पाचन प्रणाली र खानपानमा ध्यान दिनुहोला। ताजा सागसब्जी र फाइबरयुक्त भोजन उत्तम हुनेछ।',
      healthEn: 'Prioritize gut health and clean digestion with fiber-rich organic vegetables.',
      financeNe: 'बचत योजनाहरू सफल हुनेछन्। पुराना ऋण वा सापटी रकम फिर्ता आउने सम्भावना छ।',
      financeEn: 'Successful savings plans and recovery of past loans or pending invoices.',
      luckyNumber: 5,
      luckyColorNe: 'हरियो, तोरी पहेँलो र सेतो',
      luckyColorEn: 'Forest Green, Mustard & Off-White',
      rating: 4,
      remedyNe: 'बुधबार भगवान गणेशजीलाई २१ वटा ल्वाङ र दूबो अर्पण गरी ॐ गं गणपतये नमः जप गर्नुहोस्।',
      remedyEn: 'Offer 21 cloves and Durva grass to Lord Ganesha on Wednesday chanting Om Gam Ganapataye Namah.'
    },
    monthly: {
      predictionNe: 'यो महिना कन्या राशीका लागि ऋणमुक्ति, नयाँ अवसरको सिर्जना र व्यावसायिक प्रतिष्ठा वृद्धिको रहनेछ। प्रतिद्वन्द्वीहरू पछि हट्नेछन् र तपाईँको कार्ययोजना सर्वस्वीकार्य बन्नेछ।',
      predictionEn: 'A breakthrough month for Virgo marked by debt clearance, strategic victories over rivals, and solid business reputation.',
      careerNe: 'प्राविधिक तथा व्यवस्थापकीय काममा ठूलो प्रगति हुनेछ। नयाँ परियोजनाको जिम्मा तपाईँलाई सुम्पिनेछ।',
      careerEn: 'Superb headway in technical and operations management with leadership over premier assignments.',
      loveNe: 'दाम्पत्य जीवनमा सन्तुलन र सहयोग कायम रहनेछ। घरको सरसफाइ र सौन्दर्यीकरणमा समय बित्नेछ।',
      loveEn: 'Balanced marital companionship and collaborative home improvement activities.',
      healthNe: 'स्वास्थ्य अनुशासित रहनेछ। नियमित योगाभ्यासले मानसिक तनाव पूरै हटाउनेछ।',
      healthEn: 'Disciplined lifestyle ensures robust immunity and complete stress relief through yoga.',
      financeNe: 'आर्थिक लाभका नयाँ स्रोतहरू पहिचान हुनेछन्। शेयर तथा व्यापारिक लगानीबाट सुरक्षित प्रतिफल मिल्नेछ।',
      financeEn: 'Discovery of fresh revenue channels and secure returns from prudent investments.',
      luckyNumber: 5,
      luckyColorNe: 'हरियो र हल्का निलो',
      luckyColorEn: 'Green & Light Blue',
      rating: 4,
      remedyNe: 'प्रत्येक बुधबार हरियो मुङको दाल वा हरियो वस्त्र दान गर्नुहोस्।',
      remedyEn: 'Donate green moong dal or green clothes to the underprivileged on Wednesdays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ कन्या राशीका लागि ज्ञान, अनुसन्धान, कार्यकुशलता र आर्थिक उन्नतिको स्वर्णिम वर्ष हुनेछ। बुध र शनिको शुभ दृष्टिले वर्षभरि मुद्दा-मामिलामा जित र व्यापारमा उल्लेख्य वृद्धि हुनेछ।',
      predictionEn: 'Year 2083 BS proves to be a landmark year of analytical mastery, legal triumphs, and consistent financial gains for Virgo.',
      careerNe: 'पहिलो चौमासिकमा कार्यक्षेत्र सुधार, दोस्रो चौमासिकमा नयाँ सम्झौता र तेस्रो चौमासिकमा ठूलो व्यावसायिक उचाइ हासिल हुनेछ।',
      careerEn: 'Q1 brings workspace optimization, Q2 secures lucrative contracts, and Q3/Q4 establishes market leadership.',
      loveNe: 'पारिवारिक सम्बन्धमा स्थायित्व र आत्मीयता आउनेछ। सन्तानको उच्च शिक्षामा सफलता मिल्नेछ।',
      loveEn: 'Stable domestic happiness and celebratory accomplishments in children’s higher education.',
      healthNe: 'वर्षभरि स्वास्थ्य सामान्यतया सबल रहनेछ। सात्विक खानपान र नियमित व्यायामले तन्दुरुस्त राख्नेछ।',
      healthEn: 'Sustained good health maintained through wholesome Sattvic diet and regular exercise.',
      financeNe: 'सञ्चित कोषमा भारी वृद्धि हुनेछ। नयाँ जग्गाजमीन वा सुरक्षित फण्डहरूमा लगानी विस्तार हुनेछ।',
      financeEn: 'Heavy growth in accumulated reserves and sound diversification into real estate and secure funds.',
      luckyNumber: 5,
      luckyColorNe: 'हरियो, पहेँलो र सेतो',
      luckyColorEn: 'Emerald Green, Yellow & White',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य दुर्गा सप्तशतीको पाठ वा नवार्ण मन्त्र जप गर्नुहोस् र गाईको सेवा गर्नुहोस्।',
      remedyEn: 'Chant Navarna Mantra or recite Durga Saptashati daily and serve sacred cows.'
    }
  },

  // 7. तुला (Libra)
  {
    rashi: 'तुला',
    englishName: 'Libra',
    symbol: '♎',
    element: 'Air',
    lordNe: 'शुक्र',
    lordEn: 'Venus',
    weekly: {
      predictionNe: 'तुला राशी हुनेहरूका लागि यो साता व्यक्तित्व विकास, साझेदारी व्यवसाय र सामाजिक मान-सम्मानको रहनेछ। शुक्रको शुभ स्थितिले कला, संगीत, सौन्दर्य र कूटनीतिक कार्यमा अभूतपूर्व सफलता मिल्नेछ। शुक्रबार र शनिबार विशेष शुभ दिन हुन्।',
      predictionEn: 'An exquisite week of charismatic presence, diplomatic success, and fruitful partnerships for Libra.',
      careerNe: 'व्यापारिक साझेदारी, कानुनी सम्झौता र सार्वजनिक सम्बन्धमा ठूलो लाभ हुनेछ। नयाँ ग्राहक आकर्षित हुनेछन्।',
      careerEn: 'Remarkable returns from commercial alliances, legal negotiations, and public relations.',
      loveNe: 'दाम्पत्य जीवनमा प्रगाढ प्रेम र रोमान्स छाउनेछ। अविवाहितहरूका लागि विवाहको कुरा अगाडि बढ्नेछ।',
      loveEn: 'Deep romance and marital harmony. Fruitful marriage proposals for eligible bachelors.',
      healthNe: 'छाला र मिर्गौला (Kidney) सम्बन्धी सन्तुलनका लागि पर्याप्त पानी पिउनुहोला।',
      healthEn: 'Maintain kidney and skin hydration by drinking generous amounts of clean water.',
      financeNe: 'आयआर्जन सन्तोषजनक रहनेछ। विलासिता र घरायसी सजावटका सामग्री खरिदमा खर्च हुने योग छ।',
      financeEn: 'Healthy cash flow with tasteful expenditures on home decor and lifestyle enhancements.',
      luckyNumber: 6,
      luckyColorNe: 'आसमानी निलो, सेतो र गुलाबी',
      luckyColorEn: 'Sky Blue, White & Pink',
      rating: 5,
      remedyNe: 'शुक्रबार श्री सूक्त पाठ गरी देवी महालक्ष्मीलाई सेतो कमल वा गुलाफी फूल अर्पण गर्नुहोस्।',
      remedyEn: 'Recite Sri Suktam on Friday and offer white lotus or pink roses to Goddess Mahalakshmi.'
    },
    monthly: {
      predictionNe: 'यो महिना तुला राशीका लागि सन्तुलित जीवनशैली, नयाँ सहकार्य र सांस्कृतिक कार्यक्रममा सहभागिताको रहनेछ। समाजमा तपाईँको सौम्य व्यवहार र न्यायप्रियताको सर्वत्र प्रशंसा हुनेछ।',
      predictionEn: 'A balanced and culturally enriching month of elegant leadership, artistic pursuits, and social prominence for Libra.',
      careerNe: 'कला, साहित्य, फेसन, मिडिया र परामर्श क्षेत्रमा ठूलो प्रगति हुनेछ। नयाँ सम्झौताहरू लाभदायक साबित हुनेछन्।',
      careerEn: 'Superb milestones in arts, fashion, consultancy, and strategic joint ventures.',
      loveNe: 'जीवनसाथीसँग मनको कुरा आदानप्रदान हुनेछ। रमणीय स्थलको भ्रमणले सम्बन्धलाई अझ प्रगाढ बनाउनेछ।',
      loveEn: 'Open-hearted intimacy and memorable scenic getaways strengthening the marital bond.',
      healthNe: 'सौन्दर्य र आरोग्यता कायम रहनेछ। सन्तुलित दिनचर्याले मानसिक स्फूर्ति बढाउनेछ।',
      healthEn: 'Radiant vitality and mental poise achieved through structured daily routines.',
      financeNe: 'साझेदारी व्यापारबाट उल्लेख्य मुनाफा हुनेछ। शेयर बजार र कलात्मक वस्तुहरूबाट लाभ मिल्नेछ।',
      financeEn: 'Impressive dividend returns from joint ventures, equities, and high-value collectibles.',
      luckyNumber: 6,
      luckyColorNe: 'सेतो, चाँदी र फिरोजा',
      luckyColorEn: 'White, Silver & Turquoise',
      rating: 5,
      remedyNe: 'प्रत्येक शुक्रबार कन्याहरूलाई सेतो मिष्ठान्न वा खीर वितरण गर्नुहोस्।',
      remedyEn: 'Distribute white sweets or kheer to young girls every Friday.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ तुला राशीका लागि वैवाहिक सुख, साझेदारी व्यवसाय र अन्तर्राष्ट्रिय प्रतिष्ठाको स्वर्णिम वर्ष हुनेछ। शुक्र र बृहस्पतिको अनुकूलताले वर्षभरि आर्थिक समृद्धि र पारिवारिक उल्लास छाउनेछ।',
      predictionEn: 'Year 2083 BS unfolds as an illustrious year of marital bliss, flourishing partnerships, and international prestige for Libra.',
      careerNe: 'पहिलो चौमासिकमा नयाँ साझेदारी, दोस्रो चौमासिकमा बजार विस्तार र तेस्रो चौमासिकमा प्रतिष्ठित पदवी वा पुरस्कार प्राप्त हुनेछ।',
      careerEn: 'Q1 establishes premier joint ventures, Q2 scales market outreach, and Q3/Q4 garners prestigious awards.',
      loveNe: 'विवाहको शुभ लगन जुर्नेछ। पारिवारिक सम्बन्धमा सौहार्दता र नयाँ घर निर्माणको योग छ।',
      loveEn: 'Auspicious wedding ceremonies and harmonious acquisition of luxury residential property.',
      healthNe: 'आरोग्य राम्रो रहनेछ। प्राकृतिक चिकित्सा र सन्तुलित खानपानले वर्षभरि ऊर्जावान राख्नेछ।',
      healthEn: 'Robust physical well-being supported by naturopathy and balanced organic nutrition.',
      financeNe: 'आर्थिक दृष्टिले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Magnificent wealth accumulation through flourishing businesses and high-yield real estate.',
      luckyNumber: 6,
      luckyColorNe: 'सेतो, निलो र गुलाफी',
      luckyColorEn: 'White, Blue & Rose Pink',
      rating: 5,
      remedyNe: 'वर्षभरि शुक्रबार कनकधारा स्तोत्रको पाठ गर्नुहोस् र सेतो गाईलाई नियमित रोटी वा चारा खुवाउनुहोस्।',
      remedyEn: 'Chant Kanakadhara Stotra on Fridays and regularly feed white cows.'
    }
  },

  // 8. वृश्चिक (Scorpio)
  {
    rashi: 'वृश्चिक',
    englishName: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    lordNe: 'मङ्गल',
    lordEn: 'Mars',
    weekly: {
      predictionNe: 'वृश्चिक राशी हुनेहरूका लागि यो साता गूढ अनुसन्धान, पराक्रम र आकस्मिक लाभको रहनेछ। मङ्गल र केतुको प्रभावले प्राविधिक तथा खोजमूलक काममा ठूलो सफलता मिल्नेछ। मङ्गलबार र बिहीबार विशेष शुभ दिन हुन्।',
      predictionEn: 'A potent week of intense willpower, breakthrough research, and sudden financial gains for Scorpio.',
      careerNe: 'अनुसन्धान, चिकित्सा, सुरक्षा, इन्जिनियरिङ र सूचना प्रविधिमा नयाँ सफलता मिल्नेछ। प्रतिस्पर्धीहरू पराजित हुनेछन्।',
      careerEn: 'Major breakthroughs in surgical medicine, engineering, cybersecurity, and deep research.',
      loveNe: 'सम्बन्धमा गहिरो आत्मीयता रहनेछ। शङ्का-उपशङ्काबाट टाढा रही खुला हृदयले संवाद गर्नुहोला।',
      loveEn: 'Deep emotional intensity. Maintain transparent, open-hearted communication with your partner.',
      healthNe: 'ऊर्जा उच्च रहनेछ। रगत र मांसपेशीको स्वास्थ्यका लागि नियमित व्यायाम फलदायी हुनेछ।',
      healthEn: 'High stamina. Regular strength training maintains muscle tone and cardiovascular wellness.',
      financeNe: 'पुर्ख्यौली सम्पत्ति वा पुराना लगानीबाट आकस्मिक धनलाभ हुने योग छ। ऋण असुलीमा प्रगति हुनेछ।',
      financeEn: 'Sudden financial gains from inheritance, past investments, or long-pending recoveries.',
      luckyNumber: 9,
      luckyColorNe: 'गाढा रातो, म्यारुन र कफी',
      luckyColorEn: 'Maroon, Crimson & Coffee Brown',
      rating: 4,
      remedyNe: 'मङ्गलबार हनुमान चालिसा पाठ गरी रातो फल वा सिन्दूर हनुमानजीलाई अर्पण गर्नुहोस्।',
      remedyEn: 'Recite Hanuman Chalisa on Tuesday and offer red fruits or vermillion to Lord Hanuman.'
    },
    monthly: {
      predictionNe: 'यो महिना वृश्चिक राशीका लागि आत्मबल वृद्धि, कठिन चुनौतीहरूको समाधान र गुप्त धन प्राप्तिको रहनेछ। पराक्रम र दृढ इच्छाशक्तिका बलमा रोकिएका ठूला योजनाहरू सम्पन्न हुनेछन्।',
      predictionEn: 'A transformative month of resolute determination, overcoming complex hurdles, and unexpected prosperity for Scorpio.',
      careerNe: 'उद्योग, खानी, निर्माण र प्राविधिक क्षेत्रमा ठूलो प्रगति हुनेछ। उच्च अधिकारीबाट प्रशंसा मिल्नेछ।',
      careerEn: 'Substantial progress in heavy industries, construction, tech infrastructure, and project governance.',
      loveNe: 'पारिवारिक सम्बन्धमा निष्ठा र समर्पण बढ्नेछ। घरका समस्याहरू सामूहिक छलफलबाट हल हुनेछन्।',
      loveEn: 'Devotion and loyalty in domestic life. Family challenges are resolved through united consensus.',
      healthNe: 'शारीरिक स्फूर्ति कायम रहनेछ। मौसमी खानपानमा सन्तुलन कायम राख्नुहोला।',
      healthEn: 'High vitality. Maintain balanced seasonal nutrition and avoid overexertion.',
      financeNe: 'आर्थिक स्थिति सुदृढ बन्नेछ। नयाँ जग्गाजमीन वा शेयरमा गरिएको लगानीले राम्रो प्रतिफल दिनेछ।',
      financeEn: 'Substantial liquidity growth and profitable returns from land acquisitions and equities.',
      luckyNumber: 9,
      luckyColorNe: 'रातो र केसरी',
      luckyColorEn: 'Crimson Red & Saffron',
      rating: 4,
      remedyNe: 'प्रत्येक मङ्गलबार भगवान भैरव वा हनुमानजीको मन्दिरमा चमेलीको तेलको दीप बाल्नुहोस्।',
      remedyEn: 'Light a lamp of jasmine oil at Lord Bhairava or Hanuman temple on Tuesdays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ वृश्चिक राशीका लागि पराक्रम वृद्धि, पैतृक सम्पत्ति लाभ र शत्रुविजयको वर्ष हुनेछ। मङ्गल र बृहस्पतिको अनुकूल दृष्टिले वर्षभरि मान-प्रतिष्ठा र आर्थिक सम्पन्नता प्राप्त हुनेछ।',
      predictionEn: 'Year 2083 BS stands as a victorious year of unstoppable courage, ancestral wealth realization, and triumphs for Scorpio.',
      careerNe: 'पहिलो चौमासिकमा पदोन्नति, दोस्रो चौमासिकमा प्राविधिक विस्तार र तेस्रो चौमासिकमा ऐतिहासिक सम्मान प्राप्त हुनेछ।',
      careerEn: 'Q1 secures major promotions, Q2 scales technical enterprise, and Q3/Q4 delivers prestigious honors.',
      loveNe: 'दाम्पत्य जीवनमा प्रगाढता आउनेछ। सन्तान सुख र माङ्गलिक कार्यको शुभ योग बन्नेछ।',
      loveEn: 'Deep domestic loyalty, blessings of progeny, and joyous religious festivities at home.',
      healthNe: 'स्वास्थ्य सबल रहनेछ। नियमित व्यायाम र प्राणायामले ऊर्जा सधैँ उच्च राख्नेछ।',
      healthEn: 'Sound physical health and high endurance maintained through structured exercise and Pranayama.',
      financeNe: 'आर्थिक दृष्टिले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। अचल सम्पत्तिमा उल्लेख्य वृद्धि हुनेछ।',
      financeEn: 'Exceptional financial gains, multiplication of fixed assets, and lucrative real estate deals.',
      luckyNumber: 9,
      luckyColorNe: 'रातो, केशरी र सुनौलो',
      luckyColorEn: 'Red, Saffron & Gold',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य सुन्दरकाण्ड पाठ गर्नुहोस् वा ॐ अं अङ्गारकाय नमः जप गर्नुहोस्।',
      remedyEn: 'Recite Sundarkand or chant Om Am Angarakaya Namah daily throughout the year.'
    }
  },

  // 9. धनु (Sagittarius)
  {
    rashi: 'धनु',
    englishName: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    lordNe: 'गुरु',
    lordEn: 'Jupiter',
    weekly: {
      predictionNe: 'धनु राशी हुनेहरूका लागि यो साता भाग्यवृद्धि, उच्च अध्ययन र आध्यात्मिक प्रगतिको रहनेछ। बृहस्पति (गुरु) को कृपाले सल्लाहकार, शिक्षक, वकिल तथा धार्मिक व्यक्तित्वहरूलाई विशेष सफलता मिल्नेछ। बिहीबार र आइतबार अति शुभ दिन हुन्।',
      predictionEn: 'A magnificent week of expanding wisdom, good fortune, higher education, and spiritual enlightenment for Sagittarius.',
      careerNe: 'शैक्षिक क्षेत्र, कूटनीति, प्रकाशन, अनुसन्धान र न्याय क्षेत्रमा नयाँ उचाइ हासिल हुनेछ। गुरुजनको आशीर्वाद मिल्नेछ।',
      careerEn: 'Exemplary strides in academia, judicial consultancy, international publishing, and diplomacy.',
      loveNe: 'पारिवारिक सम्बन्धमा सुख-शान्ति छाउनेछ। प्रेम सम्बन्धमा विश्वास र मर्यादा कायम रहनेछ।',
      loveEn: 'Peaceful and elevated family atmosphere. Mutual respect and truthfulness in romantic bonds.',
      healthNe: 'आरोग्य राम्रो रहनेछ। कलेजो र तौल सन्तुलनका लागि सात्विक खानपान अपनाउनुहोला।',
      healthEn: 'Vibrant health. Favor clean, Sattvic meals to optimize liver wellness and metabolism.',
      financeNe: 'आम्दानीका नयाँ बाटा खुल्नेछन्। दीर्घकालीन लगानी र शैक्षिक योजनाहरूमा गरिएको खर्च फलदायी हुनेछ।',
      financeEn: 'Expanding income streams with high long-term yields from education and strategic funds.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो, केसरी र सुनौलो',
      luckyColorEn: 'Bright Yellow, Saffron & Gold',
      rating: 5,
      remedyNe: 'बिहीबार भगवान विष्णुलाई पहेँलो फूल र तुलसी अर्पण गरी ॐ बृं बृहस्पतये नमः जप गर्नुहोस्।',
      remedyEn: 'Offer yellow flowers and Tulsi to Lord Vishnu on Thursday chanting Om Brim Brihaspataye Namah.'
    },
    monthly: {
      predictionNe: 'यो महिना धनु राशीका लागि भाग्यको पूर्ण साथ, धार्मिक यात्रा र ठूला योजनाहरूको कार्यान्वयनको रहनेछ। समाजमा मान-सम्मान बढ्नेछ र उच्च पदस्थ व्यक्तित्वहरूसँग फलदायी सम्बन्ध स्थापित हुनेछ।',
      predictionEn: 'An auspicious month of divine luck, sacred travels, and successful execution of major life plans for Sagittarius.',
      careerNe: 'वैदेशिक अध्ययन, कूटनीतिक नियुक्ति तथा ठूला व्यावसायिक सम्झौताहरू सम्पन्न हुनेछन्।',
      careerEn: 'Coveted overseas educational admissions, diplomatic appointments, and premier contracts.',
      loveNe: 'दाम्पत्य जीवनमा आत्मीयता थपिनेछ। परिवारसँग तीर्थयात्रा वा रमणीय भ्रमणको योजना बन्नेछ।',
      loveEn: 'Deepening marital closeness and plans for holy pilgrimages or family vacations.',
      healthNe: 'स्वास्थ्य स्थिति उत्तम रहनेछ। नियमित प्राणायामले मनमा शान्ति र एकाग्रता दिलाउनेछ।',
      healthEn: 'Excellent physical and emotional well-being reinforced by daily meditation and Pranayama.',
      financeNe: 'सञ्चित कोषमा उल्लेख्य वृद्धि हुनेछ। नयाँ भवन वा धार्मिक कार्यमा लगानी हुने योग छ।',
      financeEn: 'Substantial growth in treasury and rewarding investments in real estate and noble causes.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो र सुनौलो',
      luckyColorEn: 'Golden Yellow & Mustard',
      rating: 5,
      remedyNe: 'प्रत्येक बिहीबार केराको रुखमा जल चढाउनुहोस् र गाईलाई चनाको दाल र गुड खुवाउनुहोस्।',
      remedyEn: 'Offer water to a banana tree and feed soaked chana dal with jaggery to cows on Thursdays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ धनु राशीका लागि ऐतिहासिक भाग्योदय, उच्च पद प्राप्ति र सर्वपक्षीय समृद्धिको स्वर्णिम वर्ष रहनेछ। आफ्नै राशीस्वामी बृहस्पतिको विशेष अनुकम्पाले वर्षभरि मान-सम्मान र सफलताको कीर्तिमान बन्नेछ।',
      predictionEn: 'Year 2083 BS unfolds as an illustrious epoch of cosmic fortune, executive elevation, and total prosperity for Sagittarius.',
      careerNe: 'पहिलो चौमासिकमा ठूलो पदोन्नति, दोस्रो चौमासिकमा अन्तर्राष्ट्रिय कूटनीति र तेस्रो चौमासिकमा राष्ट्रिय पुरस्कार प्राप्त हुनेछ।',
      careerEn: 'Q1 brings high promotions, Q2 expands global diplomatic footprints, and Q3/Q4 brings national honors.',
      loveNe: 'विवाहको शुभ लगन जुर्नेछ। सन्तान पक्षबाट अत्यन्तै गौरवमय शुभ समाचार सुन्न पाइनेछ।',
      loveEn: 'Joyful wedding ceremonies and celebrated accomplishments of children in academics or arts.',
      healthNe: 'वर्षभरि स्वास्थ्य सबल र उर्जावान रहनेछ। अध्यात्म र सदाचारले दीर्घायु र आरोग्यता दिनेछ।',
      healthEn: 'Robust vitality and radiant health supported by ethical living and spiritual practice.',
      financeNe: 'आर्थिक दृष्टिकोणले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Multi-fold expansion of liquid capital, ancestral estates, and high-performing assets.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो, केसरी र सेतो',
      luckyColorEn: 'Yellow, Saffron & White',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य विष्णु सहस्रनामको पाठ गर्नुहोस् र बिहीबार गुरुजन तथा विद्वानहरूको आशीर्वाद लिनुहोस्।',
      remedyEn: 'Recite Vishnu Sahasranama daily and seek the blessings of teachers and spiritual elders.'
    }
  },

  // 10. मकर (Capricorn)
  {
    rashi: 'मकर',
    englishName: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    lordNe: 'शनि',
    lordEn: 'Saturn',
    weekly: {
      predictionNe: 'मकर राशी हुनेहरूका लागि यो साता कडा मिहिनेतको फल, प्रशासनिक पकड र दीर्घकालीन योजनाहरूको रहनेछ। शनिको शुभ दृष्टिले उद्योग, निर्माण, प्रविधि र प्रशासनिक जिम्मेवारीमा सफलता मिल्नेछ। शनिबार र बुधबार विशेष फलदायी दिन हुन्।',
      predictionEn: 'A resilient and constructive week of hard-earned achievements, industry leadership, and structural growth for Capricorn.',
      careerNe: 'व्यवस्थापन, सार्वजनिक प्रशासन, प्राविधिक आयोजना र उद्योगमा ठूलो सफलता मिल्नेछ। वरिष्ठहरूको विश्वास जितिनेछ।',
      careerEn: 'Outstanding headway in corporate operations, technical infrastructure, and industrial ventures.',
      loveNe: 'पारिवारिक जिम्मेवारी कुशलतापूर्वक पूरा हुनेछ। जीवनसाथीसँगको सम्बन्धमा गहिरो समझदारी रहनेछ।',
      loveEn: 'Fulfilling family duties brings deep mutual respect and reliable marital companionship.',
      healthNe: 'जोर्नी, घुँडा र ढाडको ख्याल राख्नुहोला। नियमित हल्का स्ट्रेचिङ र योग फलदायी हुनेछ।',
      healthEn: 'Protect knees, joints, and lower back with gentle stretching and ergonomic posture.',
      financeNe: 'स्थिर सम्पत्ति जोडिने योग छ। पुरानो लगानीबाट नियमित आम्दानी सुरु हुनेछ।',
      financeEn: 'Addition of fixed property and commencement of regular yields from mature investments.',
      luckyNumber: 8,
      luckyColorNe: 'निलो, कालो र खैरो',
      luckyColorEn: 'Navy Blue, Charcoal & Slate Grey',
      rating: 4,
      remedyNe: 'शनिबार पीपलको रुखमा जल चढाई तिलको तेलको दीप बाल्नुहोस् र ॐ शं शनैश्चराय नमः जप गर्नुहोस्।',
      remedyEn: 'Offer water to a Peepal tree and light a sesame oil lamp on Saturday chanting Om Sham Shanaishcharaya Namah.'
    },
    monthly: {
      predictionNe: 'यो महिना मकर राशीका लागि कार्यक्षेत्रमा स्थायित्व, नयाँ पूर्वाधार निर्माण र व्यावसायिक प्रतिष्ठा वृद्धिको रहनेछ। धैर्य र अनुशासनका बलमा प्रतिस्पर्धीहरूलाई पछि पार्दै अग्रस्थान हासिल हुनेछ।',
      predictionEn: 'A foundational month of organizational stability, infrastructure expansion, and industry prominence for Capricorn.',
      careerNe: 'उद्योग, कलकारखाना, सिभिल इञ्जिनियरिङ तथा सरकारी सेवामा उच्च स्थान प्राप्त हुनेछ।',
      careerEn: 'Superb milestones in manufacturing, civil engineering, and long-term public service contracts.',
      loveNe: 'पारिवारिक सुख-शान्ति कायम रहनेछ। पुराना असमझदारीहरू आपसी संवादबाट सदाका लागि हट्नेछन्।',
      loveEn: 'Peaceful domestic equilibrium. Long-standing misunderstandings dissolve through mature dialogue.',
      healthNe: 'स्वास्थ्य अनुशासित रहनेछ। नियमित दिनचर्या र पौष्टिक आहारले हाडजोर्नी बलियो बनाउनेछ।',
      healthEn: 'Disciplined lifestyle keeps bones, joints, and physical endurance in prime condition.',
      financeNe: 'सञ्चित कोषमा निरन्तर वृद्धि हुनेछ। घरजग्गा, मेशिनरी वा सवारी साधन खरिदमा लगानी हुनेछ।',
      financeEn: 'Continuous accretion of wealth with strategic allocations into machinery, real estate, and assets.',
      luckyNumber: 8,
      luckyColorNe: 'गाढा निलो र चाँदी',
      luckyColorEn: 'Midnight Blue & Silver',
      rating: 4,
      remedyNe: 'प्रत्येक शनिबार गरीब तथा असहाय व्यक्तिहरूलाई कालो छाता, जुत्ता वा कम्बल दान गर्नुहोस्।',
      remedyEn: 'Donate black umbrellas, shoes, or warm blankets to the needy on Saturdays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ मकर राशीका लागि कर्मयोग, राज्यसम्मान, उद्योग विस्तार र दीर्घकालीन समृद्धिको वर्ष हुनेछ। शनी र बृहस्पतिको अनुकूलताले वर्षभरि पद-प्रतिष्ठा र अचल सम्पत्तिमा भारी वृद्धि दिलाउनेछ।',
      predictionEn: 'Year 2083 BS stands as a monumental year of industrial dominance, state recognition, and lasting wealth for Capricorn.',
      careerNe: 'पहिलो चौमासिकमा मुख्य पदभार, दोस्रो चौमासिकमा उद्योग विस्तार र तेस्रो चौमासिकमा राज्यस्तरको उच्च सम्मान मिल्नेछ।',
      careerEn: 'Q1 brings high executive office, Q2 expands manufacturing footprint, and Q3/Q4 delivers prestigious national laurels.',
      loveNe: 'घरायसी जीवन सुखी र शान्तिमय रहनेछ। नयाँ घर निर्माण वा गृहप्रवेशको शुभ योग बन्नेछ।',
      loveEn: 'Tranquil domestic bliss and high probability of building and inaugurating a new residence.',
      healthNe: 'समग्र वर्ष स्वास्थ्य सामान्यतया सबल रहनेछ। योग र सन्तुलित आहारले निरोगी राख्नेछ।',
      healthEn: 'Sound physical endurance maintained through structured yoga and balanced mineral-rich nutrition.',
      financeNe: 'आर्थिक दृष्टिकोणले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Exceptional consolidation of capital, expansion of real estate holdings, and enduring prosperity.',
      luckyNumber: 8,
      luckyColorNe: 'निलो, कालो र सेतो',
      luckyColorEn: 'Blue, Charcoal & White',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य शनि चालीसा वा दशरथकृत शनि स्तोत्र पाठ गर्नुहोस् र शनिबार हनुमानजीको सेवा गर्नुहोस्।',
      remedyEn: 'Recite Dasharatha Shani Stotra or Shani Chalisa daily and pray to Lord Hanuman on Saturdays.'
    }
  },

  // 11. कुम्भ (Aquarius)
  {
    rashi: 'कुम्भ',
    englishName: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    lordNe: 'शनि',
    lordEn: 'Saturn',
    weekly: {
      predictionNe: 'कुम्भ राशी हुनेहरूका लागि यो साता नवप्रवर्तन, सामाजिक प्रतिष्ठा र भाग्यवृद्धिको रहनेछ। शनिको अनुकूल प्रभावले प्राविधिक अनुसन्धान, सामाजिक संघसंस्था र ठूला योजनाहरूमा अभूतपूर्व सफलता मिल्नेछ। शनिबार र बिहीबार विशेष शुभ दिन हुन्।',
      predictionEn: 'An inspiring week of groundbreaking innovation, social elevation, and rewarding fortune for Aquarius.',
      careerNe: 'सफ्टवेयर, अनुसन्धान, गैरसरकारी संस्था, उड्डयन र नवीकरणीय ऊर्जामा नयाँ सम्झौता र प्रगति हुनेछ।',
      careerEn: 'Breakthrough accomplishments in software engineering, NGO leadership, aviation, and clean tech.',
      loveNe: 'सम्बन्धमा नयाँ उल्लास र विचारको सामञ्जस्य रहनेछ। मित्रजनको सहयोगले मन प्रसन्न हुनेछ।',
      loveEn: 'Vibrant harmony in romance. Supportive friendships and shared progressive ideals.',
      healthNe: 'स्नायु प्रणाली र खुट्टाको हेरचाह गर्नुहोला। बिहान स्वच्छ हावामा हिँड्नु लाभदायक हुनेछ।',
      healthEn: 'Care for ankles and circulation. Brisk morning walks in fresh air promote mental agility.',
      financeNe: 'आम्दानीका नयाँ स्रोतहरू थपिनेछन्। सामूहिक लगानी तथा प्राविधिक व्यवसायबाट राम्रो मुनाफा मिल्नेछ।',
      financeEn: 'Expanding income avenues and handsome dividends from collective funds and digital ventures.',
      luckyNumber: 8,
      luckyColorNe: 'आसमानी निलो, बैजनी र सेतो',
      luckyColorEn: 'Electric Blue, Purple & White',
      rating: 5,
      remedyNe: 'शनिबार हनुमानजीको मन्दिरमा दीप प्रज्वलन गरी ॐ हं हनुमते नमः जप गर्नुहोस्।',
      remedyEn: 'Light a lamp at Lord Hanuman temple on Saturday and chant Om Ham Hanumate Namah.'
    },
    monthly: {
      predictionNe: 'यो महिना कुम्भ राशीका लागि अन्तर्राष्ट्रिय सम्पर्क, सामाजिक आन्दोलनको नेतृत्व र ठूला आर्थिक योजनाको रहनेछ। तपाईँको मौलिक सोच र दूरदृष्टिको सर्वत्र कदर हुनेछ।',
      predictionEn: 'A visionary month of international networking, progressive leadership, and solid fiscal expansion for Aquarius.',
      careerNe: 'अनुसन्धान, विज्ञान, मिडिया र प्राविधिक स्टार्टअपमा ठूलो सफलता मिल्नेछ। नयाँ साझेदार जोडिनेछन्।',
      careerEn: 'Stellar headway in science, digital startups, media, and cutting-edge research alliances.',
      loveNe: 'दाम्पत्य जीवनमा आत्मीयता र बौद्धिक सामञ्जस्य बढ्नेछ। परिवारसँग रमाइलो उत्सव मनाइनेछ।',
      loveEn: 'Deep intellectual resonance in marriage and joyful celebrations with extended family.',
      healthNe: 'मानसिक ताजगी र ऊर्जा उच्च रहनेछ। नियमित प्राणायामले तनाव पूरै हटाउनेछ।',
      healthEn: 'High cognitive vitality and emotional balance sustained by consistent breathwork.',
      financeNe: 'सञ्चित कोषमा भारी वृद्धि हुनेछ। शेयर बजार र नयाँ प्रविधिमा गरिएको लगानीबाट लाभ मिल्नेछ।',
      financeEn: 'Substantial liquidity increase and profitable returns from tech stocks and dynamic assets.',
      luckyNumber: 8,
      luckyColorNe: 'निलो र चाँदी',
      luckyColorEn: 'Cyan Blue & Silver',
      rating: 5,
      remedyNe: 'प्रत्येक शनिबार अपाङ्ग वा दृष्टिविहीन व्यक्तिहरूलाई फलफूल वा भोजन सेवा गर्नुहोस्।',
      remedyEn: 'Serve nutritious food or fruits to differently-abled individuals every Saturday.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ कुम्भ राशीका लागि नवप्रवर्तन, अन्तर्राष्ट्रिय ख्याति र सर्वपक्षीय उन्नतिको स्वर्णिम वर्ष हुनेछ। शनी र बृहस्पतिको शुभ दृष्टिले वर्षभरि मान-सम्मान, पदोन्नति र ठूलो धनलाभ दिलाउनेछ।',
      predictionEn: 'Year 2083 BS stands as a golden era of technological breakthroughs, global renown, and holistic triumph for Aquarius.',
      careerNe: 'पहिलो चौमासिकमा नयाँ उद्यमको थालनी, दोस्रो चौमासिकमा विश्वव्यापी विस्तार र तेस्रो चौमासिकमा ऐतिहासिक सम्मान प्राप्त हुनेछ।',
      careerEn: 'Q1 launches innovative enterprises, Q2 expands international footprint, and Q3/Q4 earns landmark global acclaim.',
      loveNe: 'विवाहको शुभ लगन र सन्तति सुखको प्रबल योग छ। पारिवारिक जीवनमा सुख-शान्ति छाउनेछ।',
      loveEn: 'Auspicious wedding bells, joyful progeny blessings, and supreme peace in home life.',
      healthNe: 'समग्र वर्ष स्वास्थ्य सामान्यतया सबल रहनेछ। नियमित योग र अध्यात्मले दीर्घायु बनाउनेछ।',
      healthEn: 'Robust vitality and mental clarity supported by continuous yoga and mindful lifestyle.',
      financeNe: 'आर्थिक दृष्टिकोणले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Tremendous wealth creation, multi-fold expansion of assets, and enduring financial freedom.',
      luckyNumber: 8,
      luckyColorNe: 'आसमानी, निलो र बैजनी',
      luckyColorEn: 'Electric Blue, Cobalt & Violet',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य हनुमान अष्टक पाठ गर्नुहोस् र शनिबार पीपलको रुख मुनि दीप प्रज्वलन गर्नुहोस्।',
      remedyEn: 'Chant Hanuman Ashtak daily and light an oil lamp under a Peepal tree on Saturdays.'
    }
  },

  // 12. मीन (Pisces)
  {
    rashi: 'मीन',
    englishName: 'Pisces',
    symbol: '♓',
    element: 'Water',
    lordNe: 'गुरु',
    lordEn: 'Jupiter',
    weekly: {
      predictionNe: 'मीन राशी हुनेहरूका लागि यो साता आध्यात्मिक जागरण, वैदेशिक कार्य र परोपकारको रहनेछ। आफ्नै राशीस्वामी बृहस्पतिको कृपाले शिक्षण, परामर्श, कला र धार्मिक अनुष्ठानमा उच्च सफलता मिल्नेछ। बिहीबार र सोमबार अति शुभ दिन हुन्।',
      predictionEn: 'A sacred and spiritually uplifting week of overseas connections, philanthropy, and artistic success for Pisces.',
      careerNe: 'अध्यापन, चिकित्सा, परामर्श, वैदेशिक व्यापार र परोपकारी संस्थाहरूमा नयाँ उचाइ हासिल हुनेछ।',
      careerEn: 'Superb progress in medical healing, higher education, international logistics, and philanthropic missions.',
      loveNe: 'सम्बन्धमा समर्पण, विश्वास र मधुरता छाउनेछ। प्रियजनबाट हार्दिक सहयोग र सल्लाह पाइनेछ।',
      loveEn: 'Deep emotional devotion and mutual affection. Loved ones offer heartfelt encouragement.',
      healthNe: 'पाचन र निद्राको सन्तुलन मिलाउनुहोला। ध्यान र शान्त वातावरणले आरोग्य बढाउनेछ।',
      healthEn: 'Prioritize restorative sleep and balanced digestion. Meditation enhances inner harmony.',
      financeNe: 'आर्थिक अवस्था सुदृढ रहनेछ। धार्मिक तथा परोपकारी काममा खर्च भए पनि आम्दानीको नियमित स्रोत बन्नेछ।',
      financeEn: 'Stable financial inflows. Spending on noble causes accompanied by steady incoming wealth.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो, सेतो र केसरी',
      luckyColorEn: 'Bright Yellow, Saffron & Pure White',
      rating: 5,
      remedyNe: 'बिहीबार भगवान विष्णुलाई पहेँलो फल र चन्दन अर्पण गरी ॐ नमो भगवते वासुदेवाय जप गर्नुहोस्।',
      remedyEn: 'Offer yellow fruits and sandalwood to Lord Vishnu on Thursday chanting Om Namo Bhagavate Vasudevaya.'
    },
    monthly: {
      predictionNe: 'यो महिना मीन राशीका लागि वैदेशिक यात्रा, आध्यात्मिक साधना र ठूला परोपकारी परियोजनाहरूको रहनेछ। गुरुजन र साधु-सन्तहरूको आशीर्वादले जीवनमा नयाँ ऊर्जा र मार्गदर्शन प्राप्त हुनेछ।',
      predictionEn: 'A deeply rewarding month of overseas expeditions, spiritual elevation, and impactful philanthropy for Pisces.',
      careerNe: 'शिक्षा, अनुसन्धान, अस्पताल, आयात-निर्यात र कूटनीतिमा ठूलो सफलता मिल्नेछ। नयाँ सम्झौता हुनेछ।',
      careerEn: 'Major breakthroughs in higher academia, healthcare leadership, import-export, and foreign diplomacy.',
      loveNe: 'दाम्पत्य जीवनमा आत्मीयता र शान्ति रहनेछ। परिवारका साथ धार्मिक तीर्थयात्रा सम्पन्न हुनेछ।',
      loveEn: 'Serene marital harmony and sacred family pilgrimages bringing collective blessings.',
      healthNe: 'स्वास्थ्य स्थिति उत्तम रहनेछ। सात्विक खानपान र ध्यानले मानसिक शान्ति दिनेछ।',
      healthEn: 'Optimum physical and spiritual wellness reinforced by Sattvic diet and regular meditation.',
      financeNe: 'सञ्चित कोषमा वृद्धि हुनेछ। पैतृक सम्पत्ति परिचालन वा नयाँ लगानीबाट राम्रो प्रतिफल मिल्नेछ।',
      financeEn: 'Healthy growth in liquid reserves and rewarding returns from ancestral property and safe funds.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो र सुनौलो',
      luckyColorEn: 'Yellow & Gold',
      rating: 5,
      remedyNe: 'प्रत्येक बिहीबार केराको रुखमा जल चढाउनुहोस् र विद्यार्थी वा ब्राह्मणलाई धार्मिक ग्रन्थ वा शैक्षिक सामग्री दान गर्नुहोस्।',
      remedyEn: 'Offer water to a banana tree and donate sacred texts or study material to students on Thursdays.'
    },
    yearly: {
      predictionNe: 'वर्ष २०८३ मीन राशीका लागि आध्यात्मिक शिखर, वैदेशिक अवसर र सर्वपक्षीय प्रगतिको स्वर्णिम वर्ष साबित हुनेछ। आफ्नै राशीस्वामी बृहस्पतिको विशेष अनुकम्पाले वर्षभरि मान-सम्मान र सफलताको कीर्तिमान बन्नेछ।',
      predictionEn: 'Year 2083 BS stands as an extraordinary year of spiritual pinnacle, foreign triumphs, and supreme prosperity for Pisces.',
      careerNe: 'पहिलो चौमासिकमा वैदेशिक अवसर, दोस्रो चौमासिकमा संस्थागत नेतृत्व र तेस्रो चौमासिकमा राष्ट्रिय तथा अन्तर्राष्ट्रिय सम्मान मिल्नेछ।',
      careerEn: 'Q1 unlocks coveted overseas avenues, Q2 elevates institutional authority, and Q3/Q4 delivers global accolades.',
      loveNe: 'पारिवारिक जीवन सुखमय र आध्यात्मिक रहनेछ। सन्तान सुख र माङ्गलिक उत्सवहरूको लामो श्रृंखला वर्षभरि जारी रहनेछ।',
      loveEn: 'Joyful family harmony, celebration of auspicious events, and immense happiness from progeny.',
      healthNe: 'वर्षभरि स्वास्थ्य सबल रहनेछ। नियमित ध्यान र प्राणायामले मानसिक शान्ति र उच्च उर्जा कायम राख्नेछ।',
      healthEn: 'High physical stamina and serene mental peace maintained through daily meditation and Yoga.',
      financeNe: 'आर्थिक दृष्टिकोणले २०८३ साल बहुआयामिक लाभ र धन सञ्चयको वर्ष हुनेछ। स्थिर सम्पत्तिमा भारी वृद्धि हुनेछ।',
      financeEn: 'Exceptional financial abundance, multiplication of real estate, and permanent fiscal stability.',
      luckyNumber: 3,
      luckyColorNe: 'पहेँलो, केसरी र सेतो',
      luckyColorEn: 'Golden Yellow, Saffron & White',
      rating: 5,
      remedyNe: 'वर्षभरि नित्य विष्णु सहस्रनामको पाठ गर्नुहोस् वा ॐ नमो नारायणाय जप गर्नुहोस्।',
      remedyEn: 'Recite Vishnu Sahasranama daily or chant Om Namo Narayanaya throughout the year.'
    }
  }
];

export function getRashiForecastBySign(rashiName: string): RashiForecastDetail | undefined {
  return ALL_RASHI_FORECASTS.find(
    f => f.rashi === rashiName || f.englishName.toLowerCase() === rashiName.toLowerCase()
  );
}
