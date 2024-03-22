/******************************************************************************/

import { styled } from '@mui/material';

/******************************************************************************/

const TitleStyle = styled('div')`
  margin-top: 12rem;
  display: flex;
  justify-content: center;
`;

/******************************************************************************/

type TitleProps = { text: string };

const Title = ({ text }: TitleProps) => {
  return <TitleStyle>{text}</TitleStyle>;
};

export default Title;
