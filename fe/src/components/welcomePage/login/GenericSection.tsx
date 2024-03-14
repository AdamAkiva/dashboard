/******************************************************************************/

import styled from 'styled-components';

import Title from './Title';
import Switch from './Switch';
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
  switchText: string;
  toggleCb: () => void;
}) => {
  const { titleText, buttonText, switchText, toggleCb } = params;
  return (
    <GenericSectionStyle>
      <div>
        <Title text={titleText} />
        <Fields />
        <Button text={buttonText} />
        <Switch text={switchText} toggle={toggleCb} />
      </div>
    </GenericSectionStyle>
  );
};

export default GenericSection;
