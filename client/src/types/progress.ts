/**
 * User Progress & Learning Dashboard Types
 */

export interface UserProgress {
  userId: string;
  level: number;              // 1-10
  xp: number;                 // 경험치
  promptsCreated: number;     // 생성한 프롬프트 수
  avgQualityScore: number;    // 평균 품질 점수
  scoreHistory: ScorePoint[]; // 시계열 데이터
  skillScores: SkillScores;   // 6가지 기준별 점수
  badges: Badge[];            // 획득한 배지
  streakDays: number;         // 연속 활동 일수
  lastActiveDate: Date;       // 마지막 활동 날짜
  createdAt: Date;
  updatedAt: Date;
}

export interface ScorePoint {
  date: Date;
  score: number;
  category?: string; // 선택적: 카테고리별 추적
}

export interface SkillScores {
  clarity: number;       // 명확성
  specificity: number;   // 구체성
  structure: number;     // 구조화
  context: number;       // 맥락
  constraints: number;   // 제약조건
  overall: number;       // 종합 점수
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: BadgeCategory;
}

export type BadgeCategory = 'milestone' | 'quality' | 'consistency' | 'exploration' | 'special';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement: BadgeRequirement;
}

export interface BadgeRequirement {
  type: 'prompts_count' | 'quality_score' | 'streak_days' | 'categories' | 'special';
  value: number;
  metadata?: Record<string, any>;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

export type ProgressAction =
  | 'prompt_created'
  | 'quality_score'
  | 'template_used'
  | 'playground_used'
  | 'prompt_edited';

export interface ProgressUpdate {
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: Badge[];
  message: string;
}

export interface Recommendation {
  type: 'skill_improvement' | 'badge' | 'streak' | 'general';
  title: string;
  message: string;
  action?: string;
  actionLink?: string;
  icon: string;
  priority: 'low' | 'medium' | 'high';
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  xp: number;
  avgQualityScore: number;
  promptsCreated: number;
  rank: number;
}

// Constants
export const SKILL_LABELS: Record<keyof Omit<SkillScores, 'overall'>, string> = {
  clarity: '명확성',
  specificity: '구체성',
  structure: '구조화',
  context: '맥락',
  constraints: '제약조건',
};

export const SKILL_DESCRIPTIONS: Record<keyof Omit<SkillScores, 'overall'>, string> = {
  clarity: '요구사항이 얼마나 명확한가',
  specificity: '구체적인 세부사항 포함',
  structure: '논리적 구조를 갖추고 있는가',
  context: '충분한 배경 정보 제공',
  constraints: '명확한 제약사항 명시',
};
