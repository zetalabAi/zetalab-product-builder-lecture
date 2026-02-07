import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, navigate] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;

  const [addingConversation, setAddingConversation] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string>("");

  const { data: project, isLoading: projectLoading } = trpc.project.getById.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const { data: conversations, isLoading: conversationsLoading } =
    trpc.project.getConversations.useQuery(
      { projectId },
      { enabled: projectId > 0 }
    );

  const { data: allConversations } = trpc.zetaAI.getHistory.useQuery();

  const utils = trpc.useUtils();

  const addConversationMutation = trpc.project.addConversation.useMutation({
    onSuccess: () => {
      toast.success("대화가 프로젝트에 추가되었습니다");
      utils.project.getConversations.invalidate({ projectId });
      setAddingConversation(false);
      setSelectedConversationId("");
    },
    onError: () => {
      toast.error("대화 추가 중 오류가 발생했습니다");
    },
  });

  const removeConversationMutation = trpc.project.removeConversation.useMutation({
    onSuccess: () => {
      toast.success("대화가 프로젝트에서 제거되었습니다");
      utils.project.getConversations.invalidate({ projectId });
    },
    onError: () => {
      toast.error("대화 제거 중 오류가 발생했습니다");
    },
  });

  const handleAddConversation = () => {
    if (!selectedConversationId) {
      toast.error("대화를 선택해주세요");
      return;
    }

    addConversationMutation.mutate({
      projectId,
      conversationId: parseInt(selectedConversationId),
    });
  };

  const handleRemoveConversation = (conversationId: number) => {
    removeConversationMutation.mutate({
      projectId,
      conversationId,
    });
  };

  // Filter out conversations that are already in the project
  const availableConversations = allConversations?.filter(
    (conv) => !conversations?.some((c) => c.id === conv.id)
  );

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-muted-foreground">프로젝트를 찾을 수 없습니다</div>
        <Button onClick={() => navigate("/projects")}>프로젝트 목록으로</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: project.color || "#3b82f6" }}
        >
          <span className="text-2xl">📁</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      {/* Add Conversation Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {!addingConversation ? (
            <Button onClick={() => setAddingConversation(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              대화 추가
            </Button>
          ) : (
            <div className="flex gap-2">
              <Select value={selectedConversationId} onValueChange={setSelectedConversationId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="대화를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {availableConversations && availableConversations.length > 0 ? (
                    availableConversations.map((conv) => (
                      <SelectItem key={conv.id} value={conv.id.toString()}>
                        {conv.originalQuestion || "제목 없음"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      추가할 대화가 없습니다
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAddConversation} disabled={addConversationMutation.isPending}>
                추가
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddingConversation(false);
                  setSelectedConversationId("");
                }}
              >
                취소
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          대화 목록 ({conversations?.length || 0})
        </h2>
        {conversationsLoading ? (
          <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv) => (
            <Card key={conv.id} className="group relative">
              <CardContent className="flex items-center justify-between py-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/history/${conv.id}`)}
                >
                  <p className="font-medium">{conv.originalQuestion || "제목 없음"}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(conv.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveConversation(conv.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              이 프로젝트에 대화가 없습니다
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
