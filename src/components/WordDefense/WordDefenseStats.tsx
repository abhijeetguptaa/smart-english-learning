import React from 'react';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';

export const WordDefenseStats: React.FC = () => {
  const { stats } = useWordDefenseStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="wd-stats-container">
      <div className="wd-stats-header">
        <h2>📊 Defender Hall of Fame</h2>
        <p className="wd-stats-subtitle">Your learning & game progress tracking</p>
      </div>

      <div className="wd-stats-grid">
        <div className="wd-stat-card highlight">
          <div className="wd-stat-icon">👑</div>
          <div className="wd-stat-value">{stats.highScore.toLocaleString()}</div>
          <div className="wd-stat-label">High Score</div>
        </div>

        <div className="wd-stat-card highlight">
          <div className="wd-stat-icon">🔥</div>
          <div className="wd-stat-value">{stats.bestCombo}x</div>
          <div className="wd-stat-label">Best Combo</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">📚</div>
          <div className="wd-stat-value">{stats.wordsLearned.length}</div>
          <div className="wd-stat-label">Words Learned</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">🎯</div>
          <div className="wd-stat-value">{stats.totalCorrectAnswers}</div>
          <div className="wd-stat-label">Correct Answers</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">🎮</div>
          <div className="wd-stat-value">{stats.gamesPlayed}</div>
          <div className="wd-stat-label">Games Played</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">⏱️</div>
          <div className="wd-stat-value">{formatTime(stats.timePlayedSeconds)}</div>
          <div className="wd-stat-label">Time Played</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">⚡</div>
          <div className="wd-stat-value">{stats.currentStreak} Days</div>
          <div className="wd-stat-label">Current Streak</div>
        </div>

        <div className="wd-stat-card">
          <div className="wd-stat-icon">❤️</div>
          <div className="wd-stat-value">{stats.favoriteCategory}</div>
          <div className="wd-stat-label">Favorite Topic</div>
        </div>
      </div>

      {stats.wordsLearned.length > 0 && (
        <div className="wd-words-learned-section">
          <h3>📖 Learned Words Bank ({stats.wordsLearned.length})</h3>
          <div className="wd-words-tags">
            {stats.wordsLearned.map((word) => (
              <span key={word} className="wd-word-tag">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
