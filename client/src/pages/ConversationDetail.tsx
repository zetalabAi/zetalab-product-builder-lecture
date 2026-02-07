import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { LoginModal } from "@/components/LoginModal";

export function ConversationDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, params] = useRoute("/history/:id");
  const [, navigate] = useLocation();
  const promptId = params?.id ? parseInt(params.id) : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setLoginModalOpen(true);
    }
  }, [isAuthenticated, authLoading]);

  // Fetch conversation detail
  const { data: conversation, isLoading } = trpc.zetaAI.getPromptById.useQuery(
    { promptId },
    { enabled: isAuthenticated && promptId > 0 }
  );

  // Update mutation
  const updateMutation = trpc.zetaAI.updatePrompt.useMutation({
    onSuccess: () => {
      toast.success("프롬프트가 수정되었습니다");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("수정 중 오류가 발생했습니다");
    },
  });

  useEffect(() => {
    if (conversation) {
      setEditedPrompt(conversation.editedPrompt || conversation.generatedPrompt || "");
    }
  }, [conversation]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다");
  };

  const handleSave = () => {
    if (promptId && editedPrompt.trim()) {
      updateMutation.mutate({
        promptId,
        editedPrompt: editedPrompt.trim(),
      });
    }
  };

  const handleCancel = () => {
    setEditedPrompt(conversation?.editedPrompt || conversation?.generatedPrompt || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-muted-foreground">대화를 찾을 수 없습니다</div>
        <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-6 md:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">대화 상세</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(conversation.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Original Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>원본 질문</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{conversation.originalQuestion}</p>
        </CardContent>
      </Card>

      {/* Intent Answers */}
      {conversation.intentAnswers && Object.keys(conversation.intentAnswers).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>수집된 정보</CardTitle>
            <CardDescription>Intent Clarification 단계에서 수집한 답변</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(conversation.intentAnswers).map(([question, answer]) => (
                <div key={question} className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{question}</p>
                  <p className="text-foreground">{answer as string}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Prompt */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>생성된 프롬프트</CardTitle>
              <CardDescription>
                {conversation.editedPrompt ? "수정된 버전" : "AI가 생성한 초고급 프롬프트"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(editedPrompt)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="프롬프트를 입력하세요..."
            />
          ) : (
            <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
              {editedPrompt}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Services */}
      {conversation.suggestedServices && conversation.suggestedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>추천 서비스</CardTitle>
            <CardDescription>이 프롬프트와 함께 사용하면 좋은 ZetaLab 서비스</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {conversation.suggestedServices.map((service: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.reason}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("준비중. 진짜 곧 나와요!")}
                  >
                    사용하기
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
