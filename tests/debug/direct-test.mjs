import { BaseCalculator } from '../../dist/calculators/base-calculator.js';

console.log('\n🔍 === 1세대 1주택 직접 테스트 시작 ===');

const calculator = new BaseCalculator();

const property = {
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

const transaction = {
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

const owner = {
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

console.log('\n💡 계산 시작...\n');

try {
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

    console.log('\n📋 계산 단계:');
    result.data.calculationSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.stepName}: ${step.amount.toLocaleString()}원`);
      console.log(`     공식: ${step.formula}`);
      console.log(`     설명: ${step.description}`);
    });
  } else {
    console.log('- 오류:', result.error);
  }
} catch (error) {
  console.error('❌ 실행 중 오류:', error);
}

console.log('\n=== 직접 테스트 종료 ===\n');
