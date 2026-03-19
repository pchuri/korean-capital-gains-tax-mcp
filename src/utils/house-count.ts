import { HouseholdType } from '../types/index.js';

/** @deprecated 'multiple' is deprecated; use '2houses' or '3plus_houses' instead. */
export type LegacyHouseholdType = HouseholdType | 'multiple';

export function normalizeHouseholdType(raw: string): HouseholdType {
  if (raw === 'multiple') {
    return '3plus_houses';
  }
  return raw as HouseholdType;
}

export function getHouseCount(householdType: HouseholdType): number {
  switch (householdType) {
    case '1household1house':
      return 1;
    case 'temporary2house':
    case '2houses':
      return 2;
    case '3plus_houses':
      return 3;
    default: {
      const _exhaustive: never = householdType;
      throw new Error(`Unknown householdType: ${_exhaustive}`);
    }
  }
}
