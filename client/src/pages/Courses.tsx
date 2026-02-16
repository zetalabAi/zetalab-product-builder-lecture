import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { CourseCard } from '../components/courses';
import { Button } from '../components/ui/button';
import { BookOpen, GraduationCap } from 'lucide-react';
import type { Difficulty } from '../types/courses';

export default function Courses() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | 'all'
  >('all');

  const coursesQuery = trpc.courses.getCourses.useQuery({
    difficulty:
      selectedDifficulty === 'all' ? undefined : selectedDifficulty,
  });

  const courses = coursesQuery.data || [];

  const difficultyOptions: { value: Difficulty | 'all'; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              프롬프트 학습 코스
            </h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            단계별로 프롬프트 엔지니어링을 배우고 실습하세요
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mr-2">
              난이도:
            </span>
            {difficultyOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedDifficulty === option.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedDifficulty(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {coursesQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-zinc-600 dark:text-zinc-400">
                코스 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {coursesQuery.error && (
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-950/20">
            <p className="text-red-900 dark:text-red-100">
              코스를 불러오는데 실패했습니다.
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-2">
              {coursesQuery.error.message}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!coursesQuery.isLoading && courses.length === 0 && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 bg-zinc-50 dark:bg-zinc-950 text-center">
            <BookOpen className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              코스가 없습니다
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {selectedDifficulty === 'all'
                ? '아직 등록된 코스가 없습니다.'
                : `${
                    difficultyOptions.find((o) => o.value === selectedDifficulty)
                      ?.label
                  } 난이도의 코스가 없습니다.`}
            </p>
          </div>
        )}

        {/* Course Grid */}
        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Stats */}
        {courses.length > 0 && (
          <div className="mt-12 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              📊 학습 현황
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  전체 코스
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {courses.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  진행 중
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                  {
                    courses.filter(
                      (c) =>
                        c.progress &&
                        c.progress.completedLessons.length > 0 &&
                        c.progress.completionRate < 100
                    ).length
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  완료
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {
                    courses.filter(
                      (c) => c.progress && c.progress.completionRate === 100
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
