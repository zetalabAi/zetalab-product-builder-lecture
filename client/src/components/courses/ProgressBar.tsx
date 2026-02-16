interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  total,
  showPercentage = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className="space-y-2">
      <div className={`w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {current} / {total} 완료
          </span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
