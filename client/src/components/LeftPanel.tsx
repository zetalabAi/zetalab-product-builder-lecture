import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LoginModal } from "@/components/LoginModal";
import {
  MessageSquare,
  FolderOpen,
  Container,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  ChevronDown,
  ChevronUp,
  Home,
  Settings,
  LogOut,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";

interface LeftPanelProps {
  className?: string;
  isOverlay?: boolean; // Tablet overlay mode
}

export function LeftPanel({ className, isOverlay = false }: LeftPanelProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { leftPanelOpen, toggleLeftPanel } = useLayout();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [builderBoxOpen, setBuilderBoxOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch conversations (simplified - no search, no pinning for now)
  const conversationsQuery = trpc.zetaAI.getHistory.useQuery(
    undefined,
    { enabled: !!user }
  );

  const conversations = conversationsQuery.data || [];

  const handleNewChat = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { icon: Home, label: "홈", path: "/" },
    { icon: FileText, label: "내 프롬프트", path: "/my-work" },
    { icon: Container, label: "프로젝트", path: "/projects" },
  ];

  const builderBoxItems = [
    { label: "Zeta Blog", path: "#" },
    { label: "Zeta Shorts", path: "#" },
    { label: "Zeta PPT", path: "#" },
    { label: "Zeta Foto", path: "#" },
    { label: "Zeta Docs", path: "#" },
  ];

  const handleBuilderBoxClick = (label: string) => {
    // Coming soon - 추후 구현
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
          {/* Header: Logo + Toggle */}
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
              onClick={toggleLeftPanel}
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
          <nav className="px-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 mb-1",
                    !leftPanelOpen && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {leftPanelOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          {leftPanelOpen && <div className="mx-4 my-3 border-t border-border/40" />}

          {/* Builder Box */}
          {leftPanelOpen && (
            <div className="px-2 pb-3">
              <Collapsible open={builderBoxOpen} onOpenChange={setBuilderBoxOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between group">
                    <span className="flex items-center gap-3">
                      <Container className="h-5 w-5" />
                      <span className="flex items-center gap-2">
                        Builder Box
                        <Clock className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </span>
                    {builderBoxOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1">
                  {builderBoxItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start text-sm pl-9 text-muted-foreground hover:text-muted-foreground cursor-default"
                      onClick={() => handleBuilderBoxClick(item.label)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Divider */}
          {leftPanelOpen && <div className="mx-4 mb-3 border-t border-border/40" />}

          {/* History Section */}
          {leftPanelOpen && user && (
            <div className="overflow-hidden px-2 mt-4 mb-4">
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">히스토리</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        historyOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-1 pr-3">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-2 py-2">
                          대화 내역이 없습니다
                        </p>
                      ) : (
                        conversations.map((conv) => (
                          <Link
                            key={conv.id}
                            href={`/chat/${conv.id}`}
                            asChild
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left font-normal h-auto py-2"
                            >
                              <div className="flex-1 truncate">
                                <div className="text-sm truncate">
                                  {conv.originalQuestion || "새 대화"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(conv.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </Button>
                          </Link>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Spacer to push User Profile to bottom */}
          <div className="flex-1" />

          {/* User Profile (Bottom) */}
          <div className="mt-auto border-t border-border/40 p-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      !leftPanelOpen && "justify-center px-0"
                    )}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {leftPanelOpen && (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-sm truncate">
                          {user.displayName || user.email}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className={cn(
                  "w-full justify-start gap-2",
                  !leftPanelOpen && "justify-center px-0"
                )}
              >
                <User className="h-4 w-4" />
                {leftPanelOpen && <span>로그인</span>}
              </Button>
            )}
          </div>
        </div>
      </aside>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </>
  );
}
