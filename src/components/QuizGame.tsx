import React from 'react';
import { useTranslation } from 'react-i18next';

const QuizGame: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="quiz-game-container">
      <h1>{t('home.subjects.quizGame.label', 'Quiz Game')}</h1>
      <div className="game-placeholder">
        <p>{t('common.comingSoon', 'Coming Soon!')}</p>
        <div className="quiz-animation">❓🤔💡</div>
      </div>
    </div>
  );
};

export default QuizGame;
