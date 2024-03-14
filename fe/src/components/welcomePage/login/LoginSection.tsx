/******************************************************************************/

import Template from './GenericSection';

/******************************************************************************/

const LoginSection = (params: { toggleCb: () => void }) => {
  const { toggleCb } = params;
  return (
    <Template
      titleText={'USER LOGIN'}
      buttonText={'LOGIN'}
      ToggleText={'New to Dashboard? click here to sign up'}
      toggleCb={toggleCb}
    />
  );
};

export default LoginSection;
