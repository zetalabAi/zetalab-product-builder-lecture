/**
 * Chain System Types
 * 프롬프트 체인 시스템의 모든 타입 정의
 */

export type ChainCategory = 'blog' | 'video' | 'analysis' | 'creative' | 'custom';
export type LessonType = 'theory' | 'example' | 'exercise' | 'quiz';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 프롬프트 체인
 * 여러 단계(Step)로 구성된 자동화 워크플로우
 */
export interface PromptChain {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: ChainCategory;
  steps: ChainStep[];
  totalEstimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 체인의 단일 단계
 * 각 단계는 하나의 AI 모델 호출을 나타냄
 */
export interface ChainStep {
  id: string;
  order: number; // 1, 2, 3...
  name: string; // "아이디어 생성"
  promptTemplate: string; // 변수 포함 ({{previous_output}}, {{initial_input}})
  modelId: string; // 'claude-sonnet-4-5', 'gpt-4o', 'gemini-2.0-flash'
  usePreviousOutput: boolean; // true면 이전 단계 출력 사용
  estimatedCost: number; // 예상 비용 ($)
  description?: string; // 단계 설명 (선택)
}

/**
 * 체인 실행 레코드
 * 실제 체인이 실행된 기록과 결과
 */
export interface ChainExecution {
  id: string;
  chainId: string;
  userId: string;
  status: ExecutionStatus;
  currentStepIndex: number; // 현재 실행 중인 단계 (0-based)
  stepResults: StepResult[];
  initialInput?: string; // 사용자 초기 입력
  startedAt: Date;
  completedAt?: Date;
  totalCost: number; // 실제 발생 비용
  totalDuration: number; // 총 소요 시간 (ms)
  error?: string;
}

/**
 * 단계 실행 결과
 * 각 단계의 입력, 출력, 메타데이터
 */
export interface StepResult {
  stepId: string;
  stepName: string;
  stepOrder: number;
  input: string; // 실제 실행된 프롬프트 (변수 치환 후)
  output: string; // AI 응답
  modelUsed: string;
  duration: number; // ms
  cost: number; // 실제 비용
  success: boolean;
  error?: string;
  executedAt: Date;
}

/**
 * 체인 템플릿
 * 미리 만들어진 체인 (사용자가 복사하여 사용)
 */
export interface ChainTemplate {
  id: string;
  name: string;
  description: string;
  category: ChainCategory;
  steps: Omit<ChainStep, 'id'>[]; // ID는 사용 시 생성
  isOfficial: boolean;
  usageCount: number;
  tags: string[];
  estimatedTime: number; // 예상 소요 시간 (초)
  createdAt: Date;
}

// ============================================================================
// UI용 확장 타입
// ============================================================================

/**
 * 진행도 정보를 포함한 체인
 */
export interface ChainWithExecutions extends PromptChain {
  lastExecution?: ChainExecution;
  executionCount: number;
}

/**
 * 예시 결과를 포함한 템플릿
 */
export interface TemplateWithPreview extends ChainTemplate {
  previewResults?: string[]; // 각 단계 예시 결과
}

/**
 * 모듈 진행도 (UI 표시용)
 */
export interface StepProgress {
  stepId: string;
  stepName: string;
  stepOrder: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: StepResult;
}

// ============================================================================
// API 요청/응답 타입
// ============================================================================

/**
 * 체인 생성 요청
 */
export interface CreateChainInput {
  name: string;
  description: string;
  category: ChainCategory;
  steps: Omit<ChainStep, 'id'>[];
}

/**
 * 체인 업데이트 요청
 */
export interface UpdateChainInput {
  chainId: string;
  updates: {
    name?: string;
    description?: string;
    category?: ChainCategory;
    steps?: Omit<ChainStep, 'id'>[];
  };
}

/**
 * 체인 실행 요청
 */
export interface ExecuteChainInput {
  chainId: string;
  initialInput?: string;
}

/**
 * 체인 실행 응답
 */
export interface ExecuteChainResponse {
  executionId: string;
  message: string;
}

/**
 * 템플릿 사용 요청
 */
export interface UseTemplateInput {
  templateId: string;
  customizations?: {
    name?: string;
    description?: string;
  };
}

// ============================================================================
// 에러 타입
// ============================================================================

export type ChainErrorType =
  | 'network_error' // 네트워크 연결 실패
  | 'api_error' // AI API 오류
  | 'timeout_error' // 타임아웃
  | 'validation_error' // 입력 검증 실패
  | 'cost_exceeded' // 비용 한도 초과
  | 'user_cancelled'; // 사용자 취소

export interface ChainExecutionError {
  type: ChainErrorType;
  message: string;
  stepId?: string;
  retryable: boolean;
}

// ============================================================================
// 상수
// ============================================================================

export const CATEGORY_LABELS: Record<ChainCategory, string> = {
  blog: '블로그',
  video: '영상',
  analysis: '분석',
  creative: '창작',
  custom: '커스텀',
};

export const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-5': 'Claude Sonnet 4.5',
  'claude-opus-4-6': 'Claude Opus 4.6',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
};

export const STATUS_LABELS: Record<ExecutionStatus, string> = {
  running: '실행 중',
  completed: '완료',
  failed: '실패',
  cancelled: '취소됨',
};

export const ERROR_MESSAGES: Record<ChainErrorType, string> = {
  network_error:
    '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
  api_error:
    'AI 모델 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  timeout_error:
    '요청 시간이 초과되었습니다. 프롬프트를 간소화하거나 다시 시도해주세요.',
  validation_error: '입력 값이 올바르지 않습니다. 다시 확인해주세요.',
  cost_exceeded: '예상 비용이 한도를 초과했습니다. 설정을 확인해주세요.',
  user_cancelled: '사용자가 실행을 취소했습니다.',
};

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 단계 ID 생성
 */
export function generateStepId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 체인 ID 생성
 */
export function generateChainId(): string {
  return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 실행 ID 생성
 */
export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 진행률 계산
 */
export function calculateProgress(execution: ChainExecution): number {
  if (!execution.stepResults || execution.stepResults.length === 0) {
    return 0;
  }

  const completedSteps = execution.stepResults.filter((r) => r.success).length;
  const totalSteps = execution.stepResults.length;

  return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
}

/**
 * 실행 상태 확인
 */
export function isExecutionRunning(status: ExecutionStatus): boolean {
  return status === 'running';
}

export function isExecutionCompleted(status: ExecutionStatus): boolean {
  return status === 'completed';
}

export function isExecutionFailed(status: ExecutionStatus): boolean {
  return status === 'failed';
}

export function isExecutionCancelled(status: ExecutionStatus): boolean {
  return status === 'cancelled';
}

/**
 * 비용 포맷팅
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(3)}`;
}

/**
 * 시간 포맷팅 (ms -> 초)
 */
export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}초`;
}
