import { FC, useState } from 'react';
import { Text, Button } from '@gravity-ui/uikit';
import { ChevronDown, ChevronUp } from '@gravity-ui/icons';
import styles from './AIOverviewAccordion.module.css';
import Markdown from 'react-markdown';

interface AIOverviewAccordionProps {
  sentence: string;
  tokens: any[];
  onFetchOverview: () => Promise<string>;
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

  const handleToggle = async () => {
    if (!isExpanded) {
      // Если аккордеон раскрывается впервые и обзор еще не загружен
      if (overview === null && !isLoading) {
        await fetchOverview();
      }
    }
    setIsExpanded(!isExpanded);
  };

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onFetchOverview();
      setOverview(result);
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

  return (
    <div className={styles.aiOverviewContainer}>
      <Button
        view="outlined"
        size="l"
        onClick={handleToggle}
        className={styles.overviewToggle}
        width="max"
      >
        <div className={styles.overviewHeader}>
          <Text variant="subheader-2">🤖 AI Обзор предложения</Text>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </Button>
      
      {isExpanded && (
        <div className={styles.overviewContentContainer}>
          {isLoading ? (
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
          ) : overview ? (
            <div className={styles.overviewText}>
              {formatOverview(overview)}
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