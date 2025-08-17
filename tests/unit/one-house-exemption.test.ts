import { BaseCalculator } from '../../src/calculators/base-calculator';
import type { PropertyInfo, TransactionInfo, OwnerInfo } from '../../src/types';

describe('1세대 1주택 비과세 테스트', () => {
  let calculator: BaseCalculator;

  beforeEach(() => {
    calculator = new BaseCalculator();
  });

  describe('완전 비과세 (12억원 이하)', () => {
    test('양도가액 5억원 - 완전 비과세', () => {
      const property: PropertyInfo = {
        type: 'apartment',
        acquisitionPrice: 300_000_000,
        acquisitionDate: '2020-01-01',
        location: {
          city: '서울',
          district: '강남구',
          isAdjustmentTargetArea: false,
        },
        area: { totalArea: 84, exclusiveArea: 84 },
      };

      const transaction: TransactionInfo = {
        transferPrice: 500_000_000, // 5억원
        transferDate: '2024-01-01',
        necessaryExpenses: { brokerageFee: 5_000_000 },
      };

      const owner: OwnerInfo = {
        householdType: '1household1house',
        residencePeriod: { start: '2020-01-01', end: '2024-01-01' },
      };

      const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.finalTax).toBe(0);
        expect(result.data.exemptions).toHaveLength(1);
        expect(result.data.exemptions[0]?.type).toBe('full_exemption');
        expect(result.data.exemptions[0]?.reason).toContain('완전 비과세');
      }
    });

    test('양도가액 12억원 정확히 - 완전 비과세', () => {
      const property: PropertyInfo = {
        type: 'apartment',
        acquisitionPrice: 800_000_000,
        acquisitionDate: '2020-01-01',
        location: {
          city: '서울',
          district: '강남구',
          isAdjustmentTargetArea: false,
        },
        area: { totalArea: 84, exclusiveArea: 84 },
      };

      const transaction: TransactionInfo = {
        transferPrice: 1_200_000_000, // 12억원 정확히
        transferDate: '2024-01-01',
        necessaryExpenses: { brokerageFee: 5_000_000 },
      };

      const owner: OwnerInfo = {
        householdType: '1household1house',
        residencePeriod: { start: '2020-01-01', end: '2024-01-01' },
      };

      const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.finalTax).toBe(0);
        expect(result.data.exemptions[0]?.type).toBe('full_exemption');
      }
    });
  });

  describe('비례과세 (12억원 초과)', () => {
    test('양도가액 15억원 - 비례과세', () => {
      const property: PropertyInfo = {
        type: 'apartment',
        acquisitionPrice: 800_000_000,
        acquisitionDate: '2020-01-01',
        location: {
          city: '서울',
          district: '강남구',
          isAdjustmentTargetArea: false,
        },
        area: { totalArea: 84, exclusiveArea: 84 },
      };

      const transaction: TransactionInfo = {
        transferPrice: 1_500_000_000, // 15억원
        transferDate: '2024-01-01',
        necessaryExpenses: { brokerageFee: 5_000_000 },
      };

      const owner: OwnerInfo = {
        householdType: '1household1house',
        residencePeriod: { start: '2020-01-01', end: '2024-01-01' },
      };

      const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        // 비례과세: 양도차익 × (양도가액 - 12억) / 양도가액
        // 양도차익 = 15억 - 8억 - 500만 = 6억 9500만
        // 과세대상 = 6억 9500만 × (15억 - 12억) / 15억 = 1억 3900만
        expect(result.data.finalTax).toBeGreaterThan(0);
        expect(result.data.exemptions[0]?.type).toBe('partial_exemption');
        expect(result.data.exemptions[0]?.reason).toContain('비례과세');
      }
    });
  });

  describe('비과세 조건 미충족', () => {
    test('다주택자 - 비과세 적용 안됨', () => {
      const property: PropertyInfo = {
        type: 'apartment',
        acquisitionPrice: 300_000_000,
        acquisitionDate: '2020-01-01',
        location: {
          city: '서울',
          district: '강남구',
          isAdjustmentTargetArea: false,
        },
        area: { totalArea: 84, exclusiveArea: 84 },
      };

      const transaction: TransactionInfo = {
        transferPrice: 500_000_000,
        transferDate: '2024-01-01',
        necessaryExpenses: { brokerageFee: 5_000_000 },
      };

      const owner: OwnerInfo = {
        householdType: 'multiple', // 다주택자
      };

      const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.finalTax).toBeGreaterThan(0);
        expect(result.data.exemptions).toHaveLength(0);
      }
    });

    test('거주기간 부족 - 비과세 적용 안됨', () => {
      const property: PropertyInfo = {
        type: 'apartment',
        acquisitionPrice: 300_000_000,
        acquisitionDate: '2023-01-01',
        location: {
          city: '서울',
          district: '강남구',
          isAdjustmentTargetArea: false,
        },
        area: { totalArea: 84, exclusiveArea: 84 },
      };

      const transaction: TransactionInfo = {
        transferPrice: 500_000_000,
        transferDate: '2024-01-01',
        necessaryExpenses: { brokerageFee: 5_000_000 },
      };

      const owner: OwnerInfo = {
        householdType: '1household1house',
        residencePeriod: { start: '2023-06-01', end: '2024-01-01' }, // 7개월만 거주
      };

      const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.finalTax).toBeGreaterThan(0);
        expect(result.data.exemptions).toHaveLength(0);
      }
    });
  });
});
