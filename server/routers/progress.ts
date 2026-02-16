/**
 * ZetaLab - Progress Router
 * 사용자 학습 진행도 추적 API
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  XP_REWARDS,
  calculateXPForQuality,
  getLevelInfo,
  getNewBadges,
  calculateStreak,
  BADGE_DEFINITIONS,
} from '../../shared/progress-system';

const db = admin.firestore();

// ============================================================================
// Schemas
// ============================================================================

const ProgressActionSchema = z.enum([
  'prompt_created',
  'quality_score',
  'template_used',
  'playground_used',
  'prompt_edited',
]);

// ============================================================================
// Helper Functions
// ============================================================================

async function getUserProgress(userId: string) {
  const docRef = db.collection('userProgress').doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    // Initialize new user progress
    const initialData = {
      userId,
      level: 1,
      xp: 0,
      promptsCreated: 0,
      avgQualityScore: 0,
      scoreHistory: [],
      skillScores: {
        clarity: 0,
        specificity: 0,
        structure: 0,
        context: 0,
        constraints: 0,
        overall: 0,
      },
      badges: [],
      streakDays: 0,
      lastActiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(initialData);
    return initialData;
  }

  return { id: doc.id, ...doc.data() };
}

async function updateUserProgress(
  userId: string,
  action: z.infer<typeof ProgressActionSchema>,
  metadata?: Record<string, any>
) {
  const docRef = db.collection('userProgress').doc(userId);
  const progress = await getUserProgress(userId);

  const now = new Date();
  let xpGained = 0;
  let leveledUp = false;
  let newLevel = progress.level;
  const updates: Record<string, any> = {
    updatedAt: now,
  };

  // Calculate XP gain
  if (action === 'quality_score' && metadata?.score) {
    xpGained = calculateXPForQuality(metadata.score);

    // Update score history
    const newScorePoint = {
      date: now,
      score: metadata.score,
    };

    updates.scoreHistory = FieldValue.arrayUnion(newScorePoint);

    // Update skill scores if provided
    if (metadata.skillScores) {
      updates.skillScores = metadata.skillScores;
    }

    // Recalculate average
    const allScores = [...progress.scoreHistory, newScorePoint];
    const avgScore = allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;
    updates.avgQualityScore = Math.round(avgScore);
  } else {
    xpGained = XP_REWARDS[action] || 0;
  }

  // Update XP
  const newXP = progress.xp + xpGained;
  updates.xp = newXP;

  // Check level up
  const oldLevelInfo = getLevelInfo(progress.xp);
  const newLevelInfo = getLevelInfo(newXP);

  if (newLevelInfo.level > oldLevelInfo.level) {
    leveledUp = true;
    newLevel = newLevelInfo.level;
    updates.level = newLevel;
  }

  // Update prompts created
  if (action === 'prompt_created') {
    updates.promptsCreated = FieldValue.increment(1);
  }

  // Update streak
  const streak = calculateStreak(progress.lastActiveDate, now);
  const daysSinceLastActive = Math.floor(
    (now.getTime() - new Date(progress.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActive >= 1) {
    // New day
    if (daysSinceLastActive === 1) {
      // Continue streak
      updates.streakDays = progress.streakDays + 1;
    } else {
      // Streak broken
      updates.streakDays = 1;
    }
    updates.lastActiveDate = now;
  }

  // Check for new badges
  const updatedProgress = { ...progress, ...updates, promptsCreated: progress.promptsCreated + (action === 'prompt_created' ? 1 : 0) };
  const earnedBadges = getNewBadges(updatedProgress);
  const newBadges = earnedBadges.map((badge) => ({
    ...badge,
    earnedAt: now,
  }));

  if (newBadges.length > 0) {
    updates.badges = FieldValue.arrayUnion(...newBadges);
  }

  // Apply updates
  await docRef.update(updates);

  return {
    xpGained,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    newBadges,
    message: leveledUp
      ? `레벨 ${newLevel} 달성! ${newLevelInfo.title}이(가) 되었습니다!`
      : `+${xpGained} XP 획득`,
  };
}

// ============================================================================
// Router
// ============================================================================

export const progressRouter = router({
  /**
   * Get user progress
   */
  getUserProgress: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = input.userId || ctx.userId;
        const progress = await getUserProgress(userId);

        // Calculate level info
        const levelInfo = getLevelInfo(progress.xp);

        return {
          ...progress,
          levelInfo,
        };
      } catch (error) {
        console.error('[Progress] getUserProgress error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '진행도를 불러오는 중 오류가 발생했습니다',
        });
      }
    }),

  /**
   * Update progress (XP, badges, etc.)
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        action: ProgressActionSchema,
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await updateUserProgress(ctx.userId, input.action, input.metadata);
        return result;
      } catch (error) {
        console.error('[Progress] updateProgress error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '진행도 업데이트 중 오류가 발생했습니다',
        });
      }
    }),

  /**
   * Get recommendations
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const progress = await getUserProgress(ctx.userId);
      const recommendations: any[] = [];

      // Find weakest skill
      const skillScores = progress.skillScores;
      const skills = Object.entries(skillScores).filter(([key]) => key !== 'overall');
      skills.sort((a, b) => a[1] - b[1]);
      const weakestSkill = skills[0];

      if (weakestSkill && weakestSkill[1] < 80) {
        const skillLabels: Record<string, string> = {
          clarity: '명확성',
          specificity: '구체성',
          structure: '구조화',
          context: '맥락',
          constraints: '제약조건',
        };

        recommendations.push({
          type: 'skill_improvement',
          title: `${skillLabels[weakestSkill[0]]} 스킬 향상`,
          message: `"${skillLabels[weakestSkill[0]]}" 스킬을 향상시키면 더 좋은 프롬프트를 만들 수 있어요!`,
          action: '학습 가이드 보기',
          actionLink: '/guides',
          icon: '🎯',
          priority: 'high' as const,
        });
      }

      // Check next badge
      const allBadges = BADGE_DEFINITIONS;
      const earnedBadgeIds = progress.badges.map((b: any) => b.id);
      const unearnedBadges = allBadges.filter((b) => !earnedBadgeIds.includes(b.id));

      // Find closest badge
      for (const badge of unearnedBadges) {
        if (badge.requirement.type === 'prompts_count') {
          const remaining = badge.requirement.value - progress.promptsCreated;
          if (remaining > 0 && remaining <= 5) {
            recommendations.push({
              type: 'badge',
              title: `"${badge.name}" 배지 획득 가까워요!`,
              message: `${remaining}개의 프롬프트만 더 생성하면 배지를 획득할 수 있어요!`,
              action: '프롬프트 생성하기',
              actionLink: '/',
              icon: badge.icon,
              priority: 'medium' as const,
            });
            break;
          }
        } else if (badge.requirement.type === 'streak_days') {
          const remaining = badge.requirement.value - progress.streakDays;
          if (remaining > 0 && remaining <= 3) {
            recommendations.push({
              type: 'streak',
              title: `연속 ${remaining}일만 더!`,
              message: `"${badge.name}" 배지까지 ${remaining}일 남았어요. 꾸준히 활동하세요!`,
              icon: badge.icon,
              priority: 'high' as const,
            });
            break;
          }
        }
      }

      // General encouragement
      if (recommendations.length === 0) {
        recommendations.push({
          type: 'general',
          title: '좋은 진전이에요!',
          message: '꾸준히 활동하고 있네요. 계속 이렇게 성장해나가세요!',
          icon: '🎉',
          priority: 'low' as const,
        });
      }

      return recommendations;
    } catch (error) {
      console.error('[Progress] getRecommendations error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '추천 정보를 불러오는 중 오류가 발생했습니다',
      });
    }
  }),

  /**
   * Get leaderboard (optional)
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        timeframe: z.enum(['week', 'month', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const snapshot = await db
          .collection('userProgress')
          .orderBy('xp', 'desc')
          .limit(input.limit)
          .get();

        const leaderboard = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            userId: data.userId,
            userName: data.userName || 'Anonymous',
            level: data.level,
            xp: data.xp,
            avgQualityScore: data.avgQualityScore,
            promptsCreated: data.promptsCreated,
            rank: index + 1,
          };
        });

        return leaderboard;
      } catch (error) {
        console.error('[Progress] getLeaderboard error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '리더보드를 불러오는 중 오류가 발생했습니다',
        });
      }
    }),
});
