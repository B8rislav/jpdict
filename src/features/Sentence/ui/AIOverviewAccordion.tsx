import { type FC, useState } from 'react';
import { Text, Button } from '@gravity-ui/uikit';
import styles from './AIOverviewAccordion.module.css';
import Markdown from 'react-markdown';
import { type SentenceToken } from '@/shared/api/types';
import { SENTENCE_PREVIEW_LENGTH } from '../constants';
import { t } from '@/shared/i18n';

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
          <Text variant="subheader-2">{t('ui', 'ai_overview_title')}</Text>
          {sentenceSummary && (
            <Text variant="caption-1" className={styles.sentencePreview}>
              {sentenceSummary}
            </Text>
          )}
        </div>
        <div className={styles.overviewActions}>
          <Text variant="caption-1" className={styles.tokenCount}>
            {t('ui', 'ai_overview_tokens')} {tokenCount}
          </Text>
          <Button view={isExpanded ? 'normal' : 'outlined-info'} size="l" onClick={handleToggle}>
            {isExpanded ? t('ui', 'ai_overview_collapse') : t('ui', 'ai_overview_expand')}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.overviewContentContainer}>
          {overview !== null ? (
            <div className={styles.overviewText}>
              <Markdown>{overview}</Markdown>
            </div>
          ) : isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <Text variant="body-2" className={styles.loadingText}>
                {t('ui', 'ai_overview_loading')}
              </Text>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <Text variant="body-2" color="danger">
                {t('ui', 'ai_overview_error_prefix')} {error}
              </Text>
              <Button
                view="outlined"
                size="s"
                onClick={fetchOverview}
                className={styles.retryButton}
              >
                {t('ui', 'ai_overview_retry')}
              </Button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text variant="body-2">
                {t('ui', 'ai_overview_prompt')}
              </Text>
              <Button view="action" size="m" onClick={fetchOverview} className={styles.fetchButton}>
                {t('ui', 'ai_overview_fetch')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
