import { useState } from 'react';
import { Download, HardDrive, FileText, FileCheck, FileSpreadsheet, ListTodo } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import SubmissionList from '../components/export/SubmissionList';
import ApplicationTimeline from '../components/export/ApplicationTimeline';
import OfflineManager from '../components/export/OfflineManager';

export default function ExportPage() {
  const { exportToPDF, targetProgram, projects } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<'timeline' | 'submission' | 'export' | 'offline'>('timeline');
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const canExport = targetProgram && projects.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-900">导出与管理</h1>
              <p className="text-sm text-zinc-500">导出诊断报告，管理本地数据</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-b border-zinc-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              申请时间线
            </button>
            <button
              onClick={() => setActiveTab('submission')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'submission'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              提交清单
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'export'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              导出报告
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'offline'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              数据管理
            </button>
          </div>
        </div>

        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto">
            <ApplicationTimeline />
          </div>
        )}

        {activeTab === 'submission' && (
          <div className="max-w-4xl mx-auto">
            <SubmissionList />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="max-w-4xl mx-auto">
            <div className="card p-6">
              <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-2">
                导出诊断报告
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                导出完整的作品集诊断报告，包含综合评分、能力分析、改进建议和材料清单
              </p>

              {!canExport && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    ⚠️ 请先选择目标专业并添加至少一个项目后再导出报告
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 border border-zinc-200 rounded-xl hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 mb-1">PDF 诊断报告</h3>
                      <p className="text-sm text-zinc-500 mb-3">
                        完整的多页 PDF 报告，包含所有诊断结果和改进建议，便于打印和存档
                      </p>
                      <button
                        onClick={handleExportPDF}
                        disabled={!canExport || exporting}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        {exporting ? '正在生成...' : '导出 PDF'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-zinc-200 rounded-xl hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 mb-1">JSON 数据备份</h3>
                      <p className="text-sm text-zinc-500 mb-3">
                        导出所有数据为 JSON 格式，可用于备份或在其他设备上恢复
                      </p>
                      <button
                        onClick={() => {
                          const { exportToJSON } = usePortfolioStore.getState();
                          const json = exportToJSON();
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        导出 JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">报告内容预览</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    综合评估分数
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    目标专业信息
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    项目列表概览
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    六维能力分析
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    能力缺口详情
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    针对性改进建议
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    材料准备清单
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    总结与行动指南
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                <h4 className="font-medium text-zinc-700 mb-2">使用提示</h4>
                <ul className="text-sm text-zinc-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>建议在完成作品集诊断后再导出报告，以获得完整的分析结果</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>PDF 报告支持中文显示，可直接打印或发送给申请顾问</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>定期导出 JSON 备份，防止浏览器数据丢失</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="max-w-4xl mx-auto">
            <OfflineManager />
          </div>
        )}
      </div>
    </div>
  );
}
