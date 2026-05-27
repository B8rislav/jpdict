import ru from './ru.json';

type Dict = typeof ru;

export const t = <C extends keyof Dict>(category: C, key: string): string =>
  (ru[category] as Record<string, string>)?.[key] ?? key;
