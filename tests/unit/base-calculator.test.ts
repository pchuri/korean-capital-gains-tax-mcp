import { BaseCalculator } from '../../src/calculators/base-calculator';
import { PropertyInfo, TransactionInfo, OwnerInfo } from '../../src/types';

describe('BaseCalculator', () => {
  let calculator: BaseCalculator;

  beforeEach(() => {
    calculator = new BaseCalculator();
  });

  const sampleProperty: PropertyInfo = {
    type: 'apartment',
    acquisitionPrice: 800_000_000,
    acquisitionDate: '2017-01-01',
    location: {
      city: '서울특별시',
      district: '강남구',
      isAdjustmentTargetArea: true,
    },
    area: {
      totalArea: 100,
      exclusiveArea: 80,
    },
  };

  const sampleTransaction: TransactionInfo = {
    transferPrice: 1_500_000_000,
    transferDate: '2024-12-01',
    necessaryExpenses: {
      brokerageFee: 8_000_000,
      acquisitionTax: 10_000_000,
    },
  };

  const sampleOwner: OwnerInfo = {
    householdType: '1household1house',
    residencePeriod: {
      start: '2017-01-01',
      end: '2024-12-01',
    },
  };

  test('should calculate capital gains tax for 1household1house', () => {
    const result = calculator.calculateCapitalGainsTax(
      sampleProperty,
      sampleTransaction,
      sampleOwner
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    if (result.data) {
      expect(result.data.capitalGains).toBeGreaterThan(0);
      expect(result.data.finalTax).toBeGreaterThanOrEqual(0);
      expect(result.data.calculationSteps.length).toBeGreaterThanOrEqual(5);
    }
  });

  test('should handle validation errors', () => {
    const invalidProperty = { ...sampleProperty, acquisitionPrice: -1000 };
    
    const result = calculator.calculateCapitalGainsTax(
      invalidProperty as PropertyInfo,
      sampleTransaction,
      sampleOwner
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should calculate multiple house surcharge', () => {
    const multipleHouseOwner: OwnerInfo = {
      householdType: '3plus_houses',
    };

    const result = calculator.calculateCapitalGainsTax(
      sampleProperty,
      sampleTransaction,
      multipleHouseOwner
    );

    expect(result.success).toBe(true);
    if (result.data) {
      expect(result.data.applicableTaxRate).toBeGreaterThan(45); // 중과세 적용
    }
  });

  test('should apply lower surcharge for 2-house owner in adjustment area', () => {
    const twoHouseOwner: OwnerInfo = {
      householdType: '2houses',
    };

    const adjustmentProperty: PropertyInfo = {
      ...sampleProperty,
      location: { ...sampleProperty.location, isAdjustmentTargetArea: true },
    };

    const result = calculator.calculateCapitalGainsTax(
      adjustmentProperty,
      sampleTransaction,
      twoHouseOwner
    );

    expect(result.success).toBe(true);
    if (result.data) {
      // 2주택 조정대상지역: 기본세율 + 20% 가산
      const threeHouseResult = calculator.calculateCapitalGainsTax(
        adjustmentProperty,
        sampleTransaction,
        { householdType: '3plus_houses' }
      );
      expect(threeHouseResult.success).toBe(true);
      // 2주택 세율 < 3주택 이상 세율
      expect(result.data.applicableTaxRate).toBeLessThan(threeHouseResult.data!.applicableTaxRate);
    }
  });

  test('should apply progressive tax for high-income non-heavy-tax case', () => {
    // taxableIncome이 45% 구간(10억 초과)에 해당하는 케이스
    // 버그 재현: 이전 코드는 applicableTaxRate >= 40이면 정액세율 적용
    const highValueProperty: PropertyInfo = {
      type: 'apartment',
      acquisitionPrice: 1_000_000_000,
      acquisitionDate: '2010-01-01',
      location: {
        city: '서울특별시',
        district: '서초구',
        isAdjustmentTargetArea: false, // 조정대상지역 아님 → 다주택 중과세 없음
      },
      area: { totalArea: 200, exclusiveArea: 165 },
    };

    const highValueTransaction: TransactionInfo = {
      transferPrice: 5_000_000_000,
      transferDate: '2024-01-01',
      necessaryExpenses: {},
    };

    const oneHouseOwner: OwnerInfo = {
      householdType: '1household1house',
      residencePeriod: { start: '2010-01-01', end: '2024-01-01' },
    };

    const result = calculator.calculateCapitalGainsTax(
      highValueProperty,
      highValueTransaction,
      oneHouseOwner
    );

    expect(result.success).toBe(true);
    if (result.data) {
      // taxableIncome ≈ 1,456,700,000 → marginalRate 45%
      // 정액세율(버그): floor(1,456,700,000 × 45%) = 655,515,000
      // 누진세율(정상): 589,575,000
      expect(result.data.applicableTaxRate).toBe(45);
      expect(result.data.calculatedTax).toBe(589_575_000);
    }
  });
});
