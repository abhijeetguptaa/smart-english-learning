import { MonsterAnswer, QuestionChallenge } from '../../data/wordDefenseQuestions';
import { SelectedCosmetics } from '../../store/useWordDefenseStore';

export interface ActiveMonster {
  id: string; // unique instance id
  answer: MonsterAnswer;
  x: number; // percentage 10% - 90%
  y: number; // percentage 0% (top) to 85% (castle line)
  speed: number; // percentage per frame
  skin: string;
  wobbleOffset: number;
}

export type PowerUpType =
  | 'freeze'
  | 'slow'
  | 'bomb'
  | 'shield'
  | 'double_coins'
  | 'double_score'
  | 'health';

export interface ActivePowerUp {
  id: string;
  type: PowerUpType;
  icon: string;
  label: string;
  x: number;
  y: number;
  speed: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface CannonShot {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number;
}

export interface WordDefenseGameProps {
  onBackToMenu: () => void;
  onOpenView?: (view: 'shop' | 'missions' | 'achievements' | 'stats') => void;
  selectedCosmetics: SelectedCosmetics;
}

export interface WordDefenseHUDProps {
  castleHealth: number;
  hasShield: boolean;
  question: QuestionChallenge | null;
  onBackToMenu: () => void;
  onPause: () => void;
  onAnnounceQuestion: (q: QuestionChallenge) => void;
}

export interface WordDefensePauseModalProps {
  onResume: () => void;
  onBackToMenu: () => void;
  onOpenView?: (view: 'shop' | 'missions' | 'achievements' | 'stats') => void;
}

export interface WordDefenseGameOverModalProps {
  score: number;
  maxCombo: number;
  coins: number;
  correctAnswersCount: number;
  totalQuestionsAnswered: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onOpenView?: (view: 'shop' | 'missions' | 'achievements' | 'stats') => void;
}
