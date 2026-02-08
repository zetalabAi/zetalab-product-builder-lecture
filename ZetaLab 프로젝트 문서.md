# ZetaLab 프로젝트 문서

**프로젝트명:** ZetaLab - Zeta AI 프롬프트 생성 플랫폼  
**버전:** 3b0bd299  
**작성일:** 2026년 2월 6일

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [디자인 시스템](#디자인-시스템)
3. [페이지별 상세 명세](#페이지별-상세-명세)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 엔드포인트](#api-엔드포인트)
6. [기술 스택](#기술-스택)

---

## 프로젝트 개요

ZetaLab은 사용자의 의도를 명확히 파악하여 고품질 프롬프트를 생성하는 AI 기반 플랫폼입니다. Intent Clarification 시스템을 통해 사용자의 요구사항을 5가지 질문으로 구체화하고, Google Gemini AI가 최적화된 프롬프트를 생성합니다.

### 핵심 기능
- **Intent Clarification**: 5개 질문으로 사용자 의도 명확화
- **프롬프트 생성**: Google Gemini AI 기반 고품질 프롬프트 자동 생성
- **프롬프트 저장 및 버전 관리**: 생성된 프롬프트를 자산으로 저장하고 버전별 관리
- **프로젝트 관리**: 대화 기록을 프로젝트별로 분류 및 관리
- **추천 서비스**: 생성된 프롬프트에 적합한 Zeta 서비스 추천

### 기술 스택 변경 이력
이 프로젝트는 확장성과 유지보수성을 위해 다음과 같이 기술 스택을 전환했습니다:

**이전 (Manus 기반):**
- MySQL + Drizzle ORM
- Manus OAuth 인증
- Manus LLM API

**현재 (Firebase/Google 기반):**
- Firestore (NoSQL 데이터베이스)
- Firebase Authentication (Google Sign-In)
- Google Gemini API (gemini-2.0-flash-exp)

이러한 전환을 통해 플랫폼 독립성을 확보하고, Google의 최신 AI 기술을 활용할 수 있게 되었습니다.

---

## 디자인 시스템

### 디자인 철학
ZetaLab은 **ChatGPT 스타일의 라이트 모드**를 기반으로 하며, 간결하고 직관적인 사용자 경험을 제공합니다.

### 컬러 시스템 (OKLCH 기반)

#### 라이트 모드
```css
--color-background: oklch(0.99 0 0)      /* 밝은 회색 배경 */
--color-foreground: oklch(0.15 0 0)      /* 진한 검정 텍스트 */
--color-card: oklch(1 0 0)                /* 순백 카드 */
--color-primary: oklch(0.15 0 0)          /* 검정 주요 색상 */
--color-secondary: oklch(0.96 0 0)        /* 연한 회색 보조 색상 */
--color-muted: oklch(0.96 0 0)            /* 음소거 색상 */
--color-muted-foreground: oklch(0.45 0 0) /* 중간 회색 텍스트 */
--color-accent: oklch(0.96 0 0)           /* 강조 색상 */
--color-destructive: oklch(0.58 0.22 25)  /* 빨간색 (삭제/경고) */
--color-border: oklch(0.92 0 0)           /* 테두리 색상 */
--color-sidebar: oklch(0.99 0 0)          /* 사이드바 배경 */
```

#### 다크 모드
```css
--color-background: oklch(0.15 0 0)       /* 진한 검정 배경 */
--color-foreground: oklch(0.95 0 0)       /* 밝은 흰색 텍스트 */
--color-card: oklch(0.18 0 0)             /* 어두운 카드 */
--color-primary: oklch(0.95 0 0)          /* 흰색 주요 색상 */
--color-secondary: oklch(0.22 0 0)        /* 어두운 보조 색상 */
--color-border: oklch(0.25 0 0)           /* 어두운 테두리 */
```

### 타이포그래피

**폰트 패밀리:**
```
"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, 
system-ui, Roboto, "Helvetica Neue", "Segoe UI", 
"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif
```

**폰트 특징:**
- 가변 폰트(Variable Font) 사용으로 다양한 굵기 지원
- 한글 최적화 (Pretendard)
- 시스템 폰트 폴백 지원

### 레이아웃 구조

#### 컨테이너
- **최대 너비**: 48rem (768px)
- **좌우 패딩**: 1rem (16px)
- **중앙 정렬**: margin-left/right: auto

#### Border Radius
- **기본**: 0.5rem (8px)
- **입력창**: 1.5rem (24px) - 라이트 모드, 1.25rem (20px) - 모바일
- **카드**: 1rem (16px)

### 컴포넌트 스타일

#### 버튼 (chat-button)
```css
border-radius: 0.5rem
font-weight: 500
transition: all 0.2s
hover: background-color: var(--color-secondary)
```

#### 카드 (message-card, feature-card)
```css
border-radius: 1rem
border-width: 1px
border-color: var(--color-border)
background-color: var(--color-card)
padding: 1.5rem
transition: all 0.2s/0.3s

hover:
  border-color: var(--color-primary) / var(--color-muted-foreground)
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) / 0 4px 12px rgba(0, 0, 0, 0.1)
  transform: translateY(-2px) (feature-card만)
```

#### 입력창 (chat-input-wrapper)
```css
position: relative
border-radius: 1.5rem
border-width: 1px
border-color: var(--color-border)
background-color: var(--color-card)
box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05)
transition: all 0.2s

focus-within:
  border-color: var(--color-primary)
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1)
```

### 스크롤바 스타일
```css
width: 6px
track: transparent
thumb: var(--color-muted)
thumb-hover: var(--color-muted-foreground)
border-radius: 3px
```

### 모바일 최적화

#### 터치 최적화
```css
touch-action: manipulation
-webkit-tap-highlight-color: transparent
```

#### 키보드 대응
```css
body {
  padding-bottom: var(--keyboard-height)
  transition: padding-bottom 0.3s ease
}
```

#### 성능 최적화
```css
animation-duration: 100ms !important
transition-duration: 100ms !important
```

#### 최소 터치 영역
```css
feature-card {
  min-height: 44px
}
```

---

## 페이지별 상세 명세

### 1. 홈 페이지 (`/`)

**파일:** `client/src/pages/Home.tsx`

**목적:** ZetaLab의 랜딩 페이지이자 프롬프트 생성 시작점

**주요 구성 요소:**

1. **헤더 섹션**
   - 타이틀: "Zeta AI"
   - 서브타이틀: "무엇이든 물어보세요. 막연해도 좋아요."

2. **메시지 입력 영역**
   - 플레이스홀더: "메시지를 입력하세요..."
   - 전송 버튼 (Send 아이콘)
   - Shift + Enter로 줄바꿈, Enter로 전송

3. **AI 프롬프트 생성 예시 (4개 카드)**
   - 블로그 글 작성
   - 마케팅 전략
   - 창의적 아이디어
   - 비즈니스 제안

4. **추천 서비스 섹션 (4개 카드)**
   - Zeta Blog: 블로그 포스트 작성
   - Zeta Shorts: 짧은 형식 콘텐츠
   - Zeta PPT: 프레젠테이션 자료
   - Zeta Docs: 문서 작성 및 정리

5. **ZetaLab의 특별한 기능 (3개 카드)**
   - 의도 파악: Intent Clarification 시스템
   - 초고급 프롬프트: 전문가 수준 프롬프트 생성
   - 즉시 실행: 생성된 프롬프트를 바로 사용

**사용자 플로우:**
1. 사용자가 메시지 입력
2. Intent Clarification 페이지로 이동 (`/intent-clarification`)

---

### 2. Intent Clarification 페이지 (`/intent-clarification`)

**파일:** `client/src/pages/IntentClarification.tsx`

**목적:** 사용자의 의도를 5가지 질문으로 명확히 파악

**주요 구성 요소:**

1. **헤더**
   - 뒤로가기 버튼 (← 아이콘)
   - 타이틀: "의도 파악"
   - 진행 상황 표시: "1/5", "2/5", ..., "5/5"

2. **질문 카드**
   - 질문 번호 및 텍스트
   - 텍스트 입력 영역 (textarea)
   - 플레이스홀더: "답변을 입력하세요..."

3. **네비게이션 버튼**
   - 이전 버튼 (첫 번째 질문에서는 비활성화)
   - 다음 버튼 / 완료 버튼 (마지막 질문)

4. **5가지 질문 (예시)**
   - 질문 1: "구체적으로 어떤 도움이 필요한가요?"
   - 질문 2: "최종 목표는 무엇인가요?"
   - 질문 3: "대상 독자는 누구인가요?"
   - 질문 4: "어떤 톤으로 작성하고 싶으신가요?"
   - 질문 5: "추가로 고려해야 할 사항이 있나요?"

**사용자 플로우:**
1. 사용자가 5개 질문에 순차적으로 답변
2. "완료" 버튼 클릭 시 백엔드로 답변 전송
3. Zeta AI가 프롬프트 생성
4. PromptResult 페이지로 이동 (`/prompt/:id`)

**데이터 흐름:**
```
사용자 답변 → trpc.promptHistory.create → 
Zeta AI 프롬프트 생성 → promptHistory 저장 → 
PromptResult 페이지 표시
```

---

### 3. PromptResult 페이지 (`/prompt/:id`)

**파일:** `client/src/pages/PromptResult.tsx`

**목적:** 생성된 프롬프트를 표시하고 편집/저장 기능 제공

**주요 구성 요소:**

1. **헤더**
   - 뒤로가기 버튼
   - 타이틀: "생성된 프롬프트"

2. **원본 질문 섹션**
   - 사용자가 입력한 초기 질문 표시
   - 회색 박스로 구분

3. **생성된 프롬프트 섹션**
   - 프롬프트 텍스트 표시
   - 편집 가능한 textarea
   - 복사 버튼 (Clipboard 아이콘)
   - 저장 버튼 (Save 아이콘)

4. **프롬프트 변형 버튼 (미구현)**
   - 더 공격적으로
   - 더 초보자용으로
   - 더 상세하게
   - 더 간결하게

5. **추천 서비스 섹션**
   - Zeta Blog, Zeta Shorts, Zeta PPT, Zeta Docs
   - 각 서비스의 추천 이유 표시
   - 클릭 시 "Coming Soon" 토스트

**사용자 플로우:**
1. 생성된 프롬프트 확인
2. 필요시 프롬프트 편집
3. 복사 버튼으로 클립보드에 복사
4. 저장 버튼으로 프롬프트 자산으로 저장 → My Work에 추가

**데이터 흐름:**
```
promptHistory.id로 조회 → 
프롬프트 표시 → 
저장 시 promptAssets + promptVersions 생성
```

---

### 4. My Work 페이지 (`/my-work`)

**파일:** `client/src/pages/MyWork.tsx`

**목적:** 사용자가 저장한 프롬프트 자산 목록 표시

**주요 구성 요소:**

1. **헤더**
   - 타이틀: "내 작업"
   - 설명: "저장된 프롬프트를 관리하세요"

2. **프롬프트 자산 목록**
   - 카드 형태로 표시
   - 각 카드 정보:
     - 프롬프트 이름
     - 설명 (있을 경우)
     - 버전 개수 (예: "v3")
     - 마지막 수정 시간
     - 성공 상태 배지 (성공/실패/미평가)

3. **빈 상태**
   - 저장된 프롬프트가 없을 때 표시
   - "아직 저장된 프롬프트가 없습니다"
   - "새 프롬프트 생성하기" 버튼

4. **액션**
   - 카드 클릭 시 PromptVersions 페이지로 이동

**사용자 플로우:**
1. 저장된 프롬프트 목록 확인
2. 프롬프트 카드 클릭
3. PromptVersions 페이지로 이동 (`/prompt/:assetId/versions`)

**데이터 흐름:**
```
trpc.promptAsset.getMyAssets → 
promptAssets 목록 표시 → 
클릭 시 버전 페이지로 이동
```

---

### 5. PromptVersions 페이지 (`/prompt/:assetId/versions`)

**파일:** `client/src/pages/PromptVersions.tsx`

**목적:** 특정 프롬프트 자산의 모든 버전 표시 및 관리

**주요 구성 요소:**

1. **헤더**
   - 뒤로가기 버튼
   - 프롬프트 자산 이름
   - 설명 (있을 경우)

2. **버전 목록 (아코디언)**
   - 각 버전 카드:
     - 버전 번호 (v1, v2, v3...)
     - 생성 일시
     - 성공 상태 배지
     - 사용한 LLM 정보

3. **버전 상세 (확장 시)**
   - 생성된 프롬프트 텍스트
   - 수정된 프롬프트 (있을 경우)
   - 복사 버튼 (각각)
   - Intent 답변 표시 (선택사항)

4. **액션 버튼**
   - 프롬프트 삭제 버튼 (Trash 아이콘)

**사용자 플로우:**
1. 버전 목록 확인
2. 특정 버전 클릭하여 상세 내용 확인
3. 프롬프트 복사 또는 삭제

**데이터 흐름:**
```
promptAssetId로 promptVersions 조회 → 
버전 목록 표시 → 
복사/삭제 액션
```

---

### 6. Projects 페이지 (`/prompts`)

**파일:** `client/src/pages/Projects.tsx`

**목적:** 프로젝트 목록 표시 및 관리

**주요 구성 요소:**

1. **헤더**
   - 타이틀: "프롬프트"
   - 새 프로젝트 생성 버튼

2. **프로젝트 목록**
   - 카드 형태로 표시
   - 각 프로젝트 정보:
     - 아이콘
     - 프로젝트 이름
     - 설명
     - 대화 개수

3. **빈 상태**
   - 프로젝트가 없을 때 표시
   - "새 프로젝트 생성하기" 버튼

**사용자 플로우:**
1. 프로젝트 목록 확인
2. 프로젝트 클릭 시 ProjectDetail 페이지로 이동

---

### 7. ProjectDetail 페이지 (`/prompts/:id`)

**파일:** `client/src/pages/ProjectDetail.tsx`

**목적:** 특정 프로젝트의 대화 기록 표시

**주요 구성 요소:**

1. **헤더**
   - 뒤로가기 버튼
   - 프로젝트 이름
   - 편집 버튼

2. **대화 기록 목록**
   - 각 대화 카드:
     - 원본 질문
     - 생성 일시
     - 고정 상태 (isPinned)

3. **빈 상태**
   - 대화가 없을 때 표시

**사용자 플로우:**
1. 대화 기록 확인
2. 대화 클릭 시 PromptResult 페이지로 이동

---

### 8. History 페이지 (`/artifacts`)

**파일:** `client/src/pages/History.tsx`

**목적:** 모든 프롬프트 생성 기록 표시

**주요 구성 요소:**

1. **헤더**
   - 타이틀: "아티팩트"

2. **기록 목록**
   - 각 기록 카드:
     - 원본 질문
     - 생성 일시
     - 고정 상태

3. **필터 및 검색**
   - 날짜별 필터
   - 검색 기능

---

### 9. Settings 페이지 (`/settings`)

**파일:** `client/src/pages/Settings.tsx`

**목적:** 사용자 설정 관리

**주요 구성 요소:**

1. **프로필 섹션**
   - 사용자 이름
   - 이메일
   - 로그인 방법

2. **테마 설정**
   - 라이트 모드 / 다크 모드 전환

3. **계정 관리**
   - 로그아웃 버튼

---

### 10. 기타 페이지

- **NotFound (`/404`)**: 404 에러 페이지
- **ServerError (`/500`)**: 서버 에러 페이지
- **Terms (`/terms`)**: 이용약관
- **Privacy (`/privacy`)**: 개인정보 처리방침
- **Feedback (`/feedback`)**: 피드백 제출

---

## 데이터베이스 스키마 (Firestore)

### 컬렉션 구조

```
users (사용자)
  ├─ promptAssets (프롬프트 자산)
  │    └─ promptVersions (프롬프트 버전)
  ├─ conversations (프롬프트 기록, 구 promptHistory)
  ├─ promptTemplates (프롬프트 템플릿)
  └─ projects (프로젝트)
       └─ projectConversations (프로젝트-대화 연결)

intentTemplates (Intent 템플릿, 최상위 컬렉션)
```

### 컬렉션 상세

#### 1. users (사용자)
```typescript
{
  uid: string              // Firebase Auth UID (문서 ID로 사용)
  name: string | null
  email: string | null
  loginMethod: string      // 'google', 'email' 등
  role: 'user' | 'admin'
  manusLinked: number      // 0=미연결, 1=연결
  createdAt: Timestamp
  updatedAt: Timestamp
  lastSignedIn: Timestamp
}
```

#### 2. promptAssets (프롬프트 자산)
```typescript
{
  id: string               // 자동 생성 문서 ID
  userId: string           // users 컬렉션 참조
  name: string             // 프롬프트 이름
  description: string | null
  originalQuestion: string // 원본 질문
  currentVersionId: number | null
  versionCount: number     // 기본값 1
  lastUsedAt: Timestamp | null
  lastModifiedAt: Timestamp
  successStatus: number    // 0=미평가, 1=성공, -1=실패
  projectId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 3. promptVersions (프롬프트 버전)
```typescript
{
  id: string               // 자동 생성 문서 ID
  promptAssetId: string    // promptAssets 참조
  userId: string           // users 참조
  versionNumber: number    // 1, 2, 3...
  generatedPrompt: string  // 생성된 프롬프트
  editedPrompt: string | null
  intentAnswers: string | null  // JSON 문자열
  usedLLM: string         // 'gemini-2.0-flash-exp' 등
  suggestedServices: string | null  // JSON 문자열
  notes: string | null
  successStatus: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 4. conversations (프롬프트 기록, 구 promptHistory)
```typescript
{
  id: string               // 자동 생성 문서 ID
  userId: string
  sessionId: string
  originalQuestion: string
  intentAnswers: string | null  // JSON 문자열
  generatedPrompt: string
  editedPrompt: string | null
  usedLLM: string
  suggestedServices: string | null  // JSON 문자열
  isPinned: number         // 0=미고정, 1=고정
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 5. promptTemplates (프롬프트 템플릿)
```typescript
{
  id: string               // 자동 생성 문서 ID
  userId: string
  title: string
  description: string | null
  templateContent: string
  category: string | null
  tags: string | null      // JSON 배열 문자열
  isPublic: number         // 0=비공개, 1=공개
  usageCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 6. intentTemplates (Intent 템플릿)
```typescript
{
  id: string               // 자동 생성 문서 ID
  category: string         // '블로그', '영상', 'PPT' 등
  keywords: string         // JSON 배열 문자열
  questions: string        // JSON 배열 문자열
  defaultAnswers: string | null  // JSON 객체 문자열
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 7. projects (프로젝트)
```typescript
{
  id: string               // 자동 생성 문서 ID
  userId: string
  name: string
  description: string | null
  color: string | null     // Hex 컬러 코드
  icon: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 8. projectConversations (프로젝트-대화 연결)
```typescript
{
  id: string               // 자동 생성 문서 ID
  projectId: string        // projects 참조
  conversationId: string   // conversations 참조
  addedAt: Timestamp
}
```

### Firestore 특징
- **자동 생성 ID**: 모든 문서는 Firestore가 자동 생성한 ID 사용
- **타임스탬프**: Firebase Admin SDK의 `FieldValue.serverTimestamp()` 사용
- **관계**: 외래 키 대신 문서 ID로 참조 관계 표현
- **JSON 필드**: 복잡한 데이터는 JSON 문자열로 저장 후 파싱

---

## API 엔드포인트

### tRPC 라우터 구조

```
trpc
├─ auth
│  ├─ me (GET) - 현재 사용자 정보
│  ├─ logout (POST) - 로그아웃
│  └─ updateManusLinked (POST) - Manus 연결 상태 업데이트
├─ zetaAI (프롬프트 생성 플로우)
│  ├─ init (POST) - 세션 초기화 및 Intent 질문 가져오기
│  ├─ generatePrompt (POST) - Intent 답변으로 프롬프트 생성
│  ├─ updatePrompt (PUT) - 생성된 프롬프트 수정
│  ├─ getHistory (GET) - 내 프롬프트 기록 목록
│  ├─ getPromptById (GET) - 특정 프롬프트 조회
│  ├─ searchHistory (GET) - 프롬프트 검색
│  ├─ deleteHistory (DELETE) - 프롬프트 삭제
│  ├─ renamePrompt (PUT) - 프롬프트 이름 변경
│  ├─ pinPrompt (PUT) - 프롬프트 고정/해제
│  └─ deletePrompt (DELETE) - 프롬프트 삭제 (별칭)
├─ promptAsset (프롬프트 자산 관리)
│  ├─ saveAsset (POST) - 프롬프트를 자산으로 저장
│  ├─ getMyAssets (GET) - 내 자산 목록
│  ├─ getAssetVersions (GET) - 자산의 버전 목록
│  ├─ updateAssetName (PUT) - 자산 이름 수정
│  ├─ markAsUsed (PUT) - 사용 시간 업데이트
│  ├─ markAsSuccess (PUT) - 성공 상태 업데이트
│  └─ deleteAsset (DELETE) - 자산 삭제
├─ project
│  ├─ create (POST) - 프로젝트 생성
│  ├─ getAll (GET) - 내 프로젝트 목록
│  ├─ getById (GET) - 특정 프로젝트 조회
│  ├─ update (PUT) - 프로젝트 수정
│  ├─ delete (DELETE) - 프로젝트 삭제
│  ├─ addConversation (POST) - 대화 추가
│  ├─ removeConversation (DELETE) - 대화 제거
│  └─ getConversations (GET) - 프로젝트의 대화 목록
├─ promptTemplate
│  ├─ create (POST) - 템플릿 생성
│  ├─ list (GET) - 내 템플릿 목록
│  ├─ getById (GET) - 특정 템플릿 조회
│  ├─ update (PUT) - 템플릿 수정
│  ├─ delete (DELETE) - 템플릿 삭제
│  └─ use (POST) - 템플릿 사용 (사용 횟수 증가)
└─ feedback
   └─ submit (POST) - 피드백 제출
```

### 주요 API 예시

#### 1. Intent Clarification 초기화
```typescript
trpc.zetaAI.init.useMutation({
  question: string
})
// 반환: { sessionId, category, questions[], canSkip }
```

#### 2. 프롬프트 생성
```typescript
trpc.zetaAI.generatePrompt.useMutation({
  sessionId: string,
  originalQuestion: string,
  answers: Record<string, string>,
  skippedQuestions?: number[]
})
// 반환: { promptId, originalQuestion, generatedPrompt, suggestedServices }
```

#### 3. 프롬프트 자산 저장
```typescript
trpc.promptAsset.saveAsset.useMutation({
  name: string,
  description?: string,
  originalQuestion: string,
  generatedPrompt: string,
  editedPrompt?: string,
  intentAnswers?: Record<string, string>,
  usedLLM?: string,
  suggestedServices?: Array<{ name: string, reason: string }>,
  projectId?: number
})
// 반환: { success, assetId, versionId, message }
```

#### 4. 버전 조회
```typescript
trpc.promptAsset.getAssetVersions.useQuery({
  assetId: number
})
```

### 인증 플로우 (Firebase)

#### 1. Google 로그인
```typescript
// 클라이언트: Firebase Auth로 로그인
import { signInWithGoogle } from '@/lib/firebase'
const user = await signInWithGoogle()

// ID 토큰을 백엔드로 전송하여 세션 쿠키 생성
POST /api/firebase/sessionLogin
Body: { idToken: string }
```

#### 2. 세션 확인
```typescript
// tRPC context에서 자동으로 세션 확인
// 쿠키의 세션 토큰을 Firebase Admin SDK로 검증
```

#### 3. 로그아웃
```typescript
trpc.auth.logout.useMutation()
// 세션 쿠키 삭제
```

---

## 기술 스택

### 프론트엔드
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Tailwind CSS 4**: 스타일링 (OKLCH 컬러 시스템)
- **Wouter**: 라우팅
- **tRPC 11**: 타입 안전 API 클라이언트
- **Lucide React**: 아이콘
- **Sonner**: 토스트 알림

### 백엔드
- **Express 4**: 웹 서버
- **tRPC 11**: API 라우터
- **Firebase Admin SDK**: 백엔드 Firebase 통합
- **Firestore**: NoSQL 데이터베이스
- **Firebase Authentication**: 인증 시스템 (Google Sign-In)
- **Google Gemini API**: AI 프롬프트 생성 (gemini-2.0-flash-exp)

### 개발 도구
- **Vite 6**: 빌드 도구
- **Vitest**: 테스트 프레임워크
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅
- **tsx**: TypeScript 실행 환경

### 배포
- **Firebase Hosting**: 정적 파일 호스팅
- **Firebase Functions**: 서버리스 백엔드 (선택사항)
- **커스텀 도메인 지원**
- **자동 HTTPS 및 CDN**

---

## 사용자 플로우 다이어그램

```
[홈 페이지] (비로그인 상태 접근 가능)
    ↓ (메시지 입력)
[로그인 게이트] (Firebase Google Sign-In)
    ↓ (인증 완료)
[Intent Clarification] (zetaAI.init → sessionId 발급)
    ↓ (5개 질문 답변)
[Gemini API 호출] (zetaAI.generatePrompt)
    ↓ (프롬프트 생성 완료)
[PromptResult] (conversations 컬렉션에 저장)
    ↓ (저장 버튼 클릭)
[My Work] ← promptAssets 컬렉션에 자산으로 저장
    ↓ (프롬프트 클릭)
[PromptVersions] ← promptVersions 컬렉션에서 버전 관리
```

### 데이터 흐름

```
사용자 입력
  → zetaAI.init (intentTemplates 매칭)
  → IntentClarification 페이지 (질문 표시)
  → zetaAI.generatePrompt (Gemini API 호출)
  → conversations 컬렉션 저장
  → PromptResult 페이지 표시
  → (선택) promptAsset.saveAsset
  → promptAssets + promptVersions 생성
  → My Work 페이지에서 조회 가능
```

---

## 향후 개발 계획

1. **프롬프트 변형 기능**: "더 공격적으로", "더 초보자용으로" 등 변형 버튼 구현

---

## 문서 변경 이력

### v2.0 (2026년 2월 7일)
- 기술 스택을 Firebase/Google 기반으로 전면 업데이트
- 데이터베이스: MySQL → Firestore 마이그레이션
- 인증: Manus OAuth → Firebase Authentication
- LLM: Manus API → Google Gemini API
- API 라우터 구조 업데이트 (zetaAI 라우터 추가)
- 향후 개발 계획 축소 (프롬프트 변형 기능만 유지)
- 사용자 플로우 및 데이터 흐름 다이어그램 업데이트

### v1.1 (2026년 2월 7일)
- 향후 개발 계획에서 불필요한 기능 제거

### v1.0 (2026년 2월 6일)
- 초기 문서 작성

---

**문서 버전:** 2.0
**최종 업데이트:** 2026년 2월 7일
