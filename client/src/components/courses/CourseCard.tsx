import { CourseWithProgress } from '../../types/courses';
import { Button } from '../ui/button';
import { ProgressBar } from './ProgressBar';
import { Clock, BookOpen, Lock } from 'lucide-react';
import { Link } from 'wouter';

interface CourseCardProps {
  course: CourseWithProgress;
  isLocked?: boolean;
}

export function CourseCard({ course, isLocked = false }: CourseCardProps) {
  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

  const completedLessons = course.progress?.completedLessons.length || 0;
  const completionRate = course.progress?.completionRate || 0;

  const difficultyBadge = {
    beginner: { label: '초급', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' },
    intermediate: { label: '중급', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' },
    advanced: { label: '고급', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' },
  }[course.difficulty];

  const isInProgress = completedLessons > 0 && completedLessons < totalLessons;
  const isCompleted = completedLessons === totalLessons && totalLessons > 0;

  return (
    <div
      className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
        isLocked
          ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 opacity-75'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Icon */}
        <div className="text-5xl flex-shrink-0">{course.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {course.title}
            </h3>
            {isLocked && <Lock className="w-5 h-5 text-zinc-500" />}
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
            {course.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${difficultyBadge.color}`}
            >
              {difficultyBadge.label}
            </span>

            {isCompleted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                ✓ 완료
              </span>
            )}

            {isInProgress && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                진행 중
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{course.modules.length}개 모듈</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>약 {Math.floor(course.estimatedTime / 60)}시간</span>
        </div>
      </div>

      {/* Progress */}
      {!isLocked && course.progress && completedLessons > 0 && (
        <div className="mb-4">
          <ProgressBar
            current={completedLessons}
            total={totalLessons}
            size="md"
          />
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {isLocked ? (
          <Button disabled className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            잠김
          </Button>
        ) : (
          <Link href={`/courses/${course.id}`}>
            <Button className="w-full">
              {isCompleted
                ? '다시 학습'
                : isInProgress
                ? '이어서 학습'
                : '학습 시작'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
