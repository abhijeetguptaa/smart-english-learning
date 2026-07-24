import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryColor, getCategoryBGColor } from '../constants/colors';

const TapLearnSelection = () => {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'letters',
      path: '/tap-learn/letters',
      icon: '/alphabet.webp',
      label: t('home.subjects.tapLearnLetters.label'),
    },
    {
      id: 'farm-animals',
      path: '/tap-learn/farmAnimals',
      icon: '/farm-animals.webp',
      label: t('home.subjects.tapLearnFarmAnimals.label'),
    },
    {
      id: 'wild-animals',
      path: '/tap-learn/wildAnimals',
      icon: '/wild-animals.webp',
      label: t('home.subjects.tapLearnWildAnimals.label'),
    },
    {
      id: 'sea-animals',
      path: '/tap-learn/seaAnimals',
      icon: '/sea-animals.webp',
      label: t('home.subjects.tapLearnSeaAnimals.label'),
    },
    {
      id: 'insects',
      path: '/tap-learn/insects',
      icon: '/insects.webp',
      label: t('home.subjects.tapLearnInsects.label'),
    },
    {
      id: 'colors',
      path: '/tap-learn/colors',
      icon: '/colors.webp',
      label: t('home.subjects.tapLearnColors.label'),
    },
    {
      id: 'vegetables',
      path: '/tap-learn/vegetables',
      icon: '/vegetables.webp',
      label: t('home.subjects.tapLearnVegetables.label'),
    },
    {
      id: 'fruits',
      path: '/tap-learn/fruits',
      icon: '/fruits.webp',
      label: t('home.subjects.tapLearnFruits.label'),
    },
    {
      id: 'vehicles',
      path: '/tap-learn/vehicles',
      icon: '/vehicles.webp',
      label: t('home.subjects.tapLearnVehicles.label'),
    },
    {
      id: 'food',
      path: '/tap-learn/food',
      icon: '/food.webp',
      label: t('home.subjects.tapLearnFood.label'),
    },
    {
      id: 'instruments',
      path: '/tap-learn/instruments',
      icon: '/instruments.webp',
      label: t('home.subjects.tapLearnInstruments.label'),
    },
    {
      id: 'shapes',
      path: '/tap-learn/shapes',
      icon: '/shapes.webp',
      label: t('home.subjects.tapLearnShapes.label'),
    },
  ];

  return (
    <main className="landing-page" role="main">
      <nav className="subject-selection" role="navigation">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={category.path}
            className="subject-icon-button"
            style={{
              '--card-color': getCategoryColor(index),
              '--bg-color': getCategoryBGColor(index),
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <img
              className="subject-icon subject-icon--img-homepage"
              src={category.icon}
              alt={category.label}
              loading="eager"
              decoding="async"
            />
            <div className="gameName">{category.label}</div>
          </Link>
        ))}
      </nav>
    </main>
  );
};

export default TapLearnSelection;
