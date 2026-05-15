import * as path from 'path';
import * as kuromoji from 'kuromoji';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sentence = url.searchParams.get('sentence')?.trim() || '';

  if (!sentence) {
    return NextResponse.json({ sentence: '', tokens: [] });
  }

  const dictPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');
  const tokens = await new Promise<kuromoji.IpadicFeatures[]>((resolve, reject) => {
    kuromoji.builder({ dicPath: dictPath }).build((error, tokenizer) => {
      if (error) {
        return reject(error);
      }
      if (!tokenizer) {
        return reject(new Error('Tokenizer build failed'));
      }
      try {
        resolve(tokenizer.tokenize(sentence));
      } catch (tokenizeError) {
        reject(tokenizeError);
      }
    });
  });

  return NextResponse.json({ sentence, tokens });
}
