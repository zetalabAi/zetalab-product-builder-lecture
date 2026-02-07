import { useState, useRef, useEffect } from "react";
import { X, Menu, Container, ChevronUp, ChevronDown, Plus, Search, MessageSquare, Box, FolderOpen, Trash2, Clock, Edit2, Pin, PinOff } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { getLoginUrl } from "@/const";
import { LoginModal } from "./LoginModal";
import { FeedbackModal } from "./FeedbackModal";
import { SettingsModal } from "./SettingsModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, authStatus } = useAuth();
  const [, navigate] = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // 브라우저 히스토리 관리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.drawer === 'open') {
        // Drawer가 열려있어야 함
        if (!isOpen) {
          // 현재 닫혀있으면 아무것도 하지 않음 (이미 닫힌 상태)
          return;
        }
      } else if (event.state?.settings === 'open') {
        // Settings 모달이 열려있어야 함
        if (!settingsModalOpen) {
          setSettingsModalOpen(true);
        }
      } else {
        // 메인 페이지로 돌아가야 함
        if (settingsModalOpen) {
          setSettingsModalOpen(false);
        }
        if (isOpen) {
          onClose();
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, settingsModalOpen, onClose]);
  
  // Drawer 열림/닫힘 시 히스토리 추가
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ drawer: 'open' }, '', window.location.href);
    }
  }, [isOpen]);
  const [builderBoxOpen, setBuilderBoxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Long press 관련 상태
  const [longPressMenuOpen, setLongPressMenuOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  // 이름 변경 다이얼로그
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  
  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 웹 버전과 동일한 메뉴 항목
  const menuItems = [
    { icon: MessageSquare, label: "채팅", path: "/history" },
    { icon: Box, label: "아티팩트", path: "#", disabled: true },
    { icon: FolderOpen, label: "프로젝트", path: "#", action: "projects" },
  ];

  // Builder Box 항목 - 웹 버전과 동일
  const builderBoxItems = [
    { label: "Zeta Blog", path: "#" },
    { label: "Zeta Shorts", path: "#" },
    { label: "Zeta PPT", path: "#" },
    { label: "Zeta Foto", path: "#" },
    { label: "Zeta Docs", path: "#" },
    { label: "Zeta Web/App", path: "#" },
    { label: "Zeta UIUX", path: "#" },
  ];

  // 대화 목록 가져오기
  const { data: history, isLoading: historyLoading } = trpc.zetaAI.searchHistory.useQuery({
    query: searchQuery,
  });

  const filteredChats = history || [];
  const utils = trpc.useUtils();

  // 이름 변경 mutation
  const renameMutation = trpc.zetaAI.renamePrompt.useMutation({
    onSuccess: () => {
      toast.success("대화 이름이 변경되었습니다");
      utils.zetaAI.searchHistory.invalidate();
      setRenameDialogOpen(false);
      setNewChatName("");
    },
    onError: () => {
      toast.error("이름 변경 중 오류가 발생했습니다");
    },
  });

  // 고정 mutation (TODO: 백엔드 구현 필요)
  const pinMutation = trpc.zetaAI.pinPrompt.useMutation({
    onSuccess: (data) => {
      if (data.isPinned) {
        toast.success("대화가 고정되었습니다");
      } else {
        toast.success("대화 고정이 해제되었습니다");
      }
      utils.zetaAI.searchHistory.invalidate();
    },
    onError: () => {
      toast.error("고정 처리 중 오류가 발생했습니다");
    },
  });

  // 삭제 mutation
  const deleteMutation = trpc.zetaAI.deletePrompt.useMutation({
    onSuccess: () => {
      toast.success("대화가 삭제되었습니다");
      utils.zetaAI.searchHistory.invalidate();
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("삭제 중 오류가 발생했습니다");
    },
  });

  const handleNewChat = () => {
    navigate("/");
    onClose();
  };

  const handleMenuItemClick = (path: string, disabled?: boolean, action?: string) => {
    if (disabled) {
      toast.info("준비중입니다");
      return;
    }

    if (action === "projects") {
      navigate("/projects");
      onClose();
      return;
    }

    navigate(path);
    onClose();
  };

  const handleBuilderBoxClick = (label: string) => {
    // 토스트 알림 제거 - 고정 메시지로 대체
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  // Long press 시작
  const handleTouchStart = (e: React.TouchEvent, chatId: number) => {
    const touch = e.touches[0];
    setMenuPosition({ x: touch.clientX, y: touch.clientY });
    setIsLongPressing(false);
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setSelectedChatId(chatId);
      setLongPressMenuOpen(true);
      
      // Haptic feedback (진동)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 0.5초 long press
  };

  // Long press 취소
  const handleTouchEnd = (chatId: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Long press가 아니었으면 일반 클릭 처리
    if (!isLongPressing) {
      navigate(`/history/${chatId}`);
      onClose();
    }
    
    setIsLongPressing(false);
  };

  // Long press 취소 (이동 시)
  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPressing(false);
  };

  // 이름 변경하기
  const handleRename = () => {
    const chat = filteredChats.find((c: any) => c.id === selectedChatId);
    if (chat) {
      setNewChatName(chat.originalQuestion || "");
      setRenameDialogOpen(true);
    }
    setLongPressMenuOpen(false);
  };

  // 고정하기
  const handlePin = () => {
    if (selectedChatId) {
      const chat = filteredChats.find((c: any) => c.id === selectedChatId) as any;
      pinMutation.mutate({ 
        promptId: selectedChatId,
        isPinned: !(chat?.isPinned || false)
      });
    }
    setLongPressMenuOpen(false);
  };

  // 삭제하기
  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setLongPressMenuOpen(false);
  };

  // 이름 변경 확인
  const handleRenameConfirm = () => {
    if (selectedChatId && newChatName.trim()) {
      renameMutation.mutate({
        promptId: selectedChatId,
        newName: newChatName.trim(),
      });
    }
  };

  // 삭제 확인
  const handleDeleteConfirm = () => {
    if (selectedChatId) {
      deleteMutation.mutate({ promptId: selectedChatId });
    }
  };

  const selectedChat = filteredChats.find((c: any) => c.id === selectedChatId) as any;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-manipulation">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Z</span>
              </div>
              <span className="font-semibold text-lg">ZetaLab</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewChat}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 채팅
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleMenuItemClick(item.path, item.disabled, item.action)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.disabled
                    ? "text-muted-foreground cursor-not-allowed"
                    : "hover:bg-secondary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-4 my-3 border-t border-border" />

          {/* Builder Box */}
          <div className="px-2 pb-3">
            <button
              onClick={() => setBuilderBoxOpen(!builderBoxOpen)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary rounded-lg transition-colors group"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
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
            </button>
            
            {builderBoxOpen && (
              <div className="mt-1 space-y-1 pl-3">
                {builderBoxItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleBuilderBoxClick(item.label)}
                    className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-muted-foreground cursor-default rounded-lg"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 mb-3 border-t border-border" />

          {/* 모든 작업 (대화 목록) */}
          <div className="flex-1 overflow-hidden px-2">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-2">
              모든 작업
            </div>
            <ScrollArea className="h-full [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                {!historyLoading && filteredChats.map((chat: any) => (
                  <div
                    key={chat.id}
                    className={`w-full rounded-lg transition-all ${
                      isLongPressing && selectedChatId === chat.id
                        ? "bg-secondary/80"
                        : ""
                    }`}
                    onTouchStart={(e) => handleTouchStart(e, chat.id)}
                    onTouchEnd={() => handleTouchEnd(chat.id)}
                    onTouchMove={handleTouchMove}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 px-2 touch-manipulation"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <div className="flex items-center gap-2 w-full">
                            {(chat as any).isPinned && (
                              <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">
                              {chat.originalQuestion || "제목 없음"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer - User Profile */}
        <div className="p-4 border-t border-border">
          {authStatus === "authed" && user ? (
            <button
              onClick={() => {
                setSettingsModalOpen(true);
                window.history.pushState({ settings: 'open', drawer: 'open' }, '', window.location.href);
              }}
              className="flex items-center gap-3 w-full hover:bg-secondary/50 rounded-lg p-2 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-medium">{user.name || "사용자"}</span>
                <span className="text-xs text-muted-foreground">무료 요금제</span>
              </div>
            </button>
          ) : null}
          
          {/* 피드백 버튼 */}
          {authStatus === "authed" && user && (
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              onClick={() => {
                setFeedbackModalOpen(true);
              }}
            >
              피드백
            </Button>
          )}
          
          {/* 로그인 버튼 */}
          {authStatus === "guest" && (
            <Button
              variant="default"
              className="w-full"
              onClick={handleLoginClick}
            >
              로그인
            </Button>
          )}
        </div>
      </div>

      {/* Long Press Menu (Context Menu) */}
      <Dialog open={longPressMenuOpen} onOpenChange={setLongPressMenuOpen}>
        <DialogContent className="sm:max-w-[280px]">
          <DialogHeader>
            <DialogTitle className="text-base">대화 관리</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleRename}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              이름 변경하기
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handlePin}
            >
              {selectedChat?.isPinned ? (
                <>
                  <PinOff className="mr-2 h-4 w-4" />
                  고정 해제하기
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-4 w-4" />
                  고정하기
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대화 이름 변경</DialogTitle>
            <DialogDescription>
              대화의 새로운 이름을 입력하세요
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="새 이름 입력"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!newChatName.trim()}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
      
      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
      />
    </>
  );
}
