/******************************************************************************/

import styled from 'styled-components';

import bgImage from '@/assets/img/left-bg.jpg';

/******************************************************************************/

const Greeting = styled.div`
  font-size: 3.5rem;
  margin-top: 7rem;
  margin-bottom: 1rem;
`;

const WelcomeSection = styled.div`
  background-image: url(${bgImage});
  background-repeat: no-repeat;
  background-size: cover;
  padding-left: 5rem;
`;

/******************************************************************************/

const Welcome = () => {
  return (
    <WelcomeSection>
      <Greeting>Welcome to Dashboard</Greeting>
      <div> Here will be a description of the website.</div>
    </WelcomeSection>
  );
};

export default Welcome;
