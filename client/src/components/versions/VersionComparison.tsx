/**
 * VersionComparison Component
 * 두 버전을 비교하는 UI
 */

import { VersionComparison as VersionComparisonType } from "@/types/versions";
import { calculateDiff, calculateLineDiff } from "@/utils/diff";
import { DiffViewer } from "./DiffViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface VersionComparisonProps {
  comparison: VersionComparisonType;
  onBack?: () => void;
}

export function VersionComparison({
  comparison,
  onBack
}: VersionComparisonProps) {
  const { oldVersion, newVersion } = comparison;

  // Calculate diffs
  const wordDiff = calculateDiff(oldVersion.prompt, newVersion.prompt);
  const lineDiff = calculateLineDiff(oldVersion.prompt, newVersion.prompt);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h3 className="text-lg font-semibold">버전 비교</h3>
          <p className="text-sm text-muted-foreground">
            v{oldVersion.version} → v{newVersion.version}
          </p>
        </div>
      </div>

      {/* Version Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">v{oldVersion.version}</Badge>
            <span className="text-xs text-muted-foreground">이전 버전</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(oldVersion.createdAt, {
                addSuffix: true,
                locale: ko
              })}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Badge>v{newVersion.version}</Badge>
            <span className="text-xs text-muted-foreground">새 버전</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(newVersion.createdAt, {
                addSuffix: true,
                locale: ko
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      {newVersion.changes.length > 0 && (
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">변경사항</span>
          </div>
          <ul className="space-y-1">
            {newVersion.changes.map((change, idx) => (
              <li key={idx} className="text-sm text-foreground">
                • {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diff View Tabs */}
      <Tabs defaultValue="word" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="word">단어 비교</TabsTrigger>
          <TabsTrigger value="line">줄 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="word" className="mt-4">
          <div className="p-4 rounded-lg border bg-card">
            <DiffViewer diff={wordDiff} mode="word" />
          </div>
        </TabsContent>

        <TabsContent value="line" className="mt-4">
          <div className="p-4 rounded-lg border bg-card">
            <DiffViewer diff={lineDiff} mode="line" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900/40 rounded"></div>
          <span>추가됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 dark:bg-red-900/40 rounded"></div>
          <span>제거됨</span>
        </div>
      </div>
    </div>
  );
}
