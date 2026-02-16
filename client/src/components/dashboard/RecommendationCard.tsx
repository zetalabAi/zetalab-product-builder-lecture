import { Recommendation } from '../../types/progress';
import { ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  recommendations: Recommendation[];
}

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (recommendations.length === 0) {
    return null;
  }

  // Sort by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        💡 다음 목표
      </h3>

      {sortedRecommendations.map((rec, index) => {
        const priorityColors = {
          high: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20',
          medium: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20',
          low: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20',
        };

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border ${priorityColors[rec.priority]}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{rec.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {rec.title}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {rec.message}
                </div>
                {rec.action && (
                  <button
                    onClick={() => {
                      if (rec.actionLink) {
                        window.location.href = rec.actionLink;
                      }
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {rec.action}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
