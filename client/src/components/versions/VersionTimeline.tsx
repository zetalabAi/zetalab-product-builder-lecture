/**
 * VersionTimeline Component
 * 타임라인 형태로 버전 히스토리 표시
 */

import { PromptVersion } from "@/types/versions";
import { VersionCard } from "./VersionCard";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface VersionTimelineProps {
  versions: PromptVersion[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onVersionSelect?: (version: PromptVersion) => void;
  onVersionRevert?: (version: PromptVersion) => void;
  onVersionCompare?: (version: PromptVersion) => void;
}

export function VersionTimeline({
  versions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onVersionSelect,
  onVersionRevert,
  onVersionCompare
}: VersionTimelineProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleVersionSelect = (version: PromptVersion) => {
    setSelectedVersion(version.id);
    onVersionSelect?.(version);
  };

  if (isLoading && versions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          아직 버전이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-5 top-8 bottom-8 w-px bg-border" />

        {/* Version cards */}
        {versions.map((version, idx) => (
          <div key={version.id} className="relative pl-12">
            {/* Timeline dot */}
            <div
              className={`
                absolute left-3 top-4 w-4 h-4 rounded-full border-2
                ${idx === 0
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-background border-border'
                }
              `}
            />

            {/* Version card */}
            <div className="group">
              <VersionCard
                version={version}
                isLatest={idx === 0}
                onSelect={() => handleVersionSelect(version)}
                onRevert={() => onVersionRevert?.(version)}
                onCompare={() => onVersionCompare?.(version)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              "더 보기"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
