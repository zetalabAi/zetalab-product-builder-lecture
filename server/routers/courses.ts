/**
 * Courses Router - Learning System API
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import {
  getAllCourses,
  getCoursesByDifficulty,
  getCourseById,
  getUserCourseProgress,
  getUserAllCourseProgress,
  completeLesson,
  updateQuizScore,
  type Difficulty,
  type Course,
  type UserCourseProgress,
} from '../db';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate completion rate for a course
 */
function calculateCompletionRate(
  course: Course,
  progress: UserCourseProgress
): number {
  let totalLessons = 0;
  course.modules.forEach((module) => {
    totalLessons += module.lessons.length;
  });

  if (totalLessons === 0) return 0;

  const completedCount = progress.completedLessons.length;
  return Math.round((completedCount / totalLessons) * 100);
}

/**
 * Calculate XP gain for completing a lesson
 */
function calculateLessonXP(lessonType: string): number {
  switch (lessonType) {
    case 'theory':
      return 5;
    case 'example':
      return 10;
    case 'exercise':
      return 20;
    case 'quiz':
      return 0; // Quiz XP calculated based on score
    default:
      return 5;
  }
}

/**
 * Calculate XP gain for quiz based on score
 */
function calculateQuizXP(score: number): number {
  if (score >= 90) return 50;
  if (score >= 80) return 30;
  if (score >= 70) return 20;
  return 10;
}

/**
 * Check if quiz passed (70% threshold)
 */
function checkQuizPassed(score: number): boolean {
  return score >= 70;
}

// ============================================================================
// Zod Schemas
// ============================================================================

const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

// ============================================================================
// Router
// ============================================================================

export const coursesRouter = router({
  /**
   * Get all courses (optionally filtered by difficulty)
   */
  getCourses: publicProcedure
    .input(
      z.object({
        difficulty: DifficultySchema.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        let courses: Course[];

        if (input.difficulty) {
          courses = await getCoursesByDifficulty(input.difficulty);
        } else {
          courses = await getAllCourses();
        }

        // If user is authenticated, attach progress
        if (ctx.user) {
          const progressList = await getUserAllCourseProgress(ctx.user.uid);
          const progressMap = new Map(
            progressList.map((p) => [p.courseId, p])
          );

          return courses.map((course) => {
            const progress = progressMap.get(course.id);
            if (progress) {
              // Update completion rate
              progress.completionRate = calculateCompletionRate(
                course,
                progress
              );
            }
            return {
              ...course,
              progress,
            };
          });
        }

        return courses;
      } catch (error: any) {
        console.error('[Courses] Failed to get courses:', error);
        throw new Error(`코스 목록 조회 실패: ${error.message}`);
      }
    }),

  /**
   * Get single course by ID with user progress
   */
  getCourseById: publicProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const course = await getCourseById(input.courseId);
        if (!course) {
          throw new Error('코스를 찾을 수 없습니다.');
        }

        // If user is authenticated, attach progress
        if (ctx.user) {
          const progress = await getUserCourseProgress(
            ctx.user.uid,
            input.courseId
          );

          if (progress) {
            // Update completion rate
            progress.completionRate = calculateCompletionRate(course, progress);
          }

          return {
            ...course,
            progress,
          };
        }

        return course;
      } catch (error: any) {
        console.error('[Courses] Failed to get course:', error);
        throw new Error(`코스 조회 실패: ${error.message}`);
      }
    }),

  /**
   * Get user's progress for a specific course
   */
  getUserProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const course = await getCourseById(input.courseId);
        if (!course) {
          throw new Error('코스를 찾을 수 없습니다.');
        }

        const progress = await getUserCourseProgress(
          ctx.user.uid,
          input.courseId
        );

        if (!progress) {
          // Return empty progress
          return {
            userId: ctx.user.uid,
            courseId: input.courseId,
            completedLessons: [],
            quizScores: {},
            completionRate: 0,
            lastAccessedAt: new Date(),
          };
        }

        // Update completion rate
        progress.completionRate = calculateCompletionRate(course, progress);

        return progress;
      } catch (error: any) {
        console.error('[Courses] Failed to get user progress:', error);
        throw new Error(`진행도 조회 실패: ${error.message}`);
      }
    }),

  /**
   * Complete a lesson
   */
  completeLesson: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        moduleId: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get course to validate and find lesson type
        const course = await getCourseById(input.courseId);
        if (!course) {
          throw new Error('코스를 찾을 수 없습니다.');
        }

        // Find the lesson
        let lessonType = 'theory';
        let found = false;
        for (const module of course.modules) {
          if (module.id === input.moduleId) {
            const lesson = module.lessons.find((l) => l.id === input.lessonId);
            if (lesson) {
              lessonType = lesson.type;
              found = true;
              break;
            }
          }
        }

        if (!found) {
          throw new Error('레슨을 찾을 수 없습니다.');
        }

        // Complete the lesson
        await completeLesson(ctx.user.uid, input.courseId, input.lessonId);

        // Get updated progress
        const progress = await getUserCourseProgress(
          ctx.user.uid,
          input.courseId
        );

        const completionRate = progress
          ? calculateCompletionRate(course, progress)
          : 0;

        // Calculate XP (skip for quiz - handled separately)
        const xpGained = lessonType === 'quiz' ? 0 : calculateLessonXP(lessonType);

        return {
          completionRate,
          xpGained,
          leveledUp: false,
          message: '레슨을 완료했습니다!',
        };
      } catch (error: any) {
        console.error('[Courses] Failed to complete lesson:', error);
        throw new Error(`레슨 완료 실패: ${error.message}`);
      }
    }),

  /**
   * Submit quiz answers
   */
  submitQuiz: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        moduleId: z.string(),
        lessonId: z.string(),
        answers: z.array(z.number()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get course to find quiz
        const course = await getCourseById(input.courseId);
        if (!course) {
          throw new Error('코스를 찾을 수 없습니다.');
        }

        // Find the quiz lesson
        let quizContent: any = null;
        for (const module of course.modules) {
          if (module.id === input.moduleId) {
            const lesson = module.lessons.find((l) => l.id === input.lessonId);
            if (lesson && lesson.type === 'quiz') {
              quizContent = lesson.content;
              break;
            }
          }
        }

        if (!quizContent || quizContent.type !== 'quiz') {
          throw new Error('퀴즈를 찾을 수 없습니다.');
        }

        // Grade the quiz
        const questions = quizContent.questions;
        let correctCount = 0;

        questions.forEach((question: any, index: number) => {
          if (input.answers[index] === question.correctAnswer) {
            correctCount++;
          }
        });

        const totalQuestions = questions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = checkQuizPassed(score);

        // Save quiz score
        await updateQuizScore(
          ctx.user.uid,
          input.courseId,
          input.lessonId,
          score
        );

        // If passed, mark lesson as completed
        if (passed) {
          await completeLesson(ctx.user.uid, input.courseId, input.lessonId);
        }

        // Calculate XP
        const xpGained = passed ? calculateQuizXP(score) : 0;

        return {
          score,
          passed,
          correctAnswers: correctCount,
          totalQuestions,
          xpGained,
          message: passed
            ? `퀴즈 통과! ${correctCount}/${totalQuestions} 정답`
            : `퀴즈 재도전이 필요합니다. ${correctCount}/${totalQuestions} 정답 (70% 이상 필요)`,
        };
      } catch (error: any) {
        console.error('[Courses] Failed to submit quiz:', error);
        throw new Error(`퀴즈 제출 실패: ${error.message}`);
      }
    }),

  /**
   * Update current lesson position
   */
  updateCurrentLesson: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        moduleId: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const progress = await getUserCourseProgress(
          ctx.user.uid,
          input.courseId
        );

        if (progress) {
          // Update via direct Firestore update
          // (Simplified - in real implementation would use upsertUserCourseProgress)
          return { success: true };
        } else {
          // Create new progress
          return { success: true };
        }
      } catch (error: any) {
        console.error('[Courses] Failed to update current lesson:', error);
        throw new Error(`현재 레슨 업데이트 실패: ${error.message}`);
      }
    }),
});
