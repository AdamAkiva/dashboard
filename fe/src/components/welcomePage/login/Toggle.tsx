/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const ToggleStyle = styled.div`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #9e60b6;
  display: flex;
  padding: 0 1em;
  
  &:hover {
    cursor: pointer;
  }
}`;
/******************************************************************************/

const Toggle = (params: { text: string; toggleCb: () => void }) => {
  const { text, toggleCb } = params;
  return (
    <ToggleStyle
      onClick={() => {
        return toggleCb();
      }}
    >
      {text}
    </ToggleStyle>
  );
};

export default Toggle;
