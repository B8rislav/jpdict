/**
 * The single source of truth for motion in the app.
 *
 * Everything animated imports its durations, eases, and variants from here so
 * the "alive" layer stays consistent instead of being a pile of ad-hoc
 * `whileInView`s. Animate `transform` + `opacity` only (and `height` via
 * motion's layout where a task explicitly calls for it) — never `top`/`left`/
 * `width` in a hot path.
 *
 * Reduced motion: components read `useReducedMotion()` (re-exported below) and
 * branch their props through `springOrInstant`. The CSS-side animations
 * (spinner, chevron, accordion transitions) are neutered by the global
 * `prefers-reduced-motion` guard in `app/styles/globals.css`.
 */
import { type Transition, type Variants, useReducedMotion } from 'motion/react';

/** Shared durations, in seconds. */
export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

/** Shared "settle" ease — an easeOutBack-ish cubic bezier. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** The uniform whileTap scale for pressable primary actions. */
export const TAP_SCALE = 0.97;

/** A single card/element fading and lifting into place. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

/**
 * Parent container that cascades its children in. Pair with `cardEnter` (or any
 * variant exposing `hidden`/`visible`) on each child so the stagger propagates.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

/** Per-card entrance, driven by a `staggerContainer` parent. */
export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: DURATION.fast, ease: EASE },
  },
};

/** Two-face Y-axis flip for the review card reveal. */
export const flip: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

/**
 * Spring tuned for the "settle" feel, or an instant (zero-duration) transition
 * when the user prefers reduced motion. One call per component to neuter
 * itself: `transition={springOrInstant(reduced)}`.
 */
export const springOrInstant = (reduced: boolean | null): Transition =>
  reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 };

export { useReducedMotion };
export type { Transition, Variants };
