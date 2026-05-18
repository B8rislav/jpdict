import { SentenceToken } from './fetchSentence';

export async function fetchAIOverview(
  sentence: string,
  tokens: SentenceToken[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch('/api/ai-overview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentence, tokens }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI overview request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const json = JSON.parse(data) as { content?: string };
          if (json.content) onChunk(json.content);
        } catch {}
      }
    }
  } finally {
    reader.releaseLock();
  }
}
