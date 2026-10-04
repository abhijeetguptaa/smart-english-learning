export type WordMatchCategory = 'opposites' | 'rhymes' | 'associations';

export interface MatchPairItem {
  id: string;
  word: string;
  emoji: string;
  color: string;
}

export interface MatchPair {
  id: string;
  category: WordMatchCategory;
  relationType: 'opposite' | 'rhyme' | 'association';
  item1: MatchPairItem;
  item2: MatchPairItem;
  explanation: string;
}

export interface GameCard {
  cardId: string;
  pairId: string;
  word: string;
  emoji: string;
  color: string;
  category: WordMatchCategory;
  partnerWord: string;
  explanation: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const WORD_MATCH_PAIRS: MatchPair[] = [
  // OPPOSITES (Antonyms)
  {
    id: 'opp_hot_cold',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'hot', word: 'HOT', emoji: '🔥', color: '#ef4444' },
    item2: { id: 'cold', word: 'COLD', emoji: '❄️', color: '#0284c7' },
    explanation: 'Hot and Cold are opposites!',
  },
  {
    id: 'opp_big_small',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'big', word: 'BIG', emoji: '🐘', color: '#8b5cf6' },
    item2: { id: 'small', word: 'SMALL', emoji: '🐜', color: '#10b981' },
    explanation: 'Big and Small are opposites!',
  },
  {
    id: 'opp_happy_sad',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'happy', word: 'HAPPY', emoji: '😄', color: '#f59e0b' },
    item2: { id: 'sad', word: 'SAD', emoji: '😢', color: '#64748b' },
    explanation: 'Happy and Sad are opposites!',
  },
  {
    id: 'opp_fast_slow',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'fast', word: 'FAST', emoji: '🐆', color: '#f97316' },
    item2: { id: 'slow', word: 'SLOW', emoji: '🐢', color: '#84cc16' },
    explanation: 'Fast and Slow are opposites!',
  },
  {
    id: 'opp_day_night',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'day', word: 'DAY', emoji: '🌞', color: '#eab308' },
    item2: { id: 'night', word: 'NIGHT', emoji: '🌙', color: '#4338ca' },
    explanation: 'Day and Night are opposites!',
  },
  {
    id: 'opp_up_down',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'up', word: 'UP', emoji: '⬆️', color: '#06b6d4' },
    item2: { id: 'down', word: 'DOWN', emoji: '⬇️', color: '#ec4899' },
    explanation: 'Up and Down are opposites!',
  },
  {
    id: 'opp_clean_dirty',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'clean', word: 'CLEAN', emoji: '🧼', color: '#38bdf8' },
    item2: { id: 'dirty', word: 'DIRTY', emoji: '🧦', color: '#78350f' },
    explanation: 'Clean and Dirty are opposites!',
  },
  {
    id: 'opp_heavy_light',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'heavy', word: 'HEAVY', emoji: '🏋️', color: '#475569' },
    item2: { id: 'light', word: 'LIGHT', emoji: '🪶', color: '#a855f7' },
    explanation: 'Heavy and Light are opposites!',
  },
  {
    id: 'opp_open_closed',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'open', word: 'OPEN', emoji: '📖', color: '#14b8a6' },
    item2: { id: 'closed', word: 'CLOSED', emoji: '📕', color: '#dc2626' },
    explanation: 'Open and Closed are opposites!',
  },
  {
    id: 'opp_sweet_sour',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'sweet', word: 'SWEET', emoji: '🍭', color: '#f43f5e' },
    item2: { id: 'sour', word: 'SOUR', emoji: '🍋', color: '#eab308' },
    explanation: 'Sweet and Sour are opposites!',
  },
  {
    id: 'opp_tall_short',
    category: 'opposites',
    relationType: 'opposite',
    item1: { id: 'tall', word: 'TALL', emoji: '🦒', color: '#d97706' },
    item2: { id: 'short', word: 'SHORT', emoji: '🐒', color: '#059669' },
    explanation: 'Tall and Short are opposites!',
  },

  // RHYMING WORDS (Phonics)
  {
    id: 'rhy_cat_bat',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'cat', word: 'CAT', emoji: '🐱', color: '#fb923c' },
    item2: { id: 'bat', word: 'BAT', emoji: '🦇', color: '#6366f1' },
    explanation: 'Cat and Bat rhyme!',
  },
  {
    id: 'rhy_dog_frog',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'dog', word: 'DOG', emoji: '🐶', color: '#b45309' },
    item2: { id: 'frog', word: 'FROG', emoji: '🐸', color: '#22c55e' },
    explanation: 'Dog and Frog rhyme!',
  },
  {
    id: 'rhy_sun_run',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'sun', word: 'SUN', emoji: '☀️', color: '#f59e0b' },
    item2: { id: 'run', word: 'RUN', emoji: '🏃', color: '#3b82f6' },
    explanation: 'Sun and Run rhyme!',
  },
  {
    id: 'rhy_star_car',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'star', word: 'STAR', emoji: '⭐', color: '#eab308' },
    item2: { id: 'car', word: 'CAR', emoji: '🚗', color: '#ef4444' },
    explanation: 'Star and Car rhyme!',
  },
  {
    id: 'rhy_bee_tree',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'bee', word: 'BEE', emoji: '🐝', color: '#facc15' },
    item2: { id: 'tree', word: 'TREE', emoji: '🌳', color: '#15803d' },
    explanation: 'Bee and Tree rhyme!',
  },
  {
    id: 'rhy_ring_king',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'ring', word: 'RING', emoji: '💍', color: '#06b6d4' },
    item2: { id: 'king', word: 'KING', emoji: '👑', color: '#f59e0b' },
    explanation: 'Ring and King rhyme!',
  },
  {
    id: 'rhy_fox_box',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'fox', word: 'FOX', emoji: '🦊', color: '#ea580c' },
    item2: { id: 'box', word: 'BOX', emoji: '📦', color: '#a16207' },
    explanation: 'Fox and Box rhyme!',
  },
  {
    id: 'rhy_boat_coat',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'boat', word: 'BOAT', emoji: '⛵', color: '#0284c7' },
    item2: { id: 'coat', word: 'COAT', emoji: '🧥', color: '#7c3aed' },
    explanation: 'Boat and Coat rhyme!',
  },
  {
    id: 'rhy_moon_spoon',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'moon', word: 'MOON', emoji: '🌙', color: '#818cf8' },
    item2: { id: 'spoon', word: 'SPOON', emoji: '🥄', color: '#64748b' },
    explanation: 'Moon and Spoon rhyme!',
  },
  {
    id: 'rhy_bear_pear',
    category: 'rhymes',
    relationType: 'rhyme',
    item1: { id: 'bear', word: 'BEAR', emoji: '🐻', color: '#92400e' },
    item2: { id: 'pear', word: 'PEAR', emoji: '🍐', color: '#84cc16' },
    explanation: 'Bear and Pear rhyme!',
  },

  // ASSOCIATIONS (Vocabulary Pairs)
  {
    id: 'ass_bird_nest',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'bird', word: 'BIRD', emoji: '🐦', color: '#0284c7' },
    item2: { id: 'nest', word: 'NEST', emoji: '🪺', color: '#a16207' },
    explanation: 'Birds live in a nest!',
  },
  {
    id: 'ass_cow_milk',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'cow', word: 'COW', emoji: '🐮', color: '#334155' },
    item2: { id: 'milk', word: 'MILK', emoji: '🥛', color: '#38bdf8' },
    explanation: 'Cows give us milk!',
  },
  {
    id: 'ass_bee_honey',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'bee', word: 'BEE', emoji: '🐝', color: '#eab308' },
    item2: { id: 'honey', word: 'HONEY', emoji: '🍯', color: '#f59e0b' },
    explanation: 'Bees make sweet honey!',
  },
  {
    id: 'ass_fish_water',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'fish', word: 'FISH', emoji: '🐟', color: '#06b6d4' },
    item2: { id: 'water', word: 'WATER', emoji: '🌊', color: '#3b82f6' },
    explanation: 'Fish swim in water!',
  },
  {
    id: 'ass_rain_umbrella',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'rain', word: 'RAIN', emoji: '🌧️', color: '#64748b' },
    item2: { id: 'umbrella', word: 'UMBRELLA', emoji: '☂️', color: '#ec4899' },
    explanation: 'Umbrellas protect us from rain!',
  },
  {
    id: 'ass_spider_web',
    category: 'associations',
    relationType: 'association',
    item1: { id: 'spider', word: 'SPIDER', emoji: '🕷️', color: '#1e293b' },
    item2: { id: 'web', word: 'WEB', emoji: '🕸️', color: '#94a3b8' },
    explanation: 'Spiders spin a web!',
  },
];

export function generateCardDeck(
  category: WordMatchCategory | 'all',
  pairCount: number,
): GameCard[] {
  const eligiblePairs =
    category === 'all'
      ? WORD_MATCH_PAIRS
      : WORD_MATCH_PAIRS.filter((p) => p.category === category);

  // Shuffle and pick pairCount
  const shuffledPairs = [...eligiblePairs].sort(() => Math.random() - 0.5).slice(0, pairCount);

  const cards: GameCard[] = [];

  shuffledPairs.forEach((pair) => {
    cards.push({
      cardId: `${pair.id}_1`,
      pairId: pair.id,
      word: pair.item1.word,
      emoji: pair.item1.emoji,
      color: pair.item1.color,
      category: pair.category,
      partnerWord: pair.item2.word,
      explanation: pair.explanation,
      isFlipped: false,
      isMatched: false,
    });

    cards.push({
      cardId: `${pair.id}_2`,
      pairId: pair.id,
      word: pair.item2.word,
      emoji: pair.item2.emoji,
      color: pair.item2.color,
      category: pair.category,
      partnerWord: pair.item1.word,
      explanation: pair.explanation,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Shuffle the final cards
  return cards.sort(() => Math.random() - 0.5);
}
