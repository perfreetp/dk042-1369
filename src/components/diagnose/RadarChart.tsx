import type { AbilityGap, TargetProgram } from '../../types';
import { calculateOverallScore } from '../../utils/diagnosis';

interface RadarChartProps {
  gaps: AbilityGap[];
  targetProgram: TargetProgram | null;
}

export default function RadarChart({ gaps, targetProgram }: RadarChartProps) {
  if (gaps.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-zinc-500">请先选择目标专业以生成能力分析</p>
      </div>
    );
  }

  const overallScore = calculateOverallScore(gaps);
  const maxValue = 100;

  const centerX = 150;
  const centerY = 150;
  const radius = 110;
  const sides = gaps.length;

  const calculatePoint = (index: number, value: number, scale = 1) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const r = (value / maxValue) * radius * scale;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const requiredPoints = gaps.map((_, i) => calculatePoint(i, maxValue));
  const currentPoints = gaps.map((g, i) => calculatePoint(i, g.currentLevel));

  const requiredPolygonPoints = requiredPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const currentPolygonPoints = currentPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const gridLines = [];
  for (let level = 0.25; level <= 1; level += 0.25) {
    const points = gaps
      .map((_, i) => {
        const point = calculatePoint(i, maxValue, level);
        return `${point.x},${point.y}`;
      })
      .join(' ');
    gridLines.push(
      <polygon
        key={`grid-${level}`}
        points={points}
        fill="none"
        stroke="#e4e4e7"
        strokeWidth="1"
      />
    );
  }

  const axisLines = gaps.map((_, i) => {
    const point = calculatePoint(i, maxValue);
    return (
      <line
        key={`axis-${i}`}
        x1={centerX}
        y1={centerY}
        x2={point.x}
        y2={point.y}
        stroke="#e4e4e7"
        strokeWidth="1"
      />
    );
  });

  const labels = gaps.map((gap, i) => {
    const point = calculatePoint(i, maxValue, 1.25);
    return (
      <text
        key={`label-${i}`}
        x={point.x}
        y={point.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-zinc-600 font-medium"
      >
        {gap.dimension}
      </text>
    );
  });

  const getScoreColor =
    overallScore >= 80
      ? 'text-green-600'
      : overallScore >= 60
      ? 'text-amber-600'
      : 'text-red-600';

  const getScoreBg =
    overallScore >= 80
      ? 'bg-green-50 border-green-200'
      : overallScore >= 60
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold text-zinc-900">
          能力分析图
        </h2>
        <div className={`px-4 py-2 rounded-lg border ${getScoreBg}`}>
          <span className="text-sm text-zinc-600">综合得分</span>
          <span className={`ml-2 text-2xl font-bold ${getScoreColor}`}>
            {overallScore}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <svg width="300" height="300" viewBox="0 0 300 300">
            <defs>
              <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {gridLines}
            {axisLines}
            <polygon
              points={requiredPolygonPoints}
              fill="#f4f4f5"
              stroke="#a1a1aa"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <polygon
              points={currentPolygonPoints}
              fill="url(#currentGradient)"
              stroke="#1e40af"
              strokeWidth="2"
            />
            {currentPoints.map((point, i) => (
              <circle
                key={`point-${i}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#1e40af"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            {labels}
          </svg>
        </div>

        <div className="flex-1 w-full">
          <h3 className="font-medium text-zinc-700 mb-3">能力明细</h3>
          <div className="space-y-3">
            {gaps.map((gap) => {
              const gapColor =
                gap.gap > 20
                  ? 'bg-red-500'
                  : gap.gap > 10
                  ? 'bg-amber-500'
                  : 'bg-green-500';
              return (
                <div key={gap.dimension}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-600">{gap.dimension}</span>
                    <span className="font-medium">
                      <span className="text-primary-700">{gap.currentLevel}</span>
                      <span className="text-zinc-400"> / </span>
                      <span className="text-zinc-600">{gap.requiredLevel}</span>
                    </span>
                  </div>
                  <div className="relative h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-zinc-300 rounded-full"
                      style={{ width: `${gap.requiredLevel}%` }}
                    />
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${gapColor}`}
                      style={{ width: `${gap.currentLevel}%` }}
                    />
                  </div>
                  {gap.gap > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      缺口 {gap.gap} 分
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
