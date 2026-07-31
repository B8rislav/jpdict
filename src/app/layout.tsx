import type { Metadata } from 'next';

import './styles/globals.css';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import 'designoslav/tokens.css';
import { AppNav } from '@/features/AppNav';
import { fontVariables } from './fonts';
import { Providers } from './providers';
import { JsonLd } from './ui/JsonLd';
import { readProfile } from '@/shared/api/serverProfile';
import { tServer } from '@/shared/i18n/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const { uiLocale: locale } = await readProfile();
  const title = tServer(locale, 'ui', 'meta_site_title');
  const description = tServer(locale, 'ui', 'meta_description');

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s · JapChin Dict',
    },
    description,
    // No `languages` map: both locales are served from `/`, so declaring them
    // as alternates claimed a per-locale URL that doesn't exist. Reinstate it
    // if locale ever moves into the path.
    alternates: {
      canonical: '/',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await readProfile();

  return (
    // `lang` and `data-lang` are set here, server-side. They used to be applied
    // by an effect after hydration, so the first paint always claimed the
    // wrong language — and `<html>` sat *inside* the client Providers tree.
    <html
      lang={profile.uiLocale}
      data-lang={profile.selectedLanguage ?? undefined}
      className={fontVariables}
    >
      <body>
        <Providers initialProfile={profile}>
          <JsonLd data={websiteJsonLd} />
          {/* The bar belongs to the shell, not to the home page — mounting it here is
              what finally gives /dictionary, /study and /settings a header. */}
          <AppNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
