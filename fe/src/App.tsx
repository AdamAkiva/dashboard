/******************************************************************************/

import styled from 'styled-components';

import Welcome from '@/components/Welcome.tsx';
import Login from '@/components/Login.tsx';

/******************************************************************************/

const Bg = styled.div`
  width: 100%;
  height: 70%;
  padding: 10rem 10rem;
  font-size: 1.5rem;
`;

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: inline-grid;
  grid-template-columns: 3fr 2fr;
`;

const App = () => {
  return (
    <Bg>
      <Grid>
        <Welcome />
        <Login />
      </Grid>
    </Bg>
  );
};

export default App;
