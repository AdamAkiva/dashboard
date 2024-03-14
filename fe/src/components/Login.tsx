/******************************************************************************/

import { useState } from 'react';

import LoginSection from './login/LoginSection';
import SignUpSection from './login/SignUpSection';

/******************************************************************************/

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <LoginSection toggle={toggle} />
      ) : (
        <SignUpSection toggle={toggle} />
      )}
    </>
  );
};

export default Login;
