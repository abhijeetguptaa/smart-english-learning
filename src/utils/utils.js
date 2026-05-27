import React from 'react';

// Animation constants
export const EMOJI_ANIMATION_DURATION = 1500; // ms

// Quiz constants
export const QUIZ_ROUNDS = 10;

// Helper to shuffle array (Fisher-Yates)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper to robustly detect Cordova/Capacitor
export function isCordovaOrCapacitor() {
  return (
    typeof window !== 'undefined' &&
    window.cordova &&
    (window.Capacitor || window.cordova.platformId)
  );
}

// Helper to check if Cordova File and SocialSharing plugins are available
export function hasCordovaFileAndSharing() {
  return (
    typeof window !== 'undefined' &&
    window.resolveLocalFileSystemURL &&
    window.cordova &&
    window.cordova.file &&
    window.plugins &&
    window.plugins.socialsharing
  );
}

// Helper to convert base64 to Blob
export function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
}

export async function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function getRandomVisibleColor() {
  let hue;
  do {
    hue = Math.floor(Math.random() * 360);
  } while (hue >= 180 && hue <= 300); // Avoid blue/cyan tones

  const saturation = 60 + Math.random() * 20; // 60-80% for vibrancy
  const lightness = 40 + Math.random() * 20; // 40-60% for good visibility
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getRandomDarkColor() {
  const hue = Math.floor(Math.random() * 360); // 0–360
  const saturation = 50 + Math.random() * 30; // 50–80%
  const lightness = 15 + Math.random() * 20; // 15–35%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateDistinctColors(count) {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    const hue = (hueStep * i + Math.random() * (hueStep * 0.5)) % 360; // Spread hues and add a small random offset
    const saturation = 70 + Math.random() * 20; // 70-90% for vibrancy
    const lightness = 50 + Math.random() * 20; // 50-70% for good visibility
    colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`);
  }
  return colors;
}

export function createIcon(Icon, size) {
  return React.createElement(Icon, {
    size,
    color: getRandomVisibleColor(),
  });
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random item from an array, or null for invalid/empty inputs.
 */
export const getRandomItem = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Calculates the coordinates of a pointer event relative to an element.
 * Handles both mouse and touch events.
 */
export const getPointerCoordinates = (e, element) => {
  if (!element) return { x: 0, y: 0 };

  const rect = element.getBoundingClientRect();
  let clientX, clientY;

  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('changedTouches' in e && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    clientX = 0;
    clientY = 0;
  }

  // Calculate scale if canvas internal dimensions differ from CSS dimensions
  const scaleX = element.width ? element.width / rect.width : 1;
  const scaleY = element.height ? element.height / rect.height : 1;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
};
