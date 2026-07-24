import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/ParentalGate.scss';

interface ParentalGateProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ParentalGate: React.FC<ParentalGateProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const correctAnswer = num1 + num2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer, 10) === correctAnswer) {
      onConfirm();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="parental-gate-overlay" onClick={onCancel}>
      <div className="parental-gate-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('parentalGate.title', 'Parents Only')}</h2>
        <p>{t('parentalGate.description', 'Please solve this to continue:')}</p>
        <div className="math-question">
          {num1} + {num2} = ?
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            placeholder="?"
            autoFocus
          />
          {error && <p className="error-text">{t('parentalGate.wrongAnswer', 'Wrong answer, try again.')}</p>}
          <div className="gate-actions">
            <button type="button" className="level-btn btn-easy" onClick={onCancel}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="level-btn btn-hard">
              {t('common.done')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentalGate;
