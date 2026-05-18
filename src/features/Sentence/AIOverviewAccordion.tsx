import { FC, useState } from 'react';
import { Text, Button } from '@gravity-ui/uikit';
import styles from './AIOverviewAccordion.module.css';
import Markdown from 'react-markdown';

interface AIToken {
  surface_form: string;
  basic_form?: string;
  pos: string;
  pos_detail_1?: string;
  conjugated_form?: string;
  reading?: string;
}

interface AIOverviewAccordionProps {
  sentence: string;
  tokens: AIToken[];
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
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      console.error('Failed to fetch AI overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOverview = (text: string) => {

    return (
      <Markdown>{text}</Markdown>
    )
  };

  const sentenceSummary = sentence
    ? `${sentence.slice(0, 60)}${sentence.length > 60 ? '…' : ''}`
    : '';
  const tokenCount = tokens.length;

  return (
    <div className={styles.aiOverviewContainer}>
      <div className={styles.overviewHeader}>
        <div className={styles.overviewTitleBlock}>
          <Text variant="subheader-2">🤖 AI Обзор предложения</Text>
          {sentenceSummary && (
            <Text variant="caption-1" className={styles.sentencePreview}>
              {sentenceSummary}
            </Text>
          )}
        </div>
        <div className={styles.overviewActions}>
          <Text variant="caption-1" className={styles.tokenCount}>
            Токенов: {tokenCount}
          </Text>
          <Button
            view={isExpanded ? 'normal' : 'outlined-info'}
            size="l"
            onClick={handleToggle}
          >
            {isExpanded ? 'Свернуть обзор' : 'Показать обзор'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.overviewContentContainer}>
          {overview !== null ? (
            <div className={styles.overviewText}>
              {formatOverview(overview)}
            </div>
          ) : isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <Text variant="body-2" className={styles.loadingText}>
                AI анализирует предложение...
              </Text>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <Text variant="body-2" color="danger">
                Ошибка: {error}
              </Text>
              <Button
                view="outlined"
                size="s"
                onClick={fetchOverview}
                className={styles.retryButton}
              >
                Попробовать снова
              </Button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text variant="body-2">
                Нажмите кнопку ниже, чтобы получить AI-анализ этого предложения
              </Text>
              <Button
                view="action"
                size="m"
                onClick={fetchOverview}
                className={styles.fetchButton}
              >
                Получить AI-анализ
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};