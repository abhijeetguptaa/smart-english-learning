import React from 'react';
import { WordDefenseGameOverModalProps, WordDefensePauseModalProps } from './types';
import { playClickSound } from '../../utils/soundUtils';

export const WordDefensePauseModal: React.FC<WordDefensePauseModalProps> = ({
  onResume,
  onBackToMenu,
  onOpenView,
}) => {
  return (
    <div className="wd-modal-overlay">
      <div className="wd-modal-card">
        <h2>⏸️ Game Paused</h2>
        <div className="wd-modal-actions">
          <button className="wd-primary-btn" onClick={onResume}>
            ▶️ Resume Game
          </button>
          <button
            className="wd-primary-btn"
            style={{ background: '#64748b', marginTop: '6px' }}
            onClick={onBackToMenu}
          >
            🏠 Main Menu
          </button>
          {onOpenView && (
            <div className="wd-subview-nav-grid">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('shop');
                }}
              >
                🛍️ Armory
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('missions');
                }}
              >
                🎯 Quests
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('achievements');
                }}
              >
                🏆 Trophies
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('stats');
                }}
              >
                📊 Stats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const WordDefenseGameOverModal: React.FC<WordDefenseGameOverModalProps> = ({
  score,
  maxCombo,
  coins,
  correctAnswersCount,
  totalQuestionsAnswered,
  onPlayAgain,
  onBackToMenu,
  onOpenView,
}) => {
  return (
    <div className="wd-modal-overlay">
      <div className="wd-modal-card victory animate-pop">
        <div className="wd-modal-banner">🏰 Game Over!</div>
        <p className="wd-modal-subtitle">Great defense effort!</p>

        <div className="wd-results-summary">
          <div className="wd-res-box">
            <span className="res-val">{score}</span>
            <span className="res-lbl">Final Score</span>
          </div>
          <div className="wd-res-box">
            <span className="res-val">🔥 {maxCombo}x</span>
            <span className="res-lbl">Max Combo</span>
          </div>
          <div className="wd-res-box">
            <span className="res-val">⭐ +{coins}</span>
            <span className="res-lbl">Coins Earned</span>
          </div>
          <div className="wd-res-box">
            <span className="res-val">
              {totalQuestionsAnswered > 0
                ? `${Math.round((correctAnswersCount / totalQuestionsAnswered) * 100)}%`
                : '0%'}
            </span>
            <span className="res-lbl">Accuracy</span>
          </div>
        </div>

        <div className="wd-modal-actions">
          <button className="wd-primary-btn" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button
            className="wd-primary-btn"
            style={{ background: '#64748b', marginTop: '6px' }}
            onClick={onBackToMenu}
          >
            🏠 Main Menu
          </button>
          {onOpenView && (
            <div className="wd-subview-nav-grid">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('shop');
                }}
              >
                🛍️ Armory
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('missions');
                }}
              >
                🎯 Quests
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('achievements');
                }}
              >
                🏆 Trophies
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenView('stats');
                }}
              >
                📊 Stats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
