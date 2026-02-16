/**
 * DiffViewer Component
 * 두 버전 간의 차이점을 시각화
 */

import { DiffResult } from "@/types/versions";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  diff: DiffResult[];
  mode?: "word" | "line";
}

export function DiffViewer({ diff, mode = "word" }: DiffViewerProps) {
  if (mode === "line") {
    return (
      <div className="font-mono text-sm overflow-x-auto">
        {diff.map((result, idx) => (
          <div
            key={idx}
            className={cn(
              "py-1 px-3",
              result.type === "added" && "bg-green-100 dark:bg-green-950/30 text-green-900 dark:text-green-100",
              result.type === "removed" && "bg-red-100 dark:bg-red-950/30 text-red-900 dark:text-red-100 line-through",
              result.type === "unchanged" && "bg-transparent"
            )}
          >
            <span className="inline-block w-8 text-muted-foreground select-none">
              {result.type === "added" && "+"}
              {result.type === "removed" && "-"}
              {result.type === "unchanged" && " "}
            </span>
            {result.value}
          </div>
        ))}
      </div>
    );
  }

  // Word mode (inline)
  return (
    <div className="font-sans text-sm whitespace-pre-wrap break-words">
      {diff.map((result, idx) => {
        if (result.type === "unchanged") {
          return <span key={idx}>{result.value}</span>;
        }

        if (result.type === "added") {
          return (
            <span
              key={idx}
              className="bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-200 px-0.5 rounded"
            >
              {result.value}
            </span>
          );
        }

        if (result.type === "removed") {
          return (
            <span
              key={idx}
              className="bg-red-200 dark:bg-red-900/40 text-red-900 dark:text-red-200 px-0.5 rounded line-through"
            >
              {result.value}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}
