import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProcessViewProps {
  children: ReactNode;
  className?: string;
}

interface ProcessStepProps {
  title: string;
  description?: string;
  status?: "pending" | "active" | "complete";
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ProcessView({ children, className }: ProcessViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

export function ProcessStep({
  title,
  description,
  status = "pending",
  icon,
  children,
  className,
}: ProcessStepProps) {
  return (
    <div
      className={cn(
        "relative border border-border/40 rounded-lg p-5 transition-all duration-200",
        status === "active" && "border-primary/40 bg-primary/5",
        status === "complete" && "bg-secondary/20",
        status === "pending" && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200",
            status === "active" && "bg-primary text-primary-foreground",
            status === "complete" && "bg-green-600 text-white",
            status === "pending" && "bg-secondary text-muted-foreground"
          )}
        >
          {status === "active" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "complete" && icon}
          {status === "pending" && icon}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

interface ProcessProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function ProcessProgress({ current, total, className }: ProcessProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>진행 중</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
