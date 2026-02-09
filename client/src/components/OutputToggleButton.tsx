import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";

export function OutputToggleButton() {
  const { rightPanelOpen, rightPanelContent, toggleRightPanel } = useLayout();

  // Only show if there's content to display
  if (!rightPanelContent) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleRightPanel}
      aria-label="Toggle output panel"
      aria-expanded={rightPanelOpen}
      className="fixed right-4 top-4 z-30 h-9 w-9 shadow-md"
    >
      {rightPanelOpen ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  );
}
