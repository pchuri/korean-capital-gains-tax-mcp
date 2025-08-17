/**
 * Main capital gains tax calculation tool
 */

import { PropertyInfo, TransactionInfo, OwnerInfo, CalculationOptions } from '../types/index.js';
import { BaseCalculator } from '../calculators/base-calculator.js';

export interface CalculateTaxParams {
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
 * 한국 부동산 양도소득세 계산
 */
export async function calculateCapitalGainsTax(params: CalculateTaxParams) {
  const calculator = new BaseCalculator();
  
  const result = calculator.calculateCapitalGainsTax(
    params.property,
    params.transaction,
    params.owner,
    params.options
  );

  if (!result.success) {
    throw new Error(`계산 실패: ${result.error?.message}`);
  }

  const calculation = result.data!;

  // 결과를 사용자 친화적인 형태로 변환
  return {
    summary: {
      최종세액: `${calculation.finalTax.toLocaleString()}원`,
      양도차익: `${calculation.capitalGains.toLocaleString()}원`,
      과세표준: `${calculation.taxableIncome.toLocaleString()}원`,
      적용세율: `${calculation.applicableTaxRate}%`,
    },
    details: {
      계산단계: calculation.calculationSteps.map(step => ({
        단계: step.stepName,
        공식: step.formula,
        금액: `${step.amount.toLocaleString()}원`,
        설명: step.description,
      })),
      적용된감면: calculation.exemptions.map(exemption => ({
        유형: exemption.type === 'full_exemption' ? '전액비과세' : 
              exemption.type === 'partial_exemption' ? '일부비과세' : '세액감면',
        금액: `${exemption.amount.toLocaleString()}원`,
        근거: exemption.reason,
      })),
    },
    rawData: calculation,
  };
}
