import { Badge } from "@/components/ui/badge";
import { getQualityGrade, QUALITY_GRADE_COLORS, QUALITY_GRADE_LABELS } from "@/types/quality";

interface QualityBadgeProps {
  score: number;
  showScore?: boolean;
}

export function QualityBadge({ score, showScore = true }: QualityBadgeProps) {
  const grade = getQualityGrade(score);
  const colorClass = QUALITY_GRADE_COLORS[grade];
  const label = QUALITY_GRADE_LABELS[grade];

  return (
    <Badge variant="outline" className={`${colorClass} border-current`}>
      {label}
      {showScore && ` (${score})`}
    </Badge>
  );
}
