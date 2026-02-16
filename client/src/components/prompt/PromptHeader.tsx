import { FileText } from "lucide-react";
import { QualityBadge } from "@/components/quality/QualityBadge";

interface PromptHeaderProps {
  qualityScore?: number;
  createdAt: Date;
  isEdited?: boolean;
}

export function PromptHeader({ qualityScore, createdAt, isEdited }: PromptHeaderProps) {
  // 상대 시간 계산
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="flex items-center justify-between pb-3 border-b border-border/40">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">생성된 프롬프트</h3>
      </div>

      <div className="flex items-center gap-2">
        {qualityScore !== undefined && (
          <QualityBadge score={qualityScore} showScore={false} />
        )}
        <span className="text-xs text-muted-foreground">
          {getRelativeTime(createdAt)}
        </span>
        {isEdited && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            수정됨
          </span>
        )}
      </div>
    </div>
  );
}
