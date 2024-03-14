/******************************************************************************/
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WelcomePage } from '@/views';
/******************************************************************************/

const WelcomePageRoute = () => {
  return <WelcomePage />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<WelcomePageRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
