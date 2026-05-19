import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryColor } from '../constants/colors';

function Utils() {
  const { t } = useTranslation();
  const subjects = [
    {
      to: '/calculator',
      label: t('home.subjects.calculator.label'),
      src: '/calculator.webp',
      title: t('home.subjects.calculator.title'),
    },
    {
      to: '/notes',
      label: t('home.subjects.notes.label'),
      src: '/notes.webp',
      title: t('home.subjects.notes.title'),
    },
  ];

  return (
    <main className="landing-page" role="main">
      <nav
        className="subject-selection utils"
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

export default Utils;
