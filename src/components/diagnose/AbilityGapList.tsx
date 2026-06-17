import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import type { AbilityGap } from '../../types';

interface AbilityGapListProps {
  gaps: AbilityGap[];
}

export default function AbilityGapList({ gaps }: AbilityGapListProps) {
  if (gaps.length === 0) {
    return null;
  }

  const criticalGaps = gaps.filter((g) => g.gap > 15).sort((a, b) => b.gap - a.gap);
  const minorGaps = gaps.filter((g) => g.gap > 0 && g.gap <= 15);
  const metRequirements = gaps.filter((g) => g.gap === 0);

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-6">
      能力缺口提示
      </h2>

      {criticalGaps.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-red-700 font-medium mb-3">
            <AlertTriangle className="w-5 h-5" />
            需要重点提升
          </h3>
          <div className="space-y-4">
            {criticalGaps.map((gap) => (
              <div
                key={gap.dimension}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-900">
                    {gap.dimension}
                  </span>
                  <span className="text-red-600 font-medium">
                    缺口 {gap.gap} 分
                  </span>
                </div>
                <ul className="space-y-1">
                  {gap.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {minorGaps.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-amber-700 font-medium mb-3">
            <AlertTriangle className="w-5 h-5" />
            可以进一步加强
          </h3>
          <div className="space-y-3">
            {minorGaps.map((gap) => (
              <div
                key={gap.dimension}
                className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-amber-900">
                    {gap.dimension}
                  </span>
                  <span className="text-amber-600 text-sm">
                    缺口 {gap.gap} 分
                  </span>
                </div>
                <p className="text-sm text-amber-700">
                  {gap.suggestions[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {metRequirements.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-green-700 font-medium mb-3">
            <CheckCircle className="w-5 h-5" />
            已达到要求
          </h3>
          <div className="flex flex-wrap gap-2">
            {metRequirements.map((gap) => (
              <span
              key={gap.dimension}
              className="tag bg-green-100 text-green-700 border border-green-200"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {gap.dimension}
            </span>
            ))}
          </div>
        </div>
      )}

      {gaps.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>请先选择目标专业以获取能力分析</p>
        </div>
      )}
    </div>
  );
}
