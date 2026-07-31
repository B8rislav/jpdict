'use client';

import { type FC } from 'react';

import { useT } from '@/shared/i18n';
import styles from './EmptyState.module.css';

export type ExampleQuery = {
  /** The query text, shown on the chip and run verbatim when clicked. */
  query: string;
  /** Localized description of what the example demonstrates. */
  label: string;
};

export type EmptyStateProps = {
  examples: ExampleQuery[];
  onRun: (query: string) => void;
};

/**
 * What the page shows before the first search: a prompt and a few real queries.
 *
 * The examples are runnable rather than decorative — for a tool whose input is a
 * language the visitor is still learning, "here is something you can type" is more use
 * than an empty canvas.
 */
export const EmptyState: FC<EmptyStateProps> = ({ examples, onRun }) => {
  const t = useT();

  return (
    <div className={styles.empty}>
      <p className={styles.title}>{t('ui', 'empty_title')}</p>
      <ul className={styles.list}>
        {examples.map((example) => (
          <li key={example.query}>
            <button type="button" className={styles.chip} onClick={() => onRun(example.query)}>
              <span className={styles.query}>{example.query}</span>
              <span className={styles.label}>{example.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
