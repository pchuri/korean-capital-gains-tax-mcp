/**
 * Tax rates calculation utilities
 */

import { BASIC_TAX_RATES, LONG_TERM_DEDUCTION_RATES } from './constants.js';

/**
 * 과세표준에 따른 세율 계산 (누진세)
 */
export function calculateProgressiveTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of BASIC_TAX_RATES) {
    const bracketMin = bracket.minAmount;
    const bracketMax = bracket.maxAmount ?? Infinity;
    const bracketSize = Math.min(remainingIncome, bracketMax - bracketMin);

    if (bracketSize > 0) {
      tax += bracketSize * (bracket.rate / 100);
      remainingIncome -= bracketSize;
    }

    if (remainingIncome <= 0) break;
  }

  return tax;
}

/**
 * 과세표준에 해당하는 한계세율 반환
 */
export function getMarginalTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  for (const bracket of BASIC_TAX_RATES) {
    const bracketMax = bracket.maxAmount ?? Infinity;
    if (taxableIncome <= bracketMax) {
      return bracket.rate;
    }
  }

  // 설정 검증: 세율표가 비어있다면 구성 오류로 간주
  if (BASIC_TAX_RATES.length === 0) {
    throw new Error('BASIC_TAX_RATES misconfigured: empty');
  }

  // 최고 구간
  const last = BASIC_TAX_RATES[BASIC_TAX_RATES.length - 1];
  if (!last) {
    // 타입 안전을 위해 이중 방어 (실제로 도달하지 않음)
    throw new Error('BASIC_TAX_RATES missing highest bracket');
  }
  return last.rate;
}

/**
 * 장기보유특별공제율 계산
 */
export function getLongTermDeductionRate(
  holdingYears: number,
  isOneHouseWithResidence: boolean = false
): number {
  if (holdingYears < 3) return 0;

  for (const rate of LONG_TERM_DEDUCTION_RATES) {
    const maxYears = rate.maxYears ?? Infinity;
    if (holdingYears >= rate.minYears && holdingYears < maxYears) {
      return isOneHouseWithResidence && rate.residenceRate
        ? rate.residenceRate
        : rate.generalRate;
    }
  }

  // 11년 이상인 경우 최고 구간 적용
  const highestRate =
    LONG_TERM_DEDUCTION_RATES[LONG_TERM_DEDUCTION_RATES.length - 1];
  if (!highestRate) return 0;
  return isOneHouseWithResidence && highestRate.residenceRate
    ? highestRate.residenceRate
    : highestRate.generalRate;
}

/**
 * 단기보유 중과세율 계산
 */
export function getShortTermHeavyTaxRate(holdingYears: number): number | null {
  if (holdingYears < 1) {
    return 50; // 1년 미만
  } else if (holdingYears < 2) {
    return 40; // 1년 이상 2년 미만
  }
  return null; // 중과세 해당 없음
}

/**
 * 다주택자 중과세율 가산 계산
 */
export function getMultipleHouseSurcharge(
  houseCount: number,
  isAdjustmentTargetArea: boolean
): number {
  if (!isAdjustmentTargetArea || houseCount <= 1) {
    return 0;
  }

  if (houseCount === 2) {
    return 20; // 2주택
  } else {
    return 30; // 3주택 이상
  }
}

/**
 * 최종 적용 세율 계산 (중과세 포함)
 */
export function getFinalTaxRate(
  taxableIncome: number,
  holdingYears: number,
  houseCount: number = 1,
  isAdjustmentTargetArea: boolean = false
): number {
  // 단기보유 중과세 확인
  const shortTermRate = getShortTermHeavyTaxRate(holdingYears);
  if (shortTermRate) {
    return shortTermRate;
  }

  // 기본 세율
  const basicRate = getMarginalTaxRate(taxableIncome);

  // 다주택자 중과세 가산
  const surcharge = getMultipleHouseSurcharge(
    houseCount,
    isAdjustmentTargetArea
  );

  return Math.min(basicRate + surcharge, 70); // 최대 70%로 제한
}

/**
 * 세액 계산 (정액세율 적용)
 */
export function calculateFlatTax(
  taxableIncome: number,
  taxRate: number
): number {
  return Math.floor(taxableIncome * (taxRate / 100));
}

/**
 * 1세대 1주택 고가주택 과세대상 계산
 */
export function calculateHighValueHouseTaxableGains(
  totalGains: number,
  transferPrice: number,
  exemptionLimit: number = 1_200_000_000
): number {
  if (transferPrice <= exemptionLimit) {
    return 0; // 전액 비과세
  }

  // 과세대상 = 전체 양도차익 × (양도가액 - 12억) / 양도가액
  const taxableRatio = (transferPrice - exemptionLimit) / transferPrice;
  return Math.floor(totalGains * taxableRatio);
}
