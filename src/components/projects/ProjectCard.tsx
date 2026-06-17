import { GripVertical, Edit2, Trash2, ChevronDown, ChevronUp, Calendar, User, Award } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

export default function ProjectCard({
  project,
  index,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex,
}: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const processCount = project.processNodes.length;
  const outputCount = project.outputs.length;
  const difficultyCount = project.difficulties.length;

  const completeness = Math.round(
    (project.title ? 15 : 0) +
    (project.description ? 15 : 0) +
    (project.role ? 10 : 0) +
    (project.startDate ? 10 : 0) +
    (outputCount > 0 ? 15 : 0) +
    (difficultyCount > 0 ? 15 : 0) +
    (processCount > 0 ? 10 : 0) +
    (project.growth ? 10 : 0)
  );

  const getCompletenessColor =
    completeness >= 80
      ? 'bg-green-500'
      : completeness >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500';

  const isDropTarget = dragOverIndex === index;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`card card-hover relative ${
        isDragging ? 'opacity-50' : ''} ${
        isDropTarget ? 'ring-2 ring-primary-500 ring-offset-2' : ''
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-100 rounded transition-colors"
            title="拖拽排序"
          >
            <GripVertical className="w-5 h-5 text-zinc-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 flex items-center justify-center bg-accent-500 text-white text-xs font-bold rounded">
                {index + 1}
              </span>
              <h3 className="font-serif text-lg font-semibold text-zinc-900 truncate">
                {project.title || '未命名项目'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              {project.role && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {project.role}
                </span>
              )}
              {(project.startDate || project.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.startDate} - {project.endDate || '至今'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-primary-50 text-primary-600 hover:text-primary-800 rounded-md transition-colors"
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-md transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-zinc-600">完成度</span>
            <span className="font-medium text-zinc-900">{completeness}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${getCompletenessColor}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {outputCount > 0 && (
            <span className="tag bg-blue-50 text-blue-700 border border-blue-200">
              <Award className="w-3 h-3 mr-1" />
              {outputCount} 项产出
            </span>
          )}
          {processCount > 0 && (
              <span className="tag bg-purple-50 text-purple-700 border border-purple-200">
              {processCount} 个过程节点
            </span>
          )}
          {difficultyCount > 0 && (
            <span className="tag bg-amber-50 text-amber-700 border border-amber-200">
              {difficultyCount} 个难点
            </span>
          )}
        </div>

        {expanded && project.description && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-sm text-zinc-600 leading-relaxed">
              {project.description}
            </p>
            {project.growth && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>成长收获：</strong>
                  {project.growth}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 py-2 text-sm text-zinc-500 hover:text-primary-600 transition-colors"
        >
          {expanded ? (
            <>
              收起 <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              展开详情 <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
