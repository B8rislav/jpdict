'use client';

import { SearchField, SearchOptionList, type SearchOptionItem } from 'designoslav';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { useT } from '@/shared/i18n';
import { DURATION, EASE, useReducedMotion } from '@/shared/motion';

import styles from './SearchView.module.css';

type SearchViewProps = {
  inputValue: string;
  onValueChange: (value: string) => void;
  /** Run the raw typed query (button / Enter when no option is highlighted). */
  onSubmit: (value: string) => void;
  /** Run a specific option (a parse variant or a history entry) by id. */
  onSelectOption: (id: string) => void;
  onClearHistory?: () => void;
  /** History entries (empty input) or parse options (typing), pre-mapped for the list. */
  options: SearchOptionItem[];
  mode: 'history' | 'suggest';
  placeholder?: string;
  isSubmitting?: boolean;
};

export const SearchView: FC<SearchViewProps> = ({
  inputValue,
  onValueChange,
  onSubmit,
  onSelectOption,
  onClearHistory,
  options,
  mode,
  placeholder,
  isSubmitting,
}) => {
  const t = useT();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Highlight the first option whenever the option set changes (new query,
  // history ↔ suggestions). Arrow-key moves happen between these resets.
  useEffect(() => {
    setSelectedId(options[0]?.id ?? null);
  }, [options]);

  const moveSelection = (delta: number) => {
    if (options.length === 0) return;
    const current = options.findIndex((option) => option.id === selectedId);
    const next = (current + delta + options.length) % options.length;
    setSelectedId(options[next].id);
  };

  const commit = () => {
    setOpen(false);
    if (options.length > 0 && selectedId) {
      onSelectOption(selectedId);
    } else {
      onSubmit(inputValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        moveSelection(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        moveSelection(-1);
        break;
      case 'Enter':
        // Own Enter fully so the form doesn't also submit (avoids a double run).
        event.preventDefault();
        commit();
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  const handleSelect = (id: string) => {
    setOpen(false);
    onSelectOption(id);
  };

  const heading =
    mode === 'history' ? (
      <span className={styles.historyHeading}>
        {t('ui', 'history_heading')}
        {onClearHistory && (
          <button
            type="button"
            className={styles.clearHistoryBtn}
            onClick={() => {
              setOpen(false);
              onClearHistory();
            }}
          >
            {t('ui', 'history_clear')}
          </button>
        )}
      </span>
    ) : (
      t('ui', 'suggest_heading')
    );

  return (
    <div className={styles.searchRoot}>
      <div
        className={styles.fieldWrapper}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        <SearchField
          ref={inputRef}
          aria-label={t('ui', 'search_aria_label')}
          value={inputValue}
          onValueChange={onValueChange}
          onSubmit={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          actionLabel={isSubmitting ? t('ui', 'search_button_loading') : t('ui', 'search_button')}
          clearLabel={t('ui', 'search_clear')}
          size="l"
          fullWidth
        />

        {/* AnimatePresence gives the popover a real exit — CSS can't animate an unmount. */}
        <AnimatePresence>
          {open && options.length > 0 && (
            <motion.div
              className={styles.popover}
              // Keep focus on the input so a click doesn't blur-close before it registers.
              onMouseDown={(event) => event.preventDefault()}
              initial={reduced ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE }}
            >
              <SearchOptionList
                heading={heading}
                options={options}
                selectedId={selectedId ?? undefined}
                onSelect={handleSelect}
              />
              <p className={styles.kbdHints}>
                <span>
                  <kbd>↑↓</kbd> {t('ui', 'search_kbd_select')}
                </span>
                <span>
                  <kbd>↵</kbd> {t('ui', 'search_kbd_parse')}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
