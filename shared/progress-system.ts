/**
 * Progress System - XP, Levels, Badges
 * Shared between client and server
 */

import { LevelInfo, BadgeDefinition, ProgressAction } from '../client/src/types/progress';

// ============================================================================
// XP System
// ============================================================================

export const XP_REWARDS: Record<ProgressAction, number> = {
  prompt_created: 10,
  quality_score: 0, // Dynamic based on score
  template_used: 5,
  playground_used: 10,
  prompt_edited: 5,
};

export function calculateXPForQuality(score: number): number {
  if (score >= 95) return 50; // 완벽
  if (score >= 90) return 30; // 매우 좋음
  if (score >= 80) return 20; // 좋음
  if (score >= 70) return 10; // 보통
  return 5; // 노력 점수
}

// ============================================================================
// Level System
// ============================================================================

export const LEVEL_REQUIREMENTS: number[] = [
  0,     // Level 1 (시작)
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  3500,  // Level 7
  5500,  // Level 8
  8000,  // Level 9
  12000, // Level 10
];

export const LEVEL_TITLES: Record<number, string> = {
  1: '프롬프트 입문자',
  2: '프롬프트 초심자',
  3: '프롬프트 학습자',
  4: '프롬프트 수련자',
  5: '프롬프트 장인',
  6: '프롬프트 전문가',
  7: '프롬프트 명인',
  8: '프롬프트 대가',
  9: '프롬프트 마스터',
  10: '프롬프트 전설',
};

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;

  for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_REQUIREMENTS[i]) {
      level = i + 1;
      break;
    }
  }

  const minXP = LEVEL_REQUIREMENTS[level - 1];
  const maxXP = level < 10 ? LEVEL_REQUIREMENTS[level] : minXP + 10000; // Max level

  return {
    level,
    title: LEVEL_TITLES[level] || '프롬프트 마스터',
    minXP,
    maxXP,
  };
}

export function calculateLevelProgress(xp: number): number {
  const levelInfo = getLevelInfo(xp);
  const currentLevelXP = xp - levelInfo.minXP;
  const requiredXP = levelInfo.maxXP - levelInfo.minXP;

  return Math.round((currentLevelXP / requiredXP) * 100);
}

// ============================================================================
// Badge System
// ============================================================================

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Milestone Badges
  {
    id: 'first-prompt',
    name: '첫 걸음',
    description: '첫 프롬프트 생성',
    icon: '🌱',
    category: 'milestone',
    requirement: { type: 'prompts_count', value: 1 },
  },
  {
    id: 'prompt-master-10',
    name: '프롬프트 10인',
    description: '프롬프트 10개 생성',
    icon: '✍️',
    category: 'milestone',
    requirement: { type: 'prompts_count', value: 10 },
  },
  {
    id: 'prompt-master-50',
    name: '프롬프트 50인',
    description: '프롬프트 50개 생성',
    icon: '📝',
    category: 'milestone',
    requirement: { type: 'prompts_count', value: 50 },
  },
  {
    id: 'prompt-master-100',
    name: '프롬프트 백전노장',
    description: '프롬프트 100개 생성',
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'prompts_count', value: 100 },
  },

  // Quality Badges
  {
    id: 'quality-80',
    name: '우수한 품질',
    description: '품질 80+ 프롬프트 생성',
    icon: '⭐',
    category: 'quality',
    requirement: { type: 'quality_score', value: 80 },
  },
  {
    id: 'quality-90',
    name: '뛰어난 품질',
    description: '품질 90+ 프롬프트 생성',
    icon: '💫',
    category: 'quality',
    requirement: { type: 'quality_score', value: 90 },
  },
  {
    id: 'perfectionist',
    name: '완벽주의자',
    description: '품질 95+ 프롬프트 생성',
    icon: '💎',
    category: 'quality',
    requirement: { type: 'quality_score', value: 95 },
  },
  {
    id: 'quality-master',
    name: '품질 마스터',
    description: '품질 90+ 프롬프트 10개 생성',
    icon: '👑',
    category: 'quality',
    requirement: {
      type: 'special',
      value: 10,
      metadata: { minScore: 90 },
    },
  },

  // Consistency Badges
  {
    id: 'streak-3',
    name: '꾸준함',
    description: '3일 연속 활동',
    icon: '🔥',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 3 },
  },
  {
    id: 'streak-7',
    name: '일주일 챌린지',
    description: '7일 연속 활동',
    icon: '🌟',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 7 },
  },
  {
    id: 'streak-30',
    name: '한 달의 열정',
    description: '30일 연속 활동',
    icon: '🎖️',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 30 },
  },

  // Exploration Badges
  {
    id: 'explorer',
    name: '탐험가',
    description: '모든 카테고리 프롬프트 생성',
    icon: '🗺️',
    category: 'exploration',
    requirement: {
      type: 'categories',
      value: 4, // blog, novel, video, presentation
    },
  },
  {
    id: 'template-user',
    name: '템플릿 마스터',
    description: '템플릿 10개 사용',
    icon: '📋',
    category: 'exploration',
    requirement: {
      type: 'special',
      value: 10,
      metadata: { action: 'template_used' },
    },
  },
  {
    id: 'playground-expert',
    name: 'Playground 전문가',
    description: 'AI Playground 20회 사용',
    icon: '🧪',
    category: 'exploration',
    requirement: {
      type: 'special',
      value: 20,
      metadata: { action: 'playground_used' },
    },
  },

  // Special Badges
  {
    id: 'early-adopter',
    name: '얼리 어답터',
    description: 'ZetaLab 베타 사용자',
    icon: '🚀',
    category: 'special',
    requirement: { type: 'special', value: 1 },
  },
];

export function checkBadgeEarned(
  badgeId: string,
  progress: {
    promptsCreated: number;
    avgQualityScore: number;
    streakDays: number;
    scoreHistory: Array<{ score: number }>;
    badges: Array<{ id: string }>;
  }
): boolean {
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!badge) return false;

  // Already earned
  if (progress.badges.some((b) => b.id === badgeId)) {
    return false;
  }

  const { requirement } = badge;

  switch (requirement.type) {
    case 'prompts_count':
      return progress.promptsCreated >= requirement.value;

    case 'quality_score':
      return progress.scoreHistory.some((s) => s.score >= requirement.value);

    case 'streak_days':
      return progress.streakDays >= requirement.value;

    case 'categories':
      // TODO: Track categories used
      return false;

    case 'special':
      if (requirement.metadata?.minScore) {
        // Quality master: 90+ scores count
        const highQualityCount = progress.scoreHistory.filter(
          (s) => s.score >= requirement.metadata.minScore
        ).length;
        return highQualityCount >= requirement.value;
      }
      return false;

    default:
      return false;
  }
}

export function getNewBadges(
  progress: {
    promptsCreated: number;
    avgQualityScore: number;
    streakDays: number;
    scoreHistory: Array<{ score: number }>;
    badges: Array<{ id: string }>;
  }
): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((badge) => checkBadgeEarned(badge.id, progress));
}

// ============================================================================
// Streak Calculation
// ============================================================================

export function calculateStreak(lastActiveDate: Date, now: Date = new Date()): number {
  const lastActive = new Date(lastActiveDate);
  const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  // Same day or next day: continue streak
  if (daysDiff <= 1) {
    return 1; // Increment will happen in update logic
  }

  // Streak broken
  return 0;
}
