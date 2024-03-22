/******************************************************************************/

import { styled } from '@mui/material';

/******************************************************************************/

const ButtonStyleWrapper = styled('div')`
  display: flex;
  justify-content: center;
`;

const ButtonStyle = styled('button')`
  background-image: linear-gradient(to right, #b15da3, #939dec 100%);
`;

/******************************************************************************/

type ButtonProps = { text: string };

const Button = ({ text }: ButtonProps) => {
  return (
    <ButtonStyleWrapper>
      <ButtonStyle type="submit">{text}</ButtonStyle>
    </ButtonStyleWrapper>
  );
};

export default Button;
