/**
 * Progress System Constants
 * Client-side copy of badge definitions
 */

import { BadgeDefinition } from '../types/progress';

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
