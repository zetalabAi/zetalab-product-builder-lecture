/**
 * VersionCard Component
 * 개별 버전 카드 - 타임라인에 표시되는 각 버전
 */

import { PromptVersion } from "@/types/versions";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, User, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VersionCardProps {
  version: PromptVersion;
  isLatest?: boolean;
  onSelect?: () => void;
  onRevert?: () => void;
  onCompare?: () => void;
}

export function VersionCard({
  version,
  isLatest = false,
  onSelect,
  onRevert,
  onCompare
}: VersionCardProps) {
  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all cursor-pointer
        ${isLatest
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-card hover:bg-accent/50 border-border'
        }
      `}
      onClick={onSelect}
    >
      {/* 버전 번호 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={isLatest ? "default" : "secondary"}>
            v{version.version}
          </Badge>
          {isLatest && (
            <Badge variant="outline" className="text-xs">
              최신
            </Badge>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* 변경사항 */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {version.changes.length > 0 ? (
              <ul className="space-y-1">
                {version.changes.map((change, idx) => (
                  <li key={idx} className="text-sm text-foreground">
                    {change}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">변경사항 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {formatDistanceToNow(version.createdAt, {
              addSuffix: true,
              locale: ko
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>나</span>
        </div>
      </div>

      {/* 액션 버튼 (hover 시 표시) */}
      {!isLatest && (
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onRevert?.();
            }}
            className="flex-1"
          >
            복원
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onCompare?.();
            }}
            className="flex-1"
          >
            비교
          </Button>
        </div>
      )}
    </div>
  );
}
