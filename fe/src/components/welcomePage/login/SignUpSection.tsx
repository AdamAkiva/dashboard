/******************************************************************************/

import {
  AlternateEmail,
  Badge,
  ContactPhone,
  Home,
  Lock,
  Wc
} from '@mui/icons-material';

import type { FormField, OnToggleClickCb } from '@/types';

import GenericSection from './GenericSection';

/******************************************************************************/

const handleSubmit = (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  console.log(formJson);
};

const inputFields: FormField[] = [
  { name: 'First Name', required: true, type: 'text', icon: <Badge /> },
  { name: 'Last Name', required: true, type: 'text', icon: <Badge /> },
  { name: 'Email', required: true, type: 'email', icon: <AlternateEmail /> },
  { name: 'Password', required: true, type: 'password', icon: <Lock /> },
  {
    name: 'Confirm Password',
    required: true,
    type: 'password',
    icon: <Lock />
  },
  { name: 'Phone', required: false, type: 'tel', icon: <ContactPhone /> },
  { name: 'Address', required: false, type: 'text', icon: <Home /> },
  {
    name: 'Gender',
    required: false,
    type: 'dropdown',
    options: ['Male', 'Female', 'Other'],
    icon: <Wc />
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
