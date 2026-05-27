export const getPosColorClass = (
  pos: string,
  language: 'jp' | 'cn' | null,
  styles: Record<string, string>,
): string => {
  if (language === 'cn') {
    if (pos === 'r' || pos === 'rr' || pos === 'rz' || pos === 'rg') return styles.pronoun;
    if (pos.startsWith('v')) return styles.verb;
    if (pos.startsWith('n')) return styles.noun;
    if (pos === 'a' || pos === 'ad' || pos === 'an' || pos === 'ag' || pos === 'b')
      return styles.adjective;
    if (pos === 'd' || pos === 'dg' || pos === 'df' || pos === 'z' || pos === 'zg')
      return styles.adverb;
    if (pos === 'p' || pos.startsWith('u') || pos === 'y') return styles.particle;
    if (pos === 'c') return styles.auxiliary;
    return styles.other;
  }
  switch (pos) {
    case '助詞':
      return styles.particle;
    case '名詞':
      return styles.noun;
    case '動詞':
      return styles.verb;
    case '形容詞':
      return styles.adjective;
    case '助動詞':
      return styles.auxiliary;
    case '副詞':
      return styles.adverb;
    default:
      return styles.other;
  }
};
