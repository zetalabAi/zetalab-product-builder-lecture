import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function PromptVersions() {
  const { assetId } = useParams<{ assetId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [copiedVersionId, setCopiedVersionId] = useState<string | null>(null);

  // 버전 목록 조회 (원본 질문과 자산 메타데이터 포함)
  const { data: versions, isLoading: versionsLoading } = trpc.promptAsset.getAssetVersions.useQuery(
    { assetId: assetId ? parseInt(assetId) : 0 },
    { enabled: !!assetId && !!user }
  );

  // 자산 목록 조회 (헤더에 필요한 자산 정보)
  const { data: assets } = trpc.promptAsset.getMyAssets.useQuery(undefined, {
    enabled: !!user
  });

  const currentAsset = assets?.find(a => a.id === (assetId ? parseInt(assetId) : 0));

  const deleteAssetMutation = trpc.promptAsset.deleteAsset.useMutation({
    onSuccess: () => {
      navigate("/my-work");
    },
  });

  const toggleVersion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const copyToClipboard = async (text: string, versionId: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedVersionId(String(versionId));
    setTimeout(() => setCopiedVersionId(null), 2000);
  };

  const getSuccessStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-600">성공</Badge>;
      case -1:
        return <Badge className="bg-red-600">실패</Badge>;
      default:
        return <Badge className="bg-gray-600">미평가</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (versionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!versions || !currentAsset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">프롬프트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/my-work")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentAsset.name}</h1>
              <p className="text-sm text-muted-foreground">
                {versions?.length || 0}개 버전 · 마지막 사용: {currentAsset.lastUsedAt ? format(new Date(currentAsset.lastUsedAt), "yyyy년 MM월 dd일", { locale: ko }) : "사용 기록 없음"}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("이 프롬프트를 삭제하시겠습니까? 모든 버전이 함께 삭제됩니다.")) {
                deleteAssetMutation.mutate({ assetId: assetId ? parseInt(assetId) : 0 });
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* 원본 질문 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">원본 질문</h2>
          <p className="text-muted-foreground">{currentAsset.originalQuestion}</p>
        </Card>

        {/* 버전 목록 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">버전 히스토리</h2>
          {versions && versions.length > 0 ? (
            versions.map((version) => (
              <Card key={version.id} className="overflow-hidden">
                <button
                  onClick={() => toggleVersion(String(version.id))}
                  className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">v{version.versionNumber}</span>
                        {getSuccessStatusBadge(version.successStatus || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(version.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                      </p>

                    </div>
                  </div>
                  {expandedVersions.has(String(version.id)) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* 확장된 버전 상세 정보 */}
                {expandedVersions.has(String(version.id)) && (
                  <div className="border-t border-border px-6 py-6 space-y-6 bg-muted/30">
                    {/* 생성된 프롬프트 */}
                    <div>
                      <h3 className="font-semibold mb-3">생성된 프롬프트</h3>
                      <div className="bg-background rounded-lg p-4 relative group">
                        <pre className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                          {version.generatedPrompt}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(version.generatedPrompt || "", version.id as number)}
                        >
                          {copiedVersionId === String(version.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 수정된 프롬프트 */}
                    {version.editedPrompt && (
                      <div>
                        <h3 className="font-semibold mb-3">수정된 프롬프트</h3>
                        <div className="bg-background rounded-lg p-4 relative group">
                          <pre className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                            {version.editedPrompt}
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(version.editedPrompt || "", version.id as number)}
                          >
                            {copiedVersionId === String(version.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 메타데이터 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">사용된 LLM</p>
                        <p className="font-semibold">{version.usedLLM || "미지정"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">추천 서비스</p>
                      </div>
                    </div>

                    {/* 버전 복원 버튼 */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: 버전 복원 로직 구현
                        alert("이 버전을 현재 버전으로 복원하시겠습니까?");
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      이 버전으로 복원
                    </Button>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">버전이 없습니다.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
