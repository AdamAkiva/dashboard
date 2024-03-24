/******************************************************************************/

import { styled } from '@mui/material';

import { Welcome, Login } from '@/components/welcomePage';

/******************************************************************************/

const WelcomePageBackground = styled('div')`
  font-size: 1.5rem;
  min-width: 900px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WelcomePageStyle = styled('div')`
  display: grid;
  grid-template-columns: 3fr 2fr;
  padding: 3em;
`;

/******************************************************************************/

const WelcomePage = () => {
  return (
    <WelcomePageBackground>
      <WelcomePageStyle>
        <Welcome />
        <Login />
      </WelcomePageStyle>
    </WelcomePageBackground>
  );
};

export default WelcomePage;
