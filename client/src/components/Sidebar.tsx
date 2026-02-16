import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LoginModal } from "@/components/LoginModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SettingsModal } from "@/components/SettingsModal";
import {
  Search,
  MessageSquare,
  FolderOpen,
  Box,
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
  HelpCircle,
  Trash2,
  Clock,
  Pin,
  PinOff,
  Edit2,
  FlaskConical,
  BookTemplate,
  TrendingUp,
  GraduationCap,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Conversation, MenuItem } from "@/types/conversation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// AuthTrace 진단 로깅 (환경 변수로 제어)
const AUTH_TRACE_ENABLED = import.meta.env.VITE_AUTH_TRACE === "true";

function authTrace(label: string, data: unknown) {
  if (AUTH_TRACE_ENABLED) {
    console.log(`[AuthTrace] ${label}:`, data);
  }
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [, navigate] = useLocation();
  const { user, logout, authStatus } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [builderBoxOpen, setBuilderBoxOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<number | null>(null);

  // Fetch conversation history
  const { data: historyData, isLoading: historyLoading } = trpc.zetaAI.getHistory.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Delete mutation
  const utils = trpc.useUtils();
  const deleteMutation = trpc.zetaAI.deleteHistory.useMutation({
    onSuccess: () => {
      toast.success("대화가 삭제되었습니다");
      utils.zetaAI.getHistory.invalidate();
      setDeleteDialogOpen(false);
      setDeletingChatId(null);
    },
    onError: (error) => {
      toast.error("삭제 실패: " + error.message);
    },
  });

  // Rename mutation
  const renameMutation = trpc.zetaAI.renamePrompt.useMutation({
    onSuccess: () => {
      toast.success("이름이 변경되었습니다");
      utils.zetaAI.getHistory.invalidate();
      setRenameDialogOpen(false);
      setRenamingChatId(null);
      setNewChatTitle("");
    },
    onError: (error) => {
      toast.error("이름 변경 실패: " + error.message);
    },
  });

  // Pin mutation
  const pinMutation = trpc.zetaAI.pinPrompt.useMutation({
    onSuccess: () => {
      utils.zetaAI.getHistory.invalidate();
    },
    onError: (error) => {
      toast.error("고정 실패: " + error.message);
    },
  });

  // Filter conversations based on search query
  const filteredChats = useMemo(() => {
    if (!historyData) return [];
    if (!searchQuery.trim()) return historyData;
    
    const query = searchQuery.toLowerCase();
    return historyData.filter((chat: Conversation) => 
      chat.originalQuestion?.toLowerCase().includes(query) ||
      chat.generatedPrompt?.toLowerCase().includes(query)
    );
  }, [historyData, searchQuery]);

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = trpc.project.getAll.useQuery(
    undefined,
    { enabled: !!user }
  );

  const menuItems = [
    { icon: MessageSquare, label: "채팅", path: "/history" },
    { icon: Box, label: "아티팩트", path: "#", disabled: true },
    { icon: FileText, label: "내 프롬프트", path: "/my-work" },
    { icon: FolderOpen, label: "프로젝트", path: "#", action: "projects" },
    { icon: BookTemplate, label: "템플릿", path: "/templates" },
    { icon: FlaskConical, label: "AI Playground", path: "/playground" },
    { icon: Workflow, label: "프롬프트 체인", path: "/chains" },
    { icon: GraduationCap, label: "학습 코스", path: "/courses" },
    { icon: TrendingUp, label: "나의 성장", path: "/dashboard" },
  ];

  const builderBoxItems = [
    { label: "Zeta Blog", path: "#" },
    { label: "Zeta Shorts", path: "#" },
    { label: "Zeta PPT", path: "#" },
    { label: "Zeta Foto", path: "#" },
    { label: "Zeta Docs", path: "#" },
    { label: "Zeta Web/App", path: "#" },
    { label: "Zeta UIUX", path: "#" },
  ];



  const handleNewChat = () => {
    navigate("/");
  };

  const handleMenuItemClick = (path: string, disabled?: boolean, action?: string) => {
    if (disabled) {
      toast.info("준비중. 진짜 곧 나와요!");
      return;
    }
    if (action === "projects") {
      navigate("/projects");
      return;
    }
    navigate(path);
  };

  const handleBuilderBoxClick = (label: string) => {
    // 토스트 알림 제거 - 고정 메시지로 대체
  };

  const handleDeleteClick = (chatId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingChatId(chatId);
    setDeleteDialogOpen(true);
  };

  const handleRenameClick = (chat: Conversation) => {
    setRenamingChatId(chat.id);
    setNewChatTitle(chat.originalQuestion || "");
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (!renamingChatId || !newChatTitle.trim()) return;
    renameMutation.mutate({ promptId: Number(renamingChatId), newName: newChatTitle.trim() });
  };

  const handlePinToggle = (chat: Conversation) => {
    pinMutation.mutate({ promptId: Number(chat.id), isPinned: !(chat as any).isPinned });
  };

  const handleDeleteConfirm = () => {
    if (deletingChatId) {
      deleteMutation.mutate({ promptId: Number(deletingChatId) });
    }
  };

  return (
    <>
      {/* Sidebar - Partial Collapse */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-200 z-40 flex flex-col",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Expanded Sidebar */}
        {isOpen && (
          <>
            {/* Header */}
            <div className="p-4 space-y-4">
              {/* Logo and Toggle */}
              <div className="flex items-center justify-between">
                <Link href="/">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src="/zetalab-logo.png"
                      alt="ZetaLab AI 프롬프트 생성 플랫폼 로고"
                      className="h-8 w-8 object-contain"
                      loading="eager"
                    />
                    <span className="font-semibold text-lg">ZetaLab</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* New Chat Button */}
              <Button
                onClick={handleNewChat}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                새 채팅
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-2 space-y-1">
              {menuItems.map((item: MenuItem) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => handleMenuItemClick(item.path, item.disabled, item.action)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-4 my-3 border-t border-border" />

            {/* Builder Box - Fixed Tab Area with Collapsible */}
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

            {/* Divider */}
            <div className="mx-4 mb-3 border-t border-border" />

            {/* Recent Chats - Independent Scroll Container */}
            <div className="flex-1 overflow-hidden px-2">
              <div className="text-xs font-medium text-muted-foreground px-2 mb-2">
                모든 작업
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-1 pb-4">
                  {historyLoading && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      불러오는 중...
                    </div>
                  )}
                  {!historyLoading && filteredChats.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      {searchQuery ? "검색 결과가 없습니다" : "대화 내역이 없습니다"}
                    </div>
                  )}
                  {!historyLoading && filteredChats.map((chat: Conversation) => (
                    <ContextMenu key={chat.id}>
                      <ContextMenuTrigger asChild>
                        <div
                          className="relative group"
                          onMouseEnter={() => setHoveredChatId(chat.id)}
                          onMouseLeave={() => setHoveredChatId(null)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-2 px-2 pr-8"
                            onClick={() => navigate(`/history/${chat.id}`)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {(chat as any).isPinned && (
                                <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                              )}
                              <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-sm truncate w-full">
                                  {chat.originalQuestion || "제목 없음"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </Button>
                          {hoveredChatId === chat.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteClick(chat.id, e)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => handleRenameClick(chat)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          이름 변경하기
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handlePinToggle(chat)}>
                          {(chat as any).isPinned ? (
                            <>
                              <PinOff className="h-4 w-4 mr-2" />
                              고정 해제하기
                            </>
                          ) : (
                            <>
                              <Pin className="h-4 w-4 mr-2" />
                              고정하기
                            </>
                          )}
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleDeleteClick(chat.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제하기
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
              {/* AuthTrace: userPanel render */}
              {(() => {
                authTrace("userPanel render", {
                  authStatus,
                  user: user ? { id: user.id, name: user.name } : null
                });
                return null;
              })()}

              {authStatus === "unknown" && (
                <div className="flex items-center gap-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              )}

              {authStatus === "guest" && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setShowLoginModal(true)}
                >
                  로그인
                </Button>
              )}

              {authStatus === "authed" && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center justify-center flex-1 min-w-0">
                        <span className="text-sm font-medium truncate w-full text-center">
                          {user.name || "사용자"}
                        </span>
                        <span className="text-xs text-muted-foreground">무료 요금제</span>
                      </div>
                      <ChevronUp className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-56">
                    <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowFeedbackModal(true)}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      피드백
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}

        {/* Collapsed Sidebar - Icon Only */}
        {!isOpen && (
          <div className="flex flex-col items-center py-4 space-y-4 h-full">
            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Icon Menu */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="h-10 w-10"
                title="새 채팅"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                title="검색"
              >
                <Search className="h-5 w-5" />
              </Button>
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handleMenuItemClick(item.path, item.disabled)}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>

            {/* User Icon at Bottom */}
            <div className="mt-auto">
              {authStatus === "unknown" && (
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              )}

              {authStatus === "guest" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setShowLoginModal(true)}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              {authStatus === "authed" && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-56">
                    <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowFeedbackModal(true)}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      피드백
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>대화를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 취소할 수 없습니다. 대화 내역과 생성된 프롬프트가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대화 이름 변경</DialogTitle>
            <DialogDescription>
              대화의 새로운 제목을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chat-title">제목</Label>
              <Input
                id="chat-title"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRenameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newChatTitle.trim()}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
    </>
  );
}
