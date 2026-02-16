import { memo } from "react";
import { useLocation } from "wouter";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  leftPanelOpen: boolean;
  user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null } | null;
  onLoginClick: () => void;
  onLogout: () => Promise<void>;
}

export const UserProfile = memo(function UserProfile({
  leftPanelOpen,
  user,
  onLoginClick,
  onLogout,
}: UserProfileProps) {
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      await onLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="mt-auto border-t border-border/40 p-3">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                !leftPanelOpen && "justify-center px-0"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {user.displayName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {leftPanelOpen && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm truncate">
                    {user.displayName || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          onClick={onLoginClick}
          className={cn(
            "w-full justify-start gap-2",
            !leftPanelOpen && "justify-center px-0"
          )}
        >
          <User className="h-4 w-4" />
          {leftPanelOpen && <span>로그인</span>}
        </Button>
      )}
    </div>
  );
});
