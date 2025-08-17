# 한국 부동산 양도소득세 계산기 MCP 서버

**Korean Capital Gains Tax Calculator for Real Estate - Model Context Protocol Server**

TypeScript로 구현된 한국 부동산 양도소득세 계산을 위한 MCP 서버입니다. 복잡한 한국 세법을 정확히 적용하여 양도소득세를 계산하고, 세율, 공제, 비과세 요건 등을 상세히 설명해드립니다.

[![Test Status](https://img.shields.io/badge/tests-passing-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)]()
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-0.5-purple)]()

## 🏠 주요 기능

- **정확한 세액 계산**: 한국 세법에 따른 정밀한 양도소득세 계산
- **다양한 부동산 유형 지원**: 아파트, 주택, 토지, 상업용 부동산
- **복잡한 세제 적용**: 1세대1주택 비과세, 장기보유특별공제, 다주택자 중과세
- **상세한 계산 과정**: 단계별 계산 과정과 적용 법령 설명
- **입력 데이터 검증**: 포괄적인 유효성 검사 및 오류 메시지
- **MCP 표준 준수**: Model Context Protocol을 통한 안전하고 표준화된 인터페이스

## 🚀 빠른 시작

### 설치

```bash
git clone https://github.com/pchuri/korean-capital-gains-tax-mcp.git
cd korean-capital-gains-tax-mcp
npm install
```

### 빌드

```bash
npm run build
```

### 서버 실행

```bash
npm start
```

### 개발 모드 실행

```bash
npm run dev
```

## 📖 사용법

### MCP 도구 목록

1. **`calculate_capital_gains_tax`** - 양도소득세 계산
2. **`validate_property_info`** - 입력 데이터 유효성 검사
3. **`explain_calculation`** - 계산 과정 및 법령 설명

### 기본 사용 예제

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

## 📚 문서

- [API 참조](docs/API_REFERENCE.md) - 상세한 API 문서
- [사용 예제](docs/EXAMPLES.md) - 다양한 사용 사례
- [양도소득세 가이드](docs/CAPITAL_GAINS_TAX_GUIDE.md) - 한국 양도소득세 법령 설명
- [개발 가이드라인](docs/CODING_GUIDELINES.md) - 개발자를 위한 가이드라인

## 🏗️ 아키텍처

```
src/
├── server.ts                 # MCP 서버 메인 엔트리 포인트
├── types/                    # TypeScript 타입 정의
├── calculators/              # 세액 계산 로직
├── utils/                    # 유틸리티 함수들
└── tools/                    # MCP 도구 구현
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 테스트 감시 모드
npm run test:watch
```

## 🔧 지원하는 계산

### 세대 구성별 계산
- **1세대 1주택**: 비과세 혜택 및 거주요건 적용
- **일시적 2주택**: 특별 규정 적용
- **다주택자**: 중과세율 적용

### 부동산 유형별 계산
- **아파트/주택**: 주거용 부동산 특례
- **토지**: 토지 관련 특별 규정
- **상업용**: 사업용 부동산 세제

### 특수 상황
- **조정대상지역**: 정부 지정 지역별 추가 규제
- **장기임대주택**: 임대주택 특례
- **단기보유**: 중과세 적용

## ⚖️ 법적 고지

> **중요**: 본 소프트웨어는 정보 제공 목적으로만 사용되며, 실제 세무 신고나 법적 결정을 위해서는 반드시 세무 전문가의 상담을 받으시기 바랍니다. 세법은 복잡하고 개인별 상황에 따라 달라질 수 있습니다.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format

# 타입 체크
npm run typecheck
```

## 📋 요구사항

- Node.js 18.0.0 이상
- TypeScript 5.2 이상
- MCP SDK 0.5 이상

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

- 이슈 리포트: [GitHub Issues](https://github.com/pchuri/korean-capital-gains-tax-mcp/issues)
- 문의: [GitHub Discussions](https://github.com/pchuri/korean-capital-gains-tax-mcp/discussions)

## 🗺️ 로드맵

- [ ] 상속/증여 관련 특례 추가
- [ ] 부동산 개발업자 과세 특례
- [ ] 해외부동산 양도소득세 계산
- [ ] 웹 인터페이스 개발
- [ ] 다국어 지원 (영어)

---

**Made with ❤️ for Korean Real Estate**
