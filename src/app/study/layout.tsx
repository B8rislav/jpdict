import type { Metadata } from 'next';
import { readProfile } from '@/shared/api/serverProfile';
import { tServer } from '@/shared/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { uiLocale: locale } = await readProfile();
  return {
    title: tServer(locale, 'ui', 'meta_title_study'),
    robots: { index: false },
  };
}

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
