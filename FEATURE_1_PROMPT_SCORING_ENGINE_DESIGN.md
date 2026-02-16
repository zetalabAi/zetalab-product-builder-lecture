# Feature 1: 프롬프트 스코어링 엔진 - 설계 문서

**작성일**: 2026-02-12
**버전**: 1.0.0
**구현 난이도**: 7/10 (중상)

---

## 목차
1. [아키텍처 개요](#1-아키텍처-개요)
2. [데이터 모델](#2-데이터-모델)
3. [API 스펙](#3-api-스펙)
4. [컴포넌트 설계](#4-컴포넌트-설계)
5. [UI/UX 플로우](#5-uiux-플로우)
6. [구현 주의사항](#6-구현-주의사항)
7. [테스트 계획](#7-테스트-계획)
8. [다음 단계 (Step 2)](#8-다음-단계-step-2)

---

## 1. 아키텍처 개요

### 1.1 시스템 플로우

```
┌─────────────────────────────────────────────────────────────────┐
│                     프롬프트 생성 완료                            │
│                  (PromptResult 페이지 로드)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: 품질 분석 트리거                                       │
│  - trpc.quality.analyzePromptQuality.useMutation()              │
│  - 로딩 상태 표시 (스켈레톤)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: tRPC 라우터 (quality.ts)                               │
│  1. Gemini API 호출 (프롬프트 평가 요청)                          │
│  2. JSON 응답 파싱 및 검증                                        │
│  3. Firestore에 qualityScore 저장                                │
│  4. PromptQuality 객체 반환                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: UI 렌더링                                             │
│  - QualityScoreCard 표시                                         │
│  - 애니메이션 효과 (카운트업, 슬라이드)                           │
│  - 개선 제안 표시                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 컴포넌트 구조

```
client/src/
├── types/
│   └── quality.ts                    # PromptQuality 타입 정의
├── components/
│   └── quality/
│       ├── QualityScoreCard.tsx      # 메인 점수 카드
│       ├── QualityMeter.tsx          # 원형 프로그레스
│       ├── QualityBreakdown.tsx      # 6개 기준 바 차트
│       ├── QualitySuggestions.tsx    # 개선 제안 리스트
│       └── QualityBadge.tsx          # 간단한 배지
└── pages/
    └── PromptResult.tsx              # 통합 (수정됨)

server/
├── routers/
│   ├── quality.ts                    # 새 라우터
│   └── index.ts                      # 라우터 등록 (routers.ts)
└── db.ts                             # Firestore 헬퍼 추가
```

### 1.3 데이터 플로우

```
[PromptResult 페이지]
      ↓ (프롬프트 로드 완료)
[자동 트리거: analyzePromptQuality]
      ↓
[Backend: Gemini API 호출]
      ↓
[Firestore 저장]
      ↓
[Frontend: QualityScoreCard 렌더링]
```

---

## 2. 데이터 모델

### 2.1 TypeScript 타입 정의

**파일**: `client/src/types/quality.ts`

```typescript
/**
 * 프롬프트 품질 평가 결과
 */
export interface PromptQuality {
  /** 명확성 (0-100) */
  clarity: number;

  /** 구체성 (0-100) */
  specificity: number;

  /** 구조화 (0-100) */
  structure: number;

  /** 맥락 (0-100) */
  context: number;

  /** 제약조건 (0-100) */
  constraints: number;

  /** 종합 점수 (위 5개 평균, 0-100) */
  overall: number;

  /** 개선 제안 (3-5개) */
  suggestions: string[];

  /** 분석 시간 */
  analyzedAt: Date;
}

/**
 * 품질 분석 요청
 */
export interface QualityAnalysisRequest {
  promptId: string;
  promptText: string;
}

/**
 * 품질 분석 응답
 */
export interface QualityAnalysisResponse {
  quality: PromptQuality;
  error?: string;
}

/**
 * 품질 등급 (점수 기반)
 */
export type QualityGrade = "excellent" | "good" | "fair" | "poor";

/**
 * 점수에 따른 등급 결정 헬퍼
 */
export function getQualityGrade(score: number): QualityGrade {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

/**
 * 등급별 색상 매핑
 */
export const QUALITY_GRADE_COLORS: Record<QualityGrade, string> = {
  excellent: "text-green-600 dark:text-green-500",
  good: "text-blue-600 dark:text-blue-500",
  fair: "text-yellow-600 dark:text-yellow-500",
  poor: "text-red-600 dark:text-red-500",
};

/**
 * 품질 기준 라벨 한글화
 */
export const QUALITY_CRITERIA_LABELS: Record<keyof Omit<PromptQuality, "overall" | "suggestions" | "analyzedAt">, string> = {
  clarity: "명확성",
  specificity: "구체성",
  structure: "구조화",
  context: "맥락",
  constraints: "제약조건",
};
```

### 2.2 Firestore 스키마 확장

**컬렉션**: `conversations` (기존)

**추가 필드**:

```typescript
conversations/{conversationId}
  - userId: string
  - sessionId: string
  - originalQuestion: string
  - intentAnswers: object
  - generatedPrompt: string
  - editedPrompt: string
  - usedLLM: string
  - suggestedServices: object
  - isPinned: boolean
  - projectId: string (optional)
  - createdAt: timestamp
  - updatedAt: timestamp

  // 🆕 새 필드
  - qualityScore?: {
      clarity: number
      specificity: number
      structure: number
      context: number
      constraints: number
      overall: number
      suggestions: string[]
      analyzedAt: timestamp
    }
```

**인덱싱 전략**:
- 기존 인덱스 유지 (`userId + createdAt`)
- 새 필드는 인덱스 불필요 (단일 문서 조회만 수행)
- `qualityScore.overall`은 선택적으로 인덱스 추가 (향후 랭킹 기능 시)

**호환성**:
- `qualityScore` 필드는 선택적 (optional)
- 기존 문서는 `qualityScore` 없어도 정상 동작
- 새 프롬프트부터 점진적으로 적용

---

## 3. API 스펙

### 3.1 새 라우터: `quality`

**파일**: `server/routers/quality.ts`

```typescript
import { router, protectedProcedure } from "@/_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getPromptHistoryById, updatePromptHistory } from "@/db";
import { invokeLLM } from "@/_core/llm-claude";

export const qualityRouter = router({
  /**
   * 프롬프트 품질 분석
   * - Gemini API 호출하여 6가지 기준으로 평가
   * - Firestore에 결과 저장
   * - 캐싱: 이미 분석된 경우 재분석하지 않음
   */
  analyzePromptQuality: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
        forceReanalyze: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. 프롬프트 조회 및 권한 검증
      const prompt = await getPromptHistoryById(input.promptId);

      if (!prompt || prompt.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this prompt'
        });
      }

      // 2. 캐싱 확인 (이미 분석된 경우)
      if (prompt.qualityScore && !input.forceReanalyze) {
        return {
          quality: {
            ...prompt.qualityScore,
            analyzedAt: new Date(prompt.qualityScore.analyzedAt),
          },
          cached: true,
        };
      }

      // 3. 분석할 프롬프트 텍스트 결정
      const promptText = prompt.editedPrompt || prompt.generatedPrompt;

      // 4. Gemini API 호출
      const systemPrompt = `당신은 프롬프트 엔지니어링 전문가입니다.
다음 프롬프트를 6가지 기준으로 평가해주세요:

[프롬프트 내용]
${promptText}

평가 기준:
1. Clarity (명확성): 요구사항이 얼마나 명확한가? (0-100점)
   - 모호한 표현이 없는지, 목표가 분명한지 평가

2. Specificity (구체성): 구체적인 세부사항이 얼마나 포함되었는가? (0-100점)
   - 예시, 수치, 구체적 조건 포함 여부

3. Structure (구조화): 논리적 구조를 갖추고 있는가? (0-100점)
   - 단계별 설명, 순서, 계층 구조 평가

4. Context (맥락): 충분한 배경 정보를 제공하는가? (0-100점)
   - 대상 독자, 사용 목적, 환경 정보 포함 여부

5. Constraints (제약조건): 명확한 제약사항이 명시되어 있는가? (0-100점)
   - 금지사항, 형식, 길이, 톤 등의 제약 명시 여부

각 기준을 0-100점으로 평가하고, 3-5개의 구체적인 개선 제안을 해주세요.
개선 제안은 실행 가능하고 구체적이어야 합니다.

**반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만)**:
{
  "clarity": 85,
  "specificity": 78,
  "structure": 92,
  "context": 70,
  "constraints": 88,
  "suggestions": [
    "대상 독자의 배경 지식 수준을 명시하면 더 좋습니다",
    "원하는 글의 톤(formal/casual)을 추가하세요",
    "최종 결과물의 길이를 구체적으로 명시하세요"
  ]
}`;

      let qualityData;
      let retryCount = 0;
      const MAX_RETRIES = 2;

      while (retryCount <= MAX_RETRIES) {
        try {
          const response = await invokeLLM({
            messages: [
              { role: 'user', content: systemPrompt }
            ],
            temperature: 0.3, // 일관성을 위해 낮은 온도
          });

          const messageContent = response.choices[0]?.message?.content;
          if (!messageContent) {
            throw new Error('Empty response from LLM');
          }

          // JSON 파싱 (마크다운 코드 블록 제거)
          const cleanedContent = messageContent
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

          qualityData = JSON.parse(cleanedContent);

          // 데이터 검증
          const requiredFields = ['clarity', 'specificity', 'structure', 'context', 'constraints', 'suggestions'];
          for (const field of requiredFields) {
            if (!(field in qualityData)) {
              throw new Error(`Missing field: ${field}`);
            }
          }

          // 점수 범위 검증 (0-100)
          for (const field of ['clarity', 'specificity', 'structure', 'context', 'constraints']) {
            const score = qualityData[field];
            if (typeof score !== 'number' || score < 0 || score > 100) {
              throw new Error(`Invalid score for ${field}: ${score}`);
            }
          }

          // suggestions 검증
          if (!Array.isArray(qualityData.suggestions) || qualityData.suggestions.length < 3) {
            throw new Error('Suggestions must be an array with at least 3 items');
          }

          // 성공 - 루프 탈출
          break;

        } catch (error) {
          console.error(`[analyzePromptQuality] Parse error (attempt ${retryCount + 1}):`, error);
          retryCount++;

          if (retryCount > MAX_RETRIES) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to parse quality analysis after retries',
            });
          }
        }
      }

      // 5. Overall 점수 계산 (5개 기준의 평균)
      const overall = Math.round(
        (qualityData.clarity +
          qualityData.specificity +
          qualityData.structure +
          qualityData.context +
          qualityData.constraints) / 5
      );

      const qualityScore = {
        clarity: qualityData.clarity,
        specificity: qualityData.specificity,
        structure: qualityData.structure,
        context: qualityData.context,
        constraints: qualityData.constraints,
        overall,
        suggestions: qualityData.suggestions,
        analyzedAt: new Date(),
      };

      // 6. Firestore에 저장
      await updatePromptHistory(input.promptId, {
        qualityScore,
      });

      // 7. 결과 반환
      return {
        quality: qualityScore,
        cached: false,
      };
    }),

  /**
   * 프롬프트 품질 점수 조회
   * - 캐시된 점수 반환 (재분석 없음)
   */
  getPromptQuality: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const prompt = await getPromptHistoryById(input.promptId);

      if (!prompt || prompt.userId !== ctx.user.uid) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot access this prompt'
        });
      }

      if (!prompt.qualityScore) {
        return null;
      }

      return {
        ...prompt.qualityScore,
        analyzedAt: new Date(prompt.qualityScore.analyzedAt),
      };
    }),
});
```

### 3.2 라우터 등록

**파일**: `server/routers.ts` (기존 파일 수정)

```typescript
// 파일 상단에 import 추가
import { qualityRouter } from './routers/quality';

// appRouter에 추가
export const appRouter = router({
  system: systemRouter,
  auth: router({ /* ... */ }),
  zetaAI: router({ /* ... */ }),
  project: router({ /* ... */ }),
  promptTemplate: router({ /* ... */ }),
  promptAsset: router({ /* ... */ }),
  feedback: router({ /* ... */ }),

  // 🆕 새 라우터 추가
  quality: qualityRouter,
});
```

### 3.3 Firestore 헬퍼 추가

**파일**: `server/db.ts` (기존 파일에 추가)

```typescript
// 기존 코드 유지, updatePromptHistory 함수가 이미 존재하므로
// qualityScore 필드를 지원하도록 확인만 필요
// (현재 구조상 이미 모든 필드를 동적으로 업데이트 가능)
```

---

## 4. 컴포넌트 설계

### 4.1 QualityScoreCard (메인 컴포넌트)

**파일**: `client/src/components/quality/QualityScoreCard.tsx`

```typescript
import { PromptQuality } from "@/types/quality";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { QualityMeter } from "./QualityMeter";
import { QualityBreakdown } from "./QualityBreakdown";
import { QualitySuggestions } from "./QualitySuggestions";

interface QualityScoreCardProps {
  quality: PromptQuality;
  isLoading?: boolean;
  onImprove?: () => void;
  onReanalyze?: () => void;
}

export function QualityScoreCard({
  quality,
  isLoading,
  onImprove,
  onReanalyze
}: QualityScoreCardProps) {
  return (
    <Card className="p-6 border-border/40 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">품질 분석</h3>
        </div>
        {onReanalyze && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">재분석</span>
          </Button>
        )}
      </div>

      {/* Overall Score (원형 프로그레스) */}
      <div className="flex flex-col items-center py-4">
        <QualityMeter score={quality.overall} size="lg" />
        <p className="mt-3 text-sm text-muted-foreground">
          종합 점수
        </p>
      </div>

      {/* Breakdown (6개 기준 바 차트) */}
      <QualityBreakdown quality={quality} />

      {/* Suggestions (개선 제안) */}
      <QualitySuggestions suggestions={quality.suggestions} />

      {/* Action Button */}
      {onImprove && (
        <Button
          onClick={onImprove}
          className="w-full flex items-center justify-center gap-2"
          size="sm"
        >
          <Sparkles className="w-4 h-4" />
          AI로 자동 개선
        </Button>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        분석 시간: {new Date(quality.analyzedAt).toLocaleString('ko-KR')}
      </p>
    </Card>
  );
}
```

### 4.2 QualityMeter (원형 프로그레스)

**파일**: `client/src/components/quality/QualityMeter.tsx`

```typescript
import { useEffect, useState } from "react";
import { getQualityGrade, QUALITY_GRADE_COLORS } from "@/types/quality";

interface QualityMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { width: 80, stroke: 6, fontSize: "text-lg" },
  md: { width: 120, stroke: 8, fontSize: "text-2xl" },
  lg: { width: 160, stroke: 10, fontSize: "text-3xl" },
};

export function QualityMeter({ score, size = "md" }: QualityMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = SIZE_CONFIG[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const grade = getQualityGrade(score);
  const colorClass = QUALITY_GRADE_COLORS[grade];

  // 카운트업 애니메이션
  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1초
    const increment = score / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: config.width, height: config.width }}>
      {/* Background Circle */}
      <svg
        className="transform -rotate-90"
        width={config.width}
        height={config.width}
      >
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress Circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>

      {/* Score Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${config.fontSize} font-bold ${colorClass}`}>
          {animatedScore}
        </span>
      </div>
    </div>
  );
}
```

### 4.3 QualityBreakdown (바 차트)

**파일**: `client/src/components/quality/QualityBreakdown.tsx`

```typescript
import { useEffect, useState } from "react";
import { PromptQuality, QUALITY_CRITERIA_LABELS, getQualityGrade, QUALITY_GRADE_COLORS } from "@/types/quality";

interface QualityBreakdownProps {
  quality: PromptQuality;
}

export function QualityBreakdown({ quality }: QualityBreakdownProps) {
  const [animatedScores, setAnimatedScores] = useState({
    clarity: 0,
    specificity: 0,
    structure: 0,
    context: 0,
    constraints: 0,
  });

  // 바 차트 애니메이션 (슬라이드 인)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores({
        clarity: quality.clarity,
        specificity: quality.specificity,
        structure: quality.structure,
        context: quality.context,
        constraints: quality.constraints,
      });
    }, 300); // 원형 프로그레스 후 시작

    return () => clearTimeout(timer);
  }, [quality]);

  const criteria = [
    { key: "clarity", label: QUALITY_CRITERIA_LABELS.clarity, score: quality.clarity },
    { key: "specificity", label: QUALITY_CRITERIA_LABELS.specificity, score: quality.specificity },
    { key: "structure", label: QUALITY_CRITERIA_LABELS.structure, score: quality.structure },
    { key: "context", label: QUALITY_CRITERIA_LABELS.context, score: quality.context },
    { key: "constraints", label: QUALITY_CRITERIA_LABELS.constraints, score: quality.constraints },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">세부 평가</h4>
      {criteria.map((criterion, index) => {
        const grade = getQualityGrade(criterion.score);
        const colorClass = QUALITY_GRADE_COLORS[grade];
        const animatedScore = animatedScores[criterion.key as keyof typeof animatedScores];

        return (
          <div key={criterion.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{criterion.label}</span>
              <span className={`font-medium ${colorClass}`}>
                {criterion.score}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass.replace('text-', 'bg-')} transition-all duration-700 ease-out`}
                style={{
                  width: `${animatedScore}%`,
                  transitionDelay: `${index * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 4.4 QualitySuggestions (개선 제안)

**파일**: `client/src/components/quality/QualitySuggestions.tsx`

```typescript
import { Lightbulb } from "lucide-react";

interface QualitySuggestionsProps {
  suggestions: string[];
}

export function QualitySuggestions({ suggestions }: QualitySuggestionsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Lightbulb className="w-4 h-4" />
        개선 제안
      </h4>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="text-sm text-foreground/90 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary animate-fadeIn"
            style={{ animationDelay: `${800 + index * 150}ms` }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.5 QualityBadge (간단한 배지)

**파일**: `client/src/components/quality/QualityBadge.tsx`

```typescript
import { Badge } from "@/components/ui/badge";
import { getQualityGrade, QUALITY_GRADE_COLORS } from "@/types/quality";

interface QualityBadgeProps {
  score: number;
  showScore?: boolean;
}

const GRADE_LABELS = {
  excellent: "우수",
  good: "양호",
  fair: "보통",
  poor: "개선 필요",
};

export function QualityBadge({ score, showScore = true }: QualityBadgeProps) {
  const grade = getQualityGrade(score);
  const colorClass = QUALITY_GRADE_COLORS[grade];

  return (
    <Badge variant="outline" className={`${colorClass} border-current`}>
      {GRADE_LABELS[grade]}
      {showScore && ` (${score})`}
    </Badge>
  );
}
```

### 4.6 애니메이션 CSS 추가

**파일**: `client/src/index.css` (기존 파일에 추가)

```css
@layer utilities {
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
    opacity: 0;
  }
}
```

---

## 5. UI/UX 플로우

### 5.1 PromptResult 페이지 통합

**파일**: `client/src/pages/PromptResult.tsx` (기존 파일 수정)

```typescript
// 기존 imports에 추가
import { QualityScoreCard } from "@/components/quality/QualityScoreCard";
import { PromptQuality } from "@/types/quality";

export default function PromptResult() {
  // 기존 코드 유지...

  // 🆕 품질 분석 mutation
  const analyzeQualityMutation = trpc.quality.analyzePromptQuality.useMutation({
    onSuccess: (data) => {
      if (data.cached) {
        toast.info("캐시된 품질 분석 결과입니다");
      } else {
        toast.success("품질 분석이 완료되었습니다");
      }
    },
    onError: (error) => {
      toast.error("품질 분석 실패: " + error.message);
    }
  });

  // 🆕 품질 점수 조회 query
  const { data: qualityData, refetch: refetchQuality } = trpc.quality.getPromptQuality.useQuery(
    { promptId },
    {
      enabled: isAuthenticated && !!promptId,
      staleTime: Infinity, // 캐시 무효화 안 함 (수동 재분석만)
    }
  );

  // 🆕 페이지 로드 시 품질 분석 자동 트리거
  useEffect(() => {
    if (prompt && !qualityData && !analyzeQualityMutation.isPending) {
      analyzeQualityMutation.mutate({ promptId });
    }
  }, [prompt, qualityData, analyzeQualityMutation.isPending]);

  // 🆕 재분석 핸들러
  const handleReanalyze = () => {
    analyzeQualityMutation.mutate({
      promptId,
      forceReanalyze: true
    });
  };

  // 기존 렌더링 코드...

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className="w-full max-w-3xl mx-auto space-y-6 py-8">
        {/* 기존 컴포넌트들... */}

        {/* 🆕 품질 점수 카드 (Intent 분석 결과 다음에 위치) */}
        {analyzeQualityMutation.isPending ? (
          <Card className="p-6 border-border/40">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  품질 분석 중... (3-5초 소요)
                </p>
              </div>
            </div>
          </Card>
        ) : qualityData ? (
          <QualityScoreCard
            quality={qualityData}
            onReanalyze={handleReanalyze}
            onImprove={() => {
              // TODO: Step 2에서 구현 (AI 자동 개선)
              toast.info("자동 개선 기능은 곧 추가됩니다");
            }}
          />
        ) : analyzeQualityMutation.isError ? (
          <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20">
            <div className="text-center space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                품질 분석에 실패했습니다
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReanalyze}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                다시 시도
              </Button>
            </div>
          </Card>
        ) : null}

        {/* 기존 Edit Prompt Section... */}
        {/* 기존 나머지 컴포넌트들... */}
      </div>
    </div>
  );
}
```

### 5.2 사용자 플로우 다이어그램

```
[1. 프롬프트 생성 완료]
         ↓
[2. PromptResult 페이지 로드]
         ↓
[3. 자동으로 품질 분석 시작]
         ↓
┌────────────────────────┐
│  로딩 상태 (3-5초)      │
│  - 스피너               │
│  - "품질 분석 중..." 메시지 │
└────────────────────────┘
         ↓
[4. 품질 분석 완료]
         ↓
┌────────────────────────┐
│  QualityScoreCard      │
│  - 원형 프로그레스 (애니메이션) │
│  - 세부 평가 바 차트    │
│  - 개선 제안 리스트     │
│  - "재분석" 버튼        │
│  - "AI로 자동 개선" 버튼│
└────────────────────────┘
         ↓
[5. 사용자 액션]
  ├─ 복사 → 외부 AI 서비스에서 사용
  ├─ 재분석 → 새 품질 분석 (forceReanalyze: true)
  ├─ 자동 개선 → (Step 2에서 구현)
  └─ 프롬프트 수정 → 수동 편집
```

### 5.3 로딩 상태 디자인

```typescript
// 스켈레톤 UI (옵션)
<Card className="p-6 border-border/40 space-y-4 animate-pulse">
  <div className="h-4 bg-muted rounded w-1/4"></div>
  <div className="flex justify-center">
    <div className="w-40 h-40 bg-muted rounded-full"></div>
  </div>
  <div className="space-y-2">
    <div className="h-3 bg-muted rounded"></div>
    <div className="h-3 bg-muted rounded"></div>
    <div className="h-3 bg-muted rounded"></div>
  </div>
</Card>
```

### 5.4 에러 처리 UX

**시나리오 1: 네트워크 오류**
```
┌──────────────────────────┐
│  ⚠️  품질 분석 실패       │
│  네트워크 오류가 발생했습니다 │
│  [다시 시도] 버튼          │
└──────────────────────────┘
```

**시나리오 2: JSON 파싱 오류**
```
┌──────────────────────────┐
│  ⚠️  품질 분석 실패       │
│  분석 결과를 처리할 수 없습니다│
│  [다시 시도] 버튼          │
└──────────────────────────┘
```

**시나리오 3: 타임아웃 (10초)**
```
┌──────────────────────────┐
│  ⚠️  분석 시간 초과       │
│  잠시 후 다시 시도해주세요  │
│  [다시 시도] 버튼          │
└──────────────────────────┘
```

---

## 6. 구현 주의사항

### 6.1 알려진 이슈 및 엣지 케이스

#### 1. Gemini API 응답 불안정성
**문제**: LLM이 항상 완벽한 JSON을 반환하지 않을 수 있음

**해결책**:
- 최대 2회 재시도
- JSON 파싱 전 마크다운 코드 블록 제거
- 엄격한 데이터 검증 (필수 필드, 점수 범위)
- 실패 시 사용자에게 명확한 에러 메시지

#### 2. 캐싱 전략
**문제**: 동일한 프롬프트를 여러 번 분석하면 비용 증가

**해결책**:
- Firestore에 `qualityScore` 저장
- 이미 분석된 경우 재분석 안 함
- 사용자가 명시적으로 "재분석" 버튼 클릭 시에만 `forceReanalyze: true`

#### 3. 타임아웃 처리
**문제**: Gemini API 응답이 느릴 수 있음

**해결책**:
- tRPC 타임아웃 설정 (10초)
- 프론트엔드에 로딩 상태 명확히 표시
- 타임아웃 발생 시 재시도 옵션 제공

#### 4. 점수 일관성
**문제**: LLM이 동일한 프롬프트에 대해 다른 점수 부여 가능

**해결책**:
- `temperature: 0.3` 사용 (낮은 랜덤성)
- 상세한 평가 기준 제공
- 캐싱으로 재분석 최소화

#### 5. 권한 검증
**문제**: 다른 사용자의 프롬프트 품질 분석 시도

**해결책**:
- `protectedProcedure` 사용
- `prompt.userId !== ctx.user.uid` 검증
- TRPCError로 명확한 오류 반환

#### 6. Firestore 스키마 호환성
**문제**: 기존 문서에 `qualityScore` 필드 없음

**해결책**:
- `qualityScore`를 optional로 설계
- 존재 여부 확인 후 렌더링
- 없으면 자동으로 분석 트리거

### 6.2 베스트 프랙티스

#### 1. 성능 최적화
```typescript
// ✅ Good: 조건부 렌더링으로 불필요한 컴포넌트 생성 방지
{qualityData && <QualityScoreCard quality={qualityData} />}

// ❌ Bad: 항상 컴포넌트 생성
<QualityScoreCard quality={qualityData || defaultQuality} />
```

#### 2. 애니메이션 최적화
```typescript
// ✅ Good: CSS 트랜지션 사용 (GPU 가속)
<div className="transition-all duration-700 ease-out" style={{ width: `${score}%` }} />

// ❌ Bad: JavaScript 애니메이션 (성능 저하)
setInterval(() => setWidth(width + 1), 10);
```

#### 3. 에러 핸들링
```typescript
// ✅ Good: 구체적인 에러 메시지
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Failed to parse quality analysis: missing field "clarity"'
});

// ❌ Bad: 모호한 에러
throw new Error('Analysis failed');
```

#### 4. 타입 안정성
```typescript
// ✅ Good: 엄격한 타입 정의
interface PromptQuality {
  clarity: number; // 0-100
  // ...
}

// ❌ Bad: any 사용
interface PromptQuality {
  [key: string]: any;
}
```

### 6.3 보안 고려사항

#### 1. 권한 검증 (필수)
```typescript
// 모든 API에서 사용자 권한 확인
if (!prompt || prompt.userId !== ctx.user.uid) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

#### 2. 입력 검증
```typescript
// Zod 스키마로 입력 검증
.input(z.object({
  promptId: z.string().min(1),
  forceReanalyze: z.boolean().optional(),
}))
```

#### 3. Rate Limiting (향후 추가 권장)
```typescript
// 사용자당 분석 횟수 제한 (예: 하루 100회)
// Redis 또는 Firestore로 구현
```

---

## 7. 테스트 계획

### 7.1 Unit Tests (Vitest)

**파일**: `server/routers/quality.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './index';

describe('quality.analyzePromptQuality', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller({
      user: { id: 'test-user-123', uid: 'test-user-123', role: 'user' },
      req: {} as any,
      res: {} as any
    });
  });

  it('should analyze prompt quality successfully', async () => {
    // Mock prompt data
    const result = await caller.quality.analyzePromptQuality({
      promptId: 'test-prompt-id',
      forceReanalyze: false
    });

    expect(result.quality).toBeDefined();
    expect(result.quality.overall).toBeGreaterThanOrEqual(0);
    expect(result.quality.overall).toBeLessThanOrEqual(100);
    expect(result.quality.suggestions).toHaveLength.greaterThanOrEqual(3);
  });

  it('should return cached result if exists', async () => {
    const result1 = await caller.quality.analyzePromptQuality({
      promptId: 'test-prompt-id',
      forceReanalyze: false
    });

    const result2 = await caller.quality.analyzePromptQuality({
      promptId: 'test-prompt-id',
      forceReanalyze: false
    });

    expect(result2.cached).toBe(true);
  });

  it('should throw error for unauthorized access', async () => {
    await expect(
      caller.quality.analyzePromptQuality({
        promptId: 'other-user-prompt',
        forceReanalyze: false
      })
    ).rejects.toThrow('FORBIDDEN');
  });
});
```

### 7.2 Integration Tests

**테스트 케이스**:

1. **정상 플로우**
   - 프롬프트 생성 → 품질 분석 트리거 → 결과 표시
   - 예상 시간: 3-5초
   - 성공 기준: 모든 점수가 0-100 범위

2. **캐싱 플로우**
   - 첫 분석 → 페이지 새로고침 → 캐시된 결과 즉시 표시
   - 예상 시간: <1초
   - 성공 기준: `cached: true` 반환

3. **재분석 플로우**
   - 초기 분석 → "재분석" 버튼 클릭 → 새 분석 실행
   - 예상 시간: 3-5초
   - 성공 기준: `forceReanalyze: true`, 새 점수 반환

4. **에러 핸들링**
   - 네트워크 오류 시뮬레이션 → 에러 메시지 표시
   - 재시도 버튼 표시
   - 성공 기준: 사용자에게 명확한 피드백

### 7.3 Manual Testing Checklist

- [ ] 프롬프트 생성 후 품질 분석 자동 시작
- [ ] 로딩 스피너 3-5초 동안 표시
- [ ] 원형 프로그레스 0→점수 카운트업 애니메이션
- [ ] 바 차트 슬라이드 인 애니메이션
- [ ] 개선 제안 페이드 인 애니메이션
- [ ] 재분석 버튼 클릭 → 새 분석 실행
- [ ] 캐싱 동작 (페이지 새로고침 시 즉시 표시)
- [ ] 다크 모드에서 색상 정상 표시
- [ ] 모바일 반응형 (폰, 태블릿)
- [ ] 에러 발생 시 "다시 시도" 버튼 표시

### 7.4 Performance Benchmarks

| 항목 | 목표 | 측정 방법 |
|------|------|-----------|
| API 응답 시간 | <5초 | Gemini API 호출 시간 |
| 애니메이션 지연 | <200ms | 각 애니메이션 시작 시간 |
| 컴포넌트 렌더링 | <100ms | React Profiler |
| Firestore 저장 | <500ms | updatePromptHistory 시간 |

---

## 8. 다음 단계 (Step 2)

### 8.1 구현 순서 (우선순위)

**Phase 1: 기본 구조 (2-3시간)**
1. 타입 정의 (`client/src/types/quality.ts`)
2. tRPC 라우터 (`server/routers/quality.ts`)
3. 라우터 등록 (`server/routers.ts`)
4. Firestore 스키마 확인

**Phase 2: UI 컴포넌트 (3-4시간)**
5. `QualityMeter` 컴포넌트 (원형 프로그레스)
6. `QualityBreakdown` 컴포넌트 (바 차트)
7. `QualitySuggestions` 컴포넌트 (개선 제안)
8. `QualityScoreCard` 컴포넌트 (통합)
9. 애니메이션 CSS 추가

**Phase 3: PromptResult 통합 (2-3시간)**
10. `PromptResult.tsx` 수정
11. 자동 트리거 로직
12. 로딩 상태 UI
13. 에러 핸들링 UI

**Phase 4: 테스트 및 버그 수정 (2-3시간)**
14. Unit Tests 작성
15. Manual Testing
16. 버그 수정 및 개선

**Phase 5: 프로덕션 배포 (1시간)**
17. 빌드 테스트
18. Firebase 배포
19. 모니터링 설정

**총 예상 시간**: 10-14시간

### 8.2 코드 작성 시작점

```bash
# 1. 타입 정의 생성
touch client/src/types/quality.ts

# 2. 품질 컴포넌트 디렉토리 생성
mkdir -p client/src/components/quality

# 3. 컴포넌트 파일 생성
touch client/src/components/quality/QualityScoreCard.tsx
touch client/src/components/quality/QualityMeter.tsx
touch client/src/components/quality/QualityBreakdown.tsx
touch client/src/components/quality/QualitySuggestions.tsx
touch client/src/components/quality/QualityBadge.tsx

# 4. 라우터 파일 생성
touch server/routers/quality.ts

# 5. 테스트 파일 생성
touch server/routers/quality.test.ts
```

### 8.3 확인 사항

- [ ] 설계 문서 검토 완료
- [ ] 팀원과 설계 공유 및 피드백 수렴
- [ ] Firebase Firestore 접근 권한 확인
- [ ] Gemini API 키 환경 변수 설정 확인
- [ ] 개발 환경 세팅 완료
- [ ] Git 브랜치 생성 (`feature/prompt-scoring-engine`)

### 8.4 배포 전 체크리스트

- [ ] 모든 TypeScript 타입 에러 해결
- [ ] Unit Tests 통과 (90% 이상 커버리지)
- [ ] Manual Tests 완료
- [ ] 다크 모드 정상 동작 확인
- [ ] 모바일 반응형 확인
- [ ] 에러 핸들링 검증
- [ ] 성능 벤치마크 통과
- [ ] 보안 검토 완료
- [ ] 문서 업데이트 (README, CHANGELOG)

---

## 부록 A: Gemini API 프롬프트 최적화 팁

### A.1 평가 기준 설명 개선

현재 프롬프트에서 각 기준의 예시를 추가하면 더 일관된 결과를 얻을 수 있습니다:

```
1. Clarity (명확성):
   - 80점 이상: "특정 기술 스택으로 RESTful API를 구축하고, 인증 미들웨어 추가"
   - 60점 이하: "API를 만들어주세요"

2. Specificity (구체성):
   - 80점 이상: "500단어, 캐주얼한 톤, 20대 대상"
   - 60점 이하: "글을 작성해주세요"
```

### A.2 Few-Shot Learning

더 나은 결과를 위해 예시를 추가:

```
예시 1:
프롬프트: "블로그 글 써줘"
평가: {
  "clarity": 30,
  "specificity": 20,
  // ...
  "suggestions": ["주제를 구체적으로 명시하세요", ...]
}

예시 2:
프롬프트: "Python을 처음 배우는 대학생을 위해, 데이터 타입과 변수 선언을 설명하는 500단어 가이드를 작성하세요. 코드 예시 3개 이상 포함하고, 캐주얼한 톤으로 작성하세요."
평가: {
  "clarity": 95,
  "specificity": 90,
  // ...
}
```

---

## 부록 B: 향후 확장 아이디어

### B.1 Feature 2: AI 자동 개선 (Step 2)

- 낮은 점수 기준 개선
- Gemini API로 프롬프트 재작성
- Before/After 비교 UI

### B.2 Feature 3: 품질 히스토리 추적

- 사용자별 평균 품질 점수
- 시간에 따른 품질 변화 그래프
- 베스트 프롬프트 갤러리

### B.3 Feature 4: 커스텀 평가 기준

- 사용자가 평가 기준 추가 가능
- 도메인별 특화 평가 (예: 코드, 마케팅, 학술)

### B.4 Feature 5: 팀 협업 기능

- 프롬프트 품질 리뷰 요청
- 댓글 및 피드백
- 버전 비교

---

## 문서 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0.0 | 2026-02-12 | 초기 설계 문서 작성 |

---

**설계 완료! 다음 단계는 코드 구현입니다. 🚀**
