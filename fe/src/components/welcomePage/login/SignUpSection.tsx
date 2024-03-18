/******************************************************************************/

import type { FormField, OnToggleClickCb } from '@/types';

import GenericSection from './GenericSection';

/******************************************************************************/

const handleSubmit = (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  console.log(formJson);
};

const inputFields: FormField[] = [
  { name: 'First Name', required: true, type: 'text' },
  { name: 'Last Name', required: true, type: 'text' },
  { name: 'Email', required: true, type: 'text' },
  { name: 'Password', required: true, type: 'password' },
  { name: 'Confirm Password', required: true, type: 'password' },
  { name: 'Phone', required: false, type: 'text' },
  { name: 'Address', required: false, type: 'text' },
  {
    name: 'Gender',
    required: false,
    type: 'dropdown',
    options: ['Male', 'Female', 'Other']
  }
];

/******************************************************************************/

type SignUpSectionProps = { toggleCb: OnToggleClickCb };

const SignUpSection = ({ toggleCb }: SignUpSectionProps) => {
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
