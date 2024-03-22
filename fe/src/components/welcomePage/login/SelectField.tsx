/******************************************************************************/

import { useState } from 'react';

import {
  InputAdornment,
  MenuItem,
  Select,
  type SelectChangeEvent,
  styled
} from '@mui/material';

import type { DropdownField } from '@/types';

/******************************************************************************/

const StyledSelect = styled(Select)`
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

/******************************************************************************/

type SelectFieldProps = { field: DropdownField };

const SelectField = ({ field }: SelectFieldProps) => {
  const [selectedValue, setSelectedValue] = useState(field.name);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    setSelectedValue(event.target.value as string);
  };

  return (
    <StyledSelect
      value={selectedValue}
      name={field.name}
      onChange={handleChange}
      startAdornment={
        <InputAdornment position="start">{field.icon}</InputAdornment>
      }
    >
      <MenuItem value={field.name} disabled={true}>
        {field.name}
      </MenuItem>
      {field.options.map((option) => {
        return (
          <MenuItem value={option} key={option}>
            {option}
          </MenuItem>
        );
      })}
    </StyledSelect>
  );
};

export default SelectField;
