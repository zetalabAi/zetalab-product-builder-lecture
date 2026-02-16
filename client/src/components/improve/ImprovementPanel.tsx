import { useState } from 'react';
import { AlertCircle, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnalysisResult, ImprovementResult, Issue, IssueSeverity } from '../../types/improve';
import { ChangesList } from './ChangesList';
import { BeforeAfter } from './BeforeAfter';
import { ReTestButton } from './ReTestButton';

interface ImprovementPanelProps {
  originalPrompt: string;
  analysis: AnalysisResult;
  improvement: ImprovementResult;
  onApply: () => Promise<void>;
  onClose: () => void;
}

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  high: {
    label: '높음',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
  medium: {
    label: '중간',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  low: {
    label: '낮음',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
};

export function ImprovementPanel({
  originalPrompt,
  analysis,
  improvement,
  onApply,
  onClose,
}: ImprovementPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    issues: true,
    changes: true,
    comparison: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 심각도별 이슈 그룹화
  const groupedIssues = {
    high: analysis.issues.filter((i) => i.severity === 'high'),
    medium: analysis.issues.filter((i) => i.severity === 'medium'),
    low: analysis.issues.filter((i) => i.severity === 'low'),
  };

  const totalIssues = analysis.issues.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                프롬프트 자동 개선
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                AI가 분석한 개선 제안
                {improvement.confidence > 0 && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    신뢰도 {improvement.confidence}%
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalIssues}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">발견된 문제</div>
            </div>
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {improvement.changes.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">적용할 개선</div>
            </div>
            <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{improvement.estimatedImprovement}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">예상 개선율</div>
            </div>
          </div>

          {/* Issues Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('issues')}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  발견된 문제 ({totalIssues})
                </span>
              </div>
              {expandedSections.issues ? (
                <ChevronUp className="w-5 h-5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-500" />
              )}
            </button>

            {expandedSections.issues && (
              <div className="space-y-2 pl-4">
                {(['high', 'medium', 'low'] as IssueSeverity[]).map((severity) => {
                  const issues = groupedIssues[severity];
                  if (issues.length === 0) return null;

                  const config = SEVERITY_CONFIG[severity];

                  return (
                    <div key={severity} className="space-y-2">
                      <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {config.label} ({issues.length})
                      </div>
                      {issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            severity === 'high'
                              ? 'border-red-200 dark:border-red-800'
                              : severity === 'medium'
                              ? 'border-yellow-200 dark:border-yellow-800'
                              : 'border-blue-200 dark:border-blue-800'
                          } ${config.bgColor}`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}
                            >
                              {config.label}
                            </span>
                            <div className="flex-1">
                              <div className={`text-sm ${config.color}`}>
                                {issue.description}
                              </div>
                              {issue.location && (
                                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                                  📍 {issue.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Changes Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('changes')}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  적용할 개선사항 ({improvement.changes.length})
                </span>
              </div>
              {expandedSections.changes ? (
                <ChevronUp className="w-5 h-5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-500" />
              )}
            </button>

            {expandedSections.changes && (
              <div className="pl-4">
                <ChangesList changes={improvement.changes} />
              </div>
            )}
          </div>

          {/* Comparison Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('comparison')}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                전체 프롬프트 비교
              </span>
              {expandedSections.comparison ? (
                <ChevronUp className="w-5 h-5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-500" />
              )}
            </button>

            {expandedSections.comparison && (
              <div className="pl-4">
                <BeforeAfter before={originalPrompt} after={improvement.improvedPrompt} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            취소
          </button>
          <ReTestButton
            onReTest={onApply}
            estimatedImprovement={improvement.estimatedImprovement}
          />
        </div>
      </div>
    </div>
  );
}
