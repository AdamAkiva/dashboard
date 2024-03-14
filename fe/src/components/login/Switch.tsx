/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const SwitchStyle = styled.div`
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #9e60b6;
}`;

/******************************************************************************/

const Switch = (params: { text: string; toggle: () => void }) => {
  const { text, toggle } = params;
  return (
    <SwitchStyle
      onClick={() => {
        return toggle();
      }}
    >
      <span>{text}</span>
    </SwitchStyle>
  );
};

export default Switch;
