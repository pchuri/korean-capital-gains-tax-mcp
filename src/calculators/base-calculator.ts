/**
 * Base capital gains tax calculator
 */

import {
  PropertyInfo,
  TransactionInfo,
  OwnerInfo,
  CalculationOptions,
  CapitalGainsCalculation,
  CalculationStep,
  TaxExemption,
  CalculationResult,
  TaxCalculationError,
} from '../types/index.js';
import {
  BASIC_DEDUCTION,
  ONE_HOUSE_EXEMPTION_LIMIT,
  ADJUSTMENT_TARGET_AREA,
} from '../utils/constants.js';
import {
  calculateHoldingPeriodYears,
  calculateResidencePeriodYears,
  isAcquiredAfter,
} from '../utils/date-utils.js';
import {
  getLongTermDeductionRate,
  getFinalTaxRate,
  calculateProgressiveTaxRate,
  calculateHighValueHouseTaxableGains,
} from '../utils/tax-rates.js';
import { validateAllInputs } from '../utils/validators.js';

export class BaseCalculator {
  /**
   * 양도소득세 계산 메인 함수
   */
  public calculateCapitalGainsTax(
    property: PropertyInfo,
    transaction: TransactionInfo,
    owner: OwnerInfo,
    options?: CalculationOptions
  ): CalculationResult<CapitalGainsCalculation> {
    try {
      // 입력 데이터 검증
      const validation = validateAllInputs(property, transaction, owner, options);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            message: '입력 데이터가 유효하지 않습니다',
            code: 'VALIDATION_FAILED',
          },
        };
      }

      // 계산 수행
      const calculation = this.performCalculation(property, transaction, owner, options);

      return {
        success: true,
        data: calculation,
      };
    } catch (error) {
      const taxError = error instanceof TaxCalculationError 
        ? error 
        : new TaxCalculationError('계산 중 오류가 발생했습니다', 'CALCULATION_ERROR');

      return {
        success: false,
        error: {
          message: taxError.message,
          code: taxError.code,
          ...(taxError.details && { details: taxError.details }),
        },
      };
    }
  }

  /**
   * 실제 계산 로직
   */
  protected performCalculation(
    property: PropertyInfo,
    transaction: TransactionInfo,
    owner: OwnerInfo,
    _options?: CalculationOptions
  ): CapitalGainsCalculation {
    const steps: CalculationStep[] = [];
    const exemptions: TaxExemption[] = [];

    // 1. 기본 정보 계산
    const holdingYears = calculateHoldingPeriodYears(
      property.acquisitionDate,
      transaction.transferDate
    );

    const totalNecessaryExpenses = this.calculateTotalNecessaryExpenses(
      transaction.necessaryExpenses
    );

    // 2. 양도차익 계산
    const capitalGains = transaction.transferPrice - property.acquisitionPrice - totalNecessaryExpenses;
    steps.push({
      stepName: '양도차익 계산',
      formula: '양도가액 - 취득가액 - 필요경비',
      amount: capitalGains,
      description: `${transaction.transferPrice.toLocaleString()}원 - ${property.acquisitionPrice.toLocaleString()}원 - ${totalNecessaryExpenses.toLocaleString()}원`,
    });

    // 3. 1세대 1주택 비과세 적용
    let taxableCapitalGains = capitalGains;
    
    if (owner.householdType === '1household1house' && this.meetsOneHouseExemptionRequirements(property, owner, transaction.transferDate)) {
      
      // 양도가액이 12억원 이하인 경우 완전 비과세
      if (transaction.transferPrice <= ONE_HOUSE_EXEMPTION_LIMIT) {
        taxableCapitalGains = 0;
        exemptions.push({
          type: 'full_exemption',
          amount: capitalGains,
          reason: '1세대 1주택 12억원 이하 완전 비과세',
        });

        steps.push({
          stepName: '1세대 1주택 완전 비과세',
          formula: '양도가액 ≤ 12억원',
          amount: 0,
          description: `양도가액 ${transaction.transferPrice.toLocaleString()}원 ≤ 12억원으로 완전 비과세`,
        });
      } 
      // 양도가액이 12억원 초과인 경우 비례과세
      else {
        taxableCapitalGains = calculateHighValueHouseTaxableGains(
          capitalGains,
          transaction.transferPrice,
          ONE_HOUSE_EXEMPTION_LIMIT
        );

        exemptions.push({
          type: 'partial_exemption',
          amount: capitalGains - taxableCapitalGains,
          reason: '1세대 1주택 12억원 초과분 비례과세',
        });

        steps.push({
          stepName: '1세대 1주택 비례과세',
          formula: '양도차익 × (양도가액 - 12억원) / 양도가액',
          amount: taxableCapitalGains,
          description: `고가주택 과세대상: ${taxableCapitalGains.toLocaleString()}원`,
        });
      }
    }

    // 4. 장기보유특별공제 계산
    const residenceYears = this.calculateResidenceYears(owner, transaction.transferDate);
    const hasResidenceRequirement = owner.householdType === '1household1house' && residenceYears >= 2;
    
    const longTermDeductionRate = getLongTermDeductionRate(holdingYears, hasResidenceRequirement);
    const longTermDeduction = Math.floor(taxableCapitalGains * (longTermDeductionRate / 100));

    steps.push({
      stepName: '장기보유특별공제',
      formula: `과세대상 양도차익 × ${longTermDeductionRate}%`,
      amount: longTermDeduction,
      description: `보유기간 ${holdingYears}년${hasResidenceRequirement ? ' (거주)' : ''} 적용`,
    });

    // 5. 양도소득금액 계산
    const taxableGains = Math.max(0, taxableCapitalGains - longTermDeduction);
    steps.push({
      stepName: '양도소득금액',
      formula: '과세대상 양도차익 - 장기보유특별공제',
      amount: taxableGains,
      description: `${taxableCapitalGains.toLocaleString()}원 - ${longTermDeduction.toLocaleString()}원`,
    });

    // 6. 양도소득과세표준 계산
    const taxableIncome = Math.max(0, taxableGains - BASIC_DEDUCTION);
    steps.push({
      stepName: '양도소득과세표준',
      formula: '양도소득금액 - 기본공제(250만원)',
      amount: taxableIncome,
      description: `${taxableGains.toLocaleString()}원 - ${BASIC_DEDUCTION.toLocaleString()}원`,
    });

    // 7. 세율 적용 및 세액 계산
    const houseCount = this.getHouseCount(owner);
    const applicableTaxRate = getFinalTaxRate(
      taxableIncome,
      holdingYears,
      houseCount,
      property.location.isAdjustmentTargetArea
    );

    let calculatedTax = 0;
    if (applicableTaxRate >= 40) {
      // 중과세 (정액세율)
      calculatedTax = Math.floor(taxableIncome * (applicableTaxRate / 100));
    } else {
      // 일반세율 (누진세)
      calculatedTax = calculateProgressiveTaxRate(taxableIncome);
    }

    steps.push({
      stepName: '산출세액',
      formula: `과세표준 × ${applicableTaxRate}%`,
      amount: calculatedTax,
      description: `${applicableTaxRate >= 40 ? '중과세율' : '기본세율'} 적용`,
    });

    // 8. 최종 세액 (추가 감면 적용 가능)
    const finalTax = Math.max(0, calculatedTax);

    return {
      capitalGains,
      longTermDeduction,
      taxableGains,
      basicDeduction: BASIC_DEDUCTION,
      taxableIncome,
      applicableTaxRate,
      calculatedTax,
      finalTax,
      exemptions,
      calculationSteps: steps,
    };
  }

  /**
   * 필요경비 총액 계산
   */
  protected calculateTotalNecessaryExpenses(expenses: TransactionInfo['necessaryExpenses']): number {
    return (
      (expenses.brokerageFee ?? 0) +
      (expenses.improvementCosts ?? 0) +
      (expenses.capitalExpenditures ?? 0) +
      (expenses.acquisitionTax ?? 0) +
      (expenses.other ?? 0)
    );
  }

  /**
   * 1세대 1주택 비과세 요건 충족 여부
   */
  protected meetsOneHouseExemptionRequirements(
    property: PropertyInfo, 
    owner: OwnerInfo, 
    transferDate: string
  ): boolean {
    if (owner.householdType !== '1household1house') {
      return false;
    }

    // 보유기간 2년 이상
    const holdingYears = calculateHoldingPeriodYears(
      property.acquisitionDate,
      transferDate
    );

    if (holdingYears < 2) {
      return false;
    }

    // 조정대상지역에서 2017.8.3 이후 취득한 경우 거주요건 확인
    if (property.location.isAdjustmentTargetArea) {
      const isAcquiredAfterRegulation = isAcquiredAfter(
        property.acquisitionDate,
        ADJUSTMENT_TARGET_AREA.RESIDENCE_REQUIREMENT_DATE
      );

      if (isAcquiredAfterRegulation) {
        const residenceYears = this.calculateResidenceYears(owner, transferDate);
        return residenceYears >= 2;
      }
    }

    return true;
  }

  /**
   * 거주기간 계산
   */
  protected calculateResidenceYears(owner: OwnerInfo, referenceDate: string): number {
    if (!owner.residencePeriod) {
      return 0;
    }

    const endDate = owner.residencePeriod.end > referenceDate 
      ? referenceDate 
      : owner.residencePeriod.end;

    return calculateResidencePeriodYears(owner.residencePeriod.start, endDate);
  }

  /**
   * 보유 주택 수 계산
   */
  protected getHouseCount(owner: OwnerInfo): number {
    switch (owner.householdType) {
      case '1household1house':
        return 1;
      case 'temporary2house':
        return 2;
      case 'multiple':
        return 3; // 임시로 3주택으로 가정
      default:
        return 1;
    }
  }
}
