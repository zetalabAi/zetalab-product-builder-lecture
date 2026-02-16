/**
 * ComparisonTable Component
 * 모델 비교 표
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparisonData, getModelById } from "@/types/playground";
import { Trophy, Zap, DollarSign } from "lucide-react";

interface ComparisonTableProps {
  comparison: ComparisonData;
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { fastest, cheapest, results } = comparison;

  const fastestModel = getModelById(fastest);
  const cheapestModel = getModelById(cheapest);

  if (results.length === 0) return null;

  // Filter out errors for comparison
  const successResults = results.filter(r => !r.error);

  if (successResults.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          모든 모델 실행이 실패했습니다
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        <h3 className="text-lg font-semibold">종합 비교</h3>
      </div>

      <div className="space-y-4">
        {/* Fastest */}
        {fastestModel && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  가장 빠른 응답
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {fastestModel.name}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {(results.find(r => r.modelId === fastest)!.duration / 1000).toFixed(2)}s
            </Badge>
          </div>
        )}

        {/* Cheapest */}
        {cheapestModel && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  가장 저렴한 비용
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {cheapestModel.name}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500 hover:bg-blue-600">
              ${results.find(r => r.modelId === cheapest)!.estimatedCost.toFixed(4)}
            </Badge>
          </div>
        )}

        {/* Comparison Table */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-medium">모델</th>
                  <th className="pb-2 font-medium text-right">속도</th>
                  <th className="pb-2 font-medium text-right">토큰</th>
                  <th className="pb-2 font-medium text-right">비용</th>
                </tr>
              </thead>
              <tbody>
                {successResults.map((result) => {
                  const model = getModelById(result.modelId);
                  if (!model) return null;

                  return (
                    <tr key={result.modelId} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{model.icon}</span>
                          <span className={`text-xs font-medium ${model.color}`}>
                            {model.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {(result.duration / 1000).toFixed(2)}s
                      </td>
                      <td className="py-3 text-right">
                        {result.tokenCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        ${result.estimatedCost.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
