/**
 * Input validation utilities
 */

import { PropertyInfo, TransactionInfo, OwnerInfo, CalculationOptions } from '../types/index.js';
import { ERROR_CODES } from './constants.js';
import { isValidDateFormat, isDateBefore } from './date-utils.js';

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * 부동산 정보 유효성 검사
 */
export function validatePropertyInfo(property: PropertyInfo): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  // 부동산 유형 검사
  const validTypes = ['apartment', 'house', 'land', 'commercial'];
  if (!validTypes.includes(property.type)) {
    errors.push({
      field: 'property.type',
      message: `유효하지 않은 부동산 유형입니다. 가능한 값: ${validTypes.join(', ')}`,
      code: ERROR_CODES.INVALID_PROPERTY_TYPE,
    });
  }

  // 취득가액 검사
  if (!property.acquisitionPrice || property.acquisitionPrice <= 0) {
    errors.push({
      field: 'property.acquisitionPrice',
      message: '취득가액은 0보다 큰 값이어야 합니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  // 취득일자 검사
  if (!property.acquisitionDate) {
    errors.push({
      field: 'property.acquisitionDate',
      message: '취득일자는 필수입니다',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
    });
  } else if (!isValidDateFormat(property.acquisitionDate)) {
    errors.push({
      field: 'property.acquisitionDate',
      message: '취득일자는 YYYY-MM-DD 형식이어야 합니다',
      code: ERROR_CODES.INVALID_DATE_FORMAT,
    });
  }

  // 소재지 정보 검사
  if (!property.location.city) {
    errors.push({
      field: 'property.location.city',
      message: '시/도 정보는 필수입니다',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
    });
  }

  if (!property.location.district) {
    errors.push({
      field: 'property.location.district',
      message: '구/군 정보는 필수입니다',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
    });
  }

  // 면적 정보 검사
  if (!property.area.totalArea || property.area.totalArea <= 0) {
    errors.push({
      field: 'property.area.totalArea',
      message: '전체 면적은 0보다 큰 값이어야 합니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  if (!property.area.exclusiveArea || property.area.exclusiveArea <= 0) {
    errors.push({
      field: 'property.area.exclusiveArea',
      message: '전용면적은 0보다 큰 값이어야 합니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  if (
    property.area.exclusiveArea &&
    property.area.totalArea &&
    property.area.exclusiveArea > property.area.totalArea
  ) {
    errors.push({
      field: 'property.area.exclusiveArea',
      message: '전용면적은 전체면적보다 클 수 없습니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 거래 정보 유효성 검사
 */
export function validateTransactionInfo(
  transaction: TransactionInfo,
  acquisitionDate?: string
): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  // 양도가액 검사
  if (!transaction.transferPrice || transaction.transferPrice <= 0) {
    errors.push({
      field: 'transaction.transferPrice',
      message: '양도가액은 0보다 큰 값이어야 합니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  // 양도일자 검사
  if (!transaction.transferDate) {
    errors.push({
      field: 'transaction.transferDate',
      message: '양도일자는 필수입니다',
      code: ERROR_CODES.MISSING_REQUIRED_FIELD,
    });
  } else if (!isValidDateFormat(transaction.transferDate)) {
    errors.push({
      field: 'transaction.transferDate',
      message: '양도일자는 YYYY-MM-DD 형식이어야 합니다',
      code: ERROR_CODES.INVALID_DATE_FORMAT,
    });
  }

  // 취득일자와 양도일자 비교
  if (
    acquisitionDate &&
    transaction.transferDate &&
    isValidDateFormat(acquisitionDate) &&
    isValidDateFormat(transaction.transferDate) &&
    !isDateBefore(acquisitionDate, transaction.transferDate)
  ) {
    errors.push({
      field: 'transaction.transferDate',
      message: '양도일자는 취득일자보다 이후여야 합니다',
      code: ERROR_CODES.INVALID_DATE_FORMAT,
    });
  }

  // 필요경비 검사
  const expenses = transaction.necessaryExpenses;
  const expenseFields = [
    'brokerageFee',
    'improvementCosts',
    'capitalExpenditures',
    'acquisitionTax',
    'other',
  ] as const;

  for (const field of expenseFields) {
    const value = expenses[field];
    if (value !== undefined && value < 0) {
      errors.push({
        field: `transaction.necessaryExpenses.${field}`,
        message: `${field}는 0 이상의 값이어야 합니다`,
        code: ERROR_CODES.INVALID_AMOUNT,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 소유자 정보 유효성 검사
 */
export function validateOwnerInfo(owner: OwnerInfo): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  // 세대 유형 검사
  const validHouseholdTypes = ['1household1house', 'multiple', 'temporary2house'];
  if (!validHouseholdTypes.includes(owner.householdType)) {
    errors.push({
      field: 'owner.householdType',
      message: `유효하지 않은 세대 유형입니다. 가능한 값: ${validHouseholdTypes.join(', ')}`,
      code: ERROR_CODES.INVALID_HOUSEHOLD_TYPE,
    });
  }

  // 1세대 1주택의 경우 거주기간 검사
  if (owner.householdType === '1household1house' && owner.residencePeriod) {
    const { start, end } = owner.residencePeriod;

    if (!isValidDateFormat(start)) {
      errors.push({
        field: 'owner.residencePeriod.start',
        message: '거주 시작일은 YYYY-MM-DD 형식이어야 합니다',
        code: ERROR_CODES.INVALID_DATE_FORMAT,
      });
    }

    if (!isValidDateFormat(end)) {
      errors.push({
        field: 'owner.residencePeriod.end',
        message: '거주 종료일은 YYYY-MM-DD 형식이어야 합니다',
        code: ERROR_CODES.INVALID_DATE_FORMAT,
      });
    }

    if (
      isValidDateFormat(start) &&
      isValidDateFormat(end) &&
      !isDateBefore(start, end)
    ) {
      errors.push({
        field: 'owner.residencePeriod.end',
        message: '거주 종료일은 시작일보다 이후여야 합니다',
        code: ERROR_CODES.INVALID_DATE_FORMAT,
      });
    }
  }

  // 임대기간 검사
  if (owner.rentalPeriod !== undefined && owner.rentalPeriod < 0) {
    errors.push({
      field: 'owner.rentalPeriod',
      message: '임대기간은 0 이상이어야 합니다',
      code: ERROR_CODES.INVALID_AMOUNT,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 계산 옵션 유효성 검사
 */
export function validateCalculationOptions(options?: CalculationOptions): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  if (!options) {
    return { isValid: true, errors: [] };
  }

  // 계산 기준일 검사
  if (options.calculationDate && !isValidDateFormat(options.calculationDate)) {
    errors.push({
      field: 'options.calculationDate',
      message: '계산 기준일은 YYYY-MM-DD 형식이어야 합니다',
      code: ERROR_CODES.INVALID_DATE_FORMAT,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 전체 입력 데이터 유효성 검사
 */
export function validateAllInputs(
  property: PropertyInfo,
  transaction: TransactionInfo,
  owner: OwnerInfo,
  options?: CalculationOptions
): ValidationResult {
  const allErrors: Array<{ field: string; message: string; code: string }> = [];

  // 각 섹션별 검증
  const propertyValidation = validatePropertyInfo(property);
  const transactionValidation = validateTransactionInfo(
    transaction,
    property.acquisitionDate
  );
  const ownerValidation = validateOwnerInfo(owner);
  const optionsValidation = validateCalculationOptions(options);

  // 모든 오류 취합
  allErrors.push(
    ...propertyValidation.errors,
    ...transactionValidation.errors,
    ...ownerValidation.errors,
    ...optionsValidation.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
