import { parsePrompt } from "@/utils/promptParser";
import { PromptHeader } from "./PromptHeader";
import { PromptSection } from "./PromptSection";
import { PromptActions } from "./PromptActions";
import { toast } from "sonner";

interface PromptDisplayProps {
  promptText: string;
  qualityScore?: number;
  createdAt: Date;
  isEdited?: boolean;
  onEdit?: () => void;
  onTest?: () => void;
  onShare?: () => void;
}

export function PromptDisplay({
  promptText,
  qualityScore,
  createdAt,
  isEdited,
  onEdit,
  onTest,
  onShare
}: PromptDisplayProps) {
  const parsed = parsePrompt(promptText);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(parsed.raw);
      toast.success("전체 프롬프트가 복사되었습니다");
    } catch (error) {
      toast.error("복사 실패");
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <PromptHeader
        qualityScore={qualityScore}
        createdAt={createdAt}
        isEdited={isEdited}
      />

      {/* 섹션 목록 */}
      <div className="space-y-3">
        {parsed.sections.map((section, index) => (
          <PromptSection
            key={index}
            section={section}
            index={index}
          />
        ))}
      </div>

      {/* 액션 버튼 */}
      <PromptActions
        onCopyAll={handleCopyAll}
        onEdit={onEdit}
        onTest={onTest}
        onShare={onShare}
      />
    </div>
  );
}
