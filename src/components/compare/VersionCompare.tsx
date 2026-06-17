import { useState } from 'react';
import { Save, Trash2, RotateCcw, GitCompare, Plus, Clock, Check, X } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import Modal from '../ui/Modal';

export default function VersionCompare() {
  const {
    versions,
    saveVersion,
    loadVersion,
    deleteVersion,
    compareVersions,
    getPortfolioData,
    currentVersionId,
  } = usePortfolioStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [selectedV1, setSelectedV1] = useState<string | null>(null);
  const [selectedV2, setSelectedV2] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleSaveVersion = () => {
    if (versionName.trim()) {
      saveVersion(versionName.trim(), versionDescription.trim());
      setVersionName('');
      setVersionDescription('');
      setShowSaveModal(false);
    }
  };

  const handleCompare = () => {
    if (selectedV1 && selectedV2) {
      setShowDiff(true);
    }
  };

  const diffResult =
    selectedV1 && selectedV2 ? compareVersions(selectedV1, selectedV2) : null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">
            版本管理
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            保存历史版本，对比不同阶段的作品集
          </p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          保存版本
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
          <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">还没有保存的版本</p>
          <p className="text-sm text-zinc-400 mt-1">
            点击上方按钮保存当前作品集的快照
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="font-medium text-zinc-700 mb-3">历史版本</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-2">
              {[...versions].sort((a, b) => b.createdAt - a.createdAt).map((version) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border transition-all ${
                    currentVersionId === version.id
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-zinc-50 border-zinc-200 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-zinc-900">
                          {version.name}
                        </h4>
                        {currentVersionId === version.id && (
                          <span className="tag bg-primary-100 text-primary-700 border border-primary-200 text-xs">
                            当前版本
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-zinc-500 mt-1">
                          {version.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </span>
                        <span>{version.data.projects.length} 个项目</span>
                        <span>
                          {
                            version.data.materialChecklist.filter(
                              (m) => m.completed
                            ).length
                          }
                          项材料
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="flex items-center gap-1 mr-2">
                        <input
                          type="radio"
                          name="v1"
                          checked={selectedV1 === version.id}
                          onChange={() => setSelectedV1(version.id)}
                          className="w-3.5 h-3.5 text-primary-600"
                        />
                        <span className="text-xs text-zinc-500">V1</span>
                      </label>
                      <label className="flex items-center gap-1 mr-2">
                        <input
                          type="radio"
                          name="v2"
                          checked={selectedV2 === version.id}
                          onChange={() => setSelectedV2(version.id)}
                          className="w-3.5 h-3.5 text-accent-500"
                        />
                        <span className="text-xs text-zinc-500">V2</span>
                      </label>
                      <button
                        onClick={() => loadVersion(version.id)}
                        className="p-1.5 hover:bg-primary-100 rounded text-primary-600"
                        title="加载此版本"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVersion(version.id)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-500"
                        title="删除此版本"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-zinc-700 flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                版本对比
              </h3>
              <button
                onClick={handleCompare}
                disabled={!selectedV1 || !selectedV2}
                className="btn-accent text-sm py-1.5 px-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GitCompare className="w-4 h-4" />
                对比版本
              </button>
            </div>

            {selectedV1 && selectedV2 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-md">
                  V1:{' '}
                  {versions.find((v) => v.id === selectedV1)?.name ||
                    '未选择'}
                </span>
                <span className="text-zinc-400">VS</span>
                <span className="px-3 py-1.5 bg-accent-100 text-accent-700 rounded-md">
                  V2:{' '}
                  {versions.find((v) => v.id === selectedV2)?.name ||
                    '未选择'}
                </span>
              </div>
            )}

            {showDiff && diffResult && (
              <div className="mt-4 pt-4 border-t border-zinc-200 space-y-4">
                {diffResult.added.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      新增 ({diffResult.added.length})
                    </h4>
                    <ul className="space-y-1">
                      {diffResult.added.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-green-700"
                        >
                          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diffResult.removed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      移除 ({diffResult.removed.length})
                    </h4>
                    <ul className="space-y-1">
                      {diffResult.removed.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-red-700"
                        >
                          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diffResult.modified.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
                      <GitCompare className="w-4 h-4" />
                      修改 ({diffResult.modified.length})
                    </h4>
                    <ul className="space-y-1">
                      {diffResult.modified.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-700"
                        >
                          <GitCompare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diffResult.added.length === 0 &&
                  diffResult.removed.length === 0 &&
                  diffResult.modified.length === 0 && (
                    <div className="text-center py-4 text-zinc-500">
                      两个版本完全相同
                    </div>
                  )}
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="保存新版本"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">版本名称 *</label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="input-field"
              placeholder="例如：初稿完成、添加新项目后"
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">版本说明</label>
            <textarea
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="简要描述此版本的主要变化..."
              rows={3}
            />
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs text-zinc-500">
              当前状态：{getPortfolioData().projects.length} 个项目，
              {getPortfolioData().materialChecklist.filter((m) => m.completed).length}/
              {getPortfolioData().materialChecklist.length} 项材料完成
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveVersion}
              disabled={!versionName.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存版本
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
