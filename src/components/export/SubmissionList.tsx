import { CheckCircle2, Circle, Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useEffect } from 'react';

export default function SubmissionList() {
  const {
    targetProgram,
    submissionItems,
    generateSubmissionList,
    regenerateSubmissionList,
    updateSubmissionItem,
  } = usePortfolioStore();

  useEffect(() => {
    if (submissionItems.length === 0) {
      generateSubmissionList();
    }
  }, [generateSubmissionList, submissionItems.length]);

  const groupedItems = submissionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof submissionItems>);

  const toggleItem = (id: string) => {
    const item = submissionItems.find((i) => i.id === id);
    if (item) {
      updateSubmissionItem(id, { completed: !item.completed });
    }
  };

  const updateNotes = (id: string, notes: string) => {
    updateSubmissionItem(id, { notes });
  };

  const handleRegenerate = () => {
    regenerateSubmissionList();
  };

  const completedCount = submissionItems.filter((i) => i.completed).length;
  const totalCount = submissionItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const categoryIcons: Record<string, string> = {
    '作品集材料': '📁',
    '作品集': '📁',
    '院校研究': '🏫',
    '申请文书': '📝',
    '成绩证明': '📊',
    '语言成绩': '🌐',
    '推荐信': '💌',
    '其他材料': '📋',
  };

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline || deadline === '-') {
      return { status: 'none', label: '无截止日期' };
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return { status: 'none', label: '无截止日期' };
    }
    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'overdue', label: `已逾期 ${Math.abs(daysLeft)} 天` };
    if (daysLeft <= 7) return { status: 'urgent', label: `剩余 ${daysLeft} 天` };
    if (daysLeft <= 30) return { status: 'soon', label: `剩余 ${daysLeft} 天` };
    return { status: 'plenty', label: `剩余 ${daysLeft} 天` };
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">提交清单</h2>
          <p className="text-sm text-zinc-500 mt-1">申请材料准备清单，追踪每一项的完成状态</p>
        </div>
        <button
          onClick={handleRegenerate}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          重新生成
        </button>
      </div>

      {targetProgram && targetProgram.deadline && (
        <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent-600" />
            <div>
              <p className="text-sm text-accent-600 font-medium">申请截止日期</p>
              <p className="font-semibold text-accent-900">
                {new Date(targetProgram.deadline).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p
                className={`text-sm font-medium ${
                  getDeadlineStatus(targetProgram.deadline).status === 'overdue'
                    ? 'text-red-600'
                    : getDeadlineStatus(targetProgram.deadline).status === 'urgent'
                    ? 'text-orange-600'
                    : getDeadlineStatus(targetProgram.deadline).status === 'soon'
                    ? 'text-amber-600'
                    : 'text-green-600'
                }`}
              >
                {getDeadlineStatus(targetProgram.deadline).label}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">总体进度</span>
          <span className="text-sm text-zinc-500">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div
            key={category}
            className="border border-zinc-200 rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcons[category] || '📄'}</span>
                <h3 className="font-medium text-zinc-900">{category}</h3>
                <span className="ml-auto text-sm text-zinc-500">
                  {categoryItems.filter((i) => i.completed).length} /{' '}
                  {categoryItems.length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-zinc-100">
              {categoryItems.map((item) => {
                const deadlineStatus = getDeadlineStatus(item.deadline);
                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-300 hover:text-primary-500 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <p
                            className={`font-medium ${
                              item.completed
                                ? 'text-zinc-400 line-through'
                                : 'text-zinc-800'
                            }`}
                          >
                            {item.item}
                          </p>
                          {item.deadline &&
                            item.deadline !== '-' &&
                            deadlineStatus.status !== 'none' && (
                              <div
                                className={`flex items-center gap-1 flex-shrink-0 text-xs ${
                                  deadlineStatus.status === 'overdue'
                                    ? 'text-red-600'
                                    : deadlineStatus.status === 'urgent'
                                    ? 'text-orange-600'
                                    : deadlineStatus.status === 'soon'
                                    ? 'text-amber-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {deadlineStatus.status === 'overdue' ||
                                deadlineStatus.status === 'urgent' ? (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                                <span>{deadlineStatus.label}</span>
                              </div>
                            )}
                        </div>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          placeholder="添加备注..."
                          className="mt-2 w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submissionItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500">暂无提交项</p>
          <p className="text-sm text-zinc-400 mt-1">选择目标专业后将自动生成清单</p>
        </div>
      )}
    </div>
  );
}
