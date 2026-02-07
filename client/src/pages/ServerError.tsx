import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServerCrash, Home, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

export default function ServerError() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
              <ServerCrash className="relative h-16 w-16 text-destructive" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-foreground mb-4">500</h1>

          <h2 className="text-2xl font-semibold text-foreground mb-4">
            서버 오류가 발생했습니다
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            일시적인 서버 문제로 요청을 처리할 수 없습니다.
            <br />
            잠시 후 다시 시도해 주세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            <Button
              onClick={handleGoHome}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              홈으로
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              문제가 계속되면{" "}
              <a
                href="mailto:zetalabai@gmail.com"
                className="text-primary hover:underline"
              >
                zetalabai@gmail.com
              </a>
              으로 문의해 주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
