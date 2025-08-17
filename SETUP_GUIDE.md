# 🚀 Korean Capital Gains Tax MCP Server 설정 가이드

이 가이드는 Claude Desktop에서 Korean Capital Gains Tax MCP Server를 설정하고 사용하는 방법을 설명합니다.

## 📋 사전 요구사항

- **Node.js 18+** 설치
- **Claude Desktop** 애플리케이션 설치
- **터미널** 또는 **명령 프롬프트** 접근

## 🔧 1단계: 프로젝트 빌드

먼저 MCP 서버를 빌드합니다:

```bash
cd /Users/user/dev/korean-capital-gains-tax-mcp

# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# 빌드 확인
npm test
```

## ⚙️ 2단계: Claude Desktop 설정

### macOS/Linux 설정

Claude Desktop의 설정 파일을 수정합니다:

```bash
# 설정 파일 위치 확인 및 편집
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Windows 설정

```powershell
# Windows에서 설정 파일 편집
notepad %APPDATA%/Claude/claude_desktop_config.json
```

### 설정 파일 내용

`claude_desktop_config.json` 파일에 다음 내용을 추가하거나 수정합니다:

#### 🏭 프로덕션 모드 (권장 - 로그 깔끔)
```json
{
  "mcpServers": {
    "korean-capital-gains-tax": {
      "command": "node",
      "args": ["/Users/user/dev/korean-capital-gains-tax-mcp/mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "NPM_CONFIG_LOGLEVEL": "silent"
      }
    }
  }
}
```

#### 🚀 개발 모드 (코드 변경 시 자동 재시작)
```json
{
  "mcpServers": {
    "korean-capital-gains-tax-dev": {
      "command": "/opt/homebrew/bin/npm",
      "args": ["run", "dev", "--prefix", "/Users/user/dev/korean-capital-gains-tax-mcp/"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### 📍 직접 Node.js 실행 (빌드 후)
```json
{
  "mcpServers": {
    "korean-capital-gains-tax": {
      "command": "node",
      "args": ["/Users/user/dev/korean-capital-gains-tax-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

> **중요**: 
> - 경로를 실제 프로젝트 위치에 맞게 수정하세요!
> - npm 경로는 `which npm` 명령어로 확인할 수 있습니다
> - `--prefix` 플래그로 작업 디렉토리를 명시적으로 지정해야 합니다

## 🔄 3단계: Claude Desktop 재시작

1. Claude Desktop 애플리케이션을 **완전히 종료**합니다
2. Claude Desktop을 **다시 시작**합니다
3. 새로운 채팅을 시작합니다

## ✅ 4단계: 연결 확인

Claude Desktop에서 다음과 같이 확인할 수 있습니다:

```
MCP 서버가 연결되었는지 확인해주세요.
```

성공적으로 연결되면 Claude가 사용 가능한 도구를 보여줄 것입니다.

## 🧪 5단계: 기본 사용법

### 양도소득세 계산 예시

```
다음 조건으로 양도소득세를 계산해주세요:

부동산 정보:
- 유형: 아파트
- 취득가액: 8억원
- 취득일: 2017-01-01
- 위치: 서울 강남구 (조정대상지역)
- 면적: 전용 80㎡, 전체 100㎡

거래 정보:
- 양도가액: 15억원
- 양도일: 2024-12-01
- 중개수수료: 800만원
- 취득세: 1,000만원

소유자 정보:
- 1세대 1주택
- 거주기간: 2017-01-01 ~ 2024-12-01
```

### 데이터 검증 예시

```
다음 부동산 정보가 올바른지 검증해주세요:

부동산: 주택, 취득가 5억원, 취득일 2020-06-15
거래: 양도가 7억원, 양도일 2024-01-15
소유자: 다주택자
```

### 계산 과정 설명 요청

```
1세대 1주택 양도소득세 계산 과정을 자세히 설명해주세요.
보유기간 5년, 거주기간 3년인 경우의 세율과 공제율을 알려주세요.
```

## 🔧 문제 해결

## 🔧 문제 해결

### npm 경로 확인
시스템별로 npm 설치 경로가 다를 수 있습니다:

```bash
# npm 경로 확인
which npm

# 일반적인 경로들:
# macOS (Homebrew): /opt/homebrew/bin/npm
# macOS (Node.js 직접설치): /usr/local/bin/npm  
# Linux: /usr/bin/npm
# Windows: C:\Program Files\nodejs\npm.cmd
```

### 설정 검증
```bash
# 설정이 올바른지 수동으로 테스트
cd /Users/user/dev/korean-capital-gains-tax-mcp
/opt/homebrew/bin/npm run dev

# 또는 빌드된 파일 직접 실행
node dist/server.js
```

### 연결 문제

1. **서버가 시작되지 않는 경우**:
   ```bash
   # 빌드 상태 확인
   npm run build
   
   # 수동으로 서버 테스트
   npm run dev
   ```

2. **경로 오류**:
   - `claude_desktop_config.json`에서 절대 경로 확인
   - `--prefix` 플래그 사용 여부 확인
   - 프로젝트 디렉토리 권한 확인

3. **권한 문제**:
   ```bash
   # npm 실행 권한 확인
   ls -la /opt/homebrew/bin/npm
   
   # 프로젝트 디렉토리 권한 확인
   ls -la /Users/user/dev/korean-capital-gains-tax-mcp/
   ```

### 로그 확인

Claude Desktop의 로그를 확인하려면:

**macOS**:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows**:
```powershell
Get-Content $env:APPDATA/Claude/Logs/mcp*.log -Wait
```

### 일반적인 오류들

1. **"Module not found"**: `npm install` 재실행
2. **"Permission denied"**: 파일 권한 확인
3. **"Port already in use"**: 기존 프로세스 종료

## 🔗 고급 설정

### 개발자 모드

개발 중에는 자동 재시작을 위해 다음 설정을 사용할 수 있습니다:

```json
{
  "mcpServers": {
    "korean-capital-gains-tax-dev": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/user/dev/korean-capital-gains-tax-mcp",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 환경 변수 설정

특별한 설정이 필요한 경우:

```json
{
  "mcpServers": {
    "korean-capital-gains-tax": {
      "command": "node",
      "args": ["/Users/user/dev/korean-capital-gains-tax-mcp/dist/server.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 📚 사용 가능한 도구들

### 1. `calculate_capital_gains_tax`
- **기능**: 완전한 양도소득세 계산
- **입력**: 부동산/거래/소유자 정보
- **출력**: 세액, 계산 단계, 적용 감면

### 2. `validate_property_info`
- **기능**: 입력 데이터 유효성 검증
- **입력**: 모든 계산 데이터
- **출력**: 검증 결과, 오류 목록

### 3. `explain_calculation`
- **기능**: 계산 과정 및 법규 설명
- **입력**: 부동산/거래/소유자 정보
- **출력**: 단계별 설명, 적용 법령

## 🎯 실전 사용 팁

1. **정확한 데이터 입력**: 날짜는 YYYY-MM-DD 형식으로
2. **조정대상지역 확인**: 국토교통부 공고 참조
3. **거주기간 증빙**: 주민등록등본 기준
4. **필요경비 준비**: 영수증, 계약서 등 증빙자료

## 📞 지원

문제가 발생하면:
1. 로그 파일 확인
2. 빌드 상태 점검
3. Claude Desktop 재시작
4. 설정 파일 재확인

---

이제 Claude Desktop에서 한국 부동산 양도소득세를 정확하게 계산할 수 있습니다! 🎉
