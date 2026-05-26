import { FC } from 'react';
import { Text } from '@gravity-ui/uikit';
import styles from './SearchHistoryDropdown.module.css';
import type { HistoryItem } from './model';

type Props = {
  entries: HistoryItem[];
  onSelect: (query: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

export const SearchHistoryDropdown: FC<Props> = ({ entries, onSelect, onDelete, onClear }) => {
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
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
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
          </li>
        ))}
      </ul>
    </div>
  );
};
