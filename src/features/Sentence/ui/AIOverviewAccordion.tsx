import { type FC, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from 'designoslav';
import styles from './AIOverviewAccordion.module.css';
import Markdown from 'react-markdown';
import { type SentenceToken } from '@/shared/api/types';
import { DURATION, EASE, useReducedMotion } from '@/shared/motion';
import { SENTENCE_PREVIEW_LENGTH } from '../constants';
import { useT } from '@/shared/i18n';

interface AIOverviewAccordionProps {
  sentence: string;
  tokens: SentenceToken[];
  onFetchOverview: (onChunk: (chunk: string) => void) => Promise<void>;
}

export const AIOverviewAccordion: FC<AIOverviewAccordionProps> = ({
  sentence,
  tokens,
  onFetchOverview,
}) => {
  const t = useT();
  const reduced = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const [overview, setOverview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && overview === null && !isLoading) {
      fetchOverview();
    }
  };

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    setOverview(null);
    try {
      await onFetchOverview((chunk) => {
        setOverview((prev) => (prev ?? '') + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ui', 'ai_unknown_error'));
      console.error('Failed to fetch AI overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sentenceSummary = sentence
    ? `${sentence.slice(0, SENTENCE_PREVIEW_LENGTH)}${sentence.length > SENTENCE_PREVIEW_LENGTH ? '…' : ''}`
    : '';
  const tokenCount = tokens.length;

  return (
    <div className={styles.aiOverviewContainer}>
      <div className={styles.overviewHeader}>
        <div className={styles.overviewTitleBlock}>
          <h3 className={styles.overviewTitle}>{t('ui', 'ai_overview_title')}</h3>
          {sentenceSummary && <p className={styles.sentencePreview}>{sentenceSummary}</p>}
        </div>
        <div className={styles.overviewActions}>
          <span className={styles.tokenCount}>
            {t('ui', 'ai_overview_tokens')} {tokenCount}
          </span>
          <Button variant={isExpanded ? 'secondary' : 'primary'} size="l" onClick={handleToggle}>
            {isExpanded ? t('ui', 'ai_overview_collapse') : t('ui', 'ai_overview_expand')}
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="overview-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            {/* `layout` smooths the height as SSE chunks stream in, instead of
                the box jumping on every chunk. */}
            <motion.div layout={!reduced} className={styles.overviewContentContainer}>
              {overview !== null ? (
                <div className={styles.overviewText}>
                  <Markdown>{overview}</Markdown>
                </div>
              ) : isLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <p className={styles.loadingText}>{t('ui', 'ai_overview_loading')}</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <p className={styles.errorText}>
                    {t('ui', 'ai_overview_error_prefix')} {error}
                  </p>
                  <Button
                    variant="secondary"
                    size="m"
                    onClick={fetchOverview}
                    className={styles.retryButton}
                  >
                    {t('ui', 'ai_overview_retry')}
                  </Button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.promptText}>{t('ui', 'ai_overview_prompt')}</p>
                  <Button
                    variant="primary"
                    size="m"
                    onClick={fetchOverview}
                    className={styles.fetchButton}
                  >
                    {t('ui', 'ai_overview_fetch')}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
