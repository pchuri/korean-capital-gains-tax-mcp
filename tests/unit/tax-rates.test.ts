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
    test('should return surcharge for multiple houses in adjustment area after exemption period', () => {
      expect(getMultipleHouseSurcharge(1, true, '2026-06-01')).toBe(0); // 1주택
      expect(getMultipleHouseSurcharge(2, true, '2026-06-01')).toBe(20); // 2주택
      expect(getMultipleHouseSurcharge(3, true, '2026-06-01')).toBe(30); // 3주택 이상
      expect(getMultipleHouseSurcharge(2, false, '2026-06-01')).toBe(0); // 비조정대상지역
    });

    test('should return 0 surcharge during exemption period (2022-05-10 ~ 2026-05-09)', () => {
      expect(getMultipleHouseSurcharge(2, true, '2023-01-01')).toBe(0);
      expect(getMultipleHouseSurcharge(3, true, '2025-12-01')).toBe(0);
      expect(getMultipleHouseSurcharge(3, true, '2026-05-09')).toBe(0); // 마지막 날
    });

    test('should apply surcharge after exemption period ends', () => {
      expect(getMultipleHouseSurcharge(2, true, '2026-05-10')).toBe(20);
      expect(getMultipleHouseSurcharge(3, true, '2026-05-10')).toBe(30);
    });

    test('should apply surcharge without transferDate (backward compatibility)', () => {
      expect(getMultipleHouseSurcharge(2, true)).toBe(20);
      expect(getMultipleHouseSurcharge(3, true)).toBe(30);
    });
  });

  describe('getFinalTaxRate', () => {
    test('should prioritize short-term heavy tax', () => {
      expect(getFinalTaxRate(50_000_000, 0.5, 1, false)).toBe(50); // 단기보유 중과세
      expect(getFinalTaxRate(50_000_000, 1.5, 1, false)).toBe(40); // 단기보유 중과세
    });

    test('should apply multiple house surcharge after exemption period', () => {
      expect(getFinalTaxRate(60_000_000, 5, 2, true, '2026-06-01')).toBe(44); // 24% + 20%
      expect(getFinalTaxRate(60_000_000, 5, 3, true, '2026-06-01')).toBe(54); // 24% + 30%
    });

    test('should not apply surcharge during exemption period', () => {
      expect(getFinalTaxRate(60_000_000, 5, 2, true, '2025-01-01')).toBe(24); // 배제기간 중 중과 없음
      expect(getFinalTaxRate(60_000_000, 5, 3, true, '2025-01-01')).toBe(24);
    });

    test('should cap at 70%', () => {
      expect(getFinalTaxRate(2_000_000_000, 5, 3, true, '2026-06-01')).toBe(70); // 45% + 30% -> 70% cap
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
