import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/api/fetchData', () => ({ fetchData: vi.fn() }));

import { fetchData } from '@/shared/api/fetchData';
import { fetchKanji } from './fetchKanji';

const mockFetch = fetchData as ReturnType<typeof vi.fn>;

describe('fetchKanji', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns [] when language is null', async () => {
    expect(await fetchKanji('中国', null, 'ru')).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns [] when no CJK chars in value', async () => {
    expect(await fetchKanji('hello', 'jp', 'ru')).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('cn branch calls hanzi endpoint and maps pinyin', async () => {
    mockFetch.mockResolvedValue({
      character: '中',
      pinyin: 'zhōng',
      meanings: ['middle', 'center'],
      hsk_level: 1,
      traditional: null,
    });

    const result = await fetchKanji('中', 'cn', 'ru');

    expect(mockFetch).toHaveBeenCalledWith('hanzi/%E4%B8%AD?def_lang=ru');
    expect(result).toHaveLength(1);
    expect(result[0].kanji).toBe('中');
    expect(result[0].pinyin).toBe('zhōng');
    expect(result[0].definition).toBe('middle, center');
    expect(result[0].markers).toContain('HSK 1');
  });

  it('cn branch calls hanzi once per unique CJK character', async () => {
    mockFetch.mockResolvedValue({
      character: '国',
      pinyin: 'guó',
      meanings: ['country'],
      hsk_level: 2,
      traditional: '國',
    });

    await fetchKanji('中国', 'cn', 'ru');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith('hanzi/%E4%B8%AD?def_lang=ru');
    expect(mockFetch).toHaveBeenCalledWith('hanzi/%E5%9B%BD?def_lang=ru');
  });

  it('cn branch omits HSK marker when hsk_level is null', async () => {
    mockFetch.mockResolvedValue({
      character: '嗯',
      pinyin: 'ń',
      meanings: ['interjection'],
      hsk_level: null,
      traditional: null,
    });

    const result = await fetchKanji('嗯', 'cn', 'ru');
    expect(result[0].markers).toEqual([]);
  });

  it('cn branch skips characters whose fetch failed', async () => {
    mockFetch
      .mockResolvedValueOnce({
        character: '中',
        pinyin: 'zhōng',
        meanings: ['middle'],
        hsk_level: 1,
        traditional: null,
      })
      .mockRejectedValueOnce(new Error('404'));

    const result = await fetchKanji('中国', 'cn', 'ru');
    expect(result).toHaveLength(1);
    expect(result[0].kanji).toBe('中');
  });

  it('jp branch calls kanji endpoint and maps readings', async () => {
    mockFetch.mockResolvedValue({
      character: '語',
      stroke_count: 14,
      radicals: ['言'],
      components: [
        { character: '言', meanings: ['слово'] },
        { character: '口', meanings: ['рот'] },
        { character: '五', meanings: ['пять'] },
      ],
      on_readings: ['ゴ'],
      kun_readings: ['かた.る', 'かた.らう'],
      meanings: ['язык', 'слово'],
      jlpt_level: 'N5',
    });

    const result = await fetchKanji('語', 'jp', 'ru');

    expect(mockFetch).toHaveBeenCalledWith('kanji/%E8%AA%9E?def_lang=ru');
    expect(result).toHaveLength(1);
    expect(result[0].kanji).toBe('語');
    expect(result[0].onyomi).toBe('ゴ');
    expect(result[0].kunyomi).toBe('かた.る、かた.らう');
    expect(result[0].markers).toContain('JLPT N5');
    expect(result[0].markers).toContain('14 черт');
    expect(result[0].parts).toEqual([
      { piece: '言', definition: 'слово' },
      { piece: '口', definition: 'рот' },
      { piece: '五', definition: 'пять' },
    ]);
    expect(result[0].pinyin).toBeUndefined();
  });
});
