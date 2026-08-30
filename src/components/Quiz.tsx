import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { quizData } from '../data/quiz';
import '../styles/Quiz.scss';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { speakText, stopSpeech } from '../utils/soundUtils';
import { QUIZ_ROUNDS } from '../utils/utils';
import SuccessModal from './SuccessModal';
import { showSafeRewarded } from '../utils/admob';
import { useSparkleBurst } from '@/hooks/useSparkleBurst';

const Quiz = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { difficulty } = useParams();
  const complexity = difficulty || 'easy';
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(`quiz_index_${complexity}`);
    const total = (quizData[complexity] || []).length || 1;
    if (saved !== null) {
      const savedIndex = parseInt(saved, 10);
      const nextIndex = isNaN(savedIndex) ? 0 : (savedIndex + 1) % total;
      localStorage.setItem(`quiz_index_${complexity}`, String(nextIndex));
      return nextIndex;
    }
    localStorage.setItem(`quiz_index_${complexity}`, '0');
    return 0;
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isEmojiVisible, setIsEmojiVisible] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const [fiftyFiftyCount, setFiftyFiftyCount] = useState(3);
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [isAdLoadingFifty, setIsAdLoadingFifty] = useState(false);
  const pendingPostEmojiActionRef = useRef<(() => void) | null>(null);
  const { triggerSparkleBurst, SparkleRenderer } = useSparkleBurst();

  const questions = useMemo(() => {
    return quizData[complexity] || [];
  }, [complexity]);

  // Ensure currentIndex is valid if data changes
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(0);
    }
  }, [questions.length, currentIndex]);

  const question = questions[currentIndex % (questions.length || 1)];

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAnswered(false);
    setIsFiftyFiftyUsed(false);
    setHiddenOptions([]);

    const nextIndex = (currentIndex + 1) % (questions.length || 1);
    setCurrentIndex(nextIndex);
    localStorage.setItem(`quiz_index_${complexity}`, String(nextIndex));
  }, [currentIndex, questions.length, complexity]);

  const speakQuestion = useCallback(() => {
    if (question && question.q) {
      stopSpeech();
      speakText(question.q);
    }
  }, [question]);

  useEffect(() => {
    if (question && !answered) {
      speakQuestion();
    }
  }, [currentIndex, question, answered, speakQuestion]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (!isEmojiVisible || !isCorrect) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      triggerSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, {
        count: 48,
        range: 240,
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isEmojiVisible, isCorrect, triggerSparkleBurst]);

  const handleFiftyFifty = () => {
    if (fiftyFiftyCount > 0 && !isFiftyFiftyUsed && question) {
      const correct = question.a;
      const wrongIndices: number[] = [];
      question.o.forEach((opt: string, idx: number) => {
        if (opt !== correct) wrongIndices.push(idx);
      });

      // Randomly pick 2 wrong ones to hide
      const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5);
      setHiddenOptions([shuffled[0], shuffled[1]]);
      setFiftyFiftyCount((prev) => prev - 1);
      setIsFiftyFiftyUsed(true);
    } else if (fiftyFiftyCount <= 0) {
      handleFiftyFiftyReward();
    }
  };

  const handleFiftyFiftyReward = async () => {
    if (isAdLoadingFifty) return;
    setIsAdLoadingFifty(true);
    try {
      await showSafeRewarded();
      setFiftyFiftyCount(3);
    } catch (err) {
      console.error('Failed to show rewarded ad for 50-50:', err);
    } finally {
      setIsAdLoadingFifty(false);
    }
  };

  const handleEmojiAnimationEnd = () => {
    setIsEmojiVisible(false);
    const action = pendingPostEmojiActionRef.current;
    pendingPostEmojiActionRef.current = null;
    action?.();
  };

  const handleAnswer = (option) => {
    if (!answered) {
      const isAnswerCorrect = option === question.a;
      setSelectedAnswer(option);
      setIsCorrect(isAnswerCorrect);
      setAnswered(true);
      setIsEmojiVisible(true);

      if (isAnswerCorrect) {
        speakText(question.a);
        setCorrectCount((prev) => prev + 1);
      }

      const nextSessionCount = sessionQuestionCount + 1;

      pendingPostEmojiActionRef.current = () => {
        setSessionQuestionCount(nextSessionCount);
        handleNext();
        if (nextSessionCount >= QUIZ_ROUNDS) {
          setShowWinModal(true);
        }
      };
    }
  };

  const handleWinModalClose = () => {
    setShowWinModal(false);
    setSessionQuestionCount(0);
    setCorrectCount(0);
  };

  const handleNewRound = () => {
    setShowWinModal(false);
    setSessionQuestionCount(0);
    setCorrectCount(0);
  };

  return (
    <div className="app-container quiz-page learning-bg">
      <div className="quiz-container">
        {/* Progress Header */}
        <div className="quiz-header">
          <div className="progress-container">
            <div className="progress-text">
              {t('quiz.question', 'Question')} {Math.min(sessionQuestionCount + 1, QUIZ_ROUNDS)} /{' '}
              {QUIZ_ROUNDS}
            </div>
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar-fill"
                style={{ width: `${(sessionQuestionCount / QUIZ_ROUNDS) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="emoji-container">
          {isEmojiVisible && (
            <span className="emoji-animation" onAnimationEnd={handleEmojiAnimationEnd}>
              {isCorrect ? '😃' : '😢'}
            </span>
          )}
        </div>

        <SparkleRenderer />

        {/* Question */}
        {currentIndex < questions.length ? (
          <div className="quiz-card animate-in" key={currentIndex}>
            <div className="question-section">
              <h3 className="question-text">{question.q}</h3>
            </div>

            <div className="quiz-options">
              {question.o.map((option, idx) => (
                <button
                  key={idx}
                  className={`quiz-option color-${idx % 4} ${
                    answered && option === selectedAnswer
                      ? isCorrect
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  } ${answered && option === question.a ? 'correct' : ''}`}
                  onClick={() => handleAnswer(option)}
                  disabled={answered || hiddenOptions.includes(idx)}
                  style={{
                    opacity: hiddenOptions.includes(idx) ? 0 : 1,
                    pointerEvents: hiddenOptions.includes(idx) ? 'none' : 'auto',
                  }}
                >
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {/* Lifeline 50-50 */}
            <div className="fifty-fifty-container">
              <button
                className="fifty-fifty-btn"
                onClick={handleFiftyFifty}
                disabled={answered || isFiftyFiftyUsed || isAdLoadingFifty}
              >
                {isAdLoadingFifty ? (
                  '...'
                ) : (
                  <>
                    {fiftyFiftyCount > 0
                      ? t('quiz.lifeline_50_50', '🌓 50-50')
                      : t('quiz.lifeline_50_50_ad', '🎬 50-50')}
                    <span className="count-badge">{fiftyFiftyCount}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-card completed">
            <p className="quiz-completed-text">{t('quiz.completed')}</p>
          </div>
        )}
      </div>

      {showWinModal && (
        <SuccessModal
          handleClose={handleWinModalClose}
          message={t('questionBox.scoreMessage', {
            correctAnswersCount: correctCount,
            quizRounds: QUIZ_ROUNDS,
          })}
          starsWon={correctCount > 0 ? Math.ceil((correctCount / QUIZ_ROUNDS) * 5) : 0}
          showNewGame={true}
          onNewGame={handleNewRound}
        />
      )}
    </div>
  );
};
export default Quiz;
