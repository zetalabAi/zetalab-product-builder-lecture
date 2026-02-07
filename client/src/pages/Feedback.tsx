import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Feedback() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("피드백 전송 완료", {
        description: "소중한 의견 감사합니다. 빠른 시일 내에 검토하겠습니다.",
      });
      setName("");
      setEmail("");
      setMessage("");
    },
    onError: (error) => {
      toast.error("전송 실패", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("입력 오류", {
        description: "모든 필드를 입력해 주세요.",
      });
      return;
    }

    if (message.length < 10) {
      toast.error("입력 오류", {
        description: "메시지는 최소 10자 이상 입력해 주세요.",
      });
      return;
    }

    submitFeedback.mutate({ name, email, message });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>피드백 보내기</CardTitle>
            <CardDescription>
              ZetaLab을 개선하는 데 도움이 되는 의견을 보내주세요. 버그 리포트, 기능 제안, 일반적인 피드백 모두 환영합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitFeedback.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitFeedback.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">메시지</Label>
                <Textarea
                  id="message"
                  placeholder="여기에 피드백을 작성해 주세요..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitFeedback.isPending}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  최소 10자 이상 입력해 주세요.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    전송 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    피드백 전송
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                또는 이메일로 직접 문의하실 수 있습니다:{" "}
                <a
                  href="mailto:zetalabai@gmail.com"
                  className="text-primary hover:underline"
                >
                  zetalabai@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
