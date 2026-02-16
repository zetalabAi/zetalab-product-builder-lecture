import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface BeforeAfterProps {
  before: string;
  after: string;
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('split')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            viewMode === 'split'
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          나란히 보기
        </button>
        <button
          onClick={() => setViewMode('unified')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            viewMode === 'unified'
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          위아래로 보기
        </button>
      </div>

      {/* Content */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                원본 프롬프트
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">
                Before
              </span>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {before}
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                개선된 프롬프트
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-xs">
                After
              </span>
            </div>
            <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {after}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                원본 프롬프트
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs">
                Before
              </span>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {before}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950">
              <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 rotate-90" />
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                개선된 프롬프트
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-xs">
                After
              </span>
            </div>
            <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {after}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
