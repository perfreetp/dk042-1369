import { useState, useEffect } from 'react';
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

export default function SubmissionList() {
  const {
    targetProgram,
    submissionItems,
    generateSubmissionList,
    regenerateSubmissionList,
    updateSubmissionItem,
    addCustomSubmissionItem,
    deleteSubmissionItem,
  } = usePortfolioStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Omit<SubmissionItem, 'id' | 'isCustom'>>({
    category: '其他材料',
    item: '',
    deadline: '',
    completed: false,
    notes: '',
  });

  const [editForm, setEditForm] = useState<Partial<SubmissionItem>>({});

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

  const handleAddItem = () => {
    if (newItem.item.trim()) {
      addCustomSubmissionItem(newItem);
      setNewItem({
        category: '其他材料',
        item: '',
        deadline: '',
        completed: false,
        notes: '',
      });
      setShowAddModal(false);
    }
  };

  const startEdit = (item: SubmissionItem) => {
    setEditingId(item.id);
    setEditForm({
      category: item.category,
      item: item.item,
      deadline: item.deadline,
    });
    setShowCategoryMenu(null);
  };

  const saveEdit = (id: string) => {
    updateSubmissionItem(id, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setShowCategoryMenu(null);
  };

  const handleDelete = (id: string, isCustom: boolean | undefined) => {
    if (isCustom) {
      if (confirm('确定删除这个自定义项吗？')) {
        deleteSubmissionItem(id);
      }
    } else {
      if (confirm('系统生成的项删除后可通过「重新生成」恢复。确定删除吗？')) {
        deleteSubmissionItem(id);
      }
    }
  };

  const handleRegenerate = () => {
    if (submissionItems.some((i) => i.isCustom) || submissionItems.some((i) => i.completed || i.notes)) {
      if (
        !confirm(
          '重新生成将保留你已勾选的完成状态、备注和自定义项，但会恢复系统默认项的分类和截止日期。是否继续？'
        )
      ) {
        return;
      }
    }
    regenerateSubmissionList();
  };

  const completedCount = submissionItems.filter((i) => i.completed).length;
  const totalCount = submissionItems.length;
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

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">提交清单</h2>
          <p className="text-sm text-zinc-500 mt-1">申请材料准备清单，追踪每一项的完成状态</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            新增项
          </button>
          <button
            onClick={handleRegenerate}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重新生成
          </button>
        </div>
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
                const isEditing = editingId === item.id;

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
                              {item.isCustom && (
                                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                  自定义
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
                            </div>
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
                    )}
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
          <p className="text-sm text-zinc-400 mt-1">选择目标专业后将自动生成清单，或手动添加</p>
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
