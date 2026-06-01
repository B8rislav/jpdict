import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { TokenRow } from './TokenRow';
import { getPosColorClass } from '../lib/posColor';
import type { SentenceToken } from '@/shared/api/types';
import styles from './SentenceCardView.module.css';

const ariaAttributes = {
  'aria-posinset': 1,
  'aria-setsize': 1,
  role: 'listitem' as const,
};

const rowStyle = { height: 180, width: 200 };

const makePosClass = (lang: 'jp' | 'cn') => (pos: string) =>
  getPosColorClass(pos, lang, styles);

const jpNoun: SentenceToken = {
  surface_form: '学生',
  pos: '名詞',
  pos_detail_1: '一般',
  pos_detail_2: '',
  pos_detail_3: '',
  conjugated_type: '',
  conjugated_form: '',
  basic_form: '学生',
  reading: 'ガクセイ',
};

const jpVerb: SentenceToken = {
  surface_form: '食べる',
  pos: '動詞',
  pos_detail_1: '自立',
  pos_detail_2: '',
  pos_detail_3: '',
  conjugated_type: '一段',
  conjugated_form: '基本形',
  basic_form: '食べる',
  reading: 'タベル',
};

const cnNoun: SentenceToken = {
  surface_form: '中国',
  pos: 'noun',
  pos_detail_1: '',
  pos_detail_2: '',
  pos_detail_3: '',
  conjugated_type: '',
  conjugated_form: '',
  basic_form: '中国',
  reading: 'Zhōngguó',
};

const meta: Meta = {
  title: 'features/TokenRow',
  decorators: [
    (Story) => (
      <div style={{ width: 300, margin: 25 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const JapaneseNoun: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[jpNoun]}
      selectedTokenIndex={null}
      setSelectedTokenIndex={fn()}
      selectedLanguage="jp"
      showFurigana={true}
      showPinyin={false}
      getPosClass={makePosClass('jp')}
      onTokenClick={fn()}
    />
  ),
};

export const JapaneseVerb: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[jpVerb]}
      selectedTokenIndex={null}
      setSelectedTokenIndex={fn()}
      selectedLanguage="jp"
      showFurigana={true}
      showPinyin={false}
      getPosClass={makePosClass('jp')}
      onTokenClick={fn()}
    />
  ),
};

export const ChineseToken: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[cnNoun]}
      selectedTokenIndex={null}
      setSelectedTokenIndex={fn()}
      selectedLanguage="cn"
      showFurigana={false}
      showPinyin={true}
      getPosClass={makePosClass('cn')}
      onTokenClick={fn()}
    />
  ),
};

export const FuriganaShown: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[jpNoun]}
      selectedTokenIndex={null}
      setSelectedTokenIndex={fn()}
      selectedLanguage="jp"
      showFurigana={true}
      showPinyin={false}
      getPosClass={makePosClass('jp')}
      onTokenClick={fn()}
    />
  ),
};

export const FuriganaHidden: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[jpNoun]}
      selectedTokenIndex={null}
      setSelectedTokenIndex={fn()}
      selectedLanguage="jp"
      showFurigana={false}
      showPinyin={false}
      getPosClass={makePosClass('jp')}
      onTokenClick={fn()}
    />
  ),
};

export const Selected: Story = {
  render: () => (
    <TokenRow
      ariaAttributes={ariaAttributes}
      index={0}
      style={rowStyle}
      tokens={[jpNoun]}
      selectedTokenIndex={0}
      setSelectedTokenIndex={fn()}
      selectedLanguage="jp"
      showFurigana={true}
      showPinyin={false}
      getPosClass={makePosClass('jp')}
      onTokenClick={fn()}
    />
  ),
};
