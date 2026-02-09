import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Copy, Home, ChevronRight, X, Save } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export default function MyWork() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile' || breakpoint === 'tablet';

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const utils = trpc.useUtils();

  // 저장된 프롬프트 목록 조회
  const { data: assets = [], isLoading, refetch } = trpc.promptAsset.getMyAssets.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 버전 조회
  const { data: versions = [] } = trpc.promptAsset.getAssetVersions.useQuery(
    { assetId: selectedAssetId || "" },
    { enabled: selectedAssetId !== null && showVersions }
  );

  // 이름 수정
  const updateNameMutation = trpc.promptAsset.updateAssetName.useMutation({
    onSuccess: () => {
      toast.success("프롬프트 이름이 수정되었습니다");
      setEditingAssetId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("수정 중 오류가 발생했습니다: " + error.message);
    }
  });

  // 마지막 사용 시간 업데이트
  const markAsUsedMutation = trpc.promptAsset.markAsUsed.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  // 새 버전 생성
  const createNewVersionMutation = trpc.promptAsset.createNewVersion.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsEditingPrompt(false);
      setEditingPrompt("");
      refetch();
      // 버전 목록도 즉시 업데이트
      if (selectedAssetId) {
        utils.promptAsset.getAssetVersions.invalidate({ assetId: selectedAssetId });
      }
    },
    onError: (error) => {
      toast.error("버전 생성 중 오류가 발생했습니다: " + error.message);
    }
  });

  // 삭제
  const deleteAssetMutation = trpc.promptAsset.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("프롬프트가 삭제되었습니다");
      refetch();
    },
    onError: (error) => {
      toast.error("삭제 중 오류가 발생했습니다: " + error.message);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal open={!isAuthenticated} onOpenChange={setLoginModalOpen} />
      </>
    );
  }

  const handleSaveEdit = (assetId: string) => {
    if (!editingName.trim()) {
      toast.error("프롬프트 이름을 입력해주세요");
      return;
    }
    updateNameMutation.mutate({
      assetId,
      name: editingName.trim()
    });
  };

  const handleCopyPrompt = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    const textToCopy = version.editedPrompt || version.generatedPrompt;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("프롬프트가 클립보드에 복사되었습니다");
    } catch (error) {
      toast.error("복사 중 오류가 발생했습니다");
    }
  };

  const handleMarkAsUsed = (assetId: string) => {
    markAsUsedMutation.mutate({ assetId });
  };

  const handleDelete = (assetId: string) => {
    if (confirm("정말 이 프롬프트를 삭제하시겠습니까?")) {
      deleteAssetMutation.mutate({ assetId });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return d.toLocaleDateString("ko-KR");
  };

  const getSuccessIcon = (status: number) => {
    if (status === 1) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === -1) return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getSuccessLabel = (status: number) => {
    if (status === 1) return "성공";
    if (status === -1) return "실패";
    return "미평가";
  };

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  const handleSaveNewVersion = () => {
    createNewVersionMutation.mutate({
      assetId: selectedAssetId!,
      editedPrompt: editingPrompt
    });
  };

  const renderVersionDetail = () => {
    if (!selectedVersion) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">v{selectedVersion.versionNumber}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedVersionId(null);
              setIsEditingPrompt(false);
              setEditingPrompt("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* 원본 프롬프트 (위에 배치) */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">원본 프롬프트</p>
            <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-secondary/30">
              <pre className="text-sm whitespace-pre-wrap">{selectedVersion.generatedPrompt}</pre>
            </ScrollArea>
          </div>

          {/* 프롬프트 수정하기 */}
          {!isEditingPrompt && selectedVersion.editedPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">수정된 프롬프트 (v{selectedVersion.versionNumber})</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingPrompt(true);
                    setEditingPrompt(selectedVersion.editedPrompt || selectedVersion.generatedPrompt);
                  }}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  다시 수정
                </Button>
              </div>
              <ScrollArea className="h-[250px] w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">{selectedVersion.editedPrompt}</pre>
              </ScrollArea>
            </div>
          )}

          {(isEditingPrompt || !selectedVersion.editedPrompt) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">프롬프트 수정하기</p>
              <Textarea
                value={editingPrompt ?? (selectedVersion.editedPrompt || selectedVersion.generatedPrompt)}
                onChange={(e) => setEditingPrompt(e.target.value)}
                placeholder="프롬프트를 수정하세요..."
                className="min-h-[250px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNewVersion}
                  disabled={createNewVersionMutation.isPending}
                  className="flex-1"
                >
                  {createNewVersionMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  새 버전으로 저장
                </Button>
                {isEditingPrompt && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPrompt(false);
                      setEditingPrompt("");
                    }}
                  >
                    취소
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>생성일: {new Date(selectedVersion.createdAt).toLocaleString("ko-KR")}</span>
            <span>모델: {selectedVersion.usedLLM}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleCopyPrompt(selectedVersion.id)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              복사
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className={`w-full mx-auto py-8 ${!isMobile && selectedVersionId ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className={!isMobile && selectedVersionId ? 'grid grid-cols-2 gap-6' : ''}>
        {/* Left Column: Assets List */}
        <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">내 프롬프트</h1>
              <p className="text-muted-foreground mt-1">저장된 프롬프트를 관리하고 재사용하세요</p>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              새 프롬프트 생성
            </Button>
          </div>
        </div>

        {/* Assets List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">로딩 중...</p>
          </div>
        ) : assets.length === 0 ? (
          <Card className="p-12 text-center border-border">
            <p className="text-muted-foreground mb-4">저장된 프롬프트가 없습니다</p>
            <Button onClick={() => navigate("/")} className="bg-primary">
              첫 프롬프트 만들기
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <Card
                key={asset.id}
                className="p-4 border-border hover:border-primary/50 transition-colors"
              >
                <div className="space-y-4">
                  {/* Asset Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {editingAssetId === asset.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(asset.id)}
                            disabled={updateNameMutation.isPending}
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAssetId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-lg">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {asset.originalQuestion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAssetId(asset.id);
                          setEditingName(asset.name);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssetId(asset.id);
                          setShowVersions(!showVersions || selectedAssetId !== asset.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <ChevronRight className={`w-3 h-3 transition-transform ${showVersions && selectedAssetId === asset.id ? 'rotate-90' : ''}`} />
                        버전 ({asset.versionCount})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(asset.id)}
                        disabled={deleteAssetMutation.isPending}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Asset Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div>
                      생성일: {new Date(asset.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                  </div>

                  {/* Versions */}
                  {showVersions && selectedAssetId === asset.id && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">버전 목록</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowVersions(false);
                            setSelectedAssetId(null);
                          }}
                          className="h-8 text-xs"
                        >
                          접기
                        </Button>
                      </div>

                      {versions.length === 0 ? (
                        <div className="bg-secondary/30 p-6 rounded-lg text-center space-y-3">
                          <p className="text-sm text-muted-foreground">수정된 버전 없음</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2"
                          >
                            <Home className="w-3 h-3" />
                            홈으로
                          </Button>
                        </div>
                      ) : (
                        versions.map((version) => (
                          <div
                            key={version.id}
                            onClick={() => setSelectedVersionId(version.id)}
                            className="bg-secondary/50 hover:bg-secondary/70 p-3 rounded-lg space-y-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                v{version.versionNumber}
                              </span>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {version.notes && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <StickyNote className="w-3 h-3" />
                                    메모
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {version.editedPrompt || version.generatedPrompt}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString("ko-KR")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>

        {/* Right Panel - Web Only */}
        {!isMobile && selectedVersionId && (
          <div className="sticky top-8 h-fit">
            <Card className="p-6">
              {renderVersionDetail()}
            </Card>
          </div>
        )}
        </div>
      </div>

      {/* Mobile Modal */}
      {isMobile && (
        <Dialog open={!!selectedVersionId} onOpenChange={() => setSelectedVersionId(null)}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>버전 상세보기</DialogTitle>
              <DialogDescription>
                프롬프트 버전의 상세 정보와 수정 내역을 확인할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            {renderVersionDetail()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
