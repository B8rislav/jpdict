'use client';

import { useUnit } from 'effector-react';
import { useEffect, type FC } from 'react';

import { type CardType } from '@/shared/api/types';
import { useT } from '@/shared/i18n';
import { useProfile } from '@/shared/profile/context';
import { $current, $queue, $sessionTotal, fetchQueueFx, gradeCurrent } from './model';
import { SessionView } from './ui/SessionView';

type Props = {
  /** Deck to scope the session to, from `?deck=`. Undefined studies both decks. */
  deck?: CardType;
  onExit: () => void;
  onFinish: () => void;
};

/** Wires a review session: loads the queue for the deck, then grades through it. */
export const SessionPanel: FC<Props> = ({ deck, onExit, onFinish }) => {
  const t = useT();
  const { selectedLanguage } = useProfile();
  const [card, queue, total] = useUnit([$current, $queue, $sessionTotal]);

  useEffect(() => {
    fetchQueueFx(deck);
  }, [deck]);

  const readingLabel = t('ui', selectedLanguage === 'cn' ? 'reading_label_cn' : 'reading_label_jp');

  return (
    <SessionView
      card={card}
      total={total}
      remaining={queue.length}
      deck={deck}
      readingLabel={readingLabel}
      onGrade={(grade, elapsedMs) => gradeCurrent({ grade, elapsedMs })}
      onExit={onExit}
      onFinish={onFinish}
    />
  );
};
