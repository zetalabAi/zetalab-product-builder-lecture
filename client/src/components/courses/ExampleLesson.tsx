import { ExampleContent } from '../../types/courses';
import { Button } from '../ui/button';
import { Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExampleLessonProps {
  content: ExampleContent;
  isCompleted: boolean;
  onComplete: () => void;
}

export function ExampleLesson({
  content,
  isCompleted,
  onComplete,
}: ExampleLessonProps) {
  return (
    <div className="space-y-6">
      {/* Good Example */}
      <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-6 bg-green-50 dark:bg-green-950/20">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-500" />
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            ✅ 좋은 예시
          </h3>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {content.goodExample}
        </pre>
      </div>

      {/* Bad Example */}
      <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-500" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
            ❌ 나쁜 예시
          </h3>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {content.badExample}
        </pre>
      </div>

      {/* Explanation */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          💡 설명
        </h3>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <ReactMarkdown>{content.explanation}</ReactMarkdown>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
            <Check className="w-5 h-5" />
            <span className="font-medium">완료됨</span>
          </div>
        ) : (
          <Button onClick={onComplete} size="lg">
            완료하고 다음으로
          </Button>
        )}
      </div>
    </div>
  );
}
