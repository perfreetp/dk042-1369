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

  saveVersion: (name: string, description: string) => void;
  loadVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;
  compareVersions: (v1Id: string, v2Id: string) => VersionDiff | null;

  generateSubmissionList: () => SubmissionItem[];
  updateSubmissionItem: (id: string, updates: Partial<SubmissionItem>) => void;
  regenerateSubmissionList: () => SubmissionItem[];
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
      materialChecklist: [...defaultMaterialChecklist],
      versions: [],
      currentVersionId: null,
      submissionItems: [],

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
        const preservedState: Record<string, { completed: boolean; notes: string }> = {};
        state.submissionItems.forEach((item) => {
          preservedState[item.item] = {
            completed: item.completed,
            notes: item.notes || '',
          };
        });
        const mergedItems = newItems.map((item) => ({
          ...item,
          completed: preservedState[item.item]?.completed ?? item.completed,
          notes: preservedState[item.item]?.notes ?? item.notes,
        }));
        set({ submissionItems: mergedItems });
        return mergedItems;
      },

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
          materialChecklist: [...defaultMaterialChecklist],
          versions: [],
          currentVersionId: null,
          submissionItems: [],
        }),
    }),
    {
      name: 'portfolio-diagnosis-storage',
    }
  )
);
