// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Only these files may reach for global state. Everything else under
 * `src/features` and `src/shared` receives what it needs as props.
 *
 * This is a *whitelist*, deliberately. The previous rule denied
 * `effector-react` inside `**\/ui/**`, which any component could escape simply
 * by not living in a `ui/` folder — and five of them did (WordInspector at 177
 * lines, AuthModal, DictionaryPanel, LanguageSelect, AuthGate), which is
 * exactly the set that had no Storybook coverage. A whitelist can't be dodged
 * by choosing a filename.
 */
const STATEFUL_FILES = [
  // One container per feature, named after the feature: src/features/Search/Search.tsx
  "src/features/*/*.tsx",
  // Nested single-component folders: src/features/Dictionary/DictionaryWordCard/DictionaryWordCard.tsx
  "src/features/*/*/[A-Z]*.tsx",
  // The profile context provider is the state bridge itself.
  "src/shared/profile/**/*.tsx",
];

const NO_GLOBAL_STATE = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["effector-react", "effector"],
          message:
            "Views must not subscribe to stores. Take the data as a prop from the feature's container.",
        },
        {
          group: ["@/stores/*", "**/stores/*"],
          message:
            "Views must not import stores. Take the data as a prop from the feature's container.",
        },
      ],
    },
  ],
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // View/model boundary, enforced by exclusion rather than by path.
  //
  // Scoped to `.tsx` only: a plain `.ts` file is a model, mapper, or util, not
  // a view, and some of them legitimately build on effector (see
  // `shared/utils/logEffectFailures.ts`). The thing being prevented is a
  // *component* subscribing to global state behind its props.
  {
    files: ["src/features/**/*.tsx", "src/shared/**/*.tsx"],
    ignores: [...STATEFUL_FILES, "**/*.stories.tsx", "**/*.test.tsx"],
    rules: NO_GLOBAL_STATE,
  },
  // Containers and pages hold logic, so they get a size budget instead. The
  // working examples cluster at 12–70 lines; page.tsx was 224 before the nav
  // came out of it. Over budget means there's a view waiting to be extracted.
  {
    files: ["src/features/*/*.tsx", "src/app/**/page.tsx", "src/app/**/layout.tsx"],
    ignores: ["**/*.stories.tsx"],
    rules: {
      "max-lines": [
        "error",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    ignores: ["**/*.stories.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/[А-Яа-яёЁ]/]",
          message: "Hardcoded Cyrillic string. Use t() from @/shared/i18n instead.",
        },
      ],
    },
  },
  ...compat.extends("prettier"),
];

export default eslintConfig;
