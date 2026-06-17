import { useState, useMemo } from 'react';
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
  LayoutGrid,
  School,
  ChevronDown,
} from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { TimelineItem, TargetProgram } from '../../types';
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

type CombinedTimelineItem = TimelineItem & { planId: string; schoolName: string; majorName: string };

export default function ApplicationTimeline() {
  const {
    applicationPlans,
    activePlanId,
    addApplicationPlan,
    deleteApplicationPlan,
    setActivePlan,
    updatePlanProgram,
    getActivePlanTimeline,
    updateActivePlanTimelineItem,
    addCustomTimelineItemToActivePlan,
    deleteTimelineItemFromActivePlan,
    getCombinedTimeline,
  } = usePortfolioStore();

  const [isSummaryView, setIsSummaryView] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [sortBy, setSortBy] = useState<'deadline' | 'importance'>('deadline');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  const [newPlan, setNewPlan] = useState({
    school: '',
    major: '',
    degree: '硕士',
    deadline: '',
  });

  const [editPlan, setEditPlan] = useState({
    school: '',
    major: '',
    degree: '',
    deadline: '',
  });

  const [newItem, setNewItem] = useState<Omit<TimelineItem, 'id' | 'isCustom'>>({
    title: '',
    description: '',
    category: 'other',
    deadline: '',
    completed: false,
    importance: 'medium',
    notes: '',
  });

  const activePlan = useMemo(
    () => applicationPlans.find((p) => p.id === activePlanId) || null,
    [applicationPlans, activePlanId]
  );

  const activeTimeline = useMemo(() => getActivePlanTimeline(), [getActivePlanTimeline]);
  const combinedTimeline = useMemo(() => getCombinedTimeline(), [getCombinedTimeline]);

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const currentItems = isSummaryView ? combinedTimeline : activeTimeline;

  const sortedItems = [...currentItems].sort((a, b) => {
    if (sortBy === 'deadline') {
      const daysA = getDaysRemaining(a.deadline) ?? 999;
      const daysB = getDaysRemaining(b.deadline) ?? 999;
      return daysA - daysB;
    } else {
      const importanceOrder = { high: 0, medium: 1, low: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    }
  });

  const calculateProgress = (items: TimelineItem[]) => {
    const completedCount = items.filter((i) => i.completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return { completedCount, totalCount, progress };
  };

  const progressInfo = useMemo(() => {
    if (isSummaryView) {
      return calculateProgress(combinedTimeline);
    }
    return calculateProgress(activeTimeline);
  }, [isSummaryView, combinedTimeline, activeTimeline]);

  const { completedCount, totalCount, progress } = progressInfo;

  const handleAddPlan = () => {
    if (newPlan.school.trim() && newPlan.major.trim() && newPlan.deadline) {
      const program: TargetProgram = {
        id: `prog-${Date.now()}`,
        school: newPlan.school,
        major: newPlan.major,
        degree: newPlan.degree,
        deadline: newPlan.deadline,
        requirements: [],
      };
      const newPlanData = addApplicationPlan(program);
      setActivePlan(newPlanData.id);
      setIsSummaryView(false);
      setNewPlan({ school: '', major: '', degree: '硕士', deadline: '' });
      setShowAddPlanModal(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('确定删除这个申请计划吗？所有相关的时间节点和提交项都将被删除。')) {
      deleteApplicationPlan(planId);
      setShowPlanDropdown(false);
    }
  };

  const handleOpenEditPlan = () => {
    if (activePlan) {
      setEditPlan({
        school: activePlan.program.school,
        major: activePlan.program.major,
        degree: activePlan.program.degree,
        deadline: activePlan.program.deadline,
      });
      setShowEditPlanModal(true);
    }
  };

  const handleSaveEditPlan = () => {
    if (activePlanId && editPlan.school.trim() && editPlan.major.trim() && editPlan.deadline) {
      updatePlanProgram(activePlanId, {
        school: editPlan.school,
        major: editPlan.major,
        degree: editPlan.degree,
        deadline: editPlan.deadline,
      });
      setShowEditPlanModal(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.title.trim() && !isSummaryView) {
      addCustomTimelineItemToActivePlan(newItem);
      setNewItem({
        title: '',
        description: '',
        category: 'other',
        deadline: '',
        completed: false,
        importance: 'medium',
        notes: '',
      });
      setShowAddItemModal(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingItem && !isSummaryView) {
      updateActivePlanTimelineItem(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    if (!isSummaryView) {
      updateActivePlanTimelineItem(id, { completed: !completed });
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!isSummaryView && confirm('确定删除这个时间节点吗？')) {
      deleteTimelineItemFromActivePlan(id);
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

  const handlePlanSelect = (planId: string | null) => {
    if (planId === null) {
      setIsSummaryView(true);
    } else {
      setIsSummaryView(false);
      setActivePlan(planId);
    }
    setShowPlanDropdown(false);
  };

  if (applicationPlans.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
            <School className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-700 mb-2">还没有申请计划</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            添加你的第一个申请计划，系统将自动生成申请时间线，帮你追踪关键节点
          </p>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加申请计划
          </button>
        </div>

        <Modal
          isOpen={showAddPlanModal}
          onClose={() => setShowAddPlanModal(false)}
          title="添加申请计划"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="input-label">学校名称 *</label>
              <input
                type="text"
                value={newPlan.school}
                onChange={(e) => setNewPlan({ ...newPlan, school: e.target.value })}
                className="input-field"
                placeholder="例如：罗德岛设计学院"
              />
            </div>
            <div>
              <label className="input-label">专业名称 *</label>
              <input
                type="text"
                value={newPlan.major}
                onChange={(e) => setNewPlan({ ...newPlan, major: e.target.value })}
                className="input-field"
                placeholder="例如：平面设计"
              />
            </div>
            <div>
              <label className="input-label">学位</label>
              <select
                value={newPlan.degree}
                onChange={(e) => setNewPlan({ ...newPlan, degree: e.target.value })}
                className="input-field"
              >
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>
            <div>
              <label className="input-label">申请截止日期 *</label>
              <input
                type="date"
                value={newPlan.deadline}
                onChange={(e) => setNewPlan({ ...newPlan, deadline: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-zinc-200">
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleAddPlan}
                disabled={!newPlan.school.trim() || !newPlan.major.trim() || !newPlan.deadline}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加计划
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">申请时间线</h2>
          <p className="text-sm text-zinc-500 mt-1">追踪申请关键节点，按优先级安排任务</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            添加计划
          </button>
          <button
            onClick={() => setShowAddItemModal(true)}
            disabled={isSummaryView}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSummaryView ? '请先选择一个计划' : '添加节点'}
          >
            <Plus className="w-4 h-4" />
            添加节点
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePlanSelect(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isSummaryView
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-zinc-100 text-zinc-600 border border-transparent hover:bg-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            汇总视图
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPlanDropdown(!showPlanDropdown)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                !isSummaryView && activePlan
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-zinc-100 text-zinc-600 border border-transparent hover:bg-zinc-200'
              }`}
            >
              <School className="w-4 h-4" />
              {!isSummaryView && activePlan
                ? `${activePlan.program.school} - ${activePlan.program.major}`
                : '选择计划'}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showPlanDropdown && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {applicationPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 flex items-center justify-between gap-2"
                  >
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-zinc-800 text-sm">{plan.program.school}</div>
                      <div className="text-xs text-zinc-500">
                        {plan.program.major} · {plan.program.degree}
                      </div>
                      {plan.program.deadline && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          截止：{new Date(plan.program.deadline).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 hover:bg-red-100 rounded text-zinc-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="删除计划"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isSummaryView && activePlan && (
            <span className="text-xs text-zinc-400 ml-auto">
              {activePlan.program.school} · {activePlan.program.major}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-700">
                {isSummaryView ? '整体进度' : `${activePlan?.program.school} 进度`}
              </span>
              {!isSummaryView && activePlan && (
                <button
                  onClick={handleOpenEditPlan}
                  className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-primary-600 transition-colors"
                  title="编辑计划信息"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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
          <p className="text-sm text-zinc-400 mt-1">
            {isSummaryView ? '添加申请计划后将自动生成时间节点' : '点击右上角按钮添加自定义节点'}
          </p>
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
              const combinedItem = item as CombinedTimelineItem;
              const hasSchoolInfo = isSummaryView && combinedItem.schoolName;

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
                            {!isSummaryView && (
                              <button
                                onClick={() => handleToggleComplete(item.id, item.completed)}
                                className="mt-0.5 flex-shrink-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-zinc-300 hover:text-primary-500 transition-colors" />
                                )}
                              </button>
                            )}
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
                          {!isSummaryView && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1.5 hover:bg-white rounded text-zinc-500 hover:text-primary-600 transition-colors"
                                title="编辑"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 hover:bg-red-100 rounded text-zinc-500 hover:text-red-600 transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {hasSchoolInfo && (
                          <div className="mb-2">
                            <span className="text-xs px-2 py-0.5 bg-white/60 text-zinc-600 rounded border border-zinc-200">
                              {combinedItem.schoolName} · {combinedItem.majorName}
                            </span>
                          </div>
                        )}

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

                        {!isSummaryView && item.notes && (
                          <div className="mt-3 pt-3 border-t border-zinc-200">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) =>
                                updateActivePlanTimelineItem(item.id, { notes: e.target.value })
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
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        title="添加申请计划"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">学校名称 *</label>
            <input
              type="text"
              value={newPlan.school}
              onChange={(e) => setNewPlan({ ...newPlan, school: e.target.value })}
              className="input-field"
              placeholder="例如：罗德岛设计学院"
            />
          </div>
          <div>
            <label className="input-label">专业名称 *</label>
            <input
              type="text"
              value={newPlan.major}
              onChange={(e) => setNewPlan({ ...newPlan, major: e.target.value })}
              className="input-field"
              placeholder="例如：平面设计"
            />
          </div>
          <div>
            <label className="input-label">学位</label>
            <select
              value={newPlan.degree}
              onChange={(e) => setNewPlan({ ...newPlan, degree: e.target.value })}
              className="input-field"
            >
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div>
            <label className="input-label">申请截止日期 *</label>
            <input
              type="date"
              value={newPlan.deadline}
              onChange={(e) => setNewPlan({ ...newPlan, deadline: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => setShowAddPlanModal(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              onClick={handleAddPlan}
              disabled={!newPlan.school.trim() || !newPlan.major.trim() || !newPlan.deadline}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加计划
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        title="编辑申请计划"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">学校名称 *</label>
            <input
              type="text"
              value={editPlan.school}
              onChange={(e) => setEditPlan({ ...editPlan, school: e.target.value })}
              className="input-field"
              placeholder="例如：罗德岛设计学院"
            />
          </div>
          <div>
            <label className="input-label">专业名称 *</label>
            <input
              type="text"
              value={editPlan.major}
              onChange={(e) => setEditPlan({ ...editPlan, major: e.target.value })}
              className="input-field"
              placeholder="例如：平面设计"
            />
          </div>
          <div>
            <label className="input-label">学位</label>
            <select
              value={editPlan.degree}
              onChange={(e) => setEditPlan({ ...editPlan, degree: e.target.value })}
              className="input-field"
            >
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div>
            <label className="input-label">申请截止日期 *</label>
            <input
              type="date"
              value={editPlan.deadline}
              onChange={(e) => setEditPlan({ ...editPlan, deadline: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <span className="font-medium">提示：</span>修改截止日期后，系统生成的时间节点会自动调整相对位置，你手动添加的自定义节点保持不变。
            </p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              onClick={() => setShowEditPlanModal(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              onClick={handleSaveEditPlan}
              disabled={!editPlan.school.trim() || !editPlan.major.trim() || !editPlan.deadline}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存修改
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
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
              onClick={() => setShowAddItemModal(false)}
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
