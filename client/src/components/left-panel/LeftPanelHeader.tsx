import { memo } from "react";
import { Link } from "wouter";
import { Container, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftPanelHeaderProps {
  leftPanelOpen: boolean;
  onToggle: () => void;
}

export const LeftPanelHeader = memo(function LeftPanelHeader({
  leftPanelOpen,
  onToggle,
}: LeftPanelHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-border/40 px-3">
      {leftPanelOpen && (
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Container className="h-5 w-5" />
          <span>ZetaLab</span>
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-expanded={leftPanelOpen}
        aria-label={leftPanelOpen ? "Close navigation" : "Open navigation"}
        className="h-8 w-8"
      >
        {leftPanelOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});
