import { X } from "lucide-react";
import { useEffect } from "react";

interface UsageBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageBottomSheet({ isOpen, onClose }: UsageBottomSheetProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // 바디 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 dim */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 md:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 핸들 바 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold">사용법</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors touch-manipulation"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-8 pb-safe">
          <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
            막연하게 질문해도 괜찮아요.{"\n"}
            AI가 다시 질문할 거예요.{"\n"}
            답변만 해주면{"\n"}
            완벽한 프롬프트가 완성됩니다!
          </p>
        </div>
      </div>
    </>
  );
}
