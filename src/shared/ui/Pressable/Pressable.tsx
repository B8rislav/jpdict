'use client';

import { type FC, type PropsWithChildren } from 'react';
import { motion } from 'motion/react';

import { TAP_SCALE, springOrInstant, useReducedMotion } from '@/shared/motion';

type Props = {
  className?: string;
};

/**
 * Wraps a button (or any pressable) in a uniform tap depress. The scale comes
 * from `@/shared/motion` so every primary action presses identically; under
 * reduced motion it does nothing.
 */
export const Pressable: FC<PropsWithChildren<Props>> = ({ children, className }) => {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-flex' }}
      whileTap={reduced ? undefined : { scale: TAP_SCALE }}
      transition={springOrInstant(reduced)}
    >
      {children}
    </motion.span>
  );
};
