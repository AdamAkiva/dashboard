/******************************************************************************/

import type { inputField } from '@/types';

import GenericSection from './GenericSection';

/******************************************************************************/

const handleSubmit = (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  console.log(formJson);
};

const SignUpSection = (params: { toggleCb: () => void }) => {
  const { toggleCb } = params;

  const inputFields: inputField[] = [
    { name: 'First Name', required: true },
    { name: 'Last Name', required: true },
    { name: 'Email', required: true },
    { name: 'Password', required: true, isPassword: true },
    { name: 'Confirm Password', required: true, isPassword: true },
    { name: 'Phone', required: false },
    { name: 'Address', required: false },
    { name: 'Gender', required: false }
  ];

  return (
    <GenericSection
      titleText={'USER SIGN UP'}
      buttonText={'SIGN UP'}
      toggleText={'Already signed up to Dashboard? click here to login'}
      inputFields={inputFields}
      toggleCb={toggleCb}
      submitCb={handleSubmit}
    />
  );
};

export default SignUpSection;
