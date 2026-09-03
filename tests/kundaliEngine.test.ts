import { describe, it, expect } from 'vitest';
import {
  calculateJulianDay,
  calculateLahiriAyanamsa,
  calculateAscendant,
  calculatePlanetaryPositions,
  calculateDivisionalCharts,
  detectYogas,
  calculateVimshottariDasha,
  calculateHouseDetails,
  calculateFullKundali,
  calculateAvakhada,
  calculateTribhagiDasha,
  calculateYoginiDasha,
  getNakshatraAndPada
} from '../utils/kundaliEngine';
import { KundaliInput } from '../types';

describe('Astrology Calculation Engine Accuracy Tests', () => {

  it('1. Julian Day and Lahiri Ayanamsa Calculation Accuracy', () => {
    // Test J2000.0 (2000-01-01 12:00 UTC)
    const j2000Date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const jd = calculateJulianDay(j2000Date);
    expect(jd).toBeCloseTo(2451545.0, 4);

    const ayanamsaJ2000 = calculateLahiriAyanamsa(jd);
    // Standard Chitrapaksha Lahiri Ayanamsa at J2000.0 is ~23.85709° (23° 51' 25")
    expect(ayanamsaJ2000).toBeCloseTo(23.857, 2);

    // Test Historical Date: 1947-08-15 00:00 UTC
    const date1947 = new Date(Date.UTC(1947, 7, 15, 0, 0, 0));
    const jd1947 = calculateJulianDay(date1947);
    const ayanamsa1947 = calculateLahiriAyanamsa(jd1947);
    // Ayanamsa in 1947 should be around ~23.12°
    expect(ayanamsa1947).toBeGreaterThan(23.0);
    expect(ayanamsa1947).toBeLessThan(23.3);
  });

  it('2. Ascendant (Lagna) Sidereal Calculation for Kathmandu Coordinates', () => {
    // Birth in Kathmandu: 27.7172° N, 85.3240° E
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0)); // 08:30 NPT (+5:45)
    const ayanamsa = calculateLahiriAyanamsa(calculateJulianDay(testDate));
    const lagnaDeg = calculateAscendant(testDate, 27.7172, 85.3240, ayanamsa);

    expect(lagnaDeg).toBeGreaterThanOrEqual(0);
    expect(lagnaDeg).toBeLessThan(360);
  });

  it('3. True Node vs Mean Node Planetary Calculation', () => {
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0));
    const ayanamsa = calculateLahiriAyanamsa(calculateJulianDay(testDate));
    const lagnaDeg = 65.4; // Example Gemini lagna

    const trueNodePlanets = calculatePlanetaryPositions(testDate, ayanamsa, lagnaDeg, 'true');
    const meanNodePlanets = calculatePlanetaryPositions(testDate, ayanamsa, lagnaDeg, 'mean');

    const rahuTrue = trueNodePlanets.find((p) => p.id === 'rahu');
    const rahuMean = meanNodePlanets.find((p) => p.id === 'rahu');

    expect(rahuTrue).toBeDefined();
    expect(rahuMean).toBeDefined();

    // True vs Mean node should differ slightly (usually by 0.1° to 1.5°)
    const diff = Math.abs((rahuTrue?.degree || 0) - (rahuMean?.degree || 0));
    expect(diff).toBeLessThan(3.0);
  });

  it('4. All 16 Divisional Charts (Shodashvarga) Generation', () => {
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0));
    const ayanamsa = calculateLahiriAyanamsa(calculateJulianDay(testDate));
    const planets = calculatePlanetaryPositions(testDate, ayanamsa, 45.0, 'true');

    const vargaCharts = calculateDivisionalCharts(planets);

    expect(vargaCharts.length).toBe(16);
    const codes = vargaCharts.map((c) => c.code);
    expect(codes).toContain('D1');
    expect(codes).toContain('D9');
    expect(codes).toContain('D10');
    expect(codes).toContain('D20');
    expect(codes).toContain('D60');

    // Check that each divisional chart has exactly 12 houses
    for (const varga of vargaCharts) {
      expect(varga.houses.length).toBe(12);
    }
  });

  it('5. Rigorous Yoga Detection Engine', () => {
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0));
    const ayanamsa = calculateLahiriAyanamsa(calculateJulianDay(testDate));
    const planets = calculatePlanetaryPositions(testDate, ayanamsa, 45.0, 'true');
    const houseDetails = calculateHouseDetails(planets);

    const yogas = detectYogas(planets, houseDetails);

    expect(yogas.length).toBeGreaterThanOrEqual(10);

    const budhaditya = yogas.find((y) => y.id === 'budhaditya');
    expect(budhaditya).toBeDefined();
    expect(budhaditya?.exactRuleNe).toBeDefined();
    expect(budhaditya?.requiredConditionNe).toBeDefined();
    expect(budhaditya?.actualConditionNe).toBeDefined();

    const gajakesari = yogas.find((y) => y.id === 'gajakesari');
    expect(gajakesari).toBeDefined();
    expect(typeof gajakesari?.isPresent).toBe('boolean');
  });

  it('6. Vimshottari Dasha Hierarchy', () => {
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0));
    const moonDeg = 215.5; // Scorpio Moon in Anuradha Nakshatra (Saturn lord)

    const dashas = calculateVimshottariDasha(moonDeg, testDate);
    expect(dashas.length).toBeGreaterThanOrEqual(9);
    const totalYears = dashas.reduce((sum, d) => sum + d.durationYears, 0);
    expect(Math.round(totalYears)).toBe(120);

    // First dasha should be Saturn (Saturn is lord of Anuradha)
    expect(dashas[0].planetKey).toBe('saturn');

    // Each Mahadasha should have 9 Antardashas
    expect(dashas[0].antardashas?.length).toBe(9);
  });

  it('7. Full Kundali Master Execution & Edge Cases (Midnight Birth & Leap Year)', () => {
    // Test Leap Year Midnight Birth: 2024-02-29 00:01
    const leapYearInput: KundaliInput = {
      name: 'Leap Year Test',
      gender: 'female',
      birthDate: '2024-02-29',
      birthTime: '00:01',
      birthPlace: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      timezone: 5.75,
      nodeType: 'true'
    };

    const result = calculateFullKundali(leapYearInput);

    expect(result).toBeDefined();
    expect(result.planetPositions.length).toBe(10); // Lagna + 9 Grahas
    expect(result.audit.nodeType).toBe('true');
    expect(result.yogas.length).toBeGreaterThan(0);
    expect(result.divisionalCharts.length).toBe(16);
  });

  it('8. Deterministic UTC Date Conversion & Lagna Calculation for Nepal (UTC+05:45)', () => {
    const nepalInput: KundaliInput = {
      name: 'Ram Prasad Sharma',
      gender: 'male',
      birthDate: '1995-05-15',
      birthTime: '08:30',
      birthPlace: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      timezone: 5.75,
      nodeType: 'true'
    };

    const result = calculateFullKundali(nepalInput);

    // 08:30 AM NPT (+5:45) on 1995-05-15 must convert to exactly 02:45:00 UTC
    expect(result.audit.utcDateStr).toBe('1995-05-15T02:45:00.000Z');

    // Verify Lagna is Gemini (Mithuna)
    expect(result.lagna).toBe('मिथुन');
    expect(result.lagnaEnglish).toBe('Gemini');
  });

  it('9. Verify Avakhada Chakra & Revati 2nd Pada Namakshar ("दो")', () => {
    // Mock planet position for Moon in Revati 2nd Pada
    const revatiMoon = {
      id: 'moon',
      nameNe: 'चन्द्र',
      nameEn: 'Moon',
      nameSa: 'चन्द्र',
      degree: 350.0, // In Pisces (Revati)
      degreeInSign: 20.0,
      degreeStr: '20° 00\'',
      tropLongitude: 14.0,
      siderealLongitude: 350.0,
      rashiIndex: 11, // Pisces (मीन)
      rashiNe: 'मीन',
      rashiEn: 'Pisces',
      rashiLordNe: 'गुरु',
      rashiLordEn: 'Jupiter',
      nakshatraIndex: 26, // Revati (रेवती)
      nakshatraNe: 'रेवती',
      nakshatraEn: 'Revati',
      nakshatraLordNe: 'बुध',
      nakshatraLordEn: 'Mercury',
      pad: 2, // 2nd pada
      isRetrograde: false,
      houseNum: 10,
      awastha: 'युवा' as const,
      dignity: 'स्वगृही' as const,
      dignityEn: 'Own Sign' as const,
      speed: 13.2
    };

    const avakhada = calculateAvakhada(revatiMoon);
    expect(avakhada.nakshatra).toBe('रेवती');
    expect(avakhada.nakshatraPad).toBe(2);
    expect(avakhada.namakshar).toBe('दो'); // Correct 2nd pada for Revati (दे, दो, च, ची)
    expect(avakhada.gana).toBe('देव'); // Revati is Deva Gana
    expect(avakhada.yoni).toBe('गज'); // Revati is Gaja Yoni
    expect(avakhada.nadi).toBe('अन्त्य'); // Revati is Antya Nadi
  });

  it('10. Independent Tribhagi (80-yr) & Yogini (36/72-yr) Dasha Systems', () => {
    const testDate = new Date(Date.UTC(1995, 4, 15, 2, 45, 0));
    const moonDeg = 215.5; // Anuradha Nakshatra (Index 16 + 1 = 17)

    // Vimshottari Dasha (120-yr)
    const vimshottari = calculateVimshottariDasha(moonDeg, testDate);
    const vimTotalYears = vimshottari.reduce((sum, d) => sum + d.durationYears, 0);
    expect(Math.round(vimTotalYears)).toBe(120);

    // Tribhagi Dasha (80-yr)
    const tribhagi = calculateTribhagiDasha(moonDeg, testDate);
    const triTotalYears = tribhagi.reduce((sum, d) => sum + d.durationYears, 0);
    expect(Math.round(triTotalYears)).toBe(80);
    expect(tribhagi[0].planetKey).toBe('saturn');
    expect(tribhagi[0].antardashas?.length).toBe(9);

    // Yogini Dasha (1 cycle = 36 yrs, 2 cycles = 72 yrs)
    const yoginiSingle = calculateYoginiDasha(moonDeg, testDate, false);
    const yogSingleYears = yoginiSingle.reduce((sum, d) => sum + d.durationYears, 0);
    expect(Math.round(yogSingleYears)).toBe(36);

    const yoginiExtended = calculateYoginiDasha(moonDeg, testDate, true);
    const yogExtYears = yoginiExtended.reduce((sum, d) => sum + d.durationYears, 0);
    expect(Math.round(yogExtYears)).toBe(72);

    // Nakshatra 17 (Anuradha): ((17 + 3 - 1) % 8) = 19 % 8 = 3 (0-indexed: 3 = Bhramari / Mars)
    expect(yoginiSingle[0].nameEn).toBe('Bhramari');
    expect(yoginiSingle[0].subPeriods.length).toBe(8);
  });

  it('11. Exact Pada Boundary Precision & Namakshar Consistency', () => {
    // Test 0° (Ashwini 1)
    const p0 = getNakshatraAndPada(0.0);
    expect(p0.nakIdx).toBe(0);
    expect(p0.pad).toBe(1);

    // Test 20° (Bharani 3: 13°20' + 6°40' = 20°)
    const p20 = getNakshatraAndPada(20.0);
    expect(p20.nakIdx).toBe(1);
    expect(p20.pad).toBe(3);

    // Test 40° (Rohini 1)
    const p40 = getNakshatraAndPada(40.0);
    expect(p40.nakIdx).toBe(3);
    expect(p40.pad).toBe(1);

    // Test 80° (Punarvasu 1)
    const p80 = getNakshatraAndPada(80.0);
    expect(p80.nakIdx).toBe(6);
    expect(p80.pad).toBe(1);

    // Test 120° (Magha 1)
    const p120 = getNakshatraAndPada(120.0);
    expect(p120.nakIdx).toBe(9);
    expect(p120.pad).toBe(1);

    // Test 350° (Revati 2)
    const p350 = getNakshatraAndPada(350.0);
    expect(p350.nakIdx).toBe(26);
    expect(p350.pad).toBe(2);
  });

});
