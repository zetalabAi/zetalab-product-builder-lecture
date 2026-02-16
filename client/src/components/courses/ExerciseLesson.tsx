import { ExerciseContent } from '../../types/courses';
import { Button } from '../ui/button';
import { Check, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ExerciseLessonProps {
  content: ExerciseContent;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ExerciseLesson({
  content,
  isCompleted,
  onComplete,
}: ExerciseLessonProps) {
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const showNextHint = () => {
    if (currentHint < content.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  return (
    <div className="space-y-6">
      {/* Task */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          📝 과제
        </h3>
        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
          {content.task}
        </p>
      </div>

      {/* User Answer Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          여기에 프롬프트를 작성하세요:
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full h-48 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none font-mono text-sm"
          placeholder="프롬프트를 입력하세요..."
        />
      </div>

      {/* Hints */}
      <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 bg-yellow-50 dark:bg-yellow-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              💡 힌트
            </h3>
          </div>
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            {currentHint + 1} / {content.hints.length}
          </span>
        </div>

        {content.hints.slice(0, currentHint + 1).map((hint, index) => (
          <div
            key={index}
            className="mb-2 last:mb-0 p-3 rounded bg-white dark:bg-zinc-900 border border-yellow-200 dark:border-yellow-800"
          >
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {index + 1}. {hint}
            </span>
          </div>
        ))}

        {currentHint < content.hints.length - 1 && (
          <Button
            onClick={showNextHint}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            다음 힌트 보기
          </Button>
        )}
      </div>

      {/* Solution Toggle */}
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            ✓ 정답 예시
          </h3>
          <Button
            onClick={toggleSolution}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showSolution ? (
              <>
                <EyeOff className="w-4 h-4" />
                숨기기
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                보기
              </>
            )}
          </Button>
        </div>

        {showSolution && (
          <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {content.solution}
          </pre>
        )}
      </div>

      {/* Checkpoints */}
      {content.checkpoints && content.checkpoints.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            ✅ 체크포인트
          </h3>
          <div className="space-y-2">
            {content.checkpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-1 w-4 h-4 rounded border-2 border-zinc-400 dark:border-zinc-600" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {checkpoint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Button */}
      <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
            <Check className="w-5 h-5" />
            <span className="font-medium">완료됨</span>
          </div>
        ) : (
          <Button onClick={onComplete} size="lg" disabled={!userAnswer.trim()}>
            완료하고 다음으로
          </Button>
        )}
      </div>
    </div>
  );
}
