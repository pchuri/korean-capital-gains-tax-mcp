import {
  calculateYearsBetween,
  calculateHoldingPeriodYears,
  isValidDateFormat,
  isDateBefore,
} from '../../src/utils/date-utils';

describe('Date Utils', () => {
  describe('calculateYearsBetween', () => {
    test('should calculate years correctly', () => {
      expect(calculateYearsBetween('2020-01-01', '2023-01-01')).toBe(3);
      expect(calculateYearsBetween('2020-01-01', '2022-12-31')).toBe(2);
      expect(calculateYearsBetween('2020-02-29', '2024-02-29')).toBe(4); // 윤년 처리
    });

    test('should handle same date', () => {
      expect(calculateYearsBetween('2020-01-01', '2020-01-01')).toBe(0);
    });
  });

  describe('calculateHoldingPeriodYears', () => {
    test('should calculate holding period correctly', () => {
      expect(calculateHoldingPeriodYears('2017-01-01', '2024-01-01')).toBe(7);
      expect(calculateHoldingPeriodYears('2017-01-01', '2023-12-31')).toBe(6);
      expect(calculateHoldingPeriodYears('2017-06-15', '2024-01-01')).toBe(6);
    });
  });

  describe('isValidDateFormat', () => {
    test('should validate date format correctly', () => {
      expect(isValidDateFormat('2024-01-01')).toBe(true);
      expect(isValidDateFormat('2024-12-31')).toBe(true);
      expect(isValidDateFormat('2024-1-1')).toBe(false);
      expect(isValidDateFormat('24-01-01')).toBe(false);
      expect(isValidDateFormat('2024-13-01')).toBe(false);
      expect(isValidDateFormat('invalid-date')).toBe(false);
    });
  });

  describe('isDateBefore', () => {
    test('should compare dates correctly', () => {
      expect(isDateBefore('2020-01-01', '2020-01-02')).toBe(true);
      expect(isDateBefore('2020-01-02', '2020-01-01')).toBe(false);
      expect(isDateBefore('2020-01-01', '2020-01-01')).toBe(false);
    });
  });
});
