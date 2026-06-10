'use client';

import { Button, Text } from '@gravity-ui/uikit';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { Card } from '@/shared/ui/Card';
import { MarkerList } from '@/shared/ui/MarkerList/MarkerList';
import { DefinitionList } from '@/shared/ui/DefinitionList/DefinitionList';
import { t } from '@/shared/i18n';
import { type ReviewCard as ReviewCardData } from '../api/types';
import { GRADES, GRADE_BY_KEY, GRADE_VIEW, type Grade } from '../constants';
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

export const ReviewCard: FC<Props> = ({ card, readingLabel, onGrade, initiallyRevealed = false }) => {
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const front = card.kanji_full ?? card.hiragana_full;

  // Reset to the front when a *new* card comes up (skip the initial mount so
  // `initiallyRevealed` is honored).
  const lastId = useRef(card.id);
  useEffect(() => {
    if (lastId.current !== card.id) {
      lastId.current = card.id;
      setRevealed(false);
    }
  }, [card.id]);

  const grade = useCallback(
    (g: Grade) => {
      setRevealed(false);
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

  return (
    <Card className={styles.card}>
      <div className={styles.front}>
        <Text variant={front && front === card.hiragana_full ? 'display-2' : 'display-3'}>
          {front}
        </Text>
        <MarkerList markers={card.markers} />
      </div>

      {!revealed ? (
        <Button size="xl" view="action" width="max" onClick={() => setRevealed(true)}>
          {t('review', 'reveal')}
        </Button>
      ) : (
        <>
          <div className={styles.back}>
            {card.kanji_full && (
              <Text variant="subheader-2" color="secondary">
                {readingLabel}: {card.hiragana_full}
              </Text>
            )}
            <DefinitionList items={card.def_en} />
          </div>
          <div className={styles.grades}>
            {GRADES.map((g) => (
              <Button key={g} size="l" view={GRADE_VIEW[g]} onClick={() => grade(g)}>
                <span className={styles.gradeLabel}>
                  {t('review', g)}
                  <span className={styles.interval}>{formatInterval(card.projectedIntervals[g])}</span>
                </span>
              </Button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
