/******************************************************************************/

import { styled } from '@mui/material';

import { Welcome, Login } from '@/components/welcomePage';

/******************************************************************************/

const WelcomePageBackground = styled('div')`
  font-size: 1.5rem;
  padding: 10rem 10rem;
  overflow: auto;
  min-width: 800px;
`;

const WelcomePageStyle = styled('div')`
  width: 100%;
  height: 100%;
  display: inline-grid;
  grid-template-columns: 3fr 2fr;
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
