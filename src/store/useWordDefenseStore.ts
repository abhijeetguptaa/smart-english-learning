import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useStarStore from '../store/useStarStore';

export interface DailyMission {
  id: string;
  title: string;
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unlocked: boolean;
  icon: string;
}

export interface Cosmetics {
  castles: string[];
  skins: string[];
  cannons: string[];
  backgrounds: string[];
  flags: string[];
}

export interface SelectedCosmetics {
  castle: string;
  skin: string;
  cannon: string;
  background: string;
  flag: string;
}

export interface GameStats {
  highScore: number;
  bestCombo: number;
  totalCoins: number;
  totalCorrectAnswers: number;
  gamesPlayed: number;
  timePlayedSeconds: number;
  wordsLearned: string[];
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  categoryStats: Record<string, number>;
  lastPlayedDate: string;
}

interface WordDefenseState {
  stats: GameStats;
  unlockedCosmetics: Cosmetics;
  selectedCosmetics: SelectedCosmetics;
  dailyMissions: DailyMission[];
  achievements: Achievement[];
  lastMissionDate: string;

  // Actions
  recordGameResult: (result: {
    score: number;
    combo: number;
    coins: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    wordsLearnedInGame: string[];
    categoryCounts: Record<string, number>;
  }) => void;

  unlockCosmetic: (category: keyof Cosmetics, itemId: string, cost: number) => boolean;
  selectCosmetic: (category: keyof SelectedCosmetics, itemId: string) => void;
  claimMissionReward: (missionId: string) => void;
  checkAndResetDailyMissions: () => void;
}

const DEFAULT_COSMETICS: Cosmetics = {
  castles: ['classic'],
  skins: ['cute_slimes'],
  cannons: ['wooden_cannon'],
  backgrounds: ['green_meadow'],
  flags: ['star_banner'],
};

const DEFAULT_SELECTED: SelectedCosmetics = {
  castle: 'classic',
  skin: 'cute_slimes',
  cannon: 'wooden_cannon',
  background: 'green_meadow',
  flag: 'star_banner',
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_victory',
    title: 'First Defender',
    description: 'Score at least 500 points in Word Defense',
    target: 500,
    current: 0,
    unlocked: false,
    icon: '🛡️',
  },
  {
    id: 'correct_100',
    title: 'Word Cadet',
    description: 'Answer 100 questions correctly',
    target: 100,
    current: 0,
    unlocked: false,
    icon: '📚',
  },
  {
    id: 'correct_1000',
    title: 'Vocabulary Scholar',
    description: 'Answer 1000 questions correctly',
    target: 1000,
    current: 0,
    unlocked: false,
    icon: '🎓',
  },
  {
    id: 'combo_25',
    title: 'Combo Master',
    description: 'Reach a 25x combo streak',
    target: 25,
    current: 0,
    unlocked: false,
    icon: '🔥',
  },
  {
    id: 'vocab_expert',
    title: 'Vocabulary Expert',
    description: 'Learn 50 unique words',
    target: 50,
    current: 0,
    unlocked: false,
    icon: '🌟',
  },
  {
    id: 'animal_expert',
    title: 'Animal Expert',
    description: 'Answer 30 animal questions correctly',
    target: 30,
    current: 0,
    unlocked: false,
    icon: '🦁',
  },
  {
    id: 'spelling_champion',
    title: 'Spelling Champion',
    description: 'Answer 30 spelling questions correctly',
    target: 30,
    current: 0,
    unlocked: false,
    icon: '✏️',
  },
  {
    id: 'perfect_accuracy',
    title: 'Perfect Accuracy',
    description: 'Finish a game with 90%+ accuracy',
    target: 90,
    current: 0,
    unlocked: false,
    icon: '🎯',
  },
];

const GENERATE_DAILY_MISSIONS = (): DailyMission[] => [
  {
    id: 'mission_monsters',
    title: 'Defeat 50 Monsters',
    target: 50,
    current: 0,
    reward: 50,
    claimed: false,
  },
  {
    id: 'mission_score',
    title: 'Score 1,000 Points',
    target: 1000,
    current: 0,
    reward: 60,
    claimed: false,
  },
  {
    id: 'mission_combo',
    title: 'Maintain a 15 Combo',
    target: 15,
    current: 0,
    reward: 40,
    claimed: false,
  },
];

export const useWordDefenseStore = create<WordDefenseState>()(
  persist(
    (set, get) => ({
      stats: {
        highScore: 0,
        bestCombo: 0,
        totalCoins: 0,
        totalCorrectAnswers: 0,
        gamesPlayed: 0,
        timePlayedSeconds: 0,
        wordsLearned: [],
        currentStreak: 0,
        longestStreak: 0,
        favoriteCategory: 'Vocabulary',
        categoryStats: {},
        lastPlayedDate: '',
      },
      unlockedCosmetics: DEFAULT_COSMETICS,
      selectedCosmetics: DEFAULT_SELECTED,
      dailyMissions: GENERATE_DAILY_MISSIONS(),
      achievements: INITIAL_ACHIEVEMENTS,
      lastMissionDate: new Date().toDateString(),

      checkAndResetDailyMissions: () => {
        const today = new Date().toDateString();
        if (get().lastMissionDate !== today) {
          set({
            dailyMissions: GENERATE_DAILY_MISSIONS(),
            lastMissionDate: today,
          });
        }
      },

      recordGameResult: (result) => {
        const today = new Date().toDateString();
        const prevStats = get().stats;

        // Calculate new streak
        let newStreak = prevStats.currentStreak;
        if (prevStats.lastPlayedDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (prevStats.lastPlayedDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        // Merge words learned
        const updatedWordsSet = new Set([...prevStats.wordsLearned, ...result.wordsLearnedInGame]);
        const updatedWords = Array.from(updatedWordsSet);

        // Update category stats
        const newCategoryStats = { ...prevStats.categoryStats };
        Object.entries(result.categoryCounts).forEach(([cat, count]) => {
          newCategoryStats[cat] = (newCategoryStats[cat] || 0) + count;
        });

        // Find favorite category
        let favCategory = prevStats.favoriteCategory;
        let maxCatCount = 0;
        Object.entries(newCategoryStats).forEach(([cat, count]) => {
          if (count > maxCatCount) {
            maxCatCount = count;
            favCategory = cat;
          }
        });

        const newHighScore = Math.max(prevStats.highScore, result.score);
        const newBestCombo = Math.max(prevStats.bestCombo, result.combo);
        const newTotalCorrect = prevStats.totalCorrectAnswers + result.correctAnswers;
        const newGamesPlayed = prevStats.gamesPlayed + 1;
        const newTimePlayed = prevStats.timePlayedSeconds + result.timeSpent;

        // Add coins to global StarStore as well
        if (result.coins > 0) {
          useStarStore.getState().addStars(result.coins);
        }

        // Update missions
        const updatedMissions = get().dailyMissions.map((mission) => {
          if (mission.claimed) return mission;
          let progress = mission.current;
          if (mission.id === 'mission_monsters') {
            progress += result.correctAnswers;
          } else if (mission.id === 'mission_score') {
            progress = Math.max(progress, result.score);
          } else if (mission.id === 'mission_combo') {
            progress = Math.max(progress, result.combo);
          }
          return {
            ...mission,
            current: Math.min(mission.target, progress),
          };
        });

        // Update achievements
        const accuracy = result.totalQuestions > 0
          ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
          : 0;

        const updatedAchievements = get().achievements.map((ach) => {
          let curr = ach.current;
          if (ach.id === 'first_victory') curr = Math.max(curr, result.score);
          if (ach.id === 'correct_100' || ach.id === 'correct_1000') curr = newTotalCorrect;
          if (ach.id === 'combo_25') curr = Math.max(curr, newBestCombo);
          if (ach.id === 'vocab_expert') curr = updatedWords.length;
          if (ach.id === 'animal_expert') curr += (result.categoryCounts['Animals'] || 0);
          if (ach.id === 'spelling_champion') curr += (result.categoryCounts['Spelling'] || 0);
          if (ach.id === 'perfect_accuracy' && result.totalQuestions >= 10) {
            curr = Math.max(curr, accuracy);
          }

          const unlocked = ach.unlocked || curr >= ach.target;
          return {
            ...ach,
            current: Math.min(ach.target, curr),
            unlocked,
          };
        });

        set({
          stats: {
            highScore: newHighScore,
            bestCombo: newBestCombo,
            totalCoins: prevStats.totalCoins + result.coins,
            totalCorrectAnswers: newTotalCorrect,
            gamesPlayed: newGamesPlayed,
            timePlayedSeconds: newTimePlayed,
            wordsLearned: updatedWords,
            currentStreak: newStreak,
            longestStreak: Math.max(prevStats.longestStreak, newStreak),
            favoriteCategory: favCategory,
            categoryStats: newCategoryStats,
            lastPlayedDate: today,
          },
          dailyMissions: updatedMissions,
          achievements: updatedAchievements,
        });
      },

      unlockCosmetic: (category, itemId, cost) => {
        const starStore = useStarStore.getState();
        if (starStore.stars < cost) return false;

        // Deduct stars
        starStore.addStars(-cost);

        const currentUnlocked = get().unlockedCosmetics[category];
        if (!currentUnlocked.includes(itemId)) {
          set({
            unlockedCosmetics: {
              ...get().unlockedCosmetics,
              [category]: [...currentUnlocked, itemId],
            },
          });
        }
        return true;
      },

      selectCosmetic: (category, itemId) => {
        set({
          selectedCosmetics: {
            ...get().selectedCosmetics,
            [category]: itemId,
          },
        });
      },

      claimMissionReward: (missionId) => {
        const missions = get().dailyMissions;
        const targetMission = missions.find((m) => m.id === missionId);
        if (targetMission && targetMission.current >= targetMission.target && !targetMission.claimed) {
          useStarStore.getState().addStars(targetMission.reward);
          set({
            dailyMissions: missions.map((m) =>
              m.id === missionId ? { ...m, claimed: true } : m
            ),
          });
        }
      },
    }),
    {
      name: 'word-defense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
