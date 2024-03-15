/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const ButtonStyleWrapper = styled.div`
  display: flex;
  justify-content: center;
}`;

const ButtonStyle = styled.button`
  background-image: linear-gradient(to right, #b15da3, #939dec 100%);
`;

/******************************************************************************/

const Button = (params: { text: string }) => {
  const { text } = params;
  return (
    <ButtonStyleWrapper>
      <ButtonStyle type="submit">{text}</ButtonStyle>
    </ButtonStyleWrapper>
  );
};

export default Button;
