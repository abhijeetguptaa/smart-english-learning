// Kid-friendly colors for category cards and subject buttons
export const CATEGORY_COLORS = [
  '#FF6B6B', // Red
  '#d785da', // Magenta
  '#45B7D1', // Blue
  '#F7D794', // Yellow
  '#A8E6CF', // Green
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#FF9F43', // Orange
  '#FF9FF3', // Light Pink
  '#54A0FF', // Azure
  '#5F27CD', // Indigo
];

/**
 * Returns a color from the CATEGORY_COLORS array based on the index.
 * @param {number} index
 * @returns {string}
 */
export const getCategoryColor = (index) => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};
