import { useState } from 'react';
import { GitCompare, Layout, Clock, FileText } from 'lucide-react';
import StructurePreview from '../components/compare/StructurePreview';
import VersionCompare from '../components/compare/VersionCompare';

export default function ComparePage() {
  const [activeTab, setActiveTab] = useState<'structure' | 'version'>('structure');

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-900">对照分析</h1>
              <p className="text-sm text-zinc-500">优化作品集结构，追踪版本迭代</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-b border-zinc-200">
            <button
              onClick={() => setActiveTab('structure')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'structure'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Layout className="w-4 h-4" />
              页面结构
            </button>
            <button
              onClick={() => setActiveTab('version')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'version'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              版本对比
            </button>
          </div>
        </div>

        {activeTab === 'structure' && (
          <div className="max-w-4xl mx-auto">
            <StructurePreview />
          </div>
        )}

        {activeTab === 'version' && (
          <div className="max-w-4xl mx-auto">
            <VersionCompare />
          </div>
        )}
      </div>
    </div>
  );
}
