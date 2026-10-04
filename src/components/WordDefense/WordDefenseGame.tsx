import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateQuestion,
  QuestionChallenge,
} from '../../data/wordDefenseQuestions';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';
import useStarStore from '../../store/useStarStore';
import {
  playCorrectSound,
  playIncorrectSound,
  playMatchBurstSound,
  playBombSound,
  playSparklePop,
  playApplauseSound,
  speakText,
  stopSpeech,
  stopAllTones,
  playClickSound,
} from '../../utils/soundUtils';
import {
  ActiveMonster,
  ActivePowerUp,
  Particle,
  CannonShot,
  WordDefenseGameProps,
} from './types';
import { WordDefenseHUD } from './WordDefenseHUD';
import { WordDefensePauseModal, WordDefenseGameOverModal } from './WordDefenseModals';

export const WordDefenseGame: React.FC<WordDefenseGameProps> = ({
  onBackToMenu,
  onOpenView,
  selectedCosmetics,
}) => {
  const { recordGameResult } = useWordDefenseStore();

  // Game state
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [coins, setCoins] = useState(0);
  const [castleHealth, setCastleHealth] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [question, setQuestion] = useState<QuestionChallenge | null>(null);

  // Active entities
  const [monsters, setMonsters] = useState<ActiveMonster[]>([]);
  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cannonShots, setCannonShots] = useState<CannonShot[]>([]);

  // Power-up active effects
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [doubleCoinsTimer, setDoubleCoinsTimer] = useState(0);
  const [doubleScoreTimer, setDoubleScoreTimer] = useState(0);

  // Stats tracking during session
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [wordsLearnedInSession, setWordsLearnedInSession] = useState<Set<string>>(new Set());
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [comboBanner, setComboBanner] = useState<string | null>(null);
  const [powerUpNotice, setPowerUpNotice] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);

  // Timers & refs
  const gameTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionRef = useRef<QuestionChallenge | null>(null);
  questionRef.current = question;

  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const selectedCosmeticsRef = useRef(selectedCosmetics);
  useEffect(() => {
    selectedCosmeticsRef.current = selectedCosmetics;
  }, [selectedCosmetics]);

  // Speak current question prompt with cancellation of any previous speech
  const announceQuestion = useCallback(async (q: QuestionChallenge) => {
    await stopSpeech();
    speakText(q.speechPrompt, { interrupt: true });
  }, []);

  // Spawn new question & monsters
  const loadNextQuestion = useCallback(
    (diffLevel: number) => {
      if (!isMountedRef.current || isGameOverRef.current) return;

      const nextQ = generateQuestion(diffLevel);
      setQuestion(nextQ);
      announceQuestion(nextQ);

      // Create 4 monsters corresponding to answers
      const spawnXPositions = [15, 38, 62, 85];
      const shuffledX = [...spawnXPositions].sort(() => Math.random() - 0.5);

      const newMonsters: ActiveMonster[] = nextQ.answers.map((ans, idx) => ({
        id: `monster_${Date.now()}_${idx}`,
        answer: ans,
        x: shuffledX[idx],
        y: -10 - idx * 8, // staggered initial y
        speed: 0.08 + Math.min(0.12, diffLevel * 0.015),
        skin: selectedCosmeticsRef.current.skin,
        wobbleOffset: Math.random() * Math.PI * 2,
      }));

      setMonsters(newMonsters);

      // Random chance to spawn a power-up
      if (Math.random() < 0.35) {
        const types: ActivePowerUp['type'][] = [
          'freeze',
          'slow',
          'bomb',
          'shield',
          'double_coins',
          'double_score',
          'health',
        ];
        const icons = {
          freeze: '❄️',
          slow: '🐢',
          bomb: '💣',
          shield: '🛡️',
          double_coins: '🪙',
          double_score: '⭐',
          health: '💖',
        };
        const labels = {
          freeze: 'Freeze Time',
          slow: 'Slow Down',
          bomb: 'Bomb',
          shield: 'Shield',
          double_coins: '2x Coins',
          double_score: '2x Score',
          health: 'Health',
        };
        const pType = types[Math.floor(Math.random() * types.length)];

        const newPowerUp: ActivePowerUp = {
          id: `pw_${Date.now()}`,
          type: pType,
          icon: icons[pType],
          label: labels[pType],
          x: 20 + Math.random() * 60,
          y: -15,
          speed: 0.12,
        };
        setPowerUps((prev) => [...prev.slice(-2), newPowerUp]);
      }
    },
    [announceQuestion],
  );

  // Initial game setup - guarded to run strictly once on initial mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    loadNextQuestion(1);
    startTimeRef.current = Date.now();
  }, [loadNextQuestion]);

  // Clean up speech and sound effects on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeech();
      stopAllTones();
    };
  }, []);

  // Stop speech & tones when game is paused or over
  useEffect(() => {
    if (isPaused || isGameOver) {
      stopSpeech();
      stopAllTones();
    }
  }, [isPaused, isGameOver]);

  // Main game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      gameTimeRef.current += delta;
      const currentDifficulty = 1 + Math.floor(gameTimeRef.current / 25);

      // Decrement powerup timers
      setDoubleCoinsTimer((t) => Math.max(0, t - delta));
      setDoubleScoreTimer((t) => Math.max(0, t - delta));

      // Move monsters down
      setMonsters((prevMonsters) => {
        let reachedCastle = false;

        const updated = prevMonsters.map((m) => {
          let currentSpeed = m.speed;
          if (isFrozen) currentSpeed = 0;
          else if (isSlowed) currentSpeed *= 0.4;

          const newY = m.y + currentSpeed * 30 * delta;

          if (newY >= 95 && !reachedCastle) {
            reachedCastle = true;
          }
          return { ...m, y: newY };
        });

        // If any monster reached castle
        if (reachedCastle) {
          playIncorrectSound();
          setDamageFlash(true);
          setTimeout(() => setDamageFlash(false), 400);

          if (hasShield) {
            setHasShield(false);
            playSparklePop();
          } else {
            setCastleHealth((hp) => {
              const nextHp = hp - 1;
              if (nextHp <= 0) {
                setIsGameOver(true);
                isGameOverRef.current = true;
              }
              return Math.max(0, nextHp);
            });
          }

          // Spawn fresh question if not game over
          setTimeout(() => {
            if (!isGameOverRef.current) {
              loadNextQuestion(currentDifficulty);
            }
          }, 300);
          return [];
        }

        return updated;
      });

      // Move powerups down
      setPowerUps((prevPw) =>
        prevPw.map((p) => ({ ...p, y: p.y + p.speed * 30 * delta })).filter((p) => p.y < 95),
      );

      // Update cannon shot animations
      setCannonShots((prevShots) =>
        prevShots
          .map((shot) => {
            const nextProgress = shot.progress + delta * 4;
            const currentX = shot.startX + (shot.targetX - shot.startX) * nextProgress;
            const currentY = shot.startY + (shot.targetY - shot.startY) * nextProgress;
            return { ...shot, progress: nextProgress, currentX, currentY };
          })
          .filter((shot) => shot.progress < 1),
      );

      // Update particles
      setParticles((prevParticles) =>
        prevParticles
          .map((p) => ({
            ...p,
            x: p.x + p.vx * delta * 50,
            y: p.y + p.vy * delta * 50,
            life: p.life - delta,
          }))
          .filter((p) => p.life > 0),
      );

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isGameOver, isPaused, isFrozen, isSlowed, hasShield, loadNextQuestion]);

  // Handle Game Over recording
  useEffect(() => {
    if (isGameOver) {
      playApplauseSound();
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      recordGameResult({
        score,
        combo: maxCombo,
        coins,
        correctAnswers: correctAnswersCount,
        totalQuestions: totalQuestionsAnswered,
        timeSpent,
        wordsLearnedInGame: Array.from(wordsLearnedInSession),
        categoryCounts,
      });
    }
  }, [
    isGameOver,
    score,
    maxCombo,
    coins,
    correctAnswersCount,
    totalQuestionsAnswered,
    wordsLearnedInSession,
    categoryCounts,
    recordGameResult,
  ]);

  // Spawn particle explosions
  const spawnExplosion = (x: number, y: number, color: string, text?: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: `p_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 8 + Math.random() * 10,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1,
      });
    }
    if (text) {
      newParticles.push({
        id: `pt_${Date.now()}`,
        x,
        y: y - 5,
        vx: 0,
        vy: -0.4,
        color: '#facc15',
        size: 22,
        life: 2.5,
        maxLife: 2.5,
        text,
      });
    }
    setParticles((prev) => [...prev.slice(-30), ...newParticles]);
  };

  // Cannon fire animation towards target position
  const fireCannon = (targetX: number, targetY: number) => {
    // Castle cannon at 50% bottom center
    const startX = 50;
    const startY = 82;

    const newShot: CannonShot = {
      id: `shot_${Date.now()}`,
      startX,
      startY,
      targetX,
      targetY,
      currentX: startX,
      currentY: startY,
      progress: 0,
    };
    setCannonShots((prev) => [...prev, newShot]);
  };

  // Tap monster handler
  const handleTapMonster = (monster: ActiveMonster) => {
    if (isGameOver || isPaused) return;

    fireCannon(monster.x, monster.y);
    setTotalQuestionsAnswered((c) => c + 1);

    if (monster.answer.isCorrect) {
      playCorrectSound();
      playMatchBurstSound();

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));

      const scoreGain = 10 * (doubleScoreTimer > Date.now() ? 2 : 1);
      setScore((s) => s + scoreGain);
      const coinsGain = 1 * (doubleCoinsTimer > Date.now() ? 2 : 1);
      setCoins((c) => c + coinsGain);
      for (let i = 0; i < coinsGain; i++) {
        useStarStore.getState().addStar();
      }
      setCorrectAnswersCount((c) => c + 1);

      if (question) {
        setCategoryCounts((prev) => ({
          ...prev,
          [question.category]: (prev[question.category] || 0) + 1,
        }));
        setWordsLearnedInSession((prev) => new Set(prev).add(question.correctAnswerText));
      }

      // Combo milestone triggers
      if (newCombo === 5 || newCombo === 10 || newCombo === 25 || newCombo === 50) {
        playSparklePop();
        setComboBanner(`${newCombo} COMBO! 🔥`);
        setTimeout(() => setComboBanner(null), 1800);
      }

      spawnExplosion(monster.x, monster.y, '#22c55e', `+${coinsGain} ⭐`);

      // Clear monsters and load next question
      const currentDifficulty = 1 + Math.floor(gameTimeRef.current / 25);
      setTimeout(() => loadNextQuestion(currentDifficulty), 350);
    } else {
      // Wrong answer
      playIncorrectSound();
      setCombo(0);
      spawnExplosion(monster.x, monster.y, '#ef4444', 'MISS!');

      // Remove tapped wrong monster
      setMonsters((prev) => prev.filter((m) => m.id !== monster.id));
    }
  };

  // Tap power-up handler
  const handleTapPowerUp = (pw: ActivePowerUp) => {
    playSparklePop();
    setPowerUps((prev) => prev.filter((p) => p.id !== pw.id));

    setPowerUpNotice(`${pw.icon} ${pw.label}!`);
    setTimeout(() => setPowerUpNotice(null), 2500);

    spawnExplosion(pw.x, pw.y, '#3b82f6', `${pw.icon} ${pw.label}`);

    switch (pw.type) {
      case 'freeze':
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 5000);
        break;

      case 'slow':
        setIsSlowed(true);
        setTimeout(() => setIsSlowed(false), 8000);
        break;

      case 'bomb':
        playBombSound();
        monsters.forEach((m) => spawnExplosion(m.x, m.y, '#f97316'));
        setMonsters([]);
        setTimeout(() => loadNextQuestion(1 + Math.floor(gameTimeRef.current / 25)), 400);
        break;

      case 'shield':
        setHasShield(true);
        setTimeout(() => setHasShield(false), 12000);
        break;

      case 'double_coins':
        setDoubleCoinsTimer(Date.now() + 12000);
        break;

      case 'double_score':
        setDoubleScoreTimer(Date.now() + 12000);
        break;

      case 'health':
        setCastleHealth((prev) => Math.min(5, prev + 1));
        break;
    }
  };

  // Background map theme styles
  const bgStyles: Record<string, string> = {
    green_meadow: 'linear-gradient(180deg, #38bdf8 0%, #a7f3d0 60%, #4ade80 100%)',
    sunset: 'linear-gradient(180deg, #fdba74 0%, #f472b6 50%, #ea580c 100%)',
    cosmic: 'linear-gradient(180deg, #0f172a 0%, #312e81 60%, #581c87 100%)',
    underwater: 'linear-gradient(180deg, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
    candyland: 'linear-gradient(180deg, #fbcfe8 0%, #f472b6 60%, #db2777 100%)',
  };

  return (
    <div
      className={`wd-game-viewport ${damageFlash ? 'damage-shake' : ''}`}
      style={{ background: bgStyles[selectedCosmetics.background] || bgStyles.green_meadow }}
    >
      {/* Top HUD & Question Banner */}
      <WordDefenseHUD
        castleHealth={castleHealth}
        hasShield={hasShield}
        question={question}
        onBackToMenu={() => {
          playClickSound();
          onBackToMenu();
        }}
        onPause={() => {
          playClickSound();
          stopSpeech();
          stopAllTones();
          setIsPaused(true);
        }}
        onAnnounceQuestion={announceQuestion}
      />

      {/* Combo Milestone & Powerup Collected Popups */}
      {comboBanner && <div className="wd-combo-milestone-popup">{comboBanner}</div>}
      {powerUpNotice && <div className="wd-powerup-collected-popup">{powerUpNotice}</div>}

      {/* Game Field Area */}
      <div className="wd-play-field">
        {/* Render Monsters */}
        {monsters.map((monster) => (
          <div
            key={monster.id}
            className={`wd-monster-node skin-${monster.skin}`}
            style={{
              left: `${monster.x}%`,
              top: `${monster.y}%`,
              transform: `translate(-50%, -50%) rotate(${Math.sin(gameTimeRef.current * 4 + monster.wobbleOffset) * 6}deg)`,
            }}
            onClick={() => handleTapMonster(monster)}
          >
            <div className="wd-monster-speech-bubble">
              <span className="wd-ans-text">{monster.answer.text}</span>
            </div>
            <div className="wd-monster-body">
              <span className="wd-monster-face">
                {monster.answer.emoji && !/[a-zA-Z]/.test(monster.answer.emoji.trim())
                  ? monster.answer.emoji
                  : '👾'}
              </span>
            </div>
          </div>
        ))}

        {/* Render Power-ups */}
        {powerUps.map((pw) => (
          <div
            key={pw.id}
            className="wd-powerup-node"
            style={{
              left: `${pw.x}%`,
              top: `${pw.y}%`,
            }}
            onClick={() => handleTapPowerUp(pw)}
          >
            <div className="wd-pw-bubble">
              <span className="wd-pw-icon">{pw.icon}</span>
            </div>
          </div>
        ))}

        {/* Render Cannon Projectiles */}
        {cannonShots.map((shot) => (
          <div
            key={shot.id}
            className="wd-cannon-projectile"
            style={{
              left: `${shot.currentX}%`,
              top: `${shot.currentY}%`,
            }}
          />
        ))}

        {/* Render Particle Effects */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="wd-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.text ? 'transparent' : p.color,
              opacity: p.life / p.maxLife,
            }}
          >
            {p.text && <span className="wd-particle-text">{p.text}</span>}
          </div>
        ))}
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <WordDefensePauseModal
          onResume={() => {
            playClickSound();
            setIsPaused(false);
          }}
          onBackToMenu={() => {
            playClickSound();
            setIsPaused(false);
            onBackToMenu();
          }}
          onOpenView={onOpenView}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <WordDefenseGameOverModal
          score={score}
          maxCombo={maxCombo}
          coins={coins}
          correctAnswersCount={correctAnswersCount}
          totalQuestionsAnswered={totalQuestionsAnswered}
          onPlayAgain={() => {
            playClickSound();
            stopSpeech();
            stopAllTones();
            isGameOverRef.current = false;
            setScore(0);
            setCombo(0);
            setMaxCombo(0);
            setCoins(0);
            setCastleHealth(5);
            setCorrectAnswersCount(0);
            setTotalQuestionsAnswered(0);
            setWordsLearnedInSession(new Set());
            setIsGameOver(false);
            loadNextQuestion(1);
          }}
          onBackToMenu={() => {
            playClickSound();
            onBackToMenu();
          }}
          onOpenView={onOpenView}
        />
      )}
    </div>
  );
};
