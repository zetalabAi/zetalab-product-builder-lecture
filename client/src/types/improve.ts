/**
 * Prompt Improvement Types
 * AI Playground 결과 분석 및 프롬프트 개선
 */

export type IssueType = 'unclear' | 'incomplete' | 'inconsistent' | 'verbose';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type ChangeType = 'added' | 'modified' | 'removed';
export type SuggestionType = 'add' | 'modify' | 'remove';

export interface Issue {
  type: IssueType;
  description: string;
  severity: IssueSeverity;
  location?: string; // 문제가 있는 부분의 위치
}

export interface Suggestion {
  type: SuggestionType;
  target: string;       // 수정할 부분
  newValue: string;     // 새 값
  reasoning: string;    // 개선 이유
}

export interface AnalysisResult {
  issues: Issue[];
  suggestions: Suggestion[];
  confidence: number;  // 0-100, 분석 신뢰도
  analyzedAt: Date;
}

export interface Change {
  type: ChangeType;
  section: string;      // 변경된 섹션 (예: "제약조건", "역할 정의")
  before?: string;      // 변경 전 내용 (added일 경우 없음)
  after: string;        // 변경 후 내용
  reasoning: string;    // 변경 이유
}

export interface ImprovementResult {
  improvedPrompt: string;
  changes: Change[];
  confidence: number;
  estimatedImprovement: number; // 예상 개선율 0-100
}

export interface ModelResult {
  modelId: string;
  modelName: string;
  response: string;
  executionTime: number;
  success: boolean;
  error?: string;
}

// UI 상태 관리용
export interface ImprovementState {
  isAnalyzing: boolean;
  analysis: AnalysisResult | null;
  improvement: ImprovementResult | null;
  error: string | null;
}

// 개선 히스토리
export interface ImprovementHistory {
  id: string;
  originalPrompt: string;
  improvedPrompt: string;
  changes: Change[];
  createdAt: Date;
  wasApplied: boolean; // 사용자가 적용했는지
}
