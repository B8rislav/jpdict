import { SentenceToken } from './fetchSentence';

export type AIOverviewResponse = {
  overview: string;
};

export async function fetchAIOverview(sentence: string, tokens: SentenceToken[]): Promise<string> {
  try {
    const response = await fetch('/api/ai-overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence, tokens }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `AI overview request failed: ${response.status}`);
    }

    const data: AIOverviewResponse = await response.json();
    return data.overview;
  } catch (error) {
    console.error('Failed to fetch AI overview:', error);
    throw error;
  }
}