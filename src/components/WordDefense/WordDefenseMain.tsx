import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WordDefenseGame } from './WordDefenseGame';
import { WordDefenseShop } from './WordDefenseShop';
import { WordDefenseMissions } from './WordDefenseMissions';
import { WordDefenseAchievements } from './WordDefenseAchievements';
import { WordDefenseStats } from './WordDefenseStats';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';
import useStarStore from '../../store/useStarStore';
import { playClickSound, stopSpeech, stopAllTones } from '../../utils/soundUtils';
import './WordDefense.scss';

type SubView = 'shop' | 'missions' | 'achievements' | 'stats';
type ActiveView = 'playing' | SubView;

export const WordDefenseMain: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ActiveView>('playing');
  const { selectedCosmetics } = useWordDefenseStore();
  const { stars } = useStarStore();

  const handleNavClick = (view: ActiveView) => {
    playClickSound();
    stopSpeech();
    stopAllTones();
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    playClickSound();
    stopSpeech();
    stopAllTones();
    navigate('/');
  };

  if (currentView === 'playing') {
    return (
      <WordDefenseGame
        onBackToMenu={handleBackToHome}
        onOpenView={(v) => setCurrentView(v)}
        selectedCosmetics={selectedCosmetics}
      />
    );
  }

  return (
    <div className="wd-main-container">
      {/* Top Header Navbar */}
      <header className="wd-main-header">
        <button
          className="wd-header-back-btn"
          onClick={handleBackToHome}
          aria-label="Back to Home"
        >
          ⇦
        </button>

        <div className="wd-title-badge">
          <span className="wd-title-icon">🏰</span>
          <h1>Word Defense</h1>
        </div>

        <div className="wd-coins-display">
          <span>⭐ {stars}</span>
        </div>
      </header>

      {/* Main Content Area based on tab */}
      <div className="wd-main-body">
        {currentView === 'shop' && <WordDefenseShop />}
        {currentView === 'missions' && <WordDefenseMissions />}
        {currentView === 'achievements' && <WordDefenseAchievements />}
        {currentView === 'stats' && <WordDefenseStats />}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="wd-bottom-nav">
        <button
          className="wd-nav-tab"
          onClick={() => handleNavClick('playing')}
        >
          <span className="icon">🎮</span>
          <span className="label">Game</span>
        </button>

        <button
          className={`wd-nav-tab ${currentView === 'shop' ? 'active' : ''}`}
          onClick={() => handleNavClick('shop')}
        >
          <span className="icon">🛍️</span>
          <span className="label">Armory</span>
        </button>

        <button
          className={`wd-nav-tab ${currentView === 'missions' ? 'active' : ''}`}
          onClick={() => handleNavClick('missions')}
        >
          <span className="icon">🎯</span>
          <span className="label">Quests</span>
        </button>

        <button
          className={`wd-nav-tab ${currentView === 'achievements' ? 'active' : ''}`}
          onClick={() => handleNavClick('achievements')}
        >
          <span className="icon">🏆</span>
          <span className="label">Trophies</span>
        </button>

        <button
          className={`wd-nav-tab ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => handleNavClick('stats')}
        >
          <span className="icon">📊</span>
          <span className="label">Stats</span>
        </button>
      </nav>
    </div>
  );
};
export default WordDefenseMain;
