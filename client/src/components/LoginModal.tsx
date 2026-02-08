import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/firebase";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // signInWithGoogle now uses redirect, so this will redirect the page
      await signInWithGoogle();
      // Note: Code after this won't execute as the page will redirect
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "로그인에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success("회원가입 성공!");
      } else {
        await signInWithEmail(email, password);
        toast.success("로그인 성공!");
      }

      // Refresh user data
      await utils.auth.me.invalidate();

      // Close modal
      onOpenChange(false);

      // Reset form
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Auth failed:", error);

      // Firebase 에러 메시지를 한글로 변환
      let errorMessage = "인증에 실패했습니다.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "유효하지 않은 이메일 형식입니다.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "존재하지 않는 사용자입니다.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "잘못된 비밀번호입니다.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "비밀번호가 너무 약합니다. 6자 이상 입력해주세요.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            {isSignUp ? "회원가입" : "로그인"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            ZetaLab에 오신 것을 환영합니다
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Google 로그인 */}
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google로 계속하기
          </Button>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* 이메일/비밀번호 로그인 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 6자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                isSignUp ? "회원가입" : "로그인"
              )}
            </Button>
          </form>

          {/* 회원가입/로그인 전환 */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail("");
                setPassword("");
              }}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            계속 진행하면{" "}
            <a href="/terms" className="underline hover:text-foreground">
              서비스 약관
            </a>
            {" "}및{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              개인정보 보호정책
            </a>
            에 동의하신 것으로 간주됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
