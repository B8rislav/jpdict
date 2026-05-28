import type { Metadata } from 'next';
import { Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';

import './styles/globals.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import { Providers } from './providers';
import { HtmlLangSync } from './HtmlLangSync';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
  display: 'swap',
});

// TODO(D2): localize via generateMetadata reading Accept-Language header or a cookie
/* eslint-disable no-restricted-syntax */
export const metadata: Metadata = {
  title: 'JapChin Dict — Изучение японского и китайского',
  description:
    'Платформа для изучения иероглифического письма с морфологическим анализом и AI-объяснениями',
};
/* eslint-enable no-restricted-syntax */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html className={`${notoSansJP.variable} ${notoSansSC.variable}`}>
        <body>
          <HtmlLangSync />
          {children}
        </body>
      </html>
    </Providers>
  );
}
