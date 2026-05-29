import React, { useEffect, useState, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { alphabetData, MODAL_ICON_SIZE } from '../data/alphabet';
import '../styles/Alphabets.scss';
import { playTapSound, speakText, stopSpeech } from '../utils/soundUtils';
import { wordToEmoji, createCustomIcon } from '../data/iconMapping';

const Alphabets = () => {
  const { t } = useTranslation();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [modalWord, setModalWord] = useState('');

  const currentLetter = alphabetData[currentLetterIndex];

  useEffect(() => {
    const speakLetter = async () => {
      await stopSpeech();
      await speakText(currentLetter.letter);
    };
    speakLetter();
  }, [currentLetter.letter]);

  const speak = async (text: string) => {
    await stopSpeech();
    await speakText(text);
  };

  const onLetterKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      speak(`${currentLetter.letter}, ${currentLetter.smallLetter}`);
    }
  };

  useEffect(() => {
    if (!modalWord) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setModalWord('');
    window.addEventListener('keydown', onEsc as any);
    return () => window.removeEventListener('keydown', onEsc as any);
  }, [modalWord]);

  const maxIndex = alphabetData.length - 1;

  return (
    <div className="app-container alphabet-page">
      {modalWord && (
        <div className="modal-overlay" onClick={() => setModalWord('')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label={t('common.close')}
              onClick={() => setModalWord('')}
            >
              ✕
            </button>
            <div className="word-icon modal-icon">
              {React.createElement(createCustomIcon(wordToEmoji[modalWord.toUpperCase()]), {
                size: MODAL_ICON_SIZE,
              })}
            </div>
            <div className="word-spelling modal-spelling">{t(`words.${modalWord}`)}</div>
          </div>
        </div>
      )}

      <div className={`alphabet-card letter-variant-${currentLetterIndex % 5}`}>
        <div className="alphabet-header">
          <div
            className="letter-pair"
            tabIndex={0}
            onClick={() => {
              speak(`${currentLetter.letter}`);
            }}
            onKeyPress={onLetterKeyPress}
          >
            <span className="letter-capital">{currentLetter.letter}</span>
            <span className="letter-small">{currentLetter.smallLetter}</span>
          </div>
        </div>

        <div className="words-list">
          {currentLetter.words.map((word) => (
            <div
              key={word}
              className="word-item"
              onClick={() => {
                setModalWord(word);
                speak(
                  t('alphabet.isFor', {
                    letter: currentLetter.letter,
                    word: t(`words.${word}`),
                  }),
                );
              }}
            >
              <div className="word-icon">
                {React.createElement(createCustomIcon(wordToEmoji[word.toUpperCase()]), {
                  size: 64,
                })}
              </div>
              <div className="word-spelling">{t(`words.${word}`)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="navigation-controls">
        <button
          onClick={() => {
            playTapSound();
            setCurrentLetterIndex((i) => (i === 0 ? maxIndex : i - 1));
          }}
          className="nav-button nav-control-button nav-button--back"
          aria-label={t('common.actions.previous')}
        >
          <span className="text-white text-2xl rotate-180">➜</span>
        </button>
        <button
          onClick={() => {
            playTapSound();
            setCurrentLetterIndex((i) => (i === maxIndex ? 0 : i + 1));
          }}
          className="nav-button nav-control-button nav-button--next"
          aria-label={t('common.actions.next')}
        >
          <span className="text-white text-2xl">➜</span>
        </button>
      </div>
    </div>
  );
};

export default Alphabets;
