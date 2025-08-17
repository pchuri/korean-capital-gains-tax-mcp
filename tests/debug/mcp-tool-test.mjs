import { calculateCapitalGainsTax } from '../../dist/tools/calculate-tax.js';

console.log('\n🔍 === MCP 도구 직접 테스트 ===');

const params = {
  property: {
    type: 'apartment',
    acquisitionPrice: 800_000_000,
    acquisitionDate: '2017-01-01',
    location: {
      city: '서울특별시',
      district: '강남구',
      isAdjustmentTargetArea: true,
    },
    area: { totalArea: 84, exclusiveArea: 59 },
  },
  transaction: {
    transferPrice: 1_500_000_000,
    transferDate: '2024-01-01',
    necessaryExpenses: {
      brokerageFee: 0,
      improvementCosts: 0,
      capitalExpenditures: 0,
      acquisitionTax: 0,
      other: 0,
    },
  },
  owner: {
    householdType: '1household1house',
    residencePeriod: {
      start: '2017-01-01',
      end: '2024-01-01',
    },
  },
  options: {
    includeDetails: true,
    calculationDate: '2024-01-01',
  },
};

try {
  const result = await calculateCapitalGainsTax(params);
  
  console.log('\n📊 MCP 도구 결과:');
  console.log('JSON 형태:', JSON.stringify(result, null, 2));
  
  console.log('\n🎯 적용된감면 확인:');
  console.log('감면 개수:', result.details.적용된감면.length);
  
  if (result.details.적용된감면.length > 0) {
    result.details.적용된감면.forEach((exemption, index) => {
      console.log(`${index + 1}. ${exemption.유형}: ${exemption.금액} (${exemption.근거})`);
    });
  } else {
    console.log('❌ 감면 없음');
  }
  
} catch (error) {
  console.error('❌ 오류:', error);
}

console.log('\n=== MCP 도구 테스트 종료 ===');
