import { describe, it, expect } from 'vitest';
import {
  convertBSToAD,
  convertADToBS,
  getDaysInBSMonth,
  formatADDate,
  formatBSDate,
  getWeekdayInfo
} from '../utils/nepaliCalendar';

describe('Bikram Sambat (BS) to Gregorian (AD) Date Converter Tests', () => {
  it('1. Accurate BS to AD conversion without estimation', () => {
    // 2052-02-01 BS -> 1995-05-15 AD
    const ad1 = convertBSToAD(2052, 2, 1);
    expect(formatADDate(ad1)).toBe('1995-05-15');

    // 2081-01-01 BS -> 2024-04-13 AD
    const ad2 = convertBSToAD(2081, 1, 1);
    expect(formatADDate(ad2)).toBe('2024-04-13');

    // 2079-01-01 BS -> 2022-04-14 AD (Thursday / बिहीबार)
    const ad3 = convertBSToAD(2079, 1, 1);
    expect(formatADDate(ad3)).toBe('2022-04-14');

    // 2000-01-01 BS -> 1943-04-14 AD
    const ad4 = convertBSToAD(2000, 1, 1);
    expect(formatADDate(ad4)).toBe('1943-04-14');
    // 2053-11-28 BS -> 1997-03-11 AD (Tuesday / मङ्गलबार)
    const ad5 = convertBSToAD(2053, 11, 28);
    expect(formatADDate(ad5)).toBe('1997-03-11');
  });

  it('2. Accurate AD to BS conversion', () => {
    // 1997-03-11 AD -> 2053-11-28 BS
    const bs0 = convertADToBS(1997, 3, 11);
    expect(bs0.year).toBe(2053);
    expect(bs0.month).toBe(11);
    expect(bs0.day).toBe(28);
    // 1995-05-15 AD -> 2052-02-01 BS
    const bs1 = convertADToBS(1995, 5, 15);
    expect(bs1.year).toBe(2052);
    expect(bs1.month).toBe(2);
    expect(bs1.day).toBe(1);

    // 2024-04-13 AD -> 2081-01-01 BS
    const bs2 = convertADToBS(2024, 4, 13);
    expect(bs2.year).toBe(2081);
    expect(bs2.month).toBe(1);
    expect(bs2.day).toBe(1);

    // 2022-04-14 AD -> 2079-01-01 BS
    const bs3 = convertADToBS(2022, 4, 14);
    expect(bs3.year).toBe(2079);
    expect(bs3.month).toBe(1);
    expect(bs3.day).toBe(1);
  });

  it('3. Accurate weekday detection', () => {
    // 2022-04-14 AD is Thursday (बिहीबार)
    const w1 = getWeekdayInfo(2022, 4, 14);
    expect(w1.varaEn).toBe('Thursday');
    expect(w1.varaNe).toBe('बिहीबार (गुरुवासर)');

    // 2024-04-13 AD is Saturday (शनिबार)
    const w2 = getWeekdayInfo(2024, 4, 13);
    expect(w2.varaEn).toBe('Saturday');
    expect(w2.varaNe).toBe('शनिबार (स्थिरवासर)');
  });

  it('4. Month days query accuracy', () => {
    // 2081 Baisakh has 31 days
    expect(getDaysInBSMonth(2081, 1)).toBe(31);

    // 2000 Jeth has 32 days
    expect(getDaysInBSMonth(2000, 2)).toBe(32);
  });
});

