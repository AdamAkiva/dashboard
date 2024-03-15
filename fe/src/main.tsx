/******************************************************************************/

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

import '@/assets/styles/index.css';

/******************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
