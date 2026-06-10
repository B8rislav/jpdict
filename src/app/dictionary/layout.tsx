import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { detectLocale, tServer } from '@/shared/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const locale = detectLocale(h.get('accept-language'));
  return {
    title: tServer(locale, 'ui', 'meta_title_dict'),
    robots: { index: false },
  };
}

export default function DictionaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
