import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project,
  Background,
  TargetProgram,
  AbilityGap,
  MaterialCheckItem,
  PortfolioVersion,
  PortfolioData,
  VersionDiff,
  SubmissionItem,
  TimelineItem,
} from '../types';
import { defaultMaterialChecklist } from '../utils/mockData';
import { generateAbilityGaps } from '../utils/diagnosis';
import {
  createVersion,
  compareVersions as compareVersionsUtil,
  exportToJSON,
  importFromJSON,
  generateSubmissionList,
} from '../utils/versionControl';
import { exportToPDF as exportToPDFUtil } from '../utils/pdfExport';

interface PortfolioState {
  projects: Project[];
  background: Background;
  targetProgram: TargetProgram | null;
  materialChecklist: MaterialCheckItem[];
  versions: PortfolioVersion[];
  currentVersionId: string | null;
  submissionItems: SubmissionItem[];
  timelineItems: TimelineItem[];

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  updateBackground: (background: Partial<Background>) => void;
  addEducation: (edu: Omit<Background['education'][0], 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Background['education'][0]>) => void;
  deleteEducation: (id: string) => void;
  addExperience: (exp: Omit<Background['experience'][0], 'id'>) => void;
  updateExperience: (id: string, updates: Partial<Background['experience'][0]>) => void;
  deleteExperience: (id: string) => void;
  addSkill: (skill: Omit<Background['skills'][0], 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Background['skills'][0]>) => void;
  deleteSkill: (id: string) => void;

  setTargetProgram: (program: TargetProgram | null) => void;
  generateDiagnosis: () => AbilityGap[];
  checkMaterialCompleteness: () => MaterialCheckItem[];
  updateMaterialCheckItem: (id: string, updates: Partial<MaterialCheckItem>) => void;
  regenerateMaterialChecklist: () => void;

  saveVersion: (name: string, description: string) => void;
  loadVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;
  compareVersions: (v1Id: string, v2Id: string) => VersionDiff | null;

  generateSubmissionList: () => SubmissionItem[];
  updateSubmissionItem: (id: string, updates: Partial<SubmissionItem>) => void;
  addCustomSubmissionItem: (item: Omit<SubmissionItem, 'id' | 'isCustom'>) => void;
  deleteSubmissionItem: (id: string) => void;
  regenerateSubmissionList: () => SubmissionItem[];

  generateTimeline: () => TimelineItem[];
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  addCustomTimelineItem: (item: Omit<TimelineItem, 'id' | 'isCustom'>) => void;
  deleteTimelineItem: (id: string) => void;

  exportToPDF: () => Promise<void>;
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;

  getPortfolioData: () => PortfolioData;
  resetAll: () => void;
}

const initialBackground: Background = {
  education: [],
  experience: [],
  skills: [],
  motivation: '',
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      projects: [],
      background: initialBackground,
      targetProgram: null,
      materialChecklist: [],
      versions: [],
      currentVersionId: null,
      submissionItems: [],
      timelineItems: [],

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      reorderProjects: (fromIndex, toIndex) =>
        set((state) => {
          const newProjects = [...state.projects].sort((a, b) => a.order - b.order);
          const [removed] = newProjects.splice(fromIndex, 1);
          newProjects.splice(toIndex, 0, removed);
          return {
            projects: newProjects.map((p, i) => ({ ...p, order: i })),
          };
        }),

      updateBackground: (background) =>
        set((state) => ({
          background: { ...state.background, ...background },
        })),

      addEducation: (edu) =>
        set((state) => ({
          background: {
            ...state.background,
            education: [
              ...state.background.education,
              { ...edu, id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
            ],
          },
        })),

      updateEducation: (id, updates) =>
        set((state) => ({
          background: {
            ...state.background,
            education: state.background.education.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),

      deleteEducation: (id) =>
        set((state) => ({
          background: {
            ...state.background,
            education: state.background.education.filter((e) => e.id !== id),
          },
        })),

      addExperience: (exp) =>
        set((state) => ({
          background: {
            ...state.background,
            experience: [
              ...state.background.experience,
              { ...exp, id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
            ],
          },
        })),

      updateExperience: (id, updates) =>
        set((state) => ({
          background: {
            ...state.background,
            experience: state.background.experience.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),

      deleteExperience: (id) =>
        set((state) => ({
          background: {
            ...state.background,
            experience: state.background.experience.filter((e) => e.id !== id),
          },
        })),

      addSkill: (skill) =>
        set((state) => ({
          background: {
            ...state.background,
            skills: [
              ...state.background.skills,
              { ...skill, id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
            ],
          },
        })),

      updateSkill: (id, updates) =>
        set((state) => ({
          background: {
            ...state.background,
            skills: state.background.skills.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        })),

      deleteSkill: (id) =>
        set((state) => ({
          background: {
            ...state.background,
            skills: state.background.skills.filter((s) => s.id !== id),
          },
        })),

      setTargetProgram: (program) => set({ targetProgram: program }),

      generateDiagnosis: () => {
        const state = get();
        return generateAbilityGaps(state.projects, state.background, state.targetProgram);
      },

      checkMaterialCompleteness: () => {
        const state = get();
        return state.materialChecklist;
      },

      updateMaterialCheckItem: (id, updates) =>
        set((state) => ({
          materialChecklist: state.materialChecklist.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      regenerateMaterialChecklist: () =>
        set(() => ({
          materialChecklist: [...defaultMaterialChecklist],
        })),

      saveVersion: (name, description) => {
        const state = get();
        const data = state.getPortfolioData();
        const version = createVersion(name, description, data);
        set((s) => ({
          versions: [...s.versions, version],
          currentVersionId: version.id,
        }));
      },

      loadVersion: (versionId) => {
        const state = get();
        const version = state.versions.find((v) => v.id === versionId);
        if (version) {
          set({
            projects: version.data.projects,
            background: version.data.background,
            targetProgram: version.data.targetProgram,
            materialChecklist: version.data.materialChecklist,
            currentVersionId: versionId,
          });
        }
      },

      deleteVersion: (versionId) =>
        set((state) => ({
          versions: state.versions.filter((v) => v.id !== versionId),
          currentVersionId:
            state.currentVersionId === versionId ? null : state.currentVersionId,
        })),

      compareVersions: (v1Id, v2Id) => {
        const state = get();
        const v1 = state.versions.find((v) => v.id === v1Id);
        const v2 = state.versions.find((v) => v.id === v2Id);
        if (v1 && v2) {
          return compareVersionsUtil(v1.data, v2.data);
        }
        return null;
      },

      generateSubmissionList: () => {
        const state = get();
        if (state.submissionItems.length > 0) {
          return state.submissionItems;
        }
        const data = state.getPortfolioData();
        const newItems = generateSubmissionList(data);
        set({ submissionItems: newItems });
        return newItems;
      },

      updateSubmissionItem: (id, updates) =>
        set((state) => ({
          submissionItems: state.submissionItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      regenerateSubmissionList: () => {
        const state = get();
        const data = state.getPortfolioData();
        const newItems = generateSubmissionList(data);
        const customItems = state.submissionItems.filter((item) => item.isCustom);
        const preservedState: Record<string, { completed: boolean; notes: string; category: string; deadline: string }> = {};
        state.submissionItems.forEach((item) => {
          preservedState[item.item] = {
            completed: item.completed,
            notes: item.notes || '',
            category: item.category,
            deadline: item.deadline,
          };
        });
        const mergedItems = [
          ...newItems.map((item) => ({
            ...item,
            completed: preservedState[item.item]?.completed ?? item.completed,
            notes: preservedState[item.item]?.notes ?? item.notes,
            category: preservedState[item.item]?.category ?? item.category,
            deadline: preservedState[item.item]?.deadline ?? item.deadline,
          })),
          ...customItems,
        ];
        set({ submissionItems: mergedItems });
        return mergedItems;
      },

      addCustomSubmissionItem: (item) =>
        set((state) => ({
          submissionItems: [
            ...state.submissionItems,
            {
              ...item,
              id: `sub-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              isCustom: true,
            },
          ],
        })),

      deleteSubmissionItem: (id) =>
        set((state) => ({
          submissionItems: state.submissionItems.filter((item) => item.id !== id),
        })),

      generateTimeline: () => {
        const state = get();
        if (state.timelineItems.length > 0) {
          return state.timelineItems;
        }
        if (!state.targetProgram || !state.targetProgram.deadline) {
          return [];
        }
        const deadline = new Date(state.targetProgram.deadline);
        if (isNaN(deadline.getTime())) {
          return [];
        }
        const addDays = (date: Date, days: number) => {
          const result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        };
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const defaultTimeline: TimelineItem[] = [
          {
            id: 'tl-deadline',
            title: '申请截止',
            description: `${state.targetProgram.school} ${state.targetProgram.major} 申请提交截止`,
            category: 'deadline',
            deadline: formatDate(deadline),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-portfolio-final',
            title: '作品集定稿',
            description: '完成所有项目内容，检查格式和文件大小',
            category: 'portfolio',
            deadline: formatDate(addDays(deadline, -14)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-portfolio-review',
            title: '作品集审阅反馈',
            description: '请他人审阅作品集并获取反馈意见',
            category: 'portfolio',
            deadline: formatDate(addDays(deadline, -28)),
            completed: false,
            importance: 'medium',
            notes: '',
          },
          {
            id: 'tl-recommendation-1',
            title: '确认推荐人',
            description: '联系推荐人，确认其愿意为你写推荐信',
            category: 'recommendation',
            deadline: formatDate(addDays(deadline, -45)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-recommendation-2',
            title: '提交推荐信链接',
            description: '向推荐人提供推荐信提交链接和截止日期',
            category: 'recommendation',
            deadline: formatDate(addDays(deadline, -21)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-recommendation-3',
            title: '跟进推荐信提交',
            description: '确认推荐人已按时提交推荐信',
            category: 'recommendation',
            deadline: formatDate(addDays(deadline, -7)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-material-transcript',
            title: '准备成绩单',
            description: '申请官方成绩单，确保密封盖章',
            category: 'material',
            deadline: formatDate(addDays(deadline, -30)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-material-language',
            title: '语言成绩送分',
            description: '完成托福/雅思/GRE 送分',
            category: 'material',
            deadline: formatDate(addDays(deadline, -25)),
            completed: false,
            importance: 'high',
            notes: '',
          },
          {
            id: 'tl-essay-draft',
            title: '个人陈述初稿',
            description: '完成个人陈述第一稿',
            category: 'material',
            deadline: formatDate(addDays(deadline, -40)),
            completed: false,
            importance: 'medium',
            notes: '',
          },
          {
            id: 'tl-essay-final',
            title: '个人陈述定稿',
            description: '完成个人陈述终稿，检查语法和内容',
            category: 'material',
            deadline: formatDate(addDays(deadline, -10)),
            completed: false,
            importance: 'high',
            notes: '',
          },
        ];
        set({ timelineItems: defaultTimeline });
        return defaultTimeline;
      },

      updateTimelineItem: (id, updates) =>
        set((state) => ({
          timelineItems: state.timelineItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      addCustomTimelineItem: (item) =>
        set((state) => ({
          timelineItems: [
            ...state.timelineItems,
            {
              ...item,
              id: `tl-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              isCustom: true,
            },
          ],
        })),

      deleteTimelineItem: (id) =>
        set((state) => ({
          timelineItems: state.timelineItems.filter((item) => item.id !== id),
        })),

      exportToPDF: async () => {
        const state = get();
        const data = state.getPortfolioData();
        const gaps = state.generateDiagnosis();
        await exportToPDFUtil(data, gaps);
      },

      exportToJSON: () => {
        const state = get();
        const data = state.getPortfolioData();
        return exportToJSON(data);
      },

      importFromJSON: (json) => {
        const data = importFromJSON(json);
        if (data) {
          set({
            projects: data.projects,
            background: data.background,
            targetProgram: data.targetProgram,
            materialChecklist: data.materialChecklist,
          });
          return true;
        }
        return false;
      },

      getPortfolioData: () => {
        const state = get();
        return {
          projects: state.projects,
          background: state.background,
          targetProgram: state.targetProgram,
          materialChecklist: state.materialChecklist,
        };
      },

      resetAll: () =>
        set({
          projects: [],
          background: initialBackground,
          targetProgram: null,
          materialChecklist: [],
          versions: [],
          currentVersionId: null,
          submissionItems: [],
          timelineItems: [],
        }),
    }),
    {
      name: 'portfolio-diagnosis-storage',
    }
  )
);
