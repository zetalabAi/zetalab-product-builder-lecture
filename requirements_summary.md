# ZetaLab 수정사항 요구사항 정리

## 1. 사이드바 구조 재편성

### 1.1 메뉴 순서 변경
**기존:**
1. 새 채팅
2. 검색
3. 채팅
4. 프로젝트
5. 아티팩트
6. Builder Box

**변경 후:**
1. 새 채팅
2. 검색
3. 채팅
4. **아티팩트** (위치 변경)
5. **프로젝트** (위치 변경)
6. Builder Box

### 1.2 "최근 항목" → "모든 작업"으로 명칭 변경

### 1.3 더미 데이터 제거 및 제타랩 철학 컨텐츠 추가
- **제거할 항목:**
  - 마리본드 AI 모바일 앱 전자 구현 계획
  - AI 감지기 설명
  - 유튜브 채널 관리 서비스 프롬플리오

- **추가할 항목:**
  - 제타랩의 철학 설명
  - 주요 기능 안내 (프로젝트, 아티팩트 포함)
  - 신규 사용자를 위한 가이드

---

## 2. 프로젝트 기능 구현

### 목표
Manus의 프로젝트 기능과 동일하게 **폴더 관리 시스템** 구현

### 주요 기능
- 프로젝트(폴더) 생성/수정/삭제
- 작업을 프로젝트에 할당
- 프로젝트별 작업 필터링 및 조회
- 프로젝트 목록 UI

### 데이터베이스 스키마 (예상)
```typescript
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 작업(세션)에 프로젝트 ID 추가
export const sessions = sqliteTable('sessions', {
  // ... 기존 필드
  projectId: text('project_id').references(() => projects.id),
});
```

---

## 3. 아티팩트 기능 구현

### 목표
Manus의 라이브러리와 유사하지만, **프롬프트 저장 전용** 기능 구현

### 주요 기능
- 완성된 프롬프트 저장
- 저장된 프롬프트 목록 조회
- 프롬프트 재사용 (불러오기)
- 프롬프트 검색/필터링
- 프롬프트 수정/삭제

### 데이터베이스 스키마 (예상)
```typescript
export const artifacts = sqliteTable('artifacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(), // 프롬프트 내용
  builderType: text('builder_type'), // blog, video, ppt, uiux 등
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

### UI 위치
- 사이드바 메뉴: 채팅 바로 아래
- 클릭 시: 저장된 프롬프트 목록 페이지로 이동

---

## 4. 테마 토글 버튼 추가

### 위치
우측 상단 구석 (사용자 프로필 근처)

### 디자인
- **라이트 모드**: 태양 아이콘 ☀️
- **다크 모드**: 달 아이콘 🌙
- 클릭 시 아이콘과 테마가 함께 전환
- 부드러운 전환 애니메이션

### 기술 구현
- 현재 ThemeContext 활용
- 로컬 스토리지에 테마 설정 저장
- 페이지 로드 시 저장된 테마 자동 적용

---

## 5. 불필요한 페이지 제거

### 확인 대상 페이지
1. **Templates** - 클릭 시 홈으로 리다이렉트 → 제거 검토
2. **IntentClarification** - 실제 사용 중 → 유지
3. **PromptResult** - 클릭 시 홈으로 리다이렉트 → 제거 검토
4. **History** - 클릭 시 홈으로 리다이렉트 → 제거 검토

### 제거 기준
- 기능이 없고 홈으로 리다이렉트만 하는 페이지
- 용량 낭비 방지
- 코드 정리 및 유지보수성 향상

---

## 6. 사용자 정보 수집 개선

### OAuth 로그인 시 수집 정보
- 이메일
- 이름
- 전화번호 (가능한 경우)
- 프로필 이미지

### 데이터베이스 스키마 확장
```typescript
export const users = sqliteTable('users', {
  // ... 기존 필드
  email: text('email'),
  phone: text('phone'),
  profileImage: text('profile_image'),
});
```

---

## 7. 구독결제 시스템 아이디어 (브리핑 예정)

### 검토 사항
1. **구독 플랜 설계**
   - 무료 플랜: 기본 기능, 제한된 프롬프트 생성 횟수
   - 프리미엄 플랜: 무제한 프롬프트 생성, 고급 Builder 기능
   - 프로 플랜: 팀 협업, API 액세스, 우선 지원

2. **결제 시스템**
   - Stripe 연동 (webdev_add_feature 사용)
   - 월간/연간 구독 옵션
   - 결제 이력 관리

3. **기능 제한 로직**
   - 무료 사용자: 월 N회 프롬프트 생성 제한
   - 프리미엄 기능 잠금 UI
   - 업그레이드 유도 메시지

---

## 작업 우선순위

### Phase 1: 즉시 구현 (UI/UX 개선)
1. 사이드바 구조 재편성
2. 제타랩 철학 컨텐츠 작성 및 추가
3. 테마 토글 버튼 추가
4. 불필요한 페이지 제거

### Phase 2: 핵심 기능 구현
1. 프로젝트 기능 (폴더 관리)
2. 아티팩트 기능 (프롬프트 저장)

### Phase 3: 고급 기능
1. 사용자 정보 수집 개선
2. 구독결제 시스템 설계 및 구현

---

## 예상 작업 시간
- Phase 1: 2-3시간
- Phase 2: 4-6시간
- Phase 3: 6-8시간 (결제 시스템 포함)

**총 예상 시간: 12-17시간**
