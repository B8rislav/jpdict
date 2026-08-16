'use client';

import { Badge, Button, ProgressBar, SessionComplete } from 'designoslav';
import { AnimatePresence } from 'motion/react';
import { type FC } from 'react';

import { type CardType } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { type ReviewCard as ReviewCardData } from '../api/types';
import { type Grade } from '../constants';
import { pluralCards } from '../lib/activity';
import { ReviewCard } from './ReviewCard';
import styles from './SessionView.module.css';

type Props = {
  card: ReviewCardData | null;
  /** Cards the session started with — the progress bar's denominator. */
  total: number;
  /** Cards still to answer, including the current one. */
  remaining: number;
  /** The deck the session was scoped to, if any — shapes the completion copy. */
  deck?: CardType;
  readingLabel: string;
  onGrade: (grade: Grade, elapsedMs: number) => void;
  onExit: () => void;
  onFinish: () => void;
};

/**
 * A review session: a header carrying the way out, the current card's deck and the
 * progress through the queue, then the card itself — or the completion screen once
 * the queue drains.
 *
 * The deck badge is read off the *current card*, not the session, so a mixed session
 * labels each card with where it came from and a deck-scoped one simply shows the
 * same badge throughout. One code path either way.
 */
export const SessionView: FC<Props> = ({
  card,
  total,
  remaining,
  deck,
  readingLabel,
  onGrade,
  onExit,
  onFinish,
}) => {
  const t = useT();
  const done = total - remaining;

  return (
    <div className={styles.session}>
      <div className={styles.header}>
        <Button size="m" variant="secondary" onClick={onExit}>
          {t('review', 'session_back')}
        </Button>

        {card && (
          // TODO(lib): the mock's deck badge is plum. `--do-color-info` exists as a
          // token but `Badge` has no `info` tone yet, so this is celadon until the
          // next designoslav publish adds one.
          <Badge tone="primary" caps>
            {t('ui', card.cardType === 'kanji' ? 'deck_kanji_native' : 'deck_words_native')}{' '}
            {t('ui', card.cardType === 'kanji' ? 'deck_kanji' : 'deck_words')}
          </Badge>
        )}

        <ProgressBar
          size="s"
          className={styles.progress}
          value={done}
          target={total}
          aria-label={t('review', 'title')}
        />
        <span className={styles.count}>
          {t('review', 'session_progress', { done: Math.min(done + (card ? 1 : 0), total), total })}
        </span>
      </div>

      {card ? (
        <AnimatePresence mode="wait">
          <ReviewCard
            key={card.id}
            card={card}
            readingLabel={readingLabel}
            onGrade={onGrade}
          />
        </AnimatePresence>
      ) : (
        <SessionComplete
          glyph="完"
          title={t('review', deck ? 'session_deck_done' : 'session_all_done')}
          caption={t('review', 'session_done_caption', { cards: pluralCards(total, t) })}
          action={
            <Button size="l" variant="primary" onClick={onFinish}>
              {t('review', 'session_to_dictionary')}
            </Button>
          }
        />
      )}
    </div>
  );
};
