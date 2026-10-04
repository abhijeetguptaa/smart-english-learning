// Animation constants
export const EMOJI_ANIMATION_DURATION = 1500; // ms

// Quiz constants
export const QUIZ_ROUNDS = 10;

/**
 * Fisher-Yates array shuffle
 */
export const shuffleArray = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generates a vibrant, visible HSL color string suitable for text/badges on light backgrounds
 */
export function getRandomVisibleColor(): string {
  let hue: number;
  do {
    hue = Math.floor(Math.random() * 360);
  } while (hue >= 180 && hue <= 300); // Avoid hard-to-see blue/cyan tones

  const saturation = 60 + Math.random() * 20; // 60-80% for vibrancy
  const lightness = 40 + Math.random() * 20; // 40-60% for good visibility
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random item from an array, or null for invalid/empty inputs.
 */
export const getRandomItem = <T>(items: readonly T[]): T | null => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
};
