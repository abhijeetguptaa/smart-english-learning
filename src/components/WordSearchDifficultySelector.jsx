import React from 'react';
import DifficultySelection from './DifficultySelection';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_LEVELS } from '../constants/appConstants';

const WordSearchDifficultySelector = () => {
  const { t } = useTranslation();

  const wordSearchDifficulties = [
    { key: DIFFICULTY_LEVELS.EASY, label: t('common.levels.easy'), emoji: '🌱', color: '#60a5fa' },
    {
      key: DIFFICULTY_LEVELS.MEDIUM,
      label: t('common.levels.medium'),
      emoji: '🌲',
      color: '#f59e0b',
    },
    {
      key: DIFFICULTY_LEVELS.HARD,
      label: t('common.levels.hard'),
      emoji: '⛰️',
      color: '#f97316',
    },
    {
      key: DIFFICULTY_LEVELS.COMPLEX,
      label: t('common.levels.complex'),
      emoji: '🏆',
      color: '#ef4444',
    },
  ];

  return <DifficultySelection difficulties={wordSearchDifficulties} baseRoute="/wordsearch" />;
};

export default WordSearchDifficultySelector;
