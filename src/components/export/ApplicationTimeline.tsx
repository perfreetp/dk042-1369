import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Target,
  FileText,
  UserCheck,
  FolderCheck,
} from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { TimelineItem } from '../../types';
import Modal from '../ui/Modal';

const categoryConfig: Record<
  TimelineItem['category'],
  { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; label: string }
> = {
  deadline: {
    icon: <Target className="w-4 h-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    label: '截止日期',
  },
  portfolio: {
    icon: <FileText className="w-4 h-4" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-300',
    label: '作品集',
  },
  recommendation: {
    icon: <UserCheck className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    label: '推荐信',
  },
  material: {
    icon: <FolderCheck className="w-4 h-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    label: '材料准备',
  },
  other: {
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-zinc-600',
    bgColor: 'bg-zinc-50',
    borderColor: 'border-zinc-300',
    label: '其他',
  },
};

export default function ApplicationTimeline() {
  const {
    timelineItems,
    generateTimeline,
    updateTimelineItem,
    addCustomTimelineItem,
    deleteTimelineItem,
    targetProgram,
  } = usePortfolioStore();

  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'importance'>('deadline');

  useEffect(() => {
    if (timelineItems.length === 0 && targetProgram?.deadline) {
      generateTimeline();
    }
  }, [generateTimeline, timelineItems.length, targetProgram?.deadline]);

  const [newItem, setNewItem] = useState<Omit<TimelineItem, 'id' | 'isCustom'>>({
    title: '',
    description: '',
    category: 'other',
    deadline: '',
    completed: false,
    importance: 'medium',
    notes: '',
  });

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const sortedItems = [...timelineItems].sort((a, b) => {
    if (sortBy === 'deadline') {
      const daysA = getDaysRemaining(a.deadline) ?? 999;
      const daysB = getDaysRemaining(b.deadline) ?? 999;
      return daysA - daysB;
    } else {
      const importanceOrder = { high: 0, medium: 1, low: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    }
  });

  const completedCount = timelineItems.filter((i) => i.completed).length;
  const totalCount = timelineItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      addCustomTimelineItem(newItem);
      setNewItem({
        title: '',
        description: '',
        category: 'other',
        deadline: '',
        completed: false,
        importance: 'medium',
        notes: '',
      });
      setShowAddModal(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      updateTimelineItem(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const getStatusStyle = (days: number | null) => {
    if (days === null) return 'text-zinc-500';
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-red-600';
    if (days <= 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusLabel = (days: number | null, completed: boolean) => {
    if (completed) return { text: '已完成', color: 'text-green-600' };
    if (days === null) return { text: '未设置日期', color: 'text-zinc-500' };
    if (days < 0) return { text: `已逾期 ${Math.abs(days)} 天`, color: 'text-red-600' };
    if (days === 0) return { text: '今天截止', color: 'text-red-600' };
    if (days <= 7) return { text: `剩余 ${days} 天`, color: 'text-orange-600' };
    if (days <= 30) return { text: `剩余 ${days} 天`, color: 'text-amber-600' };
    return { text: `剩余 ${days} 天`, color: 'text-green-600' };
  };

  if (!targetProgram || !targetProgram.deadline) {
    return (
      <div className="card p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-700 mb-2">还未设置目标专业</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            请先在诊断页选择目标专业并设置截止日期，系统将自动生成申请时间线
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">申请时间线</h2>
          <p className="text-sm text-zinc-500 mt-1">追踪申请关键节点，按优先级安排任务</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          添加节点
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">整体进度</span>
            <span className="text-sm text-zinc-500">
              {completedCount} / {totalCount} 项
            </span>
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">排序：</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'deadline' | 'importance')}
            className="text-sm px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="deadline">按剩余时间</option>
            <option value="importance">按重要程度</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <div
            key={key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
          >
            {config.icon}
            <span>{config.label}</span>
          </div>
        ))}
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500">暂无时间节点</p>
          <p className="text-sm text-zinc-400 mt-1">点击右上角按钮添加自定义节点</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-zinc-200" />
          <div className="space-y-4">
            {sortedItems.map((item) => {
              const days = getDaysRemaining(item.deadline);
              const status = getStatusLabel(days, item.completed);
              const config = categoryConfig[item.category];
              const isEditing = editingItem?.id === item.id;

              return (
                <div key={item.id} className="relative pl-14">
                  <div
                    className={`absolute left-0 w-11 h-11 rounded-full flex items-center justify-center border-2 border-white shadow ${config.bgColor} ${config.borderColor}`}
                  >
                    <div className={config.color}>{config.icon}</div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : `${config.bgColor} bg-opacity-30 ${config.borderColor}`
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, title: e.target.value })
                          }
                          className="input-field text-sm"
                          placeholder="节点标题"
                        />
                        <textarea
                          value={editingItem.description}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, description: e.target.value })
                          }
                          className="input-field text-sm min-h-[60px]"
                          placeholder="详细描述"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={editingItem.category}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                category: e.target.value as TimelineItem['category'],
                              })
                            }
                            className="input-field text-sm"
                          >
                            {Object.entries(categoryConfig).map(([key, cfg]) => (
                              <option key={key} value={key}>
                                {cfg.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={editingItem.deadline}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, deadline: e.target.value })
                            }
                            className="input-field text-sm"
                          />
                        </div>
                        <select
                          value={editingItem.importance}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              importance: e.target.value as TimelineItem['importance'],
                            })
                          }
                          className="input-field text-sm"
                        >
                          <option value="high">高重要性</option>
                          <option value="medium">中重要性</option>
                          <option value="low">低重要性</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="btn-primary flex items-center gap-2 text-sm flex-1"
                          >
                            <Save className="w-4 h-4" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="btn-secondary flex items-center gap-2 text-sm flex-1"
                          >
                            <X className="w-4 h-4" />
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateTimelineItem(item.id, { completed: !item.completed })
                              }
                              className="mt-0.5 flex-shrink-0"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-zinc-300 hover:text-primary-500 transition-colors" />
                              )}
                            </button>
                            <h3
                              className={`font-medium ${
                                item.completed
                                  ? 'text-green-700 line-through'
                                  : 'text-zinc-900'
                              }`}
                            >
                              {item.title}
                            </h3>
                            {item.importance === 'high' && !item.completed && (
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            {item.isCustom && (
                              <span className="text-xs px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-full">
                                自定义
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 hover:bg-white rounded text-zinc-500 hover:text-primary-600 transition-colors"
                              title="编辑"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定删除这个时间节点吗？')) {
                                  deleteTimelineItem(item.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-100 rounded text-zinc-500 hover:text-red-600 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {item.description && (
                          <p
                            className={`text-sm mb-2 ${
                              item.completed ? 'text-green-600' : 'text-zinc-600'
                            }`}
                          >
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 flex-wrap">
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${status.color}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {status.text}
                          </span>
                          {item.deadline && (
                            <span className="flex items-center gap-1 text-xs text-zinc-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.deadline).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.importance === 'high'
                                ? 'bg-red-100 text-red-700'
                                : item.importance === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {item.importance === 'high'
                              ? '高'
                              : item.importance === 'medium'
                              ? '中'
                              : '低'}
                          </span>
                        </div>

                        {item.notes && (
                          <div className="mt-3 pt-3 border-t border-zinc-200">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) =>
                                updateTimelineItem(item.id, { notes: e.target.value })
                              }
                              placeholder="添加备注..."
                              className="w-full text-sm px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加时间节点"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">标题 *</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="input-field"
              placeholder="例如：准备作品集封面"
            />
          </div>
          <div>
            <label className="input-label">详细描述</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="详细说明这个节点需要完成的内容..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">分类</label>
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    category: e.target.value as TimelineItem['category'],
                  })
                }
                className="input-field"
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">截止日期</label>
              <input
                type="date"
                value={newItem.deadline}
                onChange={(e) => setNewItem({ ...newItem, deadline: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="input-label">重要程度</label>
            <select
              value={newItem.importance}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  importance: e.target.value as TimelineItem['importance'],
                })
              }
              className="input-field"
            >
              <option value="high">高 - 必须完成，影响申请结果</option>
              <option value="medium">中 - 重要但有调整空间</option>
              <option value="low">低 - 锦上添花的内容</option>
            </select>
          </div>
          <div>
            <label className="input-label">备注</label>
            <input
              type="text"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="input-field"
              placeholder="可选：添加相关链接、联系人等信息"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              onClick={handleAddItem}
              disabled={!newItem.title.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加节点
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
