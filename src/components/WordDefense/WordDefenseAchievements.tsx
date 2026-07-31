import React from 'react';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';

export const WordDefenseAchievements: React.FC = () => {
  const { achievements } = useWordDefenseStore();

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="wd-achievements-container">
      <div className="wd-achievements-header">
        <h2>🏆 Trophies & Achievements</h2>
        <div className="wd-trophy-counter">
          <span>Unlocked: {totalUnlocked} / {achievements.length}</span>
        </div>
      </div>

      <div className="wd-achievements-grid">
        {achievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div key={ach.id} className={`wd-achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="wd-ach-icon">{ach.icon}</div>
              <div className="wd-ach-content">
                <h3>{ach.title}</h3>
                <p>{ach.description}</p>
                <div className="wd-ach-progress-bg">
                  <div className="wd-ach-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="wd-ach-progress-num">
                  {ach.current} / {ach.target}
                </span>
              </div>
              {ach.unlocked && <div className="wd-ach-badge">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
