/**
 * Dashboard Page
 * 사용자 학습 진행도 대시보드
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp } from "lucide-react";
import {
  ProgressOverview,
  QualityChart,
  SkillRadar,
  BadgeDisplay,
  RecommendationCard,
} from "@/components/dashboard";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user progress
  const {
    data: progressData,
    isLoading,
    error,
  } = trpc.progress.getUserProgress.useQuery(
    { userId: user?.uid },
    { enabled: !!user?.uid }
  );

  // Fetch recommendations
  const { data: recommendations } = trpc.progress.getRecommendations.useQuery(undefined, {
    enabled: !!user?.uid,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <TrendingUp className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            학습 대시보드를 보려면 로그인해주세요
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            진행도를 불러오는 중 오류가 발생했습니다
          </p>
        </Card>
      </div>
    );
  }

  if (!progressData) {
    return null;
  }

  const { levelInfo, ...progress } = progressData;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="flex-none border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              나의 성장
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            프롬프트 엔지니어링 실력을 확인하고 개선하세요
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Progress Overview */}
          <Card className="p-6">
            <ProgressOverview progress={progress} levelInfo={levelInfo} />
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Charts */}
            <div className="space-y-6">
              {/* Quality Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  🎯 프롬프트 품질 추이
                </h3>
                <QualityChart
                  scoreHistory={progress.scoreHistory}
                  avgScore={progress.avgQualityScore}
                />
              </Card>

              {/* Skill Radar */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  📊 스킬 분석
                </h3>
                <SkillRadar skillScores={progress.skillScores} />
              </Card>
            </div>

            {/* Right Column: Badges & Recommendations */}
            <div className="space-y-6">
              {/* Recommendations */}
              {recommendations && recommendations.length > 0 && (
                <Card className="p-6">
                  <RecommendationCard recommendations={recommendations} />
                </Card>
              )}

              {/* Badges */}
              <Card className="p-6">
                <BadgeDisplay badges={progress.badges} />
              </Card>
            </div>
          </div>

          {/* Empty State for No Data */}
          {progress.promptsCreated === 0 && (
            <Card className="p-12 text-center border-dashed">
              <TrendingUp className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">아직 데이터가 없습니다</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                프롬프트를 생성하고 품질 분석을 받으면 진행도가 기록됩니다
              </p>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                프롬프트 생성하기
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
