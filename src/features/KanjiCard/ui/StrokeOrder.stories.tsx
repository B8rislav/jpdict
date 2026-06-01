import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StrokeOrder } from './StrokeOrder';

// Codepoint helpers
// 日 → U+65E5 → hex 65e5 → padded 5 chars: 065e5
const KANJI_日_KEY = 'stroke_order_065e5';
// 㐀 → U+3400 → hex 3400 → padded: 03400  (rare char, no KanjiVG data)
const KANJI_RARE_KEY = 'stroke_order_03400';
// 花 → U+82B1 → hex 82b1 → padded: 082b1  (used for Loading — don't pre-cache)
const KANJI_花_KEY = 'stroke_order_082b1';

// Minimal SVG approximating 日 for offline use
const SVG_日 = `<svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
  <g style="fill:none;stroke:#000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;">
    <line x1="22" y1="13" x2="87" y2="13"/>
    <line x1="22" y1="13" x2="22" y2="96"/>
    <line x1="87" y1="13" x2="87" y2="96"/>
    <line x1="22" y1="45" x2="87" y2="45"/>
    <line x1="22" y1="96" x2="87" y2="96"/>
  </g>
</svg>`;

const meta: Meta<typeof StrokeOrder> = {
  title: 'features/StrokeOrder',
  component: StrokeOrder,
  decorators: [
    (Story) => (
      <div style={{ width: 200, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StrokeOrder>;

export const WithSvg: Story = {
  args: { kanji: '日' },
  loaders: [
    () => {
      sessionStorage.setItem(KANJI_日_KEY, SVG_日);
      return {};
    },
  ],
};

export const MissingSvg: Story = {
  args: { kanji: '㐀' },
  loaders: [
    () => {
      // Pre-populate as NOT_FOUND so the component immediately renders null (no crash)
      sessionStorage.setItem(KANJI_RARE_KEY, 'NOT_FOUND');
      return {};
    },
  ],
  decorators: [
    (Story) => (
      <>
        <p style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>
          No SVG available — component renders nothing (expected).
        </p>
        <Story />
      </>
    ),
  ],
};

export const Loading: Story = {
  args: { kanji: '花' },
  beforeEach: () => {
    sessionStorage.removeItem(KANJI_花_KEY);
    const orig = window.fetch;
    // Never-resolving fetch keeps the component in its pending state
    window.fetch = () => new Promise(() => {});
    return () => {
      window.fetch = orig;
    };
  },
  decorators: [
    (Story) => (
      <>
        <p style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>
          Fetch is pending — component renders nothing until data arrives.
        </p>
        <Story />
      </>
    ),
  ],
};
