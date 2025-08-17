import {
  calculateProgressiveTaxRate,
  getMarginalTaxRate,
  getLongTermDeductionRate,
  getShortTermHeavyTaxRate,
  getMultipleHouseSurcharge,
  getFinalTaxRate,
  calculateHighValueHouseTaxableGains,
} from '../../src/utils/tax-rates';

describe('Tax Rates Utils', () => {
  describe('calculateProgressiveTaxRate', () => {
    test('should calculate progressive tax correctly', () => {
      expect(calculateProgressiveTaxRate(10_000_000)).toBeCloseTo(600_000, 0); // 6%
      expect(calculateProgressiveTaxRate(30_000_000)).toBeCloseTo(3_240_000, 0); // 혼합 세율
      expect(calculateProgressiveTaxRate(0)).toBe(0);
    });
  });

  describe('getMarginalTaxRate', () => {
    test('should return correct marginal tax rate', () => {
      expect(getMarginalTaxRate(10_000_000)).toBe(6);
      expect(getMarginalTaxRate(30_000_000)).toBe(15);
      expect(getMarginalTaxRate(70_000_000)).toBe(24);
      expect(getMarginalTaxRate(2_000_000_000)).toBe(45);
    });
  });

  describe('getLongTermDeductionRate', () => {
    test('should return correct long-term deduction rate', () => {
      expect(getLongTermDeductionRate(2)).toBe(0); // 3년 미만
      expect(getLongTermDeductionRate(3)).toBe(10); // 3년 이상 4년 미만
      expect(getLongTermDeductionRate(7)).toBe(24); // 7년 이상 8년 미만
      expect(getLongTermDeductionRate(12)).toBe(40); // 11년 이상
    });

    test('should apply residence bonus for 1household1house', () => {
      expect(getLongTermDeductionRate(3, true)).toBe(22); // 거주 가산
      expect(getLongTermDeductionRate(7, true)).toBe(36); // 거주 가산
      expect(getLongTermDeductionRate(12, true)).toBe(52); // 거주 가산
    });
  });

  describe('getShortTermHeavyTaxRate', () => {
    test('should return heavy tax rate for short-term holding', () => {
      expect(getShortTermHeavyTaxRate(0.5)).toBe(50); // 1년 미만
      expect(getShortTermHeavyTaxRate(1.5)).toBe(40); // 1년 이상 2년 미만
      expect(getShortTermHeavyTaxRate(2.5)).toBe(null); // 2년 이상
    });
  });

  describe('getMultipleHouseSurcharge', () => {
    test('should return surcharge for multiple houses in adjustment area', () => {
      expect(getMultipleHouseSurcharge(1, true)).toBe(0); // 1주택
      expect(getMultipleHouseSurcharge(2, true)).toBe(20); // 2주택
      expect(getMultipleHouseSurcharge(3, true)).toBe(30); // 3주택 이상
      expect(getMultipleHouseSurcharge(2, false)).toBe(0); // 비조정대상지역
    });
  });

  describe('getFinalTaxRate', () => {
    test('should prioritize short-term heavy tax', () => {
      expect(getFinalTaxRate(50_000_000, 0.5, 1, false)).toBe(50); // 단기보유 중과세
      expect(getFinalTaxRate(50_000_000, 1.5, 1, false)).toBe(40); // 단기보유 중과세
    });

    test('should apply multiple house surcharge', () => {
      expect(getFinalTaxRate(60_000_000, 5, 2, true)).toBe(44); // 24% + 20%
      expect(getFinalTaxRate(60_000_000, 5, 3, true)).toBe(54); // 24% + 30%
    });

    test('should cap at 70%', () => {
      expect(getFinalTaxRate(2_000_000_000, 5, 3, true)).toBe(70); // 45% + 30% -> 70% cap
    });
  });

  describe('calculateHighValueHouseTaxableGains', () => {
    test('should calculate taxable gains for high-value house', () => {
      expect(calculateHighValueHouseTaxableGains(1_000_000_000, 1_000_000_000)).toBe(0); // 12억 이하
      expect(calculateHighValueHouseTaxableGains(1_000_000_000, 1_500_000_000)).toBeCloseTo(200_000_000, 0); // 일부 과세
      expect(calculateHighValueHouseTaxableGains(1_000_000_000, 2_400_000_000)).toBe(500_000_000); // 50% 과세
    });
  });
});
