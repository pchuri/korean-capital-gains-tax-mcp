/**
 * Korean tax law constants
 */

import { TaxRateBracket, LongTermDeductionRate } from '../types/index.js';

/** 기본공제액 (원) */
export const BASIC_DEDUCTION = 2_500_000;

/** 1세대 1주택 비과세 한도 (원) */
export const ONE_HOUSE_EXEMPTION_LIMIT = 1_200_000_000;

/** 필요경비 인정비율 (기준시가 기준) */
export const NECESSARY_EXPENSE_RATE = 0.03;

/** 양도소득세 기본세율표 */
export const BASIC_TAX_RATES: TaxRateBracket[] = [
  { minAmount: 0, maxAmount: 14_000_000, rate: 6 },
  { minAmount: 14_000_000, maxAmount: 50_000_000, rate: 15 },
  { minAmount: 50_000_000, maxAmount: 88_000_000, rate: 24 },
  { minAmount: 88_000_000, maxAmount: 150_000_000, rate: 35 },
  { minAmount: 150_000_000, maxAmount: 300_000_000, rate: 38 },
  { minAmount: 300_000_000, maxAmount: 500_000_000, rate: 40 },
  { minAmount: 500_000_000, maxAmount: 1_000_000_000, rate: 42 },
  { minAmount: 1_000_000_000, rate: 45 },
];

/** 단기보유 중과세율 */
export const SHORT_TERM_TAX_RATES = {
  /** 1년 미만 보유 */
  UNDER_ONE_YEAR: 50,
  /** 1년 이상 2년 미만 보유 */
  ONE_TO_TWO_YEARS: 40,
} as const;

/** 다주택자 중과세율 가산 */
export const MULTIPLE_HOUSE_SURCHARGE = {
  /** 조정대상지역 내 2주택 */
  TWO_HOUSES: 20,
  /** 조정대상지역 내 3주택 이상 */
  THREE_OR_MORE_HOUSES: 30,
} as const;

/** 장기보유특별공제율표 */
export const LONG_TERM_DEDUCTION_RATES: LongTermDeductionRate[] = [
  { minYears: 3, maxYears: 4, generalRate: 10, residenceRate: 22 },
  { minYears: 4, maxYears: 5, generalRate: 12, residenceRate: 24 },
  { minYears: 5, maxYears: 6, generalRate: 16, residenceRate: 28 },
  { minYears: 6, maxYears: 7, generalRate: 20, residenceRate: 32 },
  { minYears: 7, maxYears: 8, generalRate: 24, residenceRate: 36 },
  { minYears: 8, maxYears: 9, generalRate: 28, residenceRate: 40 },
  { minYears: 9, maxYears: 10, generalRate: 32, residenceRate: 44 },
  { minYears: 10, maxYears: 11, generalRate: 36, residenceRate: 48 },
  { minYears: 11, generalRate: 40, residenceRate: 52 },
];

/** 조정대상지역 관련 상수 */
export const ADJUSTMENT_TARGET_AREA = {
  /** 1세대 1주택 거주요건 적용 기준일 */
  RESIDENCE_REQUIREMENT_DATE: '2017-08-03',
  /** 다주택자 중과 한시적 배제 시작일 */
  SURCHARGE_EXEMPTION_START: '2022-05-10',
  /** 다주택자 중과 한시적 배제 종료일 */
  SURCHARGE_EXEMPTION_END: '2025-05-09',
} as const;

/** 임대주택 특례 관련 상수 */
export const RENTAL_HOUSE_SPECIAL = {
  /** 장기임대주택 8년 이상 공제율 */
  LONG_TERM_8_YEARS: 50,
  /** 장기임대주택 10년 이상 공제율 */
  LONG_TERM_10_YEARS: 70,
  /** 민간임대주택 추가공제율 (연간) */
  PRIVATE_RENTAL_ANNUAL: 2,
} as const;

/** 보유기간 계산 관련 상수 */
export const HOLDING_PERIOD = {
  /** 최소 보유기간 (1세대 1주택 비과세) */
  MIN_EXEMPTION_YEARS: 2,
  /** 장기보유특별공제 최소 기간 */
  MIN_LONG_TERM_YEARS: 3,
  /** 단기보유 중과세 기준 */
  SHORT_TERM_THRESHOLD_YEARS: 2,
} as const;

/** 오류 코드 */
export const ERROR_CODES = {
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_PROPERTY_TYPE: 'INVALID_PROPERTY_TYPE',
  INVALID_HOUSEHOLD_TYPE: 'INVALID_HOUSEHOLD_TYPE',
  INVALID_HOLDING_PERIOD: 'INVALID_HOLDING_PERIOD',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
} as const;
