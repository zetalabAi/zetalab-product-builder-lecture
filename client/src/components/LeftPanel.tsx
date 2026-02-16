import { useState, memo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LoginModal } from "@/components/LoginModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { LeftPanelHeader } from "./left-panel/LeftPanelHeader";
import { LeftPanelNav } from "./left-panel/LeftPanelNav";
import { BuilderBox } from "./left-panel/BuilderBox";
import { HistorySection } from "./left-panel/HistorySection";
import { UserProfile } from "./left-panel/UserProfile";

interface LeftPanelProps {
  className?: string;
  isOverlay?: boolean;
}

export const LeftPanel = memo(function LeftPanel({ className, isOverlay = false }: LeftPanelProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { leftPanelOpen, toggleLeftPanel } = useLayout();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch conversations
  const conversationsQuery = trpc.zetaAI.getHistory.useQuery(
    undefined,
    { enabled: !!user }
  );

  const conversations = conversationsQuery.data || [];

  const handleNewChat = () => {
    navigate("/");
  };

  return (
    <>
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "h-screen bg-background transition-all duration-200 border-r border-border/40",
          isOverlay && "fixed left-0 top-0 z-40",
          leftPanelOpen ? "w-60" : "w-16",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <LeftPanelHeader
            leftPanelOpen={leftPanelOpen}
            onToggle={toggleLeftPanel}
          />

          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              {leftPanelOpen && <span>새 채팅</span>}
            </Button>
          </div>

          {/* Navigation Menu */}
          <LeftPanelNav leftPanelOpen={leftPanelOpen} />

          {/* Divider */}
          {leftPanelOpen && <div className="mx-4 my-3 border-t border-border/40" />}

          {/* Builder Box */}
          <BuilderBox leftPanelOpen={leftPanelOpen} />

          {/* Divider */}
          {leftPanelOpen && <div className="mx-4 mb-3 border-t border-border/40" />}

          {/* History Section */}
          {user && (
            <HistorySection
              leftPanelOpen={leftPanelOpen}
              conversations={conversations}
              isLoading={conversationsQuery.isLoading}
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Profile */}
          <UserProfile
            leftPanelOpen={leftPanelOpen}
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onLogout={logout}
          />
        </div>
      </aside>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </>
  );
});
