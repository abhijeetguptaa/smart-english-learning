import React from 'react';
import DifficultySelection, { DifficultyOption } from '../DifficultySelection';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_LEVELS } from '../../constants/appConstants';

const WordMatchDifficultySelector: React.FC = () => {
  const { t } = useTranslation();

  const difficulties: DifficultyOption[] = [
    {
      key: DIFFICULTY_LEVELS.EASY,
      label: `${t('common.levels.easy')} (3 Pairs)`,
      emoji: '🌱',
      color: '#0ea5e9',
    },
    {
      key: DIFFICULTY_LEVELS.MEDIUM,
      label: `${t('common.levels.medium')} (4 Pairs)`,
      emoji: '🌲',
      color: '#f59e0b',
    },
    {
      key: DIFFICULTY_LEVELS.HARD,
      label: `${t('common.levels.hard')} (6 Pairs)`,
      emoji: '⛰️',
      color: '#8b5cf6',
    },
  ];

  return <DifficultySelection difficulties={difficulties} baseRoute="/word-match" />;
};

export default WordMatchDifficultySelector;
