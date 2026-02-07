import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 좌측: 저작권 */}
          <div className="text-sm text-muted-foreground">
            © 2026 ZetaLab. All rights reserved.
          </div>

          {/* 우측: 링크 */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              개인정보 보호 정책
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              이용약관
            </Link>
            <Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
              피드백
            </Link>
            <a 
              href="mailto:zetalabai@gmail.com" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              문의하기
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
