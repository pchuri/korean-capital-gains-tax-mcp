/**
 * Date and period calculation utilities
 */

/**
 * 두 날짜 사이의 일수 계산
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 두 날짜 사이의 년수 계산 (소수점 포함)
 */
export function calculateYearsBetween(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 정확한 년수 차이 계산
  let years = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  // 월/일을 고려하여 정확한 년수 계산
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }

  // 같은 날짜인 경우 0 반환
  if (start.getTime() === end.getTime()) {
    return 0;
  }

  return Math.max(0, years);
}

/**
 * 보유기간 계산 (년 단위, 소수점 절사)
 */
export function calculateHoldingPeriodYears(
  acquisitionDate: string,
  transferDate: string
): number {
  const years = calculateYearsBetween(acquisitionDate, transferDate);
  return Math.floor(years);
}

/**
 * 거주기간 계산 (년 단위)
 */
export function calculateResidencePeriodYears(
  residenceStart: string,
  residenceEnd: string
): number {
  return calculateYearsBetween(residenceStart, residenceEnd);
}

/**
 * 날짜 형식 검증 (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 날짜 비교 (첫 번째 날짜가 두 번째 날짜보다 이전인지)
 */
export function isDateBefore(date1: string, date2: string): boolean {
  return new Date(date1) < new Date(date2);
}

/**
 * 날짜 비교 (첫 번째 날짜가 두 번째 날짜보다 이후인지)
 */
export function isDateAfter(date1: string, date2: string): boolean {
  return new Date(date1) > new Date(date2);
}

/**
 * 특정 기준일 이후 취득 여부 확인
 */
export function isAcquiredAfter(
  acquisitionDate: string,
  referenceDate: string
): boolean {
  return isDateAfter(acquisitionDate, referenceDate);
}

/**
 * 특정 기간 내 양도 여부 확인
 */
export function isTransferredWithinPeriod(
  transferDate: string,
  startDate: string,
  endDate: string
): boolean {
  return (
    isDateAfter(transferDate, startDate) && isDateBefore(transferDate, endDate)
  );
}

/**
 * 현재 날짜 반환 (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const iso = new Date().toISOString();
  return iso.substring(0, 10);
}

/**
 * 날짜에 년수 추가
 */
export function addYearsToDate(dateString: string, years: number): string {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  const iso = date.toISOString();
  return iso.substring(0, 10);
}
