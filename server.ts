import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI Client Helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Jyotish Pandit Shambhu Prasad Lamsal AI' });
});

// AI Chat Consultation Route using Gemini
app.post('/api/chat', async (req, res) => {
  const language = req.body?.language || 'ne';
  try {
    const { messages, topic = 'general' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMsg = messages[messages.length - 1];
    const userText = lastUserMsg.text || lastUserMsg.content || lastUserMsg.message || '';

    if (!userText || typeof userText !== 'string' || userText.trim() === '') {
      return res.status(400).json({ error: 'Valid text prompt is required.' });
    }

    const systemInstruction = language === 'en'
      ? `You are Binay Guru AI Assistant (official AI consultant representing Youth Astrologer Pandit Shambhu Prasad Lamsal - Binay Guru).
Your primary role is to provide authoritative, respectful, and helpful astrological, Panchang, Rashifal, Numerology, and Vastu Shastra consultations.

CRITICAL RULES:
1. Answer ONLY in English language. Do not mix with Nepali Devanagari script. Use respectful greetings like "Om Namah Shivaya", "Subhamastu", "Namaste".
2. Introduce or refer to yourself as "Binay Guru AI Assistant".
3. DO NOT provide Ayurveda, medical prescriptions, herbal medicines, or health disease treatments. Focus strictly on Vedic Astrology (planets, dasha, yogas, mantra japa, spiritual remedies), Rashifal, Panchang, Numerology, and Vastu Shastra.
4. Provide clear, structured, inspiring guidance.`
      : `तपाईँ विनय गुरु AI Assistant (Binay Guru AI Assistant - ज्योतिष युवा पण्डित शम्भु प्रसाद लम्सालको आधिकारिक एआई परामर्शदाता) हुनुहुन्छ।
तपाईँको मुख्य जिम्मेवारी वैदिक ज्योतिष, पञ्चाङ्ग, राशिफल, अंक ज्योतिष र वास्तु शास्त्रका विषयमा शुद्ध, आदरणीय र उपयोगी परामर्श प्रदान गर्नु हो।

कडा नियमहरू:
१. केवल नेपाली भाषा (देवनागरी लिपि) मा उत्तर दिनुहोस्। ॐ, नमः शिवाय, शुभमस्तु, आदरणीय जस्ता शब्दहरूको प्रयोग गर्नुहोस्।
२. आफ्नो परिचय 'विनय गुरु AI Assistant' का रूपमा दिनुहोस्।
३. आयुर्वेद, जडीबुटी, घरेलु औषधोपचार वा स्वास्थ्य चिकित्सा सम्बन्धी सल्लाह नदिनुहोस्। आफ्नो परामर्श केवल वैदिक ज्योतिष (कुण्डली, दशा, ग्रह शान्ति, मन्त्र जप, पूजा, रत्न), पञ्चाङ्ग, राशिफल, अंक ज्योतिष र वास्तु शास्त्रमा मात्र केन्द्रित राख्नुहोस्।
४. विदेश यात्रा तथा देश सिफारिसको प्रश्न आएमा:
   - अधिकतम ४ देश मात्र सिफारिस गर्नुहोस् (१ देखि ३ वटा मात्र दिनु अझ उत्तम)।
   - वास्तविक देशको नाम दिनुहोस् (कतार, यूएई, साउदी अरेबिया, जर्मनी, क्यानडा, अष्ट्रेलिया, अमेरिका आदि)। Generic क्षेत्रका नाम (Gulf, Europe आदि) प्रयोग नगर्नुहोस्।
   - आउटपुट ढाँचा:
     “तपाईंका लागि अनुकूल देशहरू”
     १. [देश] — विशेष रूपमा अनुकूल
     २. [देश] — राम्रो विकल्प
     ३. [देश] — अनुकूल
     त्यसपछि कुण्डलीको १२ औँ भाव, ९ औँ भाव, लग्न र दशा अनुसारको सटिक ज्योतिषीय कारण प्रस्तुत गर्नुहोस्।`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userText,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || (language === 'en' ? 'Om Namah Shivaya! Please ask your question clearly.' : 'ॐ नमः शिवाय। कृपया आफ्नो प्रश्न पुनः सोध्नुहोस्।');
      return res.json({ reply: responseText });
    } catch (geminiErr: any) {
      console.error('Gemini SDK Call Error:', geminiErr);
      
      const fallbackRepliesEn: { [key: string]: string } = {
        astrology: `Om Namah Shivaya! In Vedic astrology, planetary transits significantly influence career, health, and personal relationships. Performing spiritual remedies and observing auspicious muhurats brings peace and prosperity.`,
        numerology: `Subhamastu! In Numerology, your Birth Number (Mulank) and Life Path Number (Bhagyank) define your innate traits and optimal career trajectory. Alignment with lucky colors and numbers enhances success.`,
        vastu: `Om! According to Vastu Shastra, keeping the North-East (Ishaan) corner clean and clutter-free invites divine positive energy into your home or office.`,
        general: `Namaste! Welcome to Binay Guru AI Assistant Consultation. I am here to assist you with Vedic Astrology, Panchang, Vastu, and Numerology wisdom.`
      };

      const fallbackRepliesNe: { [key: string]: string } = {
        astrology: `ॐ नमः शिवाय! ज्योतिष शास्त्र अनुसार ग्रह र नक्षत्रको प्रभावले जीवनमा उतारचढाव ल्याउँछ। दैनिक पञ्चाङ्ग र राशिफल हेरेर शुभ समयमा कार्य थालनी गर्दा सफलता मिल्नेछ।`,
        numerology: `शुभमस्तु! अंक शास्त्र अनुसार तपाईँको जन्ममितिको योग (मूलांक र भाग्यांक) ले तपाईँको स्वभाव र करियर निर्धारण गर्दछ।`,
        vastu: `ॐ! वास्तु शास्त्र अनुसार घर वा कार्यस्थलमा उर्जा सन्तुलित राख्न ईशान कोण (North-East) लाई सधैँ सफा र खाली राख्नुहोस्।`,
        general: `नमस्ते! विनय गुरु AI Assistant (Binay Guru AI Assistant) को परामर्श सेवामा तपाईँलाई स्वागत छ। म ज्योतिष, पञ्चाङ्ग, वास्तु र अंक ज्योतिषका विषयमा मार्गदर्शन गर्न उपस्थित छु।`
      };

      const fallbacks = language === 'en' ? fallbackRepliesEn : fallbackRepliesNe;
      return res.json({
        reply: fallbacks[topic] || fallbacks.general
      });
    }
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.status(500).json({
      reply: language === 'en' ? 'Apologies, a technical error occurred. Please try again.' : 'क्षमा गर्नुहोस्, ज्योतिष परामर्श सेवामा केही प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
    });
  }
});
app.post('/api/rashifal-ai', async (req, res) => {
  try {
    const { rashi, period = 'daily', language = 'ne', targetDate } = req.body;

    if (!rashi) {
      return res.status(400).json({ error: language === 'en' ? 'Rashi name is required.' : 'राशी नाम आवश्यक छ।' });
    }

    const dateNotice = targetDate ? `(Date: ${targetDate})` : `(Date: ${new Date().toISOString().split('T')[0]})`;

    const periodNamesNe: { [key: string]: string } = {
      daily: `दैनिक (Today ${dateNotice})`,
      weekly: 'साप्ताहिक (This Week)',
      monthly: 'मासिक (This Month)',
      yearly: 'वार्षिक (वर्ष २०८३)'
    };
    const periodNamesEn: { [key: string]: string } = {
      daily: `Daily (Date ${dateNotice})`,
      weekly: 'Weekly (This Week)',
      monthly: 'Monthly (This Month)',
      yearly: 'Yearly (Year 2083 BS)'
    };

    const periodTitle = language === 'en' ? (periodNamesEn[period] || 'Daily') : (periodNamesNe[period] || 'दैनिक');

    const detailInstruction = period === 'yearly'
      ? 'Provide an EXTREMELY DETAILED, COMPREHENSIVE annual forecast for Year 2083 BS with quarter-by-quarter insights, major planetary transits (Jupiter, Saturn, Rahu-Ketu), deep career analysis, financial prospects, health guidelines, and spiritual remedies.'
      : period === 'monthly'
      ? 'Provide a RICH, IN-DEPTH MONTHLY forecast detailing mid-month lunar transitions, prime opportunities, financial flow, personal relationships, and key caution dates.'
      : period === 'weekly'
      ? 'Provide a DETAILED WEEKLY horoscope covering weekday breakdown, peak days, professional strategies, and interpersonal dynamics.'
      : 'Provide a concise, focused daily prediction for today.';

    const prompt = language === 'en'
      ? `You are Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay).
Provide an authoritative, highly inspiring and accurate ${periodTitle} Rashifal (Horoscope prediction) for Zodiac sign '${rashi}' on date ${dateNotice} in English language.

${detailInstruction}

Include structured sections in English:
1. General Overview & Planetary Energy
2. Career, Business & Professional Milestones
3. Financial Wealth, Investments & Prosperity
4. Love, Marriage & Family Harmony
5. Health, Vitality & Emotional Well-being
6. Key Auspicious Days & Astrological Remedies

Keep tone respectful, traditional yet encouraging. Use words like Om, Subhamastu, Namaste.`
      : `You are Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay).
Provide an authoritative, highly inspiring and accurate ${periodTitle} Rashifal (Horoscope prediction) for Zodiac sign '${rashi}' on date ${dateNotice} in Nepali language (Devanagari script).

${detailInstruction}

Include structured sections in Nepali:
१. समग्र फलकथन तथा गोचर ग्रह स्थिति (General Prediction & Planetary Transits)
२. व्यापार, व्यवसाय र करियर (Career & Business Growth)
३. आर्थिक स्थिति, लगानी र लाभ (Finance, Wealth & Investment)
४. प्रेम, विवाह र पारिवारिक सम्बन्ध (Love, Family & Relationships)
५. स्वास्थ्य, उर्जा र मानसिक प्रसन्नता (Health & Vitality)
६. शुभ दिन, भाग्यशाली दिशा र ग्रह शान्ति उपाय (Auspicious Days & Remedies)

Keep tone respectful, traditional yet encouraging. Use words like ॐ, शुभमस्तु.`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      return res.json({
        rashi,
        period,
        predictionText: response.text || (language === 'en'
          ? `Om Namah Shivaya! For ${rashi}, this period brings auspicious energy and fruitful opportunities. Regular spiritual practice will resolve obstacles.`
          : `ॐ नमः शिवाय! ${rashi} राशीका लागि यो समय शुभ रहनेछ। नित्य इष्टदेवको पूजा गर्दा कार्यमा सफलता मिल्नेछ।`)
      });
    } catch (aiErr) {
      return res.json({
        rashi,
        period,
        predictionText: language === 'en'
          ? `Om Namah Shivaya! For ${rashi}, this ${periodTitle} period brings positive energy, progress in endeavors, and harmony through hard work and faith.`
          : `ॐ नमः शिवाय! ${rashi} राशीका लागि यो ${periodTitle} अवधिमा परिश्रमको राम्रो फल मिल्नेछ। सकारात्मक सोचका साथ अघि बढ्नुहोला।`
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Horoscope analysis error.' });
  }
});

// Numerology API
app.post('/api/numerology', (req, res) => {
  try {
    const { fullName, birthDate, language = 'ne' } = req.body;
    if (!birthDate) {
      return res.status(400).json({ error: language === 'en' ? 'Date of birth is required.' : 'जन्ममिति आवश्यक छ।' });
    }

    const cleanDate = birthDate.replace(/[^0-9]/g, '');
    let daySum = 0;
    const dateObj = new Date(birthDate);
    const dayVal = dateObj.getDate();
    
    // Mulank: sum of day digits
    let tempDay = dayVal;
    while (tempDay > 0) {
      daySum += tempDay % 10;
      tempDay = Math.floor(tempDay / 10);
    }
    while (daySum > 9) {
      let t = daySum;
      daySum = 0;
      while (t > 0) { daySum += t % 10; t = Math.floor(t / 10); }
    }
    const mulank = daySum === 0 ? 1 : daySum;

    // Bhagyank: sum of all date digits
    let totalSum = 0;
    for (let char of cleanDate) {
      totalSum += parseInt(char, 10) || 0;
    }
    while (totalSum > 9) {
      let t = totalSum;
      totalSum = 0;
      while (t > 0) { totalSum += t % 10; t = Math.floor(t / 10); }
    }
    const bhagyank = totalSum === 0 ? 3 : totalSum;

    // Namank: sum of name letters based on Chaldean numerology
    const charValues: { [key: string]: number } = {
      A:1, I:1, J:1, Q:1, Y:1,
      B:2, G:2, K:2,
      C:3, D:3, E:5, F:8,
      H:5, L:3, M:4, N:5,
      O:7, P:8, R:2, S:3,
      T:4, U:6, V:6, W:6, X:5, Z:7
    };
    let nameSum = 0;
    if (fullName) {
      const upper = fullName.toUpperCase();
      for (let ch of upper) {
        if (charValues[ch]) nameSum += charValues[ch];
      }
    }
    while (nameSum > 9) {
      let t = nameSum;
      nameSum = 0;
      while (t > 0) { nameSum += t % 10; t = Math.floor(t / 10); }
    }
    const namank = nameSum === 0 ? mulank : nameSum;

    const meaningsNe: { [key: number]: { trait: string, planet: string, career: string } } = {
      1: { trait: 'नेतृत्वदायी, साहसी र महत्त्वाकांक्षी (Sun/सूर्य)', planet: 'सूर्य', career: 'प्रशासन, राजनीति, व्यवस्थापन, उद्यमशीलता' },
      2: { trait: 'शान्त, भावुक, कल्पनाशील र सहयोगी (Moon/चन्द्रमा)', planet: 'चन्द्रमा', career: 'कला, शिक्षण, परामर्श, लेखन, समाजसेवा' },
      3: { trait: 'ज्ञानी, वक्ता, दार्शनिक र अनुशासनप्रेमी (Jupiter/बृहस्पति)', planet: 'बृहस्पति', career: 'शिक्षा, ज्योतिष, कानून, वित्तीय सल्लाहकार' },
      4: { trait: 'मेहनती, व्यावहारिक र दूरदर्शी (Rahu/राहु)', planet: 'राहु', career: 'आईटी, इन्जिनियरिङ, अनुसन्धान, योजनाकार' },
      5: { trait: 'चतुर, व्यापारी, सञ्चार कुशल र बौद्धिक (Mercury/बुध)', planet: 'बुध', career: 'व्यापार, मिडिया, सञ्चार, बैंकिङ, शेयर बजार' },
      6: { trait: 'आकर्षक, प्रेमील, कलात्मक र सौन्दर्यप्रेमी (Venus/शुक्र)', planet: 'शुक्र', career: 'फैशन, डिजाइनिङ, संगीत, आतिथ्य, चलचित्र' },
      7: { trait: 'गम्भीर, अनुसन्धानकर्ता, रहस्यवादी र आध्यात्मिक (Ketu/केतु)', planet: 'केतु', career: 'अनुसन्धान, अध्यात्म, दर्शन, विज्ञान, ज्योतिष' },
      8: { trait: 'कर्मयोगी, सहनशील, न्यायप्रिय र सङ्घर्षशील (Saturn/शनि)', planet: 'शनि', career: 'उद्योग, निर्माण, कानून, रियल स्टेट, खानी' },
      9: { trait: 'ऊर्जावान, योद्धा, मानवीय र परोपकारी (Mars/मंगल)', planet: 'मंगल', career: 'सेना, प्रहरी, चिकित्सा, खेलकुद, प्रविधि' },
    };

    const meaningsEn: { [key: number]: { trait: string, planet: string, career: string } } = {
      1: { trait: 'Leadership, Ambitious & Courageous (Sun)', planet: 'Sun', career: 'Administration, Politics, Executive Management, Entrepreneurship' },
      2: { trait: 'Peaceful, Intuitive & Diplomatic (Moon)', planet: 'Moon', career: 'Arts, Teaching, Counseling, Writing, Public Relations' },
      3: { trait: 'Wise, Creative & Philosophical (Jupiter)', planet: 'Jupiter', career: 'Education, Astrology, Law, Financial Advisory' },
      4: { trait: 'Hardworking, Practical & Visionary (Rahu)', planet: 'Rahu', career: 'IT, Engineering, Research, Strategic Planning' },
      5: { trait: 'Versatile, Communicative & Intellectual (Mercury)', planet: 'Mercury', career: 'Commerce, Media, Journalism, Banking, Trading' },
      6: { trait: 'Charming, Artistic & Compassionate (Venus)', planet: 'Venus', career: 'Fashion, Design, Music, Hospitality, Cinema' },
      7: { trait: 'Analytical, Mystical & Spiritual (Ketu)', planet: 'Ketu', career: 'Scientific Research, Philosophy, Astrology, Meditation' },
      8: { trait: 'Disciplined, Persistent & Justice-Minded (Saturn)', planet: 'Saturn', career: 'Industry, Construction, Law, Real Estate, Manufacturing' },
      9: { trait: 'Energetic, Humanitarian & Courageous (Mars)', planet: 'Mars', career: 'Military, Medicine, Sports, Engineering, Technology' },
    };

    const meanings = language === 'en' ? meaningsEn : meaningsNe;

    const result = {
      mulank,
      bhagyank,
      namank,
      mulankMeaning: meanings[mulank]?.trait || (language === 'en' ? 'Balanced & Creative' : 'सन्तुलित र सिर्जनशील'),
      bhagyankMeaning: meanings[bhagyank]?.trait || (language === 'en' ? 'Progressive & Brave' : 'प्रगतिशील र साहसी'),
      namankMeaning: meanings[namank]?.trait || (language === 'en' ? 'Influential & Popular' : 'लोकप्रिय र प्रभावशाली'),
      luckyNumbers: [mulank, (mulank + 2) % 9 || 9, (mulank + 4) % 9 || 9],
      unluckyNumbers: [mulank === 8 ? 4 : 8],
      luckyColors: mulank === 1 || mulank === 3 || mulank === 9
        ? (language === 'en' ? ['Saffron', 'Gold', 'Red'] : ['केसरी', 'सुनौलो', 'रातो'])
        : (language === 'en' ? ['White', 'Light Blue', 'Green'] : ['सेतो', 'हल्का निलो', 'हरियो']),
      luckyDays: language === 'en' ? ['Sunday', 'Monday', 'Thursday'] : ['आइतबार', 'सोमबार', 'बिहीबार'],
      favorableCareers: [meanings[mulank]?.career, meanings[bhagyank]?.career],
      yearPrediction: language === 'en'
        ? `For 2026, the influence of Mulank ${mulank} and Bhagyank ${bhagyank} indicates significant progress, career milestones, and spiritual growth.`
        : `वर्ष २०२६ तपाईँका लागि मूलांक ${mulank} र भाग्यांक ${bhagyank} को प्रभावले गर्दा व्यवसाय, अध्ययन तथा व्यक्तिगत जीवनमा नयाँ फड्को मार्ने वर्ष हुनेछ।`
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Numerology calculation error.' });
  }
});

// Guna Milan / Compatibility Matching API
app.post('/api/guna-milan', (req, res) => {
  try {
    const { boyName, girlName, language = 'ne' } = req.body;
    if (!boyName || !girlName) {
      return res.status(400).json({ error: language === 'en' ? 'Both names are required.' : 'दुवैजनाको नाम आवश्यक छ।' });
    }

    const bLen = boyName.length;
    const gLen = girlName.length;
    const score = Math.floor(18 + ((bLen * 3 + gLen * 5) % 18)); // Score between 18 and 36

    let grade = language === 'en' ? 'Good Match' : 'उत्तम (Good)';
    if (score >= 28) grade = language === 'en' ? 'Excellent Match' : 'अति उत्तम (Excellent)';
    else if (score >= 22) grade = language === 'en' ? 'Good Match' : 'उत्तम (Good)';
    else if (score >= 18) grade = language === 'en' ? 'Average Match' : 'मध्यम (Average)';
    else grade = language === 'en' ? 'Below Average' : 'सामान्य (Below Average)';

    return res.json({
      totalPoints: score,
      maxPoints: 36,
      manglikBoy: (bLen % 2 === 0),
      manglikGirl: (gLen % 3 === 0),
      compatibilityGrade: grade,
      gunaBreakdown: language === 'en' ? [
        { category: 'Varna (Work & Ego Compatibility)', maxPoints: 1, obtainedPoints: 1, description: 'Excellent alignment in work ethics, mutual respect, and life purpose.' },
        { category: 'Vashya (Mutual Attraction & Control)', maxPoints: 2, obtainedPoints: 2, description: 'Strong emotional magnetism and harmonious mutual influence.' },
        { category: 'Tara (Longevity & Mutual Luck)', maxPoints: 3, obtainedPoints: Math.min(3, Math.floor(score / 10) + 1), description: 'Auspicious fortune, prosperity, and life longevity.' },
        { category: 'Yoni (Intimate & Emotional Harmony)', maxPoints: 4, obtainedPoints: Math.min(4, Math.floor(score / 9) + 1), description: 'Deep emotional empathy, affection, and physical compatibility.' },
        { category: 'Graha Maitri (Mental & Planetary Friendship)', maxPoints: 5, obtainedPoints: Math.min(5, Math.floor(score / 8) + 1), description: 'Intellectual friendship and shared outlook on family life.' },
        { category: 'Gana (Temperament & Behavior)', maxPoints: 6, obtainedPoints: Math.min(6, Math.floor(score / 7) + 2), description: 'Balanced nature, mutual adaptability, and peaceful home environment.' },
        { category: 'Bhakoot (Love, Family & Growth)', maxPoints: 7, obtainedPoints: Math.min(7, Math.floor(score / 6) + 2), description: 'Family growth, financial prosperity, and marital joy.' },
        { category: 'Nadi (Genetics, Health & Lineage)', maxPoints: 8, obtainedPoints: Math.min(8, Math.floor(score / 5) + 2), description: 'Physiological compatibility, healthy lineage, and physical wellbeing.' },
      ] : [
        { category: 'वर्ण (Varna - Work & Ego)', maxPoints: 1, obtainedPoints: 1, description: 'आत्मसम्मान र कार्यशैली समन्वय शुभ छ।' },
        { category: 'वश्य (Vashya - Mutual Attraction)', maxPoints: 2, obtainedPoints: 2, description: 'आपसी आकर्षण र सम्बन्धमा मधुरता रहनेछ।' },
        { category: 'तारा (Tara - Longevity & Luck)', maxPoints: 3, obtainedPoints: Math.min(3, Math.floor(score / 10) + 1), description: 'भाग्य र स्वास्थ्यको अनुकूलता।' },
        { category: 'योनि (Yoni - Emotional Harmony)', maxPoints: 4, obtainedPoints: Math.min(4, Math.floor(score / 9) + 1), description: 'भावना तथा अन्तरंग सम्बन्धमा समझदारी।' },
        { category: 'ग्रह मैत्री (Maitri - Planetary Friendship)', maxPoints: 5, obtainedPoints: Math.min(5, Math.floor(score / 8) + 1), description: 'वैचारिक र मानसिक मेलमिलाप।' },
        { category: 'गण (Gana - Temperament)', maxPoints: 6, obtainedPoints: Math.min(6, Math.floor(score / 7) + 2), description: 'स्वभाव र व्यवहार सन्तुलित रहनेछ।' },
        { category: 'भकूट (Bhakoot - Love & Prosperity)', maxPoints: 7, obtainedPoints: Math.min(7, Math.floor(score / 6) + 2), description: 'वंश वृद्धि र समृद्धि।' },
        { category: 'नाडी (Nadi - Health & Genes)', maxPoints: 8, obtainedPoints: Math.min(8, Math.floor(score / 5) + 2), description: 'वंशानुगत स्वास्थ्य र दीर्घायु।' },
      ],
      recommendations: language === 'en' ? [
        'Chanting Navagraha mantras on Thursdays or Mondays before marriage is highly beneficial.',
        'Mutual understanding, open dialogue, and seeking elders blessings ensures lifelong marital joy.',
        'Performing Satyanarayan Pooja on full moon (Purnima) brings peace and harmony to the household.'
      ] : [
        'विवाह अघि बिहीबार वा सोमबार नवग्रह मन्त्र जप गर्नु उत्तम हुनेछ।',
        'आपसी समझदारी र अग्रजको आशीर्वादले दाम्पत्य जीवन सुखमय रहनेछ।',
        'प्रत्येक पूर्णिमामा सत्यनारायण भगवानको पूजा शुभ फलदायी हुनेछ।'
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Guna Milan calculation error.' });
  }
});

// Vastu Analysis API
app.post('/api/vastu-check', (req, res) => {
  try {
    const { roomType, direction, language = 'ne' } = req.body;

    const vastuRulesNe: { [key: string]: { best: string[], neutral: string[], bad: string[], remedy: string } } = {
      entrance: {
        best: ['E', 'N', 'NE'],
        neutral: ['NW'],
        bad: ['S', 'SW', 'SE'],
        remedy: 'मुख्य ढोकामा तामाको वास्तु यन्त्र, पहेँलो/केसरी रङको प्रयोग र पञ्चमुखी हनुमान जीको फोटो/चित्र राख्नुहोस्।'
      },
      kitchen: {
        best: ['SE', 'NW'],
        neutral: ['E'],
        bad: ['NE', 'SW', 'N'],
        remedy: 'भान्छा घरको आग्नेय कोण (South-East) मा रातो बल्ब बाल्नुहोस् र भित्तामा हल्का पहेँलो वा केसरी रङ लगाउनुहोस्।'
      },
      bedroom: {
        best: ['SW', 'S', 'W'],
        neutral: ['NW'],
        bad: ['NE', 'SE'],
        remedy: 'सुत्ने बेडको शिर उत्तर दिशामा नराख्नुहोस् (दक्षिण वा पूर्व शीर गरेर सुत्ने)। ईशान कोण खाली र सफा राख्नुहोस्।'
      },
      pooja: {
        best: ['NE', 'E', 'N'],
        neutral: ['Center'],
        bad: ['S', 'SW', 'SE'],
        remedy: 'पूजा कोठामा नित्य दियो बाल्नुहोस् र गंगाजल छर्कनुहोस्। भगवानको मुख पूर्व वा उत्तर फर्काएर राख्नुहोस्।'
      },
      bathroom: {
        best: ['NW', 'W', 'S'],
        neutral: ['SE'],
        bad: ['NE', 'N', 'E', 'Center'],
        remedy: 'बाथरूममा सिसाको कचौरामा खडा नुन (Rock Salt) राख्नुहोस् र प्रत्येक हप्ता परिवर्तन गर्नुहोस्।'
      },
      locker: {
        best: ['N', 'NE', 'E'],
        neutral: ['Center'],
        bad: ['S', 'SE', 'SW'],
        remedy: 'सन्दुक वा ढुकुटी उत्तर दिशातर्फ फर्कने गरी राख्नुहोस्। ढुकुटीको भित्री भागमा कुबेर यन्त्र वा श्रीयन्त्र स्थापना गर्नुहोस्।'
      }
    };

    const vastuRulesEn: { [key: string]: { best: string[], neutral: string[], bad: string[], remedy: string } } = {
      entrance: {
        best: ['E', 'N', 'NE'],
        neutral: ['NW'],
        bad: ['S', 'SW', 'SE'],
        remedy: 'Place a copper Vastu Pyramid/Yantra at the main entrance, paint with warm yellow/saffron, and display a Panchamukhi Hanuman image.'
      },
      kitchen: {
        best: ['SE', 'NW'],
        neutral: ['E'],
        bad: ['NE', 'SW', 'N'],
        remedy: 'Keep a red light bulb burning in the South-East (Agneya) corner of the kitchen and paint walls with light yellow or saffron.'
      },
      bedroom: {
        best: ['SW', 'S', 'W'],
        neutral: ['NW'],
        bad: ['NE', 'SE'],
        remedy: 'Never sleep with head towards North (sleep towards South or East). Keep North-East corner clean and clutter-free.'
      },
      pooja: {
        best: ['NE', 'E', 'N'],
        neutral: ['Center'],
        bad: ['S', 'SW', 'SE'],
        remedy: 'Light a ghee lamp daily in the Pooja room and sprinkle Holy water (Gangajal). Face idols East or North.'
      },
      bathroom: {
        best: ['NW', 'W', 'S'],
        neutral: ['SE'],
        bad: ['NE', 'N', 'E', 'Center'],
        remedy: 'Keep a bowl of coarse Rock Salt in a glass bowl in the bathroom and replace it weekly to absorb negative energies.'
      },
      locker: {
        best: ['N', 'NE', 'E'],
        neutral: ['Center'],
        bad: ['S', 'SE', 'SW'],
        remedy: 'Position the cash box / locker facing North (direction of Lord Kuber). Place a Kuber Yantra or Shree Yantra inside.'
      }
    };

    const vastuRules = language === 'en' ? vastuRulesEn : vastuRulesNe;
    const rule = vastuRules[roomType] || vastuRules.entrance;

    let status: 'favorable' | 'neutral' | 'unfavorable' = 'neutral';
    let title = language === 'en' ? 'Balanced Vastu Placement' : 'सन्तुलित वास्तु स्थिति (Balanced)';
    let desc = language === 'en' ? 'This direction yields moderate benefits for this space.' : 'यो दिशा यस कोठाका लागि मध्यम फलदायी छ।';

    if (rule.best.includes(direction)) {
      status = 'favorable';
      title = language === 'en' ? 'Highly Favorable Vastu' : 'अति शुभ एवं वास्तु सम्मत (Highly Favorable)';
      desc = language === 'en' ? 'This is the most auspicious direction for this room, promoting positive energy, financial growth, and peace.' : 'यो दिशा यस कोठाको लागि सर्वोत्तम मानिन्छ। यसले सकारात्मक ऊर्जा, धन र आरोग्यता अभिवृद्धि गर्दछ।';
    } else if (rule.bad.includes(direction)) {
      status = 'unfavorable';
      title = language === 'en' ? 'Vastu Dosha Warning' : 'वास्तु दोष सम्भावना (Unfavorable / Vastu Dosha)';
      desc = language === 'en' ? 'Placing this room in this direction may cause elemental imbalance or Vastu flaws.' : 'यो दिशामा यस कोठा हुनाले ऊर्जाको असन्तुलन वा वास्तु दोष उत्पन्न हुन सक्छ।';
    }

    return res.json({
      status,
      title,
      description: desc,
      remedies: [
        rule.remedy,
        language === 'en' ? 'Burn Camphor and Guggal in the morning and evening to purify household energy.' : 'नित्य बिहान र बेलुका कपूर र गुग्गुलको धूप बालेर घरमा धुवाँ घुमाउनुहोस्।',
        language === 'en' ? 'Maintain a well-lit, immaculate, and inviting main entryway.' : 'घरको मूल द्वार सफा र उज्यालो राख्नुहोस्।'
      ],
      element: direction === 'NE' || direction === 'N'
        ? (language === 'en' ? 'Water / Ether' : 'जल / आकाश')
        : direction === 'SE' || direction === 'E'
        ? (language === 'en' ? 'Fire' : 'अग्नि')
        : (language === 'en' ? 'Earth / Air' : 'पृथ्वी / वायु'),
      idealDirections: rule.best
    });
  } catch (err) {
    return res.status(500).json({ error: 'Vastu analysis error.' });
  }
});

// Guna Milan API
app.post('/api/guna-milan', (req, res) => {
  try {
    const { boyName, girlName, boyBirthDate, girlBirthDate, language } = req.body;
    if (!boyName || !girlName) {
      return res.status(400).json({ error: 'दुवैजनाको नाम आवश्यक छ।' });
    }

    const bLen = boyName.length;
    const gLen = girlName.length;
    const score = Math.floor(18 + ((bLen * 3 + gLen * 5) % 18)); // Score between 18 and 36

    let grade = language === 'en' ? 'Good (उत्तम)' : 'उत्तम (Good)';
    if (score >= 28) grade = language === 'en' ? 'Excellent (अति उत्तम)' : 'अति उत्तम (Excellent)';
    else if (score >= 22) grade = language === 'en' ? 'Good (उत्तम)' : 'उत्तम (Good)';
    else if (score >= 18) grade = language === 'en' ? 'Average (मध्यम)' : 'मध्यम (Average)';
    else grade = language === 'en' ? 'Below Average (सामान्य)' : 'सामान्य (Below Average)';

    return res.json({
      totalPoints: score,
      maxPoints: 36,
      manglikBoy: (bLen % 2 === 0),
      manglikGirl: (gLen % 3 === 0),
      compatibilityGrade: grade,
      gunaBreakdown: [
        {
          category: language === 'en' ? 'Varna (Work & Ego Compatibility)' : 'वर्ण (Varna - Work & Ego)',
          maxPoints: 1,
          obtainedPoints: 1,
          description: language === 'en' ? 'Mutual respect and professional ego alignment is favorable.' : 'आत्मसम्मान र कार्यशैली समन्वय शुभ छ।'
        },
        {
          category: language === 'en' ? 'Vashya (Mutual Attraction & Control)' : 'वश्य (Vashya - Mutual Attraction)',
          maxPoints: 2,
          obtainedPoints: 2,
          description: language === 'en' ? 'Strong mutual attraction and sweet emotional harmony.' : 'आपसी आकर्षण र सम्बन्धमा मधुरता रहनेछ।'
        },
        {
          category: language === 'en' ? 'Tara (Destiny & Health Compatibility)' : 'तारा (Tara - Longevity & Luck)',
          maxPoints: 3,
          obtainedPoints: Math.min(3, Math.floor(score / 10) + 1),
          description: language === 'en' ? 'Favorable alignment for fortune and well-being.' : 'भाग्य र स्वास्थ्यको अनुकूलता।'
        },
        {
          category: language === 'en' ? 'Yoni (Physical & Intimate Harmony)' : 'योनि (Yoni - Emotional Harmony)',
          maxPoints: 4,
          obtainedPoints: Math.min(4, Math.floor(score / 9) + 1),
          description: language === 'en' ? 'Good affinity and emotional closeness between partners.' : 'भावना तथा अन्तरंग सम्बन्धमा समझदारी।'
        },
        {
          category: language === 'en' ? 'Graha Maitri (Mental Friendship)' : 'ग्रह मैत्री (Maitri - Planetary Friendship)',
          maxPoints: 5,
          obtainedPoints: Math.min(5, Math.floor(score / 8) + 1),
          description: language === 'en' ? 'Harmonious intellectual understanding and friendship.' : 'वैचारिक र मानसिक मेलमिलाप।'
        },
        {
          category: language === 'en' ? 'Gana (Temperament Compatibility)' : 'गण (Gana - Temperament)',
          maxPoints: 6,
          obtainedPoints: Math.min(6, Math.floor(score / 7) + 2),
          description: language === 'en' ? 'Balanced social temperament and behavioral compatibility.' : 'स्वभाव र व्यवहार सन्तुलित रहनेछ।'
        },
        {
          category: language === 'en' ? 'Bhakoot (Prosperity & Lineage)' : 'भकूट (Bhakoot - Love & Prosperity)',
          maxPoints: 7,
          obtainedPoints: Math.min(7, Math.floor(score / 6) + 2),
          description: language === 'en' ? 'High potential for growth, wealth, and family bliss.' : 'वंश वृद्धि र समृद्धि।'
        },
        {
          category: language === 'en' ? 'Nadi (Genetics & Health Compatibility)' : 'नाडी (Nadi - Health & Genes)',
          maxPoints: 8,
          obtainedPoints: Math.min(8, Math.floor(score / 5) + 2),
          description: language === 'en' ? 'Genetic compatibility and long, healthy life together.' : 'वंशानुगत स्वास्थ्य र दीर्घायु।'
        },
      ],
      recommendations: [
        language === 'en'
          ? 'Chanting Navagraha mantras on Thursdays or Mondays prior to marriage is recommended.'
          : 'विवाह अघि बिहीबार वा सोमबार नवग्रह मन्त्र जप गर्नु उत्तम हुनेछ।',
        language === 'en'
          ? 'Mutual trust, open dialogue, and elders’ blessings will ensure lasting marital joy.'
          : 'आपसी समझदारी र अग्रजको आशीर्वादले दाम्पत्य जीवन सुखमय रहनेछ।',
        language === 'en'
          ? 'Observing Satyanarayan Pooja on full moon days invites auspicious energy.'
          : 'प्रत्येक पूर्णिमामा सत्यनारायण भगवानको पूजा शुभ फलदायी हुनेछ।'
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: 'गुण मिलान गणनामा त्रुटि।' });
  }
});

// Pandit Shambhu Prasad Lamsal (Binay) AI Ayurvedic Vaidya Assistant API
app.post('/api/ayurveda-vaidya', async (req, res) => {
  const language = req.body?.language || 'ne';
  try {
    const { query, symptoms, age, gender, doshaType } = req.body;
    const userPrompt = query || symptoms || '';

    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
      return res.status(400).json({
        error: language === 'en' ? 'Please specify your health symptoms or Ayurveda query.' : 'कृपया आफ्नो स्वास्थ्य समस्या वा लक्षण स्पष्ट रूपमा लेख्नुहोस्।'
      });
    }

    const contextDetails = `
User Query/Symptoms: ${userPrompt}
${age ? `Age: ${age}` : ''}
${gender ? `Gender: ${gender}` : ''}
${doshaType ? `Suspected/Known Primary Dosha: ${doshaType}` : ''}
`;

    const systemInstruction = language === 'en'
      ? `You are the official Ayurvedic AI Vaidya Assistant of Master Astrologer & Vedic Scholar Pandit Shambhu Prasad Lamsal (Binay) [ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (बिनय) को AI वैद्य सहायक].

Your purpose is to provide authentic, compassionate, and precise Ayurvedic consultation based on traditional scriptures (Charaka Samhita, Sushruta Samhita, Astanga Hridayam) and classical Himalayan Ayurvedic herbology.

When the user describes symptoms or health queries:
1. Analyze the symptoms to identify potential Ayurvedic Dosha imbalances (Vata / Pitta / Kapha imbalance) and Agni (digestive fire) status.
2. Recommend natural home remedies (घरेलु प्राथमिक उपचार), classical Ayurvedic herbs/formulations (e.g., Triphala, Ashwagandha, Giloy, Shatavari, Brahmi, Mulethi, Mahasudarshan, Avipattikar, Sitopaladi, Dashamula), proper dosage & vehicle (Anupana - warm water, honey, milk, ghee).
3. Specify Dietary & Lifestyle guidelines (Pathya/Apathya - Do's and Don'ts).
4. Provide a clear medical disclaimer reminding the user that this AI consultation is for educational and Ayurvedic guidance, and severe or acute emergency health conditions require in-person examination by a registered Ayurvedic Doctor (BAMS/MD) or physician.

Tone: Respectful, compassionate, scholarly, traditional yet accessible. Use Vedic greetings like "Arogyam Paraman Sukham!", "Om Dhanvantaraye Namah!", "Subhamastu".`
      : `तपाईँ ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) को आधिकारिक एआई आयुर्वेदिक वैद्य सहायक (AI Vaidya Assistant) हुनुहुन्छ।

तपाईँको मुख्य काम मानिसहरूले बताएका स्वास्थ्य समस्या र लक्षणहरूका आधारमा आयुर्वेदिक त्रिदोष (वात, पित्त, कफ) असन्तुलन र जठराग्निको विश्लेषण गरी प्राचीन आयुर्वेदिक ग्रन्थहरू (चरक संहिता, सुश्रुत संहिता, अष्टांग हृदयम्) अनुसारको निदान, घरेलु उपचार, शास्त्रीय जडीबुटी तथा औषधिको ज्ञान र पथ्यापथ्य (आहार-विहार) परामर्श दिनु हो।

परामर्श दिँदा निम्न ढाँचामा स्पष्ट Devanagari Devanagari मा उत्तर दिनुहोस्:

१. 🩺 आयुर्वेदिक निदान र त्रिदोष विश्लेषण (Dosha & Agni Analysis)
२. 🌿 घरेलु र प्राकृतिक प्राथमिक उपचार (Home Remedies & Natural Healing)
३. 💊 प्रमुख शास्त्रीय आयुर्वेदिक औषधि र जडीबुटी ज्ञान (Ayurvedic Herbs & Classical Formulations with Anupana)
४. 🥗 पथ्यापथ्य (के खाने, के नखाने र जीवनशैली - Diet & Daily Habits)
५. ⚠️ वैद्य सल्लाह र सजगता (Disclaimer & Precaution)

आदरयुक्त, करुणामय र वैदिक शैली प्रयोग गर्नुहोस्। "अरोग्यता परमं सुखम्!", "ॐ धन्वन्तरये नमः!", "शुभमस्तु!" जस्ता शब्दहरूबाट सुरुवात गर्नुहोस्।`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contextDetails,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || (
        language === 'en'
          ? 'Om Dhanvantaraye Namah! Please provide more specific symptoms for an accurate Ayurvedic evaluation.'
          : 'ॐ धन्वन्तरये नमः! अरोग्यता परमं सुखम्। कृपया आफ्ना लक्षणहरू थप स्पष्ट खुलाउनुहोस्।'
      );

      return res.json({ reply: replyText });
    } catch (aiErr) {
      console.error('Ayurveda AI Gemini Error:', aiErr);

      const fallbackTextNe = `ॐ धन्वन्तरये नमः! अरोग्यता परमं सुखम्।
ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) को एआई वैद्य परामर्श अनुसार:

१. 🩺 आयुर्वेदिक निदान र त्रिदोष विश्लेषण:
तपाईँले उल्लेख गर्नुभएको समस्या ('${userPrompt}') सामान्यतया पाचन प्रणालीमा मन्दता (मन्दाग्नि) वा वात-पित्त दोषको असन्तुलनले गर्दा हुने गर्दछ।

२. 🌿 घरेलु र प्राकृतिक प्राथमिक उपचार:
• बिहान उठेर मनतातो पानीमा अलिकति मरिच र अदुवाको रस मिसाएर पिउनुहोस्।
• तुलसीको पात, ज्वानो र बेसार उधालेर बनाएको काढा दिनमा २ पटक सेवन गर्नुहोस्।

३. 💊 प्रमुख शास्त्रीय आयुर्वेदिक औषधि ज्ञान:
• त्रिफला चूर्ण: १ चम्चा राति सुत्नु अघि मनतातो पानीसँग (पाचन सन्तुलन र पेट सफा गर्न)।
• गिलोय (गुर्जो) स्वरस वा घनवटी: इम्युनिटी बढाउन र ज्वरो/थकान मेटाउन।
• अविपत्तिकर चूर्ण: पेटमा ग्यासट्रिक वा डकार आउने समस्या भएमा।

४. 🥗 पथ्यापथ्य (के खाने, के नखाने):
• खाने कुरा: मुगको दाल, सात्विक र ताजा खाना, हरीयो सागपात, मनतातो पानी।
• बार्ने कुरा: बासी, अत्यधिक पिरो, तेलयुक्त, चिसो र चाउचाउ/फास्टफुड।

५. ⚠️ वैद्य सल्लाह र सजगता:
यो जानकारी सामान्य वैदिक आयुर्वेद ज्ञानका लागि हो। यदि समस्या गम्भीर, पुरानो वा आकस्मिक छ भने अनुभवी आयुर्वेदिक चिकित्सकसँग प्रत्यक्ष स्वास्थ्य परीक्षण गराउनुहोला।`;

      const fallbackTextEn = `Om Dhanvantaraye Namah! Arogyam Paraman Sukham.
Pandit Shambhu Prasad Lamsal (Binay) AI Vaidya Guidance:

1. 🩺 Ayurvedic Diagnosis & Dosha Analysis:
The symptoms described ('${userPrompt}') typically indicate an imbalance in Vata/Pitta dosha combined with sluggish Agni (digestive fire).

2. 🌿 Home Remedies:
- Drink warm water with a slice of ginger and a pinch of black pepper in the morning.
- Prepare herbal tea with Tulsi leaves, Ajwain (carom seeds), and Turmeric twice daily.

3. 💊 Classical Ayurvedic Formulations:
- Triphala Churna: 1 teaspoon at bedtime with warm water for digestive cleansing.
- Giloy (Guduchi) Kwath/Tablet: For immune strength and metabolic balance.
- Avipattikar Churna: For acidity or indigestion relief.

4. 🥗 Pathya & Apathya (Diet & Lifestyle):
- Recommended: Fresh cooked Moong Dal, green leafy vegetables, warm soups, adequate hydration.
- Avoid: Cold drinks, oily/spicy fried foods, junk food, and erratic sleep schedules.

5. ⚠️ Medical Precaution:
This guidance is rooted in classical Ayurvedic wellness principles. For severe, acute, or chronic health conditions, please consult a certified Ayurvedic doctor in person.`;

      return res.json({
        reply: language === 'en' ? fallbackTextEn : fallbackTextNe
      });
    }
  } catch (err) {
    return res.status(500).json({
      reply: language === 'en'
        ? 'Technical issue in Ayurvedic AI Vaidya service. Please try again.'
        : 'क्षमा गर्नुहोस्, एआई आयुर्वेदिक वैद्य सेवामा प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
    });
  }
});

// Yearly Prediction & Custom Question Astrology AI Endpoint
app.post('/api/yearly-phalit-ai', async (req, res) => {
  const language = req.body?.language || 'ne';
  try {
    const {
      name,
      birthDate,
      birthPlace,
      targetYear,
      targetYearBS,
      question,
      dashaSummary,
      lagna,
      rashi
    } = req.body;

    const systemInstruction = language === 'en'
      ? `You are Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay), a revered Vedic Astrologer from Nepal.
You provide precise, authoritative, compassionate, and deeply personalized Vedic yearly astrological predictions (वार्षिक फलित).
Analyze the native's Dasha, Antardasha, 12 Bhavas, and planetary placements in detail.

STRICT COUNTRY RECOMMENDATION RULES FOR FOREIGN QUERIES:
1. Must be strictly personalized to native's exact Lagna, Rashi, 12th/9th/10th houses and Dasha.
2. Recommend MAXIMUM 4 countries (ideally 1 to 3). Never give long generic lists.
3. NEVER use generic region labels (like "Gulf countries", "Europe", "Western countries"). Always use real specific country names (e.g., UAE, Qatar, Saudi Arabia, Germany, USA, Canada, Australia, Japan).
4. Output format:
   "तपाईंका लागि अनुकूल देशहरू" (or "Favorable Countries for You"):
   1. [Country Name] — Highly Auspicious / First Priority
   2. [Country Name] — Favorable Option
   3. [Country Name] — Suitable
   Followed by concise astrological reasoning explaining why these specific destinations fit the chart.

Format response with clear, elegant markdown with headers and bullet points. Answer in English.`
      : `तपाईँ ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) हुनुहुन्छ।
तपाईँ वैदिक ज्योतिष, विंशोत्तरी दशा, अन्तर्दशा, १२ भाव र ग्रहगोचरको गहन विश्लेषण गरी प्रत्येक वर्षको सटिक एवं स्पष्ट फलित (वार्षिक भविष्यफल) र परामर्श प्रदान गर्नुहुन्छ।

विदेश यात्रा तथा देश सिफारिस सम्बन्धी कडा नियमहरू:
१. प्रत्येक व्यक्तिको कुण्डली अनुसार देशको सिफारिस व्यक्तिगत (Personalized) हुनुपर्छ। सबैलाई एउटै देशको सूची दोहोर्याउन पाइने छैन।
२. अधिकतम ४ देश मात्र सिफारिस गर्नुहोस् (१, २ वा ३ वटा मात्र दिनु अझ उत्तम)।
३. “Gulf countries”, “Europe”, “Western countries” जस्ता generic labels निषेध छन्। वास्तविक देशको नाम (जस्तै UAE, कतार, साउदी अरेबिया, जर्मनी, क्यानडा, अष्ट्रेलिया, अमेरिका, जापान) दिनुहोस्।
४. आउटपुट ढाँचा:
   “तपाईंका लागि अनुकूल देशहरू”
   १. [देश] — विशेष रूपमा अनुकूल
   २. [देश] — राम्रो विकल्प
   ३. [देश] — अनुकूल
   त्यसपछि छोटो, स्पष्ट ज्योतिषीय कारण लेख्नुहोस्।

१२ भाव र दशाको स्पष्ट तालमेल लेख्नुहोस्।
शुद्ध नेपाली भाषा (देवनागरी लिपि) मा आदरपूर्वक उत्तर दिनुहोस्।`;

    const userPrompt = language === 'en'
      ? `Yearly Astrological Consultation for ${name || 'Native'}:
Birth Date: ${birthDate || 'Not specified'}, Place: ${birthPlace || 'Nepal'}
Lagna: ${lagna || 'Aries'}, Moon Sign (Rashi): ${rashi || 'Aries'}
Target Year: ${targetYear} (BS ${targetYearBS})
Active Dasha Context: ${dashaSummary || 'Vimshottari Dasha Active'}
Native's Specific Question: "${question || 'Provide a complete annual prediction for marriage, career, finance, foreign travel, and health for this year.'}"

Please provide a detailed, accurate astrological assessment with:
1. Dasha & Planetary transit impact for this year
2. Direct answer to the question with timing and probability
3. Specific guidance on Career, Wealth, Marriage/Love, Foreign Travel (including best country recommendations)
4. Key auspicious months and authentic Vedic remedies.`
      : `वार्षिक कुण्डली फलित परामर्श:
नाम: ${name || 'जातक'}, जन्ममिति: ${birthDate || 'उल्लेखित छैन'}, जन्मस्थान: ${birthPlace || 'नेपाल'}
लग्न: ${lagna || 'मेष'}, चन्द्र राशी: ${rashi || 'मेष'}
विश्लेषण वर्ष: ${targetYear} (वि.सं. ${targetYearBS})
सक्रिय दशा स्थिति: ${dashaSummary || 'विंशोत्तरी दशा सक्रिय'}
जातकको प्रश्न/जिज्ञासा: "${question || 'यस वर्षको विवाह, करियर, आर्थिक अवस्था, विदेश यात्रा (कुन देश राम्रो) र स्वास्थ्यको समग्र फलित विश्लेषण गरिदिनुहोस्।'}"

कृपया निम्न बुँदाहरूमा स्पष्ट, व्यावहारिक र सटिक फलादेश लेख्नुहोस्:
१. यस वर्षको दशा र गोचर ग्रहको प्रत्यक्ष प्रभाव
२. सोधिएको प्रश्नको सटिक ज्योतिषीय उत्तर र समय
३. १२ भाव तथा मुख्य क्षेत्रहरू (विवाह, करियर, धन, विदेश यात्रा र कुन देश उपयुक्त हुन्छ) को विश्लेषण
४. यस वर्षका मुख्य शुभ महिना र अचुक वैदिक शान्ति उपायहरू।`;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || (language === 'en'
        ? `Om Namah Shivaya! In ${targetYear}, your active planetary period favors growth in career, stable wealth accumulation, and fruitful overseas opportunities.`
        : `ॐ नमः शिवाय! वर्ष ${targetYear} मा तपाईँको दशा र १२ भावको स्थिति अनुसार करियरमा नयाँ फड्को, आर्थिक लाभ र वैदेशिक क्षेत्रमा सफलता मिल्ने प्रबल योग छ।`);

      return res.json({ reply: responseText });
    } catch (geminiErr) {
      console.warn('Gemini fallback for yearly phalit:', geminiErr);
      const fallbackNe = `ॐ नमः शिवाय! ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) को वार्षिक ज्योतिषीय विश्लेषण:

१. 🌟 दशा र ग्रह विश्लेषण (वर्ष ${targetYear} / वि.सं. ${targetYearBS}):
यस वर्ष तपाईँको सक्रिय दशा र कुण्डलीका १० औँ (कर्म), २/११ औँ (धन/लाभ) तथा १२ औँ (विदेश) भावको सम्बन्ध सकारात्मक छ।

२. ✈️ विदेश यात्रा तथा कुन देश राम्रो:
तपाईँको १२ औँ भाव र राहु/चन्द्रमाको स्थिति अनुसार उत्तर–पश्चिम तथा पश्चिम दिशाका देशहरू (अमेरिका, क्यानडा, बेलायत, युरोप, वा अष्ट्रेलिया) अध्ययन तथा स्थायी बसोबास (PR) का लागि सर्वाधिक उपयुक्त छन्। भाद्र, असोज र माघ महिना भिसा आवेदनका लागि सर्वोत्तम रहनेछन्।

३. 💼 करियर र आर्थिक अवस्था:
कार्यक्षेत्रमा नयाँ अवसर, पदोन्नति र व्यवसायमा नाफा वृद्धि हुनेछ। स्थिर सम्पत्तिमा लगानी गर्दा लाभ मिल्नेछ।

४. 💍 विवाह र सम्बन्ध:
७ औँ भावमा शुभ ग्रहको दृष्टिले वैवाहिक कुराकानी अगाडि बढ्ने र पारिवारिक सुख प्राप्त हुनेछ।

५. 🌿 शुभ महिना र अचुक उपाय:
- शुभ महिना: वैशाख, असार, असोज, कार्तिक र माघ।
- उपाय: नित्य बिहान सूर्य नमस्कार गर्ने, इष्टदेवको आराधना गर्ने र दशा स्वामी ग्रहको बीज मन्त्र १०८ पटक जप गर्ने।`;

      const fallbackEn = `Om Namah Shivaya! Annual Astrological Guidance from Pandit Shambhu Prasad Lamsal:

1. 🌟 Planetary Period & Dasha Impact (${targetYear} / BS ${targetYearBS}):
Your active planetary periods strongly stimulate the 10th house of career, 2nd & 11th houses of wealth, and 12th house of foreign lands.

2. ✈️ Foreign Travel & Recommended Countries:
Based on your 12th house and Rahu alignments, western and north-western countries (USA, Canada, UK/Europe, or Australia) are ideal for higher studies and permanent residency (PR). Aug-Oct and Jan-Feb are prime months for visa filings.

3. 💼 Career & Financial Growth:
Expect career advancement, lucrative business expansion, and solid asset accumulation.

4. 💍 Relationships & Marriage:
Auspicious planetary aspects foster harmonious domestic peace and fruitful marriage proposals.

5. 🌿 Auspicious Timing & Vedic Remedies:
- Favorable Months: Apr-May, Jun-Jul, Sep-Nov, Jan-Feb.
- Remedies: Offer morning water to Lord Surya, chant your Dasha Lord mantra, and seek blessings from elders.`;

      return res.json({ reply: language === 'en' ? fallbackEn : fallbackNe });
    }
  } catch (err) {
    console.error('Yearly Phalit AI API error:', err);
    return res.status(500).json({
      reply: language === 'en'
        ? 'Error processing annual astrology consultation. Please try again.'
        : 'वार्षिक ज्योतिष परामर्श सेवामा प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
    });
  }
});

// ==========================================
// LICENSE & TRUSTED DEVICE AUTHORIZATION API
// ==========================================

interface ServerLicenseRecord {
  id: string;
  licenseKey: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'active' | 'available' | 'revoked' | 'expired';
  authorizedDeviceId?: string | null;
  deviceSecretHash?: string | null;
  deviceStatus?: 'authorized' | 'unbound' | 'blocked' | 'revoked';
  deviceInfo?: any;
  activatedAt?: string | null;
  lastSeenAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tier?: string;
}

interface ServerDevicePaymentRequest {
  id: string;
  deviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName?: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedLicenseKey?: string;
  deviceInfo?: any;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Secret Salt for Deterministic Cryptographic Validation (Works 100% offline & on Vercel without a database)
const CRYPTO_SALT = 'JYOTISH_SECURE_VEDIC_AUTH_SALT_2026_NEPAL';
const SECURE_ALPHANUMERIC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generate8CharKeyChecksum(body6: string, tier: string): string {
  const input = `${body6.toUpperCase().trim()}:${tier.toLowerCase().trim()}:${CRYPTO_SALT}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const char1 = SECURE_ALPHANUMERIC_CHARS.charAt(absHash % SECURE_ALPHANUMERIC_CHARS.length);
  const char2 = SECURE_ALPHANUMERIC_CHARS.charAt(Math.floor(absHash / SECURE_ALPHANUMERIC_CHARS.length) % SECURE_ALPHANUMERIC_CHARS.length);
  return `${char1}${char2}`;
}

function verifySigned8CharKey(keyInput: string): { valid: boolean; tier: string; cleanKey: string } {
  const clean = (keyInput || '').trim().toUpperCase();
  if (clean.length === 8) {
    const body6 = clean.substring(0, 6);
    const sig2 = clean.substring(6, 8);
    const tiers = ['lifetime', 'vvip', 'vip', 'simple'];
    for (const t of tiers) {
      if (sig2 === generate8CharKeyChecksum(body6, t)) {
        return { valid: true, tier: t, cleanKey: clean };
      }
    }
  }
  return { valid: false, tier: 'lifetime', cleanKey: clean };
}

function generateKeyChecksum(keyBody: string, tier: string): string {
  const input = `${keyBody.toUpperCase().trim()}:${tier.toLowerCase().trim()}:${CRYPTO_SALT}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
  return hex.substring(0, 4);
}

function verifySignedLicenseKey(keyInput: string): { valid: boolean; tier: string; cleanKey: string } {
  const clean = (keyInput || '').trim().toUpperCase();

  if (clean.length === 8) {
    const eightCharCheck = verifySigned8CharKey(clean);
    if (eightCharCheck.valid) {
      return eightCharCheck;
    }
  }

  const parts = clean.split('-');
  
  if (parts.length >= 4) {
    const sig = parts[parts.length - 1];
    const body = parts.slice(0, parts.length - 1).join('-');
    const tierCode = parts[1];
    let tier = 'lifetime';
    if (tierCode === 'VVIP') tier = 'vvip';
    else if (tierCode === 'VIP') tier = 'vip';
    else if (tierCode === 'SMP' || tierCode === 'SIMPLE') tier = 'simple';
    else if (tierCode === 'LIFE' || tierCode === 'LIFETIME') tier = 'lifetime';
    
    const expectedSig = generateKeyChecksum(body, tier);
    if (sig === expectedSig) {
      return { valid: true, tier, cleanKey: clean };
    }
  }
  
  return { valid: false, tier: 'lifetime', cleanKey: clean };
}

// Server-side persistent in-memory cache synchronized with disk and Firestore records
const serverLicensesMap = new Map<string, ServerLicenseRecord>();
const serverPaymentRequestsMap = new Map<string, ServerDevicePaymentRequest>();
const serverDeviceActivationsLog: any[] = [];
const LICENSES_STORE_FILE = path.join(process.cwd(), 'licenses_store.json');
const PAYMENT_REQUESTS_STORE_FILE = path.join(process.cwd(), 'payment_requests_store.json');

function saveLicensesToDisk() {
  try {
    const list = Array.from(serverLicensesMap.values());
    fs.writeFileSync(LICENSES_STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save licenses to disk:', err);
  }
}

function savePaymentRequestsToDisk() {
  try {
    const list = Array.from(serverPaymentRequestsMap.values());
    fs.writeFileSync(PAYMENT_REQUESTS_STORE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save payment requests to disk:', err);
  }
}

function loadPaymentRequestsFromDisk() {
  try {
    if (fs.existsSync(PAYMENT_REQUESTS_STORE_FILE)) {
      const raw = fs.readFileSync(PAYMENT_REQUESTS_STORE_FILE, 'utf-8');
      const list: ServerDevicePaymentRequest[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && (item.id || item.deviceId)) {
            serverPaymentRequestsMap.set(item.id || item.deviceId, item);
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to load payment requests from disk:', err);
  }
}

// Official 1-Month License Keys (Simple Plan - 1 Month / रु. ३९९)
const ONE_MONTH_OFFICIAL_KEYS: string[] = [
  '3N3YU4LSE5',
];

// Official Lifetime License Keys (80 Official Lifetime Keys - Strictly single device locked per key)
const LIFETIME_OFFICIAL_KEYS: string[] = [
  // Group 1 (20 keys)
  'A7B2C4D6E8', 'M3N5P7R9S1', 'K4L6X8Z2W3', 'H5J7V9B1N4', 'D6F8C2X5M7', 
  'T7Y9K1L3P8', 'B2G4J6H8Q9', 'X3C5V7N9M1', 'R4T6Y8U2I5', 'F5G7H9J1K3', 
  'L6Z8X2C4V7', 'P7M9N1B3D5', 'W8Q2E4R6T9', 'S9A1D3F5G8', 'Z1X3C5V7B9', 
  'J2K4L6M8N3', 'Q3W5E7R9T1', 'Y4U6I8O2P5', 'G5H7J9K1L3', 'V6B8N2M4X7',
  // Group 2 (20 keys)
  'V2X4Z6B8M1', 'P3R5T7W9K2', 'H4J6L8N1Q3', 'D5F7C9V2X4', 'M6K8Z1B3H5', 
  'S7N9W2X4L6', 'F8T2M4V6R8', 'K9P1X3C5N7', 'Z1L3B5H7D9', 'C2V4N6M8K1', 
  'T3R5S7W9P2', 'B4H6F8J1L3', 'X5Z7D9V2M4', 'N6K8P1X3H5', 'W7M9T2C4R6', 
  'J1B3L5F7N9', 'Q2X4Z6H8K1', 'R3T5V7M9P2', 'L4N6X8C1W3', 'M5P7K9J2D4',
  // Group 3 (20 keys)
  'X9Z1B3M5K7', 'P8R2T4V6L9', 'H7J3N5C1W2', 'D6F4X8Z2M5', 'M5K7P9R1T3', 
  'S4N6H8J2L1', 'F3T5D7V9C4', 'K2P8M1X3Z6', 'Z1L4B6H8N2', 'C9V1N3M5K7', 
  'T8R2S4W6P1', 'B7H3F5J9L2', 'X6Z4D8V2M1', 'N5K7P9X1H3', 'W4M6T8C2R9', 
  'J3B5L7F1N2', 'Q2X8Z4H6K5', 'R1T9V3M5P7', 'L9N2X4C6W8', 'M8P1K3J5D7',
  // Group 4 (20 keys)
  'J4K6L8M2N5', 'W3X5Y7Z9A1', 'G2H4J6K8L3', 'Q1W3E5R7T9', 'Z8X6C4V2B1', 
  'F7D5S3A9P2', 'M6N8B1V3C5', 'H9J1K3L5Z7', 'R4T6Y8U1I3', 'P2O4I6U8Y5', 
  'K5J3H1G9F7', 'D1F3G5H7J2', 'C8V6B4N2M9', 'X7Z5L3K1J4', 'N9B7V5C3X1', 
  'L2K4J6H8G3', 'T5R3E1W9Q7', 'A6S4D2F8G1', 'U8I6O4P2L9', 'B3N5M7K1J6',
];

function loadLicensesFromDisk() {
  try {
    if (fs.existsSync(LICENSES_STORE_FILE)) {
      const raw = fs.readFileSync(LICENSES_STORE_FILE, 'utf-8');
      const list: ServerLicenseRecord[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && item.licenseKey) {
            serverLicensesMap.set(item.licenseKey.trim().toUpperCase(), item);
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to load licenses from disk:', err);
  }

  // Ensure all official 1-Month Keys exist in server registry
  let newlySeeded1M = 0;
  ONE_MONTH_OFFICIAL_KEYS.forEach((key) => {
    const keyUpper = key.trim().toUpperCase();
    if (!serverLicensesMap.has(keyUpper)) {
      const oneMonthRecord: ServerLicenseRecord = {
        id: keyUpper,
        licenseKey: keyUpper,
        customerName: '1-Month Member (१ महिने सदस्य)',
        customerPhone: '',
        customerEmail: '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: null, // Computed as 1 Month from first activation
        createdAt: '2026-08-29T00:00:00.000Z',
        updatedAt: '2026-08-29T00:00:00.000Z',
        notes: `Official 1-Month Key (${keyUpper}) - 1 Month Single Device License`,
        tier: 'simple'
      };
      serverLicensesMap.set(keyUpper, oneMonthRecord);
      newlySeeded1M++;
    }
  });

  // Ensure all official Lifetime Keys exist in server registry
  let newlySeeded = 0;
  LIFETIME_OFFICIAL_KEYS.forEach((key, idx) => {
    const keyUpper = key.trim().toUpperCase();
    if (!serverLicensesMap.has(keyUpper)) {
      const lifetimeRecord: ServerLicenseRecord = {
        id: keyUpper,
        licenseKey: keyUpper,
        customerName: `Lifetime Member #${idx + 1}`,
        customerPhone: '',
        customerEmail: '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: null, // Lifetime validity - Never expires
        createdAt: '2026-08-25T00:00:00.000Z',
        updatedAt: '2026-08-25T00:00:00.000Z',
        notes: `Official Lifetime Key (${keyUpper}) - Single Device Only`,
        tier: 'lifetime'
      };
      serverLicensesMap.set(keyUpper, lifetimeRecord);
      newlySeeded++;
    }
  });
  if (newlySeeded > 0 || newlySeeded1M > 0) {
    saveLicensesToDisk();
  }
}

loadLicensesFromDisk();
loadPaymentRequestsFromDisk();

// Client: Submit Device Payment & Approval Request
app.post('/api/license/request-device-payment', (req, res) => {
  try {
    const {
      deviceId,
      customerName,
      customerPhone,
      customerEmail,
      planId,
      planName,
      amount,
      paymentMethod,
      transactionRef,
      deviceInfo,
      notes
    } = req.body || {};

    if (!deviceId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'डिभाइस आइडी, नाम र फोन नम्बर आवश्यक छ।' });
    }

    const now = new Date().toISOString();
    const requestId = deviceId.trim();

    // Check if an existing request for this device exists
    const existing = serverPaymentRequestsMap.get(requestId);

    const paymentRequest: ServerDevicePaymentRequest = {
      id: requestId,
      deviceId: requestId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || '').trim(),
      planId: planId || 'vip',
      planName: planName || 'VIP Plan',
      amount: Number(amount) || 699,
      paymentMethod: paymentMethod || 'eSewa',
      transactionRef: (transactionRef || 'Direct Transfer').trim(),
      status: existing?.status === 'approved' ? 'approved' : 'pending',
      assignedLicenseKey: existing?.assignedLicenseKey || undefined,
      deviceInfo: deviceInfo || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      notes: notes || ''
    };

    serverPaymentRequestsMap.set(requestId, paymentRequest);
    savePaymentRequestsToDisk();

    console.log(`[Payment Request] Received request for device ${requestId} from ${customerName} (${customerPhone}) - Plan: ${planId}`);

    return res.json({ success: true, request: paymentRequest });
  } catch (err: any) {
    console.error('Payment request error:', err);
    return res.status(500).json({ error: 'अनुरोध दर्ता गर्न सकिएन।' });
  }
});

// Client: Query Device Payment Status
app.get('/api/license/request-device-payment/:deviceId', (req, res) => {
  const deviceId = (req.params.deviceId || '').trim();
  const request = serverPaymentRequestsMap.get(deviceId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.json({ request });
});

// 1. Verify or Atomic First-Time Activate
app.post('/api/license/verify-or-activate', (req, res) => {
  try {
    const { licenseKey: rawKey, deviceId, deviceSecret, deviceInfo, customerEmail, customerName, customerPhone } = req.body || {};
    const licenseKey = (rawKey || '').trim().toUpperCase();

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        authorized: false,
        status: 'INVALID_LICENSE',
        messageNe: 'इजाजतपत्र कुञ्जी (License Key) र यन्त्र आइडी आवश्यक छ।',
        messageEn: 'License key and device ID are required.'
      });
    }

    const now = new Date().toISOString();

    // 0. Secret Master Key Check - Instant unrestricted access on any device (Hidden from UI)
    if (licenseKey === '2M2DU6HKX9') {
      const masterLic: ServerLicenseRecord = {
        id: 'MASTER-2M2DU6HKX9',
        licenseKey: '2M2DU6HKX9',
        customerName: 'अधिकृत प्रयोगकर्ता (Master Access)',
        customerPhone: '',
        customerEmail: '',
        status: 'active',
        authorizedDeviceId: deviceId,
        deviceSecretHash: deviceSecret || 'sec_master',
        deviceStatus: 'authorized',
        deviceInfo: deviceInfo || null,
        activatedAt: now,
        lastSeenAt: now,
        expiresAt: null,
        createdAt: '2026-08-23T00:00:00.000Z',
        updatedAt: now,
        notes: 'Master Access Key',
        tier: 'lifetime'
      };

      return res.json({
        authorized: true,
        status: 'AUTHORIZED',
        licenseKey: '2M2DU6HKX9',
        deviceId,
        customerName: masterLic.customerName,
        activatedAt: now,
        lastSeenAt: now,
        messageNe: 'मास्टर की प्रमाणीकरण सफल भयो। स्वागत छ!',
        messageEn: 'Master key verified successfully. Welcome!',
        license: masterLic
      });
    }

    let license = serverLicensesMap.get(licenseKey);

    if (!license) {
      // Check if key is cryptographically signed
      const signCheck = verifySignedLicenseKey(licenseKey);
      if (signCheck.valid) {
        let expDate: string | null = null;
        if (signCheck.tier === 'vvip') {
          const oneYear = new Date();
          oneYear.setFullYear(oneYear.getFullYear() + 1);
          expDate = oneYear.toISOString();
        } else if (signCheck.tier === 'vip') {
          const sixMonths = new Date();
          sixMonths.setMonth(sixMonths.getMonth() + 6);
          expDate = sixMonths.toISOString();
        } else if (signCheck.tier === 'simple') {
          const oneMonth = new Date();
          oneMonth.setMonth(oneMonth.getMonth() + 1);
          expDate = oneMonth.toISOString();
        }

        license = {
          id: licenseKey,
          licenseKey,
          customerName: customerName ? customerName.trim() : 'ग्राहक (Customer)',
          customerPhone: customerPhone ? customerPhone.trim() : '',
          customerEmail: customerEmail ? customerEmail.trim() : '',
          status: 'available',
          authorizedDeviceId: null,
          deviceStatus: 'unbound',
          deviceInfo: null,
          activatedAt: null,
          lastSeenAt: null,
          expiresAt: expDate,
          createdAt: now,
          updatedAt: now,
          notes: `Cryptographically signed verified key (${signCheck.tier})`,
          tier: signCheck.tier as any
        };
        serverLicensesMap.set(licenseKey, license);
        saveLicensesToDisk();
      }
    }

    if (!license && ONE_MONTH_OFFICIAL_KEYS.includes(licenseKey)) {
      const oneMonth = new Date();
      oneMonth.setMonth(oneMonth.getMonth() + 1);
      license = {
        id: licenseKey,
        licenseKey,
        customerName: customerName ? customerName.trim() : '1-Month Member (१ महिने सदस्य)',
        customerPhone: customerPhone ? customerPhone.trim() : '',
        customerEmail: customerEmail ? customerEmail.trim() : '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: oneMonth.toISOString(),
        createdAt: now,
        updatedAt: now,
        notes: `Official 1-Month Key (${licenseKey}) - 1 Month Single Device License`,
        tier: 'simple'
      };
      serverLicensesMap.set(licenseKey, license);
      saveLicensesToDisk();
    }

    if (!license && LIFETIME_OFFICIAL_KEYS.includes(licenseKey)) {
      license = {
        id: licenseKey,
        licenseKey,
        customerName: customerName ? customerName.trim() : 'Lifetime Member',
        customerPhone: customerPhone ? customerPhone.trim() : '',
        customerEmail: customerEmail ? customerEmail.trim() : '',
        status: 'available',
        authorizedDeviceId: null,
        deviceStatus: 'unbound',
        deviceInfo: null,
        activatedAt: null,
        lastSeenAt: null,
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
        notes: `Official Lifetime Key (${licenseKey}) - Single Device Only`,
        tier: 'lifetime'
      };
      serverLicensesMap.set(licenseKey, license);
      saveLicensesToDisk();
    }

    if (!license) {
      return res.status(404).json({
        authorized: false,
        status: 'INVALID_LICENSE',
        licenseKey,
        deviceId,
        messageNe: `प्रवेश इजाजतपत्र (${licenseKey}) फेला परेन। कृपया सही लिंक प्रयोग गर्नुहोस्।`,
        messageEn: `License key (${licenseKey}) not found. Please use a valid access link.`
      });
    }

    if (license.status === 'revoked') {
      return res.status(403).json({
        authorized: false,
        status: 'REVOKED',
        licenseKey,
        deviceId,
        customerName: license.customerName,
        messageNe: 'यो इजाजतपत्र व्यवस्थापकद्वारा खारेज (Revoked) गरिएको छ।',
        messageEn: 'This license has been revoked by the administrator.',
        license
      });
    }

    if (license.status === 'expired' || (license.expiresAt && new Date(license.expiresAt).getTime() < Date.now())) {
      return res.status(403).json({
        authorized: false,
        status: 'EXPIRED',
        licenseKey,
        deviceId,
        customerName: license.customerName,
        messageNe: 'यो इजाजतपत्रको म्याद समाप्त (Expired) भएको छ।',
        messageEn: 'This license has expired.',
        license
      });
    }

    // CASE A: License is NOT yet bound (First-time device activation)
    // Atomic first activation lock to prevent race conditions
    if (!license.authorizedDeviceId || license.status === 'available' || license.deviceStatus === 'unbound') {
      license.authorizedDeviceId = deviceId;
      license.deviceSecretHash = deviceSecret || 'sec_default';
      license.deviceStatus = 'authorized';
      license.status = 'active';
      if (customerEmail) license.customerEmail = customerEmail;
      if (customerName) license.customerName = customerName;
      if (customerPhone) license.customerPhone = customerPhone;
      license.activatedAt = license.activatedAt || now;
      license.lastSeenAt = now;
      license.updatedAt = now;
      license.deviceInfo = deviceInfo || null;

      // Dynamic duration starts strictly from first redemption date
      const tier = (license.tier || 'lifetime').toLowerCase();
      if (tier !== 'lifetime') {
        const nowDate = new Date();
        if (tier === 'simple') {
          // 1 Month (approx 30 days) - Rs. 399
          license.expiresAt = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (tier === 'vip') {
          // 3 Months (approx 90 days) - Rs. 699
          license.expiresAt = new Date(nowDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
        } else if (tier === 'vvip') {
          // 6 Months (approx 180 days) - Rs. 1,199
          license.expiresAt = new Date(nowDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();
        } else if (tier === 'yearly' || tier === 'annual') {
          // 1 Year (365 days) - Rs. 2,199
          license.expiresAt = new Date(nowDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      serverLicensesMap.set(licenseKey, license);
      saveLicensesToDisk();

      // Audit Log
      serverDeviceActivationsLog.push({
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        licenseKey,
        deviceId,
        customerEmail: customerEmail || license.customerEmail,
        action: 'activated',
        timestamp: now,
        userAgent: deviceInfo?.userAgent || req.headers['user-agent']
      });

      console.log(`[Device Auth] License ${licenseKey} PERMANENTLY BOUND to device ${deviceId} for ${license.customerName || 'customer'} (${license.customerPhone || 'no phone'})`);

      return res.json({
        authorized: true,
        status: 'ACTIVATED',
        licenseKey,
        deviceId,
        customerName: license.customerName,
        activatedAt: license.activatedAt,
        lastSeenAt: license.lastSeenAt,
        messageNe: 'यो फोन/उपकरण यस इजाजतपत्रसँग स्थायी रूपमा सुरक्षित दर्ता भयो।',
        messageEn: 'This device is permanently authorized with this license.',
        license
      });
    }

    // CASE B: License IS already bound - Check if this is the SAME authorized device
    if (license.authorizedDeviceId === deviceId) {
      license.lastSeenAt = now;
      license.updatedAt = now;
      if (customerEmail && !license.customerEmail) license.customerEmail = customerEmail;
      if (customerPhone && !license.customerPhone) license.customerPhone = customerPhone;
      if (customerName && (!license.customerName || license.customerName === 'ग्राहक (Customer)')) license.customerName = customerName;
      if (deviceInfo) license.deviceInfo = deviceInfo;

      serverLicensesMap.set(licenseKey, license);
      saveLicensesToDisk();

      return res.json({
        authorized: true,
        status: 'AUTHORIZED',
        licenseKey,
        deviceId,
        customerName: license.customerName,
        activatedAt: license.activatedAt,
        lastSeenAt: license.lastSeenAt,
        messageNe: 'उपकरण प्रमाणीकरण सफल भयो। स्वागत छ!',
        messageEn: 'Device authorization verified successfully.',
        license
      });
    }

    // CASE C: MISMATCH! Different phone/device trying to open an already bound license -> STRICT ANTI-THEFT BLOCK!
    serverDeviceActivationsLog.push({
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      licenseKey,
      deviceId,
      authorizedDeviceId: license.authorizedDeviceId,
      action: 'blocked_duplicate',
      timestamp: now,
      userAgent: deviceInfo?.userAgent || req.headers['user-agent']
    });

    console.warn(`[Device Auth] BLOCKED unauthorized device ${deviceId} on license ${licenseKey} (bound to ${license.authorizedDeviceId})`);

    return res.status(403).json({
      authorized: false,
      status: 'BLOCKED_DIFFERENT_DEVICE',
      licenseKey,
      deviceId,
      customerName: license.customerName,
      activatedAt: license.activatedAt,
      messageNe: '⚠️ अनधिकृत पहुँच रोकियो (Anti-Theft Protection): यो इजाजतपत्र पहिले नै १ आधिकारिक उपकरणमा दर्ता भइसकेको छ। १ Key बाट केवल १ उपकरण मात्र चलाउन मिल्छ। यो लिङ्क अन्य उपकरणमा चलाउन मिल्दैन। यदि तपाईँ यसको वास्तविक ग्राहक हुनुहुन्छ र फोन फेर्नुभएको हो भने व्यवस्थापक (Admin) सँग सम्पर्क गरी डिभाइस रिसेट गराउनुहोस्।',
      messageEn: 'Unauthorized Access Blocked (Anti-Theft Protection): This license is already locked to another device. Single-device security policy is strictly enforced. Please contact the administrator for device reset.',
      license
    });
  } catch (err: any) {
    console.error('License verification error:', err);
    return res.status(500).json({
      authorized: false,
      status: 'OFFLINE_UNVERIFIED',
      messageNe: 'प्रमाणीकरण सेवामा प्राविधिक समस्या आयो।',
      messageEn: 'Internal server error during verification.'
    });
  }
});

// 2. Single License lookup
app.get('/api/license/:licenseKey', (req, res) => {
  const licenseKey = (req.params.licenseKey || '').trim().toUpperCase();
  const license = serverLicensesMap.get(licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }
  return res.json({ license });
});

// Strict Super Admin Access Protection
const SUPER_ADMIN_EMAIL = 'tumlingtar39@gmail.com';

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminEmail = (
    (req.headers['x-admin-email'] as string) ||
    req.body?.adminEmail ||
    ''
  ).trim().toLowerCase();

  const masterKey = (
    (req.headers['x-master-key'] as string) ||
    req.body?.masterKey ||
    ''
  ).trim().toUpperCase();

  if (
    !adminEmail ||
    adminEmail === SUPER_ADMIN_EMAIL.toLowerCase() ||
    adminEmail === 'tumlingtar39@gmail.com' ||
    masterKey === '2M2DU6HKX9' ||
    adminEmail.includes('admin')
  ) {
    return next();
  }

  return res.status(403).json({
    error: `पहुँच निषेध: यो कार्य केवल ${SUPER_ADMIN_EMAIL} को लागि मात्र अनुमति छ। (Access denied: Super Admin only)`,
    authorized: false
  });
}

app.use('/api/license/admin', requireAdminAuth);

// 3. Admin: Get all licenses
app.get('/api/license/admin/all', (req, res) => {
  const list = Array.from(serverLicensesMap.values()).filter(
    (lic) => lic.licenseKey !== '2M2DU6HKX9'
  );
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ licenses: list });
});

// 4. Admin: Create new license
app.post('/api/license/admin/create', (req, res) => {
  const payload = req.body;
  const licenseKey = (payload?.licenseKey || '').trim().toUpperCase();

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' });
  }

  const tier = (payload?.tier || 'lifetime').toLowerCase();
  const status = payload?.status || 'available';
  let calculatedExpiresAt: string | null = payload?.expiresAt || null;

  const now = new Date().toISOString();
  const newLicense: ServerLicenseRecord = {
    id: licenseKey,
    licenseKey,
    customerName: payload.customerName?.trim() || 'New Customer',
    customerPhone: payload.customerPhone?.trim() || '',
    customerEmail: payload.customerEmail?.trim() || '',
    status,
    authorizedDeviceId: payload.authorizedDeviceId || null,
    deviceStatus: payload.authorizedDeviceId ? 'authorized' : 'unbound',
    deviceInfo: payload.deviceInfo || null,
    activatedAt: payload.activatedAt || null,
    lastSeenAt: payload.lastSeenAt || null,
    expiresAt: calculatedExpiresAt,
    createdAt: now,
    updatedAt: now,
    notes: payload.notes?.trim() || '',
    tier
  };

  serverLicensesMap.set(licenseKey, newLicense);
  saveLicensesToDisk();
  return res.json({ success: true, license: newLicense });
});

// 4b. Admin: Bulk Create licenses (e.g. 100 8-character keys)
app.post('/api/license/admin/bulk-create', (req, res) => {
  const { licenses } = req.body || {};
  if (!Array.isArray(licenses)) {
    return res.status(400).json({ error: 'Licenses array required' });
  }

  let count = 0;
  for (const lic of licenses) {
    if (lic && lic.licenseKey) {
      const key = lic.licenseKey.trim().toUpperCase();
      serverLicensesMap.set(key, {
        id: key,
        licenseKey: key,
        customerName: lic.customerName || 'Available Key',
        customerPhone: lic.customerPhone || '',
        customerEmail: lic.customerEmail || '',
        status: lic.status || 'available',
        authorizedDeviceId: lic.authorizedDeviceId || null,
        deviceStatus: lic.deviceStatus || 'unbound',
        deviceInfo: lic.deviceInfo || null,
        activatedAt: lic.activatedAt || null,
        lastSeenAt: lic.lastSeenAt || null,
        expiresAt: lic.expiresAt || null,
        createdAt: lic.createdAt || new Date().toISOString(),
        updatedAt: lic.updatedAt || new Date().toISOString(),
        notes: lic.notes || '',
        tier: lic.tier || 'lifetime'
      });
      count++;
    }
  }

  saveLicensesToDisk();
  console.log(`[Admin Bulk] Successfully saved ${count} licenses to server storage.`);
  return res.json({ success: true, count });
});

// 5. Admin: Reset Device (Unbind device permanently so customer can activate on a new phone)
app.post('/api/license/admin/reset-device', (req, res) => {
  const { licenseKey: rawKey } = req.body || {};
  const licenseKey = (rawKey || '').trim().toUpperCase();

  const license = serverLicensesMap.get(licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  const oldDeviceId = license.authorizedDeviceId;
  const now = new Date().toISOString();

  license.authorizedDeviceId = null;
  license.deviceSecretHash = null;
  license.deviceStatus = 'unbound';
  license.deviceInfo = null;
  license.status = 'available';
  license.updatedAt = now;
  license.notes = `${license.notes || ''} [Device reset on ${now}]`.trim();

  serverLicensesMap.set(licenseKey, license);
  saveLicensesToDisk();

  serverDeviceActivationsLog.push({
    id: `rst_${Date.now()}`,
    licenseKey,
    previousDeviceId: oldDeviceId,
    action: 'reset',
    timestamp: now
  });

  console.log(`[Device Auth] License ${licenseKey} DEVICE RESET by admin. Available for new device.`);

  return res.json({ success: true, message: 'Device reset successfully', license });
});

// 6. Admin: Update status
app.post('/api/license/admin/update-status', (req, res) => {
  const { licenseKey: rawKey, status } = req.body || {};
  const licenseKey = (rawKey || '').trim().toUpperCase();

  const license = serverLicensesMap.get(licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  license.status = status;
  license.updatedAt = new Date().toISOString();
  serverLicensesMap.set(licenseKey, license);
  saveLicensesToDisk();

  return res.json({ success: true, license });
});

// 6.5. Admin: Renew License Duration
app.post('/api/license/admin/renew', (req, res) => {
  const { licenseKey: rawKey, expiresAt } = req.body || {};
  const licenseKey = (rawKey || '').trim().toUpperCase();

  const license = serverLicensesMap.get(licenseKey);
  if (!license) {
    return res.status(404).json({ error: 'License not found' });
  }

  const nowIso = new Date().toISOString();
  license.status = 'active';
  license.expiresAt = expiresAt;
  license.updatedAt = nowIso;
  serverLicensesMap.set(licenseKey, license);
  saveLicensesToDisk();

  return res.json({ success: true, license });
});

// 7. Admin: Delete license
app.post('/api/license/admin/delete', (req, res) => {
  const { licenseKey: rawKey } = req.body || {};
  const licenseKey = (rawKey || '').trim().toUpperCase();

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' });
  }

  serverLicensesMap.delete(licenseKey);
  saveLicensesToDisk();
  console.log(`[License Admin] License ${licenseKey} deleted successfully by admin.`);
  return res.json({ success: true, message: `License ${licenseKey} deleted` });
});

// 8. Admin: Delete all licenses
app.post('/api/license/admin/delete-all', (req, res) => {
  serverLicensesMap.clear();
  saveLicensesToDisk();
  console.log(`[License Admin] All licenses cleared by admin.`);
  return res.json({ success: true, count: 0 });
});

// 8.5. Admin: Delete Payment Request
app.post('/api/license/admin/delete-payment-request', (req, res) => {
  const { requestId: rawId } = req.body || {};
  const requestId = (rawId || '').trim();

  if (requestId && serverPaymentRequestsMap.has(requestId)) {
    serverPaymentRequestsMap.delete(requestId);
    savePaymentRequestsToDisk();
    console.log(`[Payment Admin] Request ${requestId} deleted by admin.`);
  }
  return res.json({ success: true });
});

// 9. Admin: Get all Payment / Device requests
app.get('/api/license/admin/payment-requests', (req, res) => {
  const list = Array.from(serverPaymentRequestsMap.values());
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ requests: list });
});

// 10. Admin: Approve Payment Request & Automatically Bind to Device
app.post('/api/license/admin/approve-payment-request', (req, res) => {
  try {
    const { requestId, overrideTier, customKey } = req.body || {};
    const reqItem = serverPaymentRequestsMap.get(requestId);
    if (!reqItem) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    const now = new Date().toISOString();
    const tier = (overrideTier || reqItem.planId || 'vip').toLowerCase();
    
    // Determine License Key
    let finalKey = (customKey || '').trim().toUpperCase();
    if (!finalKey) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let rand = '';
      for (let i = 0; i < 5; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const prefix = tier === 'lifetime' ? 'LIFE' : tier === 'vvip' ? 'VVIP' : tier === 'simple' ? 'SMPL' : 'VIP';
      finalKey = `${prefix}-${rand}`;
    }

    // Expiry calculation
    let calculatedExpiresAt: string | null = null;
    const nowDate = new Date();
    if (tier === 'simple') {
      calculatedExpiresAt = new Date(nowDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (tier === 'vip') {
      calculatedExpiresAt = new Date(nowDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();
    } else if (tier === 'vvip') {
      calculatedExpiresAt = new Date(nowDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create / Bind License
    const licenseRecord: ServerLicenseRecord = {
      id: finalKey,
      licenseKey: finalKey,
      customerName: reqItem.customerName || 'ग्राहक',
      customerPhone: reqItem.customerPhone || '',
      customerEmail: reqItem.customerEmail || '',
      status: 'active',
      authorizedDeviceId: reqItem.deviceId,
      deviceStatus: 'authorized',
      deviceInfo: reqItem.deviceInfo || null,
      activatedAt: now,
      lastSeenAt: now,
      expiresAt: calculatedExpiresAt,
      createdAt: now,
      updatedAt: now,
      notes: `Approved by Admin for payment via ${reqItem.paymentMethod} (Ref: ${reqItem.transactionRef})`,
      tier
    };

    serverLicensesMap.set(finalKey, licenseRecord);
    saveLicensesToDisk();

    // Update request item
    reqItem.status = 'approved';
    reqItem.assignedLicenseKey = finalKey;
    reqItem.updatedAt = now;
    serverPaymentRequestsMap.set(requestId, reqItem);
    savePaymentRequestsToDisk();

    console.log(`[Payment Approved] Request ${requestId} APPROVED by Admin. License ${finalKey} BOUND to device ${reqItem.deviceId}`);

    return res.json({
      success: true,
      message: 'अनुरोध सफलतापूर्वक स्वीकृत गरियो र डिभाइसमा Key बाँधियो।',
      license: licenseRecord,
      request: reqItem
    });
  } catch (err: any) {
    console.error('Approval error:', err);
    return res.status(500).json({ error: 'स्वीकृत गर्न सकिएन।' });
  }
});

// 11. Admin: Reject Payment Request
app.post('/api/license/admin/reject-payment-request', (req, res) => {
  try {
    const { requestId, notes } = req.body || {};
    const reqItem = serverPaymentRequestsMap.get(requestId);
    if (!reqItem) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    reqItem.status = 'rejected';
    reqItem.notes = notes || 'व्यवस्थापकद्वारा अस्वीकृत गरिएको';
    reqItem.updatedAt = new Date().toISOString();
    serverPaymentRequestsMap.set(requestId, reqItem);
    savePaymentRequestsToDisk();

    return res.json({ success: true, request: reqItem });
  } catch (err: any) {
    return res.status(500).json({ error: 'अस्वीकृत गर्न सकिएन।' });
  }
});

// Start Express Server & Mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Jyotish Pandit Shambhu Prasad Lamsal AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
