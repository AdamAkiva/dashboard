/******************************************************************************/

import { styled } from '@mui/material';

import type { OnToggleClickCb } from '@/types';

/******************************************************************************/

const ToggleStyle = styled('button')`
  margin-top: 2rem;
  color: #9e60b6;
  display: flex;
  padding: 0 1em;
}`;
/******************************************************************************/

type ToggleProps = { text: string; toggleCb: OnToggleClickCb };

const Toggle = ({ text, toggleCb }: ToggleProps) => {
  return <ToggleStyle onClick={toggleCb}>{text}</ToggleStyle>;
};

export default Toggle;
