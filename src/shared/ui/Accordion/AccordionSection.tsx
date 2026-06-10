import { type FC, type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Text } from '@gravity-ui/uikit';

import { DURATION, EASE, useReducedMotion } from '@/shared/motion';
import styles from './AccordionSection.module.css';

type Props = {
  title: string;
  defaultOpen?: boolean;
  onFirstExpand?: () => void;
  children: ReactNode;
};

export const AccordionSection: FC<Props> = ({
  title,
  defaultOpen = false,
  onFirstExpand,
  children,
}) => {
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasExpanded, setHasExpanded] = useState(defaultOpen);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !hasExpanded) {
      setHasExpanded(true);
      onFirstExpand?.();
    }
  };

  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={handleToggle}>
        <Text variant="subheader-2">{title}</Text>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.sectionContent}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
