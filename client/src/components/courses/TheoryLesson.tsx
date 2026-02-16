import { TheoryContent } from '../../types/courses';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

interface TheoryLessonProps {
  content: TheoryContent;
  isCompleted: boolean;
  onComplete: () => void;
}

export function TheoryLesson({
  content,
  isCompleted,
  onComplete,
}: TheoryLessonProps) {
  return (
    <div className="space-y-6">
      {/* Theory Content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <ReactMarkdown>{content.markdown}</ReactMarkdown>
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
