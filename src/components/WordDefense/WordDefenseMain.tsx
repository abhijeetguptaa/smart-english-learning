import React, { useState } from 'react';
import { WordDefenseGame } from './WordDefenseGame';
import { WordDefenseShop } from './WordDefenseShop';
import { WordDefenseMissions } from './WordDefenseMissions';
import { WordDefenseAchievements } from './WordDefenseAchievements';
import { WordDefenseStats } from './WordDefenseStats';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';
import useStarStore from '../../store/useStarStore';
import { playClickSound } from '../../utils/soundUtils';
import './WordDefense.scss';

type ActiveView = 'menu' | 'playing' | 'shop' | 'missions' | 'achievements' | 'stats';

export const WordDefenseMain: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveView>('playing');
  const { selectedCosmetics, stats } = useWordDefenseStore();
  const { stars } = useStarStore();

  const handleStartGame = () => {
    playClickSound();
    setCurrentView('playing');
  };

  const handleNavClick = (view: ActiveView) => {
    playClickSound();
    setCurrentView(view);
  };

  if (currentView === 'playing') {
    return (
      <WordDefenseGame
        onBackToMenu={() => setCurrentView('playing')}
        onOpenView={(v) => setCurrentView(v)}
        selectedCosmetics={selectedCosmetics}
      />
    );
  }

  return (
    <div className="wd-main-container">
      {/* Top Header Navbar */}
      <header className="wd-main-header">
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
          className={`wd-nav-tab ${currentView === 'playing' ? 'active' : ''}`}
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
