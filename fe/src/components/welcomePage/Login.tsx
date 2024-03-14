/******************************************************************************/

import { useState } from 'react';

import { LoginSection, SignUpSection } from './login';

/******************************************************************************/

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <LoginSection toggleCb={handleToggle} />
      ) : (
        <SignUpSection toggleCb={handleToggle} />
      )}
    </>
  );
};

export default Login;
