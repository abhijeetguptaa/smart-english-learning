import React, { useEffect, useState, useMemo, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { alphabetData, MODAL_ICON_SIZE } from '../data/alphabet';
import '../styles/Alphabets.scss';
import { playTapSound, speakText, stopSpeech } from '../utils/soundUtils';
import { wordToEmoji, createCustomIcon } from '../data/iconMapping';

const SPELLING_COLORS = [
  '#e91e63', // Vibrant Pink
  '#d81b60', // Deep Rose
  '#8e24aa', // Bright Purple
  '#673ab7', // Deep Purple
  '#3f51b5', // Royal Blue
  '#1e88e5', // Bright Blue
  '#0288d1', // Ocean Cyan
  '#00897b', // Dark Teal
  '#2e7d32', // Forest Green
  '#43a047', // Apple Green
  '#ef6c00', // Bright Orange
  '#e65100', // Deep Orange
  '#c62828', // Crimson Red
];

const getRandomColor = () => SPELLING_COLORS[Math.floor(Math.random() * SPELLING_COLORS.length)];

const Alphabets = () => {
  const { t } = useTranslation();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [modalWord, setModalWord] = useState('');
  const [modalColor, setModalColor] = useState<string>('');

  const currentLetter = alphabetData[currentLetterIndex];

  // Randomly assign font colors to word-spelling elements whenever current letter changes
  const wordColors = useMemo(() => {
    return currentLetter.words.reduce((acc, word) => {
      acc[word] = getRandomColor();
      return acc;
    }, {} as Record<string, string>);
  }, [currentLetterIndex, currentLetter]);

  // Randomly select font color for modal-spelling whenever modal is opened
  useEffect(() => {
    if (modalWord) {
      setModalColor(getRandomColor());
    }
  }, [modalWord]);

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
            <div className="word-spelling modal-spelling" style={{ color: modalColor }}>
              {t(`words.${modalWord}`)}
            </div>
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
                  size: 48,
                })}
              </div>
              <div className="word-spelling" style={{ color: wordColors[word] }}>
                {t(`words.${word}`)}
              </div>
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
