'use client';

import {
  SearchBand,
  SearchField,
  SearchOptionList,
  Switch,
  type SearchOptionItem,
} from 'designoslav';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect, useId, useState } from 'react';

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
  /** Kicker above the field — reflects the study language. */
  eyebrow: string;
  /** Furigana (jp) or pinyin (cn); omitted when no language is chosen. */
  reading?: { label: string; checked: boolean; onChange: (value: boolean) => void };
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
  eyebrow,
  reading,
}) => {
  const t = useT();
  const reduced = useReducedMotion();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>();

  // Highlight the first option whenever the option set changes (new query,
  // history ↔ suggestions). Arrow-key moves happen between these resets.
  useEffect(() => {
    setActiveId(options[0]?.id);
  }, [options]);

  const expanded = open && options.length > 0;

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
    <SearchBand
      eyebrow={eyebrow}
      hint={t('ui', 'band_hint')}
      aside={
        reading && (
          <Switch checked={reading.checked} onChange={reading.onChange} label={reading.label} />
        )
      }
    >
      <div
        className={styles.fieldWrapper}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        {/* The field owns ↑↓ / Home / End / Enter / Escape through the combobox props, so
            focus never leaves the input — the highlight travels by aria-activedescendant.
            This replaced a hand-rolled keydown switch that duplicated the same contract. */}
        <SearchField
          aria-label={t('ui', 'search_aria_label')}
          value={inputValue}
          onValueChange={onValueChange}
          onSubmit={onSubmit}
          placeholder={placeholder}
          actionLabel={isSubmitting ? t('ui', 'search_button_loading') : t('ui', 'search_button')}
          clearLabel={t('ui', 'search_clear')}
          size="l"
          fullWidth
          listboxId={listboxId}
          expanded={expanded}
          optionIds={options.map((option) => option.id)}
          activeOptionId={activeId}
          onActiveOptionChange={setActiveId}
          onOptionCommit={handleSelect}
          onDismiss={() => setOpen(false)}
        />

        {/* AnimatePresence gives the popover a real exit — CSS can't animate an unmount. */}
        <AnimatePresence>
          {expanded && (
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
                id={listboxId}
                heading={heading}
                options={options}
                activeId={activeId}
                onSelect={handleSelect}
                hints={[
                  { keys: '↑↓', label: t('ui', 'search_kbd_select') },
                  { keys: '↵', label: t('ui', 'search_kbd_parse') },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SearchBand>
  );
};
