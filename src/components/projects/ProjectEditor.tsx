import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Project, ProcessNode } from '../../types';
import Modal from '../ui/Modal';
import TagList from '../ui/TagList';

interface ProjectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  project?: Project | null;
  nextOrder: number;
}

const emptyProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  startDate: '',
  endDate: '',
  role: '',
  description: '',
  outputs: [],
  difficulties: [],
  growth: '',
  processNodes: [],
  order: 0,
};

const nodeTypeOptions = [
  { value: 'learning', label: '学习', color: 'bg-blue-100 text-blue-700' },
  { value: 'breakthrough', label: '突破', color: 'bg-green-100 text-green-700' },
  { value: 'milestone', label: '里程碑', color: 'bg-purple-100 text-purple-700' },
  { value: 'challenge', label: '挑战', color: 'bg-amber-100 text-amber-700' },
];

export default function ProjectEditor({
  isOpen,
  onClose,
  onSave,
  project,
  nextOrder,
}: ProjectEditorProps) {
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>(emptyProject);
  const [activeTab, setActiveTab] = useState<'basic' | 'process'>('basic');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        startDate: project.startDate,
        endDate: project.endDate,
        role: project.role,
        description: project.description,
        outputs: [...project.outputs],
        difficulties: [...project.difficulties],
        growth: project.growth,
        processNodes: [...project.processNodes],
        order: project.order,
      });
    } else {
      setFormData({ ...emptyProject, order: nextOrder });
    }
  }, [project, nextOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addProcessNode = () => {
    const newNode: ProcessNode = {
      id: `node-${Date.now()}`,
      title: '',
      date: '',
      description: '',
      type: 'milestone',
    };
    setFormData({
      ...formData,
      processNodes: [...formData.processNodes, newNode],
    });
  };

  const updateProcessNode = (index: number, updates: Partial<ProcessNode>) => {
    const newNodes = [...formData.processNodes];
    newNodes[index] = { ...newNodes[index], ...updates };
    setFormData({ ...formData, processNodes: newNodes });
  };

  const removeProcessNode = (index: number) => {
    const newNodes = formData.processNodes.filter((_, i) => i !== index);
    setFormData({ ...formData, processNodes: newNodes });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? '编辑项目' : '添加新项目'} size="xl">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-6 border-b border-zinc-200">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            基本信息
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('process')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'process'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            从零到一的过程
          </button>
        </div>

        {activeTab === 'basic' && (
          <div className="space-y-5">
            <div>
              <label className="input-label">项目名称 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="例如：智能健康监测系统设计"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">开始时间</label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">结束时间</label>
                <input
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="input-label">担任角色</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
                placeholder="例如：产品设计师 / 独立开发者 / 团队负责人"
              />
            </div>

            <div>
              <label className="input-label">项目描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="简要描述项目背景、目标和你的贡献..."
                rows={4}
              />
            </div>

            <div>
              <label className="input-label">项目产出</label>
              <TagList
                tags={formData.outputs}
                onChange={(outputs) => setFormData({ ...formData, outputs })}
                placeholder="输入产出后按回车添加，如：设计稿、原型、论文、开源代码、App Store上线"
              />
            </div>

            <div>
              <label className="input-label">遇到的难点</label>
              <TagList
                tags={formData.difficulties}
                onChange={(difficulties) =>
                  setFormData({ ...formData, difficulties })}
                placeholder="输入难点后按回车添加"
              />
            </div>

            <div>
              <label className="input-label">成长与收获</label>
              <textarea
                value={formData.growth}
                onChange={(e) => setFormData({ ...formData, growth: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="这个项目让你学到了什么？有哪些能力得到了提升？"
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="space-y-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-600">
              记录项目从零到一的关键节点，展现你的学习路径和成长过程
            </p>
            <button
              type="button"
              onClick={addProcessNode}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加节点
            </button>
          </div>

          {formData.processNodes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
              <p className="text-zinc-500">还没有过程节点</p>
              <p className="text-sm text-zinc-400 mt-1">
                点击上方按钮添加关键节点，如：学习新技术、攻克技术难题、完成重要里程碑等
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200" />
              <div className="space-y-6">
                {formData.processNodes
                  .sort((a, b) => {
                    if (a.date && b.date) return a.date.localeCompare(b.date);
                    return 0;
                  })
                  .map((node, index) => (
                    <div key={node.id} className="relative pl-10">
                      <div className="absolute left-2 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow" />
                      <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <select
                            value={node.type}
                            onChange={(e) =>
                              updateProcessNode(index, { type: e.target.value as ProcessNode['type'] })
                            }
                            className="text-xs px-2 py-1 rounded border border-zinc-300 bg-white"
                          >
                            {nodeTypeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeProcessNode(index)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="input-label text-xs">节点标题</label>
                            <input
                              type="text"
                              value={node.title}
                              onChange={(e) => updateProcessNode(index, { title: e.target.value })}
                              className="input-field text-sm"
                              placeholder="例如：学会了 React"
                            />
                          </div>
                          <div>
                            <label className="input-label text-xs">时间</label>
                            <input
                              type="month"
                              value={node.date}
                              onChange={(e) => updateProcessNode(index, { date: e.target.value })}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="input-label text-xs">详细描述</label>
                          <textarea
                            value={node.description}
                            onChange={(e) => updateProcessNode(index, { description: e.target.value })}
                            className="input-field text-sm min-h-[60px]"
                            placeholder="描述这个节点的具体内容和你的收获..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {project ? '保存修改' : '添加项目'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
