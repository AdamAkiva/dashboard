/******************************************************************************/

import type { FormEvent } from 'react';
import styled from 'styled-components';

import type { FormField } from '@/types';

import Title from './Title';
import Toggle from './Toggle';
import Button from './Button';
import FormFields from './FormFields';

/******************************************************************************/

const GenericSectionStyle = styled.div`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  padding: 0 1em;
`;

/******************************************************************************/

const handleSubmit = (
  e: FormEvent<HTMLFormElement>,
  submitCb: (formData: FormData) => void
) => {
  e.preventDefault();

  const form = e.target as HTMLFormElement;

  submitCb(new FormData(form));
};

const GenericSection = (params: {
  titleText: string;
  buttonText: string;
  toggleText: string;
  inputFields: FormField[];
  toggleCb: () => void;
  submitCb: (formData: FormData) => void;
}) => {
  const { titleText, buttonText, toggleText, inputFields, toggleCb, submitCb } =
    params;
  return (
    <GenericSectionStyle>
      <div>
        <Title text={titleText} />
        <Form
          method="post"
          onSubmit={(e) => {
            handleSubmit(e, submitCb);
          }}
        >
          <FormFields inputFields={inputFields} />
          <Button text={buttonText} />
        </Form>
        <Toggle text={toggleText} toggleCb={toggleCb} />
      </div>
    </GenericSectionStyle>
  );
};

export default GenericSection;
