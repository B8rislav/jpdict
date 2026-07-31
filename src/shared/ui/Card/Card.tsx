import { type FC, type PropsWithChildren } from 'react';

import styles from './Card.module.css';

type CardProps = {
  className?: string;
};

/**
 * Presentational card surface, with no motion of its own — `ReviewCard` brings its own
 * entrance.
 *
 * Only `ReviewCard` still uses this. The home page's cards are Designoslav components
 * now, and their entrance is CSS inside `EntryList`; the `CardList` wrapper that used to
 * own the stagger is gone.
 */
export const Card: FC<PropsWithChildren<CardProps>> = ({ children, className }) => {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>;
};
