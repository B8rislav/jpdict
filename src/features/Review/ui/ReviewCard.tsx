'use client';

import { Badge, Button, GradeButton, StudyCard } from 'designoslav';
import { type PanInfo, type TargetAndTransition, motion } from 'motion/react';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { DURATION, EASE, useReducedMotion } from '@/shared/motion';
import { useT } from '@/shared/i18n';
import { type ReviewCard as ReviewCardData } from '../api/types';
import { GRADES, GRADE_BY_KEY, type Grade } from '../constants';
import { formatInterval } from '../lib/srs';
import styles from './ReviewCard.module.css';

type Props = {
  card: ReviewCardData;
  /** Localized label for the reading line ("Hiragana" / "Pinyin"). */
  readingLabel: string;
  onGrade: (grade: Grade, elapsedMs: number) => void;
  /** Start on the back — for stories/tests only; the session always starts on the front. */
  initiallyRevealed?: boolean;
};

/** Horizontal direction the card flings toward per grade: bad → left, good → right. */
const FLING_DIR: Record<Grade, number> = { again: -1, hard: -0.45, good: 0.45, easy: 1 };
/** Drag distance (px) past which a release grades again/good. */
const DRAG_THRESHOLD = 120;

/**
 * One review card. Designoslav's `StudyCard` owns the surface and the CSS flip; this
 * wraps it in a `motion.div` so the session-level `<AnimatePresence>` (keyed by
 * `card.id`) can fling the outgoing card away and slide the next one in, and so the
 * card can be dragged to grade. The library can't depend on `motion`, and doesn't
 * need to — the flip is a CSS transform either way.
 *
 * Because the parent keys on `card.id`, every card is a fresh instance: there is no
 * stale `revealed` state to desync from the data, and the elapsed-time clock below
 * restarts naturally with each card.
 */
export const ReviewCard: FC<Props> = ({
  card,
  readingLabel,
  onGrade,
  initiallyRevealed = false,
}) => {
  const t = useT();
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const [exitGrade, setExitGrade] = useState<Grade | null>(null);
  // Time on card, measured from first paint to the grade. The backend clamps it, so
  // a card left open over lunch can't report lunch as study time.
  const shownAt = useRef(Date.now());
  const front = card.kanji_full ?? card.hiragana_full;

  const grade = useCallback(
    (g: Grade) => {
      // Capture the fling direction on this (soon-to-exit) instance, then swap.
      setExitGrade(g);
      onGrade(g, Date.now() - shownAt.current);
    },
    [onGrade],
  );

  // Space reveals; 1–4 grade once revealed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !revealed) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed && GRADE_BY_KEY[e.key]) {
        e.preventDefault();
        grade(GRADE_BY_KEY[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, grade]);

  const exit: TargetAndTransition = reduced
    ? { opacity: 0, transition: { duration: 0 } }
    : {
        x: FLING_DIR[exitGrade ?? 'good'] * 480,
        rotate: FLING_DIR[exitGrade ?? 'good'] * 14,
        opacity: 0,
        transition: { duration: DURATION.base, ease: EASE },
      };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -DRAG_THRESHOLD) grade('again');
    else if (info.offset.x > DRAG_THRESHOLD) grade('good');
  };

  return (
    <motion.div
      className={styles.root}
      initial={reduced ? false : { opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={exit}
      transition={reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
      drag={revealed && !reduced ? 'x' : false}
      dragSnapToOrigin
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={onDragEnd}
    >
      <StudyCard
        headword={front}
        revealed={revealed}
        badges={card.markers?.map((marker) => (
          <Badge key={marker} tone="primary">
            {marker}
          </Badge>
        ))}
        reveal={
          <Button size="xl" variant="primary" fullWidth onClick={() => setRevealed(true)}>
            {t('review', 'reveal')}
          </Button>
        }
        answer={
          <>
            {card.kanji_full && (
              <span className={styles.reading}>
                {readingLabel}: {card.hiragana_full}
              </span>
            )}
            <strong className={styles.meaning}>{card.def_en?.join(', ')}</strong>
            {card.components.length > 0 && (
              <ul className={styles.components}>
                {card.components.map((component) => (
                  <li key={component.character} className={styles.component}>
                    <span className={styles.componentChar}>{component.character}</span>
                    <span className={styles.componentGloss}>
                      {[component.readings[0], component.meanings[0]]
                        .filter(Boolean)
                        .join(' — ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        }
        actions={GRADES.map((g) => (
          <GradeButton
            key={g}
            grade={g}
            label={t('review', g)}
            interval={formatInterval(card.projectedIntervals[g], t)}
            onClick={() => grade(g)}
          />
        ))}
      />
    </motion.div>
  );
};
