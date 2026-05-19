import React from 'react';
import { useTranslation } from 'react-i18next';

const EndlessRunner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="endless-runner-container">
      <h1>{t('home.subjects.endlessRunner.label', 'Endless Runner')}</h1>
      <div className="game-placeholder">
        <p>{t('common.comingSoon', 'Coming Soon!')}</p>
        <div className="runner-animation">🏃‍♂️...💨</div>
      </div>
    </div>
  );
};

export default EndlessRunner;
