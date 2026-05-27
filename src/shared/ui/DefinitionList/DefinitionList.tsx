import { FC } from 'react';
import { Text } from '@gravity-ui/uikit';
import styles from './DefinitionList.module.css';

type Props = { items?: string[] };

export const DefinitionList: FC<Props> = ({ items }) => {
  if (!items?.length) return null;
  return (
    <ol className={styles.list}>
      {items.map((item, i) => (
        <li key={i}>
          <Text variant="body-2">{item}</Text>
        </li>
      ))}
    </ol>
  );
};
