import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface ReTestButtonProps {
  onReTest: () => Promise<void>;
  disabled?: boolean;
  estimatedImprovement?: number;
}

export function ReTestButton({
  onReTest,
  disabled = false,
  estimatedImprovement,
}: ReTestButtonProps) {
  const [isRetesting, setIsRetesting] = useState(false);

  const handleClick = async () => {
    setIsRetesting(true);
    try {
      await onReTest();
    } catch (error) {
      console.error('ReTest failed:', error);
    } finally {
      setIsRetesting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isRetesting}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isRetesting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>재테스트 중...</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          <span>개선된 프롬프트로 재테스트</span>
          {estimatedImprovement !== undefined && estimatedImprovement > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 text-xs font-medium">
              +{estimatedImprovement}% 예상
            </span>
          )}
        </>
      )}
    </button>
  );
}
