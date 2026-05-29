import React from 'react';
import DifficultySelection from './DifficultySelection';
import { useTranslation } from 'react-i18next';

const QuizDifficultySelector = () => {
  const { t } = useTranslation();

  const difficulties = [
    { key: 'easy', label: t('common.levels.easy'), emoji: '🌱', color: '#60a5fa' },
    { key: 'medium', label: t('common.levels.medium'), emoji: '🌲', color: '#f59e0b' },
    { key: 'expert', label: t('quiz.expert'), emoji: '🏆', color: '#ef4444' },
  ];

  return <DifficultySelection difficulties={difficulties} baseRoute="/quiz" />;
};

export default QuizDifficultySelector;
