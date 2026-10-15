/**
 * Lightweight analytics helpers.
 * Native Facebook analytics was removed to keep the Android app lean.
 */

let isAnalyticsInitialized = false;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

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
} as const;

// Custom App Events
export const APP_EVENTS = {
  EXERCISE_START: 'ExerciseStart',
  EXERCISE_COMPLETE: 'ExerciseComplete',
  STAR_EARNED: 'StarEarned',
  FEATURE_UNLOCK_ATTEMPT: 'FeatureUnlockAttempt',
  FEATURE_UNLOCKED: 'FeatureUnlocked',
} as const;

/**
 * Initialize Analytics
 */
export const initAnalytics = (): void => {
  if (isAnalyticsInitialized) {
    return;
  }

  isAnalyticsInitialized = true;
};

/**
 * Log an event
 */
export const logEvent = (eventName: string, params: Record<string, unknown> = {}): void => {
  try {
    if (import.meta.env.DEV) {
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
export const trackExerciseStart = (operator: string, difficulty: string): void => {
  logEvent(APP_EVENTS.EXERCISE_START, {
    content_name: operator,
    content_category: 'Exercise',
    difficulty,
  });
};

/**
 * Helper: Track Exercise Completion
 */
export const trackExerciseComplete = (
  operator: string,
  difficulty: string,
  score: number,
): void => {
  logEvent(APP_EVENTS.EXERCISE_COMPLETE, {
    content_name: operator,
    difficulty,
    value: score,
    currency: 'STAR',
  });

  logEvent(FB_EVENTS.LEVEL_ACHIEVED, {
    fb_level: `${operator}_${difficulty}`,
    score,
  });
};

/**
 * Helper: Track Star Earned
 */
export const trackStarsEarned = (amount: number, source: string): void => {
  logEvent(APP_EVENTS.STAR_EARNED, {
    value: amount,
    content_id: source,
  });
};

/**
 * Helper: Track Feature Unlock
 */
export const trackFeatureUnlocked = (featureName: string, cost: number): void => {
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
