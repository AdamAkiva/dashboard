/******************************************************************************/

import styled from 'styled-components';

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

const GenericSection = (params: {
  titleText: string;
  buttonText: string;
  ToggleText: string;
  toggleCb: () => void;
}) => {
  const { titleText, buttonText, ToggleText, toggleCb } = params;
  return (
    <GenericSectionStyle>
      <div>
        <Title text={titleText} />
        <Fields />
        <Button text={buttonText} />
        <Toggle text={ToggleText} toggleCb={toggleCb} />
      </div>
    </GenericSectionStyle>
  );
};

export default GenericSection;
