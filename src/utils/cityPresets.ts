export interface CityPreset {
  nameNe: string;
  nameEn: string;
  districtNe?: string;
  districtEn?: string;
  provinceNe?: string;
  provinceEn?: string;
  countryNe: string;
  countryEn: string;
  category: 'nepal_district' | 'nepal_city' | 'world_country' | 'india' | 'gulf';
  lat: number;
  lon: number;
  tz: number; // UTC offset in decimal hours (e.g. +5.75 for Nepal, +5.5 for India, +4.0 for UAE)
}

// 🇳🇵 नेपालका ७७ वटै जिल्लाहरू (All 77 Districts of Nepal with Headquarters/Major Centers)
export const NEPAL_77_DISTRICTS: CityPreset[] = [
  // कोशी प्रदेश (Koshi Province - 14 Districts)
  {
    nameNe: 'ताप्लेजुङ (फुङलिङ)',
    nameEn: 'Taplejung (Phungling)',
    districtNe: 'ताप्लेजुङ',
    districtEn: 'Taplejung',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.3517,
    lon: 87.6698,
    tz: 5.75
  },
  {
    nameNe: 'पाँचथर (फिदिम)',
    nameEn: 'Panchthar (Phidim)',
    districtNe: 'पाँचथर',
    districtEn: 'Panchthar',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.1500,
    lon: 87.7667,
    tz: 5.75
  },
  {
    nameNe: 'इलाम (इलाम बजार)',
    nameEn: 'Ilam (Ilam Bazar)',
    districtNe: 'इलाम',
    districtEn: 'Ilam',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.9113,
    lon: 87.9272,
    tz: 5.75
  },
  {
    nameNe: 'झापा (भद्रपुर / बिर्तामोड / दमक)',
    nameEn: 'Jhapa (Bhadrapur / Birtamod)',
    districtNe: 'झापा',
    districtEn: 'Jhapa',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.5458,
    lon: 88.0772,
    tz: 5.75
  },
  {
    nameNe: 'मोरङ (विराटनगर)',
    nameEn: 'Morang (Biratnagar)',
    districtNe: 'मोरङ',
    districtEn: 'Morang',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.4525,
    lon: 87.2718,
    tz: 5.75
  },
  {
    nameNe: 'सुनसरी (धरान / इटहरी / इनरुवा)',
    nameEn: 'Sunsari (Dharan / Itahari / Inaruwa)',
    districtNe: 'सुनसरी',
    districtEn: 'Sunsari',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.8124,
    lon: 87.2834,
    tz: 5.75
  },
  {
    nameNe: 'धनकुटा (धनकुटा बजार)',
    nameEn: 'Dhankuta (Dhankuta Bazar)',
    districtNe: 'धनकुटा',
    districtEn: 'Dhankuta',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.9833,
    lon: 87.3333,
    tz: 5.75
  },
  {
    nameNe: 'तेह्रथुम (म्याङलुङ)',
    nameEn: 'Terhathum (Myanglung)',
    districtNe: 'तेह्रथुम',
    districtEn: 'Terhathum',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.1167,
    lon: 87.5333,
    tz: 5.75
  },
  {
    nameNe: 'संखुवासभा (खाँदबारी / तुम्लिङटार)',
    nameEn: 'Sankhuwasabha (Khandbari / Tumlingtar)',
    districtNe: 'संखुवासभा',
    districtEn: 'Sankhuwasabha',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.3739,
    lon: 87.2064,
    tz: 5.75
  },
  {
    nameNe: 'भोजपुर (भोजपुर बजार)',
    nameEn: 'Bhojpur (Bhojpur Bazar)',
    districtNe: 'भोजपुर',
    districtEn: 'Bhojpur',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.1711,
    lon: 87.0458,
    tz: 5.75
  },
  {
    nameNe: 'सोलुखुम्बु (सल्लेरी / नाम्चे)',
    nameEn: 'Solukhumbu (Salleri / Namche)',
    districtNe: 'सोलुखुम्बु',
    districtEn: 'Solukhumbu',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.5056,
    lon: 86.5819,
    tz: 5.75
  },
  {
    nameNe: 'ओखलढुङ्गा (ओखलढुङ्गा)',
    nameEn: 'Okhaldhunga (Okhaldhunga)',
    districtNe: 'ओखलढुङ्गा',
    districtEn: 'Okhaldhunga',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.3167,
    lon: 86.5000,
    tz: 5.75
  },
  {
    nameNe: 'खोटाङ (दिक्तेल)',
    nameEn: 'Khotang (Diktel)',
    districtNe: 'खोटाङ',
    districtEn: 'Khotang',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.2167,
    lon: 86.7833,
    tz: 5.75
  },
  {
    nameNe: 'उदयपुर (गाईघाट / त्रियुगा)',
    nameEn: 'Udayapur (Gaighat / Triyuga)',
    districtNe: 'उदयपुर',
    districtEn: 'Udayapur',
    provinceNe: 'कोशी प्रदेश',
    provinceEn: 'Koshi Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.7900,
    lon: 86.7000,
    tz: 5.75
  },

  // मधेस प्रदेश (Madhesh Province - 8 Districts)
  {
    nameNe: 'सप्तरी (राजविराज)',
    nameEn: 'Saptari (Rajbiraj)',
    districtNe: 'सप्तरी',
    districtEn: 'Saptari',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.5400,
    lon: 86.7500,
    tz: 5.75
  },
  {
    nameNe: 'सिराहा (सिराहा / लहान)',
    nameEn: 'Siraha (Siraha / Lahan)',
    districtNe: 'सिराहा',
    districtEn: 'Siraha',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.6500,
    lon: 86.2000,
    tz: 5.75
  },
  {
    nameNe: 'धनुषा (जनकपुरधाम)',
    nameEn: 'Dhanusha (Janakpurdham)',
    districtNe: 'धनुषा',
    districtEn: 'Dhanusha',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.7288,
    lon: 85.9254,
    tz: 5.75
  },
  {
    nameNe: 'महोत्तरी (जलेश्वर)',
    nameEn: 'Mahottari (Jaleshwar)',
    districtNe: 'महोत्तरी',
    districtEn: 'Mahottari',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.6472,
    lon: 85.8000,
    tz: 5.75
  },
  {
    nameNe: 'सर्लाही (मलंगवा / हरिवन)',
    nameEn: 'Sarlahi (Malangwa / Hariwan)',
    districtNe: 'सर्लाही',
    districtEn: 'Sarlahi',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.8600,
    lon: 85.5600,
    tz: 5.75
  },
  {
    nameNe: 'रौतहट (गौर / चन्द्रनिगाहपुर)',
    nameEn: 'Rautahat (Gaur / Chandranigahpur)',
    districtNe: 'रौतहट',
    districtEn: 'Rautahat',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 26.7600,
    lon: 85.2800,
    tz: 5.75
  },
  {
    nameNe: 'बारा (कलैया / सिमरा)',
    nameEn: 'Bara (Kalaiya / Simara)',
    districtNe: 'बारा',
    districtEn: 'Bara',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.0300,
    lon: 85.0000,
    tz: 5.75
  },
  {
    nameNe: 'पर्सा (वीरगञ्ज)',
    nameEn: 'Parsa (Birgunj)',
    districtNe: 'पर्सा',
    districtEn: 'Parsa',
    provinceNe: 'मधेस प्रदेश',
    provinceEn: 'Madhesh Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.0000,
    lon: 84.8667,
    tz: 5.75
  },

  // बागमती प्रदेश (Bagmati Province - 13 Districts)
  {
    nameNe: 'काठमाडौँ (Kathmandu)',
    nameEn: 'Kathmandu',
    districtNe: 'काठमाडौँ',
    districtEn: 'Kathmandu',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.7172,
    lon: 85.3240,
    tz: 5.75
  },
  {
    nameNe: 'ललितपुर (पाटन / Lalitpur)',
    nameEn: 'Lalitpur (Patan)',
    districtNe: 'ललितपुर',
    districtEn: 'Lalitpur',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6667,
    lon: 85.3167,
    tz: 5.75
  },
  {
    nameNe: 'भक्तपुर (Bhaktapur)',
    nameEn: 'Bhaktapur',
    districtNe: 'भक्तपुर',
    districtEn: 'Bhaktapur',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6710,
    lon: 85.4298,
    tz: 5.75
  },
  {
    nameNe: 'चितवन (भरतपुर / नारायणगढ)',
    nameEn: 'Chitwan (Bharatpur / Narayangarh)',
    districtNe: 'चितवन',
    districtEn: 'Chitwan',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6833,
    lon: 84.4333,
    tz: 5.75
  },
  {
    nameNe: 'मकवानपुर (हेटौँडा)',
    nameEn: 'Makwanpur (Hetauda)',
    districtNe: 'मकवानपुर',
    districtEn: 'Makwanpur',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.4289,
    lon: 85.0322,
    tz: 5.75
  },
  {
    nameNe: 'काभ्रेपलाञ्चोक (धुलिखेल / बनेपा / पनौती)',
    nameEn: 'Kavrepalanchok (Dhulikhel / Banepa)',
    districtNe: 'काभ्रेपलाञ्चोक',
    districtEn: 'Kavrepalanchok',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6167,
    lon: 85.5500,
    tz: 5.75
  },
  {
    nameNe: 'धादिङ (धादिङबेसी / निलकण्ठ)',
    nameEn: 'Dhading (Dhadingbesi)',
    districtNe: 'धादिङ',
    districtEn: 'Dhading',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.8767,
    lon: 84.9083,
    tz: 5.75
  },
  {
    nameNe: 'नुवाकोट (विदुर / बट्टार)',
    nameEn: 'Nuwakot (Bidur / Battar)',
    districtNe: 'नुवाकोट',
    districtEn: 'Nuwakot',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.9133,
    lon: 85.1650,
    tz: 5.75
  },
  {
    nameNe: 'दोलखा (चरीकोट / जिरी)',
    nameEn: 'Dolakha (Charikot / Jiri)',
    districtNe: 'दोलखा',
    districtEn: 'Dolakha',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6714,
    lon: 86.0308,
    tz: 5.75
  },
  {
    nameNe: 'सिन्धुपाल्चोक (चौतारा / मेलम्ची)',
    nameEn: 'Sindhupalchok (Chautara / Melamchi)',
    districtNe: 'सिन्धुपाल्चोक',
    districtEn: 'Sindhupalchok',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.7717,
    lon: 85.7197,
    tz: 5.75
  },
  {
    nameNe: 'रसुवा (धुन्चे)',
    nameEn: 'Rasuwa (Dhunche)',
    districtNe: 'रसुवा',
    districtEn: 'Rasuwa',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.1167,
    lon: 85.3000,
    tz: 5.75
  },
  {
    nameNe: 'रामेछाप (मन्थली)',
    nameEn: 'Ramechhap (Manthali)',
    districtNe: 'रामेछाप',
    districtEn: 'Ramechhap',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.4833,
    lon: 86.0667,
    tz: 5.75
  },
  {
    nameNe: 'सिन्धुली (सिन्धुलीमाढी / कमलामाई)',
    nameEn: 'Sindhuli (Kamalamai / Sindhulimadhi)',
    districtNe: 'सिन्धुली',
    districtEn: 'Sindhuli',
    provinceNe: 'बागमती प्रदेश',
    provinceEn: 'Bagmati Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.2500,
    lon: 85.9167,
    tz: 5.75
  },

  // गण्डकी प्रदेश (Gandaki Province - 11 Districts)
  {
    nameNe: 'कास्की (पोखरा)',
    nameEn: 'Kaski (Pokhara)',
    districtNe: 'कास्की',
    districtEn: 'Kaski',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.2096,
    lon: 83.9856,
    tz: 5.75
  },
  {
    nameNe: 'गोरखा (गोरखा बजार)',
    nameEn: 'Gorkha (Gorkha Bazar)',
    districtNe: 'गोरखा',
    districtEn: 'Gorkha',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.0000,
    lon: 84.6333,
    tz: 5.75
  },
  {
    nameNe: 'तनहुँ (दमौली / ब्यास)',
    nameEn: 'Tanahun (Damauli / Byas)',
    districtNe: 'तनहुँ',
    districtEn: 'Tanahun',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.9667,
    lon: 84.2833,
    tz: 5.75
  },
  {
    nameNe: 'स्याङ्जा (पुतलीबजार / वालिङ)',
    nameEn: 'Syangja (Putalibazar / Waling)',
    districtNe: 'स्याङ्जा',
    districtEn: 'Syangja',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.1000,
    lon: 83.8667,
    tz: 5.75
  },
  {
    nameNe: 'लमजुङ (बेसीशहर)',
    nameEn: 'Lamjung (Besisahar)',
    districtNe: 'लमजुङ',
    districtEn: 'Lamjung',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.2333,
    lon: 84.3833,
    tz: 5.75
  },
  {
    nameNe: 'नवलपरासी पूर्व / नवलपुर (कावासोती)',
    nameEn: 'Nawalpur / Nawalparasi East (Kawasoti)',
    districtNe: 'नवलपुर',
    districtEn: 'Nawalpur',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.6400,
    lon: 84.1200,
    tz: 5.75
  },
  {
    nameNe: 'पर्वत (कुश्मा)',
    nameEn: 'Parbat (Kusma)',
    districtNe: 'पर्वत',
    districtEn: 'Parbat',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.2333,
    lon: 83.6833,
    tz: 5.75
  },
  {
    nameNe: 'बागलुङ (बागलुङ बजार)',
    nameEn: 'Baglung (Baglung Bazar)',
    districtNe: 'बागलुङ',
    districtEn: 'Baglung',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.2667,
    lon: 83.6000,
    tz: 5.75
  },
  {
    nameNe: 'म्याग्दी (बेनी)',
    nameEn: 'Myagdi (Beni)',
    districtNe: 'म्याग्दी',
    districtEn: 'Myagdi',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.3500,
    lon: 83.5667,
    tz: 5.75
  },
  {
    nameNe: 'मनाङ (चामे)',
    nameEn: 'Manang (Chame)',
    districtNe: 'मनाङ',
    districtEn: 'Manang',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.5500,
    lon: 84.2333,
    tz: 5.75
  },
  {
    nameNe: 'मुस्ताङ (जोमसोम / मुक्तिनाथ)',
    nameEn: 'Mustang (Jomsom / Muktinath)',
    districtNe: 'मुस्ताङ',
    districtEn: 'Mustang',
    provinceNe: 'गण्डकी प्रदेश',
    provinceEn: 'Gandaki Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.7833,
    lon: 83.7333,
    tz: 5.75
  },

  // लुम्बिनी प्रदेश (Lumbini Province - 12 Districts)
  {
    nameNe: 'रुपन्देही (बुटवल / भैरहवा / लुम्बिनी)',
    nameEn: 'Rupandehi (Butwal / Bhairahawa / Lumbini)',
    districtNe: 'रुपन्देही',
    districtEn: 'Rupandehi',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.7006,
    lon: 83.4484,
    tz: 5.75
  },
  {
    nameNe: 'दाङ (घोराही / तुलसीपुर)',
    nameEn: 'Dang (Ghorahi / Tulsipur)',
    districtNe: 'दाङ',
    districtEn: 'Dang',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.0333,
    lon: 82.4833,
    tz: 5.75
  },
  {
    nameNe: 'बाँके (नेपालगञ्ज / कोहलपुर)',
    nameEn: 'Banke (Nepalgunj / Kohalpur)',
    districtNe: 'बाँके',
    districtEn: 'Banke',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.0500,
    lon: 81.6167,
    tz: 5.75
  },
  {
    nameNe: 'बर्दिया (गुलरिया)',
    nameEn: 'Bardiya (Gulariya)',
    districtNe: 'बर्दिया',
    districtEn: 'Bardiya',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.2333,
    lon: 81.3333,
    tz: 5.75
  },
  {
    nameNe: 'कपिलवस्तु (तौलिहवा / कृष्णनगर)',
    nameEn: 'Kapilvastu (Taulihawa)',
    districtNe: 'कपिलवस्तु',
    districtEn: 'Kapilvastu',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.5500,
    lon: 83.0500,
    tz: 5.75
  },
  {
    nameNe: 'पाल्पा (तानसेन)',
    nameEn: 'Palpa (Tansen)',
    districtNe: 'पाल्पा',
    districtEn: 'Palpa',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.8667,
    lon: 83.5500,
    tz: 5.75
  },
  {
    nameNe: 'गुल्मी (तम्घास)',
    nameEn: 'Gulmi (Tamghas)',
    districtNe: 'गुल्मी',
    districtEn: 'Gulmi',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.0667,
    lon: 83.2500,
    tz: 5.75
  },
  {
    nameNe: 'अर्घाखाँची (सन्धिखर्क)',
    nameEn: 'Arghakhanchi (Sandhikharka)',
    districtNe: 'अर्घाखाँची',
    districtEn: 'Arghakhanchi',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.9833,
    lon: 83.0833,
    tz: 5.75
  },
  {
    nameNe: 'प्युठान (खलङ्गा / विजुवार)',
    nameEn: 'Pyuthan (Khalanga)',
    districtNe: 'प्युठान',
    districtEn: 'Pyuthan',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.1000,
    lon: 82.8833,
    tz: 5.75
  },
  {
    nameNe: 'रोल्पा (लिवाङ)',
    nameEn: 'Rolpa (Liwang)',
    districtNe: 'रोल्पा',
    districtEn: 'Rolpa',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.3000,
    lon: 82.6333,
    tz: 5.75
  },
  {
    nameNe: 'रुकुम पूर्व (रुक्मकोट)',
    nameEn: 'Rukum East (Rukumkot)',
    districtNe: 'रुकुम पूर्व',
    districtEn: 'Rukum East',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.6000,
    lon: 82.6333,
    tz: 5.75
  },
  {
    nameNe: 'नवलपरासी पश्चिम / परासी (रामग्राम)',
    nameEn: 'Parasi / Nawalparasi West (Ramgram)',
    districtNe: 'परासी',
    districtEn: 'Parasi',
    provinceNe: 'लुम्बिनी प्रदेश',
    provinceEn: 'Lumbini Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 27.5333,
    lon: 83.6667,
    tz: 5.75
  },

  // कर्णाली प्रदेश (Karnali Province - 10 Districts)
  {
    nameNe: 'सुर्खेत (वीरेन्द्रनगर)',
    nameEn: 'Surkhet (Birendranagar)',
    districtNe: 'सुर्खेत',
    districtEn: 'Surkhet',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.6000,
    lon: 81.6000,
    tz: 5.75
  },
  {
    nameNe: 'दैलेख (नारायण / दैलेख बजार)',
    nameEn: 'Dailekh (Narayan / Dailekh Bazar)',
    districtNe: 'दैलेख',
    districtEn: 'Dailekh',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.8500,
    lon: 81.7167,
    tz: 5.75
  },
  {
    nameNe: 'जाजरकोट (खलङ्गा)',
    nameEn: 'Jajarkot (Khalanga)',
    districtNe: 'जाजरकोट',
    districtEn: 'Jajarkot',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.7000,
    lon: 82.2000,
    tz: 5.75
  },
  {
    nameNe: 'सल्यान (खलङ्गा / श्रीनगर)',
    nameEn: 'Salyan (Khalanga / Srinagar)',
    districtNe: 'सल्यान',
    districtEn: 'Salyan',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.3667,
    lon: 82.1667,
    tz: 5.75
  },
  {
    nameNe: 'रुकुम पश्चिम (मुसिकोट)',
    nameEn: 'Rukum West (Musikot)',
    districtNe: 'रुकुम पश्चिम',
    districtEn: 'Rukum West',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.6333,
    lon: 82.4833,
    tz: 5.75
  },
  {
    nameNe: 'जुम्ला (खलङ्गा / चन्दननाथ)',
    nameEn: 'Jumla (Khalanga / Chandannath)',
    districtNe: 'जुम्ला',
    districtEn: 'Jumla',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.2750,
    lon: 82.1833,
    tz: 5.75
  },
  {
    nameNe: 'कालिकोट (मान्म)',
    nameEn: 'Kalikot (Manma)',
    districtNe: 'कालिकोट',
    districtEn: 'Kalikot',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.1333,
    lon: 81.6333,
    tz: 5.75
  },
  {
    nameNe: 'मुगु (गमगढी / रारा ताल)',
    nameEn: 'Mugu (Gamgadhi / Rara Lake)',
    districtNe: 'मुगु',
    districtEn: 'Mugu',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.5500,
    lon: 82.1667,
    tz: 5.75
  },
  {
    nameNe: 'हुम्ला (सिमिकोट)',
    nameEn: 'Humla (Simikot)',
    districtNe: 'हुम्ला',
    districtEn: 'Humla',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.9667,
    lon: 81.8333,
    tz: 5.75
  },
  {
    nameNe: 'डोल्पा (दुनै / से-फोक्सुण्डो)',
    nameEn: 'Dolpa (Dunai / Phoksundo)',
    districtNe: 'डोल्पा',
    districtEn: 'Dolpa',
    provinceNe: 'कर्णाली प्रदेश',
    provinceEn: 'Karnali Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.9333,
    lon: 82.8833,
    tz: 5.75
  },

  // सुदूरपश्चिम प्रदेश (Sudurpashchim Province - 9 Districts)
  {
    nameNe: 'कैलाली (धनगढी / टिकापुर / अत्तरिया)',
    nameEn: 'Kailali (Dhangadhi / Tikapur / Attariya)',
    districtNe: 'कैलाली',
    districtEn: 'Kailali',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.6852,
    lon: 80.5960,
    tz: 5.75
  },
  {
    nameNe: 'कञ्चनपुर (महेन्द्रनगर / भीमदत्त)',
    nameEn: 'Kanchanpur (Mahendranagar / Bhimdatta)',
    districtNe: 'कञ्चनपुर',
    districtEn: 'Kanchanpur',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 28.9667,
    lon: 80.1833,
    tz: 5.75
  },
  {
    nameNe: 'डडेलधुरा (अमरगढी)',
    nameEn: 'Dadeldhura (Amargadhi)',
    districtNe: 'डडेलधुरा',
    districtEn: 'Dadeldhura',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.3000,
    lon: 80.5833,
    tz: 5.75
  },
  {
    nameNe: 'डोटी (दिपायल सिलगढी)',
    nameEn: 'Doti (Dipayal Silgadhi)',
    districtNe: 'डोटी',
    districtEn: 'Doti',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.2667,
    lon: 80.9333,
    tz: 5.75
  },
  {
    nameNe: 'अछाम (मंगलसेन / साँफेबगर)',
    nameEn: 'Achham (Mangalsen / Sanfebagar)',
    districtNe: 'अछाम',
    districtEn: 'Achham',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.1333,
    lon: 81.2667,
    tz: 5.75
  },
  {
    nameNe: 'बैतडी (दशरथचन्द / पाटन)',
    nameEn: 'Baitadi (Dasharathchand / Patan)',
    districtNe: 'बैतडी',
    districtEn: 'Baitadi',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.5333,
    lon: 80.4500,
    tz: 5.75
  },
  {
    nameNe: 'दार्चुला (खलङ्गा)',
    nameEn: 'Darchula (Khalanga)',
    districtNe: 'दार्चुला',
    districtEn: 'Darchula',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.8500,
    lon: 80.5333,
    tz: 5.75
  },
  {
    nameNe: 'बझाङ (चैनपुर)',
    nameEn: 'Bajhang (Chainpur)',
    districtNe: 'बझाङ',
    districtEn: 'Bajhang',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.5667,
    lon: 81.2000,
    tz: 5.75
  },
  {
    nameNe: 'बाजुरा (मार्तडी)',
    nameEn: 'Bajura (Martadi)',
    districtNe: 'बाजुरा',
    districtEn: 'Bajura',
    provinceNe: 'सुदूरपश्चिम प्रदेश',
    provinceEn: 'Sudurpashchim Province',
    countryNe: 'नेपाल',
    countryEn: 'Nepal',
    category: 'nepal_district',
    lat: 29.5000,
    lon: 81.4167,
    tz: 5.75
  }
];

// 🌍 विश्वका प्रमुख देशहरू तथा नगरहरू (World Countries & Major Global Centers)
export const WORLD_COUNTRIES: CityPreset[] = [
  // 🇮🇳 भारत (India - Major Pilgrimage & Metros)
  {
    nameNe: 'नयाँ दिल्ली, भारत (New Delhi, India)',
    nameEn: 'New Delhi, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 28.6139,
    lon: 77.2090,
    tz: 5.5
  },
  {
    nameNe: 'वाराणसी / काशी, भारत (Varanasi, India)',
    nameEn: 'Varanasi, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 25.3176,
    lon: 82.9739,
    tz: 5.5
  },
  {
    nameNe: 'अयोध्या, भारत (Ayodhya, India)',
    nameEn: 'Ayodhya, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 26.7922,
    lon: 82.1998,
    tz: 5.5
  },
  {
    nameNe: 'मुम्बई, भारत (Mumbai, India)',
    nameEn: 'Mumbai, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 19.0760,
    lon: 72.8777,
    tz: 5.5
  },
  {
    nameNe: 'कोलकाता, भारत (Kolkata, India)',
    nameEn: 'Kolkata, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 22.5726,
    lon: 88.3639,
    tz: 5.5
  },
  {
    nameNe: 'बेंगलुरु, भारत (Bengaluru, India)',
    nameEn: 'Bengaluru, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 12.9716,
    lon: 77.5946,
    tz: 5.5
  },
  {
    nameNe: 'चेन्नई, भारत (Chennai, India)',
    nameEn: 'Chennai, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 13.0827,
    lon: 80.2707,
    tz: 5.5
  },
  {
    nameNe: 'हैदराबाद, भारत (Hyderabad, India)',
    nameEn: 'Hyderabad, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 17.3850,
    lon: 78.4867,
    tz: 5.5
  },
  {
    nameNe: 'अहमदाबाद / गुजरात, भारत (Ahmedabad, India)',
    nameEn: 'Ahmedabad, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 23.0225,
    lon: 72.5714,
    tz: 5.5
  },
  {
    nameNe: 'हरिद्वार / ऋषिकेश, भारत (Haridwar, India)',
    nameEn: 'Haridwar, India',
    countryNe: 'भारत',
    countryEn: 'India',
    category: 'india',
    lat: 29.9457,
    lon: 78.1642,
    tz: 5.5
  },

  // 🏢 खाडी मुलुकहरू र मध्यपूर्व (Gulf Countries & Middle East)
  {
    nameNe: 'दुबई, संयुक्त अरब इमिरेट्स (Dubai, UAE)',
    nameEn: 'Dubai, United Arab Emirates',
    countryNe: 'संयुक्त अरब इमिरेट्स (UAE)',
    countryEn: 'United Arab Emirates',
    category: 'gulf',
    lat: 25.2048,
    lon: 55.2708,
    tz: 4.0
  },
  {
    nameNe: 'अबुधाबी, संयुक्त अरब इमिरेट्स (Abu Dhabi, UAE)',
    nameEn: 'Abu Dhabi, United Arab Emirates',
    countryNe: 'संयुक्त अरब इमिरेट्स (UAE)',
    countryEn: 'United Arab Emirates',
    category: 'gulf',
    lat: 24.4539,
    lon: 54.3773,
    tz: 4.0
  },
  {
    nameNe: 'दोहा, कतार (Doha, Qatar)',
    nameEn: 'Doha, Qatar',
    countryNe: 'कतार (Qatar)',
    countryEn: 'Qatar',
    category: 'gulf',
    lat: 25.2854,
    lon: 51.5310,
    tz: 3.0
  },
  {
    nameNe: 'रियाद, साउदी अरेबिया (Riyadh, Saudi Arabia)',
    nameEn: 'Riyadh, Saudi Arabia',
    countryNe: 'साउदी अरेबिया (Saudi Arabia)',
    countryEn: 'Saudi Arabia',
    category: 'gulf',
    lat: 24.7136,
    lon: 46.6753,
    tz: 3.0
  },
  {
    nameNe: 'जेद्दा, साउदी अरेबिया (Jeddah, Saudi Arabia)',
    nameEn: 'Jeddah, Saudi Arabia',
    countryNe: 'साउदी अरेबिया (Saudi Arabia)',
    countryEn: 'Saudi Arabia',
    category: 'gulf',
    lat: 21.5433,
    lon: 39.1728,
    tz: 3.0
  },
  {
    nameNe: 'कुवेत सिटी, कुवेत (Kuwait City, Kuwait)',
    nameEn: 'Kuwait City, Kuwait',
    countryNe: 'कुवेत (Kuwait)',
    countryEn: 'Kuwait',
    category: 'gulf',
    lat: 29.3759,
    lon: 47.9774,
    tz: 3.0
  },
  {
    nameNe: 'मनामा, बहराइन (Manama, Bahrain)',
    nameEn: 'Manama, Bahrain',
    countryNe: 'बहराइन (Bahrain)',
    countryEn: 'Bahrain',
    category: 'gulf',
    lat: 26.2285,
    lon: 50.5860,
    tz: 3.0
  },
  {
    nameNe: 'मस्कट, ओमान (Muscat, Oman)',
    nameEn: 'Muscat, Oman',
    countryNe: 'ओमान (Oman)',
    countryEn: 'Oman',
    category: 'gulf',
    lat: 23.5880,
    lon: 58.3829,
    tz: 4.0
  },
  {
    nameNe: 'तेल अभिभ / जेरुसेलम, इजरायल (Tel Aviv, Israel)',
    nameEn: 'Tel Aviv, Israel',
    countryNe: 'इजरायल (Israel)',
    countryEn: 'Israel',
    category: 'world_country',
    lat: 32.0853,
    lon: 34.7818,
    tz: 2.0
  },
  {
    nameNe: 'इस्तानबुल, टर्की (Istanbul, Turkey)',
    nameEn: 'Istanbul, Turkey',
    countryNe: 'टर्की (Turkey)',
    countryEn: 'Turkey',
    category: 'world_country',
    lat: 41.0082,
    lon: 28.9784,
    tz: 3.0
  },

  // 🌏 पूर्व तथा दक्षिण-पूर्वी एसिया (East & Southeast Asia)
  {
    nameNe: 'क्वालालम्पुर, मलेसिया (Kuala Lumpur, Malaysia)',
    nameEn: 'Kuala Lumpur, Malaysia',
    countryNe: 'मलेसिया (Malaysia)',
    countryEn: 'Malaysia',
    category: 'gulf',
    lat: 3.1390,
    lon: 101.6869,
    tz: 8.0
  },
  {
    nameNe: 'सिङ्गापुर (Singapore)',
    nameEn: 'Singapore',
    countryNe: 'सिङ्गापुर (Singapore)',
    countryEn: 'Singapore',
    category: 'world_country',
    lat: 1.3521,
    lon: 103.8198,
    tz: 8.0
  },
  {
    nameNe: 'टोकियो, जापान (Tokyo, Japan)',
    nameEn: 'Tokyo, Japan',
    countryNe: 'जापान (Japan)',
    countryEn: 'Japan',
    category: 'world_country',
    lat: 35.6762,
    lon: 139.6503,
    tz: 9.0
  },
  {
    nameNe: 'ओसाका, जापान (Osaka, Japan)',
    nameEn: 'Osaka, Japan',
    countryNe: 'जापान (Japan)',
    countryEn: 'Japan',
    category: 'world_country',
    lat: 34.6937,
    lon: 135.5023,
    tz: 9.0
  },
  {
    nameNe: 'सियोल, दक्षिण कोरिया (Seoul, South Korea)',
    nameEn: 'Seoul, South Korea',
    countryNe: 'दक्षिण कोरिया (South Korea)',
    countryEn: 'South Korea',
    category: 'world_country',
    lat: 37.5665,
    lon: 126.9780,
    tz: 9.0
  },
  {
    nameNe: 'बैङ्कक, थाइल्याण्ड (Bangkok, Thailand)',
    nameEn: 'Bangkok, Thailand',
    countryNe: 'थाइल्याण्ड (Thailand)',
    countryEn: 'Thailand',
    category: 'world_country',
    lat: 13.7563,
    lon: 100.5018,
    tz: 7.0
  },
  {
    nameNe: 'बेइजिङ, चीन (Beijing, China)',
    nameEn: 'Beijing, China',
    countryNe: 'चीन (China)',
    countryEn: 'China',
    category: 'world_country',
    lat: 39.9042,
    lon: 116.4074,
    tz: 8.0
  },
  {
    nameNe: 'हङकङ (Hong Kong)',
    nameEn: 'Hong Kong',
    countryNe: 'हङकङ (Hong Kong)',
    countryEn: 'Hong Kong',
    category: 'world_country',
    lat: 22.3193,
    lon: 114.1694,
    tz: 8.0
  },
  {
    nameNe: 'ताइपेई, ताइवान (Taipei, Taiwan)',
    nameEn: 'Taipei, Taiwan',
    countryNe: 'ताइवान (Taiwan)',
    countryEn: 'Taiwan',
    category: 'world_country',
    lat: 25.0330,
    lon: 121.5654,
    tz: 8.0
  },
  {
    nameNe: 'म्यानिला, फिलिपिन्स (Manila, Philippines)',
    nameEn: 'Manila, Philippines',
    countryNe: 'फिलिपिन्स (Philippines)',
    countryEn: 'Philippines',
    category: 'world_country',
    lat: 14.5995,
    lon: 120.9842,
    tz: 8.0
  },
  {
    nameNe: 'जकार्ता, इन्डोनेसिया (Jakarta, Indonesia)',
    nameEn: 'Jakarta, Indonesia',
    countryNe: 'इन्डोनेसिया (Indonesia)',
    countryEn: 'Indonesia',
    category: 'world_country',
    lat: -6.2088,
    lon: 106.8456,
    tz: 7.0
  },
  {
    nameNe: 'हनोई, भियतनाम (Hanoi, Vietnam)',
    nameEn: 'Hanoi, Vietnam',
    countryNe: 'भियतनाम (Vietnam)',
    countryEn: 'Vietnam',
    category: 'world_country',
    lat: 21.0285,
    lon: 105.8542,
    tz: 7.0
  },
  {
    nameNe: 'ढाका, बङ्गलादेश (Dhaka, Bangladesh)',
    nameEn: 'Dhaka, Bangladesh',
    countryNe: 'बङ्गलादेश (Bangladesh)',
    countryEn: 'Bangladesh',
    category: 'world_country',
    lat: 23.8103,
    lon: 90.4125,
    tz: 6.0
  },
  {
    nameNe: 'थिम्पु, भुटान (Thimphu, Bhutan)',
    nameEn: 'Thimphu, Bhutan',
    countryNe: 'भुटान (Bhutan)',
    countryEn: 'Bhutan',
    category: 'world_country',
    lat: 27.4728,
    lon: 89.6393,
    tz: 6.0
  },
  {
    nameNe: 'कोलम्बो, श्रीलङ्का (Colombo, Sri Lanka)',
    nameEn: 'Colombo, Sri Lanka',
    countryNe: 'श्रीलङ्का (Sri Lanka)',
    countryEn: 'Sri Lanka',
    category: 'world_country',
    lat: 6.9271,
    lon: 79.8612,
    tz: 5.5
  },
  {
    nameNe: 'इस्लामाबाद / कराँची, पाकिस्तान (Islamabad, Pakistan)',
    nameEn: 'Islamabad, Pakistan',
    countryNe: 'पाकिस्तान (Pakistan)',
    countryEn: 'Pakistan',
    category: 'world_country',
    lat: 33.6844,
    lon: 73.0479,
    tz: 5.0
  },
  {
    nameNe: 'माले, माल्दिभ्स (Male, Maldives)',
    nameEn: 'Male, Maldives',
    countryNe: 'माल्दिभ्स (Maldives)',
    countryEn: 'Maldives',
    category: 'world_country',
    lat: 4.1755,
    lon: 73.5093,
    tz: 5.0
  },

  // 🇬🇧 युरोप (Europe)
  {
    nameNe: 'लण्डन, बेलायत (London, United Kingdom)',
    nameEn: 'London, United Kingdom',
    countryNe: 'संयुक्त अधिराज्य (UK)',
    countryEn: 'United Kingdom',
    category: 'world_country',
    lat: 51.5074,
    lon: -0.1278,
    tz: 0.0
  },
  {
    nameNe: 'म्यानचेस्टर / बर्मिङ्घम, बेलायत (Manchester, UK)',
    nameEn: 'Manchester, United Kingdom',
    countryNe: 'संयुक्त अधिराज्य (UK)',
    countryEn: 'United Kingdom',
    category: 'world_country',
    lat: 53.4808,
    lon: -2.2426,
    tz: 0.0
  },
  {
    nameNe: 'डब्लिन, आयरल्यान्ड (Dublin, Ireland)',
    nameEn: 'Dublin, Ireland',
    countryNe: 'आयरल्यान्ड (Ireland)',
    countryEn: 'Ireland',
    category: 'world_country',
    lat: 53.3498,
    lon: -6.2603,
    tz: 0.0
  },
  {
    nameNe: 'पेरिस, फ्रान्स (Paris, France)',
    nameEn: 'Paris, France',
    countryNe: 'फ्रान्स (France)',
    countryEn: 'France',
    category: 'world_country',
    lat: 48.8566,
    lon: 2.3522,
    tz: 1.0
  },
  {
    nameNe: 'बर्लिन, जर्मनी (Berlin, Germany)',
    nameEn: 'Berlin, Germany',
    countryNe: 'जर्मनी (Germany)',
    countryEn: 'Germany',
    category: 'world_country',
    lat: 52.5200,
    lon: 13.4050,
    tz: 1.0
  },
  {
    nameNe: 'फ्रेङ्कफर्ट / म्युनिख, जर्मनी (Frankfurt, Germany)',
    nameEn: 'Frankfurt, Germany',
    countryNe: 'जर्मनी (Germany)',
    countryEn: 'Germany',
    category: 'world_country',
    lat: 50.1109,
    lon: 8.6821,
    tz: 1.0
  },
  {
    nameNe: 'रोम, इटाली (Rome, Italy)',
    nameEn: 'Rome, Italy',
    countryNe: 'इटाली (Italy)',
    countryEn: 'Italy',
    category: 'world_country',
    lat: 41.9028,
    lon: 12.4964,
    tz: 1.0
  },
  {
    nameNe: 'मिलान, इटाली (Milan, Italy)',
    nameEn: 'Milan, Italy',
    countryNe: 'इटाली (Italy)',
    countryEn: 'Italy',
    category: 'world_country',
    lat: 45.4642,
    lon: 9.1900,
    tz: 1.0
  },
  {
    nameNe: 'म्याड्रिड / बार्सिलोना, स्पेन (Madrid, Spain)',
    nameEn: 'Madrid, Spain',
    countryNe: 'स्पेन (Spain)',
    countryEn: 'Spain',
    category: 'world_country',
    lat: 40.4168,
    lon: -3.7038,
    tz: 1.0
  },
  {
    nameNe: 'लिस्बन, पोर्चुगल (Lisbon, Portugal)',
    nameEn: 'Lisbon, Portugal',
    countryNe: 'पोर्चुगल (Portugal)',
    countryEn: 'Portugal',
    category: 'world_country',
    lat: 38.7223,
    lon: -9.1393,
    tz: 0.0
  },
  {
    nameNe: 'जुरिच / जेनेभा, स्विट्जरल्याण्ड (Zurich, Switzerland)',
    nameEn: 'Zurich, Switzerland',
    countryNe: 'स्विट्जरल्याण्ड (Switzerland)',
    countryEn: 'Switzerland',
    category: 'world_country',
    lat: 47.3769,
    lon: 8.5417,
    tz: 1.0
  },
  {
    nameNe: 'एम्स्टर्डम, नेदरल्यान्ड्स (Amsterdam, Netherlands)',
    nameEn: 'Amsterdam, Netherlands',
    countryNe: 'नेदरल्यान्ड्स (Netherlands)',
    countryEn: 'Netherlands',
    category: 'world_country',
    lat: 52.3676,
    lon: 4.9041,
    tz: 1.0
  },
  {
    nameNe: 'ब्रसेल्स, बेल्जियम (Brussels, Belgium)',
    nameEn: 'Brussels, Belgium',
    countryNe: 'बेल्जियम (Belgium)',
    countryEn: 'Belgium',
    category: 'world_country',
    lat: 50.8503,
    lon: 4.3517,
    tz: 1.0
  },
  {
    nameNe: 'भियना, अस्ट्रिया (Vienna, Austria)',
    nameEn: 'Vienna, Austria',
    countryNe: 'अस्ट्रिया (Austria)',
    countryEn: 'Austria',
    category: 'world_country',
    lat: 48.2082,
    lon: 16.3738,
    tz: 1.0
  },
  {
    nameNe: 'वार्स, पोल्याण्ड (Warsaw, Poland)',
    nameEn: 'Warsaw, Poland',
    countryNe: 'पोल्याण्ड (Poland)',
    countryEn: 'Poland',
    category: 'world_country',
    lat: 52.2297,
    lon: 21.0122,
    tz: 1.0
  },
  {
    nameNe: 'स्टकहोम, स्वीडेन (Stockholm, Sweden)',
    nameEn: 'Stockholm, Sweden',
    countryNe: 'स्वीडेन (Sweden)',
    countryEn: 'Sweden',
    category: 'world_country',
    lat: 59.3293,
    lon: 18.0686,
    tz: 1.0
  },
  {
    nameNe: 'ओस्लो, नर्वे (Oslo, Norway)',
    nameEn: 'Oslo, Norway',
    countryNe: 'नर्वे (Norway)',
    countryEn: 'Norway',
    category: 'world_country',
    lat: 59.9139,
    lon: 10.7522,
    tz: 1.0
  },
  {
    nameNe: 'कोपेनहेगन, डेनमार्क (Copenhagen, Denmark)',
    nameEn: 'Copenhagen, Denmark',
    countryNe: 'डेनमार्क (Denmark)',
    countryEn: 'Denmark',
    category: 'world_country',
    lat: 55.6761,
    lon: 12.5683,
    tz: 1.0
  },
  {
    nameNe: 'हेलसिन्की, फिनल्यान्ड (Helsinki, Finland)',
    nameEn: 'Helsinki, Finland',
    countryNe: 'फिनल्यान्ड (Finland)',
    countryEn: 'Finland',
    category: 'world_country',
    lat: 60.1699,
    lon: 24.9384,
    tz: 2.0
  },
  {
    nameNe: 'एथेन्स, ग्रीस (Athens, Greece)',
    nameEn: 'Athens, Greece',
    countryNe: 'ग्रीस (Greece)',
    countryEn: 'Greece',
    category: 'world_country',
    lat: 37.9838,
    lon: 23.7275,
    tz: 2.0
  },
  {
    nameNe: 'प्राग, चेक गणतन्त्र (Prague, Czech Republic)',
    nameEn: 'Prague, Czech Republic',
    countryNe: 'चेक गणतन्त्र (Czechia)',
    countryEn: 'Czech Republic',
    category: 'world_country',
    lat: 50.0755,
    lon: 14.4378,
    tz: 1.0
  },
  {
    nameNe: 'बुडापेस्ट, हङ्गेरी (Budapest, Hungary)',
    nameEn: 'Budapest, Hungary',
    countryNe: 'हङ्गेरी (Hungary)',
    countryEn: 'Hungary',
    category: 'world_country',
    lat: 47.4979,
    lon: 19.0402,
    tz: 1.0
  },
  {
    nameNe: 'बुखारेस्ट, रोमानिया (Bucharest, Romania)',
    nameEn: 'Bucharest, Romania',
    countryNe: 'रोमानिया (Romania)',
    countryEn: 'Romania',
    category: 'world_country',
    lat: 44.4268,
    lon: 26.1025,
    tz: 2.0
  },
  {
    nameNe: 'निकोसीया, साइप्रस (Nicosia, Cyprus)',
    nameEn: 'Nicosia, Cyprus',
    countryNe: 'साइप्रस (Cyprus)',
    countryEn: 'Cyprus',
    category: 'world_country',
    lat: 35.1856,
    lon: 33.3823,
    tz: 2.0
  },
  {
    nameNe: 'भालेत्ता, माल्टा (Valletta, Malta)',
    nameEn: 'Valletta, Malta',
    countryNe: 'माल्टा (Malta)',
    countryEn: 'Malta',
    category: 'world_country',
    lat: 35.8989,
    lon: 14.5146,
    tz: 1.0
  },
  {
    nameNe: 'मस्को, रुस (Moscow, Russia)',
    nameEn: 'Moscow, Russia',
    countryNe: 'रुस (Russia)',
    countryEn: 'Russia',
    category: 'world_country',
    lat: 55.7558,
    lon: 37.6173,
    tz: 3.0
  },

  // 🇺🇸 उत्तर अमेरिका (North America - USA & Canada)
  {
    nameNe: 'न्यूयोर्क, अमेरिका (New York, USA)',
    nameEn: 'New York, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 40.7128,
    lon: -74.0060,
    tz: -5.0
  },
  {
    nameNe: 'वाशिङ्टन डिसी, अमेरिका (Washington D.C., USA)',
    nameEn: 'Washington D.C., USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 38.9072,
    lon: -77.0369,
    tz: -5.0
  },
  {
    nameNe: 'डल्लास / ह्युस्टन, टेक्सास, अमेरिका (Dallas/Houston, USA)',
    nameEn: 'Dallas / Houston, Texas, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 32.7767,
    lon: -96.7970,
    tz: -6.0
  },
  {
    nameNe: 'शिकागो, इलिनोय, अमेरिका (Chicago, USA)',
    nameEn: 'Chicago, Illinois, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 41.8781,
    lon: -87.6298,
    tz: -6.0
  },
  {
    nameNe: 'लस एन्जलस / क्यालिफोर्निया, अमेरिका (Los Angeles, USA)',
    nameEn: 'Los Angeles, California, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 34.0522,
    lon: -118.2437,
    tz: -8.0
  },
  {
    nameNe: 'सान फ्रान्सिस्को / सिलिकन भ्याली, अमेरिका (San Francisco, USA)',
    nameEn: 'San Francisco, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 37.7749,
    lon: -122.4194,
    tz: -8.0
  },
  {
    nameNe: 'सिएटल, वासिङ्टन, अमेरिका (Seattle, USA)',
    nameEn: 'Seattle, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 47.6062,
    lon: -122.3321,
    tz: -8.0
  },
  {
    nameNe: 'डेन्भर, कोलोराडो, अमेरिका (Denver, USA)',
    nameEn: 'Denver, Colorado, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 39.7392,
    lon: -104.9903,
    tz: -7.0
  },
  {
    nameNe: 'अटलान्टा, जर्जिया, अमेरिका (Atlanta, USA)',
    nameEn: 'Atlanta, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 33.7490,
    lon: -84.3880,
    tz: -5.0
  },
  {
    nameNe: 'बोस्टन, म्यासाचुसेट्स, अमेरिका (Boston, USA)',
    nameEn: 'Boston, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 42.3601,
    lon: -71.0589,
    tz: -5.0
  },
  {
    nameNe: 'मियामी / फ्लोरिडा, अमेरिका (Miami, USA)',
    nameEn: 'Miami, Florida, USA',
    countryNe: 'संयुक्त राज्य अमेरिका (USA)',
    countryEn: 'United States',
    category: 'world_country',
    lat: 25.7617,
    lon: -80.1918,
    tz: -5.0
  },
  {
    nameNe: 'टोरन्टो, क्यानडा (Toronto, Canada)',
    nameEn: 'Toronto, Canada',
    countryNe: 'क्यानडा (Canada)',
    countryEn: 'Canada',
    category: 'world_country',
    lat: 43.6532,
    lon: -79.3832,
    tz: -5.0
  },
  {
    nameNe: 'भ्यानकुभर, क्यानडा (Vancouver, Canada)',
    nameEn: 'Vancouver, Canada',
    countryNe: 'क्यानडा (Canada)',
    countryEn: 'Canada',
    category: 'world_country',
    lat: 49.2827,
    lon: -123.1207,
    tz: -8.0
  },
  {
    nameNe: 'क्यालगरी / एडमन्टन, क्यानडा (Calgary, Canada)',
    nameEn: 'Calgary, Canada',
    countryNe: 'क्यानडा (Canada)',
    countryEn: 'Canada',
    category: 'world_country',
    lat: 51.0447,
    lon: -114.0719,
    tz: -7.0
  },
  {
    nameNe: 'ओटावा / मोन्ट्रियल, क्यानडा (Ottawa/Montreal, Canada)',
    nameEn: 'Ottawa, Canada',
    countryNe: 'क्यानडा (Canada)',
    countryEn: 'Canada',
    category: 'world_country',
    lat: 45.4215,
    lon: -75.6972,
    tz: -5.0
  },

  // 🇦🇺 ओशिनिया (Australia & New Zealand)
  {
    nameNe: 'सिड्नी, अस्ट्रेलिया (Sydney, Australia)',
    nameEn: 'Sydney, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -33.8688,
    lon: 151.2093,
    tz: 10.0
  },
  {
    nameNe: 'मेलबर्न, अस्ट्रेलिया (Melbourne, Australia)',
    nameEn: 'Melbourne, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -37.8136,
    lon: 144.9631,
    tz: 10.0
  },
  {
    nameNe: 'ब्रिसबेन, अस्ट्रेलिया (Brisbane, Australia)',
    nameEn: 'Brisbane, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -27.4698,
    lon: 153.0251,
    tz: 10.0
  },
  {
    nameNe: 'पर्थ, अस्ट्रेलिया (Perth, Australia)',
    nameEn: 'Perth, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -31.9505,
    lon: 115.8605,
    tz: 8.0
  },
  {
    nameNe: 'एडिलेट, अस्ट्रेलिया (Adelaide, Australia)',
    nameEn: 'Adelaide, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -34.9285,
    lon: 138.6007,
    tz: 9.5
  },
  {
    nameNe: 'क्यानबेरा, अस्ट्रेलिया (Canberra, Australia)',
    nameEn: 'Canberra, Australia',
    countryNe: 'अस्ट्रेलिया (Australia)',
    countryEn: 'Australia',
    category: 'world_country',
    lat: -35.2809,
    lon: 149.1300,
    tz: 10.0
  },
  {
    nameNe: 'अकल्याण्ड, न्युजिल्यान्ड (Auckland, New Zealand)',
    nameEn: 'Auckland, New Zealand',
    countryNe: 'न्युजिल्यान्ड (New Zealand)',
    countryEn: 'New Zealand',
    category: 'world_country',
    lat: -36.8485,
    lon: 174.7633,
    tz: 12.0
  },
  {
    nameNe: 'वेलिङ्टन, न्युजिल्यान्ड (Wellington, New Zealand)',
    nameEn: 'Wellington, New Zealand',
    countryNe: 'न्युजिल्यान्ड (New Zealand)',
    countryEn: 'New Zealand',
    category: 'world_country',
    lat: -41.2865,
    lon: 174.7762,
    tz: 12.0
  },
  {
    nameNe: 'क्राइस्टचर्च, न्युजिल्यान्ड (Christchurch, New Zealand)',
    nameEn: 'Christchurch, New Zealand',
    countryNe: 'न्युजिल्यान्ड (New Zealand)',
    countryEn: 'New Zealand',
    category: 'world_country',
    lat: -43.5321,
    lon: 172.6362,
    tz: 12.0
  },

  // 🇿🇦 अफ्रिका र दक्षिण अमेरिका (Africa & Latin America)
  {
    nameNe: 'जोहानेसबर्ग, दक्षिण अफ्रिका (Johannesburg, South Africa)',
    nameEn: 'Johannesburg, South Africa',
    countryNe: 'दक्षिण अफ्रिका (South Africa)',
    countryEn: 'South Africa',
    category: 'world_country',
    lat: -26.2041,
    lon: 28.0473,
    tz: 2.0
  },
  {
    nameNe: 'केप टाउन, दक्षिण अफ्रिका (Cape Town, South Africa)',
    nameEn: 'Cape Town, South Africa',
    countryNe: 'दक्षिण अफ्रिका (South Africa)',
    countryEn: 'South Africa',
    category: 'world_country',
    lat: -33.9249,
    lon: 18.4241,
    tz: 2.0
  },
  {
    nameNe: 'कायरो, इजिप्ट (Cairo, Egypt)',
    nameEn: 'Cairo, Egypt',
    countryNe: 'इजिप्ट (Egypt)',
    countryEn: 'Egypt',
    category: 'world_country',
    lat: 30.0444,
    lon: 31.2357,
    tz: 2.0
  },
  {
    nameNe: 'नैरोबी, केन्या (Nairobi, Kenya)',
    nameEn: 'Nairobi, Kenya',
    countryNe: 'केन्या (Kenya)',
    countryEn: 'Kenya',
    category: 'world_country',
    lat: -1.2921,
    lon: 36.8219,
    tz: 3.0
  },
  {
    nameNe: 'साओ पाउलो / ब्रासिलिया, ब्राजिल (Sao Paulo, Brazil)',
    nameEn: 'Sao Paulo, Brazil',
    countryNe: 'ब्राजिल (Brazil)',
    countryEn: 'Brazil',
    category: 'world_country',
    lat: -23.5505,
    lon: -46.6333,
    tz: -3.0
  },
  {
    nameNe: 'ब्यूनस आयर्स, अर्जेन्टिना (Buenos Aires, Argentina)',
    nameEn: 'Buenos Aires, Argentina',
    countryNe: 'अर्जेन्टिना (Argentina)',
    countryEn: 'Argentina',
    category: 'world_country',
    lat: -34.6037,
    lon: -58.3816,
    tz: -3.0
  },
  {
    nameNe: 'मेक्सिको सिटी, मेक्सिको (Mexico City, Mexico)',
    nameEn: 'Mexico City, Mexico',
    countryNe: 'मेक्सिको (Mexico)',
    countryEn: 'Mexico',
    category: 'world_country',
    lat: 19.4326,
    lon: -99.1332,
    tz: -6.0
  },
  {
    nameNe: 'पोर्ट लुइस, मरिसस (Port Louis, Mauritius)',
    nameEn: 'Port Louis, Mauritius',
    countryNe: 'मरिसस (Mauritius)',
    countryEn: 'Mauritius',
    category: 'world_country',
    lat: -20.1609,
    lon: 57.5012,
    tz: 4.0
  },
  {
    nameNe: 'सुभा, फिजी (Suva, Fiji)',
    nameEn: 'Suva, Fiji',
    countryNe: 'फिजी (Fiji)',
    countryEn: 'Fiji',
    category: 'world_country',
    lat: -18.1416,
    lon: 178.4419,
    tz: 12.0
  }
];

// Combined list: Nepal 77 districts first, then World Countries & Indian centers
export const CITY_PRESETS: CityPreset[] = [
  ...NEPAL_77_DISTRICTS,
  ...WORLD_COUNTRIES
];

/**
 * Fast search helper that searches across nameNe, nameEn, districtNe, districtEn, countryNe, countryEn
 */
export function searchCityPresets(
  query: string,
  categoryFilter?: 'all' | 'nepal' | 'world' | 'india' | 'gulf'
): CityPreset[] {
  const cleanQ = query.trim().toLowerCase();

  let pool = CITY_PRESETS;
  if (categoryFilter === 'nepal') {
    pool = NEPAL_77_DISTRICTS;
  } else if (categoryFilter === 'world') {
    pool = WORLD_COUNTRIES.filter((c) => c.category === 'world_country');
  } else if (categoryFilter === 'india') {
    pool = WORLD_COUNTRIES.filter((c) => c.category === 'india');
  } else if (categoryFilter === 'gulf') {
    pool = WORLD_COUNTRIES.filter((c) => c.category === 'gulf');
  }

  if (!cleanQ) {
    return pool;
  }

  return pool.filter((item) => {
    return (
      item.nameNe.toLowerCase().includes(cleanQ) ||
      item.nameEn.toLowerCase().includes(cleanQ) ||
      (item.districtNe && item.districtNe.toLowerCase().includes(cleanQ)) ||
      (item.districtEn && item.districtEn.toLowerCase().includes(cleanQ)) ||
      (item.provinceNe && item.provinceNe.toLowerCase().includes(cleanQ)) ||
      (item.provinceEn && item.provinceEn.toLowerCase().includes(cleanQ)) ||
      item.countryNe.toLowerCase().includes(cleanQ) ||
      item.countryEn.toLowerCase().includes(cleanQ)
    );
  });
}
