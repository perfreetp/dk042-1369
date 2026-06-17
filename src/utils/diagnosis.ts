import type { Project, Background, TargetProgram, AbilityGap, Skill } from '../types';
import { skillLevelMap } from './mockData';

export function generateAbilityGaps(
  projects: Project[],
  background: Background,
  targetProgram: TargetProgram | null
): AbilityGap[] {
  if (!targetProgram) return [];

  const abilityScores = calculateAbilityScores(projects, background);

  return targetProgram.requirements.map((req) => {
    const currentLevel = abilityScores[req.dimension] || 0;
    const gap = req.requiredLevel - currentLevel;

    return {
      dimension: req.dimension,
      currentLevel,
      requiredLevel: req.requiredLevel,
      gap: Math.max(0, gap),
      suggestions: generateSuggestions(req.dimension, gap, currentLevel),
    };
  });
}

function calculateAbilityScores(
  projects: Project[],
  background: Background
): Record<string, number> {
  const scores: Record<string, number> = {};

  const techSkills = background.skills.filter((s) =>
    s.category === '技术' || s.category === '编程' || s.category === '技术工具'
  );
  const designSkills = background.skills.filter((s) =>
    s.category === '设计' || s.category === '设计工具'
  );
  const researchSkills = background.skills.filter((s) =>
    s.category === '研究' || s.category === '分析'
  );

  scores['编程能力'] = calculateSkillScore(techSkills) + calculateProjectScore(projects, 'technical');
  scores['算法与数据结构'] = Math.round(scores['编程能力'] * 0.8);
  scores['技术实现'] = scores['编程能力'];
  scores['技术技能'] = scores['编程能力'];

  scores['设计思维'] = calculateSkillScore(designSkills) + calculateProjectScore(projects, 'design');
  scores['原型设计'] = Math.round(scores['设计思维'] * 0.9);
  scores['设计能力'] = scores['设计思维'];
  scores['创意思维'] = Math.round(scores['设计思维'] * 0.85);

  scores['用户研究'] = calculateSkillScore(researchSkills) + calculateProjectScore(projects, 'research');
  scores['研究潜力'] = Math.round(scores['用户研究'] * 0.8 + calculateAcademicScore(background) * 0.2);
  scores['数据分析'] = calculateSkillScore(researchSkills) + calculateProjectScore(projects, 'data');
  scores['数据可视化'] = Math.round(scores['数据分析'] * 0.85);
  scores['统计建模'] = Math.round(scores['数据分析'] * 0.8);

  scores['数学与统计'] = calculateAcademicScore(background) + calculateSkillScore(
    background.skills.filter((s) => s.category === '数学' || s.category === '统计')
  );
  scores['机器学习'] = Math.round(scores['编程能力'] * 0.4 + scores['数学与统计'] * 0.6);

  scores['学术背景'] = calculateAcademicScore(background);

  scores['项目深度'] = calculateProjectDepthScore(projects);
  scores['项目叙事'] = calculateProjectNarrativeScore(projects);
  scores['作品质量'] = calculateProjectDepthScore(projects);
  scores['概念深度'] = calculateProjectNarrativeScore(projects);
  scores['技术表达'] = Math.round(scores['设计能力'] * 0.7 + scores['技术技能'] * 0.3);

  scores['跨学科能力'] = calculateInterdisciplinaryScore(projects, background);
  scores['领域应用'] = Math.round(scores['跨学科能力'] * 0.8);
  scores['商业敏感度'] = calculateBusinessScore(background, projects);
  scores['沟通表达'] = calculateCommunicationScore(projects, background);
  scores['职业经历'] = calculateExperienceScore(background);
  scores['人文关怀'] = calculateHumanitiesScore(projects, background);
  scores['手绘技能'] = calculateSkillScore(
    background.skills.filter((s) => s.category === '艺术' || s.category === '手绘')
  );

  return scores;
}

function calculateSkillScore(skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, skill) => sum + skillLevelMap[skill.level], 0);
  return Math.min(100, Math.round(total / Math.max(3, skills.length)));
}

function calculateProjectScore(projects: Project[], type: string): number {
  if (projects.length === 0) return 0;

  const typeWeights: Record<string, number> = {
    technical: 0.6,
    design: 0.7,
    research: 0.5,
    data: 0.6,
  };

  const weight = typeWeights[type] || 0.5;
  const baseScore = Math.min(100, projects.length * 15);
  const depthBonus = projects.reduce((sum, p) => {
    const processBonus = p.processNodes.length > 3 ? 10 : p.processNodes.length > 0 ? 5 : 0;
    const difficultyBonus = p.difficulties.length > 2 ? 5 : 0;
    return sum + processBonus + difficultyBonus;
  }, 0);

  return Math.min(100, Math.round((baseScore + depthBonus / projects.length) * weight));
}

function calculateAcademicScore(background: Background): number {
  const eduCount = background.education.length;
  const relevantCourses = background.skills.filter(
    (s) => s.category === '学术' || s.category === '数学' || s.category === '理论'
  ).length;
  return Math.min(100, eduCount * 20 + relevantCourses * 10);
}

function calculateProjectDepthScore(projects: Project[]): number {
  if (projects.length === 0) return 0;
  const avgDepth = projects.reduce((sum, p) => {
    const outputScore = p.outputs.length * 5;
    const difficultyScore = p.difficulties.length * 8;
    const growthScore = p.growth ? 15 : 0;
    const processScore = p.processNodes.length * 4;
    return sum + Math.min(100, outputScore + difficultyScore + growthScore + processScore);
  }, 0) / projects.length;
  return Math.round(avgDepth);
}

function calculateProjectNarrativeScore(projects: Project[]): number {
  if (projects.length === 0) return 0;
  const avgNarrative = projects.reduce((sum, p) => {
    const descScore = p.description ? 20 : 0;
    const growthScore = p.growth ? 25 : 0;
    const processScore = p.processNodes.length * 8;
    return sum + Math.min(100, descScore + growthScore + processScore);
  }, 0) / projects.length;
  return Math.round(avgNarrative);
}

function calculateInterdisciplinaryScore(projects: Project[], background: Background): number {
  const projectTypes = new Set(
    projects.flatMap((p) => p.processNodes.map((n) => n.type))
  );
  const skillCategories = new Set(background.skills.map((s) => s.category));
  const eduMajors = new Set(background.education.map((e) => e.major));

  const diversityScore = (projectTypes.size + skillCategories.size + eduMajors.size) * 8;
  return Math.min(100, diversityScore);
}

function calculateBusinessScore(background: Background, projects: Project[]): number {
  const bizSkills = background.skills.filter(
    (s) => s.category === '商业' || s.category === '管理'
  ).length;
  const bizExperience = background.experience.filter(
    (e) => {
      const position = (e.position || '').toLowerCase();
      const description = (e.description || '').toLowerCase();
      return position.includes('分析') || position.includes('商业') || 
             position.includes('产品') || position.includes('市场') ||
             description.includes('分析') || description.includes('商业');
    }
  ).length;
  const bizProjects = projects.filter(
    (p) => (p.description || '').includes('商业') || (p.description || '').includes('市场')
  ).length;
  const hasAnyExperience = background.experience.length > 0;
  const baseScore = hasAnyExperience ? 15 : 0;
  return Math.min(100, baseScore + bizSkills * 15 + bizExperience * 25 + bizProjects * 20);
}

function calculateCommunicationScore(projects: Project[], background: Background): number {
  const writingScore = background.motivation ? 30 : 0;
  const projectDescScore = projects.filter((p) => p.description && p.growth).length * 15;
  return Math.min(100, writingScore + projectDescScore);
}

function calculateExperienceScore(background: Background): number {
  if (background.experience.length === 0) return 0;
  
  const expMonths = background.experience.reduce((sum, exp) => {
    if (!exp.startDate) {
      return sum + 1;
    }
    const start = new Date(exp.startDate);
    if (isNaN(start.getTime())) {
      return sum + 1;
    }
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    if (isNaN(end.getTime())) {
      return sum + 1;
    }
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 0) months = 0;
    return sum + Math.max(1, months);
  }, 0);
  
  const hasAnyExperience = background.experience.length > 0;
  const baseScore = hasAnyExperience ? 20 : 0;
  const positionBonus = background.experience.filter(e => e.position && e.position.trim()).length * 10;
  const descriptionBonus = background.experience.filter(e => e.description && e.description.trim()).length * 15;
  
  return Math.min(100, Math.round(baseScore + expMonths * 1.5 + positionBonus + descriptionBonus));
}

function calculateHumanitiesScore(projects: Project[], background: Background): number {
  const humanitiesProjects = projects.filter(
    (p) => (p.description || '').includes('社会') || (p.description || '').includes('文化') || (p.description || '').includes('环境')
  ).length;
  const humanitySkills = background.skills.filter(
    (s) => s.category === '艺术' || s.category === '人文' || s.category === '社会'
  ).length;
  return Math.min(100, humanitiesProjects * 20 + humanitySkills * 15);
}

function generateSuggestions(dimension: string, gap: number, currentLevel: number): string[] {
  const suggestions: string[] = [];

  if (gap <= 0) {
    suggestions.push(`${dimension}能力已达到目标要求，继续保持！`);
    return suggestions;
  }

  if (currentLevel < 30) {
    suggestions.push(`建议从基础开始学习${dimension}的核心概念和方法`);
    suggestions.push(`可以通过在线课程系统学习${dimension}的基础知识`);
  } else if (currentLevel < 60) {
    suggestions.push(`加强${dimension}的实践练习，在项目中主动应用`);
    suggestions.push(`寻找${dimension}相关的练习项目，积累实战经验`);
  } else {
    suggestions.push(`深化${dimension}的理解，尝试更复杂的应用场景`);
    suggestions.push(`在项目中展现${dimension}的高级应用和创新`);
  }

  if (dimension.includes('设计') || dimension.includes('创意')) {
    suggestions.push('参考优秀作品集，学习他人的设计表达和叙事方式');
  }
  if (dimension.includes('技术') || dimension.includes('编程')) {
    suggestions.push('在GitHub上开源项目，积累代码贡献记录');
  }
  if (dimension.includes('研究') || dimension.includes('学术')) {
    suggestions.push('考虑参与研究项目或撰写相关论文');
  }

  return suggestions;
}

export function calculateOverallScore(gaps: AbilityGap[]): number {
  if (gaps.length === 0) return 0;
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const maxPossibleGap = gaps.length * 100;
  return Math.max(0, Math.min(100, 100 - Math.round((totalGap / maxPossibleGap) * 100)));
}
