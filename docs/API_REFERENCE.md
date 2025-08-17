# API Reference

## MCP Tools

### calculate_capital_gains_tax

한국 부동산 양도소득세를 계산합니다.

#### Parameters

```typescript
{
  property: PropertyInfo;
  transaction: TransactionInfo;
  owner: OwnerInfo;
  options?: CalculationOptions;
}
```

#### PropertyInfo

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| type | string | ✓ | 부동산 유형 (`apartment`, `house`, `land`, `commercial`) |
| acquisitionPrice | number | ✓ | 취득가액 (원) |
| acquisitionDate | string | ✓ | 취득일자 (YYYY-MM-DD) |
| location.city | string | ✓ | 시/도 |
| location.district | string | ✓ | 구/군 |
| location.isAdjustmentTargetArea | boolean | ✓ | 조정대상지역 여부 |
| area.totalArea | number | ✓ | 전체 면적 (㎡) |
| area.exclusiveArea | number | ✓ | 전용면적 (㎡) |

#### TransactionInfo

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| transferPrice | number | ✓ | 양도가액 (원) |
| transferDate | string | ✓ | 양도일자 (YYYY-MM-DD) |
| necessaryExpenses | object | ✓ | 필요경비 |
| necessaryExpenses.brokerageFee | number | | 중개수수료 (원) |
| necessaryExpenses.improvementCosts | number | | 개량비 (원) |
| necessaryExpenses.capitalExpenditures | number | | 자본적지출액 (원) |
| necessaryExpenses.acquisitionTax | number | | 취득세 등 (원) |
| necessaryExpenses.other | number | | 기타 필요경비 (원) |

#### OwnerInfo

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| householdType | string | ✓ | 세대 구성 (`1household1house`, `multiple`, `temporary2house`) |
| residencePeriod.start | string | | 거주 시작일 (YYYY-MM-DD) |
| residencePeriod.end | string | | 거주 종료일 (YYYY-MM-DD) |
| isLongTermRental | boolean | | 장기임대주택 여부 |
| rentalPeriod | number | | 임대기간 (년) |

#### CalculationOptions

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| calculationDate | string | | 계산 기준일 (YYYY-MM-DD) |
| includeDetails | boolean | | 상세 계산 과정 포함 여부 |
| taxLawVersion | string | | 적용할 세법 버전 |

#### Response

```typescript
{
  summary: {
    최종세액: string;     // "1,380만원"
    양도차익: string;     // "6억8,200만원"
    과세표준: string;     // "5,750만원"
    적용세율: string;     // "24%"
  };
  details: {
    계산단계: Array<{
      단계: string;       // "양도차익 계산"
      공식: string;       // "양도가액 - 취득가액 - 필요경비"
      금액: string;       // "6억8,200만원"
      설명: string;       // "15억원 - 8억원 - 1,800만원"
    }>;
    적용된감면: Array<{
      유형: string;       // "일부비과세"
      금액: string;       // "1억원"
      근거: string;       // "1세대 1주택 12억원 이하 비과세"
    }>;
  };
  rawData: CapitalGainsCalculation;
}
```

### validate_property_info

입력된 부동산 정보의 유효성을 검증합니다.

#### Parameters

동일한 파라미터를 `calculate_capital_gains_tax`와 사용

#### Response

```typescript
{
  유효성: string;           // "✅ 모든 입력 데이터가 유효합니다" 또는 "❌ 입력 데이터에 오류가 있습니다"
  검증결과?: {
    부동산정보: string;     // "✅ 유효"
    거래정보: string;       // "✅ 유효"
    소유자정보: string;     // "✅ 유효"
    계산옵션: string;       // "✅ 유효"
  };
  오류목록?: Array<{
    필드: string;           // "property.acquisitionPrice"
    메시지: string;         // "취득가액은 0보다 큰 값이어야 합니다"
    코드: string;           // "INVALID_AMOUNT"
  }>;
}
```

### explain_calculation

양도소득세 계산 과정과 적용 법령을 상세히 설명합니다.

#### Parameters

```typescript
{
  property: PropertyInfo;
  transaction: TransactionInfo;
  owner: OwnerInfo;
}
```

#### Response

```typescript
{
  계산개요: {
    양도소득세_계산_공식: string[];
  };
  기본정보: {
    부동산유형: string;
    소재지: string;
    조정대상지역: string;
    보유기간: string;
    세대구성: string;
    거주기간: string;
  };
  적용법규: {
    장기보유특별공제: {
      보유기간: string;
      적용공제율: string;
      거주가산: string;
      설명: string;
    };
    세율적용: {
      기본정보: string;
      적용세율: string;
      중과사유: string;
    };
    비과세감면: object;
  };
  주의사항: string[];
  관련법령: {
    소득세법: string[];
    조세특례제한법: string[];
    시행령_시행규칙: string[];
  };
}
```

## Error Handling

모든 도구는 오류 발생 시 다음 형식으로 응답합니다:

```typescript
{
  error: true;
  message: string;
  tool: string;
}
```

## 주요 오류 코드

- `INVALID_DATE_FORMAT`: 날짜 형식 오류
- `INVALID_AMOUNT`: 금액 값 오류
- `MISSING_REQUIRED_FIELD`: 필수 필드 누락
- `INVALID_PROPERTY_TYPE`: 유효하지 않은 부동산 유형
- `INVALID_HOUSEHOLD_TYPE`: 유효하지 않은 세대 유형
- `CALCULATION_ERROR`: 계산 오류
- `VALIDATION_FAILED`: 유효성 검사 실패
