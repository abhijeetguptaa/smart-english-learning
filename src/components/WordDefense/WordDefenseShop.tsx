import React, { useState } from 'react';
import { useWordDefenseStore, Cosmetics, SelectedCosmetics } from '../../store/useWordDefenseStore';
import useStarStore from '../../store/useStarStore';

interface ShopItem {
  id: string;
  name: string;
  category: keyof Cosmetics;
  cost: number;
  icon: string;
  previewColor: string;
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Castles
  { id: 'classic', name: 'Classic Stone', category: 'castles', cost: 0, icon: '🏰', previewColor: '#64748b', description: 'Traditional sturdy stone fortress.' },
  { id: 'royal', name: 'Royal Kingdom', category: 'castles', cost: 100, icon: '🏰', previewColor: '#eab308', description: 'Golden turrets fit for a king.' },
  { id: 'candy', name: 'Fantasy Candy', category: 'castles', cost: 200, icon: '🍰', previewColor: '#ec4899', description: 'Sweet castle made of gingerbread & icing.' },
  { id: 'neon', name: 'Cyber Neon', category: 'castles', cost: 350, icon: '⚡', previewColor: '#06b6d4', description: 'Futuristic glowing energy fortress.' },
  { id: 'ice', name: 'Ice Fortress', category: 'castles', cost: 500, icon: '❄️', previewColor: '#38bdf8', description: 'Glacial fortress carved from enchanted ice.' },

  // Skins
  { id: 'cute_slimes', name: 'Cute Slimes', category: 'skins', cost: 0, icon: '🟢', previewColor: '#22c55e', description: 'Jelly blob monsters.' },
  { id: 'dragons', name: 'Little Dragons', category: 'skins', cost: 120, icon: '🐉', previewColor: '#ef4444', description: 'Chubby baby fire-breathers.' },
  { id: 'aliens', name: 'Space Aliens', category: 'skins', cost: 250, icon: '👾', previewColor: '#a855f7', description: 'Friendly one-eyed space critters.' },
  { id: 'pixels', name: 'Pixel Monsters', category: 'skins', cost: 300, icon: '👾', previewColor: '#f97316', description: 'Retro 8-bit arcade monsters.' },
  { id: 'bears', name: 'Gummy Bears', category: 'skins', cost: 450, icon: '🧸', previewColor: '#ec4899', description: 'Bouncy colorful gummy bears.' },

  // Cannons
  { id: 'wooden_cannon', name: 'Wooden Cannon', category: 'cannons', cost: 0, icon: '💣', previewColor: '#854d0e', description: 'Standard wooden artillery.' },
  { id: 'wand', name: 'Magic Wand', category: 'cannons', cost: 150, icon: '🪄', previewColor: '#8b5cf6', description: 'Shoots sparkle magic blasts.' },
  { id: 'bubble', name: 'Bubble Blaster', category: 'cannons', cost: 250, icon: '🫧', previewColor: '#38bdf8', description: 'Fires giant pop bubbles.' },
  { id: 'laser', name: 'Laser Turret', category: 'cannons', cost: 400, icon: '🔫', previewColor: '#ef4444', description: 'High-tech photon laser.' },
  { id: 'golden', name: 'Golden Cannon', category: 'cannons', cost: 600, icon: '👑', previewColor: '#eab308', description: 'Pure 24k solid gold cannon.' },

  // Backgrounds
  { id: 'green_meadow', name: 'Green Meadow', category: 'backgrounds', cost: 0, icon: '🌱', previewColor: '#4ade80', description: 'Lush green rolling hills.' },
  { id: 'sunset', name: 'Sunset Valley', category: 'backgrounds', cost: 100, icon: '🌅', previewColor: '#f97316', description: 'Warm orange sunset skies.' },
  { id: 'cosmic', name: 'Cosmic Space', category: 'backgrounds', cost: 300, icon: '🌌', previewColor: '#4c1d95', description: 'Deep starry galaxy backdrop.' },
  { id: 'underwater', name: 'Underwater Kingdom', category: 'backgrounds', cost: 400, icon: '🌊', previewColor: '#0284c7', description: 'Deep ocean coral environment.' },
  { id: 'candyland', name: 'Candy Land', category: 'backgrounds', cost: 500, icon: '🍭', previewColor: '#f472b6', description: 'Magical land of sweets & clouds.' },
];

export const WordDefenseShop: React.FC = () => {
  const { stars } = useStarStore();
  const { unlockedCosmetics, selectedCosmetics, unlockCosmetic, selectCosmetic } = useWordDefenseStore();
  const [activeTab, setActiveTab] = useState<keyof Cosmetics>('castles');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const tabs: { key: keyof Cosmetics; label: string; icon: string }[] = [
    { key: 'castles', label: 'Castles', icon: '🏰' },
    { key: 'skins', label: 'Monsters', icon: '👾' },
    { key: 'cannons', label: 'Cannons', icon: '💣' },
    { key: 'backgrounds', label: 'Backdrops', icon: '🌄' },
  ];

  const currentItems = SHOP_ITEMS.filter((item) => item.category === activeTab);

  const handleItemAction = (item: ShopItem) => {
    const isUnlocked = unlockedCosmetics[item.category]?.includes(item.id);
    const isSelected = selectedCosmetics[item.category as keyof SelectedCosmetics] === item.id;

    if (isSelected) return;

    if (isUnlocked) {
      selectCosmetic(item.category as keyof SelectedCosmetics, item.id);
      setPurchaseMsg(`Selected ${item.name}!`);
      setTimeout(() => setPurchaseMsg(null), 2000);
    } else {
      const success = unlockCosmetic(item.category, item.id, item.cost);
      if (success) {
        selectCosmetic(item.category as keyof SelectedCosmetics, item.id);
        setPurchaseMsg(`Unlocked and equipped ${item.name}! 🎉`);
        setTimeout(() => setPurchaseMsg(null), 2500);
      } else {
        setPurchaseMsg(`Not enough coins! You need ${item.cost - stars} more ⭐`);
        setTimeout(() => setPurchaseMsg(null), 2500);
      }
    }
  };

  return (
    <div className="wd-shop-container">
      <div className="wd-shop-header">
        <h2>🛍️ Armory & Cosmetics</h2>
        <div className="wd-coins-badge">
          <span>⭐ {stars}</span>
        </div>
      </div>

      {purchaseMsg && <div className="wd-shop-toast">{purchaseMsg}</div>}

      <div className="wd-shop-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`wd-shop-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="wd-shop-grid">
        {currentItems.map((item) => {
          const isUnlocked = unlockedCosmetics[item.category]?.includes(item.id);
          const isSelected = selectedCosmetics[item.category as keyof SelectedCosmetics] === item.id;

          return (
            <div
              key={item.id}
              className={`wd-shop-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
              style={{ '--preview-color': item.previewColor } as React.CSSProperties}
            >
              {isSelected && <div className="wd-equipped-tag">Equipped</div>}
              <div className="wd-shop-icon">{item.icon}</div>
              <h3 className="wd-shop-item-name">{item.name}</h3>
              <p className="wd-shop-item-desc">{item.description}</p>

              <button
                className={`wd-shop-action-btn ${isSelected ? 'equipped' : isUnlocked ? 'equip' : 'buy'}`}
                onClick={() => handleItemAction(item)}
              >
                {isSelected ? (
                  'Equipped ✓'
                ) : isUnlocked ? (
                  'Equip'
                ) : (
                  <>
                    <span>Unlock</span>
                    <span className="cost">⭐ {item.cost}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
