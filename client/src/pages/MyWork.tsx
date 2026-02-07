import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Copy, Home, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export default function MyWork() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // 저장된 프롬프트 목록 조회
  const { data: assets = [], isLoading, refetch } = trpc.promptAsset.getMyAssets.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 버전 조회
  const { data: versions = [] } = trpc.promptAsset.getAssetVersions.useQuery(
    { assetId: selectedAssetId || 0 },
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

  // 성공 여부 표시
  const markAsSuccessMutation = trpc.promptAsset.markAsSuccess.useMutation({
    onSuccess: () => {
      toast.success("상태가 업데이트되었습니다");
      refetch();
    },
    onError: (error) => {
      toast.error("업데이트 중 오류가 발생했습니다: " + error.message);
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

  const handleSaveEdit = (assetId: number) => {
    if (!editingName.trim()) {
      toast.error("프롬프트 이름을 입력해주세요");
      return;
    }
    updateNameMutation.mutate({
      assetId,
      name: editingName.trim()
    });
  };

  const handleCopyPrompt = async (versionId: number) => {
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

  const handleMarkAsUsed = (assetId: number) => {
    markAsUsedMutation.mutate({ assetId });
  };

  const handleDelete = (assetId: number) => {
    if (confirm("정말 이 프롬프트를 삭제하시겠습니까?")) {
      deleteAssetMutation.mutate({ assetId });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "사용 기록 없음";
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

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">내 작업</h1>
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
                        onClick={() => navigate(`/my-work/${asset.id}`)}
                        className="flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3" />
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(asset.lastUsedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getSuccessIcon(asset.successStatus)}
                      {getSuccessLabel(asset.successStatus)}
                    </div>
                    <div>
                      생성일: {new Date(asset.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                  </div>

                  {/* Versions */}
                  {showVersions && selectedAssetId === asset.id && (
                    <div className="pt-4 border-t border-border space-y-2">
                      <p className="text-sm font-medium">버전 목록</p>
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className="bg-secondary/50 p-3 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              v{version.versionNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyPrompt(version.id)}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Copy className="w-3 h-3" />
                                복사
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  markAsSuccessMutation.mutate({
                                    assetId: asset.id,
                                    status: version.successStatus === 1 ? 0 : 1
                                  })
                                }
                                disabled={markAsSuccessMutation.isPending}
                                className="flex items-center gap-1 text-xs"
                              >
                                {version.successStatus === 1 ? "성공 해제" : "성공 표시"}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {version.editedPrompt || version.generatedPrompt}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(version.createdAt).toLocaleString("ko-KR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
