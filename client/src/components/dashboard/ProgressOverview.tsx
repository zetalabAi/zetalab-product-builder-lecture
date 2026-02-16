import { UserProgress, LevelInfo } from '../../types/progress';
import { Trophy, Zap, Target, Flame } from 'lucide-react';

interface ProgressOverviewProps {
  progress: UserProgress;
  levelInfo: LevelInfo;
}

export function ProgressOverview({ progress, levelInfo }: ProgressOverviewProps) {
  // Calculate progress percentage for current level
  const currentLevelXP = progress.xp - levelInfo.minXP;
  const requiredXP = levelInfo.maxXP - levelInfo.minXP;
  const progressPercent = Math.round((currentLevelXP / requiredXP) * 100);

  return (
    <div className="space-y-6">
      {/* Level Banner */}
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <div>
              <div className="text-sm opacity-90">Level {levelInfo.level}</div>
              <div className="text-2xl font-bold">{levelInfo.title}</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{currentLevelXP} XP</span>
              <span>{requiredXP} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-sm mt-1 opacity-90">
              다음 레벨까지 {requiredXP - currentLevelXP} XP
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">총 XP</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {progress.xp}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">프롬프트 수</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {progress.promptsCreated}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">배지</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {progress.badges.length}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">연속 일수</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {progress.streakDays}일
          </div>
        </div>
      </div>
    </div>
  );
}
