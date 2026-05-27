import { type FC, type ReactNode, useState } from 'react';
import { Text } from '@gravity-ui/uikit';
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
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
};
