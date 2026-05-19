import { useSparkleBurst } from '@/hooks/useSparkleBurst';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { playTapSound } from '../utils/soundUtils';
import { getRandomInt } from '../utils/utils';
import SuccessModal from './SuccessModal';
import '../styles/ScratchGame.scss';
import { useLearningPathStore } from '../store/useLearningPathStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { SCRATCH_COLORING } from '../data/animalColoring';
import { showSafeRewarded } from '../utils/admob.js';
import { Toast } from '@capacitor/toast';

interface ScratchGameProps {
  icons?: { component?: any; name?: string; sketch?: string; ref?: string }[];
}

export default function ScratchGame({ icons = SCRATCH_COLORING }: ScratchGameProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentActiveTask, completeTask, setActiveTask, setIsTaskReadyToComplete } =
    useLearningPathStore();
  const [isAdLoading, setIsAdLoading] = useState(false);

  const isTinySteps =
    !!currentActiveTask && (location.pathname + location.search).includes(currentActiveTask.path);

  const handleSkipWithAd = async () => {
    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      await showSafeRewarded();
      if (isTinySteps && currentActiveTask) {
        completeTask(currentActiveTask.id);
        setActiveTask(null);
        navigate('/tiny-steps');
      }
      await Toast.show({
        text: t('unlockModal.featureUnlocked'),
      });
    } catch (err) {
      console.log('Ad failed or skipped:', err);
      const errorMessage =
        err && (err as any).code === 'REWARDED_NOT_EARNED'
          ? t('unlockModal.watchFullAd')
          : t('unlockModal.adFailed', { code: (err as any)?.code || 'UNKNOWN' });

      await Toast.show({
        text: errorMessage,
      });
    } finally {
      setIsAdLoading(false);
    }
  };

  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageBoundsRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const animalMaskRef = useRef<Uint8Array | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { triggerSparkleBurst, SparkleRenderer } = useSparkleBurst();

  const [currentIconIndex, setCurrentIconIndex] = useState(() =>
    icons.length > 0 ? getRandomInt(0, icons.length - 1) : 0,
  );

  const [isDrawing, setIsDrawing] = useState(false);

  const loadNextImage = () => {
    playTapSound();
    setCurrentIconIndex((prev: number) => (prev + 1) % icons.length);
  };

  const loadPreviousImage = () => {
    playTapSound();
    setCurrentIconIndex((prev: number) => (prev - 1 + icons.length) % icons.length);
  };

  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;
    const fgCanvas = foregroundCanvasRef.current;
    if (!bgCanvas || !fgCanvas || !icons[currentIconIndex]) return;

    const loadImage = async () => {
      const currentItem = icons[currentIconIndex];
      if (!currentItem.sketch || !currentItem.ref) return;

      const [sketchImg, refImg] = await Promise.all([
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.src = currentItem.sketch!;
        }),
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.src = currentItem.ref!;
        }),
      ]);

      const bgCtx = bgCanvas.getContext('2d');
      const fgCtx = fgCanvas.getContext('2d');
      if (!bgCtx || !fgCtx) return;

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

      const maxWidth = bgCanvas.width;
      const maxHeight = bgCanvas.height;

      const scale = Math.min(maxWidth / sketchImg.width, maxHeight / sketchImg.height) * 0.9;
      const drawWidth = sketchImg.width * scale;
      const drawHeight = sketchImg.height * scale;
      const x = (bgCanvas.width - drawWidth) / 2;
      const y = (bgCanvas.height - drawHeight) / 2;

      imageBoundsRef.current = { x, y, w: drawWidth, h: drawHeight };

      bgCtx.drawImage(refImg, x, y, drawWidth, drawHeight);

      // List of bright colors for the base
      const brightColors = [
        '#FF6B6B',
        '#4ECDC4',
        '#FFE66D',
        '#FF8E72',
        '#6B5B95',
        '#FEB236',
        '#D64161',
        '#FF7B25',
        '#79C753',
        '#F333FF',
      ];
      const baseColor = brightColors[Math.floor(Math.random() * brightColors.length)];

      // Create Glitter Pattern
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 150;
      patternCanvas.height = 150;
      const pCtx = patternCanvas.getContext('2d');
      if (pCtx) {
        pCtx.fillStyle = baseColor;
        pCtx.fillRect(0, 0, 150, 150);

        // Add "glitter" specks
        for (let i = 0; i < 800; i++) {
          const px = Math.random() * 150;
          const py = Math.random() * 150;
          const size = Math.random() * 2;

          // Mix of white/gold/silver and some multi-colored sparks
          const glitterColors = [
            '#FFFFFF',
            '#FFD700',
            '#C0C0C0',
            '#E0E0E0',
            '#FFFFCC',
            '#FF69B4',
            '#00FFFF',
            '#ADFF2F',
          ];
          pCtx.fillStyle = glitterColors[Math.floor(Math.random() * glitterColors.length)];

          // Random opacity for shimmering effect
          pCtx.globalAlpha = 0.5 + Math.random() * 0.5;

          pCtx.beginPath();
          if (Math.random() > 0.85) {
            // Draw a small star-like glint
            const length = size * 2.5;
            pCtx.moveTo(px - length, py);
            pCtx.lineTo(px + length, py);
            pCtx.moveTo(px, py - length);
            pCtx.lineTo(px, py + length);
            pCtx.strokeStyle = pCtx.fillStyle;
            pCtx.lineWidth = 0.8;
            pCtx.stroke();
          } else {
            pCtx.arc(px, py, size, 0, Math.PI * 2);
            pCtx.fill();
          }
        }
        pCtx.globalAlpha = 1.0; // Reset alpha
      }

      const pattern = fgCtx.createPattern(patternCanvas, 'repeat');
      if (pattern) {
        fgCtx.fillStyle = pattern;
        fgCtx.fillRect(0, 0, fgCanvas.width, fgCanvas.height);
      } else {
        fgCtx.fillStyle = baseColor;
        fgCtx.fillRect(0, 0, fgCanvas.width, fgCanvas.height);
      }

      fgCtx.drawImage(sketchImg, x, y, drawWidth, drawHeight);

      // Create a mask of the actual opaque pixels of the animal
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawWidth;
      tempCanvas.height = drawHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(sketchImg, 0, 0, drawWidth, drawHeight);
        const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight);
        const pixels = imageData.data;
        const mask = new Uint8Array(drawWidth * drawHeight);
        for (let i = 0; i < pixels.length; i += 4) {
          // If the pixel is not transparent and not white (assuming white is background)
          // Adjust threshold if needed. 240 is used to ignore near-white backgrounds.
          const isOpaque = pixels[i + 3] > 10;
          const isNotWhite = pixels[i] < 250 || pixels[i + 1] < 250 || pixels[i + 2] < 250;
          if (isOpaque && isNotWhite) {
            mask[i / 4] = 1;
          }
        }
        animalMaskRef.current = mask;
      }
    };

    const setCanvasSize = () => {
      const parent = fgCanvas.parentElement;
      if (parent) {
        bgCanvas.width = parent.clientWidth;
        bgCanvas.height = parent.clientHeight;
        fgCanvas.width = parent.clientWidth;
        fgCanvas.height = parent.clientHeight;
        loadImage();
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [currentIconIndex]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = foregroundCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    handleScratch(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    handleScratch(e);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    checkIfFullyScratched();
  };

  const handleScratch = (e: React.PointerEvent) => {
    const coords = getCoordinates(e);
    const fgCanvas = foregroundCanvasRef.current;
    if (!fgCanvas) return;
    const ctx = fgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 30, 0, Math.PI * 2);
    ctx.fill();

    if (getRandomInt(0, 5) === 0) {
      triggerSparkleBurst(coords.x, coords.y);
    }
  };

  const checkIfFullyScratched = () => {
    const fgCanvas = foregroundCanvasRef.current;
    const bgCanvas = backgroundCanvasRef.current;
    if (!fgCanvas || !bgCanvas || !animalMaskRef.current) return;
    const ctx = fgCanvas.getContext('2d');
    if (!ctx) return;

    const { x, y, w, h } = imageBoundsRef.current;
    if (w === 0 || h === 0) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const pixels = imageData.data;
    const mask = animalMaskRef.current;
    let transparentPixels = 0;
    let totalAnimalPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const pixelIndex = i / 4;
      if (mask[pixelIndex]) {
        totalAnimalPixels++;
        if (pixels[i + 3] < 128) {
          transparentPixels++;
        }
      }
    }

    if (totalAnimalPixels === 0) return;

    const scratchPercentage = (transparentPixels / totalAnimalPixels) * 100;

    // Use 50% threshold of the ACTUAL animal area
    if (scratchPercentage > 99) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = bgCanvas.width;
      finalCanvas.height = bgCanvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        finalCtx.drawImage(bgCanvas, 0, 0);
      }

      if (isTinySteps) {
        setIsTaskReadyToComplete(true);
      } else {
        setShowSuccessModal(true);
        playTapSound();
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (currentActiveTask && location.pathname.includes(currentActiveTask.path)) {
      completeTask(currentActiveTask.id);
      setActiveTask(null);
      navigate('/tiny-steps');
    } else {
      loadNextImage();
    }
  };

  // Listen for the back button click from App.jsx via a custom event
  useEffect(() => {
    const handleTrigger = () => {
      if (isTinySteps) {
        setShowSuccessModal(true);
        playTapSound();
      }
    };
    window.addEventListener('trigger-task-completion', handleTrigger);
    return () => window.removeEventListener('trigger-task-completion', handleTrigger);
  }, [isTinySteps]);

  return (
    <>
      <div className="scratch-game-container">
        <div className="scratch-canvas-wrapper">
          <canvas ref={backgroundCanvasRef} className="scratch-canvas-bg" />
          <canvas
            ref={foregroundCanvasRef}
            className="scratch-canvas-fg"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none' }}
          />
          <SparkleRenderer />
        </div>
        <div className="navigation-controls scratch-navigation-controls">
          <button
            onClick={loadPreviousImage}
            className="nav-button nav-control-button nav-button--back"
          >
            <span className="text-white text-2xl rotate-180">➜</span>
          </button>
          <button
            onClick={loadNextImage}
            className="nav-button nav-control-button nav-button--next"
          >
            <span className="text-white text-2xl">➜</span>
          </button>
        </div>
        {isTinySteps && (
          <button
            onClick={handleSkipWithAd}
            className="btn-skip-level"
            disabled={isAdLoading}
            title={t('common.actions.skip')}
          >
            <span className="skip-icon">🎬</span> {isAdLoading ? '...' : t('common.actions.skip')}
          </button>
        )}

        {showSuccessModal && (
          <SuccessModal
            handleClose={handleCloseSuccessModal}
            message={t('scratchGame.success', 'Wow! You revealed the picture!')}
            starsWon={1}
          ></SuccessModal>
        )}
      </div>
    </>
  );
}
