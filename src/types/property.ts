/**
 * Property-related type definitions for Korean capital gains tax calculations
 */

export type PropertyType = 'apartment' | 'house' | 'land' | 'commercial';

export interface PropertyLocation {
  /** 시/도 (e.g., "서울특별시", "경기도") */
  city: string;
  /** 구/군 (e.g., "강남구", "수원시") */
  district: string;
  /** 조정대상지역 여부 */
  isAdjustmentTargetArea: boolean;
}

export interface PropertyArea {
  /** 전체 면적 (㎡) */
  totalArea: number;
  /** 전용면적 (㎡) */
  exclusiveArea: number;
}

export interface PropertyInfo {
  /** 부동산 유형 */
  type: PropertyType;
  /** 취득가액 (원) */
  acquisitionPrice: number;
  /** 취득일자 (ISO 8601 format: YYYY-MM-DD) */
  acquisitionDate: string;
  /** 소재지 정보 */
  location: PropertyLocation;
  /** 면적 정보 */
  area: PropertyArea;
}

export interface NecessaryExpenses {
  /** 중개수수료 (원) */
  brokerageFee?: number;
  /** 개량비 (원) */
  improvementCosts?: number;
  /** 자본적지출액 (원) */
  capitalExpenditures?: number;
  /** 취득세 등 취득 관련 비용 (원) */
  acquisitionTax?: number;
  /** 기타 필요경비 (원) */
  other?: number;
}

export interface TransactionInfo {
  /** 양도가액 (원) */
  transferPrice: number;
  /** 양도일자 (ISO 8601 format: YYYY-MM-DD) */
  transferDate: string;
  /** 필요경비 */
  necessaryExpenses: NecessaryExpenses;
}

export type HouseholdType = '1household1house' | 'multiple' | 'temporary2house';

export interface ResidencePeriod {
  /** 거주 시작일 (ISO 8601 format: YYYY-MM-DD) */
  start: string;
  /** 거주 종료일 (ISO 8601 format: YYYY-MM-DD) */
  end: string;
}

export interface OwnerInfo {
  /** 세대 구성 유형 */
  householdType: HouseholdType;
  /** 거주기간 (1세대 1주택의 경우) */
  residencePeriod?: ResidencePeriod;
  /** 장기임대주택 여부 */
  isLongTermRental?: boolean;
  /** 임대기간 (년) */
  rentalPeriod?: number;
}

export interface CalculationOptions {
  /** 계산 기준일 (기본값: 양도일) */
  calculationDate?: string;
  /** 상세 계산 과정 포함 여부 */
  includeDetails?: boolean;
  /** 적용할 세법 버전 (기본값: 최신) */
  taxLawVersion?: string;
}
