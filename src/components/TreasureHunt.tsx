import React from 'react';
import { useTranslation } from 'react-i18next';

const TreasureHunt: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="treasure-hunt-container">
      <h1>{t('home.subjects.treasureHunt.label', 'Treasure Hunt')}</h1>
      <div className="game-placeholder">
        <p>{t('common.comingSoon', 'Coming Soon!')}</p>
        <div className="treasure-animation">🏴‍☠️💎📜</div>
      </div>
    </div>
  );
};

export default TreasureHunt;
