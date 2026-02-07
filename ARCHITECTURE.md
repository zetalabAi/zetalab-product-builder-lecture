# ZetaLab 아키텍처 문서

**작성일**: 2026-01-29  
**작성자**: Manus AI  
**버전**: 1.0.0

---

## 개요

이 문서는 ZetaLab 프로젝트의 기술 스택, 폴더 구조, 코딩 컨벤션, 반복 패턴을 정리합니다. **모든 코드 작성은 이 문서를 최우선 기준으로 따릅니다.** 대규모 리팩터링을 전제하지 않으며, 지금부터 이 기준을 따르는 것을 목표로 합니다.

---

## 기술 스택

### 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.1 | UI 라이브러리 |
| **TypeScript** | 5.9.3 | 타입 안정성 |
| **Vite** | 7.1.7 | 빌드 도구 |
| **Tailwind CSS** | 4.1.14 | 스타일링 |
| **shadcn/ui** | - | UI 컴포넌트 라이브러리 (Radix UI 기반) |
| **Wouter** | 3.3.5 | 클라이언트 라우팅 |
| **tRPC** | 11.6.0 | 타입 안전 API 클라이언트 |
| **TanStack Query** | 5.90.2 | 서버 상태 관리 |
| **Zod** | 4.1.12 | 스키마 검증 |
| **Lucide React** | 0.453.0 | 아이콘 |
| **Sonner** | 2.0.7 | 토스트 알림 |

### 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| **Node.js** | - | 런타임 |
| **Express** | 4.21.2 | HTTP 서버 |
| **tRPC** | 11.6.0 | 타입 안전 API 서버 |
| **Drizzle ORM** | 0.44.5 | 데이터베이스 ORM |
| **MySQL2** | 3.15.0 | MySQL 드라이버 |
| **Zod** | 4.1.12 | 입력 검증 |
| **Superjson** | 1.13.3 | JSON 직렬화 (Date 지원) |
| **Jose** | 6.1.0 | JWT 처리 |
| **Nanoid** | 5.1.5 | 고유 ID 생성 |

### 개발 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| **Vitest** | 2.1.4 | 테스트 프레임워크 |
| **Prettier** | 3.6.2 | 코드 포맷터 |
| **ESBuild** | 0.25.0 | 프로덕션 빌드 |
| **TSX** | 4.19.1 | TypeScript 실행 |
| **Drizzle Kit** | 0.31.4 | 데이터베이스 마이그레이션 |

### 외부 서비스

- **Manus OAuth**: 사용자 인증
- **LLM (GPT-4)**: 프롬프트 생성
- **MySQL/TiDB**: 데이터베이스
- **AWS S3**: 파일 저장 (설정되어 있지만 현재 미사용)

---

## 폴더 구조

```
zetalab/
├── client/                    # 프론트엔드
│   ├── public/                # 정적 파일 (로고, robots.txt, sitemap.xml)
│   ├── src/
│   │   ├── _core/             # 코어 유틸리티 (프레임워크 제공)
│   │   │   └── hooks/         # useAuth 등
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── ui/            # shadcn/ui 컴포넌트 (수정 금지)
│   │   │   ├── Sidebar.tsx    # 사이드바
│   │   │   ├── MainLayout.tsx # 메인 레이아웃
│   │   │   └── ...
│   │   ├── contexts/          # React Context (ThemeContext)
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── lib/               # 라이브러리 설정 (trpc, utils)
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── const.ts           # 상수 (getLoginUrl)
│   │   ├── index.css          # 글로벌 스타일
│   │   ├── main.tsx           # 엔트리 포인트
│   │   └── App.tsx            # 라우팅 설정
│   └── index.html             # HTML 템플릿
├── server/                    # 백엔드
│   ├── _core/                 # 코어 유틸리티 (프레임워크 제공, 수정 금지)
│   │   ├── context.ts         # tRPC 컨텍스트
│   │   ├── trpc.ts            # tRPC 설정
│   │   ├── llm.ts             # LLM 헬퍼
│   │   ├── oauth.ts           # OAuth 헬퍼
│   │   ├── cookies.ts         # 쿠키 설정
│   │   └── ...
│   ├── db.ts                  # 데이터베이스 헬퍼 함수
│   ├── routers.ts             # tRPC 라우터 (API 엔드포인트)
│   ├── storage.ts             # S3 스토리지 헬퍼
│   └── *.test.ts              # Vitest 테스트 파일
├── drizzle/                   # 데이터베이스 스키마 및 마이그레이션
│   ├── schema.ts              # 테이블 정의
│   ├── *.sql                  # 마이그레이션 SQL
│   └── meta/                  # Drizzle 메타데이터
├── shared/                    # 프론트엔드-백엔드 공유 코드
│   ├── const.ts               # 공유 상수
│   └── types.ts               # 공유 타입
├── package.json               # 의존성 관리
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
├── vitest.config.ts           # Vitest 설정
├── drizzle.config.ts          # Drizzle 설정
└── todo.md                    # 작업 목록
```

### 중요 규칙

1. **`_core` 디렉토리는 수정 금지**: 프레임워크가 제공하는 코어 유틸리티이므로 직접 수정하지 않습니다.
2. **`components/ui`는 수정 금지**: shadcn/ui 컴포넌트는 CLI로 생성되므로 직접 수정하지 않습니다. 커스터마이징이 필요하면 래퍼 컴포넌트를 만듭니다.
3. **페이지 컴포넌트는 `pages/`에**: 라우팅되는 컴포넌트는 `client/src/pages/`에 배치합니다.
4. **재사용 컴포넌트는 `components/`에**: 여러 페이지에서 사용하는 컴포넌트는 `client/src/components/`에 배치합니다.
5. **데이터베이스 헬퍼는 `server/db.ts`에**: 모든 데이터베이스 쿼리는 `db.ts`에 함수로 정의하고 라우터에서 재사용합니다.

---

## 코딩 컨벤션

### TypeScript

**명명 규칙**:
- **변수/함수**: camelCase (`userName`, `getUserById`)
- **타입/인터페이스**: PascalCase (`User`, `InsertUser`)
- **상수**: UPPER_SNAKE_CASE (`COOKIE_NAME`, `ONE_YEAR_MS`)
- **파일명**: PascalCase (컴포넌트), camelCase (유틸리티)

**타입 정의**:
- Drizzle 스키마에서 자동 생성된 타입 사용: `typeof users.$inferSelect`, `typeof users.$inferInsert`
- 공유 타입은 `shared/types.ts`에 정의
- API 입력/출력 타입은 Zod 스키마로 정의

**예시**:
```typescript
// ✅ Good
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

const getUserById = async (id: number): Promise<User | undefined> => {
  // ...
};

// ❌ Bad
export interface User {
  id: number;
  name: string;
  // ... (수동 타입 정의)
}
```

### React

**컴포넌트 구조**:
```typescript
// 1. Import
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

// 2. 타입 정의
interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

// 3. 컴포넌트
export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  // 3.1 State
  const [value, setValue] = useState("");
  
  // 3.2 Hooks
  const [, navigate] = useLocation();
  const mutation = trpc.myApi.useMutation();
  
  // 3.3 Handlers
  const handleSubmit = () => {
    onSubmit(value);
  };
  
  // 3.4 Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
```

**tRPC 사용 패턴**:
```typescript
// Query
const { data, isLoading, error } = trpc.myApi.useQuery({ id: 1 });

// Mutation
const mutation = trpc.myApi.useMutation({
  onSuccess: (data) => {
    toast.success("성공!");
    navigate("/result");
  },
  onError: (error) => {
    toast.error("오류: " + error.message);
  }
});

// 호출
mutation.mutate({ name: "test" });
```

**조건부 렌더링**:
```typescript
// ✅ Good: 명확한 조건부 렌더링
{user ? (
  <UserProfile user={user} />
) : (
  <LoginButton />
)}

// ❌ Bad: && 연산자로 인한 0 렌더링
{items.length && <ItemList items={items} />}
```

### 백엔드 (tRPC)

**라우터 구조**:
```typescript
export const appRouter = router({
  myFeature: router({
    // Query: 데이터 조회
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const result = await getDataById(input.id);
        if (!result || result.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return result;
      }),
    
    // Mutation: 데이터 변경
    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createData({
          userId: ctx.user.id,
          name: input.name
        });
        return { success: true, id: result[0].insertId };
      })
  })
});
```

**데이터베이스 헬퍼 패턴**:
```typescript
// server/db.ts
export async function getDataById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(myTable).where(eq(myTable.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createData(data: InsertMyData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(myTable).values(data);
}
```

**권한 검증 패턴**:
```typescript
// 사용자 소유권 검증
const data = await getDataById(input.id);
if (!data || data.userId !== ctx.user.id) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
}

// 관리자 권한 검증
if (ctx.user.role !== 'admin') {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
}
```

### 데이터베이스

**스키마 정의 패턴**:
```typescript
export const myTable = mysqlTable("myTable", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MyData = typeof myTable.$inferSelect;
export type InsertMyData = typeof myTable.$inferInsert;
```

**마이그레이션 워크플로우**:
1. `drizzle/schema.ts` 수정
2. `pnpm drizzle-kit generate` 실행 → SQL 생성
3. 생성된 `.sql` 파일 확인
4. `webdev_execute_sql` 도구로 SQL 적용
5. TypeScript 타입 자동 업데이트 확인

---

## 반복 패턴

### 1. 인증 필요 페이지 패턴

```typescript
export default function MyPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // 로딩 중
  if (loading) {
    return <div>로딩 중...</div>;
  }
  
  // 비로그인 시 리다이렉트
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  // 메인 렌더링
  return <div>...</div>;
}
```

### 2. 폼 제출 패턴

```typescript
const [formData, setFormData] = useState({ name: "", email: "" });

const mutation = trpc.myApi.create.useMutation({
  onSuccess: () => {
    toast.success("저장되었습니다");
    navigate("/success");
  },
  onError: (error) => {
    toast.error("오류: " + error.message);
  }
});

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // 유효성 검사
  if (!formData.name.trim()) {
    toast.error("이름을 입력해주세요");
    return;
  }
  
  mutation.mutate(formData);
};
```

### 3. 목록 조회 및 검색 패턴

```typescript
const [searchQuery, setSearchQuery] = useState("");

const { data: items, isLoading } = trpc.myApi.search.useQuery({
  query: searchQuery
});

return (
  <div>
    <Input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="검색..."
    />
    
    {isLoading ? (
      <div>로딩 중...</div>
    ) : items && items.length > 0 ? (
      <div>
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    ) : (
      <div>검색 결과가 없습니다</div>
    )}
  </div>
);
```

### 4. 삭제 확인 다이얼로그 패턴

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<number | null>(null);

const deleteMutation = trpc.myApi.delete.useMutation({
  onSuccess: () => {
    toast.success("삭제되었습니다");
    setDeleteDialogOpen(false);
    // 목록 새로고침
    trpc.useUtils().myApi.getAll.invalidate();
  }
});

const handleDelete = () => {
  if (itemToDelete) {
    deleteMutation.mutate({ id: itemToDelete });
  }
};

return (
  <>
    <Button onClick={() => {
      setItemToDelete(item.id);
      setDeleteDialogOpen(true);
    }}>
      삭제
    </Button>
    
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
```

---

## 스타일링 가이드

### Tailwind CSS 사용

**기본 원칙**:
- Tailwind 유틸리티 클래스 우선 사용
- 커스텀 CSS는 `index.css`의 `@layer utilities`에 정의
- 컴포넌트별 스타일은 Tailwind 클래스로 인라인 작성

**색상 시스템**:
- CSS 변수 기반: `--color-background`, `--color-foreground` 등
- Tailwind 클래스: `bg-background`, `text-foreground`, `border-border`
- 다크 모드: `ThemeProvider`로 관리, CSS 변수 자동 전환

**커스텀 유틸리티 클래스**:
```css
/* index.css */
@layer utilities {
  .chat-container {
    max-width: 48rem;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
```

**사용 예시**:
```typescript
<div className="chat-container">
  <Card className="p-6 border-border bg-card">
    <h1 className="text-2xl font-bold text-foreground">제목</h1>
    <p className="text-muted-foreground">설명</p>
  </Card>
</div>
```

### shadcn/ui 컴포넌트 사용

**기본 사용법**:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Button variant="default" size="lg">
  클릭
</Button>

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

**variant 패턴**:
- `Button`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `Badge`: `default`, `secondary`, `destructive`, `outline`

---

## 성능 최적화

### 1. tRPC 쿼리 캐싱

TanStack Query가 자동으로 캐싱하므로 별도 설정 불필요. 단, 데이터 변경 후 캐시 무효화 필요:

```typescript
const utils = trpc.useUtils();

const mutation = trpc.myApi.create.useMutation({
  onSuccess: () => {
    // 특정 쿼리 무효화
    utils.myApi.getAll.invalidate();
    
    // 모든 쿼리 무효화
    utils.invalidate();
  }
});
```

### 2. 이미지 최적화

- 정적 이미지는 `client/public/`에 배치
- 파일명에 해시 추가 (예: `logo.a3f2b1c4.png`) → 캐시 무효화
- 절대 경로로 참조: `/logo.a3f2b1c4.png`

### 3. 코드 스플리팅

Vite가 자동으로 처리하므로 별도 설정 불필요. 페이지별로 자동 분할됨.

---

## 보안 규칙

### 1. 인증 검증

**프론트엔드**:
- `useAuth()` 훅으로 인증 상태 확인
- 비로그인 시 로그인 페이지로 리다이렉트

**백엔드**:
- `protectedProcedure` 사용 → 자동 인증 검증
- `ctx.user`로 현재 사용자 접근

### 2. 권한 검증

**사용자 소유권 검증**:
```typescript
const data = await getDataById(input.id);
if (!data || data.userId !== ctx.user.id) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

**관리자 권한 검증**:
```typescript
if (ctx.user.role !== 'admin') {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### 3. 입력 검증

**Zod 스키마 사용**:
```typescript
.input(z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().int().positive()
}))
```

### 4. XSS 방지

- React가 자동으로 이스케이프 처리
- `dangerouslySetInnerHTML` 사용 금지
- 사용자 입력을 HTML로 렌더링하지 않음

### 5. CSRF 방지

- 세션 쿠키: `SameSite=lax`, `HttpOnly`, `Secure`
- tRPC는 JSON 기반이므로 CSRF 공격 불가능

---

## 테스트 전략

### 1. Vitest 테스트 작성

**파일 위치**: `server/*.test.ts`

**기본 구조**:
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';

describe('myFeature', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  
  beforeAll(async () => {
    caller = appRouter.createCaller({
      user: { id: 1, role: 'user' },
      req: {} as any,
      res: {} as any
    });
  });
  
  it('should create data', async () => {
    const result = await caller.myFeature.create({ name: 'test' });
    expect(result.success).toBe(true);
  });
});
```

### 2. 테스트 커버리지

**필수 테스트**:
- 인증 필요 API: 비로그인 시 에러
- 권한 검증: 다른 사용자 데이터 접근 시 에러
- 입력 검증: 잘못된 입력 시 에러
- 정상 플로우: 성공 케이스

**테스트 실행**:
```bash
pnpm test
```

---

## 위험 요소 및 주의사항

### 🔴 확장 시 깨질 가능성이 높은 부분

#### 1. TypeScript 타입 에러

**현재 상태**: `Sidebar.tsx`와 `Projects.tsx`에 tRPC 타입 에러 존재

**원인**: 백엔드 라우터에 정의되지 않은 프로시저를 프론트엔드에서 호출

**해결 방법**:
- `Sidebar.tsx`: `updateConversationTitle` 프로시저 백엔드에 추가 또는 프론트엔드 코드 제거
- `Projects.tsx`: `project.delete` 프로시저 백엔드 라우터에 등록

**영향**: 타입 에러가 있어도 런타임에는 동작하지만, 타입 안정성이 깨짐

#### 2. 프로젝트 삭제 API 미등록

**현재 상태**: `server/db.ts`에 `deleteProject` 함수 존재하지만 `server/routers.ts`에 미등록

**해결 방법**:
```typescript
// server/routers.ts
project: router({
  // ...
  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      await deleteProject(input.projectId);
      return { success: true };
    })
})
```

#### 3. localStorage 정리 타이밍

**현재 상태**: `main.tsx`에서 앱 초기화 시 `cleanupAuthStorage()` 호출

**위험**: 로그인 상태에서도 localStorage가 삭제되어 일시적으로 사용자 정보가 사라질 수 있음

**권장 사항**: `useAuth` 훅에서 `trpc.auth.me` 쿼리 성공 시에만 localStorage 정리

#### 4. 의도 템플릿 관리

**현재 상태**: 시드 데이터로만 관리, 관리자 UI 없음

**위험**: 새로운 카테고리 추가 시 데이터베이스 직접 수정 필요

**권장 사항**: 관리자 UI 추가 또는 시드 스크립트 자동화

#### 5. JSON 필드 파싱 에러 처리 부족

**현재 상태**: `intentAnswers`, `suggestedServices` 등 JSON 필드를 `JSON.parse()`로 파싱하지만 에러 처리 없음

**위험**: 잘못된 JSON 데이터 시 서버 크래시

**권장 사항**:
```typescript
const intentAnswers = prompt.intentAnswers 
  ? JSON.parse(prompt.intentAnswers) 
  : {};

// ↓ 개선

let intentAnswers = {};
try {
  intentAnswers = prompt.intentAnswers ? JSON.parse(prompt.intentAnswers) : {};
} catch (error) {
  console.error('Failed to parse intentAnswers:', error);
}
```

#### 6. Sidebar 대화 목록 더보기 메뉴 미완성 기능

**현재 상태**: 사이드바 대화 목록에 더보기 메뉴(점 3개)가 있지만 일부 기능 미구현

**구현된 기능**: 삭제

**미구현 기능**: 
- 고정: 프론트엔드에서 "곧 추가됩니다" 토스트만 표시, 백엔드 API 없음
- 이름변경: 프론트엔드에서 다이얼로그만 표시, 백엔드 API 없음

**권장 사항**: 백엔드에 `pinConversation`, `updateConversationTitle` 프로시저 추가

#### 7. 사이드바 메뉴 항목 중 미구현 기능

**현재 상태**: 사이드바에 메뉴 항목이 있지만 일부 기능 미구현

**미구현 메뉴**:
- 아티팩트: 라우팅 없음, 클릭 시 "준비중" 토스트
- Builder Box: 라우팅 없음, 클릭 시 "준비중" 토스트

**권장 사항**: 미구현 메뉴는 사이드바에서 제거하거나, 구현 후 활성화

### 🟡 주의가 필요한 부분

#### 1. 세션 쿠키 설정

**현재 설정**: `SameSite=lax`, `HttpOnly`, `Secure`

**주의**: 프로덕션 환경에서 HTTPS 필수. HTTP에서는 `Secure` 쿠키가 작동하지 않음.

#### 2. LLM API 호출 비용

**현재 상태**: 프롬프트 생성 시마다 GPT-4 호출

**주의**: 사용량 증가 시 비용 급증 가능

**권장 사항**: 캐싱, 요청 제한, 비용 모니터링

#### 3. 데이터베이스 연결 풀

**현재 상태**: `getDb()`로 단일 연결 생성

**주의**: 동시 요청 증가 시 병목 가능

**권장 사항**: 연결 풀 설정 추가

---

## 배포 및 운영

### 빌드

```bash
pnpm build
```

**결과**:
- 프론트엔드: `client/dist/`
- 백엔드: `dist/index.js`

### 실행

```bash
pnpm start
```

### 환경 변수

모든 환경 변수는 Manus 플랫폼에서 자동 주입. 로컬 개발 시 `.env` 파일 사용 (Git 제외).

---

## 개발 워크플로우

### 1. 새 기능 추가

1. `todo.md`에 작업 항목 추가
2. 데이터베이스 스키마 수정 (`drizzle/schema.ts`)
3. 마이그레이션 생성 및 적용
4. 데이터베이스 헬퍼 함수 작성 (`server/db.ts`)
5. tRPC 라우터에 프로시저 추가 (`server/routers.ts`)
6. 프론트엔드 페이지/컴포넌트 작성
7. Vitest 테스트 작성
8. 브라우저에서 동작 확인
9. `todo.md`에서 완료 표시
10. 체크포인트 생성

### 2. 버그 수정

1. `todo.md`에 버그 항목 추가
2. 원인 분석 (로그, 브라우저 콘솔, 데이터베이스)
3. 수정 코드 작성
4. 테스트로 재발 방지 확인
5. `todo.md`에서 완료 표시
6. 체크포인트 생성

### 3. 코드 리뷰 체크리스트

- [ ] 타입 에러 없음 (`pnpm check`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] 인증/권한 검증 포함
- [ ] 입력 검증 (Zod 스키마)
- [ ] 에러 처리 (try-catch, TRPCError)
- [ ] 코딩 컨벤션 준수
- [ ] 불필요한 주석 제거
- [ ] `todo.md` 업데이트

---

## 참고 자료

- [tRPC 공식 문서](https://trpc.io/)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)
- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Vitest 공식 문서](https://vitest.dev/)

---

## 변경 이력

### v1.0.0 (2026-01-29)

- 초기 아키텍처 문서 작성
- 기술 스택, 폴더 구조, 코딩 컨벤션 정리
- 반복 패턴 및 위험 요소 문서화
