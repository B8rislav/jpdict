import { Card } from '@/shared/ui/Card';
import { FuriganaText } from '@/shared/ui/FuriganaText/FuriganaText';
import { Label, Text } from '@gravity-ui/uikit';
import { FC, useState } from 'react';
import { fetchWordsFx, clearWords } from '../WordCard';
import { clearKanji } from '../KanjiCard/model';
import { SentenceResult } from './model';
import { fetchAIOverview } from './api/fetchAIOverview';
import { AIOverviewAccordion } from './AIOverviewAccordion';
import ruTranslations from '@/shared/i18n/ru.json';
import { useUnit } from 'effector-react';
import { $userProfile } from '@/stores/userProfile';

import styles from './SentenceCard.module.css';

type SentenceCardProps = SentenceResult;

const getTranslation = (category: keyof typeof ruTranslations, key: string) => {
  return (ruTranslations[category] as Record<string, string>)?.[key] || key;
};

const getPosColorClass = (pos: string, language: 'jp' | 'cn' | null): string => {
  if (language === 'cn') {
    switch (pos) {
      case 'pronoun':
        return styles.pronoun;
      case 'verb':
        return styles.verb;
      case 'noun':
        return styles.noun;
      case 'adjective':
        return styles.adjective;
      default:
        return styles.other;
    }
  }
  switch (pos) {
    case '助詞':
      return styles.particle;
    case '名詞':
      return styles.noun;
    case '動詞':
      return styles.verb;
    case '形容詞':
      return styles.adjective;
    case '助動詞':
      return styles.auxiliary;
    case '副詞':
      return styles.adverb;
    default:
      return styles.other;
  }
};

export const SentenceCard: FC<SentenceCardProps> = ({ sentence, tokens }) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null,
  );
  const { selectedLanguage, showFurigana, showPinyin } = useUnit($userProfile);

  const handleFetchOverview = async (): Promise<string> => {
    return await fetchAIOverview(sentence, tokens);
  };

  return (
    <>
      <Card className={styles.sentenceCard}>
        <div className={styles.header}>
          <Text variant="display-4">{getTranslation('ui', 'sentence_title')}</Text>
          <Text variant="body-2">{sentence}</Text>
        </div>
        <div className={styles.tokens}>
          {tokens.map((token, index) => (
            <div
              key={`${token.surface_form}-${token.basic_form}-${token.pos}-${index}`}
              className={`${styles.token} ${getPosColorClass(token.pos, selectedLanguage)} ${
                selectedTokenIndex === index ? styles.selected : ''
              }`}
              onMouseEnter={() => setSelectedTokenIndex(index)}
              onMouseLeave={() => setSelectedTokenIndex(null)}
              onClick={() => {
                setSelectedTokenIndex(
                  selectedTokenIndex === index ? null : index,
                );

                const query = token.basic_form || token.surface_form;
                if (query) {
                  clearWords();
                  clearKanji();
                  fetchWordsFx({ value: query, language: selectedLanguage }).catch((error) => {
                    console.error(`Failed to fetch word info for ${query}:`, error);
                  });
                }
              }}
            >
              <div className={styles.tokenContent}>
                <span
                  className={`${styles.marker} ${getPosColorClass(token.pos, selectedLanguage)}`}
                />
                <div className={styles.surface}>
                  <Text variant="subheader-3">
                    <FuriganaText
                      surface={token.surface_form}
                      reading={token.reading}
                      show={selectedLanguage === 'jp' ? showFurigana : showPinyin}
                    />
                  </Text>
                  <Text variant="body-2">{token.basic_form}</Text>
                </div>
              </div>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <Text variant="caption-1">{getTranslation('fields', 'pos')}</Text>
                  <Label>{getTranslation('pos', token.pos)}</Label>
                </div>
                {token.pos_detail_1 && (
                  <div className={styles.metaItem}>
                    <Text variant="caption-1">
                      {getTranslation('fields', 'pos_detail_1')}
                    </Text>
                    <Text variant="body-3">
                      {getTranslation('pos_detail_1', token.pos_detail_1)}
                    </Text>
                  </div>
                )}
                {token.conjugated_form && (
                  <div className={styles.metaItem}>
                    <Text variant="caption-1">
                      {getTranslation('fields', 'conjugated_form')}
                    </Text>
                    <Text variant="body-3">{token.conjugated_form}</Text>
                  </div>
                )}
                {token.reading && (
                  <div className={styles.metaItem}>
                    <Text variant="caption-1">
                      {getTranslation('fields', 'reading')}
                    </Text>
                    <Text variant="body-3">{token.reading}</Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className={styles.aiCard}>
        <AIOverviewAccordion
          sentence={sentence}
          tokens={tokens}
          onFetchOverview={handleFetchOverview}
        />
      </Card>
    </>
  );
};
