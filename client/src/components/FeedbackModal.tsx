import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const email = "zetalabai@gmail.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("이메일이 복사되었습니다");
    } catch (error) {
      toast.error("이메일 복사에 실패했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>피드백</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            도움이 필요하거나 피드백이 있다면 이메일로 알려주세요
          </p>
          <Button
            variant="outline"
            className="w-full justify-center text-base font-medium"
            onClick={handleCopyEmail}
          >
            {email}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            이메일을 클릭하면 복사됩니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
