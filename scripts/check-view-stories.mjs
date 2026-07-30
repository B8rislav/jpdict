#!/usr/bin/env node
/**
 * Every view component must have a Storybook story beside it.
 *
 * The point of the container/view split is that views are renderable in
 * isolation — a view with no story is an untested view, and that's precisely
 * what the old path-based lint rule failed to prevent. ESLint can't express
 * "a sibling file must exist", so this runs as its own check.
 *
 * Usage: node scripts/check-view-stories.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src/features', 'src/shared/ui', 'src/app/ui'];

/** Views that legitimately have nothing to show on their own. */
const EXEMPT = new Set([
  'src/app/ui/JsonLd.tsx', // renders a <script> tag, no visual output
  'src/app/ui/ThemeProvider.tsx', // pure provider
  'src/shared/ui/Pressable/Pressable.tsx', // behaviour-only wrapper
]);

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const missing = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!file.endsWith('.tsx')) continue;
    if (file.endsWith('.stories.tsx') || file.endsWith('.test.tsx')) continue;

    // A "view" is any component under a ui/ folder.
    const isView = file.split(/[\\/]/).includes('ui');
    if (!isView) continue;

    const normalized = relative('.', file).split('\\').join('/');
    if (EXEMPT.has(normalized)) continue;

    const story = file.replace(/\.tsx$/, '.stories.tsx');
    try {
      statSync(story);
    } catch {
      missing.push(normalized);
    }
  }
}

if (missing.length > 0) {
  console.error(`\n${missing.length} view component(s) have no story:\n`);
  for (const file of missing) console.error(`  ${file}`);
  console.error(
    '\nAdd a *.stories.tsx beside each, or add it to EXEMPT in ' +
      'scripts/check-view-stories.mjs with a reason.\n',
  );
  process.exit(1);
}

console.log('✔ Every view component has a story.');
