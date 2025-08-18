/**
 * Step label and ID constants used in calculation outputs.
 * Centralization avoids brittleness to localization and naming changes.
 */

import type { StepId } from '../types/index.js';

// Step IDs (stable keys)
export const STEP_IDS = {
  CAPITAL_GAINS: 'capital_gains',
  ONE_HOUSE_FULL_EXEMPTION: 'one_house_full_exemption',
  ONE_HOUSE_PARTIAL_EXEMPTION: 'one_house_partial_exemption',
  LONG_TERM_DEDUCTION: 'long_term_deduction',
  TAXABLE_GAINS: 'taxable_gains',
  TAX_BASE: 'tax_base',
  CALCULATED_TAX: 'calculated_tax',
} as const satisfies Record<string, StepId>;

// Step labels (display strings)
export const STEP_YANGDO_PROFIT = '양도차익 계산';
export const STEP_LONG_TERM_DEDUCTION = '장기보유특별공제';
export const STEP_TAXABLE_GAINS = '양도소득금액';
export const STEP_TAX_BASE = '양도소득과세표준';
export const STEP_CALCULATED_TAX = '산출세액';

export const STEP_PROPORTIONAL_EXEMPTION = '1세대 1주택 비례과세';
export const STEP_FULL_EXEMPTION = '1세대 1주택 완전 비과세';

export const STEP_LABELS: Record<StepId, string> = {
  capital_gains: STEP_YANGDO_PROFIT,
  one_house_full_exemption: STEP_FULL_EXEMPTION,
  one_house_partial_exemption: STEP_PROPORTIONAL_EXEMPTION,
  long_term_deduction: STEP_LONG_TERM_DEDUCTION,
  taxable_gains: STEP_TAXABLE_GAINS,
  tax_base: STEP_TAX_BASE,
  calculated_tax: STEP_CALCULATED_TAX,
};
