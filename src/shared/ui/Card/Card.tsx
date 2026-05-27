import { type FC, type PropsWithChildren } from 'react';
import { motion } from 'motion/react';

import styles from './Card.module.css';

type CardProps = {
  className?: string;
};

export const Card: FC<PropsWithChildren<CardProps>> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${styles.card} ${className ?? ''}`}>{children}</div>
    </motion.div>
  );
};
