import { useEffect, useState } from "react";
import {
  PromptQuality,
  QUALITY_CRITERIA_LABELS,
  getQualityGrade,
  QUALITY_GRADE_BG_COLORS,
} from "@/types/quality";

interface QualityBreakdownProps {
  quality: PromptQuality;
}

export function QualityBreakdown({ quality }: QualityBreakdownProps) {
  const [animatedScores, setAnimatedScores] = useState({
    clarity: 0,
    specificity: 0,
    structure: 0,
    context: 0,
    constraints: 0,
  });

  // 바 차트 애니메이션 (슬라이드 인)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores({
        clarity: quality.clarity,
        specificity: quality.specificity,
        structure: quality.structure,
        context: quality.context,
        constraints: quality.constraints,
      });
    }, 300); // 원형 프로그레스 후 시작

    return () => clearTimeout(timer);
  }, [quality]);

  const criteria = [
    { key: "clarity" as const, label: QUALITY_CRITERIA_LABELS.clarity, score: quality.clarity },
    { key: "specificity" as const, label: QUALITY_CRITERIA_LABELS.specificity, score: quality.specificity },
    { key: "structure" as const, label: QUALITY_CRITERIA_LABELS.structure, score: quality.structure },
    { key: "context" as const, label: QUALITY_CRITERIA_LABELS.context, score: quality.context },
    { key: "constraints" as const, label: QUALITY_CRITERIA_LABELS.constraints, score: quality.constraints },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">세부 평가</h4>
      {criteria.map((criterion, index) => {
        const grade = getQualityGrade(criterion.score);
        const bgColorClass = QUALITY_GRADE_BG_COLORS[grade];
        const animatedScore = animatedScores[criterion.key];

        return (
          <div key={criterion.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{criterion.label}</span>
              <span className={`font-medium ${bgColorClass.replace('bg-', 'text-')}`}>
                {criterion.score}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${bgColorClass} transition-all duration-700 ease-out`}
                style={{
                  width: `${animatedScore}%`,
                  transitionDelay: `${index * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
