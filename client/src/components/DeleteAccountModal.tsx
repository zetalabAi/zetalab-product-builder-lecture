import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  userEmail?: string | null;
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const CONFIRM_TEXT = "계정 삭제";

  const isConfirmValid = confirmText === CONFIRM_TEXT;

  const handleConfirm = () => {
    if (isConfirmValid && !isDeleting) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            계정 삭제 확인
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="text-sm">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>다음 데이터가 영구적으로 삭제됩니다:</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>모든 프롬프트 및 대화 기록</li>
              <li>저장된 프롬프트 자산 및 버전</li>
              <li>프로젝트 및 체인</li>
              <li>학습 진행도 및 코스 데이터</li>
              <li>계정 정보 ({userEmail})</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="confirm-text">
            계속하려면 <span className="font-mono font-bold">{CONFIRM_TEXT}</span>를
            입력하세요
          </Label>
          <Input
            id="confirm-text"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_TEXT}
            disabled={isDeleting}
            className="font-mono"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              "계정 영구 삭제"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
