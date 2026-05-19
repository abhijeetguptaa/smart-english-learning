import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/WelcomeScreen.scss';

const WelcomeScreen = ({ onPlay }) => {
  const { t } = useTranslation();

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__background"></div>
      <div className="welcome-screen__content">
        <img src="/logo_fg.webp" alt={t('app.title')} className="game-logo" />
        <h1 className="welcome-message">{t('welcomeScreen.message')}</h1>
        <button className="play-button level-btn btn-easy" onClick={onPlay}>
          {t('welcomeScreen.playButton')}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
