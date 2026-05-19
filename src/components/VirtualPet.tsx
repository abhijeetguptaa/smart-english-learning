import React from 'react';
import { useTranslation } from 'react-i18next';

const VirtualPet: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="virtual-pet-container">
      <h1>{t('home.subjects.virtualPet.label', 'Virtual Pet')}</h1>
      <div className="game-placeholder">
        <p>{t('common.comingSoon', 'Coming Soon!')}</p>
        <div className="pet-animation">🐶❤️</div>
      </div>
    </div>
  );
};

export default VirtualPet;
