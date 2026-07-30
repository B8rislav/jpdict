'use client';

import { useUnit } from 'effector-react';
import { type FC } from 'react';

import { type SavedWord } from '@/shared/api/types';
import { nextStatus } from './constants';
import { $savedWords, removeWordFx, toggleSuspendFx, updateStatusFx } from './model';
import { useDictionaryFilters } from './model/useDictionaryFilters';
import { DictionaryPanelView } from './ui/DictionaryPanelView';

export const DictionaryPanel: FC = () => {
  const savedWords = useUnit($savedWords);
  const { filtered, levelFilter, statusFilter, toggleLevel, toggleStatus, hasJlpt, hasHsk } =
    useDictionaryFilters(savedWords);

  return (
    <DictionaryPanelView
      words={filtered}
      totalCount={savedWords.length}
      levelFilter={levelFilter}
      statusFilter={statusFilter}
      hasJlpt={hasJlpt}
      hasHsk={hasHsk}
      onToggleLevel={toggleLevel}
      onToggleStatus={toggleStatus}
      onDelete={(word: SavedWord) => word.id && removeWordFx(word.id)}
      onAdvanceStatus={(word: SavedWord) =>
        word.id && updateStatusFx({ id: word.id, status: nextStatus(word.status) })
      }
      onToggleSuspend={(word: SavedWord) =>
        word.id && toggleSuspendFx({ id: word.id, suspend: !word.suspended })
      }
    />
  );
};
