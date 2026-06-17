import { useState } from 'react';
import { Plus, FileText, User, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectEditor from '../components/projects/ProjectEditor';
import BackgroundEditor from '../components/projects/BackgroundEditor';
import type { Project } from '../types';

export default function CreatePage() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
  } = usePortfolioStore();

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<'projects' | 'background'>('projects');
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddProject = () => {
    setEditingProject(null);
    setEditorOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditorOpen(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      deleteProject(id);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderProjects(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const nextOrder = sortedProjects.length;

  const totalCompleteness = sortedProjects.length > 0
    ? Math.round(
        sortedProjects.reduce((sum, p) => {
          const completeness = Math.round(
            ((p.title ? 15 : 0) +
            (p.description ? 15 : 0) +
            (p.role ? 10 : 0) +
            (p.startDate ? 10 : 0) +
            (p.outputs.length > 0 ? 15 : 0) +
            (p.difficulties.length > 0 ? 15 : 0) +
            (p.processNodes.length > 0 ? 10 : 0) +
            (p.growth ? 10 : 0))
          );
          return sum + completeness;
        }, 0) / sortedProjects.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-900">创建作品集</h1>
              <p className="text-sm text-zinc-500">整理你的项目经历，讲述从零到一的故事</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-b border-zinc-200">
            <button
              onClick={() => setActiveSection('projects')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeSection === 'projects'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              项目经历
              <span className="px-2 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full">
                {sortedProjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('background')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeSection === 'background'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <User className="w-4 h-4" />
              背景信息
            </button>
          </div>
        </div>

        {activeSection === 'projects' && (
          <div>
            {sortedProjects.length > 0 && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">项目平均完成度</p>
                    <p className="text-2xl font-bold text-primary-600">{totalCompleteness}%</p>
                  </div>
                  <div className="w-48">
                    <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          totalCompleteness >= 80
                            ? 'bg-green-500'
                            : totalCompleteness >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${totalCompleteness}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {sortedProjects.map((project, index) => (
                <div
                  key={project.id}
                  onDragEnd={handleDragEnd}
                >
                  <ProjectCard
                    project={project}
                    index={index}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedIndex === index}
                    dragOverIndex={dragOverIndex}
                  />
                </div>
              ))}

              <button
                onClick={handleAddProject}
                className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <Plus className="w-5 h-5 text-zinc-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-zinc-700 group-hover:text-primary-700 transition-colors">
                    添加新项目
                  </p>
                  <p className="text-sm text-zinc-400">记录你的作品和经历</p>
                </div>
              </button>
            </div>

            {sortedProjects.length === 0 && (
              <div className="mt-8 text-center py-12 bg-white rounded-xl border border-zinc-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-700 mb-2">还没有项目</h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                  点击上方按钮添加你的第一个项目。建议添加 3-5 个最能体现你能力的项目，
                  并详细描述每个项目的过程和收获。
                </p>
                <button
                  onClick={handleAddProject}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加第一个项目
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'background' && (
          <BackgroundEditor />
        )}
      </div>

      <ProjectEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        nextOrder={nextOrder}
      />
    </div>
  );
}
