/**
 * Course Learning System Types
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'theory' | 'example' | 'exercise' | 'quiz';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  modules: Module[];
  estimatedTime: number; // 분
  prerequisites?: string[]; // 선수 코스 ID
  icon: string; // emoji
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: LessonContent;
}

export type LessonContent =
  | TheoryContent
  | ExampleContent
  | ExerciseContent
  | QuizContent;

export interface TheoryContent {
  type: 'theory';
  markdown: string;
}

export interface ExampleContent {
  type: 'example';
  goodExample: string;
  badExample: string;
  explanation: string;
}

export interface ExerciseContent {
  type: 'exercise';
  task: string;
  hints: string[];
  solution: string;
  checkpoints?: string[]; // 체크할 포인트들
}

export interface QuizContent {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // lesson IDs
  quizScores: Record<string, number>; // lessonId -> score
  completionRate: number; // 0-100
  lastAccessedAt: Date;
  currentModuleId?: string;
  currentLessonId?: string;
}

// UI용 확장 타입
export interface CourseWithProgress extends Course {
  progress?: UserCourseProgress;
}

export interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  isCurrent: boolean;
  score?: number; // 퀴즈 점수
}

// API 응답 타입
export interface CompleteLessonResponse {
  completionRate: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  message: string;
}

export interface SubmitQuizResponse {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  xpGained: number;
  message: string;
}
