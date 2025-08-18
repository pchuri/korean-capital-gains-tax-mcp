/**
 * Tax calculation explanation tool
 */

import { PropertyInfo, TransactionInfo, OwnerInfo } from '../types/index.js';
import {
  calculateHoldingPeriodYears,
  calculateResidencePeriodYears,
} from '../utils/date-utils.js';
import {
  getLongTermDeductionRate,
  getFinalTaxRate,
} from '../utils/tax-rates.js';
import { ONE_HOUSE_EXEMPTION_LIMIT } from '../utils/constants.js';

export interface ExplainCalculationParams {
  /** 부동산 정보 */
  property: PropertyInfo;
  /** 거래 정보 */
  transaction: TransactionInfo;
  /** 소유자 정보 */
  owner: OwnerInfo;
}

/**
 * 양도소득세 계산 과정 상세 설명
 */
export async function explainCalculation(params: ExplainCalculationParams) {
  const { property, transaction, owner } = params;

  // 기본 계산 정보
  const holdingYears = calculateHoldingPeriodYears(
    property.acquisitionDate,
    transaction.transferDate
  );

  const residenceYears = owner.residencePeriod
    ? calculateResidencePeriodYears(
        owner.residencePeriod.start,
        owner.residencePeriod.end
      )
    : 0;

  const hasResidenceRequirement =
    owner.householdType === '1household1house' && residenceYears >= 2;
  const longTermDeductionRate = getLongTermDeductionRate(
    holdingYears,
    hasResidenceRequirement
  );

  const houseCount =
    owner.householdType === '1household1house'
      ? 1
      : owner.householdType === 'temporary2house'
        ? 2
        : 3;

  const applicableTaxRate = getFinalTaxRate(
    1000000, // 임시값
    holdingYears,
    houseCount,
    property.location.isAdjustmentTargetArea
  );

  return {
    계산개요: {
      양도소득세_계산_공식: [
        '1단계: 양도차익 = 양도가액 - 취득가액 - 필요경비',
        '2단계: 양도소득금액 = 양도차익 - 장기보유특별공제',
        '3단계: 양도소득과세표준 = 양도소득금액 - 기본공제(250만원)',
        '4단계: 산출세액 = 과세표준 × 세율',
      ],
    },

    기본정보: {
      부동산유형:
        property.type === 'apartment'
          ? '아파트'
          : property.type === 'house'
            ? '주택'
            : property.type === 'land'
              ? '토지'
              : '상업용부동산',
      소재지: `${property.location.city} ${property.location.district}`,
      조정대상지역: property.location.isAdjustmentTargetArea ? '예' : '아니오',
      보유기간: `${holdingYears}년`,
      세대구성:
        owner.householdType === '1household1house'
          ? '1세대 1주택'
          : owner.householdType === 'temporary2house'
            ? '일시적 2주택'
            : '다주택',
      거주기간: owner.residencePeriod
        ? `${residenceYears.toFixed(1)}년`
        : '해당없음',
    },

    적용법규: {
      장기보유특별공제: {
        보유기간: `${holdingYears}년`,
        적용공제율: `${longTermDeductionRate}%`,
        거주가산: hasResidenceRequirement ? '적용' : '미적용',
        설명:
          holdingYears < 3
            ? '보유기간 3년 미만으로 장기보유특별공제 해당없음'
            : `보유기간 ${holdingYears}년으로 ${longTermDeductionRate}% 공제 적용`,
      },

      세율적용: {
        기본정보:
          applicableTaxRate >= 40
            ? '중과세율 적용 (단기보유 또는 다주택자)'
            : '일반세율 적용 (누진세)',
        적용세율: `${applicableTaxRate}%`,
        중과사유:
          applicableTaxRate >= 40
            ? holdingYears < 2
              ? '단기보유 중과세'
              : '다주택자 중과세'
            : '해당없음',
      },

      비과세감면: {
        '1세대_1주택_비과세':
          owner.householdType === '1household1house'
            ? {
                적용여부: '검토대상',
                요건: [
                  `보유기간 2년 이상: ${holdingYears >= 2 ? '충족' : '미충족'}`,
                  property.location.isAdjustmentTargetArea
                    ? `거주기간 2년 이상: ${residenceYears >= 2 ? '충족' : '미충족'}`
                    : '거주요건: 해당없음 (비조정대상지역)',
                ],
                비과세한도: `${ONE_HOUSE_EXEMPTION_LIMIT.toLocaleString()}원`,
              }
            : '해당없음 (다주택자)',
      },
    },

    주의사항: [
      '본 설명은 일반적인 계산 과정을 안내한 것으로, 실제 세무 신고 시에는 세무전문가의 상담을 받으시기 바랍니다.',
      '특수한 상황(상속, 증여, 수용 등)에는 별도의 특례가 적용될 수 있습니다.',
      '세법 개정에 따라 계산 방법이 변경될 수 있으므로 최신 법령을 확인하시기 바랍니다.',
    ],

    관련법령: {
      소득세법: ['§88~§108 (양도소득세)', '§168의2 (1세대1주택 비과세)'],
      조세특례제한법: ['§99 (신축주택 감면)', '§99의8 (장기임대주택 특례)'],
      시행령_시행규칙: ['소득세법 시행령', '양도소득세 관련 고시'],
    },
  };
}
