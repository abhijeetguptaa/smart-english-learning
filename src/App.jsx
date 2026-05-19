import { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import './index.css'; // Tailwind first
import './App.scss';
import { useTranslation } from 'react-i18next';
import { App as CapacitorApp } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import WelcomeScreen from './components/WelcomeScreen';
import { STORAGE_KEYS } from './constants/appConstants';
import useRetentionStore from './store/useRetentionStore';
import { useLearningPathStore } from './store/useLearningPathStore';
const Alphabets = lazy(() => import('./components/Alphabets.tsx'));

const TracingSelection = lazy(() => import('./components/TracingSelection.jsx'));
const TracingGame = lazy(() => import('./components/TracingGame.tsx'));
const WordSearch = lazy(() => import('./components/WordSearch.jsx'));
const WordSearchDifficultySelector = lazy(
  () => import('./components/WordSearchDifficultySelector.jsx'),
);
const SentenceScramble = lazy(() => import('./components/SentenceScramble.tsx'));
const SentenceScrambleDifficultySelector = lazy(
  () => import('./components/SentenceScrambleDifficultySelector.jsx'),
);
const Quiz = lazy(() => import('./components/Quiz.tsx'));
const QuizDifficultySelector = lazy(() => import('./components/QuizDifficultySelector.tsx'));
const EnglishWordsSpell = lazy(() => import('./components/EnglishWordsSpell.tsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));
const PassageReading = lazy(() => import('./components/PassageReading.jsx'));
const DifficultySelection = lazy(() => import('./components/DifficultySelection.jsx'));
const PassageSelection = lazy(() => import('./components/PassageSelection.jsx'));
const TapLearnRoute = lazy(() => import('./components/TapLearnRoute.tsx'));
const VideoStories = lazy(() => import('./components/VideoStories.tsx'));
const Rhymes = lazy(() => import('./components/Rhymes.tsx'));
const loadLearningPath = () => import('./components/LearningPath.tsx');
const LearningPath = lazy(loadLearningPath);
const UnlockModal = lazy(() => import('./components/UnlockModal.tsx'));
const DailyBonusModal = lazy(() => import('./components/DailyBonusModal'));
const Stars = lazy(() => import('./components/Stars'));

const USER_NAME_KEY = STORAGE_KEYS.USER_NAME;
let soundUtilsPromise;
let bgMusicManagerPromise;
let admobPromise;
let analyticsPromise;
let notificationsPromise;

const loadSoundUtils = () => (soundUtilsPromise ??= import('./utils/soundUtils'));
const loadBgMusicManager = () => (bgMusicManagerPromise ??= import('./utils/bgMusicManager'));
const loadAdMob = () => (admobPromise ??= import('@/utils/admob'));
const loadAnalytics = () => (analyticsPromise ??= import('./utils/analytics'));
const loadNotifications = () => (notificationsPromise ??= import('./utils/notifications'));

const NOTIFICATION_PROMPT_KEY = 'notifications_prompted_v2';

function scheduleAfterFirstPaint(task, delay = 0) {
  let timeoutId;
  let frameId;
  let idleId;

  const run = () => {
    timeoutId = window.setTimeout(task, delay);
  };

  frameId = window.requestAnimationFrame(() => {
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      run();
    }
  });

  return () => {
    window.cancelAnimationFrame(frameId);
    if (typeof idleId === 'number' && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleId);
    }
    window.clearTimeout(timeoutId);
  };
}

const NON_GAME_ROUTES = new Set([
  '/',
  '/tiny-steps',
  '/english',
  '/stories',
  '/rhymes',
  '/passages',
]);

function isGameplayRoute(pathname) {
  if (NON_GAME_ROUTES.has(pathname)) {
    return false;
  }

  if (pathname.startsWith('/passages/')) {
    return false;
  }

  return true;
}

function getOrientationLockType(type) {
  return type.startsWith('landscape') ? 'landscape-primary' : 'portrait-primary';
}

import { getCategoryColor } from './constants/colors';

function Home() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categories = [
    {
      id: 'tiny-steps',
      path: '/tiny-steps',
      icon: '/tiny-steps.webp',
      label: t('home.categories.tiny-steps'),
    },
    {
      id: 'alphabets',
      path: '/alphabets',
      icon: '/alphabet.webp',
      label: t('home.subjects.alphabets.label'),
    },
    {
      id: 'english-words',
      path: '/english-words',
      icon: '/spell_the_word.webp',
      label: t('home.subjects.spellTheWord.label'),
    },
    {
      id: 'wordsearch',
      path: '/wordsearch',
      icon: '/match_the_word.webp',
      label: t('home.subjects.wordSearch.label'),
    },
    {
      id: 'sentence-scramble',
      path: '/sentence-scramble',
      icon: '/sentence-scramble.webp',
      label: t('home.subjects.sentenceScramble.label'),
    },
    {
      id: 'passages',
      path: '/passages',
      icon: '/passages.webp',
      label: t('home.subjects.passages.label'),
    },
    {
      id: 'tracing',
      path: '/tracing-selection',
      icon: '/tracing.png',
      label: t('home.subjects.tracing.label'),
    },
    {
      id: 'stories',
      path: '/stories',
      icon: '/stories.webp',
      label: t('home.categories.stories'),
      isOnline: true,
    },
    {
      id: 'rhymes',
      path: '/rhymes',
      icon: '/rhymes.webp',
      label: t('home.categories.rhymes'),
      isOnline: true,
    },
    {
      id: 'quiz',
      path: '/quiz',
      icon: '/quiz.webp',
      label: t('home.categories.quiz'),
    },
    {
      id: 'tap-learn-letters',
      path: '/tap-learn-letters',
      icon: '/alphabet.webp',
      label: t('home.subjects.tapLearnLetters.label'),
    },
    {
      id: 'tap-learn-farm-animals',
      path: '/tap-learn-farm-animals',
      icon: '/farm-animals.webp',
      label: t('home.subjects.tapLearnFarmAnimals.label'),
    },
    {
      id: 'tap-learn-wild-animals',
      path: '/tap-learn-wild-animals',
      icon: '/wild-animals.webp',
      label: t('home.subjects.tapLearnWildAnimals.label'),
    },
    {
      id: 'tap-learn-sea-animals',
      path: '/tap-learn-sea-animals',
      icon: '/sea-animals.webp',
      label: t('home.subjects.tapLearnSeaAnimals.label'),
    },
    {
      id: 'tap-learn-insects',
      path: '/tap-learn-insects',
      icon: '/insects.webp',
      label: t('home.subjects.tapLearnInsects.label'),
    },
    {
      id: 'tap-learn-colors',
      path: '/tap-learn-colors',
      icon: '/tap-fill.webp',
      label: t('home.subjects.tapLearnColors.label'),
    },
    {
      id: 'tap-learn-vegetables',
      path: '/tap-learn-vegetables',
      icon: '/vegetables.webp',
      label: t('home.subjects.tapLearnVegetables.label'),
    },
    {
      id: 'tap-learn-fruits',
      path: '/tap-learn-fruits',
      icon: '/fruits.webp',
      label: t('home.subjects.tapLearnFruits.label'),
    },
    {
      id: 'tap-learn-vehicles',
      path: '/tap-learn-vehicles',
      icon: '/vehicles.webp',
      label: t('home.subjects.tapLearnVehicles.label'),
    },
    {
      id: 'tap-learn-food',
      path: '/tap-learn-food',
      icon: '/food.webp',
      label: t('home.subjects.tapLearnFood.label'),
    },
    {
      id: 'tap-learn-instruments',
      path: '/tap-learn-instruments',
      icon: '/instruments.webp',
      label: t('home.subjects.tapLearnInstruments.label'),
    },
    {
      id: 'tap-learn-shapes',
      path: '/tap-learn-shapes',
      icon: '/shapes.webp',
      label: t('home.subjects.tapLearnShapes.label'),
    },
  ];

  const filteredCategories = categories.filter((category) => {
    if (category.isOnline) {
      return isOnline;
    }
    return true;
  });

  useEffect(() => {
    return scheduleAfterFirstPaint(() => {
      loadLearningPath();
    }, 1200);
  }, []);

  return (
    <main className="landing-page" role="main">
      <nav className="subject-selection" role="navigation">
        {filteredCategories.map((category, index) => (
          <Link
            key={category.id}
            to={category.path}
            className="subject-icon-button"
            onPointerEnter={category.id === 'tiny-steps' ? loadLearningPath : undefined}
            onFocus={category.id === 'tiny-steps' ? loadLearningPath : undefined}
            style={{
              '--card-color': getCategoryColor(index),
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <img
              className="subject-icon subject-icon--img-homepage"
              src={category.icon}
              alt={category.label}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div className="gameName">{category.label}</div>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAnimating = useLearningPathStore((state) => state.isAnimating);

  const [userName, setUserName] = useState(
    () => localStorage.getItem(USER_NAME_KEY) || t('common.defaultUserName'),
  );
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isDeferredUiReady, setIsDeferredUiReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastBackPress = useRef(0);
  const isFirstRoute = useRef(true);
  const pathnameRef = useRef(location.pathname);
  const hasShownOrientationLockError = useRef(false);
  const hasStartedExperience = useRef(false);
  const hasStartedDeferredServices = useRef(false);
  const hasScheduledNotificationPrompt = useRef(false);
  const lastOrientationLockRef = useRef('unlocked');

  const { checkLogin } = useRetentionStore();

  pathnameRef.current = location.pathname;

  useEffect(() => {
    return scheduleAfterFirstPaint(() => {
      checkLogin();
    }, 300);
  }, [checkLogin]);

  useEffect(() => {
    return scheduleAfterFirstPaint(() => {
      setIsDeferredUiReady(true);
    }, 800);
  }, []);

  const maybePromptNotifications = () => {
    if (
      hasScheduledNotificationPrompt.current ||
      localStorage.getItem(NOTIFICATION_PROMPT_KEY) === 'true'
    ) {
      return;
    }

    const { totalDaysPlayed } = useRetentionStore.getState();
    if (totalDaysPlayed < 3) {
      return;
    }

    hasScheduledNotificationPrompt.current = true;

    window.setTimeout(async () => {
      try {
        const { requestNotificationPermission, scheduleDailyReminder } = await loadNotifications();
        const granted = await requestNotificationPermission();
        localStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');

        if (granted) {
          await scheduleDailyReminder(t);
        }
      } catch (err) {
        console.error('Notification error:', err);
      }
    }, 10000);
  };

  const startDeferredServices = () => {
    if (hasStartedDeferredServices.current) {
      return;
    }

    hasStartedDeferredServices.current = true;

    scheduleAfterFirstPaint(() => {
      loadAnalytics()
        .then(({ initAnalytics }) => initAnalytics())
        .catch((err) => console.error('Analytics init failed:', err));
    }, 1500);

    scheduleAfterFirstPaint(() => {
      loadAdMob()
        .then(async ({ initAdMob, warmAdCaches }) => {
          await initAdMob();
          window.setTimeout(() => {
            warmAdCaches().catch((err) => console.error('Ad cache warmup failed:', err));
          }, 45000);
        })
        .catch((err) => console.error('AdMob init failed:', err));
    }, 20000);
  };

  const handlePlay = async () => {
    setShowWelcomeScreen(false);
    hasStartedExperience.current = true;
    startDeferredServices();
    const [{ unlockAudio, initTTS, speakText }, { playMusic }] = await Promise.all([
      loadSoundUtils(),
      loadBgMusicManager(),
    ]);
    await unlockAudio();
    await initTTS();
    speakText(t('welcomeScreen.message'));
    playMusic();
    maybePromptNotifications();
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('ScreenOrientation')) {
      return;
    }

    const syncOrientationLock = async () => {
      try {
        if (!isGameplayRoute(location.pathname)) {
          if (lastOrientationLockRef.current !== 'unlocked') {
            await ScreenOrientation.unlock();
            lastOrientationLockRef.current = 'unlocked';
          }
          return;
        }

        const type = window.screen?.orientation?.type || 'portrait-primary';
        const nextLock = getOrientationLockType(type);
        if (lastOrientationLockRef.current === nextLock) {
          return;
        }

        await ScreenOrientation.lock({
          orientation: nextLock,
        });
        lastOrientationLockRef.current = nextLock;
      } catch (err) {
        console.error('Orientation lock failed:', err);

        if (!hasShownOrientationLockError.current) {
          hasShownOrientationLockError.current = true;
        }
      }
    };

    const cancelSync = scheduleAfterFirstPaint(syncOrientationLock, 1200);

    return () => {
      cancelSync();
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('ScreenOrientation')) {
      return undefined;
    }

    return () => {
      if (lastOrientationLockRef.current !== 'unlocked') {
        ScreenOrientation.unlock()
          .then(() => {
            lastOrientationLockRef.current = 'unlocked';
          })
          .catch((err) => {
            console.error('Orientation unlock failed:', err);
          });
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }
    loadSoundUtils().then(({ playClickSound }) => {
      playClickSound();
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return undefined;
    }

    const backHandler = CapacitorApp.addListener('backButton', async () => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }
      if (useLearningPathStore.getState().isAnimating && pathnameRef.current === '/tiny-steps')
        return;
      const [{ stopSpeech, stopAllTones }, { pauseMusic }] = await Promise.all([
        loadSoundUtils(),
        loadBgMusicManager(),
      ]);
      stopSpeech();
      stopAllTones();
      pauseMusic();

      const { currentActiveTask, isTaskReadyToComplete } = useLearningPathStore.getState();

      if (currentActiveTask && isTaskReadyToComplete) {
        window.dispatchEvent(new CustomEvent('trigger-task-completion'));
        return;
      }

      if (currentActiveTask) {
        useLearningPathStore.getState().setActiveTask(null);
        navigate('/tiny-steps');
        return;
      }

      if (pathnameRef.current === '/tiny-steps') {
        navigate('/');
        return;
      }

      if (pathnameRef.current !== '/') {
        navigate(-1);
        return;
      }

      const now = Date.now();

      if (now - lastBackPress.current < 2000) {
        CapacitorApp.exitApp();
      } else {
        lastBackPress.current = now;

        await Toast.show({
          text: t('app.pressBackToExit'),
          duration: 'short',
        });
      }
    });

    return () => {
      backHandler.then((h) => h.remove());
    };
  }, [navigate, t, isSettingsOpen]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return undefined;
    }

    const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        startDeferredServices();
      }

      if (!hasStartedExperience.current) {
        return;
      }

      Promise.all([loadSoundUtils(), loadBgMusicManager()]).then(
        ([{ stopAllTones, stopSpeech }, { playMusic, pauseMusic }]) => {
          if (isActive) {
            playMusic();
          } else {
            pauseMusic();
            stopAllTones();
            stopSpeech();
          }
        },
      );
    });

    return () => {
      appStateListener.then((l) => l.remove());
    };
  }, []);

  useEffect(() => {
    const handleFirstClickUnlock = () => {
      startDeferredServices();
      loadSoundUtils().then(({ unlockAudio }) => unlockAudio());
    };

    document.addEventListener('click', handleFirstClickUnlock, { once: true });
    return () => {
      document.removeEventListener('click', handleFirstClickUnlock);
    };
  }, []);

  useEffect(() => {
    const handleVolumeChange = (e) => {
      loadBgMusicManager().then(({ setMusicVolume }) => {
        setMusicVolume(e.detail.volume);
      });
    };
    window.addEventListener('volumechange', handleVolumeChange);
    return () => window.removeEventListener('volumechange', handleVolumeChange);
  }, []);

  useEffect(() => {
    const handlePause = () => {
      if (!hasStartedExperience.current) {
        return;
      }

      Promise.all([loadSoundUtils(), loadBgMusicManager()]).then(
        ([{ stopSpeech, stopAllTones }, { pauseMusic }]) => {
          stopSpeech();
          stopAllTones();
          pauseMusic();
        },
      );
    };
    const handleVisibilityChange = () => {
      if (document.hidden) handlePause();
    };

    document.addEventListener('pause', handlePause, false);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleNameSubmit = useCallback((name) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
  }, []);

  const handleBackClick = useCallback(() => {
    loadSoundUtils().then(({ stopAllTones, stopSpeech }) => {
      stopAllTones();
      stopSpeech();
    });

    const { isTaskReadyToComplete, currentActiveTask, setActiveTask } =
      useLearningPathStore.getState();

    if (currentActiveTask && isTaskReadyToComplete) {
      window.dispatchEvent(new CustomEvent('trigger-task-completion'));
      return;
    }

    if (currentActiveTask) {
      setActiveTask(null);
      navigate('/tiny-steps');
    } else if (location.pathname === '/tiny-steps') {
      navigate('/');
    } else {
      navigate(-1);
    }
  }, [navigate, location.pathname]);

  return (
    <div className="app app-wrapper" role="application">
      <Suspense fallback={null}>{!showWelcomeScreen && <Stars />}</Suspense>
      <Suspense fallback={<div>{t('common.loading')}</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tiny-steps" element={<LearningPath />} />
          <Route path="/alphabets" element={<Alphabets />} />
          <Route path="/tracing-selection" element={<TracingSelection />} />
          <Route path="/alphabet-tracing" element={<TracingGame mode="alphabets" />} />
          <Route path="/wordsearch" element={<WordSearchDifficultySelector />} />
          <Route path="/wordsearch/:difficulty" element={<WordSearch />} />
          <Route path="/english-words" element={<EnglishWordsSpell />} />
          <Route path="/sentence-scramble" element={<SentenceScrambleDifficultySelector />} />
          <Route path="/sentence-scramble/:difficulty" element={<SentenceScramble />} />
          <Route path="/quiz" element={<QuizDifficultySelector />} />
          <Route path="/quiz/:difficulty" element={<Quiz />} />
          <Route path="/stories" element={<VideoStories />} />
          <Route path="/rhymes" element={<Rhymes />} />
          <Route path="/tap-learn-letters" element={<TapLearnRoute gameType="letters" />} />
          <Route path="/tap-learn-colors" element={<TapLearnRoute gameType="colors" />} />
          <Route path="/tap-learn-vegetables" element={<TapLearnRoute gameType="vegetables" />} />
          <Route path="/tap-learn-fruits" element={<TapLearnRoute gameType="fruits" />} />
          <Route path="/tap-learn-shapes" element={<TapLearnRoute gameType="shapes" />} />
          <Route
            path="/tap-learn-farm-animals"
            element={<TapLearnRoute gameType="farmAnimals" />}
          />
          <Route
            path="/tap-learn-wild-animals"
            element={<TapLearnRoute gameType="wildAnimals" />}
          />
          <Route path="/tap-learn-sea-animals" element={<TapLearnRoute gameType="seaAnimals" />} />
          <Route path="/tap-learn-insects" element={<TapLearnRoute gameType="insects" />} />
          <Route path="/tap-learn-vehicles" element={<TapLearnRoute gameType="vehicles" />} />
          <Route path="/tap-learn-food" element={<TapLearnRoute gameType="food" />} />
          <Route path="/tap-learn-instruments" element={<TapLearnRoute gameType="instruments" />} />
          <Route path="/tap-learn" element={<TapLearnRoute gameType="letters" />} />
          <Route
            path="/passages"
            element={
              <DifficultySelection
                difficulties={[
                  { key: 'easy', label: t('common.levels.easy'), emoji: '🐣', color: '#60a5fa' },
                  {
                    key: 'medium',
                    label: t('common.levels.medium'),
                    emoji: '🐼',
                    color: '#f59e0b',
                  },
                  {
                    key: 'hard',
                    label: t('common.levels.hard'),
                    emoji: '🐘',
                    color: '#ef4444',
                  },
                ]}
                baseRoute="/passages"
              />
            }
          />
          <Route path="/passages/:difficulty" element={<PassageSelection />} />
          <Route path="/passage/:difficulty/:id" element={<PassageReading />} />
        </Routes>
      </Suspense>

      {location.pathname === '/' ? (
        <button
          className="nav-button nav-button--setting"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isAnimating && location.pathname === '/tiny-steps'}
        >
          <img src="/setting.webp" alt={t('settings.title')} />
        </button>
      ) : (
        <button
          className="nav-button nav-button--home"
          onClick={handleBackClick}
          disabled={isAnimating && location.pathname === '/tiny-steps'}
        >
          <span className="homeButton">⇦</span>
        </button>
      )}
      <Suspense fallback={null}>
        {isDeferredUiReady && <UnlockModal />}
        {isDeferredUiReady && !showWelcomeScreen && <DailyBonusModal />}
        {isSettingsOpen && (
          <Settings
            userName={userName}
            onNameSubmit={handleNameSubmit}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </Suspense>

      {showWelcomeScreen && <WelcomeScreen onPlay={handlePlay} />}
    </div>
  );
}
