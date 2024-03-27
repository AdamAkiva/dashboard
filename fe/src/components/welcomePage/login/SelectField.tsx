/******************************************************************************/

import { useState } from 'react';

import {
  InputAdornment,
  MenuItem,
  Select,
  styled,
  type SelectChangeEvent
} from '@mui/material';

import type { SerializedStyles } from '@emotion/react';

import type { DropdownField } from '@/types';

/******************************************************************************/

const StyledSelect = styled(Select<string>)<{ styles: SerializedStyles }>`
  ${(props) => {
    return props.styles;
  }}
`;

/******************************************************************************/

type SelectFieldProps = { field: DropdownField; style: SerializedStyles };

const SelectField = ({ field, style }: SelectFieldProps) => {
  const [selectedValue, setSelectedValue] = useState(field.name);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <StyledSelect
      styles={style}
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
