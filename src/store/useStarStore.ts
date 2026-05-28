// src/store/useStarStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StarState {
  stars: number;
  unlockedFeatures: string[];
  addStar: () => void;
  addStars: (amount: number) => void;
  resetStars: () => void;
  unlockFeature: (featureName: string) => void;
  lockFeature: (featureName: string) => void;
  lockFeaturesByPattern: (pattern: RegExp) => void;
  setMigrationData: (data: { stars?: number }) => void;
}

const isSessionFeature = (f: string) =>
  f === 'wordsearch_hard' ||
  f === 'wordsearch_complex';

const useStarStore = create<StarState>()(
  persist(
    (set) => ({
      stars: 50, // Default initial value
      unlockedFeatures: [],

      setMigrationData: (data: any) =>
        set((state) => ({
          stars: data.stars !== undefined ? data.stars : state.stars,
        })),

      addStar: () =>
        set((state) => ({
          stars: state.stars + 1,
        })),

      addStars: (amount: number) =>
        set((state) => ({
          stars: state.stars + amount,
        })),

      resetStars: () =>
        set(() => ({
          stars: 0,
        })),

      unlockFeature: (featureName: string) =>
        set((state) => ({
          unlockedFeatures: state.unlockedFeatures.includes(featureName)
            ? state.unlockedFeatures
            : [...state.unlockedFeatures, featureName],
        })),

      lockFeature: (featureName: string) =>
        set((state) => ({
          unlockedFeatures: state.unlockedFeatures.filter((f) => f !== featureName),
        })),

      lockFeaturesByPattern: (pattern: RegExp) =>
        set((state) => ({
          unlockedFeatures: state.unlockedFeatures.filter((f) => !pattern.test(f)),
        })),
    }),
    {
      name: 'star-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        unlockedFeatures: state.unlockedFeatures.filter((f) => !isSessionFeature(f)),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.unlockedFeatures = state.unlockedFeatures.filter((f) => !isSessionFeature(f));
        }
        // Migration logic for old users
        const oldStars = localStorage.getItem('stars');

        if (oldStars) {
          state?.setMigrationData({
            stars: parseInt(oldStars, 10),
          });

          // Clean up old keys after migration to prevent re-migration
          localStorage.removeItem('stars');
        }
      },
    },
  ),
);

export default useStarStore;
