/******************************************************************************/

import { useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { styled } from '@mui/material';

import type { FormField, OnToggleClickCb } from '@/types';

import Title from './Title';
import Toggle from './Toggle';
import Button from './Button';
import FormFields from './FormFields';

/******************************************************************************/

const GenericSectionStyle = styled('div')`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 3em;
  height: 18em;
`;

const Form = styled('form')`
  padding: 0 1em;
`;

/******************************************************************************/

type OnSubmitFormCb = (formData: FormData) => void;

type GenericSectionProps = {
  titleText: string;
  buttonText: string;
  toggleText: string;
  inputFields: FormField[];
  toggleCb: OnToggleClickCb;
  submitCb: OnSubmitFormCb;
};

/******************************************************************************/

const handleSubmit = (
  e: FormEvent<HTMLFormElement>,
  submitCb: OnSubmitFormCb
) => {
  e.preventDefault();

  const form = e.target as HTMLFormElement;

  submitCb(new FormData(form));
};

const handleTabKeyDown = (
  e: KeyboardEvent<HTMLButtonElement>,
  firstInput: HTMLInputElement
) => {
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault();

    firstInput.focus();
  }
};

/******************************************************************************/

const GenericSection = ({
  titleText,
  buttonText,
  toggleText,
  inputFields,
  toggleCb,
  submitCb
}: GenericSectionProps) => {
  const formRef = useRef<HTMLFormElement>(null!);
  const firstInputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    // Focus on the first input field when the component mounts
    firstInputRef.current = formRef.current.querySelector('input')!;
    firstInputRef.current.focus();
  }, []);

  return (
    <GenericSectionStyle>
      <Title text={titleText} />
      <Form
        method="post"
        onSubmit={(e) => {
          handleSubmit(e, submitCb);
        }}
        ref={formRef}
      >
        <FormFields inputFields={inputFields} />
        <Button text={buttonText} />
      </Form>
      <Toggle
        text={toggleText}
        toggleCb={toggleCb}
        handleTabKeyDown={(e) => {
          return handleTabKeyDown(e, firstInputRef.current);
        }}
      />
    </GenericSectionStyle>
  );
};

export default GenericSection;
