'use client';

import { Text } from '@gravity-ui/uikit';
import { Button } from 'designoslav';
import { type PanInfo, type TargetAndTransition, motion } from 'motion/react';
import { type FC, useCallback, useEffect, useState } from 'react';

import { Card } from '@/shared/ui/Card';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { DefinitionList } from '@/shared/ui/DefinitionList/DefinitionList';
import { DURATION, EASE, TAP_SCALE, useReducedMotion } from '@/shared/motion';
import { t } from '@/shared/i18n';
import { type ReviewCard as ReviewCardData } from '../api/types';
import { GRADES, GRADE_BY_KEY, GRADE_VARIANT, type Grade } from '../constants';
import { formatInterval } from '../lib/srs';
import styles from './ReviewCard.module.css';

type Props = {
  card: ReviewCardData;
  /** Localized label for the reading line ("Hiragana" / "Pinyin"). */
  readingLabel: string;
  onGrade: (grade: Grade) => void;
  /** Start on the back — for stories/tests only; the session always starts on the front. */
  initiallyRevealed?: boolean;
};

/** Horizontal direction the card flings toward per grade: bad → left, good → right. */
const FLING_DIR: Record<Grade, number> = { again: -1, hard: -0.45, good: 0.45, easy: 1 };
/** Drag distance (px) past which a release grades again/good. */
const DRAG_THRESHOLD = 120;

/**
 * One review card. The root is a `motion.div` so the session-level
 * `<AnimatePresence>` (study/page.tsx, keyed by `card.id`) can fling the
 * outgoing card off and slide the next one in. Revealing flips the card in 3D;
 * grading sets the fling direction before `onGrade` swaps the data.
 *
 * Because the parent keys on `card.id`, every card is a fresh instance — there's
 * no stale `revealed`/animation state to desync from the data, even when the
 * keyboard spams Space + 1–4.
 */
export const ReviewCard: FC<Props> = ({ card, readingLabel, onGrade, initiallyRevealed = false }) => {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const [exitGrade, setExitGrade] = useState<Grade | null>(null);
  const front = card.kanji_full ?? card.hiragana_full;

  const grade = useCallback(
    (g: Grade) => {
      // Capture the fling direction on this (soon-to-exit) instance, then swap.
      setExitGrade(g);
      onGrade(g);
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

  const flipTransition = reduced ? { duration: 0 } : { duration: DURATION.slow, ease: EASE };

  const frontWord = (
    <div className={styles.front}>
      <Text variant={front && front === card.hiragana_full ? 'display-2' : 'display-3'}>
        {front}
      </Text>
      <MarkerList markers={card.markers} />
    </div>
  );

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
      <Card className={styles.card}>
        <div className={styles.flipScene}>
          <motion.div
            className={styles.flipInner}
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={flipTransition}
          >
            {/* Front face */}
            <div className={`${styles.face} ${!revealed ? styles.active : ''}`}>
              {frontWord}
              <motion.div
                className={styles.reveal}
                whileTap={reduced ? undefined : { scale: TAP_SCALE }}
              >
                <Button size="xl" variant="primary" fullWidth onClick={() => setRevealed(true)}>
                  {t('review', 'reveal')}
                </Button>
              </motion.div>
            </div>

            {/* Back face */}
            <div className={`${styles.face} ${styles.faceBack} ${revealed ? styles.active : ''}`}>
              {frontWord}
              <div className={styles.back}>
                {card.kanji_full && (
                  <Text variant="subheader-2" color="secondary">
                    {readingLabel}: {card.hiragana_full}
                  </Text>
                )}
                <DefinitionList items={card.def_en} />
              </div>
              <motion.div
                className={styles.grades}
                initial={false}
                animate={revealed ? 'visible' : 'hidden'}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: reduced ? 0 : 0.06,
                      delayChildren: reduced ? 0 : DURATION.slow,
                    },
                  },
                }}
              >
                {GRADES.map((g) => (
                  <motion.div
                    key={g}
                    className={styles.gradeCell}
                    variants={{
                      hidden: reduced ? {} : { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileTap={reduced ? undefined : { scale: TAP_SCALE }}
                  >
                    <Button size="l" variant={GRADE_VARIANT[g]} fullWidth onClick={() => grade(g)}>
                      <span className={styles.gradeLabel}>
                        {t('review', g)}
                        <span className={styles.interval}>
                          {formatInterval(card.projectedIntervals[g])}
                        </span>
                      </span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
