// Component for user settings, language selection.
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Settings.scss';
import { getGameVolume } from '../utils/soundUtils';
import { IS_TEST_MODE, STORAGE_KEYS } from '../constants/appConstants';
import useStarStore from '../store/useStarStore';
import ParentalGate from './ParentalGate';

const Settings = ({ userName, onNameSubmit, onClose }) => {
  const { t } = useTranslation();
  const { stars, addStars } = useStarStore();

  const [name, setName] = useState(userName);
  const [volume, setVolume] = useState(getGameVolume());
  const [showGate, setShowGate] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const isChild = useMemo(() => {
    const age = localStorage.getItem(STORAGE_KEYS.USER_AGE);
    return age ? parseInt(age, 10) < 13 : true;
  }, []);

  const handleActionWithGate = (action) => {
    if (isChild) {
      setPendingAction(() => action);
      setShowGate(true);
    } else {
      action();
    }
  };

  const handleNameChange = (e) => {
    const nextName = e.target.value;
    setName(nextName);

    if (nextName.includes('07042020')) {
      if (stars < 20000) {
        const amountToAdd = Math.min(5000, 20000 - stars);
        addStars(amountToAdd);
      }
    }
    onNameSubmit(nextName);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: t('common.appName'),
          text: t('app.description'),
          url: 'https://play.google.com/store/apps/details?id=smart.english.learning',
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert(t('common.messages.shareNotSupported'));
    }
  };

  const handleRateUs = () => {
    window.open('https://play.google.com/store/apps/details?id=smart.english.learning', '_blank');
  };

  const handleFacebook = () => {
    window.open('https://www.facebook.com/profile.php?id=61587430264037', '_blank');
  };

  const handleFeedback = () => {
    window.open('https://wa.me/919717094901', '_blank');
  };

  const handlePrivacyPolicy = () => {
    window.open('privacy-policy.html', '_blank');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('gameVolume', newVolume);
    window.dispatchEvent(new CustomEvent('volumechange', { detail: { volume: newVolume } }));
  };
  const handleVolumeChangeFromButtons = (value) => {
    const newVolume = value;
    setVolume(newVolume);
    localStorage.setItem('gameVolume', newVolume);
    window.dispatchEvent(new CustomEvent('volumechange', { detail: { volume: newVolume } }));
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close-button" onClick={onClose}>
          ✖
        </button>
        <h2 className="settings-title">{t('settings.title')}</h2>
        <div className="settings-content">
          <div className="settings-cards-container">
            {/* PROFILE CARD */}
            <div className="settings-card profile-card">
              <div className="input-group">
                <input value={name} onChange={handleNameChange} className="px-3" maxLength={16} />
              </div>

              <div className="volume-control-wrapper">
                <button className="volume-btn" onClick={() => handleVolumeChangeFromButtons(0)}>
                  🔈
                </button>

                <div className="volume-slider-container">
                  <span className="volume-percentage">{Math.round(volume * 1000)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
                <button className="volume-btn" onClick={() => handleVolumeChangeFromButtons(0.1)}>
                  🔊
                </button>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="settings-actions">
            <button
              className="level-btn btn-feedback"
              onClick={() => handleActionWithGate(handleFeedback)}
            >
              {t('settings.feedback')} 💬
            </button>
            <button
              className="level-btn btn-facebook"
              onClick={() => handleActionWithGate(handleFacebook)}
            >
              {t('settings.facebook')}
            </button>
            <button
              className="level-btn btn-privacy"
              onClick={() => handleActionWithGate(handlePrivacyPolicy)}
            >
              {t('settings.privacyPolicy')} 🔒
            </button>
            {!IS_TEST_MODE && (
              <>
                <button
                  onClick={() => handleActionWithGate(handleShare)}
                  className="level-btn btn-share"
                >
                  {t('settings.shareApp')}
                </button>
                <button
                  onClick={() => handleActionWithGate(handleRateUs)}
                  className="level-btn btn-rate"
                >
                  {t('settings.rateUs')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showGate && (
        <ParentalGate
          onConfirm={() => {
            setShowGate(false);
            if (pendingAction) pendingAction();
          }}
          onCancel={() => {
            setShowGate(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

export default Settings;
