'use client';

import { type FC, useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';

import { DURATION, EASE, useReducedMotion } from '@/shared/motion';

type Props = {
  value: number;
  className?: string;
};

/**
 * Eases a number from its current display value up to `value` (from 0 on mount)
 * over ~`DURATION.slow`. Re-runs whenever `value` changes. Under reduced motion
 * it snaps straight to the target.
 */
export const CountUp: FC<Props> = ({ value, className }) => {
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: DURATION.slow, ease: EASE });
    return () => controls.stop();
  }, [value, reduced, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
};
