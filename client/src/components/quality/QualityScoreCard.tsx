import { PromptQuality } from "@/types/quality";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { QualityMeter } from "./QualityMeter";
import { QualityBreakdown } from "./QualityBreakdown";
import { QualitySuggestions } from "./QualitySuggestions";

interface QualityScoreCardProps {
  quality: PromptQuality;
  isLoading?: boolean;
  onImprove?: () => void;
  onReanalyze?: () => void;
}

export function QualityScoreCard({
  quality,
  isLoading,
  onImprove,
  onReanalyze
}: QualityScoreCardProps) {
  return (
    <Card className="p-6 border-border/40 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">품질 분석</h3>
        </div>
        {onReanalyze && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">재분석</span>
          </Button>
        )}
      </div>

      {/* Overall Score (원형 프로그레스) */}
      <div className="flex flex-col items-center py-4">
        <QualityMeter score={quality.overall} size="lg" />
        <p className="mt-3 text-sm text-muted-foreground">
          종합 점수
        </p>
      </div>

      {/* Breakdown (6개 기준 바 차트) */}
      <QualityBreakdown quality={quality} />

      {/* Suggestions (개선 제안) */}
      <QualitySuggestions suggestions={quality.suggestions} />

      {/* Action Button */}
      {onImprove && (
        <Button
          onClick={onImprove}
          className="w-full flex items-center justify-center gap-2"
          size="sm"
        >
          <Sparkles className="w-4 h-4" />
          AI로 자동 개선
        </Button>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        분석 시간: {new Date(quality.analyzedAt).toLocaleString('ko-KR')}
      </p>
    </Card>
  );
}
