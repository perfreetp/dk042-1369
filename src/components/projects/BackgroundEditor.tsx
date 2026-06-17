import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { skillLevelLabels } from '../../utils/mockData';
import type { Education, Experience, Skill } from '../../types';

const skillCategories = [
  '技术', '设计', '研究', '分析', '设计工具', '技术工具', '数学', '统计', '艺术', '商业', '管理', '学术', '人文', '其他'
];

export default function BackgroundEditor() {
  const { background, addEducation, updateEducation, deleteEducation, addExperience, updateExperience, deleteExperience, addSkill, updateSkill, deleteSkill, updateBackground } = usePortfolioStore();

  const [expandedSection, setExpandedSection] = useState<'education' | 'experience' | 'skills' | 'motivation' | null>('education');

  const toggleSection = (section: 'education' | 'experience' | 'skills' | 'motivation') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const addEmptyEducation = () => {
    addEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
    });
  };

  const addEmptyExperience = () => {
    addExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const addEmptySkill = () => {
    addSkill({
      name: '',
      level: 'intermediate',
      category: '其他',
    });
  };

  const SectionHeader = ({
    title,
    section,
    count,
    onAdd,
  }: {
    title: string;
    section: 'education' | 'experience' | 'skills' | 'motivation';
    count?: number;
    onAdd?: () => void;
  }) => (
    <div
      className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-t-lg cursor-pointer hover:bg-zinc-100 transition-colors"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-3">
        {expandedSection === section ? (
        <ChevronDown className="w-5 h-5 text-primary-600" />
      ) : (
        <ChevronUp className="w-5 h-5 text-zinc-400 rotate-180" />
      )}
        <h3 className="font-serif text-lg font-semibold text-zinc-900">{title}</h3>
        {count !== undefined && (
          <span className="tag bg-primary-100 text-primary-700">{count} 项</span>
        )}
      </div>
      {onAdd && expandedSection === section && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="btn-accent text-sm py-1.5 px-3 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 教育背景 */}
      <div className="card overflow-hidden">
        <SectionHeader
          title="教育背景"
          section="education"
          count={background.education.length}
          onAdd={addEmptyEducation}
        />
        {expandedSection === 'education' && (
          <div className="p-4 space-y-4">
            {background.education.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">
            还没有添加教育背景
          </p>
            ) : (
              background.education.map((edu) => (
                <EducationItem
                  key={edu.id}
                  edu={edu}
                  onUpdate={(updates) => updateEducation(edu.id, updates)}
                  onDelete={() => deleteEducation(edu.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 工作经历 */}
      <div className="card overflow-hidden">
        <SectionHeader
          title="工作经历"
          section="experience"
          count={background.experience.length}
          onAdd={addEmptyExperience}
        />
        {expandedSection === 'experience' && (
          <div className="p-4 space-y-4">
            {background.experience.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">
                还没有添加工作经历
              </p>
            ) : (
              background.experience.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  exp={exp}
                  onUpdate={(updates) => updateExperience(exp.id, updates)}
                  onDelete={() => deleteExperience(exp.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 技能清单 */}
      <div className="card overflow-hidden">
        <SectionHeader
          title="技能清单"
          section="skills"
          count={background.skills.length}
          onAdd={addEmptySkill}
        />
        {expandedSection === 'skills' && (
          <div className="p-4">
            {background.skills.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">
                还没有添加技能
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {background.skills.map((skill) => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    onUpdate={(updates) => updateSkill(skill.id, updates)}
                    onDelete={() => deleteSkill(skill.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 申请动机 */}
      <div className="card overflow-hidden">
        <SectionHeader title="申请动机" section="motivation" />
        {expandedSection === 'motivation' && (
          <div className="p-4">
            <textarea
              value={background.motivation}
              onChange={(e) => updateBackground({ motivation: e.target.value })}
              className="input-field min-h-[150px"
              placeholder="为什么要转专业？你的职业规划是什么？这个专业为什么吸引你？"
              rows={6}
            />
            <p className="text-xs text-zinc-500 mt-2">
              清晰的申请动机是个人陈述的核心，也是评审委员最看重的部分
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EducationItem({
  edu,
  onUpdate,
  onDelete,
}: {
  edu: Education;
  onUpdate: (updates: Partial<Education>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label text-xs">学校</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => onUpdate({ school: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="input-label text-xs">专业</label>
              <input
                type="text"
                value={edu.major}
                onChange={(e) => onUpdate({ major: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="input-label text-xs">学位</label>
              <select
                value={edu.degree}
                onChange={(e) => onUpdate({ degree: e.target.value })}
                className="input-field text-sm"
              >
                <option value="">选择</option>
                <option value="学士">学士</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="input-label text-xs">开始</label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="input-label text-xs">结束</label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              完成
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-zinc-900">
              {edu.school || '未填写学校'}
            </h4>
            <p className="text-sm text-zinc-600">
              {edu.major || '未填写专业'} · {edu.degree || '未填写学位'}
            </p>
            <p className="text-sm text-zinc-500">
              {edu.startDate} - {edu.endDate || '至今'}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExperienceItem({
  exp,
  onUpdate,
  onDelete,
}: {
  exp: Experience;
  onUpdate: (updates: Partial<Experience>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label text-xs">公司/机构</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => onUpdate({ company: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="input-label text-xs">职位</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => onUpdate({ position: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label text-xs">开始</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="input-label text-xs">结束</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div>
            <label className="input-label text-xs">工作描述</label>
            <textarea
              value={exp.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="input-field text-sm min-h-[60px]"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              完成
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-zinc-900">
              {exp.position || '未填写职位'}
            </h4>
            <p className="text-sm text-zinc-600">
              {exp.company || '未填写公司'}
            </p>
            <p className="text-sm text-zinc-500">
              {exp.startDate} - {exp.endDate || '至今'}
            </p>
            {exp.description && (
              <p className="text-sm text-zinc-600 mt-2">
                {exp.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-zinc-200 rounded text-zinc-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillItem({
  skill,
  onUpdate,
  onDelete,
}: {
  skill: Skill;
  onUpdate: (updates: Partial<Skill>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
      <input
        type="text"
        value={skill.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="技能名称"
        className="input-field text-sm flex-1 py-1.5"
      />
      <select
        value={skill.level}
        onChange={(e) =>
          onUpdate({ level: e.target.value as Skill['level'] })
        }
        className="input-field text-sm py-1.5 w-24"
      >
        <option value="beginner">{skillLevelLabels.beginner}</option>
        <option value="intermediate">{skillLevelLabels.intermediate}</option>
        <option value="advanced">{skillLevelLabels.advanced}</option>
        <option value="expert">{skillLevelLabels.expert}</option>
      </select>
      <select
        value={skill.category}
        onChange={(e) => onUpdate({ category: e.target.value })}
        className="input-field text-sm py-1.5 w-28"
      >
        {skillCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 hover:bg-red-100 rounded text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
