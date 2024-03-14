/******************************************************************************/

import styled from 'styled-components';

/******************************************************************************/

const TitleStyle = styled.div`
  margin-top: 11rem;
  display: flex;
  justify-content: center;
`;

/******************************************************************************/

const Title = (params: { text: string }) => {
  const { text } = params;
  return <TitleStyle>{text}</TitleStyle>;
};

export default Title;
