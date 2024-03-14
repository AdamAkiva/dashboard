/******************************************************************************/

import styled from 'styled-components';

import Title from './Title';
import Switch from './Switch';
import Button from './Button';
import Fields from './Fields';

/******************************************************************************/

const SignUpSectionStyle = styled.div`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  justify-content: center;
`;

/******************************************************************************/

const SignUpSection = (params: { toggle: () => void }) => {
  const { toggle } = params;
  return (
    <SignUpSectionStyle>
      <div>
        <Title text={'USER SIGN UP'} />
        <Fields />
        <Button text={'SIGN UP'} />
        <Switch
          text={'Already signed up to Dashboard? click here to login'}
          toggle={toggle}
        />
      </div>
    </SignUpSectionStyle>
  );
};

export default SignUpSection;
