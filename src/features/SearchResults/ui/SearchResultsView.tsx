'use client';

import { Skeleton } from 'designoslav';
import { type FC, type ReactNode } from 'react';

import styles from './SearchResultsView.module.css';

export type SearchResultsViewProps = {
  /** Breakdown or match list. Omit for the single-column detail layout. */
  results?: ReactNode;
  /** The detail card — a word or a kanji. */
  detail?: ReactNode;
  /**
   * `split` — results | detail, the sentence and word layouts.
   * `single` — one centered column, for a kanji lookup's lone card.
   */
  layout?: 'split' | 'single';
  /**
   * A query is in flight and there is nothing on screen yet. Only pass this when
   * `results` is genuinely empty — see the note on the component.
   */
  loading?: boolean;
  /** The detail column alone is pending. Never replaces `results`. */
  detailLoading?: boolean;
};

const DetailSkeleton: FC = () => (
  <div aria-busy="true">
    <Skeleton shape="block" height={320} />
  </div>
);

const LoadingColumns: FC = () => (
  <div className={styles.grid} aria-busy="true">
    <div className={styles.column}>
      <Skeleton shape="block" height={64} />
      <Skeleton shape="block" height={84} />
      <Skeleton shape="block" height={84} />
      <Skeleton shape="block" height={84} />
    </div>
    <div className={styles.column}>
      <Skeleton shape="block" height={320} />
    </div>
  </div>
);

/**
 * The results area: a breakdown column beside a detail column.
 *
 * **`loading` must never be true while `results` is on screen.** The breakdown owns the
 * selected token and fetches its word on mount; swapping it for a skeleton unmounts it,
 * and the remount re-fires that fetch, which turns `loading` back on — an unbounded
 * request loop that only stops when the backend starts answering 429. That is why a
 * pending *word* is `detailLoading`, which leaves the left column mounted, and only a
 * pending *query* — with nothing rendered yet — is `loading`.
 *
 * Neither column is sticky. A `position: sticky` detail card taller than the viewport
 * pins its top and puts its own footer out of reach, and this card carries three
 * collapsible sections plus a kanji list — so it routinely is taller.
 */
export const SearchResultsView: FC<SearchResultsViewProps> = ({
  results,
  detail,
  layout = 'split',
  loading = false,
  detailLoading = false,
}) => {
  if (loading) return <LoadingColumns />;

  const detailColumn = detailLoading ? <DetailSkeleton /> : detail;

  if (layout === 'single') {
    return (
      <div className={styles.single}>
        <div className={styles.column}>{detailColumn}</div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <div className={styles.column}>{results}</div>
      <div className={styles.column}>{detailColumn}</div>
    </div>
  );
};
