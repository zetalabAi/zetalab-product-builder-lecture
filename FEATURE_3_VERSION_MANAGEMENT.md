# Feature 3: 프롬프트 버전 관리 - 설계 문서

**작성일**: 2026-02-12
**버전**: 1.0.0
**구현 난이도**: 7/10 (중상)

---

## 목차
1. [데이터 모델 설계](#1-데이터-모델-설계)
2. [Backend API 설계](#2-backend-api-설계)
3. [변경 감지 알고리즘](#3-변경-감지-알고리즘)
4. [UI 컴포넌트 설계](#4-ui-컴포넌트-설계)
5. [사용자 플로우](#5-사용자-플로우)
6. [성능 최적화](#6-성능-최적화)
7. [구현 계획](#7-구현-계획)

---

## 1. 데이터 모델 설계

### 1.1 Firestore 스키마

**기존 구조 (확인됨)**:
```
conversations/{conversationId}
  - userId: string
  - generatedPrompt: string
  - editedPrompt: string
  - qualityScore?: PromptQuality
  - createdAt: timestamp
  - updatedAt: timestamp
```

**새 구조 (추가)**:
```
conversations/{conversationId}
  - 기존 필드들...
  - currentVersion: number (기본값: 1)

  versions/{versionId} (서브컬렉션)
    - version: number
    - prompt: string
    - changes: string[]
    - qualityScore?: PromptQuality
    - createdAt: timestamp
    - createdBy: string (userId)
```

### 1.2 TypeScript 타입 정의

```typescript
/**
 * 프롬프트 버전
 */
interface PromptVersion {
  id: string;
  conversationId: string;
  version: number;
  prompt: string;
  changes: string[];
  qualityScore?: PromptQuality;
  createdAt: Date;
  createdBy: string;
}

/**
 * 버전 비교 결과
 */
interface VersionComparison {
  oldVersion: PromptVersion;
  newVersion: PromptVersion;
  diff: DiffResult[];
}

/**
 * Diff 결과
 */
interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumber?: number;
}

/**
 * 버전 생성 요청
 */
interface CreateVersionRequest {
  conversationId: string;
  newPrompt: string;
  changes?: string[];
}

/**
 * 버전 비교 요청
 */
interface CompareVersionsRequest {
  conversationId: string;
  versionId1: string;
  versionId2: string;
}
```

### 1.3 인덱싱 전략

**Firestore 인덱스**:
- `conversationId + version` (버전 번호 순 정렬)
- `conversationId + createdAt` (시간 순 정렬)

**쿼리 패턴**:
```typescript
// 최신 10개 버전 조회
versions
  .where('conversationId', '==', id)
  .orderBy('version', 'desc')
  .limit(10)
```

---

## 2. Backend API 설계

### 2.1 새 라우터: `versions`

**파일**: `server/routers/versions.ts`

```typescript
export const versionsRouter = router({
  /**
   * 새 버전 생성
   */
  createVersion: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      newPrompt: z.string(),
      changes: z.array(z.string()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 현재 버전 번호 조회
      // 3. 변경사항 자동 감지 (changes 없는 경우)
      // 4. 새 버전 생성
      // 5. currentVersion 업데이트
      // 6. 품질 분석 트리거 (선택)
    }),

  /**
   * 버전 히스토리 조회
   */
  getVersionHistory: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0)
    }))
    .query(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 버전 목록 조회 (최신순)
      // 3. 반환
    }),

  /**
   * 특정 버전 조회
   */
  getVersion: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      versionId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 버전 조회
      // 3. 반환
    }),

  /**
   * 두 버전 비교
   */
  compareVersions: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      versionId1: z.string(),
      versionId2: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 두 버전 조회
      // 3. Diff 계산
      // 4. 결과 반환
    }),

  /**
   * 이전 버전으로 복원
   */
  revertToVersion: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      versionId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 해당 버전 조회
      // 3. 새 버전 생성 (복원 버전)
      // 4. changes: ["v{N}으로 복원"]
      // 5. 반환
    }),

  /**
   * 버전 삭제 (선택)
   */
  deleteVersion: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      versionId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 권한 검증
      // 2. 최신 버전이 아닌지 확인
      // 3. 삭제
    })
});
```

### 2.2 Firestore 헬퍼 함수

**파일**: `server/db.ts` (추가)

```typescript
/**
 * 새 버전 생성
 */
export async function createPromptVersion(
  conversationId: string,
  data: {
    version: number;
    prompt: string;
    changes: string[];
    qualityScore?: PromptQuality;
    createdBy: string;
  }
): Promise<string> {
  const db = admin.firestore();
  const versionRef = db
    .collection('conversations')
    .doc(conversationId)
    .collection('versions')
    .doc();

  await versionRef.set({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return versionRef.id;
}

/**
 * 버전 히스토리 조회
 */
export async function getVersionHistory(
  conversationId: string,
  limit: number = 10,
  offset: number = 0
): Promise<PromptVersion[]> {
  const db = admin.firestore();
  const snapshot = await db
    .collection('conversations')
    .doc(conversationId)
    .collection('versions')
    .orderBy('version', 'desc')
    .limit(limit)
    .offset(offset)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    conversationId,
    ...doc.data() as any,
    createdAt: doc.data().createdAt?.toDate()
  }));
}

/**
 * 특정 버전 조회
 */
export async function getPromptVersion(
  conversationId: string,
  versionId: string
): Promise<PromptVersion | null> {
  const db = admin.firestore();
  const doc = await db
    .collection('conversations')
    .doc(conversationId)
    .collection('versions')
    .doc(versionId)
    .get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    conversationId,
    ...doc.data() as any,
    createdAt: doc.data()?.createdAt?.toDate()
  };
}

/**
 * 대화의 현재 버전 번호 조회
 */
export async function getCurrentVersion(
  conversationId: string
): Promise<number> {
  const db = admin.firestore();
  const doc = await db
    .collection('conversations')
    .doc(conversationId)
    .get();

  return doc.data()?.currentVersion || 0;
}

/**
 * 현재 버전 번호 업데이트
 */
export async function updateCurrentVersion(
  conversationId: string,
  version: number
): Promise<void> {
  const db = admin.firestore();
  await db
    .collection('conversations')
    .doc(conversationId)
    .update({ currentVersion: version });
}
```

---

## 3. 변경 감지 알고리즘

### 3.1 diff 라이브러리 사용

**패키지**: `diff` (npm)

```bash
npm install diff
npm install --save-dev @types/diff
```

### 3.2 변경 감지 함수

```typescript
import { diffWords, diffLines, Change } from 'diff';

/**
 * 두 프롬프트 간 변경사항 감지
 */
export function detectChanges(
  oldPrompt: string,
  newPrompt: string
): string[] {
  const changes: string[] = [];

  // 줄 단위 diff
  const lineDiff = diffLines(oldPrompt, newPrompt);

  let addedLines = 0;
  let removedLines = 0;

  for (const part of lineDiff) {
    if (part.added) {
      addedLines += part.count || 0;
    } else if (part.removed) {
      removedLines += part.count || 0;
    }
  }

  // 변경사항 요약
  if (addedLines > 0 && removedLines > 0) {
    changes.push(`${addedLines}줄 추가, ${removedLines}줄 삭제`);
  } else if (addedLines > 0) {
    changes.push(`${addedLines}줄 추가`);
  } else if (removedLines > 0) {
    changes.push(`${removedLines}줄 삭제`);
  }

  // 섹션별 변경 감지 (parsePrompt 활용)
  const oldParsed = parsePrompt(oldPrompt);
  const newParsed = parsePrompt(newPrompt);

  const oldSections = new Set(oldParsed.sections.map(s => s.type));
  const newSections = new Set(newParsed.sections.map(s => s.type));

  // 추가된 섹션
  for (const type of newSections) {
    if (!oldSections.has(type)) {
      const section = newParsed.sections.find(s => s.type === type);
      if (section) {
        changes.push(`${section.title} 추가`);
      }
    }
  }

  // 제거된 섹션
  for (const type of oldSections) {
    if (!newSections.has(type)) {
      const section = oldParsed.sections.find(s => s.type === type);
      if (section) {
        changes.push(`${section.title} 제거`);
      }
    }
  }

  // 수정된 섹션
  for (const type of oldSections) {
    if (newSections.has(type)) {
      const oldSection = oldParsed.sections.find(s => s.type === type);
      const newSection = newParsed.sections.find(s => s.type === type);

      if (oldSection && newSection && oldSection.content !== newSection.content) {
        changes.push(`${newSection.title} 수정`);
      }
    }
  }

  return changes.length > 0 ? changes : ['내용 수정'];
}

/**
 * 두 프롬프트의 상세 diff 계산
 */
export function calculateDiff(
  oldPrompt: string,
  newPrompt: string
): DiffResult[] {
  const diff = diffWords(oldPrompt, newPrompt);

  return diff.map(part => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    value: part.value
  }));
}
```

---

## 4. UI 컴포넌트 설계

### 4.1 컴포넌트 계층

```
VersionTimeline (메인)
├── VersionCard × N
│   └── VersionActions
├── VersionComparison (모달)
│   └── DiffViewer
└── VersionRevertDialog
```

### 4.2 VersionTimeline

**파일**: `client/src/components/versions/VersionTimeline.tsx`

```typescript
interface VersionTimelineProps {
  conversationId: string;
  currentVersion: number;
}

// 표시 내용:
// - 버전 목록 (최신순)
// - 각 버전: 번호, 시간, 변경사항
// - 액션: 보기, 비교, 복원
// - 무한 스크롤
```

**레이아웃**:
```
┌─────────────────────────────────────┐
│  📜 버전 히스토리                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  v3 (현재) ●━━━━━ 2시간 전          │
│  ✏️ 제약조건 추가, 형식 수정          │
│  [보기] [비교]                       │
│                                     │
│  v2  ○━━━━━ 어제                    │
│  ✏️ 역할 명확화                      │
│  [보기] [비교] [이 버전으로]          │
│                                     │
│  v1 (최초)  ○━━━━━ 3일 전           │
│  ✏️ 초기 생성                        │
│  [보기]                              │
│                                     │
│  [더 보기...]                        │
└─────────────────────────────────────┘
```

### 4.3 VersionCard

**파일**: `client/src/components/versions/VersionCard.tsx`

```typescript
interface VersionCardProps {
  version: PromptVersion;
  isCurrent: boolean;
  onView: () => void;
  onCompare: () => void;
  onRevert?: () => void;
}

// 표시:
// - 버전 번호 + 배지
// - 변경사항 요약
// - 생성 시간 (상대)
// - 액션 버튼
```

### 4.4 VersionComparison

**파일**: `client/src/components/versions/VersionComparison.tsx`

```typescript
interface VersionComparisonProps {
  conversationId: string;
  versionId1: string;
  versionId2: string;
  onClose: () => void;
}

// 표시:
// - Side-by-side 비교
// - 변경 부분 하이라이트
// - 추가(초록), 삭제(빨강), 변경(노랑)
```

**레이아웃**:
```
┌─────────────────────────────────────┐
│  v2 vs v3 비교                [X]   │
├──────────────┬──────────────────────┤
│  v2          │  v3 (현재)           │
├──────────────┼──────────────────────┤
│  🎭 역할     │  🎭 역할             │
│  당신은...   │  당신은...           │
│              │                      │
│  📋 제약     │  📋 제약             │
│  - 1000자    │  - 1500자  ← 변경    │
│              │  - 데이터  ← 추가    │
│              │                      │
│  [v2로 복원] │  [v3 유지]           │
└──────────────┴──────────────────────┘
```

### 4.5 DiffViewer

**파일**: `client/src/components/versions/DiffViewer.tsx`

```typescript
interface DiffViewerProps {
  diff: DiffResult[];
}

// 표시:
// - 인라인 diff
// - 색상 코딩:
//   - 추가: bg-green-100 dark:bg-green-900/30
//   - 삭제: bg-red-100 dark:bg-red-900/30
//   - 변경: bg-yellow-100 dark:bg-yellow-900/30
```

### 4.6 VersionActions

**파일**: `client/src/components/versions/VersionActions.tsx`

```typescript
interface VersionActionsProps {
  version: PromptVersion;
  isCurrent: boolean;
  onView: () => void;
  onCompare: () => void;
  onRevert?: () => void;
}

// 버튼:
// - [보기]: 해당 버전 프롬프트 표시
// - [비교]: 비교 모드 진입
// - [이 버전으로]: 복원 확인 다이얼로그
```

---

## 5. 사용자 플로우

### 5.1 버전 생성 플로우

```
1. 사용자가 PromptResult에서 프롬프트 수정
    ↓
2. "저장" 버튼 클릭
    ↓
3. updateMutation 호출
    ↓
4. Backend: 변경사항 감지
    ↓
5. Backend: 새 버전 생성
    ↓
6. Backend: currentVersion++
    ↓
7. Frontend: 성공 토스트
8. Frontend: "v3으로 저장됨" 표시
```

### 5.2 버전 히스토리 조회 플로우

```
1. PromptResult에서 "버전 히스토리" 버튼 클릭
    ↓
2. 모달 또는 드로어 열림
    ↓
3. getVersionHistory API 호출
    ↓
4. VersionTimeline 렌더링
    ↓
5. 각 VersionCard 표시
    ↓
6. 사용자 액션:
   - [보기] → 해당 버전 표시
   - [비교] → 비교 모드
   - [이 버전으로] → 복원
```

### 5.3 버전 비교 플로우

```
1. VersionCard에서 "비교" 버튼 클릭
    ↓
2. 비교할 버전 선택 (기본: 이전 버전)
    ↓
3. compareVersions API 호출
    ↓
4. VersionComparison 모달 열림
    ↓
5. DiffViewer로 변경사항 표시
    ↓
6. 사용자 액션:
   - [이전 버전으로 복원]
   - [현재 버전 유지]
```

### 5.4 버전 복원 플로우

```
1. VersionCard에서 "이 버전으로" 버튼 클릭
    ↓
2. 확인 다이얼로그:
   "v2로 복원하시겠습니까?
    현재 버전(v3)은 새 버전으로 저장됩니다."
    ↓
3. [복원] 클릭
    ↓
4. revertToVersion API 호출
    ↓
5. Backend: v2 내용으로 v4 생성
6. Backend: changes: ["v2로 복원"]
    ↓
7. Frontend: 성공 토스트
8. Frontend: 프롬프트 업데이트
9. Frontend: "v4로 복원됨" 표시
```

---

## 6. 성능 최적화

### 6.1 버전 수 제한

**전략**:
- 최대 50개 버전 유지
- 50개 초과 시 가장 오래된 버전 자동 삭제 (선택)
- 또는 아카이브 (cold storage)

### 6.2 쿼리 최적화

**페이지네이션**:
```typescript
// 최근 10개만 로드
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['versions', conversationId],
  queryFn: ({ pageParam = 0 }) =>
    trpc.versions.getVersionHistory.query({
      conversationId,
      limit: 10,
      offset: pageParam
    }),
  getNextPageParam: (lastPage, pages) =>
    lastPage.length === 10 ? pages.length * 10 : undefined
});
```

### 6.3 캐싱 전략

**React Query**:
- 버전 목록: staleTime 5분
- 개별 버전: staleTime 무한 (변경되지 않음)
- 비교 결과: staleTime 1분

---

## 7. 구현 계획

### Phase 1: 데이터 모델 & 타입 (1시간)
- TypeScript 타입 정의
- Firestore 헬퍼 함수
- diff 유틸리티

### Phase 2: Backend API (2시간)
- `versions.ts` 라우터 생성
- createVersion 구현
- getVersionHistory 구현
- compareVersions 구현
- revertToVersion 구현

### Phase 3: diff 로직 (1시간)
- diff 패키지 설치
- detectChanges 함수
- calculateDiff 함수
- 테스트 케이스

### Phase 4: UI 컴포넌트 (2-3시간)
- VersionCard 구현
- VersionTimeline 구현
- DiffViewer 구현
- VersionComparison 구현
- VersionActions 구현

### Phase 5: 통합 (1시간)
- PromptResult에 "버전 히스토리" 버튼
- 프롬프트 수정 시 버전 자동 생성
- 모달/드로어 통합

### Phase 6: 테스트 & 최적화 (1시간)
- 다양한 케이스 테스트
- 성능 최적화
- 에러 핸들링

**총 예상 시간**: 8-9시간

---

## 8. 엣지 케이스

### 8.1 첫 버전 생성

**시나리오**: 프롬프트 최초 생성 시

**해결책**:
```typescript
// 최초 생성 시 v1 자동 생성
if (!currentVersion) {
  await createPromptVersion(conversationId, {
    version: 1,
    prompt: generatedPrompt,
    changes: ['초기 생성'],
    createdBy: userId
  });
}
```

### 8.2 동시 수정

**시나리오**: 여러 사용자가 동시에 수정

**해결책**:
- 낙관적 동시성 제어 (Optimistic Concurrency Control)
- 버전 번호로 충돌 감지
- 충돌 시 재시도 또는 병합

### 8.3 대용량 프롬프트

**시나리오**: 프롬프트가 10,000자 이상

**해결책**:
- Firestore 문서 크기 제한 (1MB) 확인
- 필요 시 프롬프트를 별도 문서로 분리
- diff 계산 최적화

### 8.4 변경사항 없음

**시나리오**: 프롬프트를 수정했지만 내용이 동일

**해결책**:
```typescript
if (oldPrompt === newPrompt) {
  toast.info("변경사항이 없습니다");
  return; // 새 버전 생성 안 함
}
```

---

## 9. 보안 고려사항

### 9.1 권한 검증

**모든 API에서**:
```typescript
// 대화 소유자만 버전 조회/생성/복원 가능
const conversation = await getConversationById(input.conversationId);
if (conversation.userId !== ctx.user.uid) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### 9.2 버전 수 제한

**악용 방지**:
```typescript
// 최대 버전 수 제한
const versionCount = await countVersions(conversationId);
if (versionCount >= MAX_VERSIONS) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Maximum version limit reached'
  });
}
```

---

## 부록: UI 스크린샷

### A.1 VersionTimeline

```
┌─────────────────────────────────────┐
│  📜 버전 히스토리 (5개)        [X]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ●━━━ v3 (현재)    2시간 전         │
│      ✏️ 제약조건 추가, 형식 수정     │
│      ⭐ 87점                         │
│      [보기] [v2와 비교]              │
│                                     │
│  ○━━━ v2           어제             │
│      ✏️ 역할 명확화                  │
│      ⭐ 82점                         │
│      [보기] [v1과 비교] [이 버전으로]│
│                                     │
│  ○━━━ v1 (최초)    3일 전           │
│      ✏️ 초기 생성                    │
│      ⭐ 75점                         │
│      [보기]                          │
│                                     │
└─────────────────────────────────────┘
```

### A.2 VersionComparison

```
┌─────────────────────────────────────┐
│  v2 vs v3 비교                 [X]  │
├──────────────┬──────────────────────┤
│  v2 (어제)   │  v3 (현재, 2시간 전) │
├──────────────┼──────────────────────┤
│              │                      │
│  🎭 역할     │  🎭 역할             │
│  당신은...   │  당신은...           │
│              │                      │
│  🎯 목표     │  🎯 목표             │
│  블로그...   │  블로그...           │
│              │                      │
│  📋 제약     │  📋 제약             │
│  - 1000자    │  - 1500자  ⚠️ 변경  │
│              │  + 데이터  ✅ 추가   │
│              │                      │
│  📐 형식     │  📐 형식             │
│  1. 도입부   │  1. 훅      ⚠️ 변경 │
│  2. 본문     │  2. 분석    ⚠️ 변경 │
│  3. 결론     │  3. 결론             │
│              │                      │
├──────────────┴──────────────────────┤
│  [← v2로 복원]        [v3 유지 →]  │
└─────────────────────────────────────┘
```

---

**설계 문서 완료!**
