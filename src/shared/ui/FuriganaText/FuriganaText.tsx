import { type FC } from 'react';

type FuriganaTextProps = {
  surface: string;
  reading?: string;
  show?: boolean;
};

export const FuriganaText: FC<FuriganaTextProps> = ({ surface, reading, show = true }) => {
  if (!show || !reading || reading === surface) {
    return <span>{surface}</span>;
  }
  return (
    <ruby>
      {surface}
      <rt>{reading}</rt>
    </ruby>
  );
};
