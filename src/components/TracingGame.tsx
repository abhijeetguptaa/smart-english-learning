import { useSparkleBurst } from '@/hooks/useSparkleBurst';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { playTapSound, speakText } from '../utils/soundUtils';
import SuccessModal from './SuccessModal';
import '../styles/PaintBrush.scss';
import { COLORING_CONFIG } from '../constants/coloringConstants';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = Array.from({ length: 100 }, (_, i) => i.toString());

interface TracingGameProps {
  mode?: 'alphabets' | 'numbers';
}

export default function TracingGame({ mode = 'alphabets' }: TracingGameProps) {
  const { t } = useTranslation();
  const DATA = mode === 'alphabets' ? ALPHABET : NUMBERS;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outlineCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const regionCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingColor, setCurrentDrawingColor] = useState('#FF3B30');
  const glitterPatternRef = useRef<CanvasPattern | null>(null);
  const brushSize = 70;
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0, visible: false });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { triggerSparkleBurst, SparkleRenderer } = useSparkleBurst();
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastSparkleTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  useEffect(() => {
    // ... rest of random color and glitter pattern logic unchanged
    // ...
    const brightColors = [
      '#95f800',
      '#FFCC00',
      '#06b6fb',
      '#FF00FF',
      '#f91307',
      '#007AFF',
      '#ff012f',
      '#FF9500',
      '#0bf847',
      '#a60af4',
      '#FFD700',
      '#08f3e7',
      '#ff2994',
      '#0aedd6',
      '#f75a21',
    ];
    const randomColor = brightColors[Math.floor(Math.random() * brightColors.length)];
    setCurrentDrawingColor(randomColor);

    // Create Glitter Pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 150;
    patternCanvas.height = 150;
    const pCtx = patternCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = randomColor;
      pCtx.fillRect(0, 0, 150, 150);

      for (let i = 0; i < 160; i++) {
        const px = Math.random() * 150;
        const py = Math.random() * 150;
        const size = Math.random() * 2;
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
        pCtx.globalAlpha = 0.5 + Math.random() * 0.5;
        pCtx.beginPath();
        if (Math.random() > 0.85) {
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
      pCtx.globalAlpha = 1.0;

      const offscreen = offscreenCanvasRef.current;
      if (offscreen) {
        const ctx = offscreen.getContext('2d');
        if (ctx) glitterPatternRef.current = ctx.createPattern(patternCanvas, 'repeat');
      } else {
        const tempCtx = document.createElement('canvas').getContext('2d');
        if (tempCtx) glitterPatternRef.current = tempCtx.createPattern(patternCanvas, 'repeat');
      }
    }
  }, [currentIndex]);

  const loadNext = () => {
    playTapSound();
    setCurrentIndex((prev) => (prev + 1) % DATA.length);
  };
  const loadPrev = () => {
    playTapSound();
    setCurrentIndex((prev) => (prev - 1 + DATA.length) % DATA.length);
  };

  useEffect(() => {
    const drawingCanvas = canvasRef.current;
    const outlineCanvas = outlineCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const regionCanvas = regionCanvasRef.current;
    if (!drawingCanvas || !outlineCanvas || !maskCanvas || !regionCanvas) return;

    const loadItem = async () => {
      const token = ++loadTokenRef.current;
      const item = DATA[currentIndex];
      const translated = t(`tracing.${item}`);
      speakText(translated === `tracing.${item}` ? item : translated);
      const drawCtx = drawingCanvas.getContext('2d');
      const outlineCtx = outlineCanvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      const regionCtx = regionCanvas.getContext('2d');
      if (!drawCtx || !outlineCtx || !maskCtx || !regionCtx) return;

      drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      regionCtx.clearRect(0, 0, regionCanvas.width, regionCanvas.height);

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 900;
      sourceCanvas.height = 900;
      const tCtx = sourceCanvas.getContext('2d');
      if (tCtx) {
        tCtx.save();
        tCtx.fillStyle = '#000000';
        tCtx.strokeStyle = '#000000';
        tCtx.lineCap = 'round';
        tCtx.lineJoin = 'round';

        const fontSize = 576;
        tCtx.font = `${fontSize}px sans-serif`;
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(item, sourceCanvas.width / 2, sourceCanvas.height / 2 + 20);

        const contentData = tCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
        let minX = sourceCanvas.width;
        let minY = sourceCanvas.height;
        let maxX = 0;
        let maxY = 0;
        let hasPixels = false;
        for (let yIdx = 0; yIdx < sourceCanvas.height; yIdx++) {
          for (let xIdx = 0; xIdx < sourceCanvas.width; xIdx++) {
            if (contentData[(yIdx * sourceCanvas.width + xIdx) * 4 + 3] > 20) {
              if (xIdx < minX) minX = xIdx;
              if (xIdx > maxX) maxX = xIdx;
              if (yIdx < minY) minY = yIdx;
              if (yIdx > maxY) maxY = yIdx;
              hasPixels = true;
            }
          }
        }

        if (!hasPixels) {
          tCtx.restore();
          return;
        }

        const cropPadding = Math.max(18, Math.round(sourceCanvas.width * 0.035));
        minX = Math.max(0, minX - cropPadding);
        minY = Math.max(0, minY - cropPadding);
        maxX = Math.min(sourceCanvas.width - 1, maxX + cropPadding);
        maxY = Math.min(sourceCanvas.height - 1, maxY + cropPadding);

        const contentWidth = maxX - minX + 1;
        const contentHeight = maxY - minY + 1;
        const contentCanvas = document.createElement('canvas');
        contentCanvas.width = contentWidth;
        contentCanvas.height = contentHeight;
        const cCtx = contentCanvas.getContext('2d');
        if (!cCtx) {
          tCtx.restore();
          return;
        }

        cCtx.putImageData(tCtx.getImageData(minX, minY, contentWidth, contentHeight), 0, 0);
        tCtx.restore();

        const padding = 4;
        const scale =
          Math.min(
            (drawingCanvas.width - padding * 2) / contentWidth,
            (drawingCanvas.height - padding * 2) / contentHeight,
          ) * 0.8;
        const drawWidth = Math.round(contentWidth * scale);
        const drawHeight = Math.round(contentHeight * scale);
        const x = (drawingCanvas.width - drawWidth) / 2;
        const y = (drawingCanvas.height - drawHeight) / 2;

        const pixelData = cCtx.getImageData(0, 0, contentWidth, contentHeight).data;
        const maskData = new ImageData(contentWidth, contentHeight);
        const outlineData = new ImageData(contentWidth, contentHeight);
        const rowBatchSize = 12;

        // Find start position: first pixel from top
        let foundStart = false;
        let startX = 0;
        let startY = 0;

        for (let yIdx = 0; yIdx < contentHeight; yIdx++) {
          for (let xIdx = 0; xIdx < contentWidth; xIdx++) {
            const i = (yIdx * contentWidth + xIdx) * 4;
            if (pixelData[i + 3] > 50) {
              if (!foundStart) {
                startX = xIdx;
                startY = yIdx;
                foundStart = true;
              }
              maskData.data[i] = 180;
              maskData.data[i + 1] = 180;
              maskData.data[i + 2] = 180;
              maskData.data[i + 3] = 70;

              let isEdge = false;
              for (let dy = -1; dy <= 1 && !isEdge; dy++) {
                for (let dx = -1; dx <= 1 && !isEdge; dx++) {
                  const nx = xIdx + dx;
                  const ny = yIdx + dy;
                  if (
                    nx < 0 ||
                    nx >= contentWidth ||
                    ny < 0 ||
                    ny >= contentHeight ||
                    pixelData[(ny * contentWidth + nx) * 4 + 3] <= 50
                  ) {
                    isEdge = true;
                  }
                }
              }

              if (isEdge) {
                outlineData.data[i] = 150;
                outlineData.data[i + 1] = 150;
                outlineData.data[i + 2] = 150;
                outlineData.data[i + 3] = 255;
              }
            }
          }

          if (yIdx % rowBatchSize === rowBatchSize - 1) {
            // Yield so canvas setup does not monopolize the main thread.
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            if (loadTokenRef.current !== token) return;
          }
        }

        if (loadTokenRef.current !== token) return;

        const mCanvas = document.createElement('canvas');
        mCanvas.width = contentWidth;
        mCanvas.height = contentHeight;
        mCanvas.getContext('2d')?.putImageData(maskData, 0, 0);

        const oCanvas = document.createElement('canvas');
        oCanvas.width = contentWidth;
        oCanvas.height = contentHeight;
        oCanvas.getContext('2d')?.putImageData(outlineData, 0, 0);

        outlineCtx.drawImage(mCanvas, x, y, drawWidth, drawHeight);
        outlineCtx.drawImage(oCanvas, x, y, drawWidth, drawHeight);
        maskCtx.drawImage(mCanvas, x, y, drawWidth, drawHeight);
      }
    };

    const setCanvasSize = () => {
      const parent = drawingCanvas.parentElement;
      if (parent) {
        drawingCanvas.width = parent.clientWidth;
        drawingCanvas.height = parent.clientHeight;
        outlineCanvas.width = parent.clientWidth;
        outlineCanvas.height = parent.clientHeight;
        maskCanvas.width = parent.clientWidth;
        maskCanvas.height = parent.clientHeight;
        regionCanvas.width = parent.clientWidth;
        regionCanvas.height = parent.clientHeight;
        if (!offscreenCanvasRef.current)
          offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = parent.clientWidth;
        offscreenCanvasRef.current.height = parent.clientHeight;
        void loadItem();
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    return () => {
      loadTokenRef.current += 1;
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [currentIndex, mode]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = outlineCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setLastPos(coords);
    setPointerPos((prev) => ({ ...prev, x: coords.x, y: coords.y }));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!isDrawing) return;

    setPointerPos({ x: coords.x, y: coords.y, visible: true });

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current,
        maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas || !offscreenCanvasRef.current) return;

      const ctx = canvas.getContext('2d'),
        offCtx = offscreenCanvasRef.current.getContext('2d');
      if (!ctx || !offCtx) return;

      offCtx.clearRect(0, 0, canvas.width, canvas.height);
      offCtx.lineCap = 'round';
      offCtx.lineJoin = 'round';
      offCtx.lineWidth = brushSize;
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.strokeStyle = (glitterPatternRef.current || currentDrawingColor) as any;
      offCtx.beginPath();
      offCtx.moveTo(lastPos.x, lastPos.y);
      offCtx.lineTo(coords.x, coords.y);
      offCtx.stroke();
      offCtx.globalCompositeOperation = 'destination-in';
      offCtx.drawImage(maskCanvas, 0, 0);
      ctx.drawImage(offscreenCanvasRef.current, 0, 0);

      const rect = outlineCanvasRef.current?.getBoundingClientRect();
      const now = Date.now();
      if (rect && now - lastSparkleTimeRef.current > 60) {
        triggerSparkleBurst(
          coords.x * (rect.width / outlineCanvasRef.current!.width),
          coords.y * (rect.height / outlineCanvasRef.current!.height),
          { count: 1, range: 40, color: currentDrawingColor, silent: true },
        );
        lastSparkleTimeRef.current = now;
      }
      setLastPos(coords);
    });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      const canvas = outlineCanvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        triggerSparkleBurst(
          lastPos.x * (rect.width / canvas.width),
          lastPos.y * (rect.height / canvas.height),
          {
            count: COLORING_CONFIG.SPARKLE_COUNT,
            range: COLORING_CONFIG.SPARKLE_RANGE,
            color: currentDrawingColor,
          },
        );
      }
    }
    setIsDrawing(false);
    setPointerPos((prev) => ({ ...prev, visible: false }));
    requestAnimationFrame(checkIfFullyColored);
  };

  const checkIfFullyColored = () => {
    const drawCtx = canvasRef.current?.getContext('2d'),
      maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!drawCtx || !maskCtx) return;
    const { width, height } = canvasRef.current!;
    const drawData = drawCtx.getImageData(0, 0, width, height).data,
      maskData = maskCtx.getImageData(0, 0, width, height).data;
    let total = 0,
      colored = 0;
    for (let i = 3; i < maskData.length; i += 4) {
      if (maskData[i] > 0) {
        total++;
        if (drawData[i] > 0) colored++;
      }
    }
    if (total > 0 && (colored / total) * 100 > 90) setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    loadNext();
  };

  return (
    <div className="paintbrush-container paintbrush-container--tracing">
      <div className="paintbrush-canvas-wrapper">
        <canvas ref={canvasRef} className="paintbrush-canvas" />
        <canvas ref={maskCanvasRef} className="paintbrush-canvas paintbrush-canvas--hidden" />
        <canvas ref={regionCanvasRef} className="paintbrush-canvas paintbrush-canvas--hidden" />
        <canvas
          ref={outlineCanvasRef}
          className="paintbrush-canvas"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
        />
        {pointerPos.visible && (
          <div
            className="brush-pointer brush-pointer--blob"
            style={{
              left: pointerPos.x,
              top: pointerPos.y,
              backgroundColor: currentDrawingColor,
              width: brushSize,
              height: brushSize,
            }}
          >
            <div className="blob-eye left" />
            <div className="blob-eye right" />
            <div className="blob-mouth" />
          </div>
        )}
        <SparkleRenderer />
      </div>

      <div className="control-group brush-controls">
        <div className="brush-types-container">
          <button className="nav-button nav-button--back" onClick={loadPrev}>
            <span className="text-white text-2xl rotate-180">➜</span>
          </button>
          <button className="nav-button nav-button--next" onClick={loadNext}>
            <span className="text-white text-2xl">➜</span>
          </button>
        </div>
      </div>
      {showSuccessModal && <SuccessModal handleClose={handleCloseSuccessModal} starsWon={1} />}
    </div>
  );
}
