import { type FC, type PropsWithChildren, useMemo } from 'react';

import styles from './CardList.module.css';
import { Skeleton } from '@gravity-ui/uikit';

type CardListProps = {
  loading: boolean;
  listHeight?: number;
  listWidth?: number;
};

export const CardList: FC<PropsWithChildren<CardListProps>> = (props) => {
  const { loading, listHeight, listWidth } = props;
  const skeletonParts = useMemo<number[]>(() => {
    const count = listHeight ? Math.max(1, Math.floor(listHeight / 250)) : 3;
    return Array.from({ length: count }, (_, i) => i);
  }, [listHeight]);

  return (
    <ul style={{ width: listWidth }} className={styles.list}>
      {loading
        ? skeletonParts.map((i) => (
            <Skeleton key={i} style={{ height: 250 }} className={styles.skeletonCard} />
          ))
        : props.children}
    </ul>
  );
};
