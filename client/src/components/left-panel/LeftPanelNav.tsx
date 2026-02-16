import { memo, useMemo } from "react";
import { Link } from "wouter";
import { Home, FileText, Container } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/conversation";

interface LeftPanelNavProps {
  leftPanelOpen: boolean;
}

export const LeftPanelNav = memo(function LeftPanelNav({
  leftPanelOpen,
}: LeftPanelNavProps) {
  const navItems = useMemo<MenuItem[]>(() => [
    { icon: Home, label: "홈", path: "/" },
    { icon: FileText, label: "내 프롬프트", path: "/my-work" },
    { icon: Container, label: "프로젝트", path: "/projects" },
  ], []);

  return (
    <nav className="px-2">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path} asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 mb-1",
              !leftPanelOpen && "justify-center px-0"
            )}
          >
            <item.icon className="h-4 w-4" />
            {leftPanelOpen && <span>{item.label}</span>}
          </Button>
        </Link>
      ))}
    </nav>
  );
});
