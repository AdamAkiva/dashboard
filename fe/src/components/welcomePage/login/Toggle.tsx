/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const ToggleStyle = styled.div`
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #9e60b6;
  display: flex;
  padding: 0 1em;
  
  &:hover {
    cursor: pointer;
  }
}`;
/******************************************************************************/

type ToggleProps = { text: string; toggleCb: () => void };

const Toggle = ({ text, toggleCb }: ToggleProps) => {
  return <ToggleStyle onClick={toggleCb}>{text}</ToggleStyle>;
};

export default Toggle;
