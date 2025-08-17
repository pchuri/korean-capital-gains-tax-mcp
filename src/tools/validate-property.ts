/**
 * Property validation tool
 */

import { PropertyInfo, TransactionInfo, OwnerInfo, CalculationOptions } from '../types/index.js';
import { validateAllInputs } from '../utils/validators.js';

export interface ValidatePropertyParams {
  /** 부동산 정보 */
  property: PropertyInfo;
  /** 거래 정보 */
  transaction: TransactionInfo;
  /** 소유자 정보 */
  owner: OwnerInfo;
  /** 계산 옵션 */
  options?: CalculationOptions;
}

/**
 * 입력된 부동산 정보의 유효성 검증
 */
export async function validatePropertyInfo(params: ValidatePropertyParams) {
  const validation = validateAllInputs(
    params.property,
    params.transaction,
    params.owner,
    params.options
  );

  if (validation.isValid) {
    return {
      유효성: '✅ 모든 입력 데이터가 유효합니다',
      검증결과: {
        부동산정보: '✅ 유효',
        거래정보: '✅ 유효',
        소유자정보: '✅ 유효',
        계산옵션: '✅ 유효',
      },
    };
  }

  const errorsByCategory = {
    부동산정보: validation.errors.filter(e => e.field.startsWith('property.')),
    거래정보: validation.errors.filter(e => e.field.startsWith('transaction.')),
    소유자정보: validation.errors.filter(e => e.field.startsWith('owner.')),
    계산옵션: validation.errors.filter(e => e.field.startsWith('options.')),
  };

  return {
    유효성: '❌ 입력 데이터에 오류가 있습니다',
    오류목록: validation.errors.map(error => ({
      필드: error.field,
      메시지: error.message,
      코드: error.code,
    })),
    카테고리별오류: {
      부동산정보: errorsByCategory.부동산정보.length > 0 
        ? errorsByCategory.부동산정보.map(e => e.message)
        : ['✅ 유효'],
      거래정보: errorsByCategory.거래정보.length > 0 
        ? errorsByCategory.거래정보.map(e => e.message)
        : ['✅ 유효'],
      소유자정보: errorsByCategory.소유자정보.length > 0 
        ? errorsByCategory.소유자정보.map(e => e.message)
        : ['✅ 유효'],
      계산옵션: errorsByCategory.계산옵션.length > 0 
        ? errorsByCategory.계산옵션.map(e => e.message)
        : ['✅ 유효'],
    },
  };
}
