import React, { useEffect } from 'react';
import { useWordDefenseStore } from '../../store/useWordDefenseStore';

export const WordDefenseMissions: React.FC = () => {
  const { dailyMissions, claimMissionReward, checkAndResetDailyMissions } = useWordDefenseStore();

  useEffect(() => {
    checkAndResetDailyMissions();
  }, [checkAndResetDailyMissions]);

  return (
    <div className="wd-missions-container">
      <div className="wd-missions-header">
        <h2>🎯 Daily Quests</h2>
        <p className="wd-missions-subtitle">Complete daily missions to earn bonus coins!</p>
      </div>

      <div className="wd-missions-list">
        {dailyMissions.map((mission) => {
          const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));
          const canClaim = mission.current >= mission.target && !mission.claimed;

          return (
            <div key={mission.id} className={`wd-mission-card ${mission.claimed ? 'claimed' : ''}`}>
              <div className="wd-mission-info">
                <h3>{mission.title}</h3>
                <div className="wd-mission-progress-bar-bg">
                  <div
                    className="wd-mission-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="wd-mission-progress-text">
                  {mission.current} / {mission.target}
                </span>
              </div>

              <div className="wd-mission-reward">
                {mission.claimed ? (
                  <span className="wd-claimed-badge">Completed ✓</span>
                ) : (
                  <button
                    className={`wd-claim-btn ${canClaim ? 'ready' : 'locked'}`}
                    disabled={!canClaim}
                    onClick={() => claimMissionReward(mission.id)}
                  >
                    <span>⭐ {mission.reward}</span>
                    <span>{canClaim ? 'Claim' : 'In Progress'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
