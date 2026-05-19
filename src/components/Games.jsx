import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryColor } from '../constants/colors';

function Games() {
  const { t } = useTranslation();
  const subjects = [
    {
      to: '/memory-match',
      label: t('home.subjects.memoryMatch.label'),
      src: '/memoryMatch.webp',
      title: t('home.subjects.memoryMatch.title'),
    },
    {
      to: '/sudoku',
      label: t('home.subjects.sudoku.label'),
      src: '/sudoku.webp',
      title: t('home.subjects.sudoku.title'),
    },
    {
      to: '/tictactoe',
      label: t('home.subjects.ticTacToe.label'),
      src: '/tic_tac_toe.webp',
      title: t('home.subjects.ticTacToe.title'),
    },
    {
      to: '/gridMatch',
      label: t('home.subjects.gridMatch.label'),
      src: '/gridMatch.webp',
      title: t('home.subjects.gridMatch.title'),
    },

    {
      to: '/star-pop/spin-wheel',
      label: t('home.subjects.spinWheel.label'),
      src: '/spinWheel.webp',
      title: t('home.subjects.spinWheel.title'),
    },
    {
      to: '/star-pop/smart-match',
      label: t('home.subjects.smartMatch.label'),
      src: '/smartMatch.webp',
      title: t('home.subjects.smartMatch.title'),
    },
  ];

  return (
    <main className="landing-page" role="main">
      <nav
        className="subject-selection games"
        role="navigation"
        aria-label={t('common.accessibility.subjectSelection')}
      >
        {subjects.map((subject, index) => (
          <Link
            to={subject.to}
            className="subject-icon-button"
            aria-label={subject.title}
            title={subject.title}
            key={subject.to}
            style={{
              '--card-color': getCategoryColor(index),
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <img className="subject-icon subject-icon--img" src={subject.src} alt={subject.label} />
            <div className="gameName">{subject.label}</div>
          </Link>
        ))}
      </nav>
    </main>
  );
}

export default Games;
