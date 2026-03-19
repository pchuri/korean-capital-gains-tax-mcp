import { BaseCalculator } from '../../src/calculators/base-calculator';
import type { PropertyInfo, TransactionInfo, OwnerInfo } from '../../src/types';

describe('1세대 1주택 디버깅 테스트', () => {
  let calculator: BaseCalculator;

  beforeEach(() => {
    calculator = new BaseCalculator();
  });

  test('실제 사용자 케이스 - 서울 강남구 15억원', () => {
    console.log('\n🔍 === 1세대 1주택 디버깅 테스트 시작 ===');
    
    const property: PropertyInfo = {
      type: 'apartment',
      acquisitionPrice: 800_000_000,
      acquisitionDate: '2017-01-01',
      location: {
        city: '서울특별시',
        district: '강남구',
        isAdjustmentTargetArea: true,
      },
      area: { totalArea: 84, exclusiveArea: 59 },
    };

    const transaction: TransactionInfo = {
      transferPrice: 1_500_000_000,
      transferDate: '2024-01-01',
      necessaryExpenses: {
        brokerageFee: 0,
        improvementCosts: 0,
        capitalExpenditures: 0,
        acquisitionTax: 0,
        other: 0,
      },
    };

    const owner: OwnerInfo = {
      householdType: '1household1house',
      residencePeriod: {
        start: '2017-01-01',
        end: '2024-01-01',
      },
    };

    console.log('📋 입력 데이터:');
    console.log('- 취득일:', property.acquisitionDate);
    console.log('- 양도일:', transaction.transferDate);
    console.log('- 취득가액:', property.acquisitionPrice.toLocaleString());
    console.log('- 양도가액:', transaction.transferPrice.toLocaleString());
    console.log('- 거주기간:', owner.residencePeriod?.start, '~', owner.residencePeriod?.end);
    console.log('- 조정대상지역:', property.location.isAdjustmentTargetArea);

    const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

    console.log('\n📊 계산 결과:');
    console.log('- 성공 여부:', result.success);
    
    if (result.success && result.data) {
      console.log('- 양도차익:', result.data.capitalGains.toLocaleString());
      console.log('- 최종세액:', result.data.finalTax.toLocaleString());
      console.log('- 적용된 감면:', result.data.exemptions.length, '개');
      
      if (result.data.exemptions.length > 0) {
        result.data.exemptions.forEach((exemption, index) => {
          console.log(`  ${index + 1}. ${exemption.type}: ${exemption.amount.toLocaleString()}원 (${exemption.reason})`);
        });
      } else {
        console.log('  ❌ 감면 없음');
      }
    } else {
      console.log('- 오류:', result.error);
    }

    console.log('\n=== 디버깅 테스트 종료 ===\n');

    expect(result.success).toBe(true);
    
    // 1세대 1주택 비례과세가 적용되어야 함
    if (result.success && result.data) {
      expect(result.data.exemptions.length).toBeGreaterThan(0);
      expect(result.data.exemptions[0]?.type).toBe('partial_exemption');
      expect(result.data.exemptions[0]?.reason).toContain('비례과세');
    }
  });

  test('12억원 이하 완전 비과세 케이스', () => {
    console.log('\n🔍 === 완전 비과세 테스트 시작 ===');
    
    const property: PropertyInfo = {
      type: 'apartment',
      acquisitionPrice: 400_000_000,
      acquisitionDate: '2020-01-01',
      location: {
        city: '서울특별시',
        district: '강남구',
        isAdjustmentTargetArea: true,
      },
      area: { totalArea: 84, exclusiveArea: 59 },
    };

    const transaction: TransactionInfo = {
      transferPrice: 800_000_000, // 8억원 (12억원 이하)
      transferDate: '2024-01-01',
      necessaryExpenses: {
        brokerageFee: 0,
        improvementCosts: 0,
        capitalExpenditures: 0,
        acquisitionTax: 0,
        other: 0,
      },
    };

    const owner: OwnerInfo = {
      householdType: '1household1house',
      residencePeriod: {
        start: '2020-01-01',
        end: '2024-01-01',
      },
    };

    console.log('📋 입력 데이터:');
    console.log('- 양도가액:', transaction.transferPrice.toLocaleString(), '(12억원 이하)');

    const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

    console.log('\n📊 계산 결과:');
    if (result.success && result.data) {
      console.log('- 최종세액:', result.data.finalTax.toLocaleString());
      console.log('- 적용된 감면:', result.data.exemptions.length, '개');
    }

    console.log('\n=== 완전 비과세 테스트 종료 ===\n');

    expect(result.success).toBe(true);
    
    // 완전 비과세가 적용되어야 함
    if (result.success && result.data) {
      expect(result.data.finalTax).toBe(0);
      expect(result.data.exemptions.length).toBeGreaterThan(0);
      expect(result.data.exemptions[0]?.type).toBe('full_exemption');
    }
  });

  test('조건 미충족 케이스 - 다주택자', () => {
    console.log('\n🔍 === 다주택자 테스트 시작 ===');
    
    const property: PropertyInfo = {
      type: 'apartment',
      acquisitionPrice: 400_000_000,
      acquisitionDate: '2020-01-01',
      location: {
        city: '서울특별시',
        district: '강남구',
        isAdjustmentTargetArea: true,
      },
      area: { totalArea: 84, exclusiveArea: 59 },
    };

    const transaction: TransactionInfo = {
      transferPrice: 800_000_000,
      transferDate: '2024-01-01',
      necessaryExpenses: {
        brokerageFee: 0,
        improvementCosts: 0,
        capitalExpenditures: 0,
        acquisitionTax: 0,
        other: 0,
      },
    };

    const owner: OwnerInfo = {
      householdType: '3plus_houses', // 다주택자 (3주택 이상)
    };

    console.log('📋 입력 데이터:');
    console.log('- 주택 보유 형태:', owner.householdType);

    const result = calculator.calculateCapitalGainsTax(property, transaction, owner);

    console.log('\n📊 계산 결과:');
    if (result.success && result.data) {
      console.log('- 최종세액:', result.data.finalTax.toLocaleString());
      console.log('- 적용된 감면:', result.data.exemptions.length, '개');
    }

    console.log('\n=== 다주택자 테스트 종료 ===\n');

    expect(result.success).toBe(true);
    
    // 비과세가 적용되지 않아야 함
    if (result.success && result.data) {
      expect(result.data.finalTax).toBeGreaterThan(0);
      expect(result.data.exemptions.length).toBe(0);
    }
  });
});
