import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MasteryStatus, SavedWord } from '@/shared/api/types';

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const words = readDictionary();
  writeDictionary(words.filter((w) => w.id !== id));
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { status } = (await req.json()) as { status: MasteryStatus };
  const words = readDictionary();
  const updated = words.map((w) => (w.id === id ? { ...w, status } : w));
  writeDictionary(updated);
  const word = updated.find((w) => w.id === id);
  if (!word) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(word);
}
