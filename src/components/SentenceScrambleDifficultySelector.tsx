import React from 'react';
import DifficultySelection, { DifficultyOption } from './DifficultySelection';
import { useTranslation } from 'react-i18next';

const SentenceScrambleDifficultySelector: React.FC = () => {
  const { t } = useTranslation();

  const difficulties: DifficultyOption[] = [
    {
      key: 'easy',
      label: t('common.levels.easy'),
      emoji: '🐣',
      color: '#60a5fa',
    },
    {
      key: 'medium',
      label: t('common.levels.medium'),
      emoji: '🐼',
      color: '#f59e0b',
    },
    {
      key: 'hard',
      label: t('common.levels.hard'),
      emoji: '🦊',
      color: '#f97316',
    },
    {
      key: 'complex',
      label: t('common.levels.complex'),
      emoji: '🦁',
      color: '#ef4444',
    },
  ];

  return (
    <DifficultySelection
      difficulties={difficulties}
      baseRoute="/sentence-scramble"
      extraClass="wordsearch-selection"
    />
  );
};

export default SentenceScrambleDifficultySelector;
