import { type CSSProperties, type FC, type PropsWithChildren, useMemo } from 'react';

import styles from './CardList.module.css';
import { Skeleton } from '@gravity-ui/uikit';

type CardListProps = {
  loading: boolean;
  listHeight?: number;
  listWidth?: number;
  style?: CSSProperties;
};

export const CardList: FC<PropsWithChildren<CardListProps>> = (props) => {
  const { loading, listHeight, listWidth, style } = props;
  const skeletonParts = useMemo<number[]>(() => {
    const count = listHeight ? Math.max(1, Math.floor(listHeight / 250)) : 3;
    return Array.from({ length: count }, (_, i) => i);
  }, [listHeight]);

  return (
    <div className={styles.container} style={{ width: listWidth, ...style }}>
      <ul className={styles.list}>
        {loading
          ? skeletonParts.map((i) => (
              <Skeleton key={i} style={{ height: 250 }} className={styles.skeletonCard} />
            ))
          : props.children}
      </ul>
    </div>
  );
};
