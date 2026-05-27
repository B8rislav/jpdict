import { type FC } from 'react';
import { Label } from '@gravity-ui/uikit';
import styles from './MarkerList.module.css';

type Props = { markers?: string[] };

export const MarkerList: FC<Props> = ({ markers }) => {
  if (!markers?.length) return null;
  return (
    <ul className={styles.list}>
      {markers.map((marker) => (
        <li key={marker}>
          <Label>{marker}</Label>
        </li>
      ))}
    </ul>
  );
};
