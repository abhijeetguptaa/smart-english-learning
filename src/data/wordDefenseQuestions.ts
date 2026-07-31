import { wordToEmoji, countingIcon } from './iconMapping';
import { TAP_LEARN_DATA } from './tapLearnData';

export interface MonsterAnswer {
  id: string;
  text: string;
  emoji?: string;
  isCorrect: boolean;
}

export interface QuestionChallenge {
  prompt: string;
  category: string;
  speechPrompt: string;
  correctAnswerText: string;
  answers: MonsterAnswer[]; // Typically 1 correct + 3 incorrect = 4 monsters
}

// Data pools for generating rich questions
const ANIMALS_DATA = [
  { name: 'Cow', sound: 'Moo', emoji: '🐮', baby: 'Calf' },
  { name: 'Dog', sound: 'Woof', emoji: '🐶', baby: 'Puppy' },
  { name: 'Cat', sound: 'Meow', emoji: '🐱', baby: 'Kitten' },
  { name: 'Duck', sound: 'Quack', emoji: '🦆', baby: 'Duckling' },
  { name: 'Lion', sound: 'Roar', emoji: '🦁', baby: 'Cub' },
  { name: 'Pig', sound: 'Oink', emoji: '🐷', baby: 'Piglet' },
  { name: 'Sheep', sound: 'Baa', emoji: '🐑', baby: 'Lamb' },
  { name: 'Frog', sound: 'Ribbit', emoji: '🐸', baby: 'Tadpole' },
  { name: 'Rooster', sound: 'Cock-a-doodle-doo', emoji: '🐓', baby: 'Chick' },
  { name: 'Horse', sound: 'Neigh', emoji: '🐴', baby: 'Foal' },
  { name: 'Bee', sound: 'Buzz', emoji: '🐝', baby: 'Larva' },
  { name: 'Owl', sound: 'Hoot', emoji: '🦉', baby: 'Owlet' },
];

const PAST_TENSES = [
  { present: 'Go', past: 'Went' },
  { present: 'Eat', past: 'Ate' },
  { present: 'Run', past: 'Ran' },
  { present: 'See', past: 'Saw' },
  { present: 'Play', past: 'Played' },
  { present: 'Walk', past: 'Walked' },
  { present: 'Sing', past: 'Sang' },
  { present: 'Drink', past: 'Drank' },
  { present: 'Fly', past: 'Flew' },
  { present: 'Sleep', past: 'Slept' },
  { present: 'Read', past: 'Read' },
  { present: 'Write', past: 'Wrote' },
  { present: 'Jump', past: 'Jumped' },
  { present: 'Swim', past: 'Swam' },
];

const OPPOSITES = [
  { word: 'Big', opposite: 'Small' },
  { word: 'Hot', opposite: 'Cold' },
  { word: 'Fast', opposite: 'Slow' },
  { word: 'Happy', opposite: 'Sad' },
  { word: 'Day', opposite: 'Night' },
  { word: 'Up', opposite: 'Down' },
  { word: 'In', opposite: 'Out' },
  { word: 'Clean', opposite: 'Dirty' },
  { word: 'Hard', opposite: 'Soft' },
  { word: 'Light', opposite: 'Dark' },
  { word: 'Heavy', opposite: 'Light' },
  { word: 'Tall', opposite: 'Short' },
  { word: 'Full', opposite: 'Empty' },
];

const PLURALS = [
  { singular: 'Cat', plural: 'Cats' },
  { singular: 'Dog', plural: 'Dogs' },
  { singular: 'Box', plural: 'Boxes' },
  { singular: 'Apple', plural: 'Apples' },
  { singular: 'Child', plural: 'Children' },
  { singular: 'Tooth', plural: 'Teeth' },
  { singular: 'Foot', plural: 'Feet' },
  { singular: 'Mouse', plural: 'Mice' },
  { singular: 'Man', plural: 'Men' },
  { singular: 'Leaf', plural: 'Leaves' },
  { singular: 'Bus', plural: 'Buses' },
];

const RHYMES = [
  { word: 'Cat', rhymesWith: ['Hat', 'Bat', 'Mat', 'Rat'], nonRhymes: ['Dog', 'Sun', 'Pig', 'Pen'] },
  { word: 'Sun', rhymesWith: ['Fun', 'Run', 'Bun'], nonRhymes: ['Cat', 'Star', 'Moon', 'Box'] },
  { word: 'Star', rhymesWith: ['Car', 'Jar', 'Far'], nonRhymes: ['Sky', 'Tree', 'Fish', 'Ball'] },
  { word: 'Tree', rhymesWith: ['Bee', 'See', 'Key'], nonRhymes: ['Bird', 'Leaf', 'Sun', 'Red'] },
  { word: 'Frog', rhymesWith: ['Dog', 'Log'], nonRhymes: ['Duck', 'Fish', 'Bird', 'Fly'] },
];

const SENTENCE_COMPLETIONS = [
  { prompt: 'The ___ shines in the day.', correct: 'Sun', emoji: '☀️', options: ['Sun', 'Moon', 'Star', 'Rain'] },
  { prompt: 'Fish live in the ___.', correct: 'Water', emoji: '🌊', options: ['Water', 'Sky', 'Tree', 'House'] },
  { prompt: 'Monkeys love eating ___.', correct: 'Bananas', emoji: '🍌', options: ['Bananas', 'Carrots', 'Pizza', 'Eggs'] },
  { prompt: 'Birds fly in the ___.', correct: 'Sky', emoji: '☁️', options: ['Sky', 'Ocean', 'Cave', 'Ground'] },
  { prompt: 'We write with a ___.', correct: 'Pencil', emoji: '✏️', options: ['Pencil', 'Spoon', 'Car', 'Shoe'] },
  { prompt: 'Cows give us ___.', correct: 'Milk', emoji: '🥛', options: ['Milk', 'Juice', 'Water', 'Tea'] },
];

const CATEGORY_ITEMS: Record<string, { label: string; emoji: string }[]> = {
  Fruits: TAP_LEARN_DATA.fruits.map((f) => ({ label: f.label, emoji: f.value })),
  Vegetables: TAP_LEARN_DATA.vegetables.map((v) => ({ label: v.label, emoji: v.value })),
  Animals: [...TAP_LEARN_DATA.farmAnimals, ...TAP_LEARN_DATA.wildAnimals].map((a) => ({
    label: a.label,
    emoji: a.value,
  })),
  Vehicles: TAP_LEARN_DATA.vehicles.map((v) => ({ label: v.label, emoji: v.value })),
  Shapes: TAP_LEARN_DATA.shapes.map((s) => ({ label: s.label, emoji: s.value })),
  Colors: TAP_LEARN_DATA.colors.map((c) => {
    const colorEmojis: Record<string, string> = {
      Red: '🔴', Blue: '🔵', Green: '🟢', Yellow: '🟡', Orange: '🟠',
      Pink: '🩷', Purple: '🟣', Brown: '🟤', Black: '⬛', White: '⬜',
      'Sky Blue': '🩵', Lime: '🟩', Silver: '🔘', 'Navy Blue': '🟦',
      Teal: '🩵', Olive: '🫒', Peach: '🍑', Violet: '💜',
    };
    return { label: c.label, emoji: colorEmojis[c.label] || '' };
  }),
  Food: TAP_LEARN_DATA.food.map((f) => ({ label: f.label, emoji: f.value })),
};

const SPELLING_WORDS = [
  { correct: 'Elephant', wrong: ['Elefant', 'Eliphant', 'Elephent'] },
  { correct: 'Banana', wrong: ['Bannana', 'Bananna', 'Benana'] },
  { correct: 'Butterfly', wrong: ['Butterfli', 'Buterfly', 'Budderfly'] },
  { correct: 'Dolphin', wrong: ['Dolfin', 'Dalphin', 'Dolphyn'] },
  { correct: 'Giraffe', wrong: ['Girafe', 'Jiraffe', 'Girraff'] },
  { correct: 'Strawberry', wrong: ['Strawbery', 'Strawberri', 'Strawbury'] },
  { correct: 'Dinosaur', wrong: ['Dinasaur', 'Dinesaur', 'Dynosaur'] },
  { correct: 'Umbrella', wrong: ['Umbrela', 'Umbrellah', 'Ombrella'] },
];

// Helper to pick random item from array
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to shuffle array
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuestion(difficultyLevel: number = 1): QuestionChallenge {
  const challengeTypes = [
    'vocab_picture_word',
    'vocab_word_picture',
    'animal_sound',
    'beginning_letter',
    'missing_letter',
    'spelling',
    'past_tense',
    'opposite',
    'plural',
    'rhymes',
    'sentence',
    'category',
  ];

  // Restrict complex topics to slightly higher difficulty progression
  let availableTypes = challengeTypes.slice(0, 4);
  if (difficultyLevel >= 2) availableTypes.push('beginning_letter', 'missing_letter', 'opposite', 'category');
  if (difficultyLevel >= 3) availableTypes = challengeTypes;

  const type = pickRandom(availableTypes);

  switch (type) {
    case 'vocab_picture_word': {
      const allWords = Object.entries(wordToEmoji);
      const [targetWord, targetEmoji] = pickRandom(allWords);
      const formattedTarget = targetWord.charAt(0) + targetWord.slice(1).toLowerCase();

      // Pick 3 distractors
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const [w] = pickRandom(allWords);
        const fw = w.charAt(0) + w.slice(1).toLowerCase();
        if (fw !== formattedTarget && !distractors.includes(fw)) {
          distractors.push(fw);
        }
      }

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: formattedTarget, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `wrong_${i}`, text: d, isCorrect: false })),
      ]);

      return {
        prompt: `Which word matches ${targetEmoji}?`,
        category: 'Vocabulary',
        speechPrompt: `Find ${formattedTarget}`,
        correctAnswerText: formattedTarget,
        answers,
      };
    }

    case 'vocab_word_picture': {
      const allWords = Object.entries(wordToEmoji);
      const [targetWord, targetEmoji] = pickRandom(allWords);
      const formattedTarget = targetWord.charAt(0) + targetWord.slice(1).toLowerCase();

      const distractors: { word: string; emoji: string }[] = [];
      while (distractors.length < 3) {
        const [w, e] = pickRandom(allWords);
        if (w !== targetWord && !distractors.some((d) => d.word === w)) {
          distractors.push({ word: w, emoji: e });
        }
      }

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: formattedTarget, emoji: targetEmoji, isCorrect: true },
        ...distractors.map((d, i) => ({
          id: `wrong_${i}`,
          text: d.word.charAt(0) + d.word.slice(1).toLowerCase(),
          emoji: d.emoji,
          isCorrect: false,
        })),
      ]);

      return {
        prompt: `Find "${formattedTarget}"`,
        category: 'Vocabulary',
        speechPrompt: `Which picture shows ${formattedTarget}?`,
        correctAnswerText: formattedTarget,
        answers,
      };
    }

    case 'animal_sound': {
      const target = pickRandom(ANIMALS_DATA);
      const distractors = ANIMALS_DATA.filter((a) => a.name !== target.name);
      const distractorChoices = shuffle(distractors).slice(0, 3);

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: target.name, emoji: target.emoji, isCorrect: true },
        ...distractorChoices.map((d, i) => ({
          id: `wrong_${i}`,
          text: d.name,
          emoji: d.emoji,
          isCorrect: false,
        })),
      ]);

      return {
        prompt: `Which animal says "${target.sound}"?`,
        category: 'Animals',
        speechPrompt: `Which animal says ${target.sound}?`,
        correctAnswerText: target.name,
        answers,
      };
    }

    case 'beginning_letter': {
      const allWords = Object.keys(wordToEmoji);
      const targetWord = pickRandom(allWords);
      const firstLetter = targetWord.charAt(0).toUpperCase();

      const distractors: string[] = [];
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      while (distractors.length < 3) {
        const l = pickRandom(letters);
        if (l !== firstLetter && !distractors.includes(l)) {
          distractors.push(l);
        }
      }

      const formattedTarget = targetWord.charAt(0) + targetWord.slice(1).toLowerCase();

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: firstLetter, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `wrong_${i}`, text: d, isCorrect: false })),
      ]);

      return {
        prompt: `First letter of "${formattedTarget}"?`,
        category: 'Letters',
        speechPrompt: `What is the first letter of ${formattedTarget}?`,
        correctAnswerText: firstLetter,
        answers,
      };
    }

    case 'missing_letter': {
      const words = ['APPLE', 'TIGER', 'HOUSE', 'LEMON', 'TRAIN', 'GREEN', 'WATER', 'CLOCK', 'SPOON'];
      const targetWord = pickRandom(words);
      const missingIdx = Math.floor(Math.random() * (targetWord.length - 2)) + 1;
      const correctLetter = targetWord[missingIdx];

      const maskedWord = targetWord.substring(0, missingIdx) + '_' + targetWord.substring(missingIdx + 1);

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const l = pickRandom(alphabet);
        if (l !== correctLetter && !distractors.includes(l)) {
          distractors.push(l);
        }
      }

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: correctLetter, isCorrect: true },
        ...distractors.map((d, i) => ({ id: `wrong_${i}`, text: d, isCorrect: false })),
      ]);

      return {
        prompt: `Fill missing letter: ${maskedWord}`,
        category: 'Letters',
        speechPrompt: `Complete the word ${maskedWord}`,
        correctAnswerText: correctLetter,
        answers,
      };
    }

    case 'spelling': {
      const target = pickRandom(SPELLING_WORDS);
      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: target.correct, isCorrect: true },
        ...target.wrong.slice(0, 3).map((w, i) => ({ id: `wrong_${i}`, text: w, isCorrect: false })),
      ]);

      return {
        prompt: 'Select the CORRECT spelling',
        category: 'Spelling',
        speechPrompt: `Select the correct spelling of ${target.correct}`,
        correctAnswerText: target.correct,
        answers,
      };
    }

    case 'past_tense': {
      const item = pickRandom(PAST_TENSES);
      const distractors = PAST_TENSES.filter((p) => p.past !== item.past);
      const distractorChoices = shuffle(distractors).slice(0, 3);

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: item.past, isCorrect: true },
        ...distractorChoices.map((d, i) => ({ id: `wrong_${i}`, text: d.past, isCorrect: false })),
      ]);

      return {
        prompt: `Past tense of "${item.present}"?`,
        category: 'Grammar',
        speechPrompt: `What is the past tense of ${item.present}?`,
        correctAnswerText: item.past,
        answers,
      };
    }

    case 'opposite': {
      const item = pickRandom(OPPOSITES);
      const distractors = OPPOSITES.filter((o) => o.opposite !== item.opposite);
      const distractorChoices = shuffle(distractors).slice(0, 3);

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: item.opposite, isCorrect: true },
        ...distractorChoices.map((d, i) => ({ id: `wrong_${i}`, text: d.opposite, isCorrect: false })),
      ]);

      return {
        prompt: `Opposite of "${item.word}"?`,
        category: 'Opposites',
        speechPrompt: `What is the opposite of ${item.word}?`,
        correctAnswerText: item.opposite,
        answers,
      };
    }

    case 'plural': {
      const item = pickRandom(PLURALS);
      const distractors = PLURALS.filter((p) => p.plural !== item.plural);
      const distractorChoices = shuffle(distractors).slice(0, 3);

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: item.plural, isCorrect: true },
        ...distractorChoices.map((d, i) => ({ id: `wrong_${i}`, text: d.plural, isCorrect: false })),
      ]);

      return {
        prompt: `Plural of "${item.singular}"?`,
        category: 'Grammar',
        speechPrompt: `What is the plural of ${item.singular}?`,
        correctAnswerText: item.plural,
        answers,
      };
    }

    case 'rhymes': {
      const item = pickRandom(RHYMES);
      const correctRhyme = pickRandom(item.rhymesWith);
      const wrongRhymes = shuffle(item.nonRhymes).slice(0, 3);

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: correctRhyme, isCorrect: true },
        ...wrongRhymes.map((w, i) => ({ id: `wrong_${i}`, text: w, isCorrect: false })),
      ]);

      return {
        prompt: `Which word rhymes with "${item.word}"?`,
        category: 'Word Play',
        speechPrompt: `Which word rhymes with ${item.word}?`,
        correctAnswerText: correctRhyme,
        answers,
      };
    }

    case 'sentence': {
      const item = pickRandom(SENTENCE_COMPLETIONS);
      const answers: MonsterAnswer[] = shuffle(
        item.options.map((opt) => ({
          id: opt === item.correct ? 'correct' : `wrong_${opt}`,
          text: opt,
          isCorrect: opt === item.correct,
        }))
      );

      return {
        prompt: item.prompt,
        category: 'Sentence',
        speechPrompt: item.prompt,
        correctAnswerText: item.correct,
        answers,
      };
    }

    case 'category': {
      const categories = Object.keys(CATEGORY_ITEMS);
      const targetCat = pickRandom(categories);
      const targetItems = CATEGORY_ITEMS[targetCat];
      const correctItem = pickRandom(targetItems);

      // Pick 3 distractors from OTHER categories
      const distractors: { label: string; emoji: string }[] = [];
      while (distractors.length < 3) {
        const otherCat = pickRandom(categories.filter((c) => c !== targetCat));
        const item = pickRandom(CATEGORY_ITEMS[otherCat]);
        if (!distractors.some((d) => d.label === item.label)) {
          distractors.push(item);
        }
      }

      const answers: MonsterAnswer[] = shuffle([
        { id: 'correct', text: correctItem.label, emoji: correctItem.emoji, isCorrect: true },
        ...distractors.map((d, i) => ({
          id: `wrong_${i}`,
          text: d.label,
          emoji: d.emoji,
          isCorrect: false,
        })),
      ]);

      return {
        prompt: `Which one is a ${targetCat.slice(0, -1)}?`,
        category: targetCat,
        speechPrompt: `Which item belongs to ${targetCat}?`,
        correctAnswerText: correctItem.label,
        answers,
      };
    }

    default:
      return generateQuestion(1);
  }
}
