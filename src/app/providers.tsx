'use client';

import { type FC, type PropsWithChildren } from 'react';
import { ThemeProvider } from './ui/ThemeProvider';

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
