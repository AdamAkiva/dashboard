/******************************************************************************/

import type { FormEvent } from 'react';
import styled from 'styled-components';

import type { inputField } from '@/types';

import Title from './Title';
import Toggle from './Toggle';
import Button from './Button';
import Fields from './Fields';

/******************************************************************************/

const GenericSectionStyle = styled.div`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  justify-content: center;
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
  inputFields: inputField[];
  toggleCb: () => void;
  submitCb: (formData: FormData) => void;
}) => {
  const { titleText, buttonText, toggleText, inputFields, toggleCb, submitCb } =
    params;
  return (
    <GenericSectionStyle>
      <div>
        <Title text={titleText} />
        <form
          method="post"
          onSubmit={(e) => {
            handleSubmit(e, submitCb);
          }}
        >
          <Fields inputFields={inputFields} />
          <Button text={buttonText} />
        </form>
        <Toggle text={toggleText} toggleCb={toggleCb} />
      </div>
    </GenericSectionStyle>
  );
};

export default GenericSection;
