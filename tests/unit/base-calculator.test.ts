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
      householdType: 'multiple',
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
});
