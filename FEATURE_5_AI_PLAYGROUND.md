# Feature 5: AI Playground - 설계 문서

## 📋 목표
ZetaLab 내에서 프롬프트를 직접 테스트하고 동급 AI 모델 비교

## 🎯 핵심 기능

### 1. 모델 선택
- Claude Sonnet 4.5 (Anthropic)
- GPT-4o (OpenAI)
- Gemini 2.0 Flash (Google)

### 2. 실행 모드
- **단일 실행**: 1개 모델 선택
- **비교 모드**: 2-3개 모델 동시 실행

### 3. 실시간 실행
- API 병렬 호출
- 스트리밍 응답 (선택적)
- 결과 표시

### 4. 비교 매트릭스
- 속도 비교
- 비용 비교
- 품질 평가 (사용자 투표)

## 🏗️ 데이터 구조

### AIModel
```typescript
interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google';
  tier: 'S';
  description: string;
  costPer1kTokens: number;
  icon: string;
  color: string;
}
```

### ModelResult
```typescript
interface ModelResult {
  modelId: string;
  response: string;
  duration: number;      // ms
  tokenCount: number;
  estimatedCost: number;
  error?: string;
}
```

### ComparisonData
```typescript
interface ComparisonData {
  fastest: string;       // modelId
  cheapest: string;
  mostVoted?: string;
  results: ModelResult[];
}
```

## 📊 Backend API

### Router: playground.ts

#### executePrompt
```typescript
input: {
  prompt: string;
  modelIds: string[];
  systemPrompt?: string;
}

output: {
  results: ModelResult[];
}
```

#### API 통합
- Anthropic API (Claude)
- OpenAI API (GPT-4o)
- Google AI API (Gemini)

#### 환경 변수
```bash
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
```

## 🎨 UI 컴포넌트

### 1. Playground.tsx (메인 페이지)
- 전체 레이아웃
- 상태 관리
- API 호출

### 2. ModelSelector.tsx
- 모델 체크박스 목록
- 단일/비교 모드 전환
- 모델 정보 표시

### 3. PromptEditor.tsx
- 프롬프트 입력 (Textarea)
- System prompt (선택적)
- 예시 프롬프트

### 4. ExecutionPanel.tsx
- 실행 버튼
- 로딩 상태
- 진행률 표시

### 5. ResultCard.tsx
- 개별 모델 결과
- 메타데이터 (속도, 토큰, 비용)
- 복사 버튼

### 6. ComparisonTable.tsx
- 비교 매트릭스
- 최고/최저 표시
- 사용자 투표

## 🔄 실행 플로우

```
1. 사용자가 프롬프트 입력
   ↓
2. 모델 선택 (1-3개)
   ↓
3. "실행" 버튼 클릭
   ↓
4. Backend API 호출 (병렬)
   ↓
5. 결과 수신 및 표시
   ↓
6. 비교 매트릭스 계산
   ↓
7. 결과 표시 (카드 + 표)
```

## 📱 레이아웃

### Desktop
```
┌────────────────────────────────────┐
│  🧪 AI Playground                   │
├────────────────────────────────────┤
│  📝 프롬프트                         │
│  [Textarea - 큰 크기]               │
├────────────────────────────────────┤
│  ⚙️ 설정                            │
│  ○ 단일 실행 ● 비교 모드            │
│                                    │
│  모델 선택:                         │
│  ☑ Claude Sonnet 4.5               │
│  ☐ GPT-4o                          │
│  ☐ Gemini 2.0 Flash                │
│                                    │
│  [실행 (예상: $0.023)]             │
├────────────────────────────────────┤
│  📊 결과                            │
│  ┌──────┬──────┬──────┐            │
│  │Claude│GPT-4o│Gemini│            │
│  │...   │...   │...   │            │
│  └──────┴──────┴──────┘            │
├────────────────────────────────────┤
│  📈 비교                            │
│  가장 빠름: Gemini (1.2초)          │
│  가장 저렴: Gemini ($0.008)         │
└────────────────────────────────────┘
```

### Mobile
- 1열 스택
- 결과 카드 스크롤
- 비교 표 간소화

## 💰 비용 관리

### 예상 비용 표시
- 실행 전: 토큰 수 추정 → 비용 계산
- 실행 후: 실제 토큰 → 정확한 비용

### 사용량 제한
- 무료: 하루 10회
- Pro: 무제한 (미래)

### 비용 최적화
- 캐싱 (동일 프롬프트 재실행 방지)
- 토큰 제한 (max_tokens)

## 🚨 에러 처리

### API 에러
- 401: API 키 없음
- 429: 할당량 초과
- 500: 서버 에러
- Timeout: 30초 초과

### 표시
```
┌──────────────────┐
│  ❌ Claude       │
│  API 호출 실패    │
│  (429 에러)      │
│  [다시 시도]      │
└──────────────────┘
```

## 🎯 성공 지표

### 기능적
- 3개 모델 정상 통합
- 병렬 실행 (3개 동시)
- 결과 정확성

### 성능
- 응답 시간 < 10초
- 에러율 < 5%

### UX
- 명확한 비교
- 쉬운 복사
- 직관적 UI

## 🔮 향후 개선

### Phase 2
- [ ] 스트리밍 응답
- [ ] 채팅 모드
- [ ] 히스토리 저장

### Phase 3
- [ ] 추가 모델 (Claude Opus, GPT-4 Turbo)
- [ ] 파라미터 조정 (temperature, max_tokens)
- [ ] 배치 실행

## 📝 구현 순서

1. **Phase 1**: 타입 & 상수
   - AIModel 인터페이스
   - MODELS 상수
   - ModelResult 타입

2. **Phase 2**: Backend API
   - playground.ts 라우터
   - Anthropic API 통합
   - OpenAI API 통합
   - Google AI API 통합

3. **Phase 3**: UI 컴포넌트
   - ModelSelector
   - PromptEditor
   - ExecutionPanel
   - ResultCard
   - ComparisonTable

4. **Phase 4**: 페이지 통합
   - Playground.tsx
   - 상태 관리
   - API 호출 로직

5. **Phase 5**: 최적화
   - 에러 처리
   - 로딩 상태
   - 반응형 디자인

6. **Phase 6**: 테스트
   - Build test
   - API 통합 테스트
   - UI 테스트

## ⚠️ 주의사항

### API 키 보안
- 환경 변수로 관리
- 클라이언트에 노출 금지
- .gitignore 확인

### 비용 관리
- 실제 API 호출 비용 발생
- 테스트 시 주의
- 사용량 모니터링

### Rate Limiting
- API 제공자별 제한
- 재시도 로직
- 에러 핸들링

## 🎉 완료 기준

- ✅ 3개 모델 통합
- ✅ 단일/비교 모드 작동
- ✅ 결과 표시 및 비교
- ✅ 에러 처리
- ✅ 반응형 UI
- ✅ 빌드 성공
