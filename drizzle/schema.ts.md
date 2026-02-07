# Database Schema 코드 문서화

**파일**: `drizzle/schema.ts`  
**목적**: 데이터베이스 테이블 정의 (Drizzle ORM)  
**현재 상태**: Production (MySQL/TiDB)  
**마이그레이션 대상**: Firestore (NoSQL)

---

## 개요

`schema.ts`는 Drizzle ORM을 사용하여 데이터베이스 테이블을 정의합니다. 현재는 MySQL/TiDB(관계형 데이터베이스)를 사용하지만, Firebase로 마이그레이션 시 Firestore(NoSQL)로 변경됩니다.

---

## 현재 스키마 (MySQL/TiDB)

### 1. users 테이블

**목적**: 사용자 정보 저장

**현재 구현 (Manus 기반):**
```typescript
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  openId: varchar('openId', { length: 64 }).notNull().unique(),  // Manus OAuth ID
  name: text('name'),
  email: varchar('email', { length: 320 }),
  loginMethod: varchar('loginMethod', { length: 64 }),
  role: mysqlEnum('role', ['user', 'admin']).default('user').notNull(),
  manusLinked: int('manusLinked').default(0).notNull(),  // Manus 연동 여부
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp('lastSignedIn').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

**마이그레이션 명분:**
- ❌ **Manus 의존**: `openId` (Manus OAuth), `manusLinked` (Manus 연동)
- ✅ **Firebase로 변경**: `uid` (Firebase Auth UID)
- ✅ **향후 개선**: 크레딧, 구독 정보 추가

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 컬렉션: 'users'
// 문서 ID: Firebase Auth UID

interface User {
  uid: string;                    // Firebase Auth UID (문서 ID)
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  
  // 크레딧 시스템
  credits: number;                // 현재 크레딧
  monthlyCredits: number;         // 월별 크레딧
  plan: 'free' | 'starter' | 'pro' | 'business';
  
  // 소셜 로그인
  linkedProviders: {
    google?: boolean;
    github?: boolean;
    facebook?: boolean;
  };
  
  // 기본 설정
  defaultLLM: 'gpt5.2' | 'claude' | 'gemini';
  theme: 'light' | 'dark' | 'system';
  
  // 타임스탐프
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSignedIn: Timestamp;
}
```

**마이그레이션 코드:**
```typescript
// 마이그레이션 스크립트
import { admin } from 'firebase-admin';

async function migrateUsers() {
  const db = admin.firestore();
  
  // MySQL에서 사용자 조회
  const mysqlUsers = await getMySQLUsers();
  
  // Firestore에 저장
  const batch = db.batch();
  
  for (const user of mysqlUsers) {
    const userRef = db.collection('users').doc(user.openId);
    
    batch.set(userRef, {
      uid: user.openId,
      email: user.email,
      displayName: user.name,
      photoURL: null,
      role: user.role,
      credits: 5,  // 초기 크레딧
      monthlyCredits: 5,
      plan: 'free',
      linkedProviders: {},
      defaultLLM: 'gemini',
      theme: 'system',
      createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt),
      lastSignedIn: admin.firestore.Timestamp.fromDate(user.lastSignedIn)
    });
  }
  
  await batch.commit();
  console.log('Users migrated successfully');
}
```

---

### 2. promptHistory 테이블

**목적**: 생성된 프롬프트 이력 저장

**현재 구현 (Manus 기반):**
```typescript
export const promptHistory = mysqlTable('promptHistory', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  sessionId: varchar('sessionId', { length: 64 }).notNull(),
  originalQuestion: text('originalQuestion').notNull(),
  intentAnswers: text('intentAnswers'),  // JSON
  generatedPrompt: text('generatedPrompt').notNull(),
  editedPrompt: text('editedPrompt'),
  usedLLM: varchar('usedLLM', { length: 64 }),  // 현재: 'gemini-2.5-flash'
  suggestedServices: text('suggestedServices'),  // JSON
  isPinned: int('isPinned').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type PromptHistory = typeof promptHistory.$inferSelect;
export type InsertPromptHistory = typeof promptHistory.$inferInsert;
```

**마이그레이션 명분:**
- ❌ **단일 LLM**: `usedLLM`이 'gemini-2.5-flash'로 고정
- ✅ **다중 LLM 지원**: GPT-5.2, Claude, Gemini 중 선택
- ✅ **크레딧 추적**: LLM별 비용 기록 필요
- ✅ **향후 개선**: 사용 통계, 성능 분석

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 컬렉션: 'promptHistory'
// 문서 ID: auto-generated

interface PromptHistory {
  userId: string;                 // users.uid 참조
  sessionId: string;              // 세션 고유 ID
  originalQuestion: string;       // 원본 질문
  
  intentAnswers: {                // Intent 질문 답변
    [questionIndex: number]: string;
  };
  
  generatedPrompt: string;        // AI 생성 프롬프트
  editedPrompt?: string;          // 사용자 수정 프롬프트
  
  // LLM 정보 (마이그레이션 후 추가)
  usedLLM: 'gpt5.2' | 'claude' | 'gemini';  // 사용 LLM
  llmModel: string;               // 모델명 (gpt-5.2, claude-3-sonnet 등)
  creditsUsed: number;            // 사용한 크레딧
  
  suggestedServices?: Array<{
    name: string;
    reason: string;
  }>;
  
  isPinned: boolean;              // 즐겨찾기 여부
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**마이그레이션 코드:**
```typescript
async function migratePromptHistory() {
  const db = admin.firestore();
  
  // MySQL에서 프롬프트 히스토리 조회
  const mysqlPrompts = await getMySQLPromptHistory();
  
  const batch = db.batch();
  
  for (const prompt of mysqlPrompts) {
    const promptRef = db.collection('promptHistory').doc();
    
    batch.set(promptRef, {
      userId: prompt.userId,  // Manus openId → Firebase uid로 변환 필요
      sessionId: prompt.sessionId,
      originalQuestion: prompt.originalQuestion,
      intentAnswers: JSON.parse(prompt.intentAnswers || '{}'),
      generatedPrompt: prompt.generatedPrompt,
      editedPrompt: prompt.editedPrompt || null,
      usedLLM: 'gemini',  // 기존 데이터는 gemini로 표시
      llmModel: 'gemini-2.5-flash',
      creditsUsed: 3,  // Gemini 기본 비용
      suggestedServices: JSON.parse(prompt.suggestedServices || '[]'),
      isPinned: prompt.isPinned === 1,
      createdAt: admin.firestore.Timestamp.fromDate(prompt.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(prompt.updatedAt)
    });
  }
  
  await batch.commit();
  console.log('Prompt history migrated successfully');
}
```

---

### 3. intentTemplate 테이블

**목적**: Intent 질문 템플릿 저장

**현재 구현:**
```typescript
export const intentTemplate = mysqlTable('intentTemplate', {
  id: int('id').primaryKey().autoincrement(),
  category: varchar('category', { length: 128 }).notNull(),
  keywords: text('keywords'),  // JSON 배열
  questions: text('questions').notNull(),  // JSON 배열 (5개 질문)
  defaultAnswers: text('defaultAnswers'),  // JSON (선택사항)
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type IntentTemplate = typeof intentTemplate.$inferSelect;
export type InsertIntentTemplate = typeof intentTemplate.$inferInsert;
```

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 컬렉션: 'intentTemplate'

interface IntentTemplate {
  category: string;               // 카테고리
  keywords: string[];             // 매칭 키워드
  questions: string[];            // 질문 목록 (5개)
  defaultAnswers?: {
    [questionIndex: number]: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 4. projects 테이블

**목적**: 사용자 프로젝트 저장

**현재 구현:**
```typescript
export const projects = mysqlTable('projects', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }),  // Hex 색상
  icon: varchar('icon', { length: 50 }),   // 이모지 또는 아이콘 이름
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
```

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 컬렉션: 'projects'

interface Project {
  userId: string;                 // users.uid 참조
  name: string;
  description?: string;
  color?: string;                 // Hex 색상
  icon?: string;
  conversationCount: number;      // 포함된 프롬프트 수
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 5. projectConversations 테이블

**목적**: 프로젝트와 프롬프트의 M:N 관계 저장

**현재 구현:**
```typescript
export const projectConversations = mysqlTable('projectConversations', {
  id: int('id').primaryKey().autoincrement(),
  projectId: int('projectId').notNull(),
  conversationId: int('conversationId').notNull(),  // promptHistory.id
  addedAt: timestamp('addedAt').defaultNow().notNull(),
});

export type ProjectConversation = typeof projectConversations.$inferSelect;
export type InsertProjectConversation = typeof projectConversations.$inferInsert;
```

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 서브컬렉션: projects/{projectId}/conversations/{conversationId}

interface ProjectConversation {
  conversationId: string;         // promptHistory 문서 ID
  addedAt: Timestamp;
}
```

---

### 6. promptTemplates 테이블

**목적**: 사용자가 저장한 프롬프트 템플릿

**현재 구현:**
```typescript
export const promptTemplates = mysqlTable('promptTemplates', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  templateContent: text('templateContent').notNull(),
  category: varchar('category', { length: 100 }),
  tags: text('tags'),  // JSON 배열
  isPublic: int('isPublic').default(0).notNull(),
  usageCount: int('usageCount').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;
```

**Firestore 마이그레이션 스키마:**
```typescript
// Firestore 컬렉션: 'promptTemplates'

interface PromptTemplate {
  userId: string;                 // users.uid 참조
  title: string;
  description?: string;
  templateContent: string;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 마이그레이션 전략

### Phase 1: 데이터 분석 (1주)
- [ ] MySQL 데이터 백업
- [ ] 데이터 마이그레이션 계획 수립
- [ ] Firestore 컬렉션 구조 설계

### Phase 2: Firestore 준비 (1주)
- [ ] Firestore 컬렉션 생성
- [ ] 보안 규칙 작성
- [ ] 인덱스 설정

### Phase 3: 데이터 마이그레이션 (1주)
- [ ] 마이그레이션 스크립트 작성
- [ ] 테스트 데이터로 검증
- [ ] 전체 데이터 마이그레이션

### Phase 4: 애플리케이션 업데이트 (2주)
- [ ] Drizzle ORM → Firestore SDK로 변경
- [ ] 쿼리 로직 업데이트
- [ ] 테스트 및 검증

### Phase 5: 배포 (1주)
- [ ] Firebase로 배포
- [ ] 모니터링
- [ ] MySQL 서버 종료

---

## 주요 변경사항

### 데이터 모델 변경

| 항목 | MySQL | Firestore |
|------|-------|-----------|
| **ID** | 정수 (auto-increment) | 문자열 (UUID/auto-generated) |
| **관계** | 외래키 | 문서 참조 |
| **타입** | 강타입 | 유연한 타입 |
| **스케일링** | 수직 확장 | 수평 확장 |
| **비용** | 고정 | 사용량 기반 |

### 쿼리 변경

**MySQL (Drizzle ORM):**
```typescript
// 사용자의 프롬프트 히스토리 조회
const history = await db
  .select()
  .from(promptHistory)
  .where(eq(promptHistory.userId, userId))
  .orderBy(desc(promptHistory.createdAt));
```

**Firestore:**
```typescript
// 사용자의 프롬프트 히스토리 조회
const snapshot = await admin.firestore()
  .collection('promptHistory')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .get();

const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

## 크레딧 시스템 추가 (마이그레이션 후)

**새 컬렉션: credits**
```typescript
// Firestore 컬렉션: 'credits'

interface CreditTransaction {
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'monthly_grant';
  llm?: 'gpt5.2' | 'claude' | 'gemini';
  amount: number;
  description: string;
  transactionId?: string;  // Stripe 결제 ID
  createdAt: Timestamp;
}
```

---

## 참고 자료

- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Firebase Firestore 문서](https://firebase.google.com/docs/firestore)
- [데이터 마이그레이션 가이드](https://firebase.google.com/docs/firestore/migrate-data)

---

**마지막 업데이트**: 2026년 2월 3일  
**상태**: 마이그레이션 대기 중  
**담당자**: ZetaLab 개발팀
