/******************************************************************************/

import Template from './GenericSection';

/******************************************************************************/

const SignUpSection = (params: { toggle: () => void }) => {
  const { toggle } = params;
  return (
    <Template
      titleText={'USER SIGN UP'}
      buttonText={'SIGN UP'}
      switchText={'Already signed up to Dashboard? click here to login'}
      toggleCb={toggle}
    />
  );
};

export default SignUpSection;
