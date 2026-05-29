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
import { getCategoryColor, getCategoryBGColor } from './constants/colors';

const Alphabets = lazy(() => import('./components/Alphabets.tsx'));
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
const TapLearnRoute = lazy(() => import('./components/TapLearnRoute.tsx'));
const TapLearnSelection = lazy(() => import('./components/TapLearnSelection.jsx'));
const Stars = lazy(() => import('./components/Stars'));

const USER_NAME_KEY = STORAGE_KEYS.USER_NAME;
let soundUtilsPromise;
let bgMusicManagerPromise;
let admobPromise;
let notificationsPromise;

const loadSoundUtils = () => (soundUtilsPromise ??= import('./utils/soundUtils'));
const loadBgMusicManager = () => (bgMusicManagerPromise ??= import('./utils/bgMusicManager'));
const loadAdMob = () => (admobPromise ??= import('@/utils/admob'));
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
  '/tap-learn',
]);

function isGameplayRoute(pathname) {
  return !NON_GAME_ROUTES.has(pathname);
}

function getOrientationLockType(type) {
  return type.startsWith('landscape') ? 'landscape-primary' : 'portrait-primary';
}

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
      id: 'quiz',
      path: '/quiz',
      icon: '/quiz.webp',
      label: t('home.categories.quiz'),
    },
    {
      id: 'tap-learn',
      path: '/tap-learn',
      icon: '/alphabet.webp',
      label: t('home.categories.tap-learn', 'Tap Learn'),
    },
  ];

  const filteredCategories = categories.filter((category) => {
    if (category.isOnline) {
      return isOnline;
    }
    return true;
  });

  return (
    <main className="landing-page" role="main">
      <nav className="subject-selection" role="navigation">
        {filteredCategories.map((category, index) => (
          <Link
            key={category.id}
            to={category.path}
            className="subject-icon-button"
            style={{
              '--card-color': getCategoryColor(index),
              '--bg-color': getCategoryBGColor(index),
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

  pathnameRef.current = location.pathname;

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
      const [{ stopSpeech, stopAllTones }, { pauseMusic }] = await Promise.all([
        loadSoundUtils(),
        loadBgMusicManager(),
      ]);
      stopSpeech();
      stopAllTones();
      pauseMusic();

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

    navigate(-1);
  }, [navigate]);

  return (
    <div className="app app-wrapper" role="application">
      <Suspense fallback={null}>{!showWelcomeScreen && <Stars />}</Suspense>
      <Suspense fallback={<div>{t('common.loading')}</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alphabets" element={<Alphabets />} />
          <Route path="/wordsearch" element={<WordSearchDifficultySelector />} />
          <Route path="/wordsearch/:difficulty" element={<WordSearch />} />
          <Route path="/english-words" element={<EnglishWordsSpell />} />
          <Route path="/sentence-scramble" element={<SentenceScrambleDifficultySelector />} />
          <Route path="/sentence-scramble/:difficulty" element={<SentenceScramble />} />
          <Route path="/quiz" element={<QuizDifficultySelector />} />
          <Route path="/quiz/:difficulty" element={<Quiz />} />
          <Route path="/tap-learn" element={<TapLearnSelection />} />
          <Route path="/tap-learn/:gameType" element={<TapLearnRoute />} />
        </Routes>
      </Suspense>

      {location.pathname === '/' ? (
        <button
          className="nav-button nav-button--setting"
          onClick={() => setIsSettingsOpen(true)}
        >
          <img src="/setting.webp" alt={t('settings.title')} />
        </button>
      ) : (
        <button
          className="nav-button nav-button--home"
          onClick={handleBackClick}
        >
          <span className="homeButton">⇦</span>
        </button>
      )}
      <Suspense fallback={null}>
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
