import { useState } from "react";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { OutputToggleButton } from "./OutputToggleButton";
import { MobileDrawer } from "./MobileDrawer";
import { MobileHeader } from "./MobileHeader";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { PANEL_WIDTHS } from "@/constants/layout";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { leftPanelOpen, rightPanelOpen } = useLayout();
  const breakpoint = useBreakpoint();

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop' || breakpoint === 'laptop';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Desktop/Laptop (pushes content) */}
      {isDesktop && <LeftPanel isOverlay={false} />}

      {/* Mobile Header & Drawer */}
      {isMobile && (
        <>
          <MobileHeader onMenuClick={() => setMobileDrawerOpen(true)} />
          <MobileDrawer
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
          />
        </>
      )}

      {/* Tablet Left Panel Overlay */}
      {isTablet && leftPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-200"
            onClick={() => {}}
            aria-hidden="true"
          />
          <div
            className={cn(
              "fixed left-0 top-0 z-40 h-screen transition-transform duration-200",
              leftPanelOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <LeftPanel isOverlay={true} />
          </div>
        </>
      )}

      {/* Main Area */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-200 flex flex-col",
          isMobile && "pt-14"
        )}
      >
        <div className="flex-1 relative">
          {/* Output Toggle Button (floating) */}
          <OutputToggleButton />

          {children}
        </div>
        <Footer />
      </main>

      {/* Right Panel - Desktop uses fixed position, Mobile/Tablet uses overlay */}
      <RightPanel />
    </div>
  );
}
