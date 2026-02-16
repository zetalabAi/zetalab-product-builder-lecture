import { Menu, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { useLayout } from "@/contexts/LayoutContext";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { rightPanelContent, toggleRightPanel } = useLayout();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/40 z-30 flex items-center justify-between px-4 md:hidden safe-area-top">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">Z</span>
          </div>
          <span className="font-semibold text-lg">ZetaLab</span>
        </div>
      </div>

      {/* Right Panel Toggle - Only show if content exists */}
      {rightPanelContent && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRightPanel}
          aria-label="결과 보기"
          className="min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
        >
          <FileText className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
