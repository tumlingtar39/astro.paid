export interface CityPreset {
  nameNe: string;
  nameEn: string;
  districtNe?: string;
  countryNe: string;
  countryEn: string;
  lat: number;
  lon: number;
  tz: number; // UTC offset in decimal hours (e.g. +5.75)
}

export const CITY_PRESETS: CityPreset[] = [
  // Nepal
  { nameNe: 'काठमाडौँ (Kathmandu)', nameEn: 'Kathmandu', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.7172, lon: 85.3240, tz: 5.75 },
  { nameNe: 'पोखरा (Pokhara)', nameEn: 'Pokhara', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 28.2096, lon: 83.9856, tz: 5.75 },
  { nameNe: 'ललितपुर (Lalitpur/Patan)', nameEn: 'Lalitpur', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.6667, lon: 85.3167, tz: 5.75 },
  { nameNe: 'भक्तपुर (Bhaktapur)', nameEn: 'Bhaktapur', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.6710, lon: 85.4298, tz: 5.75 },
  { nameNe: 'चितवन / भरतपूर (Bharatpur)', nameEn: 'Bharatpur', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.6833, lon: 84.4333, tz: 5.75 },
  { nameNe: 'बिराटनगर (Biratnagar)', nameEn: 'Biratnagar', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 26.4525, lon: 87.2718, tz: 5.75 },
  { nameNe: 'जनकपुर (Janakpur)', nameEn: 'Janakpur', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 26.7288, lon: 85.9254, tz: 5.75 },
  { nameNe: 'धरान (Dharan)', nameEn: 'Dharan', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 26.8124, lon: 87.2834, tz: 5.75 },
  { nameNe: 'बुटवल (Butwal)', nameEn: 'Butwal', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.7006, lon: 83.4484, tz: 5.75 },
  { nameNe: 'हेटौँडा (Hetauda)', nameEn: 'Hetauda', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.4289, lon: 85.0322, tz: 5.75 },
  { nameNe: 'नेपालगञ्ज (Nepalgunj)', nameEn: 'Nepalgunj', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 28.0500, lon: 81.6167, tz: 5.75 },
  { nameNe: 'धनगढी (Dhangadhi)', nameEn: 'Dhangadhi', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 28.6852, lon: 80.5960, tz: 5.75 },
  { nameNe: 'वीरगञ्ज (Birgunj)', nameEn: 'Birgunj', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.0000, lon: 84.8667, tz: 5.75 },
  { nameNe: 'इटहरी (Itahari)', nameEn: 'Itahari', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 26.6667, lon: 87.2833, tz: 5.75 },
  { nameNe: 'तुम्लिङटार / संखुवासभा (Tumlingtar)', nameEn: 'Tumlingtar', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.3167, lon: 87.2000, tz: 5.75 },
  { nameNe: 'लुम्बिनी (Lumbini)', nameEn: 'Lumbini', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.4833, lon: 83.2833, tz: 5.75 },
  { nameNe: 'सुर्खेत (Surkhet)', nameEn: 'Surkhet', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 28.6000, lon: 81.6000, tz: 5.75 },
  { nameNe: 'दाङ / घोराही (Dang)', nameEn: 'Ghorahi', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 28.0333, lon: 82.4833, tz: 5.75 },

  // India
  { nameNe: 'नयाँ दिल्ली (New Delhi)', nameEn: 'New Delhi', countryNe: 'भारत', countryEn: 'India', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { nameNe: 'वाराणसी / काशी (Varanasi)', nameEn: 'Varanasi', countryNe: 'भारत', countryEn: 'India', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { nameNe: 'मुम्बई (Mumbai)', nameEn: 'Mumbai', countryNe: 'भारत', countryEn: 'India', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { nameNe: 'कोलकाता (Kolkata)', nameEn: 'Kolkata', countryNe: 'भारत', countryEn: 'India', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { nameNe: 'बेंगलुरु (Bengaluru)', nameEn: 'Bengaluru', countryNe: 'भारत', countryEn: 'India', lat: 12.9716, lon: 77.5946, tz: 5.5 },

  // Global
  { nameNe: 'लण्डन (London)', nameEn: 'London', countryNe: 'बेलायत', countryEn: 'UK', lat: 51.5074, lon: -0.1278, tz: 0.0 },
  { nameNe: 'न्यूयोर्क (New York)', nameEn: 'New York', countryNe: 'अमेरिका', countryEn: 'USA', lat: 40.7128, lon: -74.0060, tz: -5.0 },
  { nameNe: 'सिड्नी (Sydney)', nameEn: 'Sydney', countryNe: 'अस्ट्रेलिया', countryEn: 'Australia', lat: -33.8688, lon: 151.2093, tz: 10.0 },
  { nameNe: 'टोकियो (Tokyo)', nameEn: 'Tokyo', countryNe: 'जापान', countryEn: 'Japan', lat: 35.6762, lon: 139.6503, tz: 9.0 },
  { nameNe: 'दुबई (Dubai)', nameEn: 'Dubai', countryNe: 'युएई', countryEn: 'UAE', lat: 25.2048, lon: 55.2708, tz: 4.0 },
  { nameNe: 'काठमाडौँ/नेपाल मानकसँग मिल्दो', nameEn: 'Kathmandu Default', countryNe: 'नेपाल', countryEn: 'Nepal', lat: 27.7172, lon: 85.3240, tz: 5.75 }
];
