import {
  AdMob,
  InterstitialAdPluginEvents,
  MaxAdContentRating,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const INTERSTITIAL_ID = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID;
const REWARDED_ID = import.meta.env.VITE_ADMOB_REWARDED_ID;
const TEST_MODE = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';
const REQUEST_NON_PERSONALIZED_ADS = true;

let isInitialized = false;
let interstitialLoaded = false;
let rewardedLoaded = false;
let isPreloadingInterstitial = false;
let isPreloadingRewarded = false;

let lastAdTime = 0;

/**
 * Families policy safe limits
 */
const MIN_TIME_BETWEEN_ADS = 180 * 1000; // 1.5 minutes
const INITIAL_AD_DELAY = 90 * 1000; // 1.5 minutes
const INTERSTITIAL_PROBABILITY = 1; // 100% chance to show an ad when triggered

const GAME_LOAD_TIME = Date.now();
const isNative = () => Capacitor.isNativePlatform();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidAdUnitId = (id) => typeof id === 'string' && /^ca-app-pub-\d{16}\/\d{10}$/.test(id);

const createAdError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const trackAdImpressionAsync = (adType, adPlacement) => {
  import('./analytics')
    .then(({ trackAdImpression }) => trackAdImpression(adType, adPlacement))
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Ad impression tracking failed:', error);
      }
    });
};

/**
 * Initialize AdMob
 */
export const initAdMob = async () => {
  if (!isNative() || isInitialized) return;

  try {
    if (import.meta.env.DEV || TEST_MODE) {
      console.log('AdMob Initializing with:', {
        testMode: TEST_MODE,
        interstitialId: INTERSTITIAL_ID,
        rewardedId: REWARDED_ID,
        envMode: import.meta.env.MODE,
      });
    }

    await AdMob.initialize({
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
      maxAdContentRating: MaxAdContentRating.General,
      initializeForTesting: TEST_MODE,
    });

    isInitialized = true;

    console.log('AdMob initialized');
  } catch (err) {
    console.error('AdMob init failed:', err);
  }
};

export const warmAdCaches = async () => {
  if (!isNative()) return;

  if (!isInitialized) {
    await initAdMob();
  }

  await preloadInterstitial();
  await delay(2500);
  await preloadRewardedAd();
};

/**
 * Preload Interstitial
 */
export const preloadInterstitial = async () => {
  if (!isNative() || isPreloadingInterstitial) return;

  if (!isValidAdUnitId(INTERSTITIAL_ID)) {
    console.warn('Invalid interstitial id');
    return;
  }

  isPreloadingInterstitial = true;

  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_ID,
      isTesting: TEST_MODE,
      npa: REQUEST_NON_PERSONALIZED_ADS,
    });

    interstitialLoaded = true;

    if (import.meta.env.DEV) {
      console.log('Interstitial preloaded');
    }
  } catch (err) {
    interstitialLoaded = false;
    console.error('Interstitial preload failed:', err);
  } finally {
    isPreloadingInterstitial = false;
  }
};

/**
 * Preload Rewarded Ad
 */
export const preloadRewardedAd = async () => {
  if (!isNative() || isPreloadingRewarded) return;

  if (!isValidAdUnitId(REWARDED_ID)) {
    console.warn('Invalid rewarded id');
    return;
  }

  isPreloadingRewarded = true;

  try {
    await AdMob.prepareRewardVideoAd({
      adId: REWARDED_ID,
      isTesting: TEST_MODE,
      npa: REQUEST_NON_PERSONALIZED_ADS,
    });

    rewardedLoaded = true;

    if (import.meta.env.DEV) {
      console.log('Rewarded ad preloaded');
    }
  } catch (err) {
    rewardedLoaded = false;
    console.error('Reward preload failed:', err);
  } finally {
    isPreloadingRewarded = false;
  }
};

/**
 * Show Rewarded Ad
 */
export const showSafeRewarded = () => {
  return new Promise((resolve, reject) => {
    (async () => {
      if (!isNative()) {
        reject(createAdError('Not native platform', 'NOT_NATIVE_PLATFORM'));
        return;
      }

      let rewarded = false;
      let settled = false;
      let dismissedListener, rewardListener, failedToShowListener;

      const cleanup = async () => {
        dismissedListener?.remove();
        rewardListener?.remove();
        failedToShowListener?.remove();
      };

      const warmRewardedCache = () => {
        window.setTimeout(() => {
          preloadRewardedAd().catch((err) => {
            console.error('Reward preload failed:', err);
          });
        }, 5000);
      };

      const settle = async (callback) => {
        if (settled) return;
        settled = true;
        await cleanup();
        callback();
      };

      try {
        if (!isInitialized) await initAdMob();

        if (!rewardedLoaded) {
          await preloadRewardedAd();
        }

        if (!rewardedLoaded) {
          reject(createAdError('Rewarded ad is not ready', 'REWARDED_NOT_READY'));
          return;
        }

        rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          rewarded = true;
        });

        failedToShowListener = await AdMob.addListener(
          RewardAdPluginEvents.FailedToShow,
          async () => {
            await settle(() => {
              rewardedLoaded = false;
              warmRewardedCache();
              reject(createAdError('Rewarded ad failed to show', 'REWARDED_FAILED_TO_SHOW'));
            });
          },
        );

        dismissedListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
          await settle(() => {
            rewardedLoaded = false;
            warmRewardedCache();

            if (rewarded) {
              resolve();
            } else {
              reject(createAdError('User closed ad before earning reward', 'REWARDED_NOT_EARNED'));
            }
          });
        });

        await AdMob.showRewardVideoAd();
        rewardedLoaded = false;
        trackAdImpressionAsync('Rewarded', 'RewardScreen');
      } catch (err) {
        await cleanup();
        rewardedLoaded = false;
        warmRewardedCache();
        reject(err);
      }
    })();
  });
};

/**
 * Show Interstitial (Families policy safe)
 */
export const showSafeInterstitial = async () => {
  if (!isNative()) return;

  if (!isValidAdUnitId(INTERSTITIAL_ID)) {
    if (import.meta.env.DEV) {
      console.warn('Skipping interstitial: invalid interstitial id');
    }
    return;
  }

  const now = Date.now();

  // Initial delay: Don't show ads in the first 5 minutes of game load
  if (now - GAME_LOAD_TIME < INITIAL_AD_DELAY) {
    if (import.meta.env.DEV) {
      console.log('Skipping interstitial: first 5 minutes of game load');
    }
    return;
  }

  // Rate limiting: Only show one interstitial every 2 minutes
  if (now - lastAdTime < MIN_TIME_BETWEEN_ADS) {
    if (import.meta.env.DEV) {
      console.log('Skipping interstitial: too soon since last ad');
    }
    return;
  }

  // Probability check: Only show ad based on INTERSTITIAL_PROBABILITY
  if (Math.random() > INTERSTITIAL_PROBABILITY) {
    if (import.meta.env.DEV) {
      console.log('Skipping interstitial: probability check failed');
    }
    return;
  }

  let dismissedListener;
  let failedToShowListener;

  const cleanup = async () => {
    dismissedListener?.remove();
    failedToShowListener?.remove();
  };

  try {
    if (!isInitialized) await initAdMob();

    if (!interstitialLoaded) {
      await preloadInterstitial();
    }

    if (!interstitialLoaded) {
      return;
    }

    dismissedListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, async () => {
      interstitialLoaded = false;
      await cleanup();
      window.setTimeout(() => {
        preloadInterstitial().catch((err) => console.error('Interstitial preload failed:', err));
      }, 5000);
    });

    failedToShowListener = await AdMob.addListener(
      InterstitialAdPluginEvents.FailedToShow,
      async () => {
        interstitialLoaded = false;
        await cleanup();
        window.setTimeout(() => {
          preloadInterstitial().catch((err) => console.error('Interstitial preload failed:', err));
        }, 5000);
      },
    );

    await AdMob.showInterstitial();

    lastAdTime = now;
    interstitialLoaded = false;

    trackAdImpressionAsync('Interstitial', 'Transition');

    window.setTimeout(() => {
      preloadInterstitial().catch((err) => console.error('Interstitial preload failed:', err));
    }, 5000);
  } catch (err) {
    console.error('Interstitial show failed:', err);
    await cleanup();
    interstitialLoaded = false;
    window.setTimeout(() => {
      preloadInterstitial().catch((preloadErr) =>
        console.error('Interstitial preload failed:', preloadErr),
      );
    }, 5000);
  }
};

/**
 * Legacy support
 */
export const showInterstitialAd = async () => {
  await showSafeInterstitial();
};
