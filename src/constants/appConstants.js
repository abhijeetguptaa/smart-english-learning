// Application-wide Constants
// All static values and configuration for the entire application

export const IS_TEST_MODE =
  import.meta.env.VITE_ADMOB_TEST_MODE === 'true' || import.meta.env.MODE === 'test';

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  COMPLEX: 'complex',
};

// Quiz and Animation Settings
export const QUIZ_SETTINGS = {
  ROUNDS: 100,
  PASS_THRESHOLD: 0.8, // 80% to pass
  ANIMATION_DURATION: 3000, // ms
  OPTION_COUNT: 4,
  MIN_NUMBERS_FOR_ARRANGEMENT: 3,
  MIN_DIVISION_DIVISOR: 2,
  MIN_RESULT: 2,
  PLAUSIBLE_OPTIONS_LIMIT: 10,
  FALLBACK_LIMIT: 1000,
};

// Number generation settings
export const NUMBER_GENERATION = {
  MIN_VALUE: 1, // avoid 0
  VARIANCE_PERCENT: 0.1, // ±10% for plausible options
  MIN_VARIANCE: 0.9,
  MAX_VARIANCE: 1.1,
};

// UI Text and Labels
export const APP_TEXT = {
  TITLES: {
    SMART_ENGLISH_LEARNING: 'Play & Learn English – ABC Games',
  },
  BUTTONS: {
    GO_HOME: 'Go Home',
    SHARE_PDF: 'Share PDF',
    DOWNLOAD: 'Download as File',
  },
  LABELS: {
    NAME: 'Name: ',
    DATE: 'Date: ',
    CLASS: 'Class: ',
  },
  EMOJIS: {
    SHARE: '📤',
    DOWNLOAD: '⬇️',
  },
};

// File and sharing configuration
export const FILE_SETTINGS = {
  DEFAULT_PDF_NAME: 'smart-english-learning.pdf',
  PDF_TYPE: 'application/pdf',
  SHARE_TITLE: 'Play & Learn English – ABC Games',
  SHARE_TEXT: 'Play & Learn English – ABC Games PDF attached.',
};

// Modal and UI states
export const UI_MODES = {
  DOWNLOAD: 'download',
  SHARE: 'share',
};

export const STORAGE_KEYS = {
  USER_NAME: 'english_app_user_name_v1',
};

// PDF Configuration
export const PDF_CONFIG = {
  // Page dimensions (A4 in mm)
  PAGE_WIDTH: 210,
  PAGE_HEIGHT: 297,

  // Margins and spacing
  MARGIN: 15,
  BOTTOM_MARGIN: 20,

  // Font sizes
  TITLE_FONT_SIZE: 16,
  SUBTITLE_FONT_SIZE: 14,
  CONTENT_FONT_SIZE: 13,
  OPERATOR_FONT_SIZE: 15,
  USER_INFO_FONT_SIZE: 10,

  // User info line configuration
  USER_INFO: {
    LINE_LENGTH: 40,
    FIELD_SPACING: 60,
    NAME_OFFSET: 15,
    DATE_OFFSET: 12,
    CLASS_OFFSET: 13,
  },

  // Watermark configuration
  WATERMARK: {
    OPACITY: 0.15,
    MARGIN_PERCENT: 0.1,
    DPI_CONVERSION: 2.83, // Convert mm to pixels at 72 DPI
    BACKGROUND_OPACITY: 0.1,
  },
};

// Canvas and image processing
export const CANVAS_CONFIG = {
  CONTEXT_TYPE: '2d',
  IMAGE_FORMAT: 'image/png',
  CROSS_ORIGIN: 'anonymous',
};
