/******************************************************************************/

import { AlternateEmail, LockOpen } from '@mui/icons-material';

import type { FormField, OnToggleClickCb } from '@/types';

import GenericSection from './GenericSection';

/******************************************************************************/

const handleSubmit = (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  console.log(formJson);
};

const inputFields: FormField[] = [
  { name: 'Email', required: true, type: 'text', icon: <AlternateEmail /> },
  {
    name: 'Password',
    required: true,
    type: 'password',
    icon: <LockOpen />
  }
];

/******************************************************************************/

type LoginSectionProps = { toggleCb: OnToggleClickCb };

const LoginSection = ({ toggleCb }: LoginSectionProps) => {
  return (
    <GenericSection
      titleText={'USER LOGIN'}
      buttonText={'LOGIN'}
      toggleText={'New to Dashboard? click here to sign up'}
      inputFields={inputFields}
      toggleCb={toggleCb}
      submitCb={handleSubmit}
    />
  );
};

export default LoginSection;
