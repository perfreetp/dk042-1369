import { FileText, User, Lightbulb, BookOpen, Award, ChevronRight, Layout } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';

export default function StructurePreview() {
  const { projects, background, targetProgram } = usePortfolioStore();
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  const sections = [
    {
      id: 'cover',
      title: '封面',
      icon: FileText,
      status: '基础',
      description: '包含姓名、联系方式、申请专业',
      required: true,
    },
    {
      id: 'toc',
      title: '目录',
      icon: Layout,
      status: '基础',
      description: '清晰的项目索引和页码',
      required: true,
    },
    {
      id: 'about',
      title: '个人介绍',
      icon: User,
      status: background.motivation ? '已填写' : '待补充',
      description: '简短的个人背景和申请动机',
      required: false,
    },
    {
      id: 'projects',
      title: '核心项目',
      icon: Award,
      status: `${sortedProjects.length} 个项目`,
      description: '3-5个精选项目，按重要性排序',
      required: true,
    },
    {
      id: 'skills',
      title: '技能展示',
      icon: Lightbulb,
      status: `${background.skills.length} 项技能`,
      description: '相关技能和工具展示',
      required: false,
    },
    {
      id: 'education',
      title: '教育背景',
      icon: BookOpen,
      status: `${background.education.length} 项经历`,
      description: '学历和相关课程',
      required: false,
    },
  ];

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-6">
        页面结构预览
      </h2>

      {targetProgram && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-600 font-medium mb-1">目标专业</p>
          <p className="font-medium text-primary-900">
            {targetProgram.school} - {targetProgram.major}
          </p>
          <p className="text-sm text-primary-700 mt-1">
            基于目标专业的招生偏好优化作品集结构
          </p>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-200" />

        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isProjectSection = section.id === 'projects';
            return (
              <div key={section.id} className="relative pl-16">
                <div className="absolute left-4 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow" />
                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-md border border-zinc-200">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-900">
                            {section.title}
                          </span>
                          <span className="text-xs text-zinc-400">
                            P{index + 1}
                          </span>
                          {section.required && (
                            <span className="tag bg-red-100 text-red-700 border border-red-200 text-xs">
                              必需
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`tag text-xs ${
                        section.status.includes('已') || section.status.includes('个')
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {section.status}
                    </span>
                  </div>

                  {isProjectSection && sortedProjects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                      <p className="text-xs text-zinc-500 mb-3">项目顺序</p>
                      <div className="space-y-2">
                        {sortedProjects.map((project, pIndex) => (
                          <div
                            key={project.id}
                            className="flex items-center gap-2 p-2 bg-white rounded-md border border-zinc-200"
                          >
                            <span className="w-6 h-6 flex items-center justify-center bg-accent-500 text-white text-xs font-bold rounded">
                              {pIndex + 1}
                            </span>
                            <span className="text-sm font-medium text-zinc-700 flex-1 truncate">
                              {project.title || '未命名项目'}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {project.processNodes.length} 节点
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-300" />
                            <span className="text-xs text-zinc-400">
                              {project.outputs.length} 产出
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
        <h4 className="font-medium text-zinc-700 mb-2">叙事逻辑建议</h4>
        <ul className="space-y-2 text-sm text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
            <span>
              <strong>时间倒序：</strong>
              最新、最相关的项目放在前面
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
            <span>
              <strong>能力递进：</strong>
              展现从入门到精通的学习过程
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
            <span>
              <strong>广度覆盖：</strong>
              每个项目侧重不同的能力维度
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
            <span>
              <strong>转专业故事线：</strong>
              突出原有专业与目标专业的联系
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
