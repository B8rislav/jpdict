import { type FC, type PropsWithChildren } from 'react';

import styles from './Card.module.css';

type CardProps = {
  className?: string;
};

/**
 * Presentational card surface. Entrance/exit motion is owned by the list layer
 * (see CardList + the `cardEnter` variant in `@/shared/motion`) so the keyed
 * list item is the element `AnimatePresence` tracks; `ReviewCard` brings its own
 * entrance. Card itself stays a plain surface.
 */
export const Card: FC<PropsWithChildren<CardProps>> = ({ children, className }) => {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>;
};
