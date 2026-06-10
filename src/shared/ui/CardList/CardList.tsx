import { type CSSProperties, type FC, type PropsWithChildren, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Skeleton } from '@gravity-ui/uikit';

import { DURATION, EASE, staggerContainer, useReducedMotion } from '@/shared/motion';
import styles from './CardList.module.css';

type CardListProps = {
  loading: boolean;
  listHeight?: number;
  listWidth?: number;
  style?: CSSProperties;
};

export const CardList: FC<PropsWithChildren<CardListProps>> = (props) => {
  const { loading, listHeight, listWidth, style } = props;
  const reduced = useReducedMotion();
  const skeletonParts = useMemo<number[]>(() => {
    const count = listHeight ? Math.max(1, Math.floor(listHeight / 250)) : 3;
    return Array.from({ length: count }, (_, i) => i);
  }, [listHeight]);

  const skeletons = skeletonParts.map((i) => (
    <Skeleton key={i} style={{ height: 250 }} className={styles.skeletonCard} />
  ));

  // Reduced motion: skip every entrance/exit/stagger; the children (motion.li)
  // render at rest because no parent variant drives them.
  if (reduced) {
    return (
      <div className={styles.container} style={{ width: listWidth, ...style }}>
        <ul className={styles.list}>{loading ? skeletons : props.children}</ul>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ width: listWidth, ...style }}>
      {/* Skeleton ↔ content crossfade: distinct keys so one fades out as the
          other fades in. */}
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.ul
            key="skeletons"
            className={styles.list}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE }}
          >
            {skeletons}
          </motion.ul>
        ) : (
          <motion.ul
            key="content"
            className={styles.list}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* popLayout so an outgoing result set animates out from the flow
                while the next set animates in. Needs stable keys on children. */}
            <AnimatePresence mode="popLayout">{props.children}</AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
