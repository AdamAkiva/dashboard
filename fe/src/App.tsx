/******************************************************************************/

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Router } from '@/router';

/******************************************************************************/

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins'
  }
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
};

export default App;
