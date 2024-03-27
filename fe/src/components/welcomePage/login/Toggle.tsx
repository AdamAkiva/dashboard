/******************************************************************************/

import { styled } from '@mui/material';

import type { KeyboardEventHandler } from 'react';

import type { OnToggleClickCb } from '@/types';

/******************************************************************************/

const ToggleStyle = styled('button')`
  margin-top: 2rem;
  color: #9e60b6;
  padding: 0 1em;
}`;

/******************************************************************************/

type ToggleProps = {
  text: string;
  toggleCb: OnToggleClickCb;
  handleTabKeyDown: KeyboardEventHandler<HTMLButtonElement>;
};

const Toggle = ({ text, toggleCb, handleTabKeyDown }: ToggleProps) => {
  return (
    <ToggleStyle onClick={toggleCb} onKeyDown={handleTabKeyDown}>
      {text}
    </ToggleStyle>
  );
};

export default Toggle;
