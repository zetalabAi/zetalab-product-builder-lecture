import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, User, Shield, CreditCard, Zap, Link as LinkIcon, LogOut, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const settingsSections = [
  { id: "general", label: "일반" },
  { id: "account", label: "계정", icon: User },
  { id: "privacy", label: "개인정보보호", icon: Shield },
  { id: "billing", label: "결제", icon: CreditCard },
  { id: "features", label: "기능", icon: Zap, comingSoon: true },
  { id: "connectors", label: "커넥터", icon: LinkIcon, comingSoon: true },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

export function SettingsModal({ open, onOpenChange, defaultTab }: SettingsModalProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (defaultTab) {
        setActiveSection(defaultTab);
      } else {
        // 데스크톱에서는 기본적으로 general 탭 표시
        const isDesktop = window.innerWidth >= 768;
        if (isDesktop) {
          setActiveSection("general");
        } else {
          // 모바일에서는 null (메뉴 목록 표시)
          setActiveSection(null);
        }
      }
    }
  }, [open, defaultTab]);
  
  // 브라우저 뒤로가기 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!open) return;
      
      if (event.state?.settings === 'section' && event.state?.section) {
        // 섭션으로 돌아가기
        setActiveSection(event.state.section);
      } else if (event.state?.settings === 'open') {
        // 설정 메인 화면으로 돌아가기
        setActiveSection(null);
      } else if (event.state?.drawer === 'open') {
        // Drawer로 돌아가기 (모달 닫기)
        onOpenChange(false);
      } else {
        // 메인 페이지로 돌아가기
        onOpenChange(false);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open, onOpenChange]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("로그아웃되었습니다");
      onOpenChange(false);
      navigate("/");
      window.location.reload();
    },
  });

  const handleSectionClick = (sectionId: string, comingSoon?: boolean) => {
    if (comingSoon) {
      toast.info("준비중. 진짜 곷 나와요!");
      return;
    }
    setActiveSection(sectionId);
    // 섭션 전환 시 히스토리 추가
    window.history.pushState({ settings: 'section', section: sectionId, drawer: 'open' }, '', window.location.href);
  };

  const handleBack = () => {
    setActiveSection(null);
    // 뒤로가기 시 히스토리로 돌아가기
    window.history.back();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleClose = () => {
    onOpenChange(false);
    // 모달 닫기 시 히스토리 정리
    if (window.history.state?.settings) {
      window.history.back();
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">일반</h2>
              <p className="text-sm text-muted-foreground">
                모든 기기에서 로그아웃
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">모양</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">색상 모드</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        라이트 모드와 다크 모드 전환
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => theme === "dark" && toggleTheme?.()}
                      >
                        기본
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => theme === "light" && toggleTheme?.()}
                      >
                        다크
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-base font-medium mb-2">채팅 글꼴</h3>
                <p className="text-sm text-muted-foreground">
                  현재 Pretendard 폰트가 적용되어 있습니다
                </p>
              </div>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">계정</h2>
              <p className="text-sm text-muted-foreground">
                계정 정보 관리
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">계정 상세</h3>
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-base font-medium mb-4">계정 삭제</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
                </p>
                <Button
                  variant="destructive"
                  onClick={() => toast.info("준비중. 진짜 곧 나와요!")}
                >
                  계정 삭제
                </Button>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">개인정보보호</h2>
              <p className="text-sm text-muted-foreground">
                투명한 데이터 처리 방침을 지향합니다
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  ZetaLab 제품 사용 시 귀하의 정보가 어떻게 보호되는지 알아보시고, 개인정보 보호 센터 및 개인정보처리방침을 참조하세요.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); navigate("/privacy#security"); }}>
                    데이터 보호 방법
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); navigate("/privacy#purpose"); }}>
                    데이터 사용 방법
                  </Button>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-base font-medium mb-4">프라이버시 설정</h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">공유 채팅</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        ZetaLab가 응답을 생성할 때 대화적인 위치 메타데이터를 고려할 수 있도록 허용합니다.
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex items-start justify-between gap-4 py-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">위치 메타데이터</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        ZetaLab가 응답을 생성할 때 대략적인 위치 정보를 사용할 수 있습니다.
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Separator className="bg-border" />

                  <div className="flex items-start justify-between gap-4 py-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">ZetaLab 개선에 도움주기</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        채팅 및 코딩 세션을 AI 모델 훈련 및 개선에 사용하는 것을 허용합니다.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-base font-medium mb-2">공유 채팅</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  채팅 내에서 컨텐츠를 공유할 수 있습니다
                </p>
                <Button variant="outline" size="sm">
                  관리
                </Button>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">결제</h2>
              <p className="text-sm text-muted-foreground">
                요금제 및 결제 정보 관리
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">무료 요금제</h3>
                <div className="p-4 border border-border rounded-lg mb-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">Z</span>
                    </div>
                    <div>
                      <p className="font-medium">ZetaLab 체험하기</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>웹, iOS, Android에서 ZetaLab와 채팅</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>프롬프트 작성 및 편집 무제한</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>텍스트 분석 및 이미지 업로드</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>코드 생성 및 데이터 시각화</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>채팅 내에서 웹 검색 결과 활용</span>
                    </li>
                  </ul>
                </div>
                <Button>요금제 업그레이드</Button>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-base font-medium mb-4">청구서</h3>
                <div className="p-8 text-center border border-border rounded-lg bg-secondary/20">
                  <p className="text-sm text-muted-foreground">결제 내역이 없습니다</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 모바일 Settings Home 화면
  const renderMobileHome = () => (
    <div className="h-full flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-semibold">설정</h1>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-lg">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex-1 bg-secondary/50 rounded-lg p-2 text-center">
              <p className="text-muted-foreground">플랜</p>
              <p className="font-medium">무료</p>
            </div>
            <div className="flex-1 bg-secondary/50 rounded-lg p-2 text-center">
              <p className="text-muted-foreground">크레딧</p>
              <p className="font-medium">-</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-1">
          {settingsSections.slice(1).map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id, section.comingSoon)}
                className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors active:scale-[0.98]"
                style={{ minHeight: "44px" }}
              >
                {Icon && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                )}
                <span className="flex-1 text-left font-medium">{section.label}</span>
                {section.comingSoon && (
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    준비중
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-colors active:scale-[0.98] font-medium"
          style={{ minHeight: "44px" }}
        >
          <LogOut className="w-5 h-5" />
          <span>{logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}</span>
        </button>
      </div>
    </div>
  );

  // 모바일 세부 설정 화면
  const renderMobileDetail = () => (
    <div className="h-full flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {settingsSections.find((s) => s.id === activeSection)?.label}
          </h1>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {renderSectionContent()}
      </div>
    </div>
  );

  // 데스크톱 레이아웃
  const renderDesktopLayout = () => (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r border-border p-4 custom-scrollbar overflow-y-auto">
        <div className="flex items-center justify-between mb-6 px-2">
          <h1 className="text-xl font-semibold">설정</h1>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === section.id
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
              onClick={() => handleSectionClick(section.id, section.comingSoon)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto p-8 px-6 md:px-8">{renderSectionContent()}</div>
      </main>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] md:max-w-5xl md:h-[85vh] p-0 gap-0" showCloseButton={false}>
        {/* 모바일 (768px 이하) */}
        <div className="md:hidden h-full">
          {activeSection ? renderMobileDetail() : renderMobileHome()}
        </div>

        {/* 데스크톱 (768px 이상) */}
        <div className="hidden md:block h-full">{renderDesktopLayout()}</div>
      </DialogContent>
    </Dialog>
  );
}
