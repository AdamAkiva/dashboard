/******************************************************************************/

import styled from 'styled-components';

import Title from './Title';
import Switch from './Switch';
import Button from './Button';
import Fields from './Fields';

/******************************************************************************/

const LoginSectionStyle = styled.div`
  background-color: white;
  color: rgba(55, 61, 122, 0.8);
  font-size: 2rem;
  display: flex;
  justify-content: center;
`;

/******************************************************************************/

const LoginSection = (params: { toggle: () => void }) => {
  const { toggle } = params;
  return (
    <LoginSectionStyle>
      <div>
        <Title text={'USER LOGIN'} />
        <Fields />
        <Button text={'LOGIN'} />
        <Switch
          text={'New to Dashboard? click here to sign up'}
          toggle={toggle}
        />
      </div>
    </LoginSectionStyle>
  );
};

export default LoginSection;
