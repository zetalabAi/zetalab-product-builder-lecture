import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Edit, Check, Sparkles, Home, Save, X } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export default function PromptResult() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/result/:promptId");
  const promptId = params?.promptId || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [assetName, setAssetName] = useState("");

  const { data: prompt, isLoading } = trpc.zetaAI.getPromptById.useQuery(
    { promptId },
    { enabled: isAuthenticated && !!promptId }
  );

  const updateMutation = trpc.zetaAI.updatePrompt.useMutation({
    onSuccess: () => {
      toast.success("프롬프트가 수정되었습니다");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("수정 중 오류가 발생했습니다: " + error.message);
    }
  });

  const saveAssetMutation = trpc.promptAsset.saveAsset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowSaveModal(false);
      setAssetName("");
      // My Work 페이지로 이동
      setTimeout(() => navigate("/my-work"), 1500);
    },
    onError: (error) => {
      toast.error("저장 중 오류가 발생했습니다: " + error.message);
    }
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setLoginModalOpen(true);
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (prompt) {
      setEditedPrompt(prompt.editedPrompt || prompt.generatedPrompt);
      // 저장 모달 열 때 기본 이름 설정
      setAssetName(prompt.originalQuestion.substring(0, 50) || "프롬프트");
    }
  }, [prompt]);

  const handleCopy = async () => {
    const textToCopy = prompt?.editedPrompt || prompt?.generatedPrompt || "";
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("프롬프트가 클립보드에 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("복사 중 오류가 발생했습니다");
    }
  };

  const handleSaveEdit = () => {
    if (!editedPrompt.trim()) {
      toast.error("프롬프트를 입력해주세요");
      return;
    }
    updateMutation.mutate({
      promptId,
      editedPrompt: editedPrompt.trim()
    });
  };

  const handleSaveAsset = () => {
    if (!assetName.trim()) {
      toast.error("프롬프트 이름을 입력해주세요");
      return;
    }

    if (!prompt) {
      toast.error("프롬프트 정보를 찾을 수 없습니다");
      return;
    }

    saveAssetMutation.mutate({
      name: assetName.trim(),
      originalQuestion: prompt.originalQuestion,
      generatedPrompt: prompt.generatedPrompt,
      editedPrompt: editedPrompt || prompt.editedPrompt || undefined,
      intentAnswers: prompt.intentAnswers ? JSON.parse(prompt.intentAnswers) : undefined,
      usedLLM: "gpt-4",
      suggestedServices: [
        { name: "Zeta Blog", reason: "블로그 포스트 작성에 최적화" },
        { name: "Zeta Shorts", reason: "짧은 형식의 콘텐츠 생성" },
        { name: "Zeta PPT", reason: "프레젠테이션 자료 생성" },
        { name: "Zeta Docs", reason: "문서 작성 및 정리" }
      ]
    });
  };

  const handleServiceClick = () => {
    setShowComingSoon(true);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">프롬프트를 찾을 수 없습니다</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const displayPrompt = prompt.editedPrompt || prompt.generatedPrompt;

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className="w-full max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">프롬프트 생성 완료</h1>
          <p className="text-muted-foreground">
            생성된 프롬프트를 복사하여 AI에게 바로 사용하세요
          </p>
        </div>

        {/* Generated Prompt Card */}
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">생성된 프롬프트</h2>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        복사
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedPrompt(prompt.editedPrompt || prompt.generatedPrompt);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  취소
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-secondary/50 p-4 rounded-lg">
                {displayPrompt}
              </pre>
            </div>
          )}
        </Card>

        {/* Original Question */}
        <Card className="p-4 bg-secondary/50 border-border">
          <p className="text-sm text-muted-foreground mb-1">원본 질문</p>
          <p className="text-sm">{prompt.originalQuestion}</p>
        </Card>

        {/* Recommended Services */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">추천 서비스</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Zeta Blog", "Zeta Shorts", "Zeta PPT", "Zeta Docs"].map((service) => (
              <button
                key={service}
                onClick={handleServiceClick}
                className="feature-card text-center p-4"
              >
                <p className="text-sm font-medium">{service}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
          <Button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            프롬프트 저장
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            새 프롬프트 생성
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/history")}
          >
            히스토리 보기
          </Button>
        </div>
      </div>

      {/* Save Asset Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프롬프트 저장</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">프롬프트 이름</label>
              <Input
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="예: 블로그 포스트 작성"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                이 프롬프트를 나중에 쉽게 찾을 수 있도록 이름을 지어주세요.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveModal(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleSaveAsset}
                disabled={saveAssetMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {saveAssetMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : null}
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">준비중. 진짜 곧 나와요!</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
