import NepaliDate from 'nepali-date-converter';

// Nepali Bikram Samvat (BS) to Anno Domini (AD) precise conversion helper
// Accurate conversion range: BS 1970 to BS 2100 (AD 1913 to AD 2043)

export interface BSDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export interface ADDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export const NEPALI_MONTHS_NE = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_MONTHS_EN = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const VARAS_NE = [
  'आइतबार (रविवासर)',
  'सोमबार (सोमवासर)',
  'मङ्गलबार (भौमवासर)',
  'बुधबार (सौम्यवासर)',
  'बिहीबार (गुरुवासर)',
  'शुक्रबार (भृगुवासर)',
  'शनिबार (स्थिरवासर)'
];

export const VARAS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function getDaysInBSMonth(bsYear: number, bsMonth: number): number {
  try {
    for (let d = 32; d >= 29; d--) {
      try {
        const nd = new NepaliDate(bsYear, bsMonth - 1, d);
        const bs = nd.getBS();
        if (bs.year === bsYear && bs.month === bsMonth - 1 && bs.date === d) {
          return d;
        }
      } catch (_e) {}
    }
  } catch (_e) {}
  return 30;
}

export function convertBSToAD(bsYear: number, bsMonth: number, bsDay: number): ADDate {
  try {
    const nd = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    const ad = nd.getAD();
    return {
      year: ad.year,
      month: ad.month + 1,
      day: ad.date
    };
  } catch (_e) {
    const d = new Date(bsYear - 57, bsMonth - 1, bsDay);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
}

export function convertADToBS(adYear: number, adMonth: number, adDay: number): BSDate {
  try {
    const jsDate = new Date(adYear, adMonth - 1, adDay, 12, 0, 0);
    const nd = new NepaliDate(jsDate);
    const bs = nd.getBS();
    return {
      year: bs.year,
      month: bs.month + 1,
      day: bs.date
    };
  } catch (_e) {
    return { year: adYear + 57, month: adMonth, day: adDay };
  }
}

export function formatADDate(ad: ADDate): string {
  const y = ad.year;
  const m = String(ad.month).padStart(2, '0');
  const d = String(ad.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBSDate(bs: BSDate): string {
  const monthName = NEPALI_MONTHS_NE[bs.month - 1] || `${bs.month}`;
  return `वि.सं. ${bs.year} ${monthName} ${bs.day} गते`;
}

export function getWeekdayInfo(adYear: number, adMonth: number, adDay: number): {
  dayIndex: number;
  varaNe: string;
  varaEn: string;
} {
  const localDate = new Date(Date.UTC(adYear, adMonth - 1, adDay, 12, 0, 0));
  const dayIndex = localDate.getUTCDay();
  return {
    dayIndex,
    varaNe: VARAS_NE[dayIndex] || VARAS_NE[0],
    varaEn: VARAS_EN[dayIndex] || VARAS_EN[0]
  };
}
