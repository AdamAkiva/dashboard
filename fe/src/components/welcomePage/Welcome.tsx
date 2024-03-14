/******************************************************************************/

import styled from 'styled-components';

import bgImage from '@/assets/img/left-bg.jpg';

/******************************************************************************/

const GreetingStyle = styled.div`
  font-size: 3.5rem;
  margin-top: 7rem;
  margin-bottom: 1rem;
`;

const WelcomeStyle = styled.div`
  background-image: url(${bgImage});
  background-repeat: no-repeat;
  background-size: cover;
  padding-left: 5rem;
`;

/******************************************************************************/

const Welcome = () => {
  return (
    <WelcomeStyle>
      <GreetingStyle>Welcome to Dashboard</GreetingStyle>
      <div> Here will be a description of the website.</div>
    </WelcomeStyle>
  );
};

export default Welcome;
