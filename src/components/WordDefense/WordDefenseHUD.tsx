import React from 'react';
import { WordDefenseHUDProps } from './types';

export const WordDefenseHUD: React.FC<WordDefenseHUDProps> = ({
  castleHealth,
  hasShield,
  question,
  onBackToMenu,
  onPause,
  onAnnounceQuestion,
}) => {
  return (
    <>
      {/* Top Controls Bar */}
      <div className="wd-top-bar">
        <button
          className="wd-hud-btn wd-hud-back-btn"
          onClick={onBackToMenu}
          aria-label="Back to Menu"
          title="Back to Menu"
        >
          ⇦
        </button>

        <div className="wd-top-lives-hud">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`wd-top-heart ${i < castleHealth ? 'full' : 'empty'}`}>
              {i < castleHealth ? '❤️' : '🖤'}
            </span>
          ))}
          {hasShield && <span className="wd-top-shield-indicator">🛡️</span>}
        </div>

        <button
          className="wd-hud-btn wd-hud-pause-btn"
          onClick={onPause}
          aria-label="Pause Game"
          title="Pause"
        >
          ⏸️
        </button>
      </div>

      {/* Question Prompt Header */}
      {question && (
        <div
          className="wd-question-banner"
          onClick={() => onAnnounceQuestion(question)}
          role="button"
          tabIndex={0}
          title="Tap to hear question again"
        >
          <span className="wd-speaker-icon" style={{ marginRight: '6px', fontSize: '1.1rem' }}>
            🔊
          </span>
          <div className="wd-question-text">{question.prompt}</div>
        </div>
      )}
    </>
  );
};
