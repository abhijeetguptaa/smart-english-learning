import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  generateCardDeck,
  GameCard,
  WordMatchCategory,
} from '../../data/wordMatchData';
import {
  playCardFlipSound,
  playCorrectSound,
  playIncorrectSound,
  playApplauseSound,
  speakText,
  stopSpeech,
  stopAllTones,
} from '../../utils/soundUtils';
import { useSparkleBurst } from '../../hooks/useSparkleBurst';
import SuccessModal from '../SuccessModal';
import './WordMatch.scss';

const DIFFICULTY_PAIRS: Record<string, number> = {
  easy: 3,
  medium: 4,
  hard: 6,
};

const WordMatchGame: React.FC = () => {
  const { difficulty = 'easy' } = useParams<{ difficulty: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const totalPairs = DIFFICULTY_PAIRS[difficulty] || 3;
  const [selectedCategory, setSelectedCategory] = useState<WordMatchCategory | 'all'>('all');

  const [cards, setCards] = useState<GameCard[]>([]);
  const [firstCardId, setFirstCardId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [wobblingCardIds, setWobblingCardIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);

  const { triggerSparkleBurst, SparkleRenderer } = useSparkleBurst();
  const mismatchTimerRef = useRef<number | null>(null);
  const announcementTimerRef = useRef<number | null>(null);

  // Initialize or restart board
  const initializeGame = useCallback(() => {
    if (mismatchTimerRef.current) clearTimeout(mismatchTimerRef.current);
    if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);

    const newDeck = generateCardDeck(selectedCategory, totalPairs);
    setCards(newDeck);
    setFirstCardId(null);
    setIsLocked(false);
    setWobblingCardIds([]);
    setMatchedCount(0);
    setAnnouncement(null);
    setShowWinModal(false);
  }, [selectedCategory, totalPairs]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Clean up sounds and speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopAllTones();
      if (mismatchTimerRef.current) clearTimeout(mismatchTimerRef.current);
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    };
  }, []);

  const handleCardClick = (clickedCard: GameCard) => {
    if (isLocked) return;
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    playCardFlipSound();
    speakText(clickedCard.word);

    // Flip the clicked card
    const updatedCards = cards.map((c) =>
      c.cardId === clickedCard.cardId ? { ...c, isFlipped: true } : c,
    );
    setCards(updatedCards);

    if (!firstCardId) {
      // First card flipped in this turn
      setFirstCardId(clickedCard.cardId);
      return;
    }

    // Second card flipped in this turn
    setIsLocked(true);

    const firstCard = cards.find((c) => c.cardId === firstCardId);
    if (!firstCard) {
      setIsLocked(false);
      return;
    }

    // Check for match
    if (firstCard.pairId === clickedCard.pairId) {
      // MATCH!
      playCorrectSound();
      triggerSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, {
        count: 24,
        range: 300,
      });

      setAnnouncement(clickedCard.explanation);
      speakText(clickedCard.explanation);

      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = window.setTimeout(() => {
        setAnnouncement(null);
      }, 3500);

      const newCards = updatedCards.map((c) =>
        c.pairId === clickedCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c,
      );
      setCards(newCards);

      const newMatchedCount = matchedCount + 1;
      setMatchedCount(newMatchedCount);
      setFirstCardId(null);
      setIsLocked(false);

      // Check for win
      if (newMatchedCount === totalPairs) {
        setTimeout(() => {
          playApplauseSound();
          triggerSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, {
            count: 40,
            range: 400,
          });
          setShowWinModal(true);
        }, 800);
      }
    } else {
      // MISMATCH
      playIncorrectSound();
      setWobblingCardIds([firstCardId, clickedCard.cardId]);

      if (mismatchTimerRef.current) clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = window.setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.cardId === firstCardId || c.cardId === clickedCard.cardId
              ? { ...c, isFlipped: false }
              : c,
          ),
        );
        setWobblingCardIds([]);
        setFirstCardId(null);
        setIsLocked(false);
      }, 850);
    }
  };

  const gridClass = useMemo(() => {
    if (totalPairs <= 3) return 'grid-easy';
    if (totalPairs <= 4) return 'grid-medium';
    return 'grid-hard';
  }, [totalPairs]);

  const starsWon = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

  return (
    <div className="word-match-page">
      <SparkleRenderer />

      {/* HEADER SECTION */}
      <header className="word-match-header">
        {/* CATEGORY TABS */}
        <div className="word-match-tabs">
          <button
            type="button"
            className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            🌟 All
          </button>
          <button
            type="button"
            className={`tab-btn ${selectedCategory === 'opposites' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('opposites')}
          >
            🔥 Opposites
          </button>
          <button
            type="button"
            className={`tab-btn ${selectedCategory === 'rhymes' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('rhymes')}
          >
            🐱 Rhymes
          </button>
          <button
            type="button"
            className={`tab-btn ${selectedCategory === 'associations' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('associations')}
          >
            🐝 Associations
          </button>
        </div>
      </header>

      {/* ANNOUNCEMENT BANNER */}
      {announcement && (
        <div className="match-announcement-banner" role="status">
          ✨ {announcement}
        </div>
      )}

      {/* CARD GRID */}
      <main className="word-match-board-container">
        <div className={`word-match-grid ${gridClass}`}>
          {cards.map((card) => {
            const isCardFlipped = card.isFlipped || card.isMatched;
            const isWobbling = wobblingCardIds.includes(card.cardId);

            return (
              <div
                key={card.cardId}
                className={`card-item ${card.isMatched ? 'disabled' : ''}`}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                aria-label={isCardFlipped ? card.word : 'Hidden card'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(card);
                  }
                }}
              >
                <div
                  className={`card-inner ${isCardFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${isWobbling ? 'wobble' : ''}`}
                >
                  {/* CARD BACK (Hidden state) */}
                  <div className="card-face card-back">
                    <span className="card-back-icon">⭐</span>
                    <span className="card-back-pattern">TAP</span>
                  </div>

                  {/* CARD FRONT (Revealed state) */}
                  <div
                    className="card-face card-front"
                    style={{ '--card-theme-color': card.color } as React.CSSProperties}
                  >
                    <span className="card-emoji">{card.emoji}</span>
                    <span className="card-word">{card.word}</span>
                    {card.isMatched && <span className="card-matched-badge">✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="word-match-footer">
        <button type="button" className="footer-btn" onClick={initializeGame}>
          🔄 Restart
        </button>
        <button type="button" className="footer-btn" onClick={() => navigate('/word-match')}>
          📊 Change Level
        </button>
      </footer>

      {/* SUCCESS MODAL ON WIN */}
      {showWinModal && (
        <SuccessModal
          starsWon={starsWon}
          message={t('wordMatch.successMsg', 'Awesome Memory Master! You matched all pairs!')}
          showNewGame={true}
          onNewGame={initializeGame}
          handleClose={() => navigate('/word-match')}
        />
      )}
    </div>
  );
};

export default WordMatchGame;
