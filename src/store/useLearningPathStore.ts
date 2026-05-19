import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEARNING_PATH_LEVELS } from '../data/learningPath';

export interface Task {
  id: string;
  path: string;
  targetScore: number;
  label: string;
  type: string;
}

export interface Level {
  id: number;
  title: string;
  tasks: Task[];
}

interface LearningPathState {
  unlockedLevels: number[];
  completedTasks: Record<string, boolean>;
  currentActiveTask: Task | null;
  justCompletedLevel: number | null;
  isAnimating: boolean;
  isTaskReadyToComplete: boolean;
  setActiveTask: (task: Task | null) => void;
  completeTask: (taskId: string) => void;
  setJustCompletedLevel: (levelId: number | null) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setIsTaskReadyToComplete: (isReady: boolean) => void;
  unlockLevel: (levelId: number) => void;
  skipLevel: (levelId: number) => void;
  resetProgress: () => void;
}

export const useLearningPathStore = create<LearningPathState>()(
  persist(
    (set, get) => ({
      unlockedLevels: [1],
      completedTasks: {},
      currentActiveTask: null,
      justCompletedLevel: null,
      isAnimating: false,
      isTaskReadyToComplete: false,
      setActiveTask: (task) => set({ currentActiveTask: task, isTaskReadyToComplete: false }),
      completeTask: (taskId) => {
        const state = get();
        // If task is already completed, just update it (though it shouldn't change much)
        // and avoid re-triggering level completion
        const updatedCompletedTasks = { ...state.completedTasks, [taskId]: true };

        // Determine level from taskId (e.g., 'l7_t1' -> 7)
        const levelMatch = taskId.match(/^l(\d+)_/);
        if (levelMatch) {
          const levelId = parseInt(levelMatch[1]);
          const level = LEARNING_PATH_LEVELS.find((l) => l.id === levelId);
          if (level) {
            // Check if level was ALREADY complete before this call
            const wasLevelAlreadyComplete = level.tasks.every((t) => state.completedTasks[t.id]);
            const isLevelNowComplete = level.tasks.every((t) => updatedCompletedTasks[t.id]);

            if (isLevelNowComplete && !wasLevelAlreadyComplete) {
              set({
                completedTasks: updatedCompletedTasks,
                justCompletedLevel: levelId,
                isTaskReadyToComplete: false,
              });
              return;
            }
          }
        }

        set({ completedTasks: updatedCompletedTasks, isTaskReadyToComplete: false });
      },
      setJustCompletedLevel: (levelId) => set({ justCompletedLevel: levelId }),
      setIsAnimating: (isAnimating) => set({ isAnimating }),
      setIsTaskReadyToComplete: (isReady) => set({ isTaskReadyToComplete: isReady }),
      unlockLevel: (levelId) =>
        set((state) => {
          if (!state.unlockedLevels.includes(levelId)) {
            return { unlockedLevels: [...state.unlockedLevels, levelId] };
          }
          return state;
        }),
      skipLevel: (levelId) => {
        const state = get();
        const level = LEARNING_PATH_LEVELS.find((l) => l.id === levelId);
        if (level) {
          const updatedCompletedTasks = { ...state.completedTasks };
          level.tasks.forEach((t) => {
            updatedCompletedTasks[t.id] = true;
          });
          set({
            completedTasks: updatedCompletedTasks,
            justCompletedLevel: levelId,
          });
        }
      },
      resetProgress: () =>
        set({
          unlockedLevels: [1],
          completedTasks: {},
          currentActiveTask: null,
          justCompletedLevel: null,
        }),
    }),
    {
      name: 'tiny-steps-storage',
    },
  ),
);
