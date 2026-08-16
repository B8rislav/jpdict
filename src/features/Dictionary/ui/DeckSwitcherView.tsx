'use client';

import { Button, DeckCard } from 'designoslav';
import { type FC } from 'react';

import { type CardType, type DeckSummary } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import styles from './DeckSwitcherView.module.css';

export type DeckSwitcherViewProps = {
  decks: DeckSummary[];
  openDeck: CardType;
  onOpenDeck: (deck: CardType) => void;
  onStudy: (deck: CardType) => void;
};

/** Deck identity is fixed — two decks, each with its own sigil and colour. */
const DECKS: { cardType: CardType; glyph: string; tone: 'accent' | 'primary' }[] = [
  { cardType: 'kanji', glyph: '漢', tone: 'accent' },
  { cardType: 'word', glyph: '語', tone: 'primary' },
];

export const DeckSwitcherView: FC<DeckSwitcherViewProps> = ({
  decks,
  openDeck,
  onOpenDeck,
  onStudy,
}) => {
  const t = useT();

  return (
    <div className={styles.decks}>
      {DECKS.map(({ cardType, glyph, tone }) => {
        const summary = decks.find((deck) => deck.cardType === cardType);
        const today = (summary?.due ?? 0) + (summary?.newToday ?? 0);
        const done = summary?.doneToday ?? 0;
        const name = t('ui', cardType === 'kanji' ? 'deck_kanji' : 'deck_words');

        return (
          <DeckCard
            key={cardType}
            glyph={glyph}
            glyphTone={tone}
            title={name}
            nativeTitle={t('ui', cardType === 'kanji' ? 'deck_kanji_native' : 'deck_words_native')}
            caption={`${summary?.total ?? 0} ${t('ui', 'deck_size')}`}
            open={openDeck === cardType}
            openLabel={t('ui', 'deck_open')}
            todayLabel={t('ui', 'deck_today')}
            todayValue={`${today} ${t('ui', 'deck_today_cards')}`}
            progressLabel={`${done} ${t('ui', 'deck_done_of')} ${today} ${t('ui', 'deck_done')}`}
            value={done}
            target={today}
            legend={[
              { tone: 'accent', label: `${t('ui', 'deck_due')} · ${summary?.due ?? 0}` },
              { tone: 'primary', label: `${t('ui', 'deck_new')} · ${summary?.newToday ?? 0}` },
            ]}
            onOpen={() => onOpenDeck(cardType)}
            selectLabel={`${t('ui', 'deck_select')} ${name}`}
            action={
              <Button
                size="m"
                variant={openDeck === cardType ? 'primary' : 'secondary'}
                onClick={() => onStudy(cardType)}
              >
                {t('ui', done > 0 ? 'deck_continue' : 'deck_study')}
              </Button>
            }
          />
        );
      })}
    </div>
  );
};
