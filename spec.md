# ZetaLab 기능 명세서

**작성일**: 2026-01-29  
**작성자**: Manus AI  
**버전**: 1.0.0

---

## 개요

ZetaLab은 사용자의 막연한 질문을 구체적인 AI 프롬프트로 변환하는 프롬프트 생성 플랫폼입니다. 사용자가 입력한 질문을 분석하여 의도를 파악하고, 추가 정보를 수집한 후 완성형 프롬프트를 생성합니다.

---

## 핵심 기능

### 1. 인증 및 사용자 관리

**구현 상태**: ✅ 완료

ZetaLab은 Manus OAuth를 통한 소셜 로그인을 지원합니다. 사용자는 Google, Microsoft, Apple 계정으로 로그인할 수 있으며, 로그인 후 모든 기능에 접근 가능합니다.

**주요 기능**:
- Manus OAuth 기반 소셜 로그인 (Google, Microsoft, Apple)
- 세션 기반 인증 (쿠키: `HttpOnly`, `Secure`, `SameSite=lax`)
- 사용자 역할 관리 (`admin`, `user`)
- 로그아웃 기능

**API 엔드포인트**:
- `auth.me`: 현재 로그인한 사용자 정보 조회
- `auth.logout`: 로그아웃 및 세션 쿠키 삭제

**데이터베이스 테이블**: `users`

| 필드 | 타입 | 설명 |
|------|------|------|
| id | int | 사용자 고유 ID (PK) |
| openId | varchar(64) | Manus OAuth 식별자 (Unique) |
| name | text | 사용자 이름 |
| email | varchar(320) | 이메일 주소 |
| loginMethod | varchar(64) | 로그인 방법 (google, microsoft, apple) |
| role | enum | 사용자 역할 (admin, user) |
| createdAt | timestamp | 생성 일시 |
| updatedAt | timestamp | 수정 일시 |
| lastSignedIn | timestamp | 마지막 로그인 일시 |

---

### 2. 프롬프트 생성 플로우

**구현 상태**: ✅ 완료

사용자의 질문을 3단계 플로우로 처리하여 완성형 프롬프트를 생성합니다.

#### 2.1 질문 입력 및 의도 분석

사용자가 질문을 입력하면 시스템은 키워드 매칭을 통해 적절한 의도 템플릿을 선택합니다. 매칭되는 템플릿이 없으면 "일반 질문" 템플릿을 사용합니다.

**API 엔드포인트**: `zetaAI.init`

**입력**:
```typescript
{
  question: string; // 사용자 질문
}
```

**출력**:
```typescript
{
  sessionId: string; // 세션 ID (nanoid)
  category: string; // 매칭된 카테고리
  questions: string[]; // 의도 파악 질문 목록 (최대 5개)
  canSkip: boolean; // 질문 건너뛰기 가능 여부
}
```

#### 2.2 의도 파악 질문 응답

사용자는 시스템이 제시한 질문에 답변하거나 건너뛸 수 있습니다. 수집된 답변은 프롬프트 생성에 사용됩니다.

**페이지**: `/intent/:sessionId`

#### 2.3 프롬프트 생성 및 저장

수집된 정보를 바탕으로 LLM(GPT-4)을 호출하여 완성형 프롬프트를 생성합니다. 생성된 프롬프트는 데이터베이스에 저장되며, 사용자는 결과 페이지에서 확인하고 수정할 수 있습니다.

**API 엔드포인트**: `zetaAI.generatePrompt`

**입력**:
```typescript
{
  sessionId: string;
  originalQuestion: string;
  answers: Record<string, string>; // 질문-답변 쌍
  skippedQuestions?: number[]; // 건너뛴 질문 인덱스
}
```

**출력**:
```typescript
{
  promptId: number; // 생성된 프롬프트 ID
  originalQuestion: string;
  generatedPrompt: string; // LLM이 생성한 프롬프트
  suggestedServices: Array<{ name: string; reason: string }>; // 추천 서비스
}
```

**LLM 프롬프트 구조**:
- **시스템 프롬프트**: 최고급 프롬프트 엔지니어 역할, 완성형 프롬프트 생성 지침
- **사용자 프롬프트**: 원본 질문 + 수집된 정보

**데이터베이스 테이블**: `promptHistory`

| 필드 | 타입 | 설명 |
|------|------|------|
| id | int | 프롬프트 고유 ID (PK) |
| userId | int | 사용자 ID (FK) |
| sessionId | varchar(64) | 세션 ID |
| originalQuestion | text | 원본 질문 |
| intentAnswers | text | 의도 파악 답변 (JSON) |
| generatedPrompt | text | 생성된 프롬프트 |
| editedPrompt | text | 사용자가 수정한 프롬프트 |
| usedLLM | varchar(64) | 사용된 LLM 모델 (gpt-4) |
| suggestedServices | text | 추천 서비스 (JSON) |
| createdAt | timestamp | 생성 일시 |
| updatedAt | timestamp | 수정 일시 |

---

### 3. 프롬프트 수정 및 관리

**구현 상태**: ✅ 완료

사용자는 생성된 프롬프트를 수정하고 저장할 수 있습니다.

**API 엔드포인트**: `zetaAI.updatePrompt`

**입력**:
```typescript
{
  promptId: number;
  editedPrompt: string;
}
```

**출력**:
```typescript
{
  success: boolean;
  promptId: number;
}
```

**페이지**: `/result/:promptId`

---

### 4. 대화 내역 조회 및 검색

**구현 상태**: ✅ 완료

사용자는 자신이 생성한 프롬프트 내역을 조회하고 검색할 수 있습니다.

#### 4.1 전체 내역 조회

**API 엔드포인트**: `zetaAI.getHistory`

**출력**: 최근 20개의 프롬프트 내역 (생성 일시 역순)

#### 4.2 검색

**API 엔드포인트**: `zetaAI.searchHistory`

**입력**:
```typescript
{
  query: string; // 검색어
}
```

**검색 범위**: `originalQuestion`, `generatedPrompt`, `editedPrompt`

**출력**: 검색 결과 최대 20개

#### 4.3 단일 대화 조회

**API 엔드포인트**: `zetaAI.getPromptById`

**입력**:
```typescript
{
  promptId: number;
}
```

**출력**: 프롬프트 상세 정보 (의도 답변, 생성/수정 프롬프트, 추천 서비스 포함)

**페이지**: `/history/:id`

---

### 5. 대화 삭제

**구현 상태**: ✅ 완료

사용자는 자신의 프롬프트 내역을 삭제할 수 있습니다. 권한 검증을 통해 본인의 데이터만 삭제 가능합니다.

**API 엔드포인트**: `zetaAI.deleteHistory`

**입력**:
```typescript
{
  promptId: number;
}
```

**출력**:
```typescript
{
  success: boolean;
}
```

---

### 6. 프로젝트 (폴더) 관리

**구현 상태**: ✅ 완료

사용자는 대화를 프로젝트(폴더)로 그룹화하여 관리할 수 있습니다.

#### 6.1 프로젝트 생성

**API 엔드포인트**: `project.create`

**입력**:
```typescript
{
  name: string;
  description?: string;
  color?: string; // Hex color code
  icon?: string; // Icon name or emoji
}
```

**출력**: 생성된 프로젝트 정보

#### 6.2 프로젝트 목록 조회

**API 엔드포인트**: `project.getAll`

**출력**: 사용자의 모든 프로젝트 목록

#### 6.3 프로젝트 상세 조회

**API 엔드포인트**: `project.getById`

**입력**:
```typescript
{
  projectId: number;
}
```

**출력**: 프로젝트 상세 정보

#### 6.4 프로젝트 수정

**API 엔드포인트**: `project.update`

**입력**:
```typescript
{
  projectId: number;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}
```

#### 6.5 프로젝트 삭제

**API 엔드포인트**: `project.delete`

**입력**:
```typescript
{
  projectId: number;
}
```

#### 6.6 프로젝트에 대화 추가

**API 엔드포인트**: `project.addConversation`

**입력**:
```typescript
{
  projectId: number;
  conversationId: number; // promptHistory.id
}
```

#### 6.7 프로젝트에서 대화 제거

**API 엔드포인트**: `project.removeConversation`

**입력**:
```typescript
{
  projectId: number;
  conversationId: number;
}
```

#### 6.8 프로젝트 내 대화 목록 조회

**API 엔드포인트**: `project.getConversations`

**입력**:
```typescript
{
  projectId: number;
}
```

**출력**: 프로젝트에 속한 대화 목록

**데이터베이스 테이블**: `projects`, `projectConversations`

---

### 7. 의도 템플릿 관리

**구현 상태**: ✅ 완료 (시드 데이터 기반)

의도 템플릿은 사용자 질문의 카테고리를 분류하고 적절한 의도 파악 질문을 제공합니다. 현재는 시드 데이터로 관리되며, 관리자 UI는 구현되지 않았습니다.

**데이터베이스 테이블**: `intentTemplate`

| 필드 | 타입 | 설명 |
|------|------|------|
| id | int | 템플릿 고유 ID (PK) |
| category | varchar(128) | 카테고리명 |
| keywords | text | 키워드 목록 (JSON) |
| questions | text | 의도 파악 질문 목록 (JSON) |
| defaultAnswers | text | 기본 답변 (JSON, 선택) |
| createdAt | timestamp | 생성 일시 |
| updatedAt | timestamp | 수정 일시 |

**시드 데이터 예시**:
- 카테고리: "블로그 글 작성", "마케팅 전략", "창의적 아이디어", "일반 질문" 등
- 키워드: 카테고리별 매칭 키워드 배열
- 질문: 각 카테고리에 맞는 의도 파악 질문 5개

---

## UI 구조

### 페이지 라우팅

| 경로 | 컴포넌트 | 설명 | 인증 필요 |
|------|----------|------|-----------|
| `/` | Home | 메인 페이지 (질문 입력) | ❌ |
| `/intent/:sessionId` | IntentClarification | 의도 파악 질문 응답 | ✅ |
| `/result/:promptId` | PromptResult | 생성된 프롬프트 결과 | ✅ |
| `/history` | History | 대화 내역 목록 | ✅ |
| `/history/:id` | ConversationDetail | 대화 상세 조회 | ✅ |
| `/projects` | Projects | 프로젝트 목록 | ✅ |
| `/projects/:id` | ProjectDetail | 프로젝트 상세 | ✅ |
| `/settings` | Settings | 설정 페이지 | ✅ |
| `/404` | NotFound | 404 페이지 | ❌ |

### 레이아웃 구조

**MainLayout**: 모든 페이지를 감싸는 레이아웃
- **Sidebar**: 좌측 사이드바 (토글 가능)
  - 새 채팅 버튼
  - 검색 입력
  - 메뉴 항목: 채팅, 아티팩트(준비중), 프로젝트, Builder Box(준비중)
  - 모든 작업: 최근 대화 목록 (더보기 메뉴: 고정, 이름변경, 삭제)
  - 사용자 프로필 (로그인 시) 또는 로그인 버튼 (비로그인 시)
- **ThemeToggle**: 우측 상단 다크/라이트 모드 전환 버튼

---

## 데이터 흐름

### 프롬프트 생성 플로우

```
1. 사용자 질문 입력 (Home)
   ↓
2. zetaAI.init 호출 → 의도 템플릿 매칭 → sessionId 생성
   ↓
3. 의도 파악 질문 응답 (IntentClarification)
   ↓
4. zetaAI.generatePrompt 호출 → LLM 프롬프트 생성 → DB 저장
   ↓
5. 결과 페이지 표시 (PromptResult)
   ↓
6. (선택) 프롬프트 수정 → zetaAI.updatePrompt 호출
```

### 인증 플로우

```
1. 비로그인 사용자가 로그인 필요 기능 접근
   ↓
2. Manus OAuth 로그인 페이지로 리다이렉트
   ↓
3. 소셜 로그인 (Google/Microsoft/Apple)
   ↓
4. OAuth 콜백 → 세션 쿠키 생성 → 사용자 정보 DB 저장
   ↓
5. 원래 페이지로 리다이렉트
```

---

## 제한 사항 및 미구현 기능

### 현재 제한 사항

1. **의도 템플릿 관리**: 관리자 UI 없음, 시드 데이터로만 관리
2. **프롬프트 템플릿**: `promptTemplates` 테이블 존재하지만 UI 미구현
3. **대화 고정 기능**: 백엔드 API 없음, 프론트엔드에서 "준비중" 토스트만 표시
4. **대화 이름 변경**: 백엔드 API 없음, 프론트엔드에서 다이얼로그만 표시
5. **Builder Box**: 사이드바 메뉴 존재하지만 기능 미구현
6. **아티팩트**: 사이드바 메뉴 존재하지만 기능 미구현
7. **설정 페이지**: 라우팅 존재하지만 내용 미구현

### 알려진 이슈

1. **TypeScript 타입 에러**: `Sidebar.tsx`와 `Projects.tsx`에 tRPC 타입 에러 존재
2. **프로젝트 삭제 API**: 프론트엔드에서 호출하지만 백엔드 라우터에 등록되지 않음

---

## 기술적 의존성

### 외부 서비스

1. **Manus OAuth**: 사용자 인증
2. **LLM (GPT-4)**: 프롬프트 생성 (`server/_core/llm.ts`)
3. **MySQL/TiDB**: 데이터베이스
4. **S3**: 파일 저장 (설정되어 있지만 현재 미사용)

### 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| DATABASE_URL | MySQL/TiDB 연결 문자열 | ✅ |
| JWT_SECRET | 세션 쿠키 서명 키 | ✅ |
| VITE_APP_ID | Manus OAuth 앱 ID | ✅ |
| OAUTH_SERVER_URL | Manus OAuth 서버 URL | ✅ |
| VITE_OAUTH_PORTAL_URL | Manus OAuth 포털 URL (프론트엔드) | ✅ |
| OWNER_OPEN_ID | 소유자 OpenID | ✅ |
| OWNER_NAME | 소유자 이름 | ✅ |
| BUILT_IN_FORGE_API_URL | Manus 내장 API URL | ✅ |
| BUILT_IN_FORGE_API_KEY | Manus 내장 API 키 (서버) | ✅ |
| VITE_FRONTEND_FORGE_API_KEY | Manus 내장 API 키 (프론트엔드) | ✅ |
| VITE_FRONTEND_FORGE_API_URL | Manus 내장 API URL (프론트엔드) | ✅ |

---

## 버전 히스토리

### v1.0.0 (2026-01-29)

- 초기 명세서 작성
- 현재 구현된 기능 문서화
- 데이터 흐름 및 API 엔드포인트 정리
