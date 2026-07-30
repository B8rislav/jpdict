/**
 * JLPT/HSK proficiency levels arrive as separate nullable integers and are
 * rendered as marker chips. Shared because vocabulary and review cards both
 * carry them and had drifted into separate copies of this logic.
 */

export function levelMarkers(jlptLevel?: number | null, hskLevel?: number | null): string[] {
  const markers: string[] = [];
  if (jlptLevel) markers.push(`JLPT N${jlptLevel}`);
  if (hskLevel) markers.push(`HSK ${hskLevel}`);
  return markers;
}

const JLPT_PREFIX = 'JLPT N';
const HSK_PREFIX = 'HSK ';

/** Inverse of `levelMarkers` — parse chips back into the backend's integers. */
export function parseLevelMarkers(markers: string[] | undefined): {
  jlpt_level: number | null;
  hsk_level: number | null;
} {
  const parseAfter = (prefix: string) => {
    const match = markers?.find((marker) => marker.startsWith(prefix));
    if (!match) return null;
    return Number.parseInt(match.slice(prefix.length), 10) || null;
  };

  return { jlpt_level: parseAfter(JLPT_PREFIX), hsk_level: parseAfter(HSK_PREFIX) };
}
