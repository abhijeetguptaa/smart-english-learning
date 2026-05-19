import React from 'react';
import { shopData } from '../data/shop.ts';
import '../styles/Shop.scss';
import { useTranslation } from 'react-i18next';

const Shop = () => {
  const { t } = useTranslation();

  return (
    <div className="app-container bookmarks-page">
      <div className="shop-list-container">
        <div className="links-list">
          {shopData.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-item"
              title={`${t('shop.visit')}${t(link.label)}`}
            >
              <div className="link-content">
                <div className="link-info">
                  <span className="link-label">{t(link.label)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
