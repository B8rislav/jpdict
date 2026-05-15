import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let sentence: string | undefined;
  let tokens: any[] | undefined;

  try {
    const body = await request.json();
    sentence = body.sentence;
    tokens = body.tokens;

    if (!sentence || !tokens) {
      return NextResponse.json(
        { error: 'Необходимо предоставить предложение и токены' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GPT_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API ключ не настроен. Пожалуйста, добавьте NEXT_PUBLIC_GPT_KEY или OPENROUTER_KEY в .env файл.' },
        { status: 500 }
      );
    }

    // Формируем промпт для анализа предложения на русском языке
    const prompt = `Ты — эксперт по японскому языку. Проанализируй следующее предложение и напиши подробный обзор на русском языке.

Предложение: "${sentence}"

Токены (разбор):
${tokens
      .map(
        (token: any, index: number) =>
          `${index + 1}. ${token.surface_form} (${token.basic_form || token.surface_form}) — ${token.pos}${token.pos_detail_1 ? ` (${token.pos_detail_1})` : ''}`,
      )
      .join('\n')}

Пожалуйста, выведи результат в формате:
1. Общий смысл.
2. Грамматическая структура.
3. Словарный состав.
4. Культурные / контекстные заметки.
5. Пример использования.

Пиши только на русском языке.`;
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };
    const payload = {
      "model": "deepseek/deepseek-v4-flash",
      "messages": [
        { role: 'system', content: 'Ты — эксперт по японскому языку. Отвечай на русском языке и избегай ненужной технической терминологии.' },
        { role: 'user', content: prompt },
      ],
      "max_tokens": 900,
      "temperature": 0.5,
    };

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      const overview = createMockOverview(sentence, tokens);
      return NextResponse.json({ overview, warning: 'Используется моковый обзор из-за ошибки OpenRouter.' });
    }

    const data = await response.json();
    const overview = data.choices?.[0]?.message?.content || createMockOverview(sentence, tokens);

    return NextResponse.json({ overview });
  } catch (error) {
    console.error('Error in AI overview API:', error);
    const overview = createMockOverview(sentence || '', tokens || []);
    return NextResponse.json(
      { overview, warning: 'Используется моковый обзор из-за внутренней ошибки сервера.' },
      { status: 200 }
    );
  }
}

function createMockOverview(sentence: string, tokens: any[]) {
  const keyTokens = tokens
    .slice(0, 4)
    .map((token: any) => `- ${token.surface_form} — ${token.basic_form || token.surface_form} (${token.pos})`)
    .join('\n');

  return `
1. Общий смысл:
Предложение "${sentence}" примерно означает простое утверждение или описание ситуации. Оно построено с типичными японскими грамматическими связками и показывает основной смысл через ключевые слова.

2. Грамматическая структура:
В предложении присутствуют основные части речи: ${tokens[0]?.pos || 'существительное'}, глаголы и частицы. Частицы определяют связи между элементами и помогают понять, кто выполняет действие.

3. Словарный состав:
${keyTokens}

4. Культурные / контекстные заметки:
Такой тип предложения часто встречается в бытовой речи или в описаниях. Обратите внимание на частицы и на порядок слов, характерный для японского языка.

5. Пример использования:
- Это предложение может быть использовано в похожем контексте, когда нужно описать что-то простое и привычное.
- Аналогичная конструкция подходит для повседневного общения.`;
}
