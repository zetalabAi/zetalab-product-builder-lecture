# ZetaLab 종합 기술문서

**버전:** 2.0.0 (Firebase Edition)  
**최종 업데이트:** 2026년 2월 3일  
**상태:** Production Ready  
**배포 환경:** Firebase (Cloud Functions, Firestore, Hosting)

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [기술 스택](#기술-스택)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 문서](#api-문서)
6. [프론트엔드 구조](#프론트엔드-구조)
7. [백엔드 구조](#백엔드-구조)
8. [LLM 통합 (Codex, Gemini, Claude)](#llm-통합)
9. [인증 및 보안](#인증-및-보안)
10. [Firebase 배포](#firebase-배포)
11. [성능 최적화](#성능-최적화)
12. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 서비스 설명

**ZetaLab**은 AI 기반 프롬프트 생성 플랫폼입니다. 사용자의 자연어 질문을 받아 Intent 질문 시스템을 통해 사용자의 의도를 정확히 파악한 후, 다양한 LLM API(Codex, Gemini, Claude)를 활용하여 다른 AI 모델에 바로 적용 가능한 완성형 프롬프트를 자동으로 생성합니다.

### 핵심 가치 제안

| 항목 | 내용 |
|------|------|
| **시간 절약** | 프롬프트 작성 시간 85-90% 단축 |
| **품질 향상** | 완성형 프롬프트로 즉시 사용 가능 |
| **재사용성** | 생성된 프롬프트 히스토리 및 프로젝트 관리 |
| **사용 편의성** | ChatGPT 수준의 직관적 UI/UX |
| **다중 LLM 지원** | Codex, Gemini, Claude 중 선택 가능 |

### 타겟 사용자

- 콘텐츠 크리에이터 (블로그, 유튜브, SNS)
- 마케터 및 기획자
- 개발자
- 학생 및 취준생
- 소상공인

---

## 아키텍처

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 브라우저                          │
│                   (React 19 + Tailwind 4)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP/WebSocket
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼────────────────────┐    ┌──────────────▼──────────┐
│  Firebase Hosting          │    │  Firebase Storage       │
│  (Frontend + Static)       │    │  (CDN)                  │
│  - Home (질문 입력)        │    │  - Images               │
│  - IntentClarification     │    │  - Fonts                │
│  - PromptResult (결과)     │    │  - Icons                │
│  - History (히스토리)      │    └─────────────────────────┘
│  - Projects (프로젝트)     │
│  - Settings (설정)         │
└───────┬────────────────────┘
        │
        │  REST API / tRPC
        │
┌───────▼────────────────────────────────────────────────────┐
│         Firebase Cloud Functions (Backend)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  tRPC Router (Type-safe API)                         │  │
│  │  ├─ auth (로그인/로그아웃)                            │  │
│  │  ├─ zetaAI (프롬프트 생성)                           │  │
│  │  ├─ project (프로젝트 관리)                          │  │
│  │  └─ system (시스템)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firebase Authentication                             │  │
│  │  - Google Sign-In                                    │  │
│  │  - Email/Password                                    │  │
│  │  - Custom Claims (역할 관리)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LLM Integration Layer                               │  │
│  │  ├─ OpenAI Codex API                                 │  │
│  │  ├─ Google Gemini API                                │  │
│  │  └─ Anthropic Claude API                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬────────────────────────────────────────────────────┘
        │
        │  Firestore SDK
        │
┌───────▼────────────────────────────────────────────────────┐
│           Firestore Database (NoSQL)                        │
│  ├─ users (사용자)                                         │
│  ├─ promptHistory (생성 이력)                              │
│  ├─ intentTemplate (Intent 질문 템플릿)                    │
│  ├─ projects (프로젝트)                                    │
│  ├─ projectConversations (프로젝트-대화 관계)              │
│  └─ promptTemplates (저장된 템플릿)                        │
└────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
1. 사용자 질문 입력
   ↓
2. Intent 질문 생성 (zetaAI.init)
   - 질문 키워드 분석
   - 매칭되는 Intent 템플릿 선택
   - 5개 세부 질문 반환
   ↓
3. 사용자 답변 수집
   ↓
4. LLM 선택 (사용자 선택 또는 자동)
   - Codex (코드 생성 최적화)
   - Gemini (다목적)
   - Claude (긴 문맥 처리)
   ↓
5. 프롬프트 생성 (zetaAI.generatePrompt)
   - 사용자 답변 + 원본 질문 조합
   - 선택된 LLM API 호출
   - 완성형 프롬프트 생성
   ↓
6. 결과 저장 (Firestore)
   - promptHistory 컬렉션에 저장
   - 사용자 히스토리 조회 가능
   ↓
7. 프로젝트 관리
   - 생성된 프롬프트를 프로젝트에 추가
   - 폴더 형태로 정리
```

---

## 기술 스택

### 프론트엔드

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | React | 19.2.1 | UI 렌더링 |
| **번들러** | Vite | 7.1.7 | 빌드 및 개발 서버 |
| **스타일링** | Tailwind CSS | 4.1.14 | 유틸리티 기반 CSS |
| **UI 컴포넌트** | shadcn/ui | - | Radix UI 기반 컴포넌트 |
| **라우팅** | Wouter | 3.3.5 | 경량 라우터 |
| **상태 관리** | React Query | 5.90.2 | 서버 상태 관리 |
| **폼 관리** | React Hook Form | 7.64.0 | 폼 상태 및 검증 |
| **알림** | Sonner | 2.0.7 | Toast 알림 |
| **아이콘** | Lucide React | 0.453.0 | SVG 아이콘 |
| **날짜** | date-fns | 4.1.0 | 날짜 포맷팅 |
| **애니메이션** | Framer Motion | 12.23.22 | 모션 애니메이션 |
| **테마** | next-themes | 0.4.6 | 다크/라이트 모드 |
| **Firebase** | firebase | ^10.0.0 | 인증 및 데이터베이스 |

### 백엔드

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **런타임** | Node.js | 22.13.0 | JavaScript 런타임 |
| **프레임워크** | Express.js | 4.21.2 | HTTP 서버 (로컬 개발용) |
| **서버리스** | Firebase Cloud Functions | - | 프로덕션 백엔드 |
| **RPC** | tRPC | 11.6.0 | Type-safe RPC |
| **데이터베이스** | Firestore | - | NoSQL 데이터베이스 |
| **검증** | Zod | 4.1.12 | 스키마 검증 |
| **JWT** | firebase-admin | ^12.0.0 | 토큰 관리 |
| **S3 대체** | Firebase Storage | - | 파일 저장소 |

### LLM API

| LLM | 제공자 | 용도 | 비용 |
|-----|--------|------|------|
| **Codex** | OpenAI | 코드 생성, 프로그래밍 | $0.02/1K tokens |
| **Gemini** | Google | 다목적 텍스트 생성 | $0.00075/1K input, $0.003/1K output |
| **Claude** | Anthropic | 긴 문맥, 복잡한 작업 | $0.003/1K input, $0.015/1K output |

### 개발 도구

| 도구 | 버전 | 용도 |
|------|------|------|
| **TypeScript** | 5.9.3 | 타입 안전성 |
| **Vitest** | 2.1.4 | 단위 테스트 |
| **Prettier** | 3.6.2 | 코드 포맷팅 |
| **ESBuild** | 0.25.0 | 번들링 |
| **Firebase CLI** | ^13.0.0 | Firebase 배포 |

---

## 데이터베이스 스키마

### Firestore 컬렉션 구조

#### 1. users 컬렉션

**사용자 정보 저장**

```javascript
// Document ID: uid (Firebase Auth UID)
{
  uid: string,                    // Firebase 고유 ID
  email: string,                  // 이메일
  displayName: string,            // 사용자명
  photoURL: string,               // 프로필 사진 URL
  role: 'user' | 'admin',         // 역할
  plan: 'free' | 'starter' | 'pro' | 'business',  // 요금제
  credits: number,                // 남은 크레딧
  monthlyCredits: number,         // 월별 크레딧
  manusLinked: boolean,           // Manus 연동 여부
  createdAt: Timestamp,           // 생성 시간
  updatedAt: Timestamp,           // 수정 시간
  lastSignedIn: Timestamp         // 마지막 로그인
}
```

#### 2. promptHistory 컬렉션

**생성된 프롬프트 이력 저장**

```javascript
// Document ID: auto-generated
{
  userId: string,                 // users.uid 참조
  sessionId: string,              // 세션 고유 ID
  originalQuestion: string,       // 원본 질문
  intentAnswers: {                // Intent 질문 답변
    [questionIndex]: string
  },
  generatedPrompt: string,        // AI 생성 프롬프트
  editedPrompt: string,           // 사용자 수정 프롬프트
  usedLLM: 'codex' | 'gemini' | 'claude',  // 사용 LLM
  llmModel: string,               // 모델명 (gpt-3.5-turbo, gemini-pro 등)
  creditsUsed: number,            // 사용한 크레딧
  suggestedServices: Array,       // 추천 서비스
  isPinned: boolean,              // 즐겨찾기 여부
  createdAt: Timestamp,           // 생성 시간
  updatedAt: Timestamp            // 수정 시간
}
```

#### 3. intentTemplate 컬렉션

**Intent 질문 템플릿 저장**

```javascript
// Document ID: auto-generated
{
  category: string,               // 카테고리 (블로그, 영상 등)
  keywords: string[],             // 매칭 키워드
  questions: string[],            // 질문 목록 (5개)
  defaultAnswers: {               // 기본 답변 (선택사항)
    [questionIndex]: string
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4. projects 컬렉션

**사용자 프로젝트 저장**

```javascript
// Document ID: auto-generated
{
  userId: string,                 // users.uid 참조
  name: string,                   // 프로젝트명
  description: string,            // 설명
  color: string,                  // Hex 색상 (#RRGGBB)
  icon: string,                   // 아이콘 (이모지 또는 이름)
  conversationCount: number,      // 포함된 프롬프트 수
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 5. projectConversations 서브컬렉션

**프로젝트 내 프롬프트 관계**

```javascript
// Path: projects/{projectId}/conversations/{conversationId}
{
  conversationId: string,         // promptHistory.id 참조
  addedAt: Timestamp
}
```

#### 6. promptTemplates 컬렉션

**사용자가 저장한 프롬프트 템플릿**

```javascript
// Document ID: auto-generated
{
  userId: string,                 // users.uid 참조
  title: string,                  // 템플릿명
  description: string,            // 설명
  templateContent: string,        // 템플릿 내용
  category: string,               // 카테고리
  tags: string[],                 // 태그
  isPublic: boolean,              // 공개 여부
  usageCount: number,             // 사용 횟수
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 7. credits 컬렉션 (선택사항)

**크레딧 거래 이력**

```javascript
// Document ID: auto-generated
{
  userId: string,                 // users.uid 참조
  type: 'purchase' | 'usage' | 'refund' | 'monthly_grant',
  amount: number,                 // 크레딧 수
  description: string,            // 설명
  transactionId: string,          // 결제 ID (Stripe)
  createdAt: Timestamp
}
```

---

## API 문서

### tRPC 라우터 구조

ZetaLab은 tRPC를 사용하여 타입 안전한 API를 제공합니다.

```typescript
appRouter = {
  auth: {
    me: Query,
    logout: Mutation,
    updateProfile: Mutation
  },
  zetaAI: {
    init: Mutation,
    generatePrompt: Mutation,
    updatePrompt: Mutation,
    getPromptById: Query,
    getHistory: Query,
    pinPrompt: Mutation,
    unpinPrompt: Mutation
  },
  project: {
    create: Mutation,
    getAll: Query,
    getById: Query,
    update: Mutation,
    delete: Mutation,
    addConversation: Mutation,
    removeConversation: Mutation,
    getConversations: Query
  },
  system: {
    notifyOwner: Mutation
  }
}
```

### 주요 API 엔드포인트

#### 1. zetaAI.init (프롬프트 생성 초기화)

**목적:** 사용자 질문 분석 및 Intent 질문 생성

**요청:**
```typescript
{
  question: string // 사용자 질문 (최소 1글자)
}
```

**응답:**
```typescript
{
  sessionId: string // 세션 고유 ID
  category: string // 매칭된 카테고리
  questions: string[] // 5개 세부 질문
  canSkip: boolean // 질문 스킵 가능 여부
}
```

#### 2. zetaAI.generatePrompt (프롬프트 생성)

**목적:** Intent 답변 기반 완성형 프롬프트 생성

**요청:**
```typescript
{
  sessionId: string,              // zetaAI.init에서 받은 sessionId
  originalQuestion: string,       // 원본 질문
  answers: Record<string, string>, // 질문별 답변
  selectedLLM: 'codex' | 'gemini' | 'claude', // 선택 LLM
  skippedQuestions?: number[]     // 스킵한 질문 인덱스
}
```

**응답:**
```typescript
{
  promptId: string,               // 저장된 프롬프트 ID
  originalQuestion: string,       // 원본 질문
  generatedPrompt: string,        // 생성된 완성형 프롬프트
  usedLLM: string,                // 사용된 LLM
  creditsUsed: number,            // 사용한 크레딧
  suggestedServices: Array<{
    name: string,
    reason: string
  }>
}
```

**크레딧 계산 (선택된 LLM별):**

| LLM | 입력 | 출력 | 프롬프트당 비용 |
|-----|------|------|----------------|
| **Codex** | 700 tokens | 1,000 tokens | ₩28 |
| **Gemini** | 700 tokens | 1,000 tokens | ₩2.8 |
| **Claude** | 700 tokens | 1,000 tokens | ₩11.2 |

#### 3. zetaAI.getHistory (히스토리 조회)

**목적:** 사용자의 생성 이력 조회

**요청:** 없음 (인증된 사용자 자동)

**응답:**
```typescript
Array<{
  id: string,
  originalQuestion: string,
  generatedPrompt: string,
  editedPrompt?: string,
  usedLLM: string,
  createdAt: Date,
  isPinned: boolean
}>
```

#### 4. project.create (프로젝트 생성)

**목적:** 새 프로젝트 생성

**요청:**
```typescript
{
  name: string,           // 프로젝트명
  description?: string,   // 설명
  color?: string,         // Hex 색상 (#RRGGBB)
  icon?: string           // 아이콘
}
```

**응답:**
```typescript
{
  id: string,
  name: string,
  description?: string,
  color?: string,
  icon?: string,
  createdAt: Date
}
```

#### 5. project.addConversation (프롬프트를 프로젝트에 추가)

**목적:** 생성된 프롬프트를 프로젝트에 추가

**요청:**
```typescript
{
  projectId: string,      // 프로젝트 ID
  conversationId: string  // promptHistory.id
}
```

**응답:**
```typescript
{
  success: boolean
}
```

---

## 프론트엔드 구조

### 디렉토리 구조

```
client/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # 메인 페이지 (질문 입력)
│   │   ├── IntentClarification.tsx # Intent 질문 페이지
│   │   ├── PromptResult.tsx       # 결과 페이지
│   │   ├── History.tsx            # 히스토리 페이지
│   │   ├── Projects.tsx           # 프로젝트 목록
│   │   ├── ProjectDetail.tsx      # 프로젝트 상세
│   │   ├── Settings.tsx           # 설정 페이지
│   │   ├── Feedback.tsx           # 피드백 페이지
│   │   ├── Privacy.tsx            # 개인정보보호
│   │   ├── Terms.tsx              # 이용약관
│   │   └── NotFound.tsx           # 404 페이지
│   ├── components/
│   │   ├── MainLayout.tsx         # 메인 레이아웃
│   │   ├── Sidebar.tsx            # 좌측 사이드바
│   │   ├── MobileDrawer.tsx       # 모바일 드로어
│   │   ├── SettingsModal.tsx      # 설정 모달
│   │   ├── LoginModal.tsx         # 로그인 모달
│   │   ├── ThemeToggle.tsx        # 테마 토글
│   │   ├── ErrorBoundary.tsx      # 에러 바운더리
│   │   ├── LLMSelector.tsx        # LLM 선택 컴포넌트
│   │   ├── ui/                    # shadcn/ui 컴포넌트
│   │   └── ...
│   ├── contexts/
│   │   ├── ThemeContext.tsx       # 테마 상태
│   │   └── AuthContext.tsx        # Firebase 인증 상태
│   ├── hooks/
│   │   ├── useAuth.ts             # Firebase 인증 훅
│   │   ├── useFirestore.ts        # Firestore 훅
│   │   └── ...
│   ├── lib/
│   │   ├── trpc.ts                # tRPC 클라이언트
│   │   ├── firebase.ts            # Firebase 초기화
│   │   └── llmConfig.ts           # LLM 설정
│   ├── App.tsx                    # 앱 루트
│   ├── main.tsx                   # 진입점
│   └── index.css                  # 글로벌 스타일
├── index.html                     # HTML 템플릿
└── vite.config.ts                 # Vite 설정
```

### 라우팅 구조

```
/                          → Home (메인 페이지)
/intent/:sessionId         → IntentClarification (질문 페이지)
/result/:promptId          → PromptResult (결과 페이지)
/history                   → History (히스토리)
/history/:id               → ConversationDetail (상세)
/projects                  → Projects (프로젝트 목록)
/projects/:id              → ProjectDetail (프로젝트 상세)
/settings                  → Settings (설정)
/privacy                   → Privacy (개인정보보호)
/terms                     → Terms (이용약관)
/feedback                  → Feedback (피드백)
/404                       → NotFound (404)
```

### Firebase 인증 통합 (useAuth.ts)

```typescript
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, isAuthenticated, logout };
}
```

---

## 백엔드 구조

### Firebase Cloud Functions 구조

```
functions/
├── src/
│   ├── index.ts                  # 진입점
│   ├── routers/
│   │   ├── auth.ts               # 인증 라우터
│   │   ├── zetaAI.ts             # AI 라우터
│   │   ├── project.ts            # 프로젝트 라우터
│   │   └── system.ts             # 시스템 라우터
│   ├── services/
│   │   ├── llmService.ts         # LLM 통합 서비스
│   │   ├── firestoreService.ts   # Firestore 서비스
│   │   ├── authService.ts        # 인증 서비스
│   │   └── creditService.ts      # 크레딧 관리 서비스
│   ├── middleware/
│   │   ├── auth.ts               # 인증 미들웨어
│   │   ├── errorHandler.ts       # 에러 핸들러
│   │   └── rateLimit.ts          # 레이트 리미팅
│   └── utils/
│       ├── validators.ts         # 검증 함수
│       └── logger.ts             # 로깅
├── firebase.json
└── package.json
```

### LLM 통합 서비스 (services/llmService.ts)

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Configuration, OpenAIApi } from 'openai';

export class LLMService {
  private codex: OpenAIApi;
  private gemini: GoogleGenerativeAI;
  private claude: Anthropic;

  constructor() {
    // OpenAI Codex 초기화
    this.codex = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      })
    );

    // Google Gemini 초기화
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Anthropic Claude 초기화
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateWithCodex(systemPrompt: string, userPrompt: string) {
    const response = await this.codex.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return {
      text: response.data.choices[0].message.content,
      tokens: response.data.usage.total_tokens,
      cost: this.calculateCost('codex', response.data.usage),
    };
  }

  async generateWithGemini(systemPrompt: string, userPrompt: string) {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
          ],
        },
      ],
    });

    const text = response.response.text();
    
    return {
      text,
      tokens: this.estimateTokens(text),
      cost: this.calculateCost('gemini', { prompt_tokens: 700, completion_tokens: 1000 }),
    };
  }

  async generateWithClaude(systemPrompt: string, userPrompt: string) {
    const response = await this.claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    return {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      tokens: response.usage.input_tokens + response.usage.output_tokens,
      cost: this.calculateCost('claude', response.usage),
    };
  }

  private calculateCost(llm: string, usage: any): number {
    const rates = {
      codex: { input: 0.02, output: 0.02 }, // per 1K tokens
      gemini: { input: 0.00075, output: 0.003 },
      claude: { input: 0.003, output: 0.015 },
    };

    const rate = rates[llm];
    const inputCost = (usage.prompt_tokens || 700) * (rate.input / 1000);
    const outputCost = (usage.completion_tokens || 1000) * (rate.output / 1000);
    
    return inputCost + outputCost;
  }

  private estimateTokens(text: string): number {
    // 대략적인 토큰 추정 (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}
```

### Firestore 서비스 (services/firestoreService.ts)

```typescript
import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export class FirestoreService {
  // 사용자 저장
  async saveUser(uid: string, userData: any) {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });
  }

  // 프롬프트 히스토리 저장
  async savePromptHistory(userId: string, promptData: any) {
    const docRef = await setDoc(
      doc(collection(db, 'promptHistory')),
      {
        userId,
        ...promptData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
    return docRef.id;
  }

  // 사용자 히스토리 조회
  async getUserHistory(userId: string) {
    const q = query(
      collection(db, 'promptHistory'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 프롬프트 업데이트
  async updatePrompt(promptId: string, updates: any) {
    await updateDoc(doc(db, 'promptHistory', promptId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // 프로젝트 생성
  async createProject(userId: string, projectData: any) {
    const docRef = await setDoc(
      doc(collection(db, 'projects')),
      {
        userId,
        ...projectData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
    return docRef.id;
  }

  // 사용자 프로젝트 조회
  async getUserProjects(userId: string) {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
```

### 크레딧 관리 서비스 (services/creditService.ts)

```typescript
import { db } from '../config/firebase';
import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

export class CreditService {
  // 크레딧 차감
  async deductCredits(userId: string, amount: number, reason: string) {
    const userRef = doc(db, 'users', userId);
    
    // 크레딧 차감
    await updateDoc(userRef, {
      credits: FieldValue.increment(-amount),
    });

    // 거래 기록 저장
    await addDoc(collection(db, 'credits'), {
      userId,
      type: 'usage',
      amount: -amount,
      description: reason,
      createdAt: Timestamp.now(),
    });
  }

  // 월별 크레딧 충전
  async grantMonthlyCredits(userId: string, amount: number) {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      credits: FieldValue.increment(amount),
      monthlyCredits: amount,
    });

    await addDoc(collection(db, 'credits'), {
      userId,
      type: 'monthly_grant',
      amount,
      description: 'Monthly credit grant',
      createdAt: Timestamp.now(),
    });
  }

  // 크레딧 구매
  async purchaseCredits(userId: string, amount: number, transactionId: string) {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      credits: FieldValue.increment(amount),
    });

    await addDoc(collection(db, 'credits'), {
      userId,
      type: 'purchase',
      amount,
      transactionId,
      description: 'Credit purchase',
      createdAt: Timestamp.now(),
    });
  }
}
```

---

## LLM 통합

### LLM 선택 기준

| LLM | 최적 사용 사례 | 강점 | 약점 |
|-----|-------------|------|------|
| **Codex** | 코드 생성, 프로그래밍 | 코드 이해도 높음 | 비용 높음 |
| **Gemini** | 다목적 텍스트 생성 | 비용 저렴, 빠름 | 긴 문맥 처리 약함 |
| **Claude** | 복잡한 작업, 긴 문맥 | 문맥 이해도 높음 | 응답 시간 길음 |

### LLM 마이그레이션 (Gemini → ChatGPT 5.2)

**현재 상태:**
```typescript
model: "gemini-pro"
```

**마이그레이션 후:**
```typescript
// OpenAI API 사용
model: "gpt-5.2"
apiKey: process.env.OPENAI_API_KEY

// 비용 변경
// Gemini: $0.00075/1K input, $0.003/1K output
// GPT-5.2: $1.75/1M input, $14.00/1M output
// = $0.00175/1K input, $0.014/1K output
```

---

## 인증 및 보안

### Firebase Authentication

**지원 인증 방식:**
- Google Sign-In
- Email/Password
- Facebook (선택사항)
- GitHub (선택사항)

**구현:**
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const user = result.user;
```

### 보안 조치

1. **HTTPS 강제**
   - Firebase Hosting에서 자동 제공

2. **CORS 설정**
   ```javascript
   // firebase.json
   {
     "hosting": {
       "headers": [{
         "key": "Access-Control-Allow-Origin",
         "value": "https://zetalab.im"
       }]
     }
   }
   ```

3. **Firestore 보안 규칙**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 사용자는 자신의 데이터만 접근 가능
       match /users/{uid} {
         allow read, write: if request.auth.uid == uid;
       }
       
       // 프롬프트 히스토리는 소유자만 접근
       match /promptHistory/{doc=**} {
         allow read, write: if request.auth.uid == resource.data.userId;
       }
       
       // 공개 템플릿은 누구나 읽기 가능
       match /promptTemplates/{doc=**} {
         allow read: if resource.data.isPublic == true;
         allow write: if request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

4. **API 키 관리**
   - 환경변수로 관리
   - Firebase Secrets Manager 사용

5. **Rate Limiting**
   ```typescript
   // Cloud Functions에서 구현
   import * as rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15분
     max: 100 // 최대 100 요청
   });
   
   app.use('/api/', limiter);
   ```

---

## Firebase 배포

### Firebase 프로젝트 설정

**1. Firebase 프로젝트 생성**
```bash
firebase init
```

**2. 환경 설정 (firebase.json)**
```json
{
  "hosting": {
    "public": "dist/client",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }],
    "headers": [{
      "source": "**/*.@(js|css)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000"
      }]
    }]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  }
}
```

**3. 환경변수 설정 (.env.local)**
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com

OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 배포 프로세스

**1. 빌드**
```bash
pnpm build
```

**2. 배포**
```bash
firebase deploy
```

**3. 배포 확인**
```bash
firebase hosting:list
```

### 도메인 연결

**1. Firebase Console에서 도메인 추가**
- Hosting > 도메인 연결

**2. DNS 설정**
- A 레코드: 151.101.1.140
- CNAME 레코드: zetalab.im → zetalab-project.web.app

**3. SSL 인증서**
- Firebase에서 자동 관리

---

## 성능 최적화

### 프론트엔드 최적화

1. **Code Splitting**
   - Lazy loading으로 번들 크기 감소

2. **이미지 최적화**
   - WebP 포맷 사용
   - Firebase Storage CDN 활용

3. **캐싱**
   - React Query로 서버 상태 캐싱
   - Service Worker로 오프라인 지원

### 백엔드 최적화

1. **Firestore 최적화**
   - 인덱스 설정
   - 쿼리 최적화
   - 배치 작업 활용

2. **Cloud Functions 최적화**
   - 메모리 할당 조정 (512MB → 2GB)
   - 타임아웃 설정 (60초 → 300초)
   - 동시성 제어

3. **LLM API 최적화**
   - 요청 캐싱
   - 배치 처리
   - 에러 재시도

---

## 트러블슈팅

### 일반적인 문제 및 해결책

#### 1. Firebase 연결 실패

**증상:** "Firebase 초기화 오류"

**해결:**
```bash
# 환경변수 확인
echo $VITE_FIREBASE_API_KEY

# Firebase 상태 확인
firebase status
```

#### 2. Cloud Functions 배포 실패

**증상:** "배포 오류"

**해결:**
```bash
# 로그 확인
firebase functions:log

# 함수 재배포
firebase deploy --only functions
```

#### 3. Firestore 쿼리 느림

**증상:** "데이터 로딩 느림"

**해결:**
```javascript
// 복합 인덱스 생성
// Firestore Console > 인덱스 > 복합 인덱스 생성
```

#### 4. LLM API 오류

**증상:** "프롬프트 생성 실패"

**해결:**
```bash
# API 키 확인
echo $OPENAI_API_KEY
echo $GOOGLE_API_KEY
echo $ANTHROPIC_API_KEY

# API 할당량 확인
# OpenAI/Google/Anthropic Console에서 확인
```

---

## 부록

### A. 용어 정의

| 용어 | 정의 |
|------|------|
| **Intent** | 사용자의 의도를 파악하기 위한 구조화된 질문 세트 |
| **Session** | 프롬프트 생성 과정의 고유 식별자 |
| **Prompt** | AI 모델에 입력하는 명령어/지시사항 |
| **Template** | 재사용 가능한 프롬프트 패턴 |
| **Project** | 프롬프트를 그룹화하는 폴더 |
| **tRPC** | 타입 안전한 RPC 프레임워크 |
| **Firestore** | Firebase의 NoSQL 데이터베이스 |
| **Cloud Functions** | Firebase의 서버리스 함수 |

### B. 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [tRPC 공식 문서](https://trpc.io)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Google Gemini API 문서](https://ai.google.dev)
- [Anthropic Claude API 문서](https://docs.anthropic.com)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com)

### C. 변경 로그

**v2.0.0 (2026-02-03) - Firebase Edition**
- Firebase로 완전 마이그레이션
- 다중 LLM 지원 (Codex, Gemini, Claude)
- Firestore NoSQL 데이터베이스
- Cloud Functions 서버리스 백엔드
- 크레딧 기반 결제 시스템
- Manus 의존성 제거

**v1.0.0 (2026-02-03) - Initial Release**
- 초기 릴리스 (Manus 기반)

---

**문서 작성자:** ZetaLab 개발팀  
**최종 검토:** 2026년 2월 3일  
**라이선스:** MIT
