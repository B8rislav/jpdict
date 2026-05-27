import { type FC, type PropsWithChildren, useMemo } from 'react';

import styles from './CardList.module.css';
import { Skeleton } from '@gravity-ui/uikit';

type CardListProps = {
  loading: boolean;
  listHeight: number;
  listWidth: number;
};

export const CardList: FC<PropsWithChildren<CardListProps>> = (props) => {
  const { loading, listHeight, listWidth } = props;
  const skeletonParts = useMemo<number[]>(() => {
    const parts = [];
    for (let i = 0; i < listHeight / 250; i++) {
      parts.push(i);
    }
    return parts;
  }, [listHeight]);

  return (
    <ul style={{ width: listWidth, height: listHeight }} className={styles.list}>
      {loading
        ? skeletonParts.map((i) => (
            <Skeleton key={i} style={{ height: listHeight }} className={styles.skeletonCard} />
          ))
        : props.children}
    </ul>
  );
};
