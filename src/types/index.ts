export interface Project {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  role: string;
  description: string;
  outputs: string[];
  difficulties: string[];
  growth: string;
  processNodes: ProcessNode[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProcessNode {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'learning' | 'breakthrough' | 'milestone' | 'challenge';
}

export interface Background {
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  motivation: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface TargetProgram {
  id: string;
  school: string;
  major: string;
  degree: string;
  deadline: string;
  requirements: ProgramRequirement[];
}

export interface ProgramRequirement {
  id: string;
  dimension: string;
  description: string;
  weight: number;
  requiredLevel: number;
}

export interface AbilityGap {
  dimension: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  suggestions: string[];
}

export interface MaterialCheckItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export interface PortfolioVersion {
  id: string;
  name: string;
  createdAt: number;
  description: string;
  data: PortfolioData;
}

export interface PortfolioData {
  projects: Project[];
  background: Background;
  targetProgram: TargetProgram | null;
  materialChecklist: MaterialCheckItem[];
}

export interface SubmissionItem {
  id: string;
  category: string;
  item: string;
  deadline: string;
  completed: boolean;
  notes: string;
  isCustom?: boolean;
  daysOffset?: number;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  category: 'deadline' | 'portfolio' | 'recommendation' | 'material' | 'other';
  deadline: string;
  completed: boolean;
  importance: 'high' | 'medium' | 'low';
  notes: string;
  isCustom?: boolean;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

export interface School {
  id: string;
  name: string;
  programs: ProgramInfo[];
}

export interface ProgramInfo {
  id: string;
  name: string;
  degree: string;
  description: string;
  requirements: ProgramRequirement[];
}
