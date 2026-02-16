import { Badge } from '../../types/progress';
import { BADGE_DEFINITIONS } from '../../lib/progress-constants';
import { Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BadgeDisplayProps {
  badges: Badge[];
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const earnedBadgeIds = badges.map((b) => b.id);
  const allBadges = BADGE_DEFINITIONS;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          획득한 배지
        </h3>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {badges.length} / {allBadges.length}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allBadges.map((badgeDef) => {
          const earned = badges.find((b) => b.id === badgeDef.id);
          const isEarned = !!earned;

          return (
            <div
              key={badgeDef.id}
              className={`relative group p-4 rounded-lg border ${
                isEarned
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 opacity-50'
              } transition-all hover:scale-105 cursor-pointer`}
            >
              {/* Badge Icon */}
              <div className="text-4xl mb-2 text-center">{badgeDef.icon}</div>

              {/* Lock Icon for unearned */}
              {!isEarned && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                </div>
              )}

              {/* Badge Name */}
              <div className={`text-xs font-medium text-center mb-1 ${
                isEarned
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-500'
              }`}>
                {badgeDef.name}
              </div>

              {/* Earned Date */}
              {earned && (
                <div className="text-xs text-center text-zinc-500 dark:text-zinc-500">
                  {formatDistanceToNow(new Date(earned.earnedAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {badgeDef.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recently Earned */}
      {badges.length > 0 && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
            최근 획득
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges
              .slice()
              .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
              .slice(0, 5)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {badge.name}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formatDistanceToNow(new Date(badge.earnedAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
