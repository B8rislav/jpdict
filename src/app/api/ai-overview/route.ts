export const runtime = 'nodejs';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
};

interface AiToken {
  surface_form: string;
  basic_form?: string;
  pos: string;
  pos_detail_1?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function textToSSEStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

function detectLanguage(tokens: AiToken[]): 'cn' | 'jp' {
  return tokens.some(t => /[一-鿿]/.test(t.surface_form) && !t.pos.includes('助')) ? 'cn' : 'jp';
}

function buildMessages(sentence: string, tokens: AiToken[], lang: 'cn' | 'jp') {
  const langLabel = lang === 'cn' ? 'китайскому' : 'японскому';
  const system = `Ты — эксперт по ${langLabel} языку. Отвечай на русском языке и избегай ненужной технической терминологии.`;
  const user = `Ты — эксперт по ${langLabel} языку. Проанализируй следующее предложение и напиши подробный обзор на русском языке.

Предложение: "${sentence}"

Токены (разбор):
${tokens
    .map((t, i) => `${i + 1}. ${t.surface_form} (${t.basic_form || t.surface_form}) — ${t.pos}${t.pos_detail_1 ? ` (${t.pos_detail_1})` : ''}`)
    .join('\n')}

Пожалуйста, выведи результат в формате:
1. Общий смысл.
2. Грамматическая структура.
3. Словарный состав.
4. Культурные / контекстные заметки.
5. Пример использования.

Пиши только на русском языке.`;
  return { system, user };
}

function pipeOpenRouterStream(upstream: ReadableStream): ReadableStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
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
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              return;
            }
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {}
          }
        }

        // Flush any remaining content if stream ended without [DONE]
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

function createMockOverview(sentence: string, tokens: AiToken[]): string {
  const keyTokens = tokens
    .slice(0, 4)
    .map(t => `- ${t.surface_form} — ${t.basic_form || t.surface_form} (${t.pos})`)
    .join('\n');
  return `
1. Общий смысл:
Предложение "${sentence}" примерно означает простое утверждение или описание ситуации.

2. Грамматическая структура:
В предложении присутствуют основные части речи: ${tokens[0]?.pos || 'существительное'}, глаголы и частицы.

3. Словарный состав:
${keyTokens}

4. Культурные / контекстные заметки:
Такой тип предложения часто встречается в бытовой речи или в описаниях.

5. Пример использования:
- Аналогичная конструкция подходит для повседневного общения.`;
}

// ── route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let sentence: string | undefined;
  let tokens: AiToken[] | undefined;

  try {
    const body = await request.json() as { sentence?: string; tokens?: AiToken[] };
    sentence = body.sentence;
    tokens = body.tokens;

    if (!sentence || !tokens) {
      return new Response(
        JSON.stringify({ error: 'Необходимо предоставить предложение и токены' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey) {
      return new Response(textToSSEStream(createMockOverview(sentence, tokens)), { headers: SSE_HEADERS });
    }

    const lang = detectLanguage(tokens);
    const { system, user } = buildMessages(sentence, tokens, lang);

    const upstreamResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-v4-flash',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        max_tokens: 5000,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorText = await upstreamResponse.text().catch(() => '');
      console.error('OpenRouter API error:', upstreamResponse.status, errorText);
      return new Response(textToSSEStream(createMockOverview(sentence, tokens)), { headers: SSE_HEADERS });
    }

    return new Response(pipeOpenRouterStream(upstreamResponse.body), { headers: SSE_HEADERS });
  } catch (error) {
    console.error('Error in AI overview API:', error);
    return new Response(
      textToSSEStream(createMockOverview(sentence ?? '', tokens ?? [])),
      { headers: SSE_HEADERS },
    );
  }
}
