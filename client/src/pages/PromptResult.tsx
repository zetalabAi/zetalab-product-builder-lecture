import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Edit, Check, Sparkles, Home, Save, X } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export default function PromptResult() {
  const { isAuthenticated, loading } = useAuth();
  const { setRightPanelContent, setRightPanelOpen } = useLayout();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/result/:promptId");
  const promptId = params?.promptId || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
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
    onSuccess: () => {
      setShowSaveModal(false);
      setShowSaveSuccessModal(true);
      setAssetName("");
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

      // Set right panel content with the final prompt
      const displayPrompt = prompt.editedPrompt || prompt.generatedPrompt;
      setRightPanelContent(
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">최종 프롬프트</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-xs">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">복사</span>
                </>
              )}
            </Button>
          </div>
          <div className="rounded-lg bg-secondary/30 p-4 border border-border/40">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
              {displayPrompt}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            이 프롬프트를 복사하여 AI 서비스에서 바로 사용하세요.
          </p>
        </div>
      );
      setRightPanelOpen(true);
    }

    // Cleanup: close right panel when component unmounts
    return () => {
      setRightPanelContent(null);
      setRightPanelOpen(false);
    };
  }, [prompt, copied, setRightPanelContent, setRightPanelOpen]);

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

    // Parse intentAnswers if it's a string, otherwise use as-is
    let parsedIntentAnswers = undefined;
    if (prompt.intentAnswers) {
      if (typeof prompt.intentAnswers === 'string') {
        try {
          parsedIntentAnswers = JSON.parse(prompt.intentAnswers);
        } catch (e) {
          console.error('Failed to parse intentAnswers:', e);
        }
      } else {
        parsedIntentAnswers = prompt.intentAnswers;
      }
    }

    saveAssetMutation.mutate({
      name: assetName.trim(),
      originalQuestion: prompt.originalQuestion,
      generatedPrompt: prompt.generatedPrompt,
      editedPrompt: editedPrompt || prompt.editedPrompt || undefined,
      intentAnswers: parsedIntentAnswers,
      usedLLM: "claude-3-haiku-20240307",
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

  // Parse intent answers if available
  const intentAnswers = prompt.intentAnswers
    ? (() => {
        try {
          return JSON.parse(prompt.intentAnswers);
        } catch {
          return null;
        }
      })()
    : null;

  // Parse auto-generated answers if available
  const autoGeneratedAnswers = (prompt as any).autoGeneratedAnswers
    ? (() => {
        try {
          const parsed = typeof (prompt as any).autoGeneratedAnswers === 'string'
            ? JSON.parse((prompt as any).autoGeneratedAnswers)
            : (prompt as any).autoGeneratedAnswers;
          return parsed;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="min-h-screen p-4 custom-scrollbar">
      <div className="w-full max-w-3xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">프롬프트 생성 완료</h1>
          <p className="text-sm text-muted-foreground">
            우측 패널에서 최종 프롬프트를 확인하고 복사할 수 있습니다
          </p>
        </div>

        {/* Original Question */}
        <Card className="p-5 border-border/40">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">원본 질문</p>
            <p className="text-sm leading-relaxed">{prompt.originalQuestion}</p>
          </div>
        </Card>

        {/* Intent Answers Summary */}
        {intentAnswers && (
          <Card className="p-5 border-border/40">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Intent 분석 결과</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(intentAnswers).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground min-w-24">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* AI Auto-Generated Answers */}
        {autoGeneratedAnswers && Object.keys(autoGeneratedAnswers).length > 0 && (
          <Card className="p-5 border-yellow-200 dark:border-yellow-900 bg-yellow-50/30 dark:bg-yellow-950/20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  AI가 자동 생성한 답변
                </h3>
              </div>
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                질문에 답변하지 않은 항목은 AI가 일반적인 답변을 자동으로 생성했습니다. 필요시 프롬프트를 수정하여 원하는 내용으로 변경할 수 있습니다.
              </p>
              <div className="space-y-3 text-sm">
                {Object.entries(autoGeneratedAnswers).map(([question, answer]) => (
                  <div key={question} className="p-3 rounded-lg bg-white/50 dark:bg-gray-900/30 border border-yellow-200 dark:border-yellow-900">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-yellow-900 dark:text-yellow-100">{question}</span>
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">{String(answer)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Edit Prompt Section */}
        {isEditing ? (
          <Card className="p-5 border-border/40">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">프롬프트 수정</h3>
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[250px] font-mono text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedPrompt(prompt.editedPrompt || prompt.generatedPrompt);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  {updateMutation.isPending ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></div>
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  저장
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              프롬프트 수정
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generation Metadata */}
        <Card className="p-5 border-border/40 bg-secondary/20">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">생성 시간</span>
              <span className="font-medium">
                {new Date(prompt.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            {prompt.editedPrompt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">수정 여부</span>
                <span className="font-medium text-green-600">수정됨</span>
              </div>
            )}
          </div>
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
        </div>
      </div>

      {/* Save Asset Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프롬프트 저장</DialogTitle>
            <DialogDescription>
              프롬프트를 저장하고 나중에 다시 사용할 수 있습니다.
            </DialogDescription>
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

      {/* Save Success Modal */}
      <Dialog open={showSaveSuccessModal} onOpenChange={setShowSaveSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">프롬프트 저장완료!</DialogTitle>
            <DialogDescription className="text-center">
              프롬프트가 성공적으로 저장되었습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate("/my-work")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              프롬프트 저장함으로 가기
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSaveSuccessModal(false)}
              className="w-full"
            >
              머물기
            </Button>
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
