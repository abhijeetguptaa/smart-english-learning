import React, { useState, useEffect, memo } from 'react';
import { playSparklePop } from '../utils/soundUtils';

export interface Sparkle {
  id: number;
  x: number;
  y: number;
  dx: string;
  dy: string;
  color: string;
  char: string;
}

export interface SparkleBurstOptions {
  count: number;
  range: number;
  color?: string;
  silent?: boolean;
}

export interface SparkleDetail {
  x: number;
  y: number;
  options: SparkleBurstOptions;
}

export const SPARKLE_EVENT = 'skl_trigger_sparkle';
const SPARKLE_CHARS = ['✦', '✭', '✨', '⚡', '🎉'];
let sparkleIdCounter = 0;

export const SparkleRenderer = memo(() => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<SparkleDetail>;
      if (!customEvent.detail?.options) return;
      const { x, y, options } = customEvent.detail;
      if (!options.silent) {
        playSparklePop();
      }
      const newSparkles = Array.from({ length: options.count }).map(() => ({
        id: ++sparkleIdCounter,
        x,
        y,
        dx: `${(Math.random() - 0.5) * options.range}px`,
        dy: `${(Math.random() - 0.5) * options.range}px`,
        color: options.color || `hsl(${Math.random() * 360}, 100%, 70%)`,
        char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
      }));

      setSparkles((prev) => [...prev, ...newSparkles]);
    };

    window.addEventListener(SPARKLE_EVENT, handleTrigger);
    return () => {
      window.removeEventListener(SPARKLE_EVENT, handleTrigger);
    };
  }, []);

  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          onAnimationEnd={() => {
            setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== s.id));
          }}
          style={
            {
              left: s.x,
              top: s.y,
              '--dx': s.dx,
              '--dy': s.dy,
              '--sparkle-color': s.color,
            } as React.CSSProperties
          }
        >
          {s.char}
        </div>
      ))}
    </>
  );
});

SparkleRenderer.displayName = 'SparkleRenderer';
