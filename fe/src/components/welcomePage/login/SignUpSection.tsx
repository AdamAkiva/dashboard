/******************************************************************************/

import Template from './GenericSection';

/******************************************************************************/

const SignUpSection = (params: { toggleCb: () => void }) => {
  const { toggleCb } = params;
  return (
    <Template
      titleText={'USER SIGN UP'}
      buttonText={'SIGN UP'}
      ToggleText={'Already signed up to Dashboard? click here to login'}
      toggleCb={toggleCb}
    />
  );
};

export default SignUpSection;
