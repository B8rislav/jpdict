import { type FC } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Text } from '@gravity-ui/uikit';
import { DURATION, EASE, useReducedMotion } from '@/shared/motion';
import styles from './SearchHistoryDropdown.module.css';
import type { HistoryItem } from './model';

type Props = {
  entries: HistoryItem[];
  onSelect: (query: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

export const SearchHistoryDropdown: FC<Props> = ({ entries, onSelect, onDelete, onClear }) => {
  const reduced = useReducedMotion();
  if (!entries.length) return null;

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <Text variant="caption-1">История поиска</Text>
        <button className={styles.clearBtn} onClick={onClear}>
          Очистить всё
        </button>
      </div>
      <ul className={styles.list}>
        {/* popLayout so a deleted row collapses (height/opacity) and the rows
            below slide up to fill the gap, instead of the row popping out. */}
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map((entry) => (
            <motion.li
              key={entry.id}
              className={styles.item}
              layout={!reduced}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE }}
              style={{ overflow: 'hidden' }}
            >
              <button className={styles.entryBtn} onClick={() => onSelect(entry.query)}>
                {entry.query}
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(entry.id)}
                aria-label={`Удалить ${entry.query}`}
              >
                ×
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};
