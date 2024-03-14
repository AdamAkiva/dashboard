/******************************************************************************/

import { React, ReactDOM } from '@/types';

import App from './App.tsx';

import '@/assets/styles/index.css';

/******************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
