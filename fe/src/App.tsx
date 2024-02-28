import '@/assets/styles/App.css';

import Welcome from '@/components/Welcome.tsx';
import Login from '@/components/Login.tsx';

/******************************************************************************/

const App = () => {
  return (
    <div className="grid-design">
      <Welcome />
      <Login />
    </div>
  );
};

export default App;
