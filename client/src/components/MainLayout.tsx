import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { MobileHeader } from "./MobileHeader";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      
      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <MobileHeader onMenuClick={() => setMobileDrawerOpen(true)} />
          <MobileDrawer
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
          />
        </>
      )}
      
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 flex flex-col",
          isMobile ? "pt-14" : (sidebarOpen ? "ml-64" : "ml-16")
        )}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
