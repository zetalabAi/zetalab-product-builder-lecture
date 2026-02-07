import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    id: number;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
  };
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [color, setColor] = useState(project?.color || "#3b82f6");

  const utils = trpc.useUtils();

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      toast.success("프로젝트가 생성되었습니다");
      utils.project.getAll.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error("프로젝트 생성 중 오류가 발생했습니다");
    },
  });

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("프로젝트가 수정되었습니다");
      utils.project.getAll.invalidate();
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast.error("프로젝트 수정 중 오류가 발생했습니다");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b82f6");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("프로젝트 이름을 입력해주세요");
      return;
    }

    if (project) {
      updateMutation.mutate({
        projectId: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!project) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "프로젝트 수정" : "새 프로젝트"}</DialogTitle>
          <DialogDescription>
            {project
              ? "프로젝트 정보를 수정하세요"
              : "대화를 정리할 새 프로젝트를 만드세요"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트 이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 블로그 콘텐츠"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="프로젝트에 대한 간단한 설명"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">색상</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {project ? "수정" : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
