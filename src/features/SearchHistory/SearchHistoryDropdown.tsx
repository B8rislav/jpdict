import { FC } from 'react';
import { Text } from '@gravity-ui/uikit';
import styles from './SearchHistoryDropdown.module.css';

type Props = {
  entries: string[];
  onSelect: (entry: string) => void;
  onDelete: (entry: string) => void;
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
          <li key={entry} className={styles.item}>
            <button className={styles.entryBtn} onClick={() => onSelect(entry)}>
              {entry}
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(entry)}
              aria-label={`Удалить ${entry}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
