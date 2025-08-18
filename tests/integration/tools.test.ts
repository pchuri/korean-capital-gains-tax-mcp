import { calculateCapitalGainsTax } from '../../src/tools/calculate-tax';
import { validatePropertyInfo } from '../../src/tools/validate-property';
import { explainCalculation } from '../../src/tools/explain-calculation';
import { PropertyInfo, TransactionInfo, OwnerInfo } from '../../src/types';

describe('MCP Tools Integration', () => {
  const validProperty: PropertyInfo = {
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

  const validTransaction: TransactionInfo = {
    transferPrice: 1_500_000_000,
    transferDate: '2024-12-01',
    necessaryExpenses: {
      brokerageFee: 8_000_000,
      acquisitionTax: 10_000_000,
    },
  };

  const validOwner: OwnerInfo = {
    householdType: '1household1house',
    residencePeriod: {
      start: '2017-01-01',
      end: '2024-12-01',
    },
  };

  describe('calculateCapitalGainsTax integration', () => {
    test('should handle complete 1household1house calculation', async () => {
      const result = await calculateCapitalGainsTax({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });

      expect(result.summary).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.rawData).toBeDefined();
      
      expect(result.summary.최종세액).toMatch(/\d+원$/);
      expect(result.summary.양도차익).toMatch(/\d+원$/);

      const stepIds = result.details.계산단계.map((s) => s.id);
      // 핵심 단계 포함 여부 확인 (불변 ID로 검증)
      {
        const { STEP_IDS } = await import('../../src/utils/step-labels');

        expect(stepIds).toEqual(
          expect.arrayContaining([
            STEP_IDS.CAPITAL_GAINS,
            STEP_IDS.LONG_TERM_DEDUCTION,
            STEP_IDS.TAX_BASE,
            STEP_IDS.CALCULATED_TAX,
          ])
        );
        // 비과세 관련 단계(둘 중 하나)는 반드시 존재해야 함
        expect(
          stepIds.some(
            (id) =>
              id === STEP_IDS.ONE_HOUSE_PARTIAL_EXEMPTION ||
              id === STEP_IDS.ONE_HOUSE_FULL_EXEMPTION
          )
        ).toBe(true);
      }
    });

    test('should handle multiple house surcharge', async () => {
      const multipleHouseOwner: OwnerInfo = {
        householdType: 'multiple',
      };

      const result = await calculateCapitalGainsTax({
        property: validProperty,
        transaction: validTransaction,
        owner: multipleHouseOwner,
      });

      expect(result.summary.적용세율).toMatch(/[4-7]\d%/); // 중과세율 적용
    });

    test('should throw error for invalid data', async () => {
      const invalidProperty = { ...validProperty, acquisitionPrice: -1000 };

      await expect(
        calculateCapitalGainsTax({
          property: invalidProperty as PropertyInfo,
          transaction: validTransaction,
          owner: validOwner,
        })
      ).rejects.toThrow();
    });
  });

  describe('validatePropertyInfo integration', () => {
    test('should validate correct data', async () => {
      const result = await validatePropertyInfo({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });

      expect(result.유효성).toContain('✅');
      expect(result.검증결과).toBeDefined();
    });

    test('should detect validation errors', async () => {
      const invalidData = {
        property: { ...validProperty, type: 'invalid' as any },
        transaction: { ...validTransaction, transferPrice: -1000 },
        owner: { ...validOwner, householdType: 'invalid' as any },
      };

      const result = await validatePropertyInfo(invalidData);

      expect(result.유효성).toContain('❌');
      expect(result.오류목록).toBeDefined();
      expect(result.오류목록!.length).toBeGreaterThan(0);
    });
  });

  describe('explainCalculation integration', () => {
    test('should provide comprehensive explanation', async () => {
      const result = await explainCalculation({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });

      expect(result.계산개요).toBeDefined();
      expect(result.기본정보).toBeDefined();
      expect(result.적용법규).toBeDefined();
      expect(result.주의사항).toBeDefined();
      expect(result.관련법령).toBeDefined();

      expect(result.계산개요.양도소득세_계산_공식).toHaveLength(4);
      expect(result.기본정보.부동산유형).toBe('아파트');
      expect(result.기본정보.세대구성).toBe('1세대 1주택');
    });

    test('should handle different property types', async () => {
      const houseProperty = { ...validProperty, type: 'house' as const };

      const result = await explainCalculation({
        property: houseProperty,
        transaction: validTransaction,
        owner: validOwner,
      });

      expect(result.기본정보.부동산유형).toBe('주택');
    });
  });

  describe('End-to-end workflow', () => {
    test('should complete full calculation workflow', async () => {
      // 1. 데이터 검증
      const validation = await validatePropertyInfo({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });
      expect(validation.유효성).toContain('✅');

      // 2. 계산 설명
      const explanation = await explainCalculation({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });
      expect(explanation.적용법규.장기보유특별공제.적용공제율).toMatch(/\d+%/);

      // 3. 실제 계산
      const calculation = await calculateCapitalGainsTax({
        property: validProperty,
        transaction: validTransaction,
        owner: validOwner,
      });
      expect(calculation.summary.최종세액).toMatch(/\d+원$/);
    });
  });
});
