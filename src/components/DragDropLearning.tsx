import React from 'react';
import { useTranslation } from 'react-i18next';

const DragDropLearning: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="drag-drop-learning-container">
      <h1>{t('home.subjects.dragDropLearning.label', 'Drag & Drop Learning')}</h1>
      <div className="game-placeholder">
        <p>{t('common.comingSoon', 'Coming Soon!')}</p>
        <div className="drag-drop-animation">🖱️➡️📦</div>
      </div>
    </div>
  );
};

export default DragDropLearning;
