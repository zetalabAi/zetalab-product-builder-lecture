import { useEffect, useRef, memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { PANEL_WIDTHS } from "@/constants/layout";

export const RightPanel = memo(function RightPanel() {
  const { rightPanelOpen, rightPanelContent, setRightPanelOpen } = useLayout();
  const breakpoint = useBreakpoint();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (rightPanelOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus panel
      panelRef.current?.focus();
    } else {
      // Restore previous focus
      previousFocusRef.current?.focus();
    }
  }, [rightPanelOpen]);

  // Don't render if no content
  if (!rightPanelContent && !rightPanelOpen) {
    return null;
  }

  const isDesktop = breakpoint === 'desktop' || breakpoint === 'laptop';
  const width = breakpoint === 'desktop'
    ? PANEL_WIDTHS.rightDesktop
    : PANEL_WIDTHS.rightLaptop;

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {!isDesktop && rightPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
          onClick={() => setRightPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        ref={panelRef}
        role="region"
        aria-label="Output panel"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-50 h-screen bg-background transition-transform duration-200",
          "border-l border-border/40",
          "focus:outline-none",
          isDesktop ? "relative" : "fixed",
          rightPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          width: isDesktop ? `${width}px` : '100vw',
          maxWidth: isDesktop ? undefined : '400px',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
            <h2 className="text-sm font-semibold">결과</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelOpen(false)}
              aria-label="Close output panel"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {rightPanelContent}
          </div>
        </div>
      </aside>
    </>
  );
});
