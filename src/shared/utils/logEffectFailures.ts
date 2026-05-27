import { type Effect } from 'effector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logEffectFailures(fx: Effect<any, any, any>, label: string): void {
  fx.fail.watch(({ params, error }) => console.error(`Failed to fetch ${label}:`, params, error));
}
