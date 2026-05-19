import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLearningPathStore } from '../store/useLearningPathStore';
import useUnlockModalStore from '../store/useUnlockModalStore';
import { LEARNING_PATH_LEVELS } from '../data/learningPath';
import '../styles/LearningPath.scss';

export default function LearningPath() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const unlockedLevels = useLearningPathStore((state) => state.unlockedLevels);
  const completedTasks = useLearningPathStore((state) => state.completedTasks);
  const setActiveTask = useLearningPathStore((state) => state.setActiveTask);
  const unlockLevel = useLearningPathStore((state) => state.unlockLevel);
  const skipLevel = useLearningPathStore((state) => state.skipLevel);
  const justCompletedLevel = useLearningPathStore((state) => state.justCompletedLevel);
  const setJustCompletedLevel = useLearningPathStore((state) => state.setJustCompletedLevel);
  const openModal = useUnlockModalStore((state) => state.openModal);

  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const getPhaseInfo = (id: number) => {
    if (id <= 10)
      return {
        class: 'phase-foundation',
        title: t('learningPath.phases.foundation', '🌈 Foundation Fields'),
        bg: 'bg-foundation',
      };
    if (id <= 20)
      return {
        class: 'phase-expanding',
        title: t('learningPath.phases.expanding', '🌲 Expanding Woods'),
        bg: 'bg-expanding',
      };
    if (id <= 30)
      return {
        class: 'phase-challenging',
        title: t('learningPath.phases.challenging', '🏔️ Challenge Peaks'),
        bg: 'bg-challenging',
      };
    if (id <= 40)
      return {
        class: 'phase-mastery',
        title: t('learningPath.phases.mastery', '🌊 Mastery Ocean'),
        bg: 'bg-mastery',
      };
    if (id <= 50)
      return {
        class: 'phase-grandmaster',
        title: t('learningPath.phases.grandmaster', '✨ Grand Master Galaxy'),
        bg: 'bg-grandmaster',
      };
    if (id <= 60)
      return {
        class: 'phase-cosmic',
        title: t('learningPath.phases.cosmic', '🚀 Cosmic Voyager'),
        bg: 'bg-cosmic',
      };
    if (id <= 70)
      return {
        class: 'phase-deepsea',
        title: t('learningPath.phases.deepsea', '🐙 Deep Sea Discovery'),
        bg: 'bg-deepsea',
      };
    if (id <= 80)
      return {
        class: 'phase-jungle',
        title: t('learningPath.phases.jungle', '🌿 Jungle Journey'),
        bg: 'bg-jungle',
      };
    if (id <= 90)
      return {
        class: 'phase-ancient',
        title: t('learningPath.phases.ancient', '🏺 Ancient Ruins'),
        bg: 'bg-ancient',
      };
    return {
      class: 'phase-legend',
      title: t('learningPath.phases.legend', '👑 Ultimate Legend'),
      bg: 'bg-legend',
    };
  };

  const maxUnlocked = useMemo(() => Math.max(...unlockedLevels, 1), [unlockedLevels]);
  const reversedLevels = useMemo(() => [...LEARNING_PATH_LEVELS].reverse(), []);
  const [currentPhase, setCurrentPhase] = useState(() => getPhaseInfo(1));
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Directly show the current level on mount
  useLayoutEffect(() => {
    const activeLevelId = maxUnlocked;
    const element = document.getElementById(`level-${activeLevelId}`);

    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'center' });
      // Update phase info immediately
      setCurrentPhase(getPhaseInfo(activeLevelId));
    } else {
      window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [maxUnlocked]);

  // Handle background update on scroll using IntersectionObserver
  useEffect(() => {
    if (justCompletedLevel) {
      // If we're not showing the modal anymore, we can just clear it
      // or trigger any level completion animations here.
      setTimeout(() => {
        setJustCompletedLevel(null);
      }, 500);
    }
  }, [justCompletedLevel]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when element is in the middle of the screen
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idMatch = entry.target.id.match(/level-(\d+)/);
          if (idMatch) {
            const levelId = parseInt(idMatch[1]);
            const newPhase = getPhaseInfo(levelId);
            setCurrentPhase(newPhase);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const levelElements = document.querySelectorAll('.level-node');
    levelElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [unlockedLevels]);

  const handleLevelClick = async (levelId: number, isUnlocked: boolean) => {
    if (isUnlocked) {
      setSelectedLevelId(selectedLevelId === levelId ? null : levelId);
      return;
    }

    // Check if this level is the next one available to be unlocked
    const isNextLevel = levelId === maxUnlocked + 1;

    // Check if previous level is actually complete
    const prevLevel = LEARNING_PATH_LEVELS.find((l) => l.id === maxUnlocked);
    const isPrevComplete = prevLevel ? prevLevel.tasks.every((t) => completedTasks[t.id]) : true;

    if (isNextLevel && isPrevComplete) {
      openModal(t('learningPath.levelUnlock', { level: levelId }), 50, () => unlockLevel(levelId));
    }
  };

  const handleTaskClick = (task: any) => {
    setActiveTask(task);
    navigate(task.path);
  };

  const handleSkipLevel = async (levelId: number) => {
    try {
      setIsSkipping(true);
      const { showSafeRewarded } = await import('../utils/admob.js');
      await showSafeRewarded();
      skipLevel(levelId);
      setSelectedLevelId(null);
    } catch (err) {
      console.error('Failed to skip level:', err);
      // If ad fails or is cancelled, we might still want to skip in DEV mode or just alert
      if (import.meta.env.DEV) {
        if (confirm('Ad failed or cancelled. Skip anyway? (Dev only)')) {
          skipLevel(levelId);
          setSelectedLevelId(null);
        }
      }
    } finally {
      setTimeout(() => {
        setIsSkipping(false);
      }, 500);
    }
  };

  const getTaskLabel = (task: any, levelId: number) => {
    let label = task.label;
    if (task.path === '/alphabets') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const end = Math.min(levelId * 6, 26);
      const startChar = 'A';
      const endChar = alphabet[end - 1];
      label = `${task.label} (${startChar}-${endChar})`;
    }
    return label;
  };

  const selectedLevel = LEARNING_PATH_LEVELS.find((l) => l.id === selectedLevelId);
  const isAllTasksCompleted = selectedLevel?.tasks.every((task) => completedTasks[task.id]);

  return (
    <div
      className={`tiny-steps-game-container ${currentPhase.bg} ${isReady ? 'is-ready' : 'is-initializing'}`}
      ref={containerRef}
    >
      <div className="game-sky">
        <div className="cloud c1">☁️</div>
        <div className="cloud c2">☁️</div>
        <div className="cloud c3">☁️</div>
        <div className="cloud c4">☁️</div>
        <div className="cloud c5">☁️</div>
      </div>
      {selectedLevel && (
        <>
          <div className="popup-overlay" onClick={() => setSelectedLevelId(null)} />
          <div className="task-popup centered">
            <button className="close-popup" onClick={() => setSelectedLevelId(null)}>
              ×
            </button>
            <h3 className="popup-title">{selectedLevel.title}</h3>
            <div className="popup-tasks">
              {selectedLevel.tasks.map((task) => (
                <button
                  key={task.id}
                  className={`popup-task-btn ${completedTasks[task.id] ? 'done' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                >
                  <span className="task-icon">
                    {task.type === 'math' ? '🧮' : task.type === 'english' ? '📚' : '🎮'}
                  </span>
                  <span className="task-text">{getTaskLabel(task, selectedLevel.id)}</span>
                  {completedTasks[task.id] && <span className="check">✅</span>}
                </button>
              ))}
            </div>

            {!isAllTasksCompleted && (
              <div className="popup-actions">
                <button
                  className="skip-level-btn"
                  onClick={() => handleSkipLevel(selectedLevel.id)}
                  disabled={isSkipping}
                >
                  {isSkipping ? (
                    t('common.loading', 'Loading...')
                  ) : (
                    <>
                      <span className="icon">📺</span>
                      {t('learningPath.skipLevel', 'Watch Ad to Skip')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <h1 className="game-title">{t('learningPath.title', 'Adventure Map')}</h1>

      <div className="path-scroll-area" ref={scrollRef}>
        <div className="path-nodes">
          {reversedLevels.map((level, reverseIndex) => {
            const index = LEARNING_PATH_LEVELS.length - 1 - reverseIndex;
            const isUnlocked = unlockedLevels.includes(level.id);
            const isLevelComplete = level.tasks.every((task) => completedTasks[task.id]);

            const isCurrent = maxUnlocked === level.id;

            // Logic for "Next Level" that can be unlocked
            const isNextLevel = level.id === maxUnlocked + 1;
            const prevLevel = LEARNING_PATH_LEVELS.find((l) => l.id === maxUnlocked);
            const isPrevComplete = prevLevel
              ? prevLevel.tasks.every((t) => completedTasks[t.id])
              : true;
            const canUnlock = isNextLevel && isPrevComplete;

            const phaseInfo = getPhaseInfo(level.id);
            const showPhaseTitle = (level.id - 1) % 10 === 0;

            const alignment =
              index % 4 === 0
                ? 'center'
                : index % 4 === 1
                  ? 'right'
                  : index % 4 === 2
                    ? 'center'
                    : 'left';

            // Next node's alignment for the connector
            const nextIndex = index + 1;
            const nextAlignment =
              nextIndex < LEARNING_PATH_LEVELS.length
                ? nextIndex % 4 === 0
                  ? 'center'
                  : nextIndex % 4 === 1
                    ? 'right'
                    : nextIndex % 4 === 2
                      ? 'center'
                      : 'left'
                : null;

            return (
              <React.Fragment key={level.id}>
                <div className={`node-row ${alignment}`}>
                  <div className="node-wrapper">
                    <div
                      id={`level-${level.id}`}
                      className={`level-node ${phaseInfo.class} ${isUnlocked ? 'unlocked' : 'locked'} ${isLevelComplete ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${canUnlock ? 'can-unlock' : ''}`}
                      onClick={() => handleLevelClick(level.id, isUnlocked)}
                    >
                      <div className="node-content">
                        <span className="level-number">{level.id}</span>
                        {isUnlocked ? (
                          <>
                            {isLevelComplete ? (
                              <span className="status-icon">🏆</span>
                            ) : isCurrent ? (
                              <span className="status-icon current-pulse">🌟</span>
                            ) : null}
                          </>
                        ) : (
                          <span className="status-icon">🔒</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {nextAlignment && (
                    <div className={`connector ${alignment}-to-${nextAlignment}`}></div>
                  )}
                </div>
                {showPhaseTitle && (
                  <div className="phase-separator">
                    <span className="phase-title-text">{phaseInfo.title}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
