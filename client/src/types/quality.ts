/**
 * ZetaLab - Prompt Quality Scoring Engine
 * 프롬프트 품질 평가 시스템 타입 정의
 */

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
  cached?: boolean;
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
 * 등급별 색상 매핑 (Tailwind CSS)
 */
export const QUALITY_GRADE_COLORS: Record<QualityGrade, string> = {
  excellent: "text-green-600 dark:text-green-500",
  good: "text-blue-600 dark:text-blue-500",
  fair: "text-yellow-600 dark:text-yellow-500",
  poor: "text-red-600 dark:text-red-500",
};

/**
 * 등급별 배경 색상 매핑
 */
export const QUALITY_GRADE_BG_COLORS: Record<QualityGrade, string> = {
  excellent: "bg-green-600 dark:bg-green-500",
  good: "bg-blue-600 dark:bg-blue-500",
  fair: "bg-yellow-600 dark:bg-yellow-500",
  poor: "bg-red-600 dark:bg-red-500",
};

/**
 * 품질 기준 라벨 한글화
 */
export const QUALITY_CRITERIA_LABELS: Record<
  keyof Omit<PromptQuality, "overall" | "suggestions" | "analyzedAt">,
  string
> = {
  clarity: "명확성",
  specificity: "구체성",
  structure: "구조화",
  context: "맥락",
  constraints: "제약조건",
};

/**
 * 품질 기준 설명 (툴팁용)
 */
export const QUALITY_CRITERIA_DESCRIPTIONS: Record<
  keyof Omit<PromptQuality, "overall" | "suggestions" | "analyzedAt">,
  string
> = {
  clarity: "요구사항이 얼마나 명확하게 표현되었는지 평가",
  specificity: "구체적인 세부사항과 예시가 포함되어 있는지 평가",
  structure: "논리적인 구조와 단계별 설명이 있는지 평가",
  context: "충분한 배경 정보와 사용 목적이 제공되었는지 평가",
  constraints: "명확한 제약사항과 제한 조건이 명시되었는지 평가",
};

/**
 * 등급별 라벨 한글화
 */
export const QUALITY_GRADE_LABELS: Record<QualityGrade, string> = {
  excellent: "우수",
  good: "양호",
  fair: "보통",
  poor: "개선 필요",
};
