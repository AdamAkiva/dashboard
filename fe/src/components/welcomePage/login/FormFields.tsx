/******************************************************************************/

import styled, { css } from 'styled-components';

import type { FormField } from '@/types';

/******************************************************************************/

const FieldsStyle = styled.div`
  display: grid;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: black;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 6em;
`;

const FieldStyle = styled.div`
  padding: 0 0.5em;
`;

const FieldCss = css`
  height: 2.5rem;
  width: 17rem;
  margin-bottom: 1rem;
  background-color: rgba(114, 130, 214, 0.46);
  border-radius: 10px;
  border: transparent;
  outline: none;
  color: black;
  font-size: 1rem;
  padding: 0 1rem;
`;

const Input = styled.input`
  ${FieldCss}
`;

const Select = styled.select`
  ${FieldCss}
  width: 19rem;
  color: #827675;
`;

/******************************************************************************/

const Fields = (params: { inputFields: FormField[] }) => {
  const { inputFields } = params;
  return (
    <FieldsStyle>
      {inputFields.map((field) => {
        return (
          <FieldStyle key={field.name}>
            {field.type !== 'dropdown' ? (
              <Input
                required={field.required}
                name={field.name}
                placeholder={field.name}
                type={field.type}
              />
            ) : (
              <Select
                defaultValue={field.name}
                name={field.name}
                key={field.name}
              >
                <option value={field.name} disabled={true}>
                  {field.name}
                </option>
                {field.options.map((option) => {
                  return (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  );
                })}
              </Select>
            )}
          </FieldStyle>
        );
      })}
    </FieldsStyle>
  );
};

export default Fields;
