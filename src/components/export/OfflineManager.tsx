import { useState, useRef } from 'react';
import { HardDrive, Download, Upload, Trash2, FileJson, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';

export default function OfflineManager() {
  const { exportToJSON, importFromJSON, resetAll, getPortfolioData, versions } = usePortfolioStore();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = getPortfolioData();
  const storageUsed = JSON.stringify(data).length / 1024;
  const versionsSize = JSON.stringify(versions).length / 1024;
  const totalSize = storageUsed + versionsSize;

  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-diagnosis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = importFromJSON(json);
        if (success) {
          setImportStatus('success');
          setImportMessage('数据导入成功！');
        } else {
          setImportStatus('error');
          setImportMessage('文件格式错误，请检查文件内容');
        }
      } catch {
        setImportStatus('error');
        setImportMessage('文件解析失败，请确保是有效的JSON文件');
      }
    };
    reader.readAsText(file);

    setTimeout(() => {
      setImportStatus('idle');
      setImportMessage('');
    }, 3000);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
    setImportStatus('success');
    setImportMessage('所有数据已重置');
    setTimeout(() => {
      setImportStatus('idle');
      setImportMessage('');
    }, 3000);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">离线数据管理</h2>
          <p className="text-sm text-zinc-500 mt-1">所有数据保存在浏览器本地，无需联网</p>
        </div>
        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-green-600" />
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">关于离线存储</p>
            <p className="text-sm text-blue-700 mt-1">
              您的数据使用浏览器本地存储（localStorage）保存。清除浏览器数据或更换设备会导致数据丢失，
              建议定期导出备份。
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">存储使用情况</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-center">
            <p className="text-2xl font-bold text-primary-600">{storageUsed.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 mt-1">作品集数据 (KB)</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-center">
            <p className="text-2xl font-bold text-accent-600">{versionsSize.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 mt-1">历史版本 (KB)</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-center">
            <p className="text-2xl font-bold text-zinc-700">{totalSize.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 mt-1">总计 (KB)</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">数据统计</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-lg border border-zinc-200">
            <p className="text-xl font-bold text-primary-600">{data.projects.length}</p>
            <p className="text-xs text-zinc-500">项目数量</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-zinc-200">
            <p className="text-xl font-bold text-accent-600">{data.background.skills.length}</p>
            <p className="text-xs text-zinc-500">技能数量</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-zinc-200">
            <p className="text-xl font-bold text-green-600">{versions.length}</p>
            <p className="text-xs text-zinc-500">历史版本</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-zinc-200">
            <p className="text-xl font-bold text-zinc-700">
              {data.materialChecklist.filter(m => m.completed).length}/{data.materialChecklist.length}
            </p>
            <p className="text-xs text-zinc-500">材料完成</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">数据操作</h3>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleExportJSON}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="font-medium">导出数据备份</span>
          <FileJson className="w-4 h-4 ml-auto opacity-60" />
        </button>

        <button
          onClick={handleImportClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium">从备份恢复</span>
          <span className="ml-auto text-xs text-zinc-500">.json</span>
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">重置所有数据</span>
        </button>
      </div>

      {importStatus !== 'idle' && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          importStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{importMessage}</span>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-zinc-900 mb-2">确认重置所有数据？</h3>
            <p className="text-sm text-center text-zinc-600 mb-6">
              此操作将永久删除所有项目、背景信息、目标专业设置和历史版本。此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
