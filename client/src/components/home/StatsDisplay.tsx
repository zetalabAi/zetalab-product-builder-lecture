/**
 * StatsDisplay Component
 * 통계 표시 (오늘 생성된 프롬프트 수, 누적 사용자 등)
 */

import { Card } from "@/components/ui/card";
import { Sparkles, Users, TrendingUp } from "lucide-react";

interface StatsDisplayProps {
  todayPromptsCount?: number;
  totalUsersCount?: number;
}

export function StatsDisplay({
  todayPromptsCount = 1247,
  totalUsersCount = 8524
}: StatsDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '300ms' }}>
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {/* 오늘 생성 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {todayPromptsCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                오늘 생성된 프롬프트
              </p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="hidden md:block w-px h-12 bg-border"></div>

          {/* 누적 사용자 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalUsersCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                누적 사용자
              </p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="hidden md:block w-px h-12 bg-border"></div>

          {/* 성장률 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                +247%
              </p>
              <p className="text-sm text-muted-foreground">
                이번 달 성장률
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
