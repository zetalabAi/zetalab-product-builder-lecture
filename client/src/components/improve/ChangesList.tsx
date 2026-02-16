import { Change, ChangeType } from '../../types/improve';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ChangesListProps {
  changes: Change[];
}

const CHANGE_TYPE_CONFIG: Record<
  ChangeType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  added: {
    icon: Plus,
    label: '추가',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  modified: {
    icon: Edit,
    label: '수정',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  removed: {
    icon: Trash2,
    label: '제거',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
};

export function ChangesList({ changes }: ChangesListProps) {
  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">
        변경사항이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change, index) => {
        const config = CHANGE_TYPE_CONFIG[change.type];
        const Icon = config.icon;

        return (
          <div
            key={index}
            className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgColor} ${config.color} text-xs font-medium`}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {change.section}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-2">
              {/* Before (if exists) */}
              {change.before && (
                <div className="text-sm">
                  <span className="text-zinc-500 dark:text-zinc-500">변경 전:</span>
                  <div className="mt-1 p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 line-through opacity-60">
                    {change.before}
                  </div>
                </div>
              )}

              {/* After */}
              <div className="text-sm">
                <span className="text-zinc-500 dark:text-zinc-500">
                  {change.type === 'removed' ? '제거된 내용:' : '변경 후:'}
                </span>
                <div className="mt-1 p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                  {change.after}
                </div>
              </div>

              {/* Reasoning */}
              <div className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                💡 {change.reasoning}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
