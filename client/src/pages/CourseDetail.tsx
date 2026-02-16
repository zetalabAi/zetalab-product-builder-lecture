import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import {
  TheoryLesson,
  ExampleLesson,
  ExerciseLesson,
  QuizLesson,
  ProgressBar,
} from '../components/courses';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Lesson, Module } from '../types/courses';

export default function CourseDetail() {
  const [, params] = useRoute('/courses/:courseId');
  const [, navigate] = useLocation();
  const courseId = params?.courseId;

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const courseQuery = trpc.courses.getCourseById.useQuery(
    { courseId: courseId! },
    { enabled: !!courseId }
  );

  const completeLessonMutation = trpc.courses.completeLesson.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.xpGained > 0) {
        toast.success(`+${data.xpGained} XP 획득!`);
      }
      // Refetch course to update progress
      courseQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const submitQuizMutation = trpc.courses.submitQuiz.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.xpGained > 0) {
        toast.success(`+${data.xpGained} XP 획득!`);
      }
      // Refetch course to update progress
      courseQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const course = courseQuery.data;
  const progress = course?.progress;

  // Find current lesson
  const currentLesson: {
    lesson: Lesson;
    moduleId: string;
    module: Module;
  } | null = (() => {
    if (!course || !currentLessonId) return null;

    for (const module of course.modules) {
      const lesson = module.lessons.find((l) => l.id === currentLessonId);
      if (lesson) {
        return { lesson, moduleId: module.id, module };
      }
    }
    return null;
  })();

  // Initialize first incomplete lesson on mount
  useEffect(() => {
    if (!course || currentLessonId) return;

    // Find first incomplete lesson
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const isCompleted = progress?.completedLessons.includes(lesson.id);
        if (!isCompleted) {
          setCurrentLessonId(lesson.id);
          setExpandedModules(new Set([module.id]));
          return;
        }
      }
    }

    // If all completed, show first lesson
    if (course.modules[0]?.lessons[0]) {
      setCurrentLessonId(course.modules[0].lessons[0].id);
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course, currentLessonId, progress]);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleCompleteLesson = () => {
    if (!currentLesson || !courseId) return;

    completeLessonMutation.mutate({
      courseId,
      moduleId: currentLesson.moduleId,
      lessonId: currentLesson.lesson.id,
    });
  };

  const handleSubmitQuiz = (answers: number[]) => {
    if (!currentLesson || !courseId) return;

    submitQuizMutation.mutate({
      courseId,
      moduleId: currentLesson.moduleId,
      lessonId: currentLesson.lesson.id,
      answers,
    });
  };

  const goToLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  const goToNextLesson = () => {
    if (!course || !currentLessonId) return;

    let found = false;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (found) {
          setCurrentLessonId(lesson.id);
          setExpandedModules(new Set([module.id]));
          return;
        }
        if (lesson.id === currentLessonId) {
          found = true;
        }
      }
    }
  };

  if (courseQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-zinc-600 dark:text-zinc-400">코스 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (courseQuery.error || !course) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            코스 목록으로
          </Button>

          <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-950/20">
            <p className="text-red-900 dark:text-red-100">
              코스를 불러오는데 실패했습니다.
            </p>
            {courseQuery.error && (
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                {courseQuery.error.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );
  const completedLessons = progress?.completedLessons.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          코스 목록으로
        </Button>

        {/* Course Header */}
        <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{course.icon}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {course.title}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {course.description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <ProgressBar current={completedLessons} total={totalLessons} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module List (Sidebar on desktop) */}
          <div className="lg:col-span-1">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                목차
              </h2>

              <div className="space-y-2">
                {course.modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.has(module.id);
                  const moduleLessons = module.lessons;
                  const completedCount = moduleLessons.filter((l) =>
                    progress?.completedLessons.includes(l.id)
                  ).length;
                  const allCompleted = completedCount === moduleLessons.length;

                  return (
                    <div key={module.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                            {moduleIndex + 1}.
                          </span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {module.title}
                          </span>
                          {allCompleted && (
                            <Check className="w-4 h-4 text-green-600 dark:text-green-500 ml-auto" />
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>

                      {/* Lessons */}
                      {isExpanded && (
                        <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                          {moduleLessons.map((lesson, lessonIndex) => {
                            const isCompleted =
                              progress?.completedLessons.includes(lesson.id);
                            const isCurrent = lesson.id === currentLessonId;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => goToLesson(lesson.id)}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-left transition-colors ${
                                  isCurrent
                                    ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <span className="text-xs text-zinc-500">
                                  {moduleIndex + 1}.{lessonIndex + 1}
                                </span>
                                <span
                                  className={`text-sm flex-1 ${
                                    isCurrent
                                      ? 'text-blue-900 dark:text-blue-100 font-medium'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                {isCompleted ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                ) : (
                                  <Lock className="w-4 h-4 text-zinc-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 p-6">
                {/* Lesson Header */}
                <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {currentLesson.lesson.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {currentLesson.module.title}
                    </span>
                    <span className="text-sm px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      {
                        {
                          theory: '이론',
                          example: '예시',
                          exercise: '실습',
                          quiz: '퀴즈',
                        }[currentLesson.lesson.type]
                      }
                    </span>
                  </div>
                </div>

                {/* Lesson Content by Type */}
                {currentLesson.lesson.type === 'theory' &&
                  currentLesson.lesson.content.type === 'theory' && (
                    <TheoryLesson
                      content={currentLesson.lesson.content}
                      isCompleted={
                        progress?.completedLessons.includes(
                          currentLesson.lesson.id
                        ) || false
                      }
                      onComplete={handleCompleteLesson}
                    />
                  )}

                {currentLesson.lesson.type === 'example' &&
                  currentLesson.lesson.content.type === 'example' && (
                    <ExampleLesson
                      content={currentLesson.lesson.content}
                      isCompleted={
                        progress?.completedLessons.includes(
                          currentLesson.lesson.id
                        ) || false
                      }
                      onComplete={handleCompleteLesson}
                    />
                  )}

                {currentLesson.lesson.type === 'exercise' &&
                  currentLesson.lesson.content.type === 'exercise' && (
                    <ExerciseLesson
                      content={currentLesson.lesson.content}
                      isCompleted={
                        progress?.completedLessons.includes(
                          currentLesson.lesson.id
                        ) || false
                      }
                      onComplete={handleCompleteLesson}
                    />
                  )}

                {currentLesson.lesson.type === 'quiz' &&
                  currentLesson.lesson.content.type === 'quiz' && (
                    <QuizLesson
                      content={currentLesson.lesson.content}
                      isCompleted={
                        progress?.completedLessons.includes(
                          currentLesson.lesson.id
                        ) || false
                      }
                      savedScore={
                        progress?.quizScores[currentLesson.lesson.id]
                      }
                      onSubmit={handleSubmitQuiz}
                    />
                  )}
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 p-12 text-center">
                <BookOpen className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  레슨을 선택하세요
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  왼쪽 목차에서 레슨을 선택하여 학습을 시작하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
