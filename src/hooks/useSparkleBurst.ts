import { useCallback } from 'react';
import {
  SparkleRenderer,
  SPARKLE_EVENT,
  type SparkleBurstOptions,
  type Sparkle,
  type SparkleDetail,
} from '../components/SparkleRenderer';

export const triggerSparkleBurst = (
  x: number,
  y: number,
  options: SparkleBurstOptions = { count: 12, range: 150 },
): void => {
  const event = new CustomEvent<SparkleDetail>(SPARKLE_EVENT, { detail: { x, y, options } });
  window.dispatchEvent(event);
};

export type { SparkleBurstOptions, Sparkle, SparkleDetail };
export { SparkleRenderer };

export function useSparkleBurst() {
  const handleTrigger = useCallback(
    (x: number, y: number, options?: SparkleBurstOptions) => {
      triggerSparkleBurst(x, y, options);
    },
    [],
  );

  return { triggerSparkleBurst: handleTrigger, SparkleRenderer };
}
