/******************************************************************************/

import Template from './GenericSection';

/******************************************************************************/

const LoginSection = (params: { toggle: () => void }) => {
  const { toggle } = params;
  return (
    <Template
      titleText={'USER LOGIN'}
      buttonText={'LOGIN'}
      switchText={'New to Dashboard? click here to sign up'}
      toggleCb={toggle}
    />
  );
};

export default LoginSection;
