# Feature 2: 결과 페이지 재디자인 - 설계 문서

**작성일**: 2026-02-12
**버전**: 1.0.0
**구현 난이도**: 6/10 (중)

---

## 목차
1. [파싱 알고리즘](#1-파싱-알고리즘)
2. [컴포넌트 구조](#2-컴포넌트-구조)
3. [스타일 가이드](#3-스타일-가이드)
4. [사용자 플로우](#4-사용자-플로우)
5. [엣지 케이스](#5-엣지-케이스)
6. [구현 우선순위](#6-구현-우선순위)

---

## 1. 파싱 알고리즘

### 1.1 목표

생성된 프롬프트 텍스트를 의미 있는 섹션으로 자동 분해

### 1.2 데이터 구조

```typescript
interface PromptSection {
  type: 'role' | 'goal' | 'constraints' | 'format' | 'context' | 'other';
  title: string;
  content: string;
  icon: string;
}

interface ParsedPrompt {
  sections: PromptSection[];
  raw: string;
}
```

### 1.3 감지 패턴

**역할 (Role)**:
- 패턴: `당신은`, `역할:`, `Role:`, `너는`, `당신의 역할은`
- 예: "당신은 블로그 작가입니다"
- 아이콘: 🎭

**목표 (Goal)**:
- 패턴: `목표:`, `작성해주세요`, `생성해주세요`, `만들어주세요`, `Goal:`, `~하는 것입니다`
- 예: "500단어 블로그 글을 작성해주세요"
- 아이콘: 🎯

**제약조건 (Constraints)**:
- 패턴: `제약:`, `조건:`, `금지:`, `~하지 마세요`, `~을 피하세요`, `반드시`, `필수`
- 예: "금지어: ~"
- 아이콘: 📋

**출력 형식 (Format)**:
- 패턴: `형식:`, `구조:`, `다음과 같이:`, `출력:`, `결과물:`, `포맷:`
- 예: "다음 형식으로 출력하세요:"
- 아이콘: 📐

**맥락 (Context)**:
- 패턴: `배경:`, `상황:`, `대상:`, `독자:`, `Context:`, `~을 위한`
- 예: "대상 독자: 20대 직장인"
- 아이콘: 📝

**기타 (Other)**:
- 위 패턴에 해당하지 않는 내용
- 아이콘: 💡

### 1.4 파싱 로직

```typescript
function parsePrompt(promptText: string): ParsedPrompt {
  const sections: PromptSection[] = [];

  // 1. 텍스트를 줄 단위로 분할
  const lines = promptText.split('\n').filter(line => line.trim());

  // 2. 각 줄을 순회하며 패턴 매칭
  let currentSection: PromptSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // 3. 섹션 헤더 감지 (예: "역할:", "목표:")
    const sectionMatch = detectSectionHeader(trimmed);

    if (sectionMatch) {
      // 이전 섹션 저장
      if (currentSection && currentSection.content) {
        sections.push(currentSection);
      }

      // 새 섹션 시작
      currentSection = {
        type: sectionMatch.type,
        title: sectionMatch.title,
        content: '',
        icon: SECTION_ICONS[sectionMatch.type]
      };
    } else if (currentSection) {
      // 4. 현재 섹션에 내용 추가
      currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
    } else {
      // 5. 섹션 없이 시작하는 경우 → 'other'로 분류
      if (!currentSection) {
        currentSection = {
          type: 'other',
          title: '프롬프트',
          content: '',
          icon: '💡'
        };
      }
      currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
    }
  }

  // 6. 마지막 섹션 저장
  if (currentSection && currentSection.content) {
    sections.push(currentSection);
  }

  // 7. 섹션이 없으면 전체를 'other'로
  if (sections.length === 0) {
    sections.push({
      type: 'other',
      title: '프롬프트',
      content: promptText,
      icon: '💡'
    });
  }

  return { sections, raw: promptText };
}

function detectSectionHeader(line: string): { type: SectionType; title: string } | null {
  // 정규식으로 패턴 매칭
  const patterns = [
    { regex: /^(당신은|역할:|Role:)/i, type: 'role', title: '역할 정의' },
    { regex: /^(목표:|Goal:|작성해주세요|생성해주세요|만들어주세요)/i, type: 'goal', title: '목표' },
    { regex: /^(제약:|조건:|금지:|필수:|반드시)/i, type: 'constraints', title: '제약조건' },
    { regex: /^(형식:|구조:|포맷:|출력:|결과물:)/i, type: 'format', title: '출력 형식' },
    { regex: /^(배경:|상황:|대상:|독자:|Context:)/i, type: 'context', title: '맥락' },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(line)) {
      return { type: pattern.type as SectionType, title: pattern.title };
    }
  }

  return null;
}
```

### 1.5 파싱 예시

**입력**:
```
당신은 블로그 작가입니다.

목표: 2026년 트렌드에 대한 1,500자 블로그 글 작성

제약조건:
- 데이터 기반 논거 제시
- 캐주얼한 톤

형식:
1. 도입부 (훅)
2. 트렌드 3가지 분석
3. 결론
```

**출력**:
```typescript
{
  sections: [
    {
      type: 'role',
      title: '역할 정의',
      content: '당신은 블로그 작가입니다.',
      icon: '🎭'
    },
    {
      type: 'goal',
      title: '목표',
      content: '2026년 트렌드에 대한 1,500자 블로그 글 작성',
      icon: '🎯'
    },
    {
      type: 'constraints',
      title: '제약조건',
      content: '- 데이터 기반 논거 제시\n- 캐주얼한 톤',
      icon: '📋'
    },
    {
      type: 'format',
      title: '출력 형식',
      content: '1. 도입부 (훅)\n2. 트렌드 3가지 분석\n3. 결론',
      icon: '📐'
    }
  ],
  raw: '...'
}
```

---

## 2. 컴포넌트 구조

### 2.1 컴포넌트 계층

```
PromptDisplay (메인)
├── PromptHeader (상단 메타)
├── PromptSection (개별 섹션) × N
│   └── SectionCopyButton (복사 버튼)
└── PromptActions (하단 액션)
```

### 2.2 PromptDisplay

**파일**: `client/src/components/prompt/PromptDisplay.tsx`

```typescript
interface PromptDisplayProps {
  promptText: string;
  qualityScore?: number;
  createdAt: Date;
  isEdited?: boolean;
  onCopy?: () => void;
  onEdit?: () => void;
  onTest?: () => void;
}

export function PromptDisplay(props: PromptDisplayProps) {
  const parsed = parsePrompt(props.promptText);

  return (
    <div className="space-y-4">
      <PromptHeader {...props} />

      <div className="space-y-3">
        {parsed.sections.map((section, index) => (
          <PromptSection
            key={index}
            section={section}
            index={index}
            onCopy={handleSectionCopy}
          />
        ))}
      </div>

      <PromptActions {...props} />
    </div>
  );
}
```

### 2.3 PromptHeader

**파일**: `client/src/components/prompt/PromptHeader.tsx`

```typescript
interface PromptHeaderProps {
  qualityScore?: number;
  createdAt: Date;
  isEdited?: boolean;
}

// 표시 내용:
// - 제목 "생성된 프롬프트"
// - 품질 점수 배지 (있는 경우)
// - 생성 시간 (상대 시간)
// - 수정 여부 배지
```

### 2.4 PromptSection

**파일**: `client/src/components/prompt/PromptSection.tsx`

```typescript
interface PromptSectionProps {
  section: PromptSection;
  index: number;
  onCopy: (content: string) => void;
}

// 표시 내용:
// - 아이콘 + 제목
// - 섹션 내용 (pre-wrap)
// - 복사 버튼 (호버 시 표시)
// - 등장 애니메이션 (index * 100ms delay)
```

### 2.5 SectionCopyButton

**파일**: `client/src/components/prompt/SectionCopyButton.tsx`

```typescript
interface SectionCopyButtonProps {
  content: string;
  onCopy: () => void;
}

// 동작:
// - 클릭 시 clipboard에 복사
// - 아이콘 변경: 📋 → ✓
// - 0.5초 후 원래 아이콘으로
```

### 2.6 PromptActions

**파일**: `client/src/components/prompt/PromptActions.tsx`

```typescript
interface PromptActionsProps {
  onCopyAll: () => void;
  onEdit?: () => void;
  onTest?: () => void;
  onShare?: () => void;
}

// 버튼:
// - [전체 복사] (primary)
// - [수정] (outline)
// - [테스트하기] (outline, 향후)
// - [공유] (ghost, 향후)
```

---

## 3. 스타일 가이드

### 3.1 색상 시스템

**섹션별 색상 (Light 모드)**:
```css
--section-role: #8b5cf6;      /* 보라 - 역할 */
--section-goal: #3b82f6;      /* 파랑 - 목표 */
--section-constraints: #f59e0b; /* 주황 - 제약 */
--section-format: #10b981;    /* 초록 - 형식 */
--section-context: #6366f1;   /* 인디고 - 맥락 */
--section-other: #6b7280;     /* 회색 - 기타 */
```

**섹션별 색상 (Dark 모드)**:
```css
--section-role-dark: #a78bfa;
--section-goal-dark: #60a5fa;
--section-constraints-dark: #fbbf24;
--section-format-dark: #34d399;
--section-context-dark: #818cf8;
--section-other-dark: #9ca3af;
```

### 3.2 타이포그래피

```css
/* 섹션 제목 */
.section-title {
  font-size: 0.875rem;      /* 14px */
  font-weight: 600;
  line-height: 1.25rem;
}

/* 섹션 내용 */
.section-content {
  font-size: 0.875rem;      /* 14px */
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 65ch;          /* 읽기 최적 너비 */
}

/* 메타 정보 */
.meta-text {
  font-size: 0.75rem;       /* 12px */
  color: var(--color-muted-foreground);
}
```

### 3.3 간격 (Spacing)

```css
/* 섹션 간 간격 */
.section-gap {
  margin-bottom: 0.75rem;   /* 12px */
}

/* 섹션 내부 패딩 */
.section-padding {
  padding: 1rem;            /* 16px */
}

/* 제목-내용 간격 */
.title-content-gap {
  margin-bottom: 0.5rem;    /* 8px */
}
```

### 3.4 레이아웃

**Desktop (≥768px)**:
```
┌─────────────────────────────────────┐
│ 🎭 역할 정의                [복사]  │
│ 당신은 블로그 작가입니다.           │
└─────────────────────────────────────┘
```

**Mobile (<768px)**:
```
┌───────────────────────┐
│ 🎭                    │
│ 역할 정의       [복사]│
│ 당신은 블로그 작가...  │
└───────────────────────┘
```

---

## 4. 사용자 플로우

### 4.1 프롬프트 확인 플로우

```
1. PromptResult 페이지 로드
    ↓
2. Right Panel에 PromptDisplay 렌더링
    ↓
3. 파싱 수행 (섹션 분해)
    ↓
4. 섹션별 등장 애니메이션 (순차적)
    ↓
5. 사용자가 섹션 읽기
    ↓
6. 섹션 호버 → 복사 버튼 표시
    ↓
7. 복사 버튼 클릭 → 클립보드 복사
    ↓
8. 토스트 알림: "복사되었습니다 ✓"
```

### 4.2 복사 옵션

**전체 복사**:
- 원본 프롬프트 텍스트 그대로
- 파싱 전 raw 데이터 사용
- 버튼: "전체 복사"

**섹션별 복사**:
- 해당 섹션의 content만
- 제목 포함 옵션
- 버튼: 각 섹션의 복사 아이콘

### 4.3 인터랙션

**호버 효과**:
- 섹션 배경 살짝 밝아짐
- 복사 버튼 페이드 인 (opacity: 0 → 1)
- 트랜지션: 200ms

**복사 피드백**:
- 버튼 아이콘: 📋 → ✓
- 토스트 메시지 표시
- 0.5초 후 아이콘 복귀

**애니메이션**:
- 섹션 등장: fadeInUp (순차적, 100ms 간격)
- 복사 버튼: fadeIn (호버 시)

---

## 5. 엣지 케이스

### 5.1 파싱 실패

**시나리오**: 프롬프트가 예상 패턴과 맞지 않음

**해결책**:
```typescript
if (parsed.sections.length === 0) {
  // 전체를 'other' 섹션으로
  return {
    sections: [{
      type: 'other',
      title: '프롬프트',
      content: promptText,
      icon: '💡'
    }],
    raw: promptText
  };
}
```

### 5.2 빈 섹션

**시나리오**: 섹션 헤더는 있지만 내용이 없음

**해결책**:
```typescript
// 빈 섹션 필터링
sections = sections.filter(s => s.content.trim().length > 0);
```

### 5.3 매우 긴 섹션

**시나리오**: 단일 섹션이 1000자 이상

**해결책** (선택):
```typescript
// "더 보기" 기능
const [expanded, setExpanded] = useState(false);
const isLong = section.content.length > 500;

return (
  <div>
    <p>{expanded ? section.content : section.content.slice(0, 500) + '...'}</p>
    {isLong && (
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? '접기' : '더 보기'}
      </Button>
    )}
  </div>
);
```

### 5.4 특수 문자

**시나리오**: 프롬프트에 마크다운, 코드 블록 포함

**해결책**:
```typescript
// 특수 문자 이스케이프는 하지 않음
// pre-wrap + word-break로 자연스럽게 표시
// 코드 블록은 monospace 폰트로 표시
```

### 5.5 다국어

**시나리오**: 영어 프롬프트

**해결책**:
```typescript
// 영어 패턴 추가
const patterns = [
  { regex: /^(You are|Your role|Role:)/i, type: 'role', title: 'Role' },
  { regex: /^(Goal:|Objective:|Task:)/i, type: 'goal', title: 'Goal' },
  // ...
];
```

---

## 6. 구현 우선순위

### 6.1 필수 기능 (Phase 1-4)

**P0 - 핵심**:
- ✅ `parsePrompt()` 함수
- ✅ `PromptSection` 컴포넌트
- ✅ `PromptDisplay` 컴포넌트
- ✅ 섹션별 복사 기능
- ✅ 폴백 처리 (파싱 실패 시)

**P1 - 중요**:
- ✅ `PromptHeader` (메타 정보)
- ✅ `PromptActions` (하단 버튼)
- ✅ 전체 복사 기능
- ✅ 토스트 알림

### 6.2 선택 기능 (Phase 5-6)

**P2 - 개선**:
- 🔲 "더 보기/접기" (긴 섹션)
- 🔲 애니메이션 (순차 등장)
- 🔲 섹션 호버 하이라이트
- 🔲 다크모드 색상 최적화

**P3 - 향후**:
- 🔲 "테스트하기" (AI 서비스 연동)
- 🔲 "공유" (링크 생성)
- 🔲 섹션 순서 재배치 (드래그앤드롭)
- 🔲 섹션 편집

---

## 7. 구현 계획

### Phase 1: 유틸리티 함수 (1-2시간)
- `promptParser.ts` 생성
- `parsePrompt()` 함수 구현
- 정규식 패턴 정의
- 테스트 케이스 (수동)

### Phase 2: 기본 컴포넌트 (1-2시간)
- `PromptSection.tsx` 구현
- `SectionCopyButton.tsx` 구현
- 기본 스타일링

### Phase 3: 복합 컴포넌트 (1-2시간)
- `PromptHeader.tsx` 구현
- `PromptActions.tsx` 구현
- `PromptDisplay.tsx` 통합

### Phase 4: PromptResult 통합 (1시간)
- Right Panel 수정
- PromptDisplay 렌더링
- 폴백 처리

### Phase 5: 인터랙션 (1시간)
- 복사 기능 완성
- 토스트 알림
- 호버 효과

### Phase 6: 테스트 & 최적화 (1시간)
- 다양한 프롬프트 테스트
- 모바일 테스트
- 성능 최적화

**총 예상 시간**: 6-9시간

---

## 8. 성공 지표

### 정량적 지표
- ✅ 파싱 성공률: >90%
- ✅ 복사 성공률: 100%
- ✅ 렌더링 시간: <100ms
- ✅ 빌드 성공

### 정성적 지표
- ✅ 가독성 향상 (섹션 구분 명확)
- ✅ 복사 편의성 (섹션별/전체)
- ✅ 시각적 계층 (색상, 아이콘)
- ✅ 모바일 최적화

---

## 부록: 예시 프롬프트

### 예시 1: 블로그 글
```
당신은 20대 직장인을 위한 블로그 작가입니다.

목표: 2026년 직장인 트렌드에 대한 1,500자 블로그 글 작성

제약조건:
- 데이터 기반 논거 제시
- 캐주얼하면서도 전문적인 톤
- 실제 통계 인용

출력 형식:
1. 도입부 (흥미로운 훅)
2. 트렌드 3가지 분석 (각 400자)
3. 결론 및 실행 가능한 팁
```

### 예시 2: 코드 리뷰
```
역할: 시니어 백엔드 개발자

목표: TypeScript로 작성된 REST API 코드 리뷰

대상: 주니어 개발자의 첫 PR

제약:
- 건설적인 피드백만
- 보안 이슈 우선 지적
- 코드 예시 포함

형식:
- 항목별 리스트 (✅/⚠️/❌)
- 각 항목에 설명과 개선안
```

---

**설계 문서 완료!**
