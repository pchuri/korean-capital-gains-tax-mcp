/**
 * Tax calculation related type definitions
 */

export interface TaxRateBracket {
  /** 과세표준 하한 (원) */
  minAmount: number;
  /** 과세표준 상한 (원, undefined면 무제한) */
  maxAmount?: number;
  /** 세율 (%) */
  rate: number;
}

export interface LongTermDeductionRate {
  /** 보유기간 하한 (년) */
  minYears: number;
  /** 보유기간 상한 (년, undefined면 무제한) */
  maxYears?: number;
  /** 일반 공제율 (%) */
  generalRate: number;
  /** 1세대 1주택 거주 시 공제율 (%) */
  residenceRate?: number;
}

export interface CalculationStep {
  /** 단계 이름 */
  stepName: string;
  /** 계산 공식 */
  formula: string;
  /** 계산 값 (원) */
  amount: number;
  /** 설명 */
  description: string;
}

export interface TaxExemption {
  /** 비과세/감면 유형 */
  type: 'full_exemption' | 'partial_exemption' | 'reduction';
  /** 적용 금액 (원) */
  amount: number;
  /** 적용 근거 */
  reason: string;
}

export interface CapitalGainsCalculation {
  /** 양도차익 (원) */
  capitalGains: number;
  /** 장기보유특별공제액 (원) */
  longTermDeduction: number;
  /** 양도소득금액 (원) */
  taxableGains: number;
  /** 기본공제액 (원) */
  basicDeduction: number;
  /** 양도소득과세표준 (원) */
  taxableIncome: number;
  /** 적용 세율 (%) */
  applicableTaxRate: number;
  /** 산출세액 (원) */
  calculatedTax: number;
  /** 최종 납부세액 (원) */
  finalTax: number;
  /** 적용된 비과세/감면 */
  exemptions: TaxExemption[];
  /** 계산 단계별 상세 */
  calculationSteps: CalculationStep[];
}

export interface ValidationError {
  /** 필드명 */
  field: string;
  /** 오류 메시지 */
  message: string;
  /** 오류 코드 */
  code: string;
}

export interface CalculationResult<T> {
  /** 성공 여부 */
  success: boolean;
  /** 성공 시 데이터 */
  data?: T;
  /** 실패 시 오류 정보 */
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  /** 유효성 검사 오류 */
  validationErrors?: ValidationError[];
}

export interface TaxCalculationParams {
  /** 부동산 정보 */
  property: import('./property').PropertyInfo;
  /** 거래 정보 */
  transaction: import('./property').TransactionInfo;
  /** 소유자 정보 */
  owner: import('./property').OwnerInfo;
  /** 계산 옵션 */
  options?: import('./property').CalculationOptions;
}

/**
 * Tax calculation error types
 */
export class TaxCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TaxCalculationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
