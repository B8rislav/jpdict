import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';

import './styles/globals.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import { Providers } from './providers';
import { HtmlLangSync } from './HtmlLangSync';
import { JsonLd } from './ui/JsonLd';
import { detectLocale, tServer } from '@/shared/i18n/server';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const locale = detectLocale(h.get('accept-language'));
  const title = tServer(locale, 'ui', 'meta_site_title');
  const description = tServer(locale, 'ui', 'meta_description');

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s · JapChin Dict',
    },
    description,
    alternates: {
      canonical: '/',
      languages: { ru: '/', en: '/', 'x-default': '/' },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'ru_RU',
      alternateLocale: locale === 'en' ? 'ru_RU' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'JapChin Dict',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

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
          <JsonLd data={websiteJsonLd} />
          {children}
        </body>
      </html>
    </Providers>
  );
}
