/**
 * Lightweight analytics helpers.
 * Native Facebook analytics was removed to keep the Android app lean.
 */

let isAnalyticsInitialized = false;

// Standard Facebook Event Names
export const FB_EVENTS = {
  VIEW_CONTENT: 'ViewContent',
  SEARCH: 'Search',
  START_TRIAL: 'StartTrial',
  SUBSCRIBE: 'Subscribe',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  LEVEL_ACHIEVED: 'fb_mobile_level_achieved',
  ACHIEVEMENT_UNLOCKED: 'fb_mobile_achievement_unlocked',
  SPENT_CREDITS: 'fb_mobile_spent_credits',
  AD_CLICK: 'AdClick',
  AD_IMPRESSION: 'AdImpression',
};

// Custom App Events
export const APP_EVENTS = {
  EXERCISE_START: 'ExerciseStart',
  EXERCISE_COMPLETE: 'ExerciseComplete',
  STAR_EARNED: 'StarEarned',
  FEATURE_UNLOCK_ATTEMPT: 'FeatureUnlockAttempt',
  FEATURE_UNLOCKED: 'FeatureUnlocked',
  AD_IMPRESSION: 'AdImpression',
};

/**
 * Initialize Analytics
 */
export const initAnalytics = () => {
  if (isAnalyticsInitialized) {
    return;
  }

  isAnalyticsInitialized = true;
};

/**
 * Log a Facebook Event
 * @param {string} eventName - Standard or Custom event name
 * @param {object} params - Additional parameters for the event
 */
export const logEvent = (eventName, params = {}) => {
  try {
    if (import.meta.env.DEV || import.meta.env.VITE_ADMOB_TEST_MODE === 'true') {
      console.log(`[Analytics Event]: ${eventName}`, params);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, params);
    }
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

/**
 * Helper: Track Exercise Start
 */
export const trackExerciseStart = (operator, difficulty) => {
  logEvent(APP_EVENTS.EXERCISE_START, {
    content_name: operator,
    content_category: 'Exercise',
    difficulty: difficulty,
  });
};

/**
 * Helper: Track Exercise Completion
 */
export const trackExerciseComplete = (operator, difficulty, score) => {
  logEvent(APP_EVENTS.EXERCISE_COMPLETE, {
    content_name: operator,
    difficulty: difficulty,
    value: score,
    currency: 'STAR',
  });

  // Also log standard level achieved for Facebook
  logEvent(FB_EVENTS.LEVEL_ACHIEVED, {
    fb_level: `${operator}_${difficulty}`,
    score: score,
  });
};

/**
 * Helper: Track Star Earned
 */
export const trackStarsEarned = (amount, source) => {
  logEvent(APP_EVENTS.STAR_EARNED, {
    value: amount,
    content_id: source,
  });
};

/**
 * Helper: Track Feature Unlock
 */
export const trackFeatureUnlocked = (featureName, cost) => {
  logEvent(APP_EVENTS.FEATURE_UNLOCKED, {
    content_name: featureName,
    value: cost,
    currency: 'STAR',
  });

  logEvent(FB_EVENTS.SPENT_CREDITS, {
    fb_content_id: featureName,
    fb_value_to_sum: cost,
  });
};

/**
 * Helper: Track Ad Impression
 */
export const trackAdImpression = (adType, adPlacement) => {
  logEvent(FB_EVENTS.AD_IMPRESSION, {
    ad_type: adType,
    placement: adPlacement,
  });
};
