import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/NeutralAgeScreen.scss';

const NeutralAgeScreen = ({ onAgeSubmit }) => {
  const { t } = useTranslation();
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError(t('ageScreen.invalidAge'));
      return;
    }
    onAgeSubmit(ageNum);
  };

  return (
    <div className="age-screen">
      <div className="age-screen__content">
        <h1 className="age-screen__title">{t('ageScreen.title')}</h1>
        <p className="age-screen__description">{t('ageScreen.description')}</p>
        <form onSubmit={handleSubmit} className="age-screen__form">
          <input
            type="number"
            className="age-screen__input"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setError('');
            }}
            placeholder={t('ageScreen.placeholder')}
            autoFocus
          />
          {error && <p className="age-screen__error">{error}</p>}
          <button type="submit" className="age-screen__submit level-btn btn-easy">
            {t('ageScreen.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NeutralAgeScreen;
