import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SavedWord } from '@/shared/api/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'dictionary.json');

function readDictionary(): SavedWord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as SavedWord[];
  } catch {
    return [];
  }
}

function writeDictionary(words: SavedWord[]): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(words, null, 2));
}

export async function GET() {
  return NextResponse.json(readDictionary());
}

export async function POST(req: NextRequest) {
  const word = (await req.json()) as SavedWord;
  const words = readDictionary();

  if (words.find((w) => w.id === word.id)) {
    return NextResponse.json({ error: 'Already saved' }, { status: 409 });
  }

  const saved: SavedWord = { ...word, savedAt: new Date().toISOString(), status: 'new' };
  writeDictionary([...words, saved]);
  return NextResponse.json(saved, { status: 201 });
}
