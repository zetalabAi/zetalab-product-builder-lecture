import { Button } from "@/components/ui/button";
import { Copy, Edit, TestTube, Share2 } from "lucide-react";

interface PromptActionsProps {
  onCopyAll: () => void;
  onEdit?: () => void;
  onTest?: () => void;
  onShare?: () => void;
}

export function PromptActions({ onCopyAll, onEdit, onTest, onShare }: PromptActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
      <Button
        onClick={onCopyAll}
        className="flex items-center gap-2"
        size="sm"
      >
        <Copy className="w-4 h-4" />
        전체 복사
      </Button>

      {onEdit && (
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          수정
        </Button>
      )}

      {onTest && (
        <Button
          onClick={onTest}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          테스트
        </Button>
      )}

      {onShare && (
        <Button
          onClick={onShare}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          공유
        </Button>
      )}
    </div>
  );
}
