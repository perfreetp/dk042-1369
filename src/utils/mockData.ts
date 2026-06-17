import type { School, ProgramRequirement } from '../types';

export const schoolDatabase: School[] = [
  {
    id: 'cmu',
    name: '卡内基梅隆大学 (CMU)',
    programs: [
      {
        id: 'cmu-hci',
        name: '人机交互 (HCI)',
        degree: 'Master',
        description: '注重设计思维、技术实现和用户研究的综合能力',
        requirements: generateHCIRequirements(),
      },
      {
        id: 'cmu-cs',
        name: '计算机科学 (CS)',
        degree: 'Master',
        description: '强调算法基础、编程能力和学术研究潜力',
        requirements: generateCSRequirements(),
      },
    ],
  },
  {
    id: 'stanford',
    name: '斯坦福大学',
    programs: [
      {
        id: 'stanford-cs',
        name: '计算机科学 (CS)',
        degree: 'Master',
        description: '注重创新能力、研究潜力和工程实践',
        requirements: generateCSRequirements(),
      },
      {
        id: 'stanford-ds',
        name: '数据科学 (Data Science)',
        degree: 'Master',
        description: '融合统计学、计算机科学和领域应用',
        requirements: generateDSRequirements(),
      },
    ],
  },
  {
    id: 'mit',
    name: '麻省理工学院 (MIT)',
    programs: [
      {
        id: 'mit-media',
        name: '媒体艺术与科学 (MAS)',
        degree: 'Master',
        description: '跨学科创新，注重技术与艺术的融合',
        requirements: generateMediaRequirements(),
      },
      {
        id: 'mit-cs',
        name: '计算机科学 (CS)',
        degree: 'Master',
        description: '强调学术深度和技术创新能力',
        requirements: generateCSRequirements(),
      },
    ],
  },
  {
    id: 'berkeley',
    name: '加州大学伯克利分校 (UC Berkeley)',
    programs: [
      {
        id: 'berkeley-ixd',
        name: '交互设计 (IXD)',
        degree: 'MDes',
        description: '以人为本的设计，注重社会影响力',
        requirements: generateHCIRequirements(),
      },
      {
        id: 'berkeley-ba',
        name: '商业分析 (Business Analytics)',
        degree: 'Master',
        description: '数据驱动的商业决策能力',
        requirements: generateBARequirements(),
      },
    ],
  },
  {
    id: 'risd',
    name: '罗德岛设计学院 (RISD)',
    programs: [
      {
        id: 'risd-dm',
        name: '数字媒体 (Digital Media)',
        degree: 'MFA',
        description: '艺术与技术的跨界探索',
        requirements: generateMediaRequirements(),
      },
      {
        id: 'risd-arch',
        name: '建筑学 (Architecture)',
        degree: 'MArch',
        description: '设计思维、技术能力和人文关怀',
        requirements: generateArchRequirements(),
      },
    ],
  },
  {
    id: 'columbia',
    name: '哥伦比亚大学',
    programs: [
      {
        id: 'columbia-cs',
        name: '计算机科学 (CS)',
        degree: 'Master',
        description: '理论与实践并重的计算机科学教育',
        requirements: generateCSRequirements(),
      },
      {
        id: 'columbia-ds',
        name: '数据科学 (Data Science)',
        degree: 'Master',
        description: '数据科学的理论基础和应用能力',
        requirements: generateDSRequirements(),
      },
    ],
  },
];

function generateCSRequirements(): ProgramRequirement[] {
  return [
    { id: 'cs-1', dimension: '算法与数据结构', description: '掌握核心算法和数据结构，能够分析复杂度', weight: 25, requiredLevel: 85 },
    { id: 'cs-2', dimension: '编程能力', description: '至少精通一门编程语言，有实际项目经验', weight: 25, requiredLevel: 80 },
    { id: 'cs-3', dimension: '学术背景', description: '数学、计算机相关课程基础扎实', weight: 20, requiredLevel: 75 },
    { id: 'cs-4', dimension: '项目深度', description: '项目能体现技术深度和问题解决能力', weight: 15, requiredLevel: 80 },
    { id: 'cs-5', dimension: '研究潜力', description: '展现出对计算机科学的研究兴趣和潜力', weight: 10, requiredLevel: 70 },
    { id: 'cs-6', dimension: '跨学科能力', description: '能够将计算机技术应用到其他领域', weight: 5, requiredLevel: 60 },
  ];
}

function generateHCIRequirements(): ProgramRequirement[] {
  return [
    { id: 'hci-1', dimension: '设计思维', description: '展现出用户中心的设计思维和方法论', weight: 25, requiredLevel: 85 },
    { id: 'hci-2', dimension: '用户研究', description: '能够进行用户访谈、调研和数据分析', weight: 20, requiredLevel: 80 },
    { id: 'hci-3', dimension: '原型设计', description: '掌握交互原型设计工具和方法', weight: 20, requiredLevel: 80 },
    { id: 'hci-4', dimension: '技术实现', description: '具备基础的前端开发或技术实现能力', weight: 15, requiredLevel: 70 },
    { id: 'hci-5', dimension: '项目叙事', description: '能够清晰地讲述设计过程和决策', weight: 10, requiredLevel: 75 },
    { id: 'hci-6', dimension: '跨学科能力', description: '展现跨学科学习和协作的能力', weight: 10, requiredLevel: 70 },
  ];
}

function generateDSRequirements(): ProgramRequirement[] {
  return [
    { id: 'ds-1', dimension: '数学与统计', description: '扎实的线性代数、概率统计基础', weight: 25, requiredLevel: 85 },
    { id: 'ds-2', dimension: '编程能力', description: 'Python/R 编程熟练，掌握数据处理库', weight: 25, requiredLevel: 80 },
    { id: 'ds-3', dimension: '机器学习', description: '理解核心机器学习算法和应用场景', weight: 20, requiredLevel: 75 },
    { id: 'ds-4', dimension: '数据可视化', description: '能够清晰展示数据分析结果', weight: 15, requiredLevel: 70 },
    { id: 'ds-5', dimension: '领域应用', description: '展现将数据科学应用于实际问题的能力', weight: 10, requiredLevel: 70 },
    { id: 'ds-6', dimension: '学术背景', description: '相关课程和学术项目经历', weight: 5, requiredLevel: 65 },
  ];
}

function generateBARequirements(): ProgramRequirement[] {
  return [
    { id: 'ba-1', dimension: '商业敏感度', description: '理解商业问题，能够将数据转化为商业洞察', weight: 25, requiredLevel: 80 },
    { id: 'ba-2', dimension: '数据分析', description: '掌握数据分析方法和工具', weight: 25, requiredLevel: 80 },
    { id: 'ba-3', dimension: '统计建模', description: '能够运用统计模型解决商业问题', weight: 20, requiredLevel: 75 },
    { id: 'ba-4', dimension: '编程能力', description: 'SQL、Python/R 数据分析能力', weight: 15, requiredLevel: 70 },
    { id: 'ba-5', dimension: '沟通表达', description: '能够清晰传达分析结果和建议', weight: 10, requiredLevel: 75 },
    { id: 'ba-6', dimension: '职业经历', description: '相关工作或实习经历', weight: 5, requiredLevel: 65 },
  ];
}

function generateMediaRequirements(): ProgramRequirement[] {
  return [
    { id: 'media-1', dimension: '创意思维', description: '展现独特的创意和艺术表达能力', weight: 25, requiredLevel: 85 },
    { id: 'media-2', dimension: '技术技能', description: '掌握相关创作工具和技术手段', weight: 25, requiredLevel: 80 },
    { id: 'media-3', dimension: '作品质量', description: '作品集展现出专业水准和个人风格', weight: 20, requiredLevel: 85 },
    { id: 'media-4', dimension: '概念深度', description: '作品有清晰的概念和思考深度', weight: 15, requiredLevel: 75 },
    { id: 'media-5', dimension: '跨学科能力', description: '展现跨媒介、跨领域的探索', weight: 10, requiredLevel: 70 },
    { id: 'media-6', dimension: '学术背景', description: '相关教育和学习经历', weight: 5, requiredLevel: 60 },
  ];
}

function generateArchRequirements(): ProgramRequirement[] {
  return [
    { id: 'arch-1', dimension: '设计能力', description: '展现建筑设计的创造力和空间想象力', weight: 25, requiredLevel: 85 },
    { id: 'arch-2', dimension: '技术表达', description: '图纸、模型、渲染等表达能力', weight: 25, requiredLevel: 80 },
    { id: 'arch-3', dimension: '概念深度', description: '设计有清晰的概念支撑和理论思考', weight: 20, requiredLevel: 75 },
    { id: 'arch-4', dimension: '技术知识', description: '结构、材料、建造等技术知识', weight: 15, requiredLevel: 70 },
    { id: 'arch-5', dimension: '人文关怀', description: '对社会、文化、环境的关注', weight: 10, requiredLevel: 70 },
    { id: 'arch-6', dimension: '手绘技能', description: '草图和手绘表达能力', weight: 5, requiredLevel: 60 },
  ];
}

export const defaultMaterialChecklist = [
  { id: 'mat-1', category: '基本信息', item: '个人简历 (CV/Resume)', required: true, completed: false, priority: 'high' as const, notes: '1-2页，突出相关经历' },
  { id: 'mat-2', category: '基本信息', item: '个人陈述 (Personal Statement)', required: true, completed: false, priority: 'high' as const, notes: '讲述转专业动机和职业规划' },
  { id: 'mat-3', category: '基本信息', item: '推荐信 (3封)', required: true, completed: false, priority: 'high' as const, notes: '提前联系推荐人' },
  { id: 'mat-4', category: '学术材料', item: '成绩单', required: true, completed: false, priority: 'high' as const, notes: '需要官方认证翻译' },
  { id: 'mat-5', category: '学术材料', item: '学历证明', required: true, completed: false, priority: 'high' as const, notes: '毕业证、学位证' },
  { id: 'mat-6', category: '语言成绩', item: 'TOEFL / IELTS', required: true, completed: false, priority: 'high' as const, notes: '注意成绩有效期' },
  { id: 'mat-7', category: '语言成绩', item: 'GRE / GMAT', required: false, completed: false, priority: 'medium' as const, notes: '部分项目要求或推荐' },
  { id: 'mat-8', category: '作品集', item: '项目封面与目录', required: true, completed: false, priority: 'high' as const, notes: '清晰的视觉引导' },
  { id: 'mat-9', category: '作品集', item: '3-5个核心项目', required: true, completed: false, priority: 'high' as const, notes: '项目质量大于数量' },
  { id: 'mat-10', category: '作品集', item: '过程记录', required: true, completed: false, priority: 'medium' as const, notes: '展现思考过程' },
  { id: 'mat-11', category: '作品集', item: '个人介绍页', required: false, completed: false, priority: 'low' as const, notes: '展现个人特色' },
  { id: 'mat-12', category: '其他', item: 'Writing Sample', required: false, completed: false, priority: 'medium' as const, notes: '部分研究型项目要求' },
  { id: 'mat-13', category: '其他', item: '作品集网站', required: false, completed: false, priority: 'medium' as const, notes: '线上版本便于分享' },
];

export const skillLevelMap: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export const skillLevelLabels: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};
