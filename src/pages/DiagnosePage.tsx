import { useState, useEffect } from 'react';
import { Activity, Target, AlertCircle, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import ProgramSelector from '../components/diagnose/ProgramSelector';
import RadarChart from '../components/diagnose/RadarChart';
import AbilityGapList from '../components/diagnose/AbilityGapList';
import MaterialChecklist from '../components/diagnose/MaterialChecklist';
import type { AbilityGap } from '../types';
import { calculateOverallScore } from '../utils/diagnosis';

export default function DiagnosePage() {
  const {
    projects,
    background,
    targetProgram,
    generateDiagnosis,
  } = usePortfolioStore();

  const [abilityGaps, setAbilityGaps] = useState<AbilityGap[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (targetProgram) {
      const gaps = generateDiagnosis();
      setAbilityGaps(gaps);
      const score = calculateOverallScore(gaps);
      setOverallScore(score);
    } else {
      setAbilityGaps([]);
      setOverallScore(0);
    }
  }, [projects, background, targetProgram, generateDiagnosis]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { title: '竞争力强', desc: '你的作品集已经具备很强的竞争力，继续完善细节即可' };
    if (score >= 60) return { title: '有潜力', desc: '作品集整体不错，但仍有需要重点提升的地方' };
    if (score >= 40) return { title: '需要加强', desc: '建议重点提升核心能力维度，补充相关项目' };
    return { title: '差距较大', desc: '建议系统性地提升相关能力，补充更多相关经历' };
  };

  const scoreLabel = targetProgram ? getScoreLabel(overallScore) : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-900">作品集诊断</h1>
              <p className="text-sm text-zinc-500">根据目标院校要求，评估你的作品集竞争力</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ProgramSelector />

            {targetProgram && abilityGaps.length > 0 && (
              <div className="card p-6">
                <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-4">
                  综合评估
                </h2>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${overallScore * 2.64} 264`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#eab308' : '#ef4444'} />
                          <stop offset="100%" stopColor={overallScore >= 80 ? '#16a34a' : overallScore >= 60 ? '#ca8a04' : '#dc2626'} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}
                      </span>
                      <span className="text-xs text-zinc-500">/ 100</span>
                    </div>
                  </div>
                  {scoreLabel && (
                    <div>
                      <p className={`font-semibold ${getScoreColor(overallScore)}`}>
                        {scoreLabel.title}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        {scoreLabel.desc}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <h3 className="font-medium text-zinc-700 mb-3">基础数据</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-lg text-center">
                      <p className="text-xl font-bold text-primary-600">{projects.length}</p>
                      <p className="text-xs text-zinc-500">项目数量</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg text-center">
                      <p className="text-xl font-bold text-accent-600">{background.skills.length}</p>
                      <p className="text-xs text-zinc-500">技能数量</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg text-center">
                      <p className="text-xl font-bold text-green-600">
                        {projects.reduce((sum, p) => sum + p.processNodes.length, 0)}
                      </p>
                      <p className="text-xs text-zinc-500">过程节点</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg text-center">
                      <p className="text-xl font-bold text-purple-600">
                        {projects.reduce((sum, p) => sum + p.outputs.length, 0)}
                      </p>
                      <p className="text-xs text-zinc-500">作品产出</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {!targetProgram ? (
              <div className="card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-700 mb-2">选择目标专业</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  请先在左侧选择你想申请的院校和专业，系统将根据该专业的招生偏好
                  对你的作品集进行全面诊断和分析。
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <RadarChart gaps={abilityGaps} targetProgram={targetProgram} />
                  <AbilityGapList gaps={abilityGaps} />
                </div>

                <MaterialChecklist />

                {abilityGaps.length > 0 && (
                  <div className="card p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-2">
                          提升建议
                        </h3>
                        <div className="space-y-2 text-sm text-primary-800">
                          {abilityGaps
                            .filter(g => g.gap > 10)
                            .slice(0, 3)
                            .map((gap, index) => (
                              <div key={gap.dimension} className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium">{gap.dimension}：</p>
                                  <p className="text-primary-700">{gap.suggestions[0]}</p>
                                </div>
                              </div>
                            ))}
                          {abilityGaps.filter(g => g.gap > 10).length === 0 && (
                            <p className="font-medium text-green-700">
                              🎉 恭喜！你的各项能力已达到目标专业要求，继续保持！
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
