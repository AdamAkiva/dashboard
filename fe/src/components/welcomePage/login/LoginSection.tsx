/******************************************************************************/

import type { FormField } from '@/types';

import GenericSection from './GenericSection';

/******************************************************************************/

const handleSubmit = (formData: FormData) => {
  const formJson = Object.fromEntries(formData.entries());
  console.log(formJson);
};

const LoginSection = (params: { toggleCb: () => void }) => {
  const { toggleCb } = params;

  const inputFields: FormField[] = [
    { name: 'Email', required: true, type: 'text' },
    { name: 'Password', required: true, type: 'text' }
  ];
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
