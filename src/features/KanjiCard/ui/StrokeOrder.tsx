'use client';

import { FC, useEffect, useState } from 'react';
import { Text } from '@gravity-ui/uikit';

type StrokeOrderProps = {
  kanji: string;
};

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji';

function getCodepoint(char: string): string {
  return (char.codePointAt(0) ?? 0).toString(16).padStart(5, '0');
}

export const StrokeOrder: FC<StrokeOrderProps> = ({ kanji }) => {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    const codepoint = getCodepoint(kanji);
    const cacheKey = `stroke_order_${codepoint}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setSvg(cached === 'NOT_FOUND' ? null : cached);
      return;
    }

    const url = `${CDN_BASE}/${codepoint}.svg`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.text();
      })
      .then((text) => {
        sessionStorage.setItem(cacheKey, text);
        setSvg(text);
      })
      .catch(() => {
        sessionStorage.setItem(cacheKey, 'NOT_FOUND');
        setSvg(null);
      });
  }, [kanji]);

  if (svg === null) return null;

  return (
    <div>
      <Text variant="subheader-3">Порядок черт</Text>
      <div
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ width: 109, height: 109 }}
      />
    </div>
  );
};
