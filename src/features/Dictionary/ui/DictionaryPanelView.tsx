'use client';

import { Badge, Button, CardGrid, VocabList } from 'designoslav';
import { type FC } from 'react';

import { type CardType, type SavedWord } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { MASTERY_TONE } from '../constants';
import styles from './DictionaryPanelView.module.css';

export type DictionaryPanelViewProps = {
  deck: CardType;
  items: SavedWord[];
  /** Total matching the filters — decides whether more can still be loaded. */
  total: number;
  loading: boolean;
  /** Nothing saved at all, as opposed to nothing matching the current filters. */
  emptyCollection: boolean;
  /** Whether pronunciation is available; ▶ is disabled when it isn't. */
  canSpeak: boolean;
  onSpeak: (word: SavedWord) => void;
  onDelete: (word: SavedWord) => void;
  onAdvanceStatus: (word: SavedWord) => void;
  onEndReached: () => void;
};

/** Viewport heights for the virtualized collections — see the scroll note in the lib. */
const LIST_HEIGHT = 620;
const GRID_HEIGHT = 560;
const GRID_COLUMNS = 5;

/** «есть · to eat» — both glosses, skipping whichever the card lacks. */
const gloss = (word: SavedWord) => [word.def_ru?.[0], word.def_en?.[0]].filter(Boolean).join(' · ');

export const DictionaryPanelView: FC<DictionaryPanelViewProps> = ({
  deck,
  items,
  total,
  loading,
  emptyCollection,
  canSpeak,
  onSpeak,
  onDelete,
  onAdvanceStatus,
  onEndReached,
}) => {
  const t = useT();

  if (!items.length) {
    return (
      <p className={styles.empty}>{t('ui', emptyCollection ? 'dict_empty' : 'dict_no_filter')}</p>
    );
  }

  const levelBadge = (word: SavedWord) =>
    word.markers?.[0] ? <Badge tone="primary">{word.markers[0]}</Badge> : null;

  if (deck === 'kanji') {
    return (
      <CardGrid
        aria-label={t('ui', 'deck_kanji')}
        columnCount={GRID_COLUMNS}
        height={GRID_HEIGHT}
        onEndReached={onEndReached}
        items={items.map((word) => ({
          id: word.id ?? word.kanji_full ?? '',
          glyph: word.kanji_full ?? word.hiragana_full,
          meaning: gloss(word),
          reading: word.hiragana_full,
          tone: MASTERY_TONE[word.status],
          badges: (
            <>
              {levelBadge(word)}
              {word.strokeCount != null && (
                <Badge tone="neutral">
                  {word.strokeCount} {t('ui', 'deck_strokes')}
                </Badge>
              )}
            </>
          ),
          status: t('mastery', word.status),
        }))}
      />
    );
  }

  return (
    <VocabList
      aria-label={t('ui', 'deck_words')}
      height={LIST_HEIGHT}
      loadingMore={loading && items.length < total}
      loadingLabel={t('ui', 'dict_loading_more')}
      onEndReached={onEndReached}
      items={items.map((word) => {
        const headword = word.kanji_full ?? word.hiragana_full ?? '';
        return {
          id: word.id ?? headword,
          headword,
          // Only show a reading when it differs from the headword itself.
          reading: word.kanji_full ? word.hiragana_full : undefined,
          gloss: gloss(word),
          tone: MASTERY_TONE[word.status],
          badges: (
            <>
              {levelBadge(word)}
              <Badge
                tone={MASTERY_TONE[word.status]}
                as="button"
                onClick={() => onAdvanceStatus(word)}
              >
                {t('mastery', word.status)}
              </Badge>
            </>
          ),
          actions: (
            <>
              <Button
                size="m"
                variant="ghost"
                disabled={!canSpeak}
                aria-label={`${t('ui', 'tts_speak')} ${headword}`}
                title={canSpeak ? undefined : t('ui', 'tts_unsupported')}
                onClick={() => onSpeak(word)}
              >
                ▶
              </Button>
              <Button
                size="m"
                variant="ghost"
                aria-label={`${t('ui', 'dict_delete')} ${headword}`}
                onClick={() => onDelete(word)}
              >
                ✕
              </Button>
            </>
          ),
        };
      })}
    />
  );
};
