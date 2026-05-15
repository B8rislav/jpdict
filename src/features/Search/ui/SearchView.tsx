import { Button, TextInput } from '@gravity-ui/uikit';
import { Dispatch, FC, MouseEventHandler, SetStateAction, useRef } from 'react';

import styles from './SearchView.module.css';

type SearchViewProps = {
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  onButtonClick: MouseEventHandler;
  placeholder?: string;
};

export const SearchView: FC<SearchViewProps> = (props) => {
  const { inputValue, setInputValue, onButtonClick, placeholder } = props;
  const button = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.search}>
      <div className={styles.input}>
        <TextInput
          type="search"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              button.current?.click();
            }
          }}
        />
      </div>
      <Button view="action" ref={button} onClick={onButtonClick}>
        Search
      </Button>
    </div>
  );
};
