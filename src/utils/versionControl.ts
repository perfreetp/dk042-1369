import type { PortfolioData, PortfolioVersion, VersionDiff } from '../types';

export function createVersion(
  name: string,
  description: string,
  data: PortfolioData
): PortfolioVersion {
  return {
    id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    createdAt: Date.now(),
    data: JSON.parse(JSON.stringify(data)),
  };
}

export function compareVersions(
  v1: PortfolioData,
  v2: PortfolioData
): VersionDiff {
  const diff: VersionDiff = {
    added: [],
    removed: [],
    modified: [],
  };

  const v1ProjectIds = new Set(v1.projects.map((p) => p.id));
  const v2ProjectIds = new Set(v2.projects.map((p) => p.id));

  v2.projects.forEach((p) => {
    if (!v1ProjectIds.has(p.id)) {
      diff.added.push(`新增项目：${p.title}`);
    }
  });

  v1.projects.forEach((p) => {
    if (!v2ProjectIds.has(p.id)) {
      diff.removed.push(`移除项目：${p.title}`);
    }
  });

  v1.projects.forEach((p1) => {
    const p2 = v2.projects.find((p) => p.id === p1.id);
    if (p2) {
      if (p1.title !== p2.title) {
        diff.modified.push(`项目"${p1.title}"重命名为"${p2.title}"`);
      }
      if (p1.description !== p2.description) {
        diff.modified.push(`项目"${p2.title}"描述已更新`);
      }
      if (p1.processNodes.length !== p2.processNodes.length) {
        diff.modified.push(`项目"${p2.title}"过程节点已更新 (${p1.processNodes.length} → ${p2.processNodes.length})`);
      }
    }
  });

  if (v1.background.motivation !== v2.background.motivation) {
    diff.modified.push('申请动机已更新');
  }

  if (v1.background.skills.length !== v2.background.skills.length) {
    diff.modified.push(`技能清单已更新 (${v1.background.skills.length} → ${v2.background.skills.length})`);
  }

  if (v1.background.education.length !== v2.background.education.length) {
    diff.modified.push(`教育背景已更新 (${v1.background.education.length} → ${v2.background.education.length})`);
  }

  if (v1.background.experience.length !== v2.background.experience.length) {
    diff.modified.push(`工作经历已更新 (${v1.background.experience.length} → ${v2.background.experience.length})`);
  }

  if (v1.targetProgram?.id !== v2.targetProgram?.id) {
    if (v2.targetProgram) {
      diff.modified.push(`目标专业已更改为：${v2.targetProgram.school} - ${v2.targetProgram.major}`);
    } else if (v1.targetProgram) {
      diff.modified.push('已清除目标专业');
    }
  }

  const v1Completed = v1.materialChecklist.filter((m) => m.completed).length;
  const v2Completed = v2.materialChecklist.filter((m) => m.completed).length;
  if (v1Completed !== v2Completed) {
    diff.modified.push(`材料清单完成度更新 (${v1Completed}/${v1.materialChecklist.length} → ${v2Completed}/${v2.materialChecklist.length})`);
  }

  return diff;
}

export function exportToJSON(data: PortfolioData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(json: string): PortfolioData | null {
  try {
    const data = JSON.parse(json);
    if (validatePortfolioData(data)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function validatePortfolioData(data: unknown): data is PortfolioData {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.projects) &&
    Array.isArray(d.materialChecklist) &&
    typeof d.background === 'object' &&
    d.background !== null
  );
}

export function generateSubmissionList(
  data: PortfolioData
): { id: string; category: string; item: string; deadline: string; completed: boolean; notes: string }[] {
  const items: { id: string; category: string; item: string; deadline: string; completed: boolean; notes: string }[] = [];
  const deadline = data.targetProgram?.deadline || '';

  data.materialChecklist.forEach((check, index) => {
    items.push({
      id: `sub-${index}`,
      category: check.category,
      item: check.item,
      deadline,
      completed: check.completed,
      notes: check.notes,
    });
  });

  items.push({
    id: 'sub-portfolio',
    category: '作品集',
    item: '最终作品集 PDF 版本',
    deadline,
    completed: data.projects.length >= 3,
    notes: '确保所有项目完整呈现，文件大小符合院校要求',
  });

  items.push({
    id: 'sub-review',
    category: '作品集',
    item: '请他人审阅作品集并获取反馈',
    deadline,
    completed: false,
    notes: '建议至少2-3人审阅，包括本专业和非本专业人士',
  });

  items.push({
    id: 'sub-format',
    category: '作品集',
    item: '检查文件格式和命名规范',
    deadline,
    completed: false,
    notes: '通常要求 PDF 格式，命名规范：LastName_FirstName_Portfolio.pdf',
  });

  if (data.targetProgram) {
    items.push({
      id: 'sub-research',
      category: '院校研究',
      item: `深入研究 ${data.targetProgram.school} ${data.targetProgram.major} 项目`,
      deadline,
      completed: false,
      notes: '了解课程设置、师资力量、校友去向，在个人陈述中体现匹配度',
    });
  }

  return items;
}
