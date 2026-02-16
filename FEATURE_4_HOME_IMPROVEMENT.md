# Feature 4: 홈 페이지 개선 - 설계 문서

## 📋 목표
첫 방문자에게 ZetaLab의 가치를 명확히 전달하고 전환율 향상

## 🎯 개선 사항

### 1. 히어로 섹션
- **메시지**: "막연한 질문도 좋아요, AI가 도와줄거에요"
- **부제**: 명확하고 친근한 안내 메시지
- **입력창**: 중앙 배치, 큰 크기

### 2. 빠른 시작 카테고리
4개 주요 유스케이스:
- 📝 블로그 작성하기
- 📖 소설 쓰기
- 🎬 영상 대본 쓰기
- 📊 발표 자료

### 3. 최근 사용 프롬프트
- 개인화된 히스토리 (3-5개)
- 품질 점수 표시
- 다시 사용하기 버튼

### 4. 통계 표시
- 실시간 또는 고정값
- "오늘 X개 프롬프트 생성"
- "누적 Y명 사용자"

## 🏗️ 레이아웃 구조

```
┌────────────────────────────────────┐
│  Hero Section                      │
│  - 제목: 막연한 질문도 좋아요       │
│  - 부제: AI가 도와줄거에요          │
│  - 입력창 (큰 크기)                 │
├────────────────────────────────────┤
│  Quick Start Categories            │
│  [블로그] [소설] [영상] [발표]      │
├────────────────────────────────────┤
│  Recent Prompts                    │
│  [카드 1] [카드 2] [카드 3]         │
├────────────────────────────────────┤
│  Statistics                        │
│  📊 오늘 1,247개 프롬프트 생성      │
└────────────────────────────────────┘
```

## 📊 데이터 구조

### QuickStartCategory
```typescript
interface QuickStartCategory {
  id: string;
  label: string;
  icon: string;
  placeholder: string;
  example: string;
}
```

### RecentPrompt
```typescript
interface RecentPrompt {
  id: string;
  originalQuestion: string;
  createdAt: Date;
  qualityScore?: number;
}
```

## 🎨 UI 컴포넌트

### 1. HeroSection.tsx
- 제목 + 부제
- 대형 입력창
- 검색 버튼

### 2. QuickStartCategories.tsx
- 4개 카테고리 버튼
- 그리드 레이아웃 (2x2)
- 클릭 시 placeholder 변경

### 3. RecentPrompts.tsx
- 최근 5개 프롬프트 카드
- 품질 점수 배지
- 다시 사용하기 버튼
- 빈 상태 처리

### 4. StatsDisplay.tsx
- 통계 수치 표시
- 아이콘 + 텍스트

## 🔄 인터랙션

### 카테고리 클릭
1. 카테고리 버튼 클릭
2. 입력창 placeholder 변경
3. 입력창 포커스
4. 예시 텍스트 표시 (옵션)

### 최근 프롬프트 클릭
1. "다시 사용하기" 클릭
2. 원본 질문을 입력창에 자동 입력
3. 바로 Intent Clarification으로 이동

## 📱 반응형

### Desktop (≥1280px)
- 2열 그리드 (최근 프롬프트)
- 카테고리 4개 1줄

### Tablet (768-1279px)
- 2열 그리드
- 카테고리 2x2

### Mobile (<768px)
- 1열 스택
- 카테고리 2x2

## ✨ 애니메이션

### Fade In 시퀀스
```css
.hero { animation-delay: 0ms; }
.categories { animation-delay: 100ms; }
.recent { animation-delay: 200ms; }
.stats { animation-delay: 300ms; }
```

### Hover 효과
- 카테고리 버튼: scale(1.02) + shadow
- 최근 프롬프트 카드: border-color 변경

## 🚀 구현 단계

### Phase 1: Layout Components
- HeroSection.tsx
- QuickStartCategories.tsx
- RecentPrompts.tsx
- StatsDisplay.tsx

### Phase 2: Data Integration
- tRPC query for recent prompts
- Category constants
- Statistics API (or static)

### Phase 3: Interactions
- Category click handler
- Recent prompt click handler
- Input focus management

### Phase 4: Styling
- Tailwind classes
- Responsive grid
- Dark mode support

### Phase 5: Animations
- Fade in sequence
- Hover effects
- Transitions

### Phase 6: Testing
- Build test
- Responsive test
- Interaction test

## 📈 성공 지표

### 정량적
- 첫 프롬프트 생성까지 시간 감소
- 카테고리 버튼 클릭률
- 최근 프롬프트 재사용률

### 정성적
- 명확한 가치 전달
- 직관적인 UI
- 친근한 메시지

## 🎯 최종 목표

**"막연해도 괜찮다"는 메시지를 통해 사용자의 진입 장벽을 낮추고, 빠른 시작 카테고리로 전환율을 높인다.**
