/******************************************************************************/

import { useMemo } from 'react';

import { Input, InputAdornment, styled, css } from '@mui/material';

import type { FormField } from '@/types';

import SelectField from './SelectField';

/******************************************************************************/

const FieldsStyle = styled('div')`
  display: grid;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 6em;
`;

const FieldStyle = styled('div')`
  padding: 0 0.5em;
`;

const fieldInnerCss = css`
  height: 2.5rem;
  width: 18rem;
  margin-bottom: 1rem;
  background-color: rgba(114, 130, 214, 0.46);
  border-radius: 10px;
  padding: 0 1rem;
`;

const StyledInput = styled(Input)`
  ${fieldInnerCss}
`;

/******************************************************************************/

const renderField = (field: FormField) => {
  if (field.type !== 'dropdown') {
    return (
      <StyledInput
        required={field.required}
        name={field.name}
        placeholder={field.name}
        type={field.type}
        startAdornment={
          <InputAdornment position="start">{field.icon}</InputAdornment>
        }
      />
    );
  }
  return <SelectField field={field} style={fieldInnerCss} />;
};

/******************************************************************************/

type FieldsProps = { inputFields: FormField[] };

const Fields = ({ inputFields }: FieldsProps) => {
  const renderedFields = useMemo(() => {
    return inputFields.map((field) => {
      return <FieldStyle key={field.name}>{renderField(field)}</FieldStyle>;
    });
  }, [inputFields]);

  return <FieldsStyle>{renderedFields}</FieldsStyle>;
};

export default Fields;
