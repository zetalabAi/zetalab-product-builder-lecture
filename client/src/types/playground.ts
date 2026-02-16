/**
 * AI Playground Types
 * 프롬프트 테스트 및 모델 비교를 위한 타입 정의
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google';
  tier: 'S';
  description: string;
  costPer1kTokens: number;  // USD per 1000 tokens
  icon: string;
  color: string;
}

export interface ModelResult {
  modelId: string;
  response: string;
  duration: number;      // milliseconds
  tokenCount: number;
  estimatedCost: number; // USD
  error?: string;
}

export interface PlaygroundExecution {
  prompt: string;
  systemPrompt?: string;
  modelIds: string[];
  results: ModelResult[];
  timestamp: Date;
}

export interface ComparisonData {
  fastest: string;       // modelId of fastest response
  cheapest: string;      // modelId of cheapest cost
  mostVoted?: string;    // modelId with most votes (future)
  results: ModelResult[];
}

export type ExecutionMode = 'single' | 'compare';

/**
 * Available AI Models
 */
export const AI_MODELS: AIModel[] = [
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    tier: 'S',
    description: '최고 품질, 복잡한 작업에 최적',
    costPer1kTokens: 0.015,
    icon: '🤖',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tier: 'S',
    description: '빠른 응답, 멀티모달 지원',
    costPer1kTokens: 0.020,
    icon: '🔷',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    tier: 'S',
    description: '비용 효율적, 빠른 처리',
    costPer1kTokens: 0.008,
    icon: '✨',
    color: 'text-blue-600 dark:text-blue-400'
  }
];

/**
 * Get model by ID
 */
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(m => m.id === id);
}

/**
 * Calculate comparison data from results
 */
export function calculateComparison(results: ModelResult[]): ComparisonData {
  if (results.length === 0) {
    return {
      fastest: '',
      cheapest: '',
      results: []
    };
  }

  // Find fastest (exclude errors)
  const successResults = results.filter(r => !r.error);
  const fastest = successResults.reduce((min, r) =>
    r.duration < min.duration ? r : min
  , successResults[0]);

  // Find cheapest
  const cheapest = successResults.reduce((min, r) =>
    r.estimatedCost < min.estimatedCost ? r : min
  , successResults[0]);

  return {
    fastest: fastest?.modelId || '',
    cheapest: cheapest?.modelId || '',
    results
  };
}

/**
 * Example prompts for testing
 */
export const EXAMPLE_PROMPTS = [
  {
    title: '블로그 글 작성',
    prompt: '2026년 AI 기술 트렌드에 대한 블로그 글을 작성해주세요. 3가지 주요 트렌드를 중심으로 설명해주세요.'
  },
  {
    title: '코드 리뷰',
    prompt: 'React 컴포넌트의 성능 최적화 방법을 설명하고, useMemo와 useCallback의 차이점을 코드 예시와 함께 알려주세요.'
  },
  {
    title: '창의적 스토리',
    prompt: '시간 여행을 주제로 한 SF 단편 소설의 첫 장면을 작성해주세요. 주인공은 과학자입니다.'
  },
  {
    title: '데이터 분석',
    prompt: '전자상거래 웹사이트의 전환율을 높이기 위한 A/B 테스트 전략을 5가지 제안해주세요.'
  }
];
