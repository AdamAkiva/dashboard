/******************************************************************************/

import { useState } from 'react';

import { LoginSection, SignUpSection } from './login';

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
