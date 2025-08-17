# 사용 예제

## 기본 사용법

### 1세대 1주택 양도소득세 계산

```json
{
  "tool": "calculate_capital_gains_tax",
  "arguments": {
    "property": {
      "type": "apartment",
      "acquisitionPrice": 800000000,
      "acquisitionDate": "2017-01-01",
      "location": {
        "city": "서울특별시",
        "district": "강남구",
        "isAdjustmentTargetArea": true
      },
      "area": {
        "totalArea": 100,
        "exclusiveArea": 80
      }
    },
    "transaction": {
      "transferPrice": 1500000000,
      "transferDate": "2024-12-01",
      "necessaryExpenses": {
        "brokerageFee": 8000000,
        "acquisitionTax": 10000000
      }
    },
    "owner": {
      "householdType": "1household1house",
      "residencePeriod": {
        "start": "2017-01-01",
        "end": "2024-12-01"
      }
    }
  }
}
```

**응답:**
```json
{
  "summary": {
    "최종세액": "173,592,000원",
    "양도차익": "682,000,000원",
    "과세표준": "433,980,000원",
    "적용세율": "40%"
  },
  "details": {
    "계산단계": [
      {
        "단계": "양도차익 계산",
        "공식": "양도가액 - 취득가액 - 필요경비",
        "금액": "682,000,000원",
        "설명": "1,500,000,000원 - 800,000,000원 - 18,000,000원"
      }
      // ... 추가 단계들
    ]
  }
}
```

### 다주택자 양도소득세 계산

```json
{
  "tool": "calculate_capital_gains_tax",
  "arguments": {
    "property": {
      "type": "apartment",
      "acquisitionPrice": 600000000,
      "acquisitionDate": "2020-03-15",
      "location": {
        "city": "서울특별시",
        "district": "서초구",
        "isAdjustmentTargetArea": true
      },
      "area": {
        "totalArea": 85,
        "exclusiveArea": 70
      }
    },
    "transaction": {
      "transferPrice": 1200000000,
      "transferDate": "2024-06-30",
      "necessaryExpenses": {
        "brokerageFee": 6000000,
        "improvementCosts": 5000000,
        "acquisitionTax": 8000000
      }
    },
    "owner": {
      "householdType": "multiple"
    }
  }
}
```

### 단기보유 부동산 양도

```json
{
  "tool": "calculate_capital_gains_tax",
  "arguments": {
    "property": {
      "type": "house",
      "acquisitionPrice": 500000000,
      "acquisitionDate": "2023-06-01",
      "location": {
        "city": "경기도",
        "district": "성남시",
        "isAdjustmentTargetArea": false
      },
      "area": {
        "totalArea": 120,
        "exclusiveArea": 100
      }
    },
    "transaction": {
      "transferPrice": 700000000,
      "transferDate": "2024-03-01",
      "necessaryExpenses": {
        "brokerageFee": 3500000,
        "other": 1500000
      }
    },
    "owner": {
      "householdType": "1household1house"
    }
  }
}
```

## 유효성 검사 예제

### 올바른 데이터 검증

```json
{
  "tool": "validate_property_info",
  "arguments": {
    "property": {
      "type": "apartment",
      "acquisitionPrice": 800000000,
      "acquisitionDate": "2017-01-01",
      "location": {
        "city": "서울특별시",
        "district": "강남구",
        "isAdjustmentTargetArea": true
      },
      "area": {
        "totalArea": 100,
        "exclusiveArea": 80
      }
    },
    "transaction": {
      "transferPrice": 1500000000,
      "transferDate": "2024-12-01",
      "necessaryExpenses": {}
    },
    "owner": {
      "householdType": "1household1house"
    }
  }
}
```

**응답:**
```json
{
  "유효성": "✅ 모든 입력 데이터가 유효합니다",
  "검증결과": {
    "부동산정보": "✅ 유효",
    "거래정보": "✅ 유효",
    "소유자정보": "✅ 유효",
    "계산옵션": "✅ 유효"
  }
}
```

### 오류가 있는 데이터 검증

```json
{
  "tool": "validate_property_info",
  "arguments": {
    "property": {
      "type": "invalid_type",
      "acquisitionPrice": -1000000,
      "acquisitionDate": "invalid-date",
      "location": {
        "city": "",
        "district": "강남구",
        "isAdjustmentTargetArea": true
      },
      "area": {
        "totalArea": 100,
        "exclusiveArea": 120
      }
    },
    "transaction": {
      "transferPrice": 1500000000,
      "transferDate": "2024-12-01",
      "necessaryExpenses": {}
    },
    "owner": {
      "householdType": "1household1house"
    }
  }
}
```

**응답:**
```json
{
  "유효성": "❌ 입력 데이터에 오류가 있습니다",
  "오류목록": [
    {
      "필드": "property.type",
      "메시지": "유효하지 않은 부동산 유형입니다. 가능한 값: apartment, house, land, commercial",
      "코드": "INVALID_PROPERTY_TYPE"
    },
    {
      "필드": "property.acquisitionPrice",
      "메시지": "취득가액은 0보다 큰 값이어야 합니다",
      "코드": "INVALID_AMOUNT"
    }
    // ... 추가 오류들
  ]
}
```

## 계산 설명 예제

```json
{
  "tool": "explain_calculation",
  "arguments": {
    "property": {
      "type": "apartment",
      "acquisitionPrice": 800000000,
      "acquisitionDate": "2017-01-01",
      "location": {
        "city": "서울특별시",
        "district": "강남구",
        "isAdjustmentTargetArea": true
      },
      "area": {
        "totalArea": 100,
        "exclusiveArea": 80
      }
    },
    "transaction": {
      "transferPrice": 1500000000,
      "transferDate": "2024-12-01",
      "necessaryExpenses": {
        "brokerageFee": 8000000
      }
    },
    "owner": {
      "householdType": "1household1house",
      "residencePeriod": {
        "start": "2017-01-01",
        "end": "2024-12-01"
      }
    }
  }
}
```

**응답:**
```json
{
  "계산개요": {
    "양도소득세_계산_공식": [
      "1단계: 양도차익 = 양도가액 - 취득가액 - 필요경비",
      "2단계: 양도소득금액 = 양도차익 - 장기보유특별공제",
      "3단계: 양도소득과세표준 = 양도소득금액 - 기본공제(250만원)",
      "4단계: 산출세액 = 과세표준 × 세율"
    ]
  },
  "기본정보": {
    "부동산유형": "아파트",
    "소재지": "서울특별시 강남구",
    "조정대상지역": "예",
    "보유기간": "7년",
    "세대구성": "1세대 1주택",
    "거주기간": "7.9년"
  },
  "적용법규": {
    "장기보유특별공제": {
      "보유기간": "7년",
      "적용공제율": "36%",
      "거주가산": "적용",
      "설명": "보유기간 7년으로 36% 공제 적용"
    }
    // ... 추가 정보
  }
}
```

## 고급 사용 사례

### 장기임대주택 특례 적용

```json
{
  "property": {
    "type": "apartment",
    "acquisitionPrice": 600000000,
    "acquisitionDate": "2015-01-01",
    "location": {
      "city": "부산광역시",
      "district": "해운대구",
      "isAdjustmentTargetArea": false
    },
    "area": {
      "totalArea": 90,
      "exclusiveArea": 75
    }
  },
  "transaction": {
    "transferPrice": 900000000,
    "transferDate": "2024-12-01",
    "necessaryExpenses": {
      "brokerageFee": 4500000,
      "improvementCosts": 10000000
    }
  },
  "owner": {
    "householdType": "multiple",
    "isLongTermRental": true,
    "rentalPeriod": 8
  }
}
```

### 상업용 부동산 양도

```json
{
  "property": {
    "type": "commercial",
    "acquisitionPrice": 2000000000,
    "acquisitionDate": "2019-06-15",
    "location": {
      "city": "서울특별시",
      "district": "종로구",
      "isAdjustmentTargetArea": false
    },
    "area": {
      "totalArea": 200,
      "exclusiveArea": 180
    }
  },
  "transaction": {
    "transferPrice": 3000000000,
    "transferDate": "2024-08-30",
    "necessaryExpenses": {
      "brokerageFee": 15000000,
      "capitalExpenditures": 50000000,
      "other": 5000000
    }
  },
  "owner": {
    "householdType": "multiple"
  }
}
```

## 오류 처리 예제

### 계산 오류 응답

```json
{
  "error": true,
  "message": "계산 실패: 입력 데이터가 유효하지 않습니다",
  "tool": "calculate_capital_gains_tax"
}
```

### 유효성 검사 실패

```json
{
  "error": true,
  "message": "필수 필드가 누락되었습니다: property.acquisitionDate",
  "tool": "validate_property_info"
}
```

## MCP 클라이언트에서 사용 시 주의사항

1. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식으로 입력해야 합니다.
2. **금액 단위**: 모든 금액은 원(KRW) 단위로 입력합니다.
3. **조정대상지역**: 최신 정보를 확인하여 정확한 값을 입력해야 합니다.
4. **거주기간**: 1세대 1주택의 경우 정확한 거주기간을 입력해야 비과세 혜택을 받을 수 있습니다.
5. **필요경비**: 실제 지출한 비용만 입력하며, 영수증 등 증빙서류가 있는 경우에만 인정됩니다.
