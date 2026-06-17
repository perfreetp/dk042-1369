import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  ChevronDown,
  LayoutGrid,
  School,
  Globe,
} from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { SubmissionItem } from '../../types';
import Modal from '../ui/Modal';

const defaultCategories = [
  '作品集材料',
  '作品集',
  '院校研究',
  '申请文书',
  '成绩证明',
  '语言成绩',
  '推荐信',
  '其他材料',
];

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

type CombinedSubmissionItem = SubmissionItem & {
  planId?: string;
  schoolName?: string;
  majorName?: string;
};

export default function SubmissionList() {
  const {
    applicationPlans,
    activePlanId,
    setActivePlan,
    getActivePlanSubmissions,
    updateActivePlanSubmissionItem,
    addCustomSubmissionItemToActivePlan,
    deleteSubmissionItemFromActivePlan,
    getCombinedSubmissions,
    regenerateActivePlanSubmissions,
  } = usePortfolioStore();

  const [isSummaryView, setIsSummaryView] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState<string | null>(null);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  const [newItem, setNewItem] = useState<Omit<SubmissionItem, 'id' | 'isCustom'>>({
    category: '其他材料',
    item: '',
    deadline: '',
    completed: false,
    notes: '',
  });
  const [newItemIsPublic, setNewItemIsPublic] = useState(false);

  const [editForm, setEditForm] = useState<Partial<SubmissionItem>>({});

  const activePlan = useMemo(
    () => applicationPlans.find((p) => p.id === activePlanId) || null,
    [applicationPlans, activePlanId]
  );

  const activeSubmissions = useMemo(
    () => getActivePlanSubmissions(),
    [getActivePlanSubmissions]
  );

  const combinedSubmissions = useMemo(
    () => getCombinedSubmissions(),
    [getCombinedSubmissions]
  );

  const currentItems = isSummaryView ? combinedSubmissions : activeSubmissions;

  const groupedItems = currentItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof currentItems>);

  const toggleItem = (id: string) => {
    const item = currentItems.find((i) => i.id === id);
    if (item && !isSummaryView) {
      updateActivePlanSubmissionItem(id, { completed: !item.completed });
    }
  };

  const updateNotes = (id: string, notes: string) => {
    if (!isSummaryView) {
      updateActivePlanSubmissionItem(id, { notes });
    }
  };

  const handleAddItem = () => {
    if (newItem.item.trim() && !isSummaryView) {
      addCustomSubmissionItemToActivePlan(newItem, newItemIsPublic);
      setNewItem({
        category: '其他材料',
        item: '',
        deadline: '',
        completed: false,
        notes: '',
      });
      setNewItemIsPublic(false);
      setShowAddModal(false);
    }
  };

  const startEdit = (item: SubmissionItem) => {
    if (isSummaryView) return;
    setEditingId(item.id);
    setEditForm({
      category: item.category,
      item: item.item,
      deadline: item.deadline,
    });
    setShowCategoryMenu(null);
  };

  const saveEdit = (id: string) => {
    updateActivePlanSubmissionItem(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setShowCategoryMenu(null);
  };

  const handleDelete = (id: string, isCustom: boolean | undefined) => {
    if (isSummaryView) return;
    if (isCustom) {
      if (confirm('确定删除这个自定义项吗？')) {
        deleteSubmissionItemFromActivePlan(id);
      }
    } else {
      if (confirm('系统生成的项删除后可通过「重新生成」恢复。确定删除吗？')) {
        deleteSubmissionItemFromActivePlan(id);
      }
    }
  };

  const handleRegenerate = () => {
    if (isSummaryView) return;
    if (
      activeSubmissions.some((i) => i.isCustom) ||
      activeSubmissions.some((i) => i.completed || i.notes)
    ) {
      if (
        !confirm(
          '重新生成将保留你已勾选的完成状态、备注和自定义项，但会恢复系统默认项的分类和截止日期。是否继续？'
        )
      ) {
        return;
      }
    }
    regenerateActivePlanSubmissions();
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

  const completedCount = currentItems.filter((i) => i.completed).length;
  const totalCount = currentItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline || deadline === '-') {
      return { status: 'none', label: '无截止日期' };
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return { status: 'none', label: '无截止日期' };
    }
    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { status: 'overdue', label: `已逾期 ${Math.abs(daysLeft)} 天` };
    if (daysLeft <= 7) return { status: 'urgent', label: `剩余 ${daysLeft} 天` };
    if (daysLeft <= 30) return { status: 'soon', label: `剩余 ${daysLeft} 天` };
    return { status: 'plenty', label: `剩余 ${daysLeft} 天` };
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
            添加你的第一个申请计划，系统将自动生成提交清单，帮你追踪申请材料准备进度
          </p>
          <p className="text-sm text-zinc-400">
            请在「申请时间线」中添加申请计划
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">提交清单</h2>
          <p className="text-sm text-zinc-500 mt-1">申请材料准备清单，追踪每一项的完成状态</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={isSummaryView}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSummaryView ? '请先选择一个计划' : '新增项'}
          >
            <Plus className="w-4 h-4" />
            新增项
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isSummaryView}
            className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSummaryView ? '请先选择一个计划' : '重新生成'}
          >
            <RefreshCw className="w-4 h-4" />
            重新生成
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
                : '选择学校'}
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
                      <div className="font-medium text-zinc-800 text-sm">
                        {plan.program.school}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {plan.program.major} · {plan.program.degree}
                      </div>
                      {plan.program.deadline && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          截止：
                          {new Date(plan.program.deadline).toLocaleDateString('zh-CN')}
                        </div>
                      )}
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

      {!isSummaryView && activePlan && activePlan.program.deadline && (
        <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent-600" />
            <div>
              <p className="text-sm text-accent-600 font-medium">申请截止日期</p>
              <p className="font-semibold text-accent-900">
                {new Date(activePlan.program.deadline).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p
                className={`text-sm font-medium ${
                  getDeadlineStatus(activePlan.program.deadline).status === 'overdue'
                    ? 'text-red-600'
                    : getDeadlineStatus(activePlan.program.deadline).status === 'urgent'
                    ? 'text-orange-600'
                    : getDeadlineStatus(activePlan.program.deadline).status === 'soon'
                    ? 'text-amber-600'
                    : 'text-green-600'
                }`}
              >
                {getDeadlineStatus(activePlan.program.deadline).label}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">
            {isSummaryView ? '整体进度' : `${activePlan?.program.school} 进度`}
          </span>
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
                const isEditing = editingId === item.id;
                const combinedItem = item as CombinedSubmissionItem;
                const hasSchoolInfo = isSummaryView && combinedItem.schoolName;
                const isPublicItem = item.isPublic;

                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 w-5" />
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={editForm.item || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, item: e.target.value })
                              }
                              className="input-field text-sm"
                              placeholder="项目名称"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCategoryMenu(
                                      showCategoryMenu === item.id ? null : item.id
                                    )
                                  }
                                  className="w-full input-field text-sm text-left flex items-center justify-between"
                                >
                                  <span>{editForm.category || item.category}</span>
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                {showCategoryMenu === item.id && (
                                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg z-20 py-1">
                                    {defaultCategories.map((cat) => (
                                      <button
                                        key={cat}
                                        onClick={() => {
                                          setEditForm({ ...editForm, category: cat });
                                          setShowCategoryMenu(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                                          (editForm.category || item.category) === cat
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-zinc-700'
                                        }`}
                                      >
                                        {categoryIcons[cat] || '📄'} {cat}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input
                                type="date"
                                value={editForm.deadline || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, deadline: e.target.value })
                                }
                                className="input-field text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(item.id)}
                                className="btn-primary flex items-center gap-2 text-sm flex-1"
                              >
                                <Save className="w-4 h-4" />
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="btn-secondary flex items-center gap-2 text-sm flex-1"
                              >
                                <X className="w-4 h-4" />
                                取消
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          disabled={isSummaryView}
                          className={`mt-0.5 flex-shrink-0 ${isSummaryView ? 'cursor-default' : ''}`}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle
                              className={`w-5 h-5 transition-colors ${
                                isSummaryView
                                  ? 'text-zinc-300'
                                  : 'text-zinc-300 hover:text-primary-500'
                              }`}
                            />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`font-medium ${
                                  item.completed
                                    ? 'text-zinc-400 line-through'
                                    : 'text-zinc-800'
                                }`}
                              >
                                {item.item}
                              </p>
                              {isPublicItem && (
                                <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  公共材料
                                </span>
                              )}
                              {item.isCustom && (
                                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                  自定义
                                </span>
                              )}
                              {hasSchoolInfo && !isPublicItem && (
                                <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                                  {combinedItem.schoolName} · {combinedItem.majorName}
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                                {categoryIcons[item.category] || '📄'} {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.deadline &&
                                item.deadline !== '-' &&
                                deadlineStatus.status !== 'none' && (
                                  <div
                                    className={`flex items-center gap-1 text-xs ${
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
                              {!isSummaryView && (
                                <>
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="p-1.5 hover:bg-zinc-100 rounded text-zinc-500 hover:text-primary-600 transition-colors"
                                    title="编辑分类和截止日期"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id, item.isCustom)}
                                    className="p-1.5 hover:bg-red-100 rounded text-zinc-500 hover:text-red-600 transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {!isSummaryView && (
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              placeholder="添加备注..."
                              className="mt-2 w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          )}
                          {isSummaryView && item.notes && (
                            <p className="mt-2 text-sm text-zinc-500">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {currentItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500">暂无提交项</p>
          <p className="text-sm text-zinc-400 mt-1">
            {isSummaryView ? '添加申请计划后将自动生成提交清单' : '点击右上角按钮添加自定义项'}
          </p>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增提交项"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">项目名称 *</label>
            <input
              type="text"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="input-field"
              placeholder="例如：准备作品集封面设计"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">分类</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="input-field"
              >
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryIcons[cat] || '📄'} {cat}
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
            <label className="input-label">材料类型</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!newItemIsPublic}
                  onChange={() => setNewItemIsPublic(false)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-zinc-700">当前学校专属</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={newItemIsPublic}
                  onChange={() => setNewItemIsPublic(true)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-zinc-700 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  公共材料（所有学校共享）
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="input-label">备注</label>
            <input
              type="text"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="input-field"
              placeholder="可选：添加相关说明或链接"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
              取消
            </button>
            <button
              onClick={handleAddItem}
              disabled={!newItem.item.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
